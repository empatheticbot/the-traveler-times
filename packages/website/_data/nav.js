const getBungieRss = require('./bungieRss')
const getLostSectors = require('./lostSector')
const getMeta = require('./meta')
const getNightfall = require('./nightfall')
const getSeason = require('./season')
const getTrials = require('./trials')
const getVendors = require('./vendors')
const getWeekly = require('./weekly')

const DAYS_OLD_CUTOFF = 7

function cleanDate(dateString) {
  const date = new Date(dateString)
  const isRoundUp = date.getMinutes() > 30
  if (isRoundUp) {
    date.setHours(date.getHours() + 1)
  }
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)
  return date.toISOString()
}

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
      date: cleanDate(trials.startDate),
      markup: `
      <p>
        <a href="#trials">Trials of Osiris</a> has begun for the weekend.
      </p>
    `,
    })
  } else if (weekly.ironBanner.isAvailable) {
    updates.push({
      date: cleanDate(weekly.ironBanner.startDate),
      markup: `
      <p>
        <a href="#iron-banner">Iron Banner</a> is available for the week.
      </p>
    `,
    })
  }

  updates.push({
    date: meta.lastRefreshDate,
    markup: `
    <p>
    Check out <a href="#meta">The Meta</a>
      [<a href="#meta-kills">Kills</a>, <a href="#meta-usage">Usage</a>, and <a href="#meta-efficiency">Efficiency</a>] to get an edge on your opponents in the Crucible.
    </p>
    `,
  })

  if (nightfall.isGrandmasterStartWeek) {
    updates.push({
      date: cleanDate(nightfall.startDate),
      markup: `
      <p>
      <a href="#nightfall">Grandmaster Nightfall</a> is now available.
      </p>
    `,
    })
  } else {
    updates.push({
      date: cleanDate(nightfall.startDate),
      markup: `
        <p>
        The weekly <a href="#nightfall">Nightfall</a> has been updated.
        </p>
      `,
    })
  }

  if (lostSectors.isAvailable) {
    updates.push({
      date: cleanDate(lostSectors.startDate),
      markup: `
      <p>
      The dialy solo <a href="#lost-sectors">Lost Sector</a> was updated.
      </p>
      `,
    })
  }

  if (vendors.xur.isAvailable) {
    updates.push({
      date: cleanDate(vendors.xur.lastRefreshDate),
      markup: `
      <p>
        <a href="#${vendors.xur.name.toLowerCase()}">${
        vendors.xur.name
      }</a> has been located on <strong>${vendors.xur.location.area}, ${
        vendors.xur.location.planet
      }</strong>.
      </p>
    `,
    })
  }

  if (vendors.rahool.isAvailable) {
    updates.push({
      date: cleanDate(vendors.rahool.lastRefreshDate),
      markup: `
      <p>
      <a href="#master-rahool">Master Rahool's</a>'s stock was updated.
      </p>
    `,
    })
  }

  if (vendors.ada.isAvailable) {
    updates.push({
      date: cleanDate(vendors.ada.lastRefreshDate),
      markup: `
      <p>
      <a href="#ada-1">Ada-1</a>'s stock was updated.
      </p>
    `,
    })
  }

  if (vendors.banshee.isAvailable) {
    updates.push({
      date: cleanDate(vendors.banshee.lastRefreshDate),
      markup: `
      <p>
      <a href="#banshee-44">Banshee-44</a>'s stock was updated.
      </p>
    `,
    })
  }

  if (bungieRss.isAvailable) {
    updates.push({
      date: cleanDate(bungieRss.lastRefreshDate),
      markup: `
      <p>
        A <a href="${bungieRss.items[0].link}">${
        bungieRss.items[0].title.includes('This Week At Bungie')
          ? 'new TWAB'
          : 'new article'
      }</a> has been posted on <a href="#bungie-rss">Bungie.net</a>.
      </p>
      `,
    })
  }

  updates = updates.filter((update) => {
    const date = new Date(update.date)
    date.setDate(date.getDate() + DAYS_OLD_CUTOFF)
    return date > today
  })

  updates = updates.sort((a, b) => {
    const aDate = new Date(a.date)
    const bDate = new Date(b.date)
    return bDate.valueOf() - aDate.valueOf()
  })

  return updates
}
