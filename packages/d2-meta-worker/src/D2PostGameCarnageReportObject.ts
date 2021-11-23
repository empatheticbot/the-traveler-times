import { delay, getHeaders } from '@the-traveler-times/utils'

export class D2PostGameCarnageReportObject {
  PGCR_ENDPOINT = 'https://d2-pgcr-worker.empatheticbot.workers.dev'
  REQUEST_LIMIT = 48
  LAST_ACTIVITY_ID = '$CURRENT_ACTIVITY_ID'
  NEW_ACTIVITY_ID = '$NEW_ACTIVITY_ID'
  SUBCALLS = 25
  CALL_EVERY = 5

  constructor(state, env) {
    this.env = env
  }

  async handlePGCRRequest(firstActivityId: string) {
    const fetchURL = new URL(this.PGCR_ENDPOINT)
    fetchURL.searchParams.append('firstActivityId', firstActivityId)
    fetchURL.searchParams.append('activitiesToFetch', this.SUBCALLS.toString())
    fetchURL.searchParams.append('every', this.CALL_EVERY.toString())

    const response = await fetch(fetchURL.toString(), getHeaders(this.env))
    if (response.ok) {
      const result = await response.json()
      return {
        ...result,
        fetchURL: fetchURL.toString(),
        firstActivityId,
        ok: response.ok,
      }
    } else {
      return {
        status: response.statusText,
        fetchURL: fetchURL.toString(),
        firstActivityId,
        ok: response.ok,
      }
    }
  }

  async fetch(request: Request) {
    const url = new URL(request.url)
    const activityIdString = url.searchParams.get('activityId')
    if (!activityIdString) {
      return new Response(
        JSON.stringify({
          error: 'No parameter activityId provided.',
        }),
        {
          status: 400,
        }
      )
    }
    const activityId = parseInt(activityIdString)

    try {
      let activityResultsPromise = []
      for (let i = 0; i < this.REQUEST_LIMIT; i++) {
        const activityBatchStartingId =
          activityId + i * this.SUBCALLS * this.CALL_EVERY
        activityResultsPromise.push(
          this.handlePGCRRequest(activityBatchStartingId.toString())
        )
        await delay(1000)
      }
      const results = await Promise.all(activityResultsPromise)

      return new Response(JSON.stringify({ results }))
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
      })
    }
  }
}
