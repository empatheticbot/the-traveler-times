export default class TwitterHandler {
  async init(twitterEnv) {
    console.log((await twitterEnv.list()).keys.map((key) => key.name))
    try {
      this.twitterToken = await twitterEnv.get('BEARER_TOKEN')
      this.xurLocations = await twitterEnv.get('XUR_LOCATIONS', {
        type: 'json',
      })
      this.trialsMaps = await twitterEnv.get('TRIALS_MAPS', { type: 'json' })
    } catch (e) {
      console.error(`Failed to get and parse KV from TWITTER_API: ${e}`)
    }
  }

  /**
    {
      "data": [
          {
              "id": "1355818175577862145",
              "text": "Xûr has left the Tower. #destiny https://t.co/FRDPzBJeyO"
          },
          {
              "id": "1355093518344196098",
              "text": "Xûr just arrived in the Tower, guardians. Find him. #destiny https://t.co/FRDPzBJeyO"
          }
      ],
      "meta": {
          "newest_id": "1355818175577862145",
          "oldest_id": "1355093518344196098",
          "result_count": 2
      }
    }
  */
  async queryRecentTweetsFromTwitter(query, startDate, maxResults = 100) {
    const url = new URL(`https://api.twitter.com/2/tweets/search/recent`)
    let date
    if (startDate instanceof Date) {
      date = startDate
    } else if (typeof startDate === 'string') {
      date = new Date(startDate)
    } else {
      // Just arbitrarily set date to 30 minutes ago 🤷‍♀️
      date = new Date()
      date.setMinutes(date.getMinutes() - 30)
    }
    url.searchParams.set('query', query)
    url.searchParams.set('max_results', maxResults)
    url.searchParams.set('start_time', date.toISOString())
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.twitterToken}`,
        },
      })

      return response.json()
    } catch (e) {
      console.error(`Failed to query twitter for recent tweets: ${e}`)
      return { ok: false }
    }
  }

  async getXurLocation(searchStartDate) {
    const xurLocationQueries = await Promise.all(
      this.xurLocations.map(async (location) => {
        const twitterQueryResult = await this.queryRecentTweetsFromTwitter(
          location.twitterQuery,
          searchStartDate
        )
        return { ...location, results: twitterQueryResult.meta.result_count }
      })
    )

    let bestGuessLocation = {
      planet: 'Unknown',
      area: 'Unknown',
      confidence: 0,
    }
    let currentHighestCount = 0

    xurLocationQueries.forEach((location, index) => {
      if (location.results > currentHighestCount) {
        bestGuessLocation = location
      }
    })
    return {
      xurLocationQueries,
      ...bestGuessLocation,
    }
  }

  async getTrialsMap() {
    //TODO: Add trials query...
    //https://data.destinysets.com/i/Activity:588019350
    // ☝️ That activity looks helpful in getting all trials maps to check twitter against
    // look under playlistItems
  }
}