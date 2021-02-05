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
        nextRefreshDate: new Date("2021-01-19T07:00:00").toISOString(),
        endDate: new Date("2021-01-19T07:00:00").toISOString(),
        items: [
          {
            name: "Graviton Lance",
            description:
              "Think of space-time as a tapestry on a loom. This weapon is the needle.",
            icon:
              "/common/destiny2_content/icons/492d92346c4325dada5455281ea00053.jpg",
            cost: "29 Legendary Shards",
          },
          {
            name: "Shinobu's Vow",
            description:
              '"No supplies. Armor in tatters. But the refugees had asked for help. And she had given her word." —Tale of the Six Coyotes',
            icon:
              "/common/destiny2_content/icons/41d16b23c1af5dbf3363bc34bd591ce6.jpg",
            cost: "23 Legendary Shards",
          },
          {
            name: "Armamentarium",
            description: "For this, there is one remedy.",
            icon:
              "/common/destiny2_content/icons/9482dc5d359231558d9ac7f70e5bbd86.jpg",
            cost: "23 Legendary Shards",
          },
          {
            name: "Getaway Artist",
            description: "Keep the engine running.",
            icon:
              "/common/destiny2_content/icons/673dfa5edf0723adf0275cf30281a123.jpg",
            cost: "23 Legendary Shards",
          },
        ],
      },
      articles: [
        // {
        //   title: "Xur Spotted in the Tower",
        //   subtitle:
        //     "This is a test of a subtitle. Xur is in the <strong>Hanger</strong>",
        //   body: "This is some body text.",
        //   date: new Date("2021-01-15").toISOString(),
        // },
        // {
        //   title: "Xur Spotted in the Tower",
        //   body: "This is some body text.",
        //   date: new Date("2021-01-03").toISOString(),
        // },
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
