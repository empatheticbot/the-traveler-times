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

      const modifierGroups = getModifiersOrderedByDifficulty(
        activitiesAsArray[0]
      )

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
