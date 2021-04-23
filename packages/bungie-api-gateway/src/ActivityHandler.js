import BungieAPIHandler from './BungieAPIHandler'

export default class ActivityHandler {
  async init(bungieApiEnv) {
    this.bungieAPIHandler = new BungieAPIHandler()
    await this.bungieAPIHandler.init(bungieApiEnv)
  }

  async fetchActivityFromApi(hash) {
    try {
      let activity = await this.getManifestDefinition(
        'DestinyActivityDefinition',
        hash
      )
      return activity.Response
    } catch (e) {
      console.error(`Failed to fetch activity data. ${e}`)
      return null
    }
  }

  async getActivityByHash(hash, definitionEnv) {
    return this.getActivitiesByHash([hash], definitionEnv)
  }

  async getActivitiesByHash(hashes, definitionEnv) {
    let allActivities = await definitionEnv.get('DestinyActivityDefinition', {
      type: 'json',
    })
    if (!allActivities) {
      throw new Error(
        'Could not find DestinyActivityDefinition in definitionEnv'
      )
    }
    return await Promise.all(
      hashes.map(async (hash) => {
        let activity = allActivities[hash]

        if (activity) {
          return activity
        }

        return fetchActivityFromApi(hash)
      })
    )

    // return

    // let modifiers

    // if (withModifiers) {
    //   modifiers = await this.getActivityModifiers(
    //     activityShell.modifierHashes || activity.modifiers,
    //     withModifiers
    //   )
    // }
    // return { ...activity, modifiers }
  }

  async getActivityModifier(hash) {
    let modifier = await getItemFromCache(hash)
    if (modifier === null) {
      try {
        modifier = await this.getManifestDefinition(
          'DestinyActivityModifierDefinition',
          hash
        )
      } catch (e) {
        console.error(`Failed to fetch activity modifier data. ${e}`)
        return null
      }
      modifier = modifier.Response
      let exp = await this.getWeeklyReset()
      await setItemInCache(hash, modifier, exp)
    }
    return modifier
  }

  // getActivityModifiers(modifiers = [], limit) {
  //   return Promise.all(
  //     modifiers.map((modifier, index) => {
  //       if (modifier.activityModifierHash && index < limit) {
  //         return this.getActivityModifier(modifier.activityModifierHash)
  //       } else if (
  //         typeof modifier === 'number' ||
  //         typeof modifier === 'string'
  //       ) {
  //         return this.getActivityModifier(modifier)
  //       }
  //       return Promise.resolve(modifier)
  //     })
  //   )
  // }

  // getActivities(activities = [], activityLimit = 5, withModifiers = 0) {
  //   return Promise.all(
  //     activities.map(async (activity, index) => {
  //       let expandedActivity = activity
  //       // I just wanted to see if I could get more activity info back for milestones.
  //       // Turns out one can, but cloudflare workers are limited to 50 subrequests per
  //       // request. That is why the limit exists.
  //       if (activity.activityHash && index < activityLimit) {
  //         expandedActivity = await this.getActivity(activity, withModifiers)
  //       }
  //       return expandedActivity
  //     })
  //   )
  // }
}
