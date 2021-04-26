import BungieAPIHandler from './BungieAPIHandler'
import DefinitionHandler from './DefinitionHandler'

export default class VendorHandler {
  async init(bungieApiEnv, definitionEnv) {
    this.bungieAPIHandler = new BungieAPIHandler()
    await this.bungieAPIHandler.init(bungieApiEnv)
    this.definitionHandler = new DefinitionHandler()
    await this.definitionHandler.init(bungieApiEnv, definitionEnv)
  }

  // TODO: This function is fairly gnarly, split out some of the item sales code it's own module
  async getVendorLiveData(hash, components = ['Vendors', 'VendorSales']) {
    let response = await this.bungieAPIHandler.callApi({
      path: `/Destiny2/${this.bungieAPIHandler.membershipType}/Profile/${this.bungieAPIHandler.membershipId}/Character/${this.bungieAPIHandler.characterId}/Vendors/`,
      components,
      method: 'GET',
    })
    if (response.Message !== 'Ok') {
      throw new Error(`Failed to get vendors with error: ${response.Message}`)
    }
    const vendor = response.Response.vendors.data[hash]
    const saleItems = response.Response.sales.data[hash].saleItems
    let sales = []
    if (saleItems) {
      sales = await Promise.all(
        Object.values(saleItems).map(async (sale) => {
          console.log(sale)
          const item = await this.definitionHandler.getInventoryItems(
            sale.itemHash
          )
          return { ...sale, ...item }
        })
      )
    }
    return { ...vendor, sales }
    // return Object.keys(vendors).reduce((vendorsObject, currentHash) => {
    //   const vendor = vendors[currentHash]
    //   const sales = salesData[currentHash].saleItems

    //   return { ...vendorsObject, [currentHash]: { ...vendor, sales } }
    // }, {})
  }

  async getVendorByHash(hash) {
    try {
      const vendorLiveData = await this.getVendorLiveData(hash)
      const vendorStaticData = await this.definitionHandler.getVendors(hash)

      if (vendorLiveData && vendorStaticData) {
        return { ...vendorStaticData, ...vendorLiveData }
      }
      throw new Error('Vendor hash id not found.')
    } catch (e) {
      throw new Error(`Error in 'getVendorByHash: ${e}`)
    }
  }

  async getStrippedDownVendorByHash(hash) {
    const completeVendorData = await this.getVendorByHash(hash)
    const {
      name,
      description,
      icon,
      subtitle,
      smallTransparentIcon,
    } = completeVendorData.displayProperties
    const { nextRefreshDate, enabled, sales } = completeVendorData
    const salesStripped = sales.map((sale) => {
      return {
        name: sale.displayProperties.name,
        icon: sale.displayProperties.icon,
        subtitle: sale.itemTypeAndTierDisplayName,
        sort: sale.itemType,
      }
    })
    return {
      name,
      description,
      icon,
      subtitle,
      smallTransparentIcon,
      nextRefreshDate,
      hash,
      enabled,
      sales: salesStripped,
    }
  }
}
