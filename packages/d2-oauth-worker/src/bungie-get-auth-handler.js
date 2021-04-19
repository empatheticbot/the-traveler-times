export function bungieGetAuthHandler() {
  return new Response.redirect(
    `https://www.bungie.net/en/oauth/authorize?client_id=${BUNGIE_API.CLIENT_ID}&response_type=code`,
    302,
  )
}
