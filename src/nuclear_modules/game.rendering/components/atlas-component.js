'use strict';

var path, loader;

path = require('path');
loader = require('assets-loader');

function AtlasComponent(key) {
  this.source = loader.get(path.join('atlases', key + '.atlas.png'));
  this.sprites = loader.get(path.join('atlases', key + '.atlas.json'));
}

module.exports = AtlasComponent;
