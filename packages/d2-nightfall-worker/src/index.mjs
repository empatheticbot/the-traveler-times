import { PublicMilestoneHandler } from '@the-traveler-times/bungie-api-gateway'

export default {
  async fetch(request, env) {
    const apiKey = await env.BUNGIE_API.get('KEY')
    const oauthToken = await env.BUNGIE_API.get('OAUTH_TOKEN')
    const membershipId = await env.BUNGIE_API.get('MEMBERSHIP_ID')
    const membershipType = await env.BUNGIE_API.get('MEMBERSHIP_TYPE')
    const characterId = await env.BUNGIE_API.get('CHARACTER_ID')

    const publicMilestoneHandler = new PublicMilestoneHandler({
      apiKey,
      oauthToken,
      membershipId,
      membershipType,
      characterId,
    })
    try {
      const milestones = await publicMilestoneHandler.getPublicMilestones()

      return new Response(JSON.stringify(milestones), {
        status: 200,
      })
    } catch (e) {
      return new Response(e, {
        status: 500,
      })
    }
  },
}
