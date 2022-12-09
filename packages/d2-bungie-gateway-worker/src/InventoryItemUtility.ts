export function getStrippedItems(items) {
	return items.map(getStrippedItem)
}

function filterSocket(socket) {
	return (
		!socket.displayProperties.name.includes('Upgrade Armor') &&
		!socket.displayProperties.name.includes('Change Energy Type') &&
		socket.displayProperties.name !== '' &&
		socket.hash !== 2513659710
	)
}

export function stripSockets(sockets) {
	if (Array.isArray(sockets)) {
		const strippedSockets = sockets.map((socketGroup) => {
			return socketGroup.filter(filterSocket)
		})

		const cleanSockets = []
		strippedSockets.forEach((socket) => {
			if (socket.length > 0) {
				cleanSockets.push(socket)
			}
		})
		return cleanSockets
	}
	return sockets
}

export function getStrippedItem(item) {
	return {
		name: item.displayProperties.name,
		icon: item.displayProperties.icon,
		itemType: item.itemTypeAndTierDisplayName,
		classType: item.classType || '',
		damageType: (item.damageType && item.damageType.displayProperties) || '',
		subtitle: `${
			(item.damageType && item.damageType.displayProperties.name) ||
			item.classType ||
			''
		} ${item.itemTypeAndTierDisplayName}`.trim(),
		quantity: item.quantity,
		description:
			item.displayProperties.description ||
			item.displaySource ||
			item.flavorText ||
			'',
		sort: item.itemType,
		sockets: stripSockets(item.sockets),
		costs:
			item.costs &&
			item.costs.map((cost) => {
				return {
					name: cost.displayProperties.name,
					icon: cost.displayProperties.icon,
					description: cost.displayProperties.description,
					source: cost.displaySource,
					quantity: cost.quantity,
				}
			}),
	}
}
