import { BungieAPIHandler } from '@the-traveler-times/bungie-api-gateway'
import { getWeaponDataFromPGCR } from './crucible'

export { D2PostGameCarnageReportObject } from './D2PostGameCarnageReportObject'

async function getPGCRDurableObject(env) {
  let id = env.PGCR_DURABLE_OBJECT.idFromName('PGCR_DURABLE_OBJECT')
  let stub = await env.PGCR_DURABLE_OBJECT.get(id)
  return stub
}

async function getCurrentMeta(request, env) {
  const dates = []
  for (let i = 0; i < 8; i++) {
    const currentDate = new Date()
    currentDate.setDate(currentDate.getDate() - i)
    const currentPeriodKey = currentDate.toISOString().split('T')[0]
    dates.push(currentPeriodKey)
  }
  console.log(dates[0])
  const weaponData = await Promise.all(
    dates.map(async (date) => {
      const data = await env.DESTINY_2_PGCR.get(date, 'json')
      return data
    })
  )
  return weaponData
}

async function updateMetaStats(request, env) {
  let durableObject = await getPGCRDurableObject(env)
  console.log(durableObject)

  let response = await durableObject.fetch(
    'https://d2-meta-worker.empatheticbot.workers.dev/'
  )
  console.log(response.ok)
  if (response.ok) {
    const { dates } = await response.json()

    for (const [date, weaponData] of Object.entries(dates)) {
      await env.DESTINY_2_PGCR.put(date, JSON.stringify(weaponData))
    }
    return 'Success'
  }
  const contents = await response.json()
  throw new Error(contents.error)
}

export default {
  async fetch(request, env) {
    let url = new URL(request.url)

    switch (url.pathname) {
      case '/meta': {
        try {
          const meta = await getCurrentMeta(request, env)
          return new Response(JSON.stringify({ meta }))
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message, env }), {
            status: 500,
          })
        }
      }
      default: {
        const meta = await updateMetaStats({}, env)
        return new Response(JSON.stringify(meta))
      }
    }
  },
  scheduled(event, env) {
    return updateMetaStats({}, env)
  },
}
