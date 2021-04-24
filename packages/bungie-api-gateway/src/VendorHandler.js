import BungieAPIHandler from './BungieAPIHandler'

export default class VendorHandler {
  async init(bungieApiEnv) {
    this.bungieAPIHandler = new BungieAPIHandler()
    await this.bungieAPIHandler.init(bungieApiEnv)
  }

  async getVendors() {
    let response = await this.bungieAPIHandler.callApi({
      path: `/Platform/Destiny2/${this.bungieAPIHandler.membershipType}/Profile/${this.bungieAPIHandler.membershipId}/Character/${this.bungieAPIHandler.characterId}/Vendors/`,
      method: 'GET',
    })

    if (response.Message !== 'Ok') {
      return new Response(`Failed to get vendors with error: ${response.Error}`)
    }

    return response.Response
  }

  async getVendorByHash(hash) {
    try {
      const vendors = await this.getVendors()

      const vendor = vendors[hash]

      if (vendor) {
        return vendor
      }
      throw new Error('Vendor hash id not found.')
    } catch (e) {
      throw new Error(`Error in 'getVendorByHash: ${e}`)
    }
  }
}
