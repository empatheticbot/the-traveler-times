import { isAuthorized } from '@the-traveler-times/utils'
import {
  ActivityHandler,
  DefinitionHandler,
  dateUtilities,
} from '@the-traveler-times/bungie-api-gateway'

import { getCurrentLostSectorHashes } from './LostSectorHandler'

async function getLostSectorData(
  lostSector,
  activityHandler: ActivityHandler,
  definitionHandler: DefinitionHandler,
  overrides: { pgcrImage?: string } = {}
) {
  const activity = await activityHandler.getActivityByHash(lostSector.hash)
  let rewards = []
  if (lostSector.rewards) {
    rewards = await Promise.all(
      lostSector.rewards.map((reward) =>
        definitionHandler.getInventoryItem(reward.hash)
      )
    )
  }
  return {
    ...lostSector,
    ...activity,
    ...overrides,
    rewards,
  }
}

export default {
  async fetch(request: Request, env: CloudflareEnvironment) {
    if (!isAuthorized(request, env)) {
      return new Response('Unauthorized', { status: 401 })
    }

    try {
      const lostSectors = getCurrentLostSectorHashes()

      const activityHandler = new ActivityHandler()
      await activityHandler.init(env.BUNGIE_API)

      const definitionHandler = new DefinitionHandler()
      await definitionHandler.init(env.BUNGIE_API)

      const legend = await getLostSectorData(
        lostSectors.legend,
        activityHandler,
        definitionHandler,
        lostSectors.overrides
      )
      const master = await getLostSectorData(
        lostSectors.master,
        activityHandler,
        definitionHandler,
        lostSectors.overrides
      )

      return new Response(
        JSON.stringify({
          isAvailable: true,
          master,
          legend,
          startDate: dateUtilities.getCurrentDailyResetStartDate(),
          refreshDate: dateUtilities.getCurrentDailyResetEndDate(),
        }),
        {
          status: 200,
        }
      )
    } catch (e) {
      return new Response(
        JSON.stringify({ isAvailable: false, error: e.message }),
        {
          status: 500,
        }
      )
    }
  },
}
