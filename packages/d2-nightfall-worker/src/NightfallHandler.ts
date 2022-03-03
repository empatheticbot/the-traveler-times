import { NightfallRewardPairs } from './NightfallRewards'

const startingDate = new Date('March 1, 2022 17:00:00 GMT')

export function getCurrentNightfallRewardHashes() {
  const today = new Date()
  const daysFromStart = Math.floor(
    (today.valueOf() - startingDate.valueOf()) / (1000 * 60 * 60 * 24 * 7)
  )

  const index = daysFromStart % NightfallRewardPairs.length
  return NightfallRewardPairs[index]
}

export function getGrandmasterAvailability(
  seasonOverrides: SeasonOverrides
): boolean {
  const grandmasterStartDateString = seasonOverrides?.grandmasterStartDate
  if (!grandmasterStartDateString) {
    return false
  }
  const today = new Date()
  const grandmasterStartDate = new Date(grandmasterStartDateString)
  return today.valueOf() > grandmasterStartDate.valueOf()
}

export function getIsGrandmasterStartWeek(seasonOverrides: SeasonOverrides) {
  const isGrandmasterAvailable = getGrandmasterAvailability(seasonOverrides)
  if (!isGrandmasterAvailable) {
    return false
  }
  const grandmasterStartDate = new Date(seasonOverrides.grandMasterStartDate)
  const today = new Date()
  today.setDate(today.getDate() - 7)
  return today.valueOf() < grandmasterStartDate.valueOf()
}

export function getModifiersOrderedByDifficulty(activities) {
  const modifierGroups = []
  const allMods = []
  activities.forEach((activity) => {
    const nameArray = activity.displayProperties.name.split(' ')
    const name = nameArray[nameArray.length - 1]
    activity.modifiers.forEach((modifier) => {
      // We want to exclude the specific mode modifiers as they are redundant
      if (modifier.displayProperties.name.includes(name)) {
        return
      }
      if (allMods.indexOf(modifier.hash) < 0) {
        modifierGroups.push({
          ...modifier,
          name,
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
