const getBungieRss = require('./bungieRss')
const getLostSectors = require('./lostSector')
const getMeta = require('./meta')
const getNightfall = require('./nightfall')
const getSeason = require('./season')
const getTrials = require('./trials')
const getVendors = require('./vendors')
const getWeekly = require('./weekly')

const DAYS_OLD_CUTOFF = 7

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

  let updates = []

  if (trials.isAvailable) {
    updates.push({
      date: trials.startDate,
      markup: `
      <p>
        <a href="#trials">Trials</a> is now available.
      </p>
    `,
    })
  } else if (weekly.ironBanner.isAvailable) {
    updates.push({
      date: weekly.ironBanner.startDate,
      markup: `
      <p>
        <a href="#iron-banner">Iron Banner</a> is now available.
      </p>
    `,
    })
  }

  updates.push({
    date: today.toISOString(),
    markup: `
    <p>
    Check out <a href="#meta">The Meta</a>
      [<a href="#meta-kills">Kills</a>, <a href="#meta-usage">Usage</a>, and <a href="#meta-efficiency">Efficiency</a>] to get an edge on your opponents in the Crucible.
    </p>
    `,
  })

  if (vendors.xur.isAvailable) {
    updates.push({
      date: vendors.xur.lastRefreshDate,
      markup: `
      <p>
        <a href="#xur">${vendors.xur.name}</a> has been located in the ${vendors.xur.location.area}, ${vendors.xur.location.planet}.
      </p>
    `,
    })
  }

  if (vendors.banshee.isAvailable) {
    updates.push({
      date: vendors.banshee.lastRefreshDate,
      markup: `
      <p>
      <a href="#banshee-44">Banshee-44</a>'s stock was updated.
      </p>
    `,
    })
  }

  if (vendors.ada.isAvailable) {
    updates.push({
      date: vendors.ada.lastRefreshDate,
      markup: `
      <p>
      <a href="#ada-1">Ada-1</a>'s stock was updated.
      </p>
    `,
    })
  }

  if (vendors.spider.isAvailable) {
    updates.push({
      date: vendors.spider.lastRefreshDate,
      markup: `
      <p>
      <a href="#spider">Spider</a>'s stock was updated.
      </p>
    `,
    })
  }

  const nightfallNewCutoffDate = new Date(nightfall.startDate)
  nightfallNewCutoffDate.setDate(nightfallNewCutoffDate.getDate() + 1)
  const lostSectorNewCutoffDate = new Date(lostSectors.startDate)
  lostSectorNewCutoffDate.setHours(lostSectorNewCutoffDate.getHours() + 3)
  if (nightfall.isGrandmasterStartWeek) {
    updates.push({
      date: nightfall.startDate,
      markup: `
      <p>
      <a href="#nightfall">Grandmaster Nightfall</a> is now available! Solo <a href="#lost-sectors">Lost Sectors</a> have also been updated.
      </p>
    `,
    })
  }
  // else if (today.valueOf() < nightfallNewCutoffDate.valueOf()) {
  updates.push({
    date: nightfall.startDate,
    markup: `
      <p>
      The weekly <a href="#nightfall">Nightfall</a> and solo <a href="#lost-sectors">Lost Sectors</a> have been recently updated.
      </p>
    `,
  })
  // }
  if (lostSectors.isAvailable) {
    updates.push({
      date: lostSectors.startDate,
      markup: `
      <p>
      The dialy solo <a href="#lost-sectors">Lost Sectors</a> were recently updated. Looking for another Vanguard operation? Check out the weekly <a href="#nightfall">Nightfall</a>.
      </p>
      `,
    })
  }

  if (bungieRss.isAvailable) {
    updates.push({
      date: bungieRss.lastRefreshDate,
      markup: `
      <p>
        Check out the latest on <a href="#bungie-rss">Bungie.net</a>.
      </p>
      `,
    })
  }

  updates = updates.filter((update) => {
    const date = new Date(update.date)
    date.setDate(date.getDate() + 7)
    return date > today
  })

  updates = updates.sort((a, b) => {
    const aDate = new Date(a.date)
    const bDate = new Date(b.date)
    return bDate.valueOf() - aDate.valueOf()
  })

  // const resetDate = weekly.nextWeeklyReset
  // const resetMarkup = `
  // <section class="nav-section">
  // <span class="small-label">Site last updated <since-date datetime="${today.toISOString()}"></since-date></span>
  // <p>
  //   The next reset is <until-date datetime="${
  //     weekly.nextWeeklyReset
  //   }"></until-date>. <a href="#season">${
  //   season.currentSeason.displayProperties.name
  // }</a> ends <until-date datetime="${
  //   season.currentSeason.endDate
  // }"></until-date>.
  // </p>
  // </section>
  // `
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
  // const activitiesAndDates = [
  //   { activity: bungieRss, date: bungieRss.lastUpdateDate },
  //   { activity: lostSectors, date: lostSectors.startDate },
  //   { activity: nightfall, date: nightfall.startDate },
  //   { activity: trials, date: trials.startDate },
  //   { activity: vendors.xur, date: vendors.xur.lastRefreshDate },
  //   // { activity: vendors.spider, date: vendors.spider.lastRefreshDate },
  //   // { activity: vendors.banshee, date: vendors.banshee.lastRefreshDate },
  //   // { activity: vendors.ada, date: vendors.ada.lastRefreshDate },
  //   { activity: weekly.ironBanner, date: weekly.ironBanner.startDate },
  // ]

  // const activitiesAndDates = [
  //   [vanguardMarkup, vanguardDate],
  //   [vendorMarkup, vendorDate],
  //   [crucibleMarkup, crucibleDate],
  //   // [resetMarkup, resetDate],
  // ]

  // activitiesAndDates.sort(
  //   ([itemA, dateA], [itemB, dateB]) =>
  //     new Date(dateB).valueOf() - new Date(dateA).valueOf()
  // )

  // console.log(activitiesAndDates.map(([i, d]) => d).join(' '))

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
  // console.log(
  //   orderedActivities.map((item) => `${item.date} - ${item.activity.name}`)
  // )

  return updates
}
