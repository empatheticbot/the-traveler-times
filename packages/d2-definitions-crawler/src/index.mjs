export { Destiny2DefinitionsDurableObject } from './D2DefinitionsDurableObject.mjs'

async function handleDefintionFetch(request, env) {
  try {
    const id = env.D2_DEFINITIONS_OBJECT.idFromName('definition-durable-object')
    const stub = env.D2_DEFINITIONS_OBJECT.get(id)
    const response = await stub.fetch(request)
    if (request.method) {
      return response
    }
  } catch (e) {
    if (request.method) {
      return new Response(e.message)
    }
  }
}

export default {
  async fetch(request, env) {
    return await handleDefintionFetch(request, env)
  },
  async scheduled(event, env) {
    return await handleDefintionFetch({}, env)
  },
}
