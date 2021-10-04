export { D2PostGameCarnageReportAggregatorObject } from './D2PostGameCarnageReportAggregatorObject'

async function getPGCRAggregatorDurableObject(env: Environment) {
  let id = env.PGCR_AGGREGATOR_DURABLE_OBJECT.idFromName(
    'PGCR_AGGREGATOR_DURABLE_OBJECT'
  )
  let stub = await env.PGCR_AGGREGATOR_DURABLE_OBJECT.get(id)
  return stub
}

export default {
  async fetch(request: Request, env: Environment) {
    let durableObject = await getPGCRAggregatorDurableObject(env)

    let response = await durableObject.fetch(request)

    if (response.ok) {
      return response
    }
    const contents = await response.json()
    throw new Error(contents.error)
  },
}
