import { PublicMilestoneHandler } from '@the-traveler-times/bungie-api-gateway'

export default {
  async fetch(request, env) {
    const publicMilestoneHandler = new PublicMilestoneHandler()
    await publicMilestoneHandler.init(env.BUNGIE_API)

    try {
      const nightfallMilestone = await publicMilestoneHandler.getPublicMilestone(
        '1942283261',
      )

      return new Response(JSON.stringify(nightfallMilestone), {
        status: 200,
      })
    } catch (e) {
      return new Response(e, {
        status: 500,
      })
    }
  },
}
