import DefinitionHandler from './DefinitionHandler'

export default class TwitterHandler {
  seasonsInfo: unknown

  async init(bungieApiEnv) {
    this.definitionHandler = new DefinitionHandler()
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
      if (startDate <= currentDate.valueOf() && endDate >= currentDate.valueOf()) {
        currentSeason = season
        break
      }
    }
    return currentSeason
  }

  getNextSeason() {
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
}