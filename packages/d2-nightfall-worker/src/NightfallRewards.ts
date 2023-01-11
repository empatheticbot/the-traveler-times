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
	SiliconNeuroma = '3355385170',
	SiliconNeuromaAdept = '1387987271',
	DutyBound = '435216110',
	DutyBoundAdept = '1135050595',
	HorrorsLeast = '1071542914',
	HorrorsLeastAdept = '1924276978',
	DFA = '4238497225',
	DFAAdept = '2006308129',
	MindbendersAmbition = '4117693024',
	MindbendersAmbitionAdept = '912150785',
	MilitiasBirthright = '40394833',
	MilitiasBirthrightAdept = '2378101424',
	Wendigo = '578459533',
	WendigoAdept = '555148853',
	Unknown = '773524094',
}

export const NightfallStrikeReward = {
	'The Scarlet Keep': [],
	'The Arms Dealer': ['2757144092'],
}

export const NightfallRewardPairs = [
	{
		nightfall: [NightfallRewards.MindbendersAmbition],
		grandmaster: [NightfallRewards.MindbendersAmbitionAdept],
	},
	{
		nightfall: [NightfallRewards.HorrorsLeast],
		grandmaster: [NightfallRewards.HorrorsLeastAdept],
	},
	{
		nightfall: [NightfallRewards.HungJury],
		grandmaster: [NightfallRewards.HungJuryAdept],
	},
	{
		nightfall: [NightfallRewards.MilitiasBirthright],
		grandmaster: [NightfallRewards.MilitiasBirthrightAdept],
	},
	{
		nightfall: [NightfallRewards.DFA],
		grandmaster: [NightfallRewards.DFAAdept],
	},
	{
		nightfall: [NightfallRewards.Wendigo],
		grandmaster: [NightfallRewards.WendigoAdept],
	},
	// {
	// 	nightfall: [NightfallRewards.TheHothead],
	// 	grandmaster: [NightfallRewards.TheHotheadAdept],
	// 	isUnknown: true,
	// },
	// {
	// 	nightfall: [NightfallRewards.PlugOne],
	// 	grandmaster: [NightfallRewards.PlugOneAdept],
	// 	isUnknown: true,
	// },
]
