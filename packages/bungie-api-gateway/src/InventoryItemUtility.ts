export function getStrippedItems(items) {
  return items.map(getStrippedItem)
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
    sockets: item.sockets,
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
