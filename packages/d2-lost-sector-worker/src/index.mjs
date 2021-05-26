import { DefinitionHandler } from '@the-traveler-times/bungie-api-gateway'
import { getCurrentLostSectorHashes } from './LostSectorHandler'

const modifierIgnoreList = [
  '2687456355', // Champions: Cabal
  '1930311099', // Champions: Vex
  '3495411183', // Champions: Taken
  '2834348323', // Champions: Mob
  '2055950944', // Champions: Fallen
  '3605663348', // Champions: Hive
  '2078602635', // Champions: All
  '939324719', // Equipment Locked
  '3859784314', // Match Game
  '2821775453', // Master Modifiers
  '2301442403', // Legend Modifiers
  '376634891', // Limited Revives
]

async function getLostSectorData(lostSector, definitionHandler) {
  const activity = await definitionHandler.getActivity(lostSector.hash)
  const modifiers = await definitionHandler.getActivityModifiers(
    ...activity.modifiers
      .map(modifier => modifier.activityModifierHash)
      .filter(hash => !modifierIgnoreList.includes(hash)),
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
