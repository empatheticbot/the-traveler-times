const mockXurData = require("../mock-data/xur.json")
const { fetchDataFromEndpoint } = require("../data-loader")

//TODO: add dev env endpoint
const VENDORS_ENDPOINT = "https://d2-vendors-worker.empatheticbot.workers.dev"

module.exports = async function () {
  return fetchDataFromEndpoint(VENDORS_ENDPOINT, VENDORS_ENDPOINT, mockXurData)
}
