import BungieAPIHandler from './BungieAPIHandler'
import { SocketPlugSources } from './Masks'

async function getInventoryItems(hashes, env) {
	const url = new URL(
		'https://the-traveler-times.netlify.app/.netlify/functions/definitions'
	)
	url.searchParams.append('definitionType', 'DestinyInventoryItemDefinition')
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

export default class DefinitionHandler {
	inFlightDefinitionRequests: { [index: string]: unknown } = {}
	bungieAPIHandler

	constructor() {
		this.bungieAPIHandler = new BungieAPIHandler()
	}

	async init(bungieApiEnv: KVNamespace) {
		await this.bungieAPIHandler.init(bungieApiEnv)
	}

	async getDefinitions(definitionName: string) {
		let definitions = this.inFlightDefinitionRequests[definitionName]

		if (definitions) {
			return definitions
		}

		const request =
			this.bungieAPIHandler.getDefinitionFromManifest(definitionName)
		this.inFlightDefinitionRequests[definitionName] = request
		definitions = await request

		if (!definitions) {
			throw new Error(
				`Could not find ${definitionName} in cache or retrieve from bungie.net`
			)
		}

		return definitions
	}

	getArrayOfDefinitions(hashes, definitions) {
		return hashes.map((hash) => definitions[hash])
	}

	async getVendors(...hashes) {
		const vendors = await this.getDefinitions('DestinyVendorDefinition')
		return this.getArrayOfDefinitions(hashes, vendors)
	}

	async getVendor(hash) {
		const vendors = await this.getVendors(hash)
		return vendors[0]
	}

	async getInventoryItems(...hashes) {
		console.log('Called old inventory items')
		const items = await this.getDefinitions('DestinyInventoryItemDefinition')
		return this.getArrayOfDefinitions(hashes, items)
	}

	async getInventoryItem(hash) {
		const items = await this.getInventoryItems(hash)
		return items[0]
	}

	async getActivities(...hashes) {
		const activities = await this.getDefinitions('DestinyActivityDefinition')
		return this.getArrayOfDefinitions(hashes, activities)
	}

	async getActivity(hash) {
		const activities = await this.getActivities(hash)
		return activities[0]
	}

	async getActivityModifiers(...hashes) {
		const modifiers = await this.getDefinitions(
			'DestinyActivityModifierDefinition'
		)
		return this.getArrayOfDefinitions(hashes, modifiers)
	}

	async getActivityModifier(hash) {
		const modifiers = await this.getActivityModifiers(hash)
		return modifiers[0]
	}

	async getCharacterClasses() {
		return this.getDefinitions('DestinyClassDefinition')
	}

	async getCharacterClass(classId) {
		const classes = await this.getCharacterClasses()
		const classesKeyedById = Object.values(classes).reduce(
			(previousValue, currentValue) => {
				return {
					...previousValue,
					[currentValue.classType]: currentValue.displayProperties.name,
				}
			},
			{}
		)
		return classesKeyedById[classId]
	}

	async getAllDamageTypes() {
		return this.getDefinitions('DestinyDamageTypeDefinition')
	}

	async getDamageType(hash) {
		const damageTypes = await this.getAllDamageTypes()
		return damageTypes[hash]
	}

	async getSocketDetails(
		item,
		source = SocketPlugSources.ReusablePlugItems,
		env
	) {
		const socketEntries = item?.sockets?.socketEntries
		let sockets = []
		if (socketEntries) {
			const plugHashes = socketEntries
				.filter((entry) => entry.plugSources === source)
				.map((entry) =>
					entry.reusablePlugItems.map((plugItem) => plugItem.plugItemHash)
				)
				.flat()
			let items = []
			try {
				items = await getInventoryItems(plugHashes, env)
			} catch (e) {
				return Promise.reject(`Failed to getInventoryItems for socket: ${e}`)
			}
			for (const entry of socketEntries) {
				if (entry.plugSources === source) {
					sockets.push(
						entry.reusablePlugItems.map((pluginItem) => {
							const pluginItemDefinition =
								items && items[pluginItem.plugItemHash]
							return pluginItemDefinition
						})
					)
				}
			}
		}
		console.log('completed sockets')
		return sockets
	}

	async getMilestone(hash) {
		const defintions = await this.getDefinitions('DestinyMilestoneDefinition')
		return defintions[hash]
	}

	async getDestination(hash) {
		const defintions = await this.getDefinitions('DestinyDestinationDefinition')
		return defintions[hash]
	}

	async getPresentationNode(hash) {
		const nodes = await this.getDefinitions('DestinyPresentationNodeDefinition')
		return nodes[hash]
	}

	async getRecord(hash) {
		const records = await this.getDefinitions('DestinyRecordDefinition')
		return records[hash]
	}

	async getSaleItemCosts(saleCosts, env) {
		const saleHashes = saleCosts.map((cost) => cost.itemHash)
		let items = []
		try {
			items = await getInventoryItems(saleHashes, env)
		} catch (e) {
			return Promise.reject(`Failed to getInventoryItems for costs: ${e}`)
		}
		return saleCosts.map((cost, index) => {
			const currencyDetails = items && items[index]
			return { ...currencyDetails, ...cost }
		})
	}
}
