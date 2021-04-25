import BungieAPIHandler from './BungieAPIHandler'

export default class DefinitionHandler {
  async init(bungieApiEnv, definitionEnv, definitionName) {
    this.bungieAPIHandler = new BungieAPIHandler()
    await this.bungieAPIHandler.init(bungieApiEnv)

    this.definitionName = definitionName
    this.definitions = await definitionEnv.get(definitionName, {
      type: 'json',
    })

    if (!this.definitions) {
      throw new Error(`Could not find ${definitionName} in definitionEnv`)
    }
  }

  async fetchDefintionFromApi(hash) {
    try {
      let item = await this.bungieAPIHandler.getManifestDefinition(
        this.definitionName,
        hash
      )
      return item.Response
    } catch (e) {
      console.error(
        `Failed to fetch item (${hash}) from ${this.definitionName} data. ${e}`
      )
      return null
    }
  }

  async getItemByHash(hash) {
    let item = this.definitions[hash]

    if (item) {
      return item
    }

    return this.fetchDefintionFromApi(hash)
  }

  async getItemsByHash(hashes) {
    return await Promise.all(hashes.map((hash) => this.getItemByHash(hash)))
  }
}
