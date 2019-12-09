const path = require ('path');
const HtmlWebpackPlugin = require ('html-webpack-plugin');

const dist = path.join (__dirname, 'demos');

module.exports = {
  mode: 'development',
  entry: path.join (dist, 'index.js'),
  output: {
    filename: '[name].js',
    path: dist,
    globalObject: 'this',
  },
  devtool: 'eval-source-map',
  devServer: {
    compress: true,
    contentBase: dist,
    host: 'localhost',
    hot: true,
    inline: true,
    port: 8000,
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.worker\.js$/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'worker-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin ({
      title: 'react-pan-and-zoom-hoc examples',
    }),
  ],
};
