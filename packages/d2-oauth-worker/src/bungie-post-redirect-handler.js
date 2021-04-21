export async function bungieRedirectHandler(request, env) {
  try {
    const clientId = await env.BUNGIE_API.get('CLIENT_ID')
    const clientSecret = await env.BUNGIE_API.get('CLIENT_SECRET')

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    const auth = btoa(`${clientId}:${clientSecret}`)
    const response = await fetch(
      'https://www.bungie.net/platform/app/oauth/token/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: `grant_type=authorization_code&client_id=${clientId}&code=${code}`,
      },
    )

    const result = await response.json()
    const headers = {
      'Access-Control-Allow-Origin': '*',
    }

    if (result.error) {
      return new Response(JSON.stringify(result), {
        status: 401,
        headers,
      })
    }

    await env.BUNGIE_API.put('REFRESH_TOKEN', result.refresh_token)
    await env.BUNGIE_API.put('OAUTH_TOKEN', result.access_token)
    await env.BUNGIE_API.put(
      'REFRESH_TOKEN_EXPIRATION',
      result.refresh_expires_in,
    )

    return new Response('Successfully updated tokens!', {
      status: 201,
      headers,
    })
  } catch (error) {
    console.error(error)
    return new Response(error.message, {
      status: 500,
      headers,
    })
  }
}
