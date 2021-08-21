export function getWeaponDataFromPGCR(data): WeaponStats[] {
  const players = data.entries.map((player) => {
    if (!player.extended.weapons) {
      return []
    }
    const weapons = player.extended.weapons.map((entry) => {
      const id = entry.referenceId
      const kills = entry.values.uniqueWeaponKills.basic.value
      const precisionKills = entry.values.uniqueWeaponPrecisionKills.basic.value
      return {
        id,
        kills,
        precisionKills,
      }
    })
    return weapons
  })
  return players.flat()
}

export async function getTopWeaponsBasedOnKills(weapons, numberOfWeapons = 10) {
  let w = [...weapons]
  w.sort((a, b) => b.kills - a.kills)
  return w.slice(0, numberOfWeapons)
}

export async function getTopWeaponsBasedOnUse(weapons, numberOfWeapons = 10) {
  let w = [...weapons]
  w.sort((a, b) => b.usage - a.usage)
  return w.slice(0, numberOfWeapons)
}
