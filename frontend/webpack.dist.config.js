'use strict'

var path = require('path')
var webpack = require('webpack')

module.exports = {
  cache: false,
  debug: false,
  devtool: false,

  stats: {
    colors: true,
    reasons: false
  },

  entry: {
    'app': [
      './resources/assets/app.js',
    ],
  },
  output: {
    path: __dirname + '/public/builds/',
    filename: '[name].js',
    publicPath: '/intern/builds/'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        include: [path.resolve(__dirname, 'resources')],
        loaders: ['ng-annotate', 'babel?presets[]=es2015']
      },
      {test: /\.css$/, loader: 'style!css'},
      {test: /\.scss$/, loader: 'style!css!sass'},
      {test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff"},
      {test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader"},
      {test: /\.html$/, loader: 'ngtemplate?module=intern&relativeTo=' + (path.resolve(__dirname, './')) + '/!html?minimize=false'},
      {test: /\.json$/, loader: 'json'},
    ]
  },
  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js', '.jsx'],
    alias: {
      jquery: 'jquery/dist/jquery.min.js'
    }
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({sourceMap: false}),
    new webpack.NoErrorsPlugin(),

    // keeps hashes consistent between compilations
    new webpack.optimize.OccurenceOrderPlugin(),

    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),

    new webpack.DefinePlugin({
      DEBUG: false,
    }),
  ]
}
