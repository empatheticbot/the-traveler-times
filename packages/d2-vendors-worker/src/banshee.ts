import { Hashes } from '@the-traveler-times/bungie-api-gateway'

export async function getBanshee(vendorHandler) {
  try {
    const banshee = await vendorHandler.getStrippedDownVendorByHash(
      Hashes.BANSHEE
    )
    return {
      isAvailable: true,
      ...banshee,
    }
  } catch (e) {
    if (e instanceof Error) {
      return {
        isAvailable: false,
        errorMessage: e.message,
      }
    }
    return {
      isAvailable: false,
    }
  }
}
