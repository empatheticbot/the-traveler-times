import { BungieAPIHandler } from '@the-traveler-times/bungie-api-gateway'
import { chunkArray } from '@the-traveler-times/utils'

const blacklist = ['DestinyInventoryItemDefinition']

export class Destiny2DefinitionsDurableObject {
  constructor(state, env) {
    this.state = state
    this.env = env
  }

  // async initialize() {
  //   let stored = await this.state.storage.get('value')
  //   this.value = stored || 0
  // }

  async fetch() {
    const definitionWorkerUrl = await this.env.DESTINY_2_DEFINITIONS.get(
      'DEFINITION_WORKER_URL'
    )

    const apiKey = await this.env.BUNGIE_API.get('KEY')
    const oauthToken = await this.env.BUNGIE_API.get('OAUTH_TOKEN')
    const membershipId = await this.env.BUNGIE_API.get('MEMBERSHIP_ID')
    const membershipType = await this.env.BUNGIE_API.get('MEMBERSHIP_TYPE')
    const characterId = await this.env.BUNGIE_API.get('CHARACTER_ID')

    const bungieAPIHandler = new BungieAPIHandler({
      apiKey,
      oauthToken,
      membershipId,
      membershipType,
      characterId,
    })

    const manifest = await bungieAPIHandler.getManifest()
    const definitionsObject = { ...manifest.jsonWorldComponentContentPaths.en }

    const definitions = Object.entries(definitionsObject).reduce(
      (arr, pair) => {
        const [definition, url] = pair
        if (blacklist.includes(definition)) {
          return arr
        }
        arr.push({ definition, url })
        return arr
      },
      []
    )
    console.log(definitions.length)

    const chunkedDefinitions = chunkArray(definitions, 5)
    const definitionRequests = []
    for (const defs of chunkedDefinitions) {
      definitionRequests.push(
        fetch(definitionWorkerUrl, {
          method: 'POST',
          headers: {
            'content-type': 'application/json;charset=utf-8',
          },
          body: JSON.stringify({ definitions: defs }),
        }).then(res => res.json())
      )
    }

    const response = await Promise.all(definitionRequests)

    const flattenedResponse = response.reduce((acc, value) => {
      return [...acc, ...value.definitions]
    }, [])
    return new Response(
      JSON.stringify({
        definitions: flattenedResponse,
        resultLength: flattenedResponse.length,
        inputLength: definitions.length,
        response: response,
      }),
      {
        status: 200,
        'content-type': 'application/json;charset=utf-8',
      }
    )
  }

  // Handle HTTP requests from clients.
  // async fetch(request) {
  //   // Make sure we're fully initialized from storage.
  //   if (!this.initializePromise) {
  //     this.initializePromise = this.initialize().catch(err => {
  //       // If anything throws during initialization then we need to be
  //       // sure sure that a future request will retry initialize().
  //       // Note that the concurrency involved in resetting this shared
  //       // promise on an error can be tricky to get right -- we don't
  //       // recommend customizing it.
  //       this.initializePromise = undefined
  //       throw err
  //     })
  //   }
  //   await this.initializePromise

  //   // Apply requested action.
  //   let url = new URL(request.url)
  //   let currentValue = this.value
  //   switch (url.pathname) {
  //     case '/increment':
  //       currentValue = ++this.value
  //       await this.state.storage.put('value', this.value)
  //       break
  //     case '/decrement':
  //       currentValue = --this.value
  //       await this.state.storage.put('value', this.value)
  //       break
  //     case '/':
  //       // Just serve the current value. No storage calls needed!
  //       break
  //     default:
  //       return new Response('Not found', { status: 404 })
  //   }
  // }
}
