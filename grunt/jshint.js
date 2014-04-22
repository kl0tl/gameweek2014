'use strict';

module.exports = {
  options: {
    jshintrc: '.jshintrc',
    reporter: require('jshint-stylish')
  },

  scripts: ['src/**/*.js'],
  config: ['Gruntfile.js', 'grunt/*.js']
};
