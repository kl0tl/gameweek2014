'use strict';

module.exports = {
  config: {
    files: ['Gruntfile.js', 'grunt/*.js'],
    tasks: ['lint:config']
  },
  scripts: {
    options: {
      livereload: true
    },

    files: ['src/**/*.js'],
    tasks: ['build:scripts']
  },
  assets: {
    options: {
      livereload: true
    },

    files: ['index.html', 'assets/**/*.*'],
    tasks: ['build:assets']
  }
};
