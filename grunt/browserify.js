'use strict';

module.exports = {
  options: {
    alias: [
      'src/game.js:game'
    ],
    bundleOptions: {
      debug: true
    }
  },

  dist: {
    src: 'src/index.js',
    dest: 'dist/<%= package.name %>.js'
  }
};
