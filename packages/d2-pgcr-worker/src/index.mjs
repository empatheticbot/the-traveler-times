import { BungieAPIHandler } from '@the-traveler-times/bungie-api-gateway'
import { getWeaponDataFromPGCR } from './crucible'
import { isAuthorized } from '@the-traveler-times/utils'

async function handlePostGameCarnageReportParsing(request, env) {
  const url = new URL(request.url)
  const activitiesToFetch = url.searchParams.get('activitiesToFetch')
  const firstActivityId = url.searchParams.get('firstActivityId')
  let every = url.searchParams.get('every') || 1
  every = parseInt(every)

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

  let weaponData = []
  const bungieAPIHandler = new BungieAPIHandler()
  bungieAPIHandler.init(env.BUNGIE_API)
  const collectedWeaponData = {}
  let currentActivityId = parseInt(firstActivityId)
  let isCaughtUpToLatestMatch = false

  for (let i = 0; i < activitiesToFetch; i++) {
    try {
      const pgcrData = await bungieAPIHandler.getPostGameCarnageReport(
        currentActivityId
      )
      if (
        pgcrData &&
        pgcrData.activityDetails.modes.includes(5) &&
        !pgcrData.activityDetails.isPrivate &&
        pgcrData.entries
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
              period: pgcrData.period,
            }
          } else {
            collectedWeaponData[weapon.id] = {
              id: weapon.id,
              kills: weapon.kills,
              precisionKills: weapon.precisionKills,
              usage: 1,
              period: pgcrData.period,
            }
          }
        })
      }
      currentActivityId += every
    } catch (e) {
      if (e.status === 404) {
        isCaughtUpToLatestMatch = true
        break
      }
    }
  }

  for (const [key, value] of Object.entries(collectedWeaponData)) {
    weaponData.push({
      id: key,
      kills: value.kills,
      precisionKills: value.precisionKills,
      period: value.period,
    })
  }
  return new Response(
    JSON.stringify({
      weaponData,
      lastId: currentActivityId,
      isCaughtUpToLatestMatch,
    })
  )
}

export default {
  async fetch(request, env) {
    if (!isAuthorized(request, env)) {
      return new Response('Unauthorized', { status: 401 })
    }

    return handlePostGameCarnageReportParsing(request, env)
  },
}
