const startingDate = new Date('May 23, 2023 17:00:00 GMT')

const availableLostSectors = [
	{ name: 'K1 Revelation', master: '3911969238', legend: '3911969233' },
	{ name: 'K1 Crew Quarters', master: '184186578', legend: '184186581' },
	{ name: 'K1 Logistics', master: '567131519', legend: '567131512' },
	{ name: 'K1 Communion', master: '2829206720', legend: '2829206727' },
	{ name: 'Sepulcher', master: '480864721', legend: '480864726' },
	{ name: 'Extraction', master: '145221020', legend: '145221019' },
	{ name: "Aphelion's Rest", master: '1898610131', legend: '1898610132' },
	{ name: 'Chamber of Starlight', master: '4206916276', legend: '4206916275' },
	{ name: 'Bay of Drowned Wishes', master: '660710120', legend: '660710127' },
	{ name: 'Veles Labyrinth', master: '3094493727', legend: '3094493720' },
	{ name: 'Exodus Garden 2A', master: '2936791995', legend: '2936791996' },
	// Previously available Lost Sectors
	// { name: 'Perdition', master: '1070981425', legend: '1070981430' },
	// { name: 'Bunker E15', master: '1648125538', legend: '1648125541' },
	// { name: 'The Conflux', master: '1163502296', legend: '1163502303' },
	// { name: 'Thrilladrome', master: '584726931', legend: '584726932' },
	// { name: 'Hydroponics Delta', master: '1869786719', legend: '1869786712' },
	// { name: 'Gilded Precept', master: '2983905030', legend: '2983905025' },
	// { name: 'Excavation Site XII', master: '3350278552', legend: '3350278559' },
	// {
	// 	name: 'Skydock IV',
	// 	master: '55186256',
	// 	legend: '55186263',
	// 	overrides: { pgcrImage: '/img/destiny_content/pgcr/skydock_iv.jpg' },
	// },
	// { name: 'The Quarry', master: '1344654779', legend: '1344654780' },
	// { name: 'Concealed Void', master: '912873274', legend: '912873277' },
	// { name: "Scavenger's Den", master: '144485117', legend: '144485114' },
	// { name: 'Concealed Void', master: '912873274', legend: '912873277' },
	// { name: 'The Rift', master: '1551471974', legend: '1551471969' },
	// { name: 'Metamorphosis', master: '3678847134', legend: '3678847129' },
	// { name: "Aphelion's Rest", master: '1898610131', legend: '1898610132' },
	// { name: 'Chamber of Starlight', master: '4206916276', legend: '4206916275' },
	// { name: 'Perdition', master: '1070981425', legend: '1070981430' },
	// { name: 'The Empty Tank', master: '2019961993', legend: '2019961998' },
]

const rewards = [
	{ name: 'Chest', master: '2686128774', legend: '176055472' },
	{ name: 'Head', master: '2679019194', legend: '1387420892' },
	{ name: 'Legs', master: '247000308', legend: '2850782006' },
	{ name: 'Arms', master: '256080248', legend: '1572351682' },
]

export function getCurrentLostSectorHashes() {
	const today = new Date()
	const daysFromStart = Math.floor(
		(today.valueOf() - startingDate.valueOf()) / (1000 * 60 * 60 * 24)
	)

	const lostSectorIndex = daysFromStart % availableLostSectors.length
	const rewardIndex = daysFromStart % rewards.length

	return {
		overrides: availableLostSectors[lostSectorIndex].overrides,
		master: {
			name: availableLostSectors[lostSectorIndex].name,
			hash: availableLostSectors[lostSectorIndex].master,
			level: '1610',
			difficulty: 'Master',
			rewards: [
				{
					name: rewards[rewardIndex].name,
					hash: rewards[rewardIndex].master,
				},
				{
					name: 'Enhancement Cores',
					hash: '3632457717',
				},
			],
		},
		legend: {
			name: availableLostSectors[lostSectorIndex].name,
			hash: availableLostSectors[lostSectorIndex].legend,
			level: '1580',
			difficulty: 'Legend',
			rewards: [
				{
					name: rewards[rewardIndex].name,
					hash: rewards[rewardIndex].legend,
				},
				{
					name: 'Enhancement Cores',
					hash: '3632457717',
				},
			],
		},
	}
}
