const BANNER_WARNING = 'BANNER_WARNING'

export async function onRequestGet({ env }) {
  try {
    const warning = await env.LiveData.get(BANNER_WARNING)
    return new Response(JSON.stringify({ warning }))
  } catch (e) {
    return new Response(JSON.stringify({ message: e.message }), { status: 500 })
  }
}
