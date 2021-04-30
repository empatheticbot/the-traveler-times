import {
  PublicMilestoneHandler,
  TwitterHandler,
  Hashes,
} from '@the-traveler-times/bungie-api-gateway'

export default {
  async fetch(request, env) {
    try {
      return new Response(JSON.stringify({ isAvailable: true }), {
        status: 200,
      })
    } catch (e) {
      return new Response(e.message, {
        status: 500,
      })
    }
  },
}
