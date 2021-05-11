const { fetchDataFromEndpoint } = require("../data-loader");

//TODO: add dev env endpoint
const WEEKLY_ENDPOINT = "https://d2-weekly-worker.empatheticbot.workers.dev";

module.exports = async function () {
  return fetchDataFromEndpoint(WEEKLY_ENDPOINT);
};
