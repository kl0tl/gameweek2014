'use strict';

function JsonLoader() {}

JsonLoader.prototype.load = function jsonLoaderLoad(url, callback, errback) {
  var xhr = new XMLHttpRequest();

  xhr.open('GET', url);

  xhr.onreadystatechange = function () {
    if (xhr.readyState < 4) return;

    if (xhr.status === 200) {
      try {
        callback.call(xhr.responseText && JSON.parse(xhr.responseText) || {});
      } catch (oO) {
        errback(oO);
      }
    } else {
      errback(xhr);
    }
  };

  xhr.send();
};

module.exports = JsonLoader;
