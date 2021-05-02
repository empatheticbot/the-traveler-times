import { DefinitionHandler, VendorHandler, PublicMilestoneHandler, Hashes } from '@the-traveler-times/bungie-api-gateway'

export default {
  async fetch(request, env) {
    const vendorHandler = new VendorHandler()
    await vendorHandler.init(env.BUNGIE_API, env.DESTINY_2_DEFINITIONS)
    const definitionHandler = new DefinitionHandler()
    await definitionHandler.init(env.BUNGIE_API, env.DESTINY_2_DEFINITIONS)
    const publicMilestoneHandler = new PublicMilestoneHandler()
    await publicMilestoneHandler.init(env.BUNGIE_API)

    try {
      const weeklyInfo = await vendorHandler.getWeeklyResets()
      const ironBannerMilestone = await publicMilestoneHandler.getPublicMilestoneByHash(Hashes.IRON_BANNER)
      let ironBanner

      if (ironBannerMilestone) {
        const ironBannerDefinition = await definitionHandler.getMilestone(ironBannerMilestone.milestoneHash)
        ironBanner = { isAvailable: true, ...ironBannerDefinition, ...ironBannerMilestone }
      } else {
        ironBanner = { isAvailable: false }
      }
      
      return new Response(
        JSON.stringify({ ...weeklyInfo, ironBanner }),
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
