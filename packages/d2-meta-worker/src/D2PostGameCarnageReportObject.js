export class D2PostGameCarnageReportObject {
  PGCR_ENDPOINT = 'https://d2-pgcr-worker.empatheticbot.workers.dev'
  REQUEST_LIMIT = 48
  LAST_ACTIVITY_ID = 'CURRENT_ACTIVITY_ID'
  SUBCALLS = 50
  LOG = 'initial'

  constructor(state, env) {
    this.env = env
  }

  async handlePGCRRequest(firstActivityId) {
    const fetchURL = new URL(this.PGCR_ENDPOINT)
    fetchURL.searchParams.append('firstActivityId', firstActivityId)
    fetchURL.searchParams.append('activitiesToFetch', this.SUBCALLS)
    const response = await fetch(fetchURL)
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

  async fetch(request) {
    const dates = {}
    let lastActivityId = parseInt(
      await this.env.DESTINY_2_CRUCIBLE_META.get(this.LAST_ACTIVITY_ID)
    )
    console.log(lastActivityId)

    try {
      let activityResultsPromise = []
      for (let i = 0; i < this.REQUEST_LIMIT; i++) {
        const activityBatchStartingId = lastActivityId + i * this.SUBCALLS
        activityResultsPromise.push(
          this.handlePGCRRequest(activityBatchStartingId)
        )
      }
      const activityResults = await Promise.all(activityResultsPromise)

      const weaponData = activityResults
        .map((activity) => activity.weaponData)
        .flat()

      console.log(weaponData)
      const mappedResults = weaponData.reduce((acc, value) => {
        if (!value.period) {
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
        lastActivityId + this.SUBCALLS * (this.REQUEST_LIMIT - 1)
      )

      return new Response(
        JSON.stringify({
          weaponData,
          lastActivityId,
          dates,
        })
      )
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message + this.LOG }), {
        status: 500,
      })
    }
  }
}
