const mockXurData = require("../mock-data/xur.json");
const { fetchDataFromEndpoint } = require("../data-loader");

//TODO: add dev env endpoint
const XUR_ENDPOINT = "https://d2-xur-worker.empatheticbot.workers.dev";

module.exports = async function () {
  return fetchDataFromEndpoint(XUR_ENDPOINT, XUR_ENDPOINT, mockXurData);
};
