/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../bungie-api-gateway/src/BungieAPICache.js":
/*!***************************************************!*\
  !*** ../bungie-api-gateway/src/BungieAPICache.js ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return BungieAPICache; });
class BungieAPICache {
  async getItemFromCache(hash) {
    const item = await DESTINY_HASH_CACHE.get(hash)
    if (item) {
      console.log('DESTINY_HASH_CACHE GET SUCCESS: ' + hash)
      return JSON.parse(item)
    }
    console.log('DESTINY_HASH_CACHE GET FAILURE: ' + hash)
    return null
  }

  setItemInCache(hash, item, expiration) {
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


/***/ }),

/***/ "../bungie-api-gateway/src/BungieAPIError.js":
/*!***************************************************!*\
  !*** ../bungie-api-gateway/src/BungieAPIError.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

class BungieAPIError extends Error {
  constructor(url, ...args) {
    const fullMessage = `Occurred during call to the endpoint: ${url}`
    super(fullMessage, ...args)
    this.message = fullMessage
    this.name = 'Bungie API failed'
  }
}

module.exports = BungieAPIError


/***/ }),

/***/ "../bungie-api-gateway/src/BungieAPIHandler.js":
/*!*****************************************************!*\
  !*** ../bungie-api-gateway/src/BungieAPIHandler.js ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return BungieAPIHandler; });
/* harmony import */ var _BungieAPIError__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BungieAPIError */ "../bungie-api-gateway/src/BungieAPIError.js");
/* harmony import */ var _BungieAPIError__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_BungieAPIError__WEBPACK_IMPORTED_MODULE_0__);


class BungieAPIHandler {
  constructor({
    apiKey,
    oauthToken,
    membershipId,
    membershipType,
    characterId,
  }) {
    this.apiKey = apiKey
    this.oauthToken = oauthToken
    this.membershipId = membershipId
    this.membershipType = membershipType
    this.characterId = characterId
  }

  /**
   * Adds the API Key to the request header.
   */
  addApiKeyToHeader(options) {
    const update = { ...options }
    update.headers = {
      ...update.headers,
      Authorization: 'Bearer ' + this.oauthToken,
      'X-API-Key': this.apiKey,
    }
    return update
  }

  /**
   * Calls the api for passed in options and parses into JSON response;
   */
  async callApi(options) {
    console.log('CALL: ' + options.path)
    let resp
    try {
      resp = await fetch(
        'https://www.bungie.net/Platform' + options.path,
        this.addApiKeyToHeader(options)
      )
    } catch (e) {
      console.error(`Failed to call bungie platform api ${e}`)
      throw e
    }
    if (resp.status === 401) {
      console.error(
        'Unauthorized from Bungie API. Check to make sure credentials are updated.'
      )
    } else if (!resp.ok) {
      throw new _BungieAPIError__WEBPACK_IMPORTED_MODULE_0___default.a(resp.url, resp.headers)
    }
    return resp.json()
  }

  async callBungieNet(options) {
    let resp = await fetch('https://www.bungie.net/' + options.path)
    if (!resp.ok) {
      throw new _BungieAPIError__WEBPACK_IMPORTED_MODULE_0___default.a(resp.url, resp.headers)
    }
    return resp.json()
  }

  /**
   * Gets current version of the Destiny API manifest.
   * Links to sqlite database file containing information on items/entities etc.
   * Useful for large/frequent requests for item information and other things.
   */
  async getManifest() {
    let options = {
      path: '/Destiny2/Manifest/',
      method: 'GET',
    }
    let manifestResponse = await this.callApi(options)

    return manifestResponse.Response
  }

  /**
   * Gets current version of the Destiny API manifest.
   * Links to sqlite database file containing information on items/entities etc.
   * Useful for large/frequent requests for item information and other things.
   */
  async getManifestDefinition(entityType, hash) {
    let options = {
      path: `/Destiny2/Manifest/${entityType}/${hash}/`,
      method: 'GET',
    }
    return await this.callApi(options)
  }

  async getCompleteManifest() {
    const manifest = await this.getManifest()

    return this.callBungieNet({ path: manifest.jsonWorldContentPaths.en })
  }

  async getDefinitionFromManifest(definition) {
    if (typeof definition !== 'string') {
      throw new Error(
        'Parameter `definition` is required and must be of type string.'
      )
    }

    const manifest = await this.getManifest()
    const definitionPath =
      manifest.jsonWorldComponentContentPaths.en[definition]

    if (!definitionPath) {
      throw new Error(
        `Parameter 'definition' with value of ${definition} does not exist in the Destiny 2 Manifest.`
      )
    }

    return this.callBungieNet({ path: definitionPath })
  }
}


/***/ }),

/***/ "../bungie-api-gateway/src/index.js":
/*!******************************************!*\
  !*** ../bungie-api-gateway/src/index.js ***!
  \******************************************/
/*! exports provided: BungieAPICache, BungieAPIError, BungieAPIHandler */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _BungieAPICache__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BungieAPICache */ "../bungie-api-gateway/src/BungieAPICache.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BungieAPICache", function() { return _BungieAPICache__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _BungieAPIError__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./BungieAPIError */ "../bungie-api-gateway/src/BungieAPIError.js");
/* harmony import */ var _BungieAPIError__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_BungieAPIError__WEBPACK_IMPORTED_MODULE_1__);
/* harmony reexport (default from non-harmony) */ __webpack_require__.d(__webpack_exports__, "BungieAPIError", function() { return _BungieAPIError__WEBPACK_IMPORTED_MODULE_1___default.a; });
/* harmony import */ var _BungieAPIHandler__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./BungieAPIHandler */ "../bungie-api-gateway/src/BungieAPIHandler.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BungieAPIHandler", function() { return _BungieAPIHandler__WEBPACK_IMPORTED_MODULE_2__["default"]; });








/***/ }),

/***/ "../utils/src/index.js":
/*!*****************************!*\
  !*** ../utils/src/index.js ***!
  \*****************************/
/*! exports provided: chunkArray */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "chunkArray", function() { return chunkArray; });
function chunkArray(array, chunk) {
  return array.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / chunk)

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [] // start a new chunk
    }

    resultArray[chunkIndex].push(item)

    return resultArray
  }, [])
}


/***/ }),

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _the_traveler_times_bungie_api_gateway__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @the-traveler-times/bungie-api-gateway */ "../bungie-api-gateway/src/index.js");
/* harmony import */ var _utils_src__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/src */ "../utils/src/index.js");



const blacklist = ['DestinyInventoryItemDefinition']

async function handleRequest(request) {
  const definitionWorkerUrl = await DESTINY_2_DEFINITIONS.get(
    'DEFINITION_WORKER_URL'
  )

  const apiKey = await BUNGIE_API.get('KEY')
  const oauthToken = await BUNGIE_API.get('OAUTH_TOKEN')
  const membershipId = await BUNGIE_API.get('MEMBERSHIP_ID')
  const membershipType = await BUNGIE_API.get('MEMBERSHIP_TYPE')
  const characterId = await BUNGIE_API.get('CHARACTER_ID')

  const bungieAPIHandler = new _the_traveler_times_bungie_api_gateway__WEBPACK_IMPORTED_MODULE_0__["BungieAPIHandler"]({
    apiKey,
    oauthToken,
    membershipId,
    membershipType,
    characterId,
  })

  const manifest = await bungieAPIHandler.getManifest()
  const definitionsObject = { ...manifest.jsonWorldComponentContentPaths.en }

  const definitions = Object.entries(definitionsObject).reduce((arr, pair) => {
    const [definition, url] = pair
    if (blacklist.includes(definition)) {
      return arr
    }
    arr.push({ definition, url })
    return arr
  }, [])

  const chunkedDefinitions = Object(_utils_src__WEBPACK_IMPORTED_MODULE_1__["chunkArray"])(definitions, 5)
  const definitionRequests = []

  for (const defs of chunkedDefinitions) {
    definitionRequests(
      fetch(definitionWorkerUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({ definitions: defs }),
      })
    )
  }

  const allDefinitions = await Promise.all(definitionRequests)

  return new Response(JSON.stringify({ definitions: allDefinitions }), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      status: 200,
    },
  })
}

addEventListener('fetch', event => {
  return event.respondWith(handleRequest(event.request))
})


/***/ })

/******/ });
//# sourceMappingURL=worker.js.map{"version":3,"file":"worker.js","sources":["webpack:///webpack/bootstrap","webpack:///../bungie-api-gateway/src/BungieAPICache.js","webpack:///../bungie-api-gateway/src/BungieAPIError.js","webpack:///../bungie-api-gateway/src/BungieAPIHandler.js","webpack:///../bungie-api-gateway/src/index.js","webpack:///../utils/src/index.js","webpack:///./index.js"],"sourcesContent":[" \t// The module cache\n \tvar installedModules = {};\n\n \t// The require function\n \tfunction __webpack_require__(moduleId) {\n\n \t\t// Check if module is in cache\n \t\tif(installedModules[moduleId]) {\n \t\t\treturn installedModules[moduleId].exports;\n \t\t}\n \t\t// Create a new module (and put it into the cache)\n \t\tvar module = installedModules[moduleId] = {\n \t\t\ti: moduleId,\n \t\t\tl: false,\n \t\t\texports: {}\n \t\t};\n\n \t\t// Execute the module function\n \t\tmodules[moduleId].call(module.exports, module, module.exports, __webpack_require__);\n\n \t\t// Flag the module as loaded\n \t\tmodule.l = true;\n\n \t\t// Return the exports of the module\n \t\treturn module.exports;\n \t}\n\n\n \t// expose the modules object (__webpack_modules__)\n \t__webpack_require__.m = modules;\n\n \t// expose the module cache\n \t__webpack_require__.c = installedModules;\n\n \t// define getter function for harmony exports\n \t__webpack_require__.d = function(exports, name, getter) {\n \t\tif(!__webpack_require__.o(exports, name)) {\n \t\t\tObject.defineProperty(exports, name, { enumerable: true, get: getter });\n \t\t}\n \t};\n\n \t// define __esModule on exports\n \t__webpack_require__.r = function(exports) {\n \t\tif(typeof Symbol !== 'undefined' && Symbol.toStringTag) {\n \t\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });\n \t\t}\n \t\tObject.defineProperty(exports, '__esModule', { value: true });\n \t};\n\n \t// create a fake namespace object\n \t// mode & 1: value is a module id, require it\n \t// mode & 2: merge all properties of value into the ns\n \t// mode & 4: return value when already ns object\n \t// mode & 8|1: behave like require\n \t__webpack_require__.t = function(value, mode) {\n \t\tif(mode & 1) value = __webpack_require__(value);\n \t\tif(mode & 8) return value;\n \t\tif((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;\n \t\tvar ns = Object.create(null);\n \t\t__webpack_require__.r(ns);\n \t\tObject.defineProperty(ns, 'default', { enumerable: true, value: value });\n \t\tif(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));\n \t\treturn ns;\n \t};\n\n \t// getDefaultExport function for compatibility with non-harmony modules\n \t__webpack_require__.n = function(module) {\n \t\tvar getter = module && module.__esModule ?\n \t\t\tfunction getDefault() { return module['default']; } :\n \t\t\tfunction getModuleExports() { return module; };\n \t\t__webpack_require__.d(getter, 'a', getter);\n \t\treturn getter;\n \t};\n\n \t// Object.prototype.hasOwnProperty.call\n \t__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };\n\n \t// __webpack_public_path__\n \t__webpack_require__.p = \"\";\n\n\n \t// Load entry module and return exports\n \treturn __webpack_require__(__webpack_require__.s = \"./index.js\");\n","export default class BungieAPICache {\n  async getItemFromCache(hash) {\n    const item = await DESTINY_HASH_CACHE.get(hash)\n    if (item) {\n      console.log('DESTINY_HASH_CACHE GET SUCCESS: ' + hash)\n      return JSON.parse(item)\n    }\n    console.log('DESTINY_HASH_CACHE GET FAILURE: ' + hash)\n    return null\n  }\n\n  setItemInCache(hash, item, expiration) {\n    console.log('DESTINY_HASH_CACHE PUT (Exp: ' + expiration + '): ' + hash)\n    let exp\n    if (expiration) {\n      exp = { expiration: new Date(expiration).getTime() / 1000 }\n    }\n    try {\n      DESTINY_HASH_CACHE.put(hash, JSON.stringify(item), exp)\n    } catch (e) {\n      console.log('DESTINY_HASH_CACHE PUT FAILED: ' + hash + ' - ' + e)\n    }\n  }\n}\n","class BungieAPIError extends Error {\n  constructor(url, ...args) {\n    const fullMessage = `Occurred during call to the endpoint: ${url}`\n    super(fullMessage, ...args)\n    this.message = fullMessage\n    this.name = 'Bungie API failed'\n  }\n}\n\nmodule.exports = BungieAPIError\n","import BungieAPIError from './BungieAPIError'\n\nexport default class BungieAPIHandler {\n  constructor({\n    apiKey,\n    oauthToken,\n    membershipId,\n    membershipType,\n    characterId,\n  }) {\n    this.apiKey = apiKey\n    this.oauthToken = oauthToken\n    this.membershipId = membershipId\n    this.membershipType = membershipType\n    this.characterId = characterId\n  }\n\n  /**\n   * Adds the API Key to the request header.\n   */\n  addApiKeyToHeader(options) {\n    const update = { ...options }\n    update.headers = {\n      ...update.headers,\n      Authorization: 'Bearer ' + this.oauthToken,\n      'X-API-Key': this.apiKey,\n    }\n    return update\n  }\n\n  /**\n   * Calls the api for passed in options and parses into JSON response;\n   */\n  async callApi(options) {\n    console.log('CALL: ' + options.path)\n    let resp\n    try {\n      resp = await fetch(\n        'https://www.bungie.net/Platform' + options.path,\n        this.addApiKeyToHeader(options)\n      )\n    } catch (e) {\n      console.error(`Failed to call bungie platform api ${e}`)\n      throw e\n    }\n    if (resp.status === 401) {\n      console.error(\n        'Unauthorized from Bungie API. Check to make sure credentials are updated.'\n      )\n    } else if (!resp.ok) {\n      throw new BungieAPIError(resp.url, resp.headers)\n    }\n    return resp.json()\n  }\n\n  async callBungieNet(options) {\n    let resp = await fetch('https://www.bungie.net/' + options.path)\n    if (!resp.ok) {\n      throw new BungieAPIError(resp.url, resp.headers)\n    }\n    return resp.json()\n  }\n\n  /**\n   * Gets current version of the Destiny API manifest.\n   * Links to sqlite database file containing information on items/entities etc.\n   * Useful for large/frequent requests for item information and other things.\n   */\n  async getManifest() {\n    let options = {\n      path: '/Destiny2/Manifest/',\n      method: 'GET',\n    }\n    let manifestResponse = await this.callApi(options)\n\n    return manifestResponse.Response\n  }\n\n  /**\n   * Gets current version of the Destiny API manifest.\n   * Links to sqlite database file containing information on items/entities etc.\n   * Useful for large/frequent requests for item information and other things.\n   */\n  async getManifestDefinition(entityType, hash) {\n    let options = {\n      path: `/Destiny2/Manifest/${entityType}/${hash}/`,\n      method: 'GET',\n    }\n    return await this.callApi(options)\n  }\n\n  async getCompleteManifest() {\n    const manifest = await this.getManifest()\n\n    return this.callBungieNet({ path: manifest.jsonWorldContentPaths.en })\n  }\n\n  async getDefinitionFromManifest(definition) {\n    if (typeof definition !== 'string') {\n      throw new Error(\n        'Parameter `definition` is required and must be of type string.'\n      )\n    }\n\n    const manifest = await this.getManifest()\n    const definitionPath =\n      manifest.jsonWorldComponentContentPaths.en[definition]\n\n    if (!definitionPath) {\n      throw new Error(\n        `Parameter 'definition' with value of ${definition} does not exist in the Destiny 2 Manifest.`\n      )\n    }\n\n    return this.callBungieNet({ path: definitionPath })\n  }\n}\n","import BungieAPICache from './BungieAPICache'\nimport BungieAPIError from './BungieAPIError'\nimport BungieAPIHandler from './BungieAPIHandler'\n\nexport { BungieAPICache, BungieAPIError, BungieAPIHandler }\n","export function chunkArray(array, chunk) {\n  return array.reduce((resultArray, item, index) => {\n    const chunkIndex = Math.floor(index / chunk)\n\n    if (!resultArray[chunkIndex]) {\n      resultArray[chunkIndex] = [] // start a new chunk\n    }\n\n    resultArray[chunkIndex].push(item)\n\n    return resultArray\n  }, [])\n}\n","import { BungieAPIHandler } from '@the-traveler-times/bungie-api-gateway'\nimport { chunkArray } from '../utils/src'\n\nconst blacklist = ['DestinyInventoryItemDefinition']\n\nasync function handleRequest(request) {\n  const definitionWorkerUrl = await DESTINY_2_DEFINITIONS.get(\n    'DEFINITION_WORKER_URL'\n  )\n\n  const apiKey = await BUNGIE_API.get('KEY')\n  const oauthToken = await BUNGIE_API.get('OAUTH_TOKEN')\n  const membershipId = await BUNGIE_API.get('MEMBERSHIP_ID')\n  const membershipType = await BUNGIE_API.get('MEMBERSHIP_TYPE')\n  const characterId = await BUNGIE_API.get('CHARACTER_ID')\n\n  const bungieAPIHandler = new BungieAPIHandler({\n    apiKey,\n    oauthToken,\n    membershipId,\n    membershipType,\n    characterId,\n  })\n\n  const manifest = await bungieAPIHandler.getManifest()\n  const definitionsObject = { ...manifest.jsonWorldComponentContentPaths.en }\n\n  const definitions = Object.entries(definitionsObject).reduce((arr, pair) => {\n    const [definition, url] = pair\n    if (blacklist.includes(definition)) {\n      return arr\n    }\n    arr.push({ definition, url })\n    return arr\n  }, [])\n\n  const chunkedDefinitions = chunkArray(definitions, 5)\n  const definitionRequests = []\n\n  for (const defs of chunkedDefinitions) {\n    definitionRequests(\n      fetch(definitionWorkerUrl, {\n        method: 'POST',\n        headers: {\n          'content-type': 'application/json;charset=utf-8',\n        },\n        body: JSON.stringify({ definitions: defs }),\n      })\n    )\n  }\n\n  const allDefinitions = await Promise.all(definitionRequests)\n\n  return new Response(JSON.stringify({ definitions: allDefinitions }), {\n    headers: {\n      'content-type': 'application/json;charset=UTF-8',\n      status: 200,\n    },\n  })\n}\n\naddEventListener('fetch', event => {\n  return event.respondWith(handleRequest(event.request))\n})\n"],"mappings":";AAAA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;;;;;;;;;;;;AClFA;AAAA;AAAA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;;;;;;;;;;;ACvBA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;;;;;;;;;;;;ACTA;AAAA;AAAA;AAAA;AAAA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;;;;;;;;;;;;ACpHA;AAAA;AAAA;AAAA;AAAA;AAAA;AAAA;AAAA;AAAA;AAAA;AAAA;AACA;AACA;AACA;AACA;;;;;;;;;;;;;ACJA;AAAA;AAAA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;;;;;;;;;;;;ACZA;AAAA;AAAA;AAAA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;;;;A","sourceRoot":""}