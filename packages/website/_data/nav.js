const getMeta = require('./meta')
const getVendors = require('./vendors')
const getWeekly = require('./weekly')

module.exports = async function () {
  const meta = await getMeta()
  const vendors = await getVendors()
  const weekly = await getWeekly()

  return [meta, vendors, weekly]
}
