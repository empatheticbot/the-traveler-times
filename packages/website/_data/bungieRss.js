const fs = require('fs')
let Parser = require('rss-parser')
let parser = new Parser()
const BUNGIE_RSS_URL = 'http://www.bungie.net/News/NewsRss.ashx'

module.exports = async function getBungieRss() {
  const feed = await parser.parseURL(BUNGIE_RSS_URL)
  let items = []
  for (const item of feed.items) {
    if (item.isoDate) {
      const date = new Date(item.isoDate)
      const now = new Date()
      const milliDiff = now.valueOf() - date.valueOf()

      if (milliDiff < 1000 * 60 * 60 * 24 * 2) {
        item.isNew = true
      }
    }
    if (item.title.includes('This Week At Bungie')) {
      item.title = 'This Week At Bungie'
      items.push(item)
    } else if (
      item.title.includes('Destiny') ||
      item.title.includes('Festival of the Lost') ||
      item.title.includes('Season of')
    ) {
      items.push(item)
    }
  }
  return { ...feed, items }
}
