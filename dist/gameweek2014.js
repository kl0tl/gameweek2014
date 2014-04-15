require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.once = noop;
process.off = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],2:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require("/Users/kl0tl/dev/gameweek2014/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/Users/kl0tl/dev/gameweek2014/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":1}],"w1dNXB":[function(require,module,exports){
'use strict';

var AssetsLoader, ImagesLoader, JsonLoader;

AssetsLoader = require('./loaders').AssetsLoader;
ImagesLoader = require('./loaders').ImagesLoader;
JsonLoader = require('./loaders').JsonLoader;

module.exports = new AssetsLoader('/assets')
  .when(/\.(?:png|jpg)$/, new ImagesLoader())
  .when(/\.json$/, new JsonLoader());

},{"./loaders":9}],"assets-loader":[function(require,module,exports){
module.exports=require('w1dNXB');
},{}],5:[function(require,module,exports){
'use strict';

var loader, transform, rendering, animations, lighting, collisions, inputs;

loader = require('./assets-loader');

transform = require('./nuclear_modules/game.transform');
rendering = require('./nuclear_modules/game.rendering');
animations = require('./nuclear_modules/game.animations');
lighting = require('./nuclear_modules/game.lighting');
collisions = require('./nuclear_modules/game.collisions');
inputs = require('./nuclear_modules/game.inputs');

loader.load([
    'atlases/prinny.atlas.png',
    'atlases/prinny.atlas.json',
    'animations/prinny/prinny@dancing.json',

    'atlases/hero.atlas.png',
    'atlases/hero.atlas.json',
    'animations/hero/hero@idleback.json',
    'animations/hero/hero@idleface.json',
    'animations/hero/hero@idleleft.json',
    'animations/hero/hero@idleright.json',
    'animations/hero/hero@walkback.json',
    'animations/hero/hero@walkface.json',
    'animations/hero/hero@walkleft.json',
    'animations/hero/hero@walkright.json'
  ])
  .error(function (oO) { throw oO; })
  .done(function () {
    nuclear.import([transform, rendering, animations, lighting, collisions, inputs]);

    console.log('modules loaded!');

    require('./systems-context');

    //require('./scenes/collisions-scene');
    require('./scenes/hero-scene');

    window.requestAnimationFrame(function loop() {
      window.requestAnimationFrame(loop);
      nuclear.system.run();
    });
  })
  .progress(console.log.bind(console, 'bundle progress'));

},{"./assets-loader":"w1dNXB","./nuclear_modules/game.animations":12,"./nuclear_modules/game.collisions":15,"./nuclear_modules/game.inputs":18,"./nuclear_modules/game.lighting":23,"./nuclear_modules/game.rendering":29,"./nuclear_modules/game.transform":32,"./scenes/hero-scene":35,"./systems-context":36}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{"./assets-bundle":6,"path":2}],8:[function(require,module,exports){
'use strict';

function ImagesLoader() {}

ImagesLoader.prototype.load = function imagesLoaderLoad(url, callback, errback) {
  var image = new Image();

  image.onload = callback;
  image.onerror = errback;

  image.src = url;
};

module.exports = ImagesLoader;

},{}],9:[function(require,module,exports){
'use strict';

exports.AssetsLoader = require('./assets-loader');
exports.ImagesLoader = require('./images-loader');
exports.JsonLoader = require('./json-loader');

},{"./assets-loader":7,"./images-loader":8,"./json-loader":10}],10:[function(require,module,exports){
'use strict';

function JsonLoader() {}

JsonLoader.prototype.load = function jsonLoaderLoad(url, callback, errback) {
  var xhr = new XMLHttpRequest();

  xhr.open('GET', url);

  xhr.onreadystatechange = function () {
    if (xhr.readyState < 4) return;

    if (xhr.status === 200) {
      try {
        callback.call(JSON.parse(xhr.responseText));
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

},{}],11:[function(require,module,exports){
'use strict';

var path, loader;

path = require('path');
loader = require('assets-loader');

function AnimationsComponent(e, defaultAnimation, animations) {
  var atlas, i, length, key, data;

  atlas = nuclear.component('atlas').of(e).name;

  this.animations = Object.create(null);

  length = animations.length;

  for (i = 0; i < length; i += 1) {
    key = animations[i];
    data = loader.get(path.join('animations', atlas, atlas + '@' + key + '.json'));

    this.animations[key] = data;
  }

  this.defaultAnimation = defaultAnimation || 'idle';

  this.currentAnimation = this.defaultAnimation;
  this.currentFrame = 0;

  this.timeElapsedSinceLastFrame = 0;
}

module.exports = AnimationsComponent;

},{"assets-loader":"w1dNXB","path":2}],12:[function(require,module,exports){
'use strict';

var AnimationsComponent;

AnimationsComponent = require('./components/animations-component');

module.exports = nuclear.module('game.animations', ['game.rendering'])
  .component('animations', function (e, defaultAnimation, animations) {
    return new AnimationsComponent(e, defaultAnimation, animations);
  })
  .system('animate', [
    'sprite from game.rendering',
    'atlas from game.rendering',
    'animations from game.animations'
  ], require('./systems/animate-system'), {
    msPerUpdate: 16
  });

},{"./components/animations-component":11,"./systems/animate-system":13}],13:[function(require,module,exports){
'use strict';

module.exports = function animateSystem(e, components, context, dt) {
  var atlas, sprite, animations, currentAnimation, frame, width, height, scaledWidth, scaledHeight;

  atlas = components.atlas;
  sprite = components.sprite;
  animations = components.animations;

  currentAnimation = animations.animations[animations.currentAnimation];

  animations.timeElapsedSinceLastFrame += dt * 16;//nuclear.system('animate')._scheduler.lag;

  if (animations.timeElapsedSinceLastFrame > currentAnimation.interval) {
    animations.currentFrame += 1;
    animations.timeElapsedSinceLastFrame -= currentAnimation.interval;

    if (animations.currentFrame > currentAnimation.frames.length - 1) {
      animations.currentFrame = 0;

      if (!currentAnimation.loop) {
        animations.currentAnimation = animations.defaultAnimation;
        currentAnimation = animations.animations[animations.currentAnimation];
      }
    }

    frame = atlas.sprites.frames[currentAnimation.frames[animations.currentFrame]].frame;

    width = sprite.width();
    height = sprite.height();

    scaledWidth = frame.w * sprite.scale;
    scaledHeight = frame.h * sprite.scale;

    sprite.context.clearRect(0, 0, width, height);
    sprite.context.drawImage(atlas.source, frame.x, frame.y, frame.w, frame.h, 0.5 * (width - scaledWidth), (height - scaledHeight), scaledWidth, scaledHeight);
  }
};

},{}],14:[function(require,module,exports){
'use strict';

function ColliderComponent(options) {
  this.offsetX = options.offsetX || 0;
  this.offsetY = options.offsetY || 0;

  this.halfWidth = options.width * 0.5;
  this.halfHeight = options.height * 0.5;

  this._currentCollisions = Object.create(null);

  this._onCollisionEnterListeners = [];
  this._onCollisionExitListeners = [];
  this._onCollisionStayListeners = [];
}

ColliderComponent.prototype.onCollisionEnter = function (callback) {
  this._onCollisionEnterListeners.push(callback);
  return this;
};

ColliderComponent.prototype.onCollisionStay = function (callback) {
  this._onCollisionStayListeners.push(callback);
  return this;
};

ColliderComponent.prototype.onCollisionExit = function (callback) {
  this._onCollisionExitListeners.push(callback);
  return this;
};

ColliderComponent.prototype.triggerCollisionEnter = function colliderComponentTriggerCollisionEnter(e, collider) {
  if (e in this._currentCollisions) {
    this.triggerCollisionStay();
  } else {
    this._currentCollisions[e] = collider;
    this._triggerCollisionListeners(this._onCollisionEnterListeners);
  }
};

ColliderComponent.prototype.triggerCollisionStay = function colliderComponentTriggerCollisionStay() {
  this._triggerCollisionListeners(this._onCollisionStayListeners);
};

ColliderComponent.prototype.triggerCollisionExit = function colliderComponentTriggerCollisionExit(e) {
  delete this._currentCollisions[e];
  this._triggerCollisionListeners(this._onCollisionExitListeners);
};

ColliderComponent.prototype._triggerCollisionListeners = function _colliderComponentTriggerCollisionListeners(listeners) {
  var i, listener;

  for (i = 0; (listener = listeners[i]); i += 1) {
    listener();
  }
};

ColliderComponent.prototype.width = function colliderComponentWidth(value) {
  if (arguments.length === 0) {
    return this.halfWidth * 2;
  }

  this.halfWidth = value * 0.5;

  return this;
};

ColliderComponent.prototype.height = function colliderComponentHeight(value) {
  if (arguments.length === 0) {
    return this.halfHeight;
  }

  this.halfHeight = value * 0.5;

  return this;
};

module.exports = ColliderComponent;

},{}],15:[function(require,module,exports){
'use strict';

var ColliderComponent;

ColliderComponent = require('./components/collider-component');

module.exports = nuclear.module('game.collisions', ['game.transform'])
  .component('collider', function (e, options) {
    return new ColliderComponent(options);
  })
  .system('collisions', [
    'collider from game.collisions',
    'position from game.transform',
    'velocity from game.transform',
    'rigidbody from game.transform'
  ], require('./systems/collisions-system'))
  .system('debug-colliders', [
    'collider from game.collisions',
    'position from game.transform'
  ], require('./systems/debug-colliders-system'));

},{"./components/collider-component":14,"./systems/collisions-system":16,"./systems/debug-colliders-system":17}],16:[function(require,module,exports){
'use strict';

module.exports = function collisionsSystem(e, components, context) {
  var position, velocity, collider, rigidbody, sqrVelocityMagnitude, colliderX, colliderY, others, length, i, other, otherPosition, otherCollider, otherRigidbody, otherX, otherY, dx, dy, overlapX, overlapY, tx, ty, inverseMassSum, inverseMass;

  position = components.position;
  velocity = components.velocity;
  collider = components.collider;
  rigidbody = components.rigidbody;

  sqrVelocityMagnitude = velocity.x * velocity.x + velocity.y * velocity.y;

  inverseMass = rigidbody.inverseMass;

  colliderX = position.x + collider.offsetX;
  colliderY = position.y + collider.offsetY;

  others = context.colliders;
  length = others.length;

  for (i = 0; i < length; i += 1) {
    other = others[i];

    if (other === e) continue;

    otherPosition = nuclear.component('position').of(other);
    otherCollider = nuclear.component('collider').of(other);
    otherRigidbody = nuclear.component('rigidbody').of(other);

    otherX = otherPosition.x + otherCollider.offsetX;
    otherY = otherPosition.y + otherCollider.offsetY;

    dx = otherX - colliderX;
    dy = otherY - colliderY;

    overlapX = Math.abs(dx) - (collider.halfWidth + otherCollider.halfWidth);
    overlapY = Math.abs(dy) - (collider.halfHeight + otherCollider.halfHeight);

    if (overlapX < -0.1 && overlapY < -0.1) {
      tx = Math.abs(velocity.x) / overlapX || 0;
      ty = Math.abs(velocity.y) / overlapY || 0;

      inverseMassSum = inverseMass + otherRigidbody.inverseMass;

      if (tx < ty || (sqrVelocityMagnitude < 0.1 && overlapX > overlapY)) {
        if (dx < 0) {
          position.x -= overlapX / (inverseMassSum / inverseMass || 0);
          otherPosition.x += overlapX / (inverseMassSum / otherRigidbody.inverseMass || 0);
        } else if (dx > 0) {
          position.x += overlapX / (inverseMassSum / inverseMass || 0);
          otherPosition.x -= overlapX / (inverseMassSum / otherRigidbody.inverseMass || 0);
        }
      }

      if (ty < tx || (sqrVelocityMagnitude < 0.1 && overlapY > overlapX)) {
        if (dy < 0) {
          position.y -= overlapY / (inverseMassSum / inverseMass || 0);
          otherPosition.y += overlapY  / (inverseMassSum / otherRigidbody.inverseMass || 0);
        } else if (dy > 0) {
          position.y += overlapY / (inverseMassSum / inverseMass || 0);
          otherPosition.y -= overlapY / (inverseMassSum / otherRigidbody.inverseMass || 0);
        }
      }

      colliderX = position.x + collider.offsetX;
      colliderY = position.y + collider.offsetY;

      if (other in collider._currentCollisions) {
        collider.triggerCollisionStay(other);
      } else {
        collider.triggerCollisionEnter(other);
      }
    } else if (other in collider._currentCollisions) {
      if (sqrVelocityMagnitude > 1) collider.triggerCollisionExit(other);
      else collider.triggerCollisionStay(other);
    }
  }
};

},{}],17:[function(require,module,exports){
'use strict';

module.exports = function debugCollidersSystem(e, components, context) {
  var dest, position, collider, x, y, w, h;

  dest = context.dests[0];

  position = components.position;
  collider = components.collider;

  x = position.x + collider.offsetX;
  y = position.y + collider.offsetY;
  w = collider.halfWidth;
  h = collider.halfHeight;

  dest.save();

  dest.strokeStyle = '#f0f';

  dest.beginPath();

  dest.moveTo(x - w, y - h);
  dest.lineTo(x + w, y - h);
  dest.lineTo(x + w, y + h);
  dest.lineTo(x - w, y + h);

  dest.closePath();

  dest.stroke();

  dest.restore();
};

},{}],18:[function(require,module,exports){
'use strict';
(function(nuclear, console){
    require('./lib/mousetrap.min');

    var inputs, Gamepad, Mousetrap;

    Gamepad = require('./lib/gamepad.min').Gamepad;
    Mousetrap = window.Mousetrap;

    inputs = nuclear.module('game.inputs', []);

    inputs.component('inputs', function(entity, data){
      return data;
    });

    function inputsManager(entity, components){
      var inputs = components.inputs,
          input;

      for(var i in inputsManager.manager){
        input = inputsManager.manager[i];
        if(inputs[i]){

          inputs[i](entity, input, inputsManager.manager);
        }
      }
    }
    inputsManager.manager = {};

    inputs.system('inputsManager', ['inputs'], inputsManager, {
      msPerUpdate : 50
    });

    inputs.config({
      gamepad : {
        'FACE_1' : '',
        'FACE_2' : '',
        'FACE_3' : '',
        'FACE_4' : '',

        'LEFT_TOP_SHOULDER' : '',
        'RIGHT_TOP_SHOULDER' : '',
        'LEFT_BOTTOM_SHOULDER' : '',
        'RIGHT_BOTTOM_SHOULDER' : '',

        'SELECT_BACK' : '',
        'START_FORWARD' : '',
        'LEFT_STICK_X' : 'LEFT_AXIS_X',
        'RIGHT_STICK_X' : 'RIGHT_AXIS_X',
        'LEFT_STICK_Y' : 'LEFT_AXIS_Y',
        'RIGHT_STICK_Y' : 'RIGHT_AXIS_Y',

        'DPAD_UP' : 'UP',
        'DPAD_DOWN' : 'DOWN',
        'DPAD_LEFT' : 'LEFT',
        'DPAD_RIGHT' : 'RIGHT',

        'HOME' : ''
      },
      keyboard : {
        'a' : 'A',
        'up' : 'UP',
        'down' : 'DOWN',
        'left' : 'LEFT',
        'right' : 'RIGHT',
        'z' : 'UP',
        'q' : 'LEFT',
        's' : 'DOWN',
        'd' : 'RIGHT',
      }
    });
    var gamepad = new Gamepad();
    gamepad.init();
    gamepad.bind(Gamepad.Event.CONNECTED, function() {
      console.log('[MODULE@INPUTS] GAMEPAD CONNECTED');
    });
    gamepad.bind(Gamepad.Event.UNCONNECTED, function() {
      console.log('[MODULE@INPUTS] GAMEPAD UNCONNECTED');
    });
    gamepad.bind(Gamepad.Event.BUTTON_DOWN, function(e) {
      var alias = inputs.config('gamepad')[e.control];
      inputsManager.manager[alias] = 1;
    });
    gamepad.bind(Gamepad.Event.BUTTON_UP, function(e) {
      var alias = inputs.config('gamepad')[e.control];
      inputsManager.manager[alias] = 0;
    });
    gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(e) {
      var alias = inputs.config('gamepad')[e.axis];
      inputsManager.manager[alias] = e.value;
    });

    var key, config;
    config = inputs.config('keyboard');

    function onKeyDown(e, key){
      var alias = inputs.config('keyboard')[key];
      inputsManager.manager[alias] = 1;
    }

    function onKeyUp(e, key){
      var alias = inputs.config('keyboard')[key];
      inputsManager.manager[alias] = 0;
    }

    for(var i in config){
      key = i;
      Mousetrap.bind(key, onKeyDown, 'keydown');
      Mousetrap.bind(key, onKeyUp, 'keyup');
      /*jshint ignore:end */
    }
    module.exports = inputs;
})(window.nuclear, window.console);

},{"./lib/gamepad.min":19,"./lib/mousetrap.min":20}],19:[function(require,module,exports){
!function(a){"use strict";var b=function(){},c={getType:function(){return"null"},isSupported:function(){return!1},update:b},d=function(a){var c=this,d=window;this.update=b;this.requestAnimationFrame=a||d.requestAnimationFrame||d.webkitRequestAnimationFrame||d.mozRequestAnimationFrame;this.tickFunction=function(){c.update();c.startTicker()};this.startTicker=function(){c.requestAnimationFrame.apply(d,[c.tickFunction])}};d.prototype.start=function(a){this.update=a||b;this.startTicker()};var e=function(){};e.prototype.update=b;e.prototype.start=function(a){this.update=a||b};var f=function(a,b){this.listener=a;this.gamepadGetter=b;this.knownGamepads=[]};f.factory=function(a){var b=c,d=window&&window.navigator;d&&("undefined"!=typeof d.webkitGamepads?b=new f(a,function(){return d.webkitGamepads}):"undefined"!=typeof d.webkitGetGamepads&&(b=new f(a,function(){return d.webkitGetGamepads()})));return b};f.getType=function(){return"WebKit"},f.prototype.getType=function(){return f.getType()},f.prototype.isSupported=function(){return!0};f.prototype.update=function(){var a,b,c=this,d=Array.prototype.slice.call(this.gamepadGetter(),0);for(b=this.knownGamepads.length-1;b>=0;b--){a=this.knownGamepads[b];if(d.indexOf(a)<0){this.knownGamepads.splice(b,1);this.listener._disconnect(a)}}for(b=0;b<d.length;b++){a=d[b];if(a&&c.knownGamepads.indexOf(a)<0){c.knownGamepads.push(a);c.listener._connect(a)}}};var g=function(a){this.listener=a;window.addEventListener("gamepadconnected",function(b){a._connect(b.gamepad)});window.addEventListener("gamepaddisconnected",function(b){a._disconnect(b.gamepad)})};g.factory=function(a){var b=c;window&&"undefined"!=typeof window.addEventListener&&(b=new g(a));return b};g.getType=function(){return"Firefox"},g.prototype.getType=function(){return g.getType()},g.prototype.isSupported=function(){return!0};g.prototype.update=b;var h=function(a){this.updateStrategy=a||new d;this.gamepads=[];this.listeners={};this.platform=c;this.deadzone=.03;this.maximizeThreshold=.97};h.UpdateStrategies={AnimFrameUpdateStrategy:d,ManualUpdateStrategy:e};h.PlatformFactories=[f.factory,g.factory];h.Type={PLAYSTATION:"playstation",LOGITECH:"logitech",XBOX:"xbox",UNKNOWN:"unknown"};h.Event={CONNECTED:"connected",UNSUPPORTED:"unsupported",DISCONNECTED:"disconnected",TICK:"tick",BUTTON_DOWN:"button-down",BUTTON_UP:"button-up",AXIS_CHANGED:"axis-changed"};h.StandardButtons=["FACE_1","FACE_2","FACE_3","FACE_4","LEFT_TOP_SHOULDER","RIGHT_TOP_SHOULDER","LEFT_BOTTOM_SHOULDER","RIGHT_BOTTOM_SHOULDER","SELECT_BACK","START_FORWARD","LEFT_STICK","RIGHT_STICK","DPAD_UP","DPAD_DOWN","DPAD_LEFT","DPAD_RIGHT","HOME"];h.StandardAxes=["LEFT_STICK_X","LEFT_STICK_Y","RIGHT_STICK_X","RIGHT_STICK_Y"];var i=function(a,b,c){return b<a.length?a[b]:c+(b-a.length+1)};h.StandardMapping={env:{},buttons:{byButton:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]},axes:{byAxis:[0,1,2,3]}};h.Mappings=[{env:{platform:g.getType(),type:h.Type.PLAYSTATION},buttons:{byButton:[14,13,15,12,10,11,8,9,0,3,1,2,4,6,7,5,16]},axes:{byAxis:[0,1,2,3]}},{env:{platform:f.getType(),type:h.Type.LOGITECH},buttons:{byButton:[1,2,0,3,4,5,6,7,8,9,10,11,11,12,13,14,10]},axes:{byAxis:[0,1,2,3]}},{env:{platform:g.getType(),type:h.Type.LOGITECH},buttons:{byButton:[0,1,2,3,4,5,-1,-1,6,7,8,9,11,12,13,14,10],byAxis:[-1,-1,-1,-1,-1,-1,[2,0,1],[2,0,-1]]},axes:{byAxis:[0,1,3,4]}}];h.prototype.init=function(){var a=h.resolvePlatform(this),b=this;this.platform=a;this.updateStrategy.start(function(){b._update()});return a.isSupported()};h.prototype.bind=function(a,b){"undefined"==typeof this.listeners[a]&&(this.listeners[a]=[]);this.listeners[a].push(b);return this};h.prototype.unbind=function(a,b){if("undefined"!=typeof a){if("undefined"!=typeof b){if("undefined"==typeof this.listeners[a])return!1;for(var c=0;c<this.listeners[a].length;c++)if(this.listeners[a][c]===b){this.listeners[a].splice(c,1);return!0}return!1}this.listeners[a]=[]}else this.listeners={}};h.prototype.count=function(){return this.gamepads.length};h.prototype._fire=function(a,b){if("undefined"!=typeof this.listeners[a])for(var c=0;c<this.listeners[a].length;c++)this.listeners[a][c].apply(this.listeners[a][c],[b])};h.getNullPlatform=function(){return Object.create(c)};h.resolvePlatform=function(a){var b,d=c;for(b=0;!d.isSupported()&&b<h.PlatformFactories.length;b++)d=h.PlatformFactories[b](a);return d};h.prototype._connect=function(a){var b,c,d=this._resolveMapping(a);a.state={};a.lastState={};a.updater=[];b=d.buttons.byButton.length;for(c=0;b>c;c++)this._addButtonUpdater(a,d,c);b=d.axes.byAxis.length;for(c=0;b>c;c++)this._addAxisUpdater(a,d,c);this.gamepads[a.index]=a;this._fire(h.Event.CONNECTED,a)};h.prototype._addButtonUpdater=function(a,c,d){var e=b,f=i(h.StandardButtons,d,"EXTRA_BUTTON_"),g=this._createButtonGetter(a,c.buttons,d),j=this,k={gamepad:a,control:f};a.state[f]=0;a.lastState[f]=0;e=function(){var b=g(),c=a.lastState[f],d=b>.5,e=c>.5;a.state[f]=b;d&&!e?j._fire(h.Event.BUTTON_DOWN,Object.create(k)):!d&&e&&j._fire(h.Event.BUTTON_UP,Object.create(k));0!==b&&1!==b&&b!==c&&j._fireAxisChangedEvent(a,f,b);a.lastState[f]=b};a.updater.push(e)};h.prototype._addAxisUpdater=function(a,c,d){var e=b,f=i(h.StandardAxes,d,"EXTRA_AXIS_"),g=this._createAxisGetter(a,c.axes,d),j=this;a.state[f]=0;a.lastState[f]=0;e=function(){var b=g(),c=a.lastState[f];a.state[f]=b;b!==c&&j._fireAxisChangedEvent(a,f,b);a.lastState[f]=b};a.updater.push(e)};h.prototype._fireAxisChangedEvent=function(a,b,c){var d={gamepad:a,axis:b,value:c};this._fire(h.Event.AXIS_CHANGED,d)};h.prototype._createButtonGetter=function(){var a=function(){return 0},b=function(b,c,d){var e=a;d>c?e=function(){var a=d-c,e=b();e=(e-c)/a;return 0>e?0:e}:c>d&&(e=function(){var a=c-d,e=b();e=(e-d)/a;return e>1?0:1-e});return e},c=function(a){return"[object Array]"===Object.prototype.toString.call(a)};return function(d,e,f){var g,h=a,i=this;g=e.byButton[f];if(-1!==g)"number"==typeof g&&g<d.buttons.length&&(h=function(){return d.buttons[g]});else if(e.byAxis&&f<e.byAxis.length){g=e.byAxis[f];if(c(g)&&3==g.length&&g[0]<d.axes.length){h=function(){var a=d.axes[g[0]];return i._applyDeadzoneMaximize(a)};h=b(h,g[1],g[2])}}return h}}();h.prototype._createAxisGetter=function(){var a=function(){return 0};return function(b,c,d){var e,f=a,g=this;e=c.byAxis[d];-1!==e&&"number"==typeof e&&e<b.axes.length&&(f=function(){var a=b.axes[e];return g._applyDeadzoneMaximize(a)});return f}}();h.prototype._disconnect=function(a){var b,c=[];"undefined"!=typeof this.gamepads[a.index]&&delete this.gamepads[a.index];for(b=0;b<this.gamepads.length;b++)"undefined"!=typeof this.gamepads[b]&&(c[b]=this.gamepads[b]);this.gamepads=c;this._fire(h.Event.DISCONNECTED,a)};h.prototype._resolveControllerType=function(a){a=a.toLowerCase();return-1!==a.indexOf("playstation")?h.Type.PLAYSTATION:-1!==a.indexOf("logitech")||-1!==a.indexOf("wireless gamepad")?h.Type.LOGITECH:-1!==a.indexOf("xbox")||-1!==a.indexOf("360")?h.Type.XBOX:h.Type.UNKNOWN};h.prototype._resolveMapping=function(a){var b,c,d=h.Mappings,e=null,f={platform:this.platform.getType(),type:this._resolveControllerType(a.id)};for(b=0;!e&&b<d.length;b++){c=d[b];h.envMatchesFilter(c.env,f)&&(e=c)}return e||h.StandardMapping};h.envMatchesFilter=function(a,b){var c,d=!0;for(c in a)a[c]!==b[c]&&(d=!1);return d};h.prototype._update=function(){this.platform.update();this.gamepads.forEach(function(a){a&&a.updater.forEach(function(a){a()})});this.gamepads.length>0&&this._fire(h.Event.TICK,this.gamepads)},h.prototype._applyDeadzoneMaximize=function(a,b,c){b="undefined"!=typeof b?b:this.deadzone;c="undefined"!=typeof c?c:this.maximizeThreshold;a>=0?b>a?a=0:a>c&&(a=1):a>-b?a=0:-c>a&&(a=-1);return a};a.Gamepad=h}("undefined"!=typeof module&&module.exports||window);
},{}],20:[function(require,module,exports){
/* mousetrap v1.4.6 craig.is/killing/mice */
(function(J,r,f){function s(a,b,d){a.addEventListener?a.addEventListener(b,d,!1):a.attachEvent("on"+b,d)}function A(a){if("keypress"==a.type){var b=String.fromCharCode(a.which);a.shiftKey||(b=b.toLowerCase());return b}return h[a.which]?h[a.which]:B[a.which]?B[a.which]:String.fromCharCode(a.which).toLowerCase()}function t(a){a=a||{};var b=!1,d;for(d in n)a[d]?b=!0:n[d]=0;b||(u=!1)}function C(a,b,d,c,e,v){var g,k,f=[],h=d.type;if(!l[a])return[];"keyup"==h&&w(a)&&(b=[a]);for(g=0;g<l[a].length;++g)if(k=
l[a][g],!(!c&&k.seq&&n[k.seq]!=k.level||h!=k.action||("keypress"!=h||d.metaKey||d.ctrlKey)&&b.sort().join(",")!==k.modifiers.sort().join(","))){var m=c&&k.seq==c&&k.level==v;(!c&&k.combo==e||m)&&l[a].splice(g,1);f.push(k)}return f}function K(a){var b=[];a.shiftKey&&b.push("shift");a.altKey&&b.push("alt");a.ctrlKey&&b.push("ctrl");a.metaKey&&b.push("meta");return b}function x(a,b,d,c){m.stopCallback(b,b.target||b.srcElement,d,c)||!1!==a(b,d)||(b.preventDefault?b.preventDefault():b.returnValue=!1,b.stopPropagation?
b.stopPropagation():b.cancelBubble=!0)}function y(a){"number"!==typeof a.which&&(a.which=a.keyCode);var b=A(a);b&&("keyup"==a.type&&z===b?z=!1:m.handleKey(b,K(a),a))}function w(a){return"shift"==a||"ctrl"==a||"alt"==a||"meta"==a}function L(a,b,d,c){function e(b){return function(){u=b;++n[a];clearTimeout(D);D=setTimeout(t,1E3)}}function v(b){x(d,b,a);"keyup"!==c&&(z=A(b));setTimeout(t,10)}for(var g=n[a]=0;g<b.length;++g){var f=g+1===b.length?v:e(c||E(b[g+1]).action);F(b[g],f,c,a,g)}}function E(a,b){var d,
c,e,f=[];d="+"===a?["+"]:a.split("+");for(e=0;e<d.length;++e)c=d[e],G[c]&&(c=G[c]),b&&"keypress"!=b&&H[c]&&(c=H[c],f.push("shift")),w(c)&&f.push(c);d=c;e=b;if(!e){if(!p){p={};for(var g in h)95<g&&112>g||h.hasOwnProperty(g)&&(p[h[g]]=g)}e=p[d]?"keydown":"keypress"}"keypress"==e&&f.length&&(e="keydown");return{key:c,modifiers:f,action:e}}function F(a,b,d,c,e){q[a+":"+d]=b;a=a.replace(/\s+/g," ");var f=a.split(" ");1<f.length?L(a,f,b,d):(d=E(a,d),l[d.key]=l[d.key]||[],C(d.key,d.modifiers,{type:d.action},
c,a,e),l[d.key][c?"unshift":"push"]({callback:b,modifiers:d.modifiers,action:d.action,seq:c,level:e,combo:a}))}var h={8:"backspace",9:"tab",13:"enter",16:"shift",17:"ctrl",18:"alt",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"ins",46:"del",91:"meta",93:"meta",224:"meta"},B={106:"*",107:"+",109:"-",110:".",111:"/",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},H={"~":"`","!":"1",
"@":"2","#":"3",$:"4","%":"5","^":"6","&":"7","*":"8","(":"9",")":"0",_:"-","+":"=",":":";",'"':"'","<":",",">":".","?":"/","|":"\\"},G={option:"alt",command:"meta","return":"enter",escape:"esc",mod:/Mac|iPod|iPhone|iPad/.test(navigator.platform)?"meta":"ctrl"},p,l={},q={},n={},D,z=!1,I=!1,u=!1;for(f=1;20>f;++f)h[111+f]="f"+f;for(f=0;9>=f;++f)h[f+96]=f;s(r,"keypress",y);s(r,"keydown",y);s(r,"keyup",y);var m={bind:function(a,b,d){a=a instanceof Array?a:[a];for(var c=0;c<a.length;++c)F(a[c],b,d);return this},
unbind:function(a,b){return m.bind(a,function(){},b)},trigger:function(a,b){if(q[a+":"+b])q[a+":"+b]({},a);return this},reset:function(){l={};q={};return this},stopCallback:function(a,b){return-1<(" "+b.className+" ").indexOf(" mousetrap ")?!1:"INPUT"==b.tagName||"SELECT"==b.tagName||"TEXTAREA"==b.tagName||b.isContentEditable},handleKey:function(a,b,d){var c=C(a,b,d),e;b={};var f=0,g=!1;for(e=0;e<c.length;++e)c[e].seq&&(f=Math.max(f,c[e].level));for(e=0;e<c.length;++e)c[e].seq?c[e].level==f&&(g=!0,
b[c[e].seq]=1,x(c[e].callback,d,c[e].combo,c[e].seq)):g||x(c[e].callback,d,c[e].combo);c="keypress"==d.type&&I;d.type!=u||w(a)||c||t(b);I=g&&"keydown"==d.type}};J.Mousetrap=m;"function"===typeof define&&define.amd&&define(m)})(window,document);

},{}],21:[function(require,module,exports){
'use strict';

function LightComponent(options) {
  this.shape = [];
  this.color = options.color;
  this.radius = options.radius;
  this.intensity = options.intensity;
}

module.exports = LightComponent;

},{}],22:[function(require,module,exports){
'use strict';

function OccluderComponent(shape) {
  this.shape = shape;
}

module.exports = OccluderComponent;

},{}],23:[function(require,module,exports){
'use strict';

var LightComponent, OccluderComponent;

LightComponent = require('./components/light-component');
OccluderComponent = require('./components/occluder-component');

module.exports = nuclear.module('game.lighting', [])
  .component('occluder', function (e, shape) {
    return new OccluderComponent(shape);
  })
  .component('light', function (e, options) {
    return new LightComponent(options);
  })
  .system('shadowing', [
    'occluder from game.lighting'
  ], require('./systems/shadowing-system'))
  .system('lighting', [
    'light from game.lighting',
    'position from game.transform'
  ], require('./systems/lighting-system'))
  .system('debug-occluders', [
    'occluder from game.lighting',
    'position from game.transform'
  ], require('./systems/debug-occluders-system'));

},{"./components/light-component":21,"./components/occluder-component":22,"./systems/debug-occluders-system":24,"./systems/lighting-system":25,"./systems/shadowing-system":26}],24:[function(require,module,exports){
'use strict';

module.exports = function debugOccludersSystem(e, components, context) {
  var dest, shape, length, i;

  dest = context.dests[0];

  shape = components.occluder.shape;
  length = shape.length;

  dest.save();

  dest.translate(components.position.x, components.position.y);

  dest.fillStyle = 'black';

  dest.moveTo(shape[0], shape[1]);

  for (i = 2; i < length; i += 2) {
    dest.lineTo(shape[i], shape[i + 1]);
  }

  dest.closePath();

  dest.fill();

  dest.restore();
};

},{}],25:[function(require,module,exports){
'use strict';

module.exports = function lightingSystem(/*e, components, context*/) {/*

*/};

},{}],26:[function(require,module,exports){
'use strict';

nuclear.events.on('system:before:shadowing from game.lighting', function () {
  var lightComponent, context, i, e;

  lightComponent = nuclear.component('light');
  context = nuclear.system.context();

  for (i = 0; (e = context.lights[i]); i += 1) {
    lightComponent.of(e).shape.length = 0;
  }
});

module.exports = function shadowingSystem(e, components, context) {
  var lightComponent, positionComponent, dest, lights, position, shape, i, lightEntity, lightPosition, light, j, length;
  var t1, t2, rpx, rpy, rdx, rdy, spx, spy, sdx, sdy, im;

  lightComponent = nuclear.component('light');
  positionComponent = nuclear.component('position');

  dest = context.dests[0];

  dest.save();

  lights = context.lights;
  position = components.position;

  shape = components.occluder.shape;

  for (i = 0; (lightEntity = lights[i]); i += 1) {
    lightPosition = positionComponent.of(lightEntity);
    light = lightComponent.of(lightEntity);

    rpx = lightPosition.x;
    rpy = lightPosition.y;

    length = shape.length;

    for (j = 0; j < length; j += 2) {
      spx = shape[j];
      spy = shape[(j + 1) % length];

      rdx = spx - rpx;
      rdy = spy - rpy;

      sdx = shape[(j + 2) % length] - spx;
      sdy = shape[(j + 3) % length] - spy;

      t2 = (rdx * (spy - rpy) + rdy * (rpx - spx)) / (sdx * rdy - sdy * rdx);
      t1 = (spx + sdx * t2 - rpx) / rdx;

      if (t1 < 0) break;
      if (t2 < 0 || t2 > 1) break;

      im = Math.sqrt(sdx * sdx + sdy * sdy);

      light.shape.push(spx + sdx * im * t2, spy + sdy * t2);
    }

    length = light.shape.length;

    dest.strokeStyle = 'red';

    for (j = 0; j < length; j += 2) {
      dest.beginPath();
      dest.moveTo(rpx, rpy);
      dest.lineTo(light.shape[j], light.shape[j + 1]);
      dest.closePath();
      dest.stroke();
    }
  }

  dest.restore();

/*
  on after
    sort vertices of the shape of each light

*/};

},{}],27:[function(require,module,exports){
'use strict';

var path, loader;

path = require('path');
loader = require('assets-loader');

function AtlasComponent(key) {
  this.name = key;
  this.source = loader.get(path.join('atlases', key + '.atlas.png'));
  this.sprites = loader.get(path.join('atlases', key + '.atlas.json'));
}

module.exports = AtlasComponent;

},{"assets-loader":"w1dNXB","path":2}],28:[function(require,module,exports){
'use strict';

var path, loader;

path = require('path');
loader = require('assets-loader');

function SpriteComponent(e, options) {
  var atlas, source, scaledWidth, scaledHeight;

  atlas = nuclear.component('atlas').of(e);

  this.buffer = document.createElement('canvas');
  this.context = this.buffer.getContext('2d');

  this.dest = options.dest || 0;
  this.scale = options.scale || 1;

  this.buffer.width = options.width;
  this.buffer.height = options.height;

  this.context.imageSmoothingEnabled = false;

  if (atlas) {
    source = loader.get(path.join('atlases', atlas.name + '.atlas.json')).frames[options.frame || 0];

    scaledWidth = source.frame.w * this.scale;
    scaledHeight = source.frame.h * this.scale;

    this.context.drawImage(atlas.source, source.frame.x, source.frame.y, source.frame.w, source.frame.h, 0.5 * (options.width - scaledWidth), 0.5 * (options.height - scaledHeight), scaledWidth, scaledHeight);
  }
}

SpriteComponent.prototype.width = function spriteWidth(value) {
  if (arguments.length === 0) {
    return this.buffer.width;
  }

  this.buffer.width = value;

  this.context.imageSmoothingEnabled = false;

  return this;
};

SpriteComponent.prototype.height = function spriteHeight(value) {
  if (arguments.length === 0) {
    return this.buffer.height;
  }

  this.buffer.height = value;

  this.context.imageSmoothingEnabled = false;

  return this;
};

module.exports = SpriteComponent;

},{"assets-loader":"w1dNXB","path":2}],29:[function(require,module,exports){
'use strict';

var AtlasComponent, SpriteComponent;

AtlasComponent = require('./components/atlas-component');
SpriteComponent = require('./components/sprite-component');

module.exports = nuclear.module('game.rendering', ['game.transform'])
  .component('atlas', function (e, key) {
    return new AtlasComponent(key);
  })
  .component('sprite', function (e, options) {
    return new SpriteComponent(e, options);
  })
  .system('renderer', [
    'sprite from game.rendering',
    'position from game.transform'
  ], require('./systems/renderer-system'));

},{"./components/atlas-component":27,"./components/sprite-component":28,"./systems/renderer-system":30}],30:[function(require,module,exports){
'use strict';

nuclear.events.on('system:before:renderer from game.rendering', function () {
  var context;

  context = nuclear.system.context();

  context.dests[0].clearRect(0, 0, context.WIDTH, context.HEIGHT);
});

module.exports = function rendererSystem(e, components, context) {
  var sprite, position, dest, width, height;

  sprite = components.sprite;
  position = components.position;

  dest = context.dests[sprite.dest];

  width = sprite.width();
  height = sprite.height();

  dest.drawImage(sprite.buffer, position.x - width * 0.5, position.y - height * 0.5);
};

},{}],31:[function(require,module,exports){
'use strict';

function RigidbodyComponent(options) {
  this._mass = options.mass || 1;

  this.inverseMass = 1 / this._mass;
  this.friction = options.friction || 0;
}

RigidbodyComponent.prototype.mass = function rigidbodyComponentMass(value) {
  if (arguments.length === 0) {
    return this._mass;
  }

  this._mass = value;
  this.inverseMass = 1 / value;

  return this;
};

module.exports = RigidbodyComponent;

},{}],32:[function(require,module,exports){
'use strict';

var RigidbodyComponent, vec2;

RigidbodyComponent = require('./components/rigidbody-component');
vec2 = require('./vec2');

module.exports = nuclear.module('game.transform', [])
  .component('position', function (e, x, y) {
    return vec2(x, y);
  })
  .component('velocity', function (e, x, y) {
    return vec2(x, y);
  })
  .component('rigidbody', function (e, options) {
    return new RigidbodyComponent(options);
  })
  .system('kinematic', [
    'position from game.transform',
    'velocity from game.transform',
    'rigidbody from game.transform',
  ], require('./systems/kinematic-system'));

},{"./components/rigidbody-component":31,"./systems/kinematic-system":33,"./vec2":34}],33:[function(require,module,exports){
'use strict';

module.exports = function kinematicSystem(e, components, context, dt) {
  var friction;

  friction = components.rigidbody.friction;

  components.position.x += components.velocity.x * dt;
  components.position.y += components.velocity.y * dt;

  components.velocity.x *= friction;
  components.velocity.y *= friction;
};

},{}],34:[function(require,module,exports){
'use strict';

module.exports = function vec2(x, y) {
  return {x: x || 0, y: y || 0};
};

},{}],35:[function(require,module,exports){
'use strict';

var hero;

hero = nuclear.entity.create();

nuclear.component('position').add(hero, 250, 250);

nuclear.component('atlas').add(hero, 'hero');

nuclear.component('sprite').add(hero, {
  scale: 4,
  width: 64,
  height: 120
});

nuclear.component('animations').add(hero, 'walkleft', [
  'idleback',
  'idleface',
  'idleleft',
  'idleright',
  'walkback',
  'walkface',
  'walkleft',
  'walkright'
]);

},{}],36:[function(require,module,exports){
'use strict';

var context;

context = nuclear.system.context();

context.dests = [
  document.getElementById('screen').getContext('2d')
];

context.WIDTH = context.dests[0].canvas.width;
context.HEIGHT = context.dests[0].canvas.height;

context.lights = nuclear.system('lighting').query.entities;

context.colliders = nuclear.query([
  'collider from game.collisions',
  'position from game.transform',
  'rigidbody from game.transform'
].join(' ')).entities;

},{}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9nYW1ld2VlazIwMTQvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luc2VydC1tb2R1bGUtZ2xvYmFscy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9nYW1ld2VlazIwMTQvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3BhdGgtYnJvd3NlcmlmeS9pbmRleC5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvZ2FtZXdlZWsyMDE0L3NyYy9hc3NldHMtbG9hZGVyLmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9nYW1ld2VlazIwMTQvc3JjL2luZGV4LmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9nYW1ld2VlazIwMTQvc3JjL2xvYWRlcnMvYXNzZXRzLWJ1bmRsZS5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvZ2FtZXdlZWsyMDE0L3NyYy9sb2FkZXJzL2Fzc2V0cy1sb2FkZXIuanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvbG9hZGVycy9pbWFnZXMtbG9hZGVyLmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9nYW1ld2VlazIwMTQvc3JjL2xvYWRlcnMvaW5kZXguanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvbG9hZGVycy9qc29uLWxvYWRlci5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS5hbmltYXRpb25zL2NvbXBvbmVudHMvYW5pbWF0aW9ucy1jb21wb25lbnQuanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUuYW5pbWF0aW9ucy9pbmRleC5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS5hbmltYXRpb25zL3N5c3RlbXMvYW5pbWF0ZS1zeXN0ZW0uanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUuY29sbGlzaW9ucy9jb21wb25lbnRzL2NvbGxpZGVyLWNvbXBvbmVudC5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS5jb2xsaXNpb25zL2luZGV4LmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9nYW1ld2VlazIwMTQvc3JjL251Y2xlYXJfbW9kdWxlcy9nYW1lLmNvbGxpc2lvbnMvc3lzdGVtcy9jb2xsaXNpb25zLXN5c3RlbS5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS5jb2xsaXNpb25zL3N5c3RlbXMvZGVidWctY29sbGlkZXJzLXN5c3RlbS5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS5pbnB1dHMvaW5kZXguanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUuaW5wdXRzL2xpYi9nYW1lcGFkLm1pbi5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS5pbnB1dHMvbGliL21vdXNldHJhcC5taW4uanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUubGlnaHRpbmcvY29tcG9uZW50cy9saWdodC1jb21wb25lbnQuanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUubGlnaHRpbmcvY29tcG9uZW50cy9vY2NsdWRlci1jb21wb25lbnQuanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUubGlnaHRpbmcvaW5kZXguanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUubGlnaHRpbmcvc3lzdGVtcy9kZWJ1Zy1vY2NsdWRlcnMtc3lzdGVtLmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9nYW1ld2VlazIwMTQvc3JjL251Y2xlYXJfbW9kdWxlcy9nYW1lLmxpZ2h0aW5nL3N5c3RlbXMvbGlnaHRpbmctc3lzdGVtLmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9nYW1ld2VlazIwMTQvc3JjL251Y2xlYXJfbW9kdWxlcy9nYW1lLmxpZ2h0aW5nL3N5c3RlbXMvc2hhZG93aW5nLXN5c3RlbS5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS5yZW5kZXJpbmcvY29tcG9uZW50cy9hdGxhcy1jb21wb25lbnQuanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUucmVuZGVyaW5nL2NvbXBvbmVudHMvc3ByaXRlLWNvbXBvbmVudC5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS5yZW5kZXJpbmcvaW5kZXguanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUucmVuZGVyaW5nL3N5c3RlbXMvcmVuZGVyZXItc3lzdGVtLmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9nYW1ld2VlazIwMTQvc3JjL251Y2xlYXJfbW9kdWxlcy9nYW1lLnRyYW5zZm9ybS9jb21wb25lbnRzL3JpZ2lkYm9keS1jb21wb25lbnQuanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUudHJhbnNmb3JtL2luZGV4LmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9nYW1ld2VlazIwMTQvc3JjL251Y2xlYXJfbW9kdWxlcy9nYW1lLnRyYW5zZm9ybS9zeXN0ZW1zL2tpbmVtYXRpYy1zeXN0ZW0uanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUudHJhbnNmb3JtL3ZlYzIuanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvc2NlbmVzL2hlcm8tc2NlbmUuanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvc3lzdGVtcy1jb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCIoZnVuY3Rpb24gKHByb2Nlc3Mpe1xuLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIHJlc29sdmVzIC4gYW5kIC4uIGVsZW1lbnRzIGluIGEgcGF0aCBhcnJheSB3aXRoIGRpcmVjdG9yeSBuYW1lcyB0aGVyZVxuLy8gbXVzdCBiZSBubyBzbGFzaGVzLCBlbXB0eSBlbGVtZW50cywgb3IgZGV2aWNlIG5hbWVzIChjOlxcKSBpbiB0aGUgYXJyYXlcbi8vIChzbyBhbHNvIG5vIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHNsYXNoZXMgLSBpdCBkb2VzIG5vdCBkaXN0aW5ndWlzaFxuLy8gcmVsYXRpdmUgYW5kIGFic29sdXRlIHBhdGhzKVxuZnVuY3Rpb24gbm9ybWFsaXplQXJyYXkocGFydHMsIGFsbG93QWJvdmVSb290KSB7XG4gIC8vIGlmIHRoZSBwYXRoIHRyaWVzIHRvIGdvIGFib3ZlIHRoZSByb290LCBgdXBgIGVuZHMgdXAgPiAwXG4gIHZhciB1cCA9IDA7XG4gIGZvciAodmFyIGkgPSBwYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIHZhciBsYXN0ID0gcGFydHNbaV07XG4gICAgaWYgKGxhc3QgPT09ICcuJykge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgIH0gZWxzZSBpZiAobGFzdCA9PT0gJy4uJykge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXArKztcbiAgICB9IGVsc2UgaWYgKHVwKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgICB1cC0tO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoZSBwYXRoIGlzIGFsbG93ZWQgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIHJlc3RvcmUgbGVhZGluZyAuLnNcbiAgaWYgKGFsbG93QWJvdmVSb290KSB7XG4gICAgZm9yICg7IHVwLS07IHVwKSB7XG4gICAgICBwYXJ0cy51bnNoaWZ0KCcuLicpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwYXJ0cztcbn1cblxuLy8gU3BsaXQgYSBmaWxlbmFtZSBpbnRvIFtyb290LCBkaXIsIGJhc2VuYW1lLCBleHRdLCB1bml4IHZlcnNpb25cbi8vICdyb290JyBpcyBqdXN0IGEgc2xhc2gsIG9yIG5vdGhpbmcuXG52YXIgc3BsaXRQYXRoUmUgPVxuICAgIC9eKFxcLz98KShbXFxzXFxTXSo/KSgoPzpcXC57MSwyfXxbXlxcL10rP3wpKFxcLlteLlxcL10qfCkpKD86W1xcL10qKSQvO1xudmFyIHNwbGl0UGF0aCA9IGZ1bmN0aW9uKGZpbGVuYW1lKSB7XG4gIHJldHVybiBzcGxpdFBhdGhSZS5leGVjKGZpbGVuYW1lKS5zbGljZSgxKTtcbn07XG5cbi8vIHBhdGgucmVzb2x2ZShbZnJvbSAuLi5dLCB0bylcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMucmVzb2x2ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmVzb2x2ZWRQYXRoID0gJycsXG4gICAgICByZXNvbHZlZEFic29sdXRlID0gZmFsc2U7XG5cbiAgZm9yICh2YXIgaSA9IGFyZ3VtZW50cy5sZW5ndGggLSAxOyBpID49IC0xICYmICFyZXNvbHZlZEFic29sdXRlOyBpLS0pIHtcbiAgICB2YXIgcGF0aCA9IChpID49IDApID8gYXJndW1lbnRzW2ldIDogcHJvY2Vzcy5jd2QoKTtcblxuICAgIC8vIFNraXAgZW1wdHkgYW5kIGludmFsaWQgZW50cmllc1xuICAgIGlmICh0eXBlb2YgcGF0aCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyB0byBwYXRoLnJlc29sdmUgbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfSBlbHNlIGlmICghcGF0aCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgcmVzb2x2ZWRQYXRoID0gcGF0aCArICcvJyArIHJlc29sdmVkUGF0aDtcbiAgICByZXNvbHZlZEFic29sdXRlID0gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbiAgfVxuXG4gIC8vIEF0IHRoaXMgcG9pbnQgdGhlIHBhdGggc2hvdWxkIGJlIHJlc29sdmVkIHRvIGEgZnVsbCBhYnNvbHV0ZSBwYXRoLCBidXRcbiAgLy8gaGFuZGxlIHJlbGF0aXZlIHBhdGhzIHRvIGJlIHNhZmUgKG1pZ2h0IGhhcHBlbiB3aGVuIHByb2Nlc3MuY3dkKCkgZmFpbHMpXG5cbiAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gIHJlc29sdmVkUGF0aCA9IG5vcm1hbGl6ZUFycmF5KGZpbHRlcihyZXNvbHZlZFBhdGguc3BsaXQoJy8nKSwgZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiAhIXA7XG4gIH0pLCAhcmVzb2x2ZWRBYnNvbHV0ZSkuam9pbignLycpO1xuXG4gIHJldHVybiAoKHJlc29sdmVkQWJzb2x1dGUgPyAnLycgOiAnJykgKyByZXNvbHZlZFBhdGgpIHx8ICcuJztcbn07XG5cbi8vIHBhdGgubm9ybWFsaXplKHBhdGgpXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgdmFyIGlzQWJzb2x1dGUgPSBleHBvcnRzLmlzQWJzb2x1dGUocGF0aCksXG4gICAgICB0cmFpbGluZ1NsYXNoID0gc3Vic3RyKHBhdGgsIC0xKSA9PT0gJy8nO1xuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICBwYXRoID0gbm9ybWFsaXplQXJyYXkoZmlsdGVyKHBhdGguc3BsaXQoJy8nKSwgZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiAhIXA7XG4gIH0pLCAhaXNBYnNvbHV0ZSkuam9pbignLycpO1xuXG4gIGlmICghcGF0aCAmJiAhaXNBYnNvbHV0ZSkge1xuICAgIHBhdGggPSAnLic7XG4gIH1cbiAgaWYgKHBhdGggJiYgdHJhaWxpbmdTbGFzaCkge1xuICAgIHBhdGggKz0gJy8nO1xuICB9XG5cbiAgcmV0dXJuIChpc0Fic29sdXRlID8gJy8nIDogJycpICsgcGF0aDtcbn07XG5cbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMuaXNBYnNvbHV0ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHBhdGguY2hhckF0KDApID09PSAnLyc7XG59O1xuXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLmpvaW4gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHBhdGhzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgcmV0dXJuIGV4cG9ydHMubm9ybWFsaXplKGZpbHRlcihwYXRocywgZnVuY3Rpb24ocCwgaW5kZXgpIHtcbiAgICBpZiAodHlwZW9mIHAgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgdG8gcGF0aC5qb2luIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfSkuam9pbignLycpKTtcbn07XG5cblxuLy8gcGF0aC5yZWxhdGl2ZShmcm9tLCB0bylcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMucmVsYXRpdmUgPSBmdW5jdGlvbihmcm9tLCB0bykge1xuICBmcm9tID0gZXhwb3J0cy5yZXNvbHZlKGZyb20pLnN1YnN0cigxKTtcbiAgdG8gPSBleHBvcnRzLnJlc29sdmUodG8pLnN1YnN0cigxKTtcblxuICBmdW5jdGlvbiB0cmltKGFycikge1xuICAgIHZhciBzdGFydCA9IDA7XG4gICAgZm9yICg7IHN0YXJ0IDwgYXJyLmxlbmd0aDsgc3RhcnQrKykge1xuICAgICAgaWYgKGFycltzdGFydF0gIT09ICcnKSBicmVhaztcbiAgICB9XG5cbiAgICB2YXIgZW5kID0gYXJyLmxlbmd0aCAtIDE7XG4gICAgZm9yICg7IGVuZCA+PSAwOyBlbmQtLSkge1xuICAgICAgaWYgKGFycltlbmRdICE9PSAnJykgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0ID4gZW5kKSByZXR1cm4gW107XG4gICAgcmV0dXJuIGFyci5zbGljZShzdGFydCwgZW5kIC0gc3RhcnQgKyAxKTtcbiAgfVxuXG4gIHZhciBmcm9tUGFydHMgPSB0cmltKGZyb20uc3BsaXQoJy8nKSk7XG4gIHZhciB0b1BhcnRzID0gdHJpbSh0by5zcGxpdCgnLycpKTtcblxuICB2YXIgbGVuZ3RoID0gTWF0aC5taW4oZnJvbVBhcnRzLmxlbmd0aCwgdG9QYXJ0cy5sZW5ndGgpO1xuICB2YXIgc2FtZVBhcnRzTGVuZ3RoID0gbGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGZyb21QYXJ0c1tpXSAhPT0gdG9QYXJ0c1tpXSkge1xuICAgICAgc2FtZVBhcnRzTGVuZ3RoID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHZhciBvdXRwdXRQYXJ0cyA9IFtdO1xuICBmb3IgKHZhciBpID0gc2FtZVBhcnRzTGVuZ3RoOyBpIDwgZnJvbVBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgb3V0cHV0UGFydHMucHVzaCgnLi4nKTtcbiAgfVxuXG4gIG91dHB1dFBhcnRzID0gb3V0cHV0UGFydHMuY29uY2F0KHRvUGFydHMuc2xpY2Uoc2FtZVBhcnRzTGVuZ3RoKSk7XG5cbiAgcmV0dXJuIG91dHB1dFBhcnRzLmpvaW4oJy8nKTtcbn07XG5cbmV4cG9ydHMuc2VwID0gJy8nO1xuZXhwb3J0cy5kZWxpbWl0ZXIgPSAnOic7XG5cbmV4cG9ydHMuZGlybmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgdmFyIHJlc3VsdCA9IHNwbGl0UGF0aChwYXRoKSxcbiAgICAgIHJvb3QgPSByZXN1bHRbMF0sXG4gICAgICBkaXIgPSByZXN1bHRbMV07XG5cbiAgaWYgKCFyb290ICYmICFkaXIpIHtcbiAgICAvLyBObyBkaXJuYW1lIHdoYXRzb2V2ZXJcbiAgICByZXR1cm4gJy4nO1xuICB9XG5cbiAgaWYgKGRpcikge1xuICAgIC8vIEl0IGhhcyBhIGRpcm5hbWUsIHN0cmlwIHRyYWlsaW5nIHNsYXNoXG4gICAgZGlyID0gZGlyLnN1YnN0cigwLCBkaXIubGVuZ3RoIC0gMSk7XG4gIH1cblxuICByZXR1cm4gcm9vdCArIGRpcjtcbn07XG5cblxuZXhwb3J0cy5iYXNlbmFtZSA9IGZ1bmN0aW9uKHBhdGgsIGV4dCkge1xuICB2YXIgZiA9IHNwbGl0UGF0aChwYXRoKVsyXTtcbiAgLy8gVE9ETzogbWFrZSB0aGlzIGNvbXBhcmlzb24gY2FzZS1pbnNlbnNpdGl2ZSBvbiB3aW5kb3dzP1xuICBpZiAoZXh0ICYmIGYuc3Vic3RyKC0xICogZXh0Lmxlbmd0aCkgPT09IGV4dCkge1xuICAgIGYgPSBmLnN1YnN0cigwLCBmLmxlbmd0aCAtIGV4dC5sZW5ndGgpO1xuICB9XG4gIHJldHVybiBmO1xufTtcblxuXG5leHBvcnRzLmV4dG5hbWUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHJldHVybiBzcGxpdFBhdGgocGF0aClbM107XG59O1xuXG5mdW5jdGlvbiBmaWx0ZXIgKHhzLCBmKSB7XG4gICAgaWYgKHhzLmZpbHRlcikgcmV0dXJuIHhzLmZpbHRlcihmKTtcbiAgICB2YXIgcmVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoZih4c1tpXSwgaSwgeHMpKSByZXMucHVzaCh4c1tpXSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59XG5cbi8vIFN0cmluZy5wcm90b3R5cGUuc3Vic3RyIC0gbmVnYXRpdmUgaW5kZXggZG9uJ3Qgd29yayBpbiBJRThcbnZhciBzdWJzdHIgPSAnYWInLnN1YnN0cigtMSkgPT09ICdiJ1xuICAgID8gZnVuY3Rpb24gKHN0ciwgc3RhcnQsIGxlbikgeyByZXR1cm4gc3RyLnN1YnN0cihzdGFydCwgbGVuKSB9XG4gICAgOiBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuKSB7XG4gICAgICAgIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gc3RyLmxlbmd0aCArIHN0YXJ0O1xuICAgICAgICByZXR1cm4gc3RyLnN1YnN0cihzdGFydCwgbGVuKTtcbiAgICB9XG47XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiL1VzZXJzL2tsMHRsL2Rldi9nYW1ld2VlazIwMTQvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luc2VydC1tb2R1bGUtZ2xvYmFscy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzXCIpKSIsIid1c2Ugc3RyaWN0JztcblxudmFyIEFzc2V0c0xvYWRlciwgSW1hZ2VzTG9hZGVyLCBKc29uTG9hZGVyO1xuXG5Bc3NldHNMb2FkZXIgPSByZXF1aXJlKCcuL2xvYWRlcnMnKS5Bc3NldHNMb2FkZXI7XG5JbWFnZXNMb2FkZXIgPSByZXF1aXJlKCcuL2xvYWRlcnMnKS5JbWFnZXNMb2FkZXI7XG5Kc29uTG9hZGVyID0gcmVxdWlyZSgnLi9sb2FkZXJzJykuSnNvbkxvYWRlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgQXNzZXRzTG9hZGVyKCcvYXNzZXRzJylcbiAgLndoZW4oL1xcLig/OnBuZ3xqcGcpJC8sIG5ldyBJbWFnZXNMb2FkZXIoKSlcbiAgLndoZW4oL1xcLmpzb24kLywgbmV3IEpzb25Mb2FkZXIoKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBsb2FkZXIsIHRyYW5zZm9ybSwgcmVuZGVyaW5nLCBhbmltYXRpb25zLCBsaWdodGluZywgY29sbGlzaW9ucywgaW5wdXRzO1xuXG5sb2FkZXIgPSByZXF1aXJlKCcuL2Fzc2V0cy1sb2FkZXInKTtcblxudHJhbnNmb3JtID0gcmVxdWlyZSgnLi9udWNsZWFyX21vZHVsZXMvZ2FtZS50cmFuc2Zvcm0nKTtcbnJlbmRlcmluZyA9IHJlcXVpcmUoJy4vbnVjbGVhcl9tb2R1bGVzL2dhbWUucmVuZGVyaW5nJyk7XG5hbmltYXRpb25zID0gcmVxdWlyZSgnLi9udWNsZWFyX21vZHVsZXMvZ2FtZS5hbmltYXRpb25zJyk7XG5saWdodGluZyA9IHJlcXVpcmUoJy4vbnVjbGVhcl9tb2R1bGVzL2dhbWUubGlnaHRpbmcnKTtcbmNvbGxpc2lvbnMgPSByZXF1aXJlKCcuL251Y2xlYXJfbW9kdWxlcy9nYW1lLmNvbGxpc2lvbnMnKTtcbmlucHV0cyA9IHJlcXVpcmUoJy4vbnVjbGVhcl9tb2R1bGVzL2dhbWUuaW5wdXRzJyk7XG5cbmxvYWRlci5sb2FkKFtcbiAgICAnYXRsYXNlcy9wcmlubnkuYXRsYXMucG5nJyxcbiAgICAnYXRsYXNlcy9wcmlubnkuYXRsYXMuanNvbicsXG4gICAgJ2FuaW1hdGlvbnMvcHJpbm55L3ByaW5ueUBkYW5jaW5nLmpzb24nLFxuXG4gICAgJ2F0bGFzZXMvaGVyby5hdGxhcy5wbmcnLFxuICAgICdhdGxhc2VzL2hlcm8uYXRsYXMuanNvbicsXG4gICAgJ2FuaW1hdGlvbnMvaGVyby9oZXJvQGlkbGViYWNrLmpzb24nLFxuICAgICdhbmltYXRpb25zL2hlcm8vaGVyb0BpZGxlZmFjZS5qc29uJyxcbiAgICAnYW5pbWF0aW9ucy9oZXJvL2hlcm9AaWRsZWxlZnQuanNvbicsXG4gICAgJ2FuaW1hdGlvbnMvaGVyby9oZXJvQGlkbGVyaWdodC5qc29uJyxcbiAgICAnYW5pbWF0aW9ucy9oZXJvL2hlcm9Ad2Fsa2JhY2suanNvbicsXG4gICAgJ2FuaW1hdGlvbnMvaGVyby9oZXJvQHdhbGtmYWNlLmpzb24nLFxuICAgICdhbmltYXRpb25zL2hlcm8vaGVyb0B3YWxrbGVmdC5qc29uJyxcbiAgICAnYW5pbWF0aW9ucy9oZXJvL2hlcm9Ad2Fsa3JpZ2h0Lmpzb24nXG4gIF0pXG4gIC5lcnJvcihmdW5jdGlvbiAob08pIHsgdGhyb3cgb087IH0pXG4gIC5kb25lKGZ1bmN0aW9uICgpIHtcbiAgICBudWNsZWFyLmltcG9ydChbdHJhbnNmb3JtLCByZW5kZXJpbmcsIGFuaW1hdGlvbnMsIGxpZ2h0aW5nLCBjb2xsaXNpb25zLCBpbnB1dHNdKTtcblxuICAgIGNvbnNvbGUubG9nKCdtb2R1bGVzIGxvYWRlZCEnKTtcblxuICAgIHJlcXVpcmUoJy4vc3lzdGVtcy1jb250ZXh0Jyk7XG5cbiAgICAvL3JlcXVpcmUoJy4vc2NlbmVzL2NvbGxpc2lvbnMtc2NlbmUnKTtcbiAgICByZXF1aXJlKCcuL3NjZW5lcy9oZXJvLXNjZW5lJyk7XG5cbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uIGxvb3AoKSB7XG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xuICAgICAgbnVjbGVhci5zeXN0ZW0ucnVuKCk7XG4gICAgfSk7XG4gIH0pXG4gIC5wcm9ncmVzcyhjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUsICdidW5kbGUgcHJvZ3Jlc3MnKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEFzc2V0c0J1bmRsZShjYWxsYmFjaykge1xuICB2YXIgYnVuZGxlO1xuXG4gIGJ1bmRsZSA9IHRoaXM7XG5cbiAgYnVuZGxlLmFzc2V0cyA9IFtdO1xuXG4gIGJ1bmRsZS5fbG9hZExpc3RlbmVycyA9IFtdO1xuICBidW5kbGUuX2Vycm9yTGlzdGVuZXJzID0gW107XG4gIGJ1bmRsZS5fcHJvZ3Jlc3NMaXN0ZW5lcnMgPSBbXTtcblxuICBjYWxsYmFjay5jYWxsKHRoaXMsXG4gICAgdHJpZ2dlcihidW5kbGUuX2xvYWRMaXN0ZW5lcnMpLFxuICAgIHRyaWdnZXIoYnVuZGxlLl9lcnJvckxpc3RlbmVycyksXG4gICAgdHJpZ2dlcihidW5kbGUuX3Byb2dyZXNzTGlzdGVuZXJzKVxuICApO1xuXG4gIGZ1bmN0aW9uIHRyaWdnZXIoY2FsbGJhY2tzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBpLCBjYWxsYmFjaztcblxuICAgICAgZm9yIChpID0gMDsgKGNhbGxiYWNrID0gY2FsbGJhY2tzW2ldKTsgaSArPSAxKSB7XG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KGJ1bmRsZSwgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59XG5cbkFzc2V0c0J1bmRsZS5wcm90b3R5cGUuZG9uZSA9IGZ1bmN0aW9uIGFzc2V0c0J1bmRsZURvbmUoY2FsbGJhY2spIHtcbiAgdGhpcy5fbG9hZExpc3RlbmVycy5wdXNoKGNhbGxiYWNrKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Bc3NldHNCdW5kbGUucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24gYXNzZXRzQnVuZGxlRXJyb3IoZXJyYmFjaykge1xuICB0aGlzLl9lcnJvckxpc3RlbmVycy5wdXNoKGVycmJhY2spO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkFzc2V0c0J1bmRsZS5wcm90b3R5cGUucHJvZ3Jlc3MgPSBmdW5jdGlvbiBhc3NldHNCdW5kbGVQcm9ncmVzcyhwcm9ncmVzcykge1xuICB0aGlzLl9wcm9ncmVzc0xpc3RlbmVycy5wdXNoKHByb2dyZXNzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFzc2V0c0J1bmRsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEFzc2V0c0J1bmRsZSwgcGF0aDtcblxuQXNzZXRzQnVuZGxlID0gcmVxdWlyZSgnLi9hc3NldHMtYnVuZGxlJyk7XG5wYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5mdW5jdGlvbiBBc3NldHNMb2FkZXIocGF0aCkge1xuICB0aGlzLmJhc2VQYXRoID0gcGF0aCB8fCAnLyc7XG4gIHRoaXMuY2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB0aGlzLnJ1bGVzID0gW107XG59XG5cbkFzc2V0c0xvYWRlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gYXNzZXRzTG9hZGVyR2V0KHVybCkge1xuICByZXR1cm4gdGhpcy5jYWNoZVt1cmxdO1xufTtcblxuQXNzZXRzTG9hZGVyLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiBhc3NldHNMb2FkZXJIYXModXJsKSB7XG4gIHJldHVybiB1cmwgaW4gdGhpcy5jYWNoZTtcbn07XG5cbkFzc2V0c0xvYWRlci5wcm90b3R5cGUud2hlbiA9IGZ1bmN0aW9uIGFzc2V0c0xvYWRlcldoZW4ocGF0dGVybiwgbG9hZGVyKSB7XG4gIHRoaXMucnVsZXMucHVzaCh7cGF0dGVybjogcGF0dGVybiwgbG9hZGVyOiBsb2FkZXJ9KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Bc3NldHNMb2FkZXIucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbiBhc3NldHNMb2FkZXJMb2FkKHVybHMpIHtcbiAgdmFyIGxvYWRlcjtcblxuICBsb2FkZXIgPSB0aGlzO1xuXG4gIHJldHVybiBuZXcgQXNzZXRzQnVuZGxlKGZ1bmN0aW9uIChkb25lLCBlcnJvciwgcHJvZ3Jlc3MpIHtcbiAgICB2YXIgYnVuZGxlLCBsb2FkZWRBc3NldHNDb3VudCwgdG90YWxBc3NldHNDb3VudCwgaSwgdXJsLCBhc3NldCwgaiwgcnVsZTtcblxuICAgIGJ1bmRsZSA9IHRoaXM7XG5cbiAgICBsb2FkZWRBc3NldHNDb3VudCA9IDA7XG4gICAgdG90YWxBc3NldHNDb3VudCA9IHVybHMubGVuZ3RoO1xuXG4gICAgaWYgKCF0b3RhbEFzc2V0c0NvdW50KSBkb25lKCk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgdG90YWxBc3NldHNDb3VudDsgaSArPSAxKSB7XG4gICAgICB1cmwgPSB1cmxzW2ldO1xuICAgICAgYXNzZXQgPSBsb2FkZXIuZ2V0KHVybCk7XG5cbiAgICAgIGlmIChhc3NldCkge1xuICAgICAgICBvbmxvYWRlZCh1cmwsIGkpLmNhbGwoYXNzZXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChqID0gMDsgKHJ1bGUgPSBsb2FkZXIucnVsZXNbal0pOyBqICs9IDEpIHtcbiAgICAgICAgICBpZiAocnVsZS5wYXR0ZXJuLnRlc3QodXJsKSkge1xuICAgICAgICAgICAgcnVsZS5sb2FkZXIubG9hZChwYXRoLmpvaW4obG9hZGVyLmJhc2VQYXRoLCB1cmwpLCBvbmxvYWRlZCh1cmwsIGkpLCBlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25sb2FkZWQoa2V5LCBpbmRleCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGFzc2V0O1xuXG4gICAgICAgIGFzc2V0ID0gdGhpcztcblxuICAgICAgICBsb2FkZXIuY2FjaGVba2V5XSA9IGFzc2V0O1xuICAgICAgICBidW5kbGUuYXNzZXRzW2luZGV4XSA9IGFzc2V0O1xuXG4gICAgICAgIGxvYWRlZEFzc2V0c0NvdW50ICs9IDE7XG5cbiAgICAgICAgaWYgKHByb2dyZXNzKSB7XG4gICAgICAgICAgcHJvZ3Jlc3ModGhpcywgbG9hZGVkQXNzZXRzQ291bnQgLyB0b3RhbEFzc2V0c0NvdW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsb2FkZWRBc3NldHNDb3VudCA9PT0gdG90YWxBc3NldHNDb3VudCkge1xuICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBc3NldHNMb2FkZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEltYWdlc0xvYWRlcigpIHt9XG5cbkltYWdlc0xvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uIGltYWdlc0xvYWRlckxvYWQodXJsLCBjYWxsYmFjaywgZXJyYmFjaykge1xuICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuICBpbWFnZS5vbmxvYWQgPSBjYWxsYmFjaztcbiAgaW1hZ2Uub25lcnJvciA9IGVycmJhY2s7XG5cbiAgaW1hZ2Uuc3JjID0gdXJsO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZXNMb2FkZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuQXNzZXRzTG9hZGVyID0gcmVxdWlyZSgnLi9hc3NldHMtbG9hZGVyJyk7XG5leHBvcnRzLkltYWdlc0xvYWRlciA9IHJlcXVpcmUoJy4vaW1hZ2VzLWxvYWRlcicpO1xuZXhwb3J0cy5Kc29uTG9hZGVyID0gcmVxdWlyZSgnLi9qc29uLWxvYWRlcicpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBKc29uTG9hZGVyKCkge31cblxuSnNvbkxvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uIGpzb25Mb2FkZXJMb2FkKHVybCwgY2FsbGJhY2ssIGVycmJhY2spIHtcbiAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xuXG4gIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHhoci5yZWFkeVN0YXRlIDwgNCkgcmV0dXJuO1xuXG4gICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY2FsbGJhY2suY2FsbChKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpKTtcbiAgICAgIH0gY2F0Y2ggKG9PKSB7XG4gICAgICAgIGVycmJhY2sob08pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlcnJiYWNrKHhocik7XG4gICAgfVxuICB9O1xuXG4gIHhoci5zZW5kKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEpzb25Mb2FkZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBwYXRoLCBsb2FkZXI7XG5cbnBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5sb2FkZXIgPSByZXF1aXJlKCdhc3NldHMtbG9hZGVyJyk7XG5cbmZ1bmN0aW9uIEFuaW1hdGlvbnNDb21wb25lbnQoZSwgZGVmYXVsdEFuaW1hdGlvbiwgYW5pbWF0aW9ucykge1xuICB2YXIgYXRsYXMsIGksIGxlbmd0aCwga2V5LCBkYXRhO1xuXG4gIGF0bGFzID0gbnVjbGVhci5jb21wb25lbnQoJ2F0bGFzJykub2YoZSkubmFtZTtcblxuICB0aGlzLmFuaW1hdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIGxlbmd0aCA9IGFuaW1hdGlvbnMubGVuZ3RoO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgIGtleSA9IGFuaW1hdGlvbnNbaV07XG4gICAgZGF0YSA9IGxvYWRlci5nZXQocGF0aC5qb2luKCdhbmltYXRpb25zJywgYXRsYXMsIGF0bGFzICsgJ0AnICsga2V5ICsgJy5qc29uJykpO1xuXG4gICAgdGhpcy5hbmltYXRpb25zW2tleV0gPSBkYXRhO1xuICB9XG5cbiAgdGhpcy5kZWZhdWx0QW5pbWF0aW9uID0gZGVmYXVsdEFuaW1hdGlvbiB8fCAnaWRsZSc7XG5cbiAgdGhpcy5jdXJyZW50QW5pbWF0aW9uID0gdGhpcy5kZWZhdWx0QW5pbWF0aW9uO1xuICB0aGlzLmN1cnJlbnRGcmFtZSA9IDA7XG5cbiAgdGhpcy50aW1lRWxhcHNlZFNpbmNlTGFzdEZyYW1lID0gMDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25zQ29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQW5pbWF0aW9uc0NvbXBvbmVudDtcblxuQW5pbWF0aW9uc0NvbXBvbmVudCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9hbmltYXRpb25zLWNvbXBvbmVudCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG51Y2xlYXIubW9kdWxlKCdnYW1lLmFuaW1hdGlvbnMnLCBbJ2dhbWUucmVuZGVyaW5nJ10pXG4gIC5jb21wb25lbnQoJ2FuaW1hdGlvbnMnLCBmdW5jdGlvbiAoZSwgZGVmYXVsdEFuaW1hdGlvbiwgYW5pbWF0aW9ucykge1xuICAgIHJldHVybiBuZXcgQW5pbWF0aW9uc0NvbXBvbmVudChlLCBkZWZhdWx0QW5pbWF0aW9uLCBhbmltYXRpb25zKTtcbiAgfSlcbiAgLnN5c3RlbSgnYW5pbWF0ZScsIFtcbiAgICAnc3ByaXRlIGZyb20gZ2FtZS5yZW5kZXJpbmcnLFxuICAgICdhdGxhcyBmcm9tIGdhbWUucmVuZGVyaW5nJyxcbiAgICAnYW5pbWF0aW9ucyBmcm9tIGdhbWUuYW5pbWF0aW9ucydcbiAgXSwgcmVxdWlyZSgnLi9zeXN0ZW1zL2FuaW1hdGUtc3lzdGVtJyksIHtcbiAgICBtc1BlclVwZGF0ZTogMTZcbiAgfSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYW5pbWF0ZVN5c3RlbShlLCBjb21wb25lbnRzLCBjb250ZXh0LCBkdCkge1xuICB2YXIgYXRsYXMsIHNwcml0ZSwgYW5pbWF0aW9ucywgY3VycmVudEFuaW1hdGlvbiwgZnJhbWUsIHdpZHRoLCBoZWlnaHQsIHNjYWxlZFdpZHRoLCBzY2FsZWRIZWlnaHQ7XG5cbiAgYXRsYXMgPSBjb21wb25lbnRzLmF0bGFzO1xuICBzcHJpdGUgPSBjb21wb25lbnRzLnNwcml0ZTtcbiAgYW5pbWF0aW9ucyA9IGNvbXBvbmVudHMuYW5pbWF0aW9ucztcblxuICBjdXJyZW50QW5pbWF0aW9uID0gYW5pbWF0aW9ucy5hbmltYXRpb25zW2FuaW1hdGlvbnMuY3VycmVudEFuaW1hdGlvbl07XG5cbiAgYW5pbWF0aW9ucy50aW1lRWxhcHNlZFNpbmNlTGFzdEZyYW1lICs9IGR0ICogMTY7Ly9udWNsZWFyLnN5c3RlbSgnYW5pbWF0ZScpLl9zY2hlZHVsZXIubGFnO1xuXG4gIGlmIChhbmltYXRpb25zLnRpbWVFbGFwc2VkU2luY2VMYXN0RnJhbWUgPiBjdXJyZW50QW5pbWF0aW9uLmludGVydmFsKSB7XG4gICAgYW5pbWF0aW9ucy5jdXJyZW50RnJhbWUgKz0gMTtcbiAgICBhbmltYXRpb25zLnRpbWVFbGFwc2VkU2luY2VMYXN0RnJhbWUgLT0gY3VycmVudEFuaW1hdGlvbi5pbnRlcnZhbDtcblxuICAgIGlmIChhbmltYXRpb25zLmN1cnJlbnRGcmFtZSA+IGN1cnJlbnRBbmltYXRpb24uZnJhbWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgIGFuaW1hdGlvbnMuY3VycmVudEZyYW1lID0gMDtcblxuICAgICAgaWYgKCFjdXJyZW50QW5pbWF0aW9uLmxvb3ApIHtcbiAgICAgICAgYW5pbWF0aW9ucy5jdXJyZW50QW5pbWF0aW9uID0gYW5pbWF0aW9ucy5kZWZhdWx0QW5pbWF0aW9uO1xuICAgICAgICBjdXJyZW50QW5pbWF0aW9uID0gYW5pbWF0aW9ucy5hbmltYXRpb25zW2FuaW1hdGlvbnMuY3VycmVudEFuaW1hdGlvbl07XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnJhbWUgPSBhdGxhcy5zcHJpdGVzLmZyYW1lc1tjdXJyZW50QW5pbWF0aW9uLmZyYW1lc1thbmltYXRpb25zLmN1cnJlbnRGcmFtZV1dLmZyYW1lO1xuXG4gICAgd2lkdGggPSBzcHJpdGUud2lkdGgoKTtcbiAgICBoZWlnaHQgPSBzcHJpdGUuaGVpZ2h0KCk7XG5cbiAgICBzY2FsZWRXaWR0aCA9IGZyYW1lLncgKiBzcHJpdGUuc2NhbGU7XG4gICAgc2NhbGVkSGVpZ2h0ID0gZnJhbWUuaCAqIHNwcml0ZS5zY2FsZTtcblxuICAgIHNwcml0ZS5jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICBzcHJpdGUuY29udGV4dC5kcmF3SW1hZ2UoYXRsYXMuc291cmNlLCBmcmFtZS54LCBmcmFtZS55LCBmcmFtZS53LCBmcmFtZS5oLCAwLjUgKiAod2lkdGggLSBzY2FsZWRXaWR0aCksIChoZWlnaHQgLSBzY2FsZWRIZWlnaHQpLCBzY2FsZWRXaWR0aCwgc2NhbGVkSGVpZ2h0KTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gQ29sbGlkZXJDb21wb25lbnQob3B0aW9ucykge1xuICB0aGlzLm9mZnNldFggPSBvcHRpb25zLm9mZnNldFggfHwgMDtcbiAgdGhpcy5vZmZzZXRZID0gb3B0aW9ucy5vZmZzZXRZIHx8IDA7XG5cbiAgdGhpcy5oYWxmV2lkdGggPSBvcHRpb25zLndpZHRoICogMC41O1xuICB0aGlzLmhhbGZIZWlnaHQgPSBvcHRpb25zLmhlaWdodCAqIDAuNTtcblxuICB0aGlzLl9jdXJyZW50Q29sbGlzaW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgdGhpcy5fb25Db2xsaXNpb25FbnRlckxpc3RlbmVycyA9IFtdO1xuICB0aGlzLl9vbkNvbGxpc2lvbkV4aXRMaXN0ZW5lcnMgPSBbXTtcbiAgdGhpcy5fb25Db2xsaXNpb25TdGF5TGlzdGVuZXJzID0gW107XG59XG5cbkNvbGxpZGVyQ29tcG9uZW50LnByb3RvdHlwZS5vbkNvbGxpc2lvbkVudGVyID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gIHRoaXMuX29uQ29sbGlzaW9uRW50ZXJMaXN0ZW5lcnMucHVzaChjYWxsYmFjayk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuQ29sbGlkZXJDb21wb25lbnQucHJvdG90eXBlLm9uQ29sbGlzaW9uU3RheSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICB0aGlzLl9vbkNvbGxpc2lvblN0YXlMaXN0ZW5lcnMucHVzaChjYWxsYmFjayk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuQ29sbGlkZXJDb21wb25lbnQucHJvdG90eXBlLm9uQ29sbGlzaW9uRXhpdCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICB0aGlzLl9vbkNvbGxpc2lvbkV4aXRMaXN0ZW5lcnMucHVzaChjYWxsYmFjayk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuQ29sbGlkZXJDb21wb25lbnQucHJvdG90eXBlLnRyaWdnZXJDb2xsaXNpb25FbnRlciA9IGZ1bmN0aW9uIGNvbGxpZGVyQ29tcG9uZW50VHJpZ2dlckNvbGxpc2lvbkVudGVyKGUsIGNvbGxpZGVyKSB7XG4gIGlmIChlIGluIHRoaXMuX2N1cnJlbnRDb2xsaXNpb25zKSB7XG4gICAgdGhpcy50cmlnZ2VyQ29sbGlzaW9uU3RheSgpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX2N1cnJlbnRDb2xsaXNpb25zW2VdID0gY29sbGlkZXI7XG4gICAgdGhpcy5fdHJpZ2dlckNvbGxpc2lvbkxpc3RlbmVycyh0aGlzLl9vbkNvbGxpc2lvbkVudGVyTGlzdGVuZXJzKTtcbiAgfVxufTtcblxuQ29sbGlkZXJDb21wb25lbnQucHJvdG90eXBlLnRyaWdnZXJDb2xsaXNpb25TdGF5ID0gZnVuY3Rpb24gY29sbGlkZXJDb21wb25lbnRUcmlnZ2VyQ29sbGlzaW9uU3RheSgpIHtcbiAgdGhpcy5fdHJpZ2dlckNvbGxpc2lvbkxpc3RlbmVycyh0aGlzLl9vbkNvbGxpc2lvblN0YXlMaXN0ZW5lcnMpO1xufTtcblxuQ29sbGlkZXJDb21wb25lbnQucHJvdG90eXBlLnRyaWdnZXJDb2xsaXNpb25FeGl0ID0gZnVuY3Rpb24gY29sbGlkZXJDb21wb25lbnRUcmlnZ2VyQ29sbGlzaW9uRXhpdChlKSB7XG4gIGRlbGV0ZSB0aGlzLl9jdXJyZW50Q29sbGlzaW9uc1tlXTtcbiAgdGhpcy5fdHJpZ2dlckNvbGxpc2lvbkxpc3RlbmVycyh0aGlzLl9vbkNvbGxpc2lvbkV4aXRMaXN0ZW5lcnMpO1xufTtcblxuQ29sbGlkZXJDb21wb25lbnQucHJvdG90eXBlLl90cmlnZ2VyQ29sbGlzaW9uTGlzdGVuZXJzID0gZnVuY3Rpb24gX2NvbGxpZGVyQ29tcG9uZW50VHJpZ2dlckNvbGxpc2lvbkxpc3RlbmVycyhsaXN0ZW5lcnMpIHtcbiAgdmFyIGksIGxpc3RlbmVyO1xuXG4gIGZvciAoaSA9IDA7IChsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXSk7IGkgKz0gMSkge1xuICAgIGxpc3RlbmVyKCk7XG4gIH1cbn07XG5cbkNvbGxpZGVyQ29tcG9uZW50LnByb3RvdHlwZS53aWR0aCA9IGZ1bmN0aW9uIGNvbGxpZGVyQ29tcG9uZW50V2lkdGgodmFsdWUpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdGhpcy5oYWxmV2lkdGggKiAyO1xuICB9XG5cbiAgdGhpcy5oYWxmV2lkdGggPSB2YWx1ZSAqIDAuNTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkNvbGxpZGVyQ29tcG9uZW50LnByb3RvdHlwZS5oZWlnaHQgPSBmdW5jdGlvbiBjb2xsaWRlckNvbXBvbmVudEhlaWdodCh2YWx1ZSkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB0aGlzLmhhbGZIZWlnaHQ7XG4gIH1cblxuICB0aGlzLmhhbGZIZWlnaHQgPSB2YWx1ZSAqIDAuNTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGlkZXJDb21wb25lbnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb2xsaWRlckNvbXBvbmVudDtcblxuQ29sbGlkZXJDb21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvY29sbGlkZXItY29tcG9uZW50Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gbnVjbGVhci5tb2R1bGUoJ2dhbWUuY29sbGlzaW9ucycsIFsnZ2FtZS50cmFuc2Zvcm0nXSlcbiAgLmNvbXBvbmVudCgnY29sbGlkZXInLCBmdW5jdGlvbiAoZSwgb3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgQ29sbGlkZXJDb21wb25lbnQob3B0aW9ucyk7XG4gIH0pXG4gIC5zeXN0ZW0oJ2NvbGxpc2lvbnMnLCBbXG4gICAgJ2NvbGxpZGVyIGZyb20gZ2FtZS5jb2xsaXNpb25zJyxcbiAgICAncG9zaXRpb24gZnJvbSBnYW1lLnRyYW5zZm9ybScsXG4gICAgJ3ZlbG9jaXR5IGZyb20gZ2FtZS50cmFuc2Zvcm0nLFxuICAgICdyaWdpZGJvZHkgZnJvbSBnYW1lLnRyYW5zZm9ybSdcbiAgXSwgcmVxdWlyZSgnLi9zeXN0ZW1zL2NvbGxpc2lvbnMtc3lzdGVtJykpXG4gIC5zeXN0ZW0oJ2RlYnVnLWNvbGxpZGVycycsIFtcbiAgICAnY29sbGlkZXIgZnJvbSBnYW1lLmNvbGxpc2lvbnMnLFxuICAgICdwb3NpdGlvbiBmcm9tIGdhbWUudHJhbnNmb3JtJ1xuICBdLCByZXF1aXJlKCcuL3N5c3RlbXMvZGVidWctY29sbGlkZXJzLXN5c3RlbScpKTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb2xsaXNpb25zU3lzdGVtKGUsIGNvbXBvbmVudHMsIGNvbnRleHQpIHtcbiAgdmFyIHBvc2l0aW9uLCB2ZWxvY2l0eSwgY29sbGlkZXIsIHJpZ2lkYm9keSwgc3FyVmVsb2NpdHlNYWduaXR1ZGUsIGNvbGxpZGVyWCwgY29sbGlkZXJZLCBvdGhlcnMsIGxlbmd0aCwgaSwgb3RoZXIsIG90aGVyUG9zaXRpb24sIG90aGVyQ29sbGlkZXIsIG90aGVyUmlnaWRib2R5LCBvdGhlclgsIG90aGVyWSwgZHgsIGR5LCBvdmVybGFwWCwgb3ZlcmxhcFksIHR4LCB0eSwgaW52ZXJzZU1hc3NTdW0sIGludmVyc2VNYXNzO1xuXG4gIHBvc2l0aW9uID0gY29tcG9uZW50cy5wb3NpdGlvbjtcbiAgdmVsb2NpdHkgPSBjb21wb25lbnRzLnZlbG9jaXR5O1xuICBjb2xsaWRlciA9IGNvbXBvbmVudHMuY29sbGlkZXI7XG4gIHJpZ2lkYm9keSA9IGNvbXBvbmVudHMucmlnaWRib2R5O1xuXG4gIHNxclZlbG9jaXR5TWFnbml0dWRlID0gdmVsb2NpdHkueCAqIHZlbG9jaXR5LnggKyB2ZWxvY2l0eS55ICogdmVsb2NpdHkueTtcblxuICBpbnZlcnNlTWFzcyA9IHJpZ2lkYm9keS5pbnZlcnNlTWFzcztcblxuICBjb2xsaWRlclggPSBwb3NpdGlvbi54ICsgY29sbGlkZXIub2Zmc2V0WDtcbiAgY29sbGlkZXJZID0gcG9zaXRpb24ueSArIGNvbGxpZGVyLm9mZnNldFk7XG5cbiAgb3RoZXJzID0gY29udGV4dC5jb2xsaWRlcnM7XG4gIGxlbmd0aCA9IG90aGVycy5sZW5ndGg7XG5cbiAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgb3RoZXIgPSBvdGhlcnNbaV07XG5cbiAgICBpZiAob3RoZXIgPT09IGUpIGNvbnRpbnVlO1xuXG4gICAgb3RoZXJQb3NpdGlvbiA9IG51Y2xlYXIuY29tcG9uZW50KCdwb3NpdGlvbicpLm9mKG90aGVyKTtcbiAgICBvdGhlckNvbGxpZGVyID0gbnVjbGVhci5jb21wb25lbnQoJ2NvbGxpZGVyJykub2Yob3RoZXIpO1xuICAgIG90aGVyUmlnaWRib2R5ID0gbnVjbGVhci5jb21wb25lbnQoJ3JpZ2lkYm9keScpLm9mKG90aGVyKTtcblxuICAgIG90aGVyWCA9IG90aGVyUG9zaXRpb24ueCArIG90aGVyQ29sbGlkZXIub2Zmc2V0WDtcbiAgICBvdGhlclkgPSBvdGhlclBvc2l0aW9uLnkgKyBvdGhlckNvbGxpZGVyLm9mZnNldFk7XG5cbiAgICBkeCA9IG90aGVyWCAtIGNvbGxpZGVyWDtcbiAgICBkeSA9IG90aGVyWSAtIGNvbGxpZGVyWTtcblxuICAgIG92ZXJsYXBYID0gTWF0aC5hYnMoZHgpIC0gKGNvbGxpZGVyLmhhbGZXaWR0aCArIG90aGVyQ29sbGlkZXIuaGFsZldpZHRoKTtcbiAgICBvdmVybGFwWSA9IE1hdGguYWJzKGR5KSAtIChjb2xsaWRlci5oYWxmSGVpZ2h0ICsgb3RoZXJDb2xsaWRlci5oYWxmSGVpZ2h0KTtcblxuICAgIGlmIChvdmVybGFwWCA8IC0wLjEgJiYgb3ZlcmxhcFkgPCAtMC4xKSB7XG4gICAgICB0eCA9IE1hdGguYWJzKHZlbG9jaXR5LngpIC8gb3ZlcmxhcFggfHwgMDtcbiAgICAgIHR5ID0gTWF0aC5hYnModmVsb2NpdHkueSkgLyBvdmVybGFwWSB8fCAwO1xuXG4gICAgICBpbnZlcnNlTWFzc1N1bSA9IGludmVyc2VNYXNzICsgb3RoZXJSaWdpZGJvZHkuaW52ZXJzZU1hc3M7XG5cbiAgICAgIGlmICh0eCA8IHR5IHx8IChzcXJWZWxvY2l0eU1hZ25pdHVkZSA8IDAuMSAmJiBvdmVybGFwWCA+IG92ZXJsYXBZKSkge1xuICAgICAgICBpZiAoZHggPCAwKSB7XG4gICAgICAgICAgcG9zaXRpb24ueCAtPSBvdmVybGFwWCAvIChpbnZlcnNlTWFzc1N1bSAvIGludmVyc2VNYXNzIHx8IDApO1xuICAgICAgICAgIG90aGVyUG9zaXRpb24ueCArPSBvdmVybGFwWCAvIChpbnZlcnNlTWFzc1N1bSAvIG90aGVyUmlnaWRib2R5LmludmVyc2VNYXNzIHx8IDApO1xuICAgICAgICB9IGVsc2UgaWYgKGR4ID4gMCkge1xuICAgICAgICAgIHBvc2l0aW9uLnggKz0gb3ZlcmxhcFggLyAoaW52ZXJzZU1hc3NTdW0gLyBpbnZlcnNlTWFzcyB8fCAwKTtcbiAgICAgICAgICBvdGhlclBvc2l0aW9uLnggLT0gb3ZlcmxhcFggLyAoaW52ZXJzZU1hc3NTdW0gLyBvdGhlclJpZ2lkYm9keS5pbnZlcnNlTWFzcyB8fCAwKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodHkgPCB0eCB8fCAoc3FyVmVsb2NpdHlNYWduaXR1ZGUgPCAwLjEgJiYgb3ZlcmxhcFkgPiBvdmVybGFwWCkpIHtcbiAgICAgICAgaWYgKGR5IDwgMCkge1xuICAgICAgICAgIHBvc2l0aW9uLnkgLT0gb3ZlcmxhcFkgLyAoaW52ZXJzZU1hc3NTdW0gLyBpbnZlcnNlTWFzcyB8fCAwKTtcbiAgICAgICAgICBvdGhlclBvc2l0aW9uLnkgKz0gb3ZlcmxhcFkgIC8gKGludmVyc2VNYXNzU3VtIC8gb3RoZXJSaWdpZGJvZHkuaW52ZXJzZU1hc3MgfHwgMCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZHkgPiAwKSB7XG4gICAgICAgICAgcG9zaXRpb24ueSArPSBvdmVybGFwWSAvIChpbnZlcnNlTWFzc1N1bSAvIGludmVyc2VNYXNzIHx8IDApO1xuICAgICAgICAgIG90aGVyUG9zaXRpb24ueSAtPSBvdmVybGFwWSAvIChpbnZlcnNlTWFzc1N1bSAvIG90aGVyUmlnaWRib2R5LmludmVyc2VNYXNzIHx8IDApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbGxpZGVyWCA9IHBvc2l0aW9uLnggKyBjb2xsaWRlci5vZmZzZXRYO1xuICAgICAgY29sbGlkZXJZID0gcG9zaXRpb24ueSArIGNvbGxpZGVyLm9mZnNldFk7XG5cbiAgICAgIGlmIChvdGhlciBpbiBjb2xsaWRlci5fY3VycmVudENvbGxpc2lvbnMpIHtcbiAgICAgICAgY29sbGlkZXIudHJpZ2dlckNvbGxpc2lvblN0YXkob3RoZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29sbGlkZXIudHJpZ2dlckNvbGxpc2lvbkVudGVyKG90aGVyKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG90aGVyIGluIGNvbGxpZGVyLl9jdXJyZW50Q29sbGlzaW9ucykge1xuICAgICAgaWYgKHNxclZlbG9jaXR5TWFnbml0dWRlID4gMSkgY29sbGlkZXIudHJpZ2dlckNvbGxpc2lvbkV4aXQob3RoZXIpO1xuICAgICAgZWxzZSBjb2xsaWRlci50cmlnZ2VyQ29sbGlzaW9uU3RheShvdGhlcik7XG4gICAgfVxuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlYnVnQ29sbGlkZXJzU3lzdGVtKGUsIGNvbXBvbmVudHMsIGNvbnRleHQpIHtcbiAgdmFyIGRlc3QsIHBvc2l0aW9uLCBjb2xsaWRlciwgeCwgeSwgdywgaDtcblxuICBkZXN0ID0gY29udGV4dC5kZXN0c1swXTtcblxuICBwb3NpdGlvbiA9IGNvbXBvbmVudHMucG9zaXRpb247XG4gIGNvbGxpZGVyID0gY29tcG9uZW50cy5jb2xsaWRlcjtcblxuICB4ID0gcG9zaXRpb24ueCArIGNvbGxpZGVyLm9mZnNldFg7XG4gIHkgPSBwb3NpdGlvbi55ICsgY29sbGlkZXIub2Zmc2V0WTtcbiAgdyA9IGNvbGxpZGVyLmhhbGZXaWR0aDtcbiAgaCA9IGNvbGxpZGVyLmhhbGZIZWlnaHQ7XG5cbiAgZGVzdC5zYXZlKCk7XG5cbiAgZGVzdC5zdHJva2VTdHlsZSA9ICcjZjBmJztcblxuICBkZXN0LmJlZ2luUGF0aCgpO1xuXG4gIGRlc3QubW92ZVRvKHggLSB3LCB5IC0gaCk7XG4gIGRlc3QubGluZVRvKHggKyB3LCB5IC0gaCk7XG4gIGRlc3QubGluZVRvKHggKyB3LCB5ICsgaCk7XG4gIGRlc3QubGluZVRvKHggLSB3LCB5ICsgaCk7XG5cbiAgZGVzdC5jbG9zZVBhdGgoKTtcblxuICBkZXN0LnN0cm9rZSgpO1xuXG4gIGRlc3QucmVzdG9yZSgpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbihmdW5jdGlvbihudWNsZWFyLCBjb25zb2xlKXtcbiAgICByZXF1aXJlKCcuL2xpYi9tb3VzZXRyYXAubWluJyk7XG5cbiAgICB2YXIgaW5wdXRzLCBHYW1lcGFkLCBNb3VzZXRyYXA7XG5cbiAgICBHYW1lcGFkID0gcmVxdWlyZSgnLi9saWIvZ2FtZXBhZC5taW4nKS5HYW1lcGFkO1xuICAgIE1vdXNldHJhcCA9IHdpbmRvdy5Nb3VzZXRyYXA7XG5cbiAgICBpbnB1dHMgPSBudWNsZWFyLm1vZHVsZSgnZ2FtZS5pbnB1dHMnLCBbXSk7XG5cbiAgICBpbnB1dHMuY29tcG9uZW50KCdpbnB1dHMnLCBmdW5jdGlvbihlbnRpdHksIGRhdGEpe1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBpbnB1dHNNYW5hZ2VyKGVudGl0eSwgY29tcG9uZW50cyl7XG4gICAgICB2YXIgaW5wdXRzID0gY29tcG9uZW50cy5pbnB1dHMsXG4gICAgICAgICAgaW5wdXQ7XG5cbiAgICAgIGZvcih2YXIgaSBpbiBpbnB1dHNNYW5hZ2VyLm1hbmFnZXIpe1xuICAgICAgICBpbnB1dCA9IGlucHV0c01hbmFnZXIubWFuYWdlcltpXTtcbiAgICAgICAgaWYoaW5wdXRzW2ldKXtcblxuICAgICAgICAgIGlucHV0c1tpXShlbnRpdHksIGlucHV0LCBpbnB1dHNNYW5hZ2VyLm1hbmFnZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlucHV0c01hbmFnZXIubWFuYWdlciA9IHt9O1xuXG4gICAgaW5wdXRzLnN5c3RlbSgnaW5wdXRzTWFuYWdlcicsIFsnaW5wdXRzJ10sIGlucHV0c01hbmFnZXIsIHtcbiAgICAgIG1zUGVyVXBkYXRlIDogNTBcbiAgICB9KTtcblxuICAgIGlucHV0cy5jb25maWcoe1xuICAgICAgZ2FtZXBhZCA6IHtcbiAgICAgICAgJ0ZBQ0VfMScgOiAnJyxcbiAgICAgICAgJ0ZBQ0VfMicgOiAnJyxcbiAgICAgICAgJ0ZBQ0VfMycgOiAnJyxcbiAgICAgICAgJ0ZBQ0VfNCcgOiAnJyxcblxuICAgICAgICAnTEVGVF9UT1BfU0hPVUxERVInIDogJycsXG4gICAgICAgICdSSUdIVF9UT1BfU0hPVUxERVInIDogJycsXG4gICAgICAgICdMRUZUX0JPVFRPTV9TSE9VTERFUicgOiAnJyxcbiAgICAgICAgJ1JJR0hUX0JPVFRPTV9TSE9VTERFUicgOiAnJyxcblxuICAgICAgICAnU0VMRUNUX0JBQ0snIDogJycsXG4gICAgICAgICdTVEFSVF9GT1JXQVJEJyA6ICcnLFxuICAgICAgICAnTEVGVF9TVElDS19YJyA6ICdMRUZUX0FYSVNfWCcsXG4gICAgICAgICdSSUdIVF9TVElDS19YJyA6ICdSSUdIVF9BWElTX1gnLFxuICAgICAgICAnTEVGVF9TVElDS19ZJyA6ICdMRUZUX0FYSVNfWScsXG4gICAgICAgICdSSUdIVF9TVElDS19ZJyA6ICdSSUdIVF9BWElTX1knLFxuXG4gICAgICAgICdEUEFEX1VQJyA6ICdVUCcsXG4gICAgICAgICdEUEFEX0RPV04nIDogJ0RPV04nLFxuICAgICAgICAnRFBBRF9MRUZUJyA6ICdMRUZUJyxcbiAgICAgICAgJ0RQQURfUklHSFQnIDogJ1JJR0hUJyxcblxuICAgICAgICAnSE9NRScgOiAnJ1xuICAgICAgfSxcbiAgICAgIGtleWJvYXJkIDoge1xuICAgICAgICAnYScgOiAnQScsXG4gICAgICAgICd1cCcgOiAnVVAnLFxuICAgICAgICAnZG93bicgOiAnRE9XTicsXG4gICAgICAgICdsZWZ0JyA6ICdMRUZUJyxcbiAgICAgICAgJ3JpZ2h0JyA6ICdSSUdIVCcsXG4gICAgICAgICd6JyA6ICdVUCcsXG4gICAgICAgICdxJyA6ICdMRUZUJyxcbiAgICAgICAgJ3MnIDogJ0RPV04nLFxuICAgICAgICAnZCcgOiAnUklHSFQnLFxuICAgICAgfVxuICAgIH0pO1xuICAgIHZhciBnYW1lcGFkID0gbmV3IEdhbWVwYWQoKTtcbiAgICBnYW1lcGFkLmluaXQoKTtcbiAgICBnYW1lcGFkLmJpbmQoR2FtZXBhZC5FdmVudC5DT05ORUNURUQsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc29sZS5sb2coJ1tNT0RVTEVASU5QVVRTXSBHQU1FUEFEIENPTk5FQ1RFRCcpO1xuICAgIH0pO1xuICAgIGdhbWVwYWQuYmluZChHYW1lcGFkLkV2ZW50LlVOQ09OTkVDVEVELCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdbTU9EVUxFQElOUFVUU10gR0FNRVBBRCBVTkNPTk5FQ1RFRCcpO1xuICAgIH0pO1xuICAgIGdhbWVwYWQuYmluZChHYW1lcGFkLkV2ZW50LkJVVFRPTl9ET1dOLCBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgYWxpYXMgPSBpbnB1dHMuY29uZmlnKCdnYW1lcGFkJylbZS5jb250cm9sXTtcbiAgICAgIGlucHV0c01hbmFnZXIubWFuYWdlclthbGlhc10gPSAxO1xuICAgIH0pO1xuICAgIGdhbWVwYWQuYmluZChHYW1lcGFkLkV2ZW50LkJVVFRPTl9VUCwgZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIGFsaWFzID0gaW5wdXRzLmNvbmZpZygnZ2FtZXBhZCcpW2UuY29udHJvbF07XG4gICAgICBpbnB1dHNNYW5hZ2VyLm1hbmFnZXJbYWxpYXNdID0gMDtcbiAgICB9KTtcbiAgICBnYW1lcGFkLmJpbmQoR2FtZXBhZC5FdmVudC5BWElTX0NIQU5HRUQsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBhbGlhcyA9IGlucHV0cy5jb25maWcoJ2dhbWVwYWQnKVtlLmF4aXNdO1xuICAgICAgaW5wdXRzTWFuYWdlci5tYW5hZ2VyW2FsaWFzXSA9IGUudmFsdWU7XG4gICAgfSk7XG5cbiAgICB2YXIga2V5LCBjb25maWc7XG4gICAgY29uZmlnID0gaW5wdXRzLmNvbmZpZygna2V5Ym9hcmQnKTtcblxuICAgIGZ1bmN0aW9uIG9uS2V5RG93bihlLCBrZXkpe1xuICAgICAgdmFyIGFsaWFzID0gaW5wdXRzLmNvbmZpZygna2V5Ym9hcmQnKVtrZXldO1xuICAgICAgaW5wdXRzTWFuYWdlci5tYW5hZ2VyW2FsaWFzXSA9IDE7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25LZXlVcChlLCBrZXkpe1xuICAgICAgdmFyIGFsaWFzID0gaW5wdXRzLmNvbmZpZygna2V5Ym9hcmQnKVtrZXldO1xuICAgICAgaW5wdXRzTWFuYWdlci5tYW5hZ2VyW2FsaWFzXSA9IDA7XG4gICAgfVxuXG4gICAgZm9yKHZhciBpIGluIGNvbmZpZyl7XG4gICAgICBrZXkgPSBpO1xuICAgICAgTW91c2V0cmFwLmJpbmQoa2V5LCBvbktleURvd24sICdrZXlkb3duJyk7XG4gICAgICBNb3VzZXRyYXAuYmluZChrZXksIG9uS2V5VXAsICdrZXl1cCcpO1xuICAgICAgLypqc2hpbnQgaWdub3JlOmVuZCAqL1xuICAgIH1cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGlucHV0cztcbn0pKHdpbmRvdy5udWNsZWFyLCB3aW5kb3cuY29uc29sZSk7XG4iLCIhZnVuY3Rpb24oYSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIGI9ZnVuY3Rpb24oKXt9LGM9e2dldFR5cGU6ZnVuY3Rpb24oKXtyZXR1cm5cIm51bGxcIn0saXNTdXBwb3J0ZWQ6ZnVuY3Rpb24oKXtyZXR1cm4hMX0sdXBkYXRlOmJ9LGQ9ZnVuY3Rpb24oYSl7dmFyIGM9dGhpcyxkPXdpbmRvdzt0aGlzLnVwZGF0ZT1iO3RoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lPWF8fGQucmVxdWVzdEFuaW1hdGlvbkZyYW1lfHxkLndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZXx8ZC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7dGhpcy50aWNrRnVuY3Rpb249ZnVuY3Rpb24oKXtjLnVwZGF0ZSgpO2Muc3RhcnRUaWNrZXIoKX07dGhpcy5zdGFydFRpY2tlcj1mdW5jdGlvbigpe2MucmVxdWVzdEFuaW1hdGlvbkZyYW1lLmFwcGx5KGQsW2MudGlja0Z1bmN0aW9uXSl9fTtkLnByb3RvdHlwZS5zdGFydD1mdW5jdGlvbihhKXt0aGlzLnVwZGF0ZT1hfHxiO3RoaXMuc3RhcnRUaWNrZXIoKX07dmFyIGU9ZnVuY3Rpb24oKXt9O2UucHJvdG90eXBlLnVwZGF0ZT1iO2UucHJvdG90eXBlLnN0YXJ0PWZ1bmN0aW9uKGEpe3RoaXMudXBkYXRlPWF8fGJ9O3ZhciBmPWZ1bmN0aW9uKGEsYil7dGhpcy5saXN0ZW5lcj1hO3RoaXMuZ2FtZXBhZEdldHRlcj1iO3RoaXMua25vd25HYW1lcGFkcz1bXX07Zi5mYWN0b3J5PWZ1bmN0aW9uKGEpe3ZhciBiPWMsZD13aW5kb3cmJndpbmRvdy5uYXZpZ2F0b3I7ZCYmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBkLndlYmtpdEdhbWVwYWRzP2I9bmV3IGYoYSxmdW5jdGlvbigpe3JldHVybiBkLndlYmtpdEdhbWVwYWRzfSk6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGQud2Via2l0R2V0R2FtZXBhZHMmJihiPW5ldyBmKGEsZnVuY3Rpb24oKXtyZXR1cm4gZC53ZWJraXRHZXRHYW1lcGFkcygpfSkpKTtyZXR1cm4gYn07Zi5nZXRUeXBlPWZ1bmN0aW9uKCl7cmV0dXJuXCJXZWJLaXRcIn0sZi5wcm90b3R5cGUuZ2V0VHlwZT1mdW5jdGlvbigpe3JldHVybiBmLmdldFR5cGUoKX0sZi5wcm90b3R5cGUuaXNTdXBwb3J0ZWQ9ZnVuY3Rpb24oKXtyZXR1cm4hMH07Zi5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKCl7dmFyIGEsYixjPXRoaXMsZD1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLmdhbWVwYWRHZXR0ZXIoKSwwKTtmb3IoYj10aGlzLmtub3duR2FtZXBhZHMubGVuZ3RoLTE7Yj49MDtiLS0pe2E9dGhpcy5rbm93bkdhbWVwYWRzW2JdO2lmKGQuaW5kZXhPZihhKTwwKXt0aGlzLmtub3duR2FtZXBhZHMuc3BsaWNlKGIsMSk7dGhpcy5saXN0ZW5lci5fZGlzY29ubmVjdChhKX19Zm9yKGI9MDtiPGQubGVuZ3RoO2IrKyl7YT1kW2JdO2lmKGEmJmMua25vd25HYW1lcGFkcy5pbmRleE9mKGEpPDApe2Mua25vd25HYW1lcGFkcy5wdXNoKGEpO2MubGlzdGVuZXIuX2Nvbm5lY3QoYSl9fX07dmFyIGc9ZnVuY3Rpb24oYSl7dGhpcy5saXN0ZW5lcj1hO3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiZ2FtZXBhZGNvbm5lY3RlZFwiLGZ1bmN0aW9uKGIpe2EuX2Nvbm5lY3QoYi5nYW1lcGFkKX0pO3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiZ2FtZXBhZGRpc2Nvbm5lY3RlZFwiLGZ1bmN0aW9uKGIpe2EuX2Rpc2Nvbm5lY3QoYi5nYW1lcGFkKX0pfTtnLmZhY3Rvcnk9ZnVuY3Rpb24oYSl7dmFyIGI9Yzt3aW5kb3cmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciYmKGI9bmV3IGcoYSkpO3JldHVybiBifTtnLmdldFR5cGU9ZnVuY3Rpb24oKXtyZXR1cm5cIkZpcmVmb3hcIn0sZy5wcm90b3R5cGUuZ2V0VHlwZT1mdW5jdGlvbigpe3JldHVybiBnLmdldFR5cGUoKX0sZy5wcm90b3R5cGUuaXNTdXBwb3J0ZWQ9ZnVuY3Rpb24oKXtyZXR1cm4hMH07Zy5wcm90b3R5cGUudXBkYXRlPWI7dmFyIGg9ZnVuY3Rpb24oYSl7dGhpcy51cGRhdGVTdHJhdGVneT1hfHxuZXcgZDt0aGlzLmdhbWVwYWRzPVtdO3RoaXMubGlzdGVuZXJzPXt9O3RoaXMucGxhdGZvcm09Yzt0aGlzLmRlYWR6b25lPS4wMzt0aGlzLm1heGltaXplVGhyZXNob2xkPS45N307aC5VcGRhdGVTdHJhdGVnaWVzPXtBbmltRnJhbWVVcGRhdGVTdHJhdGVneTpkLE1hbnVhbFVwZGF0ZVN0cmF0ZWd5OmV9O2guUGxhdGZvcm1GYWN0b3JpZXM9W2YuZmFjdG9yeSxnLmZhY3RvcnldO2guVHlwZT17UExBWVNUQVRJT046XCJwbGF5c3RhdGlvblwiLExPR0lURUNIOlwibG9naXRlY2hcIixYQk9YOlwieGJveFwiLFVOS05PV046XCJ1bmtub3duXCJ9O2guRXZlbnQ9e0NPTk5FQ1RFRDpcImNvbm5lY3RlZFwiLFVOU1VQUE9SVEVEOlwidW5zdXBwb3J0ZWRcIixESVNDT05ORUNURUQ6XCJkaXNjb25uZWN0ZWRcIixUSUNLOlwidGlja1wiLEJVVFRPTl9ET1dOOlwiYnV0dG9uLWRvd25cIixCVVRUT05fVVA6XCJidXR0b24tdXBcIixBWElTX0NIQU5HRUQ6XCJheGlzLWNoYW5nZWRcIn07aC5TdGFuZGFyZEJ1dHRvbnM9W1wiRkFDRV8xXCIsXCJGQUNFXzJcIixcIkZBQ0VfM1wiLFwiRkFDRV80XCIsXCJMRUZUX1RPUF9TSE9VTERFUlwiLFwiUklHSFRfVE9QX1NIT1VMREVSXCIsXCJMRUZUX0JPVFRPTV9TSE9VTERFUlwiLFwiUklHSFRfQk9UVE9NX1NIT1VMREVSXCIsXCJTRUxFQ1RfQkFDS1wiLFwiU1RBUlRfRk9SV0FSRFwiLFwiTEVGVF9TVElDS1wiLFwiUklHSFRfU1RJQ0tcIixcIkRQQURfVVBcIixcIkRQQURfRE9XTlwiLFwiRFBBRF9MRUZUXCIsXCJEUEFEX1JJR0hUXCIsXCJIT01FXCJdO2guU3RhbmRhcmRBeGVzPVtcIkxFRlRfU1RJQ0tfWFwiLFwiTEVGVF9TVElDS19ZXCIsXCJSSUdIVF9TVElDS19YXCIsXCJSSUdIVF9TVElDS19ZXCJdO3ZhciBpPWZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gYjxhLmxlbmd0aD9hW2JdOmMrKGItYS5sZW5ndGgrMSl9O2guU3RhbmRhcmRNYXBwaW5nPXtlbnY6e30sYnV0dG9uczp7YnlCdXR0b246WzAsMSwyLDMsNCw1LDYsNyw4LDksMTAsMTEsMTIsMTMsMTQsMTUsMTZdfSxheGVzOntieUF4aXM6WzAsMSwyLDNdfX07aC5NYXBwaW5ncz1be2Vudjp7cGxhdGZvcm06Zy5nZXRUeXBlKCksdHlwZTpoLlR5cGUuUExBWVNUQVRJT059LGJ1dHRvbnM6e2J5QnV0dG9uOlsxNCwxMywxNSwxMiwxMCwxMSw4LDksMCwzLDEsMiw0LDYsNyw1LDE2XX0sYXhlczp7YnlBeGlzOlswLDEsMiwzXX19LHtlbnY6e3BsYXRmb3JtOmYuZ2V0VHlwZSgpLHR5cGU6aC5UeXBlLkxPR0lURUNIfSxidXR0b25zOntieUJ1dHRvbjpbMSwyLDAsMyw0LDUsNiw3LDgsOSwxMCwxMSwxMSwxMiwxMywxNCwxMF19LGF4ZXM6e2J5QXhpczpbMCwxLDIsM119fSx7ZW52OntwbGF0Zm9ybTpnLmdldFR5cGUoKSx0eXBlOmguVHlwZS5MT0dJVEVDSH0sYnV0dG9uczp7YnlCdXR0b246WzAsMSwyLDMsNCw1LC0xLC0xLDYsNyw4LDksMTEsMTIsMTMsMTQsMTBdLGJ5QXhpczpbLTEsLTEsLTEsLTEsLTEsLTEsWzIsMCwxXSxbMiwwLC0xXV19LGF4ZXM6e2J5QXhpczpbMCwxLDMsNF19fV07aC5wcm90b3R5cGUuaW5pdD1mdW5jdGlvbigpe3ZhciBhPWgucmVzb2x2ZVBsYXRmb3JtKHRoaXMpLGI9dGhpczt0aGlzLnBsYXRmb3JtPWE7dGhpcy51cGRhdGVTdHJhdGVneS5zdGFydChmdW5jdGlvbigpe2IuX3VwZGF0ZSgpfSk7cmV0dXJuIGEuaXNTdXBwb3J0ZWQoKX07aC5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIpe1widW5kZWZpbmVkXCI9PXR5cGVvZiB0aGlzLmxpc3RlbmVyc1thXSYmKHRoaXMubGlzdGVuZXJzW2FdPVtdKTt0aGlzLmxpc3RlbmVyc1thXS5wdXNoKGIpO3JldHVybiB0aGlzfTtoLnByb3RvdHlwZS51bmJpbmQ9ZnVuY3Rpb24oYSxiKXtpZihcInVuZGVmaW5lZFwiIT10eXBlb2YgYSl7aWYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGIpe2lmKFwidW5kZWZpbmVkXCI9PXR5cGVvZiB0aGlzLmxpc3RlbmVyc1thXSlyZXR1cm4hMTtmb3IodmFyIGM9MDtjPHRoaXMubGlzdGVuZXJzW2FdLmxlbmd0aDtjKyspaWYodGhpcy5saXN0ZW5lcnNbYV1bY109PT1iKXt0aGlzLmxpc3RlbmVyc1thXS5zcGxpY2UoYywxKTtyZXR1cm4hMH1yZXR1cm4hMX10aGlzLmxpc3RlbmVyc1thXT1bXX1lbHNlIHRoaXMubGlzdGVuZXJzPXt9fTtoLnByb3RvdHlwZS5jb3VudD1mdW5jdGlvbigpe3JldHVybiB0aGlzLmdhbWVwYWRzLmxlbmd0aH07aC5wcm90b3R5cGUuX2ZpcmU9ZnVuY3Rpb24oYSxiKXtpZihcInVuZGVmaW5lZFwiIT10eXBlb2YgdGhpcy5saXN0ZW5lcnNbYV0pZm9yKHZhciBjPTA7Yzx0aGlzLmxpc3RlbmVyc1thXS5sZW5ndGg7YysrKXRoaXMubGlzdGVuZXJzW2FdW2NdLmFwcGx5KHRoaXMubGlzdGVuZXJzW2FdW2NdLFtiXSl9O2guZ2V0TnVsbFBsYXRmb3JtPWZ1bmN0aW9uKCl7cmV0dXJuIE9iamVjdC5jcmVhdGUoYyl9O2gucmVzb2x2ZVBsYXRmb3JtPWZ1bmN0aW9uKGEpe3ZhciBiLGQ9Yztmb3IoYj0wOyFkLmlzU3VwcG9ydGVkKCkmJmI8aC5QbGF0Zm9ybUZhY3Rvcmllcy5sZW5ndGg7YisrKWQ9aC5QbGF0Zm9ybUZhY3Rvcmllc1tiXShhKTtyZXR1cm4gZH07aC5wcm90b3R5cGUuX2Nvbm5lY3Q9ZnVuY3Rpb24oYSl7dmFyIGIsYyxkPXRoaXMuX3Jlc29sdmVNYXBwaW5nKGEpO2Euc3RhdGU9e307YS5sYXN0U3RhdGU9e307YS51cGRhdGVyPVtdO2I9ZC5idXR0b25zLmJ5QnV0dG9uLmxlbmd0aDtmb3IoYz0wO2I+YztjKyspdGhpcy5fYWRkQnV0dG9uVXBkYXRlcihhLGQsYyk7Yj1kLmF4ZXMuYnlBeGlzLmxlbmd0aDtmb3IoYz0wO2I+YztjKyspdGhpcy5fYWRkQXhpc1VwZGF0ZXIoYSxkLGMpO3RoaXMuZ2FtZXBhZHNbYS5pbmRleF09YTt0aGlzLl9maXJlKGguRXZlbnQuQ09OTkVDVEVELGEpfTtoLnByb3RvdHlwZS5fYWRkQnV0dG9uVXBkYXRlcj1mdW5jdGlvbihhLGMsZCl7dmFyIGU9YixmPWkoaC5TdGFuZGFyZEJ1dHRvbnMsZCxcIkVYVFJBX0JVVFRPTl9cIiksZz10aGlzLl9jcmVhdGVCdXR0b25HZXR0ZXIoYSxjLmJ1dHRvbnMsZCksaj10aGlzLGs9e2dhbWVwYWQ6YSxjb250cm9sOmZ9O2Euc3RhdGVbZl09MDthLmxhc3RTdGF0ZVtmXT0wO2U9ZnVuY3Rpb24oKXt2YXIgYj1nKCksYz1hLmxhc3RTdGF0ZVtmXSxkPWI+LjUsZT1jPi41O2Euc3RhdGVbZl09YjtkJiYhZT9qLl9maXJlKGguRXZlbnQuQlVUVE9OX0RPV04sT2JqZWN0LmNyZWF0ZShrKSk6IWQmJmUmJmouX2ZpcmUoaC5FdmVudC5CVVRUT05fVVAsT2JqZWN0LmNyZWF0ZShrKSk7MCE9PWImJjEhPT1iJiZiIT09YyYmai5fZmlyZUF4aXNDaGFuZ2VkRXZlbnQoYSxmLGIpO2EubGFzdFN0YXRlW2ZdPWJ9O2EudXBkYXRlci5wdXNoKGUpfTtoLnByb3RvdHlwZS5fYWRkQXhpc1VwZGF0ZXI9ZnVuY3Rpb24oYSxjLGQpe3ZhciBlPWIsZj1pKGguU3RhbmRhcmRBeGVzLGQsXCJFWFRSQV9BWElTX1wiKSxnPXRoaXMuX2NyZWF0ZUF4aXNHZXR0ZXIoYSxjLmF4ZXMsZCksaj10aGlzO2Euc3RhdGVbZl09MDthLmxhc3RTdGF0ZVtmXT0wO2U9ZnVuY3Rpb24oKXt2YXIgYj1nKCksYz1hLmxhc3RTdGF0ZVtmXTthLnN0YXRlW2ZdPWI7YiE9PWMmJmouX2ZpcmVBeGlzQ2hhbmdlZEV2ZW50KGEsZixiKTthLmxhc3RTdGF0ZVtmXT1ifTthLnVwZGF0ZXIucHVzaChlKX07aC5wcm90b3R5cGUuX2ZpcmVBeGlzQ2hhbmdlZEV2ZW50PWZ1bmN0aW9uKGEsYixjKXt2YXIgZD17Z2FtZXBhZDphLGF4aXM6Yix2YWx1ZTpjfTt0aGlzLl9maXJlKGguRXZlbnQuQVhJU19DSEFOR0VELGQpfTtoLnByb3RvdHlwZS5fY3JlYXRlQnV0dG9uR2V0dGVyPWZ1bmN0aW9uKCl7dmFyIGE9ZnVuY3Rpb24oKXtyZXR1cm4gMH0sYj1mdW5jdGlvbihiLGMsZCl7dmFyIGU9YTtkPmM/ZT1mdW5jdGlvbigpe3ZhciBhPWQtYyxlPWIoKTtlPShlLWMpL2E7cmV0dXJuIDA+ZT8wOmV9OmM+ZCYmKGU9ZnVuY3Rpb24oKXt2YXIgYT1jLWQsZT1iKCk7ZT0oZS1kKS9hO3JldHVybiBlPjE/MDoxLWV9KTtyZXR1cm4gZX0sYz1mdW5jdGlvbihhKXtyZXR1cm5cIltvYmplY3QgQXJyYXldXCI9PT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSl9O3JldHVybiBmdW5jdGlvbihkLGUsZil7dmFyIGcsaD1hLGk9dGhpcztnPWUuYnlCdXR0b25bZl07aWYoLTEhPT1nKVwibnVtYmVyXCI9PXR5cGVvZiBnJiZnPGQuYnV0dG9ucy5sZW5ndGgmJihoPWZ1bmN0aW9uKCl7cmV0dXJuIGQuYnV0dG9uc1tnXX0pO2Vsc2UgaWYoZS5ieUF4aXMmJmY8ZS5ieUF4aXMubGVuZ3RoKXtnPWUuYnlBeGlzW2ZdO2lmKGMoZykmJjM9PWcubGVuZ3RoJiZnWzBdPGQuYXhlcy5sZW5ndGgpe2g9ZnVuY3Rpb24oKXt2YXIgYT1kLmF4ZXNbZ1swXV07cmV0dXJuIGkuX2FwcGx5RGVhZHpvbmVNYXhpbWl6ZShhKX07aD1iKGgsZ1sxXSxnWzJdKX19cmV0dXJuIGh9fSgpO2gucHJvdG90eXBlLl9jcmVhdGVBeGlzR2V0dGVyPWZ1bmN0aW9uKCl7dmFyIGE9ZnVuY3Rpb24oKXtyZXR1cm4gMH07cmV0dXJuIGZ1bmN0aW9uKGIsYyxkKXt2YXIgZSxmPWEsZz10aGlzO2U9Yy5ieUF4aXNbZF07LTEhPT1lJiZcIm51bWJlclwiPT10eXBlb2YgZSYmZTxiLmF4ZXMubGVuZ3RoJiYoZj1mdW5jdGlvbigpe3ZhciBhPWIuYXhlc1tlXTtyZXR1cm4gZy5fYXBwbHlEZWFkem9uZU1heGltaXplKGEpfSk7cmV0dXJuIGZ9fSgpO2gucHJvdG90eXBlLl9kaXNjb25uZWN0PWZ1bmN0aW9uKGEpe3ZhciBiLGM9W107XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHRoaXMuZ2FtZXBhZHNbYS5pbmRleF0mJmRlbGV0ZSB0aGlzLmdhbWVwYWRzW2EuaW5kZXhdO2ZvcihiPTA7Yjx0aGlzLmdhbWVwYWRzLmxlbmd0aDtiKyspXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHRoaXMuZ2FtZXBhZHNbYl0mJihjW2JdPXRoaXMuZ2FtZXBhZHNbYl0pO3RoaXMuZ2FtZXBhZHM9Yzt0aGlzLl9maXJlKGguRXZlbnQuRElTQ09OTkVDVEVELGEpfTtoLnByb3RvdHlwZS5fcmVzb2x2ZUNvbnRyb2xsZXJUeXBlPWZ1bmN0aW9uKGEpe2E9YS50b0xvd2VyQ2FzZSgpO3JldHVybi0xIT09YS5pbmRleE9mKFwicGxheXN0YXRpb25cIik/aC5UeXBlLlBMQVlTVEFUSU9OOi0xIT09YS5pbmRleE9mKFwibG9naXRlY2hcIil8fC0xIT09YS5pbmRleE9mKFwid2lyZWxlc3MgZ2FtZXBhZFwiKT9oLlR5cGUuTE9HSVRFQ0g6LTEhPT1hLmluZGV4T2YoXCJ4Ym94XCIpfHwtMSE9PWEuaW5kZXhPZihcIjM2MFwiKT9oLlR5cGUuWEJPWDpoLlR5cGUuVU5LTk9XTn07aC5wcm90b3R5cGUuX3Jlc29sdmVNYXBwaW5nPWZ1bmN0aW9uKGEpe3ZhciBiLGMsZD1oLk1hcHBpbmdzLGU9bnVsbCxmPXtwbGF0Zm9ybTp0aGlzLnBsYXRmb3JtLmdldFR5cGUoKSx0eXBlOnRoaXMuX3Jlc29sdmVDb250cm9sbGVyVHlwZShhLmlkKX07Zm9yKGI9MDshZSYmYjxkLmxlbmd0aDtiKyspe2M9ZFtiXTtoLmVudk1hdGNoZXNGaWx0ZXIoYy5lbnYsZikmJihlPWMpfXJldHVybiBlfHxoLlN0YW5kYXJkTWFwcGluZ307aC5lbnZNYXRjaGVzRmlsdGVyPWZ1bmN0aW9uKGEsYil7dmFyIGMsZD0hMDtmb3IoYyBpbiBhKWFbY10hPT1iW2NdJiYoZD0hMSk7cmV0dXJuIGR9O2gucHJvdG90eXBlLl91cGRhdGU9ZnVuY3Rpb24oKXt0aGlzLnBsYXRmb3JtLnVwZGF0ZSgpO3RoaXMuZ2FtZXBhZHMuZm9yRWFjaChmdW5jdGlvbihhKXthJiZhLnVwZGF0ZXIuZm9yRWFjaChmdW5jdGlvbihhKXthKCl9KX0pO3RoaXMuZ2FtZXBhZHMubGVuZ3RoPjAmJnRoaXMuX2ZpcmUoaC5FdmVudC5USUNLLHRoaXMuZ2FtZXBhZHMpfSxoLnByb3RvdHlwZS5fYXBwbHlEZWFkem9uZU1heGltaXplPWZ1bmN0aW9uKGEsYixjKXtiPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBiP2I6dGhpcy5kZWFkem9uZTtjPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBjP2M6dGhpcy5tYXhpbWl6ZVRocmVzaG9sZDthPj0wP2I+YT9hPTA6YT5jJiYoYT0xKTphPi1iP2E9MDotYz5hJiYoYT0tMSk7cmV0dXJuIGF9O2EuR2FtZXBhZD1ofShcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0c3x8d2luZG93KTsiLCIvKiBtb3VzZXRyYXAgdjEuNC42IGNyYWlnLmlzL2tpbGxpbmcvbWljZSAqL1xuKGZ1bmN0aW9uKEoscixmKXtmdW5jdGlvbiBzKGEsYixkKXthLmFkZEV2ZW50TGlzdGVuZXI/YS5hZGRFdmVudExpc3RlbmVyKGIsZCwhMSk6YS5hdHRhY2hFdmVudChcIm9uXCIrYixkKX1mdW5jdGlvbiBBKGEpe2lmKFwia2V5cHJlc3NcIj09YS50eXBlKXt2YXIgYj1TdHJpbmcuZnJvbUNoYXJDb2RlKGEud2hpY2gpO2Euc2hpZnRLZXl8fChiPWIudG9Mb3dlckNhc2UoKSk7cmV0dXJuIGJ9cmV0dXJuIGhbYS53aGljaF0/aFthLndoaWNoXTpCW2Eud2hpY2hdP0JbYS53aGljaF06U3RyaW5nLmZyb21DaGFyQ29kZShhLndoaWNoKS50b0xvd2VyQ2FzZSgpfWZ1bmN0aW9uIHQoYSl7YT1hfHx7fTt2YXIgYj0hMSxkO2ZvcihkIGluIG4pYVtkXT9iPSEwOm5bZF09MDtifHwodT0hMSl9ZnVuY3Rpb24gQyhhLGIsZCxjLGUsdil7dmFyIGcsayxmPVtdLGg9ZC50eXBlO2lmKCFsW2FdKXJldHVybltdO1wia2V5dXBcIj09aCYmdyhhKSYmKGI9W2FdKTtmb3IoZz0wO2c8bFthXS5sZW5ndGg7KytnKWlmKGs9XG5sW2FdW2ddLCEoIWMmJmsuc2VxJiZuW2suc2VxXSE9ay5sZXZlbHx8aCE9ay5hY3Rpb258fChcImtleXByZXNzXCIhPWh8fGQubWV0YUtleXx8ZC5jdHJsS2V5KSYmYi5zb3J0KCkuam9pbihcIixcIikhPT1rLm1vZGlmaWVycy5zb3J0KCkuam9pbihcIixcIikpKXt2YXIgbT1jJiZrLnNlcT09YyYmay5sZXZlbD09djsoIWMmJmsuY29tYm89PWV8fG0pJiZsW2FdLnNwbGljZShnLDEpO2YucHVzaChrKX1yZXR1cm4gZn1mdW5jdGlvbiBLKGEpe3ZhciBiPVtdO2Euc2hpZnRLZXkmJmIucHVzaChcInNoaWZ0XCIpO2EuYWx0S2V5JiZiLnB1c2goXCJhbHRcIik7YS5jdHJsS2V5JiZiLnB1c2goXCJjdHJsXCIpO2EubWV0YUtleSYmYi5wdXNoKFwibWV0YVwiKTtyZXR1cm4gYn1mdW5jdGlvbiB4KGEsYixkLGMpe20uc3RvcENhbGxiYWNrKGIsYi50YXJnZXR8fGIuc3JjRWxlbWVudCxkLGMpfHwhMSE9PWEoYixkKXx8KGIucHJldmVudERlZmF1bHQ/Yi5wcmV2ZW50RGVmYXVsdCgpOmIucmV0dXJuVmFsdWU9ITEsYi5zdG9wUHJvcGFnYXRpb24/XG5iLnN0b3BQcm9wYWdhdGlvbigpOmIuY2FuY2VsQnViYmxlPSEwKX1mdW5jdGlvbiB5KGEpe1wibnVtYmVyXCIhPT10eXBlb2YgYS53aGljaCYmKGEud2hpY2g9YS5rZXlDb2RlKTt2YXIgYj1BKGEpO2ImJihcImtleXVwXCI9PWEudHlwZSYmej09PWI/ej0hMTptLmhhbmRsZUtleShiLEsoYSksYSkpfWZ1bmN0aW9uIHcoYSl7cmV0dXJuXCJzaGlmdFwiPT1hfHxcImN0cmxcIj09YXx8XCJhbHRcIj09YXx8XCJtZXRhXCI9PWF9ZnVuY3Rpb24gTChhLGIsZCxjKXtmdW5jdGlvbiBlKGIpe3JldHVybiBmdW5jdGlvbigpe3U9YjsrK25bYV07Y2xlYXJUaW1lb3V0KEQpO0Q9c2V0VGltZW91dCh0LDFFMyl9fWZ1bmN0aW9uIHYoYil7eChkLGIsYSk7XCJrZXl1cFwiIT09YyYmKHo9QShiKSk7c2V0VGltZW91dCh0LDEwKX1mb3IodmFyIGc9blthXT0wO2c8Yi5sZW5ndGg7KytnKXt2YXIgZj1nKzE9PT1iLmxlbmd0aD92OmUoY3x8RShiW2crMV0pLmFjdGlvbik7RihiW2ddLGYsYyxhLGcpfX1mdW5jdGlvbiBFKGEsYil7dmFyIGQsXG5jLGUsZj1bXTtkPVwiK1wiPT09YT9bXCIrXCJdOmEuc3BsaXQoXCIrXCIpO2ZvcihlPTA7ZTxkLmxlbmd0aDsrK2UpYz1kW2VdLEdbY10mJihjPUdbY10pLGImJlwia2V5cHJlc3NcIiE9YiYmSFtjXSYmKGM9SFtjXSxmLnB1c2goXCJzaGlmdFwiKSksdyhjKSYmZi5wdXNoKGMpO2Q9YztlPWI7aWYoIWUpe2lmKCFwKXtwPXt9O2Zvcih2YXIgZyBpbiBoKTk1PGcmJjExMj5nfHxoLmhhc093blByb3BlcnR5KGcpJiYocFtoW2ddXT1nKX1lPXBbZF0/XCJrZXlkb3duXCI6XCJrZXlwcmVzc1wifVwia2V5cHJlc3NcIj09ZSYmZi5sZW5ndGgmJihlPVwia2V5ZG93blwiKTtyZXR1cm57a2V5OmMsbW9kaWZpZXJzOmYsYWN0aW9uOmV9fWZ1bmN0aW9uIEYoYSxiLGQsYyxlKXtxW2ErXCI6XCIrZF09YjthPWEucmVwbGFjZSgvXFxzKy9nLFwiIFwiKTt2YXIgZj1hLnNwbGl0KFwiIFwiKTsxPGYubGVuZ3RoP0woYSxmLGIsZCk6KGQ9RShhLGQpLGxbZC5rZXldPWxbZC5rZXldfHxbXSxDKGQua2V5LGQubW9kaWZpZXJzLHt0eXBlOmQuYWN0aW9ufSxcbmMsYSxlKSxsW2Qua2V5XVtjP1widW5zaGlmdFwiOlwicHVzaFwiXSh7Y2FsbGJhY2s6Yixtb2RpZmllcnM6ZC5tb2RpZmllcnMsYWN0aW9uOmQuYWN0aW9uLHNlcTpjLGxldmVsOmUsY29tYm86YX0pKX12YXIgaD17ODpcImJhY2tzcGFjZVwiLDk6XCJ0YWJcIiwxMzpcImVudGVyXCIsMTY6XCJzaGlmdFwiLDE3OlwiY3RybFwiLDE4OlwiYWx0XCIsMjA6XCJjYXBzbG9ja1wiLDI3OlwiZXNjXCIsMzI6XCJzcGFjZVwiLDMzOlwicGFnZXVwXCIsMzQ6XCJwYWdlZG93blwiLDM1OlwiZW5kXCIsMzY6XCJob21lXCIsMzc6XCJsZWZ0XCIsMzg6XCJ1cFwiLDM5OlwicmlnaHRcIiw0MDpcImRvd25cIiw0NTpcImluc1wiLDQ2OlwiZGVsXCIsOTE6XCJtZXRhXCIsOTM6XCJtZXRhXCIsMjI0OlwibWV0YVwifSxCPXsxMDY6XCIqXCIsMTA3OlwiK1wiLDEwOTpcIi1cIiwxMTA6XCIuXCIsMTExOlwiL1wiLDE4NjpcIjtcIiwxODc6XCI9XCIsMTg4OlwiLFwiLDE4OTpcIi1cIiwxOTA6XCIuXCIsMTkxOlwiL1wiLDE5MjpcImBcIiwyMTk6XCJbXCIsMjIwOlwiXFxcXFwiLDIyMTpcIl1cIiwyMjI6XCInXCJ9LEg9e1wiflwiOlwiYFwiLFwiIVwiOlwiMVwiLFxuXCJAXCI6XCIyXCIsXCIjXCI6XCIzXCIsJDpcIjRcIixcIiVcIjpcIjVcIixcIl5cIjpcIjZcIixcIiZcIjpcIjdcIixcIipcIjpcIjhcIixcIihcIjpcIjlcIixcIilcIjpcIjBcIixfOlwiLVwiLFwiK1wiOlwiPVwiLFwiOlwiOlwiO1wiLCdcIic6XCInXCIsXCI8XCI6XCIsXCIsXCI+XCI6XCIuXCIsXCI/XCI6XCIvXCIsXCJ8XCI6XCJcXFxcXCJ9LEc9e29wdGlvbjpcImFsdFwiLGNvbW1hbmQ6XCJtZXRhXCIsXCJyZXR1cm5cIjpcImVudGVyXCIsZXNjYXBlOlwiZXNjXCIsbW9kOi9NYWN8aVBvZHxpUGhvbmV8aVBhZC8udGVzdChuYXZpZ2F0b3IucGxhdGZvcm0pP1wibWV0YVwiOlwiY3RybFwifSxwLGw9e30scT17fSxuPXt9LEQsej0hMSxJPSExLHU9ITE7Zm9yKGY9MTsyMD5mOysrZiloWzExMStmXT1cImZcIitmO2ZvcihmPTA7OT49ZjsrK2YpaFtmKzk2XT1mO3MocixcImtleXByZXNzXCIseSk7cyhyLFwia2V5ZG93blwiLHkpO3MocixcImtleXVwXCIseSk7dmFyIG09e2JpbmQ6ZnVuY3Rpb24oYSxiLGQpe2E9YSBpbnN0YW5jZW9mIEFycmF5P2E6W2FdO2Zvcih2YXIgYz0wO2M8YS5sZW5ndGg7KytjKUYoYVtjXSxiLGQpO3JldHVybiB0aGlzfSxcbnVuYmluZDpmdW5jdGlvbihhLGIpe3JldHVybiBtLmJpbmQoYSxmdW5jdGlvbigpe30sYil9LHRyaWdnZXI6ZnVuY3Rpb24oYSxiKXtpZihxW2ErXCI6XCIrYl0pcVthK1wiOlwiK2JdKHt9LGEpO3JldHVybiB0aGlzfSxyZXNldDpmdW5jdGlvbigpe2w9e307cT17fTtyZXR1cm4gdGhpc30sc3RvcENhbGxiYWNrOmZ1bmN0aW9uKGEsYil7cmV0dXJuLTE8KFwiIFwiK2IuY2xhc3NOYW1lK1wiIFwiKS5pbmRleE9mKFwiIG1vdXNldHJhcCBcIik/ITE6XCJJTlBVVFwiPT1iLnRhZ05hbWV8fFwiU0VMRUNUXCI9PWIudGFnTmFtZXx8XCJURVhUQVJFQVwiPT1iLnRhZ05hbWV8fGIuaXNDb250ZW50RWRpdGFibGV9LGhhbmRsZUtleTpmdW5jdGlvbihhLGIsZCl7dmFyIGM9QyhhLGIsZCksZTtiPXt9O3ZhciBmPTAsZz0hMTtmb3IoZT0wO2U8Yy5sZW5ndGg7KytlKWNbZV0uc2VxJiYoZj1NYXRoLm1heChmLGNbZV0ubGV2ZWwpKTtmb3IoZT0wO2U8Yy5sZW5ndGg7KytlKWNbZV0uc2VxP2NbZV0ubGV2ZWw9PWYmJihnPSEwLFxuYltjW2VdLnNlcV09MSx4KGNbZV0uY2FsbGJhY2ssZCxjW2VdLmNvbWJvLGNbZV0uc2VxKSk6Z3x8eChjW2VdLmNhbGxiYWNrLGQsY1tlXS5jb21ibyk7Yz1cImtleXByZXNzXCI9PWQudHlwZSYmSTtkLnR5cGUhPXV8fHcoYSl8fGN8fHQoYik7ST1nJiZcImtleWRvd25cIj09ZC50eXBlfX07Si5Nb3VzZXRyYXA9bTtcImZ1bmN0aW9uXCI9PT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kJiZkZWZpbmUobSl9KSh3aW5kb3csZG9jdW1lbnQpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBMaWdodENvbXBvbmVudChvcHRpb25zKSB7XG4gIHRoaXMuc2hhcGUgPSBbXTtcbiAgdGhpcy5jb2xvciA9IG9wdGlvbnMuY29sb3I7XG4gIHRoaXMucmFkaXVzID0gb3B0aW9ucy5yYWRpdXM7XG4gIHRoaXMuaW50ZW5zaXR5ID0gb3B0aW9ucy5pbnRlbnNpdHk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTGlnaHRDb21wb25lbnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIE9jY2x1ZGVyQ29tcG9uZW50KHNoYXBlKSB7XG4gIHRoaXMuc2hhcGUgPSBzaGFwZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPY2NsdWRlckNvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIExpZ2h0Q29tcG9uZW50LCBPY2NsdWRlckNvbXBvbmVudDtcblxuTGlnaHRDb21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvbGlnaHQtY29tcG9uZW50Jyk7XG5PY2NsdWRlckNvbXBvbmVudCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9vY2NsdWRlci1jb21wb25lbnQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBudWNsZWFyLm1vZHVsZSgnZ2FtZS5saWdodGluZycsIFtdKVxuICAuY29tcG9uZW50KCdvY2NsdWRlcicsIGZ1bmN0aW9uIChlLCBzaGFwZSkge1xuICAgIHJldHVybiBuZXcgT2NjbHVkZXJDb21wb25lbnQoc2hhcGUpO1xuICB9KVxuICAuY29tcG9uZW50KCdsaWdodCcsIGZ1bmN0aW9uIChlLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBMaWdodENvbXBvbmVudChvcHRpb25zKTtcbiAgfSlcbiAgLnN5c3RlbSgnc2hhZG93aW5nJywgW1xuICAgICdvY2NsdWRlciBmcm9tIGdhbWUubGlnaHRpbmcnXG4gIF0sIHJlcXVpcmUoJy4vc3lzdGVtcy9zaGFkb3dpbmctc3lzdGVtJykpXG4gIC5zeXN0ZW0oJ2xpZ2h0aW5nJywgW1xuICAgICdsaWdodCBmcm9tIGdhbWUubGlnaHRpbmcnLFxuICAgICdwb3NpdGlvbiBmcm9tIGdhbWUudHJhbnNmb3JtJ1xuICBdLCByZXF1aXJlKCcuL3N5c3RlbXMvbGlnaHRpbmctc3lzdGVtJykpXG4gIC5zeXN0ZW0oJ2RlYnVnLW9jY2x1ZGVycycsIFtcbiAgICAnb2NjbHVkZXIgZnJvbSBnYW1lLmxpZ2h0aW5nJyxcbiAgICAncG9zaXRpb24gZnJvbSBnYW1lLnRyYW5zZm9ybSdcbiAgXSwgcmVxdWlyZSgnLi9zeXN0ZW1zL2RlYnVnLW9jY2x1ZGVycy1zeXN0ZW0nKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVidWdPY2NsdWRlcnNTeXN0ZW0oZSwgY29tcG9uZW50cywgY29udGV4dCkge1xuICB2YXIgZGVzdCwgc2hhcGUsIGxlbmd0aCwgaTtcblxuICBkZXN0ID0gY29udGV4dC5kZXN0c1swXTtcblxuICBzaGFwZSA9IGNvbXBvbmVudHMub2NjbHVkZXIuc2hhcGU7XG4gIGxlbmd0aCA9IHNoYXBlLmxlbmd0aDtcblxuICBkZXN0LnNhdmUoKTtcblxuICBkZXN0LnRyYW5zbGF0ZShjb21wb25lbnRzLnBvc2l0aW9uLngsIGNvbXBvbmVudHMucG9zaXRpb24ueSk7XG5cbiAgZGVzdC5maWxsU3R5bGUgPSAnYmxhY2snO1xuXG4gIGRlc3QubW92ZVRvKHNoYXBlWzBdLCBzaGFwZVsxXSk7XG5cbiAgZm9yIChpID0gMjsgaSA8IGxlbmd0aDsgaSArPSAyKSB7XG4gICAgZGVzdC5saW5lVG8oc2hhcGVbaV0sIHNoYXBlW2kgKyAxXSk7XG4gIH1cblxuICBkZXN0LmNsb3NlUGF0aCgpO1xuXG4gIGRlc3QuZmlsbCgpO1xuXG4gIGRlc3QucmVzdG9yZSgpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBsaWdodGluZ1N5c3RlbSgvKmUsIGNvbXBvbmVudHMsIGNvbnRleHQqLykgey8qXG5cbiovfTtcbiIsIid1c2Ugc3RyaWN0JztcblxubnVjbGVhci5ldmVudHMub24oJ3N5c3RlbTpiZWZvcmU6c2hhZG93aW5nIGZyb20gZ2FtZS5saWdodGluZycsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIGxpZ2h0Q29tcG9uZW50LCBjb250ZXh0LCBpLCBlO1xuXG4gIGxpZ2h0Q29tcG9uZW50ID0gbnVjbGVhci5jb21wb25lbnQoJ2xpZ2h0Jyk7XG4gIGNvbnRleHQgPSBudWNsZWFyLnN5c3RlbS5jb250ZXh0KCk7XG5cbiAgZm9yIChpID0gMDsgKGUgPSBjb250ZXh0LmxpZ2h0c1tpXSk7IGkgKz0gMSkge1xuICAgIGxpZ2h0Q29tcG9uZW50Lm9mKGUpLnNoYXBlLmxlbmd0aCA9IDA7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNoYWRvd2luZ1N5c3RlbShlLCBjb21wb25lbnRzLCBjb250ZXh0KSB7XG4gIHZhciBsaWdodENvbXBvbmVudCwgcG9zaXRpb25Db21wb25lbnQsIGRlc3QsIGxpZ2h0cywgcG9zaXRpb24sIHNoYXBlLCBpLCBsaWdodEVudGl0eSwgbGlnaHRQb3NpdGlvbiwgbGlnaHQsIGosIGxlbmd0aDtcbiAgdmFyIHQxLCB0MiwgcnB4LCBycHksIHJkeCwgcmR5LCBzcHgsIHNweSwgc2R4LCBzZHksIGltO1xuXG4gIGxpZ2h0Q29tcG9uZW50ID0gbnVjbGVhci5jb21wb25lbnQoJ2xpZ2h0Jyk7XG4gIHBvc2l0aW9uQ29tcG9uZW50ID0gbnVjbGVhci5jb21wb25lbnQoJ3Bvc2l0aW9uJyk7XG5cbiAgZGVzdCA9IGNvbnRleHQuZGVzdHNbMF07XG5cbiAgZGVzdC5zYXZlKCk7XG5cbiAgbGlnaHRzID0gY29udGV4dC5saWdodHM7XG4gIHBvc2l0aW9uID0gY29tcG9uZW50cy5wb3NpdGlvbjtcblxuICBzaGFwZSA9IGNvbXBvbmVudHMub2NjbHVkZXIuc2hhcGU7XG5cbiAgZm9yIChpID0gMDsgKGxpZ2h0RW50aXR5ID0gbGlnaHRzW2ldKTsgaSArPSAxKSB7XG4gICAgbGlnaHRQb3NpdGlvbiA9IHBvc2l0aW9uQ29tcG9uZW50Lm9mKGxpZ2h0RW50aXR5KTtcbiAgICBsaWdodCA9IGxpZ2h0Q29tcG9uZW50Lm9mKGxpZ2h0RW50aXR5KTtcblxuICAgIHJweCA9IGxpZ2h0UG9zaXRpb24ueDtcbiAgICBycHkgPSBsaWdodFBvc2l0aW9uLnk7XG5cbiAgICBsZW5ndGggPSBzaGFwZS5sZW5ndGg7XG5cbiAgICBmb3IgKGogPSAwOyBqIDwgbGVuZ3RoOyBqICs9IDIpIHtcbiAgICAgIHNweCA9IHNoYXBlW2pdO1xuICAgICAgc3B5ID0gc2hhcGVbKGogKyAxKSAlIGxlbmd0aF07XG5cbiAgICAgIHJkeCA9IHNweCAtIHJweDtcbiAgICAgIHJkeSA9IHNweSAtIHJweTtcblxuICAgICAgc2R4ID0gc2hhcGVbKGogKyAyKSAlIGxlbmd0aF0gLSBzcHg7XG4gICAgICBzZHkgPSBzaGFwZVsoaiArIDMpICUgbGVuZ3RoXSAtIHNweTtcblxuICAgICAgdDIgPSAocmR4ICogKHNweSAtIHJweSkgKyByZHkgKiAocnB4IC0gc3B4KSkgLyAoc2R4ICogcmR5IC0gc2R5ICogcmR4KTtcbiAgICAgIHQxID0gKHNweCArIHNkeCAqIHQyIC0gcnB4KSAvIHJkeDtcblxuICAgICAgaWYgKHQxIDwgMCkgYnJlYWs7XG4gICAgICBpZiAodDIgPCAwIHx8IHQyID4gMSkgYnJlYWs7XG5cbiAgICAgIGltID0gTWF0aC5zcXJ0KHNkeCAqIHNkeCArIHNkeSAqIHNkeSk7XG5cbiAgICAgIGxpZ2h0LnNoYXBlLnB1c2goc3B4ICsgc2R4ICogaW0gKiB0Miwgc3B5ICsgc2R5ICogdDIpO1xuICAgIH1cblxuICAgIGxlbmd0aCA9IGxpZ2h0LnNoYXBlLmxlbmd0aDtcblxuICAgIGRlc3Quc3Ryb2tlU3R5bGUgPSAncmVkJztcblxuICAgIGZvciAoaiA9IDA7IGogPCBsZW5ndGg7IGogKz0gMikge1xuICAgICAgZGVzdC5iZWdpblBhdGgoKTtcbiAgICAgIGRlc3QubW92ZVRvKHJweCwgcnB5KTtcbiAgICAgIGRlc3QubGluZVRvKGxpZ2h0LnNoYXBlW2pdLCBsaWdodC5zaGFwZVtqICsgMV0pO1xuICAgICAgZGVzdC5jbG9zZVBhdGgoKTtcbiAgICAgIGRlc3Quc3Ryb2tlKCk7XG4gICAgfVxuICB9XG5cbiAgZGVzdC5yZXN0b3JlKCk7XG5cbi8qXG4gIG9uIGFmdGVyXG4gICAgc29ydCB2ZXJ0aWNlcyBvZiB0aGUgc2hhcGUgb2YgZWFjaCBsaWdodFxuXG4qL307XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBwYXRoLCBsb2FkZXI7XG5cbnBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5sb2FkZXIgPSByZXF1aXJlKCdhc3NldHMtbG9hZGVyJyk7XG5cbmZ1bmN0aW9uIEF0bGFzQ29tcG9uZW50KGtleSkge1xuICB0aGlzLm5hbWUgPSBrZXk7XG4gIHRoaXMuc291cmNlID0gbG9hZGVyLmdldChwYXRoLmpvaW4oJ2F0bGFzZXMnLCBrZXkgKyAnLmF0bGFzLnBuZycpKTtcbiAgdGhpcy5zcHJpdGVzID0gbG9hZGVyLmdldChwYXRoLmpvaW4oJ2F0bGFzZXMnLCBrZXkgKyAnLmF0bGFzLmpzb24nKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXRsYXNDb21wb25lbnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBwYXRoLCBsb2FkZXI7XG5cbnBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5sb2FkZXIgPSByZXF1aXJlKCdhc3NldHMtbG9hZGVyJyk7XG5cbmZ1bmN0aW9uIFNwcml0ZUNvbXBvbmVudChlLCBvcHRpb25zKSB7XG4gIHZhciBhdGxhcywgc291cmNlLCBzY2FsZWRXaWR0aCwgc2NhbGVkSGVpZ2h0O1xuXG4gIGF0bGFzID0gbnVjbGVhci5jb21wb25lbnQoJ2F0bGFzJykub2YoZSk7XG5cbiAgdGhpcy5idWZmZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgdGhpcy5jb250ZXh0ID0gdGhpcy5idWZmZXIuZ2V0Q29udGV4dCgnMmQnKTtcblxuICB0aGlzLmRlc3QgPSBvcHRpb25zLmRlc3QgfHwgMDtcbiAgdGhpcy5zY2FsZSA9IG9wdGlvbnMuc2NhbGUgfHwgMTtcblxuICB0aGlzLmJ1ZmZlci53aWR0aCA9IG9wdGlvbnMud2lkdGg7XG4gIHRoaXMuYnVmZmVyLmhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0O1xuXG4gIHRoaXMuY29udGV4dC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcblxuICBpZiAoYXRsYXMpIHtcbiAgICBzb3VyY2UgPSBsb2FkZXIuZ2V0KHBhdGguam9pbignYXRsYXNlcycsIGF0bGFzLm5hbWUgKyAnLmF0bGFzLmpzb24nKSkuZnJhbWVzW29wdGlvbnMuZnJhbWUgfHwgMF07XG5cbiAgICBzY2FsZWRXaWR0aCA9IHNvdXJjZS5mcmFtZS53ICogdGhpcy5zY2FsZTtcbiAgICBzY2FsZWRIZWlnaHQgPSBzb3VyY2UuZnJhbWUuaCAqIHRoaXMuc2NhbGU7XG5cbiAgICB0aGlzLmNvbnRleHQuZHJhd0ltYWdlKGF0bGFzLnNvdXJjZSwgc291cmNlLmZyYW1lLngsIHNvdXJjZS5mcmFtZS55LCBzb3VyY2UuZnJhbWUudywgc291cmNlLmZyYW1lLmgsIDAuNSAqIChvcHRpb25zLndpZHRoIC0gc2NhbGVkV2lkdGgpLCAwLjUgKiAob3B0aW9ucy5oZWlnaHQgLSBzY2FsZWRIZWlnaHQpLCBzY2FsZWRXaWR0aCwgc2NhbGVkSGVpZ2h0KTtcbiAgfVxufVxuXG5TcHJpdGVDb21wb25lbnQucHJvdG90eXBlLndpZHRoID0gZnVuY3Rpb24gc3ByaXRlV2lkdGgodmFsdWUpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdGhpcy5idWZmZXIud2lkdGg7XG4gIH1cblxuICB0aGlzLmJ1ZmZlci53aWR0aCA9IHZhbHVlO1xuXG4gIHRoaXMuY29udGV4dC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cblNwcml0ZUNvbXBvbmVudC5wcm90b3R5cGUuaGVpZ2h0ID0gZnVuY3Rpb24gc3ByaXRlSGVpZ2h0KHZhbHVlKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyLmhlaWdodDtcbiAgfVxuXG4gIHRoaXMuYnVmZmVyLmhlaWdodCA9IHZhbHVlO1xuXG4gIHRoaXMuY29udGV4dC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3ByaXRlQ29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQXRsYXNDb21wb25lbnQsIFNwcml0ZUNvbXBvbmVudDtcblxuQXRsYXNDb21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvYXRsYXMtY29tcG9uZW50Jyk7XG5TcHJpdGVDb21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvc3ByaXRlLWNvbXBvbmVudCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG51Y2xlYXIubW9kdWxlKCdnYW1lLnJlbmRlcmluZycsIFsnZ2FtZS50cmFuc2Zvcm0nXSlcbiAgLmNvbXBvbmVudCgnYXRsYXMnLCBmdW5jdGlvbiAoZSwga2V5KSB7XG4gICAgcmV0dXJuIG5ldyBBdGxhc0NvbXBvbmVudChrZXkpO1xuICB9KVxuICAuY29tcG9uZW50KCdzcHJpdGUnLCBmdW5jdGlvbiAoZSwgb3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgU3ByaXRlQ29tcG9uZW50KGUsIG9wdGlvbnMpO1xuICB9KVxuICAuc3lzdGVtKCdyZW5kZXJlcicsIFtcbiAgICAnc3ByaXRlIGZyb20gZ2FtZS5yZW5kZXJpbmcnLFxuICAgICdwb3NpdGlvbiBmcm9tIGdhbWUudHJhbnNmb3JtJ1xuICBdLCByZXF1aXJlKCcuL3N5c3RlbXMvcmVuZGVyZXItc3lzdGVtJykpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5udWNsZWFyLmV2ZW50cy5vbignc3lzdGVtOmJlZm9yZTpyZW5kZXJlciBmcm9tIGdhbWUucmVuZGVyaW5nJywgZnVuY3Rpb24gKCkge1xuICB2YXIgY29udGV4dDtcblxuICBjb250ZXh0ID0gbnVjbGVhci5zeXN0ZW0uY29udGV4dCgpO1xuXG4gIGNvbnRleHQuZGVzdHNbMF0uY2xlYXJSZWN0KDAsIDAsIGNvbnRleHQuV0lEVEgsIGNvbnRleHQuSEVJR0hUKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHJlbmRlcmVyU3lzdGVtKGUsIGNvbXBvbmVudHMsIGNvbnRleHQpIHtcbiAgdmFyIHNwcml0ZSwgcG9zaXRpb24sIGRlc3QsIHdpZHRoLCBoZWlnaHQ7XG5cbiAgc3ByaXRlID0gY29tcG9uZW50cy5zcHJpdGU7XG4gIHBvc2l0aW9uID0gY29tcG9uZW50cy5wb3NpdGlvbjtcblxuICBkZXN0ID0gY29udGV4dC5kZXN0c1tzcHJpdGUuZGVzdF07XG5cbiAgd2lkdGggPSBzcHJpdGUud2lkdGgoKTtcbiAgaGVpZ2h0ID0gc3ByaXRlLmhlaWdodCgpO1xuXG4gIGRlc3QuZHJhd0ltYWdlKHNwcml0ZS5idWZmZXIsIHBvc2l0aW9uLnggLSB3aWR0aCAqIDAuNSwgcG9zaXRpb24ueSAtIGhlaWdodCAqIDAuNSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBSaWdpZGJvZHlDb21wb25lbnQob3B0aW9ucykge1xuICB0aGlzLl9tYXNzID0gb3B0aW9ucy5tYXNzIHx8IDE7XG5cbiAgdGhpcy5pbnZlcnNlTWFzcyA9IDEgLyB0aGlzLl9tYXNzO1xuICB0aGlzLmZyaWN0aW9uID0gb3B0aW9ucy5mcmljdGlvbiB8fMKgMDtcbn1cblxuUmlnaWRib2R5Q29tcG9uZW50LnByb3RvdHlwZS5tYXNzID0gZnVuY3Rpb24gcmlnaWRib2R5Q29tcG9uZW50TWFzcyh2YWx1ZSkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB0aGlzLl9tYXNzO1xuICB9XG5cbiAgdGhpcy5fbWFzcyA9IHZhbHVlO1xuICB0aGlzLmludmVyc2VNYXNzID0gMSAvIHZhbHVlO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSaWdpZGJvZHlDb21wb25lbnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBSaWdpZGJvZHlDb21wb25lbnQsIHZlYzI7XG5cblJpZ2lkYm9keUNvbXBvbmVudCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9yaWdpZGJvZHktY29tcG9uZW50Jyk7XG52ZWMyID0gcmVxdWlyZSgnLi92ZWMyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gbnVjbGVhci5tb2R1bGUoJ2dhbWUudHJhbnNmb3JtJywgW10pXG4gIC5jb21wb25lbnQoJ3Bvc2l0aW9uJywgZnVuY3Rpb24gKGUsIHgsIHkpIHtcbiAgICByZXR1cm4gdmVjMih4LCB5KTtcbiAgfSlcbiAgLmNvbXBvbmVudCgndmVsb2NpdHknLCBmdW5jdGlvbiAoZSwgeCwgeSkge1xuICAgIHJldHVybiB2ZWMyKHgsIHkpO1xuICB9KVxuICAuY29tcG9uZW50KCdyaWdpZGJvZHknLCBmdW5jdGlvbiAoZSwgb3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgUmlnaWRib2R5Q29tcG9uZW50KG9wdGlvbnMpO1xuICB9KVxuICAuc3lzdGVtKCdraW5lbWF0aWMnLCBbXG4gICAgJ3Bvc2l0aW9uIGZyb20gZ2FtZS50cmFuc2Zvcm0nLFxuICAgICd2ZWxvY2l0eSBmcm9tIGdhbWUudHJhbnNmb3JtJyxcbiAgICAncmlnaWRib2R5IGZyb20gZ2FtZS50cmFuc2Zvcm0nLFxuICBdLCByZXF1aXJlKCcuL3N5c3RlbXMva2luZW1hdGljLXN5c3RlbScpKTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBraW5lbWF0aWNTeXN0ZW0oZSwgY29tcG9uZW50cywgY29udGV4dCwgZHQpIHtcbiAgdmFyIGZyaWN0aW9uO1xuXG4gIGZyaWN0aW9uID0gY29tcG9uZW50cy5yaWdpZGJvZHkuZnJpY3Rpb247XG5cbiAgY29tcG9uZW50cy5wb3NpdGlvbi54ICs9IGNvbXBvbmVudHMudmVsb2NpdHkueCAqIGR0O1xuICBjb21wb25lbnRzLnBvc2l0aW9uLnkgKz0gY29tcG9uZW50cy52ZWxvY2l0eS55ICogZHQ7XG5cbiAgY29tcG9uZW50cy52ZWxvY2l0eS54ICo9IGZyaWN0aW9uO1xuICBjb21wb25lbnRzLnZlbG9jaXR5LnkgKj0gZnJpY3Rpb247XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHZlYzIoeCwgeSkge1xuICByZXR1cm4ge3g6IHggfHwgMCwgeTogeSB8fCAwfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZXJvO1xuXG5oZXJvID0gbnVjbGVhci5lbnRpdHkuY3JlYXRlKCk7XG5cbm51Y2xlYXIuY29tcG9uZW50KCdwb3NpdGlvbicpLmFkZChoZXJvLCAyNTAsIDI1MCk7XG5cbm51Y2xlYXIuY29tcG9uZW50KCdhdGxhcycpLmFkZChoZXJvLCAnaGVybycpO1xuXG5udWNsZWFyLmNvbXBvbmVudCgnc3ByaXRlJykuYWRkKGhlcm8sIHtcbiAgc2NhbGU6IDQsXG4gIHdpZHRoOiA2NCxcbiAgaGVpZ2h0OiAxMjBcbn0pO1xuXG5udWNsZWFyLmNvbXBvbmVudCgnYW5pbWF0aW9ucycpLmFkZChoZXJvLCAnd2Fsa2xlZnQnLCBbXG4gICdpZGxlYmFjaycsXG4gICdpZGxlZmFjZScsXG4gICdpZGxlbGVmdCcsXG4gICdpZGxlcmlnaHQnLFxuICAnd2Fsa2JhY2snLFxuICAnd2Fsa2ZhY2UnLFxuICAnd2Fsa2xlZnQnLFxuICAnd2Fsa3JpZ2h0J1xuXSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjb250ZXh0O1xuXG5jb250ZXh0ID0gbnVjbGVhci5zeXN0ZW0uY29udGV4dCgpO1xuXG5jb250ZXh0LmRlc3RzID0gW1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NyZWVuJykuZ2V0Q29udGV4dCgnMmQnKVxuXTtcblxuY29udGV4dC5XSURUSCA9IGNvbnRleHQuZGVzdHNbMF0uY2FudmFzLndpZHRoO1xuY29udGV4dC5IRUlHSFQgPSBjb250ZXh0LmRlc3RzWzBdLmNhbnZhcy5oZWlnaHQ7XG5cbmNvbnRleHQubGlnaHRzID0gbnVjbGVhci5zeXN0ZW0oJ2xpZ2h0aW5nJykucXVlcnkuZW50aXRpZXM7XG5cbmNvbnRleHQuY29sbGlkZXJzID0gbnVjbGVhci5xdWVyeShbXG4gICdjb2xsaWRlciBmcm9tIGdhbWUuY29sbGlzaW9ucycsXG4gICdwb3NpdGlvbiBmcm9tIGdhbWUudHJhbnNmb3JtJyxcbiAgJ3JpZ2lkYm9keSBmcm9tIGdhbWUudHJhbnNmb3JtJ1xuXS5qb2luKCcgJykpLmVudGl0aWVzO1xuIl19
;