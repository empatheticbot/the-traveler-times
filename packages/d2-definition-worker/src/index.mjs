import { BungieAPIHandler } from '@the-traveler-times/bungie-api-gateway'

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({
          ok: false,
          error:
            "This isn't implemented. I know GET is supposed to always be implemented, but it isn't. The world is an imperfect place.",
        }),
        {
          status: 501,
          'content-type': 'application/json;charset=UTF-8',
        },
      )
    }
    const { definitions } = await request.json()

    if (!definitions || definitions.length === 0) {
      return new Response(
        JSON.stringify({ error: '`definition` property is required.' }),
        {
          headers: {
            'content-type': 'application/json;charset=UTF-8',
            status: 400,
          },
        },
      )
    } else if (definitions.length > 48) {
      return new Response(
        JSON.stringify({
          error:
            '`defintion` property array has a length longer than 48, Cloudflare workers cannot process more than 50 requests and we need to make two additional requests internally.',
        }),
        {
          headers: {
            'content-type': 'application/json;charset=UTF-8',
            status: 400,
          },
        },
      )
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

    const definitionRequests = []
    for (const definition of definitions) {
      definitionRequests.push(
        bungieAPIHandler.callBungieNet({ path: definition.url }),
      )
    }

    try {
      const settledDefinitions = await Promise.all(definitionRequests)
      settledDefinitions.forEach((definition, index) => {
        const defData = definitions[index]
        env.DESTINY_2_DEFINITIONS.put(
          defData.definition,
          JSON.stringify(definition),
        )
      })
      return new Response(JSON.stringify({ ok: true }), {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
          status: 200,
        },
      })
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: `The Bungie API request for 'definitionUrl' failed. ${e}`,
        }),
        {
          headers: {
            'content-type': 'application/json;charset=UTF-8',
            status: 500,
          },
        },
      )
    }
  },
}
