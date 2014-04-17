'use strict';

module.exports = {
  'lint:config': ['newer:jshint:config'],
  'lint:scripts': ['newer:jshint:scripts'],

  'lint': ['concurrent:lint'],

  'build:assets': [],
  'build:scripts': ['lint:scripts', 'clean:dist', 'browserify'],

  'build': ['concurrent:build'],

  'default': ['build', 'connect', 'open', 'watch']
};
