export class D2PostGameCarnageReportObject {
  PGCR_ENDPOINT = 'https://d2-pgcr-worker.empatheticbot.workers.dev'
  REQUEST_LIMIT = 49
  LAST_ACTIVITY_ID = 'LAST_ACTIVITY_ID'
  SUBCALLS = 20

  constructor(state, env) {}

  //   async initialize() {
  //     let stored = await this.state.storage.get("value");
  //     // after initialization, future reads don't need to access storage!
  //     this.value = stored || 0;
  // }

  async fetch(request) {
    let url = new URL(request.url)
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
        let activityResults = []
        for (let i = 0; i < this.REQUEST_LIMIT; i++) {
          const activityBatchStartingId = lastActivityId + i * this.SUBCALLS
          const fetchURL = new URL(this.PGCR_ENDPOINT)
          fetchURL.searchParams.append(
            'firstActivityId',
            activityBatchStartingId
          )
          fetchURL.searchParams.append('activitiesToFetch', this.SUBCALLS)
          const response = await fetch(this.PGCR_ENDPOINT)
          if (response.ok) {
            const result = await response.json()
            console.log(result)
            activityResults = activityResults.concat(result)
          }
        }
        await this.state.storage.put(
          this.LAST_ACTIVITY_ID,
          lastActivityId + this.SUBCALLS * (this.REQUEST_LIMIT - 1)
        )
        return new Response(
          JSON.stringify({
            activities: activityResults,
          })
        )
      }
    }
    return new Response('Not implemented.')
  }
}
