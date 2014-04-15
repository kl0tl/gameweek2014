'use strict';

module.exports = {
  options: {
    alias: [
      'src/assets-loader.js:assets-loader'
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
