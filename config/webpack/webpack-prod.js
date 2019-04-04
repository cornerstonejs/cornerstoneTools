const webpack = require('webpack');
const merge = require('./merge');
const baseConfig = require('./webpack-base');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const prodConfig = {
  output: {
    filename: '[name].min.js',
  },
  mode: 'production',
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        sourceMap: true,
      }),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
};

module.exports = merge(baseConfig, prodConfig);
