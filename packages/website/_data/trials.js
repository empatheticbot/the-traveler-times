const { fetchDataFromEndpoint } = require('../data-loader')

const TRIALS_ENDPOINT =
  'https://d2-lost-sector-worker.empatheticbot.workers.dev'
const DEV_TRIALS_ENDPOINT = 'localhost:3006'

module.exports = async function () {
  return fetchDataFromEndpoint(TRIALS_ENDPOINT, DEV_TRIALS_ENDPOINT)
}
