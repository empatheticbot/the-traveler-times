import { DefinitionHandler } from '@the-traveler-times/bungie-api-gateway'


function getCurrentWeek(seasonStartDate: Date): number {
  const today = new Date()
  const weekInMilli = 1000 * 60 * 60 *24 * 7
  const diffInMilli = today.valueOf() - seasonStartDate.valueOf()
  return Math.ceil(diffInMilli / weekInMilli)
}
export default {
  async fetch(request, env) {
    const definitionHandler = new DefinitionHandler()
    await definitionHandler.init(env.BUNGIE_API)

    try {
      const seasonsInfo = await definitionHandler.getDefinitions(
        'DestinySeasonDefinition'
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

      const seasonalNode = await definitionHandler.getPresentationNode(
        '3443694067'
      )
      const weeklyNode = await definitionHandler.getPresentationNode(
        seasonalNode.children.presentationNodes[0].presentationNodeHash
      )
      const allWeekNodes = await Promise.all(
        weeklyNode.children.presentationNodes.map((node) => {
          return definitionHandler.getPresentationNode(
            node.presentationNodeHash
          )
        })
      )
      allWeekNodes.shift()
      const weeklyRecords = await Promise.all(
        allWeekNodes.map(async (weekNode) => {
          const challenges = await Promise.all(
            weekNode.children.records.map((record) =>
              definitionHandler.getRecord(record.recordHash)
            )
          )
          return { name: weekNode.displayProperties.name, challenges }
        })
      )

      let currentWeek = getCurrentWeek(new Date(currentSeason.startDate))
      if (currentWeek > weeklyRecords.length) {
        currentWeek = weeklyRecords.length
      }
      let currentWeekIndex = currentWeek - 1
      
      return new Response(
        JSON.stringify({
          currentSeason,
          nextSeason,
          allSeasons: seasonsInfo,
          seasonalChallenges: {
            currentWeekIndex,
            weeks: weeklyRecords,
            name: seasonalNode.displayProperties.name,
            icon: seasonalNode.displayProperties.icon,
            description: seasonalNode.displayProperties.description,
          },
        }),
        {
          status: 200,
        }
      )
    } catch (e) {
      return new Response(e.message, {
        status: 500,
      })
    }
  },
}
