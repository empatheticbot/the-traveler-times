const mockNightfallData = require("../mock-data/nightfall.json");
const { fetchDataFromEndpoint } = require("../data-loader");

//TODO: add dev env endpoint
const NIGHTFALL_ENDPOINT =
  "https://d2-nightfall-worker.empatheticbot.workers.dev";

module.exports = async function () {
  return fetchDataFromEndpoint(
    NIGHTFALL_ENDPOINT,
    NIGHTFALL_ENDPOINT,
    mockNightfallData
  );
};
