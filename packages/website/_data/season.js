const { fetchDataFromEndpoint } = require('../data-loader')

const SEASON_ENDPOINT = 'https://d2-season-worker.empatheticbot.workers.dev'
const DEV_SEASON_ENDPOINT = 'localhost:3005'

module.exports = async function () {
  return fetchDataFromEndpoint(SEASON_ENDPOINT, DEV_SEASON_ENDPOINT)
}
