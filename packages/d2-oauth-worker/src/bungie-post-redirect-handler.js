export async function bungieRedirectHandler(request, env) {
  try {
    const clientId = await env.BUNGIE_API.get('CLIENT_ID')
    const clientSecret = await env.BUNGIE_API.get('CLIENT_SECRET')
    console.log('redirect handler')

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    const auth = btoa(`${clientId}:${clientSecret}`)
    console.log(auth)
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
    console.log(result.error)

    if (result.error) {
      return new Response(JSON.stringify(result), {
        status: 401,
        headers,
      })
    }

    for (const key in result) {
      console.log(key)
      await env.BUNGIE_API.put(key, result[key])
    }

    return new Response(JSON.stringify(result), {
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
