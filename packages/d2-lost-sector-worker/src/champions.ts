export const championMobModifiers: number[] = [
  3531595760, // Champion Mob
  // '2687456355', // Champions: Cabal
  // '1930311099', // Champions: Vex
  // '3495411183', // Champions: Taken
  // '2834348323', // Champions: Mob
  // '2055950944', // Champions: Fallen
  // '3605663348', // Champions: Hive
  2078602635, // Champions: All
]

export const championFoesModifiers: number[] = [
  3649753063, // Champion Foes
  3392797826, // Champion Foes
  3462015812, // Champion Foes
]

export function getIgnoredModifiers() {
  return championFoesModifiers
}

const championTypes: { [index: string]: number } = {
  'Shield-Piercing': 3674284440,
  Disruption: 2631129878,
  Stagger: 1619309025,
}

function parseModifierDescription(description: string): number[] {
  const championRegex = /(?<=\[).+?(?=\])/g
  const types = [...description.matchAll(championRegex)]
  return types
    .map((type) => championTypes[type[0]])
    .filter((hash) => hash !== undefined)
}

export function getChampionModifiersHashes(modifiers: Modifier[]): number[] {
  let championModifiers: number[] = []
  const foesModifiers = modifiers.filter((modifier) =>
    championFoesModifiers.includes(modifier.hash)
  )

  const mobModifiers = modifiers.filter((modifier) =>
    championMobModifiers.includes(modifier.hash)
  )

  if (foesModifiers.length > 0) {
    championModifiers = championModifiers.concat(
      parseModifierDescription(foesModifiers[0].displayProperties.description)
    )
  }

  if (mobModifiers.length > 0) {
    championModifiers.push(mobModifiers[0].hash)
  }

  return championModifiers
}
