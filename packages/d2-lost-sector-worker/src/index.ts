import { isAuthorized } from '@the-traveler-times/utils'
import {
	ActivityHandler,
	dateUtilities,
} from '@the-traveler-times/bungie-api-gateway'

import { getCurrentLostSectorHashes } from './LostSectorHandler'

async function getInventoryItems(hashes, env, request) {
	const url = new URL(
		'https://the-traveler-times.netlify.app/.netlify/functions/definitions'
	)
	url.searchParams.append('definitionType', 'DestinyInventoryItemDefinition')
	for (const hash of hashes) {
		url.searchParams.append('definitionIds', hash)
	}
	console.log(url.toString())
	const r = new Request(url, { headers: request.headers })
	try {
		const response = await fetch(r)
		const data = await response.json()
		return data.definitions
	} catch (e) {
		console.log(e)
	}
}

async function getLostSectorData(
	lostSector,
	activityHandler: ActivityHandler,
	env,
	request,
	overrides: { pgcrImage?: string } = {}
) {
	const activity = await activityHandler.getActivityByHash(lostSector.hash)
	let rewards = []
	if (lostSector.rewards) {
		rewards = await getInventoryItems(
			lostSector.rewards.map((reward) => reward.hash),
			env,
			request
		)
	}
	return {
		...lostSector,
		...activity,
		...overrides,
		rewards,
	}
}

export default {
	async fetch(request: Request, env: CloudflareEnvironment) {
		if (!isAuthorized(request, env)) {
			return new Response('Unauthorized', { status: 401 })
		}

		try {
			const lostSectors = getCurrentLostSectorHashes()

			const activityHandler = new ActivityHandler()
			await activityHandler.init(env.BUNGIE_API)

			const legend = await getLostSectorData(
				lostSectors.legend,
				activityHandler,
				env,
				request,
				lostSectors.overrides
			)
			const master = await getLostSectorData(
				lostSectors.master,
				activityHandler,
				env,
				request,
				lostSectors.overrides
			)

			return new Response(
				JSON.stringify({
					isAvailable: true,
					master,
					legend,
					startDate: dateUtilities.getCurrentDailyResetStartDate(),
					refreshDate: dateUtilities.getCurrentDailyResetEndDate(),
				}),
				{
					status: 200,
				}
			)
		} catch (e) {
			return new Response(
				JSON.stringify({
					isAvailable: false,
					error: e.message,
					stack: e.stack,
				}),
				{
					status: 500,
				}
			)
		}
	},
}
