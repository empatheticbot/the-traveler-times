import { Hashes } from '@the-traveler-times/bungie-api-gateway'

export async function getAda(vendorHandler) {
  const ada = await vendorHandler.getStrippedDownVendorByHash(Hashes.ADA)

  return ada
}
