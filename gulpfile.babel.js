/*
 * geomancy
 * https://github.com/bkroeze/geomancy
 *
 * Copyright (c) 2014 Bruce Kroeze
 * Licensed under the MIT license.
 */

'use strict';
import gulp from 'gulp';
import ava from 'gulp-ava';
import babel from 'gulp-babel';
import { spawn} from 'child_process';

gulp.task('test', function () {
  gulp.src('./test/**/*spec.js')
    // gulp-ava needs filepaths so you can't have any plugins before it
    .pipe(ava({
      verbose: true
    }));
});

gulp.task('watch', function () {
  gulp.watch(['./lib/**/*.js', './test/**/*.js'], ['test']);
});

gulp.task('build', function () {
  return gulp.src('./lib/**/*.js')
    .pipe(babel({
      presets: ['es2016']
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['test', 'watch']);

gulp.task('npm', function (done) {
  spawn('npm', ['publish'], {
    stdio: 'inherit'
  }).on('close', done);
});
