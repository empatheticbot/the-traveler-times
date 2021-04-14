const blacklist = ['DestinyInventoryItemDefinition']

export class Destiny2DefinitionsDurableObject {
  constructor(state, env) {
    this.state = state
  }

  async initialize() {
    let stored = await this.state.storage.get('value')
    this.value = stored || 0
  }

  // Handle HTTP requests from clients.
  async fetch(request) {
    // Make sure we're fully initialized from storage.
    if (!this.initializePromise) {
      this.initializePromise = this.initialize().catch(err => {
        // If anything throws during initialization then we need to be
        // sure sure that a future request will retry initialize().
        // Note that the concurrency involved in resetting this shared
        // promise on an error can be tricky to get right -- we don't
        // recommend customizing it.
        this.initializePromise = undefined
        throw err
      })
    }
    await this.initializePromise

    // Apply requested action.
    let url = new URL(request.url)
    let currentValue = this.value
    switch (url.pathname) {
      case '/increment':
        currentValue = ++this.value
        await this.state.storage.put('value', this.value)
        break
      case '/decrement':
        currentValue = --this.value
        await this.state.storage.put('value', this.value)
        break
      case '/':
        // Just serve the current value. No storage calls needed!
        break
      default:
        return new Response('Not found', { status: 404 })
    }
  }
}
