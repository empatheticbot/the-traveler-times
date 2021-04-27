async function getQuotesFromApi() {
  // TODO
}

async function getMockQuotes() {
  return new Promise((resolve) => {
    resolve([
      {
        quote: "I'm on the edge of my seat!",
        author: "Lord Shaxx",
      },
      {
        quote: "The quest for knowledge is the purest war.",
        author: "Destiny 2; 7th Book of Sorrow, 11th Understanding, I.VI",
      },
      {
        quote:
          "Be ever violent as you rage against the ignorance that threatens to stall your growth.",
        author: "Destiny 2; 7th Book of Sorrow, 11th Understanding, I.V",
      },
    ]);
  });
}

module.exports = async function () {
  let quotes = await getMockQuotes();
  let quote = quotes[Math.floor(Math.random() * quotes.length)];

  return quote;
};
