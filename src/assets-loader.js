'use strict';

var AssetsLoader, ImagesLoader, JsonLoader;

AssetsLoader = require('./loaders').AssetsLoader;
ImagesLoader = require('./loaders').ImagesLoader;
JsonLoader = require('./loaders').JsonLoader;

module.exports = new AssetsLoader('./assets')
  .when(/\.(?:png|jpg)$/, new ImagesLoader())
  .when(/\.json$/, new JsonLoader());
