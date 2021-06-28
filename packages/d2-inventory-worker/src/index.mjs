import { BungieAPIHandler } from '@the-traveler-times/bungie-api-gateway'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const hashes = url.searchParams.getAll('hashes')
    const bungieAPIHandler = new BungieAPIHandler()
    await bungieAPIHandler.init(env.BUNGIE_API)

    const manifest = await bungieAPIHandler.getManifest()
    const definitionURLs = { ...manifest.jsonWorldComponentContentPaths.en }
    const definitionURL = definitionURLs.DestinyInventoryItemDefinition
    const date = new Date()
    let items
    try {
      items = await bungieAPIHandler.callBungieNet({ path: definitionURL })
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: `The Bungie API request for item definitions failed. ${e}`,
        }),
        {
          headers: {
            'content-type': 'application/json;charset=UTF-8',
            status: 500,
          },
        },
      )
    }

    const selectedItems = hashes.map((hash) => items[hash])
    if (selectedItems) {
      return new Response(JSON.stringify({ items: selectedItems, hashes }), {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
          status: 200,
        },
      })
    }
    return new Response(JSON.stringify({ items }), {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
        status: 200,
      },
    })
    //     for (const [key, value] of Object.entries(items)) {
    //       try {
    //         await env.DESTINY_2_ITEM_DEFINITIONS.put(key, JSON.stringify(value), {
    //           metadata: { date },
    //         })
    //       } catch (e) {
    //         return new Response(
    //           JSON.stringify({
    //             error: `A put for item definitions to the KV store failed. ${e}`,
    //           }),
    //           {
    //             headers: {
    //               'content-type': 'application/json;charset=UTF-8',
    //               status: 500,
    //             },
    //           },
    //         )
    //       }
    //     }
    //
    //     return new Response(
    //       JSON.stringify({ message: 'Successfully updaetd all items.' }),
    //       {
    //         headers: {
    //           'content-type': 'application/json;charset=UTF-8',
    //           status: 200,
    //         },
    //       },
    //     )
  },
}
