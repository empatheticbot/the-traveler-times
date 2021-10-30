import { DefinitionHandler } from '@the-traveler-times/bungie-api-gateway'
import { getCurrentLostSectorHashes } from './LostSectorHandler'
import { isAuthorized } from '@the-traveler-times/utils'

const modifierIgnoreList = [
  // '2687456355', // Champions: Cabal
  // '1930311099', // Champions: Vex
  // '3495411183', // Champions: Taken
  // '2834348323', // Champions: Mob
  // '2055950944', // Champions: Fallen
  // '3605663348', // Champions: Hive
  '2078602635', // Champions: All
  '939324719', // Equipment Locked
  '3859784314', // Match Game
  '2821775453', // Master Modifiers
  '2301442403', // Legend Modifiers
  '376634891', // Limited Revives
]

const commonModifiers = [
  '939324719', // Equipment Locked
  '3859784314', // Match Game
  '376634891', // Limited Revives
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

function getShieldTypes(description: string): string[] {
  const descriptionStrings = description.split('\n\n')
  const shieldDescriptionString = descriptionStrings.find((item) =>
    item.includes('Shields:')
  )
  const shieldRegex = /(?<=\[).+?(?=\])/g
  if (shieldDescriptionString) {
    const shields = [...shieldDescriptionString.matchAll(shieldRegex)]
    console.log(shields.toString(), shieldDescriptionString)

    return shields.map((value) => value[0])
  }
  return []
}

function getModifiersOfInterest(modifiers) {
  const modifiersOfInterest = modifiers.filter(
    (modifier) => !modifierIgnoreList.includes(modifier.hash.toString())
  )
  const champions = modifiers
    .filter((modifier) => modifier.displayProperties.name.includes('Champions'))
    .map((modifier) => ({
      name: modifier.displayProperties.name.replace('Champions: ', ''),
      icon: modifier.displayProperties.icon,
      description: modifier.displayProperties.description,
      hash: modifier.hash,
    }))

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
          commonModifiers.includes(modifier.hash.toString())
        )
    )
    .map((modifier) => ({
      name: modifier.displayProperties.name,
      icon: modifier.displayProperties.icon,
      description: modifier.displayProperties.description,
      hash: modifier.hash,
    }))

  const common = modifiers
    .filter((modifier) => commonModifiers.includes(modifier.hash.toString()))
    .map((modifier) => ({
      name: modifier.displayProperties.name,
      icon: modifier.displayProperties.icon,
      description: modifier.displayProperties.description,
      hash: modifier.hash,
    }))

  return {
    champions,
    damage,
    misc,
    common,
  }
}

async function getLostSectorData(lostSector, definitionHandler) {
  const activity = await definitionHandler.getActivity(lostSector.hash)
  const modifiers = await definitionHandler.getActivityModifiers(
    ...activity.modifiers.map((modifier) => modifier.activityModifierHash)
  )

  const modifiersOfInterest = getModifiersOfInterest(modifiers)

  const destination = await definitionHandler.getDestination(
    activity.destinationHash
  )

  const shields = getShieldTypes(activity.displayProperties.description)

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
    destination,
  }
}

export default {
  async fetch(request, env) {
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
