import {
  PublicMilestoneHandler,
  ActivityHandler,
  DefinitionHandler,
  Hashes,
} from '@the-traveler-times/bungie-api-gateway'
import {
  getModifiersOrderedByDifficulty,
  getCurrentNightfallRewardHashes,
  getGrandmasterAvailability,
} from './NightfallHandler'
import { isAuthorized } from '@the-traveler-times/utils'

export default {
  async fetch(request, env) {
    if (!isAuthorized(request, env)) {
      return new Response('Unauthorized', { status: 401 })
    }

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

      const isGrandmasterAvailable = getGrandmasterAvailability()

      let modifierGroups = getModifiersOrderedByDifficulty(activitiesAsArray[0])

      if (!isGrandmasterAvailable) {
        modifierGroups = modifierGroups.filter(
          (modifier) => modifier.name !== 'Grandmaster'
        )
      }

      const { nightfall, grandmaster } = getCurrentNightfallRewardHashes()
      const nightfallRewards = await definitionHandler.getInventoryItems(
        ...nightfall
      )
      const grandmasterRewards = await definitionHandler.getInventoryItems(
        ...grandmaster
      )

      return new Response(
        JSON.stringify({
          ...nightfallMilestone,
          activities,
          groupedActivities: activitiesAsArray,
          modifierGroups,
          rewards: nightfallRewards,
          grandmasterRewards,
          isGrandmasterAvailable,
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
