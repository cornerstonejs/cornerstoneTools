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
        // Debug's `main` entry is `src/index.js` and does not share our browser target
        // This allows us to transpile it to our target.
        exclude: excludeNodeModulesExcept['debug'],
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

function excludeNodeModulesExcept(modules) {
  var pathSep = path.sep;
  if (pathSep == '\\')
    // must be quoted for use in a regexp:
    pathSep = '\\\\';
  var moduleRegExps = modules.map(function(modName) {
    return new RegExp('node_modules' + pathSep + modName);
  });

  return function(modulePath) {
    if (/node_modules/.test(modulePath)) {
      for (var i = 0; i < moduleRegExps.length; i++)
        if (moduleRegExps[i].test(modulePath)) return false;
      return true;
    }
    return false;
  };
}
