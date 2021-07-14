export class D2PostGameCarnageReportObject {
  PGCR_ENDPOINT = 'https://d2-pgcr-worker.empatheticbot.workers.dev'
  REQUEST_LIMIT = 48
  LAST_ACTIVITY_ID = 'LAST_ACTIVITY_ID'
  SUBCALLS = 50

  constructor(state, env) {
    this.state = state
    this.env = env
  }

  //   async initialize() {
  //     let stored = await this.state.storage.get("value");
  //     // after initialization, future reads don't need to access storage!
  //     this.value = stored || 0;
  // }

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

  async handleStoringResult(result) {
    const date = new Date(result.period)
    const dateString = date.toLocaleDateString('en', {
      month: '2-digit',
      year: 'numeric',
      day: '2-digit',
    })
    let data = await this.state.storage.get(dateString)
    for (const [key, value] of Object.entries(collectedWeaponData)) {
    }
    await this.state.storage.put(dateKey, activityResults)
  }

  async fetch(request) {
    let url = new URL(request.url)
    console.log(url.pathname)
    let lastActivityId =
      (await this.state.storage.get(this.LAST_ACTIVITY_ID)) || 8811166282
    //   if (!this.initializePromise) {
    //     this.initializePromise = this.initialize();
    // }
    // await this.initializePromise;

    switch (url.pathname) {
      case '/meta':
        break
      default: {
        try {
          let activityResultsPromise = []
          for (let i = 0; i < this.REQUEST_LIMIT; i++) {
            // let dateKey = new Date().toLocaleDateString('en', {
            //   month: '2-digit',
            //   year: 'numeric',
            //   day: '2-digit',
            // })
            // let dateData = (await this.state.storage.get(dateKey)) || []
            const activityBatchStartingId = lastActivityId + i * this.SUBCALLS
            activityResultsPromise.push(
              this.handlePGCRRequest(activityBatchStartingId)
            )
          }
          const activityResults = await Promise.all(activityResultsPromise)

          const mappedResults = activityResults.reduce((acc, value) => {
            if (!value.period) {
              return
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

          for (const [date, data] of Object.entries(mappedResults)) {
            const storedData = await this.state.storage.get(date)

            if (storedData) {
              for (const [id, weaponData] of Object.entries(data)) {
                const d = storedData[id]
                if (d) {
                  let mergedData = {
                    kills: d.kills + weaponData.kills,
                    precisionKills:
                      d.precisionKills + weaponData.precisionKills,
                    usage: d.usage + weaponData.usage,
                    id: d.id,
                    period: d.period,
                  }
                  storedData[id] = mergedData
                } else {
                  storedData[id] = weaponData
                }
              }
              await this.state.storage.put(date, storedData)
            } else {
              await this.state.storage.put(date, data)
            }
          }

          await this.state.storage.put(
            this.LAST_ACTIVITY_ID,
            lastActivityId + this.SUBCALLS * (this.REQUEST_LIMIT - 1)
          )

          // await this.state.storage.put(dateKey, activityResults)

          return new Response(
            JSON.stringify({
              activities: mappedResults,
              lastActivityId,
            })
          )
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
          })
        }
      }
    }
    return new Response('Not implemented.')
  }
}
