var source = require('vinyl-source-stream');
var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var reactify = require('reactify');
var watchify = require('watchify');
var notify = require("gulp-notify");
var livereload = require('gulp-livereload');
var connect = require('gulp-connect');


var scriptsDir = './app';
var buildDir = './build';


 
 
// Based on: http://blog.avisi.nl/2014/04/25/how-to-keep-a-fast-build-with-browserify-and-reactjs/
function buildScript(file, watch) {
  var props = watchify.args;
  props.entries = [scriptsDir + '/' + file];
  props.debug = true;
  
  var bundler = watch ? watchify(browserify(props)) : browserify(props);
  
  bundler.transform(reactify);
  function rebundle() {
    var stream = bundler.bundle();
    return stream.on('error', notify.onError({
        title: "Compile Error",
        message: "<%= error.message %>"
      }))
      .pipe(source(file))
      .pipe(gulp.dest(buildDir + '/'))
      .pipe(connect.reload());
  }
  bundler.on('update', function() {
    rebundle();
    gutil.log('Rebundle...');
  });
  return rebundle();
}
 

gulp.task('connect', function() {
  connect.server({
    root: 'build',
    port: 8888,
    livereload: true
  });
});

gulp.task('html', function () {
  gulp.src('./build/*.html')
    .pipe(connect.reload());
});

gulp.task('css', function () {
  gulp.src('./build/*.css')
    .pipe(connect.reload());
});

gulp.task('build', function() {
  return buildScript('main.js', false);
});
 
gulp.task('watch', function () {
  gulp.watch(['./build/*.html'], ['html']);
  gulp.watch(['./build/*.css'], ['css']);
});

gulp.task('default', ['build','watch','connect'], function() {
  return buildScript('main.js', true);
});