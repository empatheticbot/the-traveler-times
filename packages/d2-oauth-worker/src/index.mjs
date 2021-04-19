import { bungieGetAuthHandler } from './bungie-get-auth-handler'
import { bungieRedirectHandler } from './bungie-post-redirect-handler'

export default {
  async fetch(request, env) {
    console.log(
      request.method,
      await env.BUNGIE_API.get('CLIENT_ID', { type: 'text' }),
    )
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    if (request.method === 'GET') {
      return bungieGetAuthHandler(request, env)
    }

    if (request.method === 'POST') {
      return bungieRedirectHandler(request, env)
    }

    return new Response('Hello worker!', {
      headers: { 'content-type': 'text/plain' },
    })
  },
}
