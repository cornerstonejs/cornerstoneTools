const webpack = require('webpack');
const merge = require('./merge');
const baseConfig = require('./webpack-base');
const TerserPlugin = require('terser-webpack-plugin');

const prodConfig = {
  output: {
    filename: '[name].min.js',
  },
  mode: 'production',
  optimization: {
    minimizer: [
      new TerserPlugin()
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
};

module.exports = merge(baseConfig, prodConfig);
