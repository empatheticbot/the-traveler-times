import { BungieAPIHandler } from '@the-traveler-times/bungie-api-gateway'
import { getWeaponDataFromPGCR } from './crucible'

async function getPostGameCarnageReport(request, env) {
  const bungieAPIHandler = new BungieAPIHandler()
  bungieAPIHandler.init(env.BUNGIE_API)
  const collectedWeaponData = {}
  let currentActivityId = await env.DESTINY_2_PGCR.get('CURRENT_ACTIVITY_INDEX')

  for (let i = 0; i < 50; i++) {
    try {
      console.log(currentActivityId, env)
      const response = await bungieAPIHandler.getPostGameCarnageReport(
        currentActivityId
      )
      console.log('here', response)
      if (
        response.activityDetails.modes.includes(5) &&
        !response.activityDetails.isPrivate
      ) {
        const weaponData = getWeaponDataFromPGCR(response, env)
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
      console.log(response)
    } catch (e) {
      console.error(e.message)
    }
    currentActivityId++
  }
  for (const [key, value] of Object.entries(collectedWeaponData)) {
    const storedWeaponData = await env.DESTINY_2_PGCR.get(key, { type: 'json' })
    if (storedWeaponData) {
      await env.DESTINY_2_PGCR.put(key, {
        id: key,
        kills: storedWeaponData.kills + value.kills,
        precisionKills: storedWeaponData.precisionKills + value.precisionKills,
        usage: storedWeaponData.usage + 1,
      })
    } else {
      await env.DESTINY_2_PGCR.put(key, {
        id: key,
        kills: value.kills,
        precisionKills: value.precisionKills,
        usage: 1,
      })
    }
  }
  await env.DESTINY_2_PGCR.put('CURRENT_ACTIVITY_INDEX', currentActivityId)
  return new Response(`Parsed to activity: ${currentActivityId}`)
}

export default {
  async fetch(request, env) {
    return await getPostGameCarnageReport(request, env)
  },
  async scheduled(event, env) {
    return await getPostGameCarnageReport({}, env)
  },
}
