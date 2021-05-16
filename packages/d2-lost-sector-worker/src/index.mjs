import { DefinitionHandler } from '@the-traveler-times/bungie-api-gateway'
import { getCurrentLostSectorHashes } from './LostSectorHandler'

async function getLostSectorData(lostSector, definitionHandler) {
  const activity = await definitionHandler.getActivity(lostSector.hash)
  const modifiers = await definitionHandler.getActivityModifiers(
    ...activity.modifiers.map(modifier => modifier.activityModifierHash),
  )

  const destination = await definitionHandler.getDestination(
    activity.destinationHash,
  )

  let rewards = []
  if (lostSector.rewards) {
    rewards = await Promise.all(
      lostSector.rewards.map(reward =>
        definitionHandler.getInventoryItem(reward.hash),
      ),
    )
  }

  return { ...lostSector, ...activity, modifiers, rewards, destination }
}

export default {
  async fetch(request, env) {
    try {
      const lostSectors = getCurrentLostSectorHashes()

      const definitionHandler = new DefinitionHandler()
      await definitionHandler.init(env.BUNGIE_API, env.DESTINY_2_DEFINITIONS)

      const legend = await getLostSectorData(
        lostSectors.legend,
        definitionHandler,
      )
      const master = await getLostSectorData(
        lostSectors.master,
        definitionHandler,
      )

      return new Response(
        JSON.stringify({
          isAvailable: true,
          master,
          legend,
        }),
        {
          status: 200,
        },
      )
    } catch (e) {
      return new Response(
        JSON.stringify({ isAvailable: false, error: e.message }),
        {
          status: 500,
        },
      )
    }
  },
}
