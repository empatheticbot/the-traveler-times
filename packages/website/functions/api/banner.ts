const BANNER_WARNING = 'BANNER_WARNING'
const LAST_BUILD = 'LAST_BUILD'

export async function onRequestGet({ env }) {
  let message = ''
  try {
    const lastBuildResponse = await fetch(
      'https://website-builder-worker.empatheticbot.workers.dev/buildStatus',
      {
        headers: {
          'TTT-API-KEY': env.TTT_API_KEY,
        },
      }
    )
    const lastBuildData = await lastBuildResponse.json()
    if (lastBuildData.isBuildStale) {
      message += `<p>We are experiencing issues retrieving data from Bungie. Information on the page may be out of date.</p>`
    }
  } catch (e) {
    console.error(e)
  }
  try {
    const warning = await env.LiveData.get(BANNER_WARNING)
    if (warning) {
      message += warning
    }
    return new Response(JSON.stringify({ message }))
  } catch (e) {
    return new Response(JSON.stringify({ message: e.message }), { status: 500 })
  }
}
