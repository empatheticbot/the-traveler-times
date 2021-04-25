import {
  PublicMilestoneHandler,
  VendorHandler,
  TwitterHandler,
} from '@the-traveler-times/bungie-api-gateway'

export default {
  async fetch(request, env) {
    try {
      const vendorHandler = new VendorHandler()
      await vendorHandler.init(env.BUNGIE_API, env.DESTINY_2_DEFINITIONS)
      const twitterHandler = new TwitterHandler()
      await twitterHandler.init(env.TWITTER_API)
      const xur = await vendorHandler.getStrippedDownVendorByHash('2190858386')

      const date = new Date()
      date.setDate(date.getDate() - 1)
      const location = await twitterHandler.getXurLocation(date)

      return new Response(JSON.stringify({ xur, location }), {
        status: 200,
      })
    } catch (e) {
      return new Response(e.message, {
        status: 500,
      })
    }
  },
}
