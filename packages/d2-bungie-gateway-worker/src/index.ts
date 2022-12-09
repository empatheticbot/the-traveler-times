import { Router } from 'itty-router'

import { isAuthorized } from '@the-traveler-times/utils'
import DefinitionHandler from './DefinitionHandler'

async function getDefinitions(request: unknown, env: CloudflareEnvironment) {
	const url = new URL(request.url)
	const definitionType: BungieD2Definition | null = request.params[
		'definitionType'
	] as BungieD2Definition
	const definitionIds = url.searchParams.getAll('definitionIds')
	console.log(definitionIds)
	if (!definitionType) {
		return new Response('`definitionType` query parameter is required.', {
			status: 400,
		})
	}

	const definitionHandler = new DefinitionHandler()
	await definitionHandler.init(env.BUNGIE_API)

	const allDefinitions = await definitionHandler.getDefinitions(definitionType)
	const requestedDefinitions =
		definitionIds.length > 0
			? definitionIds.map((hash: string) => allDefinitions[hash])
			: allDefinitions

	const body = JSON.stringify(requestedDefinitions)
	const headers = { 'Content-type': 'application/json' }
	return new Response(body, { headers })
}

const router = Router()

router
	.get('/definition/:definitionType', getDefinitions)
	.get('*', () => new Response('Not found', { status: 404 }))

export default {
	async fetch(request: Request, env: CloudflareEnvironment) {
		if (!isAuthorized(request, env)) {
			return new Response('Unauthorized', { status: 401 })
		}

		return router.handle(request, env)
	},
}
