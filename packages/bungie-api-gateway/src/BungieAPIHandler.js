import BungieAPIError from './BungieAPIError'

export default class BungieAPIHandler {
  constructor({
    apiKey,
    oauthToken,
    membershipId,
    membershipType,
    characterId,
  }) {
    this.apiKey = apiKey
    this.oauthToken = oauthToken
    this.membershipId = membershipId
    this.membershipType = membershipType
    this.characterId = characterId
  }

  /**
   * Adds the API Key to the request header.
   */
  addApiKeyToHeader(options) {
    const update = { ...options }
    update.headers = {
      ...update.headers,
      Authorization: 'Bearer ' + this.oauthToken,
      'X-API-Key': this.apiKey,
    }
    return update
  }

  /**
   * Calls the api for passed in options and parses into JSON response;
   */
  async callApi(options) {
    console.log('CALL: ' + options.path)
    let resp
    try {
      resp = await fetch(
        'https://www.bungie.net/Platform' + options.path,
        this.addApiKeyToHeader(options)
      )
    } catch (e) {
      console.error(`Failed to call bungie platform api ${e}`)
      throw e
    }
    if (resp.status === 401) {
      console.error(
        'Unauthorized from Bungie API. Check to make sure credentials are updated.'
      )
    } else if (!resp.ok) {
      throw new BungieAPIError(resp.url, resp.headers)
    }
    return resp.json()
  }

  async callBungieNet(options) {
    let resp = await fetch('https://www.bungie.net/' + options.path)
    if (!resp.ok) {
      throw new BungieAPIError(resp.url, resp.headers)
    }
    return resp.json()
  }

  /**
   * Gets current version of the Destiny API manifest.
   * Links to sqlite database file containing information on items/entities etc.
   * Useful for large/frequent requests for item information and other things.
   */
  async getManifest() {
    let options = {
      path: '/Destiny2/Manifest/',
      method: 'GET',
    }
    let manifestResponse = await this.callApi(options)

    return manifestResponse.Response
  }

  /**
   * Gets current version of the Destiny API manifest.
   * Links to sqlite database file containing information on items/entities etc.
   * Useful for large/frequent requests for item information and other things.
   */
  async getManifestDefinition(entityType, hash) {
    let options = {
      path: `/Destiny2/Manifest/${entityType}/${hash}/`,
      method: 'GET',
    }
    return await this.callApi(options)
  }

  async getCompleteManifest() {
    const manifest = await this.getManifest()

    return this.callBungieNet({ path: manifest.jsonWorldContentPaths.en })
  }

  async getDefinitionFromManifest(definition) {
    if (typeof definition !== 'string') {
      throw new Error(
        'Parameter `definition` is required and must be of type string.'
      )
    }

    const manifest = await this.getManifest()
    const definitionPath =
      manifest.jsonWorldComponentContentPaths.en[definition]

    if (!definitionPath) {
      throw new Error(
        `Parameter 'definition' with value of ${definition} does not exist in the Destiny 2 Manifest.`
      )
    }

    return this.callBungieNet({ path: definitionPath })
  }
}
