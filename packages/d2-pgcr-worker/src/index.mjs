import { BungieAPIHandler } from '@the-traveler-times/bungie-api-gateway'
import { getWeaponDataFromPGCR } from './crucible'

async function handlePostGameCarnageReportParsing(request, env) {
  const bungieAPIHandler = new BungieAPIHandler()
  bungieAPIHandler.init(env.BUNGIE_API)
  const collectedWeaponData = {}
  let currentActivityId = await env.DESTINY_2_PGCR.get('CURRENT_ACTIVITY_INDEX')

  for (let i = 0; i < 50; i++) {
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
  }
  await env.DESTINY_2_PGCR.put('CURRENT_ACTIVITY_INDEX', currentActivityId)
  return new Response(`Parsed to activity: ${currentActivityId}`)
}

export default {
  async fetch(request, env) {
    return await handlePostGameCarnageReportParsing(request, env)
  },
  async scheduled(event, env) {
    return await handlePostGameCarnageReportParsing({}, env)
  },
}
