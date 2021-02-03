const fetch = require("node-fetch");
const API_URL = "https://destiny-2-worker.kylefalk.workers.dev/";

async function mockApi() {
  try {
    const destinyApi = await fetch(API_URL);
    const json = await destinyApi.json();
    console.log(json);
    return json;
  } catch (e) {
    console.error(
      `Failed to fetch Destiny API at ${API_URL}, with error: ${e}`
    );
  }
  console.log("here");
  // If API fails just return a mock API during dev...
  // TODO: remove mock API and just fail build before releasing
  return new Promise((resolve) => {
    resolve({
      season: {
        seasonNumber: 12,
        description:
          "As the Pyramids send the system into chaos, Guardians must work with unexpected allies to hunt the monstrous forces of Xivu Arath and unravel the Hive god's network of mysterious cryptoliths.",
        endDate: new Date("2021-02-09T00:00:00").toISOString(),
        name: "Season of the Hunt",
      },
      weeklyReset: new Date("2021-01-19T07:00:00").toISOString(),
      xur: {
        planet: "The Tower",
        location: "Hanger",
        confidence: 12,
      },
      articles: [
        {
          title: "Xur Spotted in the Tower",
          subtitle:
            "This is a test of a subtitle. Xur is in the <strong>Hanger</strong>",
          body: "This is some body text.",
          date: new Date("2021-01-15").toISOString(),
        },
        {
          title: "Xur Spotted in the Tower",
          body: "This is some body text.",
          date: new Date("2021-01-03").toISOString(),
        },
      ],
      meta: [
        {
          gametype: "Control",
          gameZone: "PVP",
          name: "Weapons",
          items: [
            {
              name: "Abralist",
              imgSrc: "#",
              description: "Exotic Linear Fusion Rifle",
            },
            {
              name: "Abralist",
              imgSrc: "#",
              description: "Exotic Linear Fusion Rifle",
            },
            {
              name: "Abralist",
              imgSrc: "#",
              description: "Exotic Linear Fusion Rifle",
            },
          ],
        },
      ],
    });
  });
}

module.exports = async function () {
  let destinyData = await mockApi();

  return destinyData;
};
