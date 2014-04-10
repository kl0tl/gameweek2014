'use strict';

module.exports = {
  dist: {
    src: '<%= browserify.dist.dest %>',
    dest: 'dist/<%= package.name %>.min.js'
  }
};
