var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps');
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    ngAnnotate = require('gulp-ng-annotate'),
    gulpif = require('gulp-if'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    args = require('yargs').argv;

// run with --production to do more compressing etc
var isProd = !!args.production;

var js_files = [
    "./bower_components/jquery/dist/jquery.js",
    "./bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js",
    "./bower_components/moment/moment.js",
    "./bower_components/moment/lang/nb.js",
    //"./bower_components/bootstrap-datepicker/js/bootstrap-datepicker.js",
    //"./bower_components/bootstrap-datepicker/js/locales/bootstrap-datepicker.no.js",
    "./bower_components/angular/angular.js",
    "./bower_components/angular-route/angular-route.js",
    "./bower_components/angular-animate/angular-animate.js",
    "./bower_components/angular-resource/angular-resource.js",
    "./bower_components/angular-file-upload/angular-file-upload.js",
    "./bower_components/d3/d3.js",

    "./bower_components/ladda/js/spin.js",
    "./bower_components/ladda/js/ladda.js",
    "./bower_components/angular-ladda/dist/angular-ladda.min.js",

    "./app/assets/javascript/**.js"
];

gulp.task('styles', function() {
    return gulp.src('app/assets/stylesheets/frontend.scss')
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(sass())
        .pipe(gulpif(isProd, minifycss()))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/assets/stylesheets'));
});

gulp.task('scripts', function() {
    return gulp.src(js_files)
        .pipe(concat('frontend.js'))
        .pipe(sourcemaps.init())
        .pipe(gulpif(isProd, ngAnnotate()))
        .pipe(gulpif(isProd, uglify()))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/assets/javascript'));
});

gulp.task('fonts', function() {
    return gulp.src('bower_components/bootstrap-sass-official/assets/fonts/**')
        .pipe(gulp.dest('public/assets/fonts'));
});

gulp.task('watch', function() {
    gulp.watch('app/assets/stylesheets/**/*.scss', ['styles']);
    gulp.watch(js_files, ['scripts']);
});

gulp.task('default', function() {
    gulp.start('styles', 'scripts');
});
