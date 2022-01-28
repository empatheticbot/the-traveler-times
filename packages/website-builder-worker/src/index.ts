import { isAuthorized } from '@the-traveler-times/utils'

async function buildTravelerTimesWebsite(request, env) {
  const account_id = env.ACCOUNT_ID
  const pages_id = env.PAGES_ID
  const init = {
    'content-type': 'application/json;charset=UTF-8',
    method: 'POST',
    headers: {
      'X-Auth-Key': env.SECRET_AUTH_KEY,
      'X-Auth-Email': env.SECRET_AUTH_EMAIL,
    },
  }
  return fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account_id}/pages/projects/${pages_id}/deployments`,
    init
  )
}

async function buildTravelerTimesWebsiteNetlify(env) {
  const netlifyBuildURL = env.NETLIFY_BUILD_URL
  return fetch(netlifyBuildURL, {
    method: 'POST',
  })
}

async function purgeWebsiteCache(env) {
  const zone_id = env.ZONE_ID

  const init = {
    'content-type': 'application/json;charset=UTF-8',
    method: 'POST',
    headers: {
      'X-Auth-Key': env.SECRET_AUTH_KEY,
      'X-Auth-Email': env.SECRET_AUTH_EMAIL,
    },
    body: JSON.stringify({
      purge_everything: true,
    }),
  }
  return fetch(
    `https://api.cloudflare.com/client/v4/zones/${zone_id}/purge_cache`,
    init
  )
}

export default {
  async fetch(request, env) {
    if (!isAuthorized(request, env)) {
      return new Response('Unauthorized', { status: 401 })
    }

    setTimeout(() => {
      purgeWebsiteCache(env)
    }, 1000 * 60 * 4)
    buildTravelerTimesWebsiteNetlify(env)
    return buildTravelerTimesWebsite(request, env)
  },
  async scheduled(event, env) {
    setTimeout(() => {
      purgeWebsiteCache(env)
    }, 1000 * 60 * 4)
    buildTravelerTimesWebsiteNetlify(env)
    return buildTravelerTimesWebsite(null, env)
  },
}
