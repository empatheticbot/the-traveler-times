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
  console.log(durableObject)

  let response = await durableObject.fetch(
    'https://d2-meta-worker.empatheticbot.workers.dev/'
  )
  console.log(response)
  if (response.ok) {
    return response.json()
  }
  const contents = await response.json()
  throw new Error(contents.error)
}

async function updateMetaStats(request, env) {
  let durableObject = await getPGCRDurableObject(env)
  console.log(durableObject)
  let response = await durableObject.fetch(
    'https://d2-meta-worker.empatheticbot.workers.dev/'
  )
  console.log(response)
  if (response.ok) {
    return response
  }
}

export default {
  async fetch(request, env) {
    console.log(env)
    try {
      const meta = await getCurrentMeta(request, env)
      return new Response(JSON.stringify({ meta }))
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message, env }), {
        status: 500,
      })
    }
  },
  scheduled(event, env) {
    return updateMetaStats(env)
  },
}
