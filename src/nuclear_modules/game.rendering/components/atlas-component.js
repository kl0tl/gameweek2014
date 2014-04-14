'use strict';

var path, loader;

path = require('path');
loader = require('game').loader;

function AtlasComponent(key) {
  this.source = loader.get(path.join('/assets', 'atlases', key + '.atlas.png'));
  this.sprites = loader.get(path.join('/assets', 'atlases', key + '.atlas.json'));
}

module.exports = AtlasComponent;
