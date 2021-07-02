import { Hashes } from '@the-traveler-times/bungie-api-gateway'

export async function getXur(vendorHandler, twitterHandler) {
  const xur = await vendorHandler.getStrippedDownVendorByHash(Hashes.XUR)

  const currentDate = new Date()
  const xurLeaveDate = new Date(xur.lastRefreshDate)
  xurLeaveDate.setDate(xurLeaveDate.getDate() + 4)

  if (currentDate > xurLeaveDate) {
    return { ...xur, isAvailable: false }
  }

  const searchDate = new Date(xur.lastRefreshDate)
  const location = await twitterHandler.getXurLocation(searchDate)

  return { ...xur, location, isAvailable: true }
}
