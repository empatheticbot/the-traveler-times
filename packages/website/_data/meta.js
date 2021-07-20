const { fetchDataFromEndpoint } = require('../data-loader')

const PGCR_ENDPOINT = 'https://d2-meta-worker.empatheticbot.workers.dev/meta'
const DEV_PGCR_ENDPOINT = 'http://localhost:3011/meta'

module.exports = async function () {
  const meta = await fetchDataFromEndpoint(PGCR_ENDPOINT, DEV_PGCR_ENDPOINT)

  return meta.meta
}
