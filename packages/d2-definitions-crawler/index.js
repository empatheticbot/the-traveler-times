import { BungieAPIHandler } from '@the-traveler-times/bungie-api-gateway'
import { chunkArray } from '../utils/src'

const blacklist = ['DestinyInventoryItemDefinition']

async function handleRequest(request) {
  const definitionWorkerUrl = await DESTINY_2_DEFINITIONS.get(
    'DEFINITION_WORKER_URL'
  )

  const apiKey = await BUNGIE_API.get('KEY')
  const oauthToken = await BUNGIE_API.get('OAUTH_TOKEN')
  const membershipId = await BUNGIE_API.get('MEMBERSHIP_ID')
  const membershipType = await BUNGIE_API.get('MEMBERSHIP_TYPE')
  const characterId = await BUNGIE_API.get('CHARACTER_ID')

  const bungieAPIHandler = new BungieAPIHandler({
    apiKey,
    oauthToken,
    membershipId,
    membershipType,
    characterId,
  })

  const manifest = await bungieAPIHandler.getManifest()
  const definitionsObject = { ...manifest.jsonWorldComponentContentPaths.en }

  const definitions = Object.entries(definitionsObject).reduce((arr, pair) => {
    const [definition, url] = pair
    if (blacklist.includes(definition)) {
      return arr
    }
    arr.push({ definition, url })
    return arr
  }, [])

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
}

addEventListener('fetch', event => {
  return event.respondWith(handleRequest(event.request))
})
