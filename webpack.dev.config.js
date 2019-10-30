const webpack = require('webpack')
const merge = require('webpack-merge')
const common = require('./webpack.common.config')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: 'dist',
    port: 3000,
    overlay: true,
    open: true,
    openPage: 'z_info.html'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
});