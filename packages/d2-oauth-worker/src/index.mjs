import { bungieGetAuthHandler } from './bungie-get-auth-handler'
import { bungieRedirectHandler } from './bungie-post-redirect-handler'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  console.log(
    'JavaScript HTTP trigger function processed a request.',
    req.method,
  )

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  if (request.method === 'GET') {
    return bungieGetAuthHandler()
  }

  if (request.method === 'POST') {
    return bungieRedirectHandler(request)
  }

  return new Response('Hello worker!', {
    headers: { 'content-type': 'text/plain' },
  })
}
