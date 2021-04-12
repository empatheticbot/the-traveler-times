class BungieAPIError extends Error {
  constructor(url, ...args) {
    const fullMessage = `Occurred during call to the endpoint: ${url}`
    super(fullMessage, ...args)
    this.message = fullMessage
    this.name = 'Bungie API failed'
  }
}

module.exports = BungieAPIError
