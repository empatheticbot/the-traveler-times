import {
  VendorHandler,
  TwitterHandler,
} from '@the-traveler-times/bungie-api-gateway'

export default {
  async fetch(request, env) {
    console.log(env)
    const vendorHandler = new VendorHandler()
    await vendorHandler.init(env.BUNGIE_API)
    console.log('intialized v')
    const twitterHandler = new TwitterHandler()
    await twitterHandler.init(env.TWITTER_API)
    console.log('intialized t')
    // const activityHandler = new ActivityHandler()
    // await activityHandler.init(env.BUNGIE_API, env.DESTINY_2_DEFINITIONS)
    // console.log('intialized a')
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
      const vendors = await vendorHandler.getVendors()
      const xur = await vendorHandler.getVendorByHash('2190858386')
      const date = new Date()
      date.setDate(date.getDate() - 1)
      const location = await twitterHandler.getXurLocation(date)

      return new Response(JSON.stringify({ xur, location, vendors }), {
        status: 200,
      })
    } catch (e) {
      return new Response(e.message, {
        status: 500,
      })
    }
  },
}
