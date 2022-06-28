import BungieAPIHandler from './BungieAPIHandler'
import { IRON_BANNER } from './Hashes'
export default class PublicMilestoneHandler {
	async init(bungieApiEnv: KVNamespace) {
		this.bungieAPIHandler = new BungieAPIHandler()
		await this.bungieAPIHandler.init(bungieApiEnv)
	}

	async getPublicMilestones() {
		let response = await this.bungieAPIHandler.callApi({
			path: `/Destiny2/Milestones/`,
			method: 'GET',
		})

		if (response.Message !== 'Ok') {
			throw new Error(
				`Failed to get public milestones with error: ${response.Message}`
			)
		}

		return response.Response
	}

	async getPublicMilestoneByHash(hash) {
		const milestones = await this.getPublicMilestones()

		const milestone = milestones[hash]

		if (milestone) {
			return milestone
		}
		throw new Error('Milestone hash id not found.')
	}
	// TODO: use this for weekly iron banner fetching
	async getIronBannerMilestone() {
		let milestone
		try {
			milestone = await this.getPublicMilestoneByHash(IRON_BANNER)
		} catch (e) {
			console.log('Iron Banner not available.')
			return { isAvailable: false }
		}
		return {
			...milestone,
			isAvailable: true,
		}
	}
}
