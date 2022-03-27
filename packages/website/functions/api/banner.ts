const BANNER_WARNING = 'BANNER_WARNING'
const LAST_BUILD = 'LAST_BUILD'

export async function onRequestGet({ env }) {
  let message = ''
  try {
    const warning = await env.LiveData.get(BANNER_WARNING)
    const lastBuild = await env.LiveData.get(LAST_BUILD, 'json')
    console.log(env, lastBuild, warning)
    if (lastBuild?.status === 'failed') {
      message += `<p>${lastBuild.message}</p>`
    }
    if (warning) {
      message += warning
    }
    return new Response(JSON.stringify({ message }))
  } catch (e) {
    console.log(e)
    return new Response(JSON.stringify({ message: e.message }), { status: 500 })
  }
}
