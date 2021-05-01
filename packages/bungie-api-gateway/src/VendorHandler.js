import BungieAPIHandler from './BungieAPIHandler'
import DefinitionHandler from './DefinitionHandler'
import { XUR, ZAVALA } from './Hashes'

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
          const item = await this.definitionHandler.getInventoryItem(
            sale.itemHash
          )
          return { ...sale, ...item }
        })
      )
    }
    return { ...vendor, sales }
  }

  async getVendorByHash(hash) {
    try {
      const vendorLiveData = await this.getVendorLiveData(hash)
      const vendorStaticData = await this.definitionHandler.getVendor(hash)

      // TODO: Bungie's API is wrong. Xur does not show up at 4AM... so we need to adjust that to make sure Twitter
      // stuff works correctly... (https://github.com/Bungie-net/api/issues/353)
      let nextRefreshDate = vendorLiveData.nextRefreshDate
      if (hash === XUR) {
        const nextRefreshDateXur = new Date(nextRefreshDate)
        nextRefreshDateXur.setUTCHours(17)
        nextRefreshDate = nextRefreshDateXur.toISOString()
      }
      const lastRefreshDate = this.getVendorLastRefreshDate(nextRefreshDate)

      if (vendorLiveData && vendorStaticData) {
        return {
          ...vendorStaticData,
          ...vendorLiveData,
          lastRefreshDate,
          nextRefreshDate,
        }
      }
      throw new Error('Vendor hash id not found.')
    } catch (e) {
      throw new Error(`Error in 'getVendorByHash: ${e}`)
    }
  }

  getVendorLastRefreshDate(nextRefreshDate) {
    const lastRefreshDate = new Date(nextRefreshDate)
    lastRefreshDate.setDate(lastRefreshDate.getDate() - 7)
    return lastRefreshDate.toISOString()
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
    let {
      nextRefreshDate,
      lastRefreshDate,
      enabled,
      sales,
    } = completeVendorData

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
      lastRefreshDate,
      nextRefreshDate,
      hash,
      enabled,
      sales: salesStripped,
    }
  }

  async getWeeklyResets() {
    // TODO: factor out the api call so I can grab two vendors in one call.
    // This is currently dumb and really inefficient--we don't need all this data.
    const xur = await this.getVendorByHash(XUR)
    const zavala = await this.getVendorByHash(ZAVALA)

    return {
      weeklyReset: zavala.nextRefreshDate,
      weekendReset: xur.nextRefreshDate,
    }
  }
}
