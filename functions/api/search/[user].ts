import { BungieAPIHandler } from '@the-traveler-times/bungie-api-gateway'

export async function onRequestGet({ params, env }) {
  const bungieAPIHandler = new BungieAPIHandler()
  await bungieAPIHandler.init(env.BungieAPI)

  const userResponse = await bungieAPIHandler.getUsersFromSearch(params.user)

  return new Response(JSON.stringify(userResponse))
}
