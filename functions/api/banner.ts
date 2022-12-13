const BANNER_WARNING = 'BANNER_WARNING'

export async function onRequestGet({ env }) {
  let message = '<aside>'
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
      message += `<p>We are experinecing some technical issues. Information may not be up to date.</p>`
    }
  } catch (e) {
    console.error(e)
  }
  try {
    const warning = await env.LiveData.get(BANNER_WARNING)
    if (warning) {
      message += warning
    }
  } catch (e) {
    return new Response(JSON.stringify({ message: e.message }), { status: 500 })
  }
  message += '</aside>'
  return new Response(JSON.stringify({ message }))

}
