const path = require('path');
const merge = require('./merge');
const baseConfig = require('./webpack-base');
const TerserPlugin = require('terser-webpack-plugin');

const rootPath = process.cwd();
const context = path.join(rootPath, 'src');

const prodConfig = {
  entry: {
    'cornerstoneTools.min': path.join(context, 'index.js'),
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true, // Must be set to true if using source-maps in production
        test: /\.min\.js$/, // Minimize only .min one
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },
  plugins: [],
};

module.exports = merge(baseConfig, prodConfig);
