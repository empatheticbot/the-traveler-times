import {
  DefinitionHandler,
  VendorHandler,
  PublicMilestoneHandler,
  Hashes,
} from '@the-traveler-times/bungie-api-gateway'

export default {
  async fetch(request, env) {
    const vendorHandler = new VendorHandler()
    await vendorHandler.init(env.BUNGIE_API)
    const definitionHandler = new DefinitionHandler()
    await definitionHandler.init(env.BUNGIE_API)
    const publicMilestoneHandler = new PublicMilestoneHandler()
    await publicMilestoneHandler.init(env.BUNGIE_API)

    try {
      const weeklyInfo = await vendorHandler.getWeeklyResets()
      let ironBannerMilestone
      try {
        ironBannerMilestone =
          await publicMilestoneHandler.getPublicMilestoneByHash(
            Hashes.IRON_BANNER
          )
      } catch (e) {
        console.log('Iron Banner not available.')
      }
      let ironBanner

      if (ironBannerMilestone) {
        const ironBannerDefinition = await definitionHandler.getMilestone(
          ironBannerMilestone.milestoneHash
        )
        ironBanner = {
          isAvailable: true,
          ...ironBannerDefinition,
          ...ironBannerMilestone,
        }
      } else {
        ironBanner = { isAvailable: false }
      }

      return new Response(
        JSON.stringify({ ...weeklyInfo, ironBanner, isAvailable: true }),
        {
          status: 200,
        }
      )
    } catch (e) {
      return new Response(
        JSON.stringify({ isAvailable: false, error: e.message })
      )
    }
  },
}
