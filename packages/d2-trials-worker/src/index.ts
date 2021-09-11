import {
  PublicMilestoneHandler,
  TwitterHandler,
  SeasonHandler,
  VendorHandler,
  ActivityHandler,
  Hashes,
} from '@the-traveler-times/bungie-api-gateway'

export default {
  async fetch(request, env) {
    const publicMilestoneHandler = new PublicMilestoneHandler()
    await publicMilestoneHandler.init(env.BUNGIE_API)
    const activityHandler = new ActivityHandler()
    await activityHandler.init(env.BUNGIE_API)
    const vendorHandler = new VendorHandler()
    await vendorHandler.init(env.BUNGIE_API)
    const twitterHandler = new TwitterHandler()
    await twitterHandler.init(env.TWITTER_API)
    const seasonHandler = new SeasonHandler()
    await seasonHandler.init(env.BUNGIE_API)

    try {
      const { weekendReset, weeklyReset } =
        await vendorHandler.getWeeklyResets()
      const trialsMilestone =
        await publicMilestoneHandler.getPublicMilestoneByHash(Hashes.TRIALS)
      const ironBannerMilestone =
        await publicMilestoneHandler.getIronBannerMilestone()
      const isIronBannerWeek = ironBannerMilestone.isAvailable
      const isFirstWeekOfSeason = await seasonHandler.isFirstWeekOfSeason()

      const isAvailable = !isIronBannerWeek && !isFirstWeekOfSeason
      let trialsMaps
      if (isAvailable) {
        const startDate = new Date(weekendReset)
        startDate.setDate(startDate.getDate() - 7)

        const endDate = new Date(startDate)
        endDate.setHours(endDate.getHours() + 1)

        trialsMaps = await twitterHandler.getTrialsMap(startDate, endDate)
        trialsMaps = await activityHandler.getActivities(trialsMaps)
      }

      return new Response(
        JSON.stringify({
          isAvailable,
          maps: trialsMaps,
          milestone: trialsMilestone,
        }),
        {
          status: 200,
        }
      )
    } catch (e) {
      return new Response(e.message, {
        status: 500,
      })
    }
  },
}
