var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer');

module.exports = {
  entry: './app/index.js',
  output: {
    path: __dirname + '/assets',
    filename: "scripts.js"
  },
  resolve: {
    extensions: ['.js', '.html', '.scss']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: '/node_modules/',
        loader: 'babel-loader'
      }
    ],
    rules: [
      {
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['env']
        }
      }
    },
    {
      test: /\.(css|scss)$/,
      use: ExtractTextPlugin.extract('css!postcss!sass')
    }
    ]
  },
  //postcss: [autoprefixer],
  plugins: [
      require('autoprefixer'),
      new ExtractTextPlugin({
        filename: 'style.css',
        allChunks: true
      })
  ],
	devtool: 'inline-source-map'
};
