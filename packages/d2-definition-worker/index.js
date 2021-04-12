import { BungieAPIHandler } from '@the-traveler-times/bungie-api-gateway'

export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url)
    const definitionUrl = searchParams.get('definitionUrl')

    if (!definitionUrl) {
      return new Response('`definitionUrl` query parameter is required.', {
        status: 500,
      })
    }

    const apiKey = await env.BUNGIE_API.get('KEY')
    const oauthToken = await env.BUNGIE_API.get('OAUTH_TOKEN')
    const membershipId = await env.BUNGIE_API.get('MEMBERSHIP_ID')
    const membershipType = await env.BUNGIE_API.get('MEMBERSHIP_TYPE')
    const characterId = await env.BUNGIE_API.get('CHARACTER_ID')

    const bungieAPIHandler = new BungieAPIHandler({
      apiKey,
      oauthToken,
      membershipId,
      membershipType,
      characterId,
    })
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
