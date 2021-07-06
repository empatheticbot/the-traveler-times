async function buildTravelerTimesWebsite(request, env) {
  const account_id = env.ACCOUNT_ID
  const pages_id = env.PAGES_ID
  const init = {
    method: 'POST',
    headers: {
      'X-Auth-Key': env.SECRET_AUTH_KEY,
      'X-Auth-Email': env.SECRET_AUTH_EMAIL,
    },
  }
  return fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account_id}/pages/projects/${pages_id}/deployments`,
    init,
  )
}

export default {
  async fetch(request, env) {
    return buildTravelerTimesWebsite(request, env)
  },
  async scheduled(event, env) {
    return buildTravelerTimesWebsite(null, env)
  },
}
