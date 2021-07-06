import { BungieAPIHandler } from '@the-traveler-times/bungie-api-gateway'
import { handleCrucbileGameData } from './crucible'

async function getPostGameCarnageReport(request, env) {
  const bungieAPIHandler = new BungieAPIHandler()
  bungieAPIHandler.init(env.BUNGIE_API)
  let 
  try {
    const currentActivityId = await env.DESTINY_2_PGCR.get(
      'CURRENT_ACTIVITY_INDEX'
    )
    console.log(currentActivityId, env)
    const response = await bungieAPIHandler.getPostGameCarnageReport(
      currentActivityId
    )

    if (response.activityDetails.modes.includes(5) && !response.activityDetails.isPrivate) {
      handleCrucbileGameData(response, env)
    }
    console.log(response)
    return new Response(response)
  } catch (e) {
    if (request.method) {
      return new Response(e.message)
    }
  }
}

export default {
  async fetch(request, env) {
    return await getPostGameCarnageReport(request, env)
  },
  async scheduled(event, env) {
    return await getPostGameCarnageReport({}, env)
  },
}
