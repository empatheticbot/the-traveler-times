import { NightfallRewardPairs, NightfallStrikeReward } from './NightfallRewards'

const startingDate = new Date('May 24, 2022 17:00:00 GMT')

export function getCurrentNightfallRewardHashes() {
	const today = new Date()
	const daysFromStart = Math.floor(
		(today.valueOf() - startingDate.valueOf()) / (1000 * 60 * 60 * 24 * 7)
	)

	const index = daysFromStart % NightfallRewardPairs.length
	return NightfallRewardPairs[index]
}

export function getStrikeReward(strikeName: string) {
	return NightfallStrikeReward[strikeName] || []
}

export function getGrandmasterAvailability(
	seasonOverrides: SeasonOverrides
): boolean {
	const grandmasterStartDateString = seasonOverrides?.grandmasterStartDate
	console.log(grandmasterStartDateString)
	if (!grandmasterStartDateString) {
		return false
	}
	const today = new Date()
	console.log(today)
	const grandmasterStartDate = new Date(grandmasterStartDateString)
	return today.valueOf() > grandmasterStartDate.valueOf()
}

export function getIsGrandmasterStartWeek(seasonOverrides: SeasonOverrides) {
	const isGrandmasterAvailable = getGrandmasterAvailability(seasonOverrides)
	const grandmasterStartDateString = seasonOverrides?.grandmasterStartDate
	if (!isGrandmasterAvailable || !grandmasterStartDateString) {
		return false
	}
	const grandmasterStartDate = new Date(grandmasterStartDateString)
	const today = new Date()
	today.setDate(today.getDate() - 7)
	return today.valueOf() < grandmasterStartDate.valueOf()
}

export function getModifiersOrderedByDifficulty(activities) {
	const modifierGroups = []
	const allMods = []
	activities.forEach((activity) => {
		const groupArray = activity.displayProperties.name.split(' ')
		const group = groupArray[groupArray.length - 1]
		activity.expandedModifiers.all.forEach((modifier) => {
			// We want to exclude the specific mode modifiers as they are redundant
			if (modifier.name.includes(group)) {
				return
			}
			if (allMods.indexOf(modifier.hash) < 0) {
				modifierGroups.push({
					...modifier,
					group,
					isReusedInOtherDifficulties: false,
				})
				allMods.push(modifier.hash)
			} else {
				const index = allMods.indexOf(modifier.hash)
				modifierGroups[index] = {
					...modifierGroups[index],
					isReusedInOtherDifficulties: true,
				}
			}
		})
	})

	return modifierGroups
}
