export default class BungieAPIError extends Error {
  constructor(response: Response) {
    const fullMessage = `Error occurred during call to the endpoint: ${
      response.url
    } \n ${response.statusText} \n ${response.status} \n ${Object.keys(
      response
    ).join(', ')}`
    super(fullMessage)
    this.message = fullMessage
    this.name = 'Bungie API failed'
  }
}

export enum BungieErrorStatus {
  DestinyPGCRNotFound = 'DestinyPGCRNotFound',
}
