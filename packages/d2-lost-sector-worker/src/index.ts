import { isAuthorized } from '@the-traveler-times/utils'
import {
  DefinitionHandler,
  dateUtilities,
} from '@the-traveler-times/bungie-api-gateway'

import { getCurrentLostSectorHashes } from './LostSectorHandler'
import { getChampionModifiersHashes, getIgnoredModifiers } from './champions'

const modifierIgnoreList = [
  2095017004, // Blank, probably Bungie bug
  2226420346, // Blank, probably Bungie bug
  939324719, // Equipment Locked
  1406852142, // Equipment Locked
  3859784314, // Match Game
  657164207, // Match Game
  2821775453, // Master Modifiers
  1441935103, // Master Modifiers
  2301442403, // Legend Modifiers
  376634891, // Limited Revives
  356012132, // Limited Revives
  1626706410, // Shielded Foes
  2016159242, // Shielded Foes
  1208695820, // Shielded Foes
  3047797310, // Shielded Foes
  1612795492, // Shielded Foes
]

const commonModifiers = [
  '939324719', // Equipment Locked
  '1406852142', // Equipment Locked
  '3859784314', // Match Game
  '657164207', // Match Game
  '376634891', // Limited Revives
  '356012132', // Limited Revives
]

const modifierDetailsMap = {
  'Arc Burn': {
    damageType: 'arc',
    primaryInformation: '+50% Arc damage',
    secondaryInformation: 'dealt & recieved.',
  },
  'Void Burn': {
    damageType: 'void',
    primaryInformation: '+50% Void damage',
    secondaryInformation: 'dealt & recieved.',
  },
  'Solar Burn': {
    damageType: 'solar',
    primaryInformation: '+50% Solar damage',
    secondaryInformation: 'dealt & recieved.',
  },
}

function getShieldTypeHashes(description: string): string[] {
  const shieldTypes = {
    Void: 3454344768,
    Solar: 1847026933,
    Arc: 2303181850,
    Stasis: 151347233,
  }
  const descriptionStrings = description.split('\n\n')
  const shieldDescriptionString = descriptionStrings.find((item) =>
    item.includes('Shields:')
  )
  const shieldRegex = /(?<=\[).+?(?=\])/g
  if (shieldDescriptionString) {
    const shields = [...shieldDescriptionString.matchAll(shieldRegex)]
    return shields.map((value) => shieldTypes[value[0]])
  }
  return []
}

// function getChampionModifiers(description: string): string[] {
//   const championTypes = {
//     'Shield-Piercing': '605585258',
//     Disruption: '882588556',
//     Stagger: '3933343183',
//   }
//   const descriptionStrings = description.split('\n\n')
//   const championDescriptionString = descriptionStrings.find((item) =>
//     item.includes('Champions:')
//   )
//   const championRegex = /(?<=\[).+?(?=\])/g
//   if (championDescriptionString) {
//     const champions = [...championDescriptionString.matchAll(championRegex)]
//     return champions.map((value) => championTypes[value[0]])
//   }
//   return []
// }

function getModifiersOfInterest(modifiers: Modifier[]) {
  const ignoredModifiers = [...getIgnoredModifiers(), ...modifierIgnoreList]
  const modifiersOfInterest = modifiers.filter(
    (modifier) => !ignoredModifiers.includes(modifier.hash)
  )

  const champions = modifiersOfInterest
    .filter((modifier) => modifier.displayProperties.name.includes('Champion'))
    .map((modifier) => ({
      name: modifier.displayProperties.name.replace('Champions: ', ''),
      icon: modifier.displayProperties.icon,
      description: modifier.displayProperties.description,
      hash: modifier.hash,
    }))
    .sort((a, b) => {
      if (a.name.includes('Mob')) {
        return 1
      }
      if (b.name.includes('Mob')) {
        return -1
      }
      return a.name > b.name ? 1 : -1
    })

  const damage = modifiers
    .filter((modifier) =>
      modifier.displayProperties.description.includes('+50%')
    )
    .map((modifier) => ({
      ...modifierDetailsMap[modifier.displayProperties.name],
      name: modifier.displayProperties.name,
      icon: modifier.displayProperties.icon,
      description: modifier.displayProperties.description,
      hash: modifier.hash,
    }))

  const misc = modifiersOfInterest
    .filter(
      (modifier) =>
        !(
          modifier.displayProperties.name.includes('Champions') ||
          modifier.displayProperties.description.includes('+50%') ||
          commonModifiers.includes(modifier.hash)
        )
    )
    .map((modifier) => ({
      name: modifier.displayProperties.name,
      icon: modifier.displayProperties.icon,
      description: modifier.displayProperties.description,
      hash: modifier.hash,
    }))

  const common = modifiers
    .filter((modifier) => commonModifiers.includes(modifier.hash))
    .map((modifier) => ({
      name: modifier.displayProperties.name,
      icon: modifier.displayProperties.icon,
      description: modifier.displayProperties.description,
      hash: modifier.hash,
    }))

  return {
    damage,
    misc,
    common,
    champions,
  }
}

async function getLostSectorData(
  lostSector,
  definitionHandler: DefinitionHandler
) {
  const activity = await definitionHandler.getActivity(lostSector.hash)

  const modifiers = await definitionHandler.getActivityModifiers(
    ...activity.modifiers.map((modifier) => modifier.activityModifierHash)
  )

  const championHashes = getChampionModifiersHashes(modifiers)
  const champions = await definitionHandler.getActivityModifiers(
    ...championHashes
  )

  const uniqueModifiers = {}
  for (const modifier of [...modifiers, ...champions]) {
    if (modifier?.hash) {
      uniqueModifiers[modifier.hash] = modifier
    }
  }

  const modifiersOfInterest = getModifiersOfInterest(
    Object.values(uniqueModifiers)
  )

  const destination = await definitionHandler.getDestination(
    activity.destinationHash
  )

  const shieldHashes = getShieldTypeHashes(
    activity.displayProperties.description
  )
  const shieldsTypes = await definitionHandler.getAllDamageTypes()
  const shields = shieldHashes.map((hash) => {
    const type = shieldsTypes[hash]
    return {
      description: `Enemies have ${type.displayProperties.name} shields.`,
      name: type.displayProperties.name,
      hash: type.hash,
      icon: type.displayProperties.icon,
    }
  })

  let rewards = []
  if (lostSector.rewards) {
    rewards = await Promise.all(
      lostSector.rewards.map((reward) =>
        definitionHandler.getInventoryItem(reward.hash)
      )
    )
  }

  return {
    ...lostSector,
    ...activity,
    modifiers,
    modifiersOfInterest,
    rewards,
    shields,
    champions,
    destination,
  }
}

export default {
  async fetch(request: Request, env: CloudflareEnvironment) {
    if (!isAuthorized(request, env)) {
      return new Response('Unauthorized', { status: 401 })
    }

    try {
      const lostSectors = getCurrentLostSectorHashes()

      const definitionHandler = new DefinitionHandler()
      await definitionHandler.init(env.BUNGIE_API)

      const legend = await getLostSectorData(
        lostSectors.legend,
        definitionHandler
      )
      const master = await getLostSectorData(
        lostSectors.master,
        definitionHandler
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
        JSON.stringify({ isAvailable: false, error: e.message }),
        {
          status: 500,
        }
      )
    }
  },
}
