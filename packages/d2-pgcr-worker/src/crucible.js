export function getWeaponDataFromPGCR(data, env) {
  const players = data.entries.map((player) => {
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
