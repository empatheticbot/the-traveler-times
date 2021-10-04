export class D2PostGameCarnageReportObject {
  PGCR_ENDPOINT = 'https://d2-pgcr-worker.empatheticbot.workers.dev'
  REQUEST_LIMIT = 49
  LAST_ACTIVITY_ID = 'CURRENT_ACTIVITY_ID'
  NEW_ACTIVITY_ID = 'NEW_ACTIVITY_ID'
  SUBCALLS = 49
  LOG = 'initial'

  constructor(state, env) {
    this.env = env
  }

  async handlePGCRRequest(firstActivityId: string) {
    const fetchURL = new URL(this.PGCR_ENDPOINT)
    fetchURL.searchParams.append('firstActivityId', firstActivityId)
    fetchURL.searchParams.append('activitiesToFetch', this.SUBCALLS.toString())
    const response = await fetch(fetchURL.toString())
    if (response.ok) {
      const result = await response.json()
      return {
        ...result,
        fetchURL: fetchURL.toString(),
        firstActivityId,
      }
    } else {
      return {
        status: response.statusText,
        fetchURL: fetchURL.toString(),
        firstActivityId,
      }
    }
  }

  async fetch(request: Request) {
    const dates = {}
    let newActivityId = parseInt(
      await this.env.DESTINY_2_CRUCIBLE_META.get(this.NEW_ACTIVITY_ID)
    )
    let lastActivityId = parseInt(
      await this.env.DESTINY_2_CRUCIBLE_META.get(this.LAST_ACTIVITY_ID)
    )
    let activityId = newActivityId || lastActivityId

    try {
      let activityResultsPromise = []
      for (let i = 0; i < this.REQUEST_LIMIT; i++) {
        const activityBatchStartingId = activityId + i * this.SUBCALLS
        activityResultsPromise.push(
          this.handlePGCRRequest(activityBatchStartingId.toString())
        )
      }
      const activityResults = await Promise.all(activityResultsPromise)

      const weaponData = activityResults
        .map((activity) => activity.weaponData)
        .flat()

      const mappedResults = weaponData.reduce((acc, value) => {
        if (!value || !value.period) {
          return {}
        }
        const dateString = value.period.split('T')[0]

        let currentDateData = acc[dateString] || {}
        let dateWeaponData = currentDateData[value.id]
        if (dateWeaponData) {
          dateWeaponData = {
            kills: dateWeaponData.kills + value.kills,
            precisionKills:
              dateWeaponData.precisionKills + value.precisionKills,
            usage: dateWeaponData.usage + 1,
            id: value.id,
            period: dateString,
          }
        } else {
          dateWeaponData = {
            kills: value.kills,
            precisionKills: value.precisionKills,
            usage: 1,
            id: value.id,
            period: dateString,
          }
        }
        currentDateData[dateWeaponData.id] = dateWeaponData
        acc[dateString] = currentDateData
        return acc
      }, {})

      this.LOG = `mappedResults`

      for (const [date, data] of Object.entries(mappedResults)) {
        const storedData = await this.env.DESTINY_2_CRUCIBLE_META.get(
          date,
          'json'
        )
        this.LOG = 'storedData'
        if (storedData) {
          for (const [id, weaponData] of Object.entries(data)) {
            this.LOG = 'data'
            const d = storedData[id]
            if (d) {
              let mergedData = {
                kills: d.kills + weaponData.kills,
                precisionKills: d.precisionKills + weaponData.precisionKills,
                usage: d.usage + weaponData.usage,
                id: d.id,
              }
              storedData[id] = mergedData
            } else {
              storedData[id] = weaponData
            }
          }
          dates[date] = storedData
        } else {
          dates[date] = data
        }
      }
      await this.env.DESTINY_2_CRUCIBLE_META.put(
        this.LAST_ACTIVITY_ID,
        activityId + this.SUBCALLS * (this.REQUEST_LIMIT - 1)
      )

      if (newActivityId) {
        await this.env.DESTINY_2_CRUCIBLE_META.put(this.NEW_ACTIVITY_ID, 0)
      }

      return new Response(
        JSON.stringify({
          weaponData,
          lastActivityId: activityId,
          dates,
          activityResults,
        })
      )
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message + this.LOG }), {
        status: 500,
      })
    }
  }
}
