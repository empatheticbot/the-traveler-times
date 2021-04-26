import DefinitionHandler from './DefinitionHandler'

export default class ActivityHandler {
  async init(bungieApiEnv, definitionEnv) {
    this.definitionHandler = new DefinitionHandler()
    await this.definitionHandler.init(bungieApiEnv, definitionEnv)
  }

  async getActivity(activity) {
    const fetchedActivity = await this.definitionHandler.getActivities(
      activity.activityHash
    )
    console.log(fetchedActivity)
    const modifiers = await this.getActivityModifiers(fetchedActivity)

    return { ...fetchedActivity, modifiers }
  }

  async getActivities(activities) {
    const activityHashes = activities.map((activity) => activity.activityHash)
    const fetchedActivities = await this.definitionHandler.getActivities(
      ...activityHashes
    )
    const modifiers = await this.getActivityModifiers(fetchedActivity)

    return Promise.all(activities.map((activity) => this.getActivity(activity)))
  }

  async getActivityModifiers(activity) {
    console.log('am' + Object.keys(activity))
    const modifierHashes = activity.modifiers.map(
      (modifier) => modifier.activityModifierHash
    )

    return this.definitionHandler.getActivityModifiers(...modifierHashes)
  }

  async getActivityModifier(modifier) {
    return this.definitionHandler.getActivityModifiers(
      modifier.activityModifierHash
    )
  }
}
