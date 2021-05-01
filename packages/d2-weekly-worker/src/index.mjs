import { VendorHandler } from '@the-traveler-times/bungie-api-gateway'

export default {
  async fetch(request, env) {
    const vendorHandler = new VendorHandler()
    await vendorHandler.init(env.BUNGIE_API, env.DESTINY_2_DEFINITIONS)

    try {
      const weeklyInfo = await vendorHandler.getWeeklyResets()

      
      return new Response(
        JSON.stringify({ ...weeklyInfo }),
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
