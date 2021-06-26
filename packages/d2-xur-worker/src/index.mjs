import {
  VendorHandler,
  TwitterHandler,
  Hashes,
} from '@the-traveler-times/bungie-api-gateway'
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
      
      // const banshee = await getBanshee(vendorHandler)
      // const spider = await getSpider(venderHandler)
      const xur = await getXur(vendorHandler, twitterHandler)

      return new Response(
        JSON.stringify({
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
