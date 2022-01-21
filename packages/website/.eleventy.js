const { DateTime } = require('luxon')
const fs = require('fs')
const pluginNavigation = require('@11ty/eleventy-navigation')
const sass = require('sass')
const CleanCSS = require('clean-css')
const fg = require('fast-glob')

const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const markdownFootnotes = require('markdown-it-footnote')
const markdownAccessibleLists = require('markdown-it-accessible-lists')

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginNavigation)

  eleventyConfig.setDataDeepMerge(true)

  eleventyConfig.addFilter('noWhiteSpace', (string) => {
    return string.replace(/\s/g, '')
  })

  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return DateTime.fromISO(dateObj, { zone: 'utc' }).toLocaleString(
      DateTime.DATE_HUGE
    )
  })

  eleventyConfig.addFilter('prettyNumber', (number) => {
    return number.toLocaleString()
  })

  eleventyConfig.addFilter('toIdCase', (string) => {
    if (string) {
      return string.toLowerCase().replace(/\s/g, '-')
    }
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
            !sale.subtitle.includes('Armor Set') &&
            !sale.name.includes('Additional Bounties') &&
            !sale.subtitle.includes('Warlock Legendary') &&
            !sale.subtitle.includes('Armor Synthesis')
          )
        })
      case 'Spider':
        return sales
          .filter((sale) => {
            return sale.name.includes('Purchase')
          })
          .map((sale) => ({
            ...sale,
            name: sale.name.replace('Purchase ', ''),
          }))
      case 'Xûr':
        return sales.filter((sale) => {
          return !sale.subtitle.includes('Warlock Legendary')
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

  eleventyConfig.addFilter('contains', (array, key, strings) => {
    return array.filter((item) => {
      if (item[key]) {
        let found = false
        strings.forEach((string) => {
          if (item[key].includes(string)) {
            found = true
          }
        })
        return found
      }
      return false
    })
  })

  eleventyConfig.addNunjucksAsyncShortcode('scss', async function (globs) {
    const entries = await fg(globs)
    let results = []
    for (const entry of entries) {
      const result = sass.renderSync({
        file: entry,
      })
      results.push(result.css.toString())
    }
    return new CleanCSS({}).minify(results.join('')).styles
  })

  eleventyConfig.addPassthroughCopy('assets')
  eleventyConfig.addPassthroughCopy({
    'node_modules/@empatheticbot/date-elements/dist/': 'js/date-elements',
  })
  eleventyConfig.addPassthroughCopy({
    'node_modules/@empatheticbot/on-intersection-element/dist/':
      'js/on-intersection-element',
  })

  /* Markdown Overrides */
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  })
    .use(markdownFootnotes)
    .use(markdownAccessibleLists)

  eleventyConfig.setLibrary('md', markdownLibrary)

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
