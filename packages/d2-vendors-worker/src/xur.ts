import { Hashes } from '@the-traveler-times/bungie-api-gateway'

export async function getXur(vendorHandler, twitterHandler) {
	try {
		const xur = await vendorHandler.getStrippedDownVendorByHash(Hashes.XUR)

		const currentDate = new Date()
		const xurLeaveDate = xur.lastRefreshDate
			? new Date(xur.lastRefreshDate)
			: null

		xurLeaveDate?.setDate(xurLeaveDate.getDate() + 4)

		if (!xurLeaveDate || currentDate > xurLeaveDate) {
			return { ...xur, isAvailable: false }
		}

		const searchDate = new Date(xur.lastRefreshDate)
		const location = await twitterHandler.getXurLocation(searchDate)

		return { ...xur, location, isAvailable: true }
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
