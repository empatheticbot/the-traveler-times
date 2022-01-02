import {
  DefinitionHandler,
  // VendorHandler,
  PublicMilestoneHandler,
  Hashes,
  dateUtilities,
} from '@the-traveler-times/bungie-api-gateway'
import { isAuthorized } from '@the-traveler-times/utils'

export default {
  async fetch(request: Request, env: CloudflareEnvironment) {
    if (!isAuthorized(request, env)) {
      return new Response('Unauthorized', { status: 401 })
    }
    const definitionHandler = new DefinitionHandler()
    await definitionHandler.init(env.BUNGIE_API)
    const publicMilestoneHandler = new PublicMilestoneHandler()
    await publicMilestoneHandler.init(env.BUNGIE_API)

    try {
      const nextWeeklyReset = dateUtilities.getNextWeeklyReset()
      const nextWeekendReset = dateUtilities.getNextWeekendReset()
      const lastWeeklyReset = dateUtilities.getLastWeeklyReset()
      const lastWeekendReset = dateUtilities.getLastWeekendReset()
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
          startDate: lastWeeklyReset,
          endDate: nextWeeklyReset,
          ...ironBannerDefinition,
          ...ironBannerMilestone,
        }
      } else {
        ironBanner = { isAvailable: false }
      }

      return new Response(
        JSON.stringify({
          nextWeeklyReset,
          lastWeeklyReset,
          nextWeekendReset,
          lastWeekendReset,
          ironBanner,
          isAvailable: true,
        }),
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
