import { Hashes } from '@the-traveler-times/bungie-api-gateway'

export async function getSpider(vendorHandler) {
	try {
		const spider = await vendorHandler.getStrippedDownVendorByHash(
			Hashes.SPIDER
		)
		return {
			isAvailable: true,
			...spider,
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
