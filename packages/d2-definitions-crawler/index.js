export default {
  async fetch(request, env) {
    return new Response('Hello worker!', {
      headers: { 'content-type': 'text/plain' },
    })
  },
}
