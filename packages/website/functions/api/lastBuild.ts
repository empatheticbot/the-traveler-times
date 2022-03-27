const LAST_BUILD = 'LAST_BUILD'

export async function onRequestGet({ env }) {
  try {
    const lastBuild = await env.LiveData.get(LAST_BUILD)
    return new Response(JSON.stringify(lastBuild))
  } catch (e) {
    return new Response(JSON.stringify({ message: e.message }), { status: 500 })
  }
}
