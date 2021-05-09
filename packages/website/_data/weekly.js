const fetch = require("node-fetch");
const WEEKLY_ENDPOINT = "https://d2-weekly-worker.empatheticbot.workers.dev";

async function getWeeklyData() {
  const data = await fetch(
    //TODO: add dev env endpoint
    process.env.NODE_ENV === "production" ? WEEKLY_ENDPOINT : WEEKLY_ENDPOINT
  );
  const json = await data.json();
  return json;
}

async function getMockWeeklyData() {
  return new Promise((resolve) => {
    resolve({
      mockData: true,
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
    });
  });
}

module.exports = async function () {
  let weeklyData;
  try {
    weeklyData = await getWeeklyData();
  } catch (e) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Failed to fetch weekly data from worker. (${WEEKLY_ENDPOINT})`
      );
    } else {
      weeklyData = await getMockWeeklyData();
    }
  }
  console.log(weeklyData);
  return weeklyData;
};
