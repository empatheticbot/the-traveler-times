const getBungieRss = require('./bungieRss')
const getLostSectors = require('./lostSector')
const getMeta = require('./meta')
const getNightfall = require('./nightfall')
const getSeason = require('./season')
const getTrials = require('./trials')
const getVendors = require('./vendors')
const getWeekly = require('./weekly')

module.exports = async function () {
  const promises = [
    getBungieRss(),
    getLostSectors(),
    getMeta(),
    getNightfall(),
    getSeason(),
    getTrials(),
    getVendors(),
    getWeekly(),
  ]
  const [
    bungieRss,
    lostSectors,
    meta,
    nightfall,
    season,
    trials,
    vendors,
    weekly,
  ] = await Promise.all(promises)

  console.log(
    bungieRss.startDate,
    lostSectors.startDate,
    nightfall.startDate,
    season.currentSeason.startDate,
    season.currentSeason.endDate,
    trials.startDate,
    Object.values(vendors).map(
      (vendor) => `${vendor.lastRefreshDate} -> ${vendor.nextRefreshDate}`
    ),
    weekly.nextWeeklyReset,
    weekly.nextWeekendReset,
    weekly.ironBanner.startDate
  )

  return [meta, vendors, weekly]
}
