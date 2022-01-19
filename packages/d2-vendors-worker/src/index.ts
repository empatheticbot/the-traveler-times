import {
  VendorHandler,
  TwitterHandler,
} from '@the-traveler-times/bungie-api-gateway'
import { getAda } from './ada'
import { getBanshee } from './banshee'
import { getSpider } from './spider'
import { getXur } from './xur'
import { isAuthorized } from '@the-traveler-times/utils'

export default {
  async fetch(request: Request, env: CloudflareEnvironment) {
    if (!isAuthorized(request, env)) {
      return new Response('Unauthorized', { status: 401 })
    }

    try {
      const vendorHandler = new VendorHandler()
      await vendorHandler.init(env.BUNGIE_API)
      const twitterHandler = new TwitterHandler()
      await twitterHandler.init(env.TWITTER_API)

      const ada = await getAda(vendorHandler)
      const banshee = await getBanshee(vendorHandler)
      const spider = await getSpider(vendorHandler)
      const xur = await getXur(vendorHandler, twitterHandler)

      const isAvailable =
        xur.isAvailable ||
        banshee.isAvailable ||
        spider.isAvailable ||
        ada.isAvailable

      const lastRefreshDate = [
        xur.lastRefreshDate,
        banshee.lastRefreshDate,
        spider.lastRefreshDate,
        ada.lastRefreshDate,
      ].sort((a, b) => new Date(b).valueOf() - new Date(a).valueOf())[0]

      return new Response(
        JSON.stringify({
          ada,
          banshee,
          spider,
          xur,
          isAvailable,
          lastRefreshDate,
        }),
        {
          status: 200,
        }
      )
    } catch (e) {
      return new Response(
        JSON.stringify({ isAvailable: false, errorMessage: e.message }),
        {
          status: 500,
        }
      )
    }
  },
}
