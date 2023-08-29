// import { FESTIVAL_OF_THE_LOST } from './Hashes'
import DefinitionHandler from './DefinitionHandler'
import BungieAPIHandler from './BungieAPIHandler'

export default class SeasonHandler {
	seasonsInfo: unknown
	bungieAPIHandler: BungieAPIHandler
	definitionHandler: DefinitionHandler

	constructor() {
		this.bungieAPIHandler = new BungieAPIHandler()
		this.definitionHandler = new DefinitionHandler()
	}

	async init(bungieApiEnv: KVNamespace) {
		await this.bungieAPIHandler.init(bungieApiEnv)
		await this.definitionHandler.init(bungieApiEnv)
		this.seasonsInfo = await this.definitionHandler.getDefinitions(
			'DestinySeasonDefinition'
		)
	}

	getCurrentSeason() {
		const seasons = Object.values(this.seasonsInfo)
		let currentSeason = {}
		let currentDate = new Date()
		for (const season of seasons) {
			const startDate = Date.parse(season.startDate)
			const endDate = Date.parse(season.endDate)
			if (
				startDate <= currentDate.valueOf() &&
				endDate >= currentDate.valueOf()
			) {
				currentSeason = season
				break
			}
		}
		return currentSeason
	}

	getCurrentSeasonId(): number {
		return this.getCurrentSeason().seasonNumber
	}

	getNextSeason() {
		const seasons = Object.values(this.seasonsInfo)
		const currentSeason = this.getCurrentSeason()
		const nextSeasonIndex = currentSeason.index + 1
		let nextSeason
		for (const season of seasons) {
			if (season.index === nextSeasonIndex) {
				nextSeason = season
				break
			}
		}
		return nextSeason
	}

	getAllSeasons() {
		return this.seasonsInfo
	}

	getCurrentWeek(): number {
		const currentSeason = this.getCurrentSeason()
		const seasonStartDate = Date.parse(currentSeason.startDate)
		const today = new Date()
		const weekInMilli = 1000 * 60 * 60 * 24 * 7
		const diffInMilli = today.valueOf() - seasonStartDate
		return Math.ceil(diffInMilli / weekInMilli)
	}

	isFirstWeekOfSeason(): boolean {
		return this.getCurrentWeek() < 2
	}

	async getFestivalOfTheLost() {
		// const milestones = await this.bungieAPIHandler.getCharacterMilestones()
		// const festivalOfTheLostMilestone = milestones[FESTIVAL_OF_THE_LOST]
		// if (festivalOfTheLostMilestone) {
		// 	const definition = await this.definitionHandler.getMilestone(
		// 		FESTIVAL_OF_THE_LOST
		// 	)
		// 	return {
		// 		...festivalOfTheLostMilestone,
		// 		...definition,
		// 		isAvailable: true,
		// 	}
		// }
		return {
			isAvailable: false,
		}
	}
}
