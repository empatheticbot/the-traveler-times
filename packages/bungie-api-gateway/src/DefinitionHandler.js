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

  async getHashKeyedDefinitions(hashes, definitions) {
    return hashes.reduce(
      (obj, hash) => ({
        ...obj,
        [hash]: definitions[hash],
      }),
      {}
    )
  }

  async getVendors(...hashes) {
    const vendors = await this.getDefinitions('DestinyVendorDefinition')
    return this.getHashKeyedDefinitions(hashes, vendors)
  }

  async getInventoryItems(...hashes) {
    const items = await this.getDefinitions(
      'DestinyInventoryItemLiteDefinition'
    )
    return this.getHashKeyedDefinitions(hashes, items)
  }

  async getActivities(...hashes) {
    console.log('act: ' + hashes)
    const activities = await this.getDefinitions('DestinyActivityDefinition')
    return this.getHashKeyedDefinitions(hashes, activities)
  }

  async getActivityModifiers(...hashes) {
    console.log('mod: ' + hashes)

    const modifiers = await this.getDefinitions(
      'DestinyActivityModifierDefinition'
    )
    return this.getHashKeyedDefinitions(hashes, modifiers)
  }

  async getCharacterClasses() {
    return this.getDefinitions('DestinyClassDefinition')
  }

  async getDamageTypes() {
    return this.getDefinitions('DestinyDamageTypeDefinition')
  }
}
