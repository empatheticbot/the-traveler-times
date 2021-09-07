export enum NightfallRewards {
  ShadowPrice = '2633186522',
  ShadowPriceAdept = '2147010335',
  TheComedian = '1028582252',
  TheComedianAdept = '2443900757',
  ThePalindrome = '432476743',
  ThePalindromeAdept = '1481892490',
  TheSwarm = '47772649',
  TheSwarmAdept = '3836861464',
  PlugOne = '1289000550',
  PlugOneAdept = '534775659',
  HungJury = '4281371574',
  HungJuryAdept = '681067419',
  Uzume = '2065081837',
  UzumeAdept = '852228780',
  TheHothead = '4255171531',
  TheHotheadAdept = '1866778462',
  Unknown = '773524094',
}

export const NightfallRewardPairs = [
  {
    nightfall: [NightfallRewards.TheComedian, NightfallRewards.ShadowPrice],
    grandmaster: [
      NightfallRewards.TheComedianAdept,
      NightfallRewards.ShadowPriceAdept,
    ],
  },
  {
    nightfall: [NightfallRewards.TheHothead, NightfallRewards.HungJury],
    grandmaster: [
      NightfallRewards.TheHotheadAdept,
      NightfallRewards.HungJuryAdept,
    ],
  },
  {
    nightfall: [NightfallRewards.TheComedian, NightfallRewards.Uzume],
    grandmaster: [
      NightfallRewards.TheComedianAdept,
      NightfallRewards.UzumeAdept,
    ],
  },
  {
    nightfall: [NightfallRewards.Unknown, NightfallRewards.Unknown],
    grandmaster: [NightfallRewards.Unknown, NightfallRewards.Unknown],
  },
]
