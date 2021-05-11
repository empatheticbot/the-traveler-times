const { fetchDataFromEndpoint } = require("../data-loader");

//TODO: add dev env endpoint
const SEASON_ENDPOINT = "https://d2-season-worker.empatheticbot.workers.dev";

module.exports = async function () {
  return fetchDataFromEndpoint(SEASON_ENDPOINT);
};
