import {
  PublicMilestoneHandler,
  ActivityHandler,
} from '@the-traveler-times/bungie-api-gateway'

export default {
  async fetch(request, env) {
    const publicMilestoneHandler = new PublicMilestoneHandler()
    await publicMilestoneHandler.init(env.BUNGIE_API)
    const activityHandler = new ActivityHandler()
    await activityHandler.init(env.BUNGIE_API)

    try {
      const nightfallMilestone = await publicMilestoneHandler.getPublicMilestoneByHash(
        '1942283261',
      )
      console.log(env.DESTINY_2_DEFINITIONS)
      const activities = await activityHandler.getActivitiesByHash(
        nightfallMilestone.activities.map(activity => activity.activityHash),
        env.DESTINY_2_DEFINITIONS,
      )

      return new Response(
        JSON.stringify({ ...nightfallMilestone, activities }),
        {
          status: 200,
        },
      )
    } catch (e) {
      return new Response(e, {
        status: 500,
      })
    }
  },
}
