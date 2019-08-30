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
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true, // Must be set to true if using source-maps in production
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
          compress: {
            drop_console: true,
          },
        },
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
