const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = {
  entry: './app/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "scripts.min.js"
  },
  module: {
    rules: [
      { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ },
      {
        test: /\.js$/,
        use: {
          loader: 'eslint-loader',
          options: {
            configFile: path.join( __dirname, '.eslintrc' ),
            //failOnError: true,
            quiet: true,
          }
        },
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: { minimize: true }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: function () {
                  return [autoprefixer, cssnano]
                }
              }
            },
            'sass-loader'
          ]
        })
      }
    ]
  },
  // eslint: {
  //   configFile: path.join( __dirname, '.eslintrc' ),
  //   failOnError: true,
  //   quiet: true,
  // },
  plugins: [
    new ExtractTextPlugin('style.min.css'),
    new webpack.optimize.UglifyJsPlugin(),
  ],
  devtool: 'inline-source-map'
};


// For reference:
// https://github.com/ryelle/Foxhound/blob/master/webpack.config.js
// https://github.com/efuller/modern-wp-with-react/blob/master/webpack.config.js