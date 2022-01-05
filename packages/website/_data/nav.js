const getBungieRss = require('./bungieRss')
const getLostSectors = require('./lostSector')
const getMeta = require('./meta')
const getNightfall = require('./nightfall')
const getSeason = require('./season')
const getTrials = require('./trials')
const getVendors = require('./vendors')
const getWeekly = require('./weekly')

module.exports = async function () {
  const today = new Date()
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

  let crucibleMarkup
  let crucibleDate
  if (trials.isAvailable) {
    crucibleDate = trials.startDate
    crucibleMarkup = `
    <section>
    <since-date datetime="${crucibleDate}"></since-date>
    <p>
      <a href="#trials">Trials</a> is now available. Be sure to check out [<a href="#meta">The Meta</a>
      <a href="#meta-kills">Kills</a>, <a href="#meta-usage">Usage</a>, and <a href="#meta-efficiency">Efficiency</a>] before entering the fray.
    </p>
    </section>
  `
  } else if (weekly.ironBanner.isAvailable) {
    crucibleDate = weekly.ironBanner.startDate
    crucibleMarkup = `
    <section>
    <since-date datetime="${crucibleDate}"></since-date>
    <p>
      <a href="#iron-banner">Iron Banner</a> is now available. Be sure to check out [<a href="#meta">The Meta</a>
      <a href="#meta-kills">Kills</a>, <a href="#meta-usage">Usage</a>, and <a href="#meta-efficiency">Efficiency</a>] before entering the fray.
    </p>
    </section>
  `
  } else {
    crucibleMarkup = `
    <section>
    <p>
    Check out [<a href="#meta">The Meta</a>
      <a href="#meta-kills">Kills</a>, <a href="#meta-usage">Usage</a>, and <a href="#meta-efficiency">Efficiency</a>] to get an edge on your opponents in the Crucible.
    </p>
    </section>
  `
  }

  let vendorMarkup
  let vendorDate
  if (vendors.xur.isAvailable) {
    vendorDate = vendors.xur.lastRefreshDate
    vendorMarkup = `
    <section>
    <since-date datetime="${vendorDate}"></since-date>
    <p>
      ${vendors.xur.name} has been located in the ${vendors.xur.location.area}, ${vendors.xur.location.planet}! Looking for something else? Check out the other <a href="#vendors">Vendors</a> [<a href="#xur">Xur</a>
      <a href="#spider">Spider</a>, <a href="#banshee-44">Banshee-44</a>, and <a href="#ada-1">Ada-1</a>] stock.
    </p>
    </section>
    `
  } else {
    vendorMarkup = `
    <section>
    <p>
    Check out the <a href="#vendors">Vendors</a> [<a href="#xur">Xur</a>
      <a href="#spider">Spider</a>, <a href="#banshee-44">Banshee-44</a>, and <a href="#ada-1">Ada-1</a>] stock.
    </p>
    </section>
    `
  }
  let vanguardMarkup
  let vanguardDate
  const nightfallNewCutoffDate = new Date(nightfall.startDate)
  nightfallNewCutoffDate.setDate(nightfallNewCutoffDate.getDate() + 1)
  const lostSectorNewCutoffDate = new Date(lostSectors.startDate)
  lostSectorNewCutoffDate.setHours(lostSectorNewCutoffDate.getHours() + 3)
  if (nightfall.isGrandmasterStartWeek) {
    vanguardDate = nightfall.startDate
    vanguardMarkup = `
    <section>
    <since-date datetime="${vanguardDate}"></since-date>
    <p>
    <a href="#nightfall">Grandmaster Nightfall</a> is now available! Solo <a href="#lost-sectors">Lost Sectors</a> have also been updated.
    </p>
    </section>
    `
  } else if (today.valueOf() < nightfallNewCutoffDate.valueOf()) {
    vanguardDate = nightfall.startDate
    vanguardMarkup = `
    <section>
    <since-date datetime="${vanguardDate}"></since-date>
    <p>
    The weekly <a href="#nightfall">Nightfall</a> and solo <a href="#lost-sectors">Lost Sectors</a> have been recently updated.
    </p>
    </section>
    `
  } else if (today.valueOf() < lostSectorNewCutoffDate.valueOf()) {
    vanguardDate = lostSectors.startDate
    vanguardMarkup = `
    <section>
    <since-date datetime="${vanguardDate}"></since-date>
    <p>
    The dialy solo <a href="#lost-sectors">Lost Sectors</a> were recently updated. Looking for another Vanguard operation? Check out the weekly <a href="#nightfall">Nightfall</a>.
    </p>
    </section>
    `
  } else {
    vanguardDate = lostSectors.startDate
    vanguardMarkup = `
    <section>
    <since-date datetime="${vanguardDate}"></since-date>
    <p>
    Looking for Vanguard operations? Check out the daily <a href="#lost-sectors">Lost Sectors</a> or the weekly <a href="#nightfall">Nightfall</a>.
    </p>
    </section>
    `
  }
  // console.log(
  //   meta.isAvailable,
  //   bungieRss.isAvailable,
  //   lostSectors.isAvailable,
  //   nightfall.isAvailable,
  //   season.isAvailable,
  //   trials.isAvailable,
  //   vendors.isAvailable,
  //   Object.values(vendors).map(
  //     (vendor) => `${vendor.name} -> ${vendor.enabled}`
  //   ),
  //   weekly.isAvailable,
  //   weekly.ironBanner.isAvailable
  // )
  const activitiesAndDates = [
    { activity: bungieRss, date: bungieRss.lastUpdateDate },
    { activity: lostSectors, date: lostSectors.startDate },
    { activity: nightfall, date: nightfall.startDate },
    { activity: trials, date: trials.startDate },
    { activity: vendors.xur, date: vendors.xur.lastRefreshDate },
    // { activity: vendors.spider, date: vendors.spider.lastRefreshDate },
    // { activity: vendors.banshee, date: vendors.banshee.lastRefreshDate },
    // { activity: vendors.ada, date: vendors.ada.lastRefreshDate },
    { activity: weekly.ironBanner, date: weekly.ironBanner.startDate },
  ]

  const orderedActivities = activitiesAndDates
    .filter((item) => item.activity.isAvailable)
    .sort((itemA, itemB) => new Date(itemB.date) - new Date(itemA.date))

  // console.log(
  //   bungieRss.lastUpdateDate,
  //   lostSectors.startDate,
  //   nightfall.startDate,
  //   season.currentSeason.startDate,
  //   season.currentSeason.endDate,
  //   trials.startDate,
  //   Object.values(vendors).map(
  //     (vendor) =>
  //       `${vendor.name}: ${vendor.lastRefreshDate} -> ${vendor.nextRefreshDate}`
  //   ),
  //   weekly.nextWeeklyReset,
  //   weekly.nextWeekendReset,
  //   weekly.ironBanner.startDate
  // )
  console.log(
    orderedActivities.map((item) => `${item.date} - ${item.activity.name}`)
  )

  return [
    [vanguardMarkup, vanguardDate],
    [vendorMarkup, vendorDate],
    [crucibleMarkup, crucibleDate],
  ]
}
