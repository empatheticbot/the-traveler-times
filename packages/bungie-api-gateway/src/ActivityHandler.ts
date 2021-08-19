import DefinitionHandler from './DefinitionHandler'

export default class ActivityHandler {
  async init(bungieApiEnv, definitionEnv) {
    this.definitionHandler = new DefinitionHandler()
    await this.definitionHandler.init(bungieApiEnv, definitionEnv)
  }

  async getActivities(activities) {
    const defActivities = await this.definitionHandler.getActivities(
      ...activities.map((activity) => activity.activityHash)
    )
    return Promise.all(
      activities.map(async (activity, index) => {
        const modifiers = await this.getActivityModifiers(activity)
        return { ...defActivities[index], ...activity, modifiers }
      })
    )
  }

  async getActivityModifiers(activity) {
    return this.definitionHandler.getActivityModifiers(
      ...activity.modifierHashes
    )
  }
}
