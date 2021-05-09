import BungieAPIHandler from './BungieAPIHandler'

export default class DefinitionHandler {
  async init(bungieApiEnv, definitionEnv) {
    this.bungieAPIHandler = new BungieAPIHandler()
    await this.bungieAPIHandler.init(bungieApiEnv)

    this.definitionEnv = definitionEnv
    this.definitionCache = {}

    if (!this.definitionEnv) {
      throw new Error(`'definitionEnv' is required on init.`)
    }
  }

  async fetchDefintionFromApi(hash, definitionName) {
    try {
      let item = await this.bungieAPIHandler.getManifestDefinition(
        definitionName,
        hash
      )
      return item.Response
    } catch (e) {
      console.error(
        `Failed to fetch item (${hash}) from ${definitionName} data. ${e}`
      )
      return null
    }
  }

  async getDefinitions(definitionName) {
    let definitions = this.definitionCache[definitionName]

    if (!definitions) {
      definitions = await this.definitionEnv.get(definitionName, {
        type: 'json',
      })
    }

    if (!definitions) {
      throw new Error(`Could not find ${definitionName} in definitionEnv`)
    }
    this.definitionCache[definitionName] = definitions
    return definitions
  }

  getHashKeyedDefinitions(hashes, definitions) {
    return hashes.reduce(
      (obj, hash) => ({
        ...obj,
        [hash]: definitions[hash],
      }),
      {}
    )
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
    const items = await this.getDefinitions(
      'DestinyInventoryItemLiteDefinition'
    )
    return this.getArrayOfDefinitions(hashes, items)
  }

  async getInventoryItem(hash) {
    const inventory = await this.getInventoryItems(hash)
    return inventory[0]
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
    return classes[classId]
  }

  async getDamageTypes() {
    return this.getDefinitions('DestinyDamageTypeDefinition')
  }

  async getMilestone(hash) {
    const defintions = await this.getDefinitions('DestinyMilestoneDefinition')
    return defintions[hash]
  }
}
