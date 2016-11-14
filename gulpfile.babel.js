/*
 * geomancy
 * https://github.com/bkroeze/geomancy
 *
 * Copyright (c) 2014 Bruce Kroeze
 * Licensed under the MIT license.
 */

'use strict';
import gulp from 'gulp';
// var mocha = require('gulp-mocha')
import ava from 'gulp-ava';

// gulp.task('test', function () {
//   return gulp.src('./test/*.js')
//     .pipe(mocha({
//       ui: 'bdd',
//       reporter: 'spec'
//     }))
// })

gulp.task('test', function () {
  gulp.src('./test/**/*spec.js')
    // gulp-ava needs filepaths so you can't have any plugins before it
    .pipe(ava({verbose: true}));
});

gulp.task('watch', function () {
  gulp.watch(['./lib/**/*.js', './test/**/*.js'], ['test']);
});

// gulp.task('build', function () {
//   return gulp.src('./lib/**/*.js')
//     .pipe(babel({
//       presets: ['es2016']
//     }))
//     .pipe(gulp.dest('dist'))
// })

gulp.task('default', ['test', 'watch']);
