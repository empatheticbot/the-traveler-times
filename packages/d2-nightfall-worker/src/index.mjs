import {
  PublicMilestoneHandler,
  ActivityHandler,
  DefinitionHandler,
  Hashes,
} from '@the-traveler-times/bungie-api-gateway'
import {
  getModifiersOrderedByDifficulty,
  getCurrentNightfallRewardHashes,
} from './NightfallHandler'

export default {
  async fetch(request, env) {
    const publicMilestoneHandler = new PublicMilestoneHandler()
    await publicMilestoneHandler.init(env.BUNGIE_API)
    const activityHandler = new ActivityHandler()
    await activityHandler.init(env.BUNGIE_API)
    const definitionHandler = new DefinitionHandler()
    await definitionHandler.init(env.BUNGIE_API)

    try {
      const nightfallMilestone =
        await publicMilestoneHandler.getPublicMilestoneByHash(Hashes.NIGHTFALL)

      const activities = await activityHandler.getActivities(
        nightfallMilestone.activities
      )

      const modifierGroups = getModifiersOrderedByDifficulty(activities)

      const rewardHashes = getCurrentNightfallRewardHashes()
      const rewards = await definitionHandler.getInventoryItems(...rewardHashes)

      return new Response(
        JSON.stringify({
          ...nightfallMilestone,
          activities,
          modifierGroups,
          rewards,
          isAvailable: true,
        }),
        {
          status: 200,
        }
      )
    } catch (e) {
      return new Response(
        JSON.stringify({ message: e.message, isAvailable: false }),
        {
          status: 500,
        }
      )
    }
  },
}
