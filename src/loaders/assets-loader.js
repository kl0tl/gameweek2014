'use strict';

var AssetsBundle, path;

AssetsBundle = require('./assets-bundle');
path = require('path');

function AssetsLoader(path) {
  this.basePath = path || '/';
  this.cache = Object.create(null);
  this.rules = [];
}

AssetsLoader.prototype.get = function assetsLoaderGet(url) {
  return this.cache[url];
};

AssetsLoader.prototype.has = function assetsLoaderHas(url) {
  return url in this.cache;
};

AssetsLoader.prototype.when = function assetsLoaderWhen(pattern, loader) {
  this.rules.push({pattern: pattern, loader: loader});
  return this;
};

AssetsLoader.prototype.load = function assetsLoaderLoad(urls) {
  var loader;

  loader = this;

  return new AssetsBundle(function (done, error, progress) {
    var bundle, loadedAssetsCount, totalAssetsCount, i, url, asset, j, rule;

    bundle = this;

    loadedAssetsCount = 0;
    totalAssetsCount = urls.length;

    if (!totalAssetsCount) done();

    for (i = 0; i < totalAssetsCount; i += 1) {
      url = urls[i];
      asset = loader.get(url);

      if (asset) {
        onloaded(url, i).call(asset);
      } else {
        for (j = 0; (rule = loader.rules[j]); j += 1) {
          if (rule.pattern.test(url)) {
            rule.loader.load(path.join(loader.basePath, url), onloaded(url, i), error);
          }
        }
      }
    }

    function onloaded(key, index) {
      return function () {
        var asset;

        asset = this;

        loader.cache[key] = asset;
        bundle.assets[index] = asset;

        loadedAssetsCount += 1;

        if (progress) {
          progress(this, loadedAssetsCount / totalAssetsCount);
        }

        if (loadedAssetsCount === totalAssetsCount) {
          done();
        }
      };
    }
  });
};

module.exports = AssetsLoader;
