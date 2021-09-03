import { PublicMilestoneHandler, TwitterHandler, SeasonHandler, Hashes } from '@the-traveler-times/bungie-api-gateway'

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
      const trialsMilestone = await publicMilestoneHandler.getPublicMilestoneByHash(Hashes.TRIALS)
      const ironBannerMilestone = await publicMilestoneHandler.getPublicMilestoneByHash(Hashes.IRON_BANNER)
      const isIronBannerWeek = !!ironBannerMilestone
      const isFirstWeekOfSeason = await seasonHandler.isFirstWeekOfSeason()

      const isAvailable = !isIronBannerWeek && !isFirstWeekOfSeason
      let trialsMaps
      if (isAvailable) {
        const startDate = new Date(trialsMilestone.startDate)
        trialsMaps = await twitterHandler.getTrialsMap(startDate)
      }
      return new Response(JSON.stringify({ isFirstWeekOfSeason, isIronBannerWeek, isAvailable, trialsMaps, trialsMilestone }), {
        status: 200,
      })
    } catch (e) {
      return new Response(e.message, {
        status: 500,
      })
    }
  },
}
