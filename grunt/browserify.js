'use strict';

module.exports = {
  options: {
    bundleOptions: {
      debug: true
    }
  },

  dist: {
    src: 'src/game.js',
    dest: 'dist/<%= package.name %>.js'
  }
};
