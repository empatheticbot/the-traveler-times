import {
  DefinitionHandler,
  getStrippedItem,
} from '@the-traveler-times/bungie-api-gateway'

export { D2PostGameCarnageReportObject } from './D2PostGameCarnageReportObject'

async function getPGCRDurableObject(env: CloudflareEnvironment) {
  let id = env.PGCR_DURABLE_OBJECT.idFromName('PGCR_DURABLE_OBJECT')
  let stub = await env.PGCR_DURABLE_OBJECT.get(id)
  return stub
}

async function getLastWeekOfMetaEndingAt(
  date = new Date(),
  definitionHandler,
  env: CloudflareEnvironment
) {
  const dates = []
  for (let i = 0; i < 7; i++) {
    const workingDate = date
    date.setDate(workingDate.getDate() - i)
    const currentPeriodKey = workingDate.toISOString().split('T')[0]
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
          ...current,
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
  const allWeaponsWithDetails = await Promise.all(
    allWeapons.map(async (weapon) => {
      const details = await definitionHandler.getInventoryItem(weapon.id)
      const damageType = await definitionHandler.getDamageType(
        details.defaultDamageTypeHash
      )
      details.damageType = damageType

      return {
        ...weapon,
        ...getStrippedItem(details),
      }
    })
  )
  return {
    weapons: allWeaponsWithDetails,
    totalUsage,
    totalKills,
    totalPrecisionKills,
  }
}

async function getCurrentMeta(request: Request, env: CloudflareEnvironment) {
  const definitionHandler = new DefinitionHandler()
  await definitionHandler.init(env.BUNGIE_API)
  const currentMeta = await getLastWeekOfMetaEndingAt(
    new Date(),
    definitionHandler,
    env
  )
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const lastWeekMeta = await getLastWeekOfMetaEndingAt(
    weekAgo,
    definitionHandler,
    env
  )

  return {
    ...currentMeta,
    lastWeekMeta,
  }
}

async function updateMetaStats(env: CloudflareEnvironment) {
  let durableObject = await getPGCRDurableObject(env)

  let response = await durableObject.fetch(
    'https://d2-meta-worker.empatheticbot.workers.dev/'
  )

  if (response.ok) {
    const { dates, activityResults, firstActivityId, lastActivityId } =
      await response.json()
    for (const [date, weaponData] of Object.entries(dates)) {
      console.log(weaponData)
      await env.DESTINY_2_CRUCIBLE_META.put(date, JSON.stringify(weaponData))
    }
    return {
      firstActivityId,
      lastActivityId,
      dates,
      activityResults,
    }
  }
  const contents = await response.json()
  throw new Error(contents.error)
}

export default {
  async fetch(request: Request, env: CloudflareEnvironment) {
    let url = new URL(request.url)

    switch (url.pathname) {
      case '/meta': {
        try {
          const meta = await getCurrentMeta(request, env)
          return new Response(JSON.stringify({ ...meta, isAvailable: true }))
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message, env }), {
            status: 500,
          })
        }
      }
      default: {
        const meta = await updateMetaStats(env)
        return new Response(JSON.stringify(meta))
      }
    }
  },
  scheduled(event: ScheduledEvent, env: CloudflareEnvironment) {
    return updateMetaStats(env)
  },
}
