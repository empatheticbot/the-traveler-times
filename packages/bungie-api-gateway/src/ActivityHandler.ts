import DefinitionHandler from './DefinitionHandler'
import {
  isCommonModifier,
  isDamageModifier,
  isMiscModifier,
  getCleanedModifier,
  sortChampionModifiers,
  SimplifiedModifier,
  getChampionModifiersHashes,
  getShieldModifiersHashes,
} from './ActivityModifiers'

export default class ActivityHandler {
  definitionHandler: DefinitionHandler

  constructor() {
    this.getActivity = this.getActivity.bind(this)
    this.getActivities = this.getActivities.bind(this)
    this.getActivityByHash = this.getActivityByHash.bind(this)
    this.getActivitiesByHash = this.getActivitiesByHash.bind(this)
    this.definitionHandler = new DefinitionHandler()
  }

  async init(bungieApiEnv: KVNamespace) {
    await this.definitionHandler.init(bungieApiEnv)
  }

  async getActivity(activity) {
    const defActivity = await this.definitionHandler.getActivity(
      activity.activityHash
    )

    const modifiers = await this.getActiveActivityModifiers(activity)

    const allModifiers = await this.getAllActivityModifiers(defActivity)
    const destination = await this.definitionHandler.getDestination(
      defActivity.destinationHash
    )
    return {
      ...defActivity,
      ...activity,
      expandedModifiers: await this.getCleanedModifiers(
        modifiers || allModifiers
      ),
      modifiers,
      allModifiers,
      destination,
    }
  }

  async getActivities(activities) {
    return Promise.all(activities.map(this.getActivity))
  }

  async getActivityByHash(hash: number) {
    return this.getActivity({ activityHash: hash })
  }

  async getActivitiesByHash(...hashes: number[]) {
    return this.getActivities(hashes.map(this.getActivityByHash))
  }

  async getAllActivityModifiers(activity) {
    if (activity.modifiers) {
      return this.definitionHandler.getActivityModifiers(
        ...activity.modifiers.map((modifier) => modifier.activityModifierHash)
      )
    }
    return null
  }

  async getActiveActivityModifiers(activity) {
    if (activity.modifierHashes) {
      return this.definitionHandler.getActivityModifiers(
        ...activity.modifierHashes
      )
    }
    return null
  }

  async getCleanedModifiers(modifiers: Modifier[]): Promise<{
    damage: SimplifiedModifier[]
    misc: SimplifiedModifier[]
    common: SimplifiedModifier[]
    champions: SimplifiedModifier[]
    shields: SimplifiedModifier[]
    all: SimplifiedModifier[]
  }> {
    const damage = modifiers.filter(isDamageModifier).map(getCleanedModifier)
    const misc = modifiers.filter(isMiscModifier).map(getCleanedModifier)
    const common = modifiers.filter(isCommonModifier).map(getCleanedModifier)

    const championRemappedHashes = getChampionModifiersHashes(modifiers)
    const championMods = await this.definitionHandler.getActivityModifiers(
      ...championRemappedHashes
    )
    const champions = championMods
      .map(getCleanedModifier)
      .sort(sortChampionModifiers)

    const shieldRemappedHashes = getShieldModifiersHashes(modifiers)
    const shieldsTypes: { [index: number]: Modifier } =
      (await this.definitionHandler.getAllDamageTypes()) as {
        [index: number]: Modifier
      }
    const shields = shieldRemappedHashes.map((hash) => {
      const type = shieldsTypes[hash]
      return {
        description: `Enemies have ${type.displayProperties.name} shields.`,
        name: type.displayProperties.name,
        hash: type.hash,
        icon: type.displayProperties.icon,
      }
    })

    return {
      damage,
      misc,
      common,
      champions,
      shields,
      all: [...champions, ...damage, ...shields, ...misc, ...common],
    }
  }
}
