const { DateTime } = require('luxon')
const fs = require('fs')
const pluginNavigation = require('@11ty/eleventy-navigation')

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginNavigation)

  eleventyConfig.setDataDeepMerge(true)

  eleventyConfig.addFilter('noWhiteSpace', (string) => {
    return string.replace(/\s/g, '')
  })

  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat(
      'LLL dd, yyyy'
    )
  })

  eleventyConfig.addFilter('prettyNumber', (number) => {
    console.log(number)
    return number.toLocaleString()
  })

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    let date = dateObj
    if (typeof dateObj != 'object') {
      date = new Date(dateObj)
    }
    return date.toISOString()
  })

  eleventyConfig.addFilter('relativeDate', (dateObj) => {
    let date = dateObj
    if (typeof dateObj != 'object') {
      date = new Date(dateObj)
    }
    return DateTime.fromJSDate(date, { zone: 'utc' }).toRelative()
  })

  eleventyConfig.addFilter('keywordsFromTags', (list, filter = []) => {
    return list.filter((item) => filter.indexOf(item) == -1).join(', ')
  })

  eleventyConfig.addFilter('getPrettyRatios', ([individual, total]) => {
    const ratio = individual / total
    return `${(ratio * 100).toFixed(2)}%`
  })

  eleventyConfig.addFilter('getEfficiency', ([kills, usage]) => {
    const ratio = kills / usage
    return `${ratio.toFixed(2)}`
  })

  eleventyConfig.addFilter('vendorItems', (sales, name) => {
    switch (name) {
      case 'Ada-1':
      case 'Banshee-44':
        return sales.filter((sale) => {
          return (
            sale.subtitle.includes('Mod') || sale.subtitle.includes('Material')
          )
        })
      case 'Spider':
        let includedGlimmerTradeSale = false
        return sales.filter((sale) => {
          let includeGlimmerSale = false
          if (
            sale.subtitle.includes('Basic Currency') &&
            !includedGlimmerTradeSale
          ) {
            includeGlimmerSale = true
            includedGlimmerTradeSale = true
          }
          return sale.name.includes('Purchase') || includeGlimmerSale
        })
      default:
        return sales
    }
  })

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter('head', (array, n) => {
    if (n < 0) {
      return array.slice(n)
    }

    return array.slice(0, n)
  })

  eleventyConfig.addPassthroughCopy('assets')
  eleventyConfig.addPassthroughCopy({
    'node_modules/@empatheticbot/time-elements/dist/': 'js/time-elements',
  })

  // Browsersync Overrides
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function (err, browserSync) {
        const content_404 = fs.readFileSync('_site/404.html')

        browserSync.addMiddleware('*', (req, res) => {
          // Provides the 404 content without redirect.
          res.write(content_404)
          res.end()
        })
      },
    },
    ui: false,
    ghostMode: false,
  })

  return {
    templateFormats: ['md', 'njk', 'html', 'liquid', 'css'],
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    // These are all optional, defaults are shown:
    dir: {
      input: '.',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
  }
}
