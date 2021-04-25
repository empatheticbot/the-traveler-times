import BungieAPIHandler from './BungieAPIHandler'
import DefinitionHandler from './DefinitionHandler'

export default class VendorHandler {
  async init(bungieApiEnv, definitionEnv) {
    this.bungieAPIHandler = new BungieAPIHandler()
    await this.bungieAPIHandler.init(bungieApiEnv)
    this.vendorHandler = new DefinitionHandler()
    await this.vendorHandler.init(
      bungieApiEnv,
      definitionEnv,
      'DestinyVendorDefinition'
    )
  }

  async getVendorLiveData(components = ['Vendors', 'VendorSales']) {
    let response = await this.bungieAPIHandler.callApi({
      path: `/Destiny2/${this.bungieAPIHandler.membershipType}/Profile/${this.bungieAPIHandler.membershipId}/Character/${this.bungieAPIHandler.characterId}/Vendors/`,
      components,
      method: 'GET',
    })
    if (response.Message !== 'Ok') {
      throw new Error(`Failed to get vendors with error: ${response.Message}`)
    }
    const vendors = response.Response.vendors.data
    const sales = response.Response.sales.data
    return Object.keys(vendors).reduce((vendorsObject, currentHash) => {
      const vendor = vendors[currentHash]
      const sale = sales[currentHash]
      return { ...vendorsObject, [currentHash]: { ...vendor, ...sale } }
    }, {})
  }

  async getVendorByHash(hash) {
    try {
      const vendors = await this.getVendorLiveData()

      const vendorLiveData = vendors[hash]
      const vendorStaticData = await this.vendorHandler.getItemByHash(hash)
      if (vendorLiveData && vendorStaticData) {
        return { ...vendorStaticData, ...vendorLiveData }
      }
      throw new Error('Vendor hash id not found.')
    } catch (e) {
      throw new Error(`Error in 'getVendorByHash: ${e}`)
    }
  }
}
