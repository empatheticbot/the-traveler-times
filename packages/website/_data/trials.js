const { fetchDataFromEndpoint } = require('../data-loader')

const TRIALS_ENDPOINT = 'https://d2-trials-worker.empatheticbot.workers.dev'
const DEV_TRIALS_ENDPOINT = 'http://localhost:3006'

module.exports = async function () {
  return fetchDataFromEndpoint(TRIALS_ENDPOINT, DEV_TRIALS_ENDPOINT)
}
