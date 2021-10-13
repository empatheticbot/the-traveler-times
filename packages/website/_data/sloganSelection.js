const slogans = [
  {
    slogan: 'Guardians Die in Darkness',
    spoof: 'Washington Post',
  },
  {
    slogan:
      'Fair and Balanced. <em style="font-size: .8rem;">Excludes the Felwinter\'s Lie</em>',
    spoof: 'Fox News',
  },
  // {
  //   slogan: 'Most Watched. Most Trusted.',
  //   spoof: 'Fox News',
  // },
  // {
  //   slogan: "Standing Up For What's Right",
  //   spoof: 'Fox News',
  // },
]

module.exports = function () {
  return slogans[Math.floor(Math.random() * slogans.length)]
}
