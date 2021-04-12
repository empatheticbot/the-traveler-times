import { BungieAPIHandler } from '@the-traveler-times/bungie-api-gateway'

export default {
  async scheduled(event, env) {
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
    const definitions = manifest.jsonWorldComponentContentPaths.en
    const definitionRequests = []
    for (const definition in definitions) {
      const url = new URL(definitionWorkerUrl)
      url.searchParams.set('definitionUrl', definitions[definition])
      definitionRequests.push(fetch(url))
    }
  },
}
