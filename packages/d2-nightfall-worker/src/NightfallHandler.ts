const startingDate = new Date('July 27, 2021 17:00:00 GMT')

const rewards = [
  ['2147010335', '1481892490', '3836861464'],
  ['534775659'],
  ['681067419'],
  ['852228780'],
  ['2443900757'],
  ['1866778462'],
]

export function getCurrentNightfallRewardHashes() {
  const today = new Date()
  const daysFromStart = Math.floor(
    (today.valueOf() - startingDate.valueOf()) / (1000 * 60 * 60 * 24 * 7)
  )

  const index = daysFromStart % rewards.length
  return rewards[index]
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
