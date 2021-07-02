const mockNightfallData = require('../mock-data/nightfall.json')
const { fetchDataFromEndpoint } = require('../data-loader')

const NIGHTFALL_ENDPOINT =
  'https://d2-nightfall-worker.empatheticbot.workers.dev'
const DEV_NIGHTFALL_ENDPOINT = 'http://localhost:3003'

module.exports = async function () {
  return fetchDataFromEndpoint(
    NIGHTFALL_ENDPOINT,
    DEV_NIGHTFALL_ENDPOINT,
    mockNightfallData
  )
}
