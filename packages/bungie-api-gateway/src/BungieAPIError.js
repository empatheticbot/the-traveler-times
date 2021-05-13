class BungieAPIError extends Error {
  constructor(response, ...args) {
    const fullMessage = `Error occurred during call to the endpoint: ${
      response.url
    } \n ${response.statusText} \n ${response.status} \n ${Object.keys(
      response
    ).join(', ')}`
    super(fullMessage, ...args)
    this.message = fullMessage
    this.name = 'Bungie API failed'
  }
}

module.exports = BungieAPIError
