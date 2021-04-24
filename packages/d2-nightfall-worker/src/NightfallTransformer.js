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
