import { BungieAPIHandler } from 'bungie-api-gateway'

export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url)
    const definitionUrl = searchParams.get('definitionUrl')

    if (!definitionUrl) {
      return new Response('`definition` query parameter is required.', {
        status: 500,
      })
    }

    const apiKey = await env.BUNGIE_API.get('KEY')
    const oauthToken = await env.BUNGIE_API.get('OAUTH')

    const bungieAPIHandler = new BungieAPIHandler(apiKey, oauthToken)
    try {
      return bungieAPIHandler.callBungieNet({ path: definitionUrl })
    } catch (e) {
      return new Response(
        `The Bungie API request for 'definitionUrl' of '${definition}' failed. ${e}`,
        {
          status: 500,
        },
      )
    }
  },
}
