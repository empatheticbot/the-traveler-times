import BungieAPIError from './BungieAPIError'

export default class BungieAPIHandler {
  async init(bungieApiEnv) {
    try {
      this.apiKey = await bungieApiEnv.get('KEY')
      this.oauthToken = await bungieApiEnv.get('OAUTH_TOKEN')
      this.membershipId = await bungieApiEnv.get('MEMBERSHIP_ID')
      this.membershipType = await bungieApiEnv.get('MEMBERSHIP_TYPE')
      this.characterId = await bungieApiEnv.get('CHARACTER_ID')
    } catch (e) {
      throw new Error(`BungieAPIHandler init failed. ${e}`)
    }
  }

  /**
   * Adds the API Key to the request header.
   */
  addApiKeyToHeader(headers = {}) {
    return {
      headers: {
        ...headers,
        // Authorization: 'Bearer ' + this.oauthToken,
        'X-API-Key': this.apiKey,
      },
    }
  }

  /**
   * Calls the api for passed in options and parses into JSON response;
   */
  async callApi(options) {
    const url = new URL(`https://www.bungie.net/Platform${options.path}`)
    if (options.components) {
      url.searchParams.set('components', options.components.join(','))
    }
    console.log('CALL: ' + url)
    let resp
    try {
      resp = await fetch(url, this.addApiKeyToHeader(options.headers))
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

  async getPostGameCarnageReport(id) {
    const url = new URL(
      `https://stats.bungie.net/Platform/Destiny2/Stats/PostGameCarnageReport/${id}/`
    )
    console.log('CALL: ' + url)
    let resp
    try {
      resp = await fetch(
        url,
        this.addApiKeyToHeader({ 'Content-Type': 'application/json' })
      )
      // console.log(Object.keys(resp), await resp.text(), url)
    } catch (e) {
      console.error(`Failed to call bungie platform api ${e}`)
      throw e
    }
    if (resp.status === 401) {
      console.error(
        'Unauthorized from Bungie API. Check to make sure credentials are updated.'
      )
    } else if (!resp.ok) {
      throw new Error(
        `Test: \n\n${Object.entries(resp.headers)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n\n')}\n`
      )
      // throw new BungieAPIError(resp.url, resp.headers)
    }
    return resp.json()
  }
}
