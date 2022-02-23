const BANNER = '$BANNER'

export async function onRequestGet({ env }) {
  const banner = await env.LiveData.get(BANNER, { type: 'json' })
  return new Response(JSON.stringify(banner))
}
