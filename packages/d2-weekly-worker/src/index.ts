import { isAuthorized } from '@the-traveler-times/utils'
import {
	DefinitionHandler,
	// VendorHandler,
	PublicMilestoneHandler,
	Hashes,
	getStrippedItem,
	dateUtilities,
} from '@the-traveler-times/bungie-api-gateway'

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
		const inventoryItems = await fetch(r)
		const json = await inventoryItems.json()
		return json.definitions
	} catch (e) {
		console.log(e)
	}
}

export default {
	async fetch(request: Request, env: CloudflareEnvironment) {
		if (!isAuthorized(request, env)) {
			return new Response('Unauthorized', { status: 401 })
		}
		const definitionHandler = new DefinitionHandler()
		await definitionHandler.init(env.BUNGIE_API)
		const publicMilestoneHandler = new PublicMilestoneHandler()
		await publicMilestoneHandler.init(env.BUNGIE_API)

		try {
			const nextWeeklyReset = dateUtilities.getNextWeeklyReset()
			const nextWeekendReset = dateUtilities.getNextWeekendReset()
			const lastWeeklyReset = dateUtilities.getLastWeeklyReset()
			const lastWeekendReset = dateUtilities.getLastWeekendReset()

			let ironBannerMilestone
			try {
				ironBannerMilestone =
					await publicMilestoneHandler.getPublicMilestoneByHash(
						Hashes.IRON_BANNER
					)
			} catch (e) {
				console.log('Iron Banner not available.')
			}

			let ironBanner
			if (ironBannerMilestone) {
				const ironBannerGametypeHashes =
					await publicMilestoneHandler.getIronBannerGametype()
				console.log(ironBannerGametypeHashes)
				const ironBannerGametypes =
					await definitionHandler.getActivityModifiers(
						...ironBannerGametypeHashes
					)
				const ironBannerDefinition = await definitionHandler.getMilestone(
					ironBannerMilestone.milestoneHash
				)
				const ironBannerRewards = await getInventoryItems(
					[
						94729174, // Gunnora's Axe
						540880995, // Dark Decider
						62937067, // Jorum's Claw
						2909905776, // The Hero's Burden
						1141547457, // Frontier's Cry
						2961807684, // The Wizened Rebuke
						308332265, // Roar of the Bear
						1796949035, // Razor's Edge
						334859415, // Allied Demand

						// 829330711, // Peacebond
						// 1076810832, // Forge's Pledge
						// 108221785, // Riiswalker
						// 701922966, // Finite Impactor
						// 852551895, // Occluded Finality
						// 1967303408 // Archon's Thunder
					],
					env,
					request
				)

				const awardsStripped = await Promise.all(
					ironBannerRewards.map(async (weapon) => {
						const damageType = await definitionHandler.getDamageType(
							weapon.defaultDamageTypeHash
						)
						weapon.damageType = damageType

						return {
							...weapon,
							...getStrippedItem(weapon),
						}
					})
				)

				ironBanner = {
					isAvailable: true,
					gametype: ironBannerGametypes[0],
					rewards: awardsStripped,
					startDate: lastWeeklyReset,
					endDate: nextWeeklyReset,
					...ironBannerDefinition,
					...ironBannerMilestone,
				}
			} else {
				ironBanner = { isAvailable: false }
			}

			let dawningMilestone: any
			// TODO: Remove comment to enable dawning
			// try {
			// 	dawningMilestone =
			// 		await publicMilestoneHandler.getPublicMilestoneByHash(
			// 			Hashes.DAWNING
			// 		)
			// } catch (e) {
			// 	console.log('Dawning not available.')
			// }

			let dawning
			if (dawningMilestone) {
				const milestone = await definitionHandler.getMilestone(
					dawningMilestone.milestoneHash
				)
				// const activities = await definitionHandler.getActivities(
				// 	...dawningMilestone.activities.map(
				// 		(activity) => activity.activityHash
				// 	)
				// )
				const rewards = await getInventoryItems(['2812100428'], env, request)

				dawning = {
					...dawningMilestone,
					...milestone,
					image: '/assets/dawning-2022.png',
					rewards,
					isAvailable: true,
					// activities,
				}
			} else {
				dawning = {
					isAvailable: false,
				}
			}

			let guardianGamesMilestone
			// try {
			// 	guardianGamesMilestone =
			// 		await publicMilestoneHandler.getPublicMilestoneByHash(
			// 			Hashes.GUARDIAN_GAMES
			// 		)
			// } catch (e) {
			// 	console.log('Guardian Games not available.')
			// }
			console.log(guardianGamesMilestone)
			let guardianGames
			if (guardianGamesMilestone) {
				const milestone = await definitionHandler.getMilestone(
					guardianGamesMilestone.milestoneHash
				)
				console.log(milestone)
				let activities = await definitionHandler.getActivities(
					...(guardianGamesMilestone.activities?.map(
						(activity) => activity.activityHash
					) ?? [])
				)
				const rewards = await getInventoryItems([3785032442], env, request)

				guardianGames = {
					...guardianGamesMilestone,
					...milestone,
					image: '/assets/guardian-games-2022.png',
					rewards,
					isAvailable: true,
					activities,
				}
			} else {
				guardianGames = {
					isAvailable: false,
				}
			}

			let solsticeMilestone
			try {
				solsticeMilestone =
					await publicMilestoneHandler.getPublicMilestoneByHash(Hashes.SOLSTICE)
			} catch (e) {
				console.log('Solstice not available.')
			}

			// let solstice
			// if (solsticeMilestone) {
			// 	const milestone = await definitionHandler.getMilestone(
			// 		solsticeMilestone.milestoneHash
			// 	)
			// 	const activities = await definitionHandler.getActivities(
			// 		...solsticeMilestone.activities.map(
			// 			(activity) => activity.activityHash
			// 		)
			// 	)
			// 	const rewards = await getInventoryItems(
			// 		['3600498390', '1800094035'],
			// 		env,
			// 		request
			// 	)
			// 	solstice = {
			// 		...solsticeMilestone,
			// 		...milestone,
			// 		image: activities[0].pgcrImage,
			// 		rewards,
			// 		isAvailable: true,
			// 		activities,
			// 	}
			// } else {
			// 	solstice = {
			// 		isAvailable: false,
			// 	}
			// }

			// let wellspringMilestone =
			// 	await publicMilestoneHandler.getPublicMilestoneByHash(Hashes.WELLSPRING)

			// let wellspring
			// if (wellspringMilestone) {
			// 	const activities = await definitionHandler.getActivities(
			// 		...wellspringMilestone.activities.map(
			// 			(activity) => activity.activityHash
			// 		)
			// 	)

			// 	const rewardHashes = activities.map((activity) => {
			// 		const rewards = activity.rewards.map((reward) =>
			// 			reward.rewardItems.map((item) => item.itemHash)
			// 		)
			// 		return rewards.flat()
			// 	})

			// 	const wellspringRewards = await getInventoryItems(
			// 		rewardHashes.flat(),
			// 		env,
			// 		request
			// 	)
			// 	const wellspringFetchedRewards = await Promise.all(
			// 		wellspringRewards.map(async (item) => {
			// 			return {
			// 				...item,
			// 				...getStrippedItem(item),
			// 			}
			// 		})
			// 	)
			// 	wellspring = {
			// 		...wellspringMilestone,
			// 		startDate: dateUtilities.getCurrentDailyResetStartDate(),
			// 		endDate: dateUtilities.getCurrentDailyResetEndDate(),
			// 		activities,
			// 		rewards: wellspringFetchedRewards,
			// 		isAvailable: true,
			// 	}
			// } else {
			// 	wellspring = {
			// 		isAvailable: false,
			// 	}
			// }

			const doubleRankHashes = await publicMilestoneHandler.getDoubleRank()
			const doubleRanks = await definitionHandler.getActivityModifiers(
				...doubleRankHashes
			)

			return new Response(
				JSON.stringify({
					nextWeeklyReset,
					lastWeeklyReset,
					nextWeekendReset,
					lastWeekendReset,
					ironBanner,
					wellspring: { isAvailable: false },
					guardianGames,
					solstice: { isAvailable: false },
					dawning,
					doubleRanks,
					isAvailable: true,
				}),
				{
					status: 200,
				}
			)
		} catch (e) {
			return new Response(
				JSON.stringify({ isAvailable: false, error: e.message, stack: e.stack })
			)
		}
	},
}
