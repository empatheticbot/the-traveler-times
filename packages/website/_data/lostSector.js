const { fetchDataFromEndpoint } = require('../data-loader')

const LOST_SECTOR_ENDPOINT =
  'https://d2-lost-sector-worker.empatheticbot.workers.dev'
const DEV_LOST_SECTOR_ENDPOINT = 'http://localhost:3002'

module.exports = async function () {
  return fetchDataFromEndpoint(LOST_SECTOR_ENDPOINT, DEV_LOST_SECTOR_ENDPOINT)
}
