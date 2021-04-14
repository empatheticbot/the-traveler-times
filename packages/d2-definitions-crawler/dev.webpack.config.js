module.exports = {
  target: 'webworker',
  entry: './index.js',
  mode: 'development',
  devtool: 'cheap-module-source-map', // avoid "eval": Workers environment doesn’t allow it
  optimization: {
    minimize: false,
  },
}
