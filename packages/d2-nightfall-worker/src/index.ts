import { isAuthorized } from '@the-traveler-times/utils'
import {
  PublicMilestoneHandler,
  ActivityHandler,
  DefinitionHandler,
  SeasonHandler,
  Hashes,
  dateUtilities,
} from '@the-traveler-times/bungie-api-gateway'
import {
  getModifiersOrderedByDifficulty,
  getCurrentNightfallRewardHashes,
  getGrandmasterAvailability,
  getIsGrandmasterStartWeek,
  getStrikeReward,
} from './NightfallHandler'

export default {
  async fetch(request: Request, env: CloudflareEnvironment) {
    if (!isAuthorized(request, env)) {
      return new Response('Unauthorized', { status: 401 })
    }

    const publicMilestoneHandler = new PublicMilestoneHandler()
    await publicMilestoneHandler.init(env.BUNGIE_API)
    const activityHandler = new ActivityHandler()
    await activityHandler.init(env.BUNGIE_API)
    const definitionHandler = new DefinitionHandler()
    await definitionHandler.init(env.BUNGIE_API)
    const seasonHandler = new SeasonHandler()
    await seasonHandler.init(env.BUNGIE_API)
    const currentSeasonId = seasonHandler.getCurrentSeasonId()
    const seasonOverrides: SeasonOverrides =
      (await env.DESTINY_2_MANUAL_DATA.get(currentSeasonId, 'json')) || {}

    try {
      const nightfallMilestone =
        await publicMilestoneHandler.getPublicMilestoneByHash(Hashes.NIGHTFALL)

      const activities = await activityHandler.getActivities(
        nightfallMilestone.activities
      )

      const reducedActivitiesByDescription = activities.reduce(
        (acc, activity) => {
          const currentList = acc[activity.displayProperties.description] || []
          currentList.push(activity)
          return {
            ...acc,
            [activity.displayProperties.description]: currentList,
          }
        },
        {}
      )

      const activitiesAsArray = Object.values(
        reducedActivitiesByDescription
      ).sort((a, b) => b.length - a.length)

      const isGrandmasterAvailable = getGrandmasterAvailability(seasonOverrides)
      const isGrandmasterStartWeek = getIsGrandmasterStartWeek(seasonOverrides)

      let modifierGroups = getModifiersOrderedByDifficulty(activitiesAsArray[0])

      if (!isGrandmasterAvailable) {
        modifierGroups = modifierGroups.filter(
          (modifier) => modifier.name !== 'Grandmaster'
        )
      }

      const { nightfall, grandmaster, isUnknown } =
        getCurrentNightfallRewardHashes()
      const strikeReward = getStrikeReward(
        activities[0].displayProperties.description
      )
      const nightfallRewards = await definitionHandler.getInventoryItems(
        ...nightfall,
        ...strikeReward
      )
      const grandmasterRewards = await definitionHandler.getInventoryItems(
        ...grandmaster,
        ...strikeReward
      )

      return new Response(
        JSON.stringify({
          ...nightfallMilestone,
          activities,
          groupedActivities: activitiesAsArray,
          modifierGroups,
          rewards: nightfallRewards,
          isRewardKnown: !isUnknown,
          grandmasterRewards,
          isGrandmasterAvailable,
          isGrandmasterStartWeek,
          isAvailable: true,
          startDate: dateUtilities.getLastWeeklyReset(),
          refreshDate: dateUtilities.getNextWeeklyReset(),
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
