import DefinitionHandler from './DefinitionHandler'

export default class ActivityHandler {
  async init(bungieApiEnv, definitionEnv) {
    this.definitionHandler = new DefinitionHandler()
    await this.definitionHandler.init(bungieApiEnv, definitionEnv)
  }

  async getActivity(activity) {
    const fetchedActivities = await this.definitionHandler.getActivities(
      activity.activityHash
    )
    console.log(fetchedActivities)
    const fetchedActivity = fetchedActivities[0]
    console.log(fetchedActivity)
    const modifiers = await this.getActivityModifiers(fetchedActivity)
    console.log('mmod  ::', modifiers)

    return { ...fetchedActivity, modifiers }
  }

  async getActivities(activities) {
    console.log('act: ', activities)
    return Promise.all(activities.map((activity) => this.getActivity(activity)))
  }

  async getActivityModifiers(activity) {
    console.log('am' + activity)
    const modifierHashes = activity.modifiers.map(
      (modifier) => modifier.activityModifierHash
    )
    return this.definitionHandler.getActivityModifiers(...modifierHashes)
  }

  async getActivityModifier(modifier) {
    const modifiers = this.definitionHandler.getActivityModifiers(
      modifier.activityModifierHash
    )
    return modifiers[0]
  }
}
