import { Hashes } from '@the-traveler-times/bungie-api-gateway'

export async function getRahool(vendorHandler) {
	try {
		const rahool = await vendorHandler.getStrippedDownVendorByHash(
			Hashes.RAHOOL
		)
		for (const sale of rahool.sales) {
			if (sale.name.includes('Purchase')) {
				sale.name = sale.name.replace('Purchase', '').trim()
			}
			if (sale.name.includes('Glimmer') && !sale.subtitle) {
				sale.subtitle = 'Currency'
			}
			if (!sale.subtitle) {
				if (
					sale.name.includes('Enhancement') ||
					sale.name.includes('Ascendant')
				) {
					sale.subtitle = 'Legendary Material'
				}
			}
		}
		return {
			isAvailable: true,
			...rahool,
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
