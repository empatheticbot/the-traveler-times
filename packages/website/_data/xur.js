const fetch = require("node-fetch");
const XUR_ENDPOINT = "https://d2-xur-worker.empatheticbot.workers.dev";

async function getXurData() {
  const data = await fetch(
    //TODO: add dev env endpoint
    process.env.NODE_ENV === "production" ? XUR_ENDPOINT : XUR_ENDPOINT
  );
  const json = await data.json();
  return json;
}

async function getMockXurData() {
  return new Promise((resolve) => {
    resolve({
      mockData: true,
      name: "Xûr",
      description:
        "A peddler of strange curios, Xûr's motives are not his own. He bows to his distant masters, the Nine.",
      icon:
        "/common/destiny2_content/icons/5659e5fc95912c079962376dfe4504ab.png",
      subtitle: "Agent of the Nine",
      smallTransparentIcon:
        "/img/destiny_content/vendor/icons/xur_small_icon.png",
      lastRefreshDate: "2021-05-07T17:00:00.000Z",
      nextRefreshDate: "2021-05-14T17:00:00.000Z",
      hash: "2190858386",
      enabled: true,
      sales: [
        {
          name: "Exotic Engram",
          icon:
            "/common/destiny2_content/icons/ee21b5bc72f9e48366c9addff163a187.png",
          subtitle: "Exotic Engram",
          sort: 8,
        },
        {
          name: "Skyburner's Oath",
          icon:
            "/common/destiny2_content/icons/69589d312320228022173ef7ef543a40.jpg",
          subtitle: "Exotic Scout Rifle",
          sort: 3,
        },
        {
          name: "Gwisin Vest",
          icon:
            "/common/destiny2_content/icons/598126991a4bfe56b2901f1e1dca6147.jpg",
          subtitle: "Exotic Chest Armor",
          sort: 2,
        },
        {
          name: "Mask of the Quiet One",
          icon:
            "/common/destiny2_content/icons/cd76e4a21cb89cd5b850eba34a8df41c.jpg",
          subtitle: "Exotic Helmet",
          sort: 2,
        },
        {
          name: "Vesper of Radius",
          icon:
            "/common/destiny2_content/icons/b22c53b5868c94352f69f7493f7f6f2d.jpg",
          subtitle: "Exotic Chest Armor",
          sort: 2,
        },
        {
          name: "A Question",
          icon:
            "/common/destiny2_content/icons/7f9e6e79bb7a8ce59de9258a7d674af2.jpg",
          subtitle: "Exotic Quest Step",
          sort: 12,
        },
      ],
      location: {
        planet: "The Tower",
        area: "Hanger",
        twitterQuery: "xur (tower OR hanger)",
        results: 45,
      },
      isAvailable: true,
    });
  });
}

module.exports = async function () {
  console.log(process.env.NODE_ENV);
  let xurData;
  try {
    xurData = await getXurData();
  } catch (e) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Failed to fetch Xur data from worker. (${XUR_ENDPOINT})`
      );
    } else {
      xurData = await getMockXurData();
    }
  }
  console.log(xurData);
  return xurData;
};
