const { fetchDataFromEndpoint } = require('../data-loader')

const PGCR_ENDPOINT = 'https://d2-meta-worker.empatheticbot.workers.dev/meta'
const DEV_PGCR_ENDPOINT = 'http://localhost:3011/meta'
const LIMIT = 15

function getTopUsage(weapons, limit = LIMIT) {
  return weapons.sort((a, b) => b.usage - a.usage).slice(0, limit)
}

function getTopKills(weapons, limit = LIMIT) {
  return weapons.sort((a, b) => b.kills - a.kills).slice(0, limit)
}

function getTopPrecisionKills(weapons, limit = LIMIT) {
  return weapons
    .sort((a, b) => b.precisionKills - a.precisionKills)
    .slice(0, limit)
}

function getTopEfficiency(weapons, limit = LIMIT) {
  return getTopUsage(weapons, 100)
    .sort((a, b) => {
      const aEff = a.kills / a.usage
      const bEff = b.kills / b.usage
      return bEff - aEff
    })
    .slice(0, limit)
}

module.exports = async function () {
  const response = await fetchDataFromEndpoint(PGCR_ENDPOINT, DEV_PGCR_ENDPOINT)
  if (response.isAvailable) {
    const { weapons, ...rest } = response
    return {
      ...rest,
      topKills: getTopKills(weapons),
      topPrecisionKills: getTopPrecisionKills(weapons),
      topEfficiency: getTopEfficiency(weapons),
      topUsage: getTopUsage(weapons),
    }
  }
}
