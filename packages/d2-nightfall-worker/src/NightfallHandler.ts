import { NightfallRewardPairs } from './NightfallRewards'

const startingDate = new Date('August 24, 2021 17:00:00 GMT')
const grandMasterStartDate = new Date('October 3, 2021 17:00:00 GMT')

export function getCurrentNightfallRewardHashes() {
  const today = new Date()
  const daysFromStart = Math.floor(
    (today.valueOf() - startingDate.valueOf()) / (1000 * 60 * 60 * 24 * 7)
  )

  const index = daysFromStart % NightfallRewardPairs.length
  return NightfallRewardPairs[index]
}

export function getGrandmasterAvailability(): boolean {
  const today = new Date()
  return today.valueOf() > grandMasterStartDate.valueOf()
}

export function getModifiersOrderedByDifficulty(activities) {
  const modifierGroups = []
  const allMods = []
  activities.forEach((activity) => {
    const nameArray = activity.displayProperties.name.split(' ')
    const name = nameArray[nameArray.length - 1]
    activity.modifiers.forEach((modifier) => {
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
