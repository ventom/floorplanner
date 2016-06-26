#!/usr/bin/env node

'use strict';

// Installation:
// npm install --save-dev gulp gulp-livereload

// Usage:
// gulp livereload

var gulp = require('gulp');
var livereload = require('gulp-livereload');

var host = 'http://localhost';
var port = 3000;
var assetPrefix = '/assets';
var larassetUrl = host + (port ? ':' + port : '') + assetPrefix;

gulp.task('livereload', function() {
  livereload({start: true});

  var livereloadPage = function () {
    // Reload the whole page
    livereload.reload();
  };

  gulp.watch('*.html', livereloadPage);

  // Static files
  gulp.watch('**/*.+(css|js|html|gif|ico|jpg|jpeg|png)', function(event) {
    var filePath = event.path.replace(/\\/g, '/').replace(new RegExp('^(.*/)?public(/(.+))$'), '$2');
    livereload.changed(filePath);
  });

});
