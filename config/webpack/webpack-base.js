const path = require('path');
const rootPath = process.cwd();
const context = path.join(rootPath, 'src');
const outputPath = path.join(rootPath, 'dist');
const bannerPlugin = require('./plugins/banner');

module.exports = {
  mode: 'development',
  context: context,
  entry: {
    cornerstoneTools: path.join(context, 'index.js'),
  },
  devtool: 'source-map',
  output: {
    filename: '[name].js',
    library: {
      commonjs: 'cornerstone-tools',
      amd: 'cornerstone-tools',
      root: 'cornerstoneTools',
    },
    libraryTarget: 'umd',
    path: outputPath,
    umdNamedDefine: true,
  },
  externals: {
    'cornerstone-math': {
      commonjs: 'cornerstone-math',
      commonjs2: 'cornerstone-math',
      amd: 'cornerstone-math',
      root: 'cornerstoneMath',
    },
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /(node_modules|test)/,
        loader: 'eslint-loader',
        options: {
          failOnError: false,
        },
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: true,
          },
        },
      },
    ],
  },
  plugins: [bannerPlugin()],
};
