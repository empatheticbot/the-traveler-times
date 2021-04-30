const startingDate = new Date('Feburary 14, 2021 17:00:00 GMT')

const availableLostSectors = [
  { name: 'K1 Communion', master: '2829206720', legend: '2829206727' },
  { name: 'K1 Crew Quarters', master: '184186578', legend: '184186581' },
  { name: 'K1 Revelation', master: '3911969238', legend: '3911969233' },
  { name: 'Concealed Void', master: '912873274', legend: '912873277' },
  { name: 'Bunker E15', master: '1648125538', legend: '1648125541' },
  { name: 'Perdition', master: '1070981425', legend: '1070981430' },
  { name: 'Exodus Garden 2A', master: '2936791995', legend: '2936791996' },
  { name: 'Veles Labyrinth', master: '3094493727', legend: '3094493720' },
  { name: 'K1 Logistics', master: '567131519', legend: '567131512' },
]

const rewards = [
  { name: 'Arms', master: '256080248', legend: '1572351682' },
  { name: 'Chest', master: '2686128774', legend: '176055472' },
  { name: 'Head', master: '2679019194', legend: '1387420892' },
  { name: 'Legs', master: '247000308', legend: '2850782006' },
]

export function getCurrentLostSectorHashes() {
  const today = new Date()
  const daysFromStart = Math.floor(
    (today - startingDate) / (1000 * 60 * 60 * 24),
  )

  const masterLostSectorIndex = daysFromStart % availableLostSectors.length
  const legendLostSectorIndex =
    masterLostSectorIndex === availableLostSectors.length - 1
      ? 0
      : masterLostSectorIndex + 1

  const masterRewardIndex = daysFromStart % rewards.length
  const legendRewardIndex =
    masterRewardIndex === rewards.length - 1 ? 0 : masterRewardIndex + 1
  console.log(
    'day: ',
    startingDate.toISOString(),
    today.toISOString(),
    today - startingDate,
    (today - startingDate) / (1000 * 60 * 60 * 24),
  )
  return {
    master: {
      name: availableLostSectors[masterLostSectorIndex].name,
      hash: availableLostSectors[masterLostSectorIndex].master,
      level: '1330',
      difficulty: 'Master',
      rewards: [
        {
          name: rewards[masterRewardIndex].name,
          hash: rewards[masterRewardIndex].master,
        },
        {
          name: 'Enhancement Cores',
          hash: '3632457717',
        },
      ],
    },
    legend: {
      name: availableLostSectors[legendLostSectorIndex].name,
      hash: availableLostSectors[legendLostSectorIndex].legend,
      level: '1300',
      difficulty: 'Legend',
      rewards: [
        {
          name: rewards[legendRewardIndex].name,
          hash: rewards[legendRewardIndex].legend,
        },
        {
          name: 'Enhancement Cores',
          hash: '3632457717',
        },
      ],
    },
  }
}