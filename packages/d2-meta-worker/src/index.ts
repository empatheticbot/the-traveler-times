import {
	DefinitionHandler,
	getStrippedItem,
} from '@the-traveler-times/bungie-api-gateway'
import { chunkArray, isAuthorized } from '@the-traveler-times/utils'

export { D2PostGameCarnageReportObject } from './D2PostGameCarnageReportObject'

const CALL_EVERY_ID = '$CALL_EVERY'
const LAST_ACTIVITY_ID = '$CURRENT_ACTIVITY_ID'
const NEW_ACTIVITY_ID = '$NEW_ACTIVITY_ID'
const META_DAYS_INCLUDED = '$META_DAYS_INCLUDED'

async function getInventoryItems(hashes, env, request) {
	const url = new URL(
		'https://the-traveler-times.netlify.app/.netlify/functions/definitions'
	)
	url.searchParams.append('definitionType', 'DestinyInventoryItemDefinition')
	// for (const hash of hashes.slice(0, 50)) {
	// 	url.searchParams.append('definitionIds', hash)
	// }
	// console.log({ definitionIds: hashes })
	try {
		const inventoryItems = await fetch(url, {
			headers: request.headers,
			method: 'post',
			body: JSON.stringify({ definitionIds: hashes }),
		})
		const data = await inventoryItems.json()
		return data.definitions
	} catch (e) {
		console.log(e)
	}
}

async function getPGCRDurableObject(env: CloudflareEnvironment) {
	let id = env.PGCR_DURABLE_OBJECT.idFromName('PGCR_DURABLE_OBJECT')
	let stub = await env.PGCR_DURABLE_OBJECT.get(id)
	return stub
}

async function getFirstActivityId(
	env: CloudflareEnvironment
): Promise<number | undefined> {
	let newActivityId = await env.DESTINY_2_CRUCIBLE_META.get(NEW_ACTIVITY_ID)
	if (newActivityId) {
		await env.DESTINY_2_CRUCIBLE_META.delete(NEW_ACTIVITY_ID)
		return parseInt(newActivityId)
	}

	let lastActivityId = await env.DESTINY_2_CRUCIBLE_META.get(LAST_ACTIVITY_ID)
	if (lastActivityId) {
		return parseInt(lastActivityId) + 1
	}
}

async function setLastUsedActivityId(
	env: CloudflareEnvironment,
	results: unknown,
	activityId: number
): Promise<number> {
	const latestActivityFinished = results.find(
		(result) => result.isCaughtUpToLatestMatch
	)
	let latestId = activityId
	if (latestActivityFinished) {
		latestId = latestActivityFinished.lastId
	} else if (results.length > 0) {
		latestId = results[results.length - 1].lastId
	}

	await env.DESTINY_2_CRUCIBLE_META.put(LAST_ACTIVITY_ID, latestId.toString())
	return latestId
}

async function parsePGCRResults(env: CloudflareEnvironment, results: unknown) {
	const dates = {}
	const weaponData = results
		//Filter out later activities to avoid double counting on next run
		.filter((activity) => !activity.isCaughtUpToLatestMatch)
		.map((activity) => activity.weaponData)
		.flat()

	const mappedResults = weaponData.reduce((acc, value) => {
		if (!value || !value.period) {
			return {}
		}
		const dateString = value.period.split('T')[0]

		let currentDateData = acc[dateString] || {}
		let dateWeaponData = currentDateData[value.id]
		if (dateWeaponData) {
			dateWeaponData = {
				kills: dateWeaponData.kills + value.kills,
				precisionKills: dateWeaponData.precisionKills + value.precisionKills,
				usage: dateWeaponData.usage + 1,
				id: value.id,
				period: dateString,
			}
		} else {
			dateWeaponData = {
				kills: value.kills,
				precisionKills: value.precisionKills,
				usage: 1,
				id: value.id,
				period: dateString,
			}
		}
		currentDateData[dateWeaponData.id] = dateWeaponData
		acc[dateString] = currentDateData
		return acc
	}, {})

	for (const [date, data] of Object.entries(mappedResults)) {
		const storedData = await env.DESTINY_2_CRUCIBLE_META.get(date, 'json')
		if (storedData) {
			for (const [id, weaponData] of Object.entries(data)) {
				const d = storedData[id]
				if (d) {
					let mergedData = {
						kills: d.kills + weaponData.kills,
						precisionKills: d.precisionKills + weaponData.precisionKills,
						usage: d.usage + weaponData.usage,
						id: d.id,
					}
					storedData[id] = mergedData
				} else {
					storedData[id] = weaponData
				}
			}
			dates[date] = storedData
		} else {
			dates[date] = data
		}
	}
	return {
		weaponData,
		dates,
	}
}

async function getMeta(
	date = new Date(),
	numberOfDaysToIncludeInMeta: number,
	definitionHandler,
	env: CloudflareEnvironment,
	request
) {
	const dates = []
	for (let i = 0; i < numberOfDaysToIncludeInMeta; i++) {
		const workingDate = date
		date.setDate(workingDate.getDate() - i)
		const currentPeriodKey = workingDate.toISOString().split('T')[0]
		dates.push(currentPeriodKey)
	}
	const weaponData = await Promise.all(
		dates.map(async (date) => {
			const data = await env.DESTINY_2_CRUCIBLE_META.get(date, 'json')
			return data
		})
	)
	let completeUsage = {}
	let totalKills = 0
	let totalPrecisionKills = 0
	let totalUsage = 0
	weaponData.forEach((data) => {
		if (!data) {
			return
		}
		Object.values(data).forEach((weapon) => {
			totalKills += weapon.kills
			totalPrecisionKills += weapon.precisionKills
			totalUsage += weapon.usage
			const current = completeUsage[weapon.id]
			if (current) {
				completeUsage[weapon.id] = {
					...current,
					kills: weapon.kills + current.kills,
					precisionKills: weapon.precisionKills + current.precisionKills,
					usage: weapon.usage + current.usage,
				}
			} else {
				completeUsage[weapon.id] = weapon
			}
		})
	})
	const allWeapons = Object.values(completeUsage)
	const weaponIds = allWeapons.map((weapon) => weapon.id)
	const chunkedIds = chunkArray(weaponIds, 300)
	const weaponIdRequests = await Promise.all(
		chunkedIds.map((chunk) => getInventoryItems(chunk, env, request))
	)
	const weaponDetails = weaponIdRequests.flat()
	// const weaponDetails = await getInventoryItems(weaponIds, env, request)
	const allWeaponsWithDetails = await Promise.all(
		allWeapons.map(async (weapon, index) => {
			const details = weaponDetails[index]
			// console.log(details)
			const damageType = await definitionHandler.getDamageType(
				details.defaultDamageTypeHash
			)
			details.damageType = damageType

			return {
				...weapon,
				...getStrippedItem(details),
			}
		})
	)
	return {
		weapons: allWeaponsWithDetails,
		totalUsage,
		totalKills,
		totalPrecisionKills,
	}
}

async function getCurrentMeta(request: Request, env: CloudflareEnvironment) {
	const numberOfDaysToIncludeInMeta = parseInt(
		(await env.DESTINY_2_CRUCIBLE_META.get(META_DAYS_INCLUDED)) || '4'
	)
	const definitionHandler = new DefinitionHandler()
	await definitionHandler.init(env.BUNGIE_API)
	const currentMeta = await getMeta(
		new Date(),
		numberOfDaysToIncludeInMeta,
		definitionHandler,
		env,
		request
	)
	const weekAgo = new Date()
	weekAgo.setDate(weekAgo.getDate() - 7)
	const lastWeekMeta = await getMeta(
		weekAgo,
		numberOfDaysToIncludeInMeta,
		definitionHandler,
		env,
		request
	)

	return {
		...currentMeta,
		lastWeekMeta,
	}
}

async function updateMetaStats(env: CloudflareEnvironment) {
	let durableObject = await getPGCRDurableObject(env)
	let callEvery = await env.DESTINY_2_CRUCIBLE_META.get(CALL_EVERY_ID)
	let activityId = await getFirstActivityId(env)
	if (!activityId) {
		throw new Error(
			`KV value ${LAST_ACTIVITY_ID} is undefined and required to parse PGCR for the meta.`
		)
	}
	if (!callEvery) {
		throw new Error(
			`KV value ${CALL_EVERY_ID} is undefined and required to parse PGCR for the meta.`
		)
	}
	let url = new URL('https://d2-meta-worker.empatheticbot.workers.dev/')
	url.searchParams.set('activityId', activityId.toString())
	url.searchParams.set('every', callEvery.toString())
	console.log(`Calling durable object: 
    Activity ID: ${activityId}
    Call Every: ${callEvery}
  `)
	let response = await durableObject.fetch(url)
	if (response.ok) {
		const data = await response.json()
		const okResults = data.results.filter((result) => result.ok)
		const { dates } = await parsePGCRResults(env, okResults)
		for (const [date, weaponData] of Object.entries(dates)) {
			await env.DESTINY_2_CRUCIBLE_META.put(date, JSON.stringify(weaponData))
		}
		const lastId = await setLastUsedActivityId(env, okResults, activityId)

		return {
			firstActivityId: activityId,
			lastActivityId: lastId,
			dates,
			results: data.results,
		}
	}
	const contents = await response.json()
	throw new Error(contents.error)
}

export default {
	async fetch(request: Request, env: CloudflareEnvironment) {
		if (!isAuthorized(request, env)) {
			return new Response('Unauthorized', { status: 401 })
		}

		let url = new URL(request.url)

		switch (url.pathname) {
			case '/meta': {
				try {
					const meta = await getCurrentMeta(request, env)
					const isAvailable = meta.weapons.length > 0
					return new Response(JSON.stringify({ ...meta, isAvailable }))
				} catch (e) {
					return new Response(
						JSON.stringify({ error: e.message, isAvailable: false }),
						{
							status: 500,
						}
					)
				}
			}
			default: {
				const meta = await updateMetaStats(env)
				return new Response(JSON.stringify(meta))
			}
		}
	},
	scheduled(event: ScheduledEvent, env: CloudflareEnvironment) {
		return updateMetaStats(env)
	},
}
