export async function getWeapons(env) {
  let weapons = []
  let cursor = true

  while (cursor) {
    const list = await env.DESTINY_2_PGCR.list(
      cursor === true ? {} : { cursor: cursor }
    )

    cursor = list.list_complete ? false : list.cursor

    for (const key of list.keys) {
      weapons.push(await env.DESTINY_2_PGCR.get(key.name, 'json'))
    }
  }
  return weapons
}

export function getWeaponDataFromPGCR(data) {
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
