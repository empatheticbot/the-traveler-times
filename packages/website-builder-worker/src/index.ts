import { isAuthorized } from '@the-traveler-times/utils'

async function buildTravelerTimesWebsite(env: CloudflareEnvironment) {
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

function shouldDeleteDeployment(deployment: CloudflareDeployment): boolean {
  const isDeploymentSuccessful = isSuccessfulProductionDeploy(deployment)
  const deploymentDate = new Date(deployment.created_on)
  const hour = deploymentDate.getUTCHours()
  return hour !== 17 || !isDeploymentSuccessful
}

function isSuccessfulProductionDeploy(
  deployment: CloudflareDeployment
): boolean {
  const isInProduction = deployment.environment === 'production'
  const isLatestStageDeployment = deployment.latest_stage.name === 'deploy'
  const isLatestStageFinished = deployment.latest_stage.status === 'success'
  return isInProduction && isLatestStageDeployment && isLatestStageFinished
}

async function getDeployments(
  env: CloudflareEnvironment,
  page = 1,
  perPage = 15,
  sortOrder = 'asc',
  sortBy = 'created_on'
): Promise<CloudflareDeployment[]> {
  const account_id = env.ACCOUNT_ID
  const pages_id = env.PAGES_ID
  const init = {
    headers: {
      'X-Auth-Key': env.SECRET_AUTH_KEY,
      'X-Auth-Email': env.SECRET_AUTH_EMAIL,
    },
  }
  const url = new URL(
    `https://api.cloudflare.com/client/v4/accounts/${account_id}/pages/projects/${pages_id}/deployments`
  )
  url.searchParams.set('page', page.toString())
  url.searchParams.set('per_page', perPage.toString())
  const response = await fetch(url.toString(), init)
  if (response.ok) {
    const data: { result: unknown } = await response.json()
    return data.result as CloudflareDeployment[]
  }
  return []
}

async function deleteDeploy(env: CloudflareEnvironment, id: string) {
  const account_id = env.ACCOUNT_ID
  const pages_id = env.PAGES_ID
  const init = {
    method: 'DELETE',
    headers: {
      'X-Auth-Key': env.SECRET_AUTH_KEY,
      'X-Auth-Email': env.SECRET_AUTH_EMAIL,
    },
  }
  const response: Response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account_id}/pages/projects/${pages_id}/deployments/${id}`,
    init
  )
  if (response.ok) {
    const data: { success: String; errors: string } = await response.json()
    console.log(id, ': ', data.success, data.errors)
    return data
  }
  console.log(id, 'failed', response.ok, response.status)
}

async function cleanUpOldDeployments(
  env: CloudflareEnvironment,
  pageNumber: number
) {
  let hasSavedMostRecentSuccessfulBuild = pageNumber !== 1
  const deployments = await getDeployments(env, pageNumber)
  const toBeDeletedDeployments: CloudflareDeployment[] = []
  for (const deployment of deployments) {
    if (
      hasSavedMostRecentSuccessfulBuild &&
      shouldDeleteDeployment(deployment)
    ) {
      toBeDeletedDeployments.push(deployment)
    } else if (
      !hasSavedMostRecentSuccessfulBuild &&
      isSuccessfulProductionDeploy(deployment)
    ) {
      hasSavedMostRecentSuccessfulBuild = true
      continue
    }
  }
  const deletes = []
  for (const deployment of toBeDeletedDeployments) {
    deletes.push(deleteDeploy(env, deployment.id))
  }
  return Promise.all(deletes)
}

async function getBuildStatus(env: CloudflareEnvironment) {
  const deployments = await getDeployments(env, 1)
  const lastSuccessfulProductionDeploy = deployments.find((deployment) =>
    isSuccessfulProductionDeploy(deployment)
  )

  if (!lastSuccessfulProductionDeploy) {
    return new Response('No production builds found', { status: 401 })
  }

  const timeThreshold = new Date()
  timeThreshold.setMinutes(timeThreshold.getMinutes() - 90)
  const deploymentDate = new Date(lastSuccessfulProductionDeploy.modified_on)
  const isBuildStale = deploymentDate < timeThreshold
  return new Response(
    JSON.stringify({
      isBuildStale,
      date: lastSuccessfulProductionDeploy.modified_on,
      url: lastSuccessfulProductionDeploy.url,
      details: lastSuccessfulProductionDeploy.latest_stage,
    })
  )
}

export default {
  async fetch(request: Request, env: CloudflareEnvironment) {
    if (!isAuthorized(request, env)) {
      return new Response('Unauthorized', { status: 401 })
    }

    const url = new URL(request.url)
    if (url.pathname === '/buildStatus') {
      return getBuildStatus(env)
    }

    let pageNumber = 1
    while (pageNumber < 4) {
      await cleanUpOldDeployments(env, pageNumber)
      pageNumber += 1
    }
    return buildTravelerTimesWebsite(env)
  },
  async scheduled(event: Event, env: CloudflareEnvironment) {
    let pageNumber = 1
    while (pageNumber < 4) {
      await cleanUpOldDeployments(env, pageNumber)
      pageNumber += 1
    }
    return buildTravelerTimesWebsite(env)
  },
}
