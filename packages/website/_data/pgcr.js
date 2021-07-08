const { fetchDataFromEndpoint } = require('../data-loader')

const PGCR_ENDPOINT = 'https://d2-pgcr-worker.empatheticbot.workers.dev'
const DEV_PGCR_ENDPOINT = 'http://localhost:3010'

module.exports = async function () {
  return fetchDataFromEndpoint(PGCR_ENDPOINT, DEV_PGCR_ENDPOINT)
}
