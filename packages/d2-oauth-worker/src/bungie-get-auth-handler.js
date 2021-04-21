export async function bungieGetAuthHandler(request, env) {
  console.log(env.BUNGIE_API)
  const clientId = await env.BUNGIE_API.get('CLIENT_ID')
  console.log(clientId)
  const url = new URL('https://www.bungie.net/en/OAuth/Authorize')
  url.searchParams.append('client_id', clientId)
  url.searchParams.append('response_type', 'code')
  try {
    return Response.redirect(url, 302)
  } catch (e) {
    console.error(e.message)
  }
}
