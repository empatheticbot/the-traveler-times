import BungieAPIHandler from "./BungieAPIHandler"

export default class DefinitionHandler {
  async init(bungieApiEnv) {
    this.bungieAPIHandler = new BungieAPIHandler()
    await this.bungieAPIHandler.init(bungieApiEnv)

    this.definitionCache = {}
  }

  async getDefinitions(definitionName) {
    let definitions = this.definitionCache[definitionName]

    if (!definitions) {
      definitions = await this.bungieAPIHandler.getDefinitionFromManifest(
        definitionName
      )
    }

    if (!definitions) {
      throw new Error(`Could not find ${definitionName} in definitionEnv`)
    }

    this.definitionCache[definitionName] = definitions
    return definitions
  }

  getArrayOfDefinitions(hashes, definitions) {
    return hashes.map((hash) => definitions[hash])
  }
  
  async getVendors(...hashes) {
    const vendors = await this.getDefinitions("DestinyVendorDefinition")
    return this.getArrayOfDefinitions(hashes, vendors)
  }

  async getVendor(hash) {
    const vendors = await this.getVendors(hash)
    return vendors[0]
  }

  async getInventoryItems(...hashes) {
    const items = await this.getDefinitions("DestinyInventoryItemDefinition")
    return this.getArrayOfDefinitions(hashes, items)
  }

  async getInventoryItem(hash) {
    const items = await this.getInventoryItems(hash)
    return items[0]
  }

  async getActivities(...hashes) {
    const activities = await this.getDefinitions("DestinyActivityDefinition")
    return this.getArrayOfDefinitions(hashes, activities)
  }

  async getActivity(hash) {
    const activities = await this.getActivities(hash)
    return activities[0]
  }

  async getActivityModifiers(...hashes) {
    const modifiers = await this.getDefinitions(
      "DestinyActivityModifierDefinition"
    )
    return this.getArrayOfDefinitions(hashes, modifiers)
  }

  async getActivityModifier(hash) {
    const modifiers = await this.getActivityModifiers(hash)
    return modifiers[0]
  }

  async getCharacterClasses() {
    return this.getDefinitions("DestinyClassDefinition")
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

  async getDamageType(hash) {
    const damageTypes = await this.getDefinitions("DestinyDamageTypeDefinition")
    return damageTypes[hash]
  }

  async getMilestone(hash) {
    const defintions = await this.getDefinitions("DestinyMilestoneDefinition")
    return defintions[hash]
  }

  async getDestination(hash) {
    const defintions = await this.getDefinitions("DestinyDestinationDefinition")
    return defintions[hash]
  }

  async getPresentationNode(hash) {
    const nodes = await this.getDefinitions("DestinyPresentationNodeDefinition")
    return nodes[hash]
  }

  async getRecord(hash) {
    const record = await this.getDefinitions("DestinyRecordDefinition")
    return record[hash]
  }

  async getSaleItemCosts(saleCosts) {
    return Promise.all(
      saleCosts.map(async (cost) => {
        const currencyDetails = await this.getInventoryItem(cost.itemHash)
        return { ...currencyDetails, ...cost }
      })
    )
  }
}
