const fetch = require("node-fetch");
const API_URL =
  "https://destiny-2-worker-production.empatheticbot.workers.dev/";
const DEV_API_URL =
  "https://destiny-2-worker-develop.empatheticbot.workers.dev/";
const nightfallMock = require("../mock-data/nightfall.json");

async function getDestinyData() {
  try {
    const destinyApi = await fetch(
      process.env.NODE_ENV === "production" ? API_URL : DEV_API_URL
    );
    const json = await destinyApi.json();
    return json;
  } catch (e) {
    console.error(
      `Failed to fetch Destiny API at ${API_URL}, with error: ${e}`
    );
  }
}

async function getMockApi() {
  return new Promise((resolve) => {
    resolve({
      mockData: true,
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
      nightfall: nightfallMock,
    });
  });
}

module.exports = async function () {
  // console.log(process.env.NODE_ENV);
  let destinyData = await getDestinyData();
  if (!destinyData.ok) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Failed to fetch destiny data from worker.");
    } else {
      destinyData = await getMockApi();
    }
  }

  console.log(destinyData);
  return destinyData;
};
