export class D2PostGameCarnageReportObject {
  PGCR_ENDPOINT = 'https://d2-pgcr-worker.empatheticbot.workers.dev'
  constructor(state, env) {}

  async fetch(request) {
    let url = new URL(request.url)

    switch (url.pathname) {
      case '/meta':
        break
      default:
    }

    return new Response('Hello World')
  }
}
