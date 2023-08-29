const { fetchDataFromEndpoint } = require('../data-loader')

const PGCR_ENDPOINT = 'https://d2-meta-worker.empatheticbot.workers.dev/meta'
const DEV_PGCR_ENDPOINT = 'http://localhost:3011/meta'
const LIMIT = 20

function getTopUsage(weapons, lastWeapons = [], limit = LIMIT) {
  const lastMeta = lastWeapons.sort((a, b) => b.usage - a.usage).slice(0, limit)
  const currentMeta = weapons
    .sort((a, b) => b.usage - a.usage)
    .slice(0, limit)
    .map((weapon, index) => {
      const lastWeekPosition = lastMeta.findIndex(
        (item) => item.id === weapon.id
      )
      let weekMove =
        lastWeekPosition === -1 ? undefined : lastWeekPosition - index
      return {
        ...weapon,
        weekMove,
      }
    })
  return currentMeta
}

function getTopKills(weapons, lastWeapons, limit = LIMIT) {
  const lastMeta = lastWeapons.sort((a, b) => b.kills - a.kills).slice(0, limit)
  const currentMeta = weapons
    .sort((a, b) => b.kills - a.kills)
    .slice(0, limit)
    .map((weapon, index) => {
      const lastWeekPosition = lastMeta.findIndex(
        (item) => item.id === weapon.id
      )
      let weekMove =
        lastWeekPosition === -1 ? undefined : lastWeekPosition - index
      return {
        ...weapon,
        weekMove,
      }
    })
  return currentMeta
}

function getTopPrecisionKills(weapons, lastWeapons, limit = LIMIT) {
  const lastMeta = lastWeapons
    .sort((a, b) => b.precisionKills - a.precisionKills)
    .slice(0, limit)
  const currentMeta = weapons
    .sort((a, b) => b.precisionKills - a.precisionKills)
    .slice(0, limit)
    .map((weapon, index) => {
      const lastWeekPosition = lastMeta.findIndex(
        (item) => item.id === weapon.id
      )
      let weekMove =
        lastWeekPosition === -1 ? undefined : lastWeekPosition - index
      return {
        ...weapon,
        weekMove,
      }
    })
  return currentMeta
}

function getTopEfficiency(weapons, lastWeapons, limit = LIMIT) {
  const lastMeta = getTopUsage(lastWeapons, undefined, 100).sort((a, b) => {
    const aEff = a.kills / a.usage
    const bEff = b.kills / b.usage
    return bEff - aEff
  })

  const currentMeta = getTopUsage(weapons, undefined, 100)
    .sort((a, b) => {
      const aEff = a.kills / a.usage
      const bEff = b.kills / b.usage
      return bEff - aEff
    })
    .slice(0, limit)
    .map((weapon, index) => {
      const lastWeekPosition = lastMeta.findIndex(
        (item) => item.id === weapon.id
      )
      let weekMove =
        lastWeekPosition === -1 ? undefined : lastWeekPosition - index
      return {
        ...weapon,
        weekMove,
      }
    })
  return currentMeta
}

module.exports = async function () {
  const response = await fetchDataFromEndpoint(PGCR_ENDPOINT, DEV_PGCR_ENDPOINT)

  if (response.isAvailable) {
    const { weapons, lastWeekMeta, ...rest } = response
    return {
      ...rest,
      topKills: getTopKills(weapons, lastWeekMeta.weapons),
      topPrecisionKills: getTopPrecisionKills(weapons, lastWeekMeta.weapons),
      topEfficiency: getTopEfficiency(weapons, lastWeekMeta.weapons),
      topUsage: getTopUsage(weapons, lastWeekMeta.weapons),
      lastRefreshDate: new Date().toISOString(),
    }
  } else {
    return {
      isAvailable: false,
    }
  }
}
