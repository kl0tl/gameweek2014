'use strict';

module.exports = {
  options: {
    jshintrc: '.jshintrc',
    reporter: require('jshint-stylish')
  },

  scripts: ['src/**/*.js', '!src/nuclear_modules/**/lib/*.js'],
  config: ['Gruntfile.js', 'grunt/*.js']
};
