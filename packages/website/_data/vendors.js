const mockXurData = require('../mock-data/xur.json')
const { fetchDataFromEndpoint } = require('../data-loader')

const VENDORS_ENDPOINT = 'https://d2-vendors-worker.empatheticbot.workers.dev'
const DEV_VENDORS_ENDPOINT = 'localhost:3007'

module.exports = async function () {
  return fetchDataFromEndpoint(
    VENDORS_ENDPOINT,
    DEV_VENDORS_ENDPOINT,
    mockXurData
  )
}
