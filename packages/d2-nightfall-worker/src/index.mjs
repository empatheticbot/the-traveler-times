import {
  PublicMilestoneHandler,
  ActivityHandler,
  Hashes,
} from '@the-traveler-times/bungie-api-gateway'
import { getModifiersOrderedByDifficulty } from './NightfallTransformer'

export default {
  async fetch(request, env) {
    const publicMilestoneHandler = new PublicMilestoneHandler()
    await publicMilestoneHandler.init(env.BUNGIE_API)
    const activityHandler = new ActivityHandler()
    await activityHandler.init(env.BUNGIE_API, env.DESTINY_2_DEFINITIONS)

    try {
      const nightfallMilestone = await publicMilestoneHandler.getPublicMilestoneByHash(
        Hashes.NIGHTFALL,
      )

      const activities = await activityHandler.getActivities(
        nightfallMilestone.activities,
      )

      const modifierGroups = getModifiersOrderedByDifficulty(activities)

      return new Response(
        JSON.stringify({ ...nightfallMilestone, activities, modifierGroups }),
        {
          status: 200,
        },
      )
    } catch (e) {
      return new Response(e.message, {
        status: 500,
      })
    }
  },
}
