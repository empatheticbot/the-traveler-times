import { DefinitionHandler } from '@the-traveler-times/bungie-api-gateway'

export default {
  async fetch(request, env) {
    const definitionHandler = new DefinitionHandler()
    await definitionHandler.init(env.BUNGIE_API, env.DESTINY_2_DEFINITIONS)

    try {
      const seasonsInfo = await definitionHandler.getDefinitions(
        'DestinySeasonDefinition',
      )
      const seasons = Object.values(seasonsInfo)
      let currentSeason = {}
      let currentDate = new Date()
      for (const season of seasons) {
        const startDate = Date.parse(season.startDate)
        const endDate = Date.parse(season.endDate)
        if (startDate <= currentDate && endDate >= currentDate) {
          currentSeason = season
          break
        }
      }

      const nextSeasonIndex = currentSeason.index + 1
      let nextSeason
      for (const season of seasons) {
        if (season.index === nextSeasonIndex) {
          nextSeason = season
          break
        }
      }

      return new Response(
        JSON.stringify({ currentSeason, nextSeason, allSeasons: seasonsInfo }),
        {
          status: 200,
        },
      )
    } catch (e) {
      return new Response(e.message, {
        status: 500,
      })
    }
  },
}
