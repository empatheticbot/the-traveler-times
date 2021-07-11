import { BungieAPIHandler } from '@the-traveler-times/bungie-api-gateway'
import { getWeaponDataFromPGCR } from './crucible'

async function handlePostGameCarnageReportParsing(request, env) {
  const url = new URL(request.url)
  const activitiesToFetch = url.searchParams.get('activitiesToFetch')
  const firstActivityId = url.searchParams.get('firstActivityId')

  if (!firstActivityId) {
    return new Response(
      'Missing parameter `firstActivityId`, which is required.',
      { status: 400 }
    )
  }

  if (!activitiesToFetch) {
    return new Response(
      'Missing parameter `activitiesToFetch`, which is required.',
      { status: 400 }
    )
  }

  let activityData = []
  const bungieAPIHandler = new BungieAPIHandler()
  bungieAPIHandler.init(env.BUNGIE_API)
  const collectedWeaponData = {}
  let currentActivityId = firstActivityId

  for (let i = 0; i < activitiesToFetch; i++) {
    try {
      const pgcrData = await bungieAPIHandler.getPostGameCarnageReport(
        currentActivityId
      )
      if (
        pgcrData &&
        pgcrData.activityDetails.modes.includes(5) &&
        !pgcrData.activityDetails.isPrivate
      ) {
        const weaponData = getWeaponDataFromPGCR(pgcrData, env)
        weaponData.forEach((weapon) => {
          let data = collectedWeaponData[weapon.id]
          if (data) {
            collectedWeaponData[weapon.id] = {
              id: weapon.id,
              kills: data.kills + weapon.kills,
              precisionKills: data.precisionKills + weapon.precisionKills,
              usage: data.usage + 1,
            }
          } else {
            collectedWeaponData[weapon.id] = {
              id: weapon.id,
              kills: weapon.kills,
              precisionKills: weapon.precisionKills,
              usage: 1,
            }
          }
        })
      }
    } catch (e) {
      console.error(e.message)
    }
    currentActivityId++
  }

  for (const [key, value] of Object.entries(collectedWeaponData)) {
    const storedWeaponData = await env.DESTINY_2_PGCR.get(key, { type: 'json' })
    if (storedWeaponData) {
      await env.DESTINY_2_PGCR.put(
        key,
        JSON.stringify({
          id: key,
          kills: storedWeaponData.kills + value.kills,
          precisionKills:
            storedWeaponData.precisionKills + value.precisionKills,
          usage: storedWeaponData.usage + 1,
        })
      )
    } else {
      await env.DESTINY_2_PGCR.put(
        key,
        JSON.stringify({
          id: key,
          kills: value.kills,
          precisionKills: value.precisionKills,
          usage: 1,
        })
      )
    }
    activityData.push({
      id: key,
      kills: value.kills,
      precisionKills: value.precisionKills,
    })
  }
  await env.DESTINY_2_PGCR.put('CURRENT_ACTIVITY_INDEX', currentActivityId)
  return new Response(
    JSON.stringify({
      activities: activityData,
    })
  )
}

export default {
  async fetch(request, env) {
    // const weapons = await getWeapons(env)
    // return new Response(
    //   JSON.stringify({
    //     kills: await getTopWeaponsBasedOnKills(weapons),
    //     usage: await getTopWeaponsBasedOnUse(weapons),
    //   })
    // )
    return handlePostGameCarnageReportParsing(request, env)
  },
  async scheduled(event, env) {
    return handlePostGameCarnageReportParsing({}, env)
  },
}
