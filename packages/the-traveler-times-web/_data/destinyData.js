function mockApi() {
  return new Promise((resolve) => {
    resolve({
      season: {
        endDate: new Date("2021-02-09T00:00:00"),
        name: "Season of the Hunt",
      },
      weekly: {
        resetDate: new Date("2021-01-19T07:00:00"),
      },
      articles: [
        {
          title: "Xur Spotted in the Tower",
          body: "This is some body text.",
          date: new Date("2021-01-15"),
        },
        {
          title: "Xur Spotted in the Tower",
          body: "This is some body text.",
          date: new Date("2021-01-03"),
        },
      ],
    });
  });
}

module.exports = async function () {
  let destinyData = await mockApi();

  return destinyData;
};
