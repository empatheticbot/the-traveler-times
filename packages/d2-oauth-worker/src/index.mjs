import { bungieGetAuthHandler } from './bungie-get-auth-handler'
import { bungieRedirectHandler } from './bungie-post-redirect-handler'
import { isAuthorized } from '@the-traveler-times/utils'

async function handleBungieOAuthInitialSetup(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    return bungieRedirectHandler(request, env)
  }

  return bungieGetAuthHandler(request, env)
}

export default {
  async fetch(request, env) {
    if (!isAuthorized(request, env)) {
      return new Response('Unauthorized', { status: 401 })
    }
    return await handleBungieOAuthInitialSetup(request, env)
  },
  async scheduled(event, env) {
    const client_id = await env.BUNGIE_API.get('CLIENT_ID')
    const client_secret = await env.BUNGIE_API.get('CLIENT_SECRET')
    const refresh_token = await env.BUNGIE_API.get('REFRESH_TOKEN')

    let body = `grant_type=refresh_token&client_id=${client_id}&client_secret=${client_secret}&refresh_token=${refresh_token}`

    const response = await fetch(
      'https://www.bungie.net/platform/app/oauth/token/',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: body,
      }
    )

    let data = await response.json()

    let access_token = data.access_token
    let new_refresh_token = data.refresh_token

    if (access_token) {
      await env.BUNGIE_API.put('OAUTH_TOKEN', access_token)
    }
    if (new_refresh_token) {
      await env.BUNGIE_API.put('REFRESH_TOKEN', new_refresh_token)
    }

    return new Response('Tokens updated!', { status: 200 })
  },
}
