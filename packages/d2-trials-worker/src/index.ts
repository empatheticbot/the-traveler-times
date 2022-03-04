import {
  PublicMilestoneHandler,
  TwitterHandler,
  SeasonHandler,
  ActivityHandler,
  DefinitionHandler,
  dateUtilities,
} from '@the-traveler-times/bungie-api-gateway'
import { isAuthorized } from '@the-traveler-times/utils'

async function getIsAvailable(
  env: CloudflareEnvironment,
  weekendReset: string,
  weeklyReset: string
) {
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
  return !isIronBannerWeek && !isFirstWeekOfSeason && weekDate < weekendDate
}

export default {
  async fetch(request: Request, env: CloudflareEnvironment) {
    if (!isAuthorized(request, env)) {
      return new Response('Unauthorized', { status: 401 })
    }

    const definitionHandler = new DefinitionHandler()
    await definitionHandler.init(env.BUNGIE_API)
    const activityHandler = new ActivityHandler()
    await activityHandler.init(env.BUNGIE_API)
    const twitterHandler = new TwitterHandler()
    await twitterHandler.init(env.TWITTER_API)

    try {
      const nextWeeklyReset = dateUtilities.getNextWeeklyReset()
      const nextWeekendReset = dateUtilities.getNextWeekendReset()
      const lastWeekendReset = dateUtilities.getLastWeekendReset()
      const isAvailable = await getIsAvailable(
        env,
        nextWeekendReset,
        nextWeeklyReset
      )

      let trialsMaps
      let trialsRewards

      if (isAvailable) {
        const currentDate = new Date()
        const twitterSearchStartDate = new Date(lastWeekendReset)

        let twitterSearchEndDate: Date | undefined = new Date(
          twitterSearchStartDate
        )
        twitterSearchEndDate.setHours(twitterSearchEndDate.getHours() + 2)

        twitterSearchEndDate =
          twitterSearchEndDate > currentDate
            ? currentDate
            : twitterSearchEndDate

        trialsRewards = await twitterHandler.getTrialsRewards(
          twitterSearchStartDate,
          twitterSearchEndDate
        )
        trialsRewards = await definitionHandler.getInventoryItems(
          ...trialsRewards.map((map) => map.hash)
        )

        trialsMaps = await twitterHandler.getTrialsMap(
          twitterSearchStartDate,
          twitterSearchEndDate
        )
        trialsMaps = await activityHandler.getActivities(trialsMaps)
        trialsMaps.sort((a, b) => b.results - a.results)
      }

      return new Response(
        JSON.stringify({
          isAvailable: false,
          maps: trialsMaps,
          startDate: lastWeekendReset,
          endDate: nextWeeklyReset,
          // milestone: trialsMilestone,
          rewards: trialsRewards,
        }),
        {
          status: 200,
        }
      )
    } catch (e) {
      if (e instanceof Error) {
        return new Response(e.message, {
          status: 500,
        })
      }
    }
  },
}
