export default class BungieAPIError extends Error {
  status?: number
  response?: Response

  constructor(response: Response) {
    const fullMessage = `Error occurred during call to the endpoint: ${
      response.url
    } \n ${response.statusText} \n ${response.status} \n ${Object.keys(
      response
    ).join(', ')}`
    super(fullMessage)
    this.message = fullMessage
    this.name = 'Bungie API failed'
    this.status = response.status
    this.response = response
  }
}

export enum BungieErrorStatus {
  DestinyPGCRNotFound = 'DestinyPGCRNotFound',
  DestinySystemDisabled = 'SystemDisabled',
}
