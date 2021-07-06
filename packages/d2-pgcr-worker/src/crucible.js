export function handleCrucbileGameData(data, env) {
  const weapons = data.entries.map(entry => {
    const id = entry.referenceId
    const kills = entry.values.uniqueWeaponKills.basic.value
    const precisionKills = entry.values.uniqueWeaponPrecisionKills.basic.value
    return {
      id,
      kills,
      precisionKills
    }
  })
}