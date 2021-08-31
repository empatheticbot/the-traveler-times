import { PublicMilestoneHandler, TwitterHandler, SeasonHandler } from '@the-traveler-times/bungie-api-gateway'

export default {
  async fetch(request, env) {
    const publicMilestoneHandler = new PublicMilestoneHandler()
    await publicMilestoneHandler.init(env.BUNGIE_API)
    const twitterHandler = new TwitterHandler()
    await twitterHandler.init(env.TWITTER_API)
    const seasonHandler = new SeasonHandler()
    await seasonHandler.init(env.BUNGIE_API)
    // const activityHandler = new ActivityHandler()
    // await activityHandler.init(env.BUNGIE_API)

    try {
      //       const nightfallMilestone = await publicMilestoneHandler.getPublicMilestoneByHash(
      //         '1942283261',
      //       )
      //
      //       const activities = await activityHandler.getActivities(
      //         nightfallMilestone.activities,
      //       )
      //
      //       const modifierGroups = getModifiersOrderedByDifficulty(activities)

      const milestones = await publicMilestoneHandler.getPublicMilestones()
      const isFirstWeekOfSeason = seasonHandler.isFirstWeekOfSeason()
      
      return new Response(JSON.stringify({ milestones }), {
        status: 200,
      })
    } catch (e) {
      return new Response(e.message, {
        status: 500,
      })
    }
  },
}
