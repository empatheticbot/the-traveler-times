import { bungieGetAuthHandler } from './bungie-get-auth-handler'
import { bungieRedirectHandler } from './bungie-post-redirect-handler'

export default {
  async fetch(request, env) {
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
  },
}
