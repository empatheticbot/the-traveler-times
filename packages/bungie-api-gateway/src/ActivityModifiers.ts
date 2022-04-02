export interface SimplifiedModifier {
  name: string
  icon: string
  description: string
  hash: number
}

export const modifierIgnoreList = [
  2095017004, // Blank modifier, probably Bungie bug 🤷‍♀️
  2226420346, // Blank modifier, probably Bungie bug 🤷‍♀️
  1783825372, // Blank modifier, probably Bungie bug 🤷‍♀️
  782039530, // Blank modifier, probably Bungie bug 🤷‍♀️
  2821775453, // Master Modifiers
  1441935103, // Master Modifiers
  3788294071, // Master Modifiers
  2301442403, // Legend Modifiers
  1697524957, // Legend Modifiers
  2779568867, // Hero Modifiers
  2495891735, // Grandmaster Modifiers
  437179856, // Grandmaster Modifiers
]

export const shieldModifiers = [
  1626706410, // Shielded Foes
  2016159242, // Shielded Foes
  1208695820, // Shielded Foes
  3047797310, // Shielded Foes
  1612795492, // Shielded Foes
  2177381508, // Shielded Foes
  3168340598, // Shielded Foes
  1651706850, // Shielded Foes
  2288210988, // Shielded Foes
  3538098588, // Shielded Foes
  720259466, // Shielded Foes
  1553093202, // Shielded Foes
  2965677044, // Shielded Foes
]

export const commonModifiers = [
  939324719, // Equipment Locked
  1406852142, // Equipment Locked
  1598842522, // Equipment Locked
  3859784314, // Match Game
  657164207, // Match Game
  2751349583, // Match Game
  376634891, // Limited Revives
  356012132, // Limited Revives
  2778077469, // Limited Revives
  203094476, // Limited Revives
]

export const championMobModifiers: number[] = [
  3531595760, // Champion Mob
  97112028, // Champion Mob
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
  4120443819, // Champion Foes
  4280142965, // Champion Foes
  1537847744, // Champion Foes
  1072191636, // Champion Foes
  40182179, // Champion Foes
  3307318061, // Champion Foes
  197794292, // Champion Foes
]

function parseBracketedString(text: string) {
  const regex = /(?<=\[).+?(?=\])/g
  const matches = [...text.matchAll(regex)]
  return matches.map((value) => value[0])
}

function getShieldTypeHashes(modifier: Modifier): number[] {
  const shieldTypes: { [index: string]: number } = {
    Void: 3454344768,
    Solar: 1847026933,
    Arc: 2303181850,
    Stasis: 151347233,
  }
  if (modifier?.displayProperties?.description) {
    const shields = parseBracketedString(modifier.displayProperties.description)
    return shields
      .map((shield) => shieldTypes[shield])
      .filter((hash) => hash !== undefined)
  }
  return []
}

export function getShieldModifiersHashes(modifiers: Modifier[]): number[] {
  let shieldModHashes: number[] = []
  const shieldModifiers = modifiers.filter(isShieldsModifier)

  for (const shieldMod of shieldModifiers) {
    shieldModHashes = shieldModHashes.concat(getShieldTypeHashes(shieldMod))
  }

  return [...new Set(shieldModHashes)]
}

function getChampionTypeHashes(modifier: Modifier): number[] {
  const championTypes: { [index: string]: number } = {
    'Shield-Piercing': 1974619026,
    Disruption: 1201462052,
    Stagger: 4218937993,
  }
  if (modifier?.displayProperties?.description) {
    const champions = parseBracketedString(
      modifier.displayProperties.description
    )
    console.log(modifier?.displayProperties?.description, champions.toString())
    return champions
      .map((champion) => championTypes[champion])
      .filter((hash) => hash !== undefined)
  }
  return []
}

export function getChampionModifiersHashes(modifiers: Modifier[]): number[] {
  let championModifiers: number[] = []
  const foesModifiers = modifiers.filter((modifier) =>
    championFoesModifiers.includes(modifier.hash)
  )

  const mobModifiers = modifiers.filter((modifier) =>
    championMobModifiers.includes(modifier.hash)
  )

  for (const foeMod of foesModifiers) {
    championModifiers = championModifiers.concat(getChampionTypeHashes(foeMod))
  }

  for (const mobMod of mobModifiers) {
    championModifiers.push(mobMod.hash)
  }

  return [...new Set(championModifiers)]
}

export function isDamageModifier(modifier: Modifier) {
  console.log('des ', modifier.displayProperties.description)
  return modifier.displayProperties.description.includes('+50%')
}

export function isChampionModifier(modifier: Modifier) {
  return (
    championFoesModifiers.includes(modifier.hash) ||
    championMobModifiers.includes(modifier.hash)
  )
}

export function isCommonModifier(modifier: Modifier) {
  return commonModifiers.includes(modifier.hash)
}

export function isIgnoredModifier(modifier: Modifier) {
  return modifierIgnoreList.includes(modifier.hash)
}

export function isMiscModifier(modifier: Modifier) {
  return !(
    isChampionModifier(modifier) ||
    isDamageModifier(modifier) ||
    isCommonModifier(modifier) ||
    isShieldsModifier(modifier) ||
    isIgnoredModifier(modifier)
  )
}

export function isShieldsModifier(modifier: Modifier) {
  return shieldModifiers.includes(modifier.hash)
}

export function sortChampionModifiers(
  a: SimplifiedModifier,
  b: SimplifiedModifier
) {
  console.log('name ', a.name, b.name)
  if (a?.name?.includes('Mob')) {
    return 1
  }
  if (b?.name?.includes('Mob')) {
    return -1
  }
  return a.name > b.name ? 1 : -1
}

export function getCleanedModifier(modifier: Modifier): SimplifiedModifier {
  return {
    name: modifier?.displayProperties?.name,
    icon: modifier?.displayProperties?.icon,
    description: modifier?.displayProperties?.description,
    hash: modifier?.hash,
  }
}
