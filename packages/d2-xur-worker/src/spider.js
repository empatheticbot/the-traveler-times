import {
	Hashes,
} from '@the-traveler-times/bungie-api-gateway'

export async function getSpider(vendorHandler) {
	const spider = await vendorHandler.getStrippedDownVendorByHash(Hashes.SPIDER)
	
	return spider
}