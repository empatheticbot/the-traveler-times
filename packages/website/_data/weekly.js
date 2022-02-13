const { fetchDataFromEndpoint } = require('../data-loader')

const WEEKLY_ENDPOINT = 'https://d2-weekly-worker.empatheticbot.workers.dev'
const DEV_WEEKLY_ENDPOINT = 'http://localhost:3008'

module.exports = async function () {
  const response = await fetchDataFromEndpoint(
    WEEKLY_ENDPOINT,
    DEV_WEEKLY_ENDPOINT
  )
  if (!response.isAvailable) {
    throw Error("Weekly endpoint isn't available. Bungie API seems to be down.")
  }
  return response
}
