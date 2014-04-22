'use strict';

function AssetsBundle(callback) {
  var bundle;

  bundle = this;

  bundle.assets = [];

  bundle._loadListeners = [];
  bundle._errorListeners = [];
  bundle._progressListeners = [];

  callback.call(this,
    trigger(bundle._loadListeners),
    trigger(bundle._errorListeners),
    trigger(bundle._progressListeners)
  );

  function trigger(callbacks) {
    return function () {
      var i, callback;

      for (i = 0; (callback = callbacks[i]); i += 1) {
        callback.apply(bundle, arguments);
      }
    };
  }
}

AssetsBundle.prototype.done = function assetsBundleDone(callback) {
  this._loadListeners.push(callback);
  return this;
};

AssetsBundle.prototype.error = function assetsBundleError(errback) {
  this._errorListeners.push(errback);
  return this;
};

AssetsBundle.prototype.progress = function assetsBundleProgress(progress) {
  this._progressListeners.push(progress);
  return this;
};

module.exports = AssetsBundle;
