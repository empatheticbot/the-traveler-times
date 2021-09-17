import {
  PublicMilestoneHandler,
  TwitterHandler,
  SeasonHandler,
  VendorHandler,
  ActivityHandler,
  DefinitionHandler,
} from '@the-traveler-times/bungie-api-gateway'

async function getIsAvailable(env: unknown, weekendReset: string, weeklyReset: string) {
  const seasonHandler = new SeasonHandler()
  await seasonHandler.init(env.BUNGIE_API)
  const publicMilestoneHandler = new PublicMilestoneHandler()
  await publicMilestoneHandler.init(env.BUNGIE_API)

  const weekendDate = new Date(weekendReset)
  const weekDate = new Date(weeklyReset)

  const ironBannerMilestone =
    await publicMilestoneHandler.getIronBannerMilestone()
  const isIronBannerWeek = ironBannerMilestone.isAvailable
  const isFirstWeekOfSeason = await seasonHandler.isFirstWeekOfSeason()
  console.log('test: ', isFirstWeekOfSeason, isIronBannerWeek, weekDate.toString(), weekendDate.toString(), weekDate < weekendDate)
  return !isIronBannerWeek && !isFirstWeekOfSeason && weekDate < weekendDate
}

async function getResets(env: unknown) {
  const vendorHandler = new VendorHandler()
  await vendorHandler.init(env.BUNGIE_API)
  return vendorHandler.getWeeklyResets()
}

export default {
  async fetch(request, env) {
    const definitionHandler = new DefinitionHandler()
    await definitionHandler.init(env.BUNGIE_API)
    const activityHandler = new ActivityHandler()
    await activityHandler.init(env.BUNGIE_API)
    const twitterHandler = new TwitterHandler()
    await twitterHandler.init(env.TWITTER_API)

    try {
      // const trialsMilestone =
      //   await publicMilestoneHandler.getPublicMilestoneByHash(Hashes.TRIALS)
      const { weekendReset, weeklyReset } = await getResets(env)
      const isAvailable = await getIsAvailable(env, weekendReset, weeklyReset)

      let trialsMaps
      let trialsRewards
      if (isAvailable) {
        const startDate = new Date(weekendReset)
        startDate.setDate(startDate.getDate() - 7)

        const endDate = new Date(startDate)
        endDate.setHours(endDate.getHours() + 1)

        trialsRewards = await twitterHandler.getTrialsRewards(startDate)
        trialsRewards = await definitionHandler.getInventoryItems(
          ...trialsRewards.map((map) => map.hash)
        )

        trialsMaps = await twitterHandler.getTrialsMap(startDate, endDate)
        trialsMaps = await activityHandler.getActivities(trialsMaps)
      }

      return new Response(
        JSON.stringify({
          isAvailable,
          maps: trialsMaps,
          // milestone: trialsMilestone,
          rewards: trialsRewards,
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
