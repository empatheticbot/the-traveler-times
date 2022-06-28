import { Hashes } from '@the-traveler-times/bungie-api-gateway'

export async function getAda(vendorHandler) {
	try {
		const ada = await vendorHandler.getStrippedDownVendorByHash(Hashes.ADA)

		return {
			isAvailable: true,
			...ada,
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
