import BungieAPIHandler from './BungieAPIHandler'

export default class PublicMilestoneHandler {
  constructor(bungieAPIHandlerEnv) {
    this.bungieAPIHandler = new BungieAPIHandler(bungieAPIHandlerEnv)
  }

  async getPublicMilestones() {
    let response = await this.bungieAPIHandler.callApi({
      path: `/Destiny2/Milestones`,
      method: 'GET',
    })

    if (response.Message !== 'Ok') {
      return new Response(
        `Failed to get public milestones with error: ${response.Error}`
      )
    }

    return response.Response
  }
}
