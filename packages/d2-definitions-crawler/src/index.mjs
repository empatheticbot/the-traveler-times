import { BungieAPIHandler } from '@the-traveler-times/bungie-api-gateway'
import { chunkArray } from '@the-traveler-times/utils'

const blacklist = ['DestinyInventoryItemDefinition']

export default {
  async fetch(request, env) {
    const definitionWorkerUrl = await env.DESTINY_2_DEFINITIONS.get(
      'DEFINITION_WORKER_URL'
    )

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

    const manifest = await bungieAPIHandler.getManifest()
    const definitionsObject = { ...manifest.jsonWorldComponentContentPaths.en }

    const definitions = Object.entries(definitionsObject).reduce(
      (arr, pair) => {
        const [definition, url] = pair
        if (blacklist.includes(definition)) {
          return arr
        }
        arr.push({ definition, url })
        return arr
      },
      []
    )

    const chunkedDefinitions = chunkArray(definitions, 5)
    const definitionRequests = []

    for (const defs of chunkedDefinitions) {
      definitionRequests(
        fetch(definitionWorkerUrl, {
          method: 'POST',
          headers: {
            'content-type': 'application/json;charset=utf-8',
          },
          body: JSON.stringify({ definitions: defs }),
        })
      )
    }

    const allDefinitions = await Promise.all(definitionRequests)

    return new Response(JSON.stringify({ definitions: allDefinitions }), {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
        status: 200,
      },
    })
  },
}
