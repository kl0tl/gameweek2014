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

}).call(this,require("/Users/adriencarta/gameweek2014/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/Users/adriencarta/gameweek2014/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":1}],"game":[function(require,module,exports){
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
require('./nuclear_modules/game.inputs/');
require('./nuclear_modules/game.roguemap/');

nuclear.module('inputs').config('gamepad').FACE_1 = 'FIRE';
var entity = nuclear.entity.create();

nuclear.component('inputs').add(entity, {
  FIRE : function(entity, input){
    if(input !== 0){
      console.log(input);
    }
  },
  UP : function(entity, input){
    if(input !== 0){
      console.log(input);
    }
  }
});
var context = nuclear.system.context();

context.dests = [
  document.getElementById('bottom-buffer').getContext('2d'),
  document.getElementById('dynamic-buffer').getContext('2d'),
  document.getElementById('top-buffer').getContext('2d'),
  document.getElementById('main').getContext('2d'),
];

context.WIDTH = context.dests[2].canvas.width;
context.HEIGHT = context.dests[2].canvas.height;
game.loader.load([
    'atlases/prinny.atlas.png',
    'atlases/prinny.atlas.json',
    'animations/prinny/prinny@dancing.json',
    
    'atlases/stone.atlas.png',
    'atlases/stone.atlas.json'
  ])
  .error(function(error){
    throw error;
  })
  .done(function () {
    nuclear.import([transform, rendering, animations]);
    console.log('modules loaded!');
    nuclear.entity('map').create({
      mapData : {
        width : 40,
        height : 40,
        roomWidth : [3, 20],
        roomHeight : [3, 20]
      }
    });

    window.requestAnimationFrame(function loop() {
      window.requestAnimationFrame(loop);
      nuclear.system.run();
    });
  })
  .progress(console.log.bind(console, 'bundle progress'));

},{"./nuclear_modules/game.animations":12,"./nuclear_modules/game.inputs/":14,"./nuclear_modules/game.rendering":19,"./nuclear_modules/game.roguemap/":22,"./nuclear_modules/game.transform":27,"game":"HPsMKw"}],6:[function(require,module,exports){
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
    data = loader.get(path.join('animations', options.target, options.target + '@' + key + '.json'));

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
  .component('animations', function (e, key, animations) {
    return new AnimationsComponent(key, animations);
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
  var atlas, sprite, animations, currentAnimation, frame, width, height;

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

      if (!animations.loop) {
        animations.currentAnimation = animations.defaultAnimation;
        currentAnimation = animations.animations[animations.currentAnimation];
      }
    }

    frame = atlas.sprites.frames[currentAnimation.frames[animations.currentFrame]].frame;

    width = sprite.width();
    height = sprite.height();

    sprite.context.clearRect(0, 0, width, height);
    sprite.context.drawImage(atlas.source, frame.x, frame.y, frame.w, frame.h, 0, 0, width, height);
  }
};

},{}],14:[function(require,module,exports){
'use strict';
(function(nuclear, console){
    require('./lib/mousetrap.min');

    var inputs, Gamepad, Mousetrap;

    Gamepad = require('./lib/gamepad.min').Gamepad;
    Mousetrap = window.Mousetrap;

    inputs = nuclear.module('inputs', []);

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
    nuclear.import([inputs]);
})(window.nuclear, window.console);
},{"./lib/gamepad.min":15,"./lib/mousetrap.min":16}],15:[function(require,module,exports){
!function(a){"use strict";var b=function(){},c={getType:function(){return"null"},isSupported:function(){return!1},update:b},d=function(a){var c=this,d=window;this.update=b;this.requestAnimationFrame=a||d.requestAnimationFrame||d.webkitRequestAnimationFrame||d.mozRequestAnimationFrame;this.tickFunction=function(){c.update();c.startTicker()};this.startTicker=function(){c.requestAnimationFrame.apply(d,[c.tickFunction])}};d.prototype.start=function(a){this.update=a||b;this.startTicker()};var e=function(){};e.prototype.update=b;e.prototype.start=function(a){this.update=a||b};var f=function(a,b){this.listener=a;this.gamepadGetter=b;this.knownGamepads=[]};f.factory=function(a){var b=c,d=window&&window.navigator;d&&("undefined"!=typeof d.webkitGamepads?b=new f(a,function(){return d.webkitGamepads}):"undefined"!=typeof d.webkitGetGamepads&&(b=new f(a,function(){return d.webkitGetGamepads()})));return b};f.getType=function(){return"WebKit"},f.prototype.getType=function(){return f.getType()},f.prototype.isSupported=function(){return!0};f.prototype.update=function(){var a,b,c=this,d=Array.prototype.slice.call(this.gamepadGetter(),0);for(b=this.knownGamepads.length-1;b>=0;b--){a=this.knownGamepads[b];if(d.indexOf(a)<0){this.knownGamepads.splice(b,1);this.listener._disconnect(a)}}for(b=0;b<d.length;b++){a=d[b];if(a&&c.knownGamepads.indexOf(a)<0){c.knownGamepads.push(a);c.listener._connect(a)}}};var g=function(a){this.listener=a;window.addEventListener("gamepadconnected",function(b){a._connect(b.gamepad)});window.addEventListener("gamepaddisconnected",function(b){a._disconnect(b.gamepad)})};g.factory=function(a){var b=c;window&&"undefined"!=typeof window.addEventListener&&(b=new g(a));return b};g.getType=function(){return"Firefox"},g.prototype.getType=function(){return g.getType()},g.prototype.isSupported=function(){return!0};g.prototype.update=b;var h=function(a){this.updateStrategy=a||new d;this.gamepads=[];this.listeners={};this.platform=c;this.deadzone=.03;this.maximizeThreshold=.97};h.UpdateStrategies={AnimFrameUpdateStrategy:d,ManualUpdateStrategy:e};h.PlatformFactories=[f.factory,g.factory];h.Type={PLAYSTATION:"playstation",LOGITECH:"logitech",XBOX:"xbox",UNKNOWN:"unknown"};h.Event={CONNECTED:"connected",UNSUPPORTED:"unsupported",DISCONNECTED:"disconnected",TICK:"tick",BUTTON_DOWN:"button-down",BUTTON_UP:"button-up",AXIS_CHANGED:"axis-changed"};h.StandardButtons=["FACE_1","FACE_2","FACE_3","FACE_4","LEFT_TOP_SHOULDER","RIGHT_TOP_SHOULDER","LEFT_BOTTOM_SHOULDER","RIGHT_BOTTOM_SHOULDER","SELECT_BACK","START_FORWARD","LEFT_STICK","RIGHT_STICK","DPAD_UP","DPAD_DOWN","DPAD_LEFT","DPAD_RIGHT","HOME"];h.StandardAxes=["LEFT_STICK_X","LEFT_STICK_Y","RIGHT_STICK_X","RIGHT_STICK_Y"];var i=function(a,b,c){return b<a.length?a[b]:c+(b-a.length+1)};h.StandardMapping={env:{},buttons:{byButton:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]},axes:{byAxis:[0,1,2,3]}};h.Mappings=[{env:{platform:g.getType(),type:h.Type.PLAYSTATION},buttons:{byButton:[14,13,15,12,10,11,8,9,0,3,1,2,4,6,7,5,16]},axes:{byAxis:[0,1,2,3]}},{env:{platform:f.getType(),type:h.Type.LOGITECH},buttons:{byButton:[1,2,0,3,4,5,6,7,8,9,10,11,11,12,13,14,10]},axes:{byAxis:[0,1,2,3]}},{env:{platform:g.getType(),type:h.Type.LOGITECH},buttons:{byButton:[0,1,2,3,4,5,-1,-1,6,7,8,9,11,12,13,14,10],byAxis:[-1,-1,-1,-1,-1,-1,[2,0,1],[2,0,-1]]},axes:{byAxis:[0,1,3,4]}}];h.prototype.init=function(){var a=h.resolvePlatform(this),b=this;this.platform=a;this.updateStrategy.start(function(){b._update()});return a.isSupported()};h.prototype.bind=function(a,b){"undefined"==typeof this.listeners[a]&&(this.listeners[a]=[]);this.listeners[a].push(b);return this};h.prototype.unbind=function(a,b){if("undefined"!=typeof a){if("undefined"!=typeof b){if("undefined"==typeof this.listeners[a])return!1;for(var c=0;c<this.listeners[a].length;c++)if(this.listeners[a][c]===b){this.listeners[a].splice(c,1);return!0}return!1}this.listeners[a]=[]}else this.listeners={}};h.prototype.count=function(){return this.gamepads.length};h.prototype._fire=function(a,b){if("undefined"!=typeof this.listeners[a])for(var c=0;c<this.listeners[a].length;c++)this.listeners[a][c].apply(this.listeners[a][c],[b])};h.getNullPlatform=function(){return Object.create(c)};h.resolvePlatform=function(a){var b,d=c;for(b=0;!d.isSupported()&&b<h.PlatformFactories.length;b++)d=h.PlatformFactories[b](a);return d};h.prototype._connect=function(a){var b,c,d=this._resolveMapping(a);a.state={};a.lastState={};a.updater=[];b=d.buttons.byButton.length;for(c=0;b>c;c++)this._addButtonUpdater(a,d,c);b=d.axes.byAxis.length;for(c=0;b>c;c++)this._addAxisUpdater(a,d,c);this.gamepads[a.index]=a;this._fire(h.Event.CONNECTED,a)};h.prototype._addButtonUpdater=function(a,c,d){var e=b,f=i(h.StandardButtons,d,"EXTRA_BUTTON_"),g=this._createButtonGetter(a,c.buttons,d),j=this,k={gamepad:a,control:f};a.state[f]=0;a.lastState[f]=0;e=function(){var b=g(),c=a.lastState[f],d=b>.5,e=c>.5;a.state[f]=b;d&&!e?j._fire(h.Event.BUTTON_DOWN,Object.create(k)):!d&&e&&j._fire(h.Event.BUTTON_UP,Object.create(k));0!==b&&1!==b&&b!==c&&j._fireAxisChangedEvent(a,f,b);a.lastState[f]=b};a.updater.push(e)};h.prototype._addAxisUpdater=function(a,c,d){var e=b,f=i(h.StandardAxes,d,"EXTRA_AXIS_"),g=this._createAxisGetter(a,c.axes,d),j=this;a.state[f]=0;a.lastState[f]=0;e=function(){var b=g(),c=a.lastState[f];a.state[f]=b;b!==c&&j._fireAxisChangedEvent(a,f,b);a.lastState[f]=b};a.updater.push(e)};h.prototype._fireAxisChangedEvent=function(a,b,c){var d={gamepad:a,axis:b,value:c};this._fire(h.Event.AXIS_CHANGED,d)};h.prototype._createButtonGetter=function(){var a=function(){return 0},b=function(b,c,d){var e=a;d>c?e=function(){var a=d-c,e=b();e=(e-c)/a;return 0>e?0:e}:c>d&&(e=function(){var a=c-d,e=b();e=(e-d)/a;return e>1?0:1-e});return e},c=function(a){return"[object Array]"===Object.prototype.toString.call(a)};return function(d,e,f){var g,h=a,i=this;g=e.byButton[f];if(-1!==g)"number"==typeof g&&g<d.buttons.length&&(h=function(){return d.buttons[g]});else if(e.byAxis&&f<e.byAxis.length){g=e.byAxis[f];if(c(g)&&3==g.length&&g[0]<d.axes.length){h=function(){var a=d.axes[g[0]];return i._applyDeadzoneMaximize(a)};h=b(h,g[1],g[2])}}return h}}();h.prototype._createAxisGetter=function(){var a=function(){return 0};return function(b,c,d){var e,f=a,g=this;e=c.byAxis[d];-1!==e&&"number"==typeof e&&e<b.axes.length&&(f=function(){var a=b.axes[e];return g._applyDeadzoneMaximize(a)});return f}}();h.prototype._disconnect=function(a){var b,c=[];"undefined"!=typeof this.gamepads[a.index]&&delete this.gamepads[a.index];for(b=0;b<this.gamepads.length;b++)"undefined"!=typeof this.gamepads[b]&&(c[b]=this.gamepads[b]);this.gamepads=c;this._fire(h.Event.DISCONNECTED,a)};h.prototype._resolveControllerType=function(a){a=a.toLowerCase();return-1!==a.indexOf("playstation")?h.Type.PLAYSTATION:-1!==a.indexOf("logitech")||-1!==a.indexOf("wireless gamepad")?h.Type.LOGITECH:-1!==a.indexOf("xbox")||-1!==a.indexOf("360")?h.Type.XBOX:h.Type.UNKNOWN};h.prototype._resolveMapping=function(a){var b,c,d=h.Mappings,e=null,f={platform:this.platform.getType(),type:this._resolveControllerType(a.id)};for(b=0;!e&&b<d.length;b++){c=d[b];h.envMatchesFilter(c.env,f)&&(e=c)}return e||h.StandardMapping};h.envMatchesFilter=function(a,b){var c,d=!0;for(c in a)a[c]!==b[c]&&(d=!1);return d};h.prototype._update=function(){this.platform.update();this.gamepads.forEach(function(a){a&&a.updater.forEach(function(a){a()})});this.gamepads.length>0&&this._fire(h.Event.TICK,this.gamepads)},h.prototype._applyDeadzoneMaximize=function(a,b,c){b="undefined"!=typeof b?b:this.deadzone;c="undefined"!=typeof c?c:this.maximizeThreshold;a>=0?b>a?a=0:a>c&&(a=1):a>-b?a=0:-c>a&&(a=-1);return a};a.Gamepad=h}("undefined"!=typeof module&&module.exports||window);
},{}],16:[function(require,module,exports){
/* mousetrap v1.4.6 craig.is/killing/mice */
(function(J,r,f){function s(a,b,d){a.addEventListener?a.addEventListener(b,d,!1):a.attachEvent("on"+b,d)}function A(a){if("keypress"==a.type){var b=String.fromCharCode(a.which);a.shiftKey||(b=b.toLowerCase());return b}return h[a.which]?h[a.which]:B[a.which]?B[a.which]:String.fromCharCode(a.which).toLowerCase()}function t(a){a=a||{};var b=!1,d;for(d in n)a[d]?b=!0:n[d]=0;b||(u=!1)}function C(a,b,d,c,e,v){var g,k,f=[],h=d.type;if(!l[a])return[];"keyup"==h&&w(a)&&(b=[a]);for(g=0;g<l[a].length;++g)if(k=
l[a][g],!(!c&&k.seq&&n[k.seq]!=k.level||h!=k.action||("keypress"!=h||d.metaKey||d.ctrlKey)&&b.sort().join(",")!==k.modifiers.sort().join(","))){var m=c&&k.seq==c&&k.level==v;(!c&&k.combo==e||m)&&l[a].splice(g,1);f.push(k)}return f}function K(a){var b=[];a.shiftKey&&b.push("shift");a.altKey&&b.push("alt");a.ctrlKey&&b.push("ctrl");a.metaKey&&b.push("meta");return b}function x(a,b,d,c){m.stopCallback(b,b.target||b.srcElement,d,c)||!1!==a(b,d)||(b.preventDefault?b.preventDefault():b.returnValue=!1,b.stopPropagation?
b.stopPropagation():b.cancelBubble=!0)}function y(a){"number"!==typeof a.which&&(a.which=a.keyCode);var b=A(a);b&&("keyup"==a.type&&z===b?z=!1:m.handleKey(b,K(a),a))}function w(a){return"shift"==a||"ctrl"==a||"alt"==a||"meta"==a}function L(a,b,d,c){function e(b){return function(){u=b;++n[a];clearTimeout(D);D=setTimeout(t,1E3)}}function v(b){x(d,b,a);"keyup"!==c&&(z=A(b));setTimeout(t,10)}for(var g=n[a]=0;g<b.length;++g){var f=g+1===b.length?v:e(c||E(b[g+1]).action);F(b[g],f,c,a,g)}}function E(a,b){var d,
c,e,f=[];d="+"===a?["+"]:a.split("+");for(e=0;e<d.length;++e)c=d[e],G[c]&&(c=G[c]),b&&"keypress"!=b&&H[c]&&(c=H[c],f.push("shift")),w(c)&&f.push(c);d=c;e=b;if(!e){if(!p){p={};for(var g in h)95<g&&112>g||h.hasOwnProperty(g)&&(p[h[g]]=g)}e=p[d]?"keydown":"keypress"}"keypress"==e&&f.length&&(e="keydown");return{key:c,modifiers:f,action:e}}function F(a,b,d,c,e){q[a+":"+d]=b;a=a.replace(/\s+/g," ");var f=a.split(" ");1<f.length?L(a,f,b,d):(d=E(a,d),l[d.key]=l[d.key]||[],C(d.key,d.modifiers,{type:d.action},
c,a,e),l[d.key][c?"unshift":"push"]({callback:b,modifiers:d.modifiers,action:d.action,seq:c,level:e,combo:a}))}var h={8:"backspace",9:"tab",13:"enter",16:"shift",17:"ctrl",18:"alt",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"ins",46:"del",91:"meta",93:"meta",224:"meta"},B={106:"*",107:"+",109:"-",110:".",111:"/",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},H={"~":"`","!":"1",
"@":"2","#":"3",$:"4","%":"5","^":"6","&":"7","*":"8","(":"9",")":"0",_:"-","+":"=",":":";",'"':"'","<":",",">":".","?":"/","|":"\\"},G={option:"alt",command:"meta","return":"enter",escape:"esc",mod:/Mac|iPod|iPhone|iPad/.test(navigator.platform)?"meta":"ctrl"},p,l={},q={},n={},D,z=!1,I=!1,u=!1;for(f=1;20>f;++f)h[111+f]="f"+f;for(f=0;9>=f;++f)h[f+96]=f;s(r,"keypress",y);s(r,"keydown",y);s(r,"keyup",y);var m={bind:function(a,b,d){a=a instanceof Array?a:[a];for(var c=0;c<a.length;++c)F(a[c],b,d);return this},
unbind:function(a,b){return m.bind(a,function(){},b)},trigger:function(a,b){if(q[a+":"+b])q[a+":"+b]({},a);return this},reset:function(){l={};q={};return this},stopCallback:function(a,b){return-1<(" "+b.className+" ").indexOf(" mousetrap ")?!1:"INPUT"==b.tagName||"SELECT"==b.tagName||"TEXTAREA"==b.tagName||b.isContentEditable},handleKey:function(a,b,d){var c=C(a,b,d),e;b={};var f=0,g=!1;for(e=0;e<c.length;++e)c[e].seq&&(f=Math.max(f,c[e].level));for(e=0;e<c.length;++e)c[e].seq?c[e].level==f&&(g=!0,
b[c[e].seq]=1,x(c[e].callback,d,c[e].combo,c[e].seq)):g||x(c[e].callback,d,c[e].combo);c="keypress"==d.type&&I;d.type!=u||w(a)||c||t(b);I=g&&"keydown"==d.type}};J.Mousetrap=m;"function"===typeof define&&define.amd&&define(m)})(window,document);

},{}],17:[function(require,module,exports){
'use strict';

var path, loader;

path = require('path');
loader = require('game').loader;

function AtlasComponent(key) {
  this.source = loader.get(path.join('atlases', key + '.atlas.png'));
  this.sprites = loader.get(path.join('atlases', key + '.atlas.json'));
}

module.exports = AtlasComponent;

},{"game":"HPsMKw","path":2}],18:[function(require,module,exports){
'use strict';

var loader, path;

loader = require('game').loader;
path = require('path');

function SpriteComponent(width, height, center, dest) {
  this.buffer = document.createElement('canvas');
  this.context = this.buffer.getContext('2d');

  this.dest = dest || 0;
  if(center === undefined) center = true;
  this.center = center;
  this.buffer.width = width;
  this.buffer.height = height;
  this.context.imageSmoothingEnabled = false;
}

SpriteComponent.prototype.fromAtlas = function (atlas, frame, width, height) {
  var source, sprite;

  source = loader.get(path.join('atlases', atlas + '.atlas.png'));
  sprite = loader.get(path.join('atlases', atlas + '.atlas.json')).frames[frame];

  if(!width) width = sprite.frame.w;
  if(!height) height = sprite.frame.h;

  this.width(width);
  this.height(height);

  this.context.drawImage(source, sprite.frame.x, sprite.frame.y, sprite.frame.w, sprite.frame.h, 0, 0, width, height);
};

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

},{"game":"HPsMKw","path":2}],19:[function(require,module,exports){
'use strict';

var AtlasComponent, SpriteComponent;

AtlasComponent = require('./components/atlas-component');
SpriteComponent = require('./components/sprite-component');

module.exports = nuclear.module('game.rendering', ['game.transform'])
  .component('atlas', function (e, key) {
    return new AtlasComponent(key);
  })
  .component('sprite', function (e, width, height, center, dest) {
    return new SpriteComponent(width, height, center, dest);
  })
  .system('renderer', [
    'sprite from game.rendering',
    'position from game.transform'
  ], require('./systems/renderer-system'));

},{"./components/atlas-component":17,"./components/sprite-component":18,"./systems/renderer-system":20}],20:[function(require,module,exports){
'use strict';

nuclear.events.on('system:before:renderer from game.rendering', function () {
  var context;

  context = nuclear.system.context();

  context.dests[1].clearRect(0, 0, context.WIDTH, context.HEIGHT);
});

module.exports = function rendererSystem(e, components, context) {
  var sprite, position, dest, width, height, multiplicator;

  sprite = components.sprite;
  position = components.position;

  dest = context.dests[sprite.dest];

  width = sprite.width();
  height = sprite.height();
  multiplicator = (sprite.center) ? 0.5 : 1;

  dest.drawImage(sprite.buffer, position.x - width * multiplicator, position.y - height * multiplicator, width, height);
};

},{}],21:[function(require,module,exports){
'use strict';

module.exports = {
  templates : {
    'one' : {
      name : 'one',
      slots : [
        {
          type : 'crate',
          position : {
            x : 30,
            y : 20
          }
        },
        {
          type : 'crate',
          position : {
            x : 40,
            y : 20
          }
        },
        {
          type : 'crate',
          position : {
            x : 100,
            y : 10
          }
        }
      ],
      light : 'red',
      bundle : 'stone'
    },
    'two' : {
      name : 'two',
      slots : [
        {
          type : 'crate',
          position : {
            x : 30,
            y : 20
          }
        },
        {
          type : 'crate',
          position : {
            x : 40,
            y : 20
          }
        },
        {
          type : 'crate',
          position : {
            x : 100,
            y : 10
          }
        }
      ],
      light : 'red',
      bundle : 'stone'
    },
    'three' : {
      name : 'three',
      slots : [
        {
          type : 'crate',
          position : {
            x : 30,
            y : 20
          }
        },
        {
          type : 'crate',
          position : {
            x : 40,
            y : 20
          }
        },
        {
          type : 'crate',
          position : {
            x : 100,
            y : 10
          }
        }
      ],
      light : 'red',
      bundle : 'stone'
    },
    'four' : {
      name : 'four',
      slots : [
        {
          type : 'crate',
          position : {
            x : 30,
            y : 20
          }
        },
        {
          type : 'crate',
          position : {
            x : 40,
            y : 20
          }
        },
        {
          type : 'crate',
          position : {
            x : 100,
            y : 10
          }
        }
      ],
      light : 'red',
      bundle : 'stone'
    }
  },
  ranges : {
    'one' : [9, 14],
    'two' : [15, 25],
    'three' : [26, 40],
    'four' : [41, 200],
  },
  slots : {
    torch : {
      components : [
        'destructible',
        'collider',
        'sprite',
        'scale'
      ],
      data : {

      }
    },
    crate : {
      components : [
      ],
      data : {
        sprite : [0, 120, 120],
        atlas : [0, 'crate']
      }
    }
  },
  bundles : {
    'stone' : {
      'upperLeft' : [{
        index : 1,
      }],
      'upperLeft_top' : [{
        index : 0,
        h : 0.75,
        y : -119,
        dest : 2
      }],
      'downLeft' : [{
        index : 3,
      }],
      'downLeft_top' : [{
        index : 2,
        h : 0.75,
        y : -119,
        dest : 2
      }],
      'upperRight' : [{
        index : 5,
      }],
      'upperRight_top' : [{
        index : 4,
        h : 0.75,
        y : -119,
        dest : 2
      }],
      'downRight' : [{
        index : 7,
      }],
      'downRight_top' : [{
        index : 6,
        h : 0.75,
        y : -119,
        dest : 2
      }],
      'ground' : [{
        index : 8,
      },{
        index : 9,
      },{
        index : 10,
      }],
      'left' : [{
        index : 11,
      }],
      'right' : [{
        index : 12,
      }],
      'up' : [{
        index : 14,
      },{
        index : 16,
      },{
        index : 18,
      }],
      'up_top' : [{
        index : 13,
        h : 0.75,
        y : -119,
        dest : 2
      },{
        index : 15,
        h : 0.75,
        y : -119,
        dest : 2
      },{
        index : 17,
        h : 0.75,
        y : -119,
        dest : 2
      }],
      'down' : [{
        index : 19,
        y : - 119,
        h : 0.75,
        dest : 2
      }],
      'upperExternalRight' : [{
        index : 22,
        y : 30,
        h : 2,
        w : 0.4,
        x : -72
      }],
      'upperExternalLeft' : [{
        index : 21,
        y : 30,
        h : 2,
        w : 0.4
      }],
      'doubleSides' : [{
        index : 23,
      }],
      'downExternalLeft' : [{
        index : 26,
        y : - 15,
        h : 1.6,
        dest : 2
      }],
      'downExternalRight' : [{
        index : 24,
        y : - 15,
        h : 1.6,
        dest : 2
      }],
    }
  },
  resolution : 120,
  currentBundle : 'stone'
};
},{}],22:[function(require,module,exports){
'use strict';
var roguemap, Template, config, Map;

Template = require('./template');
Map = require('./map');
config = require('./config');

roguemap = nuclear.module('roguemap', []);

roguemap.component('map', function(entity, config){
  return new Map(config);
});

roguemap.component('rooms_manager', function(entity, data){
  return data;
}); 

roguemap.component('room', function(entity, data){
  var room = {};

  room.position = {
    x : data._x1,
    y : data._y1
  };

  room.width = data._x2-data._x1;
  room.height = data._y2-data._y1;
  room.size = room.width*room.height;

  return room;
});

roguemap.component('template', function(entity, data){
  var template = new Template(entity, data.position, data.width, data.height, data.config);

  return template;
});

roguemap.entity('room', function(entity, data){
  var room   = nuclear.component('room').add(entity, data),
      ranges = roguemap.config('ranges'),
      templates = roguemap.config('templates'),
      range, valid, u, template;
  for(var x in ranges){
    range = ranges[x];
    valid = false;
    for(u = range[0]; u < range[1]; u++){
      if(room.size === u){
        valid = true;
        template = templates[x];
        nuclear.component('template').add(entity, {
          config : template,
          width : room.width,
          height : room.height,
          position : room.position
        });
      }
    }
    if(valid){
      break;
    }
  }
});

roguemap.entity('map', function(entity, data){
  var digger = nuclear.component('map from roguemap').add(entity, data.mapData).map;
  console.log(digger);
  var rooms = [];
  for(var i = 0; i < digger._rooms.length; i++){
    var room = digger._rooms[i];
    rooms.push(roguemap.entity('room').create(room));
  }

  nuclear.component('rooms_manager from roguemap').add(entity, rooms);
});

roguemap.entity('tile', function(entity, data){
  var resolution = roguemap.config('resolution'),
      bundles = roguemap.config('bundles'),
      bundleName = roguemap.config('currentBundle'),
      currentBundle = bundles[bundleName];

  if(currentBundle && currentBundle[data.type]){
    var w, h, x, y, sprite;

    var frame = currentBundle[data.type][Math.round(Math.random()*(currentBundle[data.type].length-1))];
    var index = frame.index;
    w = frame.w || 1;
    h = frame.h || 1;
    x = frame.x || 0;
    y = frame.y || 0;

    nuclear.component('position from game.transform').add(entity, data.x*resolution+x, data.y*resolution+y);
    sprite = nuclear.component('sprite from game.rendering').add(entity, resolution*w, resolution*h, false, frame.dest);
    sprite.fromAtlas(bundleName, index, resolution*w, resolution*h);
    nuclear.system('renderer from game.rendering').once(entity);
    nuclear.component('sprite').remove(entity);
  }
});

roguemap.component('slot', function(entity, data){
  var i, component, configs;
  for(i = 0; i < data.components.length; i++){
    component = data.components[i];
    configs = data.data[component];

    component = nuclear.component(component);
    configs[0] = entity;
    component.add.apply(component, configs);
  }
  return data;
});

roguemap.entity('slot', function(entity, data){
  var slots = roguemap.config('slots'),
      slot  = slots[data.type],
      resolution = roguemap.config('resolution');

  slot = {
    components : slot.components,
    data : slot.data,
    position : data.position,
    bundle : data.bundle,
    template : data.template
  };

  nuclear.component('slot').add(entity, slot);
  nuclear.component('position').add(entity, data.position.x*resolution, data.position.y*resolution);
});

roguemap.config(config || {
  templates : {},
  ranges : {},
  slots : {},
  resolution : 20,
  bundles : {},
  currentBundle : 'stone'
});

nuclear.import([roguemap]);
module.exports = roguemap;

},{"./config":21,"./map":24,"./template":25}],23:[function(require,module,exports){
/*
	This is rot.js, the ROguelike Toolkit in JavaScript.
	Version 0.5~dev, generated on Mon Mar 31 15:10:41 CEST 2014.
*/
/**
 * @namespace Top-level ROT namespace
 */
window.ROT = {
	/**
	 * @returns {bool} Is rot.js supported by this browser?
	 */
	isSupported: function() {
		return !!(document.createElement("canvas").getContext && Function.prototype.bind);
	},

	/** Default with for display and map generators */
	DEFAULT_WIDTH: 80,
	/** Default height for display and map generators */
	DEFAULT_HEIGHT: 25,

	/** Directional constants. Ordering is important! */
	DIRS: {
		"4": [
			[ 0, -1],
			[ 1,  0],
			[ 0,  1],
			[-1,  0]
		],
		"8": [
			[ 0, -1],
			[ 1, -1],
			[ 1,  0],
			[ 1,  1],
			[ 0,  1],
			[-1,  1],
			[-1,  0],
			[-1, -1]
		],
		"6": [
			[-1, -1],
			[ 1, -1],
			[ 2,  0],
			[ 1,  1],
			[-1,  1],
			[-2,  0]
		]
	},

	/** Cancel key. */
	VK_CANCEL: 3, 
	/** Help key. */
	VK_HELP: 6, 
	/** Backspace key. */
	VK_BACK_SPACE: 8, 
	/** Tab key. */
	VK_TAB: 9, 
	/** 5 key on Numpad when NumLock is unlocked. Or on Mac, clear key which is positioned at NumLock key. */
	VK_CLEAR: 12, 
	/** Return/enter key on the main keyboard. */
	VK_RETURN: 13, 
	/** Reserved, but not used. */
	VK_ENTER: 14, 
	/** Shift key. */
	VK_SHIFT: 16, 
	/** Control key. */
	VK_CONTROL: 17, 
	/** Alt (Option on Mac) key. */
	VK_ALT: 18, 
	/** Pause key. */
	VK_PAUSE: 19, 
	/** Caps lock. */
	VK_CAPS_LOCK: 20, 
	/** Escape key. */
	VK_ESCAPE: 27, 
	/** Space bar. */
	VK_SPACE: 32, 
	/** Page Up key. */
	VK_PAGE_UP: 33, 
	/** Page Down key. */
	VK_PAGE_DOWN: 34, 
	/** End key. */
	VK_END: 35, 
	/** Home key. */
	VK_HOME: 36, 
	/** Left arrow. */
	VK_LEFT: 37, 
	/** Up arrow. */
	VK_UP: 38, 
	/** Right arrow. */
	VK_RIGHT: 39, 
	/** Down arrow. */
	VK_DOWN: 40, 
	/** Print Screen key. */
	VK_PRINTSCREEN: 44, 
	/** Ins(ert) key. */
	VK_INSERT: 45, 
	/** Del(ete) key. */
	VK_DELETE: 46, 
	/***/
	VK_0: 48,
	/***/
	VK_1: 49,
	/***/
	VK_2: 50,
	/***/
	VK_3: 51,
	/***/
	VK_4: 52,
	/***/
	VK_5: 53,
	/***/
	VK_6: 54,
	/***/
	VK_7: 55,
	/***/
	VK_8: 56,
	/***/
	VK_9: 57,
	/** Colon (:) key. Requires Gecko 15.0 */
	VK_COLON: 58, 
	/** Semicolon (;) key. */
	VK_SEMICOLON: 59, 
	/** Less-than (<) key. Requires Gecko 15.0 */
	VK_LESS_THAN: 60, 
	/** Equals (=) key. */
	VK_EQUALS: 61, 
	/** Greater-than (>) key. Requires Gecko 15.0 */
	VK_GREATER_THAN: 62, 
	/** Question mark (?) key. Requires Gecko 15.0 */
	VK_QUESTION_MARK: 63, 
	/** Atmark (@) key. Requires Gecko 15.0 */
	VK_AT: 64, 
	/***/
	VK_A: 65,
	/***/
	VK_B: 66,
	/***/
	VK_C: 67,
	/***/
	VK_D: 68,
	/***/
	VK_E: 69,
	/***/
	VK_F: 70,
	/***/
	VK_G: 71,
	/***/
	VK_H: 72,
	/***/
	VK_I: 73,
	/***/
	VK_J: 74,
	/***/
	VK_K: 75,
	/***/
	VK_L: 76,
	/***/
	VK_M: 77,
	/***/
	VK_N: 78,
	/***/
	VK_O: 79,
	/***/
	VK_P: 80,
	/***/
	VK_Q: 81,
	/***/
	VK_R: 82,
	/***/
	VK_S: 83,
	/***/
	VK_T: 84,
	/***/
	VK_U: 85,
	/***/
	VK_V: 86,
	/***/
	VK_W: 87,
	/***/
	VK_X: 88,
	/***/
	VK_Y: 89,
	/***/
	VK_Z: 90,
	/***/
	VK_CONTEXT_MENU: 93,
	/** 0 on the numeric keypad. */
	VK_NUMPAD0: 96, 
	/** 1 on the numeric keypad. */
	VK_NUMPAD1: 97, 
	/** 2 on the numeric keypad. */
	VK_NUMPAD2: 98, 
	/** 3 on the numeric keypad. */
	VK_NUMPAD3: 99, 
	/** 4 on the numeric keypad. */
	VK_NUMPAD4: 100, 
	/** 5 on the numeric keypad. */
	VK_NUMPAD5: 101, 
	/** 6 on the numeric keypad. */
	VK_NUMPAD6: 102, 
	/** 7 on the numeric keypad. */
	VK_NUMPAD7: 103, 
	/** 8 on the numeric keypad. */
	VK_NUMPAD8: 104, 
	/** 9 on the numeric keypad. */
	VK_NUMPAD9: 105, 
	/** * on the numeric keypad. */
	VK_MULTIPLY: 106,
	/** + on the numeric keypad. */
	VK_ADD: 107, 
	/***/
	VK_SEPARATOR: 108,
	/** - on the numeric keypad. */
	VK_SUBTRACT: 109, 
	/** Decimal point on the numeric keypad. */
	VK_DECIMAL: 110, 
	/** / on the numeric keypad. */
	VK_DIVIDE: 111, 
	/** F1 key. */
	VK_F1: 112, 
	/** F2 key. */
	VK_F2: 113, 
	/** F3 key. */
	VK_F3: 114, 
	/** F4 key. */
	VK_F4: 115, 
	/** F5 key. */
	VK_F5: 116, 
	/** F6 key. */
	VK_F6: 117, 
	/** F7 key. */
	VK_F7: 118, 
	/** F8 key. */
	VK_F8: 119, 
	/** F9 key. */
	VK_F9: 120, 
	/** F10 key. */
	VK_F10: 121, 
	/** F11 key. */
	VK_F11: 122, 
	/** F12 key. */
	VK_F12: 123, 
	/** F13 key. */
	VK_F13: 124, 
	/** F14 key. */
	VK_F14: 125, 
	/** F15 key. */
	VK_F15: 126, 
	/** F16 key. */
	VK_F16: 127, 
	/** F17 key. */
	VK_F17: 128, 
	/** F18 key. */
	VK_F18: 129, 
	/** F19 key. */
	VK_F19: 130, 
	/** F20 key. */
	VK_F20: 131, 
	/** F21 key. */
	VK_F21: 132, 
	/** F22 key. */
	VK_F22: 133, 
	/** F23 key. */
	VK_F23: 134, 
	/** F24 key. */
	VK_F24: 135, 
	/** Num Lock key. */
	VK_NUM_LOCK: 144, 
	/** Scroll Lock key. */
	VK_SCROLL_LOCK: 145, 
	/** Circumflex (^) key. Requires Gecko 15.0 */
	VK_CIRCUMFLEX: 160, 
	/** Exclamation (!) key. Requires Gecko 15.0 */
	VK_EXCLAMATION: 161, 
	/** Double quote () key. Requires Gecko 15.0 */
	VK_DOUBLE_QUOTE: 162, 
	/** Hash (#) key. Requires Gecko 15.0 */
	VK_HASH: 163, 
	/** Dollar sign ($) key. Requires Gecko 15.0 */
	VK_DOLLAR: 164, 
	/** Percent (%) key. Requires Gecko 15.0 */
	VK_PERCENT: 165, 
	/** Ampersand (&) key. Requires Gecko 15.0 */
	VK_AMPERSAND: 166, 
	/** Underscore (_) key. Requires Gecko 15.0 */
	VK_UNDERSCORE: 167, 
	/** Open parenthesis (() key. Requires Gecko 15.0 */
	VK_OPEN_PAREN: 168, 
	/** Close parenthesis ()) key. Requires Gecko 15.0 */
	VK_CLOSE_PAREN: 169, 
	/* Asterisk (*) key. Requires Gecko 15.0 */
	VK_ASTERISK: 170,
	/** Plus (+) key. Requires Gecko 15.0 */
	VK_PLUS: 171, 
	/** Pipe (|) key. Requires Gecko 15.0 */
	VK_PIPE: 172, 
	/** Hyphen-US/docs/Minus (-) key. Requires Gecko 15.0 */
	VK_HYPHEN_MINUS: 173, 
	/** Open curly bracket ({) key. Requires Gecko 15.0 */
	VK_OPEN_CURLY_BRACKET: 174, 
	/** Close curly bracket (}) key. Requires Gecko 15.0 */
	VK_CLOSE_CURLY_BRACKET: 175, 
	/** Tilde (~) key. Requires Gecko 15.0 */
	VK_TILDE: 176, 
	/** Comma (,) key. */
	VK_COMMA: 188, 
	/** Period (.) key. */
	VK_PERIOD: 190, 
	/** Slash (/) key. */
	VK_SLASH: 191, 
	/** Back tick (`) key. */
	VK_BACK_QUOTE: 192, 
	/** Open square bracket ([) key. */
	VK_OPEN_BRACKET: 219, 
	/** Back slash (\) key. */
	VK_BACK_SLASH: 220, 
	/** Close square bracket (]) key. */
	VK_CLOSE_BRACKET: 221, 
	/** Quote (''') key. */
	VK_QUOTE: 222, 
	/** Meta key on Linux, Command key on Mac. */
	VK_META: 224, 
	/** AltGr key on Linux. Requires Gecko 15.0 */
	VK_ALTGR: 225, 
	/** Windows logo key on Windows. Or Super or Hyper key on Linux. Requires Gecko 15.0 */
	VK_WIN: 91, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_KANA: 21, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_HANGUL: 21, 
	/** 英数 key on Japanese Mac keyboard. Requires Gecko 15.0 */
	VK_EISU: 22, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_JUNJA: 23, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_FINAL: 24, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_HANJA: 25, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_KANJI: 25, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_CONVERT: 28, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_NONCONVERT: 29, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_ACCEPT: 30, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_MODECHANGE: 31, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_SELECT: 41, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_PRINT: 42, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_EXECUTE: 43, 
	/** Linux support for this keycode was added in Gecko 4.0.	 */
	VK_SLEEP: 95 
};
/**
 * @namespace
 * Contains text tokenization and breaking routines
 */
ROT.Text = {
	RE_COLORS: /%([bc]){([^}]*)}/g,

	/* token types */
	TYPE_TEXT:		0,
	TYPE_NEWLINE:	1,
	TYPE_FG:		2,
	TYPE_BG:		3,

	/**
	 * Measure size of a resulting text block
	 */
	measure: function(str, maxWidth) {
		var result = {width:0, height:1};
		var tokens = this.tokenize(str, maxWidth);
		var lineWidth = 0;

		for (var i=0;i<tokens.length;i++) {
			var token = tokens[i];
			switch (token.type) {
				case this.TYPE_TEXT:
					lineWidth += token.value.length;
				break;

				case this.TYPE_NEWLINE:
					result.height++;
					result.width = Math.max(result.width, lineWidth);
					lineWidth = 0;
				break;
			}
		}
		result.width = Math.max(result.width, lineWidth);

		return result;
	},

	/**
	 * Convert string to a series of a formatting commands
	 */
	tokenize: function(str, maxWidth) {
		var result = [];

		/* first tokenization pass - split texts and color formatting commands */
		var offset = 0;
		str.replace(this.RE_COLORS, function(match, type, name, index) {
			/* string before */
			var part = str.substring(offset, index);
			if (part.length) {
				result.push({
					type: ROT.Text.TYPE_TEXT,
					value: part
				});
			}

			/* color command */
			result.push({
				type: (type == "c" ? ROT.Text.TYPE_FG : ROT.Text.TYPE_BG),
				value: name.trim()
			});

			offset = index + match.length;
			return "";
		});

		/* last remaining part */
		var part = str.substring(offset);
		if (part.length) {
			result.push({
				type: ROT.Text.TYPE_TEXT,
				value: part
			});
		}

		return this._breakLines(result, maxWidth);
	},

	/* insert line breaks into first-pass tokenized data */
	_breakLines: function(tokens, maxWidth) {
		if (!maxWidth) { maxWidth = Infinity; };

		var i = 0;
		var lineLength = 0;
		var lastTokenWithSpace = -1;

		while (i < tokens.length) { /* take all text tokens, remove space, apply linebreaks */
			var token = tokens[i];
			if (token.type == ROT.Text.TYPE_NEWLINE) { /* reset */
				lineLength = 0; 
				lastTokenWithSpace = -1;
			}
			if (token.type != ROT.Text.TYPE_TEXT) { /* skip non-text tokens */
				i++;
				continue; 
			}

			/* remove spaces at the beginning of line */
			while (lineLength == 0 && token.value.charAt(0) == " ") { token.value = token.value.substring(1); }

			/* forced newline? insert two new tokens after this one */
			var index = token.value.indexOf("\n");
			if (index != -1) { 
				token.value = this._breakInsideToken(tokens, i, index, true); 

				/* if there are spaces at the end, we must remove them (we do not want the line too long) */
				var arr = token.value.split("");
				while (arr[arr.length-1] == " ") { arr.pop(); }
				token.value = arr.join("");
			}

			/* token degenerated? */
			if (!token.value.length) {
				tokens.splice(i, 1);
				continue;
			}

			if (lineLength + token.value.length > maxWidth) { /* line too long, find a suitable breaking spot */

				/* is it possible to break within this token? */
				var index = -1;
				while (1) {
					var nextIndex = token.value.indexOf(" ", index+1);
					if (nextIndex == -1) { break; }
					if (lineLength + nextIndex > maxWidth) { break; }
					index = nextIndex;
				}

				if (index != -1) { /* break at space within this one */
					token.value = this._breakInsideToken(tokens, i, index, true);
				} else if (lastTokenWithSpace != -1) { /* is there a previous token where a break can occur? */
					var token = tokens[lastTokenWithSpace];
					var breakIndex = token.value.lastIndexOf(" ");
					token.value = this._breakInsideToken(tokens, lastTokenWithSpace, breakIndex, true);
					i = lastTokenWithSpace;
				} else { /* force break in this token */
					token.value = this._breakInsideToken(tokens, i, maxWidth-lineLength, false);
				}

			} else { /* line not long, continue */
				lineLength += token.value.length;
				if (token.value.indexOf(" ") != -1) { lastTokenWithSpace = i; }
			}
			
			i++; /* advance to next token */
		}


		tokens.push({type: ROT.Text.TYPE_NEWLINE}); /* insert fake newline to fix the last text line */

		/* remove trailing space from text tokens before newlines */
		var lastTextToken = null;
		for (var i=0;i<tokens.length;i++) {
			var token = tokens[i];
			switch (token.type) {
				case ROT.Text.TYPE_TEXT: lastTextToken = token; break;
				case ROT.Text.TYPE_NEWLINE: 
					if (lastTextToken) { /* remove trailing space */
						var arr = lastTextToken.value.split("");
						while (arr[arr.length-1] == " ") { arr.pop(); }
						lastTextToken.value = arr.join("");
					}
					lastTextToken = null;
				break;
			}
		}

		tokens.pop(); /* remove fake token */

		return tokens;
	},

	/**
	 * Create new tokens and insert them into the stream
	 * @param {object[]} tokens
	 * @param {int} tokenIndex Token being processed
	 * @param {int} breakIndex Index within current token's value
	 * @param {bool} removeBreakChar Do we want to remove the breaking character?
	 * @returns {string} remaining unbroken token value
	 */
	_breakInsideToken: function(tokens, tokenIndex, breakIndex, removeBreakChar) {
		var newBreakToken = {
			type: ROT.Text.TYPE_NEWLINE
		}
		var newTextToken = {
			type: ROT.Text.TYPE_TEXT,
			value: tokens[tokenIndex].value.substring(breakIndex + (removeBreakChar ? 1 : 0))
		}
		tokens.splice(tokenIndex+1, 0, newBreakToken, newTextToken);
		return tokens[tokenIndex].value.substring(0, breakIndex);
	}
}
/**
 * @returns {any} Randomly picked item, null when length=0
 */
Array.prototype.random = function() {
	if (!this.length) { return null; }
	return this[Math.floor(ROT.RNG.getUniform() * this.length)];
}

/**
 * @returns {array} New array with randomized items
 * FIXME destroys this!
 */
Array.prototype.randomize = function() {
	var result = [];
	while (this.length) {
		var index = this.indexOf(this.random());
		result.push(this.splice(index, 1)[0]);
	}
	return result;
}
/**
 * Always positive modulus
 * @param {int} n Modulus
 * @returns {int} this modulo n
 */
Number.prototype.mod = function(n) {
	return ((this%n)+n)%n;
}
/**
 * @returns {string} First letter capitalized
 */
String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.substring(1);
}

/** 
 * Left pad
 * @param {string} [character="0"]
 * @param {int} [count=2]
 */
String.prototype.lpad = function(character, count) {
	var ch = character || "0";
	var cnt = count || 2;

	var s = "";
	while (s.length < (cnt - this.length)) { s += ch; }
	s = s.substring(0, cnt-this.length);
	return s+this;
}

/** 
 * Right pad
 * @param {string} [character="0"]
 * @param {int} [count=2]
 */
String.prototype.rpad = function(character, count) {
	var ch = character || "0";
	var cnt = count || 2;

	var s = "";
	while (s.length < (cnt - this.length)) { s += ch; }
	s = s.substring(0, cnt-this.length);
	return this+s;
}

/**
 * Format a string in a flexible way. Scans for %s strings and replaces them with arguments. List of patterns is modifiable via String.format.map.
 * @param {string} template
 * @param {any} [argv]
 */
String.format = function(template) {
	var map = String.format.map;
	var args = Array.prototype.slice.call(arguments, 1);

	var replacer = function(match, group1, group2, index) {
		if (template.charAt(index-1) == "%") { return match.substring(1); }
		if (!args.length) { return match; }
		var obj = args[0];

		var group = group1 || group2;
		var parts = group.split(",");
		var name = parts.shift();
		var method = map[name.toLowerCase()];
		if (!method) { return match; }

		var obj = args.shift();
		var replaced = obj[method].apply(obj, parts);

		var first = name.charAt(0);
		if (first != first.toLowerCase()) { replaced = replaced.capitalize(); }

		return replaced;
	}
	return template.replace(/%(?:([a-z]+)|(?:{([^}]+)}))/gi, replacer);
}

String.format.map = {
	"s": "toString"
}

/**
 * Convenience shortcut to String.format(this)
 */
String.prototype.format = function() {
	var args = Array.prototype.slice.call(arguments);
	args.unshift(this);
	return String.format.apply(String, args);
}

if (!Object.create) {  
	/**
	 * ES5 Object.create
	 */
	Object.create = function(o) {  
		var tmp = function() {};
		tmp.prototype = o;
		return new tmp();
	};  
}  
/**
 * Sets prototype of this function to an instance of parent function
 * @param {function} parent
 */
Function.prototype.extend = function(parent) {
	this.prototype = Object.create(parent.prototype);
	this.prototype.constructor = this;
	return this;
}
window.requestAnimationFrame =
	window.requestAnimationFrame
	|| window.mozRequestAnimationFrame
	|| window.webkitRequestAnimationFrame
	|| window.oRequestAnimationFrame
	|| window.msRequestAnimationFrame
	|| function(cb) { return setTimeout(cb, 1000/60); };

window.cancelAnimationFrame =
	window.cancelAnimationFrame
	|| window.mozCancelAnimationFrame
	|| window.webkitCancelAnimationFrame
	|| window.oCancelAnimationFrame
	|| window.msCancelAnimationFrame
	|| function(id) { return clearTimeout(id); };
/**
 * @class Visual map display
 * @param {object} [options]
 * @param {int} [options.width=ROT.DEFAULT_WIDTH]
 * @param {int} [options.height=ROT.DEFAULT_HEIGHT]
 * @param {int} [options.fontSize=15]
 * @param {string} [options.fontFamily="monospace"]
 * @param {string} [options.fontStyle=""] bold/italic/none/both
 * @param {string} [options.fg="#ccc"]
 * @param {string} [options.bg="#000"]
 * @param {float} [options.spacing=1]
 * @param {float} [options.border=0]
 * @param {string} [options.layout="rect"]
 * @param {int} [options.tileWidth=32]
 * @param {int} [options.tileHeight=32]
 * @param {object} [options.tileMap={}]
 * @param {image} [options.tileSet=null]
 */
ROT.Display = function(options) {
	var canvas = document.createElement("canvas");
	this._context = canvas.getContext("2d");
	this._data = {};
	this._dirty = false; /* false = nothing, true = all, object = dirty cells */
	this._options = {};
	this._backend = null;
	
	var defaultOptions = {
		width: ROT.DEFAULT_WIDTH,
		height: ROT.DEFAULT_HEIGHT,
		layout: "rect",
		fontSize: 15,
		spacing: 1,
		border: 0,
		fontFamily: "monospace",
		fontStyle: "",
		fg: "#ccc",
		bg: "#000",
		tileWidth: 32,
		tileHeight: 32,
		tileMap: {},
		tileSet: null
	};
	for (var p in options) { defaultOptions[p] = options[p]; }
	this.setOptions(defaultOptions);
	this.DEBUG = this.DEBUG.bind(this);

	this._tick = this._tick.bind(this);
	requestAnimationFrame(this._tick);
}

/**
 * Debug helper, ideal as a map generator callback. Always bound to this.
 * @param {int} x
 * @param {int} y
 * @param {int} what
 */
ROT.Display.prototype.DEBUG = function(x, y, what) {
	var colors = [this._options.bg, this._options.fg];
	this.draw(x, y, null, null, colors[what % colors.length]);
}

/**
 * Clear the whole display (cover it with background color)
 */
ROT.Display.prototype.clear = function() {
	this._data = {};
	this._dirty = true;
}

/**
 * @see ROT.Display
 */
ROT.Display.prototype.setOptions = function(options) {
	for (var p in options) { this._options[p] = options[p]; }
	if (options.width || options.height || options.fontSize || options.fontFamily || options.spacing || options.layout) {
		if (options.layout) { 
			this._backend = new ROT.Display[options.layout.capitalize()](this._context);
		}

		var font = (this._options.fontStyle ? this._options.fontStyle + " " : "") + this._options.fontSize + "px " + this._options.fontFamily;
		this._context.font = font;
		this._backend.compute(this._options);
		this._context.font = font;
		this._context.textAlign = "center";
		this._context.textBaseline = "middle";
		this._dirty = true;
	}
	return this;
}

/**
 * Returns currently set options
 * @returns {object} Current options object 
 */
ROT.Display.prototype.getOptions = function() {
	return this._options;
}

/**
 * Returns the DOM node of this display
 * @returns {node} DOM node
 */
ROT.Display.prototype.getContainer = function() {
	return this._context.canvas;
}

/**
 * Compute the maximum width/height to fit into a set of given constraints
 * @param {int} availWidth Maximum allowed pixel width
 * @param {int} availHeight Maximum allowed pixel height
 * @returns {int[2]} cellWidth,cellHeight
 */
ROT.Display.prototype.computeSize = function(availWidth, availHeight) {
	return this._backend.computeSize(availWidth, availHeight, this._options);
}

/**
 * Compute the maximum font size to fit into a set of given constraints
 * @param {int} availWidth Maximum allowed pixel width
 * @param {int} availHeight Maximum allowed pixel height
 * @returns {int} fontSize
 */
ROT.Display.prototype.computeFontSize = function(availWidth, availHeight) {
	return this._backend.computeFontSize(availWidth, availHeight, this._options);
}

/**
 * Convert a DOM event (mouse or touch) to map coordinates. Uses first touch for multi-touch.
 * @param {Event} e event
 * @returns {int[2]} -1 for values outside of the canvas
 */
ROT.Display.prototype.eventToPosition = function(e) {
	if (e.touches) {
		var x = e.touches[0].clientX;
		var y = e.touches[0].clientY;
	} else {
		var x = e.clientX;
		var y = e.clientY;
	}

	var rect = this._context.canvas.getBoundingClientRect();
	x -= rect.left;
	y -= rect.top;
	
	if (x < 0 || y < 0 || x >= this._context.canvas.width || y >= this._context.canvas.height) { return [-1, -1]; }

	return this._backend.eventToPosition(x, y);
}

/**
 * @param {int} x
 * @param {int} y
 * @param {string || string[]} ch One or more chars (will be overlapping themselves)
 * @param {string} [fg] foreground color
 * @param {string} [bg] background color
 */
ROT.Display.prototype.draw = function(x, y, ch, fg, bg) {
	if (!fg) { fg = this._options.fg; }
	if (!bg) { bg = this._options.bg; }
	this._data[x+","+y] = [x, y, ch, fg, bg];
	
	if (this._dirty === true) { return; } /* will already redraw everything */
	if (!this._dirty) { this._dirty = {}; } /* first! */
	this._dirty[x+","+y] = true;
}

/**
 * Draws a text at given position. Optionally wraps at a maximum length. Currently does not work with hex layout.
 * @param {int} x
 * @param {int} y
 * @param {string} text May contain color/background format specifiers, %c{name}/%b{name}, both optional. %c{}/%b{} resets to default.
 * @param {int} [maxWidth] wrap at what width?
 * @returns {int} lines drawn
 */
ROT.Display.prototype.drawText = function(x, y, text, maxWidth) {
	var fg = null;
	var bg = null;
	var cx = x;
	var cy = y;
	var lines = 1;
	if (!maxWidth) { maxWidth = this._options.width-x; }

	var tokens = ROT.Text.tokenize(text, maxWidth);

	while (tokens.length) { /* interpret tokenized opcode stream */
		var token = tokens.shift();
		switch (token.type) {
			case ROT.Text.TYPE_TEXT:
				for (var i=0;i<token.value.length;i++) {
					this.draw(cx++, cy, token.value.charAt(i), fg, bg);
				}
			break;

			case ROT.Text.TYPE_FG:
				fg = token.value || null;
			break;

			case ROT.Text.TYPE_BG:
				bg = token.value || null;
			break;

			case ROT.Text.TYPE_NEWLINE:
				cx = x;
				cy++;
				lines++
			break;
		}
	}

	return lines;
}

/**
 * Timer tick: update dirty parts
 */
ROT.Display.prototype._tick = function() {
	requestAnimationFrame(this._tick);

	if (!this._dirty) { return; }

	if (this._dirty === true) { /* draw all */
		this._context.fillStyle = this._options.bg;
		this._context.fillRect(0, 0, this._context.canvas.width, this._context.canvas.height);

		for (var id in this._data) { /* redraw cached data */
			this._draw(id, false);
		}

	} else { /* draw only dirty */
		for (var key in this._dirty) {
			this._draw(key, true);
		}
	}

	this._dirty = false;
}

/**
 * @param {string} key What to draw
 * @param {bool} clearBefore Is it necessary to clean before?
 */
ROT.Display.prototype._draw = function(key, clearBefore) {
	var data = this._data[key];
	if (data[4] != this._options.bg) { clearBefore = true; }

	this._backend.draw(data, clearBefore);
}
/**
 * @class Abstract display backend module
 * @private
 */
ROT.Display.Backend = function(context) {
	this._context = context;
}

ROT.Display.Backend.prototype.compute = function(options) {
}

ROT.Display.Backend.prototype.draw = function(data, clearBefore) {
}

ROT.Display.Backend.prototype.computeSize = function(availWidth, availHeight) {
}

ROT.Display.Backend.prototype.computeFontSize = function(availWidth, availHeight) {
}

ROT.Display.Backend.prototype.eventToPosition = function(x, y) {
}
/**
 * @class Rectangular backend
 * @private
 */
ROT.Display.Rect = function(context) {
	ROT.Display.Backend.call(this, context);
	
	this._spacingX = 0;
	this._spacingY = 0;
	this._canvasCache = {};
	this._options = {};
}
ROT.Display.Rect.extend(ROT.Display.Backend);

ROT.Display.Rect.cache = false;

ROT.Display.Rect.prototype.compute = function(options) {
	this._canvasCache = {};
	this._options = options;

	var charWidth = Math.ceil(this._context.measureText("W").width);
	this._spacingX = Math.ceil(options.spacing * charWidth);
	this._spacingY = Math.ceil(options.spacing * options.fontSize);
	this._context.canvas.width = options.width * this._spacingX;
	this._context.canvas.height = options.height * this._spacingY;
}

ROT.Display.Rect.prototype.draw = function(data, clearBefore) {
	if (this.constructor.cache) {
		this._drawWithCache(data, clearBefore);
	} else {
		this._drawNoCache(data, clearBefore);
	}
}

ROT.Display.Rect.prototype._drawWithCache = function(data, clearBefore) {
	var x = data[0];
	var y = data[1];
	var ch = data[2];
	var fg = data[3];
	var bg = data[4];

	var hash = ""+ch+fg+bg;
	if (hash in this._canvasCache) {
		var canvas = this._canvasCache[hash];
	} else {
		var b = this._options.border;
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		canvas.width = this._spacingX;
		canvas.height = this._spacingY;
		ctx.fillStyle = bg;
		ctx.fillRect(b, b, canvas.width-b, canvas.height-b);
		
		if (ch) {
			ctx.fillStyle = fg;
			ctx.font = this._context.font;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			var chars = [].concat(ch);
			for (var i=0;i<chars.length;i++) {
				ctx.fillText(chars[i], this._spacingX/2, this._spacingY/2);
			}
		}
		this._canvasCache[hash] = canvas;
	}
	
	this._context.drawImage(canvas, x*this._spacingX, y*this._spacingY);
}

ROT.Display.Rect.prototype._drawNoCache = function(data, clearBefore) {
	var x = data[0];
	var y = data[1];
	var ch = data[2];
	var fg = data[3];
	var bg = data[4];

	if (clearBefore) { 
		var b = this._options.border;
		this._context.fillStyle = bg;
		this._context.fillRect(x*this._spacingX + b, y*this._spacingY + b, this._spacingX - b, this._spacingY - b);
	}
	
	if (!ch) { return; }

	this._context.fillStyle = fg;

	var chars = [].concat(ch);
	for (var i=0;i<chars.length;i++) {
		this._context.fillText(chars[i], (x+0.5) * this._spacingX, (y+0.5) * this._spacingY);
	}
}

ROT.Display.Rect.prototype.computeSize = function(availWidth, availHeight) {
	var width = Math.floor(availWidth / this._spacingX);
	var height = Math.floor(availHeight / this._spacingY);
	return [width, height];
}

ROT.Display.Rect.prototype.computeFontSize = function(availWidth, availHeight) {
	var boxWidth = Math.floor(availWidth / this._options.width);
	var boxHeight = Math.floor(availHeight / this._options.height);

	/* compute char ratio */
	var oldFont = this._context.font;
	this._context.font = "100px " + this._options.fontFamily;
	var width = Math.ceil(this._context.measureText("W").width);
	this._context.font = oldFont;
	var ratio = width / 100;
		
	var widthFraction = ratio * boxHeight / boxWidth;
	if (widthFraction > 1) { /* too wide with current aspect ratio */
		boxHeight = Math.floor(boxHeight / widthFraction);
	}
	return Math.floor(boxHeight / this._options.spacing);
}

ROT.Display.Rect.prototype.eventToPosition = function(x, y) {
	return [Math.floor(x/this._spacingX), Math.floor(y/this._spacingY)];
}
/**
 * @class Hexagonal backend
 * @private
 */
ROT.Display.Hex = function(context) {
	ROT.Display.Backend.call(this, context);

	this._spacingX = 0;
	this._spacingY = 0;
	this._hexSize = 0;
	this._options = {};
}
ROT.Display.Hex.extend(ROT.Display.Backend);

ROT.Display.Hex.prototype.compute = function(options) {
	this._options = options;

	var charWidth = Math.ceil(this._context.measureText("W").width);
	this._hexSize = Math.floor(options.spacing * (options.fontSize + charWidth/Math.sqrt(3)) / 2);
	this._spacingX = this._hexSize * Math.sqrt(3) / 2;
	this._spacingY = this._hexSize * 1.5;
	this._context.canvas.width = Math.ceil( (options.width + 1) * this._spacingX );
	this._context.canvas.height = Math.ceil( (options.height - 1) * this._spacingY + 2*this._hexSize );
}

ROT.Display.Hex.prototype.draw = function(data, clearBefore) {
	var x = data[0];
	var y = data[1];
	var ch = data[2];
	var fg = data[3];
	var bg = data[4];

	var cx = (x+1) * this._spacingX;
	var cy = y * this._spacingY + this._hexSize;

	if (clearBefore) { 
		this._context.fillStyle = bg;
		this._fill(cx, cy);
	}
	
	if (!ch) { return; }

	this._context.fillStyle = fg;

	var chars = [].concat(ch);
	for (var i=0;i<chars.length;i++) {
		this._context.fillText(chars[i], cx, cy);
	}
}


ROT.Display.Hex.prototype.computeSize = function(availWidth, availHeight) {
	var width = Math.floor(availWidth / this._spacingX) - 1;
	var height = Math.floor((availHeight - 2*this._hexSize) / this._spacingY + 1);
	return [width, height];
}

ROT.Display.Hex.prototype.computeFontSize = function(availWidth, availHeight) {
	var hexSizeWidth = 2*availWidth / ((this._options.width+1) * Math.sqrt(3)) - 1;
	var hexSizeHeight = availHeight / (2 + 1.5*(this._options.height-1));
	var hexSize = Math.min(hexSizeWidth, hexSizeHeight);

	/* compute char ratio */
	var oldFont = this._context.font;
	this._context.font = "100px " + this._options.fontFamily;
	var width = Math.ceil(this._context.measureText("W").width);
	this._context.font = oldFont;
	var ratio = width / 100;

	hexSize = Math.floor(hexSize)+1; /* closest larger hexSize */

	var fontSize = 2*hexSize / (this._options.spacing * (1 + ratio / Math.sqrt(3)));

	/* closest smaller fontSize */
	return Math.ceil(fontSize)-1;
}

ROT.Display.Hex.prototype.eventToPosition = function(x, y) {
	var height = this._context.canvas.height / this._options.height;
	y = Math.floor(y/height);
	
	if (y.mod(2)) { /* odd row */
		x -= this._spacingX;
		x = 1 + 2*Math.floor(x/(2*this._spacingX));
	} else {
		x = 2*Math.floor(x/(2*this._spacingX));
	}
	
	return [x, y];
}

ROT.Display.Hex.prototype._fill = function(cx, cy) {
	var a = this._hexSize;
	var b = this._options.border;
	
	this._context.beginPath();
	this._context.moveTo(cx, cy-a+b);
	this._context.lineTo(cx + this._spacingX - b, cy-a/2+b);
	this._context.lineTo(cx + this._spacingX - b, cy+a/2-b);
	this._context.lineTo(cx, cy+a-b);
	this._context.lineTo(cx - this._spacingX + b, cy+a/2-b);
	this._context.lineTo(cx - this._spacingX + b, cy-a/2+b);
	this._context.lineTo(cx, cy-a+b);
	this._context.fill();
}
/**
 * @class Tile backend
 * @private
 */
ROT.Display.Tile = function(context) {
	ROT.Display.Rect.call(this, context);
	
	this._options = {};
}
ROT.Display.Tile.extend(ROT.Display.Rect);

ROT.Display.Tile.prototype.compute = function(options) {
	this._options = options;
	this._context.canvas.width = options.width * options.tileWidth;
	this._context.canvas.height = options.height * options.tileHeight;
}

ROT.Display.Tile.prototype.draw = function(data, clearBefore) {
	var x = data[0];
	var y = data[1];
	var ch = data[2];
	var fg = data[3];
	var bg = data[4];

	var tileWidth = this._options.tileWidth;
	var tileHeight = this._options.tileHeight;

	if (clearBefore) {
		var b = this._options.border;
		this._context.fillStyle = bg;
		this._context.fillRect(x*tileWidth, y*tileHeight, tileWidth, tileHeight);
	}

	if (!ch) { return; }

	var chars = [].concat(ch);
	for (var i=0;i<chars.length;i++) {
		var tile = this._options.tileMap[chars[i]];
		if (!tile) { throw new Error("Char '" + chars[i] + "' not found in tileMap"); }
		
		this._context.drawImage(
			this._options.tileSet,
			tile[0], tile[1], tileWidth, tileHeight,
			x*tileWidth, y*tileHeight, tileWidth, tileHeight
		);
	}
}

ROT.Display.Tile.prototype.computeSize = function(availWidth, availHeight) {
	var width = Math.floor(availWidth / this._options.tileWidth);
	var height = Math.floor(availHeight / this._options.tileHeight);
	return [width, height];
}

ROT.Display.Tile.prototype.computeFontSize = function(availWidth, availHeight) {
	var width = Math.floor(availWidth / this._options.width);
	var height = Math.floor(availHeight / this._options.height);
	return [width, height];
}
/**
 * @namespace
 * This code is an implementation of Alea algorithm; (C) 2010 Johannes Baagøe.
 * Alea is licensed according to the http://en.wikipedia.org/wiki/MIT_License.
 */
ROT.RNG = {
	/**
	 * @returns {number} 
	 */
	getSeed: function() {
		return this._seed;
	},

	/**
	 * @param {number} seed Seed the number generator
	 */
	setSeed: function(seed) {
		seed = (seed < 1 ? 1/seed : seed);

		this._seed = seed;
		this._s0 = (seed >>> 0) * this._frac;

		seed = (seed*69069 + 1) >>> 0;
		this._s1 = seed * this._frac;

		seed = (seed*69069 + 1) >>> 0;
		this._s2 = seed * this._frac;

		this._c = 1;
		return this;
	},

	/**
	 * @returns {float} Pseudorandom value [0,1), uniformly distributed
	 */
	getUniform: function() {
		var t = 2091639 * this._s0 + this._c * this._frac;
		this._s0 = this._s1;
		this._s1 = this._s2;
		this._c = t | 0;
		this._s2 = t - this._c;
		return this._s2;
	},

	/**
	 * @param {int} lowerBound The lower end of the range to return a value from, inclusive
	 * @param {int} upperBound The upper end of the range to return a value from, inclusive
	 * @returns {int} Pseudorandom value [lowerBound, upperBound], using ROT.RNG.getUniform() to distribute the value
	 */
	getUniformInt: function(lowerBound, upperBound) {
		var max = Math.max(lowerBound, upperBound);
		var min = Math.min(lowerBound, upperBound);
		return Math.floor(this.getUniform() * (max - min + 1)) + min;
	},

	/**
	 * @param {float} [mean=0] Mean value
	 * @param {float} [stddev=1] Standard deviation. ~95% of the absolute values will be lower than 2*stddev.
	 * @returns {float} A normally distributed pseudorandom value
	 */
	getNormal: function(mean, stddev) {
		do {
			var u = 2*this.getUniform()-1;
			var v = 2*this.getUniform()-1;
			var r = u*u + v*v;
		} while (r > 1 || r == 0);

		var gauss = u * Math.sqrt(-2*Math.log(r)/r);
		return (mean || 0) + gauss*(stddev || 1);
	},

	/**
	 * @returns {int} Pseudorandom value [1,100] inclusive, uniformly distributed
	 */
	getPercentage: function() {
		return 1 + Math.floor(this.getUniform()*100);
	},
	
	/**
	 * @param {object} data key=whatever, value=weight (relative probability)
	 * @returns {string} whatever
	 */
	getWeightedValue: function(data) {
		var avail = [];
		var total = 0;
		
		for (var id in data) {
			total += data[id];
		}
		var random = Math.floor(this.getUniform()*total);
		
		var part = 0;
		for (var id in data) {
			part += data[id];
			if (random < part) { return id; }
		}
		
		return null;
	},

	/**
	 * Get RNG state. Useful for storing the state and re-setting it via setState.
	 * @returns {?} Internal state
	 */
	getState: function() {
		return [this._s0, this._s1, this._s2, this._c];
	},

	/**
	 * Set a previously retrieved state.
	 * @param {?} state
	 */
	setState: function(state) {
		this._s0 = state[0];
		this._s1 = state[1];
		this._s2 = state[2];
		this._c  = state[3];
		return this;
	},

	_s0: 0,
	_s1: 0,
	_s2: 0,
	_c: 0,
	_frac: 2.3283064365386963e-10 /* 2^-32 */
}

ROT.RNG.setSeed(Date.now());
/**
 * @class (Markov process)-based string generator. 
 * Copied from a <a href="http://www.roguebasin.roguelikedevelopment.org/index.php?title=Names_from_a_high_order_Markov_Process_and_a_simplified_Katz_back-off_scheme">RogueBasin article</a>. 
 * Offers configurable order and prior.
 * @param {object} [options]
 * @param {bool} [options.words=false] Use word mode?
 * @param {int} [options.order=3]
 * @param {float} [options.prior=0.001]
 */
ROT.StringGenerator = function(options) {
	this._options = {
		words: false,
		order: 3,
		prior: 0.001
	}
	for (var p in options) { this._options[p] = options[p]; }

	this._boundary = String.fromCharCode(0);
	this._suffix = this._boundary;
	this._prefix = [];
	for (var i=0;i<this._options.order;i++) { this._prefix.push(this._boundary); }

	this._priorValues = {};
	this._priorValues[this._boundary] = this._options.prior;

	this._data = {};
}

/**
 * Remove all learning data
 */
ROT.StringGenerator.prototype.clear = function() {
	this._data = {};
	this._priorValues = {};
}

/**
 * @returns {string} Generated string
 */
ROT.StringGenerator.prototype.generate = function() {
	var result = [this._sample(this._prefix)];
	while (result[result.length-1] != this._boundary) {
		result.push(this._sample(result));
	}
	return this._join(result.slice(0, -1));
}

/**
 * Observe (learn) a string from a training set
 */
ROT.StringGenerator.prototype.observe = function(string) {
	var tokens = this._split(string);

	for (var i=0; i<tokens.length; i++) {
		this._priorValues[tokens[i]] = this._options.prior;
	}

	tokens = this._prefix.concat(tokens).concat(this._suffix); /* add boundary symbols */

	for (var i=this._options.order; i<tokens.length; i++) {
		var context = tokens.slice(i-this._options.order, i);
		var event = tokens[i];
		for (var j=0; j<context.length; j++) {
			var subcontext = context.slice(j);
			this._observeEvent(subcontext, event);
		}
	}
}

ROT.StringGenerator.prototype.getStats = function() {
	var parts = [];

	var priorCount = 0;
	for (var p in this._priorValues) { priorCount++; }
	priorCount--; /* boundary */
	parts.push("distinct samples: " + priorCount);

	var dataCount = 0;
	var eventCount = 0;
	for (var p in this._data) { 
		dataCount++; 
		for (var key in this._data[p]) {
			eventCount++;
		}
	}
	parts.push("dictionary size (contexts): " + dataCount);
	parts.push("dictionary size (events): " + eventCount);

	return parts.join(", ");
}

/**
 * @param {string}
 * @returns {string[]}
 */
ROT.StringGenerator.prototype._split = function(str) {
	return str.split(this._options.words ? /\s+/ : "");
}

/**
 * @param {string[]}
 * @returns {string} 
 */
ROT.StringGenerator.prototype._join = function(arr) {
	return arr.join(this._options.words ? " " : "");
}

/**
 * @param {string[]} context
 * @param {string} event
 */
ROT.StringGenerator.prototype._observeEvent = function(context, event) {
	var key = this._join(context);
	if (!(key in this._data)) { this._data[key] = {}; }
	var data = this._data[key];

	if (!(event in data)) { data[event] = 0; }
	data[event]++;
}

/**
 * @param {string[]}
 * @returns {string}
 */
ROT.StringGenerator.prototype._sample = function(context) {
	context = this._backoff(context);
	var key = this._join(context);
	var data = this._data[key];

	var available = {};

	if (this._options.prior) {
		for (var event in this._priorValues) { available[event] = this._priorValues[event]; }
		for (var event in data) { available[event] += data[event]; }
	} else { 
		available = data;
	}

	return this._pickRandom(available);
}

/**
 * @param {string[]}
 * @returns {string[]}
 */
ROT.StringGenerator.prototype._backoff = function(context) {
	if (context.length > this._options.order) {
		context = context.slice(-this._options.order);
	} else if (context.length < this._options.order) {
		context = this._prefix.slice(0, this._options.order - context.length).concat(context);
	}

	while (!(this._join(context) in this._data) && context.length > 0) { context = context.slice(1); }

	return context;
}


ROT.StringGenerator.prototype._pickRandom = function(data) {
	var total = 0;
	
	for (var id in data) {
		total += data[id];
	}
	var random = ROT.RNG.getUniform()*total;
	
	var part = 0;
	for (var id in data) {
		part += data[id];
		if (random < part) { return id; }
	}
}
/**
 * @class Generic event queue: stores events and retrieves them based on their time
 */
ROT.EventQueue = function() {
	this._time = 0;
	this._events = [];
	this._eventTimes = [];
}

/**
 * @returns {number} Elapsed time
 */
ROT.EventQueue.prototype.getTime = function() {
	return this._time;
}

/**
 * Clear all scheduled events
 */
ROT.EventQueue.prototype.clear = function() {
	this._events = [];
	this._eventTimes = [];
	return this;
}

/**
 * @param {?} event
 * @param {number} time
 */
ROT.EventQueue.prototype.add = function(event, time) {
	var index = this._events.length;
	for (var i=0;i<this._eventTimes.length;i++) {
		if (this._eventTimes[i] > time) {
			index = i;
			break;
		}
	}

	this._events.splice(index, 0, event);
	this._eventTimes.splice(index, 0, time);
}

/**
 * Locates the nearest event, advances time if necessary. Returns that event and removes it from the queue.
 * @returns {? || null} The event previously added by addEvent, null if no event available
 */
ROT.EventQueue.prototype.get = function() {
	if (!this._events.length) { return null; }

	var time = this._eventTimes.splice(0, 1)[0];
	if (time > 0) { /* advance */
		this._time += time;
		for (var i=0;i<this._eventTimes.length;i++) { this._eventTimes[i] -= time; }
	}

	return this._events.splice(0, 1)[0];
}

/**
 * Remove an event from the queue
 * @param {?} event
 * @returns {bool} success?
 */
ROT.EventQueue.prototype.remove = function(event) {
	var index = this._events.indexOf(event);
	if (index == -1) { return false }
	this._remove(index);
	return true;
}

/**
 * Remove an event from the queue
 * @param {int} index
 */
ROT.EventQueue.prototype._remove = function(index) {
	this._events.splice(index, 1);
	this._eventTimes.splice(index, 1);
}
/**
 * @class Abstract scheduler
 */
ROT.Scheduler = function() {
	this._queue = new ROT.EventQueue();
	this._repeat = [];
	this._current = null;
}

/**
 * @see ROT.EventQueue#getTime
 */
ROT.Scheduler.prototype.getTime = function() {
	return this._queue.getTime();
}

/**
 * @param {?} item
 * @param {bool} repeat
 */
ROT.Scheduler.prototype.add = function(item, repeat) {
	if (repeat) { this._repeat.push(item); }
	return this;
}

/**
 * Clear all items
 */
ROT.Scheduler.prototype.clear = function() {
	this._queue.clear();
	this._repeat = [];
	this._current = null;
	return this;
}

/**
 * Remove a previously added item
 * @param {?} item
 * @returns {bool} successful?
 */
ROT.Scheduler.prototype.remove = function(item) {
	var result = this._queue.remove(item);

	var index = this._repeat.indexOf(item);
	if (index != -1) { this._repeat.splice(index, 1); }

	if (this._current == item) { this._current = null; }

	return result;
}

/**
 * Schedule next item
 * @returns {?}
 */
ROT.Scheduler.prototype.next = function() {
	this._current = this._queue.get();
	return this._current;
}
/**
 * @class Simple fair scheduler (round-robin style)
 * @augments ROT.Scheduler
 */
ROT.Scheduler.Simple = function() {
	ROT.Scheduler.call(this);
}
ROT.Scheduler.Simple.extend(ROT.Scheduler);

/**
 * @see ROT.Scheduler#add
 */
ROT.Scheduler.Simple.prototype.add = function(item, repeat) {
	this._queue.add(item, 0);
	return ROT.Scheduler.prototype.add.call(this, item, repeat);
}

/**
 * @see ROT.Scheduler#next
 */
ROT.Scheduler.Simple.prototype.next = function() {
	if (this._current && this._repeat.indexOf(this._current) != -1) {
		this._queue.add(this._current, 0);
	}
	return ROT.Scheduler.prototype.next.call(this);
}
/**
 * @class Speed-based scheduler
 * @augments ROT.Scheduler
 */
ROT.Scheduler.Speed = function() {
	ROT.Scheduler.call(this);
}
ROT.Scheduler.Speed.extend(ROT.Scheduler);

/**
 * @param {object} item anything with "getSpeed" method
 * @param {bool} repeat
 * @see ROT.Scheduler#add
 */
ROT.Scheduler.Speed.prototype.add = function(item, repeat) {
	this._queue.add(item, 1/item.getSpeed());
	return ROT.Scheduler.prototype.add.call(this, item, repeat);
}

/**
 * @see ROT.Scheduler#next
 */
ROT.Scheduler.Speed.prototype.next = function() {
	if (this._current && this._repeat.indexOf(this._current) != -1) {
		this._queue.add(this._current, 1/this._current.getSpeed());
	}
	return ROT.Scheduler.prototype.next.call(this);
}
/**
 * @class Action-based scheduler
 * @augments ROT.Scheduler
 */
ROT.Scheduler.Action = function() {
	ROT.Scheduler.call(this);
	this._defaultDuration = 1; /* for newly added */
	this._duration = this._defaultDuration; /* for this._current */
}
ROT.Scheduler.Action.extend(ROT.Scheduler);

/**
 * @param {object} item
 * @param {bool} repeat
 * @param {number} [time=1]
 * @see ROT.Scheduler#add
 */
ROT.Scheduler.Action.prototype.add = function(item, repeat, time) {
	this._queue.add(item, time || this._defaultDuration);
	return ROT.Scheduler.prototype.add.call(this, item, repeat);
}

ROT.Scheduler.Action.prototype.clear = function() {
	this._duration = this._defaultDuration;
	return ROT.Scheduler.prototype.clear.call(this);
}

ROT.Scheduler.Action.prototype.remove = function(item) {
	if (item == this._current) { this._duration = this._defaultDuration; }
	return ROT.Scheduler.prototype.remove.call(this, item);
}

/**
 * @see ROT.Scheduler#next
 */
ROT.Scheduler.Action.prototype.next = function() {
	if (this._current && this._repeat.indexOf(this._current) != -1) {
		this._queue.add(this._current, this._duration || this._defaultDuration);
		this._duration = this._defaultDuration;
	}
	return ROT.Scheduler.prototype.next.call(this);
}

/**
 * Set duration for the active item
 */
ROT.Scheduler.Action.prototype.setDuration = function(time) {
	if (this._current) { this._duration = time; }
	return this;
}
/**
 * @class Asynchronous main loop
 * @param {ROT.Scheduler} scheduler
 */
ROT.Engine = function(scheduler) {
	this._scheduler = scheduler;
	this._lock = 1;
}

/**
 * Start the main loop. When this call returns, the loop is locked.
 */
ROT.Engine.prototype.start = function() {
	return this.unlock();
}

/**
 * Interrupt the engine by an asynchronous action
 */
ROT.Engine.prototype.lock = function() {
	this._lock++;
	return this;
}

/**
 * Resume execution (paused by a previous lock)
 */
ROT.Engine.prototype.unlock = function() {
	if (!this._lock) { throw new Error("Cannot unlock unlocked engine"); }
	this._lock--;

	while (!this._lock) {
		var actor = this._scheduler.next();
		if (!actor) { return this.lock(); } /* no actors */
		var result = actor.act();
		if (result && result.then) { /* actor returned a "thenable", looks like a Promise */
			this.lock();
			result.then(this.unlock.bind(this));
		}
	}

	return this;
}
/**
 * @class Base map generator
 * @param {int} [width=ROT.DEFAULT_WIDTH]
 * @param {int} [height=ROT.DEFAULT_HEIGHT]
 */
ROT.Map = function(width, height) {
	this._width = width || ROT.DEFAULT_WIDTH;
	this._height = height || ROT.DEFAULT_HEIGHT;
};

ROT.Map.prototype.create = function(callback) {}

ROT.Map.prototype._fillMap = function(value) {
	var map = [];
	for (var i=0;i<this._width;i++) {
		map.push([]);
		for (var j=0;j<this._height;j++) { map[i].push(value); }
	}
	return map;
}
/**
 * @class Simple empty rectangular room
 * @augments ROT.Map
 */
ROT.Map.Arena = function(width, height) {
	ROT.Map.call(this, width, height);
}
ROT.Map.Arena.extend(ROT.Map);

ROT.Map.Arena.prototype.create = function(callback) {
	var w = this._width-1;
	var h = this._height-1;
	for (var i=0;i<=w;i++) {
		for (var j=0;j<=h;j++) {
			var empty = (i && j && i<w && j<h);
			callback(i, j, empty ? 0 : 1);
		}
	}
	return this;
}
/**
 * @class Recursively divided maze, http://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_division_method
 * @augments ROT.Map
 */
ROT.Map.DividedMaze = function(width, height) {
	ROT.Map.call(this, width, height);
	this._stack = [];
}
ROT.Map.DividedMaze.extend(ROT.Map);

ROT.Map.DividedMaze.prototype.create = function(callback) {
	var w = this._width;
	var h = this._height;
	
	this._map = [];
	
	for (var i=0;i<w;i++) {
		this._map.push([]);
		for (var j=0;j<h;j++) {
			var border = (i == 0 || j == 0 || i+1 == w || j+1 == h);
			this._map[i].push(border ? 1 : 0);
		}
	}
	
	this._stack = [
		[1, 1, w-2, h-2]
	];
	this._process();
	
	for (var i=0;i<w;i++) {
		for (var j=0;j<h;j++) {
			callback(i, j, this._map[i][j]);
		}
	}
	this._map = null;
	return this;
}

ROT.Map.DividedMaze.prototype._process = function() {
	while (this._stack.length) {
		var room = this._stack.shift(); /* [left, top, right, bottom] */
		this._partitionRoom(room);
	}
}

ROT.Map.DividedMaze.prototype._partitionRoom = function(room) {
	var availX = [];
	var availY = [];
	
	for (var i=room[0]+1;i<room[2];i++) {
		var top = this._map[i][room[1]-1];
		var bottom = this._map[i][room[3]+1];
		if (top && bottom && !(i % 2)) { availX.push(i); }
	}
	
	for (var j=room[1]+1;j<room[3];j++) {
		var left = this._map[room[0]-1][j];
		var right = this._map[room[2]+1][j];
		if (left && right && !(j % 2)) { availY.push(j); }
	}

	if (!availX.length || !availY.length) { return; }

	var x = availX.random();
	var y = availY.random();
	
	this._map[x][y] = 1;
	
	var walls = [];
	
	var w = []; walls.push(w); /* left part */
	for (var i=room[0]; i<x; i++) { 
		this._map[i][y] = 1;
		w.push([i, y]); 
	}
	
	var w = []; walls.push(w); /* right part */
	for (var i=x+1; i<=room[2]; i++) { 
		this._map[i][y] = 1;
		w.push([i, y]); 
	}

	var w = []; walls.push(w); /* top part */
	for (var j=room[1]; j<y; j++) { 
		this._map[x][j] = 1;
		w.push([x, j]); 
	}
	
	var w = []; walls.push(w); /* bottom part */
	for (var j=y+1; j<=room[3]; j++) { 
		this._map[x][j] = 1;
		w.push([x, j]); 
	}
		
	var solid = walls.random();
	for (var i=0;i<walls.length;i++) {
		var w = walls[i];
		if (w == solid) { continue; }
		
		var hole = w.random();
		this._map[hole[0]][hole[1]] = 0;
	}

	this._stack.push([room[0], room[1], x-1, y-1]); /* left top */
	this._stack.push([x+1, room[1], room[2], y-1]); /* right top */
	this._stack.push([room[0], y+1, x-1, room[3]]); /* left bottom */
	this._stack.push([x+1, y+1, room[2], room[3]]); /* right bottom */
}
/**
 * @class Icey's Maze generator
 * See http://www.roguebasin.roguelikedevelopment.org/index.php?title=Simple_maze for explanation
 * @augments ROT.Map
 */
ROT.Map.IceyMaze = function(width, height, regularity) {
	ROT.Map.call(this, width, height);
	this._regularity = regularity || 0;
}
ROT.Map.IceyMaze.extend(ROT.Map);

ROT.Map.IceyMaze.prototype.create = function(callback) {
	var width = this._width;
	var height = this._height;
	
	var map = this._fillMap(1);
	
	width -= (width % 2 ? 1 : 2);
	height -= (height % 2 ? 1 : 2);

	var cx = 0;
	var cy = 0;
	var nx = 0;
	var ny = 0;

	var done = 0;
	var blocked = false;
	var dirs = [
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0]
	];
	do {
		cx = 1 + 2*Math.floor(ROT.RNG.getUniform()*(width-1) / 2);
		cy = 1 + 2*Math.floor(ROT.RNG.getUniform()*(height-1) / 2);

		if (!done) { map[cx][cy] = 0; }
		
		if (!map[cx][cy]) {
			this._randomize(dirs);
			do {
				if (Math.floor(ROT.RNG.getUniform()*(this._regularity+1)) == 0) { this._randomize(dirs); }
				blocked = true;
				for (var i=0;i<4;i++) {
					nx = cx + dirs[i][0]*2;
					ny = cy + dirs[i][1]*2;
					if (this._isFree(map, nx, ny, width, height)) {
						map[nx][ny] = 0;
						map[cx + dirs[i][0]][cy + dirs[i][1]] = 0;
						
						cx = nx;
						cy = ny;
						blocked = false;
						done++;
						break;
					}
				}
			} while (!blocked);
		}
	} while (done+1 < width*height/4);
	
	for (var i=0;i<this._width;i++) {
		for (var j=0;j<this._height;j++) {
			callback(i, j, map[i][j]);
		}
	}
	this._map = null;
	return this;
}

ROT.Map.IceyMaze.prototype._randomize = function(dirs) {
	for (var i=0;i<4;i++) {
		dirs[i][0] = 0;
		dirs[i][1] = 0;
	}
	
	switch (Math.floor(ROT.RNG.getUniform()*4)) {
		case 0:
			dirs[0][0] = -1; dirs[1][0] = 1;
			dirs[2][1] = -1; dirs[3][1] = 1;
		break;
		case 1:
			dirs[3][0] = -1; dirs[2][0] = 1;
			dirs[1][1] = -1; dirs[0][1] = 1;
		break;
		case 2:
			dirs[2][0] = -1; dirs[3][0] = 1;
			dirs[0][1] = -1; dirs[1][1] = 1;
		break;
		case 3:
			dirs[1][0] = -1; dirs[0][0] = 1;
			dirs[3][1] = -1; dirs[2][1] = 1;
		break;
	}
}

ROT.Map.IceyMaze.prototype._isFree = function(map, x, y, width, height) {
	if (x < 1 || y < 1 || x >= width || y >= height) { return false; }
	return map[x][y];
}
/**
 * @class Maze generator - Eller's algorithm
 * See http://homepages.cwi.nl/~tromp/maze.html for explanation
 * @augments ROT.Map
 */
ROT.Map.EllerMaze = function(width, height) {
	ROT.Map.call(this, width, height);
}
ROT.Map.EllerMaze.extend(ROT.Map);

ROT.Map.EllerMaze.prototype.create = function(callback) {
	var map = this._fillMap(1);
	var w = Math.ceil((this._width-2)/2);
	
	var rand = 9/24;
	
	var L = [];
	var R = [];
	
	for (var i=0;i<w;i++) {
		L.push(i);
		R.push(i);
	}
	L.push(w-1); /* fake stop-block at the right side */

	for (var j=1;j+3<this._height;j+=2) {
		/* one row */
		for (var i=0;i<w;i++) {
			/* cell coords (will be always empty) */
			var x = 2*i+1;
			var y = j;
			map[x][y] = 0;
			
			/* right connection */
			if (i != L[i+1] && ROT.RNG.getUniform() > rand) {
				this._addToList(i, L, R);
				map[x+1][y] = 0;
			}
			
			/* bottom connection */
			if (i != L[i] && ROT.RNG.getUniform() > rand) {
				/* remove connection */
				this._removeFromList(i, L, R);
			} else {
				/* create connection */
				map[x][y+1] = 0;
			}
		}
	}

	/* last row */
	for (var i=0;i<w;i++) {
		/* cell coords (will be always empty) */
		var x = 2*i+1;
		var y = j;
		map[x][y] = 0;
		
		/* right connection */
		if (i != L[i+1] && (i == L[i] || ROT.RNG.getUniform() > rand)) {
			/* dig right also if the cell is separated, so it gets connected to the rest of maze */
			this._addToList(i, L, R);
			map[x+1][y] = 0;
		}
		
		this._removeFromList(i, L, R);
	}
	
	for (var i=0;i<this._width;i++) {
		for (var j=0;j<this._height;j++) {
			callback(i, j, map[i][j]);
		}
	}
	
	return this;
}

/**
 * Remove "i" from its list
 */
ROT.Map.EllerMaze.prototype._removeFromList = function(i, L, R) {
	R[L[i]] = R[i];
	L[R[i]] = L[i];
	R[i] = i;
	L[i] = i;
}

/**
 * Join lists with "i" and "i+1"
 */
ROT.Map.EllerMaze.prototype._addToList = function(i, L, R) {
	R[L[i+1]] = R[i];
	L[R[i]] = L[i+1];
	R[i] = i+1;
	L[i+1] = i;
}
/**
 * @class Cellular automaton map generator
 * @augments ROT.Map
 * @param {int} [width=ROT.DEFAULT_WIDTH]
 * @param {int} [height=ROT.DEFAULT_HEIGHT]
 * @param {object} [options] Options
 * @param {int[]} [options.born] List of neighbor counts for a new cell to be born in empty space
 * @param {int[]} [options.survive] List of neighbor counts for an existing  cell to survive
 * @param {int} [options.topology] Topology 4 or 6 or 8
 */
ROT.Map.Cellular = function(width, height, options) {
	ROT.Map.call(this, width, height);
	this._options = {
		born: [5, 6, 7, 8],
		survive: [4, 5, 6, 7, 8],
		topology: 8
	};
	this.setOptions(options);
	
	this._dirs = ROT.DIRS[this._options.topology];
	this._map = this._fillMap(0);
}
ROT.Map.Cellular.extend(ROT.Map);

/**
 * Fill the map with random values
 * @param {float} probability Probability for a cell to become alive; 0 = all empty, 1 = all full
 */
ROT.Map.Cellular.prototype.randomize = function(probability) {
	for (var i=0;i<this._width;i++) {
		for (var j=0;j<this._height;j++) {
			this._map[i][j] = (ROT.RNG.getUniform() < probability ? 1 : 0);
		}
	}
	return this;
}

/**
 * Change options.
 * @see ROT.Map.Cellular
 */
ROT.Map.Cellular.prototype.setOptions = function(options) {
	for (var p in options) { this._options[p] = options[p]; }
}

ROT.Map.Cellular.prototype.set = function(x, y, value) {
	this._map[x][y] = value;
}

ROT.Map.Cellular.prototype.create = function(callback) {
	var newMap = this._fillMap(0);
	var born = this._options.born;
	var survive = this._options.survive;


	for (var j=0;j<this._height;j++) {
		var widthStep = 1;
		var widthStart = 0;
		if (this._options.topology == 6) { 
			widthStep = 2;
			widthStart = j%2;
		}

		for (var i=widthStart; i<this._width; i+=widthStep) {

			var cur = this._map[i][j];
			var ncount = this._getNeighbors(i, j);
			
			if (cur && survive.indexOf(ncount) != -1) { /* survive */
				newMap[i][j] = 1;
			} else if (!cur && born.indexOf(ncount) != -1) { /* born */
				newMap[i][j] = 1;
			}
			
			if (callback) { callback(i, j, newMap[i][j]); }
		}
	}
	
	this._map = newMap;
}

/**
 * Get neighbor count at [i,j] in this._map
 */
ROT.Map.Cellular.prototype._getNeighbors = function(cx, cy) {
	var result = 0;
	for (var i=0;i<this._dirs.length;i++) {
		var dir = this._dirs[i];
		var x = cx + dir[0];
		var y = cy + dir[1];
		
		if (x < 0 || x >= this._width || x < 0 || y >= this._width) { continue; }
		result += (this._map[x][y] == 1 ? 1 : 0);
	}
	
	return result;
}
/**
 * @class Dungeon map: has rooms and corridors
 * @augments ROT.Map
 */
ROT.Map.Dungeon = function(width, height) {
	ROT.Map.call(this, width, height);
	this._rooms = []; /* list of all rooms */
	this._corridors = [];
}
ROT.Map.Dungeon.extend(ROT.Map);

/**
 * Get all generated rooms
 * @returns {ROT.Map.Feature.Room[]}
 */
ROT.Map.Dungeon.prototype.getRooms = function() {
	return this._rooms;
}

/**
 * Get all generated corridors
 * @returns {ROT.Map.Feature.Corridor[]}
 */
ROT.Map.Dungeon.prototype.getCorridors = function() {
	return this._corridors;
}
/**
 * @class Random dungeon generator using human-like digging patterns.
 * Heavily based on Mike Anderson's ideas from the "Tyrant" algo, mentioned at 
 * http://www.roguebasin.roguelikedevelopment.org/index.php?title=Dungeon-Building_Algorithm.
 * @augments ROT.Map.Dungeon
 */
ROT.Map.Digger = function(width, height, options) {
	ROT.Map.Dungeon.call(this, width, height);
	
	this._options = {
		roomWidth: [3, 9], /* room minimum and maximum width */
		roomHeight: [3, 5], /* room minimum and maximum height */
		corridorLength: [5, 10], /* corridor minimum and maximum length */
		dugPercentage: 0.2, /* we stop after this percentage of level area has been dug out */
		timeLimit: 1000 /* we stop after this much time has passed (msec) */
	}
	for (var p in options) { this._options[p] = options[p]; }
	
	this._features = {
		"Room": 4,
		"Corridor": 4
	}
	this._featureAttempts = 20; /* how many times do we try to create a feature on a suitable wall */
	this._walls = {}; /* these are available for digging */
	
	this._digCallback = this._digCallback.bind(this);
	this._canBeDugCallback = this._canBeDugCallback.bind(this);
	this._isWallCallback = this._isWallCallback.bind(this);
	this._priorityWallCallback = this._priorityWallCallback.bind(this);
}
ROT.Map.Digger.extend(ROT.Map.Dungeon);

/**
 * Create a map
 * @see ROT.Map#create
 */
ROT.Map.Digger.prototype.create = function(callback) {
	this._rooms = [];
	this._corridors = [];
	this._map = this._fillMap(1);
	this._walls = {};
	this._dug = 0;
	var area = (this._width-2) * (this._height-2);

	this._firstRoom();
	
	var t1 = Date.now();

	do {
		var t2 = Date.now();
		if (t2 - t1 > this._options.timeLimit) { break; }

		/* find a good wall */
		var wall = this._findWall();
		if (!wall) { break; } /* no more walls */
		
		var parts = wall.split(",");
		var x = parseInt(parts[0]);
		var y = parseInt(parts[1]);
		var dir = this._getDiggingDirection(x, y);
		if (!dir) { continue; } /* this wall is not suitable */
		
//		console.log("wall", x, y);

		/* try adding a feature */
		var featureAttempts = 0;
		do {
			featureAttempts++;
			if (this._tryFeature(x, y, dir[0], dir[1])) { /* feature added */
				//if (this._rooms.length + this._corridors.length == 2) { this._rooms[0].addDoor(x, y); } /* first room oficially has doors */
				this._removeSurroundingWalls(x, y);
				this._removeSurroundingWalls(x-dir[0], y-dir[1]);
				break; 
			}
		} while (featureAttempts < this._featureAttempts);
		
		var priorityWalls = 0;
		for (var id in this._walls) { 
			if (this._walls[id] > 1) { priorityWalls++; }
		}

	} while (this._dug/area < this._options.dugPercentage || priorityWalls); /* fixme number of priority walls */

	this._addDoors();

	if (callback) {
		for (var i=0;i<this._width;i++) {
			for (var j=0;j<this._height;j++) {
				callback(i, j, this._map[i][j]);
			}
		}
	}
	
	this._walls = {};
	this._map = null;

	return this;
}

ROT.Map.Digger.prototype._digCallback = function(x, y, value) {
	if (value == 0 || value == 2) { /* empty */
		this._map[x][y] = 0;
		this._dug++;
	} else { /* wall */
		this._walls[x+","+y] = 1;
	}
}

ROT.Map.Digger.prototype._isWallCallback = function(x, y) {
	if (x < 0 || y < 0 || x >= this._width || y >= this._height) { return false; }
	return (this._map[x][y] == 1);
}

ROT.Map.Digger.prototype._canBeDugCallback = function(x, y) {
	if (x < 1 || y < 1 || x+1 >= this._width || y+1 >= this._height) { return false; }
	return (this._map[x][y] == 1);
}

ROT.Map.Digger.prototype._priorityWallCallback = function(x, y) {
	this._walls[x+","+y] = 2;
}

ROT.Map.Digger.prototype._firstRoom = function() {
	var cx = Math.floor(this._width/2);
	var cy = Math.floor(this._height/2);
	var room = ROT.Map.Feature.Room.createRandomCenter(cx, cy, this._options);
	this._rooms.push(room);
	room.create(this._digCallback);
}

/**
 * Get a suitable wall
 */
ROT.Map.Digger.prototype._findWall = function() {
	var prio1 = [];
	var prio2 = [];
	for (var id in this._walls) {
		var prio = this._walls[id];
		if (prio == 2) { 
			prio2.push(id); 
		} else {
			prio1.push(id);
		}
	}
	
	var arr = (prio2.length ? prio2 : prio1);
	if (!arr.length) { return null; } /* no walls :/ */
	
	var id = arr.random();
	delete this._walls[id];

	return id;
}

/**
 * Tries adding a feature
 * @returns {bool} was this a successful try?
 */
ROT.Map.Digger.prototype._tryFeature = function(x, y, dx, dy) {
	var feature = ROT.RNG.getWeightedValue(this._features);
	feature = ROT.Map.Feature[feature].createRandomAt(x, y, dx, dy, this._options);
	
	if (!feature.isValid(this._isWallCallback, this._canBeDugCallback)) {
//		console.log("not valid");
//		feature.debug();
		return false;
	}
	
	feature.create(this._digCallback);
//	feature.debug();

	if (feature instanceof ROT.Map.Feature.Room) { this._rooms.push(feature); }
	if (feature instanceof ROT.Map.Feature.Corridor) { 
		feature.createPriorityWalls(this._priorityWallCallback);
		this._corridors.push(feature); 
	}
	
	return true;
}

ROT.Map.Digger.prototype._removeSurroundingWalls = function(cx, cy) {
	var deltas = ROT.DIRS[4];

	for (var i=0;i<deltas.length;i++) {
		var delta = deltas[i];
		var x = cx + delta[0];
		var y = cy + delta[1];
		delete this._walls[x+","+y];
		var x = cx + 2*delta[0];
		var y = cy + 2*delta[1];
		delete this._walls[x+","+y];
	}
}

/**
 * Returns vector in "digging" direction, or false, if this does not exist (or is not unique)
 */
ROT.Map.Digger.prototype._getDiggingDirection = function(cx, cy) {
	var result = null;
	var deltas = ROT.DIRS[4];
	
	for (var i=0;i<deltas.length;i++) {
		var delta = deltas[i];
		var x = cx + delta[0];
		var y = cy + delta[1];
		
		if (x < 0 || y < 0 || x >= this._width || y >= this._width) { return null; }
		
		if (!this._map[x][y]) { /* there already is another empty neighbor! */
			if (result) { return null; }
			result = delta;
		}
	}
	
	/* no empty neighbor */
	if (!result) { return null; }
	
	return [-result[0], -result[1]];
}

/**
 * Find empty spaces surrounding rooms, and apply doors.
 */
ROT.Map.Digger.prototype._addDoors = function() {
	var data = this._map;
	var isWallCallback = function(x, y) {
		return (data[x][y] == 1);
	}
	for (var i = 0; i < this._rooms.length; i++ ) {
		var room = this._rooms[i];
		room.clearDoors();
		room.addDoors(isWallCallback);
	}
}
/**
 * @class Dungeon generator which tries to fill the space evenly. Generates independent rooms and tries to connect them.
 * @augments ROT.Map.Dungeon
 */
ROT.Map.Uniform = function(width, height, options) {
	ROT.Map.Dungeon.call(this, width, height);

	this._options = {
		roomWidth: [3, 9], /* room minimum and maximum width */
		roomHeight: [3, 5], /* room minimum and maximum height */
		roomDugPercentage: 0.1, /* we stop after this percentage of level area has been dug out by rooms */
		timeLimit: 1000 /* we stop after this much time has passed (msec) */
	}
	for (var p in options) { this._options[p] = options[p]; }

	this._roomAttempts = 20; /* new room is created N-times until is considered as impossible to generate */
	this._corridorAttempts = 20; /* corridors are tried N-times until the level is considered as impossible to connect */

	this._connected = []; /* list of already connected rooms */
	this._unconnected = []; /* list of remaining unconnected rooms */
	
	this._digCallback = this._digCallback.bind(this);
	this._canBeDugCallback = this._canBeDugCallback.bind(this);
	this._isWallCallback = this._isWallCallback.bind(this);
}
ROT.Map.Uniform.extend(ROT.Map.Dungeon);

/**
 * Create a map. If the time limit has been hit, returns null.
 * @see ROT.Map#create
 */
ROT.Map.Uniform.prototype.create = function(callback) {
	var t1 = Date.now();
	while (1) {
		var t2 = Date.now();
		if (t2 - t1 > this._options.timeLimit) { return null; } /* time limit! */
	
		this._map = this._fillMap(1);
		this._dug = 0;
		this._rooms = [];
		this._unconnected = [];
		this._generateRooms();
		if (this._rooms.length < 2) { continue; }
		if (this._generateCorridors()) { break; }
	}
	
	if (callback) {
		for (var i=0;i<this._width;i++) {
			for (var j=0;j<this._height;j++) {
				callback(i, j, this._map[i][j]);
			}
		}
	}
	
	return this;
}

/**
 * Generates a suitable amount of rooms
 */
ROT.Map.Uniform.prototype._generateRooms = function() {
	var w = this._width-2;
	var h = this._height-2;

	do {
		var room = this._generateRoom();
		if (this._dug/(w*h) > this._options.roomDugPercentage) { break; } /* achieved requested amount of free space */
	} while (room);

	/* either enough rooms, or not able to generate more of them :) */
}

/**
 * Try to generate one room
 */
ROT.Map.Uniform.prototype._generateRoom = function() {
	var count = 0;
	while (count < this._roomAttempts) {
		count++;
		
		var room = ROT.Map.Feature.Room.createRandom(this._width, this._height, this._options);
		if (!room.isValid(this._isWallCallback, this._canBeDugCallback)) { continue; }
		
		room.create(this._digCallback);
		this._rooms.push(room);
		return room;
	} 

	/* no room was generated in a given number of attempts */
	return null;
}

/**
 * Generates connectors beween rooms
 * @returns {bool} success Was this attempt successfull?
 */
ROT.Map.Uniform.prototype._generateCorridors = function() {
	var cnt = 0;
	while (cnt < this._corridorAttempts) {
		cnt++;
		this._corridors = [];

		/* dig rooms into a clear map */
		this._map = this._fillMap(1);
		for (var i=0;i<this._rooms.length;i++) { 
			var room = this._rooms[i];
			room.clearDoors();
			room.create(this._digCallback); 
		}

		this._unconnected = this._rooms.slice().randomize();
		this._connected = [];
		if (this._unconnected.length) { this._connected.push(this._unconnected.pop()); } /* first one is always connected */
		
		while (1) {
			/* 1. pick random connected room */
			var connected = this._connected.random();
			
			/* 2. find closest unconnected */
			var room1 = this._closestRoom(this._unconnected, connected);
			
			/* 3. connect it to closest connected */
			var room2 = this._closestRoom(this._connected, room1);
			
			var ok = this._connectRooms(room1, room2);
			if (!ok) { break; } /* stop connecting, re-shuffle */
			
			if (!this._unconnected.length) { return true; } /* done; no rooms remain */
		}
	}
	return false;
}

/**
 * For a given room, find the closest one from the list
 */
ROT.Map.Uniform.prototype._closestRoom = function(rooms, room) {
	var dist = Infinity;
	var center = room.getCenter();
	var result = null;
	
	for (var i=0;i<rooms.length;i++) {
		var r = rooms[i];
		var c = r.getCenter();
		var dx = c[0]-center[0];
		var dy = c[1]-center[1];
		var d = dx*dx+dy*dy;
		
		if (d < dist) {
			dist = d;
			result = r;
		}
	}
	
	return result;
}

ROT.Map.Uniform.prototype._connectRooms = function(room1, room2) {
	/*
		room1.debug();
		room2.debug();
	*/

	var center1 = room1.getCenter();
	var center2 = room2.getCenter();

	var diffX = center2[0] - center1[0];
	var diffY = center2[1] - center1[1];

	if (Math.abs(diffX) < Math.abs(diffY)) { /* first try connecting north-south walls */
		var dirIndex1 = (diffY > 0 ? 2 : 0);
		var dirIndex2 = (dirIndex1 + 2) % 4;
		var min = room2.getLeft();
		var max = room2.getRight();
		var index = 0;
	} else { /* first try connecting east-west walls */
		var dirIndex1 = (diffX > 0 ? 1 : 3);
		var dirIndex2 = (dirIndex1 + 2) % 4;
		var min = room2.getTop();
		var max = room2.getBottom();
		var index = 1;
	}

	var start = this._placeInWall(room1, dirIndex1); /* corridor will start here */
	if (!start) { return false; }

	if (start[index] >= min && start[index] <= max) { /* possible to connect with straight line (I-like) */
		var end = start.slice();
		var value = null;
		switch (dirIndex2) {
			case 0: value = room2.getTop()-1; break;
			case 1: value = room2.getRight()+1; break;
			case 2: value = room2.getBottom()+1; break;
			case 3: value = room2.getLeft()-1; break;
		}
		end[(index+1)%2] = value;
		this._digLine([start, end]);
		
	} else if (start[index] < min-1 || start[index] > max+1) { /* need to switch target wall (L-like) */

		var diff = start[index] - center2[index];
		switch (dirIndex2) {
			case 0:
			case 1:	var rotation = (diff < 0 ? 3 : 1); break;
			case 2:
			case 3:	var rotation = (diff < 0 ? 1 : 3); break;
		}
		dirIndex2 = (dirIndex2 + rotation) % 4;
		
		var end = this._placeInWall(room2, dirIndex2);
		if (!end) { return false; }

		var mid = [0, 0];
		mid[index] = start[index];
		var index2 = (index+1)%2;
		mid[index2] = end[index2];
		this._digLine([start, mid, end]);
		
	} else { /* use current wall pair, but adjust the line in the middle (S-like) */
	
		var index2 = (index+1)%2;
		var end = this._placeInWall(room2, dirIndex2);
		if (!end) { return; }
		var mid = Math.round((end[index2] + start[index2])/2);

		var mid1 = [0, 0];
		var mid2 = [0, 0];
		mid1[index] = start[index];
		mid1[index2] = mid;
		mid2[index] = end[index];
		mid2[index2] = mid;
		this._digLine([start, mid1, mid2, end]);
	}

	room1.addDoor(start[0], start[1]);
	room2.addDoor(end[0], end[1]);
	
	var index = this._unconnected.indexOf(room1);
	if (index != -1) {
		this._unconnected.splice(index, 1);
		this._connected.push(room1);
	}

	var index = this._unconnected.indexOf(room2);
	if (index != -1) {
		this._unconnected.splice(index, 1);
		this._connected.push(room2);
	}
	
	return true;
}

ROT.Map.Uniform.prototype._placeInWall = function(room, dirIndex) {
	var start = [0, 0];
	var dir = [0, 0];
	var length = 0;
	
	switch (dirIndex) {
		case 0:
			dir = [1, 0];
			start = [room.getLeft(), room.getTop()-1];
			length = room.getRight()-room.getLeft()+1;
		break;
		case 1:
			dir = [0, 1];
			start = [room.getRight()+1, room.getTop()];
			length = room.getBottom()-room.getTop()+1;
		break;
		case 2:
			dir = [1, 0];
			start = [room.getLeft(), room.getBottom()+1];
			length = room.getRight()-room.getLeft()+1;
		break;
		case 3:
			dir = [0, 1];
			start = [room.getLeft()-1, room.getTop()];
			length = room.getBottom()-room.getTop()+1;
		break;
	}
	
	var avail = [];
	var lastBadIndex = -2;

	for (var i=0;i<length;i++) {
		var x = start[0] + i*dir[0];
		var y = start[1] + i*dir[1];
		avail.push(null);
		
		var isWall = (this._map[x][y] == 1);
		if (isWall) {
			if (lastBadIndex != i-1) { avail[i] = [x, y]; }
		} else {
			lastBadIndex = i;
			if (i) { avail[i-1] = null; }
		}
	}
	
	for (var i=avail.length-1; i>=0; i--) {
		if (!avail[i]) { avail.splice(i, 1); }
	}
	return (avail.length ? avail.random() : null);
}

/**
 * Dig a polyline.
 */
ROT.Map.Uniform.prototype._digLine = function(points) {
	for (var i=1;i<points.length;i++) {
		var start = points[i-1];
		var end = points[i];
		var corridor = new ROT.Map.Feature.Corridor(start[0], start[1], end[0], end[1]);
		corridor.create(this._digCallback);
		this._corridors.push(corridor);
	}
}

ROT.Map.Uniform.prototype._digCallback = function(x, y, value) {
	this._map[x][y] = value;
	if (value == 0) { this._dug++; }
}

ROT.Map.Uniform.prototype._isWallCallback = function(x, y) {
	if (x < 0 || y < 0 || x >= this._width || y >= this._height) { return false; }
	return (this._map[x][y] == 1);
}

ROT.Map.Uniform.prototype._canBeDugCallback = function(x, y) {
	if (x < 1 || y < 1 || x+1 >= this._width || y+1 >= this._height) { return false; }
	return (this._map[x][y] == 1);
}

/**
 * @author hyakugei
 * @class Dungeon generator which uses the "orginal" Rogue dungeon generation algorithm. See http://kuoi.com/~kamikaze/GameDesign/art07_rogue_dungeon.php
 * @augments ROT.Map
 * @param {int} [width=ROT.DEFAULT_WIDTH]
 * @param {int} [height=ROT.DEFAULT_HEIGHT]
 * @param {object} [options] Options
 * @param {int[]} [options.cellWidth=3] Number of cells to create on the horizontal (number of rooms horizontally)
 * @param {int[]} [options.cellHeight=3] Number of cells to create on the vertical (number of rooms vertically) 
 * @param {int} [options.roomWidth] Room min and max width - normally set auto-magically via the constructor.
 * @param {int} [options.roomHeight] Room min and max height - normally set auto-magically via the constructor. 
 */
ROT.Map.Rogue = function(width, height, options) {
	ROT.Map.call(this, width, height);
	
	this._options = {
		cellWidth: 3,  // NOTE to self, these could probably work the same as the roomWidth/room Height values
		cellHeight: 3  //     ie. as an array with min-max values for each direction....
	}
	
	for (var p in options) { this._options[p] = options[p]; }
	
	/*
	Set the room sizes according to the over-all width of the map, 
	and the cell sizes. 
	*/
	
	if (!this._options.hasOwnProperty("roomWidth")) {
		this._options["roomWidth"] = this._calculateRoomSize(width, this._options["cellWidth"]);
	}
	if (!this._options.hasOwnProperty["roomHeight"]) {
		this._options["roomHeight"] = this._calculateRoomSize(height, this._options["cellHeight"]);
	}
	
}

ROT.Map.Rogue.extend(ROT.Map); 

/**
 * @see ROT.Map#create
 */
ROT.Map.Rogue.prototype.create = function(callback) {
	this.map = this._fillMap(1);
	this.rooms = [];
	this.connectedCells = [];
	
	this._initRooms();
	this._connectRooms();
	this._connectUnconnectedRooms();
	this._createRandomRoomConnections();
	this._createRooms();
	this._createCorridors();
	
	if (callback) {
		for (var i = 0; i < this._width; i++) {
			for (var j = 0; j < this._height; j++) {
				callback(i, j, this.map[i][j]);   
			}
		}
	}
	
	return this;
}

ROT.Map.Rogue.prototype._getRandomInt = function(min, max) {
	return Math.floor(ROT.RNG.getUniform() * (max - min + 1)) + min;
}

ROT.Map.Rogue.prototype._calculateRoomSize = function(size, cell) {
	var max = Math.floor((size/cell) * 0.8);
	var min = Math.floor((size/cell) * 0.25);
	if (min < 2) min = 2;
	if (max < 2) max = 2;
	return [min, max];
}

ROT.Map.Rogue.prototype._initRooms = function () { 
	// create rooms array. This is the "grid" list from the algo.  
	for (var i = 0; i < this._options.cellWidth; i++) {  
		this.rooms.push([]);
		for(var j = 0; j < this._options.cellHeight; j++) {
			this.rooms[i].push({"x":0, "y":0, "width":0, "height":0, "connections":[], "cellx":i, "celly":j});
		}
	}
}

ROT.Map.Rogue.prototype._connectRooms = function() {
	//pick random starting grid
	var cgx = this._getRandomInt(0, this._options.cellWidth-1);
	var cgy = this._getRandomInt(0, this._options.cellHeight-1);
	
	var idx;
	var ncgx;
	var ncgy;
	
	var found = false;
	var room;
	var otherRoom;
	
	// find  unconnected neighbour cells
	do {
	
		//var dirToCheck = [0,1,2,3,4,5,6,7];
		var dirToCheck = [0,2,4,6];
		dirToCheck = dirToCheck.randomize();
		
		do {
			found = false;
			idx = dirToCheck.pop();
			
			
			ncgx = cgx + ROT.DIRS[8][idx][0];
			ncgy = cgy + ROT.DIRS[8][idx][1];
			
			if(ncgx < 0 || ncgx >= this._options.cellWidth) continue;
			if(ncgy < 0 || ncgy >= this._options.cellHeight) continue;
			
			room = this.rooms[cgx][cgy];
			
			if(room["connections"].length > 0)
			{
				// as long as this room doesn't already coonect to me, we are ok with it. 
				if(room["connections"][0][0] == ncgx &&
				room["connections"][0][1] == ncgy)
				{
					break;
				}
			}
			
			otherRoom = this.rooms[ncgx][ncgy];
			
			if (otherRoom["connections"].length == 0) { 
				otherRoom["connections"].push([cgx,cgy]);
				
				this.connectedCells.push([ncgx, ncgy]);
				cgx = ncgx;
				cgy = ncgy;
				found = true;
			}
					
		} while (dirToCheck.length > 0 && found == false)
		
	} while (dirToCheck.length > 0)

}

ROT.Map.Rogue.prototype._connectUnconnectedRooms = function() {
	//While there are unconnected rooms, try to connect them to a random connected neighbor 
	//(if a room has no connected neighbors yet, just keep cycling, you'll fill out to it eventually).
	var cw = this._options.cellWidth;
	var ch = this._options.cellHeight;
	
	var randomConnectedCell;
	this.connectedCells = this.connectedCells.randomize();
	var room;
	var otherRoom;
	var validRoom;
	
	for (var i = 0; i < this._options.cellWidth; i++) {
		for (var j = 0; j < this._options.cellHeight; j++)  {
				
			room = this.rooms[i][j];
			
			if (room["connections"].length == 0) {
				var directions = [0,2,4,6];
				directions = directions.randomize();
				
				var validRoom = false;
				
				do {
					
					var dirIdx = directions.pop();
					var newI = i + ROT.DIRS[8][dirIdx][0];
					var newJ = j + ROT.DIRS[8][dirIdx][1];
					
					if (newI < 0 || newI >= cw || 
					newJ < 0 || newJ >= ch) {
						continue;
					}
					
					otherRoom = this.rooms[newI][newJ];
					
					validRoom = true;
					
					if (otherRoom["connections"].length == 0) {
						break;
					}
					
					for (var k = 0; k < otherRoom["connections"].length; k++) {
						if(otherRoom["connections"][k][0] == i && 
						otherRoom["connections"][k][1] == j) {
							validRoom = false;
							break;
						}
					}
					
					if (validRoom) break;
					
				} while (directions.length)
				
				if(validRoom) { 
					room["connections"].push( [otherRoom["cellx"], otherRoom["celly"]] );  
				} else {
					console.log("-- Unable to connect room.");
				}
			}
		}
	}
}

ROT.Map.Rogue.prototype._createRandomRoomConnections = function(connections) {
	// Empty for now. 
}


ROT.Map.Rogue.prototype._createRooms = function() {
	// Create Rooms 
	
	var w = this._width;
	var h = this._height;
	
	var cw = this._options.cellWidth;
	var ch = this._options.cellHeight;
	
	var cwp = Math.floor(this._width / cw);
	var chp = Math.floor(this._height / ch);
	
	var roomw;
	var roomh;
	var roomWidth = this._options["roomWidth"];
	var roomHeight = this._options["roomHeight"];
	var sx;
	var sy;
	var tx;
	var ty;
	var otherRoom;
	
	for (var i = 0; i < cw; i++) {
		for (var j = 0; j < ch; j++) {
			sx = cwp * i;
			sy = chp * j;
			
			if (sx == 0) sx = 1;
			if (sy == 0) sy = 1;
			
			roomw = this._getRandomInt(roomWidth[0], roomWidth[1]);
			roomh = this._getRandomInt(roomHeight[0], roomHeight[1]);
			
			if (j > 0) {
				otherRoom = this.rooms[i][j-1];
				while (sy - (otherRoom["y"] + otherRoom["height"] ) < 3) {
					sy++;
				}
			}
			
			if (i > 0) {
				otherRoom = this.rooms[i-1][j];
				while(sx - (otherRoom["x"] + otherRoom["width"]) < 3) {
					sx++;
				}
			}
						
			var sxOffset = Math.round(this._getRandomInt(0, cwp-roomw)/2);
			var syOffset = Math.round(this._getRandomInt(0, chp-roomh)/2);
			
			while (sx + sxOffset + roomw >= w) {
				if(sxOffset) {
					sxOffset--;
				} else {
					roomw--; 
				}
			}
			
			while (sy + syOffset + roomh >= h) { 
				if(syOffset) {
					syOffset--;
				} else {
					roomh--; 
				}
			}
			
			sx = sx + sxOffset;
			sy = sy + syOffset;
			
			this.rooms[i][j]["x"] = sx;
			this.rooms[i][j]["y"] = sy;
			this.rooms[i][j]["width"] = roomw;
			this.rooms[i][j]["height"] = roomh;  
			
			for (var ii = sx; ii < sx + roomw; ii++) {
				for (var jj = sy; jj < sy + roomh; jj++) {
					this.map[ii][jj] = 0;
				}
			}  
		}
	}
}

ROT.Map.Rogue.prototype._getWallPosition = function(aRoom, aDirection) {
	var rx;
	var ry;
	var door;
	
	if (aDirection == 1 || aDirection == 3) {
		rx = this._getRandomInt(aRoom["x"] + 1, aRoom["x"] + aRoom["width"] - 2);
		if (aDirection == 1) {
			ry = aRoom["y"] - 2;
			door = ry + 1;
		} else {
			ry = aRoom["y"] + aRoom["height"] + 1;
			door = ry -1;
		}
		
		this.map[rx][door] = 0; // i'm not setting a specific 'door' tile value right now, just empty space. 
		
	} else if (aDirection == 2 || aDirection == 4) {
		ry = this._getRandomInt(aRoom["y"] + 1, aRoom["y"] + aRoom["height"] - 2);
		if(aDirection == 2) {
			rx = aRoom["x"] + aRoom["width"] + 1;
			door = rx - 1;
		} else {
			rx = aRoom["x"] - 2;
			door = rx + 1;
		}
		
		this.map[door][ry] = 0; // i'm not setting a specific 'door' tile value right now, just empty space. 
		
	}
	return [rx, ry];
}

/***
* @param startPosition a 2 element array
* @param endPosition a 2 element array
*/
ROT.Map.Rogue.prototype._drawCorridore = function (startPosition, endPosition) {
	var xOffset = endPosition[0] - startPosition[0];
	var yOffset = endPosition[1] - startPosition[1];
	
	var xpos = startPosition[0];
	var ypos = startPosition[1];
	
	var tempDist;
	var xDir;
	var yDir;
	
	var move; // 2 element array, element 0 is the direction, element 1 is the total value to move. 
	var moves = []; // a list of 2 element arrays
	
	var xAbs = Math.abs(xOffset);
	var yAbs = Math.abs(yOffset);
	
	var percent = ROT.RNG.getUniform(); // used to split the move at different places along the long axis
	var firstHalf = percent;
	var secondHalf = 1 - percent;
	
	xDir = xOffset > 0 ? 2 : 6;
	yDir = yOffset > 0 ? 4 : 0;
	
	if (xAbs < yAbs) {
		// move firstHalf of the y offset
		tempDist = Math.ceil(yAbs * firstHalf);
		moves.push([yDir, tempDist]);
		// move all the x offset
		moves.push([xDir, xAbs]);
		// move sendHalf of the  y offset
		tempDist = Math.floor(yAbs * secondHalf);
		moves.push([yDir, tempDist]);
	} else {
		//  move firstHalf of the x offset
		tempDist = Math.ceil(xAbs * firstHalf);
		moves.push([xDir, tempDist]);
		// move all the y offset
		moves.push([yDir, yAbs]);
		// move secondHalf of the x offset.
		tempDist = Math.floor(xAbs * secondHalf);
		moves.push([xDir, tempDist]);  
	}
	
	this.map[xpos][ypos] = 0;
	
	while (moves.length > 0) {
		move = moves.pop();
		while (move[1] > 0) {
			xpos += ROT.DIRS[8][move[0]][0];
			ypos += ROT.DIRS[8][move[0]][1];
			this.map[xpos][ypos] = 0;
			move[1] = move[1] - 1;
		}
	}
}

ROT.Map.Rogue.prototype._createCorridors = function () {
	// Draw Corridors between connected rooms
	
	var cw = this._options.cellWidth;
	var ch = this._options.cellHeight;
	var room;
	var connection;
	var otherRoom;
	var wall;
	var otherWall;
	
	for (var i = 0; i < cw; i++) {
		for (var j = 0; j < ch; j++) {
			room = this.rooms[i][j];
			
			for (var k = 0; k < room["connections"].length; k++) {
					
				connection = room["connections"][k]; 
				
				otherRoom = this.rooms[connection[0]][connection[1]];
				
				// figure out what wall our corridor will start one.
				// figure out what wall our corridor will end on. 
				if (otherRoom["cellx"] > room["cellx"] ) {
					wall = 2;
					otherWall = 4;
				} else if (otherRoom["cellx"] < room["cellx"] ) {
					wall = 4;
					otherWall = 2;
				} else if(otherRoom["celly"] > room["celly"]) {
					wall = 3;
					otherWall = 1;
				} else if(otherRoom["celly"] < room["celly"]) {
					wall = 1;
					otherWall = 3;
				}
				
				this._drawCorridore(this._getWallPosition(room, wall), this._getWallPosition(otherRoom, otherWall));
			}
		}
	}
}
/**
 * @class Dungeon feature; has own .create() method
 */
ROT.Map.Feature = function() {}
ROT.Map.Feature.prototype.isValid = function(canBeDugCallback) {}
ROT.Map.Feature.prototype.create = function(digCallback) {}
ROT.Map.Feature.prototype.debug = function() {}
ROT.Map.Feature.createRandomAt = function(x, y, dx, dy, options) {}

/**
 * @class Room
 * @augments ROT.Map.Feature
 * @param {int} x1
 * @param {int} y1
 * @param {int} x2
 * @param {int} y2
 * @param {int} [doorX]
 * @param {int} [doorY]
 */
ROT.Map.Feature.Room = function(x1, y1, x2, y2, doorX, doorY) {
	this._x1 = x1;
	this._y1 = y1;
	this._x2 = x2;
	this._y2 = y2;
	this._doors = {};
	if (arguments.length > 4) { this.addDoor(doorX, doorY); }
}
ROT.Map.Feature.Room.extend(ROT.Map.Feature);

/**
 * Room of random size, with a given doors and direction
 */
ROT.Map.Feature.Room.createRandomAt = function(x, y, dx, dy, options) {
	var min = options.roomWidth[0];
	var max = options.roomWidth[1];
	var width = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));
	
	var min = options.roomHeight[0];
	var max = options.roomHeight[1];
	var height = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));
	
	if (dx == 1) { /* to the right */
		var y2 = y - Math.floor(ROT.RNG.getUniform() * height);
		return new this(x+1, y2, x+width, y2+height-1, x, y);
	}
	
	if (dx == -1) { /* to the left */
		var y2 = y - Math.floor(ROT.RNG.getUniform() * height);
		return new this(x-width, y2, x-1, y2+height-1, x, y);
	}

	if (dy == 1) { /* to the bottom */
		var x2 = x - Math.floor(ROT.RNG.getUniform() * width);
		return new this(x2, y+1, x2+width-1, y+height, x, y);
	}

	if (dy == -1) { /* to the top */
		var x2 = x - Math.floor(ROT.RNG.getUniform() * width);
		return new this(x2, y-height, x2+width-1, y-1, x, y);
	}
}

/**
 * Room of random size, positioned around center coords
 */
ROT.Map.Feature.Room.createRandomCenter = function(cx, cy, options) {
	var min = options.roomWidth[0];
	var max = options.roomWidth[1];
	var width = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));
	
	var min = options.roomHeight[0];
	var max = options.roomHeight[1];
	var height = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));

	var x1 = cx - Math.floor(ROT.RNG.getUniform()*width);
	var y1 = cy - Math.floor(ROT.RNG.getUniform()*height);
	var x2 = x1 + width - 1;
	var y2 = y1 + height - 1;

	return new this(x1, y1, x2, y2);
}

/**
 * Room of random size within a given dimensions
 */
ROT.Map.Feature.Room.createRandom = function(availWidth, availHeight, options) {
	var min = options.roomWidth[0];
	var max = options.roomWidth[1];
	var width = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));
	
	var min = options.roomHeight[0];
	var max = options.roomHeight[1];
	var height = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));
	
	var left = availWidth - width - 1;
	var top = availHeight - height - 1;

	var x1 = 1 + Math.floor(ROT.RNG.getUniform()*left);
	var y1 = 1 + Math.floor(ROT.RNG.getUniform()*top);
	var x2 = x1 + width - 1;
	var y2 = y1 + height - 1;

	return new this(x1, y1, x2, y2);
}

ROT.Map.Feature.Room.prototype.addDoor = function(x, y) {
	this._doors[x+","+y] = 1;
	return this;
}

/**
 * @param {function}
 */
ROT.Map.Feature.Room.prototype.getDoors = function(callback) {
	for (var key in this._doors) {
		var parts = key.split(",");
		callback(parseInt(parts[0]), parseInt(parts[1]));
	}
	return this;
}

ROT.Map.Feature.Room.prototype.clearDoors = function() {
	this._doors = {};
	return this;
}

ROT.Map.Feature.Room.prototype.addDoors = function(isWallCallback) {
	var left = this._x1-1;
	var right = this._x2+1;
	var top = this._y1-1;
	var bottom = this._y2+1;

	for (var x=left; x<=right; x++) {
		for (var y=top; y<=bottom; y++) {
			if (x != left && x != right && y != top && y != bottom) { continue; }
			if (isWallCallback(x, y)) { continue; }

			this.addDoor(x, y);
		}
	}

	return this;
}

ROT.Map.Feature.Room.prototype.debug = function() {
	console.log("room", this._x1, this._y1, this._x2, this._y2);
}

ROT.Map.Feature.Room.prototype.isValid = function(isWallCallback, canBeDugCallback) { 
	var left = this._x1-1;
	var right = this._x2+1;
	var top = this._y1-1;
	var bottom = this._y2+1;
	
	for (var x=left; x<=right; x++) {
		for (var y=top; y<=bottom; y++) {
			if (x == left || x == right || y == top || y == bottom) {
				if (!isWallCallback(x, y)) { return false; }
			} else {
				if (!canBeDugCallback(x, y)) { return false; }
			}
		}
	}

	return true;
}

/**
 * @param {function} digCallback Dig callback with a signature (x, y, value). Values: 0 = empty, 1 = wall, 2 = door. Multiple doors are allowed.
 */
ROT.Map.Feature.Room.prototype.create = function(digCallback) { 
	var left = this._x1-1;
	var right = this._x2+1;
	var top = this._y1-1;
	var bottom = this._y2+1;
	
	var value = 0;
	for (var x=left; x<=right; x++) {
		for (var y=top; y<=bottom; y++) {
			if (x+","+y in this._doors) {
				value = 2;
			} else if (x == left || x == right || y == top || y == bottom) {
				value = 1;
			} else {
				value = 0;
			}
			digCallback(x, y, value);
		}
	}
}

ROT.Map.Feature.Room.prototype.getCenter = function() {
	return [Math.round((this._x1 + this._x2)/2), Math.round((this._y1 + this._y2)/2)];
}

ROT.Map.Feature.Room.prototype.getLeft = function() {
	return this._x1;
}

ROT.Map.Feature.Room.prototype.getRight = function() {
	return this._x2;
}

ROT.Map.Feature.Room.prototype.getTop = function() {
	return this._y1;
}

ROT.Map.Feature.Room.prototype.getBottom = function() {
	return this._y2;
}

/**
 * @class Corridor
 * @augments ROT.Map.Feature
 * @param {int} startX
 * @param {int} startY
 * @param {int} endX
 * @param {int} endY
 */
ROT.Map.Feature.Corridor = function(startX, startY, endX, endY) {
	this._startX = startX;
	this._startY = startY;
	this._endX = endX; 
	this._endY = endY;
	this._endsWithAWall = true;
}
ROT.Map.Feature.Corridor.extend(ROT.Map.Feature);

ROT.Map.Feature.Corridor.createRandomAt = function(x, y, dx, dy, options) {
	var min = options.corridorLength[0];
	var max = options.corridorLength[1];
	var length = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));
	
	return new this(x, y, x + dx*length, y + dy*length);
}

ROT.Map.Feature.Corridor.prototype.debug = function() {
	console.log("corridor", this._startX, this._startY, this._endX, this._endY);
}

ROT.Map.Feature.Corridor.prototype.isValid = function(isWallCallback, canBeDugCallback){ 
	var sx = this._startX;
	var sy = this._startY;
	var dx = this._endX-sx;
	var dy = this._endY-sy;
	var length = 1 + Math.max(Math.abs(dx), Math.abs(dy));
	
	if (dx) { dx = dx/Math.abs(dx); }
	if (dy) { dy = dy/Math.abs(dy); }
	var nx = dy;
	var ny = -dx;
	
	var ok = true;
	for (var i=0; i<length; i++) {
		var x = sx + i*dx;
		var y = sy + i*dy;

		if (!canBeDugCallback(     x,      y)) { ok = false; }
		if (!isWallCallback  (x + nx, y + ny)) { ok = false; }
		if (!isWallCallback  (x - nx, y - ny)) { ok = false; }
		
		if (!ok) {
			length = i;
			this._endX = x-dx;
			this._endY = y-dy;
			break;
		}
	}
	
	/**
	 * If the length degenerated, this corridor might be invalid
	 */
	 
	/* not supported */
	if (length == 0) { return false; } 
	
	 /* length 1 allowed only if the next space is empty */
	if (length == 1 && isWallCallback(this._endX + dx, this._endY + dy)) { return false; }
	
	/**
	 * We do not want the corridor to crash into a corner of a room;
	 * if any of the ending corners is empty, the N+1th cell of this corridor must be empty too.
	 * 
	 * Situation:
	 * #######1
	 * .......?
	 * #######2
	 * 
	 * The corridor was dug from left to right.
	 * 1, 2 - problematic corners, ? = N+1th cell (not dug)
	 */
	var firstCornerBad = !isWallCallback(this._endX + dx + nx, this._endY + dy + ny);
	var secondCornerBad = !isWallCallback(this._endX + dx - nx, this._endY + dy - ny);
	this._endsWithAWall = isWallCallback(this._endX + dx, this._endY + dy);
	if ((firstCornerBad || secondCornerBad) && this._endsWithAWall) { return false; }

	return true;
}

/**
 * @param {function} digCallback Dig callback with a signature (x, y, value). Values: 0 = empty.
 */
ROT.Map.Feature.Corridor.prototype.create = function(digCallback) { 
	var sx = this._startX;
	var sy = this._startY;
	var dx = this._endX-sx;
	var dy = this._endY-sy;
	var length = 1+Math.max(Math.abs(dx), Math.abs(dy));
	
	if (dx) { dx = dx/Math.abs(dx); }
	if (dy) { dy = dy/Math.abs(dy); }
	var nx = dy;
	var ny = -dx;
	
	for (var i=0; i<length; i++) {
		var x = sx + i*dx;
		var y = sy + i*dy;
		digCallback(x, y, 0);
	}
	
	return true;
}

ROT.Map.Feature.Corridor.prototype.createPriorityWalls = function(priorityWallCallback) {
	if (!this._endsWithAWall) { return; }

	var sx = this._startX;
	var sy = this._startY;

	var dx = this._endX-sx;
	var dy = this._endY-sy;
	if (dx) { dx = dx/Math.abs(dx); }
	if (dy) { dy = dy/Math.abs(dy); }
	var nx = dy;
	var ny = -dx;

	priorityWallCallback(this._endX + dx, this._endY + dy);
	priorityWallCallback(this._endX + nx, this._endY + ny);
	priorityWallCallback(this._endX - nx, this._endY - ny);
}/**
 * @class Base noise generator
 */
ROT.Noise = function() {
};

ROT.Noise.prototype.get = function(x, y) {}
/**
 * A simple 2d implementation of simplex noise by Ondrej Zara
 *
 * Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
 * Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 */

/**
 * @class 2D simplex noise generator
 * @param {int} [gradients=256] Random gradients
 */
ROT.Noise.Simplex = function(gradients) {
	ROT.Noise.call(this);

	this._F2 = 0.5 * (Math.sqrt(3) - 1);
    this._G2 = (3 - Math.sqrt(3)) / 6;

	this._gradients = [
		[ 0, -1],
		[ 1, -1],
		[ 1,  0],
		[ 1,  1],
		[ 0,  1],
		[-1,  1],
		[-1,  0],
		[-1, -1]
	];

	var permutations = [];
	var count = gradients || 256;
	for (var i=0;i<count;i++) { permutations.push(i); }
	permutations = permutations.randomize();

	this._perms = [];
	this._indexes = [];

	for (var i=0;i<2*count;i++) {
		this._perms.push(permutations[i % count]);
		this._indexes.push(this._perms[i] % this._gradients.length);
	}

};
ROT.Noise.Simplex.extend(ROT.Noise);

ROT.Noise.Simplex.prototype.get = function(xin, yin) {
	var perms = this._perms;
	var indexes = this._indexes;
	var count = perms.length/2;
	var G2 = this._G2;

	var n0 =0, n1 = 0, n2 = 0, gi; // Noise contributions from the three corners

	// Skew the input space to determine which simplex cell we're in
	var s = (xin + yin) * this._F2; // Hairy factor for 2D
	var i = Math.floor(xin + s);
	var j = Math.floor(yin + s);
	var t = (i + j) * G2;
	var X0 = i - t; // Unskew the cell origin back to (x,y) space
	var Y0 = j - t;
	var x0 = xin - X0; // The x,y distances from the cell origin
	var y0 = yin - Y0;

	// For the 2D case, the simplex shape is an equilateral triangle.
	// Determine which simplex we are in.
	var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
	if (x0 > y0) {
		i1 = 1;
		j1 = 0;
	} else { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
		i1 = 0;
		j1 = 1;
	} // upper triangle, YX order: (0,0)->(0,1)->(1,1)

	// A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
	// a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
	// c = (3-sqrt(3))/6
	var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
	var y1 = y0 - j1 + G2;
	var x2 = x0 - 1 + 2*G2; // Offsets for last corner in (x,y) unskewed coords
	var y2 = y0 - 1 + 2*G2;

	// Work out the hashed gradient indices of the three simplex corners
	var ii = i.mod(count);
	var jj = j.mod(count);

	// Calculate the contribution from the three corners
	var t0 = 0.5 - x0*x0 - y0*y0;
	if (t0 >= 0) {
		t0 *= t0;
		gi = indexes[ii+perms[jj]];
		var grad = this._gradients[gi];
		n0 = t0 * t0 * (grad[0] * x0 + grad[1] * y0);
	}
	
	var t1 = 0.5 - x1*x1 - y1*y1;
	if (t1 >= 0) {
		t1 *= t1;
		gi = indexes[ii+i1+perms[jj+j1]];
		var grad = this._gradients[gi];
		n1 = t1 * t1 * (grad[0] * x1 + grad[1] * y1);
	}
	
	var t2 = 0.5 - x2*x2 - y2*y2;
	if (t2 >= 0) {
		t2 *= t2;
		gi = indexes[ii+1+perms[jj+1]];
		var grad = this._gradients[gi];
		n2 = t2 * t2 * (grad[0] * x2 + grad[1] * y2);
	}

	// Add contributions from each corner to get the final noise value.
	// The result is scaled to return values in the interval [-1,1].
	return 70 * (n0 + n1 + n2);
}
/**
 * @class Abstract FOV algorithm
 * @param {function} lightPassesCallback Does the light pass through x,y?
 * @param {object} [options]
 * @param {int} [options.topology=8] 4/6/8
 */
ROT.FOV = function(lightPassesCallback, options) {
	this._lightPasses = lightPassesCallback;
	this._options = {
		topology: 8
	}
	for (var p in options) { this._options[p] = options[p]; }
};

/**
 * Compute visibility for a 360-degree circle
 * @param {int} x
 * @param {int} y
 * @param {int} R Maximum visibility radius
 * @param {function} callback
 */
ROT.FOV.prototype.compute = function(x, y, R, callback) {}

/**
 * Return all neighbors in a concentric ring
 * @param {int} cx center-x
 * @param {int} cy center-y
 * @param {int} r range
 */
ROT.FOV.prototype._getCircle = function(cx, cy, r) {
	var result = [];
	var dirs, countFactor, startOffset;

	switch (this._options.topology) {
		case 4:
			countFactor = 1;
			startOffset = [0, 1];
			dirs = [
				ROT.DIRS[8][7],
				ROT.DIRS[8][1],
				ROT.DIRS[8][3],
				ROT.DIRS[8][5]
			]
		break;

		case 6:
			dirs = ROT.DIRS[6];
			countFactor = 1;
			startOffset = [-1, 1];
		break;

		case 8:
			dirs = ROT.DIRS[4];
			countFactor = 2;
			startOffset = [-1, 1];
		break;
	}

	/* starting neighbor */
	var x = cx + startOffset[0]*r;
	var y = cy + startOffset[1]*r;

	/* circle */
	for (var i=0;i<dirs.length;i++) {
		for (var j=0;j<r*countFactor;j++) {
			result.push([x, y]);
			x += dirs[i][0];
			y += dirs[i][1];

		}
	}

	return result;
}
/**
 * @class Discrete shadowcasting algorithm. Obsoleted by Precise shadowcasting.
 * @augments ROT.FOV
 */
ROT.FOV.DiscreteShadowcasting = function(lightPassesCallback, options) {
	ROT.FOV.call(this, lightPassesCallback, options);
}
ROT.FOV.DiscreteShadowcasting.extend(ROT.FOV);

/**
 * @see ROT.FOV#compute
 */
ROT.FOV.DiscreteShadowcasting.prototype.compute = function(x, y, R, callback) {
	var center = this._coords;
	var map = this._map;

	/* this place is always visible */
	callback(x, y, 0);

	/* standing in a dark place. FIXME is this a good idea?  */
	if (!this._lightPasses(x, y)) { return; }
	
	/* start and end angles */
	var DATA = [];
	
	var A, B, cx, cy, blocks;

	/* analyze surrounding cells in concentric rings, starting from the center */
	for (var r=1; r<=R; r++) {
		var neighbors = this._getCircle(x, y, r);
		var angle = 360 / neighbors.length;

		for (var i=0;i<neighbors.length;i++) {
			cx = neighbors[i][0];
			cy = neighbors[i][1];
			A = angle * (i - 0.5);
			B = A + angle;
			
			blocks = !this._lightPasses(cx, cy);
			if (this._visibleCoords(Math.floor(A), Math.ceil(B), blocks, DATA)) { callback(cx, cy, r, 1); }
			
			if (DATA.length == 2 && DATA[0] == 0 && DATA[1] == 360) { return; } /* cutoff? */

		} /* for all cells in this ring */
	} /* for all rings */
}

/**
 * @param {int} A start angle
 * @param {int} B end angle
 * @param {bool} blocks Does current cell block visibility?
 * @param {int[][]} DATA shadowed angle pairs
 */
ROT.FOV.DiscreteShadowcasting.prototype._visibleCoords = function(A, B, blocks, DATA) {
	if (A < 0) { 
		var v1 = arguments.callee(0, B, blocks, DATA);
		var v2 = arguments.callee(360+A, 360, blocks, DATA);
		return v1 || v2;
	}
	
	var index = 0;
	while (index < DATA.length && DATA[index] < A) { index++; }
	
	if (index == DATA.length) { /* completely new shadow */
		if (blocks) { DATA.push(A, B); } 
		return true;
	}
	
	var count = 0;
	
	if (index % 2) { /* this shadow starts in an existing shadow, or within its ending boundary */
		while (index < DATA.length && DATA[index] < B) {
			index++;
			count++;
		}
		
		if (count == 0) { return false; }
		
		if (blocks) { 
			if (count % 2) {
				DATA.splice(index-count, count, B);
			} else {
				DATA.splice(index-count, count);
			}
		}
		
		return true;

	} else { /* this shadow starts outside an existing shadow, or within a starting boundary */
		while (index < DATA.length && DATA[index] < B) {
			index++;
			count++;
		}
		
		/* visible when outside an existing shadow, or when overlapping */
		if (A == DATA[index-count] && count == 1) { return false; }
		
		if (blocks) { 
			if (count % 2) {
				DATA.splice(index-count, count, A);
			} else {
				DATA.splice(index-count, count, A, B);
			}
		}
			
		return true;
	}
}
/**
 * @class Precise shadowcasting algorithm
 * @augments ROT.FOV
 */
ROT.FOV.PreciseShadowcasting = function(lightPassesCallback, options) {
	ROT.FOV.call(this, lightPassesCallback, options);
}
ROT.FOV.PreciseShadowcasting.extend(ROT.FOV);

/**
 * @see ROT.FOV#compute
 */
ROT.FOV.PreciseShadowcasting.prototype.compute = function(x, y, R, callback) {
	/* this place is always visible */
	callback(x, y, 0, 1);

	/* standing in a dark place. FIXME is this a good idea?  */
	if (!this._lightPasses(x, y)) { return; }
	
	/* list of all shadows */
	var SHADOWS = [];
	
	var cx, cy, blocks, A1, A2, visibility;

	/* analyze surrounding cells in concentric rings, starting from the center */
	for (var r=1; r<=R; r++) {
		var neighbors = this._getCircle(x, y, r);
		var neighborCount = neighbors.length;

		for (var i=0;i<neighborCount;i++) {
			cx = neighbors[i][0];
			cy = neighbors[i][1];
			/* shift half-an-angle backwards to maintain consistency of 0-th cells */
			A1 = [i ? 2*i-1 : 2*neighborCount-1, 2*neighborCount];
			A2 = [2*i+1, 2*neighborCount]; 
			
			blocks = !this._lightPasses(cx, cy);
			visibility = this._checkVisibility(A1, A2, blocks, SHADOWS);
			if (visibility) { callback(cx, cy, r, visibility); }

			if (SHADOWS.length == 2 && SHADOWS[0][0] == 0 && SHADOWS[1][0] == SHADOWS[1][1]) { return; } /* cutoff? */

		} /* for all cells in this ring */
	} /* for all rings */
}

/**
 * @param {int[2]} A1 arc start
 * @param {int[2]} A2 arc end
 * @param {bool} blocks Does current arc block visibility?
 * @param {int[][]} SHADOWS list of active shadows
 */
ROT.FOV.PreciseShadowcasting.prototype._checkVisibility = function(A1, A2, blocks, SHADOWS) {
	if (A1[0] > A2[0]) { /* split into two sub-arcs */
		var v1 = this._checkVisibility(A1, [A1[1], A1[1]], blocks, SHADOWS);
		var v2 = this._checkVisibility([0, 1], A2, blocks, SHADOWS);
		return (v1+v2)/2;
	}

	/* index1: first shadow >= A1 */
	var index1 = 0, edge1 = false;
	while (index1 < SHADOWS.length) {
		var old = SHADOWS[index1];
		var diff = old[0]*A1[1] - A1[0]*old[1];
		if (diff >= 0) { /* old >= A1 */
			if (diff == 0 && !(index1 % 2)) { edge1 = true; }
			break;
		}
		index1++;
	}

	/* index2: last shadow <= A2 */
	var index2 = SHADOWS.length, edge2 = false;
	while (index2--) {
		var old = SHADOWS[index2];
		var diff = A2[0]*old[1] - old[0]*A2[1];
		if (diff >= 0) { /* old <= A2 */
			if (diff == 0 && (index2 % 2)) { edge2 = true; }
			break;
		}
	}

	var visible = true;
	if (index1 == index2 && (edge1 || edge2)) {  /* subset of existing shadow, one of the edges match */
		visible = false; 
	} else if (edge1 && edge2 && index1+1==index2 && (index2 % 2)) { /* completely equivalent with existing shadow */
		visible = false;
	} else if (index1 > index2 && (index1 % 2)) { /* subset of existing shadow, not touching */
		visible = false;
	}
	
	if (!visible) { return 0; } /* fast case: not visible */
	
	var visibleLength, P;

	/* compute the length of visible arc, adjust list of shadows (if blocking) */
	var remove = index2-index1+1;
	if (remove % 2) {
		if (index1 % 2) { /* first edge within existing shadow, second outside */
			var P = SHADOWS[index1];
			visibleLength = (A2[0]*P[1] - P[0]*A2[1]) / (P[1] * A2[1]);
			if (blocks) { SHADOWS.splice(index1, remove, A2); }
		} else { /* second edge within existing shadow, first outside */
			var P = SHADOWS[index2];
			visibleLength = (P[0]*A1[1] - A1[0]*P[1]) / (A1[1] * P[1]);
			if (blocks) { SHADOWS.splice(index1, remove, A1); }
		}
	} else {
		if (index1 % 2) { /* both edges within existing shadows */
			var P1 = SHADOWS[index1];
			var P2 = SHADOWS[index2];
			visibleLength = (P2[0]*P1[1] - P1[0]*P2[1]) / (P1[1] * P2[1]);
			if (blocks) { SHADOWS.splice(index1, remove); }
		} else { /* both edges outside existing shadows */
			if (blocks) { SHADOWS.splice(index1, remove, A1, A2); }
			return 1; /* whole arc visible! */
		}
	}

	var arcLength = (A2[0]*A1[1] - A1[0]*A2[1]) / (A1[1] * A2[1]);

	return visibleLength/arcLength;
}
/**
 * @class Recursive shadowcasting algorithm
 * Currently only supports 4/8 topologies, not hexagonal.
 * Based on Peter Harkins' implementation of Björn Bergström's algorithm described here: http://www.roguebasin.com/index.php?title=FOV_using_recursive_shadowcasting
 * @augments ROT.FOV
 */
ROT.FOV.RecursiveShadowcasting = function(lightPassesCallback, options) {
	ROT.FOV.call(this, lightPassesCallback, options);
}
ROT.FOV.RecursiveShadowcasting.extend(ROT.FOV);

/** Octants used for translating recursive shadowcasting offsets */
ROT.FOV.RecursiveShadowcasting.OCTANTS = [
	[-1,  0,  0,  1],
	[ 0, -1,  1,  0],
	[ 0, -1, -1,  0],
	[-1,  0,  0, -1],
	[ 1,  0,  0, -1],
	[ 0,  1, -1,  0],
	[ 0,  1,  1,  0],
	[ 1,  0,  0,  1]
];

/**
 * Compute visibility for a 360-degree circle
 * @param {int} x
 * @param {int} y
 * @param {int} R Maximum visibility radius
 * @param {function} callback
 */
ROT.FOV.RecursiveShadowcasting.prototype.compute = function(x, y, R, callback) {
	//You can always see your own tile
	callback(x, y, 0, true);
	for(var i = 0; i < ROT.FOV.RecursiveShadowcasting.OCTANTS.length; i++) {
		this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[i], R, callback);
	}
}

/**
 * Compute visibility for a 180-degree arc
 * @param {int} x
 * @param {int} y
 * @param {int} R Maximum visibility radius
 * @param {int} dir Direction to look in (expressed in a ROT.DIR value);
 * @param {function} callback
 */
ROT.FOV.RecursiveShadowcasting.prototype.compute180 = function(x, y, R, dir, callback) {
	//You can always see your own tile
	callback(x, y, 0, true);
	var previousOctant = (dir - 1 + 8) % 8; //Need to retrieve the previous octant to render a full 180 degrees
	var nextPreviousOctant = (dir - 2 + 8) % 8; //Need to retrieve the previous two octants to render a full 180 degrees
	var nextOctant = (dir+ 1 + 8) % 8; //Need to grab to next octant to render a full 180 degrees
	this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[nextPreviousOctant], R, callback);
	this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[previousOctant], R, callback);
	this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[dir], R, callback);
	this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[nextOctant], R, callback);
}

/**
 * Compute visibility for a 90-degree arc
 * @param {int} x
 * @param {int} y
 * @param {int} R Maximum visibility radius
 * @param {int} dir Direction to look in (expressed in a ROT.DIR value);
 * @param {function} callback
 */
ROT.FOV.RecursiveShadowcasting.prototype.compute90 = function(x, y, R, dir, callback) {
	//You can always see your own tile
	callback(x, y, 0, true);
	var previousOctant = (dir - 1 + 8) % 8; //Need to retrieve the previous octant to render a full 90 degrees
	this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[dir], R, callback);
	this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[previousOctant], R, callback);
}

/**
 * Render one octant (45-degree arc) of the viewshed
 * @param {int} x
 * @param {int} y
 * @param {int} octant Octant to be rendered
 * @param {int} R Maximum visibility radius
 * @param {function} callback
 */
ROT.FOV.RecursiveShadowcasting.prototype._renderOctant = function(x, y, octant, R, callback) {
	//Radius incremented by 1 to provide same coverage area as other shadowcasting radiuses
	this._castVisibility(x, y, 1, 1.0, 0.0, R + 1, octant[0], octant[1], octant[2], octant[3], callback);
}

/**
 * Actually calculates the visibility
 * @param {int} startX The starting X coordinate
 * @param {int} startY The starting Y coordinate
 * @param {int} row The row to render
 * @param {float} visSlopeStart The slope to start at
 * @param {float} visSlopeEnd The slope to end at
 * @param {int} radius The radius to reach out to
 * @param {int} xx 
 * @param {int} xy 
 * @param {int} yx 
 * @param {int} yy 
 * @param {function} callback The callback to use when we hit a block that is visible
 */
ROT.FOV.RecursiveShadowcasting.prototype._castVisibility = function(startX, startY, row, visSlopeStart, visSlopeEnd, radius, xx, xy, yx, yy, callback) {
	if(visSlopeStart < visSlopeEnd) { return; }
	for(var i = row; i <= radius; i++) {
		var dx = -i - 1;
		var dy = -i;
		var blocked = false;
		var newStart = 0;

		//'Row' could be column, names here assume octant 0 and would be flipped for half the octants
		while(dx <= 0) {
			dx += 1;

			//Translate from relative coordinates to map coordinates
			var mapX = startX + dx * xx + dy * xy;
			var mapY = startY + dx * yx + dy * yy;

			//Range of the row
			var slopeStart = (dx - 0.5) / (dy + 0.5);
			var slopeEnd = (dx + 0.5) / (dy - 0.5);
		
			//Ignore if not yet at left edge of Octant
			if(slopeEnd > visSlopeStart) { continue; }
			
			//Done if past right edge
			if(slopeStart < visSlopeEnd) { break; }
				
			//If it's in range, it's visible
			if((dx * dx + dy * dy) < (radius * radius)) {
				callback(mapX, mapY, i, true);
			}
	
			if(!blocked) {
				//If tile is a blocking tile, cast around it
				if(!this._lightPasses(mapX, mapY) && i < radius) {
					blocked = true;
					this._castVisibility(startX, startY, i + 1, visSlopeStart, slopeStart, radius, xx, xy, yx, yy, callback);
					newStart = slopeEnd;
				}
			} else {
				//Keep narrowing if scanning across a block
				if(!this._lightPasses(mapX, mapY)) {
					newStart = slopeEnd;
					continue;
				}
			
				//Block has ended
				blocked = false;
				visSlopeStart = newStart;
			}
		}
		if(blocked) { break; }
	}
}
/**
 * @namespace Color operations
 */
ROT.Color = {
	fromString: function(str) {
		var cached, r;
		if (str in this._cache) {
			cached = this._cache[str];
		} else {
			if (str.charAt(0) == "#") { /* hex rgb */

				var values = str.match(/[0-9a-f]/gi).map(function(x) { return parseInt(x, 16); });
				if (values.length == 3) {
					cached = values.map(function(x) { return x*17; });
				} else {
					for (var i=0;i<3;i++) {
						values[i+1] += 16*values[i];
						values.splice(i, 1);
					}
					cached = values;
				}

			} else if (r = str.match(/rgb\(([0-9, ]+)\)/i)) { /* decimal rgb */
				cached = r[1].split(/\s*,\s*/).map(function(x) { return parseInt(x); });
			} else { /* html name */
				cached = [0, 0, 0];
			}

			this._cache[str] = cached;
		}

		return cached.slice();
	},

	/**
	 * Add two or more colors
	 * @param {number[]} color1
	 * @param {number[]} color2
	 * @returns {number[]}
	 */
	add: function(color1, color2) {
		var result = color1.slice();
		for (var i=0;i<3;i++) {
			for (var j=1;j<arguments.length;j++) {
				result[i] += arguments[j][i];
			}
		}
		return result;
	},

	/**
	 * Add two or more colors, MODIFIES FIRST ARGUMENT
	 * @param {number[]} color1
	 * @param {number[]} color2
	 * @returns {number[]}
	 */
	add_: function(color1, color2) {
		for (var i=0;i<3;i++) {
			for (var j=1;j<arguments.length;j++) {
				color1[i] += arguments[j][i];
			}
		}
		return color1;
	},

	/**
	 * Multiply (mix) two or more colors
	 * @param {number[]} color1
	 * @param {number[]} color2
	 * @returns {number[]}
	 */
	multiply: function(color1, color2) {
		var result = color1.slice();
		for (var i=0;i<3;i++) {
			for (var j=1;j<arguments.length;j++) {
				result[i] *= arguments[j][i] / 255;
			}
			result[i] = Math.round(result[i]);
		}
		return result;
	},

	/**
	 * Multiply (mix) two or more colors, MODIFIES FIRST ARGUMENT
	 * @param {number[]} color1
	 * @param {number[]} color2
	 * @returns {number[]}
	 */
	multiply_: function(color1, color2) {
		for (var i=0;i<3;i++) {
			for (var j=1;j<arguments.length;j++) {
				color1[i] *= arguments[j][i] / 255;
			}
			color1[i] = Math.round(color1[i]);
		}
		return color1;
	},

	/**
	 * Interpolate (blend) two colors with a given factor
	 * @param {number[]} color1
	 * @param {number[]} color2
	 * @param {float} [factor=0.5] 0..1
	 * @returns {number[]}
	 */
	interpolate: function(color1, color2, factor) {
		if (arguments.length < 3) { factor = 0.5; }
		var result = color1.slice();
		for (var i=0;i<3;i++) {
			result[i] = Math.round(result[i] + factor*(color2[i]-color1[i]));
		}
		return result;
	},

	/**
	 * Interpolate (blend) two colors with a given factor in HSL mode
	 * @param {number[]} color1
	 * @param {number[]} color2
	 * @param {float} [factor=0.5] 0..1
	 * @returns {number[]}
	 */
	interpolateHSL: function(color1, color2, factor) {
		if (arguments.length < 3) { factor = 0.5; }
		var hsl1 = this.rgb2hsl(color1);
		var hsl2 = this.rgb2hsl(color2);
		for (var i=0;i<3;i++) {
			hsl1[i] += factor*(hsl2[i]-hsl1[i]);
		}
		return this.hsl2rgb(hsl1);
	},

	/**
	 * Create a new random color based on this one
	 * @param {number[]} color
	 * @param {number[]} diff Set of standard deviations
	 * @returns {number[]}
	 */
	randomize: function(color, diff) {
		if (!(diff instanceof Array)) { diff = ROT.RNG.getNormal(0, diff); }
		var result = color.slice();
		for (var i=0;i<3;i++) {
			result[i] += (diff instanceof Array ? Math.round(ROT.RNG.getNormal(0, diff[i])) : diff);
		}
		return result;
	},

	/**
	 * Converts an RGB color value to HSL. Expects 0..255 inputs, produces 0..1 outputs.
	 * @param {number[]} color
	 * @returns {number[]}
	 */
	rgb2hsl: function(color) {
		var r = color[0]/255;
		var g = color[1]/255;
		var b = color[2]/255;

		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;

		if (max == min) {
			h = s = 0; // achromatic
		} else {
			var d = max - min;
			s = (l > 0.5 ? d / (2 - max - min) : d / (max + min));
			switch(max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}

		return [h, s, l];
	},

	/**
	 * Converts an HSL color value to RGB. Expects 0..1 inputs, produces 0..255 outputs.
	 * @param {number[]} color
	 * @returns {number[]}
	 */
	hsl2rgb: function(color) {
		var l = color[2];

		if (color[1] == 0) {
			l = Math.round(l*255);
			return [l, l, l];
		} else {
			function hue2rgb(p, q, t) {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1/6) return p + (q - p) * 6 * t;
				if (t < 1/2) return q;
				if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			}

			var s = color[1];
			var q = (l < 0.5 ? l * (1 + s) : l + s - l * s);
			var p = 2 * l - q;
			var r = hue2rgb(p, q, color[0] + 1/3);
			var g = hue2rgb(p, q, color[0]);
			var b = hue2rgb(p, q, color[0] - 1/3);
			return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
		}
	},

	toRGB: function(color) {
		return "rgb(" + this._clamp(color[0]) + "," + this._clamp(color[1]) + "," + this._clamp(color[2]) + ")";
	},

	toHex: function(color) {
		var parts = [];
		for (var i=0;i<3;i++) {
			parts.push(this._clamp(color[i]).toString(16).lpad("0", 2));
		}
		return "#" + parts.join("");
	},

	_clamp: function(num) {
		if (num < 0) {
			return 0;
		} else if (num > 255) {
			return 255;
		} else {
			return num;
		}
	},

	_cache: {
		"black": [0,0,0],
		"navy": [0,0,128],
		"darkblue": [0,0,139],
		"mediumblue": [0,0,205],
		"blue": [0,0,255],
		"darkgreen": [0,100,0],
		"green": [0,128,0],
		"teal": [0,128,128],
		"darkcyan": [0,139,139],
		"deepskyblue": [0,191,255],
		"darkturquoise": [0,206,209],
		"mediumspringgreen": [0,250,154],
		"lime": [0,255,0],
		"springgreen": [0,255,127],
		"aqua": [0,255,255],
		"cyan": [0,255,255],
		"midnightblue": [25,25,112],
		"dodgerblue": [30,144,255],
		"forestgreen": [34,139,34],
		"seagreen": [46,139,87],
		"darkslategray": [47,79,79],
		"darkslategrey": [47,79,79],
		"limegreen": [50,205,50],
		"mediumseagreen": [60,179,113],
		"turquoise": [64,224,208],
		"royalblue": [65,105,225],
		"steelblue": [70,130,180],
		"darkslateblue": [72,61,139],
		"mediumturquoise": [72,209,204],
		"indigo": [75,0,130],
		"darkolivegreen": [85,107,47],
		"cadetblue": [95,158,160],
		"cornflowerblue": [100,149,237],
		"mediumaquamarine": [102,205,170],
		"dimgray": [105,105,105],
		"dimgrey": [105,105,105],
		"slateblue": [106,90,205],
		"olivedrab": [107,142,35],
		"slategray": [112,128,144],
		"slategrey": [112,128,144],
		"lightslategray": [119,136,153],
		"lightslategrey": [119,136,153],
		"mediumslateblue": [123,104,238],
		"lawngreen": [124,252,0],
		"chartreuse": [127,255,0],
		"aquamarine": [127,255,212],
		"maroon": [128,0,0],
		"purple": [128,0,128],
		"olive": [128,128,0],
		"gray": [128,128,128],
		"grey": [128,128,128],
		"skyblue": [135,206,235],
		"lightskyblue": [135,206,250],
		"blueviolet": [138,43,226],
		"darkred": [139,0,0],
		"darkmagenta": [139,0,139],
		"saddlebrown": [139,69,19],
		"darkseagreen": [143,188,143],
		"lightgreen": [144,238,144],
		"mediumpurple": [147,112,216],
		"darkviolet": [148,0,211],
		"palegreen": [152,251,152],
		"darkorchid": [153,50,204],
		"yellowgreen": [154,205,50],
		"sienna": [160,82,45],
		"brown": [165,42,42],
		"darkgray": [169,169,169],
		"darkgrey": [169,169,169],
		"lightblue": [173,216,230],
		"greenyellow": [173,255,47],
		"paleturquoise": [175,238,238],
		"lightsteelblue": [176,196,222],
		"powderblue": [176,224,230],
		"firebrick": [178,34,34],
		"darkgoldenrod": [184,134,11],
		"mediumorchid": [186,85,211],
		"rosybrown": [188,143,143],
		"darkkhaki": [189,183,107],
		"silver": [192,192,192],
		"mediumvioletred": [199,21,133],
		"indianred": [205,92,92],
		"peru": [205,133,63],
		"chocolate": [210,105,30],
		"tan": [210,180,140],
		"lightgray": [211,211,211],
		"lightgrey": [211,211,211],
		"palevioletred": [216,112,147],
		"thistle": [216,191,216],
		"orchid": [218,112,214],
		"goldenrod": [218,165,32],
		"crimson": [220,20,60],
		"gainsboro": [220,220,220],
		"plum": [221,160,221],
		"burlywood": [222,184,135],
		"lightcyan": [224,255,255],
		"lavender": [230,230,250],
		"darksalmon": [233,150,122],
		"violet": [238,130,238],
		"palegoldenrod": [238,232,170],
		"lightcoral": [240,128,128],
		"khaki": [240,230,140],
		"aliceblue": [240,248,255],
		"honeydew": [240,255,240],
		"azure": [240,255,255],
		"sandybrown": [244,164,96],
		"wheat": [245,222,179],
		"beige": [245,245,220],
		"whitesmoke": [245,245,245],
		"mintcream": [245,255,250],
		"ghostwhite": [248,248,255],
		"salmon": [250,128,114],
		"antiquewhite": [250,235,215],
		"linen": [250,240,230],
		"lightgoldenrodyellow": [250,250,210],
		"oldlace": [253,245,230],
		"red": [255,0,0],
		"fuchsia": [255,0,255],
		"magenta": [255,0,255],
		"deeppink": [255,20,147],
		"orangered": [255,69,0],
		"tomato": [255,99,71],
		"hotpink": [255,105,180],
		"coral": [255,127,80],
		"darkorange": [255,140,0],
		"lightsalmon": [255,160,122],
		"orange": [255,165,0],
		"lightpink": [255,182,193],
		"pink": [255,192,203],
		"gold": [255,215,0],
		"peachpuff": [255,218,185],
		"navajowhite": [255,222,173],
		"moccasin": [255,228,181],
		"bisque": [255,228,196],
		"mistyrose": [255,228,225],
		"blanchedalmond": [255,235,205],
		"papayawhip": [255,239,213],
		"lavenderblush": [255,240,245],
		"seashell": [255,245,238],
		"cornsilk": [255,248,220],
		"lemonchiffon": [255,250,205],
		"floralwhite": [255,250,240],
		"snow": [255,250,250],
		"yellow": [255,255,0],
		"lightyellow": [255,255,224],
		"ivory": [255,255,240],
		"white": [255,255,255]
	}
}
/**
 * @class Lighting computation, based on a traditional FOV for multiple light sources and multiple passes.
 * @param {function} reflectivityCallback Callback to retrieve cell reflectivity (0..1)
 * @param {object} [options]
 * @param {int} [options.passes=1] Number of passes. 1 equals to simple FOV of all light sources, >1 means a *highly simplified* radiosity-like algorithm.
 * @param {int} [options.emissionThreshold=100] Cells with emissivity > threshold will be treated as light source in the next pass.
 * @param {int} [options.range=10] Max light range
 */
ROT.Lighting = function(reflectivityCallback, options) {
	this._reflectivityCallback = reflectivityCallback;
	this._options = {
		passes: 1,
		emissionThreshold: 100,
		range: 10
	};
	this._fov = null;

	this._lights = {};
	this._reflectivityCache = {};
	this._fovCache = {};

	this.setOptions(options);
}

/**
 * Adjust options at runtime
 * @see ROT.Lighting
 * @param {object} [options]
 */
ROT.Lighting.prototype.setOptions = function(options) {
	for (var p in options) { this._options[p] = options[p]; }
	if (options.range) { this.reset(); }
	return this;
}

/**
 * Set the used Field-Of-View algo
 * @param {ROT.FOV} fov
 */
ROT.Lighting.prototype.setFOV = function(fov) {
	this._fov = fov;
	this._fovCache = {};
	return this;
}

/**
 * Set (or remove) a light source
 * @param {int} x
 * @param {int} y
 * @param {null || string || number[3]} color
 */
ROT.Lighting.prototype.setLight = function(x, y, color) {
	var key = x+","+y;

	if (color) {
		this._lights[key] = (typeof(color) == "string" ? ROT.Color.fromString(color) : color);
	} else {
		delete this._lights[key];
	}
	return this;
}

/**
 * Reset the pre-computed topology values. Call whenever the underlying map changes its light-passability.
 */
ROT.Lighting.prototype.reset = function() {
	this._reflectivityCache = {};
	this._fovCache = {};

	return this;
}

/**
 * Compute the lighting
 * @param {function} lightingCallback Will be called with (x, y, color) for every lit cell
 */
ROT.Lighting.prototype.compute = function(lightingCallback) {
	var doneCells = {};
	var emittingCells = {};
	var litCells = {};

	for (var key in this._lights) { /* prepare emitters for first pass */
		var light = this._lights[key];
		if (!(key in emittingCells)) { emittingCells[key] = [0, 0, 0]; }

		ROT.Color.add_(emittingCells[key], light);
	}

	for (var i=0;i<this._options.passes;i++) { /* main loop */
		this._emitLight(emittingCells, litCells, doneCells);
		if (i+1 == this._options.passes) { continue; } /* not for the last pass */
		emittingCells = this._computeEmitters(litCells, doneCells);
	}

	for (var litKey in litCells) { /* let the user know what and how is lit */
		var parts = litKey.split(",");
		var x = parseInt(parts[0]);
		var y = parseInt(parts[1]);
		lightingCallback(x, y, litCells[litKey]);
	}

	return this;
}

/**
 * Compute one iteration from all emitting cells
 * @param {object} emittingCells These emit light
 * @param {object} litCells Add projected light to these
 * @param {object} doneCells These already emitted, forbid them from further calculations
 */
ROT.Lighting.prototype._emitLight = function(emittingCells, litCells, doneCells) {
	for (var key in emittingCells) {
		var parts = key.split(",");
		var x = parseInt(parts[0]);
		var y = parseInt(parts[1]);
		this._emitLightFromCell(x, y, emittingCells[key], litCells);
		doneCells[key] = 1;
	}
	return this;
}

/**
 * Prepare a list of emitters for next pass
 * @param {object} litCells
 * @param {object} doneCells
 * @returns {object}
 */
ROT.Lighting.prototype._computeEmitters = function(litCells, doneCells) {
	var result = {};

	for (var key in litCells) {
		if (key in doneCells) { continue; } /* already emitted */

		var color = litCells[key];

		if (key in this._reflectivityCache) {
			var reflectivity = this._reflectivityCache[key];
		} else {
			var parts = key.split(",");
			var x = parseInt(parts[0]);
			var y = parseInt(parts[1]);
			var reflectivity = this._reflectivityCallback(x, y);
			this._reflectivityCache[key] = reflectivity;
		}

		if (reflectivity == 0) { continue; } /* will not reflect at all */

		/* compute emission color */
		var emission = [];
		var intensity = 0;
		for (var i=0;i<3;i++) {
			var part = Math.round(color[i]*reflectivity);
			emission[i] = part;
			intensity += part;
		}
		if (intensity > this._options.emissionThreshold) { result[key] = emission; }
	}

	return result;
}

/**
 * Compute one iteration from one cell
 * @param {int} x
 * @param {int} y
 * @param {number[]} color
 * @param {object} litCells Cell data to by updated
 */
ROT.Lighting.prototype._emitLightFromCell = function(x, y, color, litCells) {
	var key = x+","+y;
	if (key in this._fovCache) {
		var fov = this._fovCache[key];
	} else {
		var fov = this._updateFOV(x, y);
	}

	for (var fovKey in fov) {
		var formFactor = fov[fovKey];

		if (fovKey in litCells) { /* already lit */
			var result = litCells[fovKey];
		} else { /* newly lit */
			var result = [0, 0, 0];
			litCells[fovKey] = result;
		}

		for (var i=0;i<3;i++) { result[i] += Math.round(color[i]*formFactor); } /* add light color */
	}

	return this;
}

/**
 * Compute FOV ("form factor") for a potential light source at [x,y]
 * @param {int} x
 * @param {int} y
 * @returns {object}
 */
ROT.Lighting.prototype._updateFOV = function(x, y) {
	var key1 = x+","+y;
	var cache = {};
	this._fovCache[key1] = cache;
	var range = this._options.range;
	var cb = function(x, y, r, vis) {
		var key2 = x+","+y;
		var formFactor = vis * (1-r/range);
		if (formFactor == 0) { return; }
		cache[key2] = formFactor;
	}
	this._fov.compute(x, y, range, cb.bind(this));

	return cache;
}
/**
 * @class Abstract pathfinder
 * @param {int} toX Target X coord
 * @param {int} toY Target Y coord
 * @param {function} passableCallback Callback to determine map passability
 * @param {object} [options]
 * @param {int} [options.topology=8]
 */
ROT.Path = function(toX, toY, passableCallback, options) {
	this._toX = toX;
	this._toY = toY;
	this._fromX = null;
	this._fromY = null;
	this._passableCallback = passableCallback;
	this._options = {
		topology: 8
	}
	for (var p in options) { this._options[p] = options[p]; }

	this._dirs = ROT.DIRS[this._options.topology];
	if (this._options.topology == 8) { /* reorder dirs for more aesthetic result (vertical/horizontal first) */
		this._dirs = [
			this._dirs[0],
			this._dirs[2],
			this._dirs[4],
			this._dirs[6],
			this._dirs[1],
			this._dirs[3],
			this._dirs[5],
			this._dirs[7]
		]
	}
}

/**
 * Compute a path from a given point
 * @param {int} fromX
 * @param {int} fromY
 * @param {function} callback Will be called for every path item with arguments "x" and "y"
 */
ROT.Path.prototype.compute = function(fromX, fromY, callback) {
}

ROT.Path.prototype._getNeighbors = function(cx, cy) {
	var result = [];
	for (var i=0;i<this._dirs.length;i++) {
		var dir = this._dirs[i];
		var x = cx + dir[0];
		var y = cy + dir[1];
		
		if (!this._passableCallback(x, y)) { continue; }
		result.push([x, y]);
	}
	
	return result;
}
/**
 * @class Simplified Dijkstra's algorithm: all edges have a value of 1
 * @augments ROT.Path
 * @see ROT.Path
 */
ROT.Path.Dijkstra = function(toX, toY, passableCallback, options) {
	ROT.Path.call(this, toX, toY, passableCallback, options);

	this._computed = {};
	this._todo = [];
	this._add(toX, toY, null);
}
ROT.Path.Dijkstra.extend(ROT.Path);

/**
 * Compute a path from a given point
 * @see ROT.Path#compute
 */
ROT.Path.Dijkstra.prototype.compute = function(fromX, fromY, callback) {
	var key = fromX+","+fromY;
	if (!(key in this._computed)) { this._compute(fromX, fromY); }
	if (!(key in this._computed)) { return; }
	
	var item = this._computed[key];
	while (item) {
		callback(item.x, item.y);
		item = item.prev;
	}
}

/**
 * Compute a non-cached value
 */
ROT.Path.Dijkstra.prototype._compute = function(fromX, fromY) {
	while (this._todo.length) {
		var item = this._todo.shift();
		if (item.x == fromX && item.y == fromY) { return; }
		
		var neighbors = this._getNeighbors(item.x, item.y);
		
		for (var i=0;i<neighbors.length;i++) {
			var neighbor = neighbors[i];
			var x = neighbor[0];
			var y = neighbor[1];
			var id = x+","+y;
			if (id in this._computed) { continue; } /* already done */	
			this._add(x, y, item); 
		}
	}
}

ROT.Path.Dijkstra.prototype._add = function(x, y, prev) {
	var obj = {
		x: x,
		y: y,
		prev: prev
	}
	this._computed[x+","+y] = obj;
	this._todo.push(obj);
}
/**
 * @class Simplified A* algorithm: all edges have a value of 1
 * @augments ROT.Path
 * @see ROT.Path
 */
ROT.Path.AStar = function(toX, toY, passableCallback, options) {
	ROT.Path.call(this, toX, toY, passableCallback, options);

	this._todo = [];
	this._done = {};
	this._fromX = null;
	this._fromY = null;
}
ROT.Path.AStar.extend(ROT.Path);

/**
 * Compute a path from a given point
 * @see ROT.Path#compute
 */
ROT.Path.AStar.prototype.compute = function(fromX, fromY, callback) {
	this._todo = [];
	this._done = {};
	this._fromX = fromX;
	this._fromY = fromY;
	this._add(this._toX, this._toY, null);

	while (this._todo.length) {
		var item = this._todo.shift();
		if (item.x == fromX && item.y == fromY) { break; }
		var neighbors = this._getNeighbors(item.x, item.y);

		for (var i=0;i<neighbors.length;i++) {
			var neighbor = neighbors[i];
			var x = neighbor[0];
			var y = neighbor[1];
			var id = x+","+y;
			if (id in this._done) { continue; }
			this._add(x, y, item); 
		}
	}
	
	var item = this._done[fromX+","+fromY];
	if (!item) { return; }
	
	while (item) {
		callback(item.x, item.y);
		item = item.prev;
	}
}

ROT.Path.AStar.prototype._add = function(x, y, prev) {
	var obj = {
		x: x,
		y: y,
		prev: prev,
		g: (prev ? prev.g+1 : 0),
		h: this._distance(x, y)
	}
	this._done[x+","+y] = obj;
	
	/* insert into priority queue */
	
	var f = obj.g + obj.h;
	for (var i=0;i<this._todo.length;i++) {
		var item = this._todo[i];
		if (f < item.g + item.h) {
			this._todo.splice(i, 0, obj);
			return;
		}
	}
	
	this._todo.push(obj);
}

ROT.Path.AStar.prototype._distance = function(x, y) {
	switch (this._options.topology) {
		case 4:
			return (Math.abs(x-this._fromX) + Math.abs(y-this._fromY));
		break;

		case 6:
			var dx = Math.abs(x - this._fromX);
			var dy = Math.abs(y - this._fromY);
			return dy + Math.max(0, (dx-dy)/2);
		break;

		case 8: 
			return Math.max(Math.abs(x-this._fromX), Math.abs(y-this._fromY));
		break;
	}
}

},{}],24:[function(require,module,exports){
'use strict';
var ROT;

require('./lib/rot');
ROT = window.ROT;

function Map(config){
  console.log('NEW MAP');
  config.progress = config.progress || function(){};
  var data = [],
      height = config.height,
      digger = new ROT.Map.Digger(config.width, height, {
        roomHeight : config.roomHeight,
        roomWidth : config.roomWidth,
      });

  digger.create(function mapProgress(x, y, value){
    data.push(value);
    config.progress(x, y, value);
  });

  var walls, grounds, tiles;

  walls = [];
  grounds = [];
  tiles = [];
  checkWalls(data, tiles, grounds, walls, height);

  this.tiles = tiles;
  this.grounds = grounds;
  this.walls = walls;
  this.data = data;
  this.map = digger;
}

function checkWalls(data, tiles, grounds, walls, height){
  var i, index, type, wall;

  for(i = 0; i < data.length; i++){
    index = data[i];
    wall = {
      x : Math.floor(i / height),
      y : i % height
    };
    if(index === 0){
      wall.type = 'ground';
      grounds.push(wall);
      tiles.push(nuclear.entity('tile').create(wall));
    } else if(index === 1){
      if(testUpperLeft(data, i, height)){
        wall.type = 'upperRight';
        walls.push(wall);
        tiles.push(nuclear.entity('tile').create(wall));
        tiles.push(nuclear.entity('tile').create({
            x : wall.x,
            y : wall.y,
            type : wall.type+'_top'
          }));
        data[i] = 2;
      }
      else if(testUpperRight(data, i, height)){
        wall.type = 'upperLeft';
        walls.push(wall);
        tiles.push(nuclear.entity('tile').create(wall));
        tiles.push(nuclear.entity('tile').create({
            x : wall.x,
            y : wall.y,
            type : wall.type+'_top'
          }));
        data[i] = 2;
      }
      else if(testDownLeft(data, i, height)){
        wall.type = 'downRight';
        walls.push(wall);
        tiles.push(nuclear.entity('tile').create(wall));
        tiles.push(nuclear.entity('tile').create({
            x : wall.x,
            y : wall.y,
            type : wall.type+'_top'
          }));
        data[i] = 2;
      }
      else if(testDownRight(data, i, height)){
        wall.type = 'downLeft';
        walls.push(wall);
        tiles.push(nuclear.entity('tile').create(wall));
        tiles.push(nuclear.entity('tile').create({
            x : wall.x,
            y : wall.y,
            type : wall.type+'_top'
          }));
        data[i] = 2;
      }
      else if(testUpperExternalLeft(data, i, height)){
        wall.type = 'upperExternalLeft';
        walls.push(wall);
        tiles.push(nuclear.entity('tile').create(wall));
        data[i] = 2;
      }
      else if(testUpperExternalRight(data, i, height)){
        wall.type = 'upperExternalRight';
        walls.push(wall);
        tiles.push(nuclear.entity('tile').create(wall));
        data[i] = 2;
      }
      else if(testDownExternalLeft(data, i, height)){
        wall.type = 'downExternalLeft';
        walls.push(wall);
        tiles.push(nuclear.entity('tile').create(wall));
        data[i] = 2;
      }
      else if(testDownExternalRight(data, i, height)){
        wall.type = 'downExternalRight';
        walls.push(wall);
        tiles.push(nuclear.entity('tile').create(wall));
        data[i] = 2;
      }
      else if(testDoubleSides(data, i, height)){
        wall.type = 'doubleSides';
        walls.push(wall);
        tiles.push(nuclear.entity('tile').create(wall));
        data[i] = 2;
      }
      else{
        type = testWall(data, i, height);
        if(type){
          wall.type = type;
          walls.push(wall);
          tiles.push(nuclear.entity('tile').create(wall));
          tiles.push(nuclear.entity('tile').create({
            x : wall.x,
            y : wall.y,
            type : wall.type+'_top'
          }));
          data[i] = 2;
        }
      }
    }
  }
}

function testWall(data, i, height){
  if(data[i+1] === 0){
    return 'up';
  } else if(data[i-1] === 0){
    return 'down';
  } else if(data[i+height] === 0){
    return 'right';
  } else if(data[i-height] === 0){
    return 'left';
  }

  return false;
}

function testUpperLeft(data, i, height){
  return(data[i+1] !== 0 && data[i-1] === 0 && data[i+height] !== 0 && data[i-height] === 0);
}

function testUpperRight(data, i, height){
  return(data[i+1] === 0 && data[i-1] !== 0 && data[i+height] !== 0 && data[i-height] === 0);
}

function testDownLeft(data, i, height){
  return(data[i+1] !== 0 && data[i-1] === 0 && data[i+height] === 0 && data[i-height] !== 0);
}

function testDownRight(data, i, height){
  return(data[i+1] === 0 && data[i-1] !== 0 && data[i+height] === 0 && data[i-height] !== 0);
}

function testUpperExternalLeft(data, i, height){
  return(data[i+1] !== 0 && data[i+height] !== 0 && data[i-height] !== 0 && data[i+height+1] === 0);
}

function testUpperExternalRight(data, i, height){
  return(data[i+1] !== 0 && data[i+height] !== 0 && data[i-height] !== 0 && data[i-height+1] === 0);
}

function testDownExternalRight(data, i, height){
  return(data[i+1] !== 0 &&data[i-1] !== 0 && data[i+height] !== 0 && data[i-height] !== 0 && data[i-height-1] === 0);
}

function testDownExternalLeft(data, i, height){
  return(data[i+1] !== 0 && data[i-1] !== 0 && data[i+height] !== 0 && data[i-height] !== 0 && data[i+height-1] === 0);
}

function testDoubleSides(data, i, height){
  return(data[i+1] !== 0 && data[i+height] === 0 && data[i-height] === 0);
}

module.exports = Map;

},{"./lib/rot":23}],25:[function(require,module,exports){
'use strict';

function Template(id, position, width, height, config){
  this.config = config;
  this.position = position;
  this.width = width;
  this.height = height;
  this.id = id;

  this.slots = generateSlots(this, config.slots);
}

function generateSlots(self, slots){
  var i, slot, data, entities;

  entities = [];
  for(i = 0; i < slots.length; i++){
    slot = slots[i];
    data = {};
    data.position = {
      x : self.position.x + Math.round(slot.position.x*self.width/100),
      y : self.position.y + Math.round(slot.position.y*self.height/100)
    };
    data.bundle = self.config.bundle;
    data.type = slot.type;
    data.template = self.id;

    entities.push(nuclear.entity('slot from roguemap').create(data));
  }

  return entities;
}

module.exports = Template;

},{}],26:[function(require,module,exports){
'use strict';

function PositionComponent(x, y) {
  this.x = x;
  this.y = y;
}

module.exports = PositionComponent;

},{}],27:[function(require,module,exports){
'use strict';

var PositionComponent;

PositionComponent = require('./components/position-component');

module.exports = nuclear.module('game.transform', [])
  .component('position', function (e, x, y) {
    return new PositionComponent(x, y);
  });

},{"./components/position-component":26}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbnNlcnQtbW9kdWxlLWdsb2JhbHMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3BhdGgtYnJvd3NlcmlmeS9pbmRleC5qcyIsIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvc3JjL2dhbWUuanMiLCIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvc3JjL2xvYWRlcnMvYXNzZXRzLWJ1bmRsZS5qcyIsIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvc3JjL2xvYWRlcnMvYXNzZXRzLWxvYWRlci5qcyIsIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvc3JjL2xvYWRlcnMvaW1hZ2VzLWxvYWRlci5qcyIsIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvc3JjL2xvYWRlcnMvaW5kZXguanMiLCIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L3NyYy9sb2FkZXJzL2pzb24tbG9hZGVyLmpzIiwiL1VzZXJzL2FkcmllbmNhcnRhL2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUuYW5pbWF0aW9ucy9jb21wb25lbnRzL2FuaW1hdGlvbnMtY29tcG9uZW50LmpzIiwiL1VzZXJzL2FkcmllbmNhcnRhL2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUuYW5pbWF0aW9ucy9pbmRleC5qcyIsIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvc3JjL251Y2xlYXJfbW9kdWxlcy9nYW1lLmFuaW1hdGlvbnMvc3lzdGVtcy9hbmltYXRlLXN5c3RlbS5qcyIsIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvc3JjL251Y2xlYXJfbW9kdWxlcy9nYW1lLmlucHV0cy9pbmRleC5qcyIsIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvc3JjL251Y2xlYXJfbW9kdWxlcy9nYW1lLmlucHV0cy9saWIvZ2FtZXBhZC5taW4uanMiLCIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS5pbnB1dHMvbGliL21vdXNldHJhcC5taW4uanMiLCIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS5yZW5kZXJpbmcvY29tcG9uZW50cy9hdGxhcy1jb21wb25lbnQuanMiLCIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS5yZW5kZXJpbmcvY29tcG9uZW50cy9zcHJpdGUtY29tcG9uZW50LmpzIiwiL1VzZXJzL2FkcmllbmNhcnRhL2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUucmVuZGVyaW5nL2luZGV4LmpzIiwiL1VzZXJzL2FkcmllbmNhcnRhL2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUucmVuZGVyaW5nL3N5c3RlbXMvcmVuZGVyZXItc3lzdGVtLmpzIiwiL1VzZXJzL2FkcmllbmNhcnRhL2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUucm9ndWVtYXAvY29uZmlnLmpzIiwiL1VzZXJzL2FkcmllbmNhcnRhL2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUucm9ndWVtYXAvaW5kZXguanMiLCIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS5yb2d1ZW1hcC9saWIvcm90LmpzIiwiL1VzZXJzL2FkcmllbmNhcnRhL2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUucm9ndWVtYXAvbWFwLmpzIiwiL1VzZXJzL2FkcmllbmNhcnRhL2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUucm9ndWVtYXAvdGVtcGxhdGUuanMiLCIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS50cmFuc2Zvcm0vY29tcG9uZW50cy9wb3NpdGlvbi1jb21wb25lbnQuanMiLCIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS50cmFuc2Zvcm0vaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hIQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3g1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwiKGZ1bmN0aW9uIChwcm9jZXNzKXtcbi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyByZXNvbHZlcyAuIGFuZCAuLiBlbGVtZW50cyBpbiBhIHBhdGggYXJyYXkgd2l0aCBkaXJlY3RvcnkgbmFtZXMgdGhlcmVcbi8vIG11c3QgYmUgbm8gc2xhc2hlcywgZW1wdHkgZWxlbWVudHMsIG9yIGRldmljZSBuYW1lcyAoYzpcXCkgaW4gdGhlIGFycmF5XG4vLyAoc28gYWxzbyBubyBsZWFkaW5nIGFuZCB0cmFpbGluZyBzbGFzaGVzIC0gaXQgZG9lcyBub3QgZGlzdGluZ3Vpc2hcbi8vIHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBwYXRocylcbmZ1bmN0aW9uIG5vcm1hbGl6ZUFycmF5KHBhcnRzLCBhbGxvd0Fib3ZlUm9vdCkge1xuICAvLyBpZiB0aGUgcGF0aCB0cmllcyB0byBnbyBhYm92ZSB0aGUgcm9vdCwgYHVwYCBlbmRzIHVwID4gMFxuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgbGFzdCA9IHBhcnRzW2ldO1xuICAgIGlmIChsYXN0ID09PSAnLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKGxhc3QgPT09ICcuLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGF0aCBpcyBhbGxvd2VkIHRvIGdvIGFib3ZlIHRoZSByb290LCByZXN0b3JlIGxlYWRpbmcgLi5zXG4gIGlmIChhbGxvd0Fib3ZlUm9vdCkge1xuICAgIGZvciAoOyB1cC0tOyB1cCkge1xuICAgICAgcGFydHMudW5zaGlmdCgnLi4nKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcGFydHM7XG59XG5cbi8vIFNwbGl0IGEgZmlsZW5hbWUgaW50byBbcm9vdCwgZGlyLCBiYXNlbmFtZSwgZXh0XSwgdW5peCB2ZXJzaW9uXG4vLyAncm9vdCcgaXMganVzdCBhIHNsYXNoLCBvciBub3RoaW5nLlxudmFyIHNwbGl0UGF0aFJlID1cbiAgICAvXihcXC8/fCkoW1xcc1xcU10qPykoKD86XFwuezEsMn18W15cXC9dKz98KShcXC5bXi5cXC9dKnwpKSg/OltcXC9dKikkLztcbnZhciBzcGxpdFBhdGggPSBmdW5jdGlvbihmaWxlbmFtZSkge1xuICByZXR1cm4gc3BsaXRQYXRoUmUuZXhlYyhmaWxlbmFtZSkuc2xpY2UoMSk7XG59O1xuXG4vLyBwYXRoLnJlc29sdmUoW2Zyb20gLi4uXSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlc29sdmUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJlc29sdmVkUGF0aCA9ICcnLFxuICAgICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IGZhbHNlO1xuXG4gIGZvciAodmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoIC0gMTsgaSA+PSAtMSAmJiAhcmVzb2x2ZWRBYnNvbHV0ZTsgaS0tKSB7XG4gICAgdmFyIHBhdGggPSAoaSA+PSAwKSA/IGFyZ3VtZW50c1tpXSA6IHByb2Nlc3MuY3dkKCk7XG5cbiAgICAvLyBTa2lwIGVtcHR5IGFuZCBpbnZhbGlkIGVudHJpZXNcbiAgICBpZiAodHlwZW9mIHBhdGggIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgdG8gcGF0aC5yZXNvbHZlIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH0gZWxzZSBpZiAoIXBhdGgpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHJlc29sdmVkUGF0aCA9IHBhdGggKyAnLycgKyByZXNvbHZlZFBhdGg7XG4gICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IHBhdGguY2hhckF0KDApID09PSAnLyc7XG4gIH1cblxuICAvLyBBdCB0aGlzIHBvaW50IHRoZSBwYXRoIHNob3VsZCBiZSByZXNvbHZlZCB0byBhIGZ1bGwgYWJzb2x1dGUgcGF0aCwgYnV0XG4gIC8vIGhhbmRsZSByZWxhdGl2ZSBwYXRocyB0byBiZSBzYWZlIChtaWdodCBoYXBwZW4gd2hlbiBwcm9jZXNzLmN3ZCgpIGZhaWxzKVxuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICByZXNvbHZlZFBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocmVzb2x2ZWRQYXRoLnNwbGl0KCcvJyksIGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gISFwO1xuICB9KSwgIXJlc29sdmVkQWJzb2x1dGUpLmpvaW4oJy8nKTtcblxuICByZXR1cm4gKChyZXNvbHZlZEFic29sdXRlID8gJy8nIDogJycpICsgcmVzb2x2ZWRQYXRoKSB8fCAnLic7XG59O1xuXG4vLyBwYXRoLm5vcm1hbGl6ZShwYXRoKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5ub3JtYWxpemUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHZhciBpc0Fic29sdXRlID0gZXhwb3J0cy5pc0Fic29sdXRlKHBhdGgpLFxuICAgICAgdHJhaWxpbmdTbGFzaCA9IHN1YnN0cihwYXRoLCAtMSkgPT09ICcvJztcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcGF0aCA9IG5vcm1hbGl6ZUFycmF5KGZpbHRlcihwYXRoLnNwbGl0KCcvJyksIGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gISFwO1xuICB9KSwgIWlzQWJzb2x1dGUpLmpvaW4oJy8nKTtcblxuICBpZiAoIXBhdGggJiYgIWlzQWJzb2x1dGUpIHtcbiAgICBwYXRoID0gJy4nO1xuICB9XG4gIGlmIChwYXRoICYmIHRyYWlsaW5nU2xhc2gpIHtcbiAgICBwYXRoICs9ICcvJztcbiAgfVxuXG4gIHJldHVybiAoaXNBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHBhdGg7XG59O1xuXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLmlzQWJzb2x1dGUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHJldHVybiBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xufTtcblxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5qb2luID0gZnVuY3Rpb24oKSB7XG4gIHZhciBwYXRocyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gIHJldHVybiBleHBvcnRzLm5vcm1hbGl6ZShmaWx0ZXIocGF0aHMsIGZ1bmN0aW9uKHAsIGluZGV4KSB7XG4gICAgaWYgKHR5cGVvZiBwICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIHRvIHBhdGguam9pbiBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH0pLmpvaW4oJy8nKSk7XG59O1xuXG5cbi8vIHBhdGgucmVsYXRpdmUoZnJvbSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlbGF0aXZlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgZnJvbSA9IGV4cG9ydHMucmVzb2x2ZShmcm9tKS5zdWJzdHIoMSk7XG4gIHRvID0gZXhwb3J0cy5yZXNvbHZlKHRvKS5zdWJzdHIoMSk7XG5cbiAgZnVuY3Rpb24gdHJpbShhcnIpIHtcbiAgICB2YXIgc3RhcnQgPSAwO1xuICAgIGZvciAoOyBzdGFydCA8IGFyci5sZW5ndGg7IHN0YXJ0KyspIHtcbiAgICAgIGlmIChhcnJbc3RhcnRdICE9PSAnJykgYnJlYWs7XG4gICAgfVxuXG4gICAgdmFyIGVuZCA9IGFyci5sZW5ndGggLSAxO1xuICAgIGZvciAoOyBlbmQgPj0gMDsgZW5kLS0pIHtcbiAgICAgIGlmIChhcnJbZW5kXSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChzdGFydCA+IGVuZCkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBhcnIuc2xpY2Uoc3RhcnQsIGVuZCAtIHN0YXJ0ICsgMSk7XG4gIH1cblxuICB2YXIgZnJvbVBhcnRzID0gdHJpbShmcm9tLnNwbGl0KCcvJykpO1xuICB2YXIgdG9QYXJ0cyA9IHRyaW0odG8uc3BsaXQoJy8nKSk7XG5cbiAgdmFyIGxlbmd0aCA9IE1hdGgubWluKGZyb21QYXJ0cy5sZW5ndGgsIHRvUGFydHMubGVuZ3RoKTtcbiAgdmFyIHNhbWVQYXJ0c0xlbmd0aCA9IGxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmIChmcm9tUGFydHNbaV0gIT09IHRvUGFydHNbaV0pIHtcbiAgICAgIHNhbWVQYXJ0c0xlbmd0aCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB2YXIgb3V0cHV0UGFydHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IHNhbWVQYXJ0c0xlbmd0aDsgaSA8IGZyb21QYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgIG91dHB1dFBhcnRzLnB1c2goJy4uJyk7XG4gIH1cblxuICBvdXRwdXRQYXJ0cyA9IG91dHB1dFBhcnRzLmNvbmNhdCh0b1BhcnRzLnNsaWNlKHNhbWVQYXJ0c0xlbmd0aCkpO1xuXG4gIHJldHVybiBvdXRwdXRQYXJ0cy5qb2luKCcvJyk7XG59O1xuXG5leHBvcnRzLnNlcCA9ICcvJztcbmV4cG9ydHMuZGVsaW1pdGVyID0gJzonO1xuXG5leHBvcnRzLmRpcm5hbWUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHZhciByZXN1bHQgPSBzcGxpdFBhdGgocGF0aCksXG4gICAgICByb290ID0gcmVzdWx0WzBdLFxuICAgICAgZGlyID0gcmVzdWx0WzFdO1xuXG4gIGlmICghcm9vdCAmJiAhZGlyKSB7XG4gICAgLy8gTm8gZGlybmFtZSB3aGF0c29ldmVyXG4gICAgcmV0dXJuICcuJztcbiAgfVxuXG4gIGlmIChkaXIpIHtcbiAgICAvLyBJdCBoYXMgYSBkaXJuYW1lLCBzdHJpcCB0cmFpbGluZyBzbGFzaFxuICAgIGRpciA9IGRpci5zdWJzdHIoMCwgZGlyLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgcmV0dXJuIHJvb3QgKyBkaXI7XG59O1xuXG5cbmV4cG9ydHMuYmFzZW5hbWUgPSBmdW5jdGlvbihwYXRoLCBleHQpIHtcbiAgdmFyIGYgPSBzcGxpdFBhdGgocGF0aClbMl07XG4gIC8vIFRPRE86IG1ha2UgdGhpcyBjb21wYXJpc29uIGNhc2UtaW5zZW5zaXRpdmUgb24gd2luZG93cz9cbiAgaWYgKGV4dCAmJiBmLnN1YnN0cigtMSAqIGV4dC5sZW5ndGgpID09PSBleHQpIHtcbiAgICBmID0gZi5zdWJzdHIoMCwgZi5sZW5ndGggLSBleHQubGVuZ3RoKTtcbiAgfVxuICByZXR1cm4gZjtcbn07XG5cblxuZXhwb3J0cy5leHRuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gc3BsaXRQYXRoKHBhdGgpWzNdO1xufTtcblxuZnVuY3Rpb24gZmlsdGVyICh4cywgZikge1xuICAgIGlmICh4cy5maWx0ZXIpIHJldHVybiB4cy5maWx0ZXIoZik7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGYoeHNbaV0sIGksIHhzKSkgcmVzLnB1c2goeHNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuXG4vLyBTdHJpbmcucHJvdG90eXBlLnN1YnN0ciAtIG5lZ2F0aXZlIGluZGV4IGRvbid0IHdvcmsgaW4gSUU4XG52YXIgc3Vic3RyID0gJ2FiJy5zdWJzdHIoLTEpID09PSAnYidcbiAgICA/IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW4pIHsgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbikgfVxuICAgIDogZnVuY3Rpb24gKHN0ciwgc3RhcnQsIGxlbikge1xuICAgICAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IHN0ci5sZW5ndGggKyBzdGFydDtcbiAgICAgICAgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbik7XG4gICAgfVxuO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luc2VydC1tb2R1bGUtZ2xvYmFscy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzXCIpKSIsIid1c2Ugc3RyaWN0JztcblxudmFyIEFzc2V0c0xvYWRlciwgSW1hZ2VzTG9hZGVyLCBKc29uTG9hZGVyO1xuXG5Bc3NldHNMb2FkZXIgPSByZXF1aXJlKCcuL2xvYWRlcnMnKS5Bc3NldHNMb2FkZXI7XG5JbWFnZXNMb2FkZXIgPSByZXF1aXJlKCcuL2xvYWRlcnMnKS5JbWFnZXNMb2FkZXI7XG5Kc29uTG9hZGVyID0gcmVxdWlyZSgnLi9sb2FkZXJzJykuSnNvbkxvYWRlcjtcblxuZXhwb3J0cy5sb2FkZXIgPSBuZXcgQXNzZXRzTG9hZGVyKCcvYXNzZXRzJylcbiAgLndoZW4oL1xcLig/OnBuZ3xqcGcpJC8sIG5ldyBJbWFnZXNMb2FkZXIoKSlcbiAgLndoZW4oL1xcLmpzb24kLywgbmV3IEpzb25Mb2FkZXIoKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBnYW1lLCB0cmFuc2Zvcm0sIHJlbmRlcmluZywgYW5pbWF0aW9ucztcblxuZ2FtZSA9IHJlcXVpcmUoJ2dhbWUnKTtcblxudHJhbnNmb3JtID0gcmVxdWlyZSgnLi9udWNsZWFyX21vZHVsZXMvZ2FtZS50cmFuc2Zvcm0nKTtcbnJlbmRlcmluZyA9IHJlcXVpcmUoJy4vbnVjbGVhcl9tb2R1bGVzL2dhbWUucmVuZGVyaW5nJyk7XG5hbmltYXRpb25zID0gcmVxdWlyZSgnLi9udWNsZWFyX21vZHVsZXMvZ2FtZS5hbmltYXRpb25zJyk7XG5yZXF1aXJlKCcuL251Y2xlYXJfbW9kdWxlcy9nYW1lLmlucHV0cy8nKTtcbnJlcXVpcmUoJy4vbnVjbGVhcl9tb2R1bGVzL2dhbWUucm9ndWVtYXAvJyk7XG5cbm51Y2xlYXIubW9kdWxlKCdpbnB1dHMnKS5jb25maWcoJ2dhbWVwYWQnKS5GQUNFXzEgPSAnRklSRSc7XG52YXIgZW50aXR5ID0gbnVjbGVhci5lbnRpdHkuY3JlYXRlKCk7XG5cbm51Y2xlYXIuY29tcG9uZW50KCdpbnB1dHMnKS5hZGQoZW50aXR5LCB7XG4gIEZJUkUgOiBmdW5jdGlvbihlbnRpdHksIGlucHV0KXtcbiAgICBpZihpbnB1dCAhPT0gMCl7XG4gICAgICBjb25zb2xlLmxvZyhpbnB1dCk7XG4gICAgfVxuICB9LFxuICBVUCA6IGZ1bmN0aW9uKGVudGl0eSwgaW5wdXQpe1xuICAgIGlmKGlucHV0ICE9PSAwKXtcbiAgICAgIGNvbnNvbGUubG9nKGlucHV0KTtcbiAgICB9XG4gIH1cbn0pO1xudmFyIGNvbnRleHQgPSBudWNsZWFyLnN5c3RlbS5jb250ZXh0KCk7XG5cbmNvbnRleHQuZGVzdHMgPSBbXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib3R0b20tYnVmZmVyJykuZ2V0Q29udGV4dCgnMmQnKSxcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2R5bmFtaWMtYnVmZmVyJykuZ2V0Q29udGV4dCgnMmQnKSxcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvcC1idWZmZXInKS5nZXRDb250ZXh0KCcyZCcpLFxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmdldENvbnRleHQoJzJkJyksXG5dO1xuXG5jb250ZXh0LldJRFRIID0gY29udGV4dC5kZXN0c1syXS5jYW52YXMud2lkdGg7XG5jb250ZXh0LkhFSUdIVCA9IGNvbnRleHQuZGVzdHNbMl0uY2FudmFzLmhlaWdodDtcbmdhbWUubG9hZGVyLmxvYWQoW1xuICAgICdhdGxhc2VzL3ByaW5ueS5hdGxhcy5wbmcnLFxuICAgICdhdGxhc2VzL3ByaW5ueS5hdGxhcy5qc29uJyxcbiAgICAnYW5pbWF0aW9ucy9wcmlubnkvcHJpbm55QGRhbmNpbmcuanNvbicsXG4gICAgXG4gICAgJ2F0bGFzZXMvc3RvbmUuYXRsYXMucG5nJyxcbiAgICAnYXRsYXNlcy9zdG9uZS5hdGxhcy5qc29uJ1xuICBdKVxuICAuZXJyb3IoZnVuY3Rpb24oZXJyb3Ipe1xuICAgIHRocm93IGVycm9yO1xuICB9KVxuICAuZG9uZShmdW5jdGlvbiAoKSB7XG4gICAgbnVjbGVhci5pbXBvcnQoW3RyYW5zZm9ybSwgcmVuZGVyaW5nLCBhbmltYXRpb25zXSk7XG4gICAgY29uc29sZS5sb2coJ21vZHVsZXMgbG9hZGVkIScpO1xuICAgIG51Y2xlYXIuZW50aXR5KCdtYXAnKS5jcmVhdGUoe1xuICAgICAgbWFwRGF0YSA6IHtcbiAgICAgICAgd2lkdGggOiA0MCxcbiAgICAgICAgaGVpZ2h0IDogNDAsXG4gICAgICAgIHJvb21XaWR0aCA6IFszLCAyMF0sXG4gICAgICAgIHJvb21IZWlnaHQgOiBbMywgMjBdXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uIGxvb3AoKSB7XG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xuICAgICAgbnVjbGVhci5zeXN0ZW0ucnVuKCk7XG4gICAgfSk7XG4gIH0pXG4gIC5wcm9ncmVzcyhjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUsICdidW5kbGUgcHJvZ3Jlc3MnKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEFzc2V0c0J1bmRsZShjYWxsYmFjaykge1xuICB2YXIgYnVuZGxlO1xuXG4gIGJ1bmRsZSA9IHRoaXM7XG5cbiAgYnVuZGxlLmFzc2V0cyA9IFtdO1xuXG4gIGJ1bmRsZS5fbG9hZExpc3RlbmVycyA9IFtdO1xuICBidW5kbGUuX2Vycm9yTGlzdGVuZXJzID0gW107XG4gIGJ1bmRsZS5fcHJvZ3Jlc3NMaXN0ZW5lcnMgPSBbXTtcblxuICBjYWxsYmFjay5jYWxsKHRoaXMsXG4gICAgdHJpZ2dlcihidW5kbGUuX2xvYWRMaXN0ZW5lcnMpLFxuICAgIHRyaWdnZXIoYnVuZGxlLl9lcnJvckxpc3RlbmVycyksXG4gICAgdHJpZ2dlcihidW5kbGUuX3Byb2dyZXNzTGlzdGVuZXJzKVxuICApO1xuXG4gIGZ1bmN0aW9uIHRyaWdnZXIoY2FsbGJhY2tzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBpLCBjYWxsYmFjaztcblxuICAgICAgZm9yIChpID0gMDsgKGNhbGxiYWNrID0gY2FsbGJhY2tzW2ldKTsgaSArPSAxKSB7XG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KGJ1bmRsZSwgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59XG5cbkFzc2V0c0J1bmRsZS5wcm90b3R5cGUuZG9uZSA9IGZ1bmN0aW9uIGFzc2V0c0J1bmRsZURvbmUoY2FsbGJhY2spIHtcbiAgdGhpcy5fbG9hZExpc3RlbmVycy5wdXNoKGNhbGxiYWNrKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Bc3NldHNCdW5kbGUucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24gYXNzZXRzQnVuZGxlRXJyb3IoZXJyYmFjaykge1xuICB0aGlzLl9lcnJvckxpc3RlbmVycy5wdXNoKGVycmJhY2spO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkFzc2V0c0J1bmRsZS5wcm90b3R5cGUucHJvZ3Jlc3MgPSBmdW5jdGlvbiBhc3NldHNCdW5kbGVQcm9ncmVzcyhwcm9ncmVzcykge1xuICB0aGlzLl9wcm9ncmVzc0xpc3RlbmVycy5wdXNoKHByb2dyZXNzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFzc2V0c0J1bmRsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEFzc2V0c0J1bmRsZSwgcGF0aDtcblxuQXNzZXRzQnVuZGxlID0gcmVxdWlyZSgnLi9hc3NldHMtYnVuZGxlJyk7XG5wYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5mdW5jdGlvbiBBc3NldHNMb2FkZXIocGF0aCkge1xuICB0aGlzLmJhc2VQYXRoID0gcGF0aCB8fCAnLyc7XG4gIHRoaXMuY2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB0aGlzLnJ1bGVzID0gW107XG59XG5cbkFzc2V0c0xvYWRlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gYXNzZXRzTG9hZGVyR2V0KHVybCkge1xuICByZXR1cm4gdGhpcy5jYWNoZVt1cmxdO1xufTtcblxuQXNzZXRzTG9hZGVyLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiBhc3NldHNMb2FkZXJIYXModXJsKSB7XG4gIHJldHVybiB1cmwgaW4gdGhpcy5jYWNoZTtcbn07XG5cbkFzc2V0c0xvYWRlci5wcm90b3R5cGUud2hlbiA9IGZ1bmN0aW9uIGFzc2V0c0xvYWRlcldoZW4ocGF0dGVybiwgbG9hZGVyKSB7XG4gIHRoaXMucnVsZXMucHVzaCh7cGF0dGVybjogcGF0dGVybiwgbG9hZGVyOiBsb2FkZXJ9KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Bc3NldHNMb2FkZXIucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbiBhc3NldHNMb2FkZXJMb2FkKHVybHMpIHtcbiAgdmFyIGxvYWRlcjtcblxuICBsb2FkZXIgPSB0aGlzO1xuXG4gIHJldHVybiBuZXcgQXNzZXRzQnVuZGxlKGZ1bmN0aW9uIChkb25lLCBlcnJvciwgcHJvZ3Jlc3MpIHtcbiAgICB2YXIgYnVuZGxlLCBsb2FkZWRBc3NldHNDb3VudCwgdG90YWxBc3NldHNDb3VudCwgaSwgdXJsLCBhc3NldCwgaiwgcnVsZTtcblxuICAgIGJ1bmRsZSA9IHRoaXM7XG5cbiAgICBsb2FkZWRBc3NldHNDb3VudCA9IDA7XG4gICAgdG90YWxBc3NldHNDb3VudCA9IHVybHMubGVuZ3RoO1xuXG4gICAgaWYgKCF0b3RhbEFzc2V0c0NvdW50KSBkb25lKCk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgdG90YWxBc3NldHNDb3VudDsgaSArPSAxKSB7XG4gICAgICB1cmwgPSB1cmxzW2ldO1xuICAgICAgYXNzZXQgPSBsb2FkZXIuZ2V0KHVybCk7XG5cbiAgICAgIGlmIChhc3NldCkge1xuICAgICAgICBvbmxvYWRlZCh1cmwsIGkpLmNhbGwoYXNzZXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChqID0gMDsgKHJ1bGUgPSBsb2FkZXIucnVsZXNbal0pOyBqICs9IDEpIHtcbiAgICAgICAgICBpZiAocnVsZS5wYXR0ZXJuLnRlc3QodXJsKSkge1xuICAgICAgICAgICAgcnVsZS5sb2FkZXIubG9hZChwYXRoLmpvaW4obG9hZGVyLmJhc2VQYXRoLCB1cmwpLCBvbmxvYWRlZCh1cmwsIGkpLCBlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25sb2FkZWQoa2V5LCBpbmRleCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGFzc2V0O1xuXG4gICAgICAgIGFzc2V0ID0gdGhpcztcblxuICAgICAgICBsb2FkZXIuY2FjaGVba2V5XSA9IGFzc2V0O1xuICAgICAgICBidW5kbGUuYXNzZXRzW2luZGV4XSA9IGFzc2V0O1xuXG4gICAgICAgIGxvYWRlZEFzc2V0c0NvdW50ICs9IDE7XG5cbiAgICAgICAgaWYgKHByb2dyZXNzKSB7XG4gICAgICAgICAgcHJvZ3Jlc3ModGhpcywgbG9hZGVkQXNzZXRzQ291bnQgLyB0b3RhbEFzc2V0c0NvdW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsb2FkZWRBc3NldHNDb3VudCA9PT0gdG90YWxBc3NldHNDb3VudCkge1xuICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBc3NldHNMb2FkZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEltYWdlc0xvYWRlcigpIHt9XG5cbkltYWdlc0xvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uIGltYWdlc0xvYWRlckxvYWQodXJsLCBjYWxsYmFjaywgZXJyYmFjaykge1xuICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuICBpbWFnZS5vbmxvYWQgPSBjYWxsYmFjaztcbiAgaW1hZ2Uub25lcnJvciA9IGVycmJhY2s7XG5cbiAgaW1hZ2Uuc3JjID0gdXJsO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZXNMb2FkZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuQXNzZXRzTG9hZGVyID0gcmVxdWlyZSgnLi9hc3NldHMtbG9hZGVyJyk7XG5leHBvcnRzLkltYWdlc0xvYWRlciA9IHJlcXVpcmUoJy4vaW1hZ2VzLWxvYWRlcicpO1xuZXhwb3J0cy5Kc29uTG9hZGVyID0gcmVxdWlyZSgnLi9qc29uLWxvYWRlcicpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBKc29uTG9hZGVyKCkge31cblxuSnNvbkxvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uIGpzb25Mb2FkZXJMb2FkKHVybCwgY2FsbGJhY2ssIGVycmJhY2spIHtcbiAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xuXG4gIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHhoci5yZWFkeVN0YXRlIDwgNCkgcmV0dXJuO1xuXG4gICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY2FsbGJhY2suY2FsbChKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpKTtcbiAgICAgIH0gY2F0Y2ggKG9PKSB7XG4gICAgICAgIGVycmJhY2sob08pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlcnJiYWNrKHhocik7XG4gICAgfVxuICB9O1xuXG4gIHhoci5zZW5kKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEpzb25Mb2FkZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBsb2FkZXIsIHBhdGg7XG5cbmxvYWRlciA9IHJlcXVpcmUoJ2dhbWUnKS5sb2FkZXI7XG5wYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5mdW5jdGlvbiBBbmltYXRpb25zQ29tcG9uZW50KG9wdGlvbnMpIHtcbiAgdmFyIGksIGxlbmd0aCwga2V5LCBkYXRhO1xuXG4gIHRoaXMuYW5pbWF0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgbGVuZ3RoID0gb3B0aW9ucy5hbmltYXRpb25zLmxlbmd0aDtcblxuICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICBrZXkgPSBvcHRpb25zLmFuaW1hdGlvbnNbaV07XG4gICAgZGF0YSA9IGxvYWRlci5nZXQocGF0aC5qb2luKCdhbmltYXRpb25zJywgb3B0aW9ucy50YXJnZXQsIG9wdGlvbnMudGFyZ2V0ICsgJ0AnICsga2V5ICsgJy5qc29uJykpO1xuXG4gICAgdGhpcy5hbmltYXRpb25zW2tleV0gPSBkYXRhO1xuICB9XG5cbiAgdGhpcy5kZWZhdWx0QW5pbWF0aW9uID0gb3B0aW9ucy5kZWZhdWx0QW5pbWF0aW9uIHx8ICdpZGxlJztcblxuICB0aGlzLmN1cnJlbnRBbmltYXRpb24gPSB0aGlzLmRlZmF1bHRBbmltYXRpb247XG4gIHRoaXMuY3VycmVudEZyYW1lID0gMDtcblxuICB0aGlzLmxvb3AgPSBCb29sZWFuKG9wdGlvbnMgJiYgb3B0aW9ucy5sb29wKTtcblxuICB0aGlzLnRpbWVFbGFwc2VkU2luY2VMYXN0RnJhbWUgPSAwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFuaW1hdGlvbnNDb21wb25lbnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBBbmltYXRpb25zQ29tcG9uZW50O1xuXG5BbmltYXRpb25zQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2FuaW1hdGlvbnMtY29tcG9uZW50Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gbnVjbGVhci5tb2R1bGUoJ2dhbWUuYW5pbWF0aW9ucycsIFsnZ2FtZS5yZW5kZXJpbmcnXSlcbiAgLmNvbXBvbmVudCgnYW5pbWF0aW9ucycsIGZ1bmN0aW9uIChlLCBrZXksIGFuaW1hdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IEFuaW1hdGlvbnNDb21wb25lbnQoa2V5LCBhbmltYXRpb25zKTtcbiAgfSlcbiAgLnN5c3RlbSgnYW5pbWF0ZScsIFtcbiAgICAnc3ByaXRlIGZyb20gZ2FtZS5yZW5kZXJpbmcnLFxuICAgICdhdGxhcyBmcm9tIGdhbWUucmVuZGVyaW5nJyxcbiAgICAnYW5pbWF0aW9ucyBmcm9tIGdhbWUuYW5pbWF0aW9ucydcbiAgXSwgcmVxdWlyZSgnLi9zeXN0ZW1zL2FuaW1hdGUtc3lzdGVtJyksIHtcbiAgICBtc1BlclVwZGF0ZTogMTZcbiAgfSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYW5pbWF0ZVN5c3RlbShlLCBjb21wb25lbnRzLCBjb250ZXh0LCBkdCkge1xuICB2YXIgYXRsYXMsIHNwcml0ZSwgYW5pbWF0aW9ucywgY3VycmVudEFuaW1hdGlvbiwgZnJhbWUsIHdpZHRoLCBoZWlnaHQ7XG5cbiAgYXRsYXMgPSBjb21wb25lbnRzLmF0bGFzO1xuICBzcHJpdGUgPSBjb21wb25lbnRzLnNwcml0ZTtcbiAgYW5pbWF0aW9ucyA9IGNvbXBvbmVudHMuYW5pbWF0aW9ucztcblxuICBjdXJyZW50QW5pbWF0aW9uID0gYW5pbWF0aW9ucy5hbmltYXRpb25zW2FuaW1hdGlvbnMuY3VycmVudEFuaW1hdGlvbl07XG5cbiAgYW5pbWF0aW9ucy50aW1lRWxhcHNlZFNpbmNlTGFzdEZyYW1lICs9IGR0ICogMTY7Ly9udWNsZWFyLnN5c3RlbSgnYW5pbWF0ZScpLl9zY2hlZHVsZXIubGFnO1xuXG4gIGlmIChhbmltYXRpb25zLnRpbWVFbGFwc2VkU2luY2VMYXN0RnJhbWUgPiBjdXJyZW50QW5pbWF0aW9uLmludGVydmFsKSB7XG4gICAgYW5pbWF0aW9ucy5jdXJyZW50RnJhbWUgKz0gMTtcbiAgICBhbmltYXRpb25zLnRpbWVFbGFwc2VkU2luY2VMYXN0RnJhbWUgLT0gY3VycmVudEFuaW1hdGlvbi5pbnRlcnZhbDtcblxuICAgIGlmIChhbmltYXRpb25zLmN1cnJlbnRGcmFtZSA+IGN1cnJlbnRBbmltYXRpb24uZnJhbWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgIGFuaW1hdGlvbnMuY3VycmVudEZyYW1lID0gMDtcblxuICAgICAgaWYgKCFhbmltYXRpb25zLmxvb3ApIHtcbiAgICAgICAgYW5pbWF0aW9ucy5jdXJyZW50QW5pbWF0aW9uID0gYW5pbWF0aW9ucy5kZWZhdWx0QW5pbWF0aW9uO1xuICAgICAgICBjdXJyZW50QW5pbWF0aW9uID0gYW5pbWF0aW9ucy5hbmltYXRpb25zW2FuaW1hdGlvbnMuY3VycmVudEFuaW1hdGlvbl07XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnJhbWUgPSBhdGxhcy5zcHJpdGVzLmZyYW1lc1tjdXJyZW50QW5pbWF0aW9uLmZyYW1lc1thbmltYXRpb25zLmN1cnJlbnRGcmFtZV1dLmZyYW1lO1xuXG4gICAgd2lkdGggPSBzcHJpdGUud2lkdGgoKTtcbiAgICBoZWlnaHQgPSBzcHJpdGUuaGVpZ2h0KCk7XG5cbiAgICBzcHJpdGUuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgc3ByaXRlLmNvbnRleHQuZHJhd0ltYWdlKGF0bGFzLnNvdXJjZSwgZnJhbWUueCwgZnJhbWUueSwgZnJhbWUudywgZnJhbWUuaCwgMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG4oZnVuY3Rpb24obnVjbGVhciwgY29uc29sZSl7XG4gICAgcmVxdWlyZSgnLi9saWIvbW91c2V0cmFwLm1pbicpO1xuXG4gICAgdmFyIGlucHV0cywgR2FtZXBhZCwgTW91c2V0cmFwO1xuXG4gICAgR2FtZXBhZCA9IHJlcXVpcmUoJy4vbGliL2dhbWVwYWQubWluJykuR2FtZXBhZDtcbiAgICBNb3VzZXRyYXAgPSB3aW5kb3cuTW91c2V0cmFwO1xuXG4gICAgaW5wdXRzID0gbnVjbGVhci5tb2R1bGUoJ2lucHV0cycsIFtdKTtcblxuICAgIGlucHV0cy5jb21wb25lbnQoJ2lucHV0cycsIGZ1bmN0aW9uKGVudGl0eSwgZGF0YSl7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGlucHV0c01hbmFnZXIoZW50aXR5LCBjb21wb25lbnRzKXtcbiAgICAgIHZhciBpbnB1dHMgPSBjb21wb25lbnRzLmlucHV0cyxcbiAgICAgICAgICBpbnB1dDtcblxuICAgICAgZm9yKHZhciBpIGluIGlucHV0c01hbmFnZXIubWFuYWdlcil7XG4gICAgICAgIGlucHV0ID0gaW5wdXRzTWFuYWdlci5tYW5hZ2VyW2ldO1xuICAgICAgICBpZihpbnB1dHNbaV0pe1xuXG4gICAgICAgICAgaW5wdXRzW2ldKGVudGl0eSwgaW5wdXQsIGlucHV0c01hbmFnZXIubWFuYWdlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaW5wdXRzTWFuYWdlci5tYW5hZ2VyID0ge307XG5cbiAgICBpbnB1dHMuc3lzdGVtKCdpbnB1dHNNYW5hZ2VyJywgWydpbnB1dHMnXSwgaW5wdXRzTWFuYWdlciwge1xuICAgICAgbXNQZXJVcGRhdGUgOiA1MFxuICAgIH0pO1xuXG4gICAgaW5wdXRzLmNvbmZpZyh7XG4gICAgICBnYW1lcGFkIDoge1xuICAgICAgICAnRkFDRV8xJyA6ICcnLFxuICAgICAgICAnRkFDRV8yJyA6ICcnLFxuICAgICAgICAnRkFDRV8zJyA6ICcnLFxuICAgICAgICAnRkFDRV80JyA6ICcnLFxuXG4gICAgICAgICdMRUZUX1RPUF9TSE9VTERFUicgOiAnJyxcbiAgICAgICAgJ1JJR0hUX1RPUF9TSE9VTERFUicgOiAnJyxcbiAgICAgICAgJ0xFRlRfQk9UVE9NX1NIT1VMREVSJyA6ICcnLFxuICAgICAgICAnUklHSFRfQk9UVE9NX1NIT1VMREVSJyA6ICcnLFxuXG4gICAgICAgICdTRUxFQ1RfQkFDSycgOiAnJyxcbiAgICAgICAgJ1NUQVJUX0ZPUldBUkQnIDogJycsXG4gICAgICAgICdMRUZUX1NUSUNLX1gnIDogJ0xFRlRfQVhJU19YJyxcbiAgICAgICAgJ1JJR0hUX1NUSUNLX1gnIDogJ1JJR0hUX0FYSVNfWCcsXG4gICAgICAgICdMRUZUX1NUSUNLX1knIDogJ0xFRlRfQVhJU19ZJyxcbiAgICAgICAgJ1JJR0hUX1NUSUNLX1knIDogJ1JJR0hUX0FYSVNfWScsXG5cbiAgICAgICAgJ0RQQURfVVAnIDogJ1VQJyxcbiAgICAgICAgJ0RQQURfRE9XTicgOiAnRE9XTicsXG4gICAgICAgICdEUEFEX0xFRlQnIDogJ0xFRlQnLFxuICAgICAgICAnRFBBRF9SSUdIVCcgOiAnUklHSFQnLFxuXG4gICAgICAgICdIT01FJyA6ICcnXG4gICAgICB9LFxuICAgICAga2V5Ym9hcmQgOiB7XG4gICAgICAgICdhJyA6ICdBJyxcbiAgICAgICAgJ3VwJyA6ICdVUCcsXG4gICAgICAgICdkb3duJyA6ICdET1dOJyxcbiAgICAgICAgJ2xlZnQnIDogJ0xFRlQnLFxuICAgICAgICAncmlnaHQnIDogJ1JJR0hUJyxcbiAgICAgICAgJ3onIDogJ1VQJyxcbiAgICAgICAgJ3EnIDogJ0xFRlQnLFxuICAgICAgICAncycgOiAnRE9XTicsXG4gICAgICAgICdkJyA6ICdSSUdIVCcsXG4gICAgICB9XG4gICAgfSk7XG4gICAgdmFyIGdhbWVwYWQgPSBuZXcgR2FtZXBhZCgpO1xuICAgIGdhbWVwYWQuaW5pdCgpO1xuICAgIGdhbWVwYWQuYmluZChHYW1lcGFkLkV2ZW50LkNPTk5FQ1RFRCwgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zb2xlLmxvZygnW01PRFVMRUBJTlBVVFNdIEdBTUVQQUQgQ09OTkVDVEVEJyk7XG4gICAgfSk7XG4gICAgZ2FtZXBhZC5iaW5kKEdhbWVwYWQuRXZlbnQuVU5DT05ORUNURUQsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc29sZS5sb2coJ1tNT0RVTEVASU5QVVRTXSBHQU1FUEFEIFVOQ09OTkVDVEVEJyk7XG4gICAgfSk7XG4gICAgZ2FtZXBhZC5iaW5kKEdhbWVwYWQuRXZlbnQuQlVUVE9OX0RPV04sIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBhbGlhcyA9IGlucHV0cy5jb25maWcoJ2dhbWVwYWQnKVtlLmNvbnRyb2xdO1xuICAgICAgaW5wdXRzTWFuYWdlci5tYW5hZ2VyW2FsaWFzXSA9IDE7XG4gICAgfSk7XG4gICAgZ2FtZXBhZC5iaW5kKEdhbWVwYWQuRXZlbnQuQlVUVE9OX1VQLCBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgYWxpYXMgPSBpbnB1dHMuY29uZmlnKCdnYW1lcGFkJylbZS5jb250cm9sXTtcbiAgICAgIGlucHV0c01hbmFnZXIubWFuYWdlclthbGlhc10gPSAwO1xuICAgIH0pO1xuICAgIGdhbWVwYWQuYmluZChHYW1lcGFkLkV2ZW50LkFYSVNfQ0hBTkdFRCwgZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIGFsaWFzID0gaW5wdXRzLmNvbmZpZygnZ2FtZXBhZCcpW2UuYXhpc107XG4gICAgICBpbnB1dHNNYW5hZ2VyLm1hbmFnZXJbYWxpYXNdID0gZS52YWx1ZTtcbiAgICB9KTtcblxuICAgIHZhciBrZXksIGNvbmZpZztcbiAgICBjb25maWcgPSBpbnB1dHMuY29uZmlnKCdrZXlib2FyZCcpO1xuXG4gICAgZnVuY3Rpb24gb25LZXlEb3duKGUsIGtleSl7XG4gICAgICB2YXIgYWxpYXMgPSBpbnB1dHMuY29uZmlnKCdrZXlib2FyZCcpW2tleV07XG4gICAgICBpbnB1dHNNYW5hZ2VyLm1hbmFnZXJbYWxpYXNdID0gMTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbktleVVwKGUsIGtleSl7XG4gICAgICB2YXIgYWxpYXMgPSBpbnB1dHMuY29uZmlnKCdrZXlib2FyZCcpW2tleV07XG4gICAgICBpbnB1dHNNYW5hZ2VyLm1hbmFnZXJbYWxpYXNdID0gMDtcbiAgICB9XG5cbiAgICBmb3IodmFyIGkgaW4gY29uZmlnKXtcbiAgICAgIGtleSA9IGk7XG4gICAgICBNb3VzZXRyYXAuYmluZChrZXksIG9uS2V5RG93biwgJ2tleWRvd24nKTtcbiAgICAgIE1vdXNldHJhcC5iaW5kKGtleSwgb25LZXlVcCwgJ2tleXVwJyk7XG4gICAgICAvKmpzaGludCBpZ25vcmU6ZW5kICovXG4gICAgfVxuICAgIG51Y2xlYXIuaW1wb3J0KFtpbnB1dHNdKTtcbn0pKHdpbmRvdy5udWNsZWFyLCB3aW5kb3cuY29uc29sZSk7IiwiIWZ1bmN0aW9uKGEpe1widXNlIHN0cmljdFwiO3ZhciBiPWZ1bmN0aW9uKCl7fSxjPXtnZXRUeXBlOmZ1bmN0aW9uKCl7cmV0dXJuXCJudWxsXCJ9LGlzU3VwcG9ydGVkOmZ1bmN0aW9uKCl7cmV0dXJuITF9LHVwZGF0ZTpifSxkPWZ1bmN0aW9uKGEpe3ZhciBjPXRoaXMsZD13aW5kb3c7dGhpcy51cGRhdGU9Yjt0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZT1hfHxkLnJlcXVlc3RBbmltYXRpb25GcmFtZXx8ZC53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fGQubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lO3RoaXMudGlja0Z1bmN0aW9uPWZ1bmN0aW9uKCl7Yy51cGRhdGUoKTtjLnN0YXJ0VGlja2VyKCl9O3RoaXMuc3RhcnRUaWNrZXI9ZnVuY3Rpb24oKXtjLnJlcXVlc3RBbmltYXRpb25GcmFtZS5hcHBseShkLFtjLnRpY2tGdW5jdGlvbl0pfX07ZC5wcm90b3R5cGUuc3RhcnQ9ZnVuY3Rpb24oYSl7dGhpcy51cGRhdGU9YXx8Yjt0aGlzLnN0YXJ0VGlja2VyKCl9O3ZhciBlPWZ1bmN0aW9uKCl7fTtlLnByb3RvdHlwZS51cGRhdGU9YjtlLnByb3RvdHlwZS5zdGFydD1mdW5jdGlvbihhKXt0aGlzLnVwZGF0ZT1hfHxifTt2YXIgZj1mdW5jdGlvbihhLGIpe3RoaXMubGlzdGVuZXI9YTt0aGlzLmdhbWVwYWRHZXR0ZXI9Yjt0aGlzLmtub3duR2FtZXBhZHM9W119O2YuZmFjdG9yeT1mdW5jdGlvbihhKXt2YXIgYj1jLGQ9d2luZG93JiZ3aW5kb3cubmF2aWdhdG9yO2QmJihcInVuZGVmaW5lZFwiIT10eXBlb2YgZC53ZWJraXRHYW1lcGFkcz9iPW5ldyBmKGEsZnVuY3Rpb24oKXtyZXR1cm4gZC53ZWJraXRHYW1lcGFkc30pOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBkLndlYmtpdEdldEdhbWVwYWRzJiYoYj1uZXcgZihhLGZ1bmN0aW9uKCl7cmV0dXJuIGQud2Via2l0R2V0R2FtZXBhZHMoKX0pKSk7cmV0dXJuIGJ9O2YuZ2V0VHlwZT1mdW5jdGlvbigpe3JldHVyblwiV2ViS2l0XCJ9LGYucHJvdG90eXBlLmdldFR5cGU9ZnVuY3Rpb24oKXtyZXR1cm4gZi5nZXRUeXBlKCl9LGYucHJvdG90eXBlLmlzU3VwcG9ydGVkPWZ1bmN0aW9uKCl7cmV0dXJuITB9O2YucHJvdG90eXBlLnVwZGF0ZT1mdW5jdGlvbigpe3ZhciBhLGIsYz10aGlzLGQ9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5nYW1lcGFkR2V0dGVyKCksMCk7Zm9yKGI9dGhpcy5rbm93bkdhbWVwYWRzLmxlbmd0aC0xO2I+PTA7Yi0tKXthPXRoaXMua25vd25HYW1lcGFkc1tiXTtpZihkLmluZGV4T2YoYSk8MCl7dGhpcy5rbm93bkdhbWVwYWRzLnNwbGljZShiLDEpO3RoaXMubGlzdGVuZXIuX2Rpc2Nvbm5lY3QoYSl9fWZvcihiPTA7YjxkLmxlbmd0aDtiKyspe2E9ZFtiXTtpZihhJiZjLmtub3duR2FtZXBhZHMuaW5kZXhPZihhKTwwKXtjLmtub3duR2FtZXBhZHMucHVzaChhKTtjLmxpc3RlbmVyLl9jb25uZWN0KGEpfX19O3ZhciBnPWZ1bmN0aW9uKGEpe3RoaXMubGlzdGVuZXI9YTt3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImdhbWVwYWRjb25uZWN0ZWRcIixmdW5jdGlvbihiKXthLl9jb25uZWN0KGIuZ2FtZXBhZCl9KTt3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImdhbWVwYWRkaXNjb25uZWN0ZWRcIixmdW5jdGlvbihiKXthLl9kaXNjb25uZWN0KGIuZ2FtZXBhZCl9KX07Zy5mYWN0b3J5PWZ1bmN0aW9uKGEpe3ZhciBiPWM7d2luZG93JiZcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93LmFkZEV2ZW50TGlzdGVuZXImJihiPW5ldyBnKGEpKTtyZXR1cm4gYn07Zy5nZXRUeXBlPWZ1bmN0aW9uKCl7cmV0dXJuXCJGaXJlZm94XCJ9LGcucHJvdG90eXBlLmdldFR5cGU9ZnVuY3Rpb24oKXtyZXR1cm4gZy5nZXRUeXBlKCl9LGcucHJvdG90eXBlLmlzU3VwcG9ydGVkPWZ1bmN0aW9uKCl7cmV0dXJuITB9O2cucHJvdG90eXBlLnVwZGF0ZT1iO3ZhciBoPWZ1bmN0aW9uKGEpe3RoaXMudXBkYXRlU3RyYXRlZ3k9YXx8bmV3IGQ7dGhpcy5nYW1lcGFkcz1bXTt0aGlzLmxpc3RlbmVycz17fTt0aGlzLnBsYXRmb3JtPWM7dGhpcy5kZWFkem9uZT0uMDM7dGhpcy5tYXhpbWl6ZVRocmVzaG9sZD0uOTd9O2guVXBkYXRlU3RyYXRlZ2llcz17QW5pbUZyYW1lVXBkYXRlU3RyYXRlZ3k6ZCxNYW51YWxVcGRhdGVTdHJhdGVneTplfTtoLlBsYXRmb3JtRmFjdG9yaWVzPVtmLmZhY3RvcnksZy5mYWN0b3J5XTtoLlR5cGU9e1BMQVlTVEFUSU9OOlwicGxheXN0YXRpb25cIixMT0dJVEVDSDpcImxvZ2l0ZWNoXCIsWEJPWDpcInhib3hcIixVTktOT1dOOlwidW5rbm93blwifTtoLkV2ZW50PXtDT05ORUNURUQ6XCJjb25uZWN0ZWRcIixVTlNVUFBPUlRFRDpcInVuc3VwcG9ydGVkXCIsRElTQ09OTkVDVEVEOlwiZGlzY29ubmVjdGVkXCIsVElDSzpcInRpY2tcIixCVVRUT05fRE9XTjpcImJ1dHRvbi1kb3duXCIsQlVUVE9OX1VQOlwiYnV0dG9uLXVwXCIsQVhJU19DSEFOR0VEOlwiYXhpcy1jaGFuZ2VkXCJ9O2guU3RhbmRhcmRCdXR0b25zPVtcIkZBQ0VfMVwiLFwiRkFDRV8yXCIsXCJGQUNFXzNcIixcIkZBQ0VfNFwiLFwiTEVGVF9UT1BfU0hPVUxERVJcIixcIlJJR0hUX1RPUF9TSE9VTERFUlwiLFwiTEVGVF9CT1RUT01fU0hPVUxERVJcIixcIlJJR0hUX0JPVFRPTV9TSE9VTERFUlwiLFwiU0VMRUNUX0JBQ0tcIixcIlNUQVJUX0ZPUldBUkRcIixcIkxFRlRfU1RJQ0tcIixcIlJJR0hUX1NUSUNLXCIsXCJEUEFEX1VQXCIsXCJEUEFEX0RPV05cIixcIkRQQURfTEVGVFwiLFwiRFBBRF9SSUdIVFwiLFwiSE9NRVwiXTtoLlN0YW5kYXJkQXhlcz1bXCJMRUZUX1NUSUNLX1hcIixcIkxFRlRfU1RJQ0tfWVwiLFwiUklHSFRfU1RJQ0tfWFwiLFwiUklHSFRfU1RJQ0tfWVwiXTt2YXIgaT1mdW5jdGlvbihhLGIsYyl7cmV0dXJuIGI8YS5sZW5ndGg/YVtiXTpjKyhiLWEubGVuZ3RoKzEpfTtoLlN0YW5kYXJkTWFwcGluZz17ZW52Ont9LGJ1dHRvbnM6e2J5QnV0dG9uOlswLDEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyLDEzLDE0LDE1LDE2XX0sYXhlczp7YnlBeGlzOlswLDEsMiwzXX19O2guTWFwcGluZ3M9W3tlbnY6e3BsYXRmb3JtOmcuZ2V0VHlwZSgpLHR5cGU6aC5UeXBlLlBMQVlTVEFUSU9OfSxidXR0b25zOntieUJ1dHRvbjpbMTQsMTMsMTUsMTIsMTAsMTEsOCw5LDAsMywxLDIsNCw2LDcsNSwxNl19LGF4ZXM6e2J5QXhpczpbMCwxLDIsM119fSx7ZW52OntwbGF0Zm9ybTpmLmdldFR5cGUoKSx0eXBlOmguVHlwZS5MT0dJVEVDSH0sYnV0dG9uczp7YnlCdXR0b246WzEsMiwwLDMsNCw1LDYsNyw4LDksMTAsMTEsMTEsMTIsMTMsMTQsMTBdfSxheGVzOntieUF4aXM6WzAsMSwyLDNdfX0se2Vudjp7cGxhdGZvcm06Zy5nZXRUeXBlKCksdHlwZTpoLlR5cGUuTE9HSVRFQ0h9LGJ1dHRvbnM6e2J5QnV0dG9uOlswLDEsMiwzLDQsNSwtMSwtMSw2LDcsOCw5LDExLDEyLDEzLDE0LDEwXSxieUF4aXM6Wy0xLC0xLC0xLC0xLC0xLC0xLFsyLDAsMV0sWzIsMCwtMV1dfSxheGVzOntieUF4aXM6WzAsMSwzLDRdfX1dO2gucHJvdG90eXBlLmluaXQ9ZnVuY3Rpb24oKXt2YXIgYT1oLnJlc29sdmVQbGF0Zm9ybSh0aGlzKSxiPXRoaXM7dGhpcy5wbGF0Zm9ybT1hO3RoaXMudXBkYXRlU3RyYXRlZ3kuc3RhcnQoZnVuY3Rpb24oKXtiLl91cGRhdGUoKX0pO3JldHVybiBhLmlzU3VwcG9ydGVkKCl9O2gucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYSxiKXtcInVuZGVmaW5lZFwiPT10eXBlb2YgdGhpcy5saXN0ZW5lcnNbYV0mJih0aGlzLmxpc3RlbmVyc1thXT1bXSk7dGhpcy5saXN0ZW5lcnNbYV0ucHVzaChiKTtyZXR1cm4gdGhpc307aC5wcm90b3R5cGUudW5iaW5kPWZ1bmN0aW9uKGEsYil7aWYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGEpe2lmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBiKXtpZihcInVuZGVmaW5lZFwiPT10eXBlb2YgdGhpcy5saXN0ZW5lcnNbYV0pcmV0dXJuITE7Zm9yKHZhciBjPTA7Yzx0aGlzLmxpc3RlbmVyc1thXS5sZW5ndGg7YysrKWlmKHRoaXMubGlzdGVuZXJzW2FdW2NdPT09Yil7dGhpcy5saXN0ZW5lcnNbYV0uc3BsaWNlKGMsMSk7cmV0dXJuITB9cmV0dXJuITF9dGhpcy5saXN0ZW5lcnNbYV09W119ZWxzZSB0aGlzLmxpc3RlbmVycz17fX07aC5wcm90b3R5cGUuY291bnQ9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5nYW1lcGFkcy5sZW5ndGh9O2gucHJvdG90eXBlLl9maXJlPWZ1bmN0aW9uKGEsYil7aWYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHRoaXMubGlzdGVuZXJzW2FdKWZvcih2YXIgYz0wO2M8dGhpcy5saXN0ZW5lcnNbYV0ubGVuZ3RoO2MrKyl0aGlzLmxpc3RlbmVyc1thXVtjXS5hcHBseSh0aGlzLmxpc3RlbmVyc1thXVtjXSxbYl0pfTtoLmdldE51bGxQbGF0Zm9ybT1mdW5jdGlvbigpe3JldHVybiBPYmplY3QuY3JlYXRlKGMpfTtoLnJlc29sdmVQbGF0Zm9ybT1mdW5jdGlvbihhKXt2YXIgYixkPWM7Zm9yKGI9MDshZC5pc1N1cHBvcnRlZCgpJiZiPGguUGxhdGZvcm1GYWN0b3JpZXMubGVuZ3RoO2IrKylkPWguUGxhdGZvcm1GYWN0b3JpZXNbYl0oYSk7cmV0dXJuIGR9O2gucHJvdG90eXBlLl9jb25uZWN0PWZ1bmN0aW9uKGEpe3ZhciBiLGMsZD10aGlzLl9yZXNvbHZlTWFwcGluZyhhKTthLnN0YXRlPXt9O2EubGFzdFN0YXRlPXt9O2EudXBkYXRlcj1bXTtiPWQuYnV0dG9ucy5ieUJ1dHRvbi5sZW5ndGg7Zm9yKGM9MDtiPmM7YysrKXRoaXMuX2FkZEJ1dHRvblVwZGF0ZXIoYSxkLGMpO2I9ZC5heGVzLmJ5QXhpcy5sZW5ndGg7Zm9yKGM9MDtiPmM7YysrKXRoaXMuX2FkZEF4aXNVcGRhdGVyKGEsZCxjKTt0aGlzLmdhbWVwYWRzW2EuaW5kZXhdPWE7dGhpcy5fZmlyZShoLkV2ZW50LkNPTk5FQ1RFRCxhKX07aC5wcm90b3R5cGUuX2FkZEJ1dHRvblVwZGF0ZXI9ZnVuY3Rpb24oYSxjLGQpe3ZhciBlPWIsZj1pKGguU3RhbmRhcmRCdXR0b25zLGQsXCJFWFRSQV9CVVRUT05fXCIpLGc9dGhpcy5fY3JlYXRlQnV0dG9uR2V0dGVyKGEsYy5idXR0b25zLGQpLGo9dGhpcyxrPXtnYW1lcGFkOmEsY29udHJvbDpmfTthLnN0YXRlW2ZdPTA7YS5sYXN0U3RhdGVbZl09MDtlPWZ1bmN0aW9uKCl7dmFyIGI9ZygpLGM9YS5sYXN0U3RhdGVbZl0sZD1iPi41LGU9Yz4uNTthLnN0YXRlW2ZdPWI7ZCYmIWU/ai5fZmlyZShoLkV2ZW50LkJVVFRPTl9ET1dOLE9iamVjdC5jcmVhdGUoaykpOiFkJiZlJiZqLl9maXJlKGguRXZlbnQuQlVUVE9OX1VQLE9iamVjdC5jcmVhdGUoaykpOzAhPT1iJiYxIT09YiYmYiE9PWMmJmouX2ZpcmVBeGlzQ2hhbmdlZEV2ZW50KGEsZixiKTthLmxhc3RTdGF0ZVtmXT1ifTthLnVwZGF0ZXIucHVzaChlKX07aC5wcm90b3R5cGUuX2FkZEF4aXNVcGRhdGVyPWZ1bmN0aW9uKGEsYyxkKXt2YXIgZT1iLGY9aShoLlN0YW5kYXJkQXhlcyxkLFwiRVhUUkFfQVhJU19cIiksZz10aGlzLl9jcmVhdGVBeGlzR2V0dGVyKGEsYy5heGVzLGQpLGo9dGhpczthLnN0YXRlW2ZdPTA7YS5sYXN0U3RhdGVbZl09MDtlPWZ1bmN0aW9uKCl7dmFyIGI9ZygpLGM9YS5sYXN0U3RhdGVbZl07YS5zdGF0ZVtmXT1iO2IhPT1jJiZqLl9maXJlQXhpc0NoYW5nZWRFdmVudChhLGYsYik7YS5sYXN0U3RhdGVbZl09Yn07YS51cGRhdGVyLnB1c2goZSl9O2gucHJvdG90eXBlLl9maXJlQXhpc0NoYW5nZWRFdmVudD1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9e2dhbWVwYWQ6YSxheGlzOmIsdmFsdWU6Y307dGhpcy5fZmlyZShoLkV2ZW50LkFYSVNfQ0hBTkdFRCxkKX07aC5wcm90b3R5cGUuX2NyZWF0ZUJ1dHRvbkdldHRlcj1mdW5jdGlvbigpe3ZhciBhPWZ1bmN0aW9uKCl7cmV0dXJuIDB9LGI9ZnVuY3Rpb24oYixjLGQpe3ZhciBlPWE7ZD5jP2U9ZnVuY3Rpb24oKXt2YXIgYT1kLWMsZT1iKCk7ZT0oZS1jKS9hO3JldHVybiAwPmU/MDplfTpjPmQmJihlPWZ1bmN0aW9uKCl7dmFyIGE9Yy1kLGU9YigpO2U9KGUtZCkvYTtyZXR1cm4gZT4xPzA6MS1lfSk7cmV0dXJuIGV9LGM9ZnVuY3Rpb24oYSl7cmV0dXJuXCJbb2JqZWN0IEFycmF5XVwiPT09T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpfTtyZXR1cm4gZnVuY3Rpb24oZCxlLGYpe3ZhciBnLGg9YSxpPXRoaXM7Zz1lLmJ5QnV0dG9uW2ZdO2lmKC0xIT09ZylcIm51bWJlclwiPT10eXBlb2YgZyYmZzxkLmJ1dHRvbnMubGVuZ3RoJiYoaD1mdW5jdGlvbigpe3JldHVybiBkLmJ1dHRvbnNbZ119KTtlbHNlIGlmKGUuYnlBeGlzJiZmPGUuYnlBeGlzLmxlbmd0aCl7Zz1lLmJ5QXhpc1tmXTtpZihjKGcpJiYzPT1nLmxlbmd0aCYmZ1swXTxkLmF4ZXMubGVuZ3RoKXtoPWZ1bmN0aW9uKCl7dmFyIGE9ZC5heGVzW2dbMF1dO3JldHVybiBpLl9hcHBseURlYWR6b25lTWF4aW1pemUoYSl9O2g9YihoLGdbMV0sZ1syXSl9fXJldHVybiBofX0oKTtoLnByb3RvdHlwZS5fY3JlYXRlQXhpc0dldHRlcj1mdW5jdGlvbigpe3ZhciBhPWZ1bmN0aW9uKCl7cmV0dXJuIDB9O3JldHVybiBmdW5jdGlvbihiLGMsZCl7dmFyIGUsZj1hLGc9dGhpcztlPWMuYnlBeGlzW2RdOy0xIT09ZSYmXCJudW1iZXJcIj09dHlwZW9mIGUmJmU8Yi5heGVzLmxlbmd0aCYmKGY9ZnVuY3Rpb24oKXt2YXIgYT1iLmF4ZXNbZV07cmV0dXJuIGcuX2FwcGx5RGVhZHpvbmVNYXhpbWl6ZShhKX0pO3JldHVybiBmfX0oKTtoLnByb3RvdHlwZS5fZGlzY29ubmVjdD1mdW5jdGlvbihhKXt2YXIgYixjPVtdO1widW5kZWZpbmVkXCIhPXR5cGVvZiB0aGlzLmdhbWVwYWRzW2EuaW5kZXhdJiZkZWxldGUgdGhpcy5nYW1lcGFkc1thLmluZGV4XTtmb3IoYj0wO2I8dGhpcy5nYW1lcGFkcy5sZW5ndGg7YisrKVwidW5kZWZpbmVkXCIhPXR5cGVvZiB0aGlzLmdhbWVwYWRzW2JdJiYoY1tiXT10aGlzLmdhbWVwYWRzW2JdKTt0aGlzLmdhbWVwYWRzPWM7dGhpcy5fZmlyZShoLkV2ZW50LkRJU0NPTk5FQ1RFRCxhKX07aC5wcm90b3R5cGUuX3Jlc29sdmVDb250cm9sbGVyVHlwZT1mdW5jdGlvbihhKXthPWEudG9Mb3dlckNhc2UoKTtyZXR1cm4tMSE9PWEuaW5kZXhPZihcInBsYXlzdGF0aW9uXCIpP2guVHlwZS5QTEFZU1RBVElPTjotMSE9PWEuaW5kZXhPZihcImxvZ2l0ZWNoXCIpfHwtMSE9PWEuaW5kZXhPZihcIndpcmVsZXNzIGdhbWVwYWRcIik/aC5UeXBlLkxPR0lURUNIOi0xIT09YS5pbmRleE9mKFwieGJveFwiKXx8LTEhPT1hLmluZGV4T2YoXCIzNjBcIik/aC5UeXBlLlhCT1g6aC5UeXBlLlVOS05PV059O2gucHJvdG90eXBlLl9yZXNvbHZlTWFwcGluZz1mdW5jdGlvbihhKXt2YXIgYixjLGQ9aC5NYXBwaW5ncyxlPW51bGwsZj17cGxhdGZvcm06dGhpcy5wbGF0Zm9ybS5nZXRUeXBlKCksdHlwZTp0aGlzLl9yZXNvbHZlQ29udHJvbGxlclR5cGUoYS5pZCl9O2ZvcihiPTA7IWUmJmI8ZC5sZW5ndGg7YisrKXtjPWRbYl07aC5lbnZNYXRjaGVzRmlsdGVyKGMuZW52LGYpJiYoZT1jKX1yZXR1cm4gZXx8aC5TdGFuZGFyZE1hcHBpbmd9O2guZW52TWF0Y2hlc0ZpbHRlcj1mdW5jdGlvbihhLGIpe3ZhciBjLGQ9ITA7Zm9yKGMgaW4gYSlhW2NdIT09YltjXSYmKGQ9ITEpO3JldHVybiBkfTtoLnByb3RvdHlwZS5fdXBkYXRlPWZ1bmN0aW9uKCl7dGhpcy5wbGF0Zm9ybS51cGRhdGUoKTt0aGlzLmdhbWVwYWRzLmZvckVhY2goZnVuY3Rpb24oYSl7YSYmYS51cGRhdGVyLmZvckVhY2goZnVuY3Rpb24oYSl7YSgpfSl9KTt0aGlzLmdhbWVwYWRzLmxlbmd0aD4wJiZ0aGlzLl9maXJlKGguRXZlbnQuVElDSyx0aGlzLmdhbWVwYWRzKX0saC5wcm90b3R5cGUuX2FwcGx5RGVhZHpvbmVNYXhpbWl6ZT1mdW5jdGlvbihhLGIsYyl7Yj1cInVuZGVmaW5lZFwiIT10eXBlb2YgYj9iOnRoaXMuZGVhZHpvbmU7Yz1cInVuZGVmaW5lZFwiIT10eXBlb2YgYz9jOnRoaXMubWF4aW1pemVUaHJlc2hvbGQ7YT49MD9iPmE/YT0wOmE+YyYmKGE9MSk6YT4tYj9hPTA6LWM+YSYmKGE9LTEpO3JldHVybiBhfTthLkdhbWVwYWQ9aH0oXCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHN8fHdpbmRvdyk7IiwiLyogbW91c2V0cmFwIHYxLjQuNiBjcmFpZy5pcy9raWxsaW5nL21pY2UgKi9cbihmdW5jdGlvbihKLHIsZil7ZnVuY3Rpb24gcyhhLGIsZCl7YS5hZGRFdmVudExpc3RlbmVyP2EuYWRkRXZlbnRMaXN0ZW5lcihiLGQsITEpOmEuYXR0YWNoRXZlbnQoXCJvblwiK2IsZCl9ZnVuY3Rpb24gQShhKXtpZihcImtleXByZXNzXCI9PWEudHlwZSl7dmFyIGI9U3RyaW5nLmZyb21DaGFyQ29kZShhLndoaWNoKTthLnNoaWZ0S2V5fHwoYj1iLnRvTG93ZXJDYXNlKCkpO3JldHVybiBifXJldHVybiBoW2Eud2hpY2hdP2hbYS53aGljaF06QlthLndoaWNoXT9CW2Eud2hpY2hdOlN0cmluZy5mcm9tQ2hhckNvZGUoYS53aGljaCkudG9Mb3dlckNhc2UoKX1mdW5jdGlvbiB0KGEpe2E9YXx8e307dmFyIGI9ITEsZDtmb3IoZCBpbiBuKWFbZF0/Yj0hMDpuW2RdPTA7Ynx8KHU9ITEpfWZ1bmN0aW9uIEMoYSxiLGQsYyxlLHYpe3ZhciBnLGssZj1bXSxoPWQudHlwZTtpZighbFthXSlyZXR1cm5bXTtcImtleXVwXCI9PWgmJncoYSkmJihiPVthXSk7Zm9yKGc9MDtnPGxbYV0ubGVuZ3RoOysrZylpZihrPVxubFthXVtnXSwhKCFjJiZrLnNlcSYmbltrLnNlcV0hPWsubGV2ZWx8fGghPWsuYWN0aW9ufHwoXCJrZXlwcmVzc1wiIT1ofHxkLm1ldGFLZXl8fGQuY3RybEtleSkmJmIuc29ydCgpLmpvaW4oXCIsXCIpIT09ay5tb2RpZmllcnMuc29ydCgpLmpvaW4oXCIsXCIpKSl7dmFyIG09YyYmay5zZXE9PWMmJmsubGV2ZWw9PXY7KCFjJiZrLmNvbWJvPT1lfHxtKSYmbFthXS5zcGxpY2UoZywxKTtmLnB1c2goayl9cmV0dXJuIGZ9ZnVuY3Rpb24gSyhhKXt2YXIgYj1bXTthLnNoaWZ0S2V5JiZiLnB1c2goXCJzaGlmdFwiKTthLmFsdEtleSYmYi5wdXNoKFwiYWx0XCIpO2EuY3RybEtleSYmYi5wdXNoKFwiY3RybFwiKTthLm1ldGFLZXkmJmIucHVzaChcIm1ldGFcIik7cmV0dXJuIGJ9ZnVuY3Rpb24geChhLGIsZCxjKXttLnN0b3BDYWxsYmFjayhiLGIudGFyZ2V0fHxiLnNyY0VsZW1lbnQsZCxjKXx8ITEhPT1hKGIsZCl8fChiLnByZXZlbnREZWZhdWx0P2IucHJldmVudERlZmF1bHQoKTpiLnJldHVyblZhbHVlPSExLGIuc3RvcFByb3BhZ2F0aW9uP1xuYi5zdG9wUHJvcGFnYXRpb24oKTpiLmNhbmNlbEJ1YmJsZT0hMCl9ZnVuY3Rpb24geShhKXtcIm51bWJlclwiIT09dHlwZW9mIGEud2hpY2gmJihhLndoaWNoPWEua2V5Q29kZSk7dmFyIGI9QShhKTtiJiYoXCJrZXl1cFwiPT1hLnR5cGUmJno9PT1iP3o9ITE6bS5oYW5kbGVLZXkoYixLKGEpLGEpKX1mdW5jdGlvbiB3KGEpe3JldHVyblwic2hpZnRcIj09YXx8XCJjdHJsXCI9PWF8fFwiYWx0XCI9PWF8fFwibWV0YVwiPT1hfWZ1bmN0aW9uIEwoYSxiLGQsYyl7ZnVuY3Rpb24gZShiKXtyZXR1cm4gZnVuY3Rpb24oKXt1PWI7KytuW2FdO2NsZWFyVGltZW91dChEKTtEPXNldFRpbWVvdXQodCwxRTMpfX1mdW5jdGlvbiB2KGIpe3goZCxiLGEpO1wia2V5dXBcIiE9PWMmJih6PUEoYikpO3NldFRpbWVvdXQodCwxMCl9Zm9yKHZhciBnPW5bYV09MDtnPGIubGVuZ3RoOysrZyl7dmFyIGY9ZysxPT09Yi5sZW5ndGg/djplKGN8fEUoYltnKzFdKS5hY3Rpb24pO0YoYltnXSxmLGMsYSxnKX19ZnVuY3Rpb24gRShhLGIpe3ZhciBkLFxuYyxlLGY9W107ZD1cIitcIj09PWE/W1wiK1wiXTphLnNwbGl0KFwiK1wiKTtmb3IoZT0wO2U8ZC5sZW5ndGg7KytlKWM9ZFtlXSxHW2NdJiYoYz1HW2NdKSxiJiZcImtleXByZXNzXCIhPWImJkhbY10mJihjPUhbY10sZi5wdXNoKFwic2hpZnRcIikpLHcoYykmJmYucHVzaChjKTtkPWM7ZT1iO2lmKCFlKXtpZighcCl7cD17fTtmb3IodmFyIGcgaW4gaCk5NTxnJiYxMTI+Z3x8aC5oYXNPd25Qcm9wZXJ0eShnKSYmKHBbaFtnXV09Zyl9ZT1wW2RdP1wia2V5ZG93blwiOlwia2V5cHJlc3NcIn1cImtleXByZXNzXCI9PWUmJmYubGVuZ3RoJiYoZT1cImtleWRvd25cIik7cmV0dXJue2tleTpjLG1vZGlmaWVyczpmLGFjdGlvbjplfX1mdW5jdGlvbiBGKGEsYixkLGMsZSl7cVthK1wiOlwiK2RdPWI7YT1hLnJlcGxhY2UoL1xccysvZyxcIiBcIik7dmFyIGY9YS5zcGxpdChcIiBcIik7MTxmLmxlbmd0aD9MKGEsZixiLGQpOihkPUUoYSxkKSxsW2Qua2V5XT1sW2Qua2V5XXx8W10sQyhkLmtleSxkLm1vZGlmaWVycyx7dHlwZTpkLmFjdGlvbn0sXG5jLGEsZSksbFtkLmtleV1bYz9cInVuc2hpZnRcIjpcInB1c2hcIl0oe2NhbGxiYWNrOmIsbW9kaWZpZXJzOmQubW9kaWZpZXJzLGFjdGlvbjpkLmFjdGlvbixzZXE6YyxsZXZlbDplLGNvbWJvOmF9KSl9dmFyIGg9ezg6XCJiYWNrc3BhY2VcIiw5OlwidGFiXCIsMTM6XCJlbnRlclwiLDE2Olwic2hpZnRcIiwxNzpcImN0cmxcIiwxODpcImFsdFwiLDIwOlwiY2Fwc2xvY2tcIiwyNzpcImVzY1wiLDMyOlwic3BhY2VcIiwzMzpcInBhZ2V1cFwiLDM0OlwicGFnZWRvd25cIiwzNTpcImVuZFwiLDM2OlwiaG9tZVwiLDM3OlwibGVmdFwiLDM4OlwidXBcIiwzOTpcInJpZ2h0XCIsNDA6XCJkb3duXCIsNDU6XCJpbnNcIiw0NjpcImRlbFwiLDkxOlwibWV0YVwiLDkzOlwibWV0YVwiLDIyNDpcIm1ldGFcIn0sQj17MTA2OlwiKlwiLDEwNzpcIitcIiwxMDk6XCItXCIsMTEwOlwiLlwiLDExMTpcIi9cIiwxODY6XCI7XCIsMTg3OlwiPVwiLDE4ODpcIixcIiwxODk6XCItXCIsMTkwOlwiLlwiLDE5MTpcIi9cIiwxOTI6XCJgXCIsMjE5OlwiW1wiLDIyMDpcIlxcXFxcIiwyMjE6XCJdXCIsMjIyOlwiJ1wifSxIPXtcIn5cIjpcImBcIixcIiFcIjpcIjFcIixcblwiQFwiOlwiMlwiLFwiI1wiOlwiM1wiLCQ6XCI0XCIsXCIlXCI6XCI1XCIsXCJeXCI6XCI2XCIsXCImXCI6XCI3XCIsXCIqXCI6XCI4XCIsXCIoXCI6XCI5XCIsXCIpXCI6XCIwXCIsXzpcIi1cIixcIitcIjpcIj1cIixcIjpcIjpcIjtcIiwnXCInOlwiJ1wiLFwiPFwiOlwiLFwiLFwiPlwiOlwiLlwiLFwiP1wiOlwiL1wiLFwifFwiOlwiXFxcXFwifSxHPXtvcHRpb246XCJhbHRcIixjb21tYW5kOlwibWV0YVwiLFwicmV0dXJuXCI6XCJlbnRlclwiLGVzY2FwZTpcImVzY1wiLG1vZDovTWFjfGlQb2R8aVBob25lfGlQYWQvLnRlc3QobmF2aWdhdG9yLnBsYXRmb3JtKT9cIm1ldGFcIjpcImN0cmxcIn0scCxsPXt9LHE9e30sbj17fSxELHo9ITEsST0hMSx1PSExO2ZvcihmPTE7MjA+ZjsrK2YpaFsxMTErZl09XCJmXCIrZjtmb3IoZj0wOzk+PWY7KytmKWhbZis5Nl09ZjtzKHIsXCJrZXlwcmVzc1wiLHkpO3MocixcImtleWRvd25cIix5KTtzKHIsXCJrZXl1cFwiLHkpO3ZhciBtPXtiaW5kOmZ1bmN0aW9uKGEsYixkKXthPWEgaW5zdGFuY2VvZiBBcnJheT9hOlthXTtmb3IodmFyIGM9MDtjPGEubGVuZ3RoOysrYylGKGFbY10sYixkKTtyZXR1cm4gdGhpc30sXG51bmJpbmQ6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gbS5iaW5kKGEsZnVuY3Rpb24oKXt9LGIpfSx0cmlnZ2VyOmZ1bmN0aW9uKGEsYil7aWYocVthK1wiOlwiK2JdKXFbYStcIjpcIitiXSh7fSxhKTtyZXR1cm4gdGhpc30scmVzZXQ6ZnVuY3Rpb24oKXtsPXt9O3E9e307cmV0dXJuIHRoaXN9LHN0b3BDYWxsYmFjazpmdW5jdGlvbihhLGIpe3JldHVybi0xPChcIiBcIitiLmNsYXNzTmFtZStcIiBcIikuaW5kZXhPZihcIiBtb3VzZXRyYXAgXCIpPyExOlwiSU5QVVRcIj09Yi50YWdOYW1lfHxcIlNFTEVDVFwiPT1iLnRhZ05hbWV8fFwiVEVYVEFSRUFcIj09Yi50YWdOYW1lfHxiLmlzQ29udGVudEVkaXRhYmxlfSxoYW5kbGVLZXk6ZnVuY3Rpb24oYSxiLGQpe3ZhciBjPUMoYSxiLGQpLGU7Yj17fTt2YXIgZj0wLGc9ITE7Zm9yKGU9MDtlPGMubGVuZ3RoOysrZSljW2VdLnNlcSYmKGY9TWF0aC5tYXgoZixjW2VdLmxldmVsKSk7Zm9yKGU9MDtlPGMubGVuZ3RoOysrZSljW2VdLnNlcT9jW2VdLmxldmVsPT1mJiYoZz0hMCxcbmJbY1tlXS5zZXFdPTEseChjW2VdLmNhbGxiYWNrLGQsY1tlXS5jb21ibyxjW2VdLnNlcSkpOmd8fHgoY1tlXS5jYWxsYmFjayxkLGNbZV0uY29tYm8pO2M9XCJrZXlwcmVzc1wiPT1kLnR5cGUmJkk7ZC50eXBlIT11fHx3KGEpfHxjfHx0KGIpO0k9ZyYmXCJrZXlkb3duXCI9PWQudHlwZX19O0ouTW91c2V0cmFwPW07XCJmdW5jdGlvblwiPT09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZCYmZGVmaW5lKG0pfSkod2luZG93LGRvY3VtZW50KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHBhdGgsIGxvYWRlcjtcblxucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmxvYWRlciA9IHJlcXVpcmUoJ2dhbWUnKS5sb2FkZXI7XG5cbmZ1bmN0aW9uIEF0bGFzQ29tcG9uZW50KGtleSkge1xuICB0aGlzLnNvdXJjZSA9IGxvYWRlci5nZXQocGF0aC5qb2luKCdhdGxhc2VzJywga2V5ICsgJy5hdGxhcy5wbmcnKSk7XG4gIHRoaXMuc3ByaXRlcyA9IGxvYWRlci5nZXQocGF0aC5qb2luKCdhdGxhc2VzJywga2V5ICsgJy5hdGxhcy5qc29uJykpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF0bGFzQ29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbG9hZGVyLCBwYXRoO1xuXG5sb2FkZXIgPSByZXF1aXJlKCdnYW1lJykubG9hZGVyO1xucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuZnVuY3Rpb24gU3ByaXRlQ29tcG9uZW50KHdpZHRoLCBoZWlnaHQsIGNlbnRlciwgZGVzdCkge1xuICB0aGlzLmJ1ZmZlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICB0aGlzLmNvbnRleHQgPSB0aGlzLmJ1ZmZlci5nZXRDb250ZXh0KCcyZCcpO1xuXG4gIHRoaXMuZGVzdCA9IGRlc3QgfHwgMDtcbiAgaWYoY2VudGVyID09PSB1bmRlZmluZWQpIGNlbnRlciA9IHRydWU7XG4gIHRoaXMuY2VudGVyID0gY2VudGVyO1xuICB0aGlzLmJ1ZmZlci53aWR0aCA9IHdpZHRoO1xuICB0aGlzLmJ1ZmZlci5oZWlnaHQgPSBoZWlnaHQ7XG4gIHRoaXMuY29udGV4dC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbn1cblxuU3ByaXRlQ29tcG9uZW50LnByb3RvdHlwZS5mcm9tQXRsYXMgPSBmdW5jdGlvbiAoYXRsYXMsIGZyYW1lLCB3aWR0aCwgaGVpZ2h0KSB7XG4gIHZhciBzb3VyY2UsIHNwcml0ZTtcblxuICBzb3VyY2UgPSBsb2FkZXIuZ2V0KHBhdGguam9pbignYXRsYXNlcycsIGF0bGFzICsgJy5hdGxhcy5wbmcnKSk7XG4gIHNwcml0ZSA9IGxvYWRlci5nZXQocGF0aC5qb2luKCdhdGxhc2VzJywgYXRsYXMgKyAnLmF0bGFzLmpzb24nKSkuZnJhbWVzW2ZyYW1lXTtcblxuICBpZighd2lkdGgpIHdpZHRoID0gc3ByaXRlLmZyYW1lLnc7XG4gIGlmKCFoZWlnaHQpIGhlaWdodCA9IHNwcml0ZS5mcmFtZS5oO1xuXG4gIHRoaXMud2lkdGgod2lkdGgpO1xuICB0aGlzLmhlaWdodChoZWlnaHQpO1xuXG4gIHRoaXMuY29udGV4dC5kcmF3SW1hZ2Uoc291cmNlLCBzcHJpdGUuZnJhbWUueCwgc3ByaXRlLmZyYW1lLnksIHNwcml0ZS5mcmFtZS53LCBzcHJpdGUuZnJhbWUuaCwgMCwgMCwgd2lkdGgsIGhlaWdodCk7XG59O1xuXG5TcHJpdGVDb21wb25lbnQucHJvdG90eXBlLndpZHRoID0gZnVuY3Rpb24gc3ByaXRlV2lkdGgodmFsdWUpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdGhpcy5idWZmZXIud2lkdGg7XG4gIH1cblxuICB0aGlzLmJ1ZmZlci53aWR0aCA9IHZhbHVlO1xuICB0aGlzLmNvbnRleHQuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gIHJldHVybiB0aGlzO1xufTtcblxuU3ByaXRlQ29tcG9uZW50LnByb3RvdHlwZS5oZWlnaHQgPSBmdW5jdGlvbiBzcHJpdGVIZWlnaHQodmFsdWUpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdGhpcy5idWZmZXIuaGVpZ2h0O1xuICB9XG5cbiAgdGhpcy5idWZmZXIuaGVpZ2h0ID0gdmFsdWU7XG4gIHRoaXMuY29udGV4dC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZUNvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEF0bGFzQ29tcG9uZW50LCBTcHJpdGVDb21wb25lbnQ7XG5cbkF0bGFzQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2F0bGFzLWNvbXBvbmVudCcpO1xuU3ByaXRlQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3Nwcml0ZS1jb21wb25lbnQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBudWNsZWFyLm1vZHVsZSgnZ2FtZS5yZW5kZXJpbmcnLCBbJ2dhbWUudHJhbnNmb3JtJ10pXG4gIC5jb21wb25lbnQoJ2F0bGFzJywgZnVuY3Rpb24gKGUsIGtleSkge1xuICAgIHJldHVybiBuZXcgQXRsYXNDb21wb25lbnQoa2V5KTtcbiAgfSlcbiAgLmNvbXBvbmVudCgnc3ByaXRlJywgZnVuY3Rpb24gKGUsIHdpZHRoLCBoZWlnaHQsIGNlbnRlciwgZGVzdCkge1xuICAgIHJldHVybiBuZXcgU3ByaXRlQ29tcG9uZW50KHdpZHRoLCBoZWlnaHQsIGNlbnRlciwgZGVzdCk7XG4gIH0pXG4gIC5zeXN0ZW0oJ3JlbmRlcmVyJywgW1xuICAgICdzcHJpdGUgZnJvbSBnYW1lLnJlbmRlcmluZycsXG4gICAgJ3Bvc2l0aW9uIGZyb20gZ2FtZS50cmFuc2Zvcm0nXG4gIF0sIHJlcXVpcmUoJy4vc3lzdGVtcy9yZW5kZXJlci1zeXN0ZW0nKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbm51Y2xlYXIuZXZlbnRzLm9uKCdzeXN0ZW06YmVmb3JlOnJlbmRlcmVyIGZyb20gZ2FtZS5yZW5kZXJpbmcnLCBmdW5jdGlvbiAoKSB7XG4gIHZhciBjb250ZXh0O1xuXG4gIGNvbnRleHQgPSBudWNsZWFyLnN5c3RlbS5jb250ZXh0KCk7XG5cbiAgY29udGV4dC5kZXN0c1sxXS5jbGVhclJlY3QoMCwgMCwgY29udGV4dC5XSURUSCwgY29udGV4dC5IRUlHSFQpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmVuZGVyZXJTeXN0ZW0oZSwgY29tcG9uZW50cywgY29udGV4dCkge1xuICB2YXIgc3ByaXRlLCBwb3NpdGlvbiwgZGVzdCwgd2lkdGgsIGhlaWdodCwgbXVsdGlwbGljYXRvcjtcblxuICBzcHJpdGUgPSBjb21wb25lbnRzLnNwcml0ZTtcbiAgcG9zaXRpb24gPSBjb21wb25lbnRzLnBvc2l0aW9uO1xuXG4gIGRlc3QgPSBjb250ZXh0LmRlc3RzW3Nwcml0ZS5kZXN0XTtcblxuICB3aWR0aCA9IHNwcml0ZS53aWR0aCgpO1xuICBoZWlnaHQgPSBzcHJpdGUuaGVpZ2h0KCk7XG4gIG11bHRpcGxpY2F0b3IgPSAoc3ByaXRlLmNlbnRlcikgPyAwLjUgOiAxO1xuXG4gIGRlc3QuZHJhd0ltYWdlKHNwcml0ZS5idWZmZXIsIHBvc2l0aW9uLnggLSB3aWR0aCAqIG11bHRpcGxpY2F0b3IsIHBvc2l0aW9uLnkgLSBoZWlnaHQgKiBtdWx0aXBsaWNhdG9yLCB3aWR0aCwgaGVpZ2h0KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB0ZW1wbGF0ZXMgOiB7XG4gICAgJ29uZScgOiB7XG4gICAgICBuYW1lIDogJ29uZScsXG4gICAgICBzbG90cyA6IFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGUgOiAnY3JhdGUnLFxuICAgICAgICAgIHBvc2l0aW9uIDoge1xuICAgICAgICAgICAgeCA6IDMwLFxuICAgICAgICAgICAgeSA6IDIwXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZSA6ICdjcmF0ZScsXG4gICAgICAgICAgcG9zaXRpb24gOiB7XG4gICAgICAgICAgICB4IDogNDAsXG4gICAgICAgICAgICB5IDogMjBcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlIDogJ2NyYXRlJyxcbiAgICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICAgIHggOiAxMDAsXG4gICAgICAgICAgICB5IDogMTBcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBsaWdodCA6ICdyZWQnLFxuICAgICAgYnVuZGxlIDogJ3N0b25lJ1xuICAgIH0sXG4gICAgJ3R3bycgOiB7XG4gICAgICBuYW1lIDogJ3R3bycsXG4gICAgICBzbG90cyA6IFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGUgOiAnY3JhdGUnLFxuICAgICAgICAgIHBvc2l0aW9uIDoge1xuICAgICAgICAgICAgeCA6IDMwLFxuICAgICAgICAgICAgeSA6IDIwXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZSA6ICdjcmF0ZScsXG4gICAgICAgICAgcG9zaXRpb24gOiB7XG4gICAgICAgICAgICB4IDogNDAsXG4gICAgICAgICAgICB5IDogMjBcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlIDogJ2NyYXRlJyxcbiAgICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICAgIHggOiAxMDAsXG4gICAgICAgICAgICB5IDogMTBcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBsaWdodCA6ICdyZWQnLFxuICAgICAgYnVuZGxlIDogJ3N0b25lJ1xuICAgIH0sXG4gICAgJ3RocmVlJyA6IHtcbiAgICAgIG5hbWUgOiAndGhyZWUnLFxuICAgICAgc2xvdHMgOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlIDogJ2NyYXRlJyxcbiAgICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICAgIHggOiAzMCxcbiAgICAgICAgICAgIHkgOiAyMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGUgOiAnY3JhdGUnLFxuICAgICAgICAgIHBvc2l0aW9uIDoge1xuICAgICAgICAgICAgeCA6IDQwLFxuICAgICAgICAgICAgeSA6IDIwXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZSA6ICdjcmF0ZScsXG4gICAgICAgICAgcG9zaXRpb24gOiB7XG4gICAgICAgICAgICB4IDogMTAwLFxuICAgICAgICAgICAgeSA6IDEwXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdLFxuICAgICAgbGlnaHQgOiAncmVkJyxcbiAgICAgIGJ1bmRsZSA6ICdzdG9uZSdcbiAgICB9LFxuICAgICdmb3VyJyA6IHtcbiAgICAgIG5hbWUgOiAnZm91cicsXG4gICAgICBzbG90cyA6IFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGUgOiAnY3JhdGUnLFxuICAgICAgICAgIHBvc2l0aW9uIDoge1xuICAgICAgICAgICAgeCA6IDMwLFxuICAgICAgICAgICAgeSA6IDIwXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZSA6ICdjcmF0ZScsXG4gICAgICAgICAgcG9zaXRpb24gOiB7XG4gICAgICAgICAgICB4IDogNDAsXG4gICAgICAgICAgICB5IDogMjBcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlIDogJ2NyYXRlJyxcbiAgICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICAgIHggOiAxMDAsXG4gICAgICAgICAgICB5IDogMTBcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBsaWdodCA6ICdyZWQnLFxuICAgICAgYnVuZGxlIDogJ3N0b25lJ1xuICAgIH1cbiAgfSxcbiAgcmFuZ2VzIDoge1xuICAgICdvbmUnIDogWzksIDE0XSxcbiAgICAndHdvJyA6IFsxNSwgMjVdLFxuICAgICd0aHJlZScgOiBbMjYsIDQwXSxcbiAgICAnZm91cicgOiBbNDEsIDIwMF0sXG4gIH0sXG4gIHNsb3RzIDoge1xuICAgIHRvcmNoIDoge1xuICAgICAgY29tcG9uZW50cyA6IFtcbiAgICAgICAgJ2Rlc3RydWN0aWJsZScsXG4gICAgICAgICdjb2xsaWRlcicsXG4gICAgICAgICdzcHJpdGUnLFxuICAgICAgICAnc2NhbGUnXG4gICAgICBdLFxuICAgICAgZGF0YSA6IHtcblxuICAgICAgfVxuICAgIH0sXG4gICAgY3JhdGUgOiB7XG4gICAgICBjb21wb25lbnRzIDogW1xuICAgICAgXSxcbiAgICAgIGRhdGEgOiB7XG4gICAgICAgIHNwcml0ZSA6IFswLCAxMjAsIDEyMF0sXG4gICAgICAgIGF0bGFzIDogWzAsICdjcmF0ZSddXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBidW5kbGVzIDoge1xuICAgICdzdG9uZScgOiB7XG4gICAgICAndXBwZXJMZWZ0JyA6IFt7XG4gICAgICAgIGluZGV4IDogMSxcbiAgICAgIH1dLFxuICAgICAgJ3VwcGVyTGVmdF90b3AnIDogW3tcbiAgICAgICAgaW5kZXggOiAwLFxuICAgICAgICBoIDogMC43NSxcbiAgICAgICAgeSA6IC0xMTksXG4gICAgICAgIGRlc3QgOiAyXG4gICAgICB9XSxcbiAgICAgICdkb3duTGVmdCcgOiBbe1xuICAgICAgICBpbmRleCA6IDMsXG4gICAgICB9XSxcbiAgICAgICdkb3duTGVmdF90b3AnIDogW3tcbiAgICAgICAgaW5kZXggOiAyLFxuICAgICAgICBoIDogMC43NSxcbiAgICAgICAgeSA6IC0xMTksXG4gICAgICAgIGRlc3QgOiAyXG4gICAgICB9XSxcbiAgICAgICd1cHBlclJpZ2h0JyA6IFt7XG4gICAgICAgIGluZGV4IDogNSxcbiAgICAgIH1dLFxuICAgICAgJ3VwcGVyUmlnaHRfdG9wJyA6IFt7XG4gICAgICAgIGluZGV4IDogNCxcbiAgICAgICAgaCA6IDAuNzUsXG4gICAgICAgIHkgOiAtMTE5LFxuICAgICAgICBkZXN0IDogMlxuICAgICAgfV0sXG4gICAgICAnZG93blJpZ2h0JyA6IFt7XG4gICAgICAgIGluZGV4IDogNyxcbiAgICAgIH1dLFxuICAgICAgJ2Rvd25SaWdodF90b3AnIDogW3tcbiAgICAgICAgaW5kZXggOiA2LFxuICAgICAgICBoIDogMC43NSxcbiAgICAgICAgeSA6IC0xMTksXG4gICAgICAgIGRlc3QgOiAyXG4gICAgICB9XSxcbiAgICAgICdncm91bmQnIDogW3tcbiAgICAgICAgaW5kZXggOiA4LFxuICAgICAgfSx7XG4gICAgICAgIGluZGV4IDogOSxcbiAgICAgIH0se1xuICAgICAgICBpbmRleCA6IDEwLFxuICAgICAgfV0sXG4gICAgICAnbGVmdCcgOiBbe1xuICAgICAgICBpbmRleCA6IDExLFxuICAgICAgfV0sXG4gICAgICAncmlnaHQnIDogW3tcbiAgICAgICAgaW5kZXggOiAxMixcbiAgICAgIH1dLFxuICAgICAgJ3VwJyA6IFt7XG4gICAgICAgIGluZGV4IDogMTQsXG4gICAgICB9LHtcbiAgICAgICAgaW5kZXggOiAxNixcbiAgICAgIH0se1xuICAgICAgICBpbmRleCA6IDE4LFxuICAgICAgfV0sXG4gICAgICAndXBfdG9wJyA6IFt7XG4gICAgICAgIGluZGV4IDogMTMsXG4gICAgICAgIGggOiAwLjc1LFxuICAgICAgICB5IDogLTExOSxcbiAgICAgICAgZGVzdCA6IDJcbiAgICAgIH0se1xuICAgICAgICBpbmRleCA6IDE1LFxuICAgICAgICBoIDogMC43NSxcbiAgICAgICAgeSA6IC0xMTksXG4gICAgICAgIGRlc3QgOiAyXG4gICAgICB9LHtcbiAgICAgICAgaW5kZXggOiAxNyxcbiAgICAgICAgaCA6IDAuNzUsXG4gICAgICAgIHkgOiAtMTE5LFxuICAgICAgICBkZXN0IDogMlxuICAgICAgfV0sXG4gICAgICAnZG93bicgOiBbe1xuICAgICAgICBpbmRleCA6IDE5LFxuICAgICAgICB5IDogLSAxMTksXG4gICAgICAgIGggOiAwLjc1LFxuICAgICAgICBkZXN0IDogMlxuICAgICAgfV0sXG4gICAgICAndXBwZXJFeHRlcm5hbFJpZ2h0JyA6IFt7XG4gICAgICAgIGluZGV4IDogMjIsXG4gICAgICAgIHkgOiAzMCxcbiAgICAgICAgaCA6IDIsXG4gICAgICAgIHcgOiAwLjQsXG4gICAgICAgIHggOiAtNzJcbiAgICAgIH1dLFxuICAgICAgJ3VwcGVyRXh0ZXJuYWxMZWZ0JyA6IFt7XG4gICAgICAgIGluZGV4IDogMjEsXG4gICAgICAgIHkgOiAzMCxcbiAgICAgICAgaCA6IDIsXG4gICAgICAgIHcgOiAwLjRcbiAgICAgIH1dLFxuICAgICAgJ2RvdWJsZVNpZGVzJyA6IFt7XG4gICAgICAgIGluZGV4IDogMjMsXG4gICAgICB9XSxcbiAgICAgICdkb3duRXh0ZXJuYWxMZWZ0JyA6IFt7XG4gICAgICAgIGluZGV4IDogMjYsXG4gICAgICAgIHkgOiAtIDE1LFxuICAgICAgICBoIDogMS42LFxuICAgICAgICBkZXN0IDogMlxuICAgICAgfV0sXG4gICAgICAnZG93bkV4dGVybmFsUmlnaHQnIDogW3tcbiAgICAgICAgaW5kZXggOiAyNCxcbiAgICAgICAgeSA6IC0gMTUsXG4gICAgICAgIGggOiAxLjYsXG4gICAgICAgIGRlc3QgOiAyXG4gICAgICB9XSxcbiAgICB9XG4gIH0sXG4gIHJlc29sdXRpb24gOiAxMjAsXG4gIGN1cnJlbnRCdW5kbGUgOiAnc3RvbmUnXG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciByb2d1ZW1hcCwgVGVtcGxhdGUsIGNvbmZpZywgTWFwO1xuXG5UZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUnKTtcbk1hcCA9IHJlcXVpcmUoJy4vbWFwJyk7XG5jb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xuXG5yb2d1ZW1hcCA9IG51Y2xlYXIubW9kdWxlKCdyb2d1ZW1hcCcsIFtdKTtcblxucm9ndWVtYXAuY29tcG9uZW50KCdtYXAnLCBmdW5jdGlvbihlbnRpdHksIGNvbmZpZyl7XG4gIHJldHVybiBuZXcgTWFwKGNvbmZpZyk7XG59KTtcblxucm9ndWVtYXAuY29tcG9uZW50KCdyb29tc19tYW5hZ2VyJywgZnVuY3Rpb24oZW50aXR5LCBkYXRhKXtcbiAgcmV0dXJuIGRhdGE7XG59KTsgXG5cbnJvZ3VlbWFwLmNvbXBvbmVudCgncm9vbScsIGZ1bmN0aW9uKGVudGl0eSwgZGF0YSl7XG4gIHZhciByb29tID0ge307XG5cbiAgcm9vbS5wb3NpdGlvbiA9IHtcbiAgICB4IDogZGF0YS5feDEsXG4gICAgeSA6IGRhdGEuX3kxXG4gIH07XG5cbiAgcm9vbS53aWR0aCA9IGRhdGEuX3gyLWRhdGEuX3gxO1xuICByb29tLmhlaWdodCA9IGRhdGEuX3kyLWRhdGEuX3kxO1xuICByb29tLnNpemUgPSByb29tLndpZHRoKnJvb20uaGVpZ2h0O1xuXG4gIHJldHVybiByb29tO1xufSk7XG5cbnJvZ3VlbWFwLmNvbXBvbmVudCgndGVtcGxhdGUnLCBmdW5jdGlvbihlbnRpdHksIGRhdGEpe1xuICB2YXIgdGVtcGxhdGUgPSBuZXcgVGVtcGxhdGUoZW50aXR5LCBkYXRhLnBvc2l0aW9uLCBkYXRhLndpZHRoLCBkYXRhLmhlaWdodCwgZGF0YS5jb25maWcpO1xuXG4gIHJldHVybiB0ZW1wbGF0ZTtcbn0pO1xuXG5yb2d1ZW1hcC5lbnRpdHkoJ3Jvb20nLCBmdW5jdGlvbihlbnRpdHksIGRhdGEpe1xuICB2YXIgcm9vbSAgID0gbnVjbGVhci5jb21wb25lbnQoJ3Jvb20nKS5hZGQoZW50aXR5LCBkYXRhKSxcbiAgICAgIHJhbmdlcyA9IHJvZ3VlbWFwLmNvbmZpZygncmFuZ2VzJyksXG4gICAgICB0ZW1wbGF0ZXMgPSByb2d1ZW1hcC5jb25maWcoJ3RlbXBsYXRlcycpLFxuICAgICAgcmFuZ2UsIHZhbGlkLCB1LCB0ZW1wbGF0ZTtcbiAgZm9yKHZhciB4IGluIHJhbmdlcyl7XG4gICAgcmFuZ2UgPSByYW5nZXNbeF07XG4gICAgdmFsaWQgPSBmYWxzZTtcbiAgICBmb3IodSA9IHJhbmdlWzBdOyB1IDwgcmFuZ2VbMV07IHUrKyl7XG4gICAgICBpZihyb29tLnNpemUgPT09IHUpe1xuICAgICAgICB2YWxpZCA9IHRydWU7XG4gICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGVzW3hdO1xuICAgICAgICBudWNsZWFyLmNvbXBvbmVudCgndGVtcGxhdGUnKS5hZGQoZW50aXR5LCB7XG4gICAgICAgICAgY29uZmlnIDogdGVtcGxhdGUsXG4gICAgICAgICAgd2lkdGggOiByb29tLndpZHRoLFxuICAgICAgICAgIGhlaWdodCA6IHJvb20uaGVpZ2h0LFxuICAgICAgICAgIHBvc2l0aW9uIDogcm9vbS5wb3NpdGlvblxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYodmFsaWQpe1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG59KTtcblxucm9ndWVtYXAuZW50aXR5KCdtYXAnLCBmdW5jdGlvbihlbnRpdHksIGRhdGEpe1xuICB2YXIgZGlnZ2VyID0gbnVjbGVhci5jb21wb25lbnQoJ21hcCBmcm9tIHJvZ3VlbWFwJykuYWRkKGVudGl0eSwgZGF0YS5tYXBEYXRhKS5tYXA7XG4gIGNvbnNvbGUubG9nKGRpZ2dlcik7XG4gIHZhciByb29tcyA9IFtdO1xuICBmb3IodmFyIGkgPSAwOyBpIDwgZGlnZ2VyLl9yb29tcy5sZW5ndGg7IGkrKyl7XG4gICAgdmFyIHJvb20gPSBkaWdnZXIuX3Jvb21zW2ldO1xuICAgIHJvb21zLnB1c2gocm9ndWVtYXAuZW50aXR5KCdyb29tJykuY3JlYXRlKHJvb20pKTtcbiAgfVxuXG4gIG51Y2xlYXIuY29tcG9uZW50KCdyb29tc19tYW5hZ2VyIGZyb20gcm9ndWVtYXAnKS5hZGQoZW50aXR5LCByb29tcyk7XG59KTtcblxucm9ndWVtYXAuZW50aXR5KCd0aWxlJywgZnVuY3Rpb24oZW50aXR5LCBkYXRhKXtcbiAgdmFyIHJlc29sdXRpb24gPSByb2d1ZW1hcC5jb25maWcoJ3Jlc29sdXRpb24nKSxcbiAgICAgIGJ1bmRsZXMgPSByb2d1ZW1hcC5jb25maWcoJ2J1bmRsZXMnKSxcbiAgICAgIGJ1bmRsZU5hbWUgPSByb2d1ZW1hcC5jb25maWcoJ2N1cnJlbnRCdW5kbGUnKSxcbiAgICAgIGN1cnJlbnRCdW5kbGUgPSBidW5kbGVzW2J1bmRsZU5hbWVdO1xuXG4gIGlmKGN1cnJlbnRCdW5kbGUgJiYgY3VycmVudEJ1bmRsZVtkYXRhLnR5cGVdKXtcbiAgICB2YXIgdywgaCwgeCwgeSwgc3ByaXRlO1xuXG4gICAgdmFyIGZyYW1lID0gY3VycmVudEJ1bmRsZVtkYXRhLnR5cGVdW01hdGgucm91bmQoTWF0aC5yYW5kb20oKSooY3VycmVudEJ1bmRsZVtkYXRhLnR5cGVdLmxlbmd0aC0xKSldO1xuICAgIHZhciBpbmRleCA9IGZyYW1lLmluZGV4O1xuICAgIHcgPSBmcmFtZS53IHx8IDE7XG4gICAgaCA9IGZyYW1lLmggfHwgMTtcbiAgICB4ID0gZnJhbWUueCB8fCAwO1xuICAgIHkgPSBmcmFtZS55IHx8IDA7XG5cbiAgICBudWNsZWFyLmNvbXBvbmVudCgncG9zaXRpb24gZnJvbSBnYW1lLnRyYW5zZm9ybScpLmFkZChlbnRpdHksIGRhdGEueCpyZXNvbHV0aW9uK3gsIGRhdGEueSpyZXNvbHV0aW9uK3kpO1xuICAgIHNwcml0ZSA9IG51Y2xlYXIuY29tcG9uZW50KCdzcHJpdGUgZnJvbSBnYW1lLnJlbmRlcmluZycpLmFkZChlbnRpdHksIHJlc29sdXRpb24qdywgcmVzb2x1dGlvbipoLCBmYWxzZSwgZnJhbWUuZGVzdCk7XG4gICAgc3ByaXRlLmZyb21BdGxhcyhidW5kbGVOYW1lLCBpbmRleCwgcmVzb2x1dGlvbip3LCByZXNvbHV0aW9uKmgpO1xuICAgIG51Y2xlYXIuc3lzdGVtKCdyZW5kZXJlciBmcm9tIGdhbWUucmVuZGVyaW5nJykub25jZShlbnRpdHkpO1xuICAgIG51Y2xlYXIuY29tcG9uZW50KCdzcHJpdGUnKS5yZW1vdmUoZW50aXR5KTtcbiAgfVxufSk7XG5cbnJvZ3VlbWFwLmNvbXBvbmVudCgnc2xvdCcsIGZ1bmN0aW9uKGVudGl0eSwgZGF0YSl7XG4gIHZhciBpLCBjb21wb25lbnQsIGNvbmZpZ3M7XG4gIGZvcihpID0gMDsgaSA8IGRhdGEuY29tcG9uZW50cy5sZW5ndGg7IGkrKyl7XG4gICAgY29tcG9uZW50ID0gZGF0YS5jb21wb25lbnRzW2ldO1xuICAgIGNvbmZpZ3MgPSBkYXRhLmRhdGFbY29tcG9uZW50XTtcblxuICAgIGNvbXBvbmVudCA9IG51Y2xlYXIuY29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgY29uZmlnc1swXSA9IGVudGl0eTtcbiAgICBjb21wb25lbnQuYWRkLmFwcGx5KGNvbXBvbmVudCwgY29uZmlncyk7XG4gIH1cbiAgcmV0dXJuIGRhdGE7XG59KTtcblxucm9ndWVtYXAuZW50aXR5KCdzbG90JywgZnVuY3Rpb24oZW50aXR5LCBkYXRhKXtcbiAgdmFyIHNsb3RzID0gcm9ndWVtYXAuY29uZmlnKCdzbG90cycpLFxuICAgICAgc2xvdCAgPSBzbG90c1tkYXRhLnR5cGVdLFxuICAgICAgcmVzb2x1dGlvbiA9IHJvZ3VlbWFwLmNvbmZpZygncmVzb2x1dGlvbicpO1xuXG4gIHNsb3QgPSB7XG4gICAgY29tcG9uZW50cyA6IHNsb3QuY29tcG9uZW50cyxcbiAgICBkYXRhIDogc2xvdC5kYXRhLFxuICAgIHBvc2l0aW9uIDogZGF0YS5wb3NpdGlvbixcbiAgICBidW5kbGUgOiBkYXRhLmJ1bmRsZSxcbiAgICB0ZW1wbGF0ZSA6IGRhdGEudGVtcGxhdGVcbiAgfTtcblxuICBudWNsZWFyLmNvbXBvbmVudCgnc2xvdCcpLmFkZChlbnRpdHksIHNsb3QpO1xuICBudWNsZWFyLmNvbXBvbmVudCgncG9zaXRpb24nKS5hZGQoZW50aXR5LCBkYXRhLnBvc2l0aW9uLngqcmVzb2x1dGlvbiwgZGF0YS5wb3NpdGlvbi55KnJlc29sdXRpb24pO1xufSk7XG5cbnJvZ3VlbWFwLmNvbmZpZyhjb25maWcgfHwge1xuICB0ZW1wbGF0ZXMgOiB7fSxcbiAgcmFuZ2VzIDoge30sXG4gIHNsb3RzIDoge30sXG4gIHJlc29sdXRpb24gOiAyMCxcbiAgYnVuZGxlcyA6IHt9LFxuICBjdXJyZW50QnVuZGxlIDogJ3N0b25lJ1xufSk7XG5cbm51Y2xlYXIuaW1wb3J0KFtyb2d1ZW1hcF0pO1xubW9kdWxlLmV4cG9ydHMgPSByb2d1ZW1hcDtcbiIsIi8qXG5cdFRoaXMgaXMgcm90LmpzLCB0aGUgUk9ndWVsaWtlIFRvb2xraXQgaW4gSmF2YVNjcmlwdC5cblx0VmVyc2lvbiAwLjV+ZGV2LCBnZW5lcmF0ZWQgb24gTW9uIE1hciAzMSAxNToxMDo0MSBDRVNUIDIwMTQuXG4qL1xuLyoqXG4gKiBAbmFtZXNwYWNlIFRvcC1sZXZlbCBST1QgbmFtZXNwYWNlXG4gKi9cbndpbmRvdy5ST1QgPSB7XG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7Ym9vbH0gSXMgcm90LmpzIHN1cHBvcnRlZCBieSB0aGlzIGJyb3dzZXI/XG5cdCAqL1xuXHRpc1N1cHBvcnRlZDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuICEhKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIikuZ2V0Q29udGV4dCAmJiBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCk7XG5cdH0sXG5cblx0LyoqIERlZmF1bHQgd2l0aCBmb3IgZGlzcGxheSBhbmQgbWFwIGdlbmVyYXRvcnMgKi9cblx0REVGQVVMVF9XSURUSDogODAsXG5cdC8qKiBEZWZhdWx0IGhlaWdodCBmb3IgZGlzcGxheSBhbmQgbWFwIGdlbmVyYXRvcnMgKi9cblx0REVGQVVMVF9IRUlHSFQ6IDI1LFxuXG5cdC8qKiBEaXJlY3Rpb25hbCBjb25zdGFudHMuIE9yZGVyaW5nIGlzIGltcG9ydGFudCEgKi9cblx0RElSUzoge1xuXHRcdFwiNFwiOiBbXG5cdFx0XHRbIDAsIC0xXSxcblx0XHRcdFsgMSwgIDBdLFxuXHRcdFx0WyAwLCAgMV0sXG5cdFx0XHRbLTEsICAwXVxuXHRcdF0sXG5cdFx0XCI4XCI6IFtcblx0XHRcdFsgMCwgLTFdLFxuXHRcdFx0WyAxLCAtMV0sXG5cdFx0XHRbIDEsICAwXSxcblx0XHRcdFsgMSwgIDFdLFxuXHRcdFx0WyAwLCAgMV0sXG5cdFx0XHRbLTEsICAxXSxcblx0XHRcdFstMSwgIDBdLFxuXHRcdFx0Wy0xLCAtMV1cblx0XHRdLFxuXHRcdFwiNlwiOiBbXG5cdFx0XHRbLTEsIC0xXSxcblx0XHRcdFsgMSwgLTFdLFxuXHRcdFx0WyAyLCAgMF0sXG5cdFx0XHRbIDEsICAxXSxcblx0XHRcdFstMSwgIDFdLFxuXHRcdFx0Wy0yLCAgMF1cblx0XHRdXG5cdH0sXG5cblx0LyoqIENhbmNlbCBrZXkuICovXG5cdFZLX0NBTkNFTDogMywgXG5cdC8qKiBIZWxwIGtleS4gKi9cblx0VktfSEVMUDogNiwgXG5cdC8qKiBCYWNrc3BhY2Uga2V5LiAqL1xuXHRWS19CQUNLX1NQQUNFOiA4LCBcblx0LyoqIFRhYiBrZXkuICovXG5cdFZLX1RBQjogOSwgXG5cdC8qKiA1IGtleSBvbiBOdW1wYWQgd2hlbiBOdW1Mb2NrIGlzIHVubG9ja2VkLiBPciBvbiBNYWMsIGNsZWFyIGtleSB3aGljaCBpcyBwb3NpdGlvbmVkIGF0IE51bUxvY2sga2V5LiAqL1xuXHRWS19DTEVBUjogMTIsIFxuXHQvKiogUmV0dXJuL2VudGVyIGtleSBvbiB0aGUgbWFpbiBrZXlib2FyZC4gKi9cblx0VktfUkVUVVJOOiAxMywgXG5cdC8qKiBSZXNlcnZlZCwgYnV0IG5vdCB1c2VkLiAqL1xuXHRWS19FTlRFUjogMTQsIFxuXHQvKiogU2hpZnQga2V5LiAqL1xuXHRWS19TSElGVDogMTYsIFxuXHQvKiogQ29udHJvbCBrZXkuICovXG5cdFZLX0NPTlRST0w6IDE3LCBcblx0LyoqIEFsdCAoT3B0aW9uIG9uIE1hYykga2V5LiAqL1xuXHRWS19BTFQ6IDE4LCBcblx0LyoqIFBhdXNlIGtleS4gKi9cblx0VktfUEFVU0U6IDE5LCBcblx0LyoqIENhcHMgbG9jay4gKi9cblx0VktfQ0FQU19MT0NLOiAyMCwgXG5cdC8qKiBFc2NhcGUga2V5LiAqL1xuXHRWS19FU0NBUEU6IDI3LCBcblx0LyoqIFNwYWNlIGJhci4gKi9cblx0VktfU1BBQ0U6IDMyLCBcblx0LyoqIFBhZ2UgVXAga2V5LiAqL1xuXHRWS19QQUdFX1VQOiAzMywgXG5cdC8qKiBQYWdlIERvd24ga2V5LiAqL1xuXHRWS19QQUdFX0RPV046IDM0LCBcblx0LyoqIEVuZCBrZXkuICovXG5cdFZLX0VORDogMzUsIFxuXHQvKiogSG9tZSBrZXkuICovXG5cdFZLX0hPTUU6IDM2LCBcblx0LyoqIExlZnQgYXJyb3cuICovXG5cdFZLX0xFRlQ6IDM3LCBcblx0LyoqIFVwIGFycm93LiAqL1xuXHRWS19VUDogMzgsIFxuXHQvKiogUmlnaHQgYXJyb3cuICovXG5cdFZLX1JJR0hUOiAzOSwgXG5cdC8qKiBEb3duIGFycm93LiAqL1xuXHRWS19ET1dOOiA0MCwgXG5cdC8qKiBQcmludCBTY3JlZW4ga2V5LiAqL1xuXHRWS19QUklOVFNDUkVFTjogNDQsIFxuXHQvKiogSW5zKGVydCkga2V5LiAqL1xuXHRWS19JTlNFUlQ6IDQ1LCBcblx0LyoqIERlbChldGUpIGtleS4gKi9cblx0VktfREVMRVRFOiA0NiwgXG5cdC8qKiovXG5cdFZLXzA6IDQ4LFxuXHQvKioqL1xuXHRWS18xOiA0OSxcblx0LyoqKi9cblx0VktfMjogNTAsXG5cdC8qKiovXG5cdFZLXzM6IDUxLFxuXHQvKioqL1xuXHRWS180OiA1Mixcblx0LyoqKi9cblx0VktfNTogNTMsXG5cdC8qKiovXG5cdFZLXzY6IDU0LFxuXHQvKioqL1xuXHRWS183OiA1NSxcblx0LyoqKi9cblx0VktfODogNTYsXG5cdC8qKiovXG5cdFZLXzk6IDU3LFxuXHQvKiogQ29sb24gKDopIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19DT0xPTjogNTgsIFxuXHQvKiogU2VtaWNvbG9uICg7KSBrZXkuICovXG5cdFZLX1NFTUlDT0xPTjogNTksIFxuXHQvKiogTGVzcy10aGFuICg8KSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfTEVTU19USEFOOiA2MCwgXG5cdC8qKiBFcXVhbHMgKD0pIGtleS4gKi9cblx0VktfRVFVQUxTOiA2MSwgXG5cdC8qKiBHcmVhdGVyLXRoYW4gKD4pIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19HUkVBVEVSX1RIQU46IDYyLCBcblx0LyoqIFF1ZXN0aW9uIG1hcmsgKD8pIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19RVUVTVElPTl9NQVJLOiA2MywgXG5cdC8qKiBBdG1hcmsgKEApIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19BVDogNjQsIFxuXHQvKioqL1xuXHRWS19BOiA2NSxcblx0LyoqKi9cblx0VktfQjogNjYsXG5cdC8qKiovXG5cdFZLX0M6IDY3LFxuXHQvKioqL1xuXHRWS19EOiA2OCxcblx0LyoqKi9cblx0VktfRTogNjksXG5cdC8qKiovXG5cdFZLX0Y6IDcwLFxuXHQvKioqL1xuXHRWS19HOiA3MSxcblx0LyoqKi9cblx0VktfSDogNzIsXG5cdC8qKiovXG5cdFZLX0k6IDczLFxuXHQvKioqL1xuXHRWS19KOiA3NCxcblx0LyoqKi9cblx0VktfSzogNzUsXG5cdC8qKiovXG5cdFZLX0w6IDc2LFxuXHQvKioqL1xuXHRWS19NOiA3Nyxcblx0LyoqKi9cblx0VktfTjogNzgsXG5cdC8qKiovXG5cdFZLX086IDc5LFxuXHQvKioqL1xuXHRWS19QOiA4MCxcblx0LyoqKi9cblx0VktfUTogODEsXG5cdC8qKiovXG5cdFZLX1I6IDgyLFxuXHQvKioqL1xuXHRWS19TOiA4Myxcblx0LyoqKi9cblx0VktfVDogODQsXG5cdC8qKiovXG5cdFZLX1U6IDg1LFxuXHQvKioqL1xuXHRWS19WOiA4Nixcblx0LyoqKi9cblx0VktfVzogODcsXG5cdC8qKiovXG5cdFZLX1g6IDg4LFxuXHQvKioqL1xuXHRWS19ZOiA4OSxcblx0LyoqKi9cblx0VktfWjogOTAsXG5cdC8qKiovXG5cdFZLX0NPTlRFWFRfTUVOVTogOTMsXG5cdC8qKiAwIG9uIHRoZSBudW1lcmljIGtleXBhZC4gKi9cblx0VktfTlVNUEFEMDogOTYsIFxuXHQvKiogMSBvbiB0aGUgbnVtZXJpYyBrZXlwYWQuICovXG5cdFZLX05VTVBBRDE6IDk3LCBcblx0LyoqIDIgb24gdGhlIG51bWVyaWMga2V5cGFkLiAqL1xuXHRWS19OVU1QQUQyOiA5OCwgXG5cdC8qKiAzIG9uIHRoZSBudW1lcmljIGtleXBhZC4gKi9cblx0VktfTlVNUEFEMzogOTksIFxuXHQvKiogNCBvbiB0aGUgbnVtZXJpYyBrZXlwYWQuICovXG5cdFZLX05VTVBBRDQ6IDEwMCwgXG5cdC8qKiA1IG9uIHRoZSBudW1lcmljIGtleXBhZC4gKi9cblx0VktfTlVNUEFENTogMTAxLCBcblx0LyoqIDYgb24gdGhlIG51bWVyaWMga2V5cGFkLiAqL1xuXHRWS19OVU1QQUQ2OiAxMDIsIFxuXHQvKiogNyBvbiB0aGUgbnVtZXJpYyBrZXlwYWQuICovXG5cdFZLX05VTVBBRDc6IDEwMywgXG5cdC8qKiA4IG9uIHRoZSBudW1lcmljIGtleXBhZC4gKi9cblx0VktfTlVNUEFEODogMTA0LCBcblx0LyoqIDkgb24gdGhlIG51bWVyaWMga2V5cGFkLiAqL1xuXHRWS19OVU1QQUQ5OiAxMDUsIFxuXHQvKiogKiBvbiB0aGUgbnVtZXJpYyBrZXlwYWQuICovXG5cdFZLX01VTFRJUExZOiAxMDYsXG5cdC8qKiArIG9uIHRoZSBudW1lcmljIGtleXBhZC4gKi9cblx0VktfQUREOiAxMDcsIFxuXHQvKioqL1xuXHRWS19TRVBBUkFUT1I6IDEwOCxcblx0LyoqIC0gb24gdGhlIG51bWVyaWMga2V5cGFkLiAqL1xuXHRWS19TVUJUUkFDVDogMTA5LCBcblx0LyoqIERlY2ltYWwgcG9pbnQgb24gdGhlIG51bWVyaWMga2V5cGFkLiAqL1xuXHRWS19ERUNJTUFMOiAxMTAsIFxuXHQvKiogLyBvbiB0aGUgbnVtZXJpYyBrZXlwYWQuICovXG5cdFZLX0RJVklERTogMTExLCBcblx0LyoqIEYxIGtleS4gKi9cblx0VktfRjE6IDExMiwgXG5cdC8qKiBGMiBrZXkuICovXG5cdFZLX0YyOiAxMTMsIFxuXHQvKiogRjMga2V5LiAqL1xuXHRWS19GMzogMTE0LCBcblx0LyoqIEY0IGtleS4gKi9cblx0VktfRjQ6IDExNSwgXG5cdC8qKiBGNSBrZXkuICovXG5cdFZLX0Y1OiAxMTYsIFxuXHQvKiogRjYga2V5LiAqL1xuXHRWS19GNjogMTE3LCBcblx0LyoqIEY3IGtleS4gKi9cblx0VktfRjc6IDExOCwgXG5cdC8qKiBGOCBrZXkuICovXG5cdFZLX0Y4OiAxMTksIFxuXHQvKiogRjkga2V5LiAqL1xuXHRWS19GOTogMTIwLCBcblx0LyoqIEYxMCBrZXkuICovXG5cdFZLX0YxMDogMTIxLCBcblx0LyoqIEYxMSBrZXkuICovXG5cdFZLX0YxMTogMTIyLCBcblx0LyoqIEYxMiBrZXkuICovXG5cdFZLX0YxMjogMTIzLCBcblx0LyoqIEYxMyBrZXkuICovXG5cdFZLX0YxMzogMTI0LCBcblx0LyoqIEYxNCBrZXkuICovXG5cdFZLX0YxNDogMTI1LCBcblx0LyoqIEYxNSBrZXkuICovXG5cdFZLX0YxNTogMTI2LCBcblx0LyoqIEYxNiBrZXkuICovXG5cdFZLX0YxNjogMTI3LCBcblx0LyoqIEYxNyBrZXkuICovXG5cdFZLX0YxNzogMTI4LCBcblx0LyoqIEYxOCBrZXkuICovXG5cdFZLX0YxODogMTI5LCBcblx0LyoqIEYxOSBrZXkuICovXG5cdFZLX0YxOTogMTMwLCBcblx0LyoqIEYyMCBrZXkuICovXG5cdFZLX0YyMDogMTMxLCBcblx0LyoqIEYyMSBrZXkuICovXG5cdFZLX0YyMTogMTMyLCBcblx0LyoqIEYyMiBrZXkuICovXG5cdFZLX0YyMjogMTMzLCBcblx0LyoqIEYyMyBrZXkuICovXG5cdFZLX0YyMzogMTM0LCBcblx0LyoqIEYyNCBrZXkuICovXG5cdFZLX0YyNDogMTM1LCBcblx0LyoqIE51bSBMb2NrIGtleS4gKi9cblx0VktfTlVNX0xPQ0s6IDE0NCwgXG5cdC8qKiBTY3JvbGwgTG9jayBrZXkuICovXG5cdFZLX1NDUk9MTF9MT0NLOiAxNDUsIFxuXHQvKiogQ2lyY3VtZmxleCAoXikga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX0NJUkNVTUZMRVg6IDE2MCwgXG5cdC8qKiBFeGNsYW1hdGlvbiAoISkga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX0VYQ0xBTUFUSU9OOiAxNjEsIFxuXHQvKiogRG91YmxlIHF1b3RlICgpIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19ET1VCTEVfUVVPVEU6IDE2MiwgXG5cdC8qKiBIYXNoICgjKSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfSEFTSDogMTYzLCBcblx0LyoqIERvbGxhciBzaWduICgkKSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfRE9MTEFSOiAxNjQsIFxuXHQvKiogUGVyY2VudCAoJSkga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX1BFUkNFTlQ6IDE2NSwgXG5cdC8qKiBBbXBlcnNhbmQgKCYpIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19BTVBFUlNBTkQ6IDE2NiwgXG5cdC8qKiBVbmRlcnNjb3JlIChfKSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfVU5ERVJTQ09SRTogMTY3LCBcblx0LyoqIE9wZW4gcGFyZW50aGVzaXMgKCgpIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19PUEVOX1BBUkVOOiAxNjgsIFxuXHQvKiogQ2xvc2UgcGFyZW50aGVzaXMgKCkpIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19DTE9TRV9QQVJFTjogMTY5LCBcblx0LyogQXN0ZXJpc2sgKCopIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19BU1RFUklTSzogMTcwLFxuXHQvKiogUGx1cyAoKykga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX1BMVVM6IDE3MSwgXG5cdC8qKiBQaXBlICh8KSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfUElQRTogMTcyLCBcblx0LyoqIEh5cGhlbi1VUy9kb2NzL01pbnVzICgtKSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfSFlQSEVOX01JTlVTOiAxNzMsIFxuXHQvKiogT3BlbiBjdXJseSBicmFja2V0ICh7KSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfT1BFTl9DVVJMWV9CUkFDS0VUOiAxNzQsIFxuXHQvKiogQ2xvc2UgY3VybHkgYnJhY2tldCAofSkga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX0NMT1NFX0NVUkxZX0JSQUNLRVQ6IDE3NSwgXG5cdC8qKiBUaWxkZSAofikga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX1RJTERFOiAxNzYsIFxuXHQvKiogQ29tbWEgKCwpIGtleS4gKi9cblx0VktfQ09NTUE6IDE4OCwgXG5cdC8qKiBQZXJpb2QgKC4pIGtleS4gKi9cblx0VktfUEVSSU9EOiAxOTAsIFxuXHQvKiogU2xhc2ggKC8pIGtleS4gKi9cblx0VktfU0xBU0g6IDE5MSwgXG5cdC8qKiBCYWNrIHRpY2sgKGApIGtleS4gKi9cblx0VktfQkFDS19RVU9URTogMTkyLCBcblx0LyoqIE9wZW4gc3F1YXJlIGJyYWNrZXQgKFspIGtleS4gKi9cblx0VktfT1BFTl9CUkFDS0VUOiAyMTksIFxuXHQvKiogQmFjayBzbGFzaCAoXFwpIGtleS4gKi9cblx0VktfQkFDS19TTEFTSDogMjIwLCBcblx0LyoqIENsb3NlIHNxdWFyZSBicmFja2V0IChdKSBrZXkuICovXG5cdFZLX0NMT1NFX0JSQUNLRVQ6IDIyMSwgXG5cdC8qKiBRdW90ZSAoJycnKSBrZXkuICovXG5cdFZLX1FVT1RFOiAyMjIsIFxuXHQvKiogTWV0YSBrZXkgb24gTGludXgsIENvbW1hbmQga2V5IG9uIE1hYy4gKi9cblx0VktfTUVUQTogMjI0LCBcblx0LyoqIEFsdEdyIGtleSBvbiBMaW51eC4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19BTFRHUjogMjI1LCBcblx0LyoqIFdpbmRvd3MgbG9nbyBrZXkgb24gV2luZG93cy4gT3IgU3VwZXIgb3IgSHlwZXIga2V5IG9uIExpbnV4LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX1dJTjogOTEsIFxuXHQvKiogTGludXggc3VwcG9ydCBmb3IgdGhpcyBrZXljb2RlIHdhcyBhZGRlZCBpbiBHZWNrbyA0LjAuICovXG5cdFZLX0tBTkE6IDIxLCBcblx0LyoqIExpbnV4IHN1cHBvcnQgZm9yIHRoaXMga2V5Y29kZSB3YXMgYWRkZWQgaW4gR2Vja28gNC4wLiAqL1xuXHRWS19IQU5HVUw6IDIxLCBcblx0LyoqIOiLseaVsCBrZXkgb24gSmFwYW5lc2UgTWFjIGtleWJvYXJkLiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX0VJU1U6IDIyLCBcblx0LyoqIExpbnV4IHN1cHBvcnQgZm9yIHRoaXMga2V5Y29kZSB3YXMgYWRkZWQgaW4gR2Vja28gNC4wLiAqL1xuXHRWS19KVU5KQTogMjMsIFxuXHQvKiogTGludXggc3VwcG9ydCBmb3IgdGhpcyBrZXljb2RlIHdhcyBhZGRlZCBpbiBHZWNrbyA0LjAuICovXG5cdFZLX0ZJTkFMOiAyNCwgXG5cdC8qKiBMaW51eCBzdXBwb3J0IGZvciB0aGlzIGtleWNvZGUgd2FzIGFkZGVkIGluIEdlY2tvIDQuMC4gKi9cblx0VktfSEFOSkE6IDI1LCBcblx0LyoqIExpbnV4IHN1cHBvcnQgZm9yIHRoaXMga2V5Y29kZSB3YXMgYWRkZWQgaW4gR2Vja28gNC4wLiAqL1xuXHRWS19LQU5KSTogMjUsIFxuXHQvKiogTGludXggc3VwcG9ydCBmb3IgdGhpcyBrZXljb2RlIHdhcyBhZGRlZCBpbiBHZWNrbyA0LjAuICovXG5cdFZLX0NPTlZFUlQ6IDI4LCBcblx0LyoqIExpbnV4IHN1cHBvcnQgZm9yIHRoaXMga2V5Y29kZSB3YXMgYWRkZWQgaW4gR2Vja28gNC4wLiAqL1xuXHRWS19OT05DT05WRVJUOiAyOSwgXG5cdC8qKiBMaW51eCBzdXBwb3J0IGZvciB0aGlzIGtleWNvZGUgd2FzIGFkZGVkIGluIEdlY2tvIDQuMC4gKi9cblx0VktfQUNDRVBUOiAzMCwgXG5cdC8qKiBMaW51eCBzdXBwb3J0IGZvciB0aGlzIGtleWNvZGUgd2FzIGFkZGVkIGluIEdlY2tvIDQuMC4gKi9cblx0VktfTU9ERUNIQU5HRTogMzEsIFxuXHQvKiogTGludXggc3VwcG9ydCBmb3IgdGhpcyBrZXljb2RlIHdhcyBhZGRlZCBpbiBHZWNrbyA0LjAuICovXG5cdFZLX1NFTEVDVDogNDEsIFxuXHQvKiogTGludXggc3VwcG9ydCBmb3IgdGhpcyBrZXljb2RlIHdhcyBhZGRlZCBpbiBHZWNrbyA0LjAuICovXG5cdFZLX1BSSU5UOiA0MiwgXG5cdC8qKiBMaW51eCBzdXBwb3J0IGZvciB0aGlzIGtleWNvZGUgd2FzIGFkZGVkIGluIEdlY2tvIDQuMC4gKi9cblx0VktfRVhFQ1VURTogNDMsIFxuXHQvKiogTGludXggc3VwcG9ydCBmb3IgdGhpcyBrZXljb2RlIHdhcyBhZGRlZCBpbiBHZWNrbyA0LjAuXHQgKi9cblx0VktfU0xFRVA6IDk1IFxufTtcbi8qKlxuICogQG5hbWVzcGFjZVxuICogQ29udGFpbnMgdGV4dCB0b2tlbml6YXRpb24gYW5kIGJyZWFraW5nIHJvdXRpbmVzXG4gKi9cblJPVC5UZXh0ID0ge1xuXHRSRV9DT0xPUlM6IC8lKFtiY10peyhbXn1dKil9L2csXG5cblx0LyogdG9rZW4gdHlwZXMgKi9cblx0VFlQRV9URVhUOlx0XHQwLFxuXHRUWVBFX05FV0xJTkU6XHQxLFxuXHRUWVBFX0ZHOlx0XHQyLFxuXHRUWVBFX0JHOlx0XHQzLFxuXG5cdC8qKlxuXHQgKiBNZWFzdXJlIHNpemUgb2YgYSByZXN1bHRpbmcgdGV4dCBibG9ja1xuXHQgKi9cblx0bWVhc3VyZTogZnVuY3Rpb24oc3RyLCBtYXhXaWR0aCkge1xuXHRcdHZhciByZXN1bHQgPSB7d2lkdGg6MCwgaGVpZ2h0OjF9O1xuXHRcdHZhciB0b2tlbnMgPSB0aGlzLnRva2VuaXplKHN0ciwgbWF4V2lkdGgpO1xuXHRcdHZhciBsaW5lV2lkdGggPSAwO1xuXG5cdFx0Zm9yICh2YXIgaT0wO2k8dG9rZW5zLmxlbmd0aDtpKyspIHtcblx0XHRcdHZhciB0b2tlbiA9IHRva2Vuc1tpXTtcblx0XHRcdHN3aXRjaCAodG9rZW4udHlwZSkge1xuXHRcdFx0XHRjYXNlIHRoaXMuVFlQRV9URVhUOlxuXHRcdFx0XHRcdGxpbmVXaWR0aCArPSB0b2tlbi52YWx1ZS5sZW5ndGg7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgdGhpcy5UWVBFX05FV0xJTkU6XG5cdFx0XHRcdFx0cmVzdWx0LmhlaWdodCsrO1xuXHRcdFx0XHRcdHJlc3VsdC53aWR0aCA9IE1hdGgubWF4KHJlc3VsdC53aWR0aCwgbGluZVdpZHRoKTtcblx0XHRcdFx0XHRsaW5lV2lkdGggPSAwO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdFx0cmVzdWx0LndpZHRoID0gTWF0aC5tYXgocmVzdWx0LndpZHRoLCBsaW5lV2lkdGgpO1xuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblxuXHQvKipcblx0ICogQ29udmVydCBzdHJpbmcgdG8gYSBzZXJpZXMgb2YgYSBmb3JtYXR0aW5nIGNvbW1hbmRzXG5cdCAqL1xuXHR0b2tlbml6ZTogZnVuY3Rpb24oc3RyLCBtYXhXaWR0aCkge1xuXHRcdHZhciByZXN1bHQgPSBbXTtcblxuXHRcdC8qIGZpcnN0IHRva2VuaXphdGlvbiBwYXNzIC0gc3BsaXQgdGV4dHMgYW5kIGNvbG9yIGZvcm1hdHRpbmcgY29tbWFuZHMgKi9cblx0XHR2YXIgb2Zmc2V0ID0gMDtcblx0XHRzdHIucmVwbGFjZSh0aGlzLlJFX0NPTE9SUywgZnVuY3Rpb24obWF0Y2gsIHR5cGUsIG5hbWUsIGluZGV4KSB7XG5cdFx0XHQvKiBzdHJpbmcgYmVmb3JlICovXG5cdFx0XHR2YXIgcGFydCA9IHN0ci5zdWJzdHJpbmcob2Zmc2V0LCBpbmRleCk7XG5cdFx0XHRpZiAocGFydC5sZW5ndGgpIHtcblx0XHRcdFx0cmVzdWx0LnB1c2goe1xuXHRcdFx0XHRcdHR5cGU6IFJPVC5UZXh0LlRZUEVfVEVYVCxcblx0XHRcdFx0XHR2YWx1ZTogcGFydFxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0LyogY29sb3IgY29tbWFuZCAqL1xuXHRcdFx0cmVzdWx0LnB1c2goe1xuXHRcdFx0XHR0eXBlOiAodHlwZSA9PSBcImNcIiA/IFJPVC5UZXh0LlRZUEVfRkcgOiBST1QuVGV4dC5UWVBFX0JHKSxcblx0XHRcdFx0dmFsdWU6IG5hbWUudHJpbSgpXG5cdFx0XHR9KTtcblxuXHRcdFx0b2Zmc2V0ID0gaW5kZXggKyBtYXRjaC5sZW5ndGg7XG5cdFx0XHRyZXR1cm4gXCJcIjtcblx0XHR9KTtcblxuXHRcdC8qIGxhc3QgcmVtYWluaW5nIHBhcnQgKi9cblx0XHR2YXIgcGFydCA9IHN0ci5zdWJzdHJpbmcob2Zmc2V0KTtcblx0XHRpZiAocGFydC5sZW5ndGgpIHtcblx0XHRcdHJlc3VsdC5wdXNoKHtcblx0XHRcdFx0dHlwZTogUk9ULlRleHQuVFlQRV9URVhULFxuXHRcdFx0XHR2YWx1ZTogcGFydFxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX2JyZWFrTGluZXMocmVzdWx0LCBtYXhXaWR0aCk7XG5cdH0sXG5cblx0LyogaW5zZXJ0IGxpbmUgYnJlYWtzIGludG8gZmlyc3QtcGFzcyB0b2tlbml6ZWQgZGF0YSAqL1xuXHRfYnJlYWtMaW5lczogZnVuY3Rpb24odG9rZW5zLCBtYXhXaWR0aCkge1xuXHRcdGlmICghbWF4V2lkdGgpIHsgbWF4V2lkdGggPSBJbmZpbml0eTsgfTtcblxuXHRcdHZhciBpID0gMDtcblx0XHR2YXIgbGluZUxlbmd0aCA9IDA7XG5cdFx0dmFyIGxhc3RUb2tlbldpdGhTcGFjZSA9IC0xO1xuXG5cdFx0d2hpbGUgKGkgPCB0b2tlbnMubGVuZ3RoKSB7IC8qIHRha2UgYWxsIHRleHQgdG9rZW5zLCByZW1vdmUgc3BhY2UsIGFwcGx5IGxpbmVicmVha3MgKi9cblx0XHRcdHZhciB0b2tlbiA9IHRva2Vuc1tpXTtcblx0XHRcdGlmICh0b2tlbi50eXBlID09IFJPVC5UZXh0LlRZUEVfTkVXTElORSkgeyAvKiByZXNldCAqL1xuXHRcdFx0XHRsaW5lTGVuZ3RoID0gMDsgXG5cdFx0XHRcdGxhc3RUb2tlbldpdGhTcGFjZSA9IC0xO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRva2VuLnR5cGUgIT0gUk9ULlRleHQuVFlQRV9URVhUKSB7IC8qIHNraXAgbm9uLXRleHQgdG9rZW5zICovXG5cdFx0XHRcdGkrKztcblx0XHRcdFx0Y29udGludWU7IFxuXHRcdFx0fVxuXG5cdFx0XHQvKiByZW1vdmUgc3BhY2VzIGF0IHRoZSBiZWdpbm5pbmcgb2YgbGluZSAqL1xuXHRcdFx0d2hpbGUgKGxpbmVMZW5ndGggPT0gMCAmJiB0b2tlbi52YWx1ZS5jaGFyQXQoMCkgPT0gXCIgXCIpIHsgdG9rZW4udmFsdWUgPSB0b2tlbi52YWx1ZS5zdWJzdHJpbmcoMSk7IH1cblxuXHRcdFx0LyogZm9yY2VkIG5ld2xpbmU/IGluc2VydCB0d28gbmV3IHRva2VucyBhZnRlciB0aGlzIG9uZSAqL1xuXHRcdFx0dmFyIGluZGV4ID0gdG9rZW4udmFsdWUuaW5kZXhPZihcIlxcblwiKTtcblx0XHRcdGlmIChpbmRleCAhPSAtMSkgeyBcblx0XHRcdFx0dG9rZW4udmFsdWUgPSB0aGlzLl9icmVha0luc2lkZVRva2VuKHRva2VucywgaSwgaW5kZXgsIHRydWUpOyBcblxuXHRcdFx0XHQvKiBpZiB0aGVyZSBhcmUgc3BhY2VzIGF0IHRoZSBlbmQsIHdlIG11c3QgcmVtb3ZlIHRoZW0gKHdlIGRvIG5vdCB3YW50IHRoZSBsaW5lIHRvbyBsb25nKSAqL1xuXHRcdFx0XHR2YXIgYXJyID0gdG9rZW4udmFsdWUuc3BsaXQoXCJcIik7XG5cdFx0XHRcdHdoaWxlIChhcnJbYXJyLmxlbmd0aC0xXSA9PSBcIiBcIikgeyBhcnIucG9wKCk7IH1cblx0XHRcdFx0dG9rZW4udmFsdWUgPSBhcnIuam9pbihcIlwiKTtcblx0XHRcdH1cblxuXHRcdFx0LyogdG9rZW4gZGVnZW5lcmF0ZWQ/ICovXG5cdFx0XHRpZiAoIXRva2VuLnZhbHVlLmxlbmd0aCkge1xuXHRcdFx0XHR0b2tlbnMuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGxpbmVMZW5ndGggKyB0b2tlbi52YWx1ZS5sZW5ndGggPiBtYXhXaWR0aCkgeyAvKiBsaW5lIHRvbyBsb25nLCBmaW5kIGEgc3VpdGFibGUgYnJlYWtpbmcgc3BvdCAqL1xuXG5cdFx0XHRcdC8qIGlzIGl0IHBvc3NpYmxlIHRvIGJyZWFrIHdpdGhpbiB0aGlzIHRva2VuPyAqL1xuXHRcdFx0XHR2YXIgaW5kZXggPSAtMTtcblx0XHRcdFx0d2hpbGUgKDEpIHtcblx0XHRcdFx0XHR2YXIgbmV4dEluZGV4ID0gdG9rZW4udmFsdWUuaW5kZXhPZihcIiBcIiwgaW5kZXgrMSk7XG5cdFx0XHRcdFx0aWYgKG5leHRJbmRleCA9PSAtMSkgeyBicmVhazsgfVxuXHRcdFx0XHRcdGlmIChsaW5lTGVuZ3RoICsgbmV4dEluZGV4ID4gbWF4V2lkdGgpIHsgYnJlYWs7IH1cblx0XHRcdFx0XHRpbmRleCA9IG5leHRJbmRleDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChpbmRleCAhPSAtMSkgeyAvKiBicmVhayBhdCBzcGFjZSB3aXRoaW4gdGhpcyBvbmUgKi9cblx0XHRcdFx0XHR0b2tlbi52YWx1ZSA9IHRoaXMuX2JyZWFrSW5zaWRlVG9rZW4odG9rZW5zLCBpLCBpbmRleCwgdHJ1ZSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAobGFzdFRva2VuV2l0aFNwYWNlICE9IC0xKSB7IC8qIGlzIHRoZXJlIGEgcHJldmlvdXMgdG9rZW4gd2hlcmUgYSBicmVhayBjYW4gb2NjdXI/ICovXG5cdFx0XHRcdFx0dmFyIHRva2VuID0gdG9rZW5zW2xhc3RUb2tlbldpdGhTcGFjZV07XG5cdFx0XHRcdFx0dmFyIGJyZWFrSW5kZXggPSB0b2tlbi52YWx1ZS5sYXN0SW5kZXhPZihcIiBcIik7XG5cdFx0XHRcdFx0dG9rZW4udmFsdWUgPSB0aGlzLl9icmVha0luc2lkZVRva2VuKHRva2VucywgbGFzdFRva2VuV2l0aFNwYWNlLCBicmVha0luZGV4LCB0cnVlKTtcblx0XHRcdFx0XHRpID0gbGFzdFRva2VuV2l0aFNwYWNlO1xuXHRcdFx0XHR9IGVsc2UgeyAvKiBmb3JjZSBicmVhayBpbiB0aGlzIHRva2VuICovXG5cdFx0XHRcdFx0dG9rZW4udmFsdWUgPSB0aGlzLl9icmVha0luc2lkZVRva2VuKHRva2VucywgaSwgbWF4V2lkdGgtbGluZUxlbmd0aCwgZmFsc2UpO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSB7IC8qIGxpbmUgbm90IGxvbmcsIGNvbnRpbnVlICovXG5cdFx0XHRcdGxpbmVMZW5ndGggKz0gdG9rZW4udmFsdWUubGVuZ3RoO1xuXHRcdFx0XHRpZiAodG9rZW4udmFsdWUuaW5kZXhPZihcIiBcIikgIT0gLTEpIHsgbGFzdFRva2VuV2l0aFNwYWNlID0gaTsgfVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRpKys7IC8qIGFkdmFuY2UgdG8gbmV4dCB0b2tlbiAqL1xuXHRcdH1cblxuXG5cdFx0dG9rZW5zLnB1c2goe3R5cGU6IFJPVC5UZXh0LlRZUEVfTkVXTElORX0pOyAvKiBpbnNlcnQgZmFrZSBuZXdsaW5lIHRvIGZpeCB0aGUgbGFzdCB0ZXh0IGxpbmUgKi9cblxuXHRcdC8qIHJlbW92ZSB0cmFpbGluZyBzcGFjZSBmcm9tIHRleHQgdG9rZW5zIGJlZm9yZSBuZXdsaW5lcyAqL1xuXHRcdHZhciBsYXN0VGV4dFRva2VuID0gbnVsbDtcblx0XHRmb3IgKHZhciBpPTA7aTx0b2tlbnMubGVuZ3RoO2krKykge1xuXHRcdFx0dmFyIHRva2VuID0gdG9rZW5zW2ldO1xuXHRcdFx0c3dpdGNoICh0b2tlbi50eXBlKSB7XG5cdFx0XHRcdGNhc2UgUk9ULlRleHQuVFlQRV9URVhUOiBsYXN0VGV4dFRva2VuID0gdG9rZW47IGJyZWFrO1xuXHRcdFx0XHRjYXNlIFJPVC5UZXh0LlRZUEVfTkVXTElORTogXG5cdFx0XHRcdFx0aWYgKGxhc3RUZXh0VG9rZW4pIHsgLyogcmVtb3ZlIHRyYWlsaW5nIHNwYWNlICovXG5cdFx0XHRcdFx0XHR2YXIgYXJyID0gbGFzdFRleHRUb2tlbi52YWx1ZS5zcGxpdChcIlwiKTtcblx0XHRcdFx0XHRcdHdoaWxlIChhcnJbYXJyLmxlbmd0aC0xXSA9PSBcIiBcIikgeyBhcnIucG9wKCk7IH1cblx0XHRcdFx0XHRcdGxhc3RUZXh0VG9rZW4udmFsdWUgPSBhcnIuam9pbihcIlwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0bGFzdFRleHRUb2tlbiA9IG51bGw7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRva2Vucy5wb3AoKTsgLyogcmVtb3ZlIGZha2UgdG9rZW4gKi9cblxuXHRcdHJldHVybiB0b2tlbnM7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENyZWF0ZSBuZXcgdG9rZW5zIGFuZCBpbnNlcnQgdGhlbSBpbnRvIHRoZSBzdHJlYW1cblx0ICogQHBhcmFtIHtvYmplY3RbXX0gdG9rZW5zXG5cdCAqIEBwYXJhbSB7aW50fSB0b2tlbkluZGV4IFRva2VuIGJlaW5nIHByb2Nlc3NlZFxuXHQgKiBAcGFyYW0ge2ludH0gYnJlYWtJbmRleCBJbmRleCB3aXRoaW4gY3VycmVudCB0b2tlbidzIHZhbHVlXG5cdCAqIEBwYXJhbSB7Ym9vbH0gcmVtb3ZlQnJlYWtDaGFyIERvIHdlIHdhbnQgdG8gcmVtb3ZlIHRoZSBicmVha2luZyBjaGFyYWN0ZXI/XG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9IHJlbWFpbmluZyB1bmJyb2tlbiB0b2tlbiB2YWx1ZVxuXHQgKi9cblx0X2JyZWFrSW5zaWRlVG9rZW46IGZ1bmN0aW9uKHRva2VucywgdG9rZW5JbmRleCwgYnJlYWtJbmRleCwgcmVtb3ZlQnJlYWtDaGFyKSB7XG5cdFx0dmFyIG5ld0JyZWFrVG9rZW4gPSB7XG5cdFx0XHR0eXBlOiBST1QuVGV4dC5UWVBFX05FV0xJTkVcblx0XHR9XG5cdFx0dmFyIG5ld1RleHRUb2tlbiA9IHtcblx0XHRcdHR5cGU6IFJPVC5UZXh0LlRZUEVfVEVYVCxcblx0XHRcdHZhbHVlOiB0b2tlbnNbdG9rZW5JbmRleF0udmFsdWUuc3Vic3RyaW5nKGJyZWFrSW5kZXggKyAocmVtb3ZlQnJlYWtDaGFyID8gMSA6IDApKVxuXHRcdH1cblx0XHR0b2tlbnMuc3BsaWNlKHRva2VuSW5kZXgrMSwgMCwgbmV3QnJlYWtUb2tlbiwgbmV3VGV4dFRva2VuKTtcblx0XHRyZXR1cm4gdG9rZW5zW3Rva2VuSW5kZXhdLnZhbHVlLnN1YnN0cmluZygwLCBicmVha0luZGV4KTtcblx0fVxufVxuLyoqXG4gKiBAcmV0dXJucyB7YW55fSBSYW5kb21seSBwaWNrZWQgaXRlbSwgbnVsbCB3aGVuIGxlbmd0aD0wXG4gKi9cbkFycmF5LnByb3RvdHlwZS5yYW5kb20gPSBmdW5jdGlvbigpIHtcblx0aWYgKCF0aGlzLmxlbmd0aCkgeyByZXR1cm4gbnVsbDsgfVxuXHRyZXR1cm4gdGhpc1tNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpICogdGhpcy5sZW5ndGgpXTtcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB7YXJyYXl9IE5ldyBhcnJheSB3aXRoIHJhbmRvbWl6ZWQgaXRlbXNcbiAqIEZJWE1FIGRlc3Ryb3lzIHRoaXMhXG4gKi9cbkFycmF5LnByb3RvdHlwZS5yYW5kb21pemUgPSBmdW5jdGlvbigpIHtcblx0dmFyIHJlc3VsdCA9IFtdO1xuXHR3aGlsZSAodGhpcy5sZW5ndGgpIHtcblx0XHR2YXIgaW5kZXggPSB0aGlzLmluZGV4T2YodGhpcy5yYW5kb20oKSk7XG5cdFx0cmVzdWx0LnB1c2godGhpcy5zcGxpY2UoaW5kZXgsIDEpWzBdKTtcblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufVxuLyoqXG4gKiBBbHdheXMgcG9zaXRpdmUgbW9kdWx1c1xuICogQHBhcmFtIHtpbnR9IG4gTW9kdWx1c1xuICogQHJldHVybnMge2ludH0gdGhpcyBtb2R1bG8gblxuICovXG5OdW1iZXIucHJvdG90eXBlLm1vZCA9IGZ1bmN0aW9uKG4pIHtcblx0cmV0dXJuICgodGhpcyVuKStuKSVuO1xufVxuLyoqXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBGaXJzdCBsZXR0ZXIgY2FwaXRhbGl6ZWRcbiAqL1xuU3RyaW5nLnByb3RvdHlwZS5jYXBpdGFsaXplID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdGhpcy5zdWJzdHJpbmcoMSk7XG59XG5cbi8qKiBcbiAqIExlZnQgcGFkXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NoYXJhY3Rlcj1cIjBcIl1cbiAqIEBwYXJhbSB7aW50fSBbY291bnQ9Ml1cbiAqL1xuU3RyaW5nLnByb3RvdHlwZS5scGFkID0gZnVuY3Rpb24oY2hhcmFjdGVyLCBjb3VudCkge1xuXHR2YXIgY2ggPSBjaGFyYWN0ZXIgfHwgXCIwXCI7XG5cdHZhciBjbnQgPSBjb3VudCB8fCAyO1xuXG5cdHZhciBzID0gXCJcIjtcblx0d2hpbGUgKHMubGVuZ3RoIDwgKGNudCAtIHRoaXMubGVuZ3RoKSkgeyBzICs9IGNoOyB9XG5cdHMgPSBzLnN1YnN0cmluZygwLCBjbnQtdGhpcy5sZW5ndGgpO1xuXHRyZXR1cm4gcyt0aGlzO1xufVxuXG4vKiogXG4gKiBSaWdodCBwYWRcbiAqIEBwYXJhbSB7c3RyaW5nfSBbY2hhcmFjdGVyPVwiMFwiXVxuICogQHBhcmFtIHtpbnR9IFtjb3VudD0yXVxuICovXG5TdHJpbmcucHJvdG90eXBlLnJwYWQgPSBmdW5jdGlvbihjaGFyYWN0ZXIsIGNvdW50KSB7XG5cdHZhciBjaCA9IGNoYXJhY3RlciB8fCBcIjBcIjtcblx0dmFyIGNudCA9IGNvdW50IHx8IDI7XG5cblx0dmFyIHMgPSBcIlwiO1xuXHR3aGlsZSAocy5sZW5ndGggPCAoY250IC0gdGhpcy5sZW5ndGgpKSB7IHMgKz0gY2g7IH1cblx0cyA9IHMuc3Vic3RyaW5nKDAsIGNudC10aGlzLmxlbmd0aCk7XG5cdHJldHVybiB0aGlzK3M7XG59XG5cbi8qKlxuICogRm9ybWF0IGEgc3RyaW5nIGluIGEgZmxleGlibGUgd2F5LiBTY2FucyBmb3IgJXMgc3RyaW5ncyBhbmQgcmVwbGFjZXMgdGhlbSB3aXRoIGFyZ3VtZW50cy4gTGlzdCBvZiBwYXR0ZXJucyBpcyBtb2RpZmlhYmxlIHZpYSBTdHJpbmcuZm9ybWF0Lm1hcC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZW1wbGF0ZVxuICogQHBhcmFtIHthbnl9IFthcmd2XVxuICovXG5TdHJpbmcuZm9ybWF0ID0gZnVuY3Rpb24odGVtcGxhdGUpIHtcblx0dmFyIG1hcCA9IFN0cmluZy5mb3JtYXQubWFwO1xuXHR2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cblx0dmFyIHJlcGxhY2VyID0gZnVuY3Rpb24obWF0Y2gsIGdyb3VwMSwgZ3JvdXAyLCBpbmRleCkge1xuXHRcdGlmICh0ZW1wbGF0ZS5jaGFyQXQoaW5kZXgtMSkgPT0gXCIlXCIpIHsgcmV0dXJuIG1hdGNoLnN1YnN0cmluZygxKTsgfVxuXHRcdGlmICghYXJncy5sZW5ndGgpIHsgcmV0dXJuIG1hdGNoOyB9XG5cdFx0dmFyIG9iaiA9IGFyZ3NbMF07XG5cblx0XHR2YXIgZ3JvdXAgPSBncm91cDEgfHwgZ3JvdXAyO1xuXHRcdHZhciBwYXJ0cyA9IGdyb3VwLnNwbGl0KFwiLFwiKTtcblx0XHR2YXIgbmFtZSA9IHBhcnRzLnNoaWZ0KCk7XG5cdFx0dmFyIG1ldGhvZCA9IG1hcFtuYW1lLnRvTG93ZXJDYXNlKCldO1xuXHRcdGlmICghbWV0aG9kKSB7IHJldHVybiBtYXRjaDsgfVxuXG5cdFx0dmFyIG9iaiA9IGFyZ3Muc2hpZnQoKTtcblx0XHR2YXIgcmVwbGFjZWQgPSBvYmpbbWV0aG9kXS5hcHBseShvYmosIHBhcnRzKTtcblxuXHRcdHZhciBmaXJzdCA9IG5hbWUuY2hhckF0KDApO1xuXHRcdGlmIChmaXJzdCAhPSBmaXJzdC50b0xvd2VyQ2FzZSgpKSB7IHJlcGxhY2VkID0gcmVwbGFjZWQuY2FwaXRhbGl6ZSgpOyB9XG5cblx0XHRyZXR1cm4gcmVwbGFjZWQ7XG5cdH1cblx0cmV0dXJuIHRlbXBsYXRlLnJlcGxhY2UoLyUoPzooW2Etel0rKXwoPzp7KFtefV0rKX0pKS9naSwgcmVwbGFjZXIpO1xufVxuXG5TdHJpbmcuZm9ybWF0Lm1hcCA9IHtcblx0XCJzXCI6IFwidG9TdHJpbmdcIlxufVxuXG4vKipcbiAqIENvbnZlbmllbmNlIHNob3J0Y3V0IHRvIFN0cmluZy5mb3JtYXQodGhpcylcbiAqL1xuU3RyaW5nLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigpIHtcblx0dmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuXHRhcmdzLnVuc2hpZnQodGhpcyk7XG5cdHJldHVybiBTdHJpbmcuZm9ybWF0LmFwcGx5KFN0cmluZywgYXJncyk7XG59XG5cbmlmICghT2JqZWN0LmNyZWF0ZSkgeyAgXG5cdC8qKlxuXHQgKiBFUzUgT2JqZWN0LmNyZWF0ZVxuXHQgKi9cblx0T2JqZWN0LmNyZWF0ZSA9IGZ1bmN0aW9uKG8pIHsgIFxuXHRcdHZhciB0bXAgPSBmdW5jdGlvbigpIHt9O1xuXHRcdHRtcC5wcm90b3R5cGUgPSBvO1xuXHRcdHJldHVybiBuZXcgdG1wKCk7XG5cdH07ICBcbn0gIFxuLyoqXG4gKiBTZXRzIHByb3RvdHlwZSBvZiB0aGlzIGZ1bmN0aW9uIHRvIGFuIGluc3RhbmNlIG9mIHBhcmVudCBmdW5jdGlvblxuICogQHBhcmFtIHtmdW5jdGlvbn0gcGFyZW50XG4gKi9cbkZ1bmN0aW9uLnByb3RvdHlwZS5leHRlbmQgPSBmdW5jdGlvbihwYXJlbnQpIHtcblx0dGhpcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHBhcmVudC5wcm90b3R5cGUpO1xuXHR0aGlzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IHRoaXM7XG5cdHJldHVybiB0aGlzO1xufVxud2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9XG5cdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0fHwgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZVxuXHR8fCB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cdHx8IHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cdHx8IHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZVxuXHR8fCBmdW5jdGlvbihjYikgeyByZXR1cm4gc2V0VGltZW91dChjYiwgMTAwMC82MCk7IH07XG5cbndpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9XG5cdHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZVxuXHR8fCB3aW5kb3cubW96Q2FuY2VsQW5pbWF0aW9uRnJhbWVcblx0fHwgd2luZG93LndlYmtpdENhbmNlbEFuaW1hdGlvbkZyYW1lXG5cdHx8IHdpbmRvdy5vQ2FuY2VsQW5pbWF0aW9uRnJhbWVcblx0fHwgd2luZG93Lm1zQ2FuY2VsQW5pbWF0aW9uRnJhbWVcblx0fHwgZnVuY3Rpb24oaWQpIHsgcmV0dXJuIGNsZWFyVGltZW91dChpZCk7IH07XG4vKipcbiAqIEBjbGFzcyBWaXN1YWwgbWFwIGRpc3BsYXlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cbiAqIEBwYXJhbSB7aW50fSBbb3B0aW9ucy53aWR0aD1ST1QuREVGQVVMVF9XSURUSF1cbiAqIEBwYXJhbSB7aW50fSBbb3B0aW9ucy5oZWlnaHQ9Uk9ULkRFRkFVTFRfSEVJR0hUXVxuICogQHBhcmFtIHtpbnR9IFtvcHRpb25zLmZvbnRTaXplPTE1XVxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmZvbnRGYW1pbHk9XCJtb25vc3BhY2VcIl1cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5mb250U3R5bGU9XCJcIl0gYm9sZC9pdGFsaWMvbm9uZS9ib3RoXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZmc9XCIjY2NjXCJdXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuYmc9XCIjMDAwXCJdXG4gKiBAcGFyYW0ge2Zsb2F0fSBbb3B0aW9ucy5zcGFjaW5nPTFdXG4gKiBAcGFyYW0ge2Zsb2F0fSBbb3B0aW9ucy5ib3JkZXI9MF1cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5sYXlvdXQ9XCJyZWN0XCJdXG4gKiBAcGFyYW0ge2ludH0gW29wdGlvbnMudGlsZVdpZHRoPTMyXVxuICogQHBhcmFtIHtpbnR9IFtvcHRpb25zLnRpbGVIZWlnaHQ9MzJdXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMudGlsZU1hcD17fV1cbiAqIEBwYXJhbSB7aW1hZ2V9IFtvcHRpb25zLnRpbGVTZXQ9bnVsbF1cbiAqL1xuUk9ULkRpc3BsYXkgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHR0aGlzLl9jb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcblx0dGhpcy5fZGF0YSA9IHt9O1xuXHR0aGlzLl9kaXJ0eSA9IGZhbHNlOyAvKiBmYWxzZSA9IG5vdGhpbmcsIHRydWUgPSBhbGwsIG9iamVjdCA9IGRpcnR5IGNlbGxzICovXG5cdHRoaXMuX29wdGlvbnMgPSB7fTtcblx0dGhpcy5fYmFja2VuZCA9IG51bGw7XG5cdFxuXHR2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG5cdFx0d2lkdGg6IFJPVC5ERUZBVUxUX1dJRFRILFxuXHRcdGhlaWdodDogUk9ULkRFRkFVTFRfSEVJR0hULFxuXHRcdGxheW91dDogXCJyZWN0XCIsXG5cdFx0Zm9udFNpemU6IDE1LFxuXHRcdHNwYWNpbmc6IDEsXG5cdFx0Ym9yZGVyOiAwLFxuXHRcdGZvbnRGYW1pbHk6IFwibW9ub3NwYWNlXCIsXG5cdFx0Zm9udFN0eWxlOiBcIlwiLFxuXHRcdGZnOiBcIiNjY2NcIixcblx0XHRiZzogXCIjMDAwXCIsXG5cdFx0dGlsZVdpZHRoOiAzMixcblx0XHR0aWxlSGVpZ2h0OiAzMixcblx0XHR0aWxlTWFwOiB7fSxcblx0XHR0aWxlU2V0OiBudWxsXG5cdH07XG5cdGZvciAodmFyIHAgaW4gb3B0aW9ucykgeyBkZWZhdWx0T3B0aW9uc1twXSA9IG9wdGlvbnNbcF07IH1cblx0dGhpcy5zZXRPcHRpb25zKGRlZmF1bHRPcHRpb25zKTtcblx0dGhpcy5ERUJVRyA9IHRoaXMuREVCVUcuYmluZCh0aGlzKTtcblxuXHR0aGlzLl90aWNrID0gdGhpcy5fdGljay5iaW5kKHRoaXMpO1xuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fdGljayk7XG59XG5cbi8qKlxuICogRGVidWcgaGVscGVyLCBpZGVhbCBhcyBhIG1hcCBnZW5lcmF0b3IgY2FsbGJhY2suIEFsd2F5cyBib3VuZCB0byB0aGlzLlxuICogQHBhcmFtIHtpbnR9IHhcbiAqIEBwYXJhbSB7aW50fSB5XG4gKiBAcGFyYW0ge2ludH0gd2hhdFxuICovXG5ST1QuRGlzcGxheS5wcm90b3R5cGUuREVCVUcgPSBmdW5jdGlvbih4LCB5LCB3aGF0KSB7XG5cdHZhciBjb2xvcnMgPSBbdGhpcy5fb3B0aW9ucy5iZywgdGhpcy5fb3B0aW9ucy5mZ107XG5cdHRoaXMuZHJhdyh4LCB5LCBudWxsLCBudWxsLCBjb2xvcnNbd2hhdCAlIGNvbG9ycy5sZW5ndGhdKTtcbn1cblxuLyoqXG4gKiBDbGVhciB0aGUgd2hvbGUgZGlzcGxheSAoY292ZXIgaXQgd2l0aCBiYWNrZ3JvdW5kIGNvbG9yKVxuICovXG5ST1QuRGlzcGxheS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5fZGF0YSA9IHt9O1xuXHR0aGlzLl9kaXJ0eSA9IHRydWU7XG59XG5cbi8qKlxuICogQHNlZSBST1QuRGlzcGxheVxuICovXG5ST1QuRGlzcGxheS5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0Zm9yICh2YXIgcCBpbiBvcHRpb25zKSB7IHRoaXMuX29wdGlvbnNbcF0gPSBvcHRpb25zW3BdOyB9XG5cdGlmIChvcHRpb25zLndpZHRoIHx8IG9wdGlvbnMuaGVpZ2h0IHx8IG9wdGlvbnMuZm9udFNpemUgfHwgb3B0aW9ucy5mb250RmFtaWx5IHx8IG9wdGlvbnMuc3BhY2luZyB8fCBvcHRpb25zLmxheW91dCkge1xuXHRcdGlmIChvcHRpb25zLmxheW91dCkgeyBcblx0XHRcdHRoaXMuX2JhY2tlbmQgPSBuZXcgUk9ULkRpc3BsYXlbb3B0aW9ucy5sYXlvdXQuY2FwaXRhbGl6ZSgpXSh0aGlzLl9jb250ZXh0KTtcblx0XHR9XG5cblx0XHR2YXIgZm9udCA9ICh0aGlzLl9vcHRpb25zLmZvbnRTdHlsZSA/IHRoaXMuX29wdGlvbnMuZm9udFN0eWxlICsgXCIgXCIgOiBcIlwiKSArIHRoaXMuX29wdGlvbnMuZm9udFNpemUgKyBcInB4IFwiICsgdGhpcy5fb3B0aW9ucy5mb250RmFtaWx5O1xuXHRcdHRoaXMuX2NvbnRleHQuZm9udCA9IGZvbnQ7XG5cdFx0dGhpcy5fYmFja2VuZC5jb21wdXRlKHRoaXMuX29wdGlvbnMpO1xuXHRcdHRoaXMuX2NvbnRleHQuZm9udCA9IGZvbnQ7XG5cdFx0dGhpcy5fY29udGV4dC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xuXHRcdHRoaXMuX2NvbnRleHQudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcblx0XHR0aGlzLl9kaXJ0eSA9IHRydWU7XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogUmV0dXJucyBjdXJyZW50bHkgc2V0IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtvYmplY3R9IEN1cnJlbnQgb3B0aW9ucyBvYmplY3QgXG4gKi9cblJPVC5EaXNwbGF5LnByb3RvdHlwZS5nZXRPcHRpb25zID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLl9vcHRpb25zO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIERPTSBub2RlIG9mIHRoaXMgZGlzcGxheVxuICogQHJldHVybnMge25vZGV9IERPTSBub2RlXG4gKi9cblJPVC5EaXNwbGF5LnByb3RvdHlwZS5nZXRDb250YWluZXIgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuX2NvbnRleHQuY2FudmFzO1xufVxuXG4vKipcbiAqIENvbXB1dGUgdGhlIG1heGltdW0gd2lkdGgvaGVpZ2h0IHRvIGZpdCBpbnRvIGEgc2V0IG9mIGdpdmVuIGNvbnN0cmFpbnRzXG4gKiBAcGFyYW0ge2ludH0gYXZhaWxXaWR0aCBNYXhpbXVtIGFsbG93ZWQgcGl4ZWwgd2lkdGhcbiAqIEBwYXJhbSB7aW50fSBhdmFpbEhlaWdodCBNYXhpbXVtIGFsbG93ZWQgcGl4ZWwgaGVpZ2h0XG4gKiBAcmV0dXJucyB7aW50WzJdfSBjZWxsV2lkdGgsY2VsbEhlaWdodFxuICovXG5ST1QuRGlzcGxheS5wcm90b3R5cGUuY29tcHV0ZVNpemUgPSBmdW5jdGlvbihhdmFpbFdpZHRoLCBhdmFpbEhlaWdodCkge1xuXHRyZXR1cm4gdGhpcy5fYmFja2VuZC5jb21wdXRlU2l6ZShhdmFpbFdpZHRoLCBhdmFpbEhlaWdodCwgdGhpcy5fb3B0aW9ucyk7XG59XG5cbi8qKlxuICogQ29tcHV0ZSB0aGUgbWF4aW11bSBmb250IHNpemUgdG8gZml0IGludG8gYSBzZXQgb2YgZ2l2ZW4gY29uc3RyYWludHNcbiAqIEBwYXJhbSB7aW50fSBhdmFpbFdpZHRoIE1heGltdW0gYWxsb3dlZCBwaXhlbCB3aWR0aFxuICogQHBhcmFtIHtpbnR9IGF2YWlsSGVpZ2h0IE1heGltdW0gYWxsb3dlZCBwaXhlbCBoZWlnaHRcbiAqIEByZXR1cm5zIHtpbnR9IGZvbnRTaXplXG4gKi9cblJPVC5EaXNwbGF5LnByb3RvdHlwZS5jb21wdXRlRm9udFNpemUgPSBmdW5jdGlvbihhdmFpbFdpZHRoLCBhdmFpbEhlaWdodCkge1xuXHRyZXR1cm4gdGhpcy5fYmFja2VuZC5jb21wdXRlRm9udFNpemUoYXZhaWxXaWR0aCwgYXZhaWxIZWlnaHQsIHRoaXMuX29wdGlvbnMpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBET00gZXZlbnQgKG1vdXNlIG9yIHRvdWNoKSB0byBtYXAgY29vcmRpbmF0ZXMuIFVzZXMgZmlyc3QgdG91Y2ggZm9yIG11bHRpLXRvdWNoLlxuICogQHBhcmFtIHtFdmVudH0gZSBldmVudFxuICogQHJldHVybnMge2ludFsyXX0gLTEgZm9yIHZhbHVlcyBvdXRzaWRlIG9mIHRoZSBjYW52YXNcbiAqL1xuUk9ULkRpc3BsYXkucHJvdG90eXBlLmV2ZW50VG9Qb3NpdGlvbiA9IGZ1bmN0aW9uKGUpIHtcblx0aWYgKGUudG91Y2hlcykge1xuXHRcdHZhciB4ID0gZS50b3VjaGVzWzBdLmNsaWVudFg7XG5cdFx0dmFyIHkgPSBlLnRvdWNoZXNbMF0uY2xpZW50WTtcblx0fSBlbHNlIHtcblx0XHR2YXIgeCA9IGUuY2xpZW50WDtcblx0XHR2YXIgeSA9IGUuY2xpZW50WTtcblx0fVxuXG5cdHZhciByZWN0ID0gdGhpcy5fY29udGV4dC5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdHggLT0gcmVjdC5sZWZ0O1xuXHR5IC09IHJlY3QudG9wO1xuXHRcblx0aWYgKHggPCAwIHx8IHkgPCAwIHx8IHggPj0gdGhpcy5fY29udGV4dC5jYW52YXMud2lkdGggfHwgeSA+PSB0aGlzLl9jb250ZXh0LmNhbnZhcy5oZWlnaHQpIHsgcmV0dXJuIFstMSwgLTFdOyB9XG5cblx0cmV0dXJuIHRoaXMuX2JhY2tlbmQuZXZlbnRUb1Bvc2l0aW9uKHgsIHkpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7aW50fSB4XG4gKiBAcGFyYW0ge2ludH0geVxuICogQHBhcmFtIHtzdHJpbmcgfHwgc3RyaW5nW119IGNoIE9uZSBvciBtb3JlIGNoYXJzICh3aWxsIGJlIG92ZXJsYXBwaW5nIHRoZW1zZWx2ZXMpXG4gKiBAcGFyYW0ge3N0cmluZ30gW2ZnXSBmb3JlZ3JvdW5kIGNvbG9yXG4gKiBAcGFyYW0ge3N0cmluZ30gW2JnXSBiYWNrZ3JvdW5kIGNvbG9yXG4gKi9cblJPVC5EaXNwbGF5LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oeCwgeSwgY2gsIGZnLCBiZykge1xuXHRpZiAoIWZnKSB7IGZnID0gdGhpcy5fb3B0aW9ucy5mZzsgfVxuXHRpZiAoIWJnKSB7IGJnID0gdGhpcy5fb3B0aW9ucy5iZzsgfVxuXHR0aGlzLl9kYXRhW3grXCIsXCIreV0gPSBbeCwgeSwgY2gsIGZnLCBiZ107XG5cdFxuXHRpZiAodGhpcy5fZGlydHkgPT09IHRydWUpIHsgcmV0dXJuOyB9IC8qIHdpbGwgYWxyZWFkeSByZWRyYXcgZXZlcnl0aGluZyAqL1xuXHRpZiAoIXRoaXMuX2RpcnR5KSB7IHRoaXMuX2RpcnR5ID0ge307IH0gLyogZmlyc3QhICovXG5cdHRoaXMuX2RpcnR5W3grXCIsXCIreV0gPSB0cnVlO1xufVxuXG4vKipcbiAqIERyYXdzIGEgdGV4dCBhdCBnaXZlbiBwb3NpdGlvbi4gT3B0aW9uYWxseSB3cmFwcyBhdCBhIG1heGltdW0gbGVuZ3RoLiBDdXJyZW50bHkgZG9lcyBub3Qgd29yayB3aXRoIGhleCBsYXlvdXQuXG4gKiBAcGFyYW0ge2ludH0geFxuICogQHBhcmFtIHtpbnR9IHlcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IE1heSBjb250YWluIGNvbG9yL2JhY2tncm91bmQgZm9ybWF0IHNwZWNpZmllcnMsICVje25hbWV9LyVie25hbWV9LCBib3RoIG9wdGlvbmFsLiAlY3t9LyVie30gcmVzZXRzIHRvIGRlZmF1bHQuXG4gKiBAcGFyYW0ge2ludH0gW21heFdpZHRoXSB3cmFwIGF0IHdoYXQgd2lkdGg/XG4gKiBAcmV0dXJucyB7aW50fSBsaW5lcyBkcmF3blxuICovXG5ST1QuRGlzcGxheS5wcm90b3R5cGUuZHJhd1RleHQgPSBmdW5jdGlvbih4LCB5LCB0ZXh0LCBtYXhXaWR0aCkge1xuXHR2YXIgZmcgPSBudWxsO1xuXHR2YXIgYmcgPSBudWxsO1xuXHR2YXIgY3ggPSB4O1xuXHR2YXIgY3kgPSB5O1xuXHR2YXIgbGluZXMgPSAxO1xuXHRpZiAoIW1heFdpZHRoKSB7IG1heFdpZHRoID0gdGhpcy5fb3B0aW9ucy53aWR0aC14OyB9XG5cblx0dmFyIHRva2VucyA9IFJPVC5UZXh0LnRva2VuaXplKHRleHQsIG1heFdpZHRoKTtcblxuXHR3aGlsZSAodG9rZW5zLmxlbmd0aCkgeyAvKiBpbnRlcnByZXQgdG9rZW5pemVkIG9wY29kZSBzdHJlYW0gKi9cblx0XHR2YXIgdG9rZW4gPSB0b2tlbnMuc2hpZnQoKTtcblx0XHRzd2l0Y2ggKHRva2VuLnR5cGUpIHtcblx0XHRcdGNhc2UgUk9ULlRleHQuVFlQRV9URVhUOlxuXHRcdFx0XHRmb3IgKHZhciBpPTA7aTx0b2tlbi52YWx1ZS5sZW5ndGg7aSsrKSB7XG5cdFx0XHRcdFx0dGhpcy5kcmF3KGN4KyssIGN5LCB0b2tlbi52YWx1ZS5jaGFyQXQoaSksIGZnLCBiZyk7XG5cdFx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIFJPVC5UZXh0LlRZUEVfRkc6XG5cdFx0XHRcdGZnID0gdG9rZW4udmFsdWUgfHwgbnVsbDtcblx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIFJPVC5UZXh0LlRZUEVfQkc6XG5cdFx0XHRcdGJnID0gdG9rZW4udmFsdWUgfHwgbnVsbDtcblx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIFJPVC5UZXh0LlRZUEVfTkVXTElORTpcblx0XHRcdFx0Y3ggPSB4O1xuXHRcdFx0XHRjeSsrO1xuXHRcdFx0XHRsaW5lcysrXG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gbGluZXM7XG59XG5cbi8qKlxuICogVGltZXIgdGljazogdXBkYXRlIGRpcnR5IHBhcnRzXG4gKi9cblJPVC5EaXNwbGF5LnByb3RvdHlwZS5fdGljayA9IGZ1bmN0aW9uKCkge1xuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fdGljayk7XG5cblx0aWYgKCF0aGlzLl9kaXJ0eSkgeyByZXR1cm47IH1cblxuXHRpZiAodGhpcy5fZGlydHkgPT09IHRydWUpIHsgLyogZHJhdyBhbGwgKi9cblx0XHR0aGlzLl9jb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuX29wdGlvbnMuYmc7XG5cdFx0dGhpcy5fY29udGV4dC5maWxsUmVjdCgwLCAwLCB0aGlzLl9jb250ZXh0LmNhbnZhcy53aWR0aCwgdGhpcy5fY29udGV4dC5jYW52YXMuaGVpZ2h0KTtcblxuXHRcdGZvciAodmFyIGlkIGluIHRoaXMuX2RhdGEpIHsgLyogcmVkcmF3IGNhY2hlZCBkYXRhICovXG5cdFx0XHR0aGlzLl9kcmF3KGlkLCBmYWxzZSk7XG5cdFx0fVxuXG5cdH0gZWxzZSB7IC8qIGRyYXcgb25seSBkaXJ0eSAqL1xuXHRcdGZvciAodmFyIGtleSBpbiB0aGlzLl9kaXJ0eSkge1xuXHRcdFx0dGhpcy5fZHJhdyhrZXksIHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdHRoaXMuX2RpcnR5ID0gZmFsc2U7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBXaGF0IHRvIGRyYXdcbiAqIEBwYXJhbSB7Ym9vbH0gY2xlYXJCZWZvcmUgSXMgaXQgbmVjZXNzYXJ5IHRvIGNsZWFuIGJlZm9yZT9cbiAqL1xuUk9ULkRpc3BsYXkucHJvdG90eXBlLl9kcmF3ID0gZnVuY3Rpb24oa2V5LCBjbGVhckJlZm9yZSkge1xuXHR2YXIgZGF0YSA9IHRoaXMuX2RhdGFba2V5XTtcblx0aWYgKGRhdGFbNF0gIT0gdGhpcy5fb3B0aW9ucy5iZykgeyBjbGVhckJlZm9yZSA9IHRydWU7IH1cblxuXHR0aGlzLl9iYWNrZW5kLmRyYXcoZGF0YSwgY2xlYXJCZWZvcmUpO1xufVxuLyoqXG4gKiBAY2xhc3MgQWJzdHJhY3QgZGlzcGxheSBiYWNrZW5kIG1vZHVsZVxuICogQHByaXZhdGVcbiAqL1xuUk9ULkRpc3BsYXkuQmFja2VuZCA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcblx0dGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG59XG5cblJPVC5EaXNwbGF5LkJhY2tlbmQucHJvdG90eXBlLmNvbXB1dGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG59XG5cblJPVC5EaXNwbGF5LkJhY2tlbmQucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihkYXRhLCBjbGVhckJlZm9yZSkge1xufVxuXG5ST1QuRGlzcGxheS5CYWNrZW5kLnByb3RvdHlwZS5jb21wdXRlU2l6ZSA9IGZ1bmN0aW9uKGF2YWlsV2lkdGgsIGF2YWlsSGVpZ2h0KSB7XG59XG5cblJPVC5EaXNwbGF5LkJhY2tlbmQucHJvdG90eXBlLmNvbXB1dGVGb250U2l6ZSA9IGZ1bmN0aW9uKGF2YWlsV2lkdGgsIGF2YWlsSGVpZ2h0KSB7XG59XG5cblJPVC5EaXNwbGF5LkJhY2tlbmQucHJvdG90eXBlLmV2ZW50VG9Qb3NpdGlvbiA9IGZ1bmN0aW9uKHgsIHkpIHtcbn1cbi8qKlxuICogQGNsYXNzIFJlY3Rhbmd1bGFyIGJhY2tlbmRcbiAqIEBwcml2YXRlXG4gKi9cblJPVC5EaXNwbGF5LlJlY3QgPSBmdW5jdGlvbihjb250ZXh0KSB7XG5cdFJPVC5EaXNwbGF5LkJhY2tlbmQuY2FsbCh0aGlzLCBjb250ZXh0KTtcblx0XG5cdHRoaXMuX3NwYWNpbmdYID0gMDtcblx0dGhpcy5fc3BhY2luZ1kgPSAwO1xuXHR0aGlzLl9jYW52YXNDYWNoZSA9IHt9O1xuXHR0aGlzLl9vcHRpb25zID0ge307XG59XG5ST1QuRGlzcGxheS5SZWN0LmV4dGVuZChST1QuRGlzcGxheS5CYWNrZW5kKTtcblxuUk9ULkRpc3BsYXkuUmVjdC5jYWNoZSA9IGZhbHNlO1xuXG5ST1QuRGlzcGxheS5SZWN0LnByb3RvdHlwZS5jb21wdXRlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXHR0aGlzLl9jYW52YXNDYWNoZSA9IHt9O1xuXHR0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcblxuXHR2YXIgY2hhcldpZHRoID0gTWF0aC5jZWlsKHRoaXMuX2NvbnRleHQubWVhc3VyZVRleHQoXCJXXCIpLndpZHRoKTtcblx0dGhpcy5fc3BhY2luZ1ggPSBNYXRoLmNlaWwob3B0aW9ucy5zcGFjaW5nICogY2hhcldpZHRoKTtcblx0dGhpcy5fc3BhY2luZ1kgPSBNYXRoLmNlaWwob3B0aW9ucy5zcGFjaW5nICogb3B0aW9ucy5mb250U2l6ZSk7XG5cdHRoaXMuX2NvbnRleHQuY2FudmFzLndpZHRoID0gb3B0aW9ucy53aWR0aCAqIHRoaXMuX3NwYWNpbmdYO1xuXHR0aGlzLl9jb250ZXh0LmNhbnZhcy5oZWlnaHQgPSBvcHRpb25zLmhlaWdodCAqIHRoaXMuX3NwYWNpbmdZO1xufVxuXG5ST1QuRGlzcGxheS5SZWN0LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oZGF0YSwgY2xlYXJCZWZvcmUpIHtcblx0aWYgKHRoaXMuY29uc3RydWN0b3IuY2FjaGUpIHtcblx0XHR0aGlzLl9kcmF3V2l0aENhY2hlKGRhdGEsIGNsZWFyQmVmb3JlKTtcblx0fSBlbHNlIHtcblx0XHR0aGlzLl9kcmF3Tm9DYWNoZShkYXRhLCBjbGVhckJlZm9yZSk7XG5cdH1cbn1cblxuUk9ULkRpc3BsYXkuUmVjdC5wcm90b3R5cGUuX2RyYXdXaXRoQ2FjaGUgPSBmdW5jdGlvbihkYXRhLCBjbGVhckJlZm9yZSkge1xuXHR2YXIgeCA9IGRhdGFbMF07XG5cdHZhciB5ID0gZGF0YVsxXTtcblx0dmFyIGNoID0gZGF0YVsyXTtcblx0dmFyIGZnID0gZGF0YVszXTtcblx0dmFyIGJnID0gZGF0YVs0XTtcblxuXHR2YXIgaGFzaCA9IFwiXCIrY2grZmcrYmc7XG5cdGlmIChoYXNoIGluIHRoaXMuX2NhbnZhc0NhY2hlKSB7XG5cdFx0dmFyIGNhbnZhcyA9IHRoaXMuX2NhbnZhc0NhY2hlW2hhc2hdO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBiID0gdGhpcy5fb3B0aW9ucy5ib3JkZXI7XG5cdFx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG5cdFx0dmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5cdFx0Y2FudmFzLndpZHRoID0gdGhpcy5fc3BhY2luZ1g7XG5cdFx0Y2FudmFzLmhlaWdodCA9IHRoaXMuX3NwYWNpbmdZO1xuXHRcdGN0eC5maWxsU3R5bGUgPSBiZztcblx0XHRjdHguZmlsbFJlY3QoYiwgYiwgY2FudmFzLndpZHRoLWIsIGNhbnZhcy5oZWlnaHQtYik7XG5cdFx0XG5cdFx0aWYgKGNoKSB7XG5cdFx0XHRjdHguZmlsbFN0eWxlID0gZmc7XG5cdFx0XHRjdHguZm9udCA9IHRoaXMuX2NvbnRleHQuZm9udDtcblx0XHRcdGN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xuXHRcdFx0Y3R4LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XG5cblx0XHRcdHZhciBjaGFycyA9IFtdLmNvbmNhdChjaCk7XG5cdFx0XHRmb3IgKHZhciBpPTA7aTxjaGFycy5sZW5ndGg7aSsrKSB7XG5cdFx0XHRcdGN0eC5maWxsVGV4dChjaGFyc1tpXSwgdGhpcy5fc3BhY2luZ1gvMiwgdGhpcy5fc3BhY2luZ1kvMik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMuX2NhbnZhc0NhY2hlW2hhc2hdID0gY2FudmFzO1xuXHR9XG5cdFxuXHR0aGlzLl9jb250ZXh0LmRyYXdJbWFnZShjYW52YXMsIHgqdGhpcy5fc3BhY2luZ1gsIHkqdGhpcy5fc3BhY2luZ1kpO1xufVxuXG5ST1QuRGlzcGxheS5SZWN0LnByb3RvdHlwZS5fZHJhd05vQ2FjaGUgPSBmdW5jdGlvbihkYXRhLCBjbGVhckJlZm9yZSkge1xuXHR2YXIgeCA9IGRhdGFbMF07XG5cdHZhciB5ID0gZGF0YVsxXTtcblx0dmFyIGNoID0gZGF0YVsyXTtcblx0dmFyIGZnID0gZGF0YVszXTtcblx0dmFyIGJnID0gZGF0YVs0XTtcblxuXHRpZiAoY2xlYXJCZWZvcmUpIHsgXG5cdFx0dmFyIGIgPSB0aGlzLl9vcHRpb25zLmJvcmRlcjtcblx0XHR0aGlzLl9jb250ZXh0LmZpbGxTdHlsZSA9IGJnO1xuXHRcdHRoaXMuX2NvbnRleHQuZmlsbFJlY3QoeCp0aGlzLl9zcGFjaW5nWCArIGIsIHkqdGhpcy5fc3BhY2luZ1kgKyBiLCB0aGlzLl9zcGFjaW5nWCAtIGIsIHRoaXMuX3NwYWNpbmdZIC0gYik7XG5cdH1cblx0XG5cdGlmICghY2gpIHsgcmV0dXJuOyB9XG5cblx0dGhpcy5fY29udGV4dC5maWxsU3R5bGUgPSBmZztcblxuXHR2YXIgY2hhcnMgPSBbXS5jb25jYXQoY2gpO1xuXHRmb3IgKHZhciBpPTA7aTxjaGFycy5sZW5ndGg7aSsrKSB7XG5cdFx0dGhpcy5fY29udGV4dC5maWxsVGV4dChjaGFyc1tpXSwgKHgrMC41KSAqIHRoaXMuX3NwYWNpbmdYLCAoeSswLjUpICogdGhpcy5fc3BhY2luZ1kpO1xuXHR9XG59XG5cblJPVC5EaXNwbGF5LlJlY3QucHJvdG90eXBlLmNvbXB1dGVTaXplID0gZnVuY3Rpb24oYXZhaWxXaWR0aCwgYXZhaWxIZWlnaHQpIHtcblx0dmFyIHdpZHRoID0gTWF0aC5mbG9vcihhdmFpbFdpZHRoIC8gdGhpcy5fc3BhY2luZ1gpO1xuXHR2YXIgaGVpZ2h0ID0gTWF0aC5mbG9vcihhdmFpbEhlaWdodCAvIHRoaXMuX3NwYWNpbmdZKTtcblx0cmV0dXJuIFt3aWR0aCwgaGVpZ2h0XTtcbn1cblxuUk9ULkRpc3BsYXkuUmVjdC5wcm90b3R5cGUuY29tcHV0ZUZvbnRTaXplID0gZnVuY3Rpb24oYXZhaWxXaWR0aCwgYXZhaWxIZWlnaHQpIHtcblx0dmFyIGJveFdpZHRoID0gTWF0aC5mbG9vcihhdmFpbFdpZHRoIC8gdGhpcy5fb3B0aW9ucy53aWR0aCk7XG5cdHZhciBib3hIZWlnaHQgPSBNYXRoLmZsb29yKGF2YWlsSGVpZ2h0IC8gdGhpcy5fb3B0aW9ucy5oZWlnaHQpO1xuXG5cdC8qIGNvbXB1dGUgY2hhciByYXRpbyAqL1xuXHR2YXIgb2xkRm9udCA9IHRoaXMuX2NvbnRleHQuZm9udDtcblx0dGhpcy5fY29udGV4dC5mb250ID0gXCIxMDBweCBcIiArIHRoaXMuX29wdGlvbnMuZm9udEZhbWlseTtcblx0dmFyIHdpZHRoID0gTWF0aC5jZWlsKHRoaXMuX2NvbnRleHQubWVhc3VyZVRleHQoXCJXXCIpLndpZHRoKTtcblx0dGhpcy5fY29udGV4dC5mb250ID0gb2xkRm9udDtcblx0dmFyIHJhdGlvID0gd2lkdGggLyAxMDA7XG5cdFx0XG5cdHZhciB3aWR0aEZyYWN0aW9uID0gcmF0aW8gKiBib3hIZWlnaHQgLyBib3hXaWR0aDtcblx0aWYgKHdpZHRoRnJhY3Rpb24gPiAxKSB7IC8qIHRvbyB3aWRlIHdpdGggY3VycmVudCBhc3BlY3QgcmF0aW8gKi9cblx0XHRib3hIZWlnaHQgPSBNYXRoLmZsb29yKGJveEhlaWdodCAvIHdpZHRoRnJhY3Rpb24pO1xuXHR9XG5cdHJldHVybiBNYXRoLmZsb29yKGJveEhlaWdodCAvIHRoaXMuX29wdGlvbnMuc3BhY2luZyk7XG59XG5cblJPVC5EaXNwbGF5LlJlY3QucHJvdG90eXBlLmV2ZW50VG9Qb3NpdGlvbiA9IGZ1bmN0aW9uKHgsIHkpIHtcblx0cmV0dXJuIFtNYXRoLmZsb29yKHgvdGhpcy5fc3BhY2luZ1gpLCBNYXRoLmZsb29yKHkvdGhpcy5fc3BhY2luZ1kpXTtcbn1cbi8qKlxuICogQGNsYXNzIEhleGFnb25hbCBiYWNrZW5kXG4gKiBAcHJpdmF0ZVxuICovXG5ST1QuRGlzcGxheS5IZXggPSBmdW5jdGlvbihjb250ZXh0KSB7XG5cdFJPVC5EaXNwbGF5LkJhY2tlbmQuY2FsbCh0aGlzLCBjb250ZXh0KTtcblxuXHR0aGlzLl9zcGFjaW5nWCA9IDA7XG5cdHRoaXMuX3NwYWNpbmdZID0gMDtcblx0dGhpcy5faGV4U2l6ZSA9IDA7XG5cdHRoaXMuX29wdGlvbnMgPSB7fTtcbn1cblJPVC5EaXNwbGF5LkhleC5leHRlbmQoUk9ULkRpc3BsYXkuQmFja2VuZCk7XG5cblJPVC5EaXNwbGF5LkhleC5wcm90b3R5cGUuY29tcHV0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0dGhpcy5fb3B0aW9ucyA9IG9wdGlvbnM7XG5cblx0dmFyIGNoYXJXaWR0aCA9IE1hdGguY2VpbCh0aGlzLl9jb250ZXh0Lm1lYXN1cmVUZXh0KFwiV1wiKS53aWR0aCk7XG5cdHRoaXMuX2hleFNpemUgPSBNYXRoLmZsb29yKG9wdGlvbnMuc3BhY2luZyAqIChvcHRpb25zLmZvbnRTaXplICsgY2hhcldpZHRoL01hdGguc3FydCgzKSkgLyAyKTtcblx0dGhpcy5fc3BhY2luZ1ggPSB0aGlzLl9oZXhTaXplICogTWF0aC5zcXJ0KDMpIC8gMjtcblx0dGhpcy5fc3BhY2luZ1kgPSB0aGlzLl9oZXhTaXplICogMS41O1xuXHR0aGlzLl9jb250ZXh0LmNhbnZhcy53aWR0aCA9IE1hdGguY2VpbCggKG9wdGlvbnMud2lkdGggKyAxKSAqIHRoaXMuX3NwYWNpbmdYICk7XG5cdHRoaXMuX2NvbnRleHQuY2FudmFzLmhlaWdodCA9IE1hdGguY2VpbCggKG9wdGlvbnMuaGVpZ2h0IC0gMSkgKiB0aGlzLl9zcGFjaW5nWSArIDIqdGhpcy5faGV4U2l6ZSApO1xufVxuXG5ST1QuRGlzcGxheS5IZXgucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihkYXRhLCBjbGVhckJlZm9yZSkge1xuXHR2YXIgeCA9IGRhdGFbMF07XG5cdHZhciB5ID0gZGF0YVsxXTtcblx0dmFyIGNoID0gZGF0YVsyXTtcblx0dmFyIGZnID0gZGF0YVszXTtcblx0dmFyIGJnID0gZGF0YVs0XTtcblxuXHR2YXIgY3ggPSAoeCsxKSAqIHRoaXMuX3NwYWNpbmdYO1xuXHR2YXIgY3kgPSB5ICogdGhpcy5fc3BhY2luZ1kgKyB0aGlzLl9oZXhTaXplO1xuXG5cdGlmIChjbGVhckJlZm9yZSkgeyBcblx0XHR0aGlzLl9jb250ZXh0LmZpbGxTdHlsZSA9IGJnO1xuXHRcdHRoaXMuX2ZpbGwoY3gsIGN5KTtcblx0fVxuXHRcblx0aWYgKCFjaCkgeyByZXR1cm47IH1cblxuXHR0aGlzLl9jb250ZXh0LmZpbGxTdHlsZSA9IGZnO1xuXG5cdHZhciBjaGFycyA9IFtdLmNvbmNhdChjaCk7XG5cdGZvciAodmFyIGk9MDtpPGNoYXJzLmxlbmd0aDtpKyspIHtcblx0XHR0aGlzLl9jb250ZXh0LmZpbGxUZXh0KGNoYXJzW2ldLCBjeCwgY3kpO1xuXHR9XG59XG5cblxuUk9ULkRpc3BsYXkuSGV4LnByb3RvdHlwZS5jb21wdXRlU2l6ZSA9IGZ1bmN0aW9uKGF2YWlsV2lkdGgsIGF2YWlsSGVpZ2h0KSB7XG5cdHZhciB3aWR0aCA9IE1hdGguZmxvb3IoYXZhaWxXaWR0aCAvIHRoaXMuX3NwYWNpbmdYKSAtIDE7XG5cdHZhciBoZWlnaHQgPSBNYXRoLmZsb29yKChhdmFpbEhlaWdodCAtIDIqdGhpcy5faGV4U2l6ZSkgLyB0aGlzLl9zcGFjaW5nWSArIDEpO1xuXHRyZXR1cm4gW3dpZHRoLCBoZWlnaHRdO1xufVxuXG5ST1QuRGlzcGxheS5IZXgucHJvdG90eXBlLmNvbXB1dGVGb250U2l6ZSA9IGZ1bmN0aW9uKGF2YWlsV2lkdGgsIGF2YWlsSGVpZ2h0KSB7XG5cdHZhciBoZXhTaXplV2lkdGggPSAyKmF2YWlsV2lkdGggLyAoKHRoaXMuX29wdGlvbnMud2lkdGgrMSkgKiBNYXRoLnNxcnQoMykpIC0gMTtcblx0dmFyIGhleFNpemVIZWlnaHQgPSBhdmFpbEhlaWdodCAvICgyICsgMS41Kih0aGlzLl9vcHRpb25zLmhlaWdodC0xKSk7XG5cdHZhciBoZXhTaXplID0gTWF0aC5taW4oaGV4U2l6ZVdpZHRoLCBoZXhTaXplSGVpZ2h0KTtcblxuXHQvKiBjb21wdXRlIGNoYXIgcmF0aW8gKi9cblx0dmFyIG9sZEZvbnQgPSB0aGlzLl9jb250ZXh0LmZvbnQ7XG5cdHRoaXMuX2NvbnRleHQuZm9udCA9IFwiMTAwcHggXCIgKyB0aGlzLl9vcHRpb25zLmZvbnRGYW1pbHk7XG5cdHZhciB3aWR0aCA9IE1hdGguY2VpbCh0aGlzLl9jb250ZXh0Lm1lYXN1cmVUZXh0KFwiV1wiKS53aWR0aCk7XG5cdHRoaXMuX2NvbnRleHQuZm9udCA9IG9sZEZvbnQ7XG5cdHZhciByYXRpbyA9IHdpZHRoIC8gMTAwO1xuXG5cdGhleFNpemUgPSBNYXRoLmZsb29yKGhleFNpemUpKzE7IC8qIGNsb3Nlc3QgbGFyZ2VyIGhleFNpemUgKi9cblxuXHR2YXIgZm9udFNpemUgPSAyKmhleFNpemUgLyAodGhpcy5fb3B0aW9ucy5zcGFjaW5nICogKDEgKyByYXRpbyAvIE1hdGguc3FydCgzKSkpO1xuXG5cdC8qIGNsb3Nlc3Qgc21hbGxlciBmb250U2l6ZSAqL1xuXHRyZXR1cm4gTWF0aC5jZWlsKGZvbnRTaXplKS0xO1xufVxuXG5ST1QuRGlzcGxheS5IZXgucHJvdG90eXBlLmV2ZW50VG9Qb3NpdGlvbiA9IGZ1bmN0aW9uKHgsIHkpIHtcblx0dmFyIGhlaWdodCA9IHRoaXMuX2NvbnRleHQuY2FudmFzLmhlaWdodCAvIHRoaXMuX29wdGlvbnMuaGVpZ2h0O1xuXHR5ID0gTWF0aC5mbG9vcih5L2hlaWdodCk7XG5cdFxuXHRpZiAoeS5tb2QoMikpIHsgLyogb2RkIHJvdyAqL1xuXHRcdHggLT0gdGhpcy5fc3BhY2luZ1g7XG5cdFx0eCA9IDEgKyAyKk1hdGguZmxvb3IoeC8oMip0aGlzLl9zcGFjaW5nWCkpO1xuXHR9IGVsc2Uge1xuXHRcdHggPSAyKk1hdGguZmxvb3IoeC8oMip0aGlzLl9zcGFjaW5nWCkpO1xuXHR9XG5cdFxuXHRyZXR1cm4gW3gsIHldO1xufVxuXG5ST1QuRGlzcGxheS5IZXgucHJvdG90eXBlLl9maWxsID0gZnVuY3Rpb24oY3gsIGN5KSB7XG5cdHZhciBhID0gdGhpcy5faGV4U2l6ZTtcblx0dmFyIGIgPSB0aGlzLl9vcHRpb25zLmJvcmRlcjtcblx0XG5cdHRoaXMuX2NvbnRleHQuYmVnaW5QYXRoKCk7XG5cdHRoaXMuX2NvbnRleHQubW92ZVRvKGN4LCBjeS1hK2IpO1xuXHR0aGlzLl9jb250ZXh0LmxpbmVUbyhjeCArIHRoaXMuX3NwYWNpbmdYIC0gYiwgY3ktYS8yK2IpO1xuXHR0aGlzLl9jb250ZXh0LmxpbmVUbyhjeCArIHRoaXMuX3NwYWNpbmdYIC0gYiwgY3krYS8yLWIpO1xuXHR0aGlzLl9jb250ZXh0LmxpbmVUbyhjeCwgY3krYS1iKTtcblx0dGhpcy5fY29udGV4dC5saW5lVG8oY3ggLSB0aGlzLl9zcGFjaW5nWCArIGIsIGN5K2EvMi1iKTtcblx0dGhpcy5fY29udGV4dC5saW5lVG8oY3ggLSB0aGlzLl9zcGFjaW5nWCArIGIsIGN5LWEvMitiKTtcblx0dGhpcy5fY29udGV4dC5saW5lVG8oY3gsIGN5LWErYik7XG5cdHRoaXMuX2NvbnRleHQuZmlsbCgpO1xufVxuLyoqXG4gKiBAY2xhc3MgVGlsZSBiYWNrZW5kXG4gKiBAcHJpdmF0ZVxuICovXG5ST1QuRGlzcGxheS5UaWxlID0gZnVuY3Rpb24oY29udGV4dCkge1xuXHRST1QuRGlzcGxheS5SZWN0LmNhbGwodGhpcywgY29udGV4dCk7XG5cdFxuXHR0aGlzLl9vcHRpb25zID0ge307XG59XG5ST1QuRGlzcGxheS5UaWxlLmV4dGVuZChST1QuRGlzcGxheS5SZWN0KTtcblxuUk9ULkRpc3BsYXkuVGlsZS5wcm90b3R5cGUuY29tcHV0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0dGhpcy5fb3B0aW9ucyA9IG9wdGlvbnM7XG5cdHRoaXMuX2NvbnRleHQuY2FudmFzLndpZHRoID0gb3B0aW9ucy53aWR0aCAqIG9wdGlvbnMudGlsZVdpZHRoO1xuXHR0aGlzLl9jb250ZXh0LmNhbnZhcy5oZWlnaHQgPSBvcHRpb25zLmhlaWdodCAqIG9wdGlvbnMudGlsZUhlaWdodDtcbn1cblxuUk9ULkRpc3BsYXkuVGlsZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGRhdGEsIGNsZWFyQmVmb3JlKSB7XG5cdHZhciB4ID0gZGF0YVswXTtcblx0dmFyIHkgPSBkYXRhWzFdO1xuXHR2YXIgY2ggPSBkYXRhWzJdO1xuXHR2YXIgZmcgPSBkYXRhWzNdO1xuXHR2YXIgYmcgPSBkYXRhWzRdO1xuXG5cdHZhciB0aWxlV2lkdGggPSB0aGlzLl9vcHRpb25zLnRpbGVXaWR0aDtcblx0dmFyIHRpbGVIZWlnaHQgPSB0aGlzLl9vcHRpb25zLnRpbGVIZWlnaHQ7XG5cblx0aWYgKGNsZWFyQmVmb3JlKSB7XG5cdFx0dmFyIGIgPSB0aGlzLl9vcHRpb25zLmJvcmRlcjtcblx0XHR0aGlzLl9jb250ZXh0LmZpbGxTdHlsZSA9IGJnO1xuXHRcdHRoaXMuX2NvbnRleHQuZmlsbFJlY3QoeCp0aWxlV2lkdGgsIHkqdGlsZUhlaWdodCwgdGlsZVdpZHRoLCB0aWxlSGVpZ2h0KTtcblx0fVxuXG5cdGlmICghY2gpIHsgcmV0dXJuOyB9XG5cblx0dmFyIGNoYXJzID0gW10uY29uY2F0KGNoKTtcblx0Zm9yICh2YXIgaT0wO2k8Y2hhcnMubGVuZ3RoO2krKykge1xuXHRcdHZhciB0aWxlID0gdGhpcy5fb3B0aW9ucy50aWxlTWFwW2NoYXJzW2ldXTtcblx0XHRpZiAoIXRpbGUpIHsgdGhyb3cgbmV3IEVycm9yKFwiQ2hhciAnXCIgKyBjaGFyc1tpXSArIFwiJyBub3QgZm91bmQgaW4gdGlsZU1hcFwiKTsgfVxuXHRcdFxuXHRcdHRoaXMuX2NvbnRleHQuZHJhd0ltYWdlKFxuXHRcdFx0dGhpcy5fb3B0aW9ucy50aWxlU2V0LFxuXHRcdFx0dGlsZVswXSwgdGlsZVsxXSwgdGlsZVdpZHRoLCB0aWxlSGVpZ2h0LFxuXHRcdFx0eCp0aWxlV2lkdGgsIHkqdGlsZUhlaWdodCwgdGlsZVdpZHRoLCB0aWxlSGVpZ2h0XG5cdFx0KTtcblx0fVxufVxuXG5ST1QuRGlzcGxheS5UaWxlLnByb3RvdHlwZS5jb21wdXRlU2l6ZSA9IGZ1bmN0aW9uKGF2YWlsV2lkdGgsIGF2YWlsSGVpZ2h0KSB7XG5cdHZhciB3aWR0aCA9IE1hdGguZmxvb3IoYXZhaWxXaWR0aCAvIHRoaXMuX29wdGlvbnMudGlsZVdpZHRoKTtcblx0dmFyIGhlaWdodCA9IE1hdGguZmxvb3IoYXZhaWxIZWlnaHQgLyB0aGlzLl9vcHRpb25zLnRpbGVIZWlnaHQpO1xuXHRyZXR1cm4gW3dpZHRoLCBoZWlnaHRdO1xufVxuXG5ST1QuRGlzcGxheS5UaWxlLnByb3RvdHlwZS5jb21wdXRlRm9udFNpemUgPSBmdW5jdGlvbihhdmFpbFdpZHRoLCBhdmFpbEhlaWdodCkge1xuXHR2YXIgd2lkdGggPSBNYXRoLmZsb29yKGF2YWlsV2lkdGggLyB0aGlzLl9vcHRpb25zLndpZHRoKTtcblx0dmFyIGhlaWdodCA9IE1hdGguZmxvb3IoYXZhaWxIZWlnaHQgLyB0aGlzLl9vcHRpb25zLmhlaWdodCk7XG5cdHJldHVybiBbd2lkdGgsIGhlaWdodF07XG59XG4vKipcbiAqIEBuYW1lc3BhY2VcbiAqIFRoaXMgY29kZSBpcyBhbiBpbXBsZW1lbnRhdGlvbiBvZiBBbGVhIGFsZ29yaXRobTsgKEMpIDIwMTAgSm9oYW5uZXMgQmFhZ8O4ZS5cbiAqIEFsZWEgaXMgbGljZW5zZWQgYWNjb3JkaW5nIHRvIHRoZSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01JVF9MaWNlbnNlLlxuICovXG5ST1QuUk5HID0ge1xuXHQvKipcblx0ICogQHJldHVybnMge251bWJlcn0gXG5cdCAqL1xuXHRnZXRTZWVkOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5fc2VlZDtcblx0fSxcblxuXHQvKipcblx0ICogQHBhcmFtIHtudW1iZXJ9IHNlZWQgU2VlZCB0aGUgbnVtYmVyIGdlbmVyYXRvclxuXHQgKi9cblx0c2V0U2VlZDogZnVuY3Rpb24oc2VlZCkge1xuXHRcdHNlZWQgPSAoc2VlZCA8IDEgPyAxL3NlZWQgOiBzZWVkKTtcblxuXHRcdHRoaXMuX3NlZWQgPSBzZWVkO1xuXHRcdHRoaXMuX3MwID0gKHNlZWQgPj4+IDApICogdGhpcy5fZnJhYztcblxuXHRcdHNlZWQgPSAoc2VlZCo2OTA2OSArIDEpID4+PiAwO1xuXHRcdHRoaXMuX3MxID0gc2VlZCAqIHRoaXMuX2ZyYWM7XG5cblx0XHRzZWVkID0gKHNlZWQqNjkwNjkgKyAxKSA+Pj4gMDtcblx0XHR0aGlzLl9zMiA9IHNlZWQgKiB0aGlzLl9mcmFjO1xuXG5cdFx0dGhpcy5fYyA9IDE7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEByZXR1cm5zIHtmbG9hdH0gUHNldWRvcmFuZG9tIHZhbHVlIFswLDEpLCB1bmlmb3JtbHkgZGlzdHJpYnV0ZWRcblx0ICovXG5cdGdldFVuaWZvcm06IGZ1bmN0aW9uKCkge1xuXHRcdHZhciB0ID0gMjA5MTYzOSAqIHRoaXMuX3MwICsgdGhpcy5fYyAqIHRoaXMuX2ZyYWM7XG5cdFx0dGhpcy5fczAgPSB0aGlzLl9zMTtcblx0XHR0aGlzLl9zMSA9IHRoaXMuX3MyO1xuXHRcdHRoaXMuX2MgPSB0IHwgMDtcblx0XHR0aGlzLl9zMiA9IHQgLSB0aGlzLl9jO1xuXHRcdHJldHVybiB0aGlzLl9zMjtcblx0fSxcblxuXHQvKipcblx0ICogQHBhcmFtIHtpbnR9IGxvd2VyQm91bmQgVGhlIGxvd2VyIGVuZCBvZiB0aGUgcmFuZ2UgdG8gcmV0dXJuIGEgdmFsdWUgZnJvbSwgaW5jbHVzaXZlXG5cdCAqIEBwYXJhbSB7aW50fSB1cHBlckJvdW5kIFRoZSB1cHBlciBlbmQgb2YgdGhlIHJhbmdlIHRvIHJldHVybiBhIHZhbHVlIGZyb20sIGluY2x1c2l2ZVxuXHQgKiBAcmV0dXJucyB7aW50fSBQc2V1ZG9yYW5kb20gdmFsdWUgW2xvd2VyQm91bmQsIHVwcGVyQm91bmRdLCB1c2luZyBST1QuUk5HLmdldFVuaWZvcm0oKSB0byBkaXN0cmlidXRlIHRoZSB2YWx1ZVxuXHQgKi9cblx0Z2V0VW5pZm9ybUludDogZnVuY3Rpb24obG93ZXJCb3VuZCwgdXBwZXJCb3VuZCkge1xuXHRcdHZhciBtYXggPSBNYXRoLm1heChsb3dlckJvdW5kLCB1cHBlckJvdW5kKTtcblx0XHR2YXIgbWluID0gTWF0aC5taW4obG93ZXJCb3VuZCwgdXBwZXJCb3VuZCk7XG5cdFx0cmV0dXJuIE1hdGguZmxvb3IodGhpcy5nZXRVbmlmb3JtKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge2Zsb2F0fSBbbWVhbj0wXSBNZWFuIHZhbHVlXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IFtzdGRkZXY9MV0gU3RhbmRhcmQgZGV2aWF0aW9uLiB+OTUlIG9mIHRoZSBhYnNvbHV0ZSB2YWx1ZXMgd2lsbCBiZSBsb3dlciB0aGFuIDIqc3RkZGV2LlxuXHQgKiBAcmV0dXJucyB7ZmxvYXR9IEEgbm9ybWFsbHkgZGlzdHJpYnV0ZWQgcHNldWRvcmFuZG9tIHZhbHVlXG5cdCAqL1xuXHRnZXROb3JtYWw6IGZ1bmN0aW9uKG1lYW4sIHN0ZGRldikge1xuXHRcdGRvIHtcblx0XHRcdHZhciB1ID0gMip0aGlzLmdldFVuaWZvcm0oKS0xO1xuXHRcdFx0dmFyIHYgPSAyKnRoaXMuZ2V0VW5pZm9ybSgpLTE7XG5cdFx0XHR2YXIgciA9IHUqdSArIHYqdjtcblx0XHR9IHdoaWxlIChyID4gMSB8fCByID09IDApO1xuXG5cdFx0dmFyIGdhdXNzID0gdSAqIE1hdGguc3FydCgtMipNYXRoLmxvZyhyKS9yKTtcblx0XHRyZXR1cm4gKG1lYW4gfHwgMCkgKyBnYXVzcyooc3RkZGV2IHx8IDEpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7aW50fSBQc2V1ZG9yYW5kb20gdmFsdWUgWzEsMTAwXSBpbmNsdXNpdmUsIHVuaWZvcm1seSBkaXN0cmlidXRlZFxuXHQgKi9cblx0Z2V0UGVyY2VudGFnZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIDEgKyBNYXRoLmZsb29yKHRoaXMuZ2V0VW5pZm9ybSgpKjEwMCk7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogQHBhcmFtIHtvYmplY3R9IGRhdGEga2V5PXdoYXRldmVyLCB2YWx1ZT13ZWlnaHQgKHJlbGF0aXZlIHByb2JhYmlsaXR5KVxuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSB3aGF0ZXZlclxuXHQgKi9cblx0Z2V0V2VpZ2h0ZWRWYWx1ZTogZnVuY3Rpb24oZGF0YSkge1xuXHRcdHZhciBhdmFpbCA9IFtdO1xuXHRcdHZhciB0b3RhbCA9IDA7XG5cdFx0XG5cdFx0Zm9yICh2YXIgaWQgaW4gZGF0YSkge1xuXHRcdFx0dG90YWwgKz0gZGF0YVtpZF07XG5cdFx0fVxuXHRcdHZhciByYW5kb20gPSBNYXRoLmZsb29yKHRoaXMuZ2V0VW5pZm9ybSgpKnRvdGFsKTtcblx0XHRcblx0XHR2YXIgcGFydCA9IDA7XG5cdFx0Zm9yICh2YXIgaWQgaW4gZGF0YSkge1xuXHRcdFx0cGFydCArPSBkYXRhW2lkXTtcblx0XHRcdGlmIChyYW5kb20gPCBwYXJ0KSB7IHJldHVybiBpZDsgfVxuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gbnVsbDtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IFJORyBzdGF0ZS4gVXNlZnVsIGZvciBzdG9yaW5nIHRoZSBzdGF0ZSBhbmQgcmUtc2V0dGluZyBpdCB2aWEgc2V0U3RhdGUuXG5cdCAqIEByZXR1cm5zIHs/fSBJbnRlcm5hbCBzdGF0ZVxuXHQgKi9cblx0Z2V0U3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBbdGhpcy5fczAsIHRoaXMuX3MxLCB0aGlzLl9zMiwgdGhpcy5fY107XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNldCBhIHByZXZpb3VzbHkgcmV0cmlldmVkIHN0YXRlLlxuXHQgKiBAcGFyYW0gez99IHN0YXRlXG5cdCAqL1xuXHRzZXRTdGF0ZTogZnVuY3Rpb24oc3RhdGUpIHtcblx0XHR0aGlzLl9zMCA9IHN0YXRlWzBdO1xuXHRcdHRoaXMuX3MxID0gc3RhdGVbMV07XG5cdFx0dGhpcy5fczIgPSBzdGF0ZVsyXTtcblx0XHR0aGlzLl9jICA9IHN0YXRlWzNdO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdF9zMDogMCxcblx0X3MxOiAwLFxuXHRfczI6IDAsXG5cdF9jOiAwLFxuXHRfZnJhYzogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMCAvKiAyXi0zMiAqL1xufVxuXG5ST1QuUk5HLnNldFNlZWQoRGF0ZS5ub3coKSk7XG4vKipcbiAqIEBjbGFzcyAoTWFya292IHByb2Nlc3MpLWJhc2VkIHN0cmluZyBnZW5lcmF0b3IuIFxuICogQ29waWVkIGZyb20gYSA8YSBocmVmPVwiaHR0cDovL3d3dy5yb2d1ZWJhc2luLnJvZ3VlbGlrZWRldmVsb3BtZW50Lm9yZy9pbmRleC5waHA/dGl0bGU9TmFtZXNfZnJvbV9hX2hpZ2hfb3JkZXJfTWFya292X1Byb2Nlc3NfYW5kX2Ffc2ltcGxpZmllZF9LYXR6X2JhY2stb2ZmX3NjaGVtZVwiPlJvZ3VlQmFzaW4gYXJ0aWNsZTwvYT4uIFxuICogT2ZmZXJzIGNvbmZpZ3VyYWJsZSBvcmRlciBhbmQgcHJpb3IuXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXG4gKiBAcGFyYW0ge2Jvb2x9IFtvcHRpb25zLndvcmRzPWZhbHNlXSBVc2Ugd29yZCBtb2RlP1xuICogQHBhcmFtIHtpbnR9IFtvcHRpb25zLm9yZGVyPTNdXG4gKiBAcGFyYW0ge2Zsb2F0fSBbb3B0aW9ucy5wcmlvcj0wLjAwMV1cbiAqL1xuUk9ULlN0cmluZ0dlbmVyYXRvciA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0dGhpcy5fb3B0aW9ucyA9IHtcblx0XHR3b3JkczogZmFsc2UsXG5cdFx0b3JkZXI6IDMsXG5cdFx0cHJpb3I6IDAuMDAxXG5cdH1cblx0Zm9yICh2YXIgcCBpbiBvcHRpb25zKSB7IHRoaXMuX29wdGlvbnNbcF0gPSBvcHRpb25zW3BdOyB9XG5cblx0dGhpcy5fYm91bmRhcnkgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDApO1xuXHR0aGlzLl9zdWZmaXggPSB0aGlzLl9ib3VuZGFyeTtcblx0dGhpcy5fcHJlZml4ID0gW107XG5cdGZvciAodmFyIGk9MDtpPHRoaXMuX29wdGlvbnMub3JkZXI7aSsrKSB7IHRoaXMuX3ByZWZpeC5wdXNoKHRoaXMuX2JvdW5kYXJ5KTsgfVxuXG5cdHRoaXMuX3ByaW9yVmFsdWVzID0ge307XG5cdHRoaXMuX3ByaW9yVmFsdWVzW3RoaXMuX2JvdW5kYXJ5XSA9IHRoaXMuX29wdGlvbnMucHJpb3I7XG5cblx0dGhpcy5fZGF0YSA9IHt9O1xufVxuXG4vKipcbiAqIFJlbW92ZSBhbGwgbGVhcm5pbmcgZGF0YVxuICovXG5ST1QuU3RyaW5nR2VuZXJhdG9yLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9kYXRhID0ge307XG5cdHRoaXMuX3ByaW9yVmFsdWVzID0ge307XG59XG5cbi8qKlxuICogQHJldHVybnMge3N0cmluZ30gR2VuZXJhdGVkIHN0cmluZ1xuICovXG5ST1QuU3RyaW5nR2VuZXJhdG9yLnByb3RvdHlwZS5nZW5lcmF0ZSA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgcmVzdWx0ID0gW3RoaXMuX3NhbXBsZSh0aGlzLl9wcmVmaXgpXTtcblx0d2hpbGUgKHJlc3VsdFtyZXN1bHQubGVuZ3RoLTFdICE9IHRoaXMuX2JvdW5kYXJ5KSB7XG5cdFx0cmVzdWx0LnB1c2godGhpcy5fc2FtcGxlKHJlc3VsdCkpO1xuXHR9XG5cdHJldHVybiB0aGlzLl9qb2luKHJlc3VsdC5zbGljZSgwLCAtMSkpO1xufVxuXG4vKipcbiAqIE9ic2VydmUgKGxlYXJuKSBhIHN0cmluZyBmcm9tIGEgdHJhaW5pbmcgc2V0XG4gKi9cblJPVC5TdHJpbmdHZW5lcmF0b3IucHJvdG90eXBlLm9ic2VydmUgPSBmdW5jdGlvbihzdHJpbmcpIHtcblx0dmFyIHRva2VucyA9IHRoaXMuX3NwbGl0KHN0cmluZyk7XG5cblx0Zm9yICh2YXIgaT0wOyBpPHRva2Vucy5sZW5ndGg7IGkrKykge1xuXHRcdHRoaXMuX3ByaW9yVmFsdWVzW3Rva2Vuc1tpXV0gPSB0aGlzLl9vcHRpb25zLnByaW9yO1xuXHR9XG5cblx0dG9rZW5zID0gdGhpcy5fcHJlZml4LmNvbmNhdCh0b2tlbnMpLmNvbmNhdCh0aGlzLl9zdWZmaXgpOyAvKiBhZGQgYm91bmRhcnkgc3ltYm9scyAqL1xuXG5cdGZvciAodmFyIGk9dGhpcy5fb3B0aW9ucy5vcmRlcjsgaTx0b2tlbnMubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgY29udGV4dCA9IHRva2Vucy5zbGljZShpLXRoaXMuX29wdGlvbnMub3JkZXIsIGkpO1xuXHRcdHZhciBldmVudCA9IHRva2Vuc1tpXTtcblx0XHRmb3IgKHZhciBqPTA7IGo8Y29udGV4dC5sZW5ndGg7IGorKykge1xuXHRcdFx0dmFyIHN1YmNvbnRleHQgPSBjb250ZXh0LnNsaWNlKGopO1xuXHRcdFx0dGhpcy5fb2JzZXJ2ZUV2ZW50KHN1YmNvbnRleHQsIGV2ZW50KTtcblx0XHR9XG5cdH1cbn1cblxuUk9ULlN0cmluZ0dlbmVyYXRvci5wcm90b3R5cGUuZ2V0U3RhdHMgPSBmdW5jdGlvbigpIHtcblx0dmFyIHBhcnRzID0gW107XG5cblx0dmFyIHByaW9yQ291bnQgPSAwO1xuXHRmb3IgKHZhciBwIGluIHRoaXMuX3ByaW9yVmFsdWVzKSB7IHByaW9yQ291bnQrKzsgfVxuXHRwcmlvckNvdW50LS07IC8qIGJvdW5kYXJ5ICovXG5cdHBhcnRzLnB1c2goXCJkaXN0aW5jdCBzYW1wbGVzOiBcIiArIHByaW9yQ291bnQpO1xuXG5cdHZhciBkYXRhQ291bnQgPSAwO1xuXHR2YXIgZXZlbnRDb3VudCA9IDA7XG5cdGZvciAodmFyIHAgaW4gdGhpcy5fZGF0YSkgeyBcblx0XHRkYXRhQ291bnQrKzsgXG5cdFx0Zm9yICh2YXIga2V5IGluIHRoaXMuX2RhdGFbcF0pIHtcblx0XHRcdGV2ZW50Q291bnQrKztcblx0XHR9XG5cdH1cblx0cGFydHMucHVzaChcImRpY3Rpb25hcnkgc2l6ZSAoY29udGV4dHMpOiBcIiArIGRhdGFDb3VudCk7XG5cdHBhcnRzLnB1c2goXCJkaWN0aW9uYXJ5IHNpemUgKGV2ZW50cyk6IFwiICsgZXZlbnRDb3VudCk7XG5cblx0cmV0dXJuIHBhcnRzLmpvaW4oXCIsIFwiKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ31cbiAqIEByZXR1cm5zIHtzdHJpbmdbXX1cbiAqL1xuUk9ULlN0cmluZ0dlbmVyYXRvci5wcm90b3R5cGUuX3NwbGl0ID0gZnVuY3Rpb24oc3RyKSB7XG5cdHJldHVybiBzdHIuc3BsaXQodGhpcy5fb3B0aW9ucy53b3JkcyA/IC9cXHMrLyA6IFwiXCIpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nW119XG4gKiBAcmV0dXJucyB7c3RyaW5nfSBcbiAqL1xuUk9ULlN0cmluZ0dlbmVyYXRvci5wcm90b3R5cGUuX2pvaW4gPSBmdW5jdGlvbihhcnIpIHtcblx0cmV0dXJuIGFyci5qb2luKHRoaXMuX29wdGlvbnMud29yZHMgPyBcIiBcIiA6IFwiXCIpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nW119IGNvbnRleHRcbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFxuICovXG5ST1QuU3RyaW5nR2VuZXJhdG9yLnByb3RvdHlwZS5fb2JzZXJ2ZUV2ZW50ID0gZnVuY3Rpb24oY29udGV4dCwgZXZlbnQpIHtcblx0dmFyIGtleSA9IHRoaXMuX2pvaW4oY29udGV4dCk7XG5cdGlmICghKGtleSBpbiB0aGlzLl9kYXRhKSkgeyB0aGlzLl9kYXRhW2tleV0gPSB7fTsgfVxuXHR2YXIgZGF0YSA9IHRoaXMuX2RhdGFba2V5XTtcblxuXHRpZiAoIShldmVudCBpbiBkYXRhKSkgeyBkYXRhW2V2ZW50XSA9IDA7IH1cblx0ZGF0YVtldmVudF0rKztcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ1tdfVxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuUk9ULlN0cmluZ0dlbmVyYXRvci5wcm90b3R5cGUuX3NhbXBsZSA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcblx0Y29udGV4dCA9IHRoaXMuX2JhY2tvZmYoY29udGV4dCk7XG5cdHZhciBrZXkgPSB0aGlzLl9qb2luKGNvbnRleHQpO1xuXHR2YXIgZGF0YSA9IHRoaXMuX2RhdGFba2V5XTtcblxuXHR2YXIgYXZhaWxhYmxlID0ge307XG5cblx0aWYgKHRoaXMuX29wdGlvbnMucHJpb3IpIHtcblx0XHRmb3IgKHZhciBldmVudCBpbiB0aGlzLl9wcmlvclZhbHVlcykgeyBhdmFpbGFibGVbZXZlbnRdID0gdGhpcy5fcHJpb3JWYWx1ZXNbZXZlbnRdOyB9XG5cdFx0Zm9yICh2YXIgZXZlbnQgaW4gZGF0YSkgeyBhdmFpbGFibGVbZXZlbnRdICs9IGRhdGFbZXZlbnRdOyB9XG5cdH0gZWxzZSB7IFxuXHRcdGF2YWlsYWJsZSA9IGRhdGE7XG5cdH1cblxuXHRyZXR1cm4gdGhpcy5fcGlja1JhbmRvbShhdmFpbGFibGUpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nW119XG4gKiBAcmV0dXJucyB7c3RyaW5nW119XG4gKi9cblJPVC5TdHJpbmdHZW5lcmF0b3IucHJvdG90eXBlLl9iYWNrb2ZmID0gZnVuY3Rpb24oY29udGV4dCkge1xuXHRpZiAoY29udGV4dC5sZW5ndGggPiB0aGlzLl9vcHRpb25zLm9yZGVyKSB7XG5cdFx0Y29udGV4dCA9IGNvbnRleHQuc2xpY2UoLXRoaXMuX29wdGlvbnMub3JkZXIpO1xuXHR9IGVsc2UgaWYgKGNvbnRleHQubGVuZ3RoIDwgdGhpcy5fb3B0aW9ucy5vcmRlcikge1xuXHRcdGNvbnRleHQgPSB0aGlzLl9wcmVmaXguc2xpY2UoMCwgdGhpcy5fb3B0aW9ucy5vcmRlciAtIGNvbnRleHQubGVuZ3RoKS5jb25jYXQoY29udGV4dCk7XG5cdH1cblxuXHR3aGlsZSAoISh0aGlzLl9qb2luKGNvbnRleHQpIGluIHRoaXMuX2RhdGEpICYmIGNvbnRleHQubGVuZ3RoID4gMCkgeyBjb250ZXh0ID0gY29udGV4dC5zbGljZSgxKTsgfVxuXG5cdHJldHVybiBjb250ZXh0O1xufVxuXG5cblJPVC5TdHJpbmdHZW5lcmF0b3IucHJvdG90eXBlLl9waWNrUmFuZG9tID0gZnVuY3Rpb24oZGF0YSkge1xuXHR2YXIgdG90YWwgPSAwO1xuXHRcblx0Zm9yICh2YXIgaWQgaW4gZGF0YSkge1xuXHRcdHRvdGFsICs9IGRhdGFbaWRdO1xuXHR9XG5cdHZhciByYW5kb20gPSBST1QuUk5HLmdldFVuaWZvcm0oKSp0b3RhbDtcblx0XG5cdHZhciBwYXJ0ID0gMDtcblx0Zm9yICh2YXIgaWQgaW4gZGF0YSkge1xuXHRcdHBhcnQgKz0gZGF0YVtpZF07XG5cdFx0aWYgKHJhbmRvbSA8IHBhcnQpIHsgcmV0dXJuIGlkOyB9XG5cdH1cbn1cbi8qKlxuICogQGNsYXNzIEdlbmVyaWMgZXZlbnQgcXVldWU6IHN0b3JlcyBldmVudHMgYW5kIHJldHJpZXZlcyB0aGVtIGJhc2VkIG9uIHRoZWlyIHRpbWVcbiAqL1xuUk9ULkV2ZW50UXVldWUgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5fdGltZSA9IDA7XG5cdHRoaXMuX2V2ZW50cyA9IFtdO1xuXHR0aGlzLl9ldmVudFRpbWVzID0gW107XG59XG5cbi8qKlxuICogQHJldHVybnMge251bWJlcn0gRWxhcHNlZCB0aW1lXG4gKi9cblJPVC5FdmVudFF1ZXVlLnByb3RvdHlwZS5nZXRUaW1lID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLl90aW1lO1xufVxuXG4vKipcbiAqIENsZWFyIGFsbCBzY2hlZHVsZWQgZXZlbnRzXG4gKi9cblJPVC5FdmVudFF1ZXVlLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9ldmVudHMgPSBbXTtcblx0dGhpcy5fZXZlbnRUaW1lcyA9IFtdO1xuXHRyZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBAcGFyYW0gez99IGV2ZW50XG4gKiBAcGFyYW0ge251bWJlcn0gdGltZVxuICovXG5ST1QuRXZlbnRRdWV1ZS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oZXZlbnQsIHRpbWUpIHtcblx0dmFyIGluZGV4ID0gdGhpcy5fZXZlbnRzLmxlbmd0aDtcblx0Zm9yICh2YXIgaT0wO2k8dGhpcy5fZXZlbnRUaW1lcy5sZW5ndGg7aSsrKSB7XG5cdFx0aWYgKHRoaXMuX2V2ZW50VGltZXNbaV0gPiB0aW1lKSB7XG5cdFx0XHRpbmRleCA9IGk7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHR0aGlzLl9ldmVudHMuc3BsaWNlKGluZGV4LCAwLCBldmVudCk7XG5cdHRoaXMuX2V2ZW50VGltZXMuc3BsaWNlKGluZGV4LCAwLCB0aW1lKTtcbn1cblxuLyoqXG4gKiBMb2NhdGVzIHRoZSBuZWFyZXN0IGV2ZW50LCBhZHZhbmNlcyB0aW1lIGlmIG5lY2Vzc2FyeS4gUmV0dXJucyB0aGF0IGV2ZW50IGFuZCByZW1vdmVzIGl0IGZyb20gdGhlIHF1ZXVlLlxuICogQHJldHVybnMgez8gfHwgbnVsbH0gVGhlIGV2ZW50IHByZXZpb3VzbHkgYWRkZWQgYnkgYWRkRXZlbnQsIG51bGwgaWYgbm8gZXZlbnQgYXZhaWxhYmxlXG4gKi9cblJPVC5FdmVudFF1ZXVlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbigpIHtcblx0aWYgKCF0aGlzLl9ldmVudHMubGVuZ3RoKSB7IHJldHVybiBudWxsOyB9XG5cblx0dmFyIHRpbWUgPSB0aGlzLl9ldmVudFRpbWVzLnNwbGljZSgwLCAxKVswXTtcblx0aWYgKHRpbWUgPiAwKSB7IC8qIGFkdmFuY2UgKi9cblx0XHR0aGlzLl90aW1lICs9IHRpbWU7XG5cdFx0Zm9yICh2YXIgaT0wO2k8dGhpcy5fZXZlbnRUaW1lcy5sZW5ndGg7aSsrKSB7IHRoaXMuX2V2ZW50VGltZXNbaV0gLT0gdGltZTsgfVxuXHR9XG5cblx0cmV0dXJuIHRoaXMuX2V2ZW50cy5zcGxpY2UoMCwgMSlbMF07XG59XG5cbi8qKlxuICogUmVtb3ZlIGFuIGV2ZW50IGZyb20gdGhlIHF1ZXVlXG4gKiBAcGFyYW0gez99IGV2ZW50XG4gKiBAcmV0dXJucyB7Ym9vbH0gc3VjY2Vzcz9cbiAqL1xuUk9ULkV2ZW50UXVldWUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdHZhciBpbmRleCA9IHRoaXMuX2V2ZW50cy5pbmRleE9mKGV2ZW50KTtcblx0aWYgKGluZGV4ID09IC0xKSB7IHJldHVybiBmYWxzZSB9XG5cdHRoaXMuX3JlbW92ZShpbmRleCk7XG5cdHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFJlbW92ZSBhbiBldmVudCBmcm9tIHRoZSBxdWV1ZVxuICogQHBhcmFtIHtpbnR9IGluZGV4XG4gKi9cblJPVC5FdmVudFF1ZXVlLnByb3RvdHlwZS5fcmVtb3ZlID0gZnVuY3Rpb24oaW5kZXgpIHtcblx0dGhpcy5fZXZlbnRzLnNwbGljZShpbmRleCwgMSk7XG5cdHRoaXMuX2V2ZW50VGltZXMuc3BsaWNlKGluZGV4LCAxKTtcbn1cbi8qKlxuICogQGNsYXNzIEFic3RyYWN0IHNjaGVkdWxlclxuICovXG5ST1QuU2NoZWR1bGVyID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuX3F1ZXVlID0gbmV3IFJPVC5FdmVudFF1ZXVlKCk7XG5cdHRoaXMuX3JlcGVhdCA9IFtdO1xuXHR0aGlzLl9jdXJyZW50ID0gbnVsbDtcbn1cblxuLyoqXG4gKiBAc2VlIFJPVC5FdmVudFF1ZXVlI2dldFRpbWVcbiAqL1xuUk9ULlNjaGVkdWxlci5wcm90b3R5cGUuZ2V0VGltZSA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5fcXVldWUuZ2V0VGltZSgpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7P30gaXRlbVxuICogQHBhcmFtIHtib29sfSByZXBlYXRcbiAqL1xuUk9ULlNjaGVkdWxlci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oaXRlbSwgcmVwZWF0KSB7XG5cdGlmIChyZXBlYXQpIHsgdGhpcy5fcmVwZWF0LnB1c2goaXRlbSk7IH1cblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogQ2xlYXIgYWxsIGl0ZW1zXG4gKi9cblJPVC5TY2hlZHVsZXIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuX3F1ZXVlLmNsZWFyKCk7XG5cdHRoaXMuX3JlcGVhdCA9IFtdO1xuXHR0aGlzLl9jdXJyZW50ID0gbnVsbDtcblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogUmVtb3ZlIGEgcHJldmlvdXNseSBhZGRlZCBpdGVtXG4gKiBAcGFyYW0gez99IGl0ZW1cbiAqIEByZXR1cm5zIHtib29sfSBzdWNjZXNzZnVsP1xuICovXG5ST1QuU2NoZWR1bGVyLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbihpdGVtKSB7XG5cdHZhciByZXN1bHQgPSB0aGlzLl9xdWV1ZS5yZW1vdmUoaXRlbSk7XG5cblx0dmFyIGluZGV4ID0gdGhpcy5fcmVwZWF0LmluZGV4T2YoaXRlbSk7XG5cdGlmIChpbmRleCAhPSAtMSkgeyB0aGlzLl9yZXBlYXQuc3BsaWNlKGluZGV4LCAxKTsgfVxuXG5cdGlmICh0aGlzLl9jdXJyZW50ID09IGl0ZW0pIHsgdGhpcy5fY3VycmVudCA9IG51bGw7IH1cblxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFNjaGVkdWxlIG5leHQgaXRlbVxuICogQHJldHVybnMgez99XG4gKi9cblJPVC5TY2hlZHVsZXIucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5fY3VycmVudCA9IHRoaXMuX3F1ZXVlLmdldCgpO1xuXHRyZXR1cm4gdGhpcy5fY3VycmVudDtcbn1cbi8qKlxuICogQGNsYXNzIFNpbXBsZSBmYWlyIHNjaGVkdWxlciAocm91bmQtcm9iaW4gc3R5bGUpXG4gKiBAYXVnbWVudHMgUk9ULlNjaGVkdWxlclxuICovXG5ST1QuU2NoZWR1bGVyLlNpbXBsZSA9IGZ1bmN0aW9uKCkge1xuXHRST1QuU2NoZWR1bGVyLmNhbGwodGhpcyk7XG59XG5ST1QuU2NoZWR1bGVyLlNpbXBsZS5leHRlbmQoUk9ULlNjaGVkdWxlcik7XG5cbi8qKlxuICogQHNlZSBST1QuU2NoZWR1bGVyI2FkZFxuICovXG5ST1QuU2NoZWR1bGVyLlNpbXBsZS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oaXRlbSwgcmVwZWF0KSB7XG5cdHRoaXMuX3F1ZXVlLmFkZChpdGVtLCAwKTtcblx0cmV0dXJuIFJPVC5TY2hlZHVsZXIucHJvdG90eXBlLmFkZC5jYWxsKHRoaXMsIGl0ZW0sIHJlcGVhdCk7XG59XG5cbi8qKlxuICogQHNlZSBST1QuU2NoZWR1bGVyI25leHRcbiAqL1xuUk9ULlNjaGVkdWxlci5TaW1wbGUucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcblx0aWYgKHRoaXMuX2N1cnJlbnQgJiYgdGhpcy5fcmVwZWF0LmluZGV4T2YodGhpcy5fY3VycmVudCkgIT0gLTEpIHtcblx0XHR0aGlzLl9xdWV1ZS5hZGQodGhpcy5fY3VycmVudCwgMCk7XG5cdH1cblx0cmV0dXJuIFJPVC5TY2hlZHVsZXIucHJvdG90eXBlLm5leHQuY2FsbCh0aGlzKTtcbn1cbi8qKlxuICogQGNsYXNzIFNwZWVkLWJhc2VkIHNjaGVkdWxlclxuICogQGF1Z21lbnRzIFJPVC5TY2hlZHVsZXJcbiAqL1xuUk9ULlNjaGVkdWxlci5TcGVlZCA9IGZ1bmN0aW9uKCkge1xuXHRST1QuU2NoZWR1bGVyLmNhbGwodGhpcyk7XG59XG5ST1QuU2NoZWR1bGVyLlNwZWVkLmV4dGVuZChST1QuU2NoZWR1bGVyKTtcblxuLyoqXG4gKiBAcGFyYW0ge29iamVjdH0gaXRlbSBhbnl0aGluZyB3aXRoIFwiZ2V0U3BlZWRcIiBtZXRob2RcbiAqIEBwYXJhbSB7Ym9vbH0gcmVwZWF0XG4gKiBAc2VlIFJPVC5TY2hlZHVsZXIjYWRkXG4gKi9cblJPVC5TY2hlZHVsZXIuU3BlZWQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKGl0ZW0sIHJlcGVhdCkge1xuXHR0aGlzLl9xdWV1ZS5hZGQoaXRlbSwgMS9pdGVtLmdldFNwZWVkKCkpO1xuXHRyZXR1cm4gUk9ULlNjaGVkdWxlci5wcm90b3R5cGUuYWRkLmNhbGwodGhpcywgaXRlbSwgcmVwZWF0KTtcbn1cblxuLyoqXG4gKiBAc2VlIFJPVC5TY2hlZHVsZXIjbmV4dFxuICovXG5ST1QuU2NoZWR1bGVyLlNwZWVkLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG5cdGlmICh0aGlzLl9jdXJyZW50ICYmIHRoaXMuX3JlcGVhdC5pbmRleE9mKHRoaXMuX2N1cnJlbnQpICE9IC0xKSB7XG5cdFx0dGhpcy5fcXVldWUuYWRkKHRoaXMuX2N1cnJlbnQsIDEvdGhpcy5fY3VycmVudC5nZXRTcGVlZCgpKTtcblx0fVxuXHRyZXR1cm4gUk9ULlNjaGVkdWxlci5wcm90b3R5cGUubmV4dC5jYWxsKHRoaXMpO1xufVxuLyoqXG4gKiBAY2xhc3MgQWN0aW9uLWJhc2VkIHNjaGVkdWxlclxuICogQGF1Z21lbnRzIFJPVC5TY2hlZHVsZXJcbiAqL1xuUk9ULlNjaGVkdWxlci5BY3Rpb24gPSBmdW5jdGlvbigpIHtcblx0Uk9ULlNjaGVkdWxlci5jYWxsKHRoaXMpO1xuXHR0aGlzLl9kZWZhdWx0RHVyYXRpb24gPSAxOyAvKiBmb3IgbmV3bHkgYWRkZWQgKi9cblx0dGhpcy5fZHVyYXRpb24gPSB0aGlzLl9kZWZhdWx0RHVyYXRpb247IC8qIGZvciB0aGlzLl9jdXJyZW50ICovXG59XG5ST1QuU2NoZWR1bGVyLkFjdGlvbi5leHRlbmQoUk9ULlNjaGVkdWxlcik7XG5cbi8qKlxuICogQHBhcmFtIHtvYmplY3R9IGl0ZW1cbiAqIEBwYXJhbSB7Ym9vbH0gcmVwZWF0XG4gKiBAcGFyYW0ge251bWJlcn0gW3RpbWU9MV1cbiAqIEBzZWUgUk9ULlNjaGVkdWxlciNhZGRcbiAqL1xuUk9ULlNjaGVkdWxlci5BY3Rpb24ucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKGl0ZW0sIHJlcGVhdCwgdGltZSkge1xuXHR0aGlzLl9xdWV1ZS5hZGQoaXRlbSwgdGltZSB8fCB0aGlzLl9kZWZhdWx0RHVyYXRpb24pO1xuXHRyZXR1cm4gUk9ULlNjaGVkdWxlci5wcm90b3R5cGUuYWRkLmNhbGwodGhpcywgaXRlbSwgcmVwZWF0KTtcbn1cblxuUk9ULlNjaGVkdWxlci5BY3Rpb24ucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuX2R1cmF0aW9uID0gdGhpcy5fZGVmYXVsdER1cmF0aW9uO1xuXHRyZXR1cm4gUk9ULlNjaGVkdWxlci5wcm90b3R5cGUuY2xlYXIuY2FsbCh0aGlzKTtcbn1cblxuUk9ULlNjaGVkdWxlci5BY3Rpb24ucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0aWYgKGl0ZW0gPT0gdGhpcy5fY3VycmVudCkgeyB0aGlzLl9kdXJhdGlvbiA9IHRoaXMuX2RlZmF1bHREdXJhdGlvbjsgfVxuXHRyZXR1cm4gUk9ULlNjaGVkdWxlci5wcm90b3R5cGUucmVtb3ZlLmNhbGwodGhpcywgaXRlbSk7XG59XG5cbi8qKlxuICogQHNlZSBST1QuU2NoZWR1bGVyI25leHRcbiAqL1xuUk9ULlNjaGVkdWxlci5BY3Rpb24ucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcblx0aWYgKHRoaXMuX2N1cnJlbnQgJiYgdGhpcy5fcmVwZWF0LmluZGV4T2YodGhpcy5fY3VycmVudCkgIT0gLTEpIHtcblx0XHR0aGlzLl9xdWV1ZS5hZGQodGhpcy5fY3VycmVudCwgdGhpcy5fZHVyYXRpb24gfHwgdGhpcy5fZGVmYXVsdER1cmF0aW9uKTtcblx0XHR0aGlzLl9kdXJhdGlvbiA9IHRoaXMuX2RlZmF1bHREdXJhdGlvbjtcblx0fVxuXHRyZXR1cm4gUk9ULlNjaGVkdWxlci5wcm90b3R5cGUubmV4dC5jYWxsKHRoaXMpO1xufVxuXG4vKipcbiAqIFNldCBkdXJhdGlvbiBmb3IgdGhlIGFjdGl2ZSBpdGVtXG4gKi9cblJPVC5TY2hlZHVsZXIuQWN0aW9uLnByb3RvdHlwZS5zZXREdXJhdGlvbiA9IGZ1bmN0aW9uKHRpbWUpIHtcblx0aWYgKHRoaXMuX2N1cnJlbnQpIHsgdGhpcy5fZHVyYXRpb24gPSB0aW1lOyB9XG5cdHJldHVybiB0aGlzO1xufVxuLyoqXG4gKiBAY2xhc3MgQXN5bmNocm9ub3VzIG1haW4gbG9vcFxuICogQHBhcmFtIHtST1QuU2NoZWR1bGVyfSBzY2hlZHVsZXJcbiAqL1xuUk9ULkVuZ2luZSA9IGZ1bmN0aW9uKHNjaGVkdWxlcikge1xuXHR0aGlzLl9zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG5cdHRoaXMuX2xvY2sgPSAxO1xufVxuXG4vKipcbiAqIFN0YXJ0IHRoZSBtYWluIGxvb3AuIFdoZW4gdGhpcyBjYWxsIHJldHVybnMsIHRoZSBsb29wIGlzIGxvY2tlZC5cbiAqL1xuUk9ULkVuZ2luZS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMudW5sb2NrKCk7XG59XG5cbi8qKlxuICogSW50ZXJydXB0IHRoZSBlbmdpbmUgYnkgYW4gYXN5bmNocm9ub3VzIGFjdGlvblxuICovXG5ST1QuRW5naW5lLnByb3RvdHlwZS5sb2NrID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuX2xvY2srKztcblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogUmVzdW1lIGV4ZWN1dGlvbiAocGF1c2VkIGJ5IGEgcHJldmlvdXMgbG9jaylcbiAqL1xuUk9ULkVuZ2luZS5wcm90b3R5cGUudW5sb2NrID0gZnVuY3Rpb24oKSB7XG5cdGlmICghdGhpcy5fbG9jaykgeyB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgdW5sb2NrIHVubG9ja2VkIGVuZ2luZVwiKTsgfVxuXHR0aGlzLl9sb2NrLS07XG5cblx0d2hpbGUgKCF0aGlzLl9sb2NrKSB7XG5cdFx0dmFyIGFjdG9yID0gdGhpcy5fc2NoZWR1bGVyLm5leHQoKTtcblx0XHRpZiAoIWFjdG9yKSB7IHJldHVybiB0aGlzLmxvY2soKTsgfSAvKiBubyBhY3RvcnMgKi9cblx0XHR2YXIgcmVzdWx0ID0gYWN0b3IuYWN0KCk7XG5cdFx0aWYgKHJlc3VsdCAmJiByZXN1bHQudGhlbikgeyAvKiBhY3RvciByZXR1cm5lZCBhIFwidGhlbmFibGVcIiwgbG9va3MgbGlrZSBhIFByb21pc2UgKi9cblx0XHRcdHRoaXMubG9jaygpO1xuXHRcdFx0cmVzdWx0LnRoZW4odGhpcy51bmxvY2suYmluZCh0aGlzKSk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRoaXM7XG59XG4vKipcbiAqIEBjbGFzcyBCYXNlIG1hcCBnZW5lcmF0b3JcbiAqIEBwYXJhbSB7aW50fSBbd2lkdGg9Uk9ULkRFRkFVTFRfV0lEVEhdXG4gKiBAcGFyYW0ge2ludH0gW2hlaWdodD1ST1QuREVGQVVMVF9IRUlHSFRdXG4gKi9cblJPVC5NYXAgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG5cdHRoaXMuX3dpZHRoID0gd2lkdGggfHwgUk9ULkRFRkFVTFRfV0lEVEg7XG5cdHRoaXMuX2hlaWdodCA9IGhlaWdodCB8fCBST1QuREVGQVVMVF9IRUlHSFQ7XG59O1xuXG5ST1QuTWFwLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbihjYWxsYmFjaykge31cblxuUk9ULk1hcC5wcm90b3R5cGUuX2ZpbGxNYXAgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHR2YXIgbWFwID0gW107XG5cdGZvciAodmFyIGk9MDtpPHRoaXMuX3dpZHRoO2krKykge1xuXHRcdG1hcC5wdXNoKFtdKTtcblx0XHRmb3IgKHZhciBqPTA7ajx0aGlzLl9oZWlnaHQ7aisrKSB7IG1hcFtpXS5wdXNoKHZhbHVlKTsgfVxuXHR9XG5cdHJldHVybiBtYXA7XG59XG4vKipcbiAqIEBjbGFzcyBTaW1wbGUgZW1wdHkgcmVjdGFuZ3VsYXIgcm9vbVxuICogQGF1Z21lbnRzIFJPVC5NYXBcbiAqL1xuUk9ULk1hcC5BcmVuYSA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcblx0Uk9ULk1hcC5jYWxsKHRoaXMsIHdpZHRoLCBoZWlnaHQpO1xufVxuUk9ULk1hcC5BcmVuYS5leHRlbmQoUk9ULk1hcCk7XG5cblJPVC5NYXAuQXJlbmEucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdHZhciB3ID0gdGhpcy5fd2lkdGgtMTtcblx0dmFyIGggPSB0aGlzLl9oZWlnaHQtMTtcblx0Zm9yICh2YXIgaT0wO2k8PXc7aSsrKSB7XG5cdFx0Zm9yICh2YXIgaj0wO2o8PWg7aisrKSB7XG5cdFx0XHR2YXIgZW1wdHkgPSAoaSAmJiBqICYmIGk8dyAmJiBqPGgpO1xuXHRcdFx0Y2FsbGJhY2soaSwgaiwgZW1wdHkgPyAwIDogMSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0aGlzO1xufVxuLyoqXG4gKiBAY2xhc3MgUmVjdXJzaXZlbHkgZGl2aWRlZCBtYXplLCBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01hemVfZ2VuZXJhdGlvbl9hbGdvcml0aG0jUmVjdXJzaXZlX2RpdmlzaW9uX21ldGhvZFxuICogQGF1Z21lbnRzIFJPVC5NYXBcbiAqL1xuUk9ULk1hcC5EaXZpZGVkTWF6ZSA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcblx0Uk9ULk1hcC5jYWxsKHRoaXMsIHdpZHRoLCBoZWlnaHQpO1xuXHR0aGlzLl9zdGFjayA9IFtdO1xufVxuUk9ULk1hcC5EaXZpZGVkTWF6ZS5leHRlbmQoUk9ULk1hcCk7XG5cblJPVC5NYXAuRGl2aWRlZE1hemUucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdHZhciB3ID0gdGhpcy5fd2lkdGg7XG5cdHZhciBoID0gdGhpcy5faGVpZ2h0O1xuXHRcblx0dGhpcy5fbWFwID0gW107XG5cdFxuXHRmb3IgKHZhciBpPTA7aTx3O2krKykge1xuXHRcdHRoaXMuX21hcC5wdXNoKFtdKTtcblx0XHRmb3IgKHZhciBqPTA7ajxoO2orKykge1xuXHRcdFx0dmFyIGJvcmRlciA9IChpID09IDAgfHwgaiA9PSAwIHx8IGkrMSA9PSB3IHx8IGorMSA9PSBoKTtcblx0XHRcdHRoaXMuX21hcFtpXS5wdXNoKGJvcmRlciA/IDEgOiAwKTtcblx0XHR9XG5cdH1cblx0XG5cdHRoaXMuX3N0YWNrID0gW1xuXHRcdFsxLCAxLCB3LTIsIGgtMl1cblx0XTtcblx0dGhpcy5fcHJvY2VzcygpO1xuXHRcblx0Zm9yICh2YXIgaT0wO2k8dztpKyspIHtcblx0XHRmb3IgKHZhciBqPTA7ajxoO2orKykge1xuXHRcdFx0Y2FsbGJhY2soaSwgaiwgdGhpcy5fbWFwW2ldW2pdKTtcblx0XHR9XG5cdH1cblx0dGhpcy5fbWFwID0gbnVsbDtcblx0cmV0dXJuIHRoaXM7XG59XG5cblJPVC5NYXAuRGl2aWRlZE1hemUucHJvdG90eXBlLl9wcm9jZXNzID0gZnVuY3Rpb24oKSB7XG5cdHdoaWxlICh0aGlzLl9zdGFjay5sZW5ndGgpIHtcblx0XHR2YXIgcm9vbSA9IHRoaXMuX3N0YWNrLnNoaWZ0KCk7IC8qIFtsZWZ0LCB0b3AsIHJpZ2h0LCBib3R0b21dICovXG5cdFx0dGhpcy5fcGFydGl0aW9uUm9vbShyb29tKTtcblx0fVxufVxuXG5ST1QuTWFwLkRpdmlkZWRNYXplLnByb3RvdHlwZS5fcGFydGl0aW9uUm9vbSA9IGZ1bmN0aW9uKHJvb20pIHtcblx0dmFyIGF2YWlsWCA9IFtdO1xuXHR2YXIgYXZhaWxZID0gW107XG5cdFxuXHRmb3IgKHZhciBpPXJvb21bMF0rMTtpPHJvb21bMl07aSsrKSB7XG5cdFx0dmFyIHRvcCA9IHRoaXMuX21hcFtpXVtyb29tWzFdLTFdO1xuXHRcdHZhciBib3R0b20gPSB0aGlzLl9tYXBbaV1bcm9vbVszXSsxXTtcblx0XHRpZiAodG9wICYmIGJvdHRvbSAmJiAhKGkgJSAyKSkgeyBhdmFpbFgucHVzaChpKTsgfVxuXHR9XG5cdFxuXHRmb3IgKHZhciBqPXJvb21bMV0rMTtqPHJvb21bM107aisrKSB7XG5cdFx0dmFyIGxlZnQgPSB0aGlzLl9tYXBbcm9vbVswXS0xXVtqXTtcblx0XHR2YXIgcmlnaHQgPSB0aGlzLl9tYXBbcm9vbVsyXSsxXVtqXTtcblx0XHRpZiAobGVmdCAmJiByaWdodCAmJiAhKGogJSAyKSkgeyBhdmFpbFkucHVzaChqKTsgfVxuXHR9XG5cblx0aWYgKCFhdmFpbFgubGVuZ3RoIHx8ICFhdmFpbFkubGVuZ3RoKSB7IHJldHVybjsgfVxuXG5cdHZhciB4ID0gYXZhaWxYLnJhbmRvbSgpO1xuXHR2YXIgeSA9IGF2YWlsWS5yYW5kb20oKTtcblx0XG5cdHRoaXMuX21hcFt4XVt5XSA9IDE7XG5cdFxuXHR2YXIgd2FsbHMgPSBbXTtcblx0XG5cdHZhciB3ID0gW107IHdhbGxzLnB1c2godyk7IC8qIGxlZnQgcGFydCAqL1xuXHRmb3IgKHZhciBpPXJvb21bMF07IGk8eDsgaSsrKSB7IFxuXHRcdHRoaXMuX21hcFtpXVt5XSA9IDE7XG5cdFx0dy5wdXNoKFtpLCB5XSk7IFxuXHR9XG5cdFxuXHR2YXIgdyA9IFtdOyB3YWxscy5wdXNoKHcpOyAvKiByaWdodCBwYXJ0ICovXG5cdGZvciAodmFyIGk9eCsxOyBpPD1yb29tWzJdOyBpKyspIHsgXG5cdFx0dGhpcy5fbWFwW2ldW3ldID0gMTtcblx0XHR3LnB1c2goW2ksIHldKTsgXG5cdH1cblxuXHR2YXIgdyA9IFtdOyB3YWxscy5wdXNoKHcpOyAvKiB0b3AgcGFydCAqL1xuXHRmb3IgKHZhciBqPXJvb21bMV07IGo8eTsgaisrKSB7IFxuXHRcdHRoaXMuX21hcFt4XVtqXSA9IDE7XG5cdFx0dy5wdXNoKFt4LCBqXSk7IFxuXHR9XG5cdFxuXHR2YXIgdyA9IFtdOyB3YWxscy5wdXNoKHcpOyAvKiBib3R0b20gcGFydCAqL1xuXHRmb3IgKHZhciBqPXkrMTsgajw9cm9vbVszXTsgaisrKSB7IFxuXHRcdHRoaXMuX21hcFt4XVtqXSA9IDE7XG5cdFx0dy5wdXNoKFt4LCBqXSk7IFxuXHR9XG5cdFx0XG5cdHZhciBzb2xpZCA9IHdhbGxzLnJhbmRvbSgpO1xuXHRmb3IgKHZhciBpPTA7aTx3YWxscy5sZW5ndGg7aSsrKSB7XG5cdFx0dmFyIHcgPSB3YWxsc1tpXTtcblx0XHRpZiAodyA9PSBzb2xpZCkgeyBjb250aW51ZTsgfVxuXHRcdFxuXHRcdHZhciBob2xlID0gdy5yYW5kb20oKTtcblx0XHR0aGlzLl9tYXBbaG9sZVswXV1baG9sZVsxXV0gPSAwO1xuXHR9XG5cblx0dGhpcy5fc3RhY2sucHVzaChbcm9vbVswXSwgcm9vbVsxXSwgeC0xLCB5LTFdKTsgLyogbGVmdCB0b3AgKi9cblx0dGhpcy5fc3RhY2sucHVzaChbeCsxLCByb29tWzFdLCByb29tWzJdLCB5LTFdKTsgLyogcmlnaHQgdG9wICovXG5cdHRoaXMuX3N0YWNrLnB1c2goW3Jvb21bMF0sIHkrMSwgeC0xLCByb29tWzNdXSk7IC8qIGxlZnQgYm90dG9tICovXG5cdHRoaXMuX3N0YWNrLnB1c2goW3grMSwgeSsxLCByb29tWzJdLCByb29tWzNdXSk7IC8qIHJpZ2h0IGJvdHRvbSAqL1xufVxuLyoqXG4gKiBAY2xhc3MgSWNleSdzIE1hemUgZ2VuZXJhdG9yXG4gKiBTZWUgaHR0cDovL3d3dy5yb2d1ZWJhc2luLnJvZ3VlbGlrZWRldmVsb3BtZW50Lm9yZy9pbmRleC5waHA/dGl0bGU9U2ltcGxlX21hemUgZm9yIGV4cGxhbmF0aW9uXG4gKiBAYXVnbWVudHMgUk9ULk1hcFxuICovXG5ST1QuTWFwLkljZXlNYXplID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCwgcmVndWxhcml0eSkge1xuXHRST1QuTWFwLmNhbGwodGhpcywgd2lkdGgsIGhlaWdodCk7XG5cdHRoaXMuX3JlZ3VsYXJpdHkgPSByZWd1bGFyaXR5IHx8IDA7XG59XG5ST1QuTWFwLkljZXlNYXplLmV4dGVuZChST1QuTWFwKTtcblxuUk9ULk1hcC5JY2V5TWF6ZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0dmFyIHdpZHRoID0gdGhpcy5fd2lkdGg7XG5cdHZhciBoZWlnaHQgPSB0aGlzLl9oZWlnaHQ7XG5cdFxuXHR2YXIgbWFwID0gdGhpcy5fZmlsbE1hcCgxKTtcblx0XG5cdHdpZHRoIC09ICh3aWR0aCAlIDIgPyAxIDogMik7XG5cdGhlaWdodCAtPSAoaGVpZ2h0ICUgMiA/IDEgOiAyKTtcblxuXHR2YXIgY3ggPSAwO1xuXHR2YXIgY3kgPSAwO1xuXHR2YXIgbnggPSAwO1xuXHR2YXIgbnkgPSAwO1xuXG5cdHZhciBkb25lID0gMDtcblx0dmFyIGJsb2NrZWQgPSBmYWxzZTtcblx0dmFyIGRpcnMgPSBbXG5cdFx0WzAsIDBdLFxuXHRcdFswLCAwXSxcblx0XHRbMCwgMF0sXG5cdFx0WzAsIDBdXG5cdF07XG5cdGRvIHtcblx0XHRjeCA9IDEgKyAyKk1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkqKHdpZHRoLTEpIC8gMik7XG5cdFx0Y3kgPSAxICsgMipNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpKihoZWlnaHQtMSkgLyAyKTtcblxuXHRcdGlmICghZG9uZSkgeyBtYXBbY3hdW2N5XSA9IDA7IH1cblx0XHRcblx0XHRpZiAoIW1hcFtjeF1bY3ldKSB7XG5cdFx0XHR0aGlzLl9yYW5kb21pemUoZGlycyk7XG5cdFx0XHRkbyB7XG5cdFx0XHRcdGlmIChNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpKih0aGlzLl9yZWd1bGFyaXR5KzEpKSA9PSAwKSB7IHRoaXMuX3JhbmRvbWl6ZShkaXJzKTsgfVxuXHRcdFx0XHRibG9ja2VkID0gdHJ1ZTtcblx0XHRcdFx0Zm9yICh2YXIgaT0wO2k8NDtpKyspIHtcblx0XHRcdFx0XHRueCA9IGN4ICsgZGlyc1tpXVswXSoyO1xuXHRcdFx0XHRcdG55ID0gY3kgKyBkaXJzW2ldWzFdKjI7XG5cdFx0XHRcdFx0aWYgKHRoaXMuX2lzRnJlZShtYXAsIG54LCBueSwgd2lkdGgsIGhlaWdodCkpIHtcblx0XHRcdFx0XHRcdG1hcFtueF1bbnldID0gMDtcblx0XHRcdFx0XHRcdG1hcFtjeCArIGRpcnNbaV1bMF1dW2N5ICsgZGlyc1tpXVsxXV0gPSAwO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRjeCA9IG54O1xuXHRcdFx0XHRcdFx0Y3kgPSBueTtcblx0XHRcdFx0XHRcdGJsb2NrZWQgPSBmYWxzZTtcblx0XHRcdFx0XHRcdGRvbmUrKztcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSB3aGlsZSAoIWJsb2NrZWQpO1xuXHRcdH1cblx0fSB3aGlsZSAoZG9uZSsxIDwgd2lkdGgqaGVpZ2h0LzQpO1xuXHRcblx0Zm9yICh2YXIgaT0wO2k8dGhpcy5fd2lkdGg7aSsrKSB7XG5cdFx0Zm9yICh2YXIgaj0wO2o8dGhpcy5faGVpZ2h0O2orKykge1xuXHRcdFx0Y2FsbGJhY2soaSwgaiwgbWFwW2ldW2pdKTtcblx0XHR9XG5cdH1cblx0dGhpcy5fbWFwID0gbnVsbDtcblx0cmV0dXJuIHRoaXM7XG59XG5cblJPVC5NYXAuSWNleU1hemUucHJvdG90eXBlLl9yYW5kb21pemUgPSBmdW5jdGlvbihkaXJzKSB7XG5cdGZvciAodmFyIGk9MDtpPDQ7aSsrKSB7XG5cdFx0ZGlyc1tpXVswXSA9IDA7XG5cdFx0ZGlyc1tpXVsxXSA9IDA7XG5cdH1cblx0XG5cdHN3aXRjaCAoTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSo0KSkge1xuXHRcdGNhc2UgMDpcblx0XHRcdGRpcnNbMF1bMF0gPSAtMTsgZGlyc1sxXVswXSA9IDE7XG5cdFx0XHRkaXJzWzJdWzFdID0gLTE7IGRpcnNbM11bMV0gPSAxO1xuXHRcdGJyZWFrO1xuXHRcdGNhc2UgMTpcblx0XHRcdGRpcnNbM11bMF0gPSAtMTsgZGlyc1syXVswXSA9IDE7XG5cdFx0XHRkaXJzWzFdWzFdID0gLTE7IGRpcnNbMF1bMV0gPSAxO1xuXHRcdGJyZWFrO1xuXHRcdGNhc2UgMjpcblx0XHRcdGRpcnNbMl1bMF0gPSAtMTsgZGlyc1szXVswXSA9IDE7XG5cdFx0XHRkaXJzWzBdWzFdID0gLTE7IGRpcnNbMV1bMV0gPSAxO1xuXHRcdGJyZWFrO1xuXHRcdGNhc2UgMzpcblx0XHRcdGRpcnNbMV1bMF0gPSAtMTsgZGlyc1swXVswXSA9IDE7XG5cdFx0XHRkaXJzWzNdWzFdID0gLTE7IGRpcnNbMl1bMV0gPSAxO1xuXHRcdGJyZWFrO1xuXHR9XG59XG5cblJPVC5NYXAuSWNleU1hemUucHJvdG90eXBlLl9pc0ZyZWUgPSBmdW5jdGlvbihtYXAsIHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcblx0aWYgKHggPCAxIHx8IHkgPCAxIHx8IHggPj0gd2lkdGggfHwgeSA+PSBoZWlnaHQpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdHJldHVybiBtYXBbeF1beV07XG59XG4vKipcbiAqIEBjbGFzcyBNYXplIGdlbmVyYXRvciAtIEVsbGVyJ3MgYWxnb3JpdGhtXG4gKiBTZWUgaHR0cDovL2hvbWVwYWdlcy5jd2kubmwvfnRyb21wL21hemUuaHRtbCBmb3IgZXhwbGFuYXRpb25cbiAqIEBhdWdtZW50cyBST1QuTWFwXG4gKi9cblJPVC5NYXAuRWxsZXJNYXplID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuXHRST1QuTWFwLmNhbGwodGhpcywgd2lkdGgsIGhlaWdodCk7XG59XG5ST1QuTWFwLkVsbGVyTWF6ZS5leHRlbmQoUk9ULk1hcCk7XG5cblJPVC5NYXAuRWxsZXJNYXplLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHR2YXIgbWFwID0gdGhpcy5fZmlsbE1hcCgxKTtcblx0dmFyIHcgPSBNYXRoLmNlaWwoKHRoaXMuX3dpZHRoLTIpLzIpO1xuXHRcblx0dmFyIHJhbmQgPSA5LzI0O1xuXHRcblx0dmFyIEwgPSBbXTtcblx0dmFyIFIgPSBbXTtcblx0XG5cdGZvciAodmFyIGk9MDtpPHc7aSsrKSB7XG5cdFx0TC5wdXNoKGkpO1xuXHRcdFIucHVzaChpKTtcblx0fVxuXHRMLnB1c2gody0xKTsgLyogZmFrZSBzdG9wLWJsb2NrIGF0IHRoZSByaWdodCBzaWRlICovXG5cblx0Zm9yICh2YXIgaj0xO2orMzx0aGlzLl9oZWlnaHQ7ais9Mikge1xuXHRcdC8qIG9uZSByb3cgKi9cblx0XHRmb3IgKHZhciBpPTA7aTx3O2krKykge1xuXHRcdFx0LyogY2VsbCBjb29yZHMgKHdpbGwgYmUgYWx3YXlzIGVtcHR5KSAqL1xuXHRcdFx0dmFyIHggPSAyKmkrMTtcblx0XHRcdHZhciB5ID0gajtcblx0XHRcdG1hcFt4XVt5XSA9IDA7XG5cdFx0XHRcblx0XHRcdC8qIHJpZ2h0IGNvbm5lY3Rpb24gKi9cblx0XHRcdGlmIChpICE9IExbaSsxXSAmJiBST1QuUk5HLmdldFVuaWZvcm0oKSA+IHJhbmQpIHtcblx0XHRcdFx0dGhpcy5fYWRkVG9MaXN0KGksIEwsIFIpO1xuXHRcdFx0XHRtYXBbeCsxXVt5XSA9IDA7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8qIGJvdHRvbSBjb25uZWN0aW9uICovXG5cdFx0XHRpZiAoaSAhPSBMW2ldICYmIFJPVC5STkcuZ2V0VW5pZm9ybSgpID4gcmFuZCkge1xuXHRcdFx0XHQvKiByZW1vdmUgY29ubmVjdGlvbiAqL1xuXHRcdFx0XHR0aGlzLl9yZW1vdmVGcm9tTGlzdChpLCBMLCBSKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8qIGNyZWF0ZSBjb25uZWN0aW9uICovXG5cdFx0XHRcdG1hcFt4XVt5KzFdID0gMDtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKiBsYXN0IHJvdyAqL1xuXHRmb3IgKHZhciBpPTA7aTx3O2krKykge1xuXHRcdC8qIGNlbGwgY29vcmRzICh3aWxsIGJlIGFsd2F5cyBlbXB0eSkgKi9cblx0XHR2YXIgeCA9IDIqaSsxO1xuXHRcdHZhciB5ID0gajtcblx0XHRtYXBbeF1beV0gPSAwO1xuXHRcdFxuXHRcdC8qIHJpZ2h0IGNvbm5lY3Rpb24gKi9cblx0XHRpZiAoaSAhPSBMW2krMV0gJiYgKGkgPT0gTFtpXSB8fCBST1QuUk5HLmdldFVuaWZvcm0oKSA+IHJhbmQpKSB7XG5cdFx0XHQvKiBkaWcgcmlnaHQgYWxzbyBpZiB0aGUgY2VsbCBpcyBzZXBhcmF0ZWQsIHNvIGl0IGdldHMgY29ubmVjdGVkIHRvIHRoZSByZXN0IG9mIG1hemUgKi9cblx0XHRcdHRoaXMuX2FkZFRvTGlzdChpLCBMLCBSKTtcblx0XHRcdG1hcFt4KzFdW3ldID0gMDtcblx0XHR9XG5cdFx0XG5cdFx0dGhpcy5fcmVtb3ZlRnJvbUxpc3QoaSwgTCwgUik7XG5cdH1cblx0XG5cdGZvciAodmFyIGk9MDtpPHRoaXMuX3dpZHRoO2krKykge1xuXHRcdGZvciAodmFyIGo9MDtqPHRoaXMuX2hlaWdodDtqKyspIHtcblx0XHRcdGNhbGxiYWNrKGksIGosIG1hcFtpXVtqXSk7XG5cdFx0fVxuXHR9XG5cdFxuXHRyZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBSZW1vdmUgXCJpXCIgZnJvbSBpdHMgbGlzdFxuICovXG5ST1QuTWFwLkVsbGVyTWF6ZS5wcm90b3R5cGUuX3JlbW92ZUZyb21MaXN0ID0gZnVuY3Rpb24oaSwgTCwgUikge1xuXHRSW0xbaV1dID0gUltpXTtcblx0TFtSW2ldXSA9IExbaV07XG5cdFJbaV0gPSBpO1xuXHRMW2ldID0gaTtcbn1cblxuLyoqXG4gKiBKb2luIGxpc3RzIHdpdGggXCJpXCIgYW5kIFwiaSsxXCJcbiAqL1xuUk9ULk1hcC5FbGxlck1hemUucHJvdG90eXBlLl9hZGRUb0xpc3QgPSBmdW5jdGlvbihpLCBMLCBSKSB7XG5cdFJbTFtpKzFdXSA9IFJbaV07XG5cdExbUltpXV0gPSBMW2krMV07XG5cdFJbaV0gPSBpKzE7XG5cdExbaSsxXSA9IGk7XG59XG4vKipcbiAqIEBjbGFzcyBDZWxsdWxhciBhdXRvbWF0b24gbWFwIGdlbmVyYXRvclxuICogQGF1Z21lbnRzIFJPVC5NYXBcbiAqIEBwYXJhbSB7aW50fSBbd2lkdGg9Uk9ULkRFRkFVTFRfV0lEVEhdXG4gKiBAcGFyYW0ge2ludH0gW2hlaWdodD1ST1QuREVGQVVMVF9IRUlHSFRdXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdIE9wdGlvbnNcbiAqIEBwYXJhbSB7aW50W119IFtvcHRpb25zLmJvcm5dIExpc3Qgb2YgbmVpZ2hib3IgY291bnRzIGZvciBhIG5ldyBjZWxsIHRvIGJlIGJvcm4gaW4gZW1wdHkgc3BhY2VcbiAqIEBwYXJhbSB7aW50W119IFtvcHRpb25zLnN1cnZpdmVdIExpc3Qgb2YgbmVpZ2hib3IgY291bnRzIGZvciBhbiBleGlzdGluZyAgY2VsbCB0byBzdXJ2aXZlXG4gKiBAcGFyYW0ge2ludH0gW29wdGlvbnMudG9wb2xvZ3ldIFRvcG9sb2d5IDQgb3IgNiBvciA4XG4gKi9cblJPVC5NYXAuQ2VsbHVsYXIgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0LCBvcHRpb25zKSB7XG5cdFJPVC5NYXAuY2FsbCh0aGlzLCB3aWR0aCwgaGVpZ2h0KTtcblx0dGhpcy5fb3B0aW9ucyA9IHtcblx0XHRib3JuOiBbNSwgNiwgNywgOF0sXG5cdFx0c3Vydml2ZTogWzQsIDUsIDYsIDcsIDhdLFxuXHRcdHRvcG9sb2d5OiA4XG5cdH07XG5cdHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcblx0XG5cdHRoaXMuX2RpcnMgPSBST1QuRElSU1t0aGlzLl9vcHRpb25zLnRvcG9sb2d5XTtcblx0dGhpcy5fbWFwID0gdGhpcy5fZmlsbE1hcCgwKTtcbn1cblJPVC5NYXAuQ2VsbHVsYXIuZXh0ZW5kKFJPVC5NYXApO1xuXG4vKipcbiAqIEZpbGwgdGhlIG1hcCB3aXRoIHJhbmRvbSB2YWx1ZXNcbiAqIEBwYXJhbSB7ZmxvYXR9IHByb2JhYmlsaXR5IFByb2JhYmlsaXR5IGZvciBhIGNlbGwgdG8gYmVjb21lIGFsaXZlOyAwID0gYWxsIGVtcHR5LCAxID0gYWxsIGZ1bGxcbiAqL1xuUk9ULk1hcC5DZWxsdWxhci5wcm90b3R5cGUucmFuZG9taXplID0gZnVuY3Rpb24ocHJvYmFiaWxpdHkpIHtcblx0Zm9yICh2YXIgaT0wO2k8dGhpcy5fd2lkdGg7aSsrKSB7XG5cdFx0Zm9yICh2YXIgaj0wO2o8dGhpcy5faGVpZ2h0O2orKykge1xuXHRcdFx0dGhpcy5fbWFwW2ldW2pdID0gKFJPVC5STkcuZ2V0VW5pZm9ybSgpIDwgcHJvYmFiaWxpdHkgPyAxIDogMCk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIENoYW5nZSBvcHRpb25zLlxuICogQHNlZSBST1QuTWFwLkNlbGx1bGFyXG4gKi9cblJPVC5NYXAuQ2VsbHVsYXIucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cdGZvciAodmFyIHAgaW4gb3B0aW9ucykgeyB0aGlzLl9vcHRpb25zW3BdID0gb3B0aW9uc1twXTsgfVxufVxuXG5ST1QuTWFwLkNlbGx1bGFyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbih4LCB5LCB2YWx1ZSkge1xuXHR0aGlzLl9tYXBbeF1beV0gPSB2YWx1ZTtcbn1cblxuUk9ULk1hcC5DZWxsdWxhci5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0dmFyIG5ld01hcCA9IHRoaXMuX2ZpbGxNYXAoMCk7XG5cdHZhciBib3JuID0gdGhpcy5fb3B0aW9ucy5ib3JuO1xuXHR2YXIgc3Vydml2ZSA9IHRoaXMuX29wdGlvbnMuc3Vydml2ZTtcblxuXG5cdGZvciAodmFyIGo9MDtqPHRoaXMuX2hlaWdodDtqKyspIHtcblx0XHR2YXIgd2lkdGhTdGVwID0gMTtcblx0XHR2YXIgd2lkdGhTdGFydCA9IDA7XG5cdFx0aWYgKHRoaXMuX29wdGlvbnMudG9wb2xvZ3kgPT0gNikgeyBcblx0XHRcdHdpZHRoU3RlcCA9IDI7XG5cdFx0XHR3aWR0aFN0YXJ0ID0gaiUyO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIGk9d2lkdGhTdGFydDsgaTx0aGlzLl93aWR0aDsgaSs9d2lkdGhTdGVwKSB7XG5cblx0XHRcdHZhciBjdXIgPSB0aGlzLl9tYXBbaV1bal07XG5cdFx0XHR2YXIgbmNvdW50ID0gdGhpcy5fZ2V0TmVpZ2hib3JzKGksIGopO1xuXHRcdFx0XG5cdFx0XHRpZiAoY3VyICYmIHN1cnZpdmUuaW5kZXhPZihuY291bnQpICE9IC0xKSB7IC8qIHN1cnZpdmUgKi9cblx0XHRcdFx0bmV3TWFwW2ldW2pdID0gMTtcblx0XHRcdH0gZWxzZSBpZiAoIWN1ciAmJiBib3JuLmluZGV4T2YobmNvdW50KSAhPSAtMSkgeyAvKiBib3JuICovXG5cdFx0XHRcdG5ld01hcFtpXVtqXSA9IDE7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGlmIChjYWxsYmFjaykgeyBjYWxsYmFjayhpLCBqLCBuZXdNYXBbaV1bal0pOyB9XG5cdFx0fVxuXHR9XG5cdFxuXHR0aGlzLl9tYXAgPSBuZXdNYXA7XG59XG5cbi8qKlxuICogR2V0IG5laWdoYm9yIGNvdW50IGF0IFtpLGpdIGluIHRoaXMuX21hcFxuICovXG5ST1QuTWFwLkNlbGx1bGFyLnByb3RvdHlwZS5fZ2V0TmVpZ2hib3JzID0gZnVuY3Rpb24oY3gsIGN5KSB7XG5cdHZhciByZXN1bHQgPSAwO1xuXHRmb3IgKHZhciBpPTA7aTx0aGlzLl9kaXJzLmxlbmd0aDtpKyspIHtcblx0XHR2YXIgZGlyID0gdGhpcy5fZGlyc1tpXTtcblx0XHR2YXIgeCA9IGN4ICsgZGlyWzBdO1xuXHRcdHZhciB5ID0gY3kgKyBkaXJbMV07XG5cdFx0XG5cdFx0aWYgKHggPCAwIHx8IHggPj0gdGhpcy5fd2lkdGggfHwgeCA8IDAgfHwgeSA+PSB0aGlzLl93aWR0aCkgeyBjb250aW51ZTsgfVxuXHRcdHJlc3VsdCArPSAodGhpcy5fbWFwW3hdW3ldID09IDEgPyAxIDogMCk7XG5cdH1cblx0XG5cdHJldHVybiByZXN1bHQ7XG59XG4vKipcbiAqIEBjbGFzcyBEdW5nZW9uIG1hcDogaGFzIHJvb21zIGFuZCBjb3JyaWRvcnNcbiAqIEBhdWdtZW50cyBST1QuTWFwXG4gKi9cblJPVC5NYXAuRHVuZ2VvbiA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcblx0Uk9ULk1hcC5jYWxsKHRoaXMsIHdpZHRoLCBoZWlnaHQpO1xuXHR0aGlzLl9yb29tcyA9IFtdOyAvKiBsaXN0IG9mIGFsbCByb29tcyAqL1xuXHR0aGlzLl9jb3JyaWRvcnMgPSBbXTtcbn1cblJPVC5NYXAuRHVuZ2Vvbi5leHRlbmQoUk9ULk1hcCk7XG5cbi8qKlxuICogR2V0IGFsbCBnZW5lcmF0ZWQgcm9vbXNcbiAqIEByZXR1cm5zIHtST1QuTWFwLkZlYXR1cmUuUm9vbVtdfVxuICovXG5ST1QuTWFwLkR1bmdlb24ucHJvdG90eXBlLmdldFJvb21zID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLl9yb29tcztcbn1cblxuLyoqXG4gKiBHZXQgYWxsIGdlbmVyYXRlZCBjb3JyaWRvcnNcbiAqIEByZXR1cm5zIHtST1QuTWFwLkZlYXR1cmUuQ29ycmlkb3JbXX1cbiAqL1xuUk9ULk1hcC5EdW5nZW9uLnByb3RvdHlwZS5nZXRDb3JyaWRvcnMgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuX2NvcnJpZG9ycztcbn1cbi8qKlxuICogQGNsYXNzIFJhbmRvbSBkdW5nZW9uIGdlbmVyYXRvciB1c2luZyBodW1hbi1saWtlIGRpZ2dpbmcgcGF0dGVybnMuXG4gKiBIZWF2aWx5IGJhc2VkIG9uIE1pa2UgQW5kZXJzb24ncyBpZGVhcyBmcm9tIHRoZSBcIlR5cmFudFwiIGFsZ28sIG1lbnRpb25lZCBhdCBcbiAqIGh0dHA6Ly93d3cucm9ndWViYXNpbi5yb2d1ZWxpa2VkZXZlbG9wbWVudC5vcmcvaW5kZXgucGhwP3RpdGxlPUR1bmdlb24tQnVpbGRpbmdfQWxnb3JpdGhtLlxuICogQGF1Z21lbnRzIFJPVC5NYXAuRHVuZ2VvblxuICovXG5ST1QuTWFwLkRpZ2dlciA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQsIG9wdGlvbnMpIHtcblx0Uk9ULk1hcC5EdW5nZW9uLmNhbGwodGhpcywgd2lkdGgsIGhlaWdodCk7XG5cdFxuXHR0aGlzLl9vcHRpb25zID0ge1xuXHRcdHJvb21XaWR0aDogWzMsIDldLCAvKiByb29tIG1pbmltdW0gYW5kIG1heGltdW0gd2lkdGggKi9cblx0XHRyb29tSGVpZ2h0OiBbMywgNV0sIC8qIHJvb20gbWluaW11bSBhbmQgbWF4aW11bSBoZWlnaHQgKi9cblx0XHRjb3JyaWRvckxlbmd0aDogWzUsIDEwXSwgLyogY29ycmlkb3IgbWluaW11bSBhbmQgbWF4aW11bSBsZW5ndGggKi9cblx0XHRkdWdQZXJjZW50YWdlOiAwLjIsIC8qIHdlIHN0b3AgYWZ0ZXIgdGhpcyBwZXJjZW50YWdlIG9mIGxldmVsIGFyZWEgaGFzIGJlZW4gZHVnIG91dCAqL1xuXHRcdHRpbWVMaW1pdDogMTAwMCAvKiB3ZSBzdG9wIGFmdGVyIHRoaXMgbXVjaCB0aW1lIGhhcyBwYXNzZWQgKG1zZWMpICovXG5cdH1cblx0Zm9yICh2YXIgcCBpbiBvcHRpb25zKSB7IHRoaXMuX29wdGlvbnNbcF0gPSBvcHRpb25zW3BdOyB9XG5cdFxuXHR0aGlzLl9mZWF0dXJlcyA9IHtcblx0XHRcIlJvb21cIjogNCxcblx0XHRcIkNvcnJpZG9yXCI6IDRcblx0fVxuXHR0aGlzLl9mZWF0dXJlQXR0ZW1wdHMgPSAyMDsgLyogaG93IG1hbnkgdGltZXMgZG8gd2UgdHJ5IHRvIGNyZWF0ZSBhIGZlYXR1cmUgb24gYSBzdWl0YWJsZSB3YWxsICovXG5cdHRoaXMuX3dhbGxzID0ge307IC8qIHRoZXNlIGFyZSBhdmFpbGFibGUgZm9yIGRpZ2dpbmcgKi9cblx0XG5cdHRoaXMuX2RpZ0NhbGxiYWNrID0gdGhpcy5fZGlnQ2FsbGJhY2suYmluZCh0aGlzKTtcblx0dGhpcy5fY2FuQmVEdWdDYWxsYmFjayA9IHRoaXMuX2NhbkJlRHVnQ2FsbGJhY2suYmluZCh0aGlzKTtcblx0dGhpcy5faXNXYWxsQ2FsbGJhY2sgPSB0aGlzLl9pc1dhbGxDYWxsYmFjay5iaW5kKHRoaXMpO1xuXHR0aGlzLl9wcmlvcml0eVdhbGxDYWxsYmFjayA9IHRoaXMuX3ByaW9yaXR5V2FsbENhbGxiYWNrLmJpbmQodGhpcyk7XG59XG5ST1QuTWFwLkRpZ2dlci5leHRlbmQoUk9ULk1hcC5EdW5nZW9uKTtcblxuLyoqXG4gKiBDcmVhdGUgYSBtYXBcbiAqIEBzZWUgUk9ULk1hcCNjcmVhdGVcbiAqL1xuUk9ULk1hcC5EaWdnZXIucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdHRoaXMuX3Jvb21zID0gW107XG5cdHRoaXMuX2NvcnJpZG9ycyA9IFtdO1xuXHR0aGlzLl9tYXAgPSB0aGlzLl9maWxsTWFwKDEpO1xuXHR0aGlzLl93YWxscyA9IHt9O1xuXHR0aGlzLl9kdWcgPSAwO1xuXHR2YXIgYXJlYSA9ICh0aGlzLl93aWR0aC0yKSAqICh0aGlzLl9oZWlnaHQtMik7XG5cblx0dGhpcy5fZmlyc3RSb29tKCk7XG5cdFxuXHR2YXIgdDEgPSBEYXRlLm5vdygpO1xuXG5cdGRvIHtcblx0XHR2YXIgdDIgPSBEYXRlLm5vdygpO1xuXHRcdGlmICh0MiAtIHQxID4gdGhpcy5fb3B0aW9ucy50aW1lTGltaXQpIHsgYnJlYWs7IH1cblxuXHRcdC8qIGZpbmQgYSBnb29kIHdhbGwgKi9cblx0XHR2YXIgd2FsbCA9IHRoaXMuX2ZpbmRXYWxsKCk7XG5cdFx0aWYgKCF3YWxsKSB7IGJyZWFrOyB9IC8qIG5vIG1vcmUgd2FsbHMgKi9cblx0XHRcblx0XHR2YXIgcGFydHMgPSB3YWxsLnNwbGl0KFwiLFwiKTtcblx0XHR2YXIgeCA9IHBhcnNlSW50KHBhcnRzWzBdKTtcblx0XHR2YXIgeSA9IHBhcnNlSW50KHBhcnRzWzFdKTtcblx0XHR2YXIgZGlyID0gdGhpcy5fZ2V0RGlnZ2luZ0RpcmVjdGlvbih4LCB5KTtcblx0XHRpZiAoIWRpcikgeyBjb250aW51ZTsgfSAvKiB0aGlzIHdhbGwgaXMgbm90IHN1aXRhYmxlICovXG5cdFx0XG4vL1x0XHRjb25zb2xlLmxvZyhcIndhbGxcIiwgeCwgeSk7XG5cblx0XHQvKiB0cnkgYWRkaW5nIGEgZmVhdHVyZSAqL1xuXHRcdHZhciBmZWF0dXJlQXR0ZW1wdHMgPSAwO1xuXHRcdGRvIHtcblx0XHRcdGZlYXR1cmVBdHRlbXB0cysrO1xuXHRcdFx0aWYgKHRoaXMuX3RyeUZlYXR1cmUoeCwgeSwgZGlyWzBdLCBkaXJbMV0pKSB7IC8qIGZlYXR1cmUgYWRkZWQgKi9cblx0XHRcdFx0Ly9pZiAodGhpcy5fcm9vbXMubGVuZ3RoICsgdGhpcy5fY29ycmlkb3JzLmxlbmd0aCA9PSAyKSB7IHRoaXMuX3Jvb21zWzBdLmFkZERvb3IoeCwgeSk7IH0gLyogZmlyc3Qgcm9vbSBvZmljaWFsbHkgaGFzIGRvb3JzICovXG5cdFx0XHRcdHRoaXMuX3JlbW92ZVN1cnJvdW5kaW5nV2FsbHMoeCwgeSk7XG5cdFx0XHRcdHRoaXMuX3JlbW92ZVN1cnJvdW5kaW5nV2FsbHMoeC1kaXJbMF0sIHktZGlyWzFdKTtcblx0XHRcdFx0YnJlYWs7IFxuXHRcdFx0fVxuXHRcdH0gd2hpbGUgKGZlYXR1cmVBdHRlbXB0cyA8IHRoaXMuX2ZlYXR1cmVBdHRlbXB0cyk7XG5cdFx0XG5cdFx0dmFyIHByaW9yaXR5V2FsbHMgPSAwO1xuXHRcdGZvciAodmFyIGlkIGluIHRoaXMuX3dhbGxzKSB7IFxuXHRcdFx0aWYgKHRoaXMuX3dhbGxzW2lkXSA+IDEpIHsgcHJpb3JpdHlXYWxscysrOyB9XG5cdFx0fVxuXG5cdH0gd2hpbGUgKHRoaXMuX2R1Zy9hcmVhIDwgdGhpcy5fb3B0aW9ucy5kdWdQZXJjZW50YWdlIHx8IHByaW9yaXR5V2FsbHMpOyAvKiBmaXhtZSBudW1iZXIgb2YgcHJpb3JpdHkgd2FsbHMgKi9cblxuXHR0aGlzLl9hZGREb29ycygpO1xuXG5cdGlmIChjYWxsYmFjaykge1xuXHRcdGZvciAodmFyIGk9MDtpPHRoaXMuX3dpZHRoO2krKykge1xuXHRcdFx0Zm9yICh2YXIgaj0wO2o8dGhpcy5faGVpZ2h0O2orKykge1xuXHRcdFx0XHRjYWxsYmFjayhpLCBqLCB0aGlzLl9tYXBbaV1bal0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRcblx0dGhpcy5fd2FsbHMgPSB7fTtcblx0dGhpcy5fbWFwID0gbnVsbDtcblxuXHRyZXR1cm4gdGhpcztcbn1cblxuUk9ULk1hcC5EaWdnZXIucHJvdG90eXBlLl9kaWdDYWxsYmFjayA9IGZ1bmN0aW9uKHgsIHksIHZhbHVlKSB7XG5cdGlmICh2YWx1ZSA9PSAwIHx8IHZhbHVlID09IDIpIHsgLyogZW1wdHkgKi9cblx0XHR0aGlzLl9tYXBbeF1beV0gPSAwO1xuXHRcdHRoaXMuX2R1ZysrO1xuXHR9IGVsc2UgeyAvKiB3YWxsICovXG5cdFx0dGhpcy5fd2FsbHNbeCtcIixcIit5XSA9IDE7XG5cdH1cbn1cblxuUk9ULk1hcC5EaWdnZXIucHJvdG90eXBlLl9pc1dhbGxDYWxsYmFjayA9IGZ1bmN0aW9uKHgsIHkpIHtcblx0aWYgKHggPCAwIHx8IHkgPCAwIHx8IHggPj0gdGhpcy5fd2lkdGggfHwgeSA+PSB0aGlzLl9oZWlnaHQpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdHJldHVybiAodGhpcy5fbWFwW3hdW3ldID09IDEpO1xufVxuXG5ST1QuTWFwLkRpZ2dlci5wcm90b3R5cGUuX2NhbkJlRHVnQ2FsbGJhY2sgPSBmdW5jdGlvbih4LCB5KSB7XG5cdGlmICh4IDwgMSB8fCB5IDwgMSB8fCB4KzEgPj0gdGhpcy5fd2lkdGggfHwgeSsxID49IHRoaXMuX2hlaWdodCkgeyByZXR1cm4gZmFsc2U7IH1cblx0cmV0dXJuICh0aGlzLl9tYXBbeF1beV0gPT0gMSk7XG59XG5cblJPVC5NYXAuRGlnZ2VyLnByb3RvdHlwZS5fcHJpb3JpdHlXYWxsQ2FsbGJhY2sgPSBmdW5jdGlvbih4LCB5KSB7XG5cdHRoaXMuX3dhbGxzW3grXCIsXCIreV0gPSAyO1xufVxuXG5ST1QuTWFwLkRpZ2dlci5wcm90b3R5cGUuX2ZpcnN0Um9vbSA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgY3ggPSBNYXRoLmZsb29yKHRoaXMuX3dpZHRoLzIpO1xuXHR2YXIgY3kgPSBNYXRoLmZsb29yKHRoaXMuX2hlaWdodC8yKTtcblx0dmFyIHJvb20gPSBST1QuTWFwLkZlYXR1cmUuUm9vbS5jcmVhdGVSYW5kb21DZW50ZXIoY3gsIGN5LCB0aGlzLl9vcHRpb25zKTtcblx0dGhpcy5fcm9vbXMucHVzaChyb29tKTtcblx0cm9vbS5jcmVhdGUodGhpcy5fZGlnQ2FsbGJhY2spO1xufVxuXG4vKipcbiAqIEdldCBhIHN1aXRhYmxlIHdhbGxcbiAqL1xuUk9ULk1hcC5EaWdnZXIucHJvdG90eXBlLl9maW5kV2FsbCA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgcHJpbzEgPSBbXTtcblx0dmFyIHByaW8yID0gW107XG5cdGZvciAodmFyIGlkIGluIHRoaXMuX3dhbGxzKSB7XG5cdFx0dmFyIHByaW8gPSB0aGlzLl93YWxsc1tpZF07XG5cdFx0aWYgKHByaW8gPT0gMikgeyBcblx0XHRcdHByaW8yLnB1c2goaWQpOyBcblx0XHR9IGVsc2Uge1xuXHRcdFx0cHJpbzEucHVzaChpZCk7XG5cdFx0fVxuXHR9XG5cdFxuXHR2YXIgYXJyID0gKHByaW8yLmxlbmd0aCA/IHByaW8yIDogcHJpbzEpO1xuXHRpZiAoIWFyci5sZW5ndGgpIHsgcmV0dXJuIG51bGw7IH0gLyogbm8gd2FsbHMgOi8gKi9cblx0XG5cdHZhciBpZCA9IGFyci5yYW5kb20oKTtcblx0ZGVsZXRlIHRoaXMuX3dhbGxzW2lkXTtcblxuXHRyZXR1cm4gaWQ7XG59XG5cbi8qKlxuICogVHJpZXMgYWRkaW5nIGEgZmVhdHVyZVxuICogQHJldHVybnMge2Jvb2x9IHdhcyB0aGlzIGEgc3VjY2Vzc2Z1bCB0cnk/XG4gKi9cblJPVC5NYXAuRGlnZ2VyLnByb3RvdHlwZS5fdHJ5RmVhdHVyZSA9IGZ1bmN0aW9uKHgsIHksIGR4LCBkeSkge1xuXHR2YXIgZmVhdHVyZSA9IFJPVC5STkcuZ2V0V2VpZ2h0ZWRWYWx1ZSh0aGlzLl9mZWF0dXJlcyk7XG5cdGZlYXR1cmUgPSBST1QuTWFwLkZlYXR1cmVbZmVhdHVyZV0uY3JlYXRlUmFuZG9tQXQoeCwgeSwgZHgsIGR5LCB0aGlzLl9vcHRpb25zKTtcblx0XG5cdGlmICghZmVhdHVyZS5pc1ZhbGlkKHRoaXMuX2lzV2FsbENhbGxiYWNrLCB0aGlzLl9jYW5CZUR1Z0NhbGxiYWNrKSkge1xuLy9cdFx0Y29uc29sZS5sb2coXCJub3QgdmFsaWRcIik7XG4vL1x0XHRmZWF0dXJlLmRlYnVnKCk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdFxuXHRmZWF0dXJlLmNyZWF0ZSh0aGlzLl9kaWdDYWxsYmFjayk7XG4vL1x0ZmVhdHVyZS5kZWJ1ZygpO1xuXG5cdGlmIChmZWF0dXJlIGluc3RhbmNlb2YgUk9ULk1hcC5GZWF0dXJlLlJvb20pIHsgdGhpcy5fcm9vbXMucHVzaChmZWF0dXJlKTsgfVxuXHRpZiAoZmVhdHVyZSBpbnN0YW5jZW9mIFJPVC5NYXAuRmVhdHVyZS5Db3JyaWRvcikgeyBcblx0XHRmZWF0dXJlLmNyZWF0ZVByaW9yaXR5V2FsbHModGhpcy5fcHJpb3JpdHlXYWxsQ2FsbGJhY2spO1xuXHRcdHRoaXMuX2NvcnJpZG9ycy5wdXNoKGZlYXR1cmUpOyBcblx0fVxuXHRcblx0cmV0dXJuIHRydWU7XG59XG5cblJPVC5NYXAuRGlnZ2VyLnByb3RvdHlwZS5fcmVtb3ZlU3Vycm91bmRpbmdXYWxscyA9IGZ1bmN0aW9uKGN4LCBjeSkge1xuXHR2YXIgZGVsdGFzID0gUk9ULkRJUlNbNF07XG5cblx0Zm9yICh2YXIgaT0wO2k8ZGVsdGFzLmxlbmd0aDtpKyspIHtcblx0XHR2YXIgZGVsdGEgPSBkZWx0YXNbaV07XG5cdFx0dmFyIHggPSBjeCArIGRlbHRhWzBdO1xuXHRcdHZhciB5ID0gY3kgKyBkZWx0YVsxXTtcblx0XHRkZWxldGUgdGhpcy5fd2FsbHNbeCtcIixcIit5XTtcblx0XHR2YXIgeCA9IGN4ICsgMipkZWx0YVswXTtcblx0XHR2YXIgeSA9IGN5ICsgMipkZWx0YVsxXTtcblx0XHRkZWxldGUgdGhpcy5fd2FsbHNbeCtcIixcIit5XTtcblx0fVxufVxuXG4vKipcbiAqIFJldHVybnMgdmVjdG9yIGluIFwiZGlnZ2luZ1wiIGRpcmVjdGlvbiwgb3IgZmFsc2UsIGlmIHRoaXMgZG9lcyBub3QgZXhpc3QgKG9yIGlzIG5vdCB1bmlxdWUpXG4gKi9cblJPVC5NYXAuRGlnZ2VyLnByb3RvdHlwZS5fZ2V0RGlnZ2luZ0RpcmVjdGlvbiA9IGZ1bmN0aW9uKGN4LCBjeSkge1xuXHR2YXIgcmVzdWx0ID0gbnVsbDtcblx0dmFyIGRlbHRhcyA9IFJPVC5ESVJTWzRdO1xuXHRcblx0Zm9yICh2YXIgaT0wO2k8ZGVsdGFzLmxlbmd0aDtpKyspIHtcblx0XHR2YXIgZGVsdGEgPSBkZWx0YXNbaV07XG5cdFx0dmFyIHggPSBjeCArIGRlbHRhWzBdO1xuXHRcdHZhciB5ID0gY3kgKyBkZWx0YVsxXTtcblx0XHRcblx0XHRpZiAoeCA8IDAgfHwgeSA8IDAgfHwgeCA+PSB0aGlzLl93aWR0aCB8fCB5ID49IHRoaXMuX3dpZHRoKSB7IHJldHVybiBudWxsOyB9XG5cdFx0XG5cdFx0aWYgKCF0aGlzLl9tYXBbeF1beV0pIHsgLyogdGhlcmUgYWxyZWFkeSBpcyBhbm90aGVyIGVtcHR5IG5laWdoYm9yISAqL1xuXHRcdFx0aWYgKHJlc3VsdCkgeyByZXR1cm4gbnVsbDsgfVxuXHRcdFx0cmVzdWx0ID0gZGVsdGE7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKiBubyBlbXB0eSBuZWlnaGJvciAqL1xuXHRpZiAoIXJlc3VsdCkgeyByZXR1cm4gbnVsbDsgfVxuXHRcblx0cmV0dXJuIFstcmVzdWx0WzBdLCAtcmVzdWx0WzFdXTtcbn1cblxuLyoqXG4gKiBGaW5kIGVtcHR5IHNwYWNlcyBzdXJyb3VuZGluZyByb29tcywgYW5kIGFwcGx5IGRvb3JzLlxuICovXG5ST1QuTWFwLkRpZ2dlci5wcm90b3R5cGUuX2FkZERvb3JzID0gZnVuY3Rpb24oKSB7XG5cdHZhciBkYXRhID0gdGhpcy5fbWFwO1xuXHR2YXIgaXNXYWxsQ2FsbGJhY2sgPSBmdW5jdGlvbih4LCB5KSB7XG5cdFx0cmV0dXJuIChkYXRhW3hdW3ldID09IDEpO1xuXHR9XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fcm9vbXMubGVuZ3RoOyBpKysgKSB7XG5cdFx0dmFyIHJvb20gPSB0aGlzLl9yb29tc1tpXTtcblx0XHRyb29tLmNsZWFyRG9vcnMoKTtcblx0XHRyb29tLmFkZERvb3JzKGlzV2FsbENhbGxiYWNrKTtcblx0fVxufVxuLyoqXG4gKiBAY2xhc3MgRHVuZ2VvbiBnZW5lcmF0b3Igd2hpY2ggdHJpZXMgdG8gZmlsbCB0aGUgc3BhY2UgZXZlbmx5LiBHZW5lcmF0ZXMgaW5kZXBlbmRlbnQgcm9vbXMgYW5kIHRyaWVzIHRvIGNvbm5lY3QgdGhlbS5cbiAqIEBhdWdtZW50cyBST1QuTWFwLkR1bmdlb25cbiAqL1xuUk9ULk1hcC5Vbmlmb3JtID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCwgb3B0aW9ucykge1xuXHRST1QuTWFwLkR1bmdlb24uY2FsbCh0aGlzLCB3aWR0aCwgaGVpZ2h0KTtcblxuXHR0aGlzLl9vcHRpb25zID0ge1xuXHRcdHJvb21XaWR0aDogWzMsIDldLCAvKiByb29tIG1pbmltdW0gYW5kIG1heGltdW0gd2lkdGggKi9cblx0XHRyb29tSGVpZ2h0OiBbMywgNV0sIC8qIHJvb20gbWluaW11bSBhbmQgbWF4aW11bSBoZWlnaHQgKi9cblx0XHRyb29tRHVnUGVyY2VudGFnZTogMC4xLCAvKiB3ZSBzdG9wIGFmdGVyIHRoaXMgcGVyY2VudGFnZSBvZiBsZXZlbCBhcmVhIGhhcyBiZWVuIGR1ZyBvdXQgYnkgcm9vbXMgKi9cblx0XHR0aW1lTGltaXQ6IDEwMDAgLyogd2Ugc3RvcCBhZnRlciB0aGlzIG11Y2ggdGltZSBoYXMgcGFzc2VkIChtc2VjKSAqL1xuXHR9XG5cdGZvciAodmFyIHAgaW4gb3B0aW9ucykgeyB0aGlzLl9vcHRpb25zW3BdID0gb3B0aW9uc1twXTsgfVxuXG5cdHRoaXMuX3Jvb21BdHRlbXB0cyA9IDIwOyAvKiBuZXcgcm9vbSBpcyBjcmVhdGVkIE4tdGltZXMgdW50aWwgaXMgY29uc2lkZXJlZCBhcyBpbXBvc3NpYmxlIHRvIGdlbmVyYXRlICovXG5cdHRoaXMuX2NvcnJpZG9yQXR0ZW1wdHMgPSAyMDsgLyogY29ycmlkb3JzIGFyZSB0cmllZCBOLXRpbWVzIHVudGlsIHRoZSBsZXZlbCBpcyBjb25zaWRlcmVkIGFzIGltcG9zc2libGUgdG8gY29ubmVjdCAqL1xuXG5cdHRoaXMuX2Nvbm5lY3RlZCA9IFtdOyAvKiBsaXN0IG9mIGFscmVhZHkgY29ubmVjdGVkIHJvb21zICovXG5cdHRoaXMuX3VuY29ubmVjdGVkID0gW107IC8qIGxpc3Qgb2YgcmVtYWluaW5nIHVuY29ubmVjdGVkIHJvb21zICovXG5cdFxuXHR0aGlzLl9kaWdDYWxsYmFjayA9IHRoaXMuX2RpZ0NhbGxiYWNrLmJpbmQodGhpcyk7XG5cdHRoaXMuX2NhbkJlRHVnQ2FsbGJhY2sgPSB0aGlzLl9jYW5CZUR1Z0NhbGxiYWNrLmJpbmQodGhpcyk7XG5cdHRoaXMuX2lzV2FsbENhbGxiYWNrID0gdGhpcy5faXNXYWxsQ2FsbGJhY2suYmluZCh0aGlzKTtcbn1cblJPVC5NYXAuVW5pZm9ybS5leHRlbmQoUk9ULk1hcC5EdW5nZW9uKTtcblxuLyoqXG4gKiBDcmVhdGUgYSBtYXAuIElmIHRoZSB0aW1lIGxpbWl0IGhhcyBiZWVuIGhpdCwgcmV0dXJucyBudWxsLlxuICogQHNlZSBST1QuTWFwI2NyZWF0ZVxuICovXG5ST1QuTWFwLlVuaWZvcm0ucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdHZhciB0MSA9IERhdGUubm93KCk7XG5cdHdoaWxlICgxKSB7XG5cdFx0dmFyIHQyID0gRGF0ZS5ub3coKTtcblx0XHRpZiAodDIgLSB0MSA+IHRoaXMuX29wdGlvbnMudGltZUxpbWl0KSB7IHJldHVybiBudWxsOyB9IC8qIHRpbWUgbGltaXQhICovXG5cdFxuXHRcdHRoaXMuX21hcCA9IHRoaXMuX2ZpbGxNYXAoMSk7XG5cdFx0dGhpcy5fZHVnID0gMDtcblx0XHR0aGlzLl9yb29tcyA9IFtdO1xuXHRcdHRoaXMuX3VuY29ubmVjdGVkID0gW107XG5cdFx0dGhpcy5fZ2VuZXJhdGVSb29tcygpO1xuXHRcdGlmICh0aGlzLl9yb29tcy5sZW5ndGggPCAyKSB7IGNvbnRpbnVlOyB9XG5cdFx0aWYgKHRoaXMuX2dlbmVyYXRlQ29ycmlkb3JzKCkpIHsgYnJlYWs7IH1cblx0fVxuXHRcblx0aWYgKGNhbGxiYWNrKSB7XG5cdFx0Zm9yICh2YXIgaT0wO2k8dGhpcy5fd2lkdGg7aSsrKSB7XG5cdFx0XHRmb3IgKHZhciBqPTA7ajx0aGlzLl9oZWlnaHQ7aisrKSB7XG5cdFx0XHRcdGNhbGxiYWNrKGksIGosIHRoaXMuX21hcFtpXVtqXSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdFxuXHRyZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBzdWl0YWJsZSBhbW91bnQgb2Ygcm9vbXNcbiAqL1xuUk9ULk1hcC5Vbmlmb3JtLnByb3RvdHlwZS5fZ2VuZXJhdGVSb29tcyA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgdyA9IHRoaXMuX3dpZHRoLTI7XG5cdHZhciBoID0gdGhpcy5faGVpZ2h0LTI7XG5cblx0ZG8ge1xuXHRcdHZhciByb29tID0gdGhpcy5fZ2VuZXJhdGVSb29tKCk7XG5cdFx0aWYgKHRoaXMuX2R1Zy8odypoKSA+IHRoaXMuX29wdGlvbnMucm9vbUR1Z1BlcmNlbnRhZ2UpIHsgYnJlYWs7IH0gLyogYWNoaWV2ZWQgcmVxdWVzdGVkIGFtb3VudCBvZiBmcmVlIHNwYWNlICovXG5cdH0gd2hpbGUgKHJvb20pO1xuXG5cdC8qIGVpdGhlciBlbm91Z2ggcm9vbXMsIG9yIG5vdCBhYmxlIHRvIGdlbmVyYXRlIG1vcmUgb2YgdGhlbSA6KSAqL1xufVxuXG4vKipcbiAqIFRyeSB0byBnZW5lcmF0ZSBvbmUgcm9vbVxuICovXG5ST1QuTWFwLlVuaWZvcm0ucHJvdG90eXBlLl9nZW5lcmF0ZVJvb20gPSBmdW5jdGlvbigpIHtcblx0dmFyIGNvdW50ID0gMDtcblx0d2hpbGUgKGNvdW50IDwgdGhpcy5fcm9vbUF0dGVtcHRzKSB7XG5cdFx0Y291bnQrKztcblx0XHRcblx0XHR2YXIgcm9vbSA9IFJPVC5NYXAuRmVhdHVyZS5Sb29tLmNyZWF0ZVJhbmRvbSh0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0LCB0aGlzLl9vcHRpb25zKTtcblx0XHRpZiAoIXJvb20uaXNWYWxpZCh0aGlzLl9pc1dhbGxDYWxsYmFjaywgdGhpcy5fY2FuQmVEdWdDYWxsYmFjaykpIHsgY29udGludWU7IH1cblx0XHRcblx0XHRyb29tLmNyZWF0ZSh0aGlzLl9kaWdDYWxsYmFjayk7XG5cdFx0dGhpcy5fcm9vbXMucHVzaChyb29tKTtcblx0XHRyZXR1cm4gcm9vbTtcblx0fSBcblxuXHQvKiBubyByb29tIHdhcyBnZW5lcmF0ZWQgaW4gYSBnaXZlbiBudW1iZXIgb2YgYXR0ZW1wdHMgKi9cblx0cmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGNvbm5lY3RvcnMgYmV3ZWVuIHJvb21zXG4gKiBAcmV0dXJucyB7Ym9vbH0gc3VjY2VzcyBXYXMgdGhpcyBhdHRlbXB0IHN1Y2Nlc3NmdWxsP1xuICovXG5ST1QuTWFwLlVuaWZvcm0ucHJvdG90eXBlLl9nZW5lcmF0ZUNvcnJpZG9ycyA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgY250ID0gMDtcblx0d2hpbGUgKGNudCA8IHRoaXMuX2NvcnJpZG9yQXR0ZW1wdHMpIHtcblx0XHRjbnQrKztcblx0XHR0aGlzLl9jb3JyaWRvcnMgPSBbXTtcblxuXHRcdC8qIGRpZyByb29tcyBpbnRvIGEgY2xlYXIgbWFwICovXG5cdFx0dGhpcy5fbWFwID0gdGhpcy5fZmlsbE1hcCgxKTtcblx0XHRmb3IgKHZhciBpPTA7aTx0aGlzLl9yb29tcy5sZW5ndGg7aSsrKSB7IFxuXHRcdFx0dmFyIHJvb20gPSB0aGlzLl9yb29tc1tpXTtcblx0XHRcdHJvb20uY2xlYXJEb29ycygpO1xuXHRcdFx0cm9vbS5jcmVhdGUodGhpcy5fZGlnQ2FsbGJhY2spOyBcblx0XHR9XG5cblx0XHR0aGlzLl91bmNvbm5lY3RlZCA9IHRoaXMuX3Jvb21zLnNsaWNlKCkucmFuZG9taXplKCk7XG5cdFx0dGhpcy5fY29ubmVjdGVkID0gW107XG5cdFx0aWYgKHRoaXMuX3VuY29ubmVjdGVkLmxlbmd0aCkgeyB0aGlzLl9jb25uZWN0ZWQucHVzaCh0aGlzLl91bmNvbm5lY3RlZC5wb3AoKSk7IH0gLyogZmlyc3Qgb25lIGlzIGFsd2F5cyBjb25uZWN0ZWQgKi9cblx0XHRcblx0XHR3aGlsZSAoMSkge1xuXHRcdFx0LyogMS4gcGljayByYW5kb20gY29ubmVjdGVkIHJvb20gKi9cblx0XHRcdHZhciBjb25uZWN0ZWQgPSB0aGlzLl9jb25uZWN0ZWQucmFuZG9tKCk7XG5cdFx0XHRcblx0XHRcdC8qIDIuIGZpbmQgY2xvc2VzdCB1bmNvbm5lY3RlZCAqL1xuXHRcdFx0dmFyIHJvb20xID0gdGhpcy5fY2xvc2VzdFJvb20odGhpcy5fdW5jb25uZWN0ZWQsIGNvbm5lY3RlZCk7XG5cdFx0XHRcblx0XHRcdC8qIDMuIGNvbm5lY3QgaXQgdG8gY2xvc2VzdCBjb25uZWN0ZWQgKi9cblx0XHRcdHZhciByb29tMiA9IHRoaXMuX2Nsb3Nlc3RSb29tKHRoaXMuX2Nvbm5lY3RlZCwgcm9vbTEpO1xuXHRcdFx0XG5cdFx0XHR2YXIgb2sgPSB0aGlzLl9jb25uZWN0Um9vbXMocm9vbTEsIHJvb20yKTtcblx0XHRcdGlmICghb2spIHsgYnJlYWs7IH0gLyogc3RvcCBjb25uZWN0aW5nLCByZS1zaHVmZmxlICovXG5cdFx0XHRcblx0XHRcdGlmICghdGhpcy5fdW5jb25uZWN0ZWQubGVuZ3RoKSB7IHJldHVybiB0cnVlOyB9IC8qIGRvbmU7IG5vIHJvb21zIHJlbWFpbiAqL1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogRm9yIGEgZ2l2ZW4gcm9vbSwgZmluZCB0aGUgY2xvc2VzdCBvbmUgZnJvbSB0aGUgbGlzdFxuICovXG5ST1QuTWFwLlVuaWZvcm0ucHJvdG90eXBlLl9jbG9zZXN0Um9vbSA9IGZ1bmN0aW9uKHJvb21zLCByb29tKSB7XG5cdHZhciBkaXN0ID0gSW5maW5pdHk7XG5cdHZhciBjZW50ZXIgPSByb29tLmdldENlbnRlcigpO1xuXHR2YXIgcmVzdWx0ID0gbnVsbDtcblx0XG5cdGZvciAodmFyIGk9MDtpPHJvb21zLmxlbmd0aDtpKyspIHtcblx0XHR2YXIgciA9IHJvb21zW2ldO1xuXHRcdHZhciBjID0gci5nZXRDZW50ZXIoKTtcblx0XHR2YXIgZHggPSBjWzBdLWNlbnRlclswXTtcblx0XHR2YXIgZHkgPSBjWzFdLWNlbnRlclsxXTtcblx0XHR2YXIgZCA9IGR4KmR4K2R5KmR5O1xuXHRcdFxuXHRcdGlmIChkIDwgZGlzdCkge1xuXHRcdFx0ZGlzdCA9IGQ7XG5cdFx0XHRyZXN1bHQgPSByO1xuXHRcdH1cblx0fVxuXHRcblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuUk9ULk1hcC5Vbmlmb3JtLnByb3RvdHlwZS5fY29ubmVjdFJvb21zID0gZnVuY3Rpb24ocm9vbTEsIHJvb20yKSB7XG5cdC8qXG5cdFx0cm9vbTEuZGVidWcoKTtcblx0XHRyb29tMi5kZWJ1ZygpO1xuXHQqL1xuXG5cdHZhciBjZW50ZXIxID0gcm9vbTEuZ2V0Q2VudGVyKCk7XG5cdHZhciBjZW50ZXIyID0gcm9vbTIuZ2V0Q2VudGVyKCk7XG5cblx0dmFyIGRpZmZYID0gY2VudGVyMlswXSAtIGNlbnRlcjFbMF07XG5cdHZhciBkaWZmWSA9IGNlbnRlcjJbMV0gLSBjZW50ZXIxWzFdO1xuXG5cdGlmIChNYXRoLmFicyhkaWZmWCkgPCBNYXRoLmFicyhkaWZmWSkpIHsgLyogZmlyc3QgdHJ5IGNvbm5lY3Rpbmcgbm9ydGgtc291dGggd2FsbHMgKi9cblx0XHR2YXIgZGlySW5kZXgxID0gKGRpZmZZID4gMCA/IDIgOiAwKTtcblx0XHR2YXIgZGlySW5kZXgyID0gKGRpckluZGV4MSArIDIpICUgNDtcblx0XHR2YXIgbWluID0gcm9vbTIuZ2V0TGVmdCgpO1xuXHRcdHZhciBtYXggPSByb29tMi5nZXRSaWdodCgpO1xuXHRcdHZhciBpbmRleCA9IDA7XG5cdH0gZWxzZSB7IC8qIGZpcnN0IHRyeSBjb25uZWN0aW5nIGVhc3Qtd2VzdCB3YWxscyAqL1xuXHRcdHZhciBkaXJJbmRleDEgPSAoZGlmZlggPiAwID8gMSA6IDMpO1xuXHRcdHZhciBkaXJJbmRleDIgPSAoZGlySW5kZXgxICsgMikgJSA0O1xuXHRcdHZhciBtaW4gPSByb29tMi5nZXRUb3AoKTtcblx0XHR2YXIgbWF4ID0gcm9vbTIuZ2V0Qm90dG9tKCk7XG5cdFx0dmFyIGluZGV4ID0gMTtcblx0fVxuXG5cdHZhciBzdGFydCA9IHRoaXMuX3BsYWNlSW5XYWxsKHJvb20xLCBkaXJJbmRleDEpOyAvKiBjb3JyaWRvciB3aWxsIHN0YXJ0IGhlcmUgKi9cblx0aWYgKCFzdGFydCkgeyByZXR1cm4gZmFsc2U7IH1cblxuXHRpZiAoc3RhcnRbaW5kZXhdID49IG1pbiAmJiBzdGFydFtpbmRleF0gPD0gbWF4KSB7IC8qIHBvc3NpYmxlIHRvIGNvbm5lY3Qgd2l0aCBzdHJhaWdodCBsaW5lIChJLWxpa2UpICovXG5cdFx0dmFyIGVuZCA9IHN0YXJ0LnNsaWNlKCk7XG5cdFx0dmFyIHZhbHVlID0gbnVsbDtcblx0XHRzd2l0Y2ggKGRpckluZGV4Mikge1xuXHRcdFx0Y2FzZSAwOiB2YWx1ZSA9IHJvb20yLmdldFRvcCgpLTE7IGJyZWFrO1xuXHRcdFx0Y2FzZSAxOiB2YWx1ZSA9IHJvb20yLmdldFJpZ2h0KCkrMTsgYnJlYWs7XG5cdFx0XHRjYXNlIDI6IHZhbHVlID0gcm9vbTIuZ2V0Qm90dG9tKCkrMTsgYnJlYWs7XG5cdFx0XHRjYXNlIDM6IHZhbHVlID0gcm9vbTIuZ2V0TGVmdCgpLTE7IGJyZWFrO1xuXHRcdH1cblx0XHRlbmRbKGluZGV4KzEpJTJdID0gdmFsdWU7XG5cdFx0dGhpcy5fZGlnTGluZShbc3RhcnQsIGVuZF0pO1xuXHRcdFxuXHR9IGVsc2UgaWYgKHN0YXJ0W2luZGV4XSA8IG1pbi0xIHx8IHN0YXJ0W2luZGV4XSA+IG1heCsxKSB7IC8qIG5lZWQgdG8gc3dpdGNoIHRhcmdldCB3YWxsIChMLWxpa2UpICovXG5cblx0XHR2YXIgZGlmZiA9IHN0YXJ0W2luZGV4XSAtIGNlbnRlcjJbaW5kZXhdO1xuXHRcdHN3aXRjaCAoZGlySW5kZXgyKSB7XG5cdFx0XHRjYXNlIDA6XG5cdFx0XHRjYXNlIDE6XHR2YXIgcm90YXRpb24gPSAoZGlmZiA8IDAgPyAzIDogMSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0Y2FzZSAzOlx0dmFyIHJvdGF0aW9uID0gKGRpZmYgPCAwID8gMSA6IDMpOyBicmVhaztcblx0XHR9XG5cdFx0ZGlySW5kZXgyID0gKGRpckluZGV4MiArIHJvdGF0aW9uKSAlIDQ7XG5cdFx0XG5cdFx0dmFyIGVuZCA9IHRoaXMuX3BsYWNlSW5XYWxsKHJvb20yLCBkaXJJbmRleDIpO1xuXHRcdGlmICghZW5kKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdFx0dmFyIG1pZCA9IFswLCAwXTtcblx0XHRtaWRbaW5kZXhdID0gc3RhcnRbaW5kZXhdO1xuXHRcdHZhciBpbmRleDIgPSAoaW5kZXgrMSklMjtcblx0XHRtaWRbaW5kZXgyXSA9IGVuZFtpbmRleDJdO1xuXHRcdHRoaXMuX2RpZ0xpbmUoW3N0YXJ0LCBtaWQsIGVuZF0pO1xuXHRcdFxuXHR9IGVsc2UgeyAvKiB1c2UgY3VycmVudCB3YWxsIHBhaXIsIGJ1dCBhZGp1c3QgdGhlIGxpbmUgaW4gdGhlIG1pZGRsZSAoUy1saWtlKSAqL1xuXHRcblx0XHR2YXIgaW5kZXgyID0gKGluZGV4KzEpJTI7XG5cdFx0dmFyIGVuZCA9IHRoaXMuX3BsYWNlSW5XYWxsKHJvb20yLCBkaXJJbmRleDIpO1xuXHRcdGlmICghZW5kKSB7IHJldHVybjsgfVxuXHRcdHZhciBtaWQgPSBNYXRoLnJvdW5kKChlbmRbaW5kZXgyXSArIHN0YXJ0W2luZGV4Ml0pLzIpO1xuXG5cdFx0dmFyIG1pZDEgPSBbMCwgMF07XG5cdFx0dmFyIG1pZDIgPSBbMCwgMF07XG5cdFx0bWlkMVtpbmRleF0gPSBzdGFydFtpbmRleF07XG5cdFx0bWlkMVtpbmRleDJdID0gbWlkO1xuXHRcdG1pZDJbaW5kZXhdID0gZW5kW2luZGV4XTtcblx0XHRtaWQyW2luZGV4Ml0gPSBtaWQ7XG5cdFx0dGhpcy5fZGlnTGluZShbc3RhcnQsIG1pZDEsIG1pZDIsIGVuZF0pO1xuXHR9XG5cblx0cm9vbTEuYWRkRG9vcihzdGFydFswXSwgc3RhcnRbMV0pO1xuXHRyb29tMi5hZGREb29yKGVuZFswXSwgZW5kWzFdKTtcblx0XG5cdHZhciBpbmRleCA9IHRoaXMuX3VuY29ubmVjdGVkLmluZGV4T2Yocm9vbTEpO1xuXHRpZiAoaW5kZXggIT0gLTEpIHtcblx0XHR0aGlzLl91bmNvbm5lY3RlZC5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdHRoaXMuX2Nvbm5lY3RlZC5wdXNoKHJvb20xKTtcblx0fVxuXG5cdHZhciBpbmRleCA9IHRoaXMuX3VuY29ubmVjdGVkLmluZGV4T2Yocm9vbTIpO1xuXHRpZiAoaW5kZXggIT0gLTEpIHtcblx0XHR0aGlzLl91bmNvbm5lY3RlZC5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdHRoaXMuX2Nvbm5lY3RlZC5wdXNoKHJvb20yKTtcblx0fVxuXHRcblx0cmV0dXJuIHRydWU7XG59XG5cblJPVC5NYXAuVW5pZm9ybS5wcm90b3R5cGUuX3BsYWNlSW5XYWxsID0gZnVuY3Rpb24ocm9vbSwgZGlySW5kZXgpIHtcblx0dmFyIHN0YXJ0ID0gWzAsIDBdO1xuXHR2YXIgZGlyID0gWzAsIDBdO1xuXHR2YXIgbGVuZ3RoID0gMDtcblx0XG5cdHN3aXRjaCAoZGlySW5kZXgpIHtcblx0XHRjYXNlIDA6XG5cdFx0XHRkaXIgPSBbMSwgMF07XG5cdFx0XHRzdGFydCA9IFtyb29tLmdldExlZnQoKSwgcm9vbS5nZXRUb3AoKS0xXTtcblx0XHRcdGxlbmd0aCA9IHJvb20uZ2V0UmlnaHQoKS1yb29tLmdldExlZnQoKSsxO1xuXHRcdGJyZWFrO1xuXHRcdGNhc2UgMTpcblx0XHRcdGRpciA9IFswLCAxXTtcblx0XHRcdHN0YXJ0ID0gW3Jvb20uZ2V0UmlnaHQoKSsxLCByb29tLmdldFRvcCgpXTtcblx0XHRcdGxlbmd0aCA9IHJvb20uZ2V0Qm90dG9tKCktcm9vbS5nZXRUb3AoKSsxO1xuXHRcdGJyZWFrO1xuXHRcdGNhc2UgMjpcblx0XHRcdGRpciA9IFsxLCAwXTtcblx0XHRcdHN0YXJ0ID0gW3Jvb20uZ2V0TGVmdCgpLCByb29tLmdldEJvdHRvbSgpKzFdO1xuXHRcdFx0bGVuZ3RoID0gcm9vbS5nZXRSaWdodCgpLXJvb20uZ2V0TGVmdCgpKzE7XG5cdFx0YnJlYWs7XG5cdFx0Y2FzZSAzOlxuXHRcdFx0ZGlyID0gWzAsIDFdO1xuXHRcdFx0c3RhcnQgPSBbcm9vbS5nZXRMZWZ0KCktMSwgcm9vbS5nZXRUb3AoKV07XG5cdFx0XHRsZW5ndGggPSByb29tLmdldEJvdHRvbSgpLXJvb20uZ2V0VG9wKCkrMTtcblx0XHRicmVhaztcblx0fVxuXHRcblx0dmFyIGF2YWlsID0gW107XG5cdHZhciBsYXN0QmFkSW5kZXggPSAtMjtcblxuXHRmb3IgKHZhciBpPTA7aTxsZW5ndGg7aSsrKSB7XG5cdFx0dmFyIHggPSBzdGFydFswXSArIGkqZGlyWzBdO1xuXHRcdHZhciB5ID0gc3RhcnRbMV0gKyBpKmRpclsxXTtcblx0XHRhdmFpbC5wdXNoKG51bGwpO1xuXHRcdFxuXHRcdHZhciBpc1dhbGwgPSAodGhpcy5fbWFwW3hdW3ldID09IDEpO1xuXHRcdGlmIChpc1dhbGwpIHtcblx0XHRcdGlmIChsYXN0QmFkSW5kZXggIT0gaS0xKSB7IGF2YWlsW2ldID0gW3gsIHldOyB9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxhc3RCYWRJbmRleCA9IGk7XG5cdFx0XHRpZiAoaSkgeyBhdmFpbFtpLTFdID0gbnVsbDsgfVxuXHRcdH1cblx0fVxuXHRcblx0Zm9yICh2YXIgaT1hdmFpbC5sZW5ndGgtMTsgaT49MDsgaS0tKSB7XG5cdFx0aWYgKCFhdmFpbFtpXSkgeyBhdmFpbC5zcGxpY2UoaSwgMSk7IH1cblx0fVxuXHRyZXR1cm4gKGF2YWlsLmxlbmd0aCA/IGF2YWlsLnJhbmRvbSgpIDogbnVsbCk7XG59XG5cbi8qKlxuICogRGlnIGEgcG9seWxpbmUuXG4gKi9cblJPVC5NYXAuVW5pZm9ybS5wcm90b3R5cGUuX2RpZ0xpbmUgPSBmdW5jdGlvbihwb2ludHMpIHtcblx0Zm9yICh2YXIgaT0xO2k8cG9pbnRzLmxlbmd0aDtpKyspIHtcblx0XHR2YXIgc3RhcnQgPSBwb2ludHNbaS0xXTtcblx0XHR2YXIgZW5kID0gcG9pbnRzW2ldO1xuXHRcdHZhciBjb3JyaWRvciA9IG5ldyBST1QuTWFwLkZlYXR1cmUuQ29ycmlkb3Ioc3RhcnRbMF0sIHN0YXJ0WzFdLCBlbmRbMF0sIGVuZFsxXSk7XG5cdFx0Y29ycmlkb3IuY3JlYXRlKHRoaXMuX2RpZ0NhbGxiYWNrKTtcblx0XHR0aGlzLl9jb3JyaWRvcnMucHVzaChjb3JyaWRvcik7XG5cdH1cbn1cblxuUk9ULk1hcC5Vbmlmb3JtLnByb3RvdHlwZS5fZGlnQ2FsbGJhY2sgPSBmdW5jdGlvbih4LCB5LCB2YWx1ZSkge1xuXHR0aGlzLl9tYXBbeF1beV0gPSB2YWx1ZTtcblx0aWYgKHZhbHVlID09IDApIHsgdGhpcy5fZHVnKys7IH1cbn1cblxuUk9ULk1hcC5Vbmlmb3JtLnByb3RvdHlwZS5faXNXYWxsQ2FsbGJhY2sgPSBmdW5jdGlvbih4LCB5KSB7XG5cdGlmICh4IDwgMCB8fCB5IDwgMCB8fCB4ID49IHRoaXMuX3dpZHRoIHx8IHkgPj0gdGhpcy5faGVpZ2h0KSB7IHJldHVybiBmYWxzZTsgfVxuXHRyZXR1cm4gKHRoaXMuX21hcFt4XVt5XSA9PSAxKTtcbn1cblxuUk9ULk1hcC5Vbmlmb3JtLnByb3RvdHlwZS5fY2FuQmVEdWdDYWxsYmFjayA9IGZ1bmN0aW9uKHgsIHkpIHtcblx0aWYgKHggPCAxIHx8IHkgPCAxIHx8IHgrMSA+PSB0aGlzLl93aWR0aCB8fCB5KzEgPj0gdGhpcy5faGVpZ2h0KSB7IHJldHVybiBmYWxzZTsgfVxuXHRyZXR1cm4gKHRoaXMuX21hcFt4XVt5XSA9PSAxKTtcbn1cblxuLyoqXG4gKiBAYXV0aG9yIGh5YWt1Z2VpXG4gKiBAY2xhc3MgRHVuZ2VvbiBnZW5lcmF0b3Igd2hpY2ggdXNlcyB0aGUgXCJvcmdpbmFsXCIgUm9ndWUgZHVuZ2VvbiBnZW5lcmF0aW9uIGFsZ29yaXRobS4gU2VlIGh0dHA6Ly9rdW9pLmNvbS9+a2FtaWthemUvR2FtZURlc2lnbi9hcnQwN19yb2d1ZV9kdW5nZW9uLnBocFxuICogQGF1Z21lbnRzIFJPVC5NYXBcbiAqIEBwYXJhbSB7aW50fSBbd2lkdGg9Uk9ULkRFRkFVTFRfV0lEVEhdXG4gKiBAcGFyYW0ge2ludH0gW2hlaWdodD1ST1QuREVGQVVMVF9IRUlHSFRdXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdIE9wdGlvbnNcbiAqIEBwYXJhbSB7aW50W119IFtvcHRpb25zLmNlbGxXaWR0aD0zXSBOdW1iZXIgb2YgY2VsbHMgdG8gY3JlYXRlIG9uIHRoZSBob3Jpem9udGFsIChudW1iZXIgb2Ygcm9vbXMgaG9yaXpvbnRhbGx5KVxuICogQHBhcmFtIHtpbnRbXX0gW29wdGlvbnMuY2VsbEhlaWdodD0zXSBOdW1iZXIgb2YgY2VsbHMgdG8gY3JlYXRlIG9uIHRoZSB2ZXJ0aWNhbCAobnVtYmVyIG9mIHJvb21zIHZlcnRpY2FsbHkpIFxuICogQHBhcmFtIHtpbnR9IFtvcHRpb25zLnJvb21XaWR0aF0gUm9vbSBtaW4gYW5kIG1heCB3aWR0aCAtIG5vcm1hbGx5IHNldCBhdXRvLW1hZ2ljYWxseSB2aWEgdGhlIGNvbnN0cnVjdG9yLlxuICogQHBhcmFtIHtpbnR9IFtvcHRpb25zLnJvb21IZWlnaHRdIFJvb20gbWluIGFuZCBtYXggaGVpZ2h0IC0gbm9ybWFsbHkgc2V0IGF1dG8tbWFnaWNhbGx5IHZpYSB0aGUgY29uc3RydWN0b3IuIFxuICovXG5ST1QuTWFwLlJvZ3VlID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCwgb3B0aW9ucykge1xuXHRST1QuTWFwLmNhbGwodGhpcywgd2lkdGgsIGhlaWdodCk7XG5cdFxuXHR0aGlzLl9vcHRpb25zID0ge1xuXHRcdGNlbGxXaWR0aDogMywgIC8vIE5PVEUgdG8gc2VsZiwgdGhlc2UgY291bGQgcHJvYmFibHkgd29yayB0aGUgc2FtZSBhcyB0aGUgcm9vbVdpZHRoL3Jvb20gSGVpZ2h0IHZhbHVlc1xuXHRcdGNlbGxIZWlnaHQ6IDMgIC8vICAgICBpZS4gYXMgYW4gYXJyYXkgd2l0aCBtaW4tbWF4IHZhbHVlcyBmb3IgZWFjaCBkaXJlY3Rpb24uLi4uXG5cdH1cblx0XG5cdGZvciAodmFyIHAgaW4gb3B0aW9ucykgeyB0aGlzLl9vcHRpb25zW3BdID0gb3B0aW9uc1twXTsgfVxuXHRcblx0Lypcblx0U2V0IHRoZSByb29tIHNpemVzIGFjY29yZGluZyB0byB0aGUgb3Zlci1hbGwgd2lkdGggb2YgdGhlIG1hcCwgXG5cdGFuZCB0aGUgY2VsbCBzaXplcy4gXG5cdCovXG5cdFxuXHRpZiAoIXRoaXMuX29wdGlvbnMuaGFzT3duUHJvcGVydHkoXCJyb29tV2lkdGhcIikpIHtcblx0XHR0aGlzLl9vcHRpb25zW1wicm9vbVdpZHRoXCJdID0gdGhpcy5fY2FsY3VsYXRlUm9vbVNpemUod2lkdGgsIHRoaXMuX29wdGlvbnNbXCJjZWxsV2lkdGhcIl0pO1xuXHR9XG5cdGlmICghdGhpcy5fb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eVtcInJvb21IZWlnaHRcIl0pIHtcblx0XHR0aGlzLl9vcHRpb25zW1wicm9vbUhlaWdodFwiXSA9IHRoaXMuX2NhbGN1bGF0ZVJvb21TaXplKGhlaWdodCwgdGhpcy5fb3B0aW9uc1tcImNlbGxIZWlnaHRcIl0pO1xuXHR9XG5cdFxufVxuXG5ST1QuTWFwLlJvZ3VlLmV4dGVuZChST1QuTWFwKTsgXG5cbi8qKlxuICogQHNlZSBST1QuTWFwI2NyZWF0ZVxuICovXG5ST1QuTWFwLlJvZ3VlLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHR0aGlzLm1hcCA9IHRoaXMuX2ZpbGxNYXAoMSk7XG5cdHRoaXMucm9vbXMgPSBbXTtcblx0dGhpcy5jb25uZWN0ZWRDZWxscyA9IFtdO1xuXHRcblx0dGhpcy5faW5pdFJvb21zKCk7XG5cdHRoaXMuX2Nvbm5lY3RSb29tcygpO1xuXHR0aGlzLl9jb25uZWN0VW5jb25uZWN0ZWRSb29tcygpO1xuXHR0aGlzLl9jcmVhdGVSYW5kb21Sb29tQ29ubmVjdGlvbnMoKTtcblx0dGhpcy5fY3JlYXRlUm9vbXMoKTtcblx0dGhpcy5fY3JlYXRlQ29ycmlkb3JzKCk7XG5cdFxuXHRpZiAoY2FsbGJhY2spIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3dpZHRoOyBpKyspIHtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5faGVpZ2h0OyBqKyspIHtcblx0XHRcdFx0Y2FsbGJhY2soaSwgaiwgdGhpcy5tYXBbaV1bal0pOyAgIFxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRcblx0cmV0dXJuIHRoaXM7XG59XG5cblJPVC5NYXAuUm9ndWUucHJvdG90eXBlLl9nZXRSYW5kb21JbnQgPSBmdW5jdGlvbihtaW4sIG1heCkge1xuXHRyZXR1cm4gTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XG59XG5cblJPVC5NYXAuUm9ndWUucHJvdG90eXBlLl9jYWxjdWxhdGVSb29tU2l6ZSA9IGZ1bmN0aW9uKHNpemUsIGNlbGwpIHtcblx0dmFyIG1heCA9IE1hdGguZmxvb3IoKHNpemUvY2VsbCkgKiAwLjgpO1xuXHR2YXIgbWluID0gTWF0aC5mbG9vcigoc2l6ZS9jZWxsKSAqIDAuMjUpO1xuXHRpZiAobWluIDwgMikgbWluID0gMjtcblx0aWYgKG1heCA8IDIpIG1heCA9IDI7XG5cdHJldHVybiBbbWluLCBtYXhdO1xufVxuXG5ST1QuTWFwLlJvZ3VlLnByb3RvdHlwZS5faW5pdFJvb21zID0gZnVuY3Rpb24gKCkgeyBcblx0Ly8gY3JlYXRlIHJvb21zIGFycmF5LiBUaGlzIGlzIHRoZSBcImdyaWRcIiBsaXN0IGZyb20gdGhlIGFsZ28uICBcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9vcHRpb25zLmNlbGxXaWR0aDsgaSsrKSB7ICBcblx0XHR0aGlzLnJvb21zLnB1c2goW10pO1xuXHRcdGZvcih2YXIgaiA9IDA7IGogPCB0aGlzLl9vcHRpb25zLmNlbGxIZWlnaHQ7IGorKykge1xuXHRcdFx0dGhpcy5yb29tc1tpXS5wdXNoKHtcInhcIjowLCBcInlcIjowLCBcIndpZHRoXCI6MCwgXCJoZWlnaHRcIjowLCBcImNvbm5lY3Rpb25zXCI6W10sIFwiY2VsbHhcIjppLCBcImNlbGx5XCI6an0pO1xuXHRcdH1cblx0fVxufVxuXG5ST1QuTWFwLlJvZ3VlLnByb3RvdHlwZS5fY29ubmVjdFJvb21zID0gZnVuY3Rpb24oKSB7XG5cdC8vcGljayByYW5kb20gc3RhcnRpbmcgZ3JpZFxuXHR2YXIgY2d4ID0gdGhpcy5fZ2V0UmFuZG9tSW50KDAsIHRoaXMuX29wdGlvbnMuY2VsbFdpZHRoLTEpO1xuXHR2YXIgY2d5ID0gdGhpcy5fZ2V0UmFuZG9tSW50KDAsIHRoaXMuX29wdGlvbnMuY2VsbEhlaWdodC0xKTtcblx0XG5cdHZhciBpZHg7XG5cdHZhciBuY2d4O1xuXHR2YXIgbmNneTtcblx0XG5cdHZhciBmb3VuZCA9IGZhbHNlO1xuXHR2YXIgcm9vbTtcblx0dmFyIG90aGVyUm9vbTtcblx0XG5cdC8vIGZpbmQgIHVuY29ubmVjdGVkIG5laWdoYm91ciBjZWxsc1xuXHRkbyB7XG5cdFxuXHRcdC8vdmFyIGRpclRvQ2hlY2sgPSBbMCwxLDIsMyw0LDUsNiw3XTtcblx0XHR2YXIgZGlyVG9DaGVjayA9IFswLDIsNCw2XTtcblx0XHRkaXJUb0NoZWNrID0gZGlyVG9DaGVjay5yYW5kb21pemUoKTtcblx0XHRcblx0XHRkbyB7XG5cdFx0XHRmb3VuZCA9IGZhbHNlO1xuXHRcdFx0aWR4ID0gZGlyVG9DaGVjay5wb3AoKTtcblx0XHRcdFxuXHRcdFx0XG5cdFx0XHRuY2d4ID0gY2d4ICsgUk9ULkRJUlNbOF1baWR4XVswXTtcblx0XHRcdG5jZ3kgPSBjZ3kgKyBST1QuRElSU1s4XVtpZHhdWzFdO1xuXHRcdFx0XG5cdFx0XHRpZihuY2d4IDwgMCB8fCBuY2d4ID49IHRoaXMuX29wdGlvbnMuY2VsbFdpZHRoKSBjb250aW51ZTtcblx0XHRcdGlmKG5jZ3kgPCAwIHx8IG5jZ3kgPj0gdGhpcy5fb3B0aW9ucy5jZWxsSGVpZ2h0KSBjb250aW51ZTtcblx0XHRcdFxuXHRcdFx0cm9vbSA9IHRoaXMucm9vbXNbY2d4XVtjZ3ldO1xuXHRcdFx0XG5cdFx0XHRpZihyb29tW1wiY29ubmVjdGlvbnNcIl0ubGVuZ3RoID4gMClcblx0XHRcdHtcblx0XHRcdFx0Ly8gYXMgbG9uZyBhcyB0aGlzIHJvb20gZG9lc24ndCBhbHJlYWR5IGNvb25lY3QgdG8gbWUsIHdlIGFyZSBvayB3aXRoIGl0LiBcblx0XHRcdFx0aWYocm9vbVtcImNvbm5lY3Rpb25zXCJdWzBdWzBdID09IG5jZ3ggJiZcblx0XHRcdFx0cm9vbVtcImNvbm5lY3Rpb25zXCJdWzBdWzFdID09IG5jZ3kpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRvdGhlclJvb20gPSB0aGlzLnJvb21zW25jZ3hdW25jZ3ldO1xuXHRcdFx0XG5cdFx0XHRpZiAob3RoZXJSb29tW1wiY29ubmVjdGlvbnNcIl0ubGVuZ3RoID09IDApIHsgXG5cdFx0XHRcdG90aGVyUm9vbVtcImNvbm5lY3Rpb25zXCJdLnB1c2goW2NneCxjZ3ldKTtcblx0XHRcdFx0XG5cdFx0XHRcdHRoaXMuY29ubmVjdGVkQ2VsbHMucHVzaChbbmNneCwgbmNneV0pO1xuXHRcdFx0XHRjZ3ggPSBuY2d4O1xuXHRcdFx0XHRjZ3kgPSBuY2d5O1xuXHRcdFx0XHRmb3VuZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRcdFx0XG5cdFx0fSB3aGlsZSAoZGlyVG9DaGVjay5sZW5ndGggPiAwICYmIGZvdW5kID09IGZhbHNlKVxuXHRcdFxuXHR9IHdoaWxlIChkaXJUb0NoZWNrLmxlbmd0aCA+IDApXG5cbn1cblxuUk9ULk1hcC5Sb2d1ZS5wcm90b3R5cGUuX2Nvbm5lY3RVbmNvbm5lY3RlZFJvb21zID0gZnVuY3Rpb24oKSB7XG5cdC8vV2hpbGUgdGhlcmUgYXJlIHVuY29ubmVjdGVkIHJvb21zLCB0cnkgdG8gY29ubmVjdCB0aGVtIHRvIGEgcmFuZG9tIGNvbm5lY3RlZCBuZWlnaGJvciBcblx0Ly8oaWYgYSByb29tIGhhcyBubyBjb25uZWN0ZWQgbmVpZ2hib3JzIHlldCwganVzdCBrZWVwIGN5Y2xpbmcsIHlvdSdsbCBmaWxsIG91dCB0byBpdCBldmVudHVhbGx5KS5cblx0dmFyIGN3ID0gdGhpcy5fb3B0aW9ucy5jZWxsV2lkdGg7XG5cdHZhciBjaCA9IHRoaXMuX29wdGlvbnMuY2VsbEhlaWdodDtcblx0XG5cdHZhciByYW5kb21Db25uZWN0ZWRDZWxsO1xuXHR0aGlzLmNvbm5lY3RlZENlbGxzID0gdGhpcy5jb25uZWN0ZWRDZWxscy5yYW5kb21pemUoKTtcblx0dmFyIHJvb207XG5cdHZhciBvdGhlclJvb207XG5cdHZhciB2YWxpZFJvb207XG5cdFxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX29wdGlvbnMuY2VsbFdpZHRoOyBpKyspIHtcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMuX29wdGlvbnMuY2VsbEhlaWdodDsgaisrKSAge1xuXHRcdFx0XHRcblx0XHRcdHJvb20gPSB0aGlzLnJvb21zW2ldW2pdO1xuXHRcdFx0XG5cdFx0XHRpZiAocm9vbVtcImNvbm5lY3Rpb25zXCJdLmxlbmd0aCA9PSAwKSB7XG5cdFx0XHRcdHZhciBkaXJlY3Rpb25zID0gWzAsMiw0LDZdO1xuXHRcdFx0XHRkaXJlY3Rpb25zID0gZGlyZWN0aW9ucy5yYW5kb21pemUoKTtcblx0XHRcdFx0XG5cdFx0XHRcdHZhciB2YWxpZFJvb20gPSBmYWxzZTtcblx0XHRcdFx0XG5cdFx0XHRcdGRvIHtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHR2YXIgZGlySWR4ID0gZGlyZWN0aW9ucy5wb3AoKTtcblx0XHRcdFx0XHR2YXIgbmV3SSA9IGkgKyBST1QuRElSU1s4XVtkaXJJZHhdWzBdO1xuXHRcdFx0XHRcdHZhciBuZXdKID0gaiArIFJPVC5ESVJTWzhdW2RpcklkeF1bMV07XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0aWYgKG5ld0kgPCAwIHx8IG5ld0kgPj0gY3cgfHwgXG5cdFx0XHRcdFx0bmV3SiA8IDAgfHwgbmV3SiA+PSBjaCkge1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdG90aGVyUm9vbSA9IHRoaXMucm9vbXNbbmV3SV1bbmV3Sl07XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0dmFsaWRSb29tID0gdHJ1ZTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAob3RoZXJSb29tW1wiY29ubmVjdGlvbnNcIl0ubGVuZ3RoID09IDApIHtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHRmb3IgKHZhciBrID0gMDsgayA8IG90aGVyUm9vbVtcImNvbm5lY3Rpb25zXCJdLmxlbmd0aDsgaysrKSB7XG5cdFx0XHRcdFx0XHRpZihvdGhlclJvb21bXCJjb25uZWN0aW9uc1wiXVtrXVswXSA9PSBpICYmIFxuXHRcdFx0XHRcdFx0b3RoZXJSb29tW1wiY29ubmVjdGlvbnNcIl1ba11bMV0gPT0gaikge1xuXHRcdFx0XHRcdFx0XHR2YWxpZFJvb20gPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGlmICh2YWxpZFJvb20pIGJyZWFrO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHR9IHdoaWxlIChkaXJlY3Rpb25zLmxlbmd0aClcblx0XHRcdFx0XG5cdFx0XHRcdGlmKHZhbGlkUm9vbSkgeyBcblx0XHRcdFx0XHRyb29tW1wiY29ubmVjdGlvbnNcIl0ucHVzaCggW290aGVyUm9vbVtcImNlbGx4XCJdLCBvdGhlclJvb21bXCJjZWxseVwiXV0gKTsgIFxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiLS0gVW5hYmxlIHRvIGNvbm5lY3Qgcm9vbS5cIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuUk9ULk1hcC5Sb2d1ZS5wcm90b3R5cGUuX2NyZWF0ZVJhbmRvbVJvb21Db25uZWN0aW9ucyA9IGZ1bmN0aW9uKGNvbm5lY3Rpb25zKSB7XG5cdC8vIEVtcHR5IGZvciBub3cuIFxufVxuXG5cblJPVC5NYXAuUm9ndWUucHJvdG90eXBlLl9jcmVhdGVSb29tcyA9IGZ1bmN0aW9uKCkge1xuXHQvLyBDcmVhdGUgUm9vbXMgXG5cdFxuXHR2YXIgdyA9IHRoaXMuX3dpZHRoO1xuXHR2YXIgaCA9IHRoaXMuX2hlaWdodDtcblx0XG5cdHZhciBjdyA9IHRoaXMuX29wdGlvbnMuY2VsbFdpZHRoO1xuXHR2YXIgY2ggPSB0aGlzLl9vcHRpb25zLmNlbGxIZWlnaHQ7XG5cdFxuXHR2YXIgY3dwID0gTWF0aC5mbG9vcih0aGlzLl93aWR0aCAvIGN3KTtcblx0dmFyIGNocCA9IE1hdGguZmxvb3IodGhpcy5faGVpZ2h0IC8gY2gpO1xuXHRcblx0dmFyIHJvb213O1xuXHR2YXIgcm9vbWg7XG5cdHZhciByb29tV2lkdGggPSB0aGlzLl9vcHRpb25zW1wicm9vbVdpZHRoXCJdO1xuXHR2YXIgcm9vbUhlaWdodCA9IHRoaXMuX29wdGlvbnNbXCJyb29tSGVpZ2h0XCJdO1xuXHR2YXIgc3g7XG5cdHZhciBzeTtcblx0dmFyIHR4O1xuXHR2YXIgdHk7XG5cdHZhciBvdGhlclJvb207XG5cdFxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGN3OyBpKyspIHtcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGNoOyBqKyspIHtcblx0XHRcdHN4ID0gY3dwICogaTtcblx0XHRcdHN5ID0gY2hwICogajtcblx0XHRcdFxuXHRcdFx0aWYgKHN4ID09IDApIHN4ID0gMTtcblx0XHRcdGlmIChzeSA9PSAwKSBzeSA9IDE7XG5cdFx0XHRcblx0XHRcdHJvb213ID0gdGhpcy5fZ2V0UmFuZG9tSW50KHJvb21XaWR0aFswXSwgcm9vbVdpZHRoWzFdKTtcblx0XHRcdHJvb21oID0gdGhpcy5fZ2V0UmFuZG9tSW50KHJvb21IZWlnaHRbMF0sIHJvb21IZWlnaHRbMV0pO1xuXHRcdFx0XG5cdFx0XHRpZiAoaiA+IDApIHtcblx0XHRcdFx0b3RoZXJSb29tID0gdGhpcy5yb29tc1tpXVtqLTFdO1xuXHRcdFx0XHR3aGlsZSAoc3kgLSAob3RoZXJSb29tW1wieVwiXSArIG90aGVyUm9vbVtcImhlaWdodFwiXSApIDwgMykge1xuXHRcdFx0XHRcdHN5Kys7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0aWYgKGkgPiAwKSB7XG5cdFx0XHRcdG90aGVyUm9vbSA9IHRoaXMucm9vbXNbaS0xXVtqXTtcblx0XHRcdFx0d2hpbGUoc3ggLSAob3RoZXJSb29tW1wieFwiXSArIG90aGVyUm9vbVtcIndpZHRoXCJdKSA8IDMpIHtcblx0XHRcdFx0XHRzeCsrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcdFx0XHRcblx0XHRcdHZhciBzeE9mZnNldCA9IE1hdGgucm91bmQodGhpcy5fZ2V0UmFuZG9tSW50KDAsIGN3cC1yb29tdykvMik7XG5cdFx0XHR2YXIgc3lPZmZzZXQgPSBNYXRoLnJvdW5kKHRoaXMuX2dldFJhbmRvbUludCgwLCBjaHAtcm9vbWgpLzIpO1xuXHRcdFx0XG5cdFx0XHR3aGlsZSAoc3ggKyBzeE9mZnNldCArIHJvb213ID49IHcpIHtcblx0XHRcdFx0aWYoc3hPZmZzZXQpIHtcblx0XHRcdFx0XHRzeE9mZnNldC0tO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJvb213LS07IFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHdoaWxlIChzeSArIHN5T2Zmc2V0ICsgcm9vbWggPj0gaCkgeyBcblx0XHRcdFx0aWYoc3lPZmZzZXQpIHtcblx0XHRcdFx0XHRzeU9mZnNldC0tO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJvb21oLS07IFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHN4ID0gc3ggKyBzeE9mZnNldDtcblx0XHRcdHN5ID0gc3kgKyBzeU9mZnNldDtcblx0XHRcdFxuXHRcdFx0dGhpcy5yb29tc1tpXVtqXVtcInhcIl0gPSBzeDtcblx0XHRcdHRoaXMucm9vbXNbaV1bal1bXCJ5XCJdID0gc3k7XG5cdFx0XHR0aGlzLnJvb21zW2ldW2pdW1wid2lkdGhcIl0gPSByb29tdztcblx0XHRcdHRoaXMucm9vbXNbaV1bal1bXCJoZWlnaHRcIl0gPSByb29taDsgIFxuXHRcdFx0XG5cdFx0XHRmb3IgKHZhciBpaSA9IHN4OyBpaSA8IHN4ICsgcm9vbXc7IGlpKyspIHtcblx0XHRcdFx0Zm9yICh2YXIgamogPSBzeTsgamogPCBzeSArIHJvb21oOyBqaisrKSB7XG5cdFx0XHRcdFx0dGhpcy5tYXBbaWldW2pqXSA9IDA7XG5cdFx0XHRcdH1cblx0XHRcdH0gIFxuXHRcdH1cblx0fVxufVxuXG5ST1QuTWFwLlJvZ3VlLnByb3RvdHlwZS5fZ2V0V2FsbFBvc2l0aW9uID0gZnVuY3Rpb24oYVJvb20sIGFEaXJlY3Rpb24pIHtcblx0dmFyIHJ4O1xuXHR2YXIgcnk7XG5cdHZhciBkb29yO1xuXHRcblx0aWYgKGFEaXJlY3Rpb24gPT0gMSB8fCBhRGlyZWN0aW9uID09IDMpIHtcblx0XHRyeCA9IHRoaXMuX2dldFJhbmRvbUludChhUm9vbVtcInhcIl0gKyAxLCBhUm9vbVtcInhcIl0gKyBhUm9vbVtcIndpZHRoXCJdIC0gMik7XG5cdFx0aWYgKGFEaXJlY3Rpb24gPT0gMSkge1xuXHRcdFx0cnkgPSBhUm9vbVtcInlcIl0gLSAyO1xuXHRcdFx0ZG9vciA9IHJ5ICsgMTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cnkgPSBhUm9vbVtcInlcIl0gKyBhUm9vbVtcImhlaWdodFwiXSArIDE7XG5cdFx0XHRkb29yID0gcnkgLTE7XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMubWFwW3J4XVtkb29yXSA9IDA7IC8vIGknbSBub3Qgc2V0dGluZyBhIHNwZWNpZmljICdkb29yJyB0aWxlIHZhbHVlIHJpZ2h0IG5vdywganVzdCBlbXB0eSBzcGFjZS4gXG5cdFx0XG5cdH0gZWxzZSBpZiAoYURpcmVjdGlvbiA9PSAyIHx8IGFEaXJlY3Rpb24gPT0gNCkge1xuXHRcdHJ5ID0gdGhpcy5fZ2V0UmFuZG9tSW50KGFSb29tW1wieVwiXSArIDEsIGFSb29tW1wieVwiXSArIGFSb29tW1wiaGVpZ2h0XCJdIC0gMik7XG5cdFx0aWYoYURpcmVjdGlvbiA9PSAyKSB7XG5cdFx0XHRyeCA9IGFSb29tW1wieFwiXSArIGFSb29tW1wid2lkdGhcIl0gKyAxO1xuXHRcdFx0ZG9vciA9IHJ4IC0gMTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cnggPSBhUm9vbVtcInhcIl0gLSAyO1xuXHRcdFx0ZG9vciA9IHJ4ICsgMTtcblx0XHR9XG5cdFx0XG5cdFx0dGhpcy5tYXBbZG9vcl1bcnldID0gMDsgLy8gaSdtIG5vdCBzZXR0aW5nIGEgc3BlY2lmaWMgJ2Rvb3InIHRpbGUgdmFsdWUgcmlnaHQgbm93LCBqdXN0IGVtcHR5IHNwYWNlLiBcblx0XHRcblx0fVxuXHRyZXR1cm4gW3J4LCByeV07XG59XG5cbi8qKipcbiogQHBhcmFtIHN0YXJ0UG9zaXRpb24gYSAyIGVsZW1lbnQgYXJyYXlcbiogQHBhcmFtIGVuZFBvc2l0aW9uIGEgMiBlbGVtZW50IGFycmF5XG4qL1xuUk9ULk1hcC5Sb2d1ZS5wcm90b3R5cGUuX2RyYXdDb3JyaWRvcmUgPSBmdW5jdGlvbiAoc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24pIHtcblx0dmFyIHhPZmZzZXQgPSBlbmRQb3NpdGlvblswXSAtIHN0YXJ0UG9zaXRpb25bMF07XG5cdHZhciB5T2Zmc2V0ID0gZW5kUG9zaXRpb25bMV0gLSBzdGFydFBvc2l0aW9uWzFdO1xuXHRcblx0dmFyIHhwb3MgPSBzdGFydFBvc2l0aW9uWzBdO1xuXHR2YXIgeXBvcyA9IHN0YXJ0UG9zaXRpb25bMV07XG5cdFxuXHR2YXIgdGVtcERpc3Q7XG5cdHZhciB4RGlyO1xuXHR2YXIgeURpcjtcblx0XG5cdHZhciBtb3ZlOyAvLyAyIGVsZW1lbnQgYXJyYXksIGVsZW1lbnQgMCBpcyB0aGUgZGlyZWN0aW9uLCBlbGVtZW50IDEgaXMgdGhlIHRvdGFsIHZhbHVlIHRvIG1vdmUuIFxuXHR2YXIgbW92ZXMgPSBbXTsgLy8gYSBsaXN0IG9mIDIgZWxlbWVudCBhcnJheXNcblx0XG5cdHZhciB4QWJzID0gTWF0aC5hYnMoeE9mZnNldCk7XG5cdHZhciB5QWJzID0gTWF0aC5hYnMoeU9mZnNldCk7XG5cdFxuXHR2YXIgcGVyY2VudCA9IFJPVC5STkcuZ2V0VW5pZm9ybSgpOyAvLyB1c2VkIHRvIHNwbGl0IHRoZSBtb3ZlIGF0IGRpZmZlcmVudCBwbGFjZXMgYWxvbmcgdGhlIGxvbmcgYXhpc1xuXHR2YXIgZmlyc3RIYWxmID0gcGVyY2VudDtcblx0dmFyIHNlY29uZEhhbGYgPSAxIC0gcGVyY2VudDtcblx0XG5cdHhEaXIgPSB4T2Zmc2V0ID4gMCA/IDIgOiA2O1xuXHR5RGlyID0geU9mZnNldCA+IDAgPyA0IDogMDtcblx0XG5cdGlmICh4QWJzIDwgeUFicykge1xuXHRcdC8vIG1vdmUgZmlyc3RIYWxmIG9mIHRoZSB5IG9mZnNldFxuXHRcdHRlbXBEaXN0ID0gTWF0aC5jZWlsKHlBYnMgKiBmaXJzdEhhbGYpO1xuXHRcdG1vdmVzLnB1c2goW3lEaXIsIHRlbXBEaXN0XSk7XG5cdFx0Ly8gbW92ZSBhbGwgdGhlIHggb2Zmc2V0XG5cdFx0bW92ZXMucHVzaChbeERpciwgeEFic10pO1xuXHRcdC8vIG1vdmUgc2VuZEhhbGYgb2YgdGhlICB5IG9mZnNldFxuXHRcdHRlbXBEaXN0ID0gTWF0aC5mbG9vcih5QWJzICogc2Vjb25kSGFsZik7XG5cdFx0bW92ZXMucHVzaChbeURpciwgdGVtcERpc3RdKTtcblx0fSBlbHNlIHtcblx0XHQvLyAgbW92ZSBmaXJzdEhhbGYgb2YgdGhlIHggb2Zmc2V0XG5cdFx0dGVtcERpc3QgPSBNYXRoLmNlaWwoeEFicyAqIGZpcnN0SGFsZik7XG5cdFx0bW92ZXMucHVzaChbeERpciwgdGVtcERpc3RdKTtcblx0XHQvLyBtb3ZlIGFsbCB0aGUgeSBvZmZzZXRcblx0XHRtb3Zlcy5wdXNoKFt5RGlyLCB5QWJzXSk7XG5cdFx0Ly8gbW92ZSBzZWNvbmRIYWxmIG9mIHRoZSB4IG9mZnNldC5cblx0XHR0ZW1wRGlzdCA9IE1hdGguZmxvb3IoeEFicyAqIHNlY29uZEhhbGYpO1xuXHRcdG1vdmVzLnB1c2goW3hEaXIsIHRlbXBEaXN0XSk7ICBcblx0fVxuXHRcblx0dGhpcy5tYXBbeHBvc11beXBvc10gPSAwO1xuXHRcblx0d2hpbGUgKG1vdmVzLmxlbmd0aCA+IDApIHtcblx0XHRtb3ZlID0gbW92ZXMucG9wKCk7XG5cdFx0d2hpbGUgKG1vdmVbMV0gPiAwKSB7XG5cdFx0XHR4cG9zICs9IFJPVC5ESVJTWzhdW21vdmVbMF1dWzBdO1xuXHRcdFx0eXBvcyArPSBST1QuRElSU1s4XVttb3ZlWzBdXVsxXTtcblx0XHRcdHRoaXMubWFwW3hwb3NdW3lwb3NdID0gMDtcblx0XHRcdG1vdmVbMV0gPSBtb3ZlWzFdIC0gMTtcblx0XHR9XG5cdH1cbn1cblxuUk9ULk1hcC5Sb2d1ZS5wcm90b3R5cGUuX2NyZWF0ZUNvcnJpZG9ycyA9IGZ1bmN0aW9uICgpIHtcblx0Ly8gRHJhdyBDb3JyaWRvcnMgYmV0d2VlbiBjb25uZWN0ZWQgcm9vbXNcblx0XG5cdHZhciBjdyA9IHRoaXMuX29wdGlvbnMuY2VsbFdpZHRoO1xuXHR2YXIgY2ggPSB0aGlzLl9vcHRpb25zLmNlbGxIZWlnaHQ7XG5cdHZhciByb29tO1xuXHR2YXIgY29ubmVjdGlvbjtcblx0dmFyIG90aGVyUm9vbTtcblx0dmFyIHdhbGw7XG5cdHZhciBvdGhlcldhbGw7XG5cdFxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGN3OyBpKyspIHtcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGNoOyBqKyspIHtcblx0XHRcdHJvb20gPSB0aGlzLnJvb21zW2ldW2pdO1xuXHRcdFx0XG5cdFx0XHRmb3IgKHZhciBrID0gMDsgayA8IHJvb21bXCJjb25uZWN0aW9uc1wiXS5sZW5ndGg7IGsrKykge1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRjb25uZWN0aW9uID0gcm9vbVtcImNvbm5lY3Rpb25zXCJdW2tdOyBcblx0XHRcdFx0XG5cdFx0XHRcdG90aGVyUm9vbSA9IHRoaXMucm9vbXNbY29ubmVjdGlvblswXV1bY29ubmVjdGlvblsxXV07XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBmaWd1cmUgb3V0IHdoYXQgd2FsbCBvdXIgY29ycmlkb3Igd2lsbCBzdGFydCBvbmUuXG5cdFx0XHRcdC8vIGZpZ3VyZSBvdXQgd2hhdCB3YWxsIG91ciBjb3JyaWRvciB3aWxsIGVuZCBvbi4gXG5cdFx0XHRcdGlmIChvdGhlclJvb21bXCJjZWxseFwiXSA+IHJvb21bXCJjZWxseFwiXSApIHtcblx0XHRcdFx0XHR3YWxsID0gMjtcblx0XHRcdFx0XHRvdGhlcldhbGwgPSA0O1xuXHRcdFx0XHR9IGVsc2UgaWYgKG90aGVyUm9vbVtcImNlbGx4XCJdIDwgcm9vbVtcImNlbGx4XCJdICkge1xuXHRcdFx0XHRcdHdhbGwgPSA0O1xuXHRcdFx0XHRcdG90aGVyV2FsbCA9IDI7XG5cdFx0XHRcdH0gZWxzZSBpZihvdGhlclJvb21bXCJjZWxseVwiXSA+IHJvb21bXCJjZWxseVwiXSkge1xuXHRcdFx0XHRcdHdhbGwgPSAzO1xuXHRcdFx0XHRcdG90aGVyV2FsbCA9IDE7XG5cdFx0XHRcdH0gZWxzZSBpZihvdGhlclJvb21bXCJjZWxseVwiXSA8IHJvb21bXCJjZWxseVwiXSkge1xuXHRcdFx0XHRcdHdhbGwgPSAxO1xuXHRcdFx0XHRcdG90aGVyV2FsbCA9IDM7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdHRoaXMuX2RyYXdDb3JyaWRvcmUodGhpcy5fZ2V0V2FsbFBvc2l0aW9uKHJvb20sIHdhbGwpLCB0aGlzLl9nZXRXYWxsUG9zaXRpb24ob3RoZXJSb29tLCBvdGhlcldhbGwpKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbi8qKlxuICogQGNsYXNzIER1bmdlb24gZmVhdHVyZTsgaGFzIG93biAuY3JlYXRlKCkgbWV0aG9kXG4gKi9cblJPVC5NYXAuRmVhdHVyZSA9IGZ1bmN0aW9uKCkge31cblJPVC5NYXAuRmVhdHVyZS5wcm90b3R5cGUuaXNWYWxpZCA9IGZ1bmN0aW9uKGNhbkJlRHVnQ2FsbGJhY2spIHt9XG5ST1QuTWFwLkZlYXR1cmUucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKGRpZ0NhbGxiYWNrKSB7fVxuUk9ULk1hcC5GZWF0dXJlLnByb3RvdHlwZS5kZWJ1ZyA9IGZ1bmN0aW9uKCkge31cblJPVC5NYXAuRmVhdHVyZS5jcmVhdGVSYW5kb21BdCA9IGZ1bmN0aW9uKHgsIHksIGR4LCBkeSwgb3B0aW9ucykge31cblxuLyoqXG4gKiBAY2xhc3MgUm9vbVxuICogQGF1Z21lbnRzIFJPVC5NYXAuRmVhdHVyZVxuICogQHBhcmFtIHtpbnR9IHgxXG4gKiBAcGFyYW0ge2ludH0geTFcbiAqIEBwYXJhbSB7aW50fSB4MlxuICogQHBhcmFtIHtpbnR9IHkyXG4gKiBAcGFyYW0ge2ludH0gW2Rvb3JYXVxuICogQHBhcmFtIHtpbnR9IFtkb29yWV1cbiAqL1xuUk9ULk1hcC5GZWF0dXJlLlJvb20gPSBmdW5jdGlvbih4MSwgeTEsIHgyLCB5MiwgZG9vclgsIGRvb3JZKSB7XG5cdHRoaXMuX3gxID0geDE7XG5cdHRoaXMuX3kxID0geTE7XG5cdHRoaXMuX3gyID0geDI7XG5cdHRoaXMuX3kyID0geTI7XG5cdHRoaXMuX2Rvb3JzID0ge307XG5cdGlmIChhcmd1bWVudHMubGVuZ3RoID4gNCkgeyB0aGlzLmFkZERvb3IoZG9vclgsIGRvb3JZKTsgfVxufVxuUk9ULk1hcC5GZWF0dXJlLlJvb20uZXh0ZW5kKFJPVC5NYXAuRmVhdHVyZSk7XG5cbi8qKlxuICogUm9vbSBvZiByYW5kb20gc2l6ZSwgd2l0aCBhIGdpdmVuIGRvb3JzIGFuZCBkaXJlY3Rpb25cbiAqL1xuUk9ULk1hcC5GZWF0dXJlLlJvb20uY3JlYXRlUmFuZG9tQXQgPSBmdW5jdGlvbih4LCB5LCBkeCwgZHksIG9wdGlvbnMpIHtcblx0dmFyIG1pbiA9IG9wdGlvbnMucm9vbVdpZHRoWzBdO1xuXHR2YXIgbWF4ID0gb3B0aW9ucy5yb29tV2lkdGhbMV07XG5cdHZhciB3aWR0aCA9IG1pbiArIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkqKG1heC1taW4rMSkpO1xuXHRcblx0dmFyIG1pbiA9IG9wdGlvbnMucm9vbUhlaWdodFswXTtcblx0dmFyIG1heCA9IG9wdGlvbnMucm9vbUhlaWdodFsxXTtcblx0dmFyIGhlaWdodCA9IG1pbiArIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkqKG1heC1taW4rMSkpO1xuXHRcblx0aWYgKGR4ID09IDEpIHsgLyogdG8gdGhlIHJpZ2h0ICovXG5cdFx0dmFyIHkyID0geSAtIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkgKiBoZWlnaHQpO1xuXHRcdHJldHVybiBuZXcgdGhpcyh4KzEsIHkyLCB4K3dpZHRoLCB5MitoZWlnaHQtMSwgeCwgeSk7XG5cdH1cblx0XG5cdGlmIChkeCA9PSAtMSkgeyAvKiB0byB0aGUgbGVmdCAqL1xuXHRcdHZhciB5MiA9IHkgLSBNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpICogaGVpZ2h0KTtcblx0XHRyZXR1cm4gbmV3IHRoaXMoeC13aWR0aCwgeTIsIHgtMSwgeTIraGVpZ2h0LTEsIHgsIHkpO1xuXHR9XG5cblx0aWYgKGR5ID09IDEpIHsgLyogdG8gdGhlIGJvdHRvbSAqL1xuXHRcdHZhciB4MiA9IHggLSBNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpICogd2lkdGgpO1xuXHRcdHJldHVybiBuZXcgdGhpcyh4MiwgeSsxLCB4Mit3aWR0aC0xLCB5K2hlaWdodCwgeCwgeSk7XG5cdH1cblxuXHRpZiAoZHkgPT0gLTEpIHsgLyogdG8gdGhlIHRvcCAqL1xuXHRcdHZhciB4MiA9IHggLSBNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpICogd2lkdGgpO1xuXHRcdHJldHVybiBuZXcgdGhpcyh4MiwgeS1oZWlnaHQsIHgyK3dpZHRoLTEsIHktMSwgeCwgeSk7XG5cdH1cbn1cblxuLyoqXG4gKiBSb29tIG9mIHJhbmRvbSBzaXplLCBwb3NpdGlvbmVkIGFyb3VuZCBjZW50ZXIgY29vcmRzXG4gKi9cblJPVC5NYXAuRmVhdHVyZS5Sb29tLmNyZWF0ZVJhbmRvbUNlbnRlciA9IGZ1bmN0aW9uKGN4LCBjeSwgb3B0aW9ucykge1xuXHR2YXIgbWluID0gb3B0aW9ucy5yb29tV2lkdGhbMF07XG5cdHZhciBtYXggPSBvcHRpb25zLnJvb21XaWR0aFsxXTtcblx0dmFyIHdpZHRoID0gbWluICsgTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSoobWF4LW1pbisxKSk7XG5cdFxuXHR2YXIgbWluID0gb3B0aW9ucy5yb29tSGVpZ2h0WzBdO1xuXHR2YXIgbWF4ID0gb3B0aW9ucy5yb29tSGVpZ2h0WzFdO1xuXHR2YXIgaGVpZ2h0ID0gbWluICsgTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSoobWF4LW1pbisxKSk7XG5cblx0dmFyIHgxID0gY3ggLSBNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpKndpZHRoKTtcblx0dmFyIHkxID0gY3kgLSBNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpKmhlaWdodCk7XG5cdHZhciB4MiA9IHgxICsgd2lkdGggLSAxO1xuXHR2YXIgeTIgPSB5MSArIGhlaWdodCAtIDE7XG5cblx0cmV0dXJuIG5ldyB0aGlzKHgxLCB5MSwgeDIsIHkyKTtcbn1cblxuLyoqXG4gKiBSb29tIG9mIHJhbmRvbSBzaXplIHdpdGhpbiBhIGdpdmVuIGRpbWVuc2lvbnNcbiAqL1xuUk9ULk1hcC5GZWF0dXJlLlJvb20uY3JlYXRlUmFuZG9tID0gZnVuY3Rpb24oYXZhaWxXaWR0aCwgYXZhaWxIZWlnaHQsIG9wdGlvbnMpIHtcblx0dmFyIG1pbiA9IG9wdGlvbnMucm9vbVdpZHRoWzBdO1xuXHR2YXIgbWF4ID0gb3B0aW9ucy5yb29tV2lkdGhbMV07XG5cdHZhciB3aWR0aCA9IG1pbiArIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkqKG1heC1taW4rMSkpO1xuXHRcblx0dmFyIG1pbiA9IG9wdGlvbnMucm9vbUhlaWdodFswXTtcblx0dmFyIG1heCA9IG9wdGlvbnMucm9vbUhlaWdodFsxXTtcblx0dmFyIGhlaWdodCA9IG1pbiArIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkqKG1heC1taW4rMSkpO1xuXHRcblx0dmFyIGxlZnQgPSBhdmFpbFdpZHRoIC0gd2lkdGggLSAxO1xuXHR2YXIgdG9wID0gYXZhaWxIZWlnaHQgLSBoZWlnaHQgLSAxO1xuXG5cdHZhciB4MSA9IDEgKyBNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpKmxlZnQpO1xuXHR2YXIgeTEgPSAxICsgTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSp0b3ApO1xuXHR2YXIgeDIgPSB4MSArIHdpZHRoIC0gMTtcblx0dmFyIHkyID0geTEgKyBoZWlnaHQgLSAxO1xuXG5cdHJldHVybiBuZXcgdGhpcyh4MSwgeTEsIHgyLCB5Mik7XG59XG5cblJPVC5NYXAuRmVhdHVyZS5Sb29tLnByb3RvdHlwZS5hZGREb29yID0gZnVuY3Rpb24oeCwgeSkge1xuXHR0aGlzLl9kb29yc1t4K1wiLFwiK3ldID0gMTtcblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogQHBhcmFtIHtmdW5jdGlvbn1cbiAqL1xuUk9ULk1hcC5GZWF0dXJlLlJvb20ucHJvdG90eXBlLmdldERvb3JzID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0Zm9yICh2YXIga2V5IGluIHRoaXMuX2Rvb3JzKSB7XG5cdFx0dmFyIHBhcnRzID0ga2V5LnNwbGl0KFwiLFwiKTtcblx0XHRjYWxsYmFjayhwYXJzZUludChwYXJ0c1swXSksIHBhcnNlSW50KHBhcnRzWzFdKSk7XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59XG5cblJPVC5NYXAuRmVhdHVyZS5Sb29tLnByb3RvdHlwZS5jbGVhckRvb3JzID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuX2Rvb3JzID0ge307XG5cdHJldHVybiB0aGlzO1xufVxuXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5wcm90b3R5cGUuYWRkRG9vcnMgPSBmdW5jdGlvbihpc1dhbGxDYWxsYmFjaykge1xuXHR2YXIgbGVmdCA9IHRoaXMuX3gxLTE7XG5cdHZhciByaWdodCA9IHRoaXMuX3gyKzE7XG5cdHZhciB0b3AgPSB0aGlzLl95MS0xO1xuXHR2YXIgYm90dG9tID0gdGhpcy5feTIrMTtcblxuXHRmb3IgKHZhciB4PWxlZnQ7IHg8PXJpZ2h0OyB4KyspIHtcblx0XHRmb3IgKHZhciB5PXRvcDsgeTw9Ym90dG9tOyB5KyspIHtcblx0XHRcdGlmICh4ICE9IGxlZnQgJiYgeCAhPSByaWdodCAmJiB5ICE9IHRvcCAmJiB5ICE9IGJvdHRvbSkgeyBjb250aW51ZTsgfVxuXHRcdFx0aWYgKGlzV2FsbENhbGxiYWNrKHgsIHkpKSB7IGNvbnRpbnVlOyB9XG5cblx0XHRcdHRoaXMuYWRkRG9vcih4LCB5KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdGhpcztcbn1cblxuUk9ULk1hcC5GZWF0dXJlLlJvb20ucHJvdG90eXBlLmRlYnVnID0gZnVuY3Rpb24oKSB7XG5cdGNvbnNvbGUubG9nKFwicm9vbVwiLCB0aGlzLl94MSwgdGhpcy5feTEsIHRoaXMuX3gyLCB0aGlzLl95Mik7XG59XG5cblJPVC5NYXAuRmVhdHVyZS5Sb29tLnByb3RvdHlwZS5pc1ZhbGlkID0gZnVuY3Rpb24oaXNXYWxsQ2FsbGJhY2ssIGNhbkJlRHVnQ2FsbGJhY2spIHsgXG5cdHZhciBsZWZ0ID0gdGhpcy5feDEtMTtcblx0dmFyIHJpZ2h0ID0gdGhpcy5feDIrMTtcblx0dmFyIHRvcCA9IHRoaXMuX3kxLTE7XG5cdHZhciBib3R0b20gPSB0aGlzLl95MisxO1xuXHRcblx0Zm9yICh2YXIgeD1sZWZ0OyB4PD1yaWdodDsgeCsrKSB7XG5cdFx0Zm9yICh2YXIgeT10b3A7IHk8PWJvdHRvbTsgeSsrKSB7XG5cdFx0XHRpZiAoeCA9PSBsZWZ0IHx8IHggPT0gcmlnaHQgfHwgeSA9PSB0b3AgfHwgeSA9PSBib3R0b20pIHtcblx0XHRcdFx0aWYgKCFpc1dhbGxDYWxsYmFjayh4LCB5KSkgeyByZXR1cm4gZmFsc2U7IH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICghY2FuQmVEdWdDYWxsYmFjayh4LCB5KSkgeyByZXR1cm4gZmFsc2U7IH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBkaWdDYWxsYmFjayBEaWcgY2FsbGJhY2sgd2l0aCBhIHNpZ25hdHVyZSAoeCwgeSwgdmFsdWUpLiBWYWx1ZXM6IDAgPSBlbXB0eSwgMSA9IHdhbGwsIDIgPSBkb29yLiBNdWx0aXBsZSBkb29ycyBhcmUgYWxsb3dlZC5cbiAqL1xuUk9ULk1hcC5GZWF0dXJlLlJvb20ucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKGRpZ0NhbGxiYWNrKSB7IFxuXHR2YXIgbGVmdCA9IHRoaXMuX3gxLTE7XG5cdHZhciByaWdodCA9IHRoaXMuX3gyKzE7XG5cdHZhciB0b3AgPSB0aGlzLl95MS0xO1xuXHR2YXIgYm90dG9tID0gdGhpcy5feTIrMTtcblx0XG5cdHZhciB2YWx1ZSA9IDA7XG5cdGZvciAodmFyIHg9bGVmdDsgeDw9cmlnaHQ7IHgrKykge1xuXHRcdGZvciAodmFyIHk9dG9wOyB5PD1ib3R0b207IHkrKykge1xuXHRcdFx0aWYgKHgrXCIsXCIreSBpbiB0aGlzLl9kb29ycykge1xuXHRcdFx0XHR2YWx1ZSA9IDI7XG5cdFx0XHR9IGVsc2UgaWYgKHggPT0gbGVmdCB8fCB4ID09IHJpZ2h0IHx8IHkgPT0gdG9wIHx8IHkgPT0gYm90dG9tKSB7XG5cdFx0XHRcdHZhbHVlID0gMTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhbHVlID0gMDtcblx0XHRcdH1cblx0XHRcdGRpZ0NhbGxiYWNrKHgsIHksIHZhbHVlKTtcblx0XHR9XG5cdH1cbn1cblxuUk9ULk1hcC5GZWF0dXJlLlJvb20ucHJvdG90eXBlLmdldENlbnRlciA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gW01hdGgucm91bmQoKHRoaXMuX3gxICsgdGhpcy5feDIpLzIpLCBNYXRoLnJvdW5kKCh0aGlzLl95MSArIHRoaXMuX3kyKS8yKV07XG59XG5cblJPVC5NYXAuRmVhdHVyZS5Sb29tLnByb3RvdHlwZS5nZXRMZWZ0ID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLl94MTtcbn1cblxuUk9ULk1hcC5GZWF0dXJlLlJvb20ucHJvdG90eXBlLmdldFJpZ2h0ID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLl94Mjtcbn1cblxuUk9ULk1hcC5GZWF0dXJlLlJvb20ucHJvdG90eXBlLmdldFRvcCA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5feTE7XG59XG5cblJPVC5NYXAuRmVhdHVyZS5Sb29tLnByb3RvdHlwZS5nZXRCb3R0b20gPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuX3kyO1xufVxuXG4vKipcbiAqIEBjbGFzcyBDb3JyaWRvclxuICogQGF1Z21lbnRzIFJPVC5NYXAuRmVhdHVyZVxuICogQHBhcmFtIHtpbnR9IHN0YXJ0WFxuICogQHBhcmFtIHtpbnR9IHN0YXJ0WVxuICogQHBhcmFtIHtpbnR9IGVuZFhcbiAqIEBwYXJhbSB7aW50fSBlbmRZXG4gKi9cblJPVC5NYXAuRmVhdHVyZS5Db3JyaWRvciA9IGZ1bmN0aW9uKHN0YXJ0WCwgc3RhcnRZLCBlbmRYLCBlbmRZKSB7XG5cdHRoaXMuX3N0YXJ0WCA9IHN0YXJ0WDtcblx0dGhpcy5fc3RhcnRZID0gc3RhcnRZO1xuXHR0aGlzLl9lbmRYID0gZW5kWDsgXG5cdHRoaXMuX2VuZFkgPSBlbmRZO1xuXHR0aGlzLl9lbmRzV2l0aEFXYWxsID0gdHJ1ZTtcbn1cblJPVC5NYXAuRmVhdHVyZS5Db3JyaWRvci5leHRlbmQoUk9ULk1hcC5GZWF0dXJlKTtcblxuUk9ULk1hcC5GZWF0dXJlLkNvcnJpZG9yLmNyZWF0ZVJhbmRvbUF0ID0gZnVuY3Rpb24oeCwgeSwgZHgsIGR5LCBvcHRpb25zKSB7XG5cdHZhciBtaW4gPSBvcHRpb25zLmNvcnJpZG9yTGVuZ3RoWzBdO1xuXHR2YXIgbWF4ID0gb3B0aW9ucy5jb3JyaWRvckxlbmd0aFsxXTtcblx0dmFyIGxlbmd0aCA9IG1pbiArIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkqKG1heC1taW4rMSkpO1xuXHRcblx0cmV0dXJuIG5ldyB0aGlzKHgsIHksIHggKyBkeCpsZW5ndGgsIHkgKyBkeSpsZW5ndGgpO1xufVxuXG5ST1QuTWFwLkZlYXR1cmUuQ29ycmlkb3IucHJvdG90eXBlLmRlYnVnID0gZnVuY3Rpb24oKSB7XG5cdGNvbnNvbGUubG9nKFwiY29ycmlkb3JcIiwgdGhpcy5fc3RhcnRYLCB0aGlzLl9zdGFydFksIHRoaXMuX2VuZFgsIHRoaXMuX2VuZFkpO1xufVxuXG5ST1QuTWFwLkZlYXR1cmUuQ29ycmlkb3IucHJvdG90eXBlLmlzVmFsaWQgPSBmdW5jdGlvbihpc1dhbGxDYWxsYmFjaywgY2FuQmVEdWdDYWxsYmFjayl7IFxuXHR2YXIgc3ggPSB0aGlzLl9zdGFydFg7XG5cdHZhciBzeSA9IHRoaXMuX3N0YXJ0WTtcblx0dmFyIGR4ID0gdGhpcy5fZW5kWC1zeDtcblx0dmFyIGR5ID0gdGhpcy5fZW5kWS1zeTtcblx0dmFyIGxlbmd0aCA9IDEgKyBNYXRoLm1heChNYXRoLmFicyhkeCksIE1hdGguYWJzKGR5KSk7XG5cdFxuXHRpZiAoZHgpIHsgZHggPSBkeC9NYXRoLmFicyhkeCk7IH1cblx0aWYgKGR5KSB7IGR5ID0gZHkvTWF0aC5hYnMoZHkpOyB9XG5cdHZhciBueCA9IGR5O1xuXHR2YXIgbnkgPSAtZHg7XG5cdFxuXHR2YXIgb2sgPSB0cnVlO1xuXHRmb3IgKHZhciBpPTA7IGk8bGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgeCA9IHN4ICsgaSpkeDtcblx0XHR2YXIgeSA9IHN5ICsgaSpkeTtcblxuXHRcdGlmICghY2FuQmVEdWdDYWxsYmFjayggICAgIHgsICAgICAgeSkpIHsgb2sgPSBmYWxzZTsgfVxuXHRcdGlmICghaXNXYWxsQ2FsbGJhY2sgICh4ICsgbngsIHkgKyBueSkpIHsgb2sgPSBmYWxzZTsgfVxuXHRcdGlmICghaXNXYWxsQ2FsbGJhY2sgICh4IC0gbngsIHkgLSBueSkpIHsgb2sgPSBmYWxzZTsgfVxuXHRcdFxuXHRcdGlmICghb2spIHtcblx0XHRcdGxlbmd0aCA9IGk7XG5cdFx0XHR0aGlzLl9lbmRYID0geC1keDtcblx0XHRcdHRoaXMuX2VuZFkgPSB5LWR5O1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKipcblx0ICogSWYgdGhlIGxlbmd0aCBkZWdlbmVyYXRlZCwgdGhpcyBjb3JyaWRvciBtaWdodCBiZSBpbnZhbGlkXG5cdCAqL1xuXHQgXG5cdC8qIG5vdCBzdXBwb3J0ZWQgKi9cblx0aWYgKGxlbmd0aCA9PSAwKSB7IHJldHVybiBmYWxzZTsgfSBcblx0XG5cdCAvKiBsZW5ndGggMSBhbGxvd2VkIG9ubHkgaWYgdGhlIG5leHQgc3BhY2UgaXMgZW1wdHkgKi9cblx0aWYgKGxlbmd0aCA9PSAxICYmIGlzV2FsbENhbGxiYWNrKHRoaXMuX2VuZFggKyBkeCwgdGhpcy5fZW5kWSArIGR5KSkgeyByZXR1cm4gZmFsc2U7IH1cblx0XG5cdC8qKlxuXHQgKiBXZSBkbyBub3Qgd2FudCB0aGUgY29ycmlkb3IgdG8gY3Jhc2ggaW50byBhIGNvcm5lciBvZiBhIHJvb207XG5cdCAqIGlmIGFueSBvZiB0aGUgZW5kaW5nIGNvcm5lcnMgaXMgZW1wdHksIHRoZSBOKzF0aCBjZWxsIG9mIHRoaXMgY29ycmlkb3IgbXVzdCBiZSBlbXB0eSB0b28uXG5cdCAqIFxuXHQgKiBTaXR1YXRpb246XG5cdCAqICMjIyMjIyMxXG5cdCAqIC4uLi4uLi4/XG5cdCAqICMjIyMjIyMyXG5cdCAqIFxuXHQgKiBUaGUgY29ycmlkb3Igd2FzIGR1ZyBmcm9tIGxlZnQgdG8gcmlnaHQuXG5cdCAqIDEsIDIgLSBwcm9ibGVtYXRpYyBjb3JuZXJzLCA/ID0gTisxdGggY2VsbCAobm90IGR1Zylcblx0ICovXG5cdHZhciBmaXJzdENvcm5lckJhZCA9ICFpc1dhbGxDYWxsYmFjayh0aGlzLl9lbmRYICsgZHggKyBueCwgdGhpcy5fZW5kWSArIGR5ICsgbnkpO1xuXHR2YXIgc2Vjb25kQ29ybmVyQmFkID0gIWlzV2FsbENhbGxiYWNrKHRoaXMuX2VuZFggKyBkeCAtIG54LCB0aGlzLl9lbmRZICsgZHkgLSBueSk7XG5cdHRoaXMuX2VuZHNXaXRoQVdhbGwgPSBpc1dhbGxDYWxsYmFjayh0aGlzLl9lbmRYICsgZHgsIHRoaXMuX2VuZFkgKyBkeSk7XG5cdGlmICgoZmlyc3RDb3JuZXJCYWQgfHwgc2Vjb25kQ29ybmVyQmFkKSAmJiB0aGlzLl9lbmRzV2l0aEFXYWxsKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGRpZ0NhbGxiYWNrIERpZyBjYWxsYmFjayB3aXRoIGEgc2lnbmF0dXJlICh4LCB5LCB2YWx1ZSkuIFZhbHVlczogMCA9IGVtcHR5LlxuICovXG5ST1QuTWFwLkZlYXR1cmUuQ29ycmlkb3IucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKGRpZ0NhbGxiYWNrKSB7IFxuXHR2YXIgc3ggPSB0aGlzLl9zdGFydFg7XG5cdHZhciBzeSA9IHRoaXMuX3N0YXJ0WTtcblx0dmFyIGR4ID0gdGhpcy5fZW5kWC1zeDtcblx0dmFyIGR5ID0gdGhpcy5fZW5kWS1zeTtcblx0dmFyIGxlbmd0aCA9IDErTWF0aC5tYXgoTWF0aC5hYnMoZHgpLCBNYXRoLmFicyhkeSkpO1xuXHRcblx0aWYgKGR4KSB7IGR4ID0gZHgvTWF0aC5hYnMoZHgpOyB9XG5cdGlmIChkeSkgeyBkeSA9IGR5L01hdGguYWJzKGR5KTsgfVxuXHR2YXIgbnggPSBkeTtcblx0dmFyIG55ID0gLWR4O1xuXHRcblx0Zm9yICh2YXIgaT0wOyBpPGxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIHggPSBzeCArIGkqZHg7XG5cdFx0dmFyIHkgPSBzeSArIGkqZHk7XG5cdFx0ZGlnQ2FsbGJhY2soeCwgeSwgMCk7XG5cdH1cblx0XG5cdHJldHVybiB0cnVlO1xufVxuXG5ST1QuTWFwLkZlYXR1cmUuQ29ycmlkb3IucHJvdG90eXBlLmNyZWF0ZVByaW9yaXR5V2FsbHMgPSBmdW5jdGlvbihwcmlvcml0eVdhbGxDYWxsYmFjaykge1xuXHRpZiAoIXRoaXMuX2VuZHNXaXRoQVdhbGwpIHsgcmV0dXJuOyB9XG5cblx0dmFyIHN4ID0gdGhpcy5fc3RhcnRYO1xuXHR2YXIgc3kgPSB0aGlzLl9zdGFydFk7XG5cblx0dmFyIGR4ID0gdGhpcy5fZW5kWC1zeDtcblx0dmFyIGR5ID0gdGhpcy5fZW5kWS1zeTtcblx0aWYgKGR4KSB7IGR4ID0gZHgvTWF0aC5hYnMoZHgpOyB9XG5cdGlmIChkeSkgeyBkeSA9IGR5L01hdGguYWJzKGR5KTsgfVxuXHR2YXIgbnggPSBkeTtcblx0dmFyIG55ID0gLWR4O1xuXG5cdHByaW9yaXR5V2FsbENhbGxiYWNrKHRoaXMuX2VuZFggKyBkeCwgdGhpcy5fZW5kWSArIGR5KTtcblx0cHJpb3JpdHlXYWxsQ2FsbGJhY2sodGhpcy5fZW5kWCArIG54LCB0aGlzLl9lbmRZICsgbnkpO1xuXHRwcmlvcml0eVdhbGxDYWxsYmFjayh0aGlzLl9lbmRYIC0gbngsIHRoaXMuX2VuZFkgLSBueSk7XG59LyoqXG4gKiBAY2xhc3MgQmFzZSBub2lzZSBnZW5lcmF0b3JcbiAqL1xuUk9ULk5vaXNlID0gZnVuY3Rpb24oKSB7XG59O1xuXG5ST1QuTm9pc2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKHgsIHkpIHt9XG4vKipcbiAqIEEgc2ltcGxlIDJkIGltcGxlbWVudGF0aW9uIG9mIHNpbXBsZXggbm9pc2UgYnkgT25kcmVqIFphcmFcbiAqXG4gKiBCYXNlZCBvbiBhIHNwZWVkLWltcHJvdmVkIHNpbXBsZXggbm9pc2UgYWxnb3JpdGhtIGZvciAyRCwgM0QgYW5kIDREIGluIEphdmEuXG4gKiBXaGljaCBpcyBiYXNlZCBvbiBleGFtcGxlIGNvZGUgYnkgU3RlZmFuIEd1c3RhdnNvbiAoc3RlZ3VAaXRuLmxpdS5zZSkuXG4gKiBXaXRoIE9wdGltaXNhdGlvbnMgYnkgUGV0ZXIgRWFzdG1hbiAocGVhc3RtYW5AZHJpenpsZS5zdGFuZm9yZC5lZHUpLlxuICogQmV0dGVyIHJhbmsgb3JkZXJpbmcgbWV0aG9kIGJ5IFN0ZWZhbiBHdXN0YXZzb24gaW4gMjAxMi5cbiAqL1xuXG4vKipcbiAqIEBjbGFzcyAyRCBzaW1wbGV4IG5vaXNlIGdlbmVyYXRvclxuICogQHBhcmFtIHtpbnR9IFtncmFkaWVudHM9MjU2XSBSYW5kb20gZ3JhZGllbnRzXG4gKi9cblJPVC5Ob2lzZS5TaW1wbGV4ID0gZnVuY3Rpb24oZ3JhZGllbnRzKSB7XG5cdFJPVC5Ob2lzZS5jYWxsKHRoaXMpO1xuXG5cdHRoaXMuX0YyID0gMC41ICogKE1hdGguc3FydCgzKSAtIDEpO1xuICAgIHRoaXMuX0cyID0gKDMgLSBNYXRoLnNxcnQoMykpIC8gNjtcblxuXHR0aGlzLl9ncmFkaWVudHMgPSBbXG5cdFx0WyAwLCAtMV0sXG5cdFx0WyAxLCAtMV0sXG5cdFx0WyAxLCAgMF0sXG5cdFx0WyAxLCAgMV0sXG5cdFx0WyAwLCAgMV0sXG5cdFx0Wy0xLCAgMV0sXG5cdFx0Wy0xLCAgMF0sXG5cdFx0Wy0xLCAtMV1cblx0XTtcblxuXHR2YXIgcGVybXV0YXRpb25zID0gW107XG5cdHZhciBjb3VudCA9IGdyYWRpZW50cyB8fCAyNTY7XG5cdGZvciAodmFyIGk9MDtpPGNvdW50O2krKykgeyBwZXJtdXRhdGlvbnMucHVzaChpKTsgfVxuXHRwZXJtdXRhdGlvbnMgPSBwZXJtdXRhdGlvbnMucmFuZG9taXplKCk7XG5cblx0dGhpcy5fcGVybXMgPSBbXTtcblx0dGhpcy5faW5kZXhlcyA9IFtdO1xuXG5cdGZvciAodmFyIGk9MDtpPDIqY291bnQ7aSsrKSB7XG5cdFx0dGhpcy5fcGVybXMucHVzaChwZXJtdXRhdGlvbnNbaSAlIGNvdW50XSk7XG5cdFx0dGhpcy5faW5kZXhlcy5wdXNoKHRoaXMuX3Blcm1zW2ldICUgdGhpcy5fZ3JhZGllbnRzLmxlbmd0aCk7XG5cdH1cblxufTtcblJPVC5Ob2lzZS5TaW1wbGV4LmV4dGVuZChST1QuTm9pc2UpO1xuXG5ST1QuTm9pc2UuU2ltcGxleC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oeGluLCB5aW4pIHtcblx0dmFyIHBlcm1zID0gdGhpcy5fcGVybXM7XG5cdHZhciBpbmRleGVzID0gdGhpcy5faW5kZXhlcztcblx0dmFyIGNvdW50ID0gcGVybXMubGVuZ3RoLzI7XG5cdHZhciBHMiA9IHRoaXMuX0cyO1xuXG5cdHZhciBuMCA9MCwgbjEgPSAwLCBuMiA9IDAsIGdpOyAvLyBOb2lzZSBjb250cmlidXRpb25zIGZyb20gdGhlIHRocmVlIGNvcm5lcnNcblxuXHQvLyBTa2V3IHRoZSBpbnB1dCBzcGFjZSB0byBkZXRlcm1pbmUgd2hpY2ggc2ltcGxleCBjZWxsIHdlJ3JlIGluXG5cdHZhciBzID0gKHhpbiArIHlpbikgKiB0aGlzLl9GMjsgLy8gSGFpcnkgZmFjdG9yIGZvciAyRFxuXHR2YXIgaSA9IE1hdGguZmxvb3IoeGluICsgcyk7XG5cdHZhciBqID0gTWF0aC5mbG9vcih5aW4gKyBzKTtcblx0dmFyIHQgPSAoaSArIGopICogRzI7XG5cdHZhciBYMCA9IGkgLSB0OyAvLyBVbnNrZXcgdGhlIGNlbGwgb3JpZ2luIGJhY2sgdG8gKHgseSkgc3BhY2Vcblx0dmFyIFkwID0gaiAtIHQ7XG5cdHZhciB4MCA9IHhpbiAtIFgwOyAvLyBUaGUgeCx5IGRpc3RhbmNlcyBmcm9tIHRoZSBjZWxsIG9yaWdpblxuXHR2YXIgeTAgPSB5aW4gLSBZMDtcblxuXHQvLyBGb3IgdGhlIDJEIGNhc2UsIHRoZSBzaW1wbGV4IHNoYXBlIGlzIGFuIGVxdWlsYXRlcmFsIHRyaWFuZ2xlLlxuXHQvLyBEZXRlcm1pbmUgd2hpY2ggc2ltcGxleCB3ZSBhcmUgaW4uXG5cdHZhciBpMSwgajE7IC8vIE9mZnNldHMgZm9yIHNlY29uZCAobWlkZGxlKSBjb3JuZXIgb2Ygc2ltcGxleCBpbiAoaSxqKSBjb29yZHNcblx0aWYgKHgwID4geTApIHtcblx0XHRpMSA9IDE7XG5cdFx0ajEgPSAwO1xuXHR9IGVsc2UgeyAvLyBsb3dlciB0cmlhbmdsZSwgWFkgb3JkZXI6ICgwLDApLT4oMSwwKS0+KDEsMSlcblx0XHRpMSA9IDA7XG5cdFx0ajEgPSAxO1xuXHR9IC8vIHVwcGVyIHRyaWFuZ2xlLCBZWCBvcmRlcjogKDAsMCktPigwLDEpLT4oMSwxKVxuXG5cdC8vIEEgc3RlcCBvZiAoMSwwKSBpbiAoaSxqKSBtZWFucyBhIHN0ZXAgb2YgKDEtYywtYykgaW4gKHgseSksIGFuZFxuXHQvLyBhIHN0ZXAgb2YgKDAsMSkgaW4gKGksaikgbWVhbnMgYSBzdGVwIG9mICgtYywxLWMpIGluICh4LHkpLCB3aGVyZVxuXHQvLyBjID0gKDMtc3FydCgzKSkvNlxuXHR2YXIgeDEgPSB4MCAtIGkxICsgRzI7IC8vIE9mZnNldHMgZm9yIG1pZGRsZSBjb3JuZXIgaW4gKHgseSkgdW5za2V3ZWQgY29vcmRzXG5cdHZhciB5MSA9IHkwIC0gajEgKyBHMjtcblx0dmFyIHgyID0geDAgLSAxICsgMipHMjsgLy8gT2Zmc2V0cyBmb3IgbGFzdCBjb3JuZXIgaW4gKHgseSkgdW5za2V3ZWQgY29vcmRzXG5cdHZhciB5MiA9IHkwIC0gMSArIDIqRzI7XG5cblx0Ly8gV29yayBvdXQgdGhlIGhhc2hlZCBncmFkaWVudCBpbmRpY2VzIG9mIHRoZSB0aHJlZSBzaW1wbGV4IGNvcm5lcnNcblx0dmFyIGlpID0gaS5tb2QoY291bnQpO1xuXHR2YXIgamogPSBqLm1vZChjb3VudCk7XG5cblx0Ly8gQ2FsY3VsYXRlIHRoZSBjb250cmlidXRpb24gZnJvbSB0aGUgdGhyZWUgY29ybmVyc1xuXHR2YXIgdDAgPSAwLjUgLSB4MCp4MCAtIHkwKnkwO1xuXHRpZiAodDAgPj0gMCkge1xuXHRcdHQwICo9IHQwO1xuXHRcdGdpID0gaW5kZXhlc1tpaStwZXJtc1tqal1dO1xuXHRcdHZhciBncmFkID0gdGhpcy5fZ3JhZGllbnRzW2dpXTtcblx0XHRuMCA9IHQwICogdDAgKiAoZ3JhZFswXSAqIHgwICsgZ3JhZFsxXSAqIHkwKTtcblx0fVxuXHRcblx0dmFyIHQxID0gMC41IC0geDEqeDEgLSB5MSp5MTtcblx0aWYgKHQxID49IDApIHtcblx0XHR0MSAqPSB0MTtcblx0XHRnaSA9IGluZGV4ZXNbaWkraTErcGVybXNbamorajFdXTtcblx0XHR2YXIgZ3JhZCA9IHRoaXMuX2dyYWRpZW50c1tnaV07XG5cdFx0bjEgPSB0MSAqIHQxICogKGdyYWRbMF0gKiB4MSArIGdyYWRbMV0gKiB5MSk7XG5cdH1cblx0XG5cdHZhciB0MiA9IDAuNSAtIHgyKngyIC0geTIqeTI7XG5cdGlmICh0MiA+PSAwKSB7XG5cdFx0dDIgKj0gdDI7XG5cdFx0Z2kgPSBpbmRleGVzW2lpKzErcGVybXNbamorMV1dO1xuXHRcdHZhciBncmFkID0gdGhpcy5fZ3JhZGllbnRzW2dpXTtcblx0XHRuMiA9IHQyICogdDIgKiAoZ3JhZFswXSAqIHgyICsgZ3JhZFsxXSAqIHkyKTtcblx0fVxuXG5cdC8vIEFkZCBjb250cmlidXRpb25zIGZyb20gZWFjaCBjb3JuZXIgdG8gZ2V0IHRoZSBmaW5hbCBub2lzZSB2YWx1ZS5cblx0Ly8gVGhlIHJlc3VsdCBpcyBzY2FsZWQgdG8gcmV0dXJuIHZhbHVlcyBpbiB0aGUgaW50ZXJ2YWwgWy0xLDFdLlxuXHRyZXR1cm4gNzAgKiAobjAgKyBuMSArIG4yKTtcbn1cbi8qKlxuICogQGNsYXNzIEFic3RyYWN0IEZPViBhbGdvcml0aG1cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpZ2h0UGFzc2VzQ2FsbGJhY2sgRG9lcyB0aGUgbGlnaHQgcGFzcyB0aHJvdWdoIHgseT9cbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cbiAqIEBwYXJhbSB7aW50fSBbb3B0aW9ucy50b3BvbG9neT04XSA0LzYvOFxuICovXG5ST1QuRk9WID0gZnVuY3Rpb24obGlnaHRQYXNzZXNDYWxsYmFjaywgb3B0aW9ucykge1xuXHR0aGlzLl9saWdodFBhc3NlcyA9IGxpZ2h0UGFzc2VzQ2FsbGJhY2s7XG5cdHRoaXMuX29wdGlvbnMgPSB7XG5cdFx0dG9wb2xvZ3k6IDhcblx0fVxuXHRmb3IgKHZhciBwIGluIG9wdGlvbnMpIHsgdGhpcy5fb3B0aW9uc1twXSA9IG9wdGlvbnNbcF07IH1cbn07XG5cbi8qKlxuICogQ29tcHV0ZSB2aXNpYmlsaXR5IGZvciBhIDM2MC1kZWdyZWUgY2lyY2xlXG4gKiBAcGFyYW0ge2ludH0geFxuICogQHBhcmFtIHtpbnR9IHlcbiAqIEBwYXJhbSB7aW50fSBSIE1heGltdW0gdmlzaWJpbGl0eSByYWRpdXNcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gKi9cblJPVC5GT1YucHJvdG90eXBlLmNvbXB1dGUgPSBmdW5jdGlvbih4LCB5LCBSLCBjYWxsYmFjaykge31cblxuLyoqXG4gKiBSZXR1cm4gYWxsIG5laWdoYm9ycyBpbiBhIGNvbmNlbnRyaWMgcmluZ1xuICogQHBhcmFtIHtpbnR9IGN4IGNlbnRlci14XG4gKiBAcGFyYW0ge2ludH0gY3kgY2VudGVyLXlcbiAqIEBwYXJhbSB7aW50fSByIHJhbmdlXG4gKi9cblJPVC5GT1YucHJvdG90eXBlLl9nZXRDaXJjbGUgPSBmdW5jdGlvbihjeCwgY3ksIHIpIHtcblx0dmFyIHJlc3VsdCA9IFtdO1xuXHR2YXIgZGlycywgY291bnRGYWN0b3IsIHN0YXJ0T2Zmc2V0O1xuXG5cdHN3aXRjaCAodGhpcy5fb3B0aW9ucy50b3BvbG9neSkge1xuXHRcdGNhc2UgNDpcblx0XHRcdGNvdW50RmFjdG9yID0gMTtcblx0XHRcdHN0YXJ0T2Zmc2V0ID0gWzAsIDFdO1xuXHRcdFx0ZGlycyA9IFtcblx0XHRcdFx0Uk9ULkRJUlNbOF1bN10sXG5cdFx0XHRcdFJPVC5ESVJTWzhdWzFdLFxuXHRcdFx0XHRST1QuRElSU1s4XVszXSxcblx0XHRcdFx0Uk9ULkRJUlNbOF1bNV1cblx0XHRcdF1cblx0XHRicmVhaztcblxuXHRcdGNhc2UgNjpcblx0XHRcdGRpcnMgPSBST1QuRElSU1s2XTtcblx0XHRcdGNvdW50RmFjdG9yID0gMTtcblx0XHRcdHN0YXJ0T2Zmc2V0ID0gWy0xLCAxXTtcblx0XHRicmVhaztcblxuXHRcdGNhc2UgODpcblx0XHRcdGRpcnMgPSBST1QuRElSU1s0XTtcblx0XHRcdGNvdW50RmFjdG9yID0gMjtcblx0XHRcdHN0YXJ0T2Zmc2V0ID0gWy0xLCAxXTtcblx0XHRicmVhaztcblx0fVxuXG5cdC8qIHN0YXJ0aW5nIG5laWdoYm9yICovXG5cdHZhciB4ID0gY3ggKyBzdGFydE9mZnNldFswXSpyO1xuXHR2YXIgeSA9IGN5ICsgc3RhcnRPZmZzZXRbMV0qcjtcblxuXHQvKiBjaXJjbGUgKi9cblx0Zm9yICh2YXIgaT0wO2k8ZGlycy5sZW5ndGg7aSsrKSB7XG5cdFx0Zm9yICh2YXIgaj0wO2o8cipjb3VudEZhY3RvcjtqKyspIHtcblx0XHRcdHJlc3VsdC5wdXNoKFt4LCB5XSk7XG5cdFx0XHR4ICs9IGRpcnNbaV1bMF07XG5cdFx0XHR5ICs9IGRpcnNbaV1bMV07XG5cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0O1xufVxuLyoqXG4gKiBAY2xhc3MgRGlzY3JldGUgc2hhZG93Y2FzdGluZyBhbGdvcml0aG0uIE9ic29sZXRlZCBieSBQcmVjaXNlIHNoYWRvd2Nhc3RpbmcuXG4gKiBAYXVnbWVudHMgUk9ULkZPVlxuICovXG5ST1QuRk9WLkRpc2NyZXRlU2hhZG93Y2FzdGluZyA9IGZ1bmN0aW9uKGxpZ2h0UGFzc2VzQ2FsbGJhY2ssIG9wdGlvbnMpIHtcblx0Uk9ULkZPVi5jYWxsKHRoaXMsIGxpZ2h0UGFzc2VzQ2FsbGJhY2ssIG9wdGlvbnMpO1xufVxuUk9ULkZPVi5EaXNjcmV0ZVNoYWRvd2Nhc3RpbmcuZXh0ZW5kKFJPVC5GT1YpO1xuXG4vKipcbiAqIEBzZWUgUk9ULkZPViNjb21wdXRlXG4gKi9cblJPVC5GT1YuRGlzY3JldGVTaGFkb3djYXN0aW5nLnByb3RvdHlwZS5jb21wdXRlID0gZnVuY3Rpb24oeCwgeSwgUiwgY2FsbGJhY2spIHtcblx0dmFyIGNlbnRlciA9IHRoaXMuX2Nvb3Jkcztcblx0dmFyIG1hcCA9IHRoaXMuX21hcDtcblxuXHQvKiB0aGlzIHBsYWNlIGlzIGFsd2F5cyB2aXNpYmxlICovXG5cdGNhbGxiYWNrKHgsIHksIDApO1xuXG5cdC8qIHN0YW5kaW5nIGluIGEgZGFyayBwbGFjZS4gRklYTUUgaXMgdGhpcyBhIGdvb2QgaWRlYT8gICovXG5cdGlmICghdGhpcy5fbGlnaHRQYXNzZXMoeCwgeSkpIHsgcmV0dXJuOyB9XG5cdFxuXHQvKiBzdGFydCBhbmQgZW5kIGFuZ2xlcyAqL1xuXHR2YXIgREFUQSA9IFtdO1xuXHRcblx0dmFyIEEsIEIsIGN4LCBjeSwgYmxvY2tzO1xuXG5cdC8qIGFuYWx5emUgc3Vycm91bmRpbmcgY2VsbHMgaW4gY29uY2VudHJpYyByaW5ncywgc3RhcnRpbmcgZnJvbSB0aGUgY2VudGVyICovXG5cdGZvciAodmFyIHI9MTsgcjw9UjsgcisrKSB7XG5cdFx0dmFyIG5laWdoYm9ycyA9IHRoaXMuX2dldENpcmNsZSh4LCB5LCByKTtcblx0XHR2YXIgYW5nbGUgPSAzNjAgLyBuZWlnaGJvcnMubGVuZ3RoO1xuXG5cdFx0Zm9yICh2YXIgaT0wO2k8bmVpZ2hib3JzLmxlbmd0aDtpKyspIHtcblx0XHRcdGN4ID0gbmVpZ2hib3JzW2ldWzBdO1xuXHRcdFx0Y3kgPSBuZWlnaGJvcnNbaV1bMV07XG5cdFx0XHRBID0gYW5nbGUgKiAoaSAtIDAuNSk7XG5cdFx0XHRCID0gQSArIGFuZ2xlO1xuXHRcdFx0XG5cdFx0XHRibG9ja3MgPSAhdGhpcy5fbGlnaHRQYXNzZXMoY3gsIGN5KTtcblx0XHRcdGlmICh0aGlzLl92aXNpYmxlQ29vcmRzKE1hdGguZmxvb3IoQSksIE1hdGguY2VpbChCKSwgYmxvY2tzLCBEQVRBKSkgeyBjYWxsYmFjayhjeCwgY3ksIHIsIDEpOyB9XG5cdFx0XHRcblx0XHRcdGlmIChEQVRBLmxlbmd0aCA9PSAyICYmIERBVEFbMF0gPT0gMCAmJiBEQVRBWzFdID09IDM2MCkgeyByZXR1cm47IH0gLyogY3V0b2ZmPyAqL1xuXG5cdFx0fSAvKiBmb3IgYWxsIGNlbGxzIGluIHRoaXMgcmluZyAqL1xuXHR9IC8qIGZvciBhbGwgcmluZ3MgKi9cbn1cblxuLyoqXG4gKiBAcGFyYW0ge2ludH0gQSBzdGFydCBhbmdsZVxuICogQHBhcmFtIHtpbnR9IEIgZW5kIGFuZ2xlXG4gKiBAcGFyYW0ge2Jvb2x9IGJsb2NrcyBEb2VzIGN1cnJlbnQgY2VsbCBibG9jayB2aXNpYmlsaXR5P1xuICogQHBhcmFtIHtpbnRbXVtdfSBEQVRBIHNoYWRvd2VkIGFuZ2xlIHBhaXJzXG4gKi9cblJPVC5GT1YuRGlzY3JldGVTaGFkb3djYXN0aW5nLnByb3RvdHlwZS5fdmlzaWJsZUNvb3JkcyA9IGZ1bmN0aW9uKEEsIEIsIGJsb2NrcywgREFUQSkge1xuXHRpZiAoQSA8IDApIHsgXG5cdFx0dmFyIHYxID0gYXJndW1lbnRzLmNhbGxlZSgwLCBCLCBibG9ja3MsIERBVEEpO1xuXHRcdHZhciB2MiA9IGFyZ3VtZW50cy5jYWxsZWUoMzYwK0EsIDM2MCwgYmxvY2tzLCBEQVRBKTtcblx0XHRyZXR1cm4gdjEgfHwgdjI7XG5cdH1cblx0XG5cdHZhciBpbmRleCA9IDA7XG5cdHdoaWxlIChpbmRleCA8IERBVEEubGVuZ3RoICYmIERBVEFbaW5kZXhdIDwgQSkgeyBpbmRleCsrOyB9XG5cdFxuXHRpZiAoaW5kZXggPT0gREFUQS5sZW5ndGgpIHsgLyogY29tcGxldGVseSBuZXcgc2hhZG93ICovXG5cdFx0aWYgKGJsb2NrcykgeyBEQVRBLnB1c2goQSwgQik7IH0gXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0XG5cdHZhciBjb3VudCA9IDA7XG5cdFxuXHRpZiAoaW5kZXggJSAyKSB7IC8qIHRoaXMgc2hhZG93IHN0YXJ0cyBpbiBhbiBleGlzdGluZyBzaGFkb3csIG9yIHdpdGhpbiBpdHMgZW5kaW5nIGJvdW5kYXJ5ICovXG5cdFx0d2hpbGUgKGluZGV4IDwgREFUQS5sZW5ndGggJiYgREFUQVtpbmRleF0gPCBCKSB7XG5cdFx0XHRpbmRleCsrO1xuXHRcdFx0Y291bnQrKztcblx0XHR9XG5cdFx0XG5cdFx0aWYgKGNvdW50ID09IDApIHsgcmV0dXJuIGZhbHNlOyB9XG5cdFx0XG5cdFx0aWYgKGJsb2NrcykgeyBcblx0XHRcdGlmIChjb3VudCAlIDIpIHtcblx0XHRcdFx0REFUQS5zcGxpY2UoaW5kZXgtY291bnQsIGNvdW50LCBCKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdERBVEEuc3BsaWNlKGluZGV4LWNvdW50LCBjb3VudCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiB0cnVlO1xuXG5cdH0gZWxzZSB7IC8qIHRoaXMgc2hhZG93IHN0YXJ0cyBvdXRzaWRlIGFuIGV4aXN0aW5nIHNoYWRvdywgb3Igd2l0aGluIGEgc3RhcnRpbmcgYm91bmRhcnkgKi9cblx0XHR3aGlsZSAoaW5kZXggPCBEQVRBLmxlbmd0aCAmJiBEQVRBW2luZGV4XSA8IEIpIHtcblx0XHRcdGluZGV4Kys7XG5cdFx0XHRjb3VudCsrO1xuXHRcdH1cblx0XHRcblx0XHQvKiB2aXNpYmxlIHdoZW4gb3V0c2lkZSBhbiBleGlzdGluZyBzaGFkb3csIG9yIHdoZW4gb3ZlcmxhcHBpbmcgKi9cblx0XHRpZiAoQSA9PSBEQVRBW2luZGV4LWNvdW50XSAmJiBjb3VudCA9PSAxKSB7IHJldHVybiBmYWxzZTsgfVxuXHRcdFxuXHRcdGlmIChibG9ja3MpIHsgXG5cdFx0XHRpZiAoY291bnQgJSAyKSB7XG5cdFx0XHRcdERBVEEuc3BsaWNlKGluZGV4LWNvdW50LCBjb3VudCwgQSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHREQVRBLnNwbGljZShpbmRleC1jb3VudCwgY291bnQsIEEsIEIpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcdFxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG59XG4vKipcbiAqIEBjbGFzcyBQcmVjaXNlIHNoYWRvd2Nhc3RpbmcgYWxnb3JpdGhtXG4gKiBAYXVnbWVudHMgUk9ULkZPVlxuICovXG5ST1QuRk9WLlByZWNpc2VTaGFkb3djYXN0aW5nID0gZnVuY3Rpb24obGlnaHRQYXNzZXNDYWxsYmFjaywgb3B0aW9ucykge1xuXHRST1QuRk9WLmNhbGwodGhpcywgbGlnaHRQYXNzZXNDYWxsYmFjaywgb3B0aW9ucyk7XG59XG5ST1QuRk9WLlByZWNpc2VTaGFkb3djYXN0aW5nLmV4dGVuZChST1QuRk9WKTtcblxuLyoqXG4gKiBAc2VlIFJPVC5GT1YjY29tcHV0ZVxuICovXG5ST1QuRk9WLlByZWNpc2VTaGFkb3djYXN0aW5nLnByb3RvdHlwZS5jb21wdXRlID0gZnVuY3Rpb24oeCwgeSwgUiwgY2FsbGJhY2spIHtcblx0LyogdGhpcyBwbGFjZSBpcyBhbHdheXMgdmlzaWJsZSAqL1xuXHRjYWxsYmFjayh4LCB5LCAwLCAxKTtcblxuXHQvKiBzdGFuZGluZyBpbiBhIGRhcmsgcGxhY2UuIEZJWE1FIGlzIHRoaXMgYSBnb29kIGlkZWE/ICAqL1xuXHRpZiAoIXRoaXMuX2xpZ2h0UGFzc2VzKHgsIHkpKSB7IHJldHVybjsgfVxuXHRcblx0LyogbGlzdCBvZiBhbGwgc2hhZG93cyAqL1xuXHR2YXIgU0hBRE9XUyA9IFtdO1xuXHRcblx0dmFyIGN4LCBjeSwgYmxvY2tzLCBBMSwgQTIsIHZpc2liaWxpdHk7XG5cblx0LyogYW5hbHl6ZSBzdXJyb3VuZGluZyBjZWxscyBpbiBjb25jZW50cmljIHJpbmdzLCBzdGFydGluZyBmcm9tIHRoZSBjZW50ZXIgKi9cblx0Zm9yICh2YXIgcj0xOyByPD1SOyByKyspIHtcblx0XHR2YXIgbmVpZ2hib3JzID0gdGhpcy5fZ2V0Q2lyY2xlKHgsIHksIHIpO1xuXHRcdHZhciBuZWlnaGJvckNvdW50ID0gbmVpZ2hib3JzLmxlbmd0aDtcblxuXHRcdGZvciAodmFyIGk9MDtpPG5laWdoYm9yQ291bnQ7aSsrKSB7XG5cdFx0XHRjeCA9IG5laWdoYm9yc1tpXVswXTtcblx0XHRcdGN5ID0gbmVpZ2hib3JzW2ldWzFdO1xuXHRcdFx0Lyogc2hpZnQgaGFsZi1hbi1hbmdsZSBiYWNrd2FyZHMgdG8gbWFpbnRhaW4gY29uc2lzdGVuY3kgb2YgMC10aCBjZWxscyAqL1xuXHRcdFx0QTEgPSBbaSA/IDIqaS0xIDogMipuZWlnaGJvckNvdW50LTEsIDIqbmVpZ2hib3JDb3VudF07XG5cdFx0XHRBMiA9IFsyKmkrMSwgMipuZWlnaGJvckNvdW50XTsgXG5cdFx0XHRcblx0XHRcdGJsb2NrcyA9ICF0aGlzLl9saWdodFBhc3NlcyhjeCwgY3kpO1xuXHRcdFx0dmlzaWJpbGl0eSA9IHRoaXMuX2NoZWNrVmlzaWJpbGl0eShBMSwgQTIsIGJsb2NrcywgU0hBRE9XUyk7XG5cdFx0XHRpZiAodmlzaWJpbGl0eSkgeyBjYWxsYmFjayhjeCwgY3ksIHIsIHZpc2liaWxpdHkpOyB9XG5cblx0XHRcdGlmIChTSEFET1dTLmxlbmd0aCA9PSAyICYmIFNIQURPV1NbMF1bMF0gPT0gMCAmJiBTSEFET1dTWzFdWzBdID09IFNIQURPV1NbMV1bMV0pIHsgcmV0dXJuOyB9IC8qIGN1dG9mZj8gKi9cblxuXHRcdH0gLyogZm9yIGFsbCBjZWxscyBpbiB0aGlzIHJpbmcgKi9cblx0fSAvKiBmb3IgYWxsIHJpbmdzICovXG59XG5cbi8qKlxuICogQHBhcmFtIHtpbnRbMl19IEExIGFyYyBzdGFydFxuICogQHBhcmFtIHtpbnRbMl19IEEyIGFyYyBlbmRcbiAqIEBwYXJhbSB7Ym9vbH0gYmxvY2tzIERvZXMgY3VycmVudCBhcmMgYmxvY2sgdmlzaWJpbGl0eT9cbiAqIEBwYXJhbSB7aW50W11bXX0gU0hBRE9XUyBsaXN0IG9mIGFjdGl2ZSBzaGFkb3dzXG4gKi9cblJPVC5GT1YuUHJlY2lzZVNoYWRvd2Nhc3RpbmcucHJvdG90eXBlLl9jaGVja1Zpc2liaWxpdHkgPSBmdW5jdGlvbihBMSwgQTIsIGJsb2NrcywgU0hBRE9XUykge1xuXHRpZiAoQTFbMF0gPiBBMlswXSkgeyAvKiBzcGxpdCBpbnRvIHR3byBzdWItYXJjcyAqL1xuXHRcdHZhciB2MSA9IHRoaXMuX2NoZWNrVmlzaWJpbGl0eShBMSwgW0ExWzFdLCBBMVsxXV0sIGJsb2NrcywgU0hBRE9XUyk7XG5cdFx0dmFyIHYyID0gdGhpcy5fY2hlY2tWaXNpYmlsaXR5KFswLCAxXSwgQTIsIGJsb2NrcywgU0hBRE9XUyk7XG5cdFx0cmV0dXJuICh2MSt2MikvMjtcblx0fVxuXG5cdC8qIGluZGV4MTogZmlyc3Qgc2hhZG93ID49IEExICovXG5cdHZhciBpbmRleDEgPSAwLCBlZGdlMSA9IGZhbHNlO1xuXHR3aGlsZSAoaW5kZXgxIDwgU0hBRE9XUy5sZW5ndGgpIHtcblx0XHR2YXIgb2xkID0gU0hBRE9XU1tpbmRleDFdO1xuXHRcdHZhciBkaWZmID0gb2xkWzBdKkExWzFdIC0gQTFbMF0qb2xkWzFdO1xuXHRcdGlmIChkaWZmID49IDApIHsgLyogb2xkID49IEExICovXG5cdFx0XHRpZiAoZGlmZiA9PSAwICYmICEoaW5kZXgxICUgMikpIHsgZWRnZTEgPSB0cnVlOyB9XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdFx0aW5kZXgxKys7XG5cdH1cblxuXHQvKiBpbmRleDI6IGxhc3Qgc2hhZG93IDw9IEEyICovXG5cdHZhciBpbmRleDIgPSBTSEFET1dTLmxlbmd0aCwgZWRnZTIgPSBmYWxzZTtcblx0d2hpbGUgKGluZGV4Mi0tKSB7XG5cdFx0dmFyIG9sZCA9IFNIQURPV1NbaW5kZXgyXTtcblx0XHR2YXIgZGlmZiA9IEEyWzBdKm9sZFsxXSAtIG9sZFswXSpBMlsxXTtcblx0XHRpZiAoZGlmZiA+PSAwKSB7IC8qIG9sZCA8PSBBMiAqL1xuXHRcdFx0aWYgKGRpZmYgPT0gMCAmJiAoaW5kZXgyICUgMikpIHsgZWRnZTIgPSB0cnVlOyB9XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHR2YXIgdmlzaWJsZSA9IHRydWU7XG5cdGlmIChpbmRleDEgPT0gaW5kZXgyICYmIChlZGdlMSB8fCBlZGdlMikpIHsgIC8qIHN1YnNldCBvZiBleGlzdGluZyBzaGFkb3csIG9uZSBvZiB0aGUgZWRnZXMgbWF0Y2ggKi9cblx0XHR2aXNpYmxlID0gZmFsc2U7IFxuXHR9IGVsc2UgaWYgKGVkZ2UxICYmIGVkZ2UyICYmIGluZGV4MSsxPT1pbmRleDIgJiYgKGluZGV4MiAlIDIpKSB7IC8qIGNvbXBsZXRlbHkgZXF1aXZhbGVudCB3aXRoIGV4aXN0aW5nIHNoYWRvdyAqL1xuXHRcdHZpc2libGUgPSBmYWxzZTtcblx0fSBlbHNlIGlmIChpbmRleDEgPiBpbmRleDIgJiYgKGluZGV4MSAlIDIpKSB7IC8qIHN1YnNldCBvZiBleGlzdGluZyBzaGFkb3csIG5vdCB0b3VjaGluZyAqL1xuXHRcdHZpc2libGUgPSBmYWxzZTtcblx0fVxuXHRcblx0aWYgKCF2aXNpYmxlKSB7IHJldHVybiAwOyB9IC8qIGZhc3QgY2FzZTogbm90IHZpc2libGUgKi9cblx0XG5cdHZhciB2aXNpYmxlTGVuZ3RoLCBQO1xuXG5cdC8qIGNvbXB1dGUgdGhlIGxlbmd0aCBvZiB2aXNpYmxlIGFyYywgYWRqdXN0IGxpc3Qgb2Ygc2hhZG93cyAoaWYgYmxvY2tpbmcpICovXG5cdHZhciByZW1vdmUgPSBpbmRleDItaW5kZXgxKzE7XG5cdGlmIChyZW1vdmUgJSAyKSB7XG5cdFx0aWYgKGluZGV4MSAlIDIpIHsgLyogZmlyc3QgZWRnZSB3aXRoaW4gZXhpc3Rpbmcgc2hhZG93LCBzZWNvbmQgb3V0c2lkZSAqL1xuXHRcdFx0dmFyIFAgPSBTSEFET1dTW2luZGV4MV07XG5cdFx0XHR2aXNpYmxlTGVuZ3RoID0gKEEyWzBdKlBbMV0gLSBQWzBdKkEyWzFdKSAvIChQWzFdICogQTJbMV0pO1xuXHRcdFx0aWYgKGJsb2NrcykgeyBTSEFET1dTLnNwbGljZShpbmRleDEsIHJlbW92ZSwgQTIpOyB9XG5cdFx0fSBlbHNlIHsgLyogc2Vjb25kIGVkZ2Ugd2l0aGluIGV4aXN0aW5nIHNoYWRvdywgZmlyc3Qgb3V0c2lkZSAqL1xuXHRcdFx0dmFyIFAgPSBTSEFET1dTW2luZGV4Ml07XG5cdFx0XHR2aXNpYmxlTGVuZ3RoID0gKFBbMF0qQTFbMV0gLSBBMVswXSpQWzFdKSAvIChBMVsxXSAqIFBbMV0pO1xuXHRcdFx0aWYgKGJsb2NrcykgeyBTSEFET1dTLnNwbGljZShpbmRleDEsIHJlbW92ZSwgQTEpOyB9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGlmIChpbmRleDEgJSAyKSB7IC8qIGJvdGggZWRnZXMgd2l0aGluIGV4aXN0aW5nIHNoYWRvd3MgKi9cblx0XHRcdHZhciBQMSA9IFNIQURPV1NbaW5kZXgxXTtcblx0XHRcdHZhciBQMiA9IFNIQURPV1NbaW5kZXgyXTtcblx0XHRcdHZpc2libGVMZW5ndGggPSAoUDJbMF0qUDFbMV0gLSBQMVswXSpQMlsxXSkgLyAoUDFbMV0gKiBQMlsxXSk7XG5cdFx0XHRpZiAoYmxvY2tzKSB7IFNIQURPV1Muc3BsaWNlKGluZGV4MSwgcmVtb3ZlKTsgfVxuXHRcdH0gZWxzZSB7IC8qIGJvdGggZWRnZXMgb3V0c2lkZSBleGlzdGluZyBzaGFkb3dzICovXG5cdFx0XHRpZiAoYmxvY2tzKSB7IFNIQURPV1Muc3BsaWNlKGluZGV4MSwgcmVtb3ZlLCBBMSwgQTIpOyB9XG5cdFx0XHRyZXR1cm4gMTsgLyogd2hvbGUgYXJjIHZpc2libGUhICovXG5cdFx0fVxuXHR9XG5cblx0dmFyIGFyY0xlbmd0aCA9IChBMlswXSpBMVsxXSAtIEExWzBdKkEyWzFdKSAvIChBMVsxXSAqIEEyWzFdKTtcblxuXHRyZXR1cm4gdmlzaWJsZUxlbmd0aC9hcmNMZW5ndGg7XG59XG4vKipcbiAqIEBjbGFzcyBSZWN1cnNpdmUgc2hhZG93Y2FzdGluZyBhbGdvcml0aG1cbiAqIEN1cnJlbnRseSBvbmx5IHN1cHBvcnRzIDQvOCB0b3BvbG9naWVzLCBub3QgaGV4YWdvbmFsLlxuICogQmFzZWQgb24gUGV0ZXIgSGFya2lucycgaW1wbGVtZW50YXRpb24gb2YgQmrDtnJuIEJlcmdzdHLDtm0ncyBhbGdvcml0aG0gZGVzY3JpYmVkIGhlcmU6IGh0dHA6Ly93d3cucm9ndWViYXNpbi5jb20vaW5kZXgucGhwP3RpdGxlPUZPVl91c2luZ19yZWN1cnNpdmVfc2hhZG93Y2FzdGluZ1xuICogQGF1Z21lbnRzIFJPVC5GT1ZcbiAqL1xuUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nID0gZnVuY3Rpb24obGlnaHRQYXNzZXNDYWxsYmFjaywgb3B0aW9ucykge1xuXHRST1QuRk9WLmNhbGwodGhpcywgbGlnaHRQYXNzZXNDYWxsYmFjaywgb3B0aW9ucyk7XG59XG5ST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcuZXh0ZW5kKFJPVC5GT1YpO1xuXG4vKiogT2N0YW50cyB1c2VkIGZvciB0cmFuc2xhdGluZyByZWN1cnNpdmUgc2hhZG93Y2FzdGluZyBvZmZzZXRzICovXG5ST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcuT0NUQU5UUyA9IFtcblx0Wy0xLCAgMCwgIDAsICAxXSxcblx0WyAwLCAtMSwgIDEsICAwXSxcblx0WyAwLCAtMSwgLTEsICAwXSxcblx0Wy0xLCAgMCwgIDAsIC0xXSxcblx0WyAxLCAgMCwgIDAsIC0xXSxcblx0WyAwLCAgMSwgLTEsICAwXSxcblx0WyAwLCAgMSwgIDEsICAwXSxcblx0WyAxLCAgMCwgIDAsICAxXVxuXTtcblxuLyoqXG4gKiBDb21wdXRlIHZpc2liaWxpdHkgZm9yIGEgMzYwLWRlZ3JlZSBjaXJjbGVcbiAqIEBwYXJhbSB7aW50fSB4XG4gKiBAcGFyYW0ge2ludH0geVxuICogQHBhcmFtIHtpbnR9IFIgTWF4aW11bSB2aXNpYmlsaXR5IHJhZGl1c1xuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAqL1xuUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLnByb3RvdHlwZS5jb21wdXRlID0gZnVuY3Rpb24oeCwgeSwgUiwgY2FsbGJhY2spIHtcblx0Ly9Zb3UgY2FuIGFsd2F5cyBzZWUgeW91ciBvd24gdGlsZVxuXHRjYWxsYmFjayh4LCB5LCAwLCB0cnVlKTtcblx0Zm9yKHZhciBpID0gMDsgaSA8IFJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZy5PQ1RBTlRTLmxlbmd0aDsgaSsrKSB7XG5cdFx0dGhpcy5fcmVuZGVyT2N0YW50KHgsIHksIFJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZy5PQ1RBTlRTW2ldLCBSLCBjYWxsYmFjayk7XG5cdH1cbn1cblxuLyoqXG4gKiBDb21wdXRlIHZpc2liaWxpdHkgZm9yIGEgMTgwLWRlZ3JlZSBhcmNcbiAqIEBwYXJhbSB7aW50fSB4XG4gKiBAcGFyYW0ge2ludH0geVxuICogQHBhcmFtIHtpbnR9IFIgTWF4aW11bSB2aXNpYmlsaXR5IHJhZGl1c1xuICogQHBhcmFtIHtpbnR9IGRpciBEaXJlY3Rpb24gdG8gbG9vayBpbiAoZXhwcmVzc2VkIGluIGEgUk9ULkRJUiB2YWx1ZSk7XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICovXG5ST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcucHJvdG90eXBlLmNvbXB1dGUxODAgPSBmdW5jdGlvbih4LCB5LCBSLCBkaXIsIGNhbGxiYWNrKSB7XG5cdC8vWW91IGNhbiBhbHdheXMgc2VlIHlvdXIgb3duIHRpbGVcblx0Y2FsbGJhY2soeCwgeSwgMCwgdHJ1ZSk7XG5cdHZhciBwcmV2aW91c09jdGFudCA9IChkaXIgLSAxICsgOCkgJSA4OyAvL05lZWQgdG8gcmV0cmlldmUgdGhlIHByZXZpb3VzIG9jdGFudCB0byByZW5kZXIgYSBmdWxsIDE4MCBkZWdyZWVzXG5cdHZhciBuZXh0UHJldmlvdXNPY3RhbnQgPSAoZGlyIC0gMiArIDgpICUgODsgLy9OZWVkIHRvIHJldHJpZXZlIHRoZSBwcmV2aW91cyB0d28gb2N0YW50cyB0byByZW5kZXIgYSBmdWxsIDE4MCBkZWdyZWVzXG5cdHZhciBuZXh0T2N0YW50ID0gKGRpcisgMSArIDgpICUgODsgLy9OZWVkIHRvIGdyYWIgdG8gbmV4dCBvY3RhbnQgdG8gcmVuZGVyIGEgZnVsbCAxODAgZGVncmVlc1xuXHR0aGlzLl9yZW5kZXJPY3RhbnQoeCwgeSwgUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLk9DVEFOVFNbbmV4dFByZXZpb3VzT2N0YW50XSwgUiwgY2FsbGJhY2spO1xuXHR0aGlzLl9yZW5kZXJPY3RhbnQoeCwgeSwgUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLk9DVEFOVFNbcHJldmlvdXNPY3RhbnRdLCBSLCBjYWxsYmFjayk7XG5cdHRoaXMuX3JlbmRlck9jdGFudCh4LCB5LCBST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcuT0NUQU5UU1tkaXJdLCBSLCBjYWxsYmFjayk7XG5cdHRoaXMuX3JlbmRlck9jdGFudCh4LCB5LCBST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcuT0NUQU5UU1tuZXh0T2N0YW50XSwgUiwgY2FsbGJhY2spO1xufVxuXG4vKipcbiAqIENvbXB1dGUgdmlzaWJpbGl0eSBmb3IgYSA5MC1kZWdyZWUgYXJjXG4gKiBAcGFyYW0ge2ludH0geFxuICogQHBhcmFtIHtpbnR9IHlcbiAqIEBwYXJhbSB7aW50fSBSIE1heGltdW0gdmlzaWJpbGl0eSByYWRpdXNcbiAqIEBwYXJhbSB7aW50fSBkaXIgRGlyZWN0aW9uIHRvIGxvb2sgaW4gKGV4cHJlc3NlZCBpbiBhIFJPVC5ESVIgdmFsdWUpO1xuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAqL1xuUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLnByb3RvdHlwZS5jb21wdXRlOTAgPSBmdW5jdGlvbih4LCB5LCBSLCBkaXIsIGNhbGxiYWNrKSB7XG5cdC8vWW91IGNhbiBhbHdheXMgc2VlIHlvdXIgb3duIHRpbGVcblx0Y2FsbGJhY2soeCwgeSwgMCwgdHJ1ZSk7XG5cdHZhciBwcmV2aW91c09jdGFudCA9IChkaXIgLSAxICsgOCkgJSA4OyAvL05lZWQgdG8gcmV0cmlldmUgdGhlIHByZXZpb3VzIG9jdGFudCB0byByZW5kZXIgYSBmdWxsIDkwIGRlZ3JlZXNcblx0dGhpcy5fcmVuZGVyT2N0YW50KHgsIHksIFJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZy5PQ1RBTlRTW2Rpcl0sIFIsIGNhbGxiYWNrKTtcblx0dGhpcy5fcmVuZGVyT2N0YW50KHgsIHksIFJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZy5PQ1RBTlRTW3ByZXZpb3VzT2N0YW50XSwgUiwgY2FsbGJhY2spO1xufVxuXG4vKipcbiAqIFJlbmRlciBvbmUgb2N0YW50ICg0NS1kZWdyZWUgYXJjKSBvZiB0aGUgdmlld3NoZWRcbiAqIEBwYXJhbSB7aW50fSB4XG4gKiBAcGFyYW0ge2ludH0geVxuICogQHBhcmFtIHtpbnR9IG9jdGFudCBPY3RhbnQgdG8gYmUgcmVuZGVyZWRcbiAqIEBwYXJhbSB7aW50fSBSIE1heGltdW0gdmlzaWJpbGl0eSByYWRpdXNcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gKi9cblJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZy5wcm90b3R5cGUuX3JlbmRlck9jdGFudCA9IGZ1bmN0aW9uKHgsIHksIG9jdGFudCwgUiwgY2FsbGJhY2spIHtcblx0Ly9SYWRpdXMgaW5jcmVtZW50ZWQgYnkgMSB0byBwcm92aWRlIHNhbWUgY292ZXJhZ2UgYXJlYSBhcyBvdGhlciBzaGFkb3djYXN0aW5nIHJhZGl1c2VzXG5cdHRoaXMuX2Nhc3RWaXNpYmlsaXR5KHgsIHksIDEsIDEuMCwgMC4wLCBSICsgMSwgb2N0YW50WzBdLCBvY3RhbnRbMV0sIG9jdGFudFsyXSwgb2N0YW50WzNdLCBjYWxsYmFjayk7XG59XG5cbi8qKlxuICogQWN0dWFsbHkgY2FsY3VsYXRlcyB0aGUgdmlzaWJpbGl0eVxuICogQHBhcmFtIHtpbnR9IHN0YXJ0WCBUaGUgc3RhcnRpbmcgWCBjb29yZGluYXRlXG4gKiBAcGFyYW0ge2ludH0gc3RhcnRZIFRoZSBzdGFydGluZyBZIGNvb3JkaW5hdGVcbiAqIEBwYXJhbSB7aW50fSByb3cgVGhlIHJvdyB0byByZW5kZXJcbiAqIEBwYXJhbSB7ZmxvYXR9IHZpc1Nsb3BlU3RhcnQgVGhlIHNsb3BlIHRvIHN0YXJ0IGF0XG4gKiBAcGFyYW0ge2Zsb2F0fSB2aXNTbG9wZUVuZCBUaGUgc2xvcGUgdG8gZW5kIGF0XG4gKiBAcGFyYW0ge2ludH0gcmFkaXVzIFRoZSByYWRpdXMgdG8gcmVhY2ggb3V0IHRvXG4gKiBAcGFyYW0ge2ludH0geHggXG4gKiBAcGFyYW0ge2ludH0geHkgXG4gKiBAcGFyYW0ge2ludH0geXggXG4gKiBAcGFyYW0ge2ludH0geXkgXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgY2FsbGJhY2sgdG8gdXNlIHdoZW4gd2UgaGl0IGEgYmxvY2sgdGhhdCBpcyB2aXNpYmxlXG4gKi9cblJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZy5wcm90b3R5cGUuX2Nhc3RWaXNpYmlsaXR5ID0gZnVuY3Rpb24oc3RhcnRYLCBzdGFydFksIHJvdywgdmlzU2xvcGVTdGFydCwgdmlzU2xvcGVFbmQsIHJhZGl1cywgeHgsIHh5LCB5eCwgeXksIGNhbGxiYWNrKSB7XG5cdGlmKHZpc1Nsb3BlU3RhcnQgPCB2aXNTbG9wZUVuZCkgeyByZXR1cm47IH1cblx0Zm9yKHZhciBpID0gcm93OyBpIDw9IHJhZGl1czsgaSsrKSB7XG5cdFx0dmFyIGR4ID0gLWkgLSAxO1xuXHRcdHZhciBkeSA9IC1pO1xuXHRcdHZhciBibG9ja2VkID0gZmFsc2U7XG5cdFx0dmFyIG5ld1N0YXJ0ID0gMDtcblxuXHRcdC8vJ1JvdycgY291bGQgYmUgY29sdW1uLCBuYW1lcyBoZXJlIGFzc3VtZSBvY3RhbnQgMCBhbmQgd291bGQgYmUgZmxpcHBlZCBmb3IgaGFsZiB0aGUgb2N0YW50c1xuXHRcdHdoaWxlKGR4IDw9IDApIHtcblx0XHRcdGR4ICs9IDE7XG5cblx0XHRcdC8vVHJhbnNsYXRlIGZyb20gcmVsYXRpdmUgY29vcmRpbmF0ZXMgdG8gbWFwIGNvb3JkaW5hdGVzXG5cdFx0XHR2YXIgbWFwWCA9IHN0YXJ0WCArIGR4ICogeHggKyBkeSAqIHh5O1xuXHRcdFx0dmFyIG1hcFkgPSBzdGFydFkgKyBkeCAqIHl4ICsgZHkgKiB5eTtcblxuXHRcdFx0Ly9SYW5nZSBvZiB0aGUgcm93XG5cdFx0XHR2YXIgc2xvcGVTdGFydCA9IChkeCAtIDAuNSkgLyAoZHkgKyAwLjUpO1xuXHRcdFx0dmFyIHNsb3BlRW5kID0gKGR4ICsgMC41KSAvIChkeSAtIDAuNSk7XG5cdFx0XG5cdFx0XHQvL0lnbm9yZSBpZiBub3QgeWV0IGF0IGxlZnQgZWRnZSBvZiBPY3RhbnRcblx0XHRcdGlmKHNsb3BlRW5kID4gdmlzU2xvcGVTdGFydCkgeyBjb250aW51ZTsgfVxuXHRcdFx0XG5cdFx0XHQvL0RvbmUgaWYgcGFzdCByaWdodCBlZGdlXG5cdFx0XHRpZihzbG9wZVN0YXJ0IDwgdmlzU2xvcGVFbmQpIHsgYnJlYWs7IH1cblx0XHRcdFx0XG5cdFx0XHQvL0lmIGl0J3MgaW4gcmFuZ2UsIGl0J3MgdmlzaWJsZVxuXHRcdFx0aWYoKGR4ICogZHggKyBkeSAqIGR5KSA8IChyYWRpdXMgKiByYWRpdXMpKSB7XG5cdFx0XHRcdGNhbGxiYWNrKG1hcFgsIG1hcFksIGksIHRydWUpO1xuXHRcdFx0fVxuXHRcblx0XHRcdGlmKCFibG9ja2VkKSB7XG5cdFx0XHRcdC8vSWYgdGlsZSBpcyBhIGJsb2NraW5nIHRpbGUsIGNhc3QgYXJvdW5kIGl0XG5cdFx0XHRcdGlmKCF0aGlzLl9saWdodFBhc3NlcyhtYXBYLCBtYXBZKSAmJiBpIDwgcmFkaXVzKSB7XG5cdFx0XHRcdFx0YmxvY2tlZCA9IHRydWU7XG5cdFx0XHRcdFx0dGhpcy5fY2FzdFZpc2liaWxpdHkoc3RhcnRYLCBzdGFydFksIGkgKyAxLCB2aXNTbG9wZVN0YXJ0LCBzbG9wZVN0YXJ0LCByYWRpdXMsIHh4LCB4eSwgeXgsIHl5LCBjYWxsYmFjayk7XG5cdFx0XHRcdFx0bmV3U3RhcnQgPSBzbG9wZUVuZDtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly9LZWVwIG5hcnJvd2luZyBpZiBzY2FubmluZyBhY3Jvc3MgYSBibG9ja1xuXHRcdFx0XHRpZighdGhpcy5fbGlnaHRQYXNzZXMobWFwWCwgbWFwWSkpIHtcblx0XHRcdFx0XHRuZXdTdGFydCA9IHNsb3BlRW5kO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcblx0XHRcdFx0Ly9CbG9jayBoYXMgZW5kZWRcblx0XHRcdFx0YmxvY2tlZCA9IGZhbHNlO1xuXHRcdFx0XHR2aXNTbG9wZVN0YXJ0ID0gbmV3U3RhcnQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKGJsb2NrZWQpIHsgYnJlYWs7IH1cblx0fVxufVxuLyoqXG4gKiBAbmFtZXNwYWNlIENvbG9yIG9wZXJhdGlvbnNcbiAqL1xuUk9ULkNvbG9yID0ge1xuXHRmcm9tU3RyaW5nOiBmdW5jdGlvbihzdHIpIHtcblx0XHR2YXIgY2FjaGVkLCByO1xuXHRcdGlmIChzdHIgaW4gdGhpcy5fY2FjaGUpIHtcblx0XHRcdGNhY2hlZCA9IHRoaXMuX2NhY2hlW3N0cl07XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmIChzdHIuY2hhckF0KDApID09IFwiI1wiKSB7IC8qIGhleCByZ2IgKi9cblxuXHRcdFx0XHR2YXIgdmFsdWVzID0gc3RyLm1hdGNoKC9bMC05YS1mXS9naSkubWFwKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHBhcnNlSW50KHgsIDE2KTsgfSk7XG5cdFx0XHRcdGlmICh2YWx1ZXMubGVuZ3RoID09IDMpIHtcblx0XHRcdFx0XHRjYWNoZWQgPSB2YWx1ZXMubWFwKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHgqMTc7IH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZvciAodmFyIGk9MDtpPDM7aSsrKSB7XG5cdFx0XHRcdFx0XHR2YWx1ZXNbaSsxXSArPSAxNip2YWx1ZXNbaV07XG5cdFx0XHRcdFx0XHR2YWx1ZXMuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYWNoZWQgPSB2YWx1ZXM7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIGlmIChyID0gc3RyLm1hdGNoKC9yZ2JcXCgoWzAtOSwgXSspXFwpL2kpKSB7IC8qIGRlY2ltYWwgcmdiICovXG5cdFx0XHRcdGNhY2hlZCA9IHJbMV0uc3BsaXQoL1xccyosXFxzKi8pLm1hcChmdW5jdGlvbih4KSB7IHJldHVybiBwYXJzZUludCh4KTsgfSk7XG5cdFx0XHR9IGVsc2UgeyAvKiBodG1sIG5hbWUgKi9cblx0XHRcdFx0Y2FjaGVkID0gWzAsIDAsIDBdO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl9jYWNoZVtzdHJdID0gY2FjaGVkO1xuXHRcdH1cblxuXHRcdHJldHVybiBjYWNoZWQuc2xpY2UoKTtcblx0fSxcblxuXHQvKipcblx0ICogQWRkIHR3byBvciBtb3JlIGNvbG9yc1xuXHQgKiBAcGFyYW0ge251bWJlcltdfSBjb2xvcjFcblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3IyXG5cdCAqIEByZXR1cm5zIHtudW1iZXJbXX1cblx0ICovXG5cdGFkZDogZnVuY3Rpb24oY29sb3IxLCBjb2xvcjIpIHtcblx0XHR2YXIgcmVzdWx0ID0gY29sb3IxLnNsaWNlKCk7XG5cdFx0Zm9yICh2YXIgaT0wO2k8MztpKyspIHtcblx0XHRcdGZvciAodmFyIGo9MTtqPGFyZ3VtZW50cy5sZW5ndGg7aisrKSB7XG5cdFx0XHRcdHJlc3VsdFtpXSArPSBhcmd1bWVudHNbal1baV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEFkZCB0d28gb3IgbW9yZSBjb2xvcnMsIE1PRElGSUVTIEZJUlNUIEFSR1VNRU5UXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yMVxuXHQgKiBAcGFyYW0ge251bWJlcltdfSBjb2xvcjJcblx0ICogQHJldHVybnMge251bWJlcltdfVxuXHQgKi9cblx0YWRkXzogZnVuY3Rpb24oY29sb3IxLCBjb2xvcjIpIHtcblx0XHRmb3IgKHZhciBpPTA7aTwzO2krKykge1xuXHRcdFx0Zm9yICh2YXIgaj0xO2o8YXJndW1lbnRzLmxlbmd0aDtqKyspIHtcblx0XHRcdFx0Y29sb3IxW2ldICs9IGFyZ3VtZW50c1tqXVtpXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGNvbG9yMTtcblx0fSxcblxuXHQvKipcblx0ICogTXVsdGlwbHkgKG1peCkgdHdvIG9yIG1vcmUgY29sb3JzXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yMVxuXHQgKiBAcGFyYW0ge251bWJlcltdfSBjb2xvcjJcblx0ICogQHJldHVybnMge251bWJlcltdfVxuXHQgKi9cblx0bXVsdGlwbHk6IGZ1bmN0aW9uKGNvbG9yMSwgY29sb3IyKSB7XG5cdFx0dmFyIHJlc3VsdCA9IGNvbG9yMS5zbGljZSgpO1xuXHRcdGZvciAodmFyIGk9MDtpPDM7aSsrKSB7XG5cdFx0XHRmb3IgKHZhciBqPTE7ajxhcmd1bWVudHMubGVuZ3RoO2orKykge1xuXHRcdFx0XHRyZXN1bHRbaV0gKj0gYXJndW1lbnRzW2pdW2ldIC8gMjU1O1xuXHRcdFx0fVxuXHRcdFx0cmVzdWx0W2ldID0gTWF0aC5yb3VuZChyZXN1bHRbaV0pO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNdWx0aXBseSAobWl4KSB0d28gb3IgbW9yZSBjb2xvcnMsIE1PRElGSUVTIEZJUlNUIEFSR1VNRU5UXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yMVxuXHQgKiBAcGFyYW0ge251bWJlcltdfSBjb2xvcjJcblx0ICogQHJldHVybnMge251bWJlcltdfVxuXHQgKi9cblx0bXVsdGlwbHlfOiBmdW5jdGlvbihjb2xvcjEsIGNvbG9yMikge1xuXHRcdGZvciAodmFyIGk9MDtpPDM7aSsrKSB7XG5cdFx0XHRmb3IgKHZhciBqPTE7ajxhcmd1bWVudHMubGVuZ3RoO2orKykge1xuXHRcdFx0XHRjb2xvcjFbaV0gKj0gYXJndW1lbnRzW2pdW2ldIC8gMjU1O1xuXHRcdFx0fVxuXHRcdFx0Y29sb3IxW2ldID0gTWF0aC5yb3VuZChjb2xvcjFbaV0pO1xuXHRcdH1cblx0XHRyZXR1cm4gY29sb3IxO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbnRlcnBvbGF0ZSAoYmxlbmQpIHR3byBjb2xvcnMgd2l0aCBhIGdpdmVuIGZhY3RvclxuXHQgKiBAcGFyYW0ge251bWJlcltdfSBjb2xvcjFcblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3IyXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IFtmYWN0b3I9MC41XSAwLi4xXG5cdCAqIEByZXR1cm5zIHtudW1iZXJbXX1cblx0ICovXG5cdGludGVycG9sYXRlOiBmdW5jdGlvbihjb2xvcjEsIGNvbG9yMiwgZmFjdG9yKSB7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7IGZhY3RvciA9IDAuNTsgfVxuXHRcdHZhciByZXN1bHQgPSBjb2xvcjEuc2xpY2UoKTtcblx0XHRmb3IgKHZhciBpPTA7aTwzO2krKykge1xuXHRcdFx0cmVzdWx0W2ldID0gTWF0aC5yb3VuZChyZXN1bHRbaV0gKyBmYWN0b3IqKGNvbG9yMltpXS1jb2xvcjFbaV0pKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblxuXHQvKipcblx0ICogSW50ZXJwb2xhdGUgKGJsZW5kKSB0d28gY29sb3JzIHdpdGggYSBnaXZlbiBmYWN0b3IgaW4gSFNMIG1vZGVcblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3IxXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yMlxuXHQgKiBAcGFyYW0ge2Zsb2F0fSBbZmFjdG9yPTAuNV0gMC4uMVxuXHQgKiBAcmV0dXJucyB7bnVtYmVyW119XG5cdCAqL1xuXHRpbnRlcnBvbGF0ZUhTTDogZnVuY3Rpb24oY29sb3IxLCBjb2xvcjIsIGZhY3Rvcikge1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykgeyBmYWN0b3IgPSAwLjU7IH1cblx0XHR2YXIgaHNsMSA9IHRoaXMucmdiMmhzbChjb2xvcjEpO1xuXHRcdHZhciBoc2wyID0gdGhpcy5yZ2IyaHNsKGNvbG9yMik7XG5cdFx0Zm9yICh2YXIgaT0wO2k8MztpKyspIHtcblx0XHRcdGhzbDFbaV0gKz0gZmFjdG9yKihoc2wyW2ldLWhzbDFbaV0pO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5oc2wycmdiKGhzbDEpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBuZXcgcmFuZG9tIGNvbG9yIGJhc2VkIG9uIHRoaXMgb25lXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGRpZmYgU2V0IG9mIHN0YW5kYXJkIGRldmlhdGlvbnNcblx0ICogQHJldHVybnMge251bWJlcltdfVxuXHQgKi9cblx0cmFuZG9taXplOiBmdW5jdGlvbihjb2xvciwgZGlmZikge1xuXHRcdGlmICghKGRpZmYgaW5zdGFuY2VvZiBBcnJheSkpIHsgZGlmZiA9IFJPVC5STkcuZ2V0Tm9ybWFsKDAsIGRpZmYpOyB9XG5cdFx0dmFyIHJlc3VsdCA9IGNvbG9yLnNsaWNlKCk7XG5cdFx0Zm9yICh2YXIgaT0wO2k8MztpKyspIHtcblx0XHRcdHJlc3VsdFtpXSArPSAoZGlmZiBpbnN0YW5jZW9mIEFycmF5ID8gTWF0aC5yb3VuZChST1QuUk5HLmdldE5vcm1hbCgwLCBkaWZmW2ldKSkgOiBkaWZmKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblxuXHQvKipcblx0ICogQ29udmVydHMgYW4gUkdCIGNvbG9yIHZhbHVlIHRvIEhTTC4gRXhwZWN0cyAwLi4yNTUgaW5wdXRzLCBwcm9kdWNlcyAwLi4xIG91dHB1dHMuXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yXG5cdCAqIEByZXR1cm5zIHtudW1iZXJbXX1cblx0ICovXG5cdHJnYjJoc2w6IGZ1bmN0aW9uKGNvbG9yKSB7XG5cdFx0dmFyIHIgPSBjb2xvclswXS8yNTU7XG5cdFx0dmFyIGcgPSBjb2xvclsxXS8yNTU7XG5cdFx0dmFyIGIgPSBjb2xvclsyXS8yNTU7XG5cblx0XHR2YXIgbWF4ID0gTWF0aC5tYXgociwgZywgYiksIG1pbiA9IE1hdGgubWluKHIsIGcsIGIpO1xuXHRcdHZhciBoLCBzLCBsID0gKG1heCArIG1pbikgLyAyO1xuXG5cdFx0aWYgKG1heCA9PSBtaW4pIHtcblx0XHRcdGggPSBzID0gMDsgLy8gYWNocm9tYXRpY1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgZCA9IG1heCAtIG1pbjtcblx0XHRcdHMgPSAobCA+IDAuNSA/IGQgLyAoMiAtIG1heCAtIG1pbikgOiBkIC8gKG1heCArIG1pbikpO1xuXHRcdFx0c3dpdGNoKG1heCkge1xuXHRcdFx0XHRjYXNlIHI6IGggPSAoZyAtIGIpIC8gZCArIChnIDwgYiA/IDYgOiAwKTsgYnJlYWs7XG5cdFx0XHRcdGNhc2UgZzogaCA9IChiIC0gcikgLyBkICsgMjsgYnJlYWs7XG5cdFx0XHRcdGNhc2UgYjogaCA9IChyIC0gZykgLyBkICsgNDsgYnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRoIC89IDY7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFtoLCBzLCBsXTtcblx0fSxcblxuXHQvKipcblx0ICogQ29udmVydHMgYW4gSFNMIGNvbG9yIHZhbHVlIHRvIFJHQi4gRXhwZWN0cyAwLi4xIGlucHV0cywgcHJvZHVjZXMgMC4uMjU1IG91dHB1dHMuXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yXG5cdCAqIEByZXR1cm5zIHtudW1iZXJbXX1cblx0ICovXG5cdGhzbDJyZ2I6IGZ1bmN0aW9uKGNvbG9yKSB7XG5cdFx0dmFyIGwgPSBjb2xvclsyXTtcblxuXHRcdGlmIChjb2xvclsxXSA9PSAwKSB7XG5cdFx0XHRsID0gTWF0aC5yb3VuZChsKjI1NSk7XG5cdFx0XHRyZXR1cm4gW2wsIGwsIGxdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRmdW5jdGlvbiBodWUycmdiKHAsIHEsIHQpIHtcblx0XHRcdFx0aWYgKHQgPCAwKSB0ICs9IDE7XG5cdFx0XHRcdGlmICh0ID4gMSkgdCAtPSAxO1xuXHRcdFx0XHRpZiAodCA8IDEvNikgcmV0dXJuIHAgKyAocSAtIHApICogNiAqIHQ7XG5cdFx0XHRcdGlmICh0IDwgMS8yKSByZXR1cm4gcTtcblx0XHRcdFx0aWYgKHQgPCAyLzMpIHJldHVybiBwICsgKHEgLSBwKSAqICgyLzMgLSB0KSAqIDY7XG5cdFx0XHRcdHJldHVybiBwO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcyA9IGNvbG9yWzFdO1xuXHRcdFx0dmFyIHEgPSAobCA8IDAuNSA/IGwgKiAoMSArIHMpIDogbCArIHMgLSBsICogcyk7XG5cdFx0XHR2YXIgcCA9IDIgKiBsIC0gcTtcblx0XHRcdHZhciByID0gaHVlMnJnYihwLCBxLCBjb2xvclswXSArIDEvMyk7XG5cdFx0XHR2YXIgZyA9IGh1ZTJyZ2IocCwgcSwgY29sb3JbMF0pO1xuXHRcdFx0dmFyIGIgPSBodWUycmdiKHAsIHEsIGNvbG9yWzBdIC0gMS8zKTtcblx0XHRcdHJldHVybiBbTWF0aC5yb3VuZChyKjI1NSksIE1hdGgucm91bmQoZyoyNTUpLCBNYXRoLnJvdW5kKGIqMjU1KV07XG5cdFx0fVxuXHR9LFxuXG5cdHRvUkdCOiBmdW5jdGlvbihjb2xvcikge1xuXHRcdHJldHVybiBcInJnYihcIiArIHRoaXMuX2NsYW1wKGNvbG9yWzBdKSArIFwiLFwiICsgdGhpcy5fY2xhbXAoY29sb3JbMV0pICsgXCIsXCIgKyB0aGlzLl9jbGFtcChjb2xvclsyXSkgKyBcIilcIjtcblx0fSxcblxuXHR0b0hleDogZnVuY3Rpb24oY29sb3IpIHtcblx0XHR2YXIgcGFydHMgPSBbXTtcblx0XHRmb3IgKHZhciBpPTA7aTwzO2krKykge1xuXHRcdFx0cGFydHMucHVzaCh0aGlzLl9jbGFtcChjb2xvcltpXSkudG9TdHJpbmcoMTYpLmxwYWQoXCIwXCIsIDIpKTtcblx0XHR9XG5cdFx0cmV0dXJuIFwiI1wiICsgcGFydHMuam9pbihcIlwiKTtcblx0fSxcblxuXHRfY2xhbXA6IGZ1bmN0aW9uKG51bSkge1xuXHRcdGlmIChudW0gPCAwKSB7XG5cdFx0XHRyZXR1cm4gMDtcblx0XHR9IGVsc2UgaWYgKG51bSA+IDI1NSkge1xuXHRcdFx0cmV0dXJuIDI1NTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG51bTtcblx0XHR9XG5cdH0sXG5cblx0X2NhY2hlOiB7XG5cdFx0XCJibGFja1wiOiBbMCwwLDBdLFxuXHRcdFwibmF2eVwiOiBbMCwwLDEyOF0sXG5cdFx0XCJkYXJrYmx1ZVwiOiBbMCwwLDEzOV0sXG5cdFx0XCJtZWRpdW1ibHVlXCI6IFswLDAsMjA1XSxcblx0XHRcImJsdWVcIjogWzAsMCwyNTVdLFxuXHRcdFwiZGFya2dyZWVuXCI6IFswLDEwMCwwXSxcblx0XHRcImdyZWVuXCI6IFswLDEyOCwwXSxcblx0XHRcInRlYWxcIjogWzAsMTI4LDEyOF0sXG5cdFx0XCJkYXJrY3lhblwiOiBbMCwxMzksMTM5XSxcblx0XHRcImRlZXBza3libHVlXCI6IFswLDE5MSwyNTVdLFxuXHRcdFwiZGFya3R1cnF1b2lzZVwiOiBbMCwyMDYsMjA5XSxcblx0XHRcIm1lZGl1bXNwcmluZ2dyZWVuXCI6IFswLDI1MCwxNTRdLFxuXHRcdFwibGltZVwiOiBbMCwyNTUsMF0sXG5cdFx0XCJzcHJpbmdncmVlblwiOiBbMCwyNTUsMTI3XSxcblx0XHRcImFxdWFcIjogWzAsMjU1LDI1NV0sXG5cdFx0XCJjeWFuXCI6IFswLDI1NSwyNTVdLFxuXHRcdFwibWlkbmlnaHRibHVlXCI6IFsyNSwyNSwxMTJdLFxuXHRcdFwiZG9kZ2VyYmx1ZVwiOiBbMzAsMTQ0LDI1NV0sXG5cdFx0XCJmb3Jlc3RncmVlblwiOiBbMzQsMTM5LDM0XSxcblx0XHRcInNlYWdyZWVuXCI6IFs0NiwxMzksODddLFxuXHRcdFwiZGFya3NsYXRlZ3JheVwiOiBbNDcsNzksNzldLFxuXHRcdFwiZGFya3NsYXRlZ3JleVwiOiBbNDcsNzksNzldLFxuXHRcdFwibGltZWdyZWVuXCI6IFs1MCwyMDUsNTBdLFxuXHRcdFwibWVkaXVtc2VhZ3JlZW5cIjogWzYwLDE3OSwxMTNdLFxuXHRcdFwidHVycXVvaXNlXCI6IFs2NCwyMjQsMjA4XSxcblx0XHRcInJveWFsYmx1ZVwiOiBbNjUsMTA1LDIyNV0sXG5cdFx0XCJzdGVlbGJsdWVcIjogWzcwLDEzMCwxODBdLFxuXHRcdFwiZGFya3NsYXRlYmx1ZVwiOiBbNzIsNjEsMTM5XSxcblx0XHRcIm1lZGl1bXR1cnF1b2lzZVwiOiBbNzIsMjA5LDIwNF0sXG5cdFx0XCJpbmRpZ29cIjogWzc1LDAsMTMwXSxcblx0XHRcImRhcmtvbGl2ZWdyZWVuXCI6IFs4NSwxMDcsNDddLFxuXHRcdFwiY2FkZXRibHVlXCI6IFs5NSwxNTgsMTYwXSxcblx0XHRcImNvcm5mbG93ZXJibHVlXCI6IFsxMDAsMTQ5LDIzN10sXG5cdFx0XCJtZWRpdW1hcXVhbWFyaW5lXCI6IFsxMDIsMjA1LDE3MF0sXG5cdFx0XCJkaW1ncmF5XCI6IFsxMDUsMTA1LDEwNV0sXG5cdFx0XCJkaW1ncmV5XCI6IFsxMDUsMTA1LDEwNV0sXG5cdFx0XCJzbGF0ZWJsdWVcIjogWzEwNiw5MCwyMDVdLFxuXHRcdFwib2xpdmVkcmFiXCI6IFsxMDcsMTQyLDM1XSxcblx0XHRcInNsYXRlZ3JheVwiOiBbMTEyLDEyOCwxNDRdLFxuXHRcdFwic2xhdGVncmV5XCI6IFsxMTIsMTI4LDE0NF0sXG5cdFx0XCJsaWdodHNsYXRlZ3JheVwiOiBbMTE5LDEzNiwxNTNdLFxuXHRcdFwibGlnaHRzbGF0ZWdyZXlcIjogWzExOSwxMzYsMTUzXSxcblx0XHRcIm1lZGl1bXNsYXRlYmx1ZVwiOiBbMTIzLDEwNCwyMzhdLFxuXHRcdFwibGF3bmdyZWVuXCI6IFsxMjQsMjUyLDBdLFxuXHRcdFwiY2hhcnRyZXVzZVwiOiBbMTI3LDI1NSwwXSxcblx0XHRcImFxdWFtYXJpbmVcIjogWzEyNywyNTUsMjEyXSxcblx0XHRcIm1hcm9vblwiOiBbMTI4LDAsMF0sXG5cdFx0XCJwdXJwbGVcIjogWzEyOCwwLDEyOF0sXG5cdFx0XCJvbGl2ZVwiOiBbMTI4LDEyOCwwXSxcblx0XHRcImdyYXlcIjogWzEyOCwxMjgsMTI4XSxcblx0XHRcImdyZXlcIjogWzEyOCwxMjgsMTI4XSxcblx0XHRcInNreWJsdWVcIjogWzEzNSwyMDYsMjM1XSxcblx0XHRcImxpZ2h0c2t5Ymx1ZVwiOiBbMTM1LDIwNiwyNTBdLFxuXHRcdFwiYmx1ZXZpb2xldFwiOiBbMTM4LDQzLDIyNl0sXG5cdFx0XCJkYXJrcmVkXCI6IFsxMzksMCwwXSxcblx0XHRcImRhcmttYWdlbnRhXCI6IFsxMzksMCwxMzldLFxuXHRcdFwic2FkZGxlYnJvd25cIjogWzEzOSw2OSwxOV0sXG5cdFx0XCJkYXJrc2VhZ3JlZW5cIjogWzE0MywxODgsMTQzXSxcblx0XHRcImxpZ2h0Z3JlZW5cIjogWzE0NCwyMzgsMTQ0XSxcblx0XHRcIm1lZGl1bXB1cnBsZVwiOiBbMTQ3LDExMiwyMTZdLFxuXHRcdFwiZGFya3Zpb2xldFwiOiBbMTQ4LDAsMjExXSxcblx0XHRcInBhbGVncmVlblwiOiBbMTUyLDI1MSwxNTJdLFxuXHRcdFwiZGFya29yY2hpZFwiOiBbMTUzLDUwLDIwNF0sXG5cdFx0XCJ5ZWxsb3dncmVlblwiOiBbMTU0LDIwNSw1MF0sXG5cdFx0XCJzaWVubmFcIjogWzE2MCw4Miw0NV0sXG5cdFx0XCJicm93blwiOiBbMTY1LDQyLDQyXSxcblx0XHRcImRhcmtncmF5XCI6IFsxNjksMTY5LDE2OV0sXG5cdFx0XCJkYXJrZ3JleVwiOiBbMTY5LDE2OSwxNjldLFxuXHRcdFwibGlnaHRibHVlXCI6IFsxNzMsMjE2LDIzMF0sXG5cdFx0XCJncmVlbnllbGxvd1wiOiBbMTczLDI1NSw0N10sXG5cdFx0XCJwYWxldHVycXVvaXNlXCI6IFsxNzUsMjM4LDIzOF0sXG5cdFx0XCJsaWdodHN0ZWVsYmx1ZVwiOiBbMTc2LDE5NiwyMjJdLFxuXHRcdFwicG93ZGVyYmx1ZVwiOiBbMTc2LDIyNCwyMzBdLFxuXHRcdFwiZmlyZWJyaWNrXCI6IFsxNzgsMzQsMzRdLFxuXHRcdFwiZGFya2dvbGRlbnJvZFwiOiBbMTg0LDEzNCwxMV0sXG5cdFx0XCJtZWRpdW1vcmNoaWRcIjogWzE4Niw4NSwyMTFdLFxuXHRcdFwicm9zeWJyb3duXCI6IFsxODgsMTQzLDE0M10sXG5cdFx0XCJkYXJra2hha2lcIjogWzE4OSwxODMsMTA3XSxcblx0XHRcInNpbHZlclwiOiBbMTkyLDE5MiwxOTJdLFxuXHRcdFwibWVkaXVtdmlvbGV0cmVkXCI6IFsxOTksMjEsMTMzXSxcblx0XHRcImluZGlhbnJlZFwiOiBbMjA1LDkyLDkyXSxcblx0XHRcInBlcnVcIjogWzIwNSwxMzMsNjNdLFxuXHRcdFwiY2hvY29sYXRlXCI6IFsyMTAsMTA1LDMwXSxcblx0XHRcInRhblwiOiBbMjEwLDE4MCwxNDBdLFxuXHRcdFwibGlnaHRncmF5XCI6IFsyMTEsMjExLDIxMV0sXG5cdFx0XCJsaWdodGdyZXlcIjogWzIxMSwyMTEsMjExXSxcblx0XHRcInBhbGV2aW9sZXRyZWRcIjogWzIxNiwxMTIsMTQ3XSxcblx0XHRcInRoaXN0bGVcIjogWzIxNiwxOTEsMjE2XSxcblx0XHRcIm9yY2hpZFwiOiBbMjE4LDExMiwyMTRdLFxuXHRcdFwiZ29sZGVucm9kXCI6IFsyMTgsMTY1LDMyXSxcblx0XHRcImNyaW1zb25cIjogWzIyMCwyMCw2MF0sXG5cdFx0XCJnYWluc2Jvcm9cIjogWzIyMCwyMjAsMjIwXSxcblx0XHRcInBsdW1cIjogWzIyMSwxNjAsMjIxXSxcblx0XHRcImJ1cmx5d29vZFwiOiBbMjIyLDE4NCwxMzVdLFxuXHRcdFwibGlnaHRjeWFuXCI6IFsyMjQsMjU1LDI1NV0sXG5cdFx0XCJsYXZlbmRlclwiOiBbMjMwLDIzMCwyNTBdLFxuXHRcdFwiZGFya3NhbG1vblwiOiBbMjMzLDE1MCwxMjJdLFxuXHRcdFwidmlvbGV0XCI6IFsyMzgsMTMwLDIzOF0sXG5cdFx0XCJwYWxlZ29sZGVucm9kXCI6IFsyMzgsMjMyLDE3MF0sXG5cdFx0XCJsaWdodGNvcmFsXCI6IFsyNDAsMTI4LDEyOF0sXG5cdFx0XCJraGFraVwiOiBbMjQwLDIzMCwxNDBdLFxuXHRcdFwiYWxpY2VibHVlXCI6IFsyNDAsMjQ4LDI1NV0sXG5cdFx0XCJob25leWRld1wiOiBbMjQwLDI1NSwyNDBdLFxuXHRcdFwiYXp1cmVcIjogWzI0MCwyNTUsMjU1XSxcblx0XHRcInNhbmR5YnJvd25cIjogWzI0NCwxNjQsOTZdLFxuXHRcdFwid2hlYXRcIjogWzI0NSwyMjIsMTc5XSxcblx0XHRcImJlaWdlXCI6IFsyNDUsMjQ1LDIyMF0sXG5cdFx0XCJ3aGl0ZXNtb2tlXCI6IFsyNDUsMjQ1LDI0NV0sXG5cdFx0XCJtaW50Y3JlYW1cIjogWzI0NSwyNTUsMjUwXSxcblx0XHRcImdob3N0d2hpdGVcIjogWzI0OCwyNDgsMjU1XSxcblx0XHRcInNhbG1vblwiOiBbMjUwLDEyOCwxMTRdLFxuXHRcdFwiYW50aXF1ZXdoaXRlXCI6IFsyNTAsMjM1LDIxNV0sXG5cdFx0XCJsaW5lblwiOiBbMjUwLDI0MCwyMzBdLFxuXHRcdFwibGlnaHRnb2xkZW5yb2R5ZWxsb3dcIjogWzI1MCwyNTAsMjEwXSxcblx0XHRcIm9sZGxhY2VcIjogWzI1MywyNDUsMjMwXSxcblx0XHRcInJlZFwiOiBbMjU1LDAsMF0sXG5cdFx0XCJmdWNoc2lhXCI6IFsyNTUsMCwyNTVdLFxuXHRcdFwibWFnZW50YVwiOiBbMjU1LDAsMjU1XSxcblx0XHRcImRlZXBwaW5rXCI6IFsyNTUsMjAsMTQ3XSxcblx0XHRcIm9yYW5nZXJlZFwiOiBbMjU1LDY5LDBdLFxuXHRcdFwidG9tYXRvXCI6IFsyNTUsOTksNzFdLFxuXHRcdFwiaG90cGlua1wiOiBbMjU1LDEwNSwxODBdLFxuXHRcdFwiY29yYWxcIjogWzI1NSwxMjcsODBdLFxuXHRcdFwiZGFya29yYW5nZVwiOiBbMjU1LDE0MCwwXSxcblx0XHRcImxpZ2h0c2FsbW9uXCI6IFsyNTUsMTYwLDEyMl0sXG5cdFx0XCJvcmFuZ2VcIjogWzI1NSwxNjUsMF0sXG5cdFx0XCJsaWdodHBpbmtcIjogWzI1NSwxODIsMTkzXSxcblx0XHRcInBpbmtcIjogWzI1NSwxOTIsMjAzXSxcblx0XHRcImdvbGRcIjogWzI1NSwyMTUsMF0sXG5cdFx0XCJwZWFjaHB1ZmZcIjogWzI1NSwyMTgsMTg1XSxcblx0XHRcIm5hdmFqb3doaXRlXCI6IFsyNTUsMjIyLDE3M10sXG5cdFx0XCJtb2NjYXNpblwiOiBbMjU1LDIyOCwxODFdLFxuXHRcdFwiYmlzcXVlXCI6IFsyNTUsMjI4LDE5Nl0sXG5cdFx0XCJtaXN0eXJvc2VcIjogWzI1NSwyMjgsMjI1XSxcblx0XHRcImJsYW5jaGVkYWxtb25kXCI6IFsyNTUsMjM1LDIwNV0sXG5cdFx0XCJwYXBheWF3aGlwXCI6IFsyNTUsMjM5LDIxM10sXG5cdFx0XCJsYXZlbmRlcmJsdXNoXCI6IFsyNTUsMjQwLDI0NV0sXG5cdFx0XCJzZWFzaGVsbFwiOiBbMjU1LDI0NSwyMzhdLFxuXHRcdFwiY29ybnNpbGtcIjogWzI1NSwyNDgsMjIwXSxcblx0XHRcImxlbW9uY2hpZmZvblwiOiBbMjU1LDI1MCwyMDVdLFxuXHRcdFwiZmxvcmFsd2hpdGVcIjogWzI1NSwyNTAsMjQwXSxcblx0XHRcInNub3dcIjogWzI1NSwyNTAsMjUwXSxcblx0XHRcInllbGxvd1wiOiBbMjU1LDI1NSwwXSxcblx0XHRcImxpZ2h0eWVsbG93XCI6IFsyNTUsMjU1LDIyNF0sXG5cdFx0XCJpdm9yeVwiOiBbMjU1LDI1NSwyNDBdLFxuXHRcdFwid2hpdGVcIjogWzI1NSwyNTUsMjU1XVxuXHR9XG59XG4vKipcbiAqIEBjbGFzcyBMaWdodGluZyBjb21wdXRhdGlvbiwgYmFzZWQgb24gYSB0cmFkaXRpb25hbCBGT1YgZm9yIG11bHRpcGxlIGxpZ2h0IHNvdXJjZXMgYW5kIG11bHRpcGxlIHBhc3Nlcy5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHJlZmxlY3Rpdml0eUNhbGxiYWNrIENhbGxiYWNrIHRvIHJldHJpZXZlIGNlbGwgcmVmbGVjdGl2aXR5ICgwLi4xKVxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtpbnR9IFtvcHRpb25zLnBhc3Nlcz0xXSBOdW1iZXIgb2YgcGFzc2VzLiAxIGVxdWFscyB0byBzaW1wbGUgRk9WIG9mIGFsbCBsaWdodCBzb3VyY2VzLCA+MSBtZWFucyBhICpoaWdobHkgc2ltcGxpZmllZCogcmFkaW9zaXR5LWxpa2UgYWxnb3JpdGhtLlxuICogQHBhcmFtIHtpbnR9IFtvcHRpb25zLmVtaXNzaW9uVGhyZXNob2xkPTEwMF0gQ2VsbHMgd2l0aCBlbWlzc2l2aXR5ID4gdGhyZXNob2xkIHdpbGwgYmUgdHJlYXRlZCBhcyBsaWdodCBzb3VyY2UgaW4gdGhlIG5leHQgcGFzcy5cbiAqIEBwYXJhbSB7aW50fSBbb3B0aW9ucy5yYW5nZT0xMF0gTWF4IGxpZ2h0IHJhbmdlXG4gKi9cblJPVC5MaWdodGluZyA9IGZ1bmN0aW9uKHJlZmxlY3Rpdml0eUNhbGxiYWNrLCBvcHRpb25zKSB7XG5cdHRoaXMuX3JlZmxlY3Rpdml0eUNhbGxiYWNrID0gcmVmbGVjdGl2aXR5Q2FsbGJhY2s7XG5cdHRoaXMuX29wdGlvbnMgPSB7XG5cdFx0cGFzc2VzOiAxLFxuXHRcdGVtaXNzaW9uVGhyZXNob2xkOiAxMDAsXG5cdFx0cmFuZ2U6IDEwXG5cdH07XG5cdHRoaXMuX2ZvdiA9IG51bGw7XG5cblx0dGhpcy5fbGlnaHRzID0ge307XG5cdHRoaXMuX3JlZmxlY3Rpdml0eUNhY2hlID0ge307XG5cdHRoaXMuX2ZvdkNhY2hlID0ge307XG5cblx0dGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIEFkanVzdCBvcHRpb25zIGF0IHJ1bnRpbWVcbiAqIEBzZWUgUk9ULkxpZ2h0aW5nXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXG4gKi9cblJPVC5MaWdodGluZy5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0Zm9yICh2YXIgcCBpbiBvcHRpb25zKSB7IHRoaXMuX29wdGlvbnNbcF0gPSBvcHRpb25zW3BdOyB9XG5cdGlmIChvcHRpb25zLnJhbmdlKSB7IHRoaXMucmVzZXQoKTsgfVxuXHRyZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBTZXQgdGhlIHVzZWQgRmllbGQtT2YtVmlldyBhbGdvXG4gKiBAcGFyYW0ge1JPVC5GT1Z9IGZvdlxuICovXG5ST1QuTGlnaHRpbmcucHJvdG90eXBlLnNldEZPViA9IGZ1bmN0aW9uKGZvdikge1xuXHR0aGlzLl9mb3YgPSBmb3Y7XG5cdHRoaXMuX2ZvdkNhY2hlID0ge307XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFNldCAob3IgcmVtb3ZlKSBhIGxpZ2h0IHNvdXJjZVxuICogQHBhcmFtIHtpbnR9IHhcbiAqIEBwYXJhbSB7aW50fSB5XG4gKiBAcGFyYW0ge251bGwgfHwgc3RyaW5nIHx8IG51bWJlclszXX0gY29sb3JcbiAqL1xuUk9ULkxpZ2h0aW5nLnByb3RvdHlwZS5zZXRMaWdodCA9IGZ1bmN0aW9uKHgsIHksIGNvbG9yKSB7XG5cdHZhciBrZXkgPSB4K1wiLFwiK3k7XG5cblx0aWYgKGNvbG9yKSB7XG5cdFx0dGhpcy5fbGlnaHRzW2tleV0gPSAodHlwZW9mKGNvbG9yKSA9PSBcInN0cmluZ1wiID8gUk9ULkNvbG9yLmZyb21TdHJpbmcoY29sb3IpIDogY29sb3IpO1xuXHR9IGVsc2Uge1xuXHRcdGRlbGV0ZSB0aGlzLl9saWdodHNba2V5XTtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBSZXNldCB0aGUgcHJlLWNvbXB1dGVkIHRvcG9sb2d5IHZhbHVlcy4gQ2FsbCB3aGVuZXZlciB0aGUgdW5kZXJseWluZyBtYXAgY2hhbmdlcyBpdHMgbGlnaHQtcGFzc2FiaWxpdHkuXG4gKi9cblJPVC5MaWdodGluZy5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5fcmVmbGVjdGl2aXR5Q2FjaGUgPSB7fTtcblx0dGhpcy5fZm92Q2FjaGUgPSB7fTtcblxuXHRyZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBDb21wdXRlIHRoZSBsaWdodGluZ1xuICogQHBhcmFtIHtmdW5jdGlvbn0gbGlnaHRpbmdDYWxsYmFjayBXaWxsIGJlIGNhbGxlZCB3aXRoICh4LCB5LCBjb2xvcikgZm9yIGV2ZXJ5IGxpdCBjZWxsXG4gKi9cblJPVC5MaWdodGluZy5wcm90b3R5cGUuY29tcHV0ZSA9IGZ1bmN0aW9uKGxpZ2h0aW5nQ2FsbGJhY2spIHtcblx0dmFyIGRvbmVDZWxscyA9IHt9O1xuXHR2YXIgZW1pdHRpbmdDZWxscyA9IHt9O1xuXHR2YXIgbGl0Q2VsbHMgPSB7fTtcblxuXHRmb3IgKHZhciBrZXkgaW4gdGhpcy5fbGlnaHRzKSB7IC8qIHByZXBhcmUgZW1pdHRlcnMgZm9yIGZpcnN0IHBhc3MgKi9cblx0XHR2YXIgbGlnaHQgPSB0aGlzLl9saWdodHNba2V5XTtcblx0XHRpZiAoIShrZXkgaW4gZW1pdHRpbmdDZWxscykpIHsgZW1pdHRpbmdDZWxsc1trZXldID0gWzAsIDAsIDBdOyB9XG5cblx0XHRST1QuQ29sb3IuYWRkXyhlbWl0dGluZ0NlbGxzW2tleV0sIGxpZ2h0KTtcblx0fVxuXG5cdGZvciAodmFyIGk9MDtpPHRoaXMuX29wdGlvbnMucGFzc2VzO2krKykgeyAvKiBtYWluIGxvb3AgKi9cblx0XHR0aGlzLl9lbWl0TGlnaHQoZW1pdHRpbmdDZWxscywgbGl0Q2VsbHMsIGRvbmVDZWxscyk7XG5cdFx0aWYgKGkrMSA9PSB0aGlzLl9vcHRpb25zLnBhc3NlcykgeyBjb250aW51ZTsgfSAvKiBub3QgZm9yIHRoZSBsYXN0IHBhc3MgKi9cblx0XHRlbWl0dGluZ0NlbGxzID0gdGhpcy5fY29tcHV0ZUVtaXR0ZXJzKGxpdENlbGxzLCBkb25lQ2VsbHMpO1xuXHR9XG5cblx0Zm9yICh2YXIgbGl0S2V5IGluIGxpdENlbGxzKSB7IC8qIGxldCB0aGUgdXNlciBrbm93IHdoYXQgYW5kIGhvdyBpcyBsaXQgKi9cblx0XHR2YXIgcGFydHMgPSBsaXRLZXkuc3BsaXQoXCIsXCIpO1xuXHRcdHZhciB4ID0gcGFyc2VJbnQocGFydHNbMF0pO1xuXHRcdHZhciB5ID0gcGFyc2VJbnQocGFydHNbMV0pO1xuXHRcdGxpZ2h0aW5nQ2FsbGJhY2soeCwgeSwgbGl0Q2VsbHNbbGl0S2V5XSk7XG5cdH1cblxuXHRyZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBDb21wdXRlIG9uZSBpdGVyYXRpb24gZnJvbSBhbGwgZW1pdHRpbmcgY2VsbHNcbiAqIEBwYXJhbSB7b2JqZWN0fSBlbWl0dGluZ0NlbGxzIFRoZXNlIGVtaXQgbGlnaHRcbiAqIEBwYXJhbSB7b2JqZWN0fSBsaXRDZWxscyBBZGQgcHJvamVjdGVkIGxpZ2h0IHRvIHRoZXNlXG4gKiBAcGFyYW0ge29iamVjdH0gZG9uZUNlbGxzIFRoZXNlIGFscmVhZHkgZW1pdHRlZCwgZm9yYmlkIHRoZW0gZnJvbSBmdXJ0aGVyIGNhbGN1bGF0aW9uc1xuICovXG5ST1QuTGlnaHRpbmcucHJvdG90eXBlLl9lbWl0TGlnaHQgPSBmdW5jdGlvbihlbWl0dGluZ0NlbGxzLCBsaXRDZWxscywgZG9uZUNlbGxzKSB7XG5cdGZvciAodmFyIGtleSBpbiBlbWl0dGluZ0NlbGxzKSB7XG5cdFx0dmFyIHBhcnRzID0ga2V5LnNwbGl0KFwiLFwiKTtcblx0XHR2YXIgeCA9IHBhcnNlSW50KHBhcnRzWzBdKTtcblx0XHR2YXIgeSA9IHBhcnNlSW50KHBhcnRzWzFdKTtcblx0XHR0aGlzLl9lbWl0TGlnaHRGcm9tQ2VsbCh4LCB5LCBlbWl0dGluZ0NlbGxzW2tleV0sIGxpdENlbGxzKTtcblx0XHRkb25lQ2VsbHNba2V5XSA9IDE7XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogUHJlcGFyZSBhIGxpc3Qgb2YgZW1pdHRlcnMgZm9yIG5leHQgcGFzc1xuICogQHBhcmFtIHtvYmplY3R9IGxpdENlbGxzXG4gKiBAcGFyYW0ge29iamVjdH0gZG9uZUNlbGxzXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5ST1QuTGlnaHRpbmcucHJvdG90eXBlLl9jb21wdXRlRW1pdHRlcnMgPSBmdW5jdGlvbihsaXRDZWxscywgZG9uZUNlbGxzKSB7XG5cdHZhciByZXN1bHQgPSB7fTtcblxuXHRmb3IgKHZhciBrZXkgaW4gbGl0Q2VsbHMpIHtcblx0XHRpZiAoa2V5IGluIGRvbmVDZWxscykgeyBjb250aW51ZTsgfSAvKiBhbHJlYWR5IGVtaXR0ZWQgKi9cblxuXHRcdHZhciBjb2xvciA9IGxpdENlbGxzW2tleV07XG5cblx0XHRpZiAoa2V5IGluIHRoaXMuX3JlZmxlY3Rpdml0eUNhY2hlKSB7XG5cdFx0XHR2YXIgcmVmbGVjdGl2aXR5ID0gdGhpcy5fcmVmbGVjdGl2aXR5Q2FjaGVba2V5XTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIHBhcnRzID0ga2V5LnNwbGl0KFwiLFwiKTtcblx0XHRcdHZhciB4ID0gcGFyc2VJbnQocGFydHNbMF0pO1xuXHRcdFx0dmFyIHkgPSBwYXJzZUludChwYXJ0c1sxXSk7XG5cdFx0XHR2YXIgcmVmbGVjdGl2aXR5ID0gdGhpcy5fcmVmbGVjdGl2aXR5Q2FsbGJhY2soeCwgeSk7XG5cdFx0XHR0aGlzLl9yZWZsZWN0aXZpdHlDYWNoZVtrZXldID0gcmVmbGVjdGl2aXR5O1xuXHRcdH1cblxuXHRcdGlmIChyZWZsZWN0aXZpdHkgPT0gMCkgeyBjb250aW51ZTsgfSAvKiB3aWxsIG5vdCByZWZsZWN0IGF0IGFsbCAqL1xuXG5cdFx0LyogY29tcHV0ZSBlbWlzc2lvbiBjb2xvciAqL1xuXHRcdHZhciBlbWlzc2lvbiA9IFtdO1xuXHRcdHZhciBpbnRlbnNpdHkgPSAwO1xuXHRcdGZvciAodmFyIGk9MDtpPDM7aSsrKSB7XG5cdFx0XHR2YXIgcGFydCA9IE1hdGgucm91bmQoY29sb3JbaV0qcmVmbGVjdGl2aXR5KTtcblx0XHRcdGVtaXNzaW9uW2ldID0gcGFydDtcblx0XHRcdGludGVuc2l0eSArPSBwYXJ0O1xuXHRcdH1cblx0XHRpZiAoaW50ZW5zaXR5ID4gdGhpcy5fb3B0aW9ucy5lbWlzc2lvblRocmVzaG9sZCkgeyByZXN1bHRba2V5XSA9IGVtaXNzaW9uOyB9XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIENvbXB1dGUgb25lIGl0ZXJhdGlvbiBmcm9tIG9uZSBjZWxsXG4gKiBAcGFyYW0ge2ludH0geFxuICogQHBhcmFtIHtpbnR9IHlcbiAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yXG4gKiBAcGFyYW0ge29iamVjdH0gbGl0Q2VsbHMgQ2VsbCBkYXRhIHRvIGJ5IHVwZGF0ZWRcbiAqL1xuUk9ULkxpZ2h0aW5nLnByb3RvdHlwZS5fZW1pdExpZ2h0RnJvbUNlbGwgPSBmdW5jdGlvbih4LCB5LCBjb2xvciwgbGl0Q2VsbHMpIHtcblx0dmFyIGtleSA9IHgrXCIsXCIreTtcblx0aWYgKGtleSBpbiB0aGlzLl9mb3ZDYWNoZSkge1xuXHRcdHZhciBmb3YgPSB0aGlzLl9mb3ZDYWNoZVtrZXldO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBmb3YgPSB0aGlzLl91cGRhdGVGT1YoeCwgeSk7XG5cdH1cblxuXHRmb3IgKHZhciBmb3ZLZXkgaW4gZm92KSB7XG5cdFx0dmFyIGZvcm1GYWN0b3IgPSBmb3ZbZm92S2V5XTtcblxuXHRcdGlmIChmb3ZLZXkgaW4gbGl0Q2VsbHMpIHsgLyogYWxyZWFkeSBsaXQgKi9cblx0XHRcdHZhciByZXN1bHQgPSBsaXRDZWxsc1tmb3ZLZXldO1xuXHRcdH0gZWxzZSB7IC8qIG5ld2x5IGxpdCAqL1xuXHRcdFx0dmFyIHJlc3VsdCA9IFswLCAwLCAwXTtcblx0XHRcdGxpdENlbGxzW2ZvdktleV0gPSByZXN1bHQ7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgaT0wO2k8MztpKyspIHsgcmVzdWx0W2ldICs9IE1hdGgucm91bmQoY29sb3JbaV0qZm9ybUZhY3Rvcik7IH0gLyogYWRkIGxpZ2h0IGNvbG9yICovXG5cdH1cblxuXHRyZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBDb21wdXRlIEZPViAoXCJmb3JtIGZhY3RvclwiKSBmb3IgYSBwb3RlbnRpYWwgbGlnaHQgc291cmNlIGF0IFt4LHldXG4gKiBAcGFyYW0ge2ludH0geFxuICogQHBhcmFtIHtpbnR9IHlcbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKi9cblJPVC5MaWdodGluZy5wcm90b3R5cGUuX3VwZGF0ZUZPViA9IGZ1bmN0aW9uKHgsIHkpIHtcblx0dmFyIGtleTEgPSB4K1wiLFwiK3k7XG5cdHZhciBjYWNoZSA9IHt9O1xuXHR0aGlzLl9mb3ZDYWNoZVtrZXkxXSA9IGNhY2hlO1xuXHR2YXIgcmFuZ2UgPSB0aGlzLl9vcHRpb25zLnJhbmdlO1xuXHR2YXIgY2IgPSBmdW5jdGlvbih4LCB5LCByLCB2aXMpIHtcblx0XHR2YXIga2V5MiA9IHgrXCIsXCIreTtcblx0XHR2YXIgZm9ybUZhY3RvciA9IHZpcyAqICgxLXIvcmFuZ2UpO1xuXHRcdGlmIChmb3JtRmFjdG9yID09IDApIHsgcmV0dXJuOyB9XG5cdFx0Y2FjaGVba2V5Ml0gPSBmb3JtRmFjdG9yO1xuXHR9XG5cdHRoaXMuX2Zvdi5jb21wdXRlKHgsIHksIHJhbmdlLCBjYi5iaW5kKHRoaXMpKTtcblxuXHRyZXR1cm4gY2FjaGU7XG59XG4vKipcbiAqIEBjbGFzcyBBYnN0cmFjdCBwYXRoZmluZGVyXG4gKiBAcGFyYW0ge2ludH0gdG9YIFRhcmdldCBYIGNvb3JkXG4gKiBAcGFyYW0ge2ludH0gdG9ZIFRhcmdldCBZIGNvb3JkXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBwYXNzYWJsZUNhbGxiYWNrIENhbGxiYWNrIHRvIGRldGVybWluZSBtYXAgcGFzc2FiaWxpdHlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cbiAqIEBwYXJhbSB7aW50fSBbb3B0aW9ucy50b3BvbG9neT04XVxuICovXG5ST1QuUGF0aCA9IGZ1bmN0aW9uKHRvWCwgdG9ZLCBwYXNzYWJsZUNhbGxiYWNrLCBvcHRpb25zKSB7XG5cdHRoaXMuX3RvWCA9IHRvWDtcblx0dGhpcy5fdG9ZID0gdG9ZO1xuXHR0aGlzLl9mcm9tWCA9IG51bGw7XG5cdHRoaXMuX2Zyb21ZID0gbnVsbDtcblx0dGhpcy5fcGFzc2FibGVDYWxsYmFjayA9IHBhc3NhYmxlQ2FsbGJhY2s7XG5cdHRoaXMuX29wdGlvbnMgPSB7XG5cdFx0dG9wb2xvZ3k6IDhcblx0fVxuXHRmb3IgKHZhciBwIGluIG9wdGlvbnMpIHsgdGhpcy5fb3B0aW9uc1twXSA9IG9wdGlvbnNbcF07IH1cblxuXHR0aGlzLl9kaXJzID0gUk9ULkRJUlNbdGhpcy5fb3B0aW9ucy50b3BvbG9neV07XG5cdGlmICh0aGlzLl9vcHRpb25zLnRvcG9sb2d5ID09IDgpIHsgLyogcmVvcmRlciBkaXJzIGZvciBtb3JlIGFlc3RoZXRpYyByZXN1bHQgKHZlcnRpY2FsL2hvcml6b250YWwgZmlyc3QpICovXG5cdFx0dGhpcy5fZGlycyA9IFtcblx0XHRcdHRoaXMuX2RpcnNbMF0sXG5cdFx0XHR0aGlzLl9kaXJzWzJdLFxuXHRcdFx0dGhpcy5fZGlyc1s0XSxcblx0XHRcdHRoaXMuX2RpcnNbNl0sXG5cdFx0XHR0aGlzLl9kaXJzWzFdLFxuXHRcdFx0dGhpcy5fZGlyc1szXSxcblx0XHRcdHRoaXMuX2RpcnNbNV0sXG5cdFx0XHR0aGlzLl9kaXJzWzddXG5cdFx0XVxuXHR9XG59XG5cbi8qKlxuICogQ29tcHV0ZSBhIHBhdGggZnJvbSBhIGdpdmVuIHBvaW50XG4gKiBAcGFyYW0ge2ludH0gZnJvbVhcbiAqIEBwYXJhbSB7aW50fSBmcm9tWVxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgV2lsbCBiZSBjYWxsZWQgZm9yIGV2ZXJ5IHBhdGggaXRlbSB3aXRoIGFyZ3VtZW50cyBcInhcIiBhbmQgXCJ5XCJcbiAqL1xuUk9ULlBhdGgucHJvdG90eXBlLmNvbXB1dGUgPSBmdW5jdGlvbihmcm9tWCwgZnJvbVksIGNhbGxiYWNrKSB7XG59XG5cblJPVC5QYXRoLnByb3RvdHlwZS5fZ2V0TmVpZ2hib3JzID0gZnVuY3Rpb24oY3gsIGN5KSB7XG5cdHZhciByZXN1bHQgPSBbXTtcblx0Zm9yICh2YXIgaT0wO2k8dGhpcy5fZGlycy5sZW5ndGg7aSsrKSB7XG5cdFx0dmFyIGRpciA9IHRoaXMuX2RpcnNbaV07XG5cdFx0dmFyIHggPSBjeCArIGRpclswXTtcblx0XHR2YXIgeSA9IGN5ICsgZGlyWzFdO1xuXHRcdFxuXHRcdGlmICghdGhpcy5fcGFzc2FibGVDYWxsYmFjayh4LCB5KSkgeyBjb250aW51ZTsgfVxuXHRcdHJlc3VsdC5wdXNoKFt4LCB5XSk7XG5cdH1cblx0XG5cdHJldHVybiByZXN1bHQ7XG59XG4vKipcbiAqIEBjbGFzcyBTaW1wbGlmaWVkIERpamtzdHJhJ3MgYWxnb3JpdGhtOiBhbGwgZWRnZXMgaGF2ZSBhIHZhbHVlIG9mIDFcbiAqIEBhdWdtZW50cyBST1QuUGF0aFxuICogQHNlZSBST1QuUGF0aFxuICovXG5ST1QuUGF0aC5EaWprc3RyYSA9IGZ1bmN0aW9uKHRvWCwgdG9ZLCBwYXNzYWJsZUNhbGxiYWNrLCBvcHRpb25zKSB7XG5cdFJPVC5QYXRoLmNhbGwodGhpcywgdG9YLCB0b1ksIHBhc3NhYmxlQ2FsbGJhY2ssIG9wdGlvbnMpO1xuXG5cdHRoaXMuX2NvbXB1dGVkID0ge307XG5cdHRoaXMuX3RvZG8gPSBbXTtcblx0dGhpcy5fYWRkKHRvWCwgdG9ZLCBudWxsKTtcbn1cblJPVC5QYXRoLkRpamtzdHJhLmV4dGVuZChST1QuUGF0aCk7XG5cbi8qKlxuICogQ29tcHV0ZSBhIHBhdGggZnJvbSBhIGdpdmVuIHBvaW50XG4gKiBAc2VlIFJPVC5QYXRoI2NvbXB1dGVcbiAqL1xuUk9ULlBhdGguRGlqa3N0cmEucHJvdG90eXBlLmNvbXB1dGUgPSBmdW5jdGlvbihmcm9tWCwgZnJvbVksIGNhbGxiYWNrKSB7XG5cdHZhciBrZXkgPSBmcm9tWCtcIixcIitmcm9tWTtcblx0aWYgKCEoa2V5IGluIHRoaXMuX2NvbXB1dGVkKSkgeyB0aGlzLl9jb21wdXRlKGZyb21YLCBmcm9tWSk7IH1cblx0aWYgKCEoa2V5IGluIHRoaXMuX2NvbXB1dGVkKSkgeyByZXR1cm47IH1cblx0XG5cdHZhciBpdGVtID0gdGhpcy5fY29tcHV0ZWRba2V5XTtcblx0d2hpbGUgKGl0ZW0pIHtcblx0XHRjYWxsYmFjayhpdGVtLngsIGl0ZW0ueSk7XG5cdFx0aXRlbSA9IGl0ZW0ucHJldjtcblx0fVxufVxuXG4vKipcbiAqIENvbXB1dGUgYSBub24tY2FjaGVkIHZhbHVlXG4gKi9cblJPVC5QYXRoLkRpamtzdHJhLnByb3RvdHlwZS5fY29tcHV0ZSA9IGZ1bmN0aW9uKGZyb21YLCBmcm9tWSkge1xuXHR3aGlsZSAodGhpcy5fdG9kby5sZW5ndGgpIHtcblx0XHR2YXIgaXRlbSA9IHRoaXMuX3RvZG8uc2hpZnQoKTtcblx0XHRpZiAoaXRlbS54ID09IGZyb21YICYmIGl0ZW0ueSA9PSBmcm9tWSkgeyByZXR1cm47IH1cblx0XHRcblx0XHR2YXIgbmVpZ2hib3JzID0gdGhpcy5fZ2V0TmVpZ2hib3JzKGl0ZW0ueCwgaXRlbS55KTtcblx0XHRcblx0XHRmb3IgKHZhciBpPTA7aTxuZWlnaGJvcnMubGVuZ3RoO2krKykge1xuXHRcdFx0dmFyIG5laWdoYm9yID0gbmVpZ2hib3JzW2ldO1xuXHRcdFx0dmFyIHggPSBuZWlnaGJvclswXTtcblx0XHRcdHZhciB5ID0gbmVpZ2hib3JbMV07XG5cdFx0XHR2YXIgaWQgPSB4K1wiLFwiK3k7XG5cdFx0XHRpZiAoaWQgaW4gdGhpcy5fY29tcHV0ZWQpIHsgY29udGludWU7IH0gLyogYWxyZWFkeSBkb25lICovXHRcblx0XHRcdHRoaXMuX2FkZCh4LCB5LCBpdGVtKTsgXG5cdFx0fVxuXHR9XG59XG5cblJPVC5QYXRoLkRpamtzdHJhLnByb3RvdHlwZS5fYWRkID0gZnVuY3Rpb24oeCwgeSwgcHJldikge1xuXHR2YXIgb2JqID0ge1xuXHRcdHg6IHgsXG5cdFx0eTogeSxcblx0XHRwcmV2OiBwcmV2XG5cdH1cblx0dGhpcy5fY29tcHV0ZWRbeCtcIixcIit5XSA9IG9iajtcblx0dGhpcy5fdG9kby5wdXNoKG9iaik7XG59XG4vKipcbiAqIEBjbGFzcyBTaW1wbGlmaWVkIEEqIGFsZ29yaXRobTogYWxsIGVkZ2VzIGhhdmUgYSB2YWx1ZSBvZiAxXG4gKiBAYXVnbWVudHMgUk9ULlBhdGhcbiAqIEBzZWUgUk9ULlBhdGhcbiAqL1xuUk9ULlBhdGguQVN0YXIgPSBmdW5jdGlvbih0b1gsIHRvWSwgcGFzc2FibGVDYWxsYmFjaywgb3B0aW9ucykge1xuXHRST1QuUGF0aC5jYWxsKHRoaXMsIHRvWCwgdG9ZLCBwYXNzYWJsZUNhbGxiYWNrLCBvcHRpb25zKTtcblxuXHR0aGlzLl90b2RvID0gW107XG5cdHRoaXMuX2RvbmUgPSB7fTtcblx0dGhpcy5fZnJvbVggPSBudWxsO1xuXHR0aGlzLl9mcm9tWSA9IG51bGw7XG59XG5ST1QuUGF0aC5BU3Rhci5leHRlbmQoUk9ULlBhdGgpO1xuXG4vKipcbiAqIENvbXB1dGUgYSBwYXRoIGZyb20gYSBnaXZlbiBwb2ludFxuICogQHNlZSBST1QuUGF0aCNjb21wdXRlXG4gKi9cblJPVC5QYXRoLkFTdGFyLnByb3RvdHlwZS5jb21wdXRlID0gZnVuY3Rpb24oZnJvbVgsIGZyb21ZLCBjYWxsYmFjaykge1xuXHR0aGlzLl90b2RvID0gW107XG5cdHRoaXMuX2RvbmUgPSB7fTtcblx0dGhpcy5fZnJvbVggPSBmcm9tWDtcblx0dGhpcy5fZnJvbVkgPSBmcm9tWTtcblx0dGhpcy5fYWRkKHRoaXMuX3RvWCwgdGhpcy5fdG9ZLCBudWxsKTtcblxuXHR3aGlsZSAodGhpcy5fdG9kby5sZW5ndGgpIHtcblx0XHR2YXIgaXRlbSA9IHRoaXMuX3RvZG8uc2hpZnQoKTtcblx0XHRpZiAoaXRlbS54ID09IGZyb21YICYmIGl0ZW0ueSA9PSBmcm9tWSkgeyBicmVhazsgfVxuXHRcdHZhciBuZWlnaGJvcnMgPSB0aGlzLl9nZXROZWlnaGJvcnMoaXRlbS54LCBpdGVtLnkpO1xuXG5cdFx0Zm9yICh2YXIgaT0wO2k8bmVpZ2hib3JzLmxlbmd0aDtpKyspIHtcblx0XHRcdHZhciBuZWlnaGJvciA9IG5laWdoYm9yc1tpXTtcblx0XHRcdHZhciB4ID0gbmVpZ2hib3JbMF07XG5cdFx0XHR2YXIgeSA9IG5laWdoYm9yWzFdO1xuXHRcdFx0dmFyIGlkID0geCtcIixcIit5O1xuXHRcdFx0aWYgKGlkIGluIHRoaXMuX2RvbmUpIHsgY29udGludWU7IH1cblx0XHRcdHRoaXMuX2FkZCh4LCB5LCBpdGVtKTsgXG5cdFx0fVxuXHR9XG5cdFxuXHR2YXIgaXRlbSA9IHRoaXMuX2RvbmVbZnJvbVgrXCIsXCIrZnJvbVldO1xuXHRpZiAoIWl0ZW0pIHsgcmV0dXJuOyB9XG5cdFxuXHR3aGlsZSAoaXRlbSkge1xuXHRcdGNhbGxiYWNrKGl0ZW0ueCwgaXRlbS55KTtcblx0XHRpdGVtID0gaXRlbS5wcmV2O1xuXHR9XG59XG5cblJPVC5QYXRoLkFTdGFyLnByb3RvdHlwZS5fYWRkID0gZnVuY3Rpb24oeCwgeSwgcHJldikge1xuXHR2YXIgb2JqID0ge1xuXHRcdHg6IHgsXG5cdFx0eTogeSxcblx0XHRwcmV2OiBwcmV2LFxuXHRcdGc6IChwcmV2ID8gcHJldi5nKzEgOiAwKSxcblx0XHRoOiB0aGlzLl9kaXN0YW5jZSh4LCB5KVxuXHR9XG5cdHRoaXMuX2RvbmVbeCtcIixcIit5XSA9IG9iajtcblx0XG5cdC8qIGluc2VydCBpbnRvIHByaW9yaXR5IHF1ZXVlICovXG5cdFxuXHR2YXIgZiA9IG9iai5nICsgb2JqLmg7XG5cdGZvciAodmFyIGk9MDtpPHRoaXMuX3RvZG8ubGVuZ3RoO2krKykge1xuXHRcdHZhciBpdGVtID0gdGhpcy5fdG9kb1tpXTtcblx0XHRpZiAoZiA8IGl0ZW0uZyArIGl0ZW0uaCkge1xuXHRcdFx0dGhpcy5fdG9kby5zcGxpY2UoaSwgMCwgb2JqKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdH1cblx0XG5cdHRoaXMuX3RvZG8ucHVzaChvYmopO1xufVxuXG5ST1QuUGF0aC5BU3Rhci5wcm90b3R5cGUuX2Rpc3RhbmNlID0gZnVuY3Rpb24oeCwgeSkge1xuXHRzd2l0Y2ggKHRoaXMuX29wdGlvbnMudG9wb2xvZ3kpIHtcblx0XHRjYXNlIDQ6XG5cdFx0XHRyZXR1cm4gKE1hdGguYWJzKHgtdGhpcy5fZnJvbVgpICsgTWF0aC5hYnMoeS10aGlzLl9mcm9tWSkpO1xuXHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSA2OlxuXHRcdFx0dmFyIGR4ID0gTWF0aC5hYnMoeCAtIHRoaXMuX2Zyb21YKTtcblx0XHRcdHZhciBkeSA9IE1hdGguYWJzKHkgLSB0aGlzLl9mcm9tWSk7XG5cdFx0XHRyZXR1cm4gZHkgKyBNYXRoLm1heCgwLCAoZHgtZHkpLzIpO1xuXHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSA4OiBcblx0XHRcdHJldHVybiBNYXRoLm1heChNYXRoLmFicyh4LXRoaXMuX2Zyb21YKSwgTWF0aC5hYnMoeS10aGlzLl9mcm9tWSkpO1xuXHRcdGJyZWFrO1xuXHR9XG59XG4iLCIndXNlIHN0cmljdCc7XG52YXIgUk9UO1xuXG5yZXF1aXJlKCcuL2xpYi9yb3QnKTtcblJPVCA9IHdpbmRvdy5ST1Q7XG5cbmZ1bmN0aW9uIE1hcChjb25maWcpe1xuICBjb25zb2xlLmxvZygnTkVXIE1BUCcpO1xuICBjb25maWcucHJvZ3Jlc3MgPSBjb25maWcucHJvZ3Jlc3MgfHwgZnVuY3Rpb24oKXt9O1xuICB2YXIgZGF0YSA9IFtdLFxuICAgICAgaGVpZ2h0ID0gY29uZmlnLmhlaWdodCxcbiAgICAgIGRpZ2dlciA9IG5ldyBST1QuTWFwLkRpZ2dlcihjb25maWcud2lkdGgsIGhlaWdodCwge1xuICAgICAgICByb29tSGVpZ2h0IDogY29uZmlnLnJvb21IZWlnaHQsXG4gICAgICAgIHJvb21XaWR0aCA6IGNvbmZpZy5yb29tV2lkdGgsXG4gICAgICB9KTtcblxuICBkaWdnZXIuY3JlYXRlKGZ1bmN0aW9uIG1hcFByb2dyZXNzKHgsIHksIHZhbHVlKXtcbiAgICBkYXRhLnB1c2godmFsdWUpO1xuICAgIGNvbmZpZy5wcm9ncmVzcyh4LCB5LCB2YWx1ZSk7XG4gIH0pO1xuXG4gIHZhciB3YWxscywgZ3JvdW5kcywgdGlsZXM7XG5cbiAgd2FsbHMgPSBbXTtcbiAgZ3JvdW5kcyA9IFtdO1xuICB0aWxlcyA9IFtdO1xuICBjaGVja1dhbGxzKGRhdGEsIHRpbGVzLCBncm91bmRzLCB3YWxscywgaGVpZ2h0KTtcblxuICB0aGlzLnRpbGVzID0gdGlsZXM7XG4gIHRoaXMuZ3JvdW5kcyA9IGdyb3VuZHM7XG4gIHRoaXMud2FsbHMgPSB3YWxscztcbiAgdGhpcy5kYXRhID0gZGF0YTtcbiAgdGhpcy5tYXAgPSBkaWdnZXI7XG59XG5cbmZ1bmN0aW9uIGNoZWNrV2FsbHMoZGF0YSwgdGlsZXMsIGdyb3VuZHMsIHdhbGxzLCBoZWlnaHQpe1xuICB2YXIgaSwgaW5kZXgsIHR5cGUsIHdhbGw7XG5cbiAgZm9yKGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKyl7XG4gICAgaW5kZXggPSBkYXRhW2ldO1xuICAgIHdhbGwgPSB7XG4gICAgICB4IDogTWF0aC5mbG9vcihpIC8gaGVpZ2h0KSxcbiAgICAgIHkgOiBpICUgaGVpZ2h0XG4gICAgfTtcbiAgICBpZihpbmRleCA9PT0gMCl7XG4gICAgICB3YWxsLnR5cGUgPSAnZ3JvdW5kJztcbiAgICAgIGdyb3VuZHMucHVzaCh3YWxsKTtcbiAgICAgIHRpbGVzLnB1c2gobnVjbGVhci5lbnRpdHkoJ3RpbGUnKS5jcmVhdGUod2FsbCkpO1xuICAgIH0gZWxzZSBpZihpbmRleCA9PT0gMSl7XG4gICAgICBpZih0ZXN0VXBwZXJMZWZ0KGRhdGEsIGksIGhlaWdodCkpe1xuICAgICAgICB3YWxsLnR5cGUgPSAndXBwZXJSaWdodCc7XG4gICAgICAgIHdhbGxzLnB1c2god2FsbCk7XG4gICAgICAgIHRpbGVzLnB1c2gobnVjbGVhci5lbnRpdHkoJ3RpbGUnKS5jcmVhdGUod2FsbCkpO1xuICAgICAgICB0aWxlcy5wdXNoKG51Y2xlYXIuZW50aXR5KCd0aWxlJykuY3JlYXRlKHtcbiAgICAgICAgICAgIHggOiB3YWxsLngsXG4gICAgICAgICAgICB5IDogd2FsbC55LFxuICAgICAgICAgICAgdHlwZSA6IHdhbGwudHlwZSsnX3RvcCdcbiAgICAgICAgICB9KSk7XG4gICAgICAgIGRhdGFbaV0gPSAyO1xuICAgICAgfVxuICAgICAgZWxzZSBpZih0ZXN0VXBwZXJSaWdodChkYXRhLCBpLCBoZWlnaHQpKXtcbiAgICAgICAgd2FsbC50eXBlID0gJ3VwcGVyTGVmdCc7XG4gICAgICAgIHdhbGxzLnB1c2god2FsbCk7XG4gICAgICAgIHRpbGVzLnB1c2gobnVjbGVhci5lbnRpdHkoJ3RpbGUnKS5jcmVhdGUod2FsbCkpO1xuICAgICAgICB0aWxlcy5wdXNoKG51Y2xlYXIuZW50aXR5KCd0aWxlJykuY3JlYXRlKHtcbiAgICAgICAgICAgIHggOiB3YWxsLngsXG4gICAgICAgICAgICB5IDogd2FsbC55LFxuICAgICAgICAgICAgdHlwZSA6IHdhbGwudHlwZSsnX3RvcCdcbiAgICAgICAgICB9KSk7XG4gICAgICAgIGRhdGFbaV0gPSAyO1xuICAgICAgfVxuICAgICAgZWxzZSBpZih0ZXN0RG93bkxlZnQoZGF0YSwgaSwgaGVpZ2h0KSl7XG4gICAgICAgIHdhbGwudHlwZSA9ICdkb3duUmlnaHQnO1xuICAgICAgICB3YWxscy5wdXNoKHdhbGwpO1xuICAgICAgICB0aWxlcy5wdXNoKG51Y2xlYXIuZW50aXR5KCd0aWxlJykuY3JlYXRlKHdhbGwpKTtcbiAgICAgICAgdGlsZXMucHVzaChudWNsZWFyLmVudGl0eSgndGlsZScpLmNyZWF0ZSh7XG4gICAgICAgICAgICB4IDogd2FsbC54LFxuICAgICAgICAgICAgeSA6IHdhbGwueSxcbiAgICAgICAgICAgIHR5cGUgOiB3YWxsLnR5cGUrJ190b3AnXG4gICAgICAgICAgfSkpO1xuICAgICAgICBkYXRhW2ldID0gMjtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYodGVzdERvd25SaWdodChkYXRhLCBpLCBoZWlnaHQpKXtcbiAgICAgICAgd2FsbC50eXBlID0gJ2Rvd25MZWZ0JztcbiAgICAgICAgd2FsbHMucHVzaCh3YWxsKTtcbiAgICAgICAgdGlsZXMucHVzaChudWNsZWFyLmVudGl0eSgndGlsZScpLmNyZWF0ZSh3YWxsKSk7XG4gICAgICAgIHRpbGVzLnB1c2gobnVjbGVhci5lbnRpdHkoJ3RpbGUnKS5jcmVhdGUoe1xuICAgICAgICAgICAgeCA6IHdhbGwueCxcbiAgICAgICAgICAgIHkgOiB3YWxsLnksXG4gICAgICAgICAgICB0eXBlIDogd2FsbC50eXBlKydfdG9wJ1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgZGF0YVtpXSA9IDI7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKHRlc3RVcHBlckV4dGVybmFsTGVmdChkYXRhLCBpLCBoZWlnaHQpKXtcbiAgICAgICAgd2FsbC50eXBlID0gJ3VwcGVyRXh0ZXJuYWxMZWZ0JztcbiAgICAgICAgd2FsbHMucHVzaCh3YWxsKTtcbiAgICAgICAgdGlsZXMucHVzaChudWNsZWFyLmVudGl0eSgndGlsZScpLmNyZWF0ZSh3YWxsKSk7XG4gICAgICAgIGRhdGFbaV0gPSAyO1xuICAgICAgfVxuICAgICAgZWxzZSBpZih0ZXN0VXBwZXJFeHRlcm5hbFJpZ2h0KGRhdGEsIGksIGhlaWdodCkpe1xuICAgICAgICB3YWxsLnR5cGUgPSAndXBwZXJFeHRlcm5hbFJpZ2h0JztcbiAgICAgICAgd2FsbHMucHVzaCh3YWxsKTtcbiAgICAgICAgdGlsZXMucHVzaChudWNsZWFyLmVudGl0eSgndGlsZScpLmNyZWF0ZSh3YWxsKSk7XG4gICAgICAgIGRhdGFbaV0gPSAyO1xuICAgICAgfVxuICAgICAgZWxzZSBpZih0ZXN0RG93bkV4dGVybmFsTGVmdChkYXRhLCBpLCBoZWlnaHQpKXtcbiAgICAgICAgd2FsbC50eXBlID0gJ2Rvd25FeHRlcm5hbExlZnQnO1xuICAgICAgICB3YWxscy5wdXNoKHdhbGwpO1xuICAgICAgICB0aWxlcy5wdXNoKG51Y2xlYXIuZW50aXR5KCd0aWxlJykuY3JlYXRlKHdhbGwpKTtcbiAgICAgICAgZGF0YVtpXSA9IDI7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKHRlc3REb3duRXh0ZXJuYWxSaWdodChkYXRhLCBpLCBoZWlnaHQpKXtcbiAgICAgICAgd2FsbC50eXBlID0gJ2Rvd25FeHRlcm5hbFJpZ2h0JztcbiAgICAgICAgd2FsbHMucHVzaCh3YWxsKTtcbiAgICAgICAgdGlsZXMucHVzaChudWNsZWFyLmVudGl0eSgndGlsZScpLmNyZWF0ZSh3YWxsKSk7XG4gICAgICAgIGRhdGFbaV0gPSAyO1xuICAgICAgfVxuICAgICAgZWxzZSBpZih0ZXN0RG91YmxlU2lkZXMoZGF0YSwgaSwgaGVpZ2h0KSl7XG4gICAgICAgIHdhbGwudHlwZSA9ICdkb3VibGVTaWRlcyc7XG4gICAgICAgIHdhbGxzLnB1c2god2FsbCk7XG4gICAgICAgIHRpbGVzLnB1c2gobnVjbGVhci5lbnRpdHkoJ3RpbGUnKS5jcmVhdGUod2FsbCkpO1xuICAgICAgICBkYXRhW2ldID0gMjtcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgIHR5cGUgPSB0ZXN0V2FsbChkYXRhLCBpLCBoZWlnaHQpO1xuICAgICAgICBpZih0eXBlKXtcbiAgICAgICAgICB3YWxsLnR5cGUgPSB0eXBlO1xuICAgICAgICAgIHdhbGxzLnB1c2god2FsbCk7XG4gICAgICAgICAgdGlsZXMucHVzaChudWNsZWFyLmVudGl0eSgndGlsZScpLmNyZWF0ZSh3YWxsKSk7XG4gICAgICAgICAgdGlsZXMucHVzaChudWNsZWFyLmVudGl0eSgndGlsZScpLmNyZWF0ZSh7XG4gICAgICAgICAgICB4IDogd2FsbC54LFxuICAgICAgICAgICAgeSA6IHdhbGwueSxcbiAgICAgICAgICAgIHR5cGUgOiB3YWxsLnR5cGUrJ190b3AnXG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIGRhdGFbaV0gPSAyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHRlc3RXYWxsKGRhdGEsIGksIGhlaWdodCl7XG4gIGlmKGRhdGFbaSsxXSA9PT0gMCl7XG4gICAgcmV0dXJuICd1cCc7XG4gIH0gZWxzZSBpZihkYXRhW2ktMV0gPT09IDApe1xuICAgIHJldHVybiAnZG93bic7XG4gIH0gZWxzZSBpZihkYXRhW2kraGVpZ2h0XSA9PT0gMCl7XG4gICAgcmV0dXJuICdyaWdodCc7XG4gIH0gZWxzZSBpZihkYXRhW2ktaGVpZ2h0XSA9PT0gMCl7XG4gICAgcmV0dXJuICdsZWZ0JztcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gdGVzdFVwcGVyTGVmdChkYXRhLCBpLCBoZWlnaHQpe1xuICByZXR1cm4oZGF0YVtpKzFdICE9PSAwICYmIGRhdGFbaS0xXSA9PT0gMCAmJiBkYXRhW2kraGVpZ2h0XSAhPT0gMCAmJiBkYXRhW2ktaGVpZ2h0XSA9PT0gMCk7XG59XG5cbmZ1bmN0aW9uIHRlc3RVcHBlclJpZ2h0KGRhdGEsIGksIGhlaWdodCl7XG4gIHJldHVybihkYXRhW2krMV0gPT09IDAgJiYgZGF0YVtpLTFdICE9PSAwICYmIGRhdGFbaStoZWlnaHRdICE9PSAwICYmIGRhdGFbaS1oZWlnaHRdID09PSAwKTtcbn1cblxuZnVuY3Rpb24gdGVzdERvd25MZWZ0KGRhdGEsIGksIGhlaWdodCl7XG4gIHJldHVybihkYXRhW2krMV0gIT09IDAgJiYgZGF0YVtpLTFdID09PSAwICYmIGRhdGFbaStoZWlnaHRdID09PSAwICYmIGRhdGFbaS1oZWlnaHRdICE9PSAwKTtcbn1cblxuZnVuY3Rpb24gdGVzdERvd25SaWdodChkYXRhLCBpLCBoZWlnaHQpe1xuICByZXR1cm4oZGF0YVtpKzFdID09PSAwICYmIGRhdGFbaS0xXSAhPT0gMCAmJiBkYXRhW2kraGVpZ2h0XSA9PT0gMCAmJiBkYXRhW2ktaGVpZ2h0XSAhPT0gMCk7XG59XG5cbmZ1bmN0aW9uIHRlc3RVcHBlckV4dGVybmFsTGVmdChkYXRhLCBpLCBoZWlnaHQpe1xuICByZXR1cm4oZGF0YVtpKzFdICE9PSAwICYmIGRhdGFbaStoZWlnaHRdICE9PSAwICYmIGRhdGFbaS1oZWlnaHRdICE9PSAwICYmIGRhdGFbaStoZWlnaHQrMV0gPT09IDApO1xufVxuXG5mdW5jdGlvbiB0ZXN0VXBwZXJFeHRlcm5hbFJpZ2h0KGRhdGEsIGksIGhlaWdodCl7XG4gIHJldHVybihkYXRhW2krMV0gIT09IDAgJiYgZGF0YVtpK2hlaWdodF0gIT09IDAgJiYgZGF0YVtpLWhlaWdodF0gIT09IDAgJiYgZGF0YVtpLWhlaWdodCsxXSA9PT0gMCk7XG59XG5cbmZ1bmN0aW9uIHRlc3REb3duRXh0ZXJuYWxSaWdodChkYXRhLCBpLCBoZWlnaHQpe1xuICByZXR1cm4oZGF0YVtpKzFdICE9PSAwICYmZGF0YVtpLTFdICE9PSAwICYmIGRhdGFbaStoZWlnaHRdICE9PSAwICYmIGRhdGFbaS1oZWlnaHRdICE9PSAwICYmIGRhdGFbaS1oZWlnaHQtMV0gPT09IDApO1xufVxuXG5mdW5jdGlvbiB0ZXN0RG93bkV4dGVybmFsTGVmdChkYXRhLCBpLCBoZWlnaHQpe1xuICByZXR1cm4oZGF0YVtpKzFdICE9PSAwICYmIGRhdGFbaS0xXSAhPT0gMCAmJiBkYXRhW2kraGVpZ2h0XSAhPT0gMCAmJiBkYXRhW2ktaGVpZ2h0XSAhPT0gMCAmJiBkYXRhW2kraGVpZ2h0LTFdID09PSAwKTtcbn1cblxuZnVuY3Rpb24gdGVzdERvdWJsZVNpZGVzKGRhdGEsIGksIGhlaWdodCl7XG4gIHJldHVybihkYXRhW2krMV0gIT09IDAgJiYgZGF0YVtpK2hlaWdodF0gPT09IDAgJiYgZGF0YVtpLWhlaWdodF0gPT09IDApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcDtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gVGVtcGxhdGUoaWQsIHBvc2l0aW9uLCB3aWR0aCwgaGVpZ2h0LCBjb25maWcpe1xuICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICB0aGlzLndpZHRoID0gd2lkdGg7XG4gIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICB0aGlzLmlkID0gaWQ7XG5cbiAgdGhpcy5zbG90cyA9IGdlbmVyYXRlU2xvdHModGhpcywgY29uZmlnLnNsb3RzKTtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVTbG90cyhzZWxmLCBzbG90cyl7XG4gIHZhciBpLCBzbG90LCBkYXRhLCBlbnRpdGllcztcblxuICBlbnRpdGllcyA9IFtdO1xuICBmb3IoaSA9IDA7IGkgPCBzbG90cy5sZW5ndGg7IGkrKyl7XG4gICAgc2xvdCA9IHNsb3RzW2ldO1xuICAgIGRhdGEgPSB7fTtcbiAgICBkYXRhLnBvc2l0aW9uID0ge1xuICAgICAgeCA6IHNlbGYucG9zaXRpb24ueCArIE1hdGgucm91bmQoc2xvdC5wb3NpdGlvbi54KnNlbGYud2lkdGgvMTAwKSxcbiAgICAgIHkgOiBzZWxmLnBvc2l0aW9uLnkgKyBNYXRoLnJvdW5kKHNsb3QucG9zaXRpb24ueSpzZWxmLmhlaWdodC8xMDApXG4gICAgfTtcbiAgICBkYXRhLmJ1bmRsZSA9IHNlbGYuY29uZmlnLmJ1bmRsZTtcbiAgICBkYXRhLnR5cGUgPSBzbG90LnR5cGU7XG4gICAgZGF0YS50ZW1wbGF0ZSA9IHNlbGYuaWQ7XG5cbiAgICBlbnRpdGllcy5wdXNoKG51Y2xlYXIuZW50aXR5KCdzbG90IGZyb20gcm9ndWVtYXAnKS5jcmVhdGUoZGF0YSkpO1xuICB9XG5cbiAgcmV0dXJuIGVudGl0aWVzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlbXBsYXRlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBQb3NpdGlvbkNvbXBvbmVudCh4LCB5KSB7XG4gIHRoaXMueCA9IHg7XG4gIHRoaXMueSA9IHk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUG9zaXRpb25Db21wb25lbnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBQb3NpdGlvbkNvbXBvbmVudDtcblxuUG9zaXRpb25Db21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvcG9zaXRpb24tY29tcG9uZW50Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gbnVjbGVhci5tb2R1bGUoJ2dhbWUudHJhbnNmb3JtJywgW10pXG4gIC5jb21wb25lbnQoJ3Bvc2l0aW9uJywgZnVuY3Rpb24gKGUsIHgsIHkpIHtcbiAgICByZXR1cm4gbmV3IFBvc2l0aW9uQ29tcG9uZW50KHgsIHkpO1xuICB9KTtcbiJdfQ==
;