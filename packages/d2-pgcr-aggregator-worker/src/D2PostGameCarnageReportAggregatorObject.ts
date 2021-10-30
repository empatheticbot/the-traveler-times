import { getHeaders } from '@the-traveler-times/utils'

export class D2PostGameCarnageReportAggregatorObject {
  PGCR_ENDPOINT = 'https://d2-pgcr-worker.empatheticbot.workers.dev'
  REQUEST_LIMIT = 49
  SUBCALLS = 25

  constructor(state, env) {
    this.env = env
  }

  async handlePGCRRequest(firstActivityId: string) {
    const fetchURL = new URL(this.PGCR_ENDPOINT)
    fetchURL.searchParams.append('firstActivityId', firstActivityId)
    fetchURL.searchParams.append('activitiesToFetch', this.SUBCALLS.toString())
    const response = await fetch(fetchURL.toString(), getHeaders(this.env))
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
    const url = new URL(request.url)
    let firstActivityId = url.searchParams.get('firstActivityId')

    if (!firstActivityId) {
      return new Response(
        'Missing parameter `firstActivityId`, which is required.',
        { status: 400 }
      )
    }
    const activityId = parseInt(firstActivityId)

    try {
      let activityResultsPromise = []
      for (let i = 0; i < this.REQUEST_LIMIT; i++) {
        const activityBatchStartingId = activityId + i * this.SUBCALLS
        const pgcr = await this.handlePGCRRequest(
          activityBatchStartingId.toString()
        )

        activityResultsPromise.push(pgcr)
      }
      const activityResults = await Promise.all(activityResultsPromise)
      return new Response(
        JSON.stringify({
          lastActivityId: activityId + this.SUBCALLS * this.REQUEST_LIMIT,
          activityResults,
        })
      )
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
      })
    }
  }
}
