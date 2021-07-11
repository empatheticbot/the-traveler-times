import { BungieAPIHandler } from '@the-traveler-times/bungie-api-gateway'
import { getWeaponDataFromPGCR } from './crucible'

export { D2PostGameCarnageReportObject } from './D2PostGameCarnageReportObject'

async function getPGCRDurableObject(env) {
  let id = env.PGCR_DURABLE_OBJECT.idFromName('PGCR_DURABLE_OBJECT')
  let stub = await env.PGCR_DURABLE_OBJECT.get(id)
  return stub
}

async function getCurrentMeta(request, env) {
  let durableObject = await getPGCRDurableObject(env)

  let response = await durableObject.fetch(
    'https://d2-meta-worker.empatheticbot.workers.dev/meta'
  )
}

async function updateMetaStats(request, env) {
  let durableObject = await getPGCRDurableObject(env)

  let response = await durableObject.fetch(
    'https://d2-meta-worker.empatheticbot.workers.dev/'
  )
}

export default {
  fetch(request, env) {
    return getCurrentMeta(request, env)
  },
  scheduled(event, env) {
    return updateMetaStats(env)
  },
}
