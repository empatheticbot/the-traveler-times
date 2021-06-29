import {
  VendorHandler,
  TwitterHandler,
  Hashes,
} from '@the-traveler-times/bungie-api-gateway'
import { getAda } from './ada'
import { getBanshee } from './banshee'
import { getSpider } from './spider'
import { getXur } from './xur'

export default {
  async fetch(request, env) {
    try {
      const vendorHandler = new VendorHandler()
      await vendorHandler.init(env.BUNGIE_API, env.DESTINY_2_DEFINITIONS)
      const twitterHandler = new TwitterHandler()
      await twitterHandler.init(env.TWITTER_API)

      // const getAda = await getAda(vendorHandler)
      // const banshee = await getBanshee(vendorHandler)
      // const spider = await getSpider(venderHandler)
      const xur = await getXur(vendorHandler, twitterHandler)

      return new Response(
        JSON.stringify({
          // ada,
          // banshee,
          // spider,
          ...xur,
        }),
        {
          status: 200,
        },
      )
    } catch (e) {
      return new Response(e.message, {
        status: 500,
      })
    }
  },
}
