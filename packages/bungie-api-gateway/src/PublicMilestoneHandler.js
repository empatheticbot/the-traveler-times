import BungieAPIHandler from './BungieAPIHandler'

export default class PublicMilestoneHandler {
  async init(bungieApiEnv) {
    this.bungieAPIHandler = new BungieAPIHandler()
    await this.bungieAPIHandler.init(bungieApiEnv)
  }

  async getPublicMilestones() {
    let response = await this.bungieAPIHandler.callApi({
      path: `/Destiny2/Milestones/`,
      method: 'GET',
    })

    if (response.Message !== 'Ok') {
      return new Response(
        `Failed to get public milestones with error: ${response.Error}`
      )
    }

    return response.Response
  }

  async getPublicMilestoneByHash(hash) {
    try {
      const milestones = await this.getPublicMilestones()

      const milestone = milestones[hash]

      if (milestone) {
        return milestone
      }
      throw new Error('Milestone hash id not found.')
    } catch (e) {
      console.error(`Error in 'getPublicMilestoneByHash: ${e}`)
    }
  }
}
