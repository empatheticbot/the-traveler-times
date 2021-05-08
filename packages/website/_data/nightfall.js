const fetch = require("node-fetch");
const mockNightfallData = require("../mock-data/nightfall.json");

const NIGHTFALL_ENDPOINT =
  "https://d2-nightfall-worker.empatheticbot.workers.dev";

async function getNightfallData() {
  const data = await fetch(
    //TODO: add dev env endpoint
    process.env.NODE_ENV === "production"
      ? NIGHTFALL_ENDPOINT
      : NIGHTFALL_ENDPOINT
  );
  const json = await data.json();
  return json;
}

async function getMockNightfallData() {
  return new Promise((resolve) => {
    resolve({ ...mockNightfallData, mockData: true });
  });
}

module.exports = async function () {
  let nightfallData;
  try {
    nightfallData = await getNightfallData();
  } catch (e) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Failed to fetch nightfall data from worker. (${NIGHTFALL_ENDPOINT})`
      );
    } else {
      nightfallData = await getMockNightfallData();
    }
  }
  return nightfallData;
};
