import { Hashes } from '@the-traveler-times/bungie-api-gateway'

export async function getBanshee(vendorHandler) {
  const banshee = await vendorHandler.getStrippedDownVendorByHash(
    Hashes.BANSHEE
  )

  return banshee
}
