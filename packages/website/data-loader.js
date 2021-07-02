const fetch = require("node-fetch");

async function getDataFrom(endpoint, developEndpoint = endpoint) {
  const data = await fetch(
    process.env.NODE_ENV !== "production" ? developEndpoint : endpoint
  );
  const json = await data.json();
  return json;
}

async function fetchDataFromEndpoint(
  endpoint,
  developEndpoint = endpoint,
  mockData = { isAvailable: false }
) {
  try {
    const data = await getDataFrom(endpoint, developEndpoint);
    return data;
  } catch (e) {
    if (process.env.NODE_ENV === "production") {
      console.error(`Failed to fetch data from endpoint: ${endpoint} \n ${e}`);
      return { isAvailable: false };
    }
    return { ...mockData, isMockData: true };
  }
}

module.exports = {
  fetchDataFromEndpoint,
};
