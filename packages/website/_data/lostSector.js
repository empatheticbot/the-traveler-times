const { fetchDataFromEndpoint } = require("../data-loader");

//TODO: add dev env endpoint
const LOST_SECTOR_ENDPOINT =
  "https://d2-lost-sector-worker.empatheticbot.workers.dev";

module.exports = async function () {
  return fetchDataFromEndpoint(LOST_SECTOR_ENDPOINT);
};
