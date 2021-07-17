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
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date()
    currentDate.setDate(currentDate.getDate() - i)
    const currentPeriodKey = currentDate.toISOString().split('T')[0]
    dates.push(currentPeriodKey)
  }
  const weaponData = await Promise.all(
    dates.map(async (date) => {
      const data = await env.DESTINY_2_CRUCIBLE_META.get(date, 'json')
      return data
    })
  )
  let completeUsage = {}
  let totalKills = 0
  let totalPrecisionKills = 0
  let totalUsage = 0
  weaponData.forEach((data) => {
    if (!data) {
      return
    }
    Object.values(data).forEach((weapon) => {
      totalKills += weapon.kills
      totalPrecisionKills += weapon.precisionKills
      totalUsage += weapon.usage
      const current = completeUsage[weapon.id]
      if (current) {
        completeUsage[weapon.id] = {
          id: current.id,
          period: current.period,
          kills: weapon.kills + current.kills,
          precisionKills: weapon.precisionKills + current.precisionKills,
          usage: weapon.usage + current.usage,
        }
      } else {
        completeUsage[weapon.id] = weapon
      }
    })
  })
  const allWeapons = Object.values(completeUsage)
  return {
    topKills: allWeapons.sort((a, b) => b.kills - a.kills).slice(0, 10),
    topUsage: allWeapons.sort((a, b) => b.usage - a.usage).slice(0, 10),
    allWeapons,
    topPrecisionKills: allWeapons
      .sort((a, b) => b.precisionKills - a.precisionKills)
      .slice(0, 10),
    totalUsage,
    totalKills,
    totalPrecisionKills,
  }
}

async function updateMetaStats(request, env) {
  let durableObject = await getPGCRDurableObject(env)

  let response = await durableObject.fetch(
    'https://d2-meta-worker.empatheticbot.workers.dev/'
  )

  if (response.ok) {
    const { dates } = await response.json()

    for (const [date, weaponData] of Object.entries(dates)) {
      await env.DESTINY_2_CRUCIBLE_META.put(date, JSON.stringify(weaponData))
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
