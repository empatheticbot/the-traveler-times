const fs = require('fs')
let Parser = require('rss-parser')
let parser = new Parser()
const BUNGIE_RSS_URL = 'http://www.bungie.net/News/NewsRss.ashx'

module.exports = async function getBungieRss() {
  let feed
  try {
    feed = await parser.parseURL(BUNGIE_RSS_URL)
  } catch (e) {
    console.error('Failed to parse bungie rss', e)
  }
	let items = []
	let lastUpdateDate

	const addItemToList = (item) => {
		if (item.isoDate) {
			const date = new Date(item.isoDate)
			const now = new Date()
			const milliDiff = now.valueOf() - date.valueOf()

			if (!lastUpdateDate || date > lastUpdateDate) {
				lastUpdateDate = date
			}

			if (milliDiff < 1000 * 60 * 60 * 24 * 2) {
				item.isNew = true
			}
		}
		items.push(item)
	}
 if (feed) {
   for (const item of feed.items) {
     // if (item.title.toLowerCase().includes('this week at bungie')) {
     // 	item.title = 'This Week At Bungie'
     // 	addItemToList(item)
     // } else if (
     // 	item.title.includes('Destiny') ||
     // 	item.title.includes('Festival of the Lost') ||
     // 	item.title.includes('Season of') ||
     // 	true
     // ) {
     // 	addItemToList(item)
     // }

     addItemToList(item)
   }
 } else {
   feed = {}
 }

	return {
		...feed,
		lastRefreshDate: lastUpdateDate && lastUpdateDate.toISOString(),
		isAvailable: items.length > 0,
		items: items
			.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate))
			.slice(0, 5),
	}
}
