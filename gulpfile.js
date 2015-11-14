var gulp = require('gulp'),
    gutil = require("gulp-util"),
    args = require('yargs').argv,
    webpack = require('webpack'),
    webpackConfigDev = require('./webpack.config.js'),
    webpackConfigDist = require('./webpack.dist.config.js');

// run with --production to do more compressing etc
var isProd = !!args.production;

var webpackBuild = function (callback, config, name) {
  webpack(config, function (err, stats) {
    if (err) {
      throw new gutil.PluginError(name, err);
    }

    gutil.log("[" + name + "]", stats.toString({
      colors: true
    }));

    callback();
  });
};

gulp.task('webpack:build', function (callback) {
  webpackBuild(callback, webpackConfigDist, 'webpack:build');
});

gulp.task("webpack:build-dev", function (callback) {
  webpackBuild(callback, webpackConfigDev, "webpack:build-dev");
});

gulp.task('watch', function (callback) {
  webpackConfigDev.watch = true;
  webpackBuild(() => {}, webpackConfigDev, "webpack:build-dev");
});

gulp.task('default', [isProd ? 'webpack:build' : 'watch']);
