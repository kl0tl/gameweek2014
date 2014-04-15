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
},{"/Users/kl0tl/dev/gameweek2014/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":1}],"game":[function(require,module,exports){
module.exports=require('HPsMKw');
},{}],"HPsMKw":[function(require,module,exports){
'use strict';

var AssetsLoader, ImagesLoader, JsonLoader;

AssetsLoader = require('./loaders').AssetsLoader;
ImagesLoader = require('./loaders').ImagesLoader;
JsonLoader = require('./loaders').JsonLoader;

exports.loader = new AssetsLoader('/assets')
  .when(/\.(?:png|jpg)$/, new ImagesLoader())
  .when(/\.json$/, new JsonLoader());

},{"./loaders":9}],5:[function(require,module,exports){
'use strict';

var game, transform, rendering, animations;

game = require('game');

transform = require('./nuclear_modules/game.transform');
rendering = require('./nuclear_modules/game.rendering');
animations = require('./nuclear_modules/game.animations');

game.loader.load([
    'atlases/prinny.atlas.png',
    'atlases/prinny.atlas.json',
    'animations/prinny/prinny@dancing.json'
  ])
  .done(function () {
    var prinny;

    nuclear.import([transform, rendering, animations]);

    console.log('modules loaded!');

    prinny = nuclear.entity.create();

    nuclear.component('sprite').add(prinny, 50, 50);
    nuclear.component('atlas').add(prinny, 'prinny');
    nuclear.component('animations').add(prinny, {
      target: 'prinny',
      animations: ['dancing'],
      defaultAnimation: 'dancing'
    });

    nuclear.system.context = {
      dests: [
        document.getElementById('screen').getContext('2d')
      ]
    };

    window.requestAnimationFrame(function loop() {
      window.requestAnimationFrame(loop);
      nuclear.system.run();
    });
  })
  .progress(console.log.bind(console, 'bundle progress'));

},{"./nuclear_modules/game.animations":12,"./nuclear_modules/game.rendering":16,"./nuclear_modules/game.transform":19,"game":"HPsMKw"}],6:[function(require,module,exports){
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

var loader, path;

loader = require('game').loader;
path = require('path');

function AnimationsComponent(options) {
  var i, length, key, data;

  this.animations = Object.create(null);

  length = options.animations.length;

  for (i = 0; i < length; i += 1) {
    key = options.animations[i];
    data = loader.get(path.join('/assets', 'animations', options.target, options.target + '@' + key + '.json'));

    this.animations[key] = data;
  }

  this.defaultAnimation = options.defaultAnimation || 'idle';

  this.currentAnimation = this.defaultAnimation;
  this.currentFrame = 0;

  this.loop = Boolean(options && options.loop);

  this.timeElapsedSinceLastFrame = 0;
}

module.exports = AnimationsComponent;

},{"game":"HPsMKw","path":2}],12:[function(require,module,exports){
'use strict';

var AnimationsComponent;

AnimationsComponent = require('./components/animations-component');

module.exports = nuclear.module('game.animations', ['game.rendering'])
  .component('animations', function (e, key) {
    return new AnimationsComponent(key);
  })
  .system('animate', [
    'sprite from game.rendering',
    'atlas from game.rendering',
    'animations from game.animations'
  ], require('./systems/animate-system'));

},{"./components/animations-component":11,"./systems/animate-system":13}],13:[function(require,module,exports){
'use strict';

module.exports = function animateSystem(e, components, context, dt) {
  var atlas, sprite, animations, currentAnimation, frame;

  atlas = components.atlas;
  sprite = components.sprite;
  animations = components.animations;

  currentAnimation = animations.animations[animations.currentAnimation];

  animations.timeElapsedSinceLastFrame += dt;

  if (animations.timeElapsedSinceLastFrame > currentAnimation.interval) {
    animations.currentFrame += 1;
    animations.timeElapsedSinceLastFrame -= currentAnimation.interval;

    if (animations.currentFrame > currentAnimation.frames.length) {
      animations.currentFrame = 0;

      if (!animations.loop) {
        animations.currentAnimation = currentAnimation = animations.defaultAnimation;
      }
    }

    frame = atlas.sprites[currentAnimation.frames[animations.currentFrame]].frame;

    sprite.context.drawImage(atlas.source, frame.x, frame.y, frame.w, frame.h, 0, 0, sprite.width(), sprite.height());
  }
};

},{}],14:[function(require,module,exports){
'use strict';

var path, loader;

path = require('path');
loader = require('game').loader;

function AtlasComponent(key) {
  this.source = loader.get(path.join('/assets', 'atlases', key + '.atlas.png'));
  this.sprites = loader.get(path.join('/assets', 'atlases', key + '.atlas.json'));
}

module.exports = AtlasComponent;

},{"game":"HPsMKw","path":2}],15:[function(require,module,exports){
'use strict';

var loader;

loader = require('game').loader;

function SpriteComponent(width, height, dest) {
  this.buffer = document.createElement('canvas');
  this.context = this.buffer.getContext('2d');

  this.dest = dest || 0;

  this.buffer.width = width;
  this.buffer.height = height;
}

SpriteComponent.prototype.width = function spriteWidth(value) {
  if (arguments.length === 0) {
    return this.buffer.width;
  }

  this.buffer.width = value;

  return this;
};

SpriteComponent.prototype.height = function spriteHeight(value) {
  if (arguments.length === 0) {
    return this.buffer.height;
  }

  this.buffer.height = value;

  return this;
};

module.exports = SpriteComponent;

},{"game":"HPsMKw"}],16:[function(require,module,exports){
'use strict';

var AtlasComponent, SpriteComponent;

AtlasComponent = require('./components/atlas-component');
SpriteComponent = require('./components/sprite-component');

module.exports = nuclear.module('game.rendering', [])
  .component('atlas', function (e, key) {
    return new AtlasComponent(key);
  })
  .component('sprite', function (e, key) {
    return new SpriteComponent(key);
  })
  .system('renderer', [
    'sprite from game.rendering',
    'position from game.transform'
  ], require('./systems/renderer-system'));

},{"./components/atlas-component":14,"./components/sprite-component":15,"./systems/renderer-system":17}],17:[function(require,module,exports){
'use strict';

module.exports = function rendererSystem(e, components, context) {
  var sprite, position, dest, width, height;

  sprite = components.sprite;
  position = components.position;

  dest = context.dests[sprite.dest];

  width = sprite.width();
  height = sprite.height();

  dest.drawImage(sprite.buffer, position.x - width * 0.5, position.y - height * 0.5, width, height);
};

},{}],18:[function(require,module,exports){
'use strict';

function PositionComponent(x, y) {
  this.x = x;
  this.y = y;
}

module.exports = PositionComponent;

},{}],19:[function(require,module,exports){
'use strict';

var PositionComponent;

PositionComponent = require('./components/position-component');

module.exports = nuclear.module('game.transform', [])
  .component('position', function (e, x, y) {
    return new PositionComponent(x, y);
  });

},{"./components/position-component":18}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9nYW1ld2VlazIwMTQvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luc2VydC1tb2R1bGUtZ2xvYmFscy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9nYW1ld2VlazIwMTQvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3BhdGgtYnJvd3NlcmlmeS9pbmRleC5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvZ2FtZXdlZWsyMDE0L3NyYy9nYW1lLmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9nYW1ld2VlazIwMTQvc3JjL2luZGV4LmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9nYW1ld2VlazIwMTQvc3JjL2xvYWRlcnMvYXNzZXRzLWJ1bmRsZS5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvZ2FtZXdlZWsyMDE0L3NyYy9sb2FkZXJzL2Fzc2V0cy1sb2FkZXIuanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvbG9hZGVycy9pbWFnZXMtbG9hZGVyLmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9nYW1ld2VlazIwMTQvc3JjL2xvYWRlcnMvaW5kZXguanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvbG9hZGVycy9qc29uLWxvYWRlci5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS5hbmltYXRpb25zL2NvbXBvbmVudHMvYW5pbWF0aW9ucy1jb21wb25lbnQuanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUuYW5pbWF0aW9ucy9pbmRleC5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS5hbmltYXRpb25zL3N5c3RlbXMvYW5pbWF0ZS1zeXN0ZW0uanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUucmVuZGVyaW5nL2NvbXBvbmVudHMvYXRsYXMtY29tcG9uZW50LmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9nYW1ld2VlazIwMTQvc3JjL251Y2xlYXJfbW9kdWxlcy9nYW1lLnJlbmRlcmluZy9jb21wb25lbnRzL3Nwcml0ZS1jb21wb25lbnQuanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUucmVuZGVyaW5nL2luZGV4LmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9nYW1ld2VlazIwMTQvc3JjL251Y2xlYXJfbW9kdWxlcy9nYW1lLnJlbmRlcmluZy9zeXN0ZW1zL3JlbmRlcmVyLXN5c3RlbS5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS50cmFuc2Zvcm0vY29tcG9uZW50cy9wb3NpdGlvbi1jb21wb25lbnQuanMiLCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUudHJhbnNmb3JtL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNsT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsIihmdW5jdGlvbiAocHJvY2Vzcyl7XG4vLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gcmVzb2x2ZXMgLiBhbmQgLi4gZWxlbWVudHMgaW4gYSBwYXRoIGFycmF5IHdpdGggZGlyZWN0b3J5IG5hbWVzIHRoZXJlXG4vLyBtdXN0IGJlIG5vIHNsYXNoZXMsIGVtcHR5IGVsZW1lbnRzLCBvciBkZXZpY2UgbmFtZXMgKGM6XFwpIGluIHRoZSBhcnJheVxuLy8gKHNvIGFsc28gbm8gbGVhZGluZyBhbmQgdHJhaWxpbmcgc2xhc2hlcyAtIGl0IGRvZXMgbm90IGRpc3Rpbmd1aXNoXG4vLyByZWxhdGl2ZSBhbmQgYWJzb2x1dGUgcGF0aHMpXG5mdW5jdGlvbiBub3JtYWxpemVBcnJheShwYXJ0cywgYWxsb3dBYm92ZVJvb3QpIHtcbiAgLy8gaWYgdGhlIHBhdGggdHJpZXMgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIGB1cGAgZW5kcyB1cCA+IDBcbiAgdmFyIHVwID0gMDtcbiAgZm9yICh2YXIgaSA9IHBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgdmFyIGxhc3QgPSBwYXJ0c1tpXTtcbiAgICBpZiAobGFzdCA9PT0gJy4nKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgfSBlbHNlIGlmIChsYXN0ID09PSAnLi4nKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgICB1cCsrO1xuICAgIH0gZWxzZSBpZiAodXApIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwLS07XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgdGhlIHBhdGggaXMgYWxsb3dlZCB0byBnbyBhYm92ZSB0aGUgcm9vdCwgcmVzdG9yZSBsZWFkaW5nIC4uc1xuICBpZiAoYWxsb3dBYm92ZVJvb3QpIHtcbiAgICBmb3IgKDsgdXAtLTsgdXApIHtcbiAgICAgIHBhcnRzLnVuc2hpZnQoJy4uJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBhcnRzO1xufVxuXG4vLyBTcGxpdCBhIGZpbGVuYW1lIGludG8gW3Jvb3QsIGRpciwgYmFzZW5hbWUsIGV4dF0sIHVuaXggdmVyc2lvblxuLy8gJ3Jvb3QnIGlzIGp1c3QgYSBzbGFzaCwgb3Igbm90aGluZy5cbnZhciBzcGxpdFBhdGhSZSA9XG4gICAgL14oXFwvP3wpKFtcXHNcXFNdKj8pKCg/OlxcLnsxLDJ9fFteXFwvXSs/fCkoXFwuW14uXFwvXSp8KSkoPzpbXFwvXSopJC87XG52YXIgc3BsaXRQYXRoID0gZnVuY3Rpb24oZmlsZW5hbWUpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aFJlLmV4ZWMoZmlsZW5hbWUpLnNsaWNlKDEpO1xufTtcblxuLy8gcGF0aC5yZXNvbHZlKFtmcm9tIC4uLl0sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZXNvbHZlID0gZnVuY3Rpb24oKSB7XG4gIHZhciByZXNvbHZlZFBhdGggPSAnJyxcbiAgICAgIHJlc29sdmVkQWJzb2x1dGUgPSBmYWxzZTtcblxuICBmb3IgKHZhciBpID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gLTEgJiYgIXJlc29sdmVkQWJzb2x1dGU7IGktLSkge1xuICAgIHZhciBwYXRoID0gKGkgPj0gMCkgPyBhcmd1bWVudHNbaV0gOiBwcm9jZXNzLmN3ZCgpO1xuXG4gICAgLy8gU2tpcCBlbXB0eSBhbmQgaW52YWxpZCBlbnRyaWVzXG4gICAgaWYgKHR5cGVvZiBwYXRoICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIHRvIHBhdGgucmVzb2x2ZSBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9IGVsc2UgaWYgKCFwYXRoKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICByZXNvbHZlZFBhdGggPSBwYXRoICsgJy8nICsgcmVzb2x2ZWRQYXRoO1xuICAgIHJlc29sdmVkQWJzb2x1dGUgPSBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xuICB9XG5cbiAgLy8gQXQgdGhpcyBwb2ludCB0aGUgcGF0aCBzaG91bGQgYmUgcmVzb2x2ZWQgdG8gYSBmdWxsIGFic29sdXRlIHBhdGgsIGJ1dFxuICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aHMgdG8gYmUgc2FmZSAobWlnaHQgaGFwcGVuIHdoZW4gcHJvY2Vzcy5jd2QoKSBmYWlscylcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcmVzb2x2ZWRQYXRoID0gbm9ybWFsaXplQXJyYXkoZmlsdGVyKHJlc29sdmVkUGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFyZXNvbHZlZEFic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgcmV0dXJuICgocmVzb2x2ZWRBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHJlc29sdmVkUGF0aCkgfHwgJy4nO1xufTtcblxuLy8gcGF0aC5ub3JtYWxpemUocGF0aClcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMubm9ybWFsaXplID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgaXNBYnNvbHV0ZSA9IGV4cG9ydHMuaXNBYnNvbHV0ZShwYXRoKSxcbiAgICAgIHRyYWlsaW5nU2xhc2ggPSBzdWJzdHIocGF0aCwgLTEpID09PSAnLyc7XG5cbiAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gIHBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFpc0Fic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgaWYgKCFwYXRoICYmICFpc0Fic29sdXRlKSB7XG4gICAgcGF0aCA9ICcuJztcbiAgfVxuICBpZiAocGF0aCAmJiB0cmFpbGluZ1NsYXNoKSB7XG4gICAgcGF0aCArPSAnLyc7XG4gIH1cblxuICByZXR1cm4gKGlzQWJzb2x1dGUgPyAnLycgOiAnJykgKyBwYXRoO1xufTtcblxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5pc0Fic29sdXRlID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbn07XG5cbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMuam9pbiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcGF0aHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICByZXR1cm4gZXhwb3J0cy5ub3JtYWxpemUoZmlsdGVyKHBhdGhzLCBmdW5jdGlvbihwLCBpbmRleCkge1xuICAgIGlmICh0eXBlb2YgcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyB0byBwYXRoLmpvaW4gbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9KS5qb2luKCcvJykpO1xufTtcblxuXG4vLyBwYXRoLnJlbGF0aXZlKGZyb20sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZWxhdGl2ZSA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gIGZyb20gPSBleHBvcnRzLnJlc29sdmUoZnJvbSkuc3Vic3RyKDEpO1xuICB0byA9IGV4cG9ydHMucmVzb2x2ZSh0bykuc3Vic3RyKDEpO1xuXG4gIGZ1bmN0aW9uIHRyaW0oYXJyKSB7XG4gICAgdmFyIHN0YXJ0ID0gMDtcbiAgICBmb3IgKDsgc3RhcnQgPCBhcnIubGVuZ3RoOyBzdGFydCsrKSB7XG4gICAgICBpZiAoYXJyW3N0YXJ0XSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIHZhciBlbmQgPSBhcnIubGVuZ3RoIC0gMTtcbiAgICBmb3IgKDsgZW5kID49IDA7IGVuZC0tKSB7XG4gICAgICBpZiAoYXJyW2VuZF0gIT09ICcnKSBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoc3RhcnQgPiBlbmQpIHJldHVybiBbXTtcbiAgICByZXR1cm4gYXJyLnNsaWNlKHN0YXJ0LCBlbmQgLSBzdGFydCArIDEpO1xuICB9XG5cbiAgdmFyIGZyb21QYXJ0cyA9IHRyaW0oZnJvbS5zcGxpdCgnLycpKTtcbiAgdmFyIHRvUGFydHMgPSB0cmltKHRvLnNwbGl0KCcvJykpO1xuXG4gIHZhciBsZW5ndGggPSBNYXRoLm1pbihmcm9tUGFydHMubGVuZ3RoLCB0b1BhcnRzLmxlbmd0aCk7XG4gIHZhciBzYW1lUGFydHNMZW5ndGggPSBsZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZnJvbVBhcnRzW2ldICE9PSB0b1BhcnRzW2ldKSB7XG4gICAgICBzYW1lUGFydHNMZW5ndGggPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdmFyIG91dHB1dFBhcnRzID0gW107XG4gIGZvciAodmFyIGkgPSBzYW1lUGFydHNMZW5ndGg7IGkgPCBmcm9tUGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICBvdXRwdXRQYXJ0cy5wdXNoKCcuLicpO1xuICB9XG5cbiAgb3V0cHV0UGFydHMgPSBvdXRwdXRQYXJ0cy5jb25jYXQodG9QYXJ0cy5zbGljZShzYW1lUGFydHNMZW5ndGgpKTtcblxuICByZXR1cm4gb3V0cHV0UGFydHMuam9pbignLycpO1xufTtcblxuZXhwb3J0cy5zZXAgPSAnLyc7XG5leHBvcnRzLmRlbGltaXRlciA9ICc6JztcblxuZXhwb3J0cy5kaXJuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgcmVzdWx0ID0gc3BsaXRQYXRoKHBhdGgpLFxuICAgICAgcm9vdCA9IHJlc3VsdFswXSxcbiAgICAgIGRpciA9IHJlc3VsdFsxXTtcblxuICBpZiAoIXJvb3QgJiYgIWRpcikge1xuICAgIC8vIE5vIGRpcm5hbWUgd2hhdHNvZXZlclxuICAgIHJldHVybiAnLic7XG4gIH1cblxuICBpZiAoZGlyKSB7XG4gICAgLy8gSXQgaGFzIGEgZGlybmFtZSwgc3RyaXAgdHJhaWxpbmcgc2xhc2hcbiAgICBkaXIgPSBkaXIuc3Vic3RyKDAsIGRpci5sZW5ndGggLSAxKTtcbiAgfVxuXG4gIHJldHVybiByb290ICsgZGlyO1xufTtcblxuXG5leHBvcnRzLmJhc2VuYW1lID0gZnVuY3Rpb24ocGF0aCwgZXh0KSB7XG4gIHZhciBmID0gc3BsaXRQYXRoKHBhdGgpWzJdO1xuICAvLyBUT0RPOiBtYWtlIHRoaXMgY29tcGFyaXNvbiBjYXNlLWluc2Vuc2l0aXZlIG9uIHdpbmRvd3M/XG4gIGlmIChleHQgJiYgZi5zdWJzdHIoLTEgKiBleHQubGVuZ3RoKSA9PT0gZXh0KSB7XG4gICAgZiA9IGYuc3Vic3RyKDAsIGYubGVuZ3RoIC0gZXh0Lmxlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIGY7XG59O1xuXG5cbmV4cG9ydHMuZXh0bmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aChwYXRoKVszXTtcbn07XG5cbmZ1bmN0aW9uIGZpbHRlciAoeHMsIGYpIHtcbiAgICBpZiAoeHMuZmlsdGVyKSByZXR1cm4geHMuZmlsdGVyKGYpO1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChmKHhzW2ldLCBpLCB4cykpIHJlcy5wdXNoKHhzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn1cblxuLy8gU3RyaW5nLnByb3RvdHlwZS5zdWJzdHIgLSBuZWdhdGl2ZSBpbmRleCBkb24ndCB3b3JrIGluIElFOFxudmFyIHN1YnN0ciA9ICdhYicuc3Vic3RyKC0xKSA9PT0gJ2InXG4gICAgPyBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuKSB7IHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW4pIH1cbiAgICA6IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW4pIHtcbiAgICAgICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSBzdHIubGVuZ3RoICsgc3RhcnQ7XG4gICAgICAgIHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW4pO1xuICAgIH1cbjtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIvVXNlcnMva2wwdGwvZGV2L2dhbWV3ZWVrMjAxNC9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaW5zZXJ0LW1vZHVsZS1nbG9iYWxzL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanNcIikpIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQXNzZXRzTG9hZGVyLCBJbWFnZXNMb2FkZXIsIEpzb25Mb2FkZXI7XG5cbkFzc2V0c0xvYWRlciA9IHJlcXVpcmUoJy4vbG9hZGVycycpLkFzc2V0c0xvYWRlcjtcbkltYWdlc0xvYWRlciA9IHJlcXVpcmUoJy4vbG9hZGVycycpLkltYWdlc0xvYWRlcjtcbkpzb25Mb2FkZXIgPSByZXF1aXJlKCcuL2xvYWRlcnMnKS5Kc29uTG9hZGVyO1xuXG5leHBvcnRzLmxvYWRlciA9IG5ldyBBc3NldHNMb2FkZXIoJy9hc3NldHMnKVxuICAud2hlbigvXFwuKD86cG5nfGpwZykkLywgbmV3IEltYWdlc0xvYWRlcigpKVxuICAud2hlbigvXFwuanNvbiQvLCBuZXcgSnNvbkxvYWRlcigpKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdhbWUsIHRyYW5zZm9ybSwgcmVuZGVyaW5nLCBhbmltYXRpb25zO1xuXG5nYW1lID0gcmVxdWlyZSgnZ2FtZScpO1xuXG50cmFuc2Zvcm0gPSByZXF1aXJlKCcuL251Y2xlYXJfbW9kdWxlcy9nYW1lLnRyYW5zZm9ybScpO1xucmVuZGVyaW5nID0gcmVxdWlyZSgnLi9udWNsZWFyX21vZHVsZXMvZ2FtZS5yZW5kZXJpbmcnKTtcbmFuaW1hdGlvbnMgPSByZXF1aXJlKCcuL251Y2xlYXJfbW9kdWxlcy9nYW1lLmFuaW1hdGlvbnMnKTtcblxuZ2FtZS5sb2FkZXIubG9hZChbXG4gICAgJ2F0bGFzZXMvcHJpbm55LmF0bGFzLnBuZycsXG4gICAgJ2F0bGFzZXMvcHJpbm55LmF0bGFzLmpzb24nLFxuICAgICdhbmltYXRpb25zL3ByaW5ueS9wcmlubnlAZGFuY2luZy5qc29uJ1xuICBdKVxuICAuZG9uZShmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHByaW5ueTtcblxuICAgIG51Y2xlYXIuaW1wb3J0KFt0cmFuc2Zvcm0sIHJlbmRlcmluZywgYW5pbWF0aW9uc10pO1xuXG4gICAgY29uc29sZS5sb2coJ21vZHVsZXMgbG9hZGVkIScpO1xuXG4gICAgcHJpbm55ID0gbnVjbGVhci5lbnRpdHkuY3JlYXRlKCk7XG5cbiAgICBudWNsZWFyLmNvbXBvbmVudCgnc3ByaXRlJykuYWRkKHByaW5ueSwgNTAsIDUwKTtcbiAgICBudWNsZWFyLmNvbXBvbmVudCgnYXRsYXMnKS5hZGQocHJpbm55LCAncHJpbm55Jyk7XG4gICAgbnVjbGVhci5jb21wb25lbnQoJ2FuaW1hdGlvbnMnKS5hZGQocHJpbm55LCB7XG4gICAgICB0YXJnZXQ6ICdwcmlubnknLFxuICAgICAgYW5pbWF0aW9uczogWydkYW5jaW5nJ10sXG4gICAgICBkZWZhdWx0QW5pbWF0aW9uOiAnZGFuY2luZydcbiAgICB9KTtcblxuICAgIG51Y2xlYXIuc3lzdGVtLmNvbnRleHQgPSB7XG4gICAgICBkZXN0czogW1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NyZWVuJykuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgXVxuICAgIH07XG5cbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uIGxvb3AoKSB7XG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xuICAgICAgbnVjbGVhci5zeXN0ZW0ucnVuKCk7XG4gICAgfSk7XG4gIH0pXG4gIC5wcm9ncmVzcyhjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUsICdidW5kbGUgcHJvZ3Jlc3MnKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEFzc2V0c0J1bmRsZShjYWxsYmFjaykge1xuICB2YXIgYnVuZGxlO1xuXG4gIGJ1bmRsZSA9IHRoaXM7XG5cbiAgYnVuZGxlLmFzc2V0cyA9IFtdO1xuXG4gIGJ1bmRsZS5fbG9hZExpc3RlbmVycyA9IFtdO1xuICBidW5kbGUuX2Vycm9yTGlzdGVuZXJzID0gW107XG4gIGJ1bmRsZS5fcHJvZ3Jlc3NMaXN0ZW5lcnMgPSBbXTtcblxuICBjYWxsYmFjay5jYWxsKHRoaXMsXG4gICAgdHJpZ2dlcihidW5kbGUuX2xvYWRMaXN0ZW5lcnMpLFxuICAgIHRyaWdnZXIoYnVuZGxlLl9lcnJvckxpc3RlbmVycyksXG4gICAgdHJpZ2dlcihidW5kbGUuX3Byb2dyZXNzTGlzdGVuZXJzKVxuICApO1xuXG4gIGZ1bmN0aW9uIHRyaWdnZXIoY2FsbGJhY2tzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBpLCBjYWxsYmFjaztcblxuICAgICAgZm9yIChpID0gMDsgKGNhbGxiYWNrID0gY2FsbGJhY2tzW2ldKTsgaSArPSAxKSB7XG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KGJ1bmRsZSwgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59XG5cbkFzc2V0c0J1bmRsZS5wcm90b3R5cGUuZG9uZSA9IGZ1bmN0aW9uIGFzc2V0c0J1bmRsZURvbmUoY2FsbGJhY2spIHtcbiAgdGhpcy5fbG9hZExpc3RlbmVycy5wdXNoKGNhbGxiYWNrKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Bc3NldHNCdW5kbGUucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24gYXNzZXRzQnVuZGxlRXJyb3IoZXJyYmFjaykge1xuICB0aGlzLl9lcnJvckxpc3RlbmVycy5wdXNoKGVycmJhY2spO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkFzc2V0c0J1bmRsZS5wcm90b3R5cGUucHJvZ3Jlc3MgPSBmdW5jdGlvbiBhc3NldHNCdW5kbGVQcm9ncmVzcyhwcm9ncmVzcykge1xuICB0aGlzLl9wcm9ncmVzc0xpc3RlbmVycy5wdXNoKHByb2dyZXNzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFzc2V0c0J1bmRsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEFzc2V0c0J1bmRsZSwgcGF0aDtcblxuQXNzZXRzQnVuZGxlID0gcmVxdWlyZSgnLi9hc3NldHMtYnVuZGxlJyk7XG5wYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5mdW5jdGlvbiBBc3NldHNMb2FkZXIocGF0aCkge1xuICB0aGlzLmJhc2VQYXRoID0gcGF0aCB8fCAnLyc7XG4gIHRoaXMuY2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB0aGlzLnJ1bGVzID0gW107XG59XG5cbkFzc2V0c0xvYWRlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gYXNzZXRzTG9hZGVyR2V0KHVybCkge1xuICByZXR1cm4gdGhpcy5jYWNoZVt1cmxdO1xufTtcblxuQXNzZXRzTG9hZGVyLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiBhc3NldHNMb2FkZXJIYXModXJsKSB7XG4gIHJldHVybiB1cmwgaW4gdGhpcy5jYWNoZTtcbn07XG5cbkFzc2V0c0xvYWRlci5wcm90b3R5cGUud2hlbiA9IGZ1bmN0aW9uIGFzc2V0c0xvYWRlcldoZW4ocGF0dGVybiwgbG9hZGVyKSB7XG4gIHRoaXMucnVsZXMucHVzaCh7cGF0dGVybjogcGF0dGVybiwgbG9hZGVyOiBsb2FkZXJ9KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Bc3NldHNMb2FkZXIucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbiBhc3NldHNMb2FkZXJMb2FkKHVybHMpIHtcbiAgdmFyIGxvYWRlcjtcblxuICBsb2FkZXIgPSB0aGlzO1xuXG4gIHJldHVybiBuZXcgQXNzZXRzQnVuZGxlKGZ1bmN0aW9uIChkb25lLCBlcnJvciwgcHJvZ3Jlc3MpIHtcbiAgICB2YXIgYnVuZGxlLCBsb2FkZWRBc3NldHNDb3VudCwgdG90YWxBc3NldHNDb3VudCwgaSwgdXJsLCBhc3NldCwgaiwgcnVsZTtcblxuICAgIGJ1bmRsZSA9IHRoaXM7XG5cbiAgICBsb2FkZWRBc3NldHNDb3VudCA9IDA7XG4gICAgdG90YWxBc3NldHNDb3VudCA9IHVybHMubGVuZ3RoO1xuXG4gICAgaWYgKCF0b3RhbEFzc2V0c0NvdW50KSBkb25lKCk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgdG90YWxBc3NldHNDb3VudDsgaSArPSAxKSB7XG4gICAgICB1cmwgPSB1cmxzW2ldO1xuICAgICAgYXNzZXQgPSBsb2FkZXIuZ2V0KHVybCk7XG5cbiAgICAgIGlmIChhc3NldCkge1xuICAgICAgICBvbmxvYWRlZCh1cmwsIGkpLmNhbGwoYXNzZXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChqID0gMDsgKHJ1bGUgPSBsb2FkZXIucnVsZXNbal0pOyBqICs9IDEpIHtcbiAgICAgICAgICBpZiAocnVsZS5wYXR0ZXJuLnRlc3QodXJsKSkge1xuICAgICAgICAgICAgcnVsZS5sb2FkZXIubG9hZChwYXRoLmpvaW4obG9hZGVyLmJhc2VQYXRoLCB1cmwpLCBvbmxvYWRlZCh1cmwsIGkpLCBlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25sb2FkZWQoa2V5LCBpbmRleCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGFzc2V0O1xuXG4gICAgICAgIGFzc2V0ID0gdGhpcztcblxuICAgICAgICBsb2FkZXIuY2FjaGVba2V5XSA9IGFzc2V0O1xuICAgICAgICBidW5kbGUuYXNzZXRzW2luZGV4XSA9IGFzc2V0O1xuXG4gICAgICAgIGxvYWRlZEFzc2V0c0NvdW50ICs9IDE7XG5cbiAgICAgICAgaWYgKHByb2dyZXNzKSB7XG4gICAgICAgICAgcHJvZ3Jlc3ModGhpcywgbG9hZGVkQXNzZXRzQ291bnQgLyB0b3RhbEFzc2V0c0NvdW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsb2FkZWRBc3NldHNDb3VudCA9PT0gdG90YWxBc3NldHNDb3VudCkge1xuICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBc3NldHNMb2FkZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEltYWdlc0xvYWRlcigpIHt9XG5cbkltYWdlc0xvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uIGltYWdlc0xvYWRlckxvYWQodXJsLCBjYWxsYmFjaywgZXJyYmFjaykge1xuICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuICBpbWFnZS5vbmxvYWQgPSBjYWxsYmFjaztcbiAgaW1hZ2Uub25lcnJvciA9IGVycmJhY2s7XG5cbiAgaW1hZ2Uuc3JjID0gdXJsO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZXNMb2FkZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuQXNzZXRzTG9hZGVyID0gcmVxdWlyZSgnLi9hc3NldHMtbG9hZGVyJyk7XG5leHBvcnRzLkltYWdlc0xvYWRlciA9IHJlcXVpcmUoJy4vaW1hZ2VzLWxvYWRlcicpO1xuZXhwb3J0cy5Kc29uTG9hZGVyID0gcmVxdWlyZSgnLi9qc29uLWxvYWRlcicpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBKc29uTG9hZGVyKCkge31cblxuSnNvbkxvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uIGpzb25Mb2FkZXJMb2FkKHVybCwgY2FsbGJhY2ssIGVycmJhY2spIHtcbiAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xuXG4gIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHhoci5yZWFkeVN0YXRlIDwgNCkgcmV0dXJuO1xuXG4gICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY2FsbGJhY2suY2FsbChKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpKTtcbiAgICAgIH0gY2F0Y2ggKG9PKSB7XG4gICAgICAgIGVycmJhY2sob08pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlcnJiYWNrKHhocik7XG4gICAgfVxuICB9O1xuXG4gIHhoci5zZW5kKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEpzb25Mb2FkZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBsb2FkZXIsIHBhdGg7XG5cbmxvYWRlciA9IHJlcXVpcmUoJ2dhbWUnKS5sb2FkZXI7XG5wYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5mdW5jdGlvbiBBbmltYXRpb25zQ29tcG9uZW50KG9wdGlvbnMpIHtcbiAgdmFyIGksIGxlbmd0aCwga2V5LCBkYXRhO1xuXG4gIHRoaXMuYW5pbWF0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgbGVuZ3RoID0gb3B0aW9ucy5hbmltYXRpb25zLmxlbmd0aDtcblxuICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICBrZXkgPSBvcHRpb25zLmFuaW1hdGlvbnNbaV07XG4gICAgZGF0YSA9IGxvYWRlci5nZXQocGF0aC5qb2luKCcvYXNzZXRzJywgJ2FuaW1hdGlvbnMnLCBvcHRpb25zLnRhcmdldCwgb3B0aW9ucy50YXJnZXQgKyAnQCcgKyBrZXkgKyAnLmpzb24nKSk7XG5cbiAgICB0aGlzLmFuaW1hdGlvbnNba2V5XSA9IGRhdGE7XG4gIH1cblxuICB0aGlzLmRlZmF1bHRBbmltYXRpb24gPSBvcHRpb25zLmRlZmF1bHRBbmltYXRpb24gfHwgJ2lkbGUnO1xuXG4gIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IHRoaXMuZGVmYXVsdEFuaW1hdGlvbjtcbiAgdGhpcy5jdXJyZW50RnJhbWUgPSAwO1xuXG4gIHRoaXMubG9vcCA9IEJvb2xlYW4ob3B0aW9ucyAmJiBvcHRpb25zLmxvb3ApO1xuXG4gIHRoaXMudGltZUVsYXBzZWRTaW5jZUxhc3RGcmFtZSA9IDA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQW5pbWF0aW9uc0NvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEFuaW1hdGlvbnNDb21wb25lbnQ7XG5cbkFuaW1hdGlvbnNDb21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvYW5pbWF0aW9ucy1jb21wb25lbnQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBudWNsZWFyLm1vZHVsZSgnZ2FtZS5hbmltYXRpb25zJywgWydnYW1lLnJlbmRlcmluZyddKVxuICAuY29tcG9uZW50KCdhbmltYXRpb25zJywgZnVuY3Rpb24gKGUsIGtleSkge1xuICAgIHJldHVybiBuZXcgQW5pbWF0aW9uc0NvbXBvbmVudChrZXkpO1xuICB9KVxuICAuc3lzdGVtKCdhbmltYXRlJywgW1xuICAgICdzcHJpdGUgZnJvbSBnYW1lLnJlbmRlcmluZycsXG4gICAgJ2F0bGFzIGZyb20gZ2FtZS5yZW5kZXJpbmcnLFxuICAgICdhbmltYXRpb25zIGZyb20gZ2FtZS5hbmltYXRpb25zJ1xuICBdLCByZXF1aXJlKCcuL3N5c3RlbXMvYW5pbWF0ZS1zeXN0ZW0nKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYW5pbWF0ZVN5c3RlbShlLCBjb21wb25lbnRzLCBjb250ZXh0LCBkdCkge1xuICB2YXIgYXRsYXMsIHNwcml0ZSwgYW5pbWF0aW9ucywgY3VycmVudEFuaW1hdGlvbiwgZnJhbWU7XG5cbiAgYXRsYXMgPSBjb21wb25lbnRzLmF0bGFzO1xuICBzcHJpdGUgPSBjb21wb25lbnRzLnNwcml0ZTtcbiAgYW5pbWF0aW9ucyA9IGNvbXBvbmVudHMuYW5pbWF0aW9ucztcblxuICBjdXJyZW50QW5pbWF0aW9uID0gYW5pbWF0aW9ucy5hbmltYXRpb25zW2FuaW1hdGlvbnMuY3VycmVudEFuaW1hdGlvbl07XG5cbiAgYW5pbWF0aW9ucy50aW1lRWxhcHNlZFNpbmNlTGFzdEZyYW1lICs9IGR0O1xuXG4gIGlmIChhbmltYXRpb25zLnRpbWVFbGFwc2VkU2luY2VMYXN0RnJhbWUgPiBjdXJyZW50QW5pbWF0aW9uLmludGVydmFsKSB7XG4gICAgYW5pbWF0aW9ucy5jdXJyZW50RnJhbWUgKz0gMTtcbiAgICBhbmltYXRpb25zLnRpbWVFbGFwc2VkU2luY2VMYXN0RnJhbWUgLT0gY3VycmVudEFuaW1hdGlvbi5pbnRlcnZhbDtcblxuICAgIGlmIChhbmltYXRpb25zLmN1cnJlbnRGcmFtZSA+IGN1cnJlbnRBbmltYXRpb24uZnJhbWVzLmxlbmd0aCkge1xuICAgICAgYW5pbWF0aW9ucy5jdXJyZW50RnJhbWUgPSAwO1xuXG4gICAgICBpZiAoIWFuaW1hdGlvbnMubG9vcCkge1xuICAgICAgICBhbmltYXRpb25zLmN1cnJlbnRBbmltYXRpb24gPSBjdXJyZW50QW5pbWF0aW9uID0gYW5pbWF0aW9ucy5kZWZhdWx0QW5pbWF0aW9uO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZyYW1lID0gYXRsYXMuc3ByaXRlc1tjdXJyZW50QW5pbWF0aW9uLmZyYW1lc1thbmltYXRpb25zLmN1cnJlbnRGcmFtZV1dLmZyYW1lO1xuXG4gICAgc3ByaXRlLmNvbnRleHQuZHJhd0ltYWdlKGF0bGFzLnNvdXJjZSwgZnJhbWUueCwgZnJhbWUueSwgZnJhbWUudywgZnJhbWUuaCwgMCwgMCwgc3ByaXRlLndpZHRoKCksIHNwcml0ZS5oZWlnaHQoKSk7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBwYXRoLCBsb2FkZXI7XG5cbnBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5sb2FkZXIgPSByZXF1aXJlKCdnYW1lJykubG9hZGVyO1xuXG5mdW5jdGlvbiBBdGxhc0NvbXBvbmVudChrZXkpIHtcbiAgdGhpcy5zb3VyY2UgPSBsb2FkZXIuZ2V0KHBhdGguam9pbignL2Fzc2V0cycsICdhdGxhc2VzJywga2V5ICsgJy5hdGxhcy5wbmcnKSk7XG4gIHRoaXMuc3ByaXRlcyA9IGxvYWRlci5nZXQocGF0aC5qb2luKCcvYXNzZXRzJywgJ2F0bGFzZXMnLCBrZXkgKyAnLmF0bGFzLmpzb24nKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXRsYXNDb21wb25lbnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBsb2FkZXI7XG5cbmxvYWRlciA9IHJlcXVpcmUoJ2dhbWUnKS5sb2FkZXI7XG5cbmZ1bmN0aW9uIFNwcml0ZUNvbXBvbmVudCh3aWR0aCwgaGVpZ2h0LCBkZXN0KSB7XG4gIHRoaXMuYnVmZmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIHRoaXMuY29udGV4dCA9IHRoaXMuYnVmZmVyLmdldENvbnRleHQoJzJkJyk7XG5cbiAgdGhpcy5kZXN0ID0gZGVzdCB8fCAwO1xuXG4gIHRoaXMuYnVmZmVyLndpZHRoID0gd2lkdGg7XG4gIHRoaXMuYnVmZmVyLmhlaWdodCA9IGhlaWdodDtcbn1cblxuU3ByaXRlQ29tcG9uZW50LnByb3RvdHlwZS53aWR0aCA9IGZ1bmN0aW9uIHNwcml0ZVdpZHRoKHZhbHVlKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyLndpZHRoO1xuICB9XG5cbiAgdGhpcy5idWZmZXIud2lkdGggPSB2YWx1ZTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cblNwcml0ZUNvbXBvbmVudC5wcm90b3R5cGUuaGVpZ2h0ID0gZnVuY3Rpb24gc3ByaXRlSGVpZ2h0KHZhbHVlKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyLmhlaWdodDtcbiAgfVxuXG4gIHRoaXMuYnVmZmVyLmhlaWdodCA9IHZhbHVlO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGVDb21wb25lbnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBBdGxhc0NvbXBvbmVudCwgU3ByaXRlQ29tcG9uZW50O1xuXG5BdGxhc0NvbXBvbmVudCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9hdGxhcy1jb21wb25lbnQnKTtcblNwcml0ZUNvbXBvbmVudCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9zcHJpdGUtY29tcG9uZW50Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gbnVjbGVhci5tb2R1bGUoJ2dhbWUucmVuZGVyaW5nJywgW10pXG4gIC5jb21wb25lbnQoJ2F0bGFzJywgZnVuY3Rpb24gKGUsIGtleSkge1xuICAgIHJldHVybiBuZXcgQXRsYXNDb21wb25lbnQoa2V5KTtcbiAgfSlcbiAgLmNvbXBvbmVudCgnc3ByaXRlJywgZnVuY3Rpb24gKGUsIGtleSkge1xuICAgIHJldHVybiBuZXcgU3ByaXRlQ29tcG9uZW50KGtleSk7XG4gIH0pXG4gIC5zeXN0ZW0oJ3JlbmRlcmVyJywgW1xuICAgICdzcHJpdGUgZnJvbSBnYW1lLnJlbmRlcmluZycsXG4gICAgJ3Bvc2l0aW9uIGZyb20gZ2FtZS50cmFuc2Zvcm0nXG4gIF0sIHJlcXVpcmUoJy4vc3lzdGVtcy9yZW5kZXJlci1zeXN0ZW0nKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmVuZGVyZXJTeXN0ZW0oZSwgY29tcG9uZW50cywgY29udGV4dCkge1xuICB2YXIgc3ByaXRlLCBwb3NpdGlvbiwgZGVzdCwgd2lkdGgsIGhlaWdodDtcblxuICBzcHJpdGUgPSBjb21wb25lbnRzLnNwcml0ZTtcbiAgcG9zaXRpb24gPSBjb21wb25lbnRzLnBvc2l0aW9uO1xuXG4gIGRlc3QgPSBjb250ZXh0LmRlc3RzW3Nwcml0ZS5kZXN0XTtcblxuICB3aWR0aCA9IHNwcml0ZS53aWR0aCgpO1xuICBoZWlnaHQgPSBzcHJpdGUuaGVpZ2h0KCk7XG5cbiAgZGVzdC5kcmF3SW1hZ2Uoc3ByaXRlLmJ1ZmZlciwgcG9zaXRpb24ueCAtIHdpZHRoICogMC41LCBwb3NpdGlvbi55IC0gaGVpZ2h0ICogMC41LCB3aWR0aCwgaGVpZ2h0KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFBvc2l0aW9uQ29tcG9uZW50KHgsIHkpIHtcbiAgdGhpcy54ID0geDtcbiAgdGhpcy55ID0geTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQb3NpdGlvbkNvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFBvc2l0aW9uQ29tcG9uZW50O1xuXG5Qb3NpdGlvbkNvbXBvbmVudCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9wb3NpdGlvbi1jb21wb25lbnQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBudWNsZWFyLm1vZHVsZSgnZ2FtZS50cmFuc2Zvcm0nLCBbXSlcbiAgLmNvbXBvbmVudCgncG9zaXRpb24nLCBmdW5jdGlvbiAoZSwgeCwgeSkge1xuICAgIHJldHVybiBuZXcgUG9zaXRpb25Db21wb25lbnQoeCwgeSk7XG4gIH0pO1xuIl19
;
