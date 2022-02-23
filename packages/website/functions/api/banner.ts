const BANNER = '$BANNER'

export async function onRequestGet({ env }) {
  try {
    const banner = await env.LiveData.get(BANNER, { type: 'json' })
    return new Response(JSON.stringify(banner))
  } catch (e) {
    return new Response(JSON.stringify({ message: e.message }), { status: 500 })
  }
}
