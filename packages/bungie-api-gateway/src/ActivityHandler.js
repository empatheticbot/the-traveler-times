import DefinitionHandler from './DefinitionHandler'

export default class ActivityHandler {
  async init(bungieApiEnv, definitionEnv) {
    this.activityHandler = new DefinitionHandler()
    await this.activityHandler.init(
      bungieApiEnv,
      definitionEnv,
      'DestinyActivityDefinition'
    )
    this.modifierHandler = new DefinitionHandler()
    await this.modifierHandler.init(
      bungieApiEnv,
      definitionEnv,
      'DestinyActivityModifierDefinition'
    )
  }

  async getActivity(activity) {
    const fetchedActivity = await this.activityHandler.getItemByHash(
      activity.activityHash
    )
    const modifiers = await this.getActivityModifiers(fetchedActivity)

    return { ...fetchedActivity, modifiers }
  }

  async getActivities(activities) {
    return Promise.all(activities.map((activity) => this.getActivity(activity)))
  }

  async getActivityModifiers(activity) {
    return Promise.all(
      activity.modifiers.map((modifier) => this.getActivityModifier(modifier))
    )
  }

  async getActivityModifier(modifier) {
    return this.modifierHandler.getItemByHash(modifier.activityModifierHash)
  }
}
