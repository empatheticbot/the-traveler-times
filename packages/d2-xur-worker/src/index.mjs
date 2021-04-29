import {
  PublicMilestoneHandler,
  VendorHandler,
  TwitterHandler,
  Hashes,
} from '@the-traveler-times/bungie-api-gateway'

export default {
  async fetch(request, env) {
    try {
      const vendorHandler = new VendorHandler()
      await vendorHandler.init(env.BUNGIE_API, env.DESTINY_2_DEFINITIONS)
      const twitterHandler = new TwitterHandler()
      await twitterHandler.init(env.TWITTER_API)
      const xur = await vendorHandler.getStrippedDownVendorByHash(Hashes.XUR)

      const searchDate = new Date(xur.lastRefreshDate)
      const location = await twitterHandler.getXurLocation(searchDate)

      return new Response(JSON.stringify({ ...xur, location }), {
        status: 200,
      })
    } catch (e) {
      return new Response(e.message, {
        status: 500,
      })
    }
  },
}
