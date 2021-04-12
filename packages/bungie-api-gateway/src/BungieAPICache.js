export default class BungieAPICache {
  async static getItemFromCache(hash) {
    const item = await DESTINY_HASH_CACHE.get(hash)
    if (item) {
      console.log('DESTINY_HASH_CACHE GET SUCCESS: ' + hash)
      return JSON.parse(item)
    }
    console.log('DESTINY_HASH_CACHE GET FAILURE: ' + hash)
    return null
  }

  static setItemInCache(hash, item, expiration) {
    console.log('DESTINY_HASH_CACHE PUT (Exp: ' + expiration + '): ' + hash)
    let exp
    if (expiration) {
      exp = { expiration: new Date(expiration).getTime() / 1000 }
    }
    try {
      DESTINY_HASH_CACHE.put(hash, JSON.stringify(item), exp)
    } catch (e) {
      console.log('DESTINY_HASH_CACHE PUT FAILED: ' + hash + ' - ' + e)
    }
  }
}

