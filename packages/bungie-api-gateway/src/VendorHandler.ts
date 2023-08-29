import BungieAPIHandler from './BungieAPIHandler'
import DefinitionHandler from './DefinitionHandler'
import { XUR, ZAVALA, SPIDER, RAHOOL, ADA, BANSHEE } from './Hashes'
import { getStrippedItems } from './InventoryItemUtility'
import { SocketPlugSources } from './Masks'

async function getInventoryItems(hashes, env) {
	const url = new URL(
		'https://the-traveler-times.netlify.app/.netlify/functions/definitions'
	)
	url.searchParams.append('definitionType', 'DestinyInventoryItemDefinition')
	console.log(url.toString())
	try {
		const inventoryItems = await fetch(url, {
			headers: { 'TTT-API-KEY': env.TTT_API_KEY },
			method: 'post',
			body: JSON.stringify({ definitionIds: hashes }),
		})
		const data = await inventoryItems.json()
		return data.definitions
	} catch (e) {
		console.log(e)
	}
}

export default class VendorHandler {
	bungieAPIHandler
	definitionHandler
	env

	async init(env) {
		this.env = env
		this.bungieAPIHandler = new BungieAPIHandler()
		await this.bungieAPIHandler.init(env.BUNGIE_API)
		this.definitionHandler = new DefinitionHandler()
		await this.definitionHandler.init(env.BUNGIE_API)
	}

	// TODO: This function is fairly gnarly, split out some of the item sales code it's own module
	async getVendorLiveData(hash, components = ['Vendors', 'VendorSales']) {
		console.log(this.env)
		let response = await this.bungieAPIHandler.callApi({
			path: `/Destiny2/${this.bungieAPIHandler.membershipType}/Profile/${this.bungieAPIHandler.membershipId}/Character/${this.bungieAPIHandler.characterId}/Vendors/`,
			components,
			method: 'GET',
		})
		if (response.Message !== 'Ok') {
			throw new Error(`Failed to get vendors with error: ${response.Message}`)
		}
		const vendor = response.Response.vendors.data[hash]
		const saleObject = response.Response.sales.data[hash].saleItems
		let sales = []
		if (saleObject) {
			const saleItems = Object.values(saleObject)
			const itemHashes = saleItems.map((sale) => sale.itemHash)

			const items = (await getInventoryItems(itemHashes, this.env)).reduce(
				(acc, item) => {
					acc[item.hash] = item
					return acc
				},
				{}
			)

			sales = await Promise.all(
				saleItems.map(async (sale) => {
					const item = items[sale.itemHash]

					let classType
					try {
						classType = await this.definitionHandler.getCharacterClass(
							item.classType
						)
					} catch (e) {
						throw Error(`Failed to get classType: ${e}`)
					}

					let damageType
					try {
						damageType = await this.definitionHandler.getDamageType(
							item.defaultDamageTypeHash
						)
					} catch (e) {
						throw Error(`Failed to get damageType: ${e}`)
					}

					let sockets = []
					// try {
					// 	sockets = await this.definitionHandler.getSocketDetails(item, SocketPlugSources.ReusablePlugItems, this.env)
					// } catch (e) {
					// 	throw Error(`Failed to get sockets: ${e}`)
					// }

					let costs = []
					if (sale.costs) {
						try {
							costs = await this.definitionHandler.getSaleItemCosts(
								sale.costs,
								this.env
							)
						} catch (e) {
							throw Error(`Failed to get costs: ${e}`)
						}
					}

					return { ...sale, ...item, classType, damageType, costs, sockets }
				})
			)
			// Rewards are included with sales items 🙄. I'm relying on the fact that
			// a sold item should always have a cost, so filtering out items without a cost.
			// If this isn't true at some point, this will be broken.
			sales = sales.filter((sale) => sale.costs.length > 0)
		}
		return { ...vendor, sales }
	}

	async getVendorByHash(hash) {
		try {
			const vendorLiveData = await this.getVendorLiveData(hash)
			const vendorStaticData = await this.definitionHandler.getVendor(hash)

			// TODO: Bungie's API is wrong. Xur does not show up at 4AM... so we need to adjust that to make sure Twitter
			// stuff works correctly... (https://github.com/Bungie-net/api/issues/353)
			// Oh, Rahool's refresh time seems wrong as well 🤷🏻‍♂️
			let nextRefreshDate = vendorLiveData.nextRefreshDate
			let lastRefreshDate
			if (nextRefreshDate) {
				if (hash === XUR || hash === RAHOOL) {
					const nextRefreshDateXur = new Date(nextRefreshDate)
					nextRefreshDateXur.setUTCHours(17)
					nextRefreshDate = nextRefreshDateXur.toISOString()
				}
				lastRefreshDate = this.getVendorLastRefreshDate(hash, nextRefreshDate)
			}

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
			throw new Error(`Error in 'getVendorByHash [${hash}]: ${e}`)
		}
	}

	getVendorLastRefreshDate(hash, nextRefreshDate) {
		const lastRefreshDate = new Date(nextRefreshDate)
		const refreshIntervalMap = {
			[BANSHEE]: 1,
			[XUR]: 7,
			[ADA]: 1,
			[SPIDER]: 1,
			[RAHOOL]: 1,
			[ZAVALA]: 7,
		}
		const refreshInterval = refreshIntervalMap[hash] || 1
		const currentDate = new Date()
		// This is fairly dumb, but occasionsally Bungie will update the nextRefreshDate before
		// the current nextRefreshDate is reached. This can cause a couple hours where subtracting
		// a week will still be ahead of the current date.
		while (currentDate < lastRefreshDate) {
			lastRefreshDate.setDate(lastRefreshDate.getDate() - refreshInterval)
		}
		return lastRefreshDate.toISOString()
	}

	async getStrippedDownVendorByHash(hash) {
		const completeVendorData = await this.getVendorByHash(hash)
		console.log('got complete vendor data', completeVendorData)
		const {
			name,
			description,
			icon,
			subtitle,
			smallTransparentIcon,
			largeTransparentIcon,
			largeIcon,
		} = completeVendorData.displayProperties
		let { nextRefreshDate, lastRefreshDate, enabled, sales } =
			completeVendorData

		const salesStripped = getStrippedItems(sales)

		return {
			name,
			description,
			icon,
			subtitle,
			smallTransparentIcon,
			largeIcon,
			largeTransparentIcon,
			lastRefreshDate,
			nextRefreshDate,
			hash,
			enabled,
			sales: salesStripped,
		}
	}
}
