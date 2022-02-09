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

function shouldDeleteDeployment(deployment: { created_on: string }): boolean {
  const deploymentDate = new Date(deployment.created_on)
  const hour = deploymentDate.getUTCHours()
  return hour !== 17
}

async function getDeployments(
  env,
  page = 1,
  perPage = 10,
  sortOrder = 'asc',
  sortBy = 'created_on'
) {
  const account_id = env.ACCOUNT_ID
  const pages_id = env.PAGES_ID
  const init = {
    'content-type': 'application/json;charset=UTF-8',
    headers: {
      'X-Auth-Key': env.SECRET_AUTH_KEY,
      'X-Auth-Email': env.SECRET_AUTH_EMAIL,
    },
  }
  const url = new URL(
    `https://api.cloudflare.com/client/v4/accounts/${account_id}/pages/projects/${pages_id}/deployments`
  )
  url.searchParams.set('page', page.toString())
  url.searchParams.set('sort_by', sortBy)
  url.searchParams.set('sort_order', sortOrder)
  url.searchParams.set('per_page', perPage.toString())
  const response = await fetch(url.toString(), init)
  if (response.ok) {
    const data = await response.json()
    return data.result
  }
  return []
}

async function deleteDeploy(env, id) {
  const account_id = env.ACCOUNT_ID
  const pages_id = env.PAGES_ID
  const init = {
    'content-type': 'application/json;charset=UTF-8',
    method: 'DELETE',
    headers: {
      'X-Auth-Key': env.SECRET_AUTH_KEY,
      'X-Auth-Email': env.SECRET_AUTH_EMAIL,
    },
  }
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account_id}/pages/projects/${pages_id}/deployments/${id}`,
    init
  )
  if (response.ok) {
    const data = await response.json()
    console.log(id, ': ', data.success, data.errors)
    return data
  }
  console.log(id, 'failed', response.ok, response.status)
}

async function cleanUpOldDeployments(env) {
  const deployments = await getDeployments(env)
  deployments.shift()
  const filteredDeployments = deployments.filter(
    (deployment: { created_on: string }) => shouldDeleteDeployment(deployment)
  )
  for (const deployment of filteredDeployments) {
    deleteDeploy(env, deployment.id)
  }
}

export default {
  async fetch(request, env) {
    if (!isAuthorized(request, env)) {
      return new Response('Unauthorized', { status: 401 })
    }
    await cleanUpOldDeployments(env)
    return buildTravelerTimesWebsite(request, env)
  },
  async scheduled(event, env) {
    cleanUpOldDeployments(env)
    return buildTravelerTimesWebsite(null, env)
  },
}
