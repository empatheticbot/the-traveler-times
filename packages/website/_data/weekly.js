const { fetchDataFromEndpoint } = require('../data-loader')

const WEEKLY_ENDPOINT = 'https://d2-weekly-worker.empatheticbot.workers.dev'
const DEV_WEEKLY_ENDPOINT = 'http://localhost:3008'

module.exports = async function () {
  return fetchDataFromEndpoint(WEEKLY_ENDPOINT, DEV_WEEKLY_ENDPOINT)
}
