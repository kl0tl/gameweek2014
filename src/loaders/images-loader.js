'use strict';

function ImagesLoader() {}

ImagesLoader.prototype.load = function imagesLoaderLoad(url, callback, errback) {
  var image = new Image();

  image.onload = callback;
  image.onerror = errback;

  image.src = url;
};

module.exports = ImagesLoader;
