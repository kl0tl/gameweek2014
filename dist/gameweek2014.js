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

game.loader.load([
    'atlases/prinny.atlas.png',
    'atlases/prinny.atlas.json',
    'animations/prinny/prinny@dancing.json',
    
    'atlases/ground1.atlas.png',
    'atlases/ground1.atlas.json'
  ])
  .done(function () {
    var context;

    nuclear.import([transform, rendering, animations]);

    console.log('modules loaded!');
    // var map = nuclear.entity('map').create({
    //   mapData : {
    //     width : 200,
    //     height : 200,
    //     roomWidth : [3, 20],
    //     roomHeight : [3, 20]
    //   }
    // });

    context = nuclear.system.context();

    context.dests = [
      document.getElementById('screen').getContext('2d')
    ];

    context.WIDTH = context.dests[0].canvas.width;
    context.HEIGHT = context.dests[0].canvas.height;

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

function SpriteComponent(width, height, dest) {
  this.buffer = document.createElement('canvas');
  this.context = this.buffer.getContext('2d');

  this.dest = dest || 0;

  this.buffer.width = width;
  this.buffer.height = height;
}

SpriteComponent.prototype.fromAtlas = function (atlas, frame) {
  var source, sprite, width, height;

  source = loader.get(path.join('atlases', atlas + '.atlas.png'));
  sprite = loader.get(path.join('atlases', atlas + '.atlas.json'))[frame];

  width = sprite.frame.w;
  height = sprite.frame.h;

  this.width(width);
  this.height(height);

  this.context.drawImage(source, sprite.frame.x, sprite.frame.y, width, height, 0, 0, width, height);
};

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

},{"game":"HPsMKw","path":2}],19:[function(require,module,exports){
'use strict';

var AtlasComponent, SpriteComponent;

AtlasComponent = require('./components/atlas-component');
SpriteComponent = require('./components/sprite-component');

nuclear.events.on('system:before:renderer from game.rendering', function () {
  // var context;

  // context = nuclear.system.context();

  // context.dests[0].clearRect(0, 0, context.WIDTH, context.HEIGHT);
});

module.exports = nuclear.module('game.rendering', ['game.transform'])
  .component('atlas', function (e, key) {
    return new AtlasComponent(key);
  })
  .component('sprite', function (e, width, height, dest) {
    return new SpriteComponent(width, height, dest);
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

  context.dests[0].clearRect(0, 0, context.WIDTH, context.HEIGHT);
});

module.exports = function rendererSystem(e, components, context) {
  var sprite, position, dest, width, height;

  sprite = components.sprite;
  position = components.position;

  dest = context.dests[sprite.dest];

  width = sprite.width();
  height = sprite.height();

  dest.drawImage(sprite.buffer, position.x - width * 0.5, position.y - height * 0.5, width, height);
};

},{}],21:[function(require,module,exports){
'use strict';

module.exports = {
  templates : {
    'one' : {
      name : 'one',
      slots : [
        {
          type : 'prinny',
          position : {
            x : 30,
            y : 20
          }
        },
        {
          type : 'prinny',
          position : {
            x : 40,
            y : 20
          }
        },
        {
          type : 'prinny',
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
          type : 'prinny',
          position : {
            x : 30,
            y : 20
          }
        },
        {
          type : 'prinny',
          position : {
            x : 40,
            y : 20
          }
        },
        {
          type : 'prinny',
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
          type : 'prinny',
          position : {
            x : 30,
            y : 20
          }
        },
        {
          type : 'prinny',
          position : {
            x : 40,
            y : 20
          }
        },
        {
          type : 'prinny',
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
          type : 'prinny',
          position : {
            x : 30,
            y : 20
          }
        },
        {
          type : 'prinny',
          position : {
            x : 40,
            y : 20
          }
        },
        {
          type : 'prinny',
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
    crate : {
      components : [
        'destructible',
        'collider',
        'sprite',
        'scale'
      ],
      data : {

      }
    },
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
    prinny : {
      components : [
        
      ],
      data : {
        sprite : [0, 20, 20],
        atlas : [0, 'prinny'],
        animations : [0, {
          target: 'prinny',
          animations: ['dancing'],
          defaultAnimation: 'dancing'
        }]
      }
    }
  },
  resolution : 30
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
  var rooms = [];
  for(var i = 0; i < digger._rooms.length; i++){
    var room = digger._rooms[i];
    rooms.push(roguemap.entity('room').create(room));
  }

  nuclear.component('rooms_manager from roguemap').add(entity, rooms);
});

roguemap.entity('tile', function(/*entity, data*/){
  // var resolution = roguemap.config('resolution'),
  //     position = nuclear.component('position from game.transform').add(entity, data.x*resolution, data.y*resolution),
  //     sprite = nuclear.component('sprite from game.rendering').add(entity, resolution, resolution);

  // sprite.
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
  resolution : 20
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
		corridorLength: [3, 10], /* corridor minimum and maximum length */
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
        wall.type = 'upperLeft';
        walls.push(wall);
        tiles.push(nuclear.entity('tile').create(wall));
        data[i] = 2;
      }
      else if(testUpperRight(data, i, height)){
        wall.type = 'upperRight';
        walls.push(wall);
        tiles.push(nuclear.entity('tile').create(wall));
        data[i] = 2;
      }
      else if(testDownLeft(data, i, height)){
        wall.type = 'downLeft';
        walls.push(wall);
        tiles.push(nuclear.entity('tile').create(wall));
        data[i] = 2;
      }
      else if(testDownRight(data, i, height)){
        wall.type = 'downRight';
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
          data[i] = 2;
        }
      }
    }
  }
}

function testWall(data, i, height){
  if(data[i+1] === 0){
    return 'left';
  } else if(data[i-1] === 0){
    return 'right';
  } else if(data[i+height] === 0){
    return 'up';
  } else if(data[i-height] === 0){
    return 'down';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbnNlcnQtbW9kdWxlLWdsb2JhbHMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3BhdGgtYnJvd3NlcmlmeS9pbmRleC5qcyIsIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvc3JjL2dhbWUuanMiLCIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvc3JjL2xvYWRlcnMvYXNzZXRzLWJ1bmRsZS5qcyIsIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvc3JjL2xvYWRlcnMvYXNzZXRzLWxvYWRlci5qcyIsIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvc3JjL2xvYWRlcnMvaW1hZ2VzLWxvYWRlci5qcyIsIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvc3JjL2xvYWRlcnMvaW5kZXguanMiLCIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L3NyYy9sb2FkZXJzL2pzb24tbG9hZGVyLmpzIiwiL1VzZXJzL2FkcmllbmNhcnRhL2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUuYW5pbWF0aW9ucy9jb21wb25lbnRzL2FuaW1hdGlvbnMtY29tcG9uZW50LmpzIiwiL1VzZXJzL2FkcmllbmNhcnRhL2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUuYW5pbWF0aW9ucy9pbmRleC5qcyIsIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvc3JjL251Y2xlYXJfbW9kdWxlcy9nYW1lLmFuaW1hdGlvbnMvc3lzdGVtcy9hbmltYXRlLXN5c3RlbS5qcyIsIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvc3JjL251Y2xlYXJfbW9kdWxlcy9nYW1lLmlucHV0cy9pbmRleC5qcyIsIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvc3JjL251Y2xlYXJfbW9kdWxlcy9nYW1lLmlucHV0cy9saWIvZ2FtZXBhZC5taW4uanMiLCIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS5pbnB1dHMvbGliL21vdXNldHJhcC5taW4uanMiLCIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS5yZW5kZXJpbmcvY29tcG9uZW50cy9hdGxhcy1jb21wb25lbnQuanMiLCIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS5yZW5kZXJpbmcvY29tcG9uZW50cy9zcHJpdGUtY29tcG9uZW50LmpzIiwiL1VzZXJzL2FkcmllbmNhcnRhL2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUucmVuZGVyaW5nL2luZGV4LmpzIiwiL1VzZXJzL2FkcmllbmNhcnRhL2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUucmVuZGVyaW5nL3N5c3RlbXMvcmVuZGVyZXItc3lzdGVtLmpzIiwiL1VzZXJzL2FkcmllbmNhcnRhL2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUucm9ndWVtYXAvY29uZmlnLmpzIiwiL1VzZXJzL2FkcmllbmNhcnRhL2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUucm9ndWVtYXAvaW5kZXguanMiLCIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS5yb2d1ZW1hcC9saWIvcm90LmpzIiwiL1VzZXJzL2FkcmllbmNhcnRhL2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUucm9ndWVtYXAvbWFwLmpzIiwiL1VzZXJzL2FkcmllbmNhcnRhL2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUucm9ndWVtYXAvdGVtcGxhdGUuanMiLCIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS50cmFuc2Zvcm0vY29tcG9uZW50cy9wb3NpdGlvbi1jb21wb25lbnQuanMiLCIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L3NyYy9udWNsZWFyX21vZHVsZXMvZ2FtZS50cmFuc2Zvcm0vaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4NUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCIoZnVuY3Rpb24gKHByb2Nlc3Mpe1xuLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIHJlc29sdmVzIC4gYW5kIC4uIGVsZW1lbnRzIGluIGEgcGF0aCBhcnJheSB3aXRoIGRpcmVjdG9yeSBuYW1lcyB0aGVyZVxuLy8gbXVzdCBiZSBubyBzbGFzaGVzLCBlbXB0eSBlbGVtZW50cywgb3IgZGV2aWNlIG5hbWVzIChjOlxcKSBpbiB0aGUgYXJyYXlcbi8vIChzbyBhbHNvIG5vIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHNsYXNoZXMgLSBpdCBkb2VzIG5vdCBkaXN0aW5ndWlzaFxuLy8gcmVsYXRpdmUgYW5kIGFic29sdXRlIHBhdGhzKVxuZnVuY3Rpb24gbm9ybWFsaXplQXJyYXkocGFydHMsIGFsbG93QWJvdmVSb290KSB7XG4gIC8vIGlmIHRoZSBwYXRoIHRyaWVzIHRvIGdvIGFib3ZlIHRoZSByb290LCBgdXBgIGVuZHMgdXAgPiAwXG4gIHZhciB1cCA9IDA7XG4gIGZvciAodmFyIGkgPSBwYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIHZhciBsYXN0ID0gcGFydHNbaV07XG4gICAgaWYgKGxhc3QgPT09ICcuJykge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgIH0gZWxzZSBpZiAobGFzdCA9PT0gJy4uJykge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXArKztcbiAgICB9IGVsc2UgaWYgKHVwKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgICB1cC0tO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoZSBwYXRoIGlzIGFsbG93ZWQgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIHJlc3RvcmUgbGVhZGluZyAuLnNcbiAgaWYgKGFsbG93QWJvdmVSb290KSB7XG4gICAgZm9yICg7IHVwLS07IHVwKSB7XG4gICAgICBwYXJ0cy51bnNoaWZ0KCcuLicpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwYXJ0cztcbn1cblxuLy8gU3BsaXQgYSBmaWxlbmFtZSBpbnRvIFtyb290LCBkaXIsIGJhc2VuYW1lLCBleHRdLCB1bml4IHZlcnNpb25cbi8vICdyb290JyBpcyBqdXN0IGEgc2xhc2gsIG9yIG5vdGhpbmcuXG52YXIgc3BsaXRQYXRoUmUgPVxuICAgIC9eKFxcLz98KShbXFxzXFxTXSo/KSgoPzpcXC57MSwyfXxbXlxcL10rP3wpKFxcLlteLlxcL10qfCkpKD86W1xcL10qKSQvO1xudmFyIHNwbGl0UGF0aCA9IGZ1bmN0aW9uKGZpbGVuYW1lKSB7XG4gIHJldHVybiBzcGxpdFBhdGhSZS5leGVjKGZpbGVuYW1lKS5zbGljZSgxKTtcbn07XG5cbi8vIHBhdGgucmVzb2x2ZShbZnJvbSAuLi5dLCB0bylcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMucmVzb2x2ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmVzb2x2ZWRQYXRoID0gJycsXG4gICAgICByZXNvbHZlZEFic29sdXRlID0gZmFsc2U7XG5cbiAgZm9yICh2YXIgaSA9IGFyZ3VtZW50cy5sZW5ndGggLSAxOyBpID49IC0xICYmICFyZXNvbHZlZEFic29sdXRlOyBpLS0pIHtcbiAgICB2YXIgcGF0aCA9IChpID49IDApID8gYXJndW1lbnRzW2ldIDogcHJvY2Vzcy5jd2QoKTtcblxuICAgIC8vIFNraXAgZW1wdHkgYW5kIGludmFsaWQgZW50cmllc1xuICAgIGlmICh0eXBlb2YgcGF0aCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyB0byBwYXRoLnJlc29sdmUgbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfSBlbHNlIGlmICghcGF0aCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgcmVzb2x2ZWRQYXRoID0gcGF0aCArICcvJyArIHJlc29sdmVkUGF0aDtcbiAgICByZXNvbHZlZEFic29sdXRlID0gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbiAgfVxuXG4gIC8vIEF0IHRoaXMgcG9pbnQgdGhlIHBhdGggc2hvdWxkIGJlIHJlc29sdmVkIHRvIGEgZnVsbCBhYnNvbHV0ZSBwYXRoLCBidXRcbiAgLy8gaGFuZGxlIHJlbGF0aXZlIHBhdGhzIHRvIGJlIHNhZmUgKG1pZ2h0IGhhcHBlbiB3aGVuIHByb2Nlc3MuY3dkKCkgZmFpbHMpXG5cbiAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gIHJlc29sdmVkUGF0aCA9IG5vcm1hbGl6ZUFycmF5KGZpbHRlcihyZXNvbHZlZFBhdGguc3BsaXQoJy8nKSwgZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiAhIXA7XG4gIH0pLCAhcmVzb2x2ZWRBYnNvbHV0ZSkuam9pbignLycpO1xuXG4gIHJldHVybiAoKHJlc29sdmVkQWJzb2x1dGUgPyAnLycgOiAnJykgKyByZXNvbHZlZFBhdGgpIHx8ICcuJztcbn07XG5cbi8vIHBhdGgubm9ybWFsaXplKHBhdGgpXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgdmFyIGlzQWJzb2x1dGUgPSBleHBvcnRzLmlzQWJzb2x1dGUocGF0aCksXG4gICAgICB0cmFpbGluZ1NsYXNoID0gc3Vic3RyKHBhdGgsIC0xKSA9PT0gJy8nO1xuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICBwYXRoID0gbm9ybWFsaXplQXJyYXkoZmlsdGVyKHBhdGguc3BsaXQoJy8nKSwgZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiAhIXA7XG4gIH0pLCAhaXNBYnNvbHV0ZSkuam9pbignLycpO1xuXG4gIGlmICghcGF0aCAmJiAhaXNBYnNvbHV0ZSkge1xuICAgIHBhdGggPSAnLic7XG4gIH1cbiAgaWYgKHBhdGggJiYgdHJhaWxpbmdTbGFzaCkge1xuICAgIHBhdGggKz0gJy8nO1xuICB9XG5cbiAgcmV0dXJuIChpc0Fic29sdXRlID8gJy8nIDogJycpICsgcGF0aDtcbn07XG5cbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMuaXNBYnNvbHV0ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHBhdGguY2hhckF0KDApID09PSAnLyc7XG59O1xuXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLmpvaW4gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHBhdGhzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgcmV0dXJuIGV4cG9ydHMubm9ybWFsaXplKGZpbHRlcihwYXRocywgZnVuY3Rpb24ocCwgaW5kZXgpIHtcbiAgICBpZiAodHlwZW9mIHAgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgdG8gcGF0aC5qb2luIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfSkuam9pbignLycpKTtcbn07XG5cblxuLy8gcGF0aC5yZWxhdGl2ZShmcm9tLCB0bylcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMucmVsYXRpdmUgPSBmdW5jdGlvbihmcm9tLCB0bykge1xuICBmcm9tID0gZXhwb3J0cy5yZXNvbHZlKGZyb20pLnN1YnN0cigxKTtcbiAgdG8gPSBleHBvcnRzLnJlc29sdmUodG8pLnN1YnN0cigxKTtcblxuICBmdW5jdGlvbiB0cmltKGFycikge1xuICAgIHZhciBzdGFydCA9IDA7XG4gICAgZm9yICg7IHN0YXJ0IDwgYXJyLmxlbmd0aDsgc3RhcnQrKykge1xuICAgICAgaWYgKGFycltzdGFydF0gIT09ICcnKSBicmVhaztcbiAgICB9XG5cbiAgICB2YXIgZW5kID0gYXJyLmxlbmd0aCAtIDE7XG4gICAgZm9yICg7IGVuZCA+PSAwOyBlbmQtLSkge1xuICAgICAgaWYgKGFycltlbmRdICE9PSAnJykgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0ID4gZW5kKSByZXR1cm4gW107XG4gICAgcmV0dXJuIGFyci5zbGljZShzdGFydCwgZW5kIC0gc3RhcnQgKyAxKTtcbiAgfVxuXG4gIHZhciBmcm9tUGFydHMgPSB0cmltKGZyb20uc3BsaXQoJy8nKSk7XG4gIHZhciB0b1BhcnRzID0gdHJpbSh0by5zcGxpdCgnLycpKTtcblxuICB2YXIgbGVuZ3RoID0gTWF0aC5taW4oZnJvbVBhcnRzLmxlbmd0aCwgdG9QYXJ0cy5sZW5ndGgpO1xuICB2YXIgc2FtZVBhcnRzTGVuZ3RoID0gbGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGZyb21QYXJ0c1tpXSAhPT0gdG9QYXJ0c1tpXSkge1xuICAgICAgc2FtZVBhcnRzTGVuZ3RoID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHZhciBvdXRwdXRQYXJ0cyA9IFtdO1xuICBmb3IgKHZhciBpID0gc2FtZVBhcnRzTGVuZ3RoOyBpIDwgZnJvbVBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgb3V0cHV0UGFydHMucHVzaCgnLi4nKTtcbiAgfVxuXG4gIG91dHB1dFBhcnRzID0gb3V0cHV0UGFydHMuY29uY2F0KHRvUGFydHMuc2xpY2Uoc2FtZVBhcnRzTGVuZ3RoKSk7XG5cbiAgcmV0dXJuIG91dHB1dFBhcnRzLmpvaW4oJy8nKTtcbn07XG5cbmV4cG9ydHMuc2VwID0gJy8nO1xuZXhwb3J0cy5kZWxpbWl0ZXIgPSAnOic7XG5cbmV4cG9ydHMuZGlybmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgdmFyIHJlc3VsdCA9IHNwbGl0UGF0aChwYXRoKSxcbiAgICAgIHJvb3QgPSByZXN1bHRbMF0sXG4gICAgICBkaXIgPSByZXN1bHRbMV07XG5cbiAgaWYgKCFyb290ICYmICFkaXIpIHtcbiAgICAvLyBObyBkaXJuYW1lIHdoYXRzb2V2ZXJcbiAgICByZXR1cm4gJy4nO1xuICB9XG5cbiAgaWYgKGRpcikge1xuICAgIC8vIEl0IGhhcyBhIGRpcm5hbWUsIHN0cmlwIHRyYWlsaW5nIHNsYXNoXG4gICAgZGlyID0gZGlyLnN1YnN0cigwLCBkaXIubGVuZ3RoIC0gMSk7XG4gIH1cblxuICByZXR1cm4gcm9vdCArIGRpcjtcbn07XG5cblxuZXhwb3J0cy5iYXNlbmFtZSA9IGZ1bmN0aW9uKHBhdGgsIGV4dCkge1xuICB2YXIgZiA9IHNwbGl0UGF0aChwYXRoKVsyXTtcbiAgLy8gVE9ETzogbWFrZSB0aGlzIGNvbXBhcmlzb24gY2FzZS1pbnNlbnNpdGl2ZSBvbiB3aW5kb3dzP1xuICBpZiAoZXh0ICYmIGYuc3Vic3RyKC0xICogZXh0Lmxlbmd0aCkgPT09IGV4dCkge1xuICAgIGYgPSBmLnN1YnN0cigwLCBmLmxlbmd0aCAtIGV4dC5sZW5ndGgpO1xuICB9XG4gIHJldHVybiBmO1xufTtcblxuXG5leHBvcnRzLmV4dG5hbWUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHJldHVybiBzcGxpdFBhdGgocGF0aClbM107XG59O1xuXG5mdW5jdGlvbiBmaWx0ZXIgKHhzLCBmKSB7XG4gICAgaWYgKHhzLmZpbHRlcikgcmV0dXJuIHhzLmZpbHRlcihmKTtcbiAgICB2YXIgcmVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoZih4c1tpXSwgaSwgeHMpKSByZXMucHVzaCh4c1tpXSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59XG5cbi8vIFN0cmluZy5wcm90b3R5cGUuc3Vic3RyIC0gbmVnYXRpdmUgaW5kZXggZG9uJ3Qgd29yayBpbiBJRThcbnZhciBzdWJzdHIgPSAnYWInLnN1YnN0cigtMSkgPT09ICdiJ1xuICAgID8gZnVuY3Rpb24gKHN0ciwgc3RhcnQsIGxlbikgeyByZXR1cm4gc3RyLnN1YnN0cihzdGFydCwgbGVuKSB9XG4gICAgOiBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuKSB7XG4gICAgICAgIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gc3RyLmxlbmd0aCArIHN0YXJ0O1xuICAgICAgICByZXR1cm4gc3RyLnN1YnN0cihzdGFydCwgbGVuKTtcbiAgICB9XG47XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiL1VzZXJzL2FkcmllbmNhcnRhL2dhbWV3ZWVrMjAxNC9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaW5zZXJ0LW1vZHVsZS1nbG9iYWxzL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanNcIikpIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQXNzZXRzTG9hZGVyLCBJbWFnZXNMb2FkZXIsIEpzb25Mb2FkZXI7XG5cbkFzc2V0c0xvYWRlciA9IHJlcXVpcmUoJy4vbG9hZGVycycpLkFzc2V0c0xvYWRlcjtcbkltYWdlc0xvYWRlciA9IHJlcXVpcmUoJy4vbG9hZGVycycpLkltYWdlc0xvYWRlcjtcbkpzb25Mb2FkZXIgPSByZXF1aXJlKCcuL2xvYWRlcnMnKS5Kc29uTG9hZGVyO1xuXG5leHBvcnRzLmxvYWRlciA9IG5ldyBBc3NldHNMb2FkZXIoJy9hc3NldHMnKVxuICAud2hlbigvXFwuKD86cG5nfGpwZykkLywgbmV3IEltYWdlc0xvYWRlcigpKVxuICAud2hlbigvXFwuanNvbiQvLCBuZXcgSnNvbkxvYWRlcigpKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdhbWUsIHRyYW5zZm9ybSwgcmVuZGVyaW5nLCBhbmltYXRpb25zO1xuXG5nYW1lID0gcmVxdWlyZSgnZ2FtZScpO1xuXG50cmFuc2Zvcm0gPSByZXF1aXJlKCcuL251Y2xlYXJfbW9kdWxlcy9nYW1lLnRyYW5zZm9ybScpO1xucmVuZGVyaW5nID0gcmVxdWlyZSgnLi9udWNsZWFyX21vZHVsZXMvZ2FtZS5yZW5kZXJpbmcnKTtcbmFuaW1hdGlvbnMgPSByZXF1aXJlKCcuL251Y2xlYXJfbW9kdWxlcy9nYW1lLmFuaW1hdGlvbnMnKTtcbnJlcXVpcmUoJy4vbnVjbGVhcl9tb2R1bGVzL2dhbWUuaW5wdXRzLycpO1xucmVxdWlyZSgnLi9udWNsZWFyX21vZHVsZXMvZ2FtZS5yb2d1ZW1hcC8nKTtcblxubnVjbGVhci5tb2R1bGUoJ2lucHV0cycpLmNvbmZpZygnZ2FtZXBhZCcpLkZBQ0VfMSA9ICdGSVJFJztcbnZhciBlbnRpdHkgPSBudWNsZWFyLmVudGl0eS5jcmVhdGUoKTtcblxubnVjbGVhci5jb21wb25lbnQoJ2lucHV0cycpLmFkZChlbnRpdHksIHtcbiAgRklSRSA6IGZ1bmN0aW9uKGVudGl0eSwgaW5wdXQpe1xuICAgIGlmKGlucHV0ICE9PSAwKXtcbiAgICAgIGNvbnNvbGUubG9nKGlucHV0KTtcbiAgICB9XG4gIH0sXG4gIFVQIDogZnVuY3Rpb24oZW50aXR5LCBpbnB1dCl7XG4gICAgaWYoaW5wdXQgIT09IDApe1xuICAgICAgY29uc29sZS5sb2coaW5wdXQpO1xuICAgIH1cbiAgfVxufSk7XG5cbmdhbWUubG9hZGVyLmxvYWQoW1xuICAgICdhdGxhc2VzL3ByaW5ueS5hdGxhcy5wbmcnLFxuICAgICdhdGxhc2VzL3ByaW5ueS5hdGxhcy5qc29uJyxcbiAgICAnYW5pbWF0aW9ucy9wcmlubnkvcHJpbm55QGRhbmNpbmcuanNvbicsXG4gICAgXG4gICAgJ2F0bGFzZXMvZ3JvdW5kMS5hdGxhcy5wbmcnLFxuICAgICdhdGxhc2VzL2dyb3VuZDEuYXRsYXMuanNvbidcbiAgXSlcbiAgLmRvbmUoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb250ZXh0O1xuXG4gICAgbnVjbGVhci5pbXBvcnQoW3RyYW5zZm9ybSwgcmVuZGVyaW5nLCBhbmltYXRpb25zXSk7XG5cbiAgICBjb25zb2xlLmxvZygnbW9kdWxlcyBsb2FkZWQhJyk7XG4gICAgLy8gdmFyIG1hcCA9IG51Y2xlYXIuZW50aXR5KCdtYXAnKS5jcmVhdGUoe1xuICAgIC8vICAgbWFwRGF0YSA6IHtcbiAgICAvLyAgICAgd2lkdGggOiAyMDAsXG4gICAgLy8gICAgIGhlaWdodCA6IDIwMCxcbiAgICAvLyAgICAgcm9vbVdpZHRoIDogWzMsIDIwXSxcbiAgICAvLyAgICAgcm9vbUhlaWdodCA6IFszLCAyMF1cbiAgICAvLyAgIH1cbiAgICAvLyB9KTtcblxuICAgIGNvbnRleHQgPSBudWNsZWFyLnN5c3RlbS5jb250ZXh0KCk7XG5cbiAgICBjb250ZXh0LmRlc3RzID0gW1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjcmVlbicpLmdldENvbnRleHQoJzJkJylcbiAgICBdO1xuXG4gICAgY29udGV4dC5XSURUSCA9IGNvbnRleHQuZGVzdHNbMF0uY2FudmFzLndpZHRoO1xuICAgIGNvbnRleHQuSEVJR0hUID0gY29udGV4dC5kZXN0c1swXS5jYW52YXMuaGVpZ2h0O1xuXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiBsb29wKCkge1xuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKTtcbiAgICAgIG51Y2xlYXIuc3lzdGVtLnJ1bigpO1xuICAgIH0pO1xuICB9KVxuICAucHJvZ3Jlc3MoY29uc29sZS5sb2cuYmluZChjb25zb2xlLCAnYnVuZGxlIHByb2dyZXNzJykpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBBc3NldHNCdW5kbGUoY2FsbGJhY2spIHtcbiAgdmFyIGJ1bmRsZTtcblxuICBidW5kbGUgPSB0aGlzO1xuXG4gIGJ1bmRsZS5hc3NldHMgPSBbXTtcblxuICBidW5kbGUuX2xvYWRMaXN0ZW5lcnMgPSBbXTtcbiAgYnVuZGxlLl9lcnJvckxpc3RlbmVycyA9IFtdO1xuICBidW5kbGUuX3Byb2dyZXNzTGlzdGVuZXJzID0gW107XG5cbiAgY2FsbGJhY2suY2FsbCh0aGlzLFxuICAgIHRyaWdnZXIoYnVuZGxlLl9sb2FkTGlzdGVuZXJzKSxcbiAgICB0cmlnZ2VyKGJ1bmRsZS5fZXJyb3JMaXN0ZW5lcnMpLFxuICAgIHRyaWdnZXIoYnVuZGxlLl9wcm9ncmVzc0xpc3RlbmVycylcbiAgKTtcblxuICBmdW5jdGlvbiB0cmlnZ2VyKGNhbGxiYWNrcykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgaSwgY2FsbGJhY2s7XG5cbiAgICAgIGZvciAoaSA9IDA7IChjYWxsYmFjayA9IGNhbGxiYWNrc1tpXSk7IGkgKz0gMSkge1xuICAgICAgICBjYWxsYmFjay5hcHBseShidW5kbGUsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufVxuXG5Bc3NldHNCdW5kbGUucHJvdG90eXBlLmRvbmUgPSBmdW5jdGlvbiBhc3NldHNCdW5kbGVEb25lKGNhbGxiYWNrKSB7XG4gIHRoaXMuX2xvYWRMaXN0ZW5lcnMucHVzaChjYWxsYmFjayk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuQXNzZXRzQnVuZGxlLnByb3RvdHlwZS5lcnJvciA9IGZ1bmN0aW9uIGFzc2V0c0J1bmRsZUVycm9yKGVycmJhY2spIHtcbiAgdGhpcy5fZXJyb3JMaXN0ZW5lcnMucHVzaChlcnJiYWNrKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Bc3NldHNCdW5kbGUucHJvdG90eXBlLnByb2dyZXNzID0gZnVuY3Rpb24gYXNzZXRzQnVuZGxlUHJvZ3Jlc3MocHJvZ3Jlc3MpIHtcbiAgdGhpcy5fcHJvZ3Jlc3NMaXN0ZW5lcnMucHVzaChwcm9ncmVzcyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBc3NldHNCdW5kbGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBBc3NldHNCdW5kbGUsIHBhdGg7XG5cbkFzc2V0c0J1bmRsZSA9IHJlcXVpcmUoJy4vYXNzZXRzLWJ1bmRsZScpO1xucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuZnVuY3Rpb24gQXNzZXRzTG9hZGVyKHBhdGgpIHtcbiAgdGhpcy5iYXNlUGF0aCA9IHBhdGggfHwgJy8nO1xuICB0aGlzLmNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgdGhpcy5ydWxlcyA9IFtdO1xufVxuXG5Bc3NldHNMb2FkZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIGFzc2V0c0xvYWRlckdldCh1cmwpIHtcbiAgcmV0dXJuIHRoaXMuY2FjaGVbdXJsXTtcbn07XG5cbkFzc2V0c0xvYWRlci5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gYXNzZXRzTG9hZGVySGFzKHVybCkge1xuICByZXR1cm4gdXJsIGluIHRoaXMuY2FjaGU7XG59O1xuXG5Bc3NldHNMb2FkZXIucHJvdG90eXBlLndoZW4gPSBmdW5jdGlvbiBhc3NldHNMb2FkZXJXaGVuKHBhdHRlcm4sIGxvYWRlcikge1xuICB0aGlzLnJ1bGVzLnB1c2goe3BhdHRlcm46IHBhdHRlcm4sIGxvYWRlcjogbG9hZGVyfSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuQXNzZXRzTG9hZGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24gYXNzZXRzTG9hZGVyTG9hZCh1cmxzKSB7XG4gIHZhciBsb2FkZXI7XG5cbiAgbG9hZGVyID0gdGhpcztcblxuICByZXR1cm4gbmV3IEFzc2V0c0J1bmRsZShmdW5jdGlvbiAoZG9uZSwgZXJyb3IsIHByb2dyZXNzKSB7XG4gICAgdmFyIGJ1bmRsZSwgbG9hZGVkQXNzZXRzQ291bnQsIHRvdGFsQXNzZXRzQ291bnQsIGksIHVybCwgYXNzZXQsIGosIHJ1bGU7XG5cbiAgICBidW5kbGUgPSB0aGlzO1xuXG4gICAgbG9hZGVkQXNzZXRzQ291bnQgPSAwO1xuICAgIHRvdGFsQXNzZXRzQ291bnQgPSB1cmxzLmxlbmd0aDtcblxuICAgIGlmICghdG90YWxBc3NldHNDb3VudCkgZG9uZSgpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IHRvdGFsQXNzZXRzQ291bnQ7IGkgKz0gMSkge1xuICAgICAgdXJsID0gdXJsc1tpXTtcbiAgICAgIGFzc2V0ID0gbG9hZGVyLmdldCh1cmwpO1xuXG4gICAgICBpZiAoYXNzZXQpIHtcbiAgICAgICAgb25sb2FkZWQodXJsLCBpKS5jYWxsKGFzc2V0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoaiA9IDA7IChydWxlID0gbG9hZGVyLnJ1bGVzW2pdKTsgaiArPSAxKSB7XG4gICAgICAgICAgaWYgKHJ1bGUucGF0dGVybi50ZXN0KHVybCkpIHtcbiAgICAgICAgICAgIHJ1bGUubG9hZGVyLmxvYWQocGF0aC5qb2luKGxvYWRlci5iYXNlUGF0aCwgdXJsKSwgb25sb2FkZWQodXJsLCBpKSwgZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9ubG9hZGVkKGtleSwgaW5kZXgpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhc3NldDtcblxuICAgICAgICBhc3NldCA9IHRoaXM7XG5cbiAgICAgICAgbG9hZGVyLmNhY2hlW2tleV0gPSBhc3NldDtcbiAgICAgICAgYnVuZGxlLmFzc2V0c1tpbmRleF0gPSBhc3NldDtcblxuICAgICAgICBsb2FkZWRBc3NldHNDb3VudCArPSAxO1xuXG4gICAgICAgIGlmIChwcm9ncmVzcykge1xuICAgICAgICAgIHByb2dyZXNzKHRoaXMsIGxvYWRlZEFzc2V0c0NvdW50IC8gdG90YWxBc3NldHNDb3VudCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobG9hZGVkQXNzZXRzQ291bnQgPT09IHRvdGFsQXNzZXRzQ291bnQpIHtcbiAgICAgICAgICBkb25lKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQXNzZXRzTG9hZGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBJbWFnZXNMb2FkZXIoKSB7fVxuXG5JbWFnZXNMb2FkZXIucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbiBpbWFnZXNMb2FkZXJMb2FkKHVybCwgY2FsbGJhY2ssIGVycmJhY2spIHtcbiAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XG5cbiAgaW1hZ2Uub25sb2FkID0gY2FsbGJhY2s7XG4gIGltYWdlLm9uZXJyb3IgPSBlcnJiYWNrO1xuXG4gIGltYWdlLnNyYyA9IHVybDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VzTG9hZGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLkFzc2V0c0xvYWRlciA9IHJlcXVpcmUoJy4vYXNzZXRzLWxvYWRlcicpO1xuZXhwb3J0cy5JbWFnZXNMb2FkZXIgPSByZXF1aXJlKCcuL2ltYWdlcy1sb2FkZXInKTtcbmV4cG9ydHMuSnNvbkxvYWRlciA9IHJlcXVpcmUoJy4vanNvbi1sb2FkZXInKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gSnNvbkxvYWRlcigpIHt9XG5cbkpzb25Mb2FkZXIucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbiBqc29uTG9hZGVyTG9hZCh1cmwsIGNhbGxiYWNrLCBlcnJiYWNrKSB7XG4gIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICB4aHIub3BlbignR0VUJywgdXJsKTtcblxuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh4aHIucmVhZHlTdGF0ZSA8IDQpIHJldHVybjtcblxuICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwoSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KSk7XG4gICAgICB9IGNhdGNoIChvTykge1xuICAgICAgICBlcnJiYWNrKG9PKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZXJyYmFjayh4aHIpO1xuICAgIH1cbiAgfTtcblxuICB4aHIuc2VuZCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBKc29uTG9hZGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbG9hZGVyLCBwYXRoO1xuXG5sb2FkZXIgPSByZXF1aXJlKCdnYW1lJykubG9hZGVyO1xucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuZnVuY3Rpb24gQW5pbWF0aW9uc0NvbXBvbmVudChvcHRpb25zKSB7XG4gIHZhciBpLCBsZW5ndGgsIGtleSwgZGF0YTtcblxuICB0aGlzLmFuaW1hdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIGxlbmd0aCA9IG9wdGlvbnMuYW5pbWF0aW9ucy5sZW5ndGg7XG5cbiAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAga2V5ID0gb3B0aW9ucy5hbmltYXRpb25zW2ldO1xuICAgIGRhdGEgPSBsb2FkZXIuZ2V0KHBhdGguam9pbignYW5pbWF0aW9ucycsIG9wdGlvbnMudGFyZ2V0LCBvcHRpb25zLnRhcmdldCArICdAJyArIGtleSArICcuanNvbicpKTtcblxuICAgIHRoaXMuYW5pbWF0aW9uc1trZXldID0gZGF0YTtcbiAgfVxuXG4gIHRoaXMuZGVmYXVsdEFuaW1hdGlvbiA9IG9wdGlvbnMuZGVmYXVsdEFuaW1hdGlvbiB8fCAnaWRsZSc7XG5cbiAgdGhpcy5jdXJyZW50QW5pbWF0aW9uID0gdGhpcy5kZWZhdWx0QW5pbWF0aW9uO1xuICB0aGlzLmN1cnJlbnRGcmFtZSA9IDA7XG5cbiAgdGhpcy5sb29wID0gQm9vbGVhbihvcHRpb25zICYmIG9wdGlvbnMubG9vcCk7XG5cbiAgdGhpcy50aW1lRWxhcHNlZFNpbmNlTGFzdEZyYW1lID0gMDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25zQ29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQW5pbWF0aW9uc0NvbXBvbmVudDtcblxuQW5pbWF0aW9uc0NvbXBvbmVudCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9hbmltYXRpb25zLWNvbXBvbmVudCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG51Y2xlYXIubW9kdWxlKCdnYW1lLmFuaW1hdGlvbnMnLCBbJ2dhbWUucmVuZGVyaW5nJ10pXG4gIC5jb21wb25lbnQoJ2FuaW1hdGlvbnMnLCBmdW5jdGlvbiAoZSwga2V5LCBhbmltYXRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBBbmltYXRpb25zQ29tcG9uZW50KGtleSwgYW5pbWF0aW9ucyk7XG4gIH0pXG4gIC5zeXN0ZW0oJ2FuaW1hdGUnLCBbXG4gICAgJ3Nwcml0ZSBmcm9tIGdhbWUucmVuZGVyaW5nJyxcbiAgICAnYXRsYXMgZnJvbSBnYW1lLnJlbmRlcmluZycsXG4gICAgJ2FuaW1hdGlvbnMgZnJvbSBnYW1lLmFuaW1hdGlvbnMnXG4gIF0sIHJlcXVpcmUoJy4vc3lzdGVtcy9hbmltYXRlLXN5c3RlbScpLCB7XG4gICAgbXNQZXJVcGRhdGU6IDE2XG4gIH0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGFuaW1hdGVTeXN0ZW0oZSwgY29tcG9uZW50cywgY29udGV4dCwgZHQpIHtcbiAgdmFyIGF0bGFzLCBzcHJpdGUsIGFuaW1hdGlvbnMsIGN1cnJlbnRBbmltYXRpb24sIGZyYW1lLCB3aWR0aCwgaGVpZ2h0O1xuXG4gIGF0bGFzID0gY29tcG9uZW50cy5hdGxhcztcbiAgc3ByaXRlID0gY29tcG9uZW50cy5zcHJpdGU7XG4gIGFuaW1hdGlvbnMgPSBjb21wb25lbnRzLmFuaW1hdGlvbnM7XG5cbiAgY3VycmVudEFuaW1hdGlvbiA9IGFuaW1hdGlvbnMuYW5pbWF0aW9uc1thbmltYXRpb25zLmN1cnJlbnRBbmltYXRpb25dO1xuXG4gIGFuaW1hdGlvbnMudGltZUVsYXBzZWRTaW5jZUxhc3RGcmFtZSArPSBkdCAqIDE2Oy8vbnVjbGVhci5zeXN0ZW0oJ2FuaW1hdGUnKS5fc2NoZWR1bGVyLmxhZztcblxuICBpZiAoYW5pbWF0aW9ucy50aW1lRWxhcHNlZFNpbmNlTGFzdEZyYW1lID4gY3VycmVudEFuaW1hdGlvbi5pbnRlcnZhbCkge1xuICAgIGFuaW1hdGlvbnMuY3VycmVudEZyYW1lICs9IDE7XG4gICAgYW5pbWF0aW9ucy50aW1lRWxhcHNlZFNpbmNlTGFzdEZyYW1lIC09IGN1cnJlbnRBbmltYXRpb24uaW50ZXJ2YWw7XG5cbiAgICBpZiAoYW5pbWF0aW9ucy5jdXJyZW50RnJhbWUgPiBjdXJyZW50QW5pbWF0aW9uLmZyYW1lcy5sZW5ndGggLSAxKSB7XG4gICAgICBhbmltYXRpb25zLmN1cnJlbnRGcmFtZSA9IDA7XG5cbiAgICAgIGlmICghYW5pbWF0aW9ucy5sb29wKSB7XG4gICAgICAgIGFuaW1hdGlvbnMuY3VycmVudEFuaW1hdGlvbiA9IGFuaW1hdGlvbnMuZGVmYXVsdEFuaW1hdGlvbjtcbiAgICAgICAgY3VycmVudEFuaW1hdGlvbiA9IGFuaW1hdGlvbnMuYW5pbWF0aW9uc1thbmltYXRpb25zLmN1cnJlbnRBbmltYXRpb25dO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZyYW1lID0gYXRsYXMuc3ByaXRlcy5mcmFtZXNbY3VycmVudEFuaW1hdGlvbi5mcmFtZXNbYW5pbWF0aW9ucy5jdXJyZW50RnJhbWVdXS5mcmFtZTtcblxuICAgIHdpZHRoID0gc3ByaXRlLndpZHRoKCk7XG4gICAgaGVpZ2h0ID0gc3ByaXRlLmhlaWdodCgpO1xuXG4gICAgc3ByaXRlLmNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgIHNwcml0ZS5jb250ZXh0LmRyYXdJbWFnZShhdGxhcy5zb3VyY2UsIGZyYW1lLngsIGZyYW1lLnksIGZyYW1lLncsIGZyYW1lLmgsIDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuKGZ1bmN0aW9uKG51Y2xlYXIsIGNvbnNvbGUpe1xuICAgIHJlcXVpcmUoJy4vbGliL21vdXNldHJhcC5taW4nKTtcblxuICAgIHZhciBpbnB1dHMsIEdhbWVwYWQsIE1vdXNldHJhcDtcblxuICAgIEdhbWVwYWQgPSByZXF1aXJlKCcuL2xpYi9nYW1lcGFkLm1pbicpLkdhbWVwYWQ7XG4gICAgTW91c2V0cmFwID0gd2luZG93Lk1vdXNldHJhcDtcblxuICAgIGlucHV0cyA9IG51Y2xlYXIubW9kdWxlKCdpbnB1dHMnLCBbXSk7XG5cbiAgICBpbnB1dHMuY29tcG9uZW50KCdpbnB1dHMnLCBmdW5jdGlvbihlbnRpdHksIGRhdGEpe1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBpbnB1dHNNYW5hZ2VyKGVudGl0eSwgY29tcG9uZW50cyl7XG4gICAgICB2YXIgaW5wdXRzID0gY29tcG9uZW50cy5pbnB1dHMsXG4gICAgICAgICAgaW5wdXQ7XG5cbiAgICAgIGZvcih2YXIgaSBpbiBpbnB1dHNNYW5hZ2VyLm1hbmFnZXIpe1xuICAgICAgICBpbnB1dCA9IGlucHV0c01hbmFnZXIubWFuYWdlcltpXTtcbiAgICAgICAgaWYoaW5wdXRzW2ldKXtcblxuICAgICAgICAgIGlucHV0c1tpXShlbnRpdHksIGlucHV0LCBpbnB1dHNNYW5hZ2VyLm1hbmFnZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlucHV0c01hbmFnZXIubWFuYWdlciA9IHt9O1xuXG4gICAgaW5wdXRzLnN5c3RlbSgnaW5wdXRzTWFuYWdlcicsIFsnaW5wdXRzJ10sIGlucHV0c01hbmFnZXIsIHtcbiAgICAgIG1zUGVyVXBkYXRlIDogNTBcbiAgICB9KTtcblxuICAgIGlucHV0cy5jb25maWcoe1xuICAgICAgZ2FtZXBhZCA6IHtcbiAgICAgICAgJ0ZBQ0VfMScgOiAnJyxcbiAgICAgICAgJ0ZBQ0VfMicgOiAnJyxcbiAgICAgICAgJ0ZBQ0VfMycgOiAnJyxcbiAgICAgICAgJ0ZBQ0VfNCcgOiAnJyxcblxuICAgICAgICAnTEVGVF9UT1BfU0hPVUxERVInIDogJycsXG4gICAgICAgICdSSUdIVF9UT1BfU0hPVUxERVInIDogJycsXG4gICAgICAgICdMRUZUX0JPVFRPTV9TSE9VTERFUicgOiAnJyxcbiAgICAgICAgJ1JJR0hUX0JPVFRPTV9TSE9VTERFUicgOiAnJyxcblxuICAgICAgICAnU0VMRUNUX0JBQ0snIDogJycsXG4gICAgICAgICdTVEFSVF9GT1JXQVJEJyA6ICcnLFxuICAgICAgICAnTEVGVF9TVElDS19YJyA6ICdMRUZUX0FYSVNfWCcsXG4gICAgICAgICdSSUdIVF9TVElDS19YJyA6ICdSSUdIVF9BWElTX1gnLFxuICAgICAgICAnTEVGVF9TVElDS19ZJyA6ICdMRUZUX0FYSVNfWScsXG4gICAgICAgICdSSUdIVF9TVElDS19ZJyA6ICdSSUdIVF9BWElTX1knLFxuXG4gICAgICAgICdEUEFEX1VQJyA6ICdVUCcsXG4gICAgICAgICdEUEFEX0RPV04nIDogJ0RPV04nLFxuICAgICAgICAnRFBBRF9MRUZUJyA6ICdMRUZUJyxcbiAgICAgICAgJ0RQQURfUklHSFQnIDogJ1JJR0hUJyxcblxuICAgICAgICAnSE9NRScgOiAnJ1xuICAgICAgfSxcbiAgICAgIGtleWJvYXJkIDoge1xuICAgICAgICAnYScgOiAnQScsXG4gICAgICAgICd1cCcgOiAnVVAnLFxuICAgICAgICAnZG93bicgOiAnRE9XTicsXG4gICAgICAgICdsZWZ0JyA6ICdMRUZUJyxcbiAgICAgICAgJ3JpZ2h0JyA6ICdSSUdIVCcsXG4gICAgICAgICd6JyA6ICdVUCcsXG4gICAgICAgICdxJyA6ICdMRUZUJyxcbiAgICAgICAgJ3MnIDogJ0RPV04nLFxuICAgICAgICAnZCcgOiAnUklHSFQnLFxuICAgICAgfVxuICAgIH0pO1xuICAgIHZhciBnYW1lcGFkID0gbmV3IEdhbWVwYWQoKTtcbiAgICBnYW1lcGFkLmluaXQoKTtcbiAgICBnYW1lcGFkLmJpbmQoR2FtZXBhZC5FdmVudC5DT05ORUNURUQsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc29sZS5sb2coJ1tNT0RVTEVASU5QVVRTXSBHQU1FUEFEIENPTk5FQ1RFRCcpO1xuICAgIH0pO1xuICAgIGdhbWVwYWQuYmluZChHYW1lcGFkLkV2ZW50LlVOQ09OTkVDVEVELCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdbTU9EVUxFQElOUFVUU10gR0FNRVBBRCBVTkNPTk5FQ1RFRCcpO1xuICAgIH0pO1xuICAgIGdhbWVwYWQuYmluZChHYW1lcGFkLkV2ZW50LkJVVFRPTl9ET1dOLCBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgYWxpYXMgPSBpbnB1dHMuY29uZmlnKCdnYW1lcGFkJylbZS5jb250cm9sXTtcbiAgICAgIGlucHV0c01hbmFnZXIubWFuYWdlclthbGlhc10gPSAxO1xuICAgIH0pO1xuICAgIGdhbWVwYWQuYmluZChHYW1lcGFkLkV2ZW50LkJVVFRPTl9VUCwgZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIGFsaWFzID0gaW5wdXRzLmNvbmZpZygnZ2FtZXBhZCcpW2UuY29udHJvbF07XG4gICAgICBpbnB1dHNNYW5hZ2VyLm1hbmFnZXJbYWxpYXNdID0gMDtcbiAgICB9KTtcbiAgICBnYW1lcGFkLmJpbmQoR2FtZXBhZC5FdmVudC5BWElTX0NIQU5HRUQsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBhbGlhcyA9IGlucHV0cy5jb25maWcoJ2dhbWVwYWQnKVtlLmF4aXNdO1xuICAgICAgaW5wdXRzTWFuYWdlci5tYW5hZ2VyW2FsaWFzXSA9IGUudmFsdWU7XG4gICAgfSk7XG5cbiAgICB2YXIga2V5LCBjb25maWc7XG4gICAgY29uZmlnID0gaW5wdXRzLmNvbmZpZygna2V5Ym9hcmQnKTtcblxuICAgIGZ1bmN0aW9uIG9uS2V5RG93bihlLCBrZXkpe1xuICAgICAgdmFyIGFsaWFzID0gaW5wdXRzLmNvbmZpZygna2V5Ym9hcmQnKVtrZXldO1xuICAgICAgaW5wdXRzTWFuYWdlci5tYW5hZ2VyW2FsaWFzXSA9IDE7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25LZXlVcChlLCBrZXkpe1xuICAgICAgdmFyIGFsaWFzID0gaW5wdXRzLmNvbmZpZygna2V5Ym9hcmQnKVtrZXldO1xuICAgICAgaW5wdXRzTWFuYWdlci5tYW5hZ2VyW2FsaWFzXSA9IDA7XG4gICAgfVxuXG4gICAgZm9yKHZhciBpIGluIGNvbmZpZyl7XG4gICAgICBrZXkgPSBpO1xuICAgICAgTW91c2V0cmFwLmJpbmQoa2V5LCBvbktleURvd24sICdrZXlkb3duJyk7XG4gICAgICBNb3VzZXRyYXAuYmluZChrZXksIG9uS2V5VXAsICdrZXl1cCcpO1xuICAgICAgLypqc2hpbnQgaWdub3JlOmVuZCAqL1xuICAgIH1cbiAgICBudWNsZWFyLmltcG9ydChbaW5wdXRzXSk7XG59KSh3aW5kb3cubnVjbGVhciwgd2luZG93LmNvbnNvbGUpOyIsIiFmdW5jdGlvbihhKXtcInVzZSBzdHJpY3RcIjt2YXIgYj1mdW5jdGlvbigpe30sYz17Z2V0VHlwZTpmdW5jdGlvbigpe3JldHVyblwibnVsbFwifSxpc1N1cHBvcnRlZDpmdW5jdGlvbigpe3JldHVybiExfSx1cGRhdGU6Yn0sZD1mdW5jdGlvbihhKXt2YXIgYz10aGlzLGQ9d2luZG93O3RoaXMudXBkYXRlPWI7dGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU9YXx8ZC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fGQud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lfHxkLm1velJlcXVlc3RBbmltYXRpb25GcmFtZTt0aGlzLnRpY2tGdW5jdGlvbj1mdW5jdGlvbigpe2MudXBkYXRlKCk7Yy5zdGFydFRpY2tlcigpfTt0aGlzLnN0YXJ0VGlja2VyPWZ1bmN0aW9uKCl7Yy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUuYXBwbHkoZCxbYy50aWNrRnVuY3Rpb25dKX19O2QucHJvdG90eXBlLnN0YXJ0PWZ1bmN0aW9uKGEpe3RoaXMudXBkYXRlPWF8fGI7dGhpcy5zdGFydFRpY2tlcigpfTt2YXIgZT1mdW5jdGlvbigpe307ZS5wcm90b3R5cGUudXBkYXRlPWI7ZS5wcm90b3R5cGUuc3RhcnQ9ZnVuY3Rpb24oYSl7dGhpcy51cGRhdGU9YXx8Yn07dmFyIGY9ZnVuY3Rpb24oYSxiKXt0aGlzLmxpc3RlbmVyPWE7dGhpcy5nYW1lcGFkR2V0dGVyPWI7dGhpcy5rbm93bkdhbWVwYWRzPVtdfTtmLmZhY3Rvcnk9ZnVuY3Rpb24oYSl7dmFyIGI9YyxkPXdpbmRvdyYmd2luZG93Lm5hdmlnYXRvcjtkJiYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGQud2Via2l0R2FtZXBhZHM/Yj1uZXcgZihhLGZ1bmN0aW9uKCl7cmV0dXJuIGQud2Via2l0R2FtZXBhZHN9KTpcInVuZGVmaW5lZFwiIT10eXBlb2YgZC53ZWJraXRHZXRHYW1lcGFkcyYmKGI9bmV3IGYoYSxmdW5jdGlvbigpe3JldHVybiBkLndlYmtpdEdldEdhbWVwYWRzKCl9KSkpO3JldHVybiBifTtmLmdldFR5cGU9ZnVuY3Rpb24oKXtyZXR1cm5cIldlYktpdFwifSxmLnByb3RvdHlwZS5nZXRUeXBlPWZ1bmN0aW9uKCl7cmV0dXJuIGYuZ2V0VHlwZSgpfSxmLnByb3RvdHlwZS5pc1N1cHBvcnRlZD1mdW5jdGlvbigpe3JldHVybiEwfTtmLnByb3RvdHlwZS51cGRhdGU9ZnVuY3Rpb24oKXt2YXIgYSxiLGM9dGhpcyxkPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuZ2FtZXBhZEdldHRlcigpLDApO2ZvcihiPXRoaXMua25vd25HYW1lcGFkcy5sZW5ndGgtMTtiPj0wO2ItLSl7YT10aGlzLmtub3duR2FtZXBhZHNbYl07aWYoZC5pbmRleE9mKGEpPDApe3RoaXMua25vd25HYW1lcGFkcy5zcGxpY2UoYiwxKTt0aGlzLmxpc3RlbmVyLl9kaXNjb25uZWN0KGEpfX1mb3IoYj0wO2I8ZC5sZW5ndGg7YisrKXthPWRbYl07aWYoYSYmYy5rbm93bkdhbWVwYWRzLmluZGV4T2YoYSk8MCl7Yy5rbm93bkdhbWVwYWRzLnB1c2goYSk7Yy5saXN0ZW5lci5fY29ubmVjdChhKX19fTt2YXIgZz1mdW5jdGlvbihhKXt0aGlzLmxpc3RlbmVyPWE7d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJnYW1lcGFkY29ubmVjdGVkXCIsZnVuY3Rpb24oYil7YS5fY29ubmVjdChiLmdhbWVwYWQpfSk7d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJnYW1lcGFkZGlzY29ubmVjdGVkXCIsZnVuY3Rpb24oYil7YS5fZGlzY29ubmVjdChiLmdhbWVwYWQpfSl9O2cuZmFjdG9yeT1mdW5jdGlvbihhKXt2YXIgYj1jO3dpbmRvdyYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyJiYoYj1uZXcgZyhhKSk7cmV0dXJuIGJ9O2cuZ2V0VHlwZT1mdW5jdGlvbigpe3JldHVyblwiRmlyZWZveFwifSxnLnByb3RvdHlwZS5nZXRUeXBlPWZ1bmN0aW9uKCl7cmV0dXJuIGcuZ2V0VHlwZSgpfSxnLnByb3RvdHlwZS5pc1N1cHBvcnRlZD1mdW5jdGlvbigpe3JldHVybiEwfTtnLnByb3RvdHlwZS51cGRhdGU9Yjt2YXIgaD1mdW5jdGlvbihhKXt0aGlzLnVwZGF0ZVN0cmF0ZWd5PWF8fG5ldyBkO3RoaXMuZ2FtZXBhZHM9W107dGhpcy5saXN0ZW5lcnM9e307dGhpcy5wbGF0Zm9ybT1jO3RoaXMuZGVhZHpvbmU9LjAzO3RoaXMubWF4aW1pemVUaHJlc2hvbGQ9Ljk3fTtoLlVwZGF0ZVN0cmF0ZWdpZXM9e0FuaW1GcmFtZVVwZGF0ZVN0cmF0ZWd5OmQsTWFudWFsVXBkYXRlU3RyYXRlZ3k6ZX07aC5QbGF0Zm9ybUZhY3Rvcmllcz1bZi5mYWN0b3J5LGcuZmFjdG9yeV07aC5UeXBlPXtQTEFZU1RBVElPTjpcInBsYXlzdGF0aW9uXCIsTE9HSVRFQ0g6XCJsb2dpdGVjaFwiLFhCT1g6XCJ4Ym94XCIsVU5LTk9XTjpcInVua25vd25cIn07aC5FdmVudD17Q09OTkVDVEVEOlwiY29ubmVjdGVkXCIsVU5TVVBQT1JURUQ6XCJ1bnN1cHBvcnRlZFwiLERJU0NPTk5FQ1RFRDpcImRpc2Nvbm5lY3RlZFwiLFRJQ0s6XCJ0aWNrXCIsQlVUVE9OX0RPV046XCJidXR0b24tZG93blwiLEJVVFRPTl9VUDpcImJ1dHRvbi11cFwiLEFYSVNfQ0hBTkdFRDpcImF4aXMtY2hhbmdlZFwifTtoLlN0YW5kYXJkQnV0dG9ucz1bXCJGQUNFXzFcIixcIkZBQ0VfMlwiLFwiRkFDRV8zXCIsXCJGQUNFXzRcIixcIkxFRlRfVE9QX1NIT1VMREVSXCIsXCJSSUdIVF9UT1BfU0hPVUxERVJcIixcIkxFRlRfQk9UVE9NX1NIT1VMREVSXCIsXCJSSUdIVF9CT1RUT01fU0hPVUxERVJcIixcIlNFTEVDVF9CQUNLXCIsXCJTVEFSVF9GT1JXQVJEXCIsXCJMRUZUX1NUSUNLXCIsXCJSSUdIVF9TVElDS1wiLFwiRFBBRF9VUFwiLFwiRFBBRF9ET1dOXCIsXCJEUEFEX0xFRlRcIixcIkRQQURfUklHSFRcIixcIkhPTUVcIl07aC5TdGFuZGFyZEF4ZXM9W1wiTEVGVF9TVElDS19YXCIsXCJMRUZUX1NUSUNLX1lcIixcIlJJR0hUX1NUSUNLX1hcIixcIlJJR0hUX1NUSUNLX1lcIl07dmFyIGk9ZnVuY3Rpb24oYSxiLGMpe3JldHVybiBiPGEubGVuZ3RoP2FbYl06YysoYi1hLmxlbmd0aCsxKX07aC5TdGFuZGFyZE1hcHBpbmc9e2Vudjp7fSxidXR0b25zOntieUJ1dHRvbjpbMCwxLDIsMyw0LDUsNiw3LDgsOSwxMCwxMSwxMiwxMywxNCwxNSwxNl19LGF4ZXM6e2J5QXhpczpbMCwxLDIsM119fTtoLk1hcHBpbmdzPVt7ZW52OntwbGF0Zm9ybTpnLmdldFR5cGUoKSx0eXBlOmguVHlwZS5QTEFZU1RBVElPTn0sYnV0dG9uczp7YnlCdXR0b246WzE0LDEzLDE1LDEyLDEwLDExLDgsOSwwLDMsMSwyLDQsNiw3LDUsMTZdfSxheGVzOntieUF4aXM6WzAsMSwyLDNdfX0se2Vudjp7cGxhdGZvcm06Zi5nZXRUeXBlKCksdHlwZTpoLlR5cGUuTE9HSVRFQ0h9LGJ1dHRvbnM6e2J5QnV0dG9uOlsxLDIsMCwzLDQsNSw2LDcsOCw5LDEwLDExLDExLDEyLDEzLDE0LDEwXX0sYXhlczp7YnlBeGlzOlswLDEsMiwzXX19LHtlbnY6e3BsYXRmb3JtOmcuZ2V0VHlwZSgpLHR5cGU6aC5UeXBlLkxPR0lURUNIfSxidXR0b25zOntieUJ1dHRvbjpbMCwxLDIsMyw0LDUsLTEsLTEsNiw3LDgsOSwxMSwxMiwxMywxNCwxMF0sYnlBeGlzOlstMSwtMSwtMSwtMSwtMSwtMSxbMiwwLDFdLFsyLDAsLTFdXX0sYXhlczp7YnlBeGlzOlswLDEsMyw0XX19XTtoLnByb3RvdHlwZS5pbml0PWZ1bmN0aW9uKCl7dmFyIGE9aC5yZXNvbHZlUGxhdGZvcm0odGhpcyksYj10aGlzO3RoaXMucGxhdGZvcm09YTt0aGlzLnVwZGF0ZVN0cmF0ZWd5LnN0YXJ0KGZ1bmN0aW9uKCl7Yi5fdXBkYXRlKCl9KTtyZXR1cm4gYS5pc1N1cHBvcnRlZCgpfTtoLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYil7XCJ1bmRlZmluZWRcIj09dHlwZW9mIHRoaXMubGlzdGVuZXJzW2FdJiYodGhpcy5saXN0ZW5lcnNbYV09W10pO3RoaXMubGlzdGVuZXJzW2FdLnB1c2goYik7cmV0dXJuIHRoaXN9O2gucHJvdG90eXBlLnVuYmluZD1mdW5jdGlvbihhLGIpe2lmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBhKXtpZihcInVuZGVmaW5lZFwiIT10eXBlb2YgYil7aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIHRoaXMubGlzdGVuZXJzW2FdKXJldHVybiExO2Zvcih2YXIgYz0wO2M8dGhpcy5saXN0ZW5lcnNbYV0ubGVuZ3RoO2MrKylpZih0aGlzLmxpc3RlbmVyc1thXVtjXT09PWIpe3RoaXMubGlzdGVuZXJzW2FdLnNwbGljZShjLDEpO3JldHVybiEwfXJldHVybiExfXRoaXMubGlzdGVuZXJzW2FdPVtdfWVsc2UgdGhpcy5saXN0ZW5lcnM9e319O2gucHJvdG90eXBlLmNvdW50PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZ2FtZXBhZHMubGVuZ3RofTtoLnByb3RvdHlwZS5fZmlyZT1mdW5jdGlvbihhLGIpe2lmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiB0aGlzLmxpc3RlbmVyc1thXSlmb3IodmFyIGM9MDtjPHRoaXMubGlzdGVuZXJzW2FdLmxlbmd0aDtjKyspdGhpcy5saXN0ZW5lcnNbYV1bY10uYXBwbHkodGhpcy5saXN0ZW5lcnNbYV1bY10sW2JdKX07aC5nZXROdWxsUGxhdGZvcm09ZnVuY3Rpb24oKXtyZXR1cm4gT2JqZWN0LmNyZWF0ZShjKX07aC5yZXNvbHZlUGxhdGZvcm09ZnVuY3Rpb24oYSl7dmFyIGIsZD1jO2ZvcihiPTA7IWQuaXNTdXBwb3J0ZWQoKSYmYjxoLlBsYXRmb3JtRmFjdG9yaWVzLmxlbmd0aDtiKyspZD1oLlBsYXRmb3JtRmFjdG9yaWVzW2JdKGEpO3JldHVybiBkfTtoLnByb3RvdHlwZS5fY29ubmVjdD1mdW5jdGlvbihhKXt2YXIgYixjLGQ9dGhpcy5fcmVzb2x2ZU1hcHBpbmcoYSk7YS5zdGF0ZT17fTthLmxhc3RTdGF0ZT17fTthLnVwZGF0ZXI9W107Yj1kLmJ1dHRvbnMuYnlCdXR0b24ubGVuZ3RoO2ZvcihjPTA7Yj5jO2MrKyl0aGlzLl9hZGRCdXR0b25VcGRhdGVyKGEsZCxjKTtiPWQuYXhlcy5ieUF4aXMubGVuZ3RoO2ZvcihjPTA7Yj5jO2MrKyl0aGlzLl9hZGRBeGlzVXBkYXRlcihhLGQsYyk7dGhpcy5nYW1lcGFkc1thLmluZGV4XT1hO3RoaXMuX2ZpcmUoaC5FdmVudC5DT05ORUNURUQsYSl9O2gucHJvdG90eXBlLl9hZGRCdXR0b25VcGRhdGVyPWZ1bmN0aW9uKGEsYyxkKXt2YXIgZT1iLGY9aShoLlN0YW5kYXJkQnV0dG9ucyxkLFwiRVhUUkFfQlVUVE9OX1wiKSxnPXRoaXMuX2NyZWF0ZUJ1dHRvbkdldHRlcihhLGMuYnV0dG9ucyxkKSxqPXRoaXMsaz17Z2FtZXBhZDphLGNvbnRyb2w6Zn07YS5zdGF0ZVtmXT0wO2EubGFzdFN0YXRlW2ZdPTA7ZT1mdW5jdGlvbigpe3ZhciBiPWcoKSxjPWEubGFzdFN0YXRlW2ZdLGQ9Yj4uNSxlPWM+LjU7YS5zdGF0ZVtmXT1iO2QmJiFlP2ouX2ZpcmUoaC5FdmVudC5CVVRUT05fRE9XTixPYmplY3QuY3JlYXRlKGspKTohZCYmZSYmai5fZmlyZShoLkV2ZW50LkJVVFRPTl9VUCxPYmplY3QuY3JlYXRlKGspKTswIT09YiYmMSE9PWImJmIhPT1jJiZqLl9maXJlQXhpc0NoYW5nZWRFdmVudChhLGYsYik7YS5sYXN0U3RhdGVbZl09Yn07YS51cGRhdGVyLnB1c2goZSl9O2gucHJvdG90eXBlLl9hZGRBeGlzVXBkYXRlcj1mdW5jdGlvbihhLGMsZCl7dmFyIGU9YixmPWkoaC5TdGFuZGFyZEF4ZXMsZCxcIkVYVFJBX0FYSVNfXCIpLGc9dGhpcy5fY3JlYXRlQXhpc0dldHRlcihhLGMuYXhlcyxkKSxqPXRoaXM7YS5zdGF0ZVtmXT0wO2EubGFzdFN0YXRlW2ZdPTA7ZT1mdW5jdGlvbigpe3ZhciBiPWcoKSxjPWEubGFzdFN0YXRlW2ZdO2Euc3RhdGVbZl09YjtiIT09YyYmai5fZmlyZUF4aXNDaGFuZ2VkRXZlbnQoYSxmLGIpO2EubGFzdFN0YXRlW2ZdPWJ9O2EudXBkYXRlci5wdXNoKGUpfTtoLnByb3RvdHlwZS5fZmlyZUF4aXNDaGFuZ2VkRXZlbnQ9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPXtnYW1lcGFkOmEsYXhpczpiLHZhbHVlOmN9O3RoaXMuX2ZpcmUoaC5FdmVudC5BWElTX0NIQU5HRUQsZCl9O2gucHJvdG90eXBlLl9jcmVhdGVCdXR0b25HZXR0ZXI9ZnVuY3Rpb24oKXt2YXIgYT1mdW5jdGlvbigpe3JldHVybiAwfSxiPWZ1bmN0aW9uKGIsYyxkKXt2YXIgZT1hO2Q+Yz9lPWZ1bmN0aW9uKCl7dmFyIGE9ZC1jLGU9YigpO2U9KGUtYykvYTtyZXR1cm4gMD5lPzA6ZX06Yz5kJiYoZT1mdW5jdGlvbigpe3ZhciBhPWMtZCxlPWIoKTtlPShlLWQpL2E7cmV0dXJuIGU+MT8wOjEtZX0pO3JldHVybiBlfSxjPWZ1bmN0aW9uKGEpe3JldHVyblwiW29iamVjdCBBcnJheV1cIj09PU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKX07cmV0dXJuIGZ1bmN0aW9uKGQsZSxmKXt2YXIgZyxoPWEsaT10aGlzO2c9ZS5ieUJ1dHRvbltmXTtpZigtMSE9PWcpXCJudW1iZXJcIj09dHlwZW9mIGcmJmc8ZC5idXR0b25zLmxlbmd0aCYmKGg9ZnVuY3Rpb24oKXtyZXR1cm4gZC5idXR0b25zW2ddfSk7ZWxzZSBpZihlLmJ5QXhpcyYmZjxlLmJ5QXhpcy5sZW5ndGgpe2c9ZS5ieUF4aXNbZl07aWYoYyhnKSYmMz09Zy5sZW5ndGgmJmdbMF08ZC5heGVzLmxlbmd0aCl7aD1mdW5jdGlvbigpe3ZhciBhPWQuYXhlc1tnWzBdXTtyZXR1cm4gaS5fYXBwbHlEZWFkem9uZU1heGltaXplKGEpfTtoPWIoaCxnWzFdLGdbMl0pfX1yZXR1cm4gaH19KCk7aC5wcm90b3R5cGUuX2NyZWF0ZUF4aXNHZXR0ZXI9ZnVuY3Rpb24oKXt2YXIgYT1mdW5jdGlvbigpe3JldHVybiAwfTtyZXR1cm4gZnVuY3Rpb24oYixjLGQpe3ZhciBlLGY9YSxnPXRoaXM7ZT1jLmJ5QXhpc1tkXTstMSE9PWUmJlwibnVtYmVyXCI9PXR5cGVvZiBlJiZlPGIuYXhlcy5sZW5ndGgmJihmPWZ1bmN0aW9uKCl7dmFyIGE9Yi5heGVzW2VdO3JldHVybiBnLl9hcHBseURlYWR6b25lTWF4aW1pemUoYSl9KTtyZXR1cm4gZn19KCk7aC5wcm90b3R5cGUuX2Rpc2Nvbm5lY3Q9ZnVuY3Rpb24oYSl7dmFyIGIsYz1bXTtcInVuZGVmaW5lZFwiIT10eXBlb2YgdGhpcy5nYW1lcGFkc1thLmluZGV4XSYmZGVsZXRlIHRoaXMuZ2FtZXBhZHNbYS5pbmRleF07Zm9yKGI9MDtiPHRoaXMuZ2FtZXBhZHMubGVuZ3RoO2IrKylcInVuZGVmaW5lZFwiIT10eXBlb2YgdGhpcy5nYW1lcGFkc1tiXSYmKGNbYl09dGhpcy5nYW1lcGFkc1tiXSk7dGhpcy5nYW1lcGFkcz1jO3RoaXMuX2ZpcmUoaC5FdmVudC5ESVNDT05ORUNURUQsYSl9O2gucHJvdG90eXBlLl9yZXNvbHZlQ29udHJvbGxlclR5cGU9ZnVuY3Rpb24oYSl7YT1hLnRvTG93ZXJDYXNlKCk7cmV0dXJuLTEhPT1hLmluZGV4T2YoXCJwbGF5c3RhdGlvblwiKT9oLlR5cGUuUExBWVNUQVRJT046LTEhPT1hLmluZGV4T2YoXCJsb2dpdGVjaFwiKXx8LTEhPT1hLmluZGV4T2YoXCJ3aXJlbGVzcyBnYW1lcGFkXCIpP2guVHlwZS5MT0dJVEVDSDotMSE9PWEuaW5kZXhPZihcInhib3hcIil8fC0xIT09YS5pbmRleE9mKFwiMzYwXCIpP2guVHlwZS5YQk9YOmguVHlwZS5VTktOT1dOfTtoLnByb3RvdHlwZS5fcmVzb2x2ZU1hcHBpbmc9ZnVuY3Rpb24oYSl7dmFyIGIsYyxkPWguTWFwcGluZ3MsZT1udWxsLGY9e3BsYXRmb3JtOnRoaXMucGxhdGZvcm0uZ2V0VHlwZSgpLHR5cGU6dGhpcy5fcmVzb2x2ZUNvbnRyb2xsZXJUeXBlKGEuaWQpfTtmb3IoYj0wOyFlJiZiPGQubGVuZ3RoO2IrKyl7Yz1kW2JdO2guZW52TWF0Y2hlc0ZpbHRlcihjLmVudixmKSYmKGU9Yyl9cmV0dXJuIGV8fGguU3RhbmRhcmRNYXBwaW5nfTtoLmVudk1hdGNoZXNGaWx0ZXI9ZnVuY3Rpb24oYSxiKXt2YXIgYyxkPSEwO2ZvcihjIGluIGEpYVtjXSE9PWJbY10mJihkPSExKTtyZXR1cm4gZH07aC5wcm90b3R5cGUuX3VwZGF0ZT1mdW5jdGlvbigpe3RoaXMucGxhdGZvcm0udXBkYXRlKCk7dGhpcy5nYW1lcGFkcy5mb3JFYWNoKGZ1bmN0aW9uKGEpe2EmJmEudXBkYXRlci5mb3JFYWNoKGZ1bmN0aW9uKGEpe2EoKX0pfSk7dGhpcy5nYW1lcGFkcy5sZW5ndGg+MCYmdGhpcy5fZmlyZShoLkV2ZW50LlRJQ0ssdGhpcy5nYW1lcGFkcyl9LGgucHJvdG90eXBlLl9hcHBseURlYWR6b25lTWF4aW1pemU9ZnVuY3Rpb24oYSxiLGMpe2I9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGI/Yjp0aGlzLmRlYWR6b25lO2M9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGM/Yzp0aGlzLm1heGltaXplVGhyZXNob2xkO2E+PTA/Yj5hP2E9MDphPmMmJihhPTEpOmE+LWI/YT0wOi1jPmEmJihhPS0xKTtyZXR1cm4gYX07YS5HYW1lcGFkPWh9KFwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzfHx3aW5kb3cpOyIsIi8qIG1vdXNldHJhcCB2MS40LjYgY3JhaWcuaXMva2lsbGluZy9taWNlICovXG4oZnVuY3Rpb24oSixyLGYpe2Z1bmN0aW9uIHMoYSxiLGQpe2EuYWRkRXZlbnRMaXN0ZW5lcj9hLmFkZEV2ZW50TGlzdGVuZXIoYixkLCExKTphLmF0dGFjaEV2ZW50KFwib25cIitiLGQpfWZ1bmN0aW9uIEEoYSl7aWYoXCJrZXlwcmVzc1wiPT1hLnR5cGUpe3ZhciBiPVN0cmluZy5mcm9tQ2hhckNvZGUoYS53aGljaCk7YS5zaGlmdEtleXx8KGI9Yi50b0xvd2VyQ2FzZSgpKTtyZXR1cm4gYn1yZXR1cm4gaFthLndoaWNoXT9oW2Eud2hpY2hdOkJbYS53aGljaF0/QlthLndoaWNoXTpTdHJpbmcuZnJvbUNoYXJDb2RlKGEud2hpY2gpLnRvTG93ZXJDYXNlKCl9ZnVuY3Rpb24gdChhKXthPWF8fHt9O3ZhciBiPSExLGQ7Zm9yKGQgaW4gbilhW2RdP2I9ITA6bltkXT0wO2J8fCh1PSExKX1mdW5jdGlvbiBDKGEsYixkLGMsZSx2KXt2YXIgZyxrLGY9W10saD1kLnR5cGU7aWYoIWxbYV0pcmV0dXJuW107XCJrZXl1cFwiPT1oJiZ3KGEpJiYoYj1bYV0pO2ZvcihnPTA7ZzxsW2FdLmxlbmd0aDsrK2cpaWYoaz1cbmxbYV1bZ10sISghYyYmay5zZXEmJm5bay5zZXFdIT1rLmxldmVsfHxoIT1rLmFjdGlvbnx8KFwia2V5cHJlc3NcIiE9aHx8ZC5tZXRhS2V5fHxkLmN0cmxLZXkpJiZiLnNvcnQoKS5qb2luKFwiLFwiKSE9PWsubW9kaWZpZXJzLnNvcnQoKS5qb2luKFwiLFwiKSkpe3ZhciBtPWMmJmsuc2VxPT1jJiZrLmxldmVsPT12OyghYyYmay5jb21ibz09ZXx8bSkmJmxbYV0uc3BsaWNlKGcsMSk7Zi5wdXNoKGspfXJldHVybiBmfWZ1bmN0aW9uIEsoYSl7dmFyIGI9W107YS5zaGlmdEtleSYmYi5wdXNoKFwic2hpZnRcIik7YS5hbHRLZXkmJmIucHVzaChcImFsdFwiKTthLmN0cmxLZXkmJmIucHVzaChcImN0cmxcIik7YS5tZXRhS2V5JiZiLnB1c2goXCJtZXRhXCIpO3JldHVybiBifWZ1bmN0aW9uIHgoYSxiLGQsYyl7bS5zdG9wQ2FsbGJhY2soYixiLnRhcmdldHx8Yi5zcmNFbGVtZW50LGQsYyl8fCExIT09YShiLGQpfHwoYi5wcmV2ZW50RGVmYXVsdD9iLnByZXZlbnREZWZhdWx0KCk6Yi5yZXR1cm5WYWx1ZT0hMSxiLnN0b3BQcm9wYWdhdGlvbj9cbmIuc3RvcFByb3BhZ2F0aW9uKCk6Yi5jYW5jZWxCdWJibGU9ITApfWZ1bmN0aW9uIHkoYSl7XCJudW1iZXJcIiE9PXR5cGVvZiBhLndoaWNoJiYoYS53aGljaD1hLmtleUNvZGUpO3ZhciBiPUEoYSk7YiYmKFwia2V5dXBcIj09YS50eXBlJiZ6PT09Yj96PSExOm0uaGFuZGxlS2V5KGIsSyhhKSxhKSl9ZnVuY3Rpb24gdyhhKXtyZXR1cm5cInNoaWZ0XCI9PWF8fFwiY3RybFwiPT1hfHxcImFsdFwiPT1hfHxcIm1ldGFcIj09YX1mdW5jdGlvbiBMKGEsYixkLGMpe2Z1bmN0aW9uIGUoYil7cmV0dXJuIGZ1bmN0aW9uKCl7dT1iOysrblthXTtjbGVhclRpbWVvdXQoRCk7RD1zZXRUaW1lb3V0KHQsMUUzKX19ZnVuY3Rpb24gdihiKXt4KGQsYixhKTtcImtleXVwXCIhPT1jJiYoej1BKGIpKTtzZXRUaW1lb3V0KHQsMTApfWZvcih2YXIgZz1uW2FdPTA7ZzxiLmxlbmd0aDsrK2cpe3ZhciBmPWcrMT09PWIubGVuZ3RoP3Y6ZShjfHxFKGJbZysxXSkuYWN0aW9uKTtGKGJbZ10sZixjLGEsZyl9fWZ1bmN0aW9uIEUoYSxiKXt2YXIgZCxcbmMsZSxmPVtdO2Q9XCIrXCI9PT1hP1tcIitcIl06YS5zcGxpdChcIitcIik7Zm9yKGU9MDtlPGQubGVuZ3RoOysrZSljPWRbZV0sR1tjXSYmKGM9R1tjXSksYiYmXCJrZXlwcmVzc1wiIT1iJiZIW2NdJiYoYz1IW2NdLGYucHVzaChcInNoaWZ0XCIpKSx3KGMpJiZmLnB1c2goYyk7ZD1jO2U9YjtpZighZSl7aWYoIXApe3A9e307Zm9yKHZhciBnIGluIGgpOTU8ZyYmMTEyPmd8fGguaGFzT3duUHJvcGVydHkoZykmJihwW2hbZ11dPWcpfWU9cFtkXT9cImtleWRvd25cIjpcImtleXByZXNzXCJ9XCJrZXlwcmVzc1wiPT1lJiZmLmxlbmd0aCYmKGU9XCJrZXlkb3duXCIpO3JldHVybntrZXk6Yyxtb2RpZmllcnM6ZixhY3Rpb246ZX19ZnVuY3Rpb24gRihhLGIsZCxjLGUpe3FbYStcIjpcIitkXT1iO2E9YS5yZXBsYWNlKC9cXHMrL2csXCIgXCIpO3ZhciBmPWEuc3BsaXQoXCIgXCIpOzE8Zi5sZW5ndGg/TChhLGYsYixkKTooZD1FKGEsZCksbFtkLmtleV09bFtkLmtleV18fFtdLEMoZC5rZXksZC5tb2RpZmllcnMse3R5cGU6ZC5hY3Rpb259LFxuYyxhLGUpLGxbZC5rZXldW2M/XCJ1bnNoaWZ0XCI6XCJwdXNoXCJdKHtjYWxsYmFjazpiLG1vZGlmaWVyczpkLm1vZGlmaWVycyxhY3Rpb246ZC5hY3Rpb24sc2VxOmMsbGV2ZWw6ZSxjb21ibzphfSkpfXZhciBoPXs4OlwiYmFja3NwYWNlXCIsOTpcInRhYlwiLDEzOlwiZW50ZXJcIiwxNjpcInNoaWZ0XCIsMTc6XCJjdHJsXCIsMTg6XCJhbHRcIiwyMDpcImNhcHNsb2NrXCIsMjc6XCJlc2NcIiwzMjpcInNwYWNlXCIsMzM6XCJwYWdldXBcIiwzNDpcInBhZ2Vkb3duXCIsMzU6XCJlbmRcIiwzNjpcImhvbWVcIiwzNzpcImxlZnRcIiwzODpcInVwXCIsMzk6XCJyaWdodFwiLDQwOlwiZG93blwiLDQ1OlwiaW5zXCIsNDY6XCJkZWxcIiw5MTpcIm1ldGFcIiw5MzpcIm1ldGFcIiwyMjQ6XCJtZXRhXCJ9LEI9ezEwNjpcIipcIiwxMDc6XCIrXCIsMTA5OlwiLVwiLDExMDpcIi5cIiwxMTE6XCIvXCIsMTg2OlwiO1wiLDE4NzpcIj1cIiwxODg6XCIsXCIsMTg5OlwiLVwiLDE5MDpcIi5cIiwxOTE6XCIvXCIsMTkyOlwiYFwiLDIxOTpcIltcIiwyMjA6XCJcXFxcXCIsMjIxOlwiXVwiLDIyMjpcIidcIn0sSD17XCJ+XCI6XCJgXCIsXCIhXCI6XCIxXCIsXG5cIkBcIjpcIjJcIixcIiNcIjpcIjNcIiwkOlwiNFwiLFwiJVwiOlwiNVwiLFwiXlwiOlwiNlwiLFwiJlwiOlwiN1wiLFwiKlwiOlwiOFwiLFwiKFwiOlwiOVwiLFwiKVwiOlwiMFwiLF86XCItXCIsXCIrXCI6XCI9XCIsXCI6XCI6XCI7XCIsJ1wiJzpcIidcIixcIjxcIjpcIixcIixcIj5cIjpcIi5cIixcIj9cIjpcIi9cIixcInxcIjpcIlxcXFxcIn0sRz17b3B0aW9uOlwiYWx0XCIsY29tbWFuZDpcIm1ldGFcIixcInJldHVyblwiOlwiZW50ZXJcIixlc2NhcGU6XCJlc2NcIixtb2Q6L01hY3xpUG9kfGlQaG9uZXxpUGFkLy50ZXN0KG5hdmlnYXRvci5wbGF0Zm9ybSk/XCJtZXRhXCI6XCJjdHJsXCJ9LHAsbD17fSxxPXt9LG49e30sRCx6PSExLEk9ITEsdT0hMTtmb3IoZj0xOzIwPmY7KytmKWhbMTExK2ZdPVwiZlwiK2Y7Zm9yKGY9MDs5Pj1mOysrZiloW2YrOTZdPWY7cyhyLFwia2V5cHJlc3NcIix5KTtzKHIsXCJrZXlkb3duXCIseSk7cyhyLFwia2V5dXBcIix5KTt2YXIgbT17YmluZDpmdW5jdGlvbihhLGIsZCl7YT1hIGluc3RhbmNlb2YgQXJyYXk/YTpbYV07Zm9yKHZhciBjPTA7YzxhLmxlbmd0aDsrK2MpRihhW2NdLGIsZCk7cmV0dXJuIHRoaXN9LFxudW5iaW5kOmZ1bmN0aW9uKGEsYil7cmV0dXJuIG0uYmluZChhLGZ1bmN0aW9uKCl7fSxiKX0sdHJpZ2dlcjpmdW5jdGlvbihhLGIpe2lmKHFbYStcIjpcIitiXSlxW2ErXCI6XCIrYl0oe30sYSk7cmV0dXJuIHRoaXN9LHJlc2V0OmZ1bmN0aW9uKCl7bD17fTtxPXt9O3JldHVybiB0aGlzfSxzdG9wQ2FsbGJhY2s6ZnVuY3Rpb24oYSxiKXtyZXR1cm4tMTwoXCIgXCIrYi5jbGFzc05hbWUrXCIgXCIpLmluZGV4T2YoXCIgbW91c2V0cmFwIFwiKT8hMTpcIklOUFVUXCI9PWIudGFnTmFtZXx8XCJTRUxFQ1RcIj09Yi50YWdOYW1lfHxcIlRFWFRBUkVBXCI9PWIudGFnTmFtZXx8Yi5pc0NvbnRlbnRFZGl0YWJsZX0saGFuZGxlS2V5OmZ1bmN0aW9uKGEsYixkKXt2YXIgYz1DKGEsYixkKSxlO2I9e307dmFyIGY9MCxnPSExO2ZvcihlPTA7ZTxjLmxlbmd0aDsrK2UpY1tlXS5zZXEmJihmPU1hdGgubWF4KGYsY1tlXS5sZXZlbCkpO2ZvcihlPTA7ZTxjLmxlbmd0aDsrK2UpY1tlXS5zZXE/Y1tlXS5sZXZlbD09ZiYmKGc9ITAsXG5iW2NbZV0uc2VxXT0xLHgoY1tlXS5jYWxsYmFjayxkLGNbZV0uY29tYm8sY1tlXS5zZXEpKTpnfHx4KGNbZV0uY2FsbGJhY2ssZCxjW2VdLmNvbWJvKTtjPVwia2V5cHJlc3NcIj09ZC50eXBlJiZJO2QudHlwZSE9dXx8dyhhKXx8Y3x8dChiKTtJPWcmJlwia2V5ZG93blwiPT1kLnR5cGV9fTtKLk1vdXNldHJhcD1tO1wiZnVuY3Rpb25cIj09PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQmJmRlZmluZShtKX0pKHdpbmRvdyxkb2N1bWVudCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBwYXRoLCBsb2FkZXI7XG5cbnBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5sb2FkZXIgPSByZXF1aXJlKCdnYW1lJykubG9hZGVyO1xuXG5mdW5jdGlvbiBBdGxhc0NvbXBvbmVudChrZXkpIHtcbiAgdGhpcy5zb3VyY2UgPSBsb2FkZXIuZ2V0KHBhdGguam9pbignYXRsYXNlcycsIGtleSArICcuYXRsYXMucG5nJykpO1xuICB0aGlzLnNwcml0ZXMgPSBsb2FkZXIuZ2V0KHBhdGguam9pbignYXRsYXNlcycsIGtleSArICcuYXRsYXMuanNvbicpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBdGxhc0NvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGxvYWRlciwgcGF0aDtcblxubG9hZGVyID0gcmVxdWlyZSgnZ2FtZScpLmxvYWRlcjtcbnBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmZ1bmN0aW9uIFNwcml0ZUNvbXBvbmVudCh3aWR0aCwgaGVpZ2h0LCBkZXN0KSB7XG4gIHRoaXMuYnVmZmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIHRoaXMuY29udGV4dCA9IHRoaXMuYnVmZmVyLmdldENvbnRleHQoJzJkJyk7XG5cbiAgdGhpcy5kZXN0ID0gZGVzdCB8fCAwO1xuXG4gIHRoaXMuYnVmZmVyLndpZHRoID0gd2lkdGg7XG4gIHRoaXMuYnVmZmVyLmhlaWdodCA9IGhlaWdodDtcbn1cblxuU3ByaXRlQ29tcG9uZW50LnByb3RvdHlwZS5mcm9tQXRsYXMgPSBmdW5jdGlvbiAoYXRsYXMsIGZyYW1lKSB7XG4gIHZhciBzb3VyY2UsIHNwcml0ZSwgd2lkdGgsIGhlaWdodDtcblxuICBzb3VyY2UgPSBsb2FkZXIuZ2V0KHBhdGguam9pbignYXRsYXNlcycsIGF0bGFzICsgJy5hdGxhcy5wbmcnKSk7XG4gIHNwcml0ZSA9IGxvYWRlci5nZXQocGF0aC5qb2luKCdhdGxhc2VzJywgYXRsYXMgKyAnLmF0bGFzLmpzb24nKSlbZnJhbWVdO1xuXG4gIHdpZHRoID0gc3ByaXRlLmZyYW1lLnc7XG4gIGhlaWdodCA9IHNwcml0ZS5mcmFtZS5oO1xuXG4gIHRoaXMud2lkdGgod2lkdGgpO1xuICB0aGlzLmhlaWdodChoZWlnaHQpO1xuXG4gIHRoaXMuY29udGV4dC5kcmF3SW1hZ2Uoc291cmNlLCBzcHJpdGUuZnJhbWUueCwgc3ByaXRlLmZyYW1lLnksIHdpZHRoLCBoZWlnaHQsIDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xufTtcblxuU3ByaXRlQ29tcG9uZW50LnByb3RvdHlwZS53aWR0aCA9IGZ1bmN0aW9uIHNwcml0ZVdpZHRoKHZhbHVlKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyLndpZHRoO1xuICB9XG5cbiAgdGhpcy5idWZmZXIud2lkdGggPSB2YWx1ZTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cblNwcml0ZUNvbXBvbmVudC5wcm90b3R5cGUuaGVpZ2h0ID0gZnVuY3Rpb24gc3ByaXRlSGVpZ2h0KHZhbHVlKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyLmhlaWdodDtcbiAgfVxuXG4gIHRoaXMuYnVmZmVyLmhlaWdodCA9IHZhbHVlO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGVDb21wb25lbnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBBdGxhc0NvbXBvbmVudCwgU3ByaXRlQ29tcG9uZW50O1xuXG5BdGxhc0NvbXBvbmVudCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9hdGxhcy1jb21wb25lbnQnKTtcblNwcml0ZUNvbXBvbmVudCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9zcHJpdGUtY29tcG9uZW50Jyk7XG5cbm51Y2xlYXIuZXZlbnRzLm9uKCdzeXN0ZW06YmVmb3JlOnJlbmRlcmVyIGZyb20gZ2FtZS5yZW5kZXJpbmcnLCBmdW5jdGlvbiAoKSB7XG4gIC8vIHZhciBjb250ZXh0O1xuXG4gIC8vIGNvbnRleHQgPSBudWNsZWFyLnN5c3RlbS5jb250ZXh0KCk7XG5cbiAgLy8gY29udGV4dC5kZXN0c1swXS5jbGVhclJlY3QoMCwgMCwgY29udGV4dC5XSURUSCwgY29udGV4dC5IRUlHSFQpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbnVjbGVhci5tb2R1bGUoJ2dhbWUucmVuZGVyaW5nJywgWydnYW1lLnRyYW5zZm9ybSddKVxuICAuY29tcG9uZW50KCdhdGxhcycsIGZ1bmN0aW9uIChlLCBrZXkpIHtcbiAgICByZXR1cm4gbmV3IEF0bGFzQ29tcG9uZW50KGtleSk7XG4gIH0pXG4gIC5jb21wb25lbnQoJ3Nwcml0ZScsIGZ1bmN0aW9uIChlLCB3aWR0aCwgaGVpZ2h0LCBkZXN0KSB7XG4gICAgcmV0dXJuIG5ldyBTcHJpdGVDb21wb25lbnQod2lkdGgsIGhlaWdodCwgZGVzdCk7XG4gIH0pXG4gIC5zeXN0ZW0oJ3JlbmRlcmVyJywgW1xuICAgICdzcHJpdGUgZnJvbSBnYW1lLnJlbmRlcmluZycsXG4gICAgJ3Bvc2l0aW9uIGZyb20gZ2FtZS50cmFuc2Zvcm0nXG4gIF0sIHJlcXVpcmUoJy4vc3lzdGVtcy9yZW5kZXJlci1zeXN0ZW0nKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbm51Y2xlYXIuZXZlbnRzLm9uKCdzeXN0ZW06YmVmb3JlOnJlbmRlcmVyIGZyb20gZ2FtZS5yZW5kZXJpbmcnLCBmdW5jdGlvbiAoKSB7XG4gIHZhciBjb250ZXh0O1xuXG4gIGNvbnRleHQgPSBudWNsZWFyLnN5c3RlbS5jb250ZXh0KCk7XG5cbiAgY29udGV4dC5kZXN0c1swXS5jbGVhclJlY3QoMCwgMCwgY29udGV4dC5XSURUSCwgY29udGV4dC5IRUlHSFQpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmVuZGVyZXJTeXN0ZW0oZSwgY29tcG9uZW50cywgY29udGV4dCkge1xuICB2YXIgc3ByaXRlLCBwb3NpdGlvbiwgZGVzdCwgd2lkdGgsIGhlaWdodDtcblxuICBzcHJpdGUgPSBjb21wb25lbnRzLnNwcml0ZTtcbiAgcG9zaXRpb24gPSBjb21wb25lbnRzLnBvc2l0aW9uO1xuXG4gIGRlc3QgPSBjb250ZXh0LmRlc3RzW3Nwcml0ZS5kZXN0XTtcblxuICB3aWR0aCA9IHNwcml0ZS53aWR0aCgpO1xuICBoZWlnaHQgPSBzcHJpdGUuaGVpZ2h0KCk7XG5cbiAgZGVzdC5kcmF3SW1hZ2Uoc3ByaXRlLmJ1ZmZlciwgcG9zaXRpb24ueCAtIHdpZHRoICogMC41LCBwb3NpdGlvbi55IC0gaGVpZ2h0ICogMC41LCB3aWR0aCwgaGVpZ2h0KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB0ZW1wbGF0ZXMgOiB7XG4gICAgJ29uZScgOiB7XG4gICAgICBuYW1lIDogJ29uZScsXG4gICAgICBzbG90cyA6IFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGUgOiAncHJpbm55JyxcbiAgICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICAgIHggOiAzMCxcbiAgICAgICAgICAgIHkgOiAyMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGUgOiAncHJpbm55JyxcbiAgICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICAgIHggOiA0MCxcbiAgICAgICAgICAgIHkgOiAyMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGUgOiAncHJpbm55JyxcbiAgICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICAgIHggOiAxMDAsXG4gICAgICAgICAgICB5IDogMTBcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBsaWdodCA6ICdyZWQnLFxuICAgICAgYnVuZGxlIDogJ3N0b25lJ1xuICAgIH0sXG4gICAgJ3R3bycgOiB7XG4gICAgICBuYW1lIDogJ3R3bycsXG4gICAgICBzbG90cyA6IFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGUgOiAncHJpbm55JyxcbiAgICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICAgIHggOiAzMCxcbiAgICAgICAgICAgIHkgOiAyMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGUgOiAncHJpbm55JyxcbiAgICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICAgIHggOiA0MCxcbiAgICAgICAgICAgIHkgOiAyMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGUgOiAncHJpbm55JyxcbiAgICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICAgIHggOiAxMDAsXG4gICAgICAgICAgICB5IDogMTBcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBsaWdodCA6ICdyZWQnLFxuICAgICAgYnVuZGxlIDogJ3N0b25lJ1xuICAgIH0sXG4gICAgJ3RocmVlJyA6IHtcbiAgICAgIG5hbWUgOiAndGhyZWUnLFxuICAgICAgc2xvdHMgOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlIDogJ3ByaW5ueScsXG4gICAgICAgICAgcG9zaXRpb24gOiB7XG4gICAgICAgICAgICB4IDogMzAsXG4gICAgICAgICAgICB5IDogMjBcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlIDogJ3ByaW5ueScsXG4gICAgICAgICAgcG9zaXRpb24gOiB7XG4gICAgICAgICAgICB4IDogNDAsXG4gICAgICAgICAgICB5IDogMjBcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlIDogJ3ByaW5ueScsXG4gICAgICAgICAgcG9zaXRpb24gOiB7XG4gICAgICAgICAgICB4IDogMTAwLFxuICAgICAgICAgICAgeSA6IDEwXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdLFxuICAgICAgbGlnaHQgOiAncmVkJyxcbiAgICAgIGJ1bmRsZSA6ICdzdG9uZSdcbiAgICB9LFxuICAgICdmb3VyJyA6IHtcbiAgICAgIG5hbWUgOiAnZm91cicsXG4gICAgICBzbG90cyA6IFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGUgOiAncHJpbm55JyxcbiAgICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICAgIHggOiAzMCxcbiAgICAgICAgICAgIHkgOiAyMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGUgOiAncHJpbm55JyxcbiAgICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICAgIHggOiA0MCxcbiAgICAgICAgICAgIHkgOiAyMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGUgOiAncHJpbm55JyxcbiAgICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICAgIHggOiAxMDAsXG4gICAgICAgICAgICB5IDogMTBcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBsaWdodCA6ICdyZWQnLFxuICAgICAgYnVuZGxlIDogJ3N0b25lJ1xuICAgIH1cbiAgfSxcbiAgcmFuZ2VzIDoge1xuICAgICdvbmUnIDogWzksIDE0XSxcbiAgICAndHdvJyA6IFsxNSwgMjVdLFxuICAgICd0aHJlZScgOiBbMjYsIDQwXSxcbiAgICAnZm91cicgOiBbNDEsIDIwMF0sXG4gIH0sXG4gIHNsb3RzIDoge1xuICAgIGNyYXRlIDoge1xuICAgICAgY29tcG9uZW50cyA6IFtcbiAgICAgICAgJ2Rlc3RydWN0aWJsZScsXG4gICAgICAgICdjb2xsaWRlcicsXG4gICAgICAgICdzcHJpdGUnLFxuICAgICAgICAnc2NhbGUnXG4gICAgICBdLFxuICAgICAgZGF0YSA6IHtcblxuICAgICAgfVxuICAgIH0sXG4gICAgdG9yY2ggOiB7XG4gICAgICBjb21wb25lbnRzIDogW1xuICAgICAgICAnZGVzdHJ1Y3RpYmxlJyxcbiAgICAgICAgJ2NvbGxpZGVyJyxcbiAgICAgICAgJ3Nwcml0ZScsXG4gICAgICAgICdzY2FsZSdcbiAgICAgIF0sXG4gICAgICBkYXRhIDoge1xuXG4gICAgICB9XG4gICAgfSxcbiAgICBwcmlubnkgOiB7XG4gICAgICBjb21wb25lbnRzIDogW1xuICAgICAgICBcbiAgICAgIF0sXG4gICAgICBkYXRhIDoge1xuICAgICAgICBzcHJpdGUgOiBbMCwgMjAsIDIwXSxcbiAgICAgICAgYXRsYXMgOiBbMCwgJ3ByaW5ueSddLFxuICAgICAgICBhbmltYXRpb25zIDogWzAsIHtcbiAgICAgICAgICB0YXJnZXQ6ICdwcmlubnknLFxuICAgICAgICAgIGFuaW1hdGlvbnM6IFsnZGFuY2luZyddLFxuICAgICAgICAgIGRlZmF1bHRBbmltYXRpb246ICdkYW5jaW5nJ1xuICAgICAgICB9XVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgcmVzb2x1dGlvbiA6IDMwXG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciByb2d1ZW1hcCwgVGVtcGxhdGUsIGNvbmZpZywgTWFwO1xuXG5UZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUnKTtcbk1hcCA9IHJlcXVpcmUoJy4vbWFwJyk7XG5jb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xuXG5yb2d1ZW1hcCA9IG51Y2xlYXIubW9kdWxlKCdyb2d1ZW1hcCcsIFtdKTtcblxucm9ndWVtYXAuY29tcG9uZW50KCdtYXAnLCBmdW5jdGlvbihlbnRpdHksIGNvbmZpZyl7XG4gIHJldHVybiBuZXcgTWFwKGNvbmZpZyk7XG59KTtcblxucm9ndWVtYXAuY29tcG9uZW50KCdyb29tc19tYW5hZ2VyJywgZnVuY3Rpb24oZW50aXR5LCBkYXRhKXtcbiAgcmV0dXJuIGRhdGE7XG59KTsgXG5cbnJvZ3VlbWFwLmNvbXBvbmVudCgncm9vbScsIGZ1bmN0aW9uKGVudGl0eSwgZGF0YSl7XG4gIHZhciByb29tID0ge307XG5cbiAgcm9vbS5wb3NpdGlvbiA9IHtcbiAgICB4IDogZGF0YS5feDEsXG4gICAgeSA6IGRhdGEuX3kxXG4gIH07XG5cbiAgcm9vbS53aWR0aCA9IGRhdGEuX3gyLWRhdGEuX3gxO1xuICByb29tLmhlaWdodCA9IGRhdGEuX3kyLWRhdGEuX3kxO1xuICByb29tLnNpemUgPSByb29tLndpZHRoKnJvb20uaGVpZ2h0O1xuXG4gIHJldHVybiByb29tO1xufSk7XG5cbnJvZ3VlbWFwLmNvbXBvbmVudCgndGVtcGxhdGUnLCBmdW5jdGlvbihlbnRpdHksIGRhdGEpe1xuICB2YXIgdGVtcGxhdGUgPSBuZXcgVGVtcGxhdGUoZW50aXR5LCBkYXRhLnBvc2l0aW9uLCBkYXRhLndpZHRoLCBkYXRhLmhlaWdodCwgZGF0YS5jb25maWcpO1xuXG4gIHJldHVybiB0ZW1wbGF0ZTtcbn0pO1xuXG5yb2d1ZW1hcC5lbnRpdHkoJ3Jvb20nLCBmdW5jdGlvbihlbnRpdHksIGRhdGEpe1xuICB2YXIgcm9vbSAgID0gbnVjbGVhci5jb21wb25lbnQoJ3Jvb20nKS5hZGQoZW50aXR5LCBkYXRhKSxcbiAgICAgIHJhbmdlcyA9IHJvZ3VlbWFwLmNvbmZpZygncmFuZ2VzJyksXG4gICAgICB0ZW1wbGF0ZXMgPSByb2d1ZW1hcC5jb25maWcoJ3RlbXBsYXRlcycpLFxuICAgICAgcmFuZ2UsIHZhbGlkLCB1LCB0ZW1wbGF0ZTtcbiAgZm9yKHZhciB4IGluIHJhbmdlcyl7XG4gICAgcmFuZ2UgPSByYW5nZXNbeF07XG4gICAgdmFsaWQgPSBmYWxzZTtcbiAgICBmb3IodSA9IHJhbmdlWzBdOyB1IDwgcmFuZ2VbMV07IHUrKyl7XG4gICAgICBpZihyb29tLnNpemUgPT09IHUpe1xuICAgICAgICB2YWxpZCA9IHRydWU7XG4gICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGVzW3hdO1xuICAgICAgICBudWNsZWFyLmNvbXBvbmVudCgndGVtcGxhdGUnKS5hZGQoZW50aXR5LCB7XG4gICAgICAgICAgY29uZmlnIDogdGVtcGxhdGUsXG4gICAgICAgICAgd2lkdGggOiByb29tLndpZHRoLFxuICAgICAgICAgIGhlaWdodCA6IHJvb20uaGVpZ2h0LFxuICAgICAgICAgIHBvc2l0aW9uIDogcm9vbS5wb3NpdGlvblxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYodmFsaWQpe1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG59KTtcblxucm9ndWVtYXAuZW50aXR5KCdtYXAnLCBmdW5jdGlvbihlbnRpdHksIGRhdGEpe1xuICB2YXIgZGlnZ2VyID0gbnVjbGVhci5jb21wb25lbnQoJ21hcCBmcm9tIHJvZ3VlbWFwJykuYWRkKGVudGl0eSwgZGF0YS5tYXBEYXRhKS5tYXA7XG4gIHZhciByb29tcyA9IFtdO1xuICBmb3IodmFyIGkgPSAwOyBpIDwgZGlnZ2VyLl9yb29tcy5sZW5ndGg7IGkrKyl7XG4gICAgdmFyIHJvb20gPSBkaWdnZXIuX3Jvb21zW2ldO1xuICAgIHJvb21zLnB1c2gocm9ndWVtYXAuZW50aXR5KCdyb29tJykuY3JlYXRlKHJvb20pKTtcbiAgfVxuXG4gIG51Y2xlYXIuY29tcG9uZW50KCdyb29tc19tYW5hZ2VyIGZyb20gcm9ndWVtYXAnKS5hZGQoZW50aXR5LCByb29tcyk7XG59KTtcblxucm9ndWVtYXAuZW50aXR5KCd0aWxlJywgZnVuY3Rpb24oLyplbnRpdHksIGRhdGEqLyl7XG4gIC8vIHZhciByZXNvbHV0aW9uID0gcm9ndWVtYXAuY29uZmlnKCdyZXNvbHV0aW9uJyksXG4gIC8vICAgICBwb3NpdGlvbiA9IG51Y2xlYXIuY29tcG9uZW50KCdwb3NpdGlvbiBmcm9tIGdhbWUudHJhbnNmb3JtJykuYWRkKGVudGl0eSwgZGF0YS54KnJlc29sdXRpb24sIGRhdGEueSpyZXNvbHV0aW9uKSxcbiAgLy8gICAgIHNwcml0ZSA9IG51Y2xlYXIuY29tcG9uZW50KCdzcHJpdGUgZnJvbSBnYW1lLnJlbmRlcmluZycpLmFkZChlbnRpdHksIHJlc29sdXRpb24sIHJlc29sdXRpb24pO1xuXG4gIC8vIHNwcml0ZS5cbn0pO1xuXG5yb2d1ZW1hcC5jb21wb25lbnQoJ3Nsb3QnLCBmdW5jdGlvbihlbnRpdHksIGRhdGEpe1xuICB2YXIgaSwgY29tcG9uZW50LCBjb25maWdzO1xuICBmb3IoaSA9IDA7IGkgPCBkYXRhLmNvbXBvbmVudHMubGVuZ3RoOyBpKyspe1xuICAgIGNvbXBvbmVudCA9IGRhdGEuY29tcG9uZW50c1tpXTtcbiAgICBjb25maWdzID0gZGF0YS5kYXRhW2NvbXBvbmVudF07XG5cbiAgICBjb21wb25lbnQgPSBudWNsZWFyLmNvbXBvbmVudChjb21wb25lbnQpO1xuICAgIGNvbmZpZ3NbMF0gPSBlbnRpdHk7XG4gICAgY29tcG9uZW50LmFkZC5hcHBseShjb21wb25lbnQsIGNvbmZpZ3MpO1xuICB9XG4gIHJldHVybiBkYXRhO1xufSk7XG5cbnJvZ3VlbWFwLmVudGl0eSgnc2xvdCcsIGZ1bmN0aW9uKGVudGl0eSwgZGF0YSl7XG4gIHZhciBzbG90cyA9IHJvZ3VlbWFwLmNvbmZpZygnc2xvdHMnKSxcbiAgICAgIHNsb3QgID0gc2xvdHNbZGF0YS50eXBlXSxcbiAgICAgIHJlc29sdXRpb24gPSByb2d1ZW1hcC5jb25maWcoJ3Jlc29sdXRpb24nKTtcblxuICBzbG90ID0ge1xuICAgIGNvbXBvbmVudHMgOiBzbG90LmNvbXBvbmVudHMsXG4gICAgZGF0YSA6IHNsb3QuZGF0YSxcbiAgICBwb3NpdGlvbiA6IGRhdGEucG9zaXRpb24sXG4gICAgYnVuZGxlIDogZGF0YS5idW5kbGUsXG4gICAgdGVtcGxhdGUgOiBkYXRhLnRlbXBsYXRlXG4gIH07XG5cbiAgbnVjbGVhci5jb21wb25lbnQoJ3Nsb3QnKS5hZGQoZW50aXR5LCBzbG90KTtcbiAgbnVjbGVhci5jb21wb25lbnQoJ3Bvc2l0aW9uJykuYWRkKGVudGl0eSwgZGF0YS5wb3NpdGlvbi54KnJlc29sdXRpb24sIGRhdGEucG9zaXRpb24ueSpyZXNvbHV0aW9uKTtcbn0pO1xuXG5yb2d1ZW1hcC5jb25maWcoY29uZmlnIHx8IHtcbiAgdGVtcGxhdGVzIDoge30sXG4gIHJhbmdlcyA6IHt9LFxuICBzbG90cyA6IHt9LFxuICByZXNvbHV0aW9uIDogMjBcbn0pO1xuXG5udWNsZWFyLmltcG9ydChbcm9ndWVtYXBdKTtcbm1vZHVsZS5leHBvcnRzID0gcm9ndWVtYXA7XG4iLCIvKlxuXHRUaGlzIGlzIHJvdC5qcywgdGhlIFJPZ3VlbGlrZSBUb29sa2l0IGluIEphdmFTY3JpcHQuXG5cdFZlcnNpb24gMC41fmRldiwgZ2VuZXJhdGVkIG9uIE1vbiBNYXIgMzEgMTU6MTA6NDEgQ0VTVCAyMDE0LlxuKi9cbi8qKlxuICogQG5hbWVzcGFjZSBUb3AtbGV2ZWwgUk9UIG5hbWVzcGFjZVxuICovXG53aW5kb3cuUk9UID0ge1xuXHQvKipcblx0ICogQHJldHVybnMge2Jvb2x9IElzIHJvdC5qcyBzdXBwb3J0ZWQgYnkgdGhpcyBicm93c2VyP1xuXHQgKi9cblx0aXNTdXBwb3J0ZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAhIShkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpLmdldENvbnRleHQgJiYgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpO1xuXHR9LFxuXG5cdC8qKiBEZWZhdWx0IHdpdGggZm9yIGRpc3BsYXkgYW5kIG1hcCBnZW5lcmF0b3JzICovXG5cdERFRkFVTFRfV0lEVEg6IDgwLFxuXHQvKiogRGVmYXVsdCBoZWlnaHQgZm9yIGRpc3BsYXkgYW5kIG1hcCBnZW5lcmF0b3JzICovXG5cdERFRkFVTFRfSEVJR0hUOiAyNSxcblxuXHQvKiogRGlyZWN0aW9uYWwgY29uc3RhbnRzLiBPcmRlcmluZyBpcyBpbXBvcnRhbnQhICovXG5cdERJUlM6IHtcblx0XHRcIjRcIjogW1xuXHRcdFx0WyAwLCAtMV0sXG5cdFx0XHRbIDEsICAwXSxcblx0XHRcdFsgMCwgIDFdLFxuXHRcdFx0Wy0xLCAgMF1cblx0XHRdLFxuXHRcdFwiOFwiOiBbXG5cdFx0XHRbIDAsIC0xXSxcblx0XHRcdFsgMSwgLTFdLFxuXHRcdFx0WyAxLCAgMF0sXG5cdFx0XHRbIDEsICAxXSxcblx0XHRcdFsgMCwgIDFdLFxuXHRcdFx0Wy0xLCAgMV0sXG5cdFx0XHRbLTEsICAwXSxcblx0XHRcdFstMSwgLTFdXG5cdFx0XSxcblx0XHRcIjZcIjogW1xuXHRcdFx0Wy0xLCAtMV0sXG5cdFx0XHRbIDEsIC0xXSxcblx0XHRcdFsgMiwgIDBdLFxuXHRcdFx0WyAxLCAgMV0sXG5cdFx0XHRbLTEsICAxXSxcblx0XHRcdFstMiwgIDBdXG5cdFx0XVxuXHR9LFxuXG5cdC8qKiBDYW5jZWwga2V5LiAqL1xuXHRWS19DQU5DRUw6IDMsIFxuXHQvKiogSGVscCBrZXkuICovXG5cdFZLX0hFTFA6IDYsIFxuXHQvKiogQmFja3NwYWNlIGtleS4gKi9cblx0VktfQkFDS19TUEFDRTogOCwgXG5cdC8qKiBUYWIga2V5LiAqL1xuXHRWS19UQUI6IDksIFxuXHQvKiogNSBrZXkgb24gTnVtcGFkIHdoZW4gTnVtTG9jayBpcyB1bmxvY2tlZC4gT3Igb24gTWFjLCBjbGVhciBrZXkgd2hpY2ggaXMgcG9zaXRpb25lZCBhdCBOdW1Mb2NrIGtleS4gKi9cblx0VktfQ0xFQVI6IDEyLCBcblx0LyoqIFJldHVybi9lbnRlciBrZXkgb24gdGhlIG1haW4ga2V5Ym9hcmQuICovXG5cdFZLX1JFVFVSTjogMTMsIFxuXHQvKiogUmVzZXJ2ZWQsIGJ1dCBub3QgdXNlZC4gKi9cblx0VktfRU5URVI6IDE0LCBcblx0LyoqIFNoaWZ0IGtleS4gKi9cblx0VktfU0hJRlQ6IDE2LCBcblx0LyoqIENvbnRyb2wga2V5LiAqL1xuXHRWS19DT05UUk9MOiAxNywgXG5cdC8qKiBBbHQgKE9wdGlvbiBvbiBNYWMpIGtleS4gKi9cblx0VktfQUxUOiAxOCwgXG5cdC8qKiBQYXVzZSBrZXkuICovXG5cdFZLX1BBVVNFOiAxOSwgXG5cdC8qKiBDYXBzIGxvY2suICovXG5cdFZLX0NBUFNfTE9DSzogMjAsIFxuXHQvKiogRXNjYXBlIGtleS4gKi9cblx0VktfRVNDQVBFOiAyNywgXG5cdC8qKiBTcGFjZSBiYXIuICovXG5cdFZLX1NQQUNFOiAzMiwgXG5cdC8qKiBQYWdlIFVwIGtleS4gKi9cblx0VktfUEFHRV9VUDogMzMsIFxuXHQvKiogUGFnZSBEb3duIGtleS4gKi9cblx0VktfUEFHRV9ET1dOOiAzNCwgXG5cdC8qKiBFbmQga2V5LiAqL1xuXHRWS19FTkQ6IDM1LCBcblx0LyoqIEhvbWUga2V5LiAqL1xuXHRWS19IT01FOiAzNiwgXG5cdC8qKiBMZWZ0IGFycm93LiAqL1xuXHRWS19MRUZUOiAzNywgXG5cdC8qKiBVcCBhcnJvdy4gKi9cblx0VktfVVA6IDM4LCBcblx0LyoqIFJpZ2h0IGFycm93LiAqL1xuXHRWS19SSUdIVDogMzksIFxuXHQvKiogRG93biBhcnJvdy4gKi9cblx0VktfRE9XTjogNDAsIFxuXHQvKiogUHJpbnQgU2NyZWVuIGtleS4gKi9cblx0VktfUFJJTlRTQ1JFRU46IDQ0LCBcblx0LyoqIElucyhlcnQpIGtleS4gKi9cblx0VktfSU5TRVJUOiA0NSwgXG5cdC8qKiBEZWwoZXRlKSBrZXkuICovXG5cdFZLX0RFTEVURTogNDYsIFxuXHQvKioqL1xuXHRWS18wOiA0OCxcblx0LyoqKi9cblx0VktfMTogNDksXG5cdC8qKiovXG5cdFZLXzI6IDUwLFxuXHQvKioqL1xuXHRWS18zOiA1MSxcblx0LyoqKi9cblx0VktfNDogNTIsXG5cdC8qKiovXG5cdFZLXzU6IDUzLFxuXHQvKioqL1xuXHRWS182OiA1NCxcblx0LyoqKi9cblx0VktfNzogNTUsXG5cdC8qKiovXG5cdFZLXzg6IDU2LFxuXHQvKioqL1xuXHRWS185OiA1Nyxcblx0LyoqIENvbG9uICg6KSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfQ09MT046IDU4LCBcblx0LyoqIFNlbWljb2xvbiAoOykga2V5LiAqL1xuXHRWS19TRU1JQ09MT046IDU5LCBcblx0LyoqIExlc3MtdGhhbiAoPCkga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX0xFU1NfVEhBTjogNjAsIFxuXHQvKiogRXF1YWxzICg9KSBrZXkuICovXG5cdFZLX0VRVUFMUzogNjEsIFxuXHQvKiogR3JlYXRlci10aGFuICg+KSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfR1JFQVRFUl9USEFOOiA2MiwgXG5cdC8qKiBRdWVzdGlvbiBtYXJrICg/KSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfUVVFU1RJT05fTUFSSzogNjMsIFxuXHQvKiogQXRtYXJrIChAKSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfQVQ6IDY0LCBcblx0LyoqKi9cblx0VktfQTogNjUsXG5cdC8qKiovXG5cdFZLX0I6IDY2LFxuXHQvKioqL1xuXHRWS19DOiA2Nyxcblx0LyoqKi9cblx0VktfRDogNjgsXG5cdC8qKiovXG5cdFZLX0U6IDY5LFxuXHQvKioqL1xuXHRWS19GOiA3MCxcblx0LyoqKi9cblx0VktfRzogNzEsXG5cdC8qKiovXG5cdFZLX0g6IDcyLFxuXHQvKioqL1xuXHRWS19JOiA3Myxcblx0LyoqKi9cblx0VktfSjogNzQsXG5cdC8qKiovXG5cdFZLX0s6IDc1LFxuXHQvKioqL1xuXHRWS19MOiA3Nixcblx0LyoqKi9cblx0VktfTTogNzcsXG5cdC8qKiovXG5cdFZLX046IDc4LFxuXHQvKioqL1xuXHRWS19POiA3OSxcblx0LyoqKi9cblx0VktfUDogODAsXG5cdC8qKiovXG5cdFZLX1E6IDgxLFxuXHQvKioqL1xuXHRWS19SOiA4Mixcblx0LyoqKi9cblx0VktfUzogODMsXG5cdC8qKiovXG5cdFZLX1Q6IDg0LFxuXHQvKioqL1xuXHRWS19VOiA4NSxcblx0LyoqKi9cblx0VktfVjogODYsXG5cdC8qKiovXG5cdFZLX1c6IDg3LFxuXHQvKioqL1xuXHRWS19YOiA4OCxcblx0LyoqKi9cblx0VktfWTogODksXG5cdC8qKiovXG5cdFZLX1o6IDkwLFxuXHQvKioqL1xuXHRWS19DT05URVhUX01FTlU6IDkzLFxuXHQvKiogMCBvbiB0aGUgbnVtZXJpYyBrZXlwYWQuICovXG5cdFZLX05VTVBBRDA6IDk2LCBcblx0LyoqIDEgb24gdGhlIG51bWVyaWMga2V5cGFkLiAqL1xuXHRWS19OVU1QQUQxOiA5NywgXG5cdC8qKiAyIG9uIHRoZSBudW1lcmljIGtleXBhZC4gKi9cblx0VktfTlVNUEFEMjogOTgsIFxuXHQvKiogMyBvbiB0aGUgbnVtZXJpYyBrZXlwYWQuICovXG5cdFZLX05VTVBBRDM6IDk5LCBcblx0LyoqIDQgb24gdGhlIG51bWVyaWMga2V5cGFkLiAqL1xuXHRWS19OVU1QQUQ0OiAxMDAsIFxuXHQvKiogNSBvbiB0aGUgbnVtZXJpYyBrZXlwYWQuICovXG5cdFZLX05VTVBBRDU6IDEwMSwgXG5cdC8qKiA2IG9uIHRoZSBudW1lcmljIGtleXBhZC4gKi9cblx0VktfTlVNUEFENjogMTAyLCBcblx0LyoqIDcgb24gdGhlIG51bWVyaWMga2V5cGFkLiAqL1xuXHRWS19OVU1QQUQ3OiAxMDMsIFxuXHQvKiogOCBvbiB0aGUgbnVtZXJpYyBrZXlwYWQuICovXG5cdFZLX05VTVBBRDg6IDEwNCwgXG5cdC8qKiA5IG9uIHRoZSBudW1lcmljIGtleXBhZC4gKi9cblx0VktfTlVNUEFEOTogMTA1LCBcblx0LyoqICogb24gdGhlIG51bWVyaWMga2V5cGFkLiAqL1xuXHRWS19NVUxUSVBMWTogMTA2LFxuXHQvKiogKyBvbiB0aGUgbnVtZXJpYyBrZXlwYWQuICovXG5cdFZLX0FERDogMTA3LCBcblx0LyoqKi9cblx0VktfU0VQQVJBVE9SOiAxMDgsXG5cdC8qKiAtIG9uIHRoZSBudW1lcmljIGtleXBhZC4gKi9cblx0VktfU1VCVFJBQ1Q6IDEwOSwgXG5cdC8qKiBEZWNpbWFsIHBvaW50IG9uIHRoZSBudW1lcmljIGtleXBhZC4gKi9cblx0VktfREVDSU1BTDogMTEwLCBcblx0LyoqIC8gb24gdGhlIG51bWVyaWMga2V5cGFkLiAqL1xuXHRWS19ESVZJREU6IDExMSwgXG5cdC8qKiBGMSBrZXkuICovXG5cdFZLX0YxOiAxMTIsIFxuXHQvKiogRjIga2V5LiAqL1xuXHRWS19GMjogMTEzLCBcblx0LyoqIEYzIGtleS4gKi9cblx0VktfRjM6IDExNCwgXG5cdC8qKiBGNCBrZXkuICovXG5cdFZLX0Y0OiAxMTUsIFxuXHQvKiogRjUga2V5LiAqL1xuXHRWS19GNTogMTE2LCBcblx0LyoqIEY2IGtleS4gKi9cblx0VktfRjY6IDExNywgXG5cdC8qKiBGNyBrZXkuICovXG5cdFZLX0Y3OiAxMTgsIFxuXHQvKiogRjgga2V5LiAqL1xuXHRWS19GODogMTE5LCBcblx0LyoqIEY5IGtleS4gKi9cblx0VktfRjk6IDEyMCwgXG5cdC8qKiBGMTAga2V5LiAqL1xuXHRWS19GMTA6IDEyMSwgXG5cdC8qKiBGMTEga2V5LiAqL1xuXHRWS19GMTE6IDEyMiwgXG5cdC8qKiBGMTIga2V5LiAqL1xuXHRWS19GMTI6IDEyMywgXG5cdC8qKiBGMTMga2V5LiAqL1xuXHRWS19GMTM6IDEyNCwgXG5cdC8qKiBGMTQga2V5LiAqL1xuXHRWS19GMTQ6IDEyNSwgXG5cdC8qKiBGMTUga2V5LiAqL1xuXHRWS19GMTU6IDEyNiwgXG5cdC8qKiBGMTYga2V5LiAqL1xuXHRWS19GMTY6IDEyNywgXG5cdC8qKiBGMTcga2V5LiAqL1xuXHRWS19GMTc6IDEyOCwgXG5cdC8qKiBGMTgga2V5LiAqL1xuXHRWS19GMTg6IDEyOSwgXG5cdC8qKiBGMTkga2V5LiAqL1xuXHRWS19GMTk6IDEzMCwgXG5cdC8qKiBGMjAga2V5LiAqL1xuXHRWS19GMjA6IDEzMSwgXG5cdC8qKiBGMjEga2V5LiAqL1xuXHRWS19GMjE6IDEzMiwgXG5cdC8qKiBGMjIga2V5LiAqL1xuXHRWS19GMjI6IDEzMywgXG5cdC8qKiBGMjMga2V5LiAqL1xuXHRWS19GMjM6IDEzNCwgXG5cdC8qKiBGMjQga2V5LiAqL1xuXHRWS19GMjQ6IDEzNSwgXG5cdC8qKiBOdW0gTG9jayBrZXkuICovXG5cdFZLX05VTV9MT0NLOiAxNDQsIFxuXHQvKiogU2Nyb2xsIExvY2sga2V5LiAqL1xuXHRWS19TQ1JPTExfTE9DSzogMTQ1LCBcblx0LyoqIENpcmN1bWZsZXggKF4pIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19DSVJDVU1GTEVYOiAxNjAsIFxuXHQvKiogRXhjbGFtYXRpb24gKCEpIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19FWENMQU1BVElPTjogMTYxLCBcblx0LyoqIERvdWJsZSBxdW90ZSAoKSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfRE9VQkxFX1FVT1RFOiAxNjIsIFxuXHQvKiogSGFzaCAoIykga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX0hBU0g6IDE2MywgXG5cdC8qKiBEb2xsYXIgc2lnbiAoJCkga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX0RPTExBUjogMTY0LCBcblx0LyoqIFBlcmNlbnQgKCUpIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19QRVJDRU5UOiAxNjUsIFxuXHQvKiogQW1wZXJzYW5kICgmKSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfQU1QRVJTQU5EOiAxNjYsIFxuXHQvKiogVW5kZXJzY29yZSAoXykga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX1VOREVSU0NPUkU6IDE2NywgXG5cdC8qKiBPcGVuIHBhcmVudGhlc2lzICgoKSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfT1BFTl9QQVJFTjogMTY4LCBcblx0LyoqIENsb3NlIHBhcmVudGhlc2lzICgpKSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfQ0xPU0VfUEFSRU46IDE2OSwgXG5cdC8qIEFzdGVyaXNrICgqKSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfQVNURVJJU0s6IDE3MCxcblx0LyoqIFBsdXMgKCspIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19QTFVTOiAxNzEsIFxuXHQvKiogUGlwZSAofCkga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX1BJUEU6IDE3MiwgXG5cdC8qKiBIeXBoZW4tVVMvZG9jcy9NaW51cyAoLSkga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX0hZUEhFTl9NSU5VUzogMTczLCBcblx0LyoqIE9wZW4gY3VybHkgYnJhY2tldCAoeykga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX09QRU5fQ1VSTFlfQlJBQ0tFVDogMTc0LCBcblx0LyoqIENsb3NlIGN1cmx5IGJyYWNrZXQgKH0pIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19DTE9TRV9DVVJMWV9CUkFDS0VUOiAxNzUsIFxuXHQvKiogVGlsZGUgKH4pIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19USUxERTogMTc2LCBcblx0LyoqIENvbW1hICgsKSBrZXkuICovXG5cdFZLX0NPTU1BOiAxODgsIFxuXHQvKiogUGVyaW9kICguKSBrZXkuICovXG5cdFZLX1BFUklPRDogMTkwLCBcblx0LyoqIFNsYXNoICgvKSBrZXkuICovXG5cdFZLX1NMQVNIOiAxOTEsIFxuXHQvKiogQmFjayB0aWNrIChgKSBrZXkuICovXG5cdFZLX0JBQ0tfUVVPVEU6IDE5MiwgXG5cdC8qKiBPcGVuIHNxdWFyZSBicmFja2V0IChbKSBrZXkuICovXG5cdFZLX09QRU5fQlJBQ0tFVDogMjE5LCBcblx0LyoqIEJhY2sgc2xhc2ggKFxcKSBrZXkuICovXG5cdFZLX0JBQ0tfU0xBU0g6IDIyMCwgXG5cdC8qKiBDbG9zZSBzcXVhcmUgYnJhY2tldCAoXSkga2V5LiAqL1xuXHRWS19DTE9TRV9CUkFDS0VUOiAyMjEsIFxuXHQvKiogUXVvdGUgKCcnJykga2V5LiAqL1xuXHRWS19RVU9URTogMjIyLCBcblx0LyoqIE1ldGEga2V5IG9uIExpbnV4LCBDb21tYW5kIGtleSBvbiBNYWMuICovXG5cdFZLX01FVEE6IDIyNCwgXG5cdC8qKiBBbHRHciBrZXkgb24gTGludXguIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfQUxUR1I6IDIyNSwgXG5cdC8qKiBXaW5kb3dzIGxvZ28ga2V5IG9uIFdpbmRvd3MuIE9yIFN1cGVyIG9yIEh5cGVyIGtleSBvbiBMaW51eC4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19XSU46IDkxLCBcblx0LyoqIExpbnV4IHN1cHBvcnQgZm9yIHRoaXMga2V5Y29kZSB3YXMgYWRkZWQgaW4gR2Vja28gNC4wLiAqL1xuXHRWS19LQU5BOiAyMSwgXG5cdC8qKiBMaW51eCBzdXBwb3J0IGZvciB0aGlzIGtleWNvZGUgd2FzIGFkZGVkIGluIEdlY2tvIDQuMC4gKi9cblx0VktfSEFOR1VMOiAyMSwgXG5cdC8qKiDoi7HmlbAga2V5IG9uIEphcGFuZXNlIE1hYyBrZXlib2FyZC4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19FSVNVOiAyMiwgXG5cdC8qKiBMaW51eCBzdXBwb3J0IGZvciB0aGlzIGtleWNvZGUgd2FzIGFkZGVkIGluIEdlY2tvIDQuMC4gKi9cblx0VktfSlVOSkE6IDIzLCBcblx0LyoqIExpbnV4IHN1cHBvcnQgZm9yIHRoaXMga2V5Y29kZSB3YXMgYWRkZWQgaW4gR2Vja28gNC4wLiAqL1xuXHRWS19GSU5BTDogMjQsIFxuXHQvKiogTGludXggc3VwcG9ydCBmb3IgdGhpcyBrZXljb2RlIHdhcyBhZGRlZCBpbiBHZWNrbyA0LjAuICovXG5cdFZLX0hBTkpBOiAyNSwgXG5cdC8qKiBMaW51eCBzdXBwb3J0IGZvciB0aGlzIGtleWNvZGUgd2FzIGFkZGVkIGluIEdlY2tvIDQuMC4gKi9cblx0VktfS0FOSkk6IDI1LCBcblx0LyoqIExpbnV4IHN1cHBvcnQgZm9yIHRoaXMga2V5Y29kZSB3YXMgYWRkZWQgaW4gR2Vja28gNC4wLiAqL1xuXHRWS19DT05WRVJUOiAyOCwgXG5cdC8qKiBMaW51eCBzdXBwb3J0IGZvciB0aGlzIGtleWNvZGUgd2FzIGFkZGVkIGluIEdlY2tvIDQuMC4gKi9cblx0VktfTk9OQ09OVkVSVDogMjksIFxuXHQvKiogTGludXggc3VwcG9ydCBmb3IgdGhpcyBrZXljb2RlIHdhcyBhZGRlZCBpbiBHZWNrbyA0LjAuICovXG5cdFZLX0FDQ0VQVDogMzAsIFxuXHQvKiogTGludXggc3VwcG9ydCBmb3IgdGhpcyBrZXljb2RlIHdhcyBhZGRlZCBpbiBHZWNrbyA0LjAuICovXG5cdFZLX01PREVDSEFOR0U6IDMxLCBcblx0LyoqIExpbnV4IHN1cHBvcnQgZm9yIHRoaXMga2V5Y29kZSB3YXMgYWRkZWQgaW4gR2Vja28gNC4wLiAqL1xuXHRWS19TRUxFQ1Q6IDQxLCBcblx0LyoqIExpbnV4IHN1cHBvcnQgZm9yIHRoaXMga2V5Y29kZSB3YXMgYWRkZWQgaW4gR2Vja28gNC4wLiAqL1xuXHRWS19QUklOVDogNDIsIFxuXHQvKiogTGludXggc3VwcG9ydCBmb3IgdGhpcyBrZXljb2RlIHdhcyBhZGRlZCBpbiBHZWNrbyA0LjAuICovXG5cdFZLX0VYRUNVVEU6IDQzLCBcblx0LyoqIExpbnV4IHN1cHBvcnQgZm9yIHRoaXMga2V5Y29kZSB3YXMgYWRkZWQgaW4gR2Vja28gNC4wLlx0ICovXG5cdFZLX1NMRUVQOiA5NSBcbn07XG4vKipcbiAqIEBuYW1lc3BhY2VcbiAqIENvbnRhaW5zIHRleHQgdG9rZW5pemF0aW9uIGFuZCBicmVha2luZyByb3V0aW5lc1xuICovXG5ST1QuVGV4dCA9IHtcblx0UkVfQ09MT1JTOiAvJShbYmNdKXsoW159XSopfS9nLFxuXG5cdC8qIHRva2VuIHR5cGVzICovXG5cdFRZUEVfVEVYVDpcdFx0MCxcblx0VFlQRV9ORVdMSU5FOlx0MSxcblx0VFlQRV9GRzpcdFx0Mixcblx0VFlQRV9CRzpcdFx0MyxcblxuXHQvKipcblx0ICogTWVhc3VyZSBzaXplIG9mIGEgcmVzdWx0aW5nIHRleHQgYmxvY2tcblx0ICovXG5cdG1lYXN1cmU6IGZ1bmN0aW9uKHN0ciwgbWF4V2lkdGgpIHtcblx0XHR2YXIgcmVzdWx0ID0ge3dpZHRoOjAsIGhlaWdodDoxfTtcblx0XHR2YXIgdG9rZW5zID0gdGhpcy50b2tlbml6ZShzdHIsIG1heFdpZHRoKTtcblx0XHR2YXIgbGluZVdpZHRoID0gMDtcblxuXHRcdGZvciAodmFyIGk9MDtpPHRva2Vucy5sZW5ndGg7aSsrKSB7XG5cdFx0XHR2YXIgdG9rZW4gPSB0b2tlbnNbaV07XG5cdFx0XHRzd2l0Y2ggKHRva2VuLnR5cGUpIHtcblx0XHRcdFx0Y2FzZSB0aGlzLlRZUEVfVEVYVDpcblx0XHRcdFx0XHRsaW5lV2lkdGggKz0gdG9rZW4udmFsdWUubGVuZ3RoO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIHRoaXMuVFlQRV9ORVdMSU5FOlxuXHRcdFx0XHRcdHJlc3VsdC5oZWlnaHQrKztcblx0XHRcdFx0XHRyZXN1bHQud2lkdGggPSBNYXRoLm1heChyZXN1bHQud2lkdGgsIGxpbmVXaWR0aCk7XG5cdFx0XHRcdFx0bGluZVdpZHRoID0gMDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJlc3VsdC53aWR0aCA9IE1hdGgubWF4KHJlc3VsdC53aWR0aCwgbGluZVdpZHRoKTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENvbnZlcnQgc3RyaW5nIHRvIGEgc2VyaWVzIG9mIGEgZm9ybWF0dGluZyBjb21tYW5kc1xuXHQgKi9cblx0dG9rZW5pemU6IGZ1bmN0aW9uKHN0ciwgbWF4V2lkdGgpIHtcblx0XHR2YXIgcmVzdWx0ID0gW107XG5cblx0XHQvKiBmaXJzdCB0b2tlbml6YXRpb24gcGFzcyAtIHNwbGl0IHRleHRzIGFuZCBjb2xvciBmb3JtYXR0aW5nIGNvbW1hbmRzICovXG5cdFx0dmFyIG9mZnNldCA9IDA7XG5cdFx0c3RyLnJlcGxhY2UodGhpcy5SRV9DT0xPUlMsIGZ1bmN0aW9uKG1hdGNoLCB0eXBlLCBuYW1lLCBpbmRleCkge1xuXHRcdFx0Lyogc3RyaW5nIGJlZm9yZSAqL1xuXHRcdFx0dmFyIHBhcnQgPSBzdHIuc3Vic3RyaW5nKG9mZnNldCwgaW5kZXgpO1xuXHRcdFx0aWYgKHBhcnQubGVuZ3RoKSB7XG5cdFx0XHRcdHJlc3VsdC5wdXNoKHtcblx0XHRcdFx0XHR0eXBlOiBST1QuVGV4dC5UWVBFX1RFWFQsXG5cdFx0XHRcdFx0dmFsdWU6IHBhcnRcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qIGNvbG9yIGNvbW1hbmQgKi9cblx0XHRcdHJlc3VsdC5wdXNoKHtcblx0XHRcdFx0dHlwZTogKHR5cGUgPT0gXCJjXCIgPyBST1QuVGV4dC5UWVBFX0ZHIDogUk9ULlRleHQuVFlQRV9CRyksXG5cdFx0XHRcdHZhbHVlOiBuYW1lLnRyaW0oKVxuXHRcdFx0fSk7XG5cblx0XHRcdG9mZnNldCA9IGluZGV4ICsgbWF0Y2gubGVuZ3RoO1xuXHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0fSk7XG5cblx0XHQvKiBsYXN0IHJlbWFpbmluZyBwYXJ0ICovXG5cdFx0dmFyIHBhcnQgPSBzdHIuc3Vic3RyaW5nKG9mZnNldCk7XG5cdFx0aWYgKHBhcnQubGVuZ3RoKSB7XG5cdFx0XHRyZXN1bHQucHVzaCh7XG5cdFx0XHRcdHR5cGU6IFJPVC5UZXh0LlRZUEVfVEVYVCxcblx0XHRcdFx0dmFsdWU6IHBhcnRcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9icmVha0xpbmVzKHJlc3VsdCwgbWF4V2lkdGgpO1xuXHR9LFxuXG5cdC8qIGluc2VydCBsaW5lIGJyZWFrcyBpbnRvIGZpcnN0LXBhc3MgdG9rZW5pemVkIGRhdGEgKi9cblx0X2JyZWFrTGluZXM6IGZ1bmN0aW9uKHRva2VucywgbWF4V2lkdGgpIHtcblx0XHRpZiAoIW1heFdpZHRoKSB7IG1heFdpZHRoID0gSW5maW5pdHk7IH07XG5cblx0XHR2YXIgaSA9IDA7XG5cdFx0dmFyIGxpbmVMZW5ndGggPSAwO1xuXHRcdHZhciBsYXN0VG9rZW5XaXRoU3BhY2UgPSAtMTtcblxuXHRcdHdoaWxlIChpIDwgdG9rZW5zLmxlbmd0aCkgeyAvKiB0YWtlIGFsbCB0ZXh0IHRva2VucywgcmVtb3ZlIHNwYWNlLCBhcHBseSBsaW5lYnJlYWtzICovXG5cdFx0XHR2YXIgdG9rZW4gPSB0b2tlbnNbaV07XG5cdFx0XHRpZiAodG9rZW4udHlwZSA9PSBST1QuVGV4dC5UWVBFX05FV0xJTkUpIHsgLyogcmVzZXQgKi9cblx0XHRcdFx0bGluZUxlbmd0aCA9IDA7IFxuXHRcdFx0XHRsYXN0VG9rZW5XaXRoU3BhY2UgPSAtMTtcblx0XHRcdH1cblx0XHRcdGlmICh0b2tlbi50eXBlICE9IFJPVC5UZXh0LlRZUEVfVEVYVCkgeyAvKiBza2lwIG5vbi10ZXh0IHRva2VucyAqL1xuXHRcdFx0XHRpKys7XG5cdFx0XHRcdGNvbnRpbnVlOyBcblx0XHRcdH1cblxuXHRcdFx0LyogcmVtb3ZlIHNwYWNlcyBhdCB0aGUgYmVnaW5uaW5nIG9mIGxpbmUgKi9cblx0XHRcdHdoaWxlIChsaW5lTGVuZ3RoID09IDAgJiYgdG9rZW4udmFsdWUuY2hhckF0KDApID09IFwiIFwiKSB7IHRva2VuLnZhbHVlID0gdG9rZW4udmFsdWUuc3Vic3RyaW5nKDEpOyB9XG5cblx0XHRcdC8qIGZvcmNlZCBuZXdsaW5lPyBpbnNlcnQgdHdvIG5ldyB0b2tlbnMgYWZ0ZXIgdGhpcyBvbmUgKi9cblx0XHRcdHZhciBpbmRleCA9IHRva2VuLnZhbHVlLmluZGV4T2YoXCJcXG5cIik7XG5cdFx0XHRpZiAoaW5kZXggIT0gLTEpIHsgXG5cdFx0XHRcdHRva2VuLnZhbHVlID0gdGhpcy5fYnJlYWtJbnNpZGVUb2tlbih0b2tlbnMsIGksIGluZGV4LCB0cnVlKTsgXG5cblx0XHRcdFx0LyogaWYgdGhlcmUgYXJlIHNwYWNlcyBhdCB0aGUgZW5kLCB3ZSBtdXN0IHJlbW92ZSB0aGVtICh3ZSBkbyBub3Qgd2FudCB0aGUgbGluZSB0b28gbG9uZykgKi9cblx0XHRcdFx0dmFyIGFyciA9IHRva2VuLnZhbHVlLnNwbGl0KFwiXCIpO1xuXHRcdFx0XHR3aGlsZSAoYXJyW2Fyci5sZW5ndGgtMV0gPT0gXCIgXCIpIHsgYXJyLnBvcCgpOyB9XG5cdFx0XHRcdHRva2VuLnZhbHVlID0gYXJyLmpvaW4oXCJcIik7XG5cdFx0XHR9XG5cblx0XHRcdC8qIHRva2VuIGRlZ2VuZXJhdGVkPyAqL1xuXHRcdFx0aWYgKCF0b2tlbi52YWx1ZS5sZW5ndGgpIHtcblx0XHRcdFx0dG9rZW5zLnNwbGljZShpLCAxKTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChsaW5lTGVuZ3RoICsgdG9rZW4udmFsdWUubGVuZ3RoID4gbWF4V2lkdGgpIHsgLyogbGluZSB0b28gbG9uZywgZmluZCBhIHN1aXRhYmxlIGJyZWFraW5nIHNwb3QgKi9cblxuXHRcdFx0XHQvKiBpcyBpdCBwb3NzaWJsZSB0byBicmVhayB3aXRoaW4gdGhpcyB0b2tlbj8gKi9cblx0XHRcdFx0dmFyIGluZGV4ID0gLTE7XG5cdFx0XHRcdHdoaWxlICgxKSB7XG5cdFx0XHRcdFx0dmFyIG5leHRJbmRleCA9IHRva2VuLnZhbHVlLmluZGV4T2YoXCIgXCIsIGluZGV4KzEpO1xuXHRcdFx0XHRcdGlmIChuZXh0SW5kZXggPT0gLTEpIHsgYnJlYWs7IH1cblx0XHRcdFx0XHRpZiAobGluZUxlbmd0aCArIG5leHRJbmRleCA+IG1heFdpZHRoKSB7IGJyZWFrOyB9XG5cdFx0XHRcdFx0aW5kZXggPSBuZXh0SW5kZXg7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoaW5kZXggIT0gLTEpIHsgLyogYnJlYWsgYXQgc3BhY2Ugd2l0aGluIHRoaXMgb25lICovXG5cdFx0XHRcdFx0dG9rZW4udmFsdWUgPSB0aGlzLl9icmVha0luc2lkZVRva2VuKHRva2VucywgaSwgaW5kZXgsIHRydWUpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGxhc3RUb2tlbldpdGhTcGFjZSAhPSAtMSkgeyAvKiBpcyB0aGVyZSBhIHByZXZpb3VzIHRva2VuIHdoZXJlIGEgYnJlYWsgY2FuIG9jY3VyPyAqL1xuXHRcdFx0XHRcdHZhciB0b2tlbiA9IHRva2Vuc1tsYXN0VG9rZW5XaXRoU3BhY2VdO1xuXHRcdFx0XHRcdHZhciBicmVha0luZGV4ID0gdG9rZW4udmFsdWUubGFzdEluZGV4T2YoXCIgXCIpO1xuXHRcdFx0XHRcdHRva2VuLnZhbHVlID0gdGhpcy5fYnJlYWtJbnNpZGVUb2tlbih0b2tlbnMsIGxhc3RUb2tlbldpdGhTcGFjZSwgYnJlYWtJbmRleCwgdHJ1ZSk7XG5cdFx0XHRcdFx0aSA9IGxhc3RUb2tlbldpdGhTcGFjZTtcblx0XHRcdFx0fSBlbHNlIHsgLyogZm9yY2UgYnJlYWsgaW4gdGhpcyB0b2tlbiAqL1xuXHRcdFx0XHRcdHRva2VuLnZhbHVlID0gdGhpcy5fYnJlYWtJbnNpZGVUb2tlbih0b2tlbnMsIGksIG1heFdpZHRoLWxpbmVMZW5ndGgsIGZhbHNlKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9IGVsc2UgeyAvKiBsaW5lIG5vdCBsb25nLCBjb250aW51ZSAqL1xuXHRcdFx0XHRsaW5lTGVuZ3RoICs9IHRva2VuLnZhbHVlLmxlbmd0aDtcblx0XHRcdFx0aWYgKHRva2VuLnZhbHVlLmluZGV4T2YoXCIgXCIpICE9IC0xKSB7IGxhc3RUb2tlbldpdGhTcGFjZSA9IGk7IH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0aSsrOyAvKiBhZHZhbmNlIHRvIG5leHQgdG9rZW4gKi9cblx0XHR9XG5cblxuXHRcdHRva2Vucy5wdXNoKHt0eXBlOiBST1QuVGV4dC5UWVBFX05FV0xJTkV9KTsgLyogaW5zZXJ0IGZha2UgbmV3bGluZSB0byBmaXggdGhlIGxhc3QgdGV4dCBsaW5lICovXG5cblx0XHQvKiByZW1vdmUgdHJhaWxpbmcgc3BhY2UgZnJvbSB0ZXh0IHRva2VucyBiZWZvcmUgbmV3bGluZXMgKi9cblx0XHR2YXIgbGFzdFRleHRUb2tlbiA9IG51bGw7XG5cdFx0Zm9yICh2YXIgaT0wO2k8dG9rZW5zLmxlbmd0aDtpKyspIHtcblx0XHRcdHZhciB0b2tlbiA9IHRva2Vuc1tpXTtcblx0XHRcdHN3aXRjaCAodG9rZW4udHlwZSkge1xuXHRcdFx0XHRjYXNlIFJPVC5UZXh0LlRZUEVfVEVYVDogbGFzdFRleHRUb2tlbiA9IHRva2VuOyBicmVhaztcblx0XHRcdFx0Y2FzZSBST1QuVGV4dC5UWVBFX05FV0xJTkU6IFxuXHRcdFx0XHRcdGlmIChsYXN0VGV4dFRva2VuKSB7IC8qIHJlbW92ZSB0cmFpbGluZyBzcGFjZSAqL1xuXHRcdFx0XHRcdFx0dmFyIGFyciA9IGxhc3RUZXh0VG9rZW4udmFsdWUuc3BsaXQoXCJcIik7XG5cdFx0XHRcdFx0XHR3aGlsZSAoYXJyW2Fyci5sZW5ndGgtMV0gPT0gXCIgXCIpIHsgYXJyLnBvcCgpOyB9XG5cdFx0XHRcdFx0XHRsYXN0VGV4dFRva2VuLnZhbHVlID0gYXJyLmpvaW4oXCJcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGxhc3RUZXh0VG9rZW4gPSBudWxsO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0b2tlbnMucG9wKCk7IC8qIHJlbW92ZSBmYWtlIHRva2VuICovXG5cblx0XHRyZXR1cm4gdG9rZW5zO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgbmV3IHRva2VucyBhbmQgaW5zZXJ0IHRoZW0gaW50byB0aGUgc3RyZWFtXG5cdCAqIEBwYXJhbSB7b2JqZWN0W119IHRva2Vuc1xuXHQgKiBAcGFyYW0ge2ludH0gdG9rZW5JbmRleCBUb2tlbiBiZWluZyBwcm9jZXNzZWRcblx0ICogQHBhcmFtIHtpbnR9IGJyZWFrSW5kZXggSW5kZXggd2l0aGluIGN1cnJlbnQgdG9rZW4ncyB2YWx1ZVxuXHQgKiBAcGFyYW0ge2Jvb2x9IHJlbW92ZUJyZWFrQ2hhciBEbyB3ZSB3YW50IHRvIHJlbW92ZSB0aGUgYnJlYWtpbmcgY2hhcmFjdGVyP1xuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSByZW1haW5pbmcgdW5icm9rZW4gdG9rZW4gdmFsdWVcblx0ICovXG5cdF9icmVha0luc2lkZVRva2VuOiBmdW5jdGlvbih0b2tlbnMsIHRva2VuSW5kZXgsIGJyZWFrSW5kZXgsIHJlbW92ZUJyZWFrQ2hhcikge1xuXHRcdHZhciBuZXdCcmVha1Rva2VuID0ge1xuXHRcdFx0dHlwZTogUk9ULlRleHQuVFlQRV9ORVdMSU5FXG5cdFx0fVxuXHRcdHZhciBuZXdUZXh0VG9rZW4gPSB7XG5cdFx0XHR0eXBlOiBST1QuVGV4dC5UWVBFX1RFWFQsXG5cdFx0XHR2YWx1ZTogdG9rZW5zW3Rva2VuSW5kZXhdLnZhbHVlLnN1YnN0cmluZyhicmVha0luZGV4ICsgKHJlbW92ZUJyZWFrQ2hhciA/IDEgOiAwKSlcblx0XHR9XG5cdFx0dG9rZW5zLnNwbGljZSh0b2tlbkluZGV4KzEsIDAsIG5ld0JyZWFrVG9rZW4sIG5ld1RleHRUb2tlbik7XG5cdFx0cmV0dXJuIHRva2Vuc1t0b2tlbkluZGV4XS52YWx1ZS5zdWJzdHJpbmcoMCwgYnJlYWtJbmRleCk7XG5cdH1cbn1cbi8qKlxuICogQHJldHVybnMge2FueX0gUmFuZG9tbHkgcGlja2VkIGl0ZW0sIG51bGwgd2hlbiBsZW5ndGg9MFxuICovXG5BcnJheS5wcm90b3R5cGUucmFuZG9tID0gZnVuY3Rpb24oKSB7XG5cdGlmICghdGhpcy5sZW5ndGgpIHsgcmV0dXJuIG51bGw7IH1cblx0cmV0dXJuIHRoaXNbTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSAqIHRoaXMubGVuZ3RoKV07XG59XG5cbi8qKlxuICogQHJldHVybnMge2FycmF5fSBOZXcgYXJyYXkgd2l0aCByYW5kb21pemVkIGl0ZW1zXG4gKiBGSVhNRSBkZXN0cm95cyB0aGlzIVxuICovXG5BcnJheS5wcm90b3R5cGUucmFuZG9taXplID0gZnVuY3Rpb24oKSB7XG5cdHZhciByZXN1bHQgPSBbXTtcblx0d2hpbGUgKHRoaXMubGVuZ3RoKSB7XG5cdFx0dmFyIGluZGV4ID0gdGhpcy5pbmRleE9mKHRoaXMucmFuZG9tKCkpO1xuXHRcdHJlc3VsdC5wdXNoKHRoaXMuc3BsaWNlKGluZGV4LCAxKVswXSk7XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn1cbi8qKlxuICogQWx3YXlzIHBvc2l0aXZlIG1vZHVsdXNcbiAqIEBwYXJhbSB7aW50fSBuIE1vZHVsdXNcbiAqIEByZXR1cm5zIHtpbnR9IHRoaXMgbW9kdWxvIG5cbiAqL1xuTnVtYmVyLnByb3RvdHlwZS5tb2QgPSBmdW5jdGlvbihuKSB7XG5cdHJldHVybiAoKHRoaXMlbikrbiklbjtcbn1cbi8qKlxuICogQHJldHVybnMge3N0cmluZ30gRmlyc3QgbGV0dGVyIGNhcGl0YWxpemVkXG4gKi9cblN0cmluZy5wcm90b3R5cGUuY2FwaXRhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRoaXMuc3Vic3RyaW5nKDEpO1xufVxuXG4vKiogXG4gKiBMZWZ0IHBhZFxuICogQHBhcmFtIHtzdHJpbmd9IFtjaGFyYWN0ZXI9XCIwXCJdXG4gKiBAcGFyYW0ge2ludH0gW2NvdW50PTJdXG4gKi9cblN0cmluZy5wcm90b3R5cGUubHBhZCA9IGZ1bmN0aW9uKGNoYXJhY3RlciwgY291bnQpIHtcblx0dmFyIGNoID0gY2hhcmFjdGVyIHx8IFwiMFwiO1xuXHR2YXIgY250ID0gY291bnQgfHwgMjtcblxuXHR2YXIgcyA9IFwiXCI7XG5cdHdoaWxlIChzLmxlbmd0aCA8IChjbnQgLSB0aGlzLmxlbmd0aCkpIHsgcyArPSBjaDsgfVxuXHRzID0gcy5zdWJzdHJpbmcoMCwgY250LXRoaXMubGVuZ3RoKTtcblx0cmV0dXJuIHMrdGhpcztcbn1cblxuLyoqIFxuICogUmlnaHQgcGFkXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NoYXJhY3Rlcj1cIjBcIl1cbiAqIEBwYXJhbSB7aW50fSBbY291bnQ9Ml1cbiAqL1xuU3RyaW5nLnByb3RvdHlwZS5ycGFkID0gZnVuY3Rpb24oY2hhcmFjdGVyLCBjb3VudCkge1xuXHR2YXIgY2ggPSBjaGFyYWN0ZXIgfHwgXCIwXCI7XG5cdHZhciBjbnQgPSBjb3VudCB8fCAyO1xuXG5cdHZhciBzID0gXCJcIjtcblx0d2hpbGUgKHMubGVuZ3RoIDwgKGNudCAtIHRoaXMubGVuZ3RoKSkgeyBzICs9IGNoOyB9XG5cdHMgPSBzLnN1YnN0cmluZygwLCBjbnQtdGhpcy5sZW5ndGgpO1xuXHRyZXR1cm4gdGhpcytzO1xufVxuXG4vKipcbiAqIEZvcm1hdCBhIHN0cmluZyBpbiBhIGZsZXhpYmxlIHdheS4gU2NhbnMgZm9yICVzIHN0cmluZ3MgYW5kIHJlcGxhY2VzIHRoZW0gd2l0aCBhcmd1bWVudHMuIExpc3Qgb2YgcGF0dGVybnMgaXMgbW9kaWZpYWJsZSB2aWEgU3RyaW5nLmZvcm1hdC5tYXAuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGVtcGxhdGVcbiAqIEBwYXJhbSB7YW55fSBbYXJndl1cbiAqL1xuU3RyaW5nLmZvcm1hdCA9IGZ1bmN0aW9uKHRlbXBsYXRlKSB7XG5cdHZhciBtYXAgPSBTdHJpbmcuZm9ybWF0Lm1hcDtcblx0dmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG5cdHZhciByZXBsYWNlciA9IGZ1bmN0aW9uKG1hdGNoLCBncm91cDEsIGdyb3VwMiwgaW5kZXgpIHtcblx0XHRpZiAodGVtcGxhdGUuY2hhckF0KGluZGV4LTEpID09IFwiJVwiKSB7IHJldHVybiBtYXRjaC5zdWJzdHJpbmcoMSk7IH1cblx0XHRpZiAoIWFyZ3MubGVuZ3RoKSB7IHJldHVybiBtYXRjaDsgfVxuXHRcdHZhciBvYmogPSBhcmdzWzBdO1xuXG5cdFx0dmFyIGdyb3VwID0gZ3JvdXAxIHx8IGdyb3VwMjtcblx0XHR2YXIgcGFydHMgPSBncm91cC5zcGxpdChcIixcIik7XG5cdFx0dmFyIG5hbWUgPSBwYXJ0cy5zaGlmdCgpO1xuXHRcdHZhciBtZXRob2QgPSBtYXBbbmFtZS50b0xvd2VyQ2FzZSgpXTtcblx0XHRpZiAoIW1ldGhvZCkgeyByZXR1cm4gbWF0Y2g7IH1cblxuXHRcdHZhciBvYmogPSBhcmdzLnNoaWZ0KCk7XG5cdFx0dmFyIHJlcGxhY2VkID0gb2JqW21ldGhvZF0uYXBwbHkob2JqLCBwYXJ0cyk7XG5cblx0XHR2YXIgZmlyc3QgPSBuYW1lLmNoYXJBdCgwKTtcblx0XHRpZiAoZmlyc3QgIT0gZmlyc3QudG9Mb3dlckNhc2UoKSkgeyByZXBsYWNlZCA9IHJlcGxhY2VkLmNhcGl0YWxpemUoKTsgfVxuXG5cdFx0cmV0dXJuIHJlcGxhY2VkO1xuXHR9XG5cdHJldHVybiB0ZW1wbGF0ZS5yZXBsYWNlKC8lKD86KFthLXpdKyl8KD86eyhbXn1dKyl9KSkvZ2ksIHJlcGxhY2VyKTtcbn1cblxuU3RyaW5nLmZvcm1hdC5tYXAgPSB7XG5cdFwic1wiOiBcInRvU3RyaW5nXCJcbn1cblxuLyoqXG4gKiBDb252ZW5pZW5jZSBzaG9ydGN1dCB0byBTdHJpbmcuZm9ybWF0KHRoaXMpXG4gKi9cblN0cmluZy5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24oKSB7XG5cdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblx0YXJncy51bnNoaWZ0KHRoaXMpO1xuXHRyZXR1cm4gU3RyaW5nLmZvcm1hdC5hcHBseShTdHJpbmcsIGFyZ3MpO1xufVxuXG5pZiAoIU9iamVjdC5jcmVhdGUpIHsgIFxuXHQvKipcblx0ICogRVM1IE9iamVjdC5jcmVhdGVcblx0ICovXG5cdE9iamVjdC5jcmVhdGUgPSBmdW5jdGlvbihvKSB7ICBcblx0XHR2YXIgdG1wID0gZnVuY3Rpb24oKSB7fTtcblx0XHR0bXAucHJvdG90eXBlID0gbztcblx0XHRyZXR1cm4gbmV3IHRtcCgpO1xuXHR9OyAgXG59ICBcbi8qKlxuICogU2V0cyBwcm90b3R5cGUgb2YgdGhpcyBmdW5jdGlvbiB0byBhbiBpbnN0YW5jZSBvZiBwYXJlbnQgZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHBhcmVudFxuICovXG5GdW5jdGlvbi5wcm90b3R5cGUuZXh0ZW5kID0gZnVuY3Rpb24ocGFyZW50KSB7XG5cdHRoaXMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShwYXJlbnQucHJvdG90eXBlKTtcblx0dGhpcy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSB0aGlzO1xuXHRyZXR1cm4gdGhpcztcbn1cbndpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPVxuXHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cdHx8IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0fHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuXHR8fCB3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZVxuXHR8fCB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0fHwgZnVuY3Rpb24oY2IpIHsgcmV0dXJuIHNldFRpbWVvdXQoY2IsIDEwMDAvNjApOyB9O1xuXG53aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPVxuXHR3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWVcblx0fHwgd2luZG93Lm1vekNhbmNlbEFuaW1hdGlvbkZyYW1lXG5cdHx8IHdpbmRvdy53ZWJraXRDYW5jZWxBbmltYXRpb25GcmFtZVxuXHR8fCB3aW5kb3cub0NhbmNlbEFuaW1hdGlvbkZyYW1lXG5cdHx8IHdpbmRvdy5tc0NhbmNlbEFuaW1hdGlvbkZyYW1lXG5cdHx8IGZ1bmN0aW9uKGlkKSB7IHJldHVybiBjbGVhclRpbWVvdXQoaWQpOyB9O1xuLyoqXG4gKiBAY2xhc3MgVmlzdWFsIG1hcCBkaXNwbGF5XG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXG4gKiBAcGFyYW0ge2ludH0gW29wdGlvbnMud2lkdGg9Uk9ULkRFRkFVTFRfV0lEVEhdXG4gKiBAcGFyYW0ge2ludH0gW29wdGlvbnMuaGVpZ2h0PVJPVC5ERUZBVUxUX0hFSUdIVF1cbiAqIEBwYXJhbSB7aW50fSBbb3B0aW9ucy5mb250U2l6ZT0xNV1cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5mb250RmFtaWx5PVwibW9ub3NwYWNlXCJdXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZm9udFN0eWxlPVwiXCJdIGJvbGQvaXRhbGljL25vbmUvYm90aFxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmZnPVwiI2NjY1wiXVxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmJnPVwiIzAwMFwiXVxuICogQHBhcmFtIHtmbG9hdH0gW29wdGlvbnMuc3BhY2luZz0xXVxuICogQHBhcmFtIHtmbG9hdH0gW29wdGlvbnMuYm9yZGVyPTBdXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMubGF5b3V0PVwicmVjdFwiXVxuICogQHBhcmFtIHtpbnR9IFtvcHRpb25zLnRpbGVXaWR0aD0zMl1cbiAqIEBwYXJhbSB7aW50fSBbb3B0aW9ucy50aWxlSGVpZ2h0PTMyXVxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLnRpbGVNYXA9e31dXG4gKiBAcGFyYW0ge2ltYWdlfSBbb3B0aW9ucy50aWxlU2V0PW51bGxdXG4gKi9cblJPVC5EaXNwbGF5ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcblx0dGhpcy5fY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5cdHRoaXMuX2RhdGEgPSB7fTtcblx0dGhpcy5fZGlydHkgPSBmYWxzZTsgLyogZmFsc2UgPSBub3RoaW5nLCB0cnVlID0gYWxsLCBvYmplY3QgPSBkaXJ0eSBjZWxscyAqL1xuXHR0aGlzLl9vcHRpb25zID0ge307XG5cdHRoaXMuX2JhY2tlbmQgPSBudWxsO1xuXHRcblx0dmFyIGRlZmF1bHRPcHRpb25zID0ge1xuXHRcdHdpZHRoOiBST1QuREVGQVVMVF9XSURUSCxcblx0XHRoZWlnaHQ6IFJPVC5ERUZBVUxUX0hFSUdIVCxcblx0XHRsYXlvdXQ6IFwicmVjdFwiLFxuXHRcdGZvbnRTaXplOiAxNSxcblx0XHRzcGFjaW5nOiAxLFxuXHRcdGJvcmRlcjogMCxcblx0XHRmb250RmFtaWx5OiBcIm1vbm9zcGFjZVwiLFxuXHRcdGZvbnRTdHlsZTogXCJcIixcblx0XHRmZzogXCIjY2NjXCIsXG5cdFx0Ymc6IFwiIzAwMFwiLFxuXHRcdHRpbGVXaWR0aDogMzIsXG5cdFx0dGlsZUhlaWdodDogMzIsXG5cdFx0dGlsZU1hcDoge30sXG5cdFx0dGlsZVNldDogbnVsbFxuXHR9O1xuXHRmb3IgKHZhciBwIGluIG9wdGlvbnMpIHsgZGVmYXVsdE9wdGlvbnNbcF0gPSBvcHRpb25zW3BdOyB9XG5cdHRoaXMuc2V0T3B0aW9ucyhkZWZhdWx0T3B0aW9ucyk7XG5cdHRoaXMuREVCVUcgPSB0aGlzLkRFQlVHLmJpbmQodGhpcyk7XG5cblx0dGhpcy5fdGljayA9IHRoaXMuX3RpY2suYmluZCh0aGlzKTtcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX3RpY2spO1xufVxuXG4vKipcbiAqIERlYnVnIGhlbHBlciwgaWRlYWwgYXMgYSBtYXAgZ2VuZXJhdG9yIGNhbGxiYWNrLiBBbHdheXMgYm91bmQgdG8gdGhpcy5cbiAqIEBwYXJhbSB7aW50fSB4XG4gKiBAcGFyYW0ge2ludH0geVxuICogQHBhcmFtIHtpbnR9IHdoYXRcbiAqL1xuUk9ULkRpc3BsYXkucHJvdG90eXBlLkRFQlVHID0gZnVuY3Rpb24oeCwgeSwgd2hhdCkge1xuXHR2YXIgY29sb3JzID0gW3RoaXMuX29wdGlvbnMuYmcsIHRoaXMuX29wdGlvbnMuZmddO1xuXHR0aGlzLmRyYXcoeCwgeSwgbnVsbCwgbnVsbCwgY29sb3JzW3doYXQgJSBjb2xvcnMubGVuZ3RoXSk7XG59XG5cbi8qKlxuICogQ2xlYXIgdGhlIHdob2xlIGRpc3BsYXkgKGNvdmVyIGl0IHdpdGggYmFja2dyb3VuZCBjb2xvcilcbiAqL1xuUk9ULkRpc3BsYXkucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuX2RhdGEgPSB7fTtcblx0dGhpcy5fZGlydHkgPSB0cnVlO1xufVxuXG4vKipcbiAqIEBzZWUgUk9ULkRpc3BsYXlcbiAqL1xuUk9ULkRpc3BsYXkucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cdGZvciAodmFyIHAgaW4gb3B0aW9ucykgeyB0aGlzLl9vcHRpb25zW3BdID0gb3B0aW9uc1twXTsgfVxuXHRpZiAob3B0aW9ucy53aWR0aCB8fCBvcHRpb25zLmhlaWdodCB8fCBvcHRpb25zLmZvbnRTaXplIHx8IG9wdGlvbnMuZm9udEZhbWlseSB8fCBvcHRpb25zLnNwYWNpbmcgfHwgb3B0aW9ucy5sYXlvdXQpIHtcblx0XHRpZiAob3B0aW9ucy5sYXlvdXQpIHsgXG5cdFx0XHR0aGlzLl9iYWNrZW5kID0gbmV3IFJPVC5EaXNwbGF5W29wdGlvbnMubGF5b3V0LmNhcGl0YWxpemUoKV0odGhpcy5fY29udGV4dCk7XG5cdFx0fVxuXG5cdFx0dmFyIGZvbnQgPSAodGhpcy5fb3B0aW9ucy5mb250U3R5bGUgPyB0aGlzLl9vcHRpb25zLmZvbnRTdHlsZSArIFwiIFwiIDogXCJcIikgKyB0aGlzLl9vcHRpb25zLmZvbnRTaXplICsgXCJweCBcIiArIHRoaXMuX29wdGlvbnMuZm9udEZhbWlseTtcblx0XHR0aGlzLl9jb250ZXh0LmZvbnQgPSBmb250O1xuXHRcdHRoaXMuX2JhY2tlbmQuY29tcHV0ZSh0aGlzLl9vcHRpb25zKTtcblx0XHR0aGlzLl9jb250ZXh0LmZvbnQgPSBmb250O1xuXHRcdHRoaXMuX2NvbnRleHQudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcblx0XHR0aGlzLl9jb250ZXh0LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XG5cdFx0dGhpcy5fZGlydHkgPSB0cnVlO1xuXHR9XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFJldHVybnMgY3VycmVudGx5IHNldCBvcHRpb25zXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBDdXJyZW50IG9wdGlvbnMgb2JqZWN0IFxuICovXG5ST1QuRGlzcGxheS5wcm90b3R5cGUuZ2V0T3B0aW9ucyA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5fb3B0aW9ucztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBET00gbm9kZSBvZiB0aGlzIGRpc3BsYXlcbiAqIEByZXR1cm5zIHtub2RlfSBET00gbm9kZVxuICovXG5ST1QuRGlzcGxheS5wcm90b3R5cGUuZ2V0Q29udGFpbmVyID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLl9jb250ZXh0LmNhbnZhcztcbn1cblxuLyoqXG4gKiBDb21wdXRlIHRoZSBtYXhpbXVtIHdpZHRoL2hlaWdodCB0byBmaXQgaW50byBhIHNldCBvZiBnaXZlbiBjb25zdHJhaW50c1xuICogQHBhcmFtIHtpbnR9IGF2YWlsV2lkdGggTWF4aW11bSBhbGxvd2VkIHBpeGVsIHdpZHRoXG4gKiBAcGFyYW0ge2ludH0gYXZhaWxIZWlnaHQgTWF4aW11bSBhbGxvd2VkIHBpeGVsIGhlaWdodFxuICogQHJldHVybnMge2ludFsyXX0gY2VsbFdpZHRoLGNlbGxIZWlnaHRcbiAqL1xuUk9ULkRpc3BsYXkucHJvdG90eXBlLmNvbXB1dGVTaXplID0gZnVuY3Rpb24oYXZhaWxXaWR0aCwgYXZhaWxIZWlnaHQpIHtcblx0cmV0dXJuIHRoaXMuX2JhY2tlbmQuY29tcHV0ZVNpemUoYXZhaWxXaWR0aCwgYXZhaWxIZWlnaHQsIHRoaXMuX29wdGlvbnMpO1xufVxuXG4vKipcbiAqIENvbXB1dGUgdGhlIG1heGltdW0gZm9udCBzaXplIHRvIGZpdCBpbnRvIGEgc2V0IG9mIGdpdmVuIGNvbnN0cmFpbnRzXG4gKiBAcGFyYW0ge2ludH0gYXZhaWxXaWR0aCBNYXhpbXVtIGFsbG93ZWQgcGl4ZWwgd2lkdGhcbiAqIEBwYXJhbSB7aW50fSBhdmFpbEhlaWdodCBNYXhpbXVtIGFsbG93ZWQgcGl4ZWwgaGVpZ2h0XG4gKiBAcmV0dXJucyB7aW50fSBmb250U2l6ZVxuICovXG5ST1QuRGlzcGxheS5wcm90b3R5cGUuY29tcHV0ZUZvbnRTaXplID0gZnVuY3Rpb24oYXZhaWxXaWR0aCwgYXZhaWxIZWlnaHQpIHtcblx0cmV0dXJuIHRoaXMuX2JhY2tlbmQuY29tcHV0ZUZvbnRTaXplKGF2YWlsV2lkdGgsIGF2YWlsSGVpZ2h0LCB0aGlzLl9vcHRpb25zKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgRE9NIGV2ZW50IChtb3VzZSBvciB0b3VjaCkgdG8gbWFwIGNvb3JkaW5hdGVzLiBVc2VzIGZpcnN0IHRvdWNoIGZvciBtdWx0aS10b3VjaC5cbiAqIEBwYXJhbSB7RXZlbnR9IGUgZXZlbnRcbiAqIEByZXR1cm5zIHtpbnRbMl19IC0xIGZvciB2YWx1ZXMgb3V0c2lkZSBvZiB0aGUgY2FudmFzXG4gKi9cblJPVC5EaXNwbGF5LnByb3RvdHlwZS5ldmVudFRvUG9zaXRpb24gPSBmdW5jdGlvbihlKSB7XG5cdGlmIChlLnRvdWNoZXMpIHtcblx0XHR2YXIgeCA9IGUudG91Y2hlc1swXS5jbGllbnRYO1xuXHRcdHZhciB5ID0gZS50b3VjaGVzWzBdLmNsaWVudFk7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIHggPSBlLmNsaWVudFg7XG5cdFx0dmFyIHkgPSBlLmNsaWVudFk7XG5cdH1cblxuXHR2YXIgcmVjdCA9IHRoaXMuX2NvbnRleHQuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHR4IC09IHJlY3QubGVmdDtcblx0eSAtPSByZWN0LnRvcDtcblx0XG5cdGlmICh4IDwgMCB8fCB5IDwgMCB8fCB4ID49IHRoaXMuX2NvbnRleHQuY2FudmFzLndpZHRoIHx8IHkgPj0gdGhpcy5fY29udGV4dC5jYW52YXMuaGVpZ2h0KSB7IHJldHVybiBbLTEsIC0xXTsgfVxuXG5cdHJldHVybiB0aGlzLl9iYWNrZW5kLmV2ZW50VG9Qb3NpdGlvbih4LCB5KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge2ludH0geFxuICogQHBhcmFtIHtpbnR9IHlcbiAqIEBwYXJhbSB7c3RyaW5nIHx8IHN0cmluZ1tdfSBjaCBPbmUgb3IgbW9yZSBjaGFycyAod2lsbCBiZSBvdmVybGFwcGluZyB0aGVtc2VsdmVzKVxuICogQHBhcmFtIHtzdHJpbmd9IFtmZ10gZm9yZWdyb3VuZCBjb2xvclxuICogQHBhcmFtIHtzdHJpbmd9IFtiZ10gYmFja2dyb3VuZCBjb2xvclxuICovXG5ST1QuRGlzcGxheS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHgsIHksIGNoLCBmZywgYmcpIHtcblx0aWYgKCFmZykgeyBmZyA9IHRoaXMuX29wdGlvbnMuZmc7IH1cblx0aWYgKCFiZykgeyBiZyA9IHRoaXMuX29wdGlvbnMuYmc7IH1cblx0dGhpcy5fZGF0YVt4K1wiLFwiK3ldID0gW3gsIHksIGNoLCBmZywgYmddO1xuXHRcblx0aWYgKHRoaXMuX2RpcnR5ID09PSB0cnVlKSB7IHJldHVybjsgfSAvKiB3aWxsIGFscmVhZHkgcmVkcmF3IGV2ZXJ5dGhpbmcgKi9cblx0aWYgKCF0aGlzLl9kaXJ0eSkgeyB0aGlzLl9kaXJ0eSA9IHt9OyB9IC8qIGZpcnN0ISAqL1xuXHR0aGlzLl9kaXJ0eVt4K1wiLFwiK3ldID0gdHJ1ZTtcbn1cblxuLyoqXG4gKiBEcmF3cyBhIHRleHQgYXQgZ2l2ZW4gcG9zaXRpb24uIE9wdGlvbmFsbHkgd3JhcHMgYXQgYSBtYXhpbXVtIGxlbmd0aC4gQ3VycmVudGx5IGRvZXMgbm90IHdvcmsgd2l0aCBoZXggbGF5b3V0LlxuICogQHBhcmFtIHtpbnR9IHhcbiAqIEBwYXJhbSB7aW50fSB5XG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBNYXkgY29udGFpbiBjb2xvci9iYWNrZ3JvdW5kIGZvcm1hdCBzcGVjaWZpZXJzLCAlY3tuYW1lfS8lYntuYW1lfSwgYm90aCBvcHRpb25hbC4gJWN7fS8lYnt9IHJlc2V0cyB0byBkZWZhdWx0LlxuICogQHBhcmFtIHtpbnR9IFttYXhXaWR0aF0gd3JhcCBhdCB3aGF0IHdpZHRoP1xuICogQHJldHVybnMge2ludH0gbGluZXMgZHJhd25cbiAqL1xuUk9ULkRpc3BsYXkucHJvdG90eXBlLmRyYXdUZXh0ID0gZnVuY3Rpb24oeCwgeSwgdGV4dCwgbWF4V2lkdGgpIHtcblx0dmFyIGZnID0gbnVsbDtcblx0dmFyIGJnID0gbnVsbDtcblx0dmFyIGN4ID0geDtcblx0dmFyIGN5ID0geTtcblx0dmFyIGxpbmVzID0gMTtcblx0aWYgKCFtYXhXaWR0aCkgeyBtYXhXaWR0aCA9IHRoaXMuX29wdGlvbnMud2lkdGgteDsgfVxuXG5cdHZhciB0b2tlbnMgPSBST1QuVGV4dC50b2tlbml6ZSh0ZXh0LCBtYXhXaWR0aCk7XG5cblx0d2hpbGUgKHRva2Vucy5sZW5ndGgpIHsgLyogaW50ZXJwcmV0IHRva2VuaXplZCBvcGNvZGUgc3RyZWFtICovXG5cdFx0dmFyIHRva2VuID0gdG9rZW5zLnNoaWZ0KCk7XG5cdFx0c3dpdGNoICh0b2tlbi50eXBlKSB7XG5cdFx0XHRjYXNlIFJPVC5UZXh0LlRZUEVfVEVYVDpcblx0XHRcdFx0Zm9yICh2YXIgaT0wO2k8dG9rZW4udmFsdWUubGVuZ3RoO2krKykge1xuXHRcdFx0XHRcdHRoaXMuZHJhdyhjeCsrLCBjeSwgdG9rZW4udmFsdWUuY2hhckF0KGkpLCBmZywgYmcpO1xuXHRcdFx0XHR9XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBST1QuVGV4dC5UWVBFX0ZHOlxuXHRcdFx0XHRmZyA9IHRva2VuLnZhbHVlIHx8IG51bGw7XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBST1QuVGV4dC5UWVBFX0JHOlxuXHRcdFx0XHRiZyA9IHRva2VuLnZhbHVlIHx8IG51bGw7XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBST1QuVGV4dC5UWVBFX05FV0xJTkU6XG5cdFx0XHRcdGN4ID0geDtcblx0XHRcdFx0Y3krKztcblx0XHRcdFx0bGluZXMrK1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGxpbmVzO1xufVxuXG4vKipcbiAqIFRpbWVyIHRpY2s6IHVwZGF0ZSBkaXJ0eSBwYXJ0c1xuICovXG5ST1QuRGlzcGxheS5wcm90b3R5cGUuX3RpY2sgPSBmdW5jdGlvbigpIHtcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX3RpY2spO1xuXG5cdGlmICghdGhpcy5fZGlydHkpIHsgcmV0dXJuOyB9XG5cblx0aWYgKHRoaXMuX2RpcnR5ID09PSB0cnVlKSB7IC8qIGRyYXcgYWxsICovXG5cdFx0dGhpcy5fY29udGV4dC5maWxsU3R5bGUgPSB0aGlzLl9vcHRpb25zLmJnO1xuXHRcdHRoaXMuX2NvbnRleHQuZmlsbFJlY3QoMCwgMCwgdGhpcy5fY29udGV4dC5jYW52YXMud2lkdGgsIHRoaXMuX2NvbnRleHQuY2FudmFzLmhlaWdodCk7XG5cblx0XHRmb3IgKHZhciBpZCBpbiB0aGlzLl9kYXRhKSB7IC8qIHJlZHJhdyBjYWNoZWQgZGF0YSAqL1xuXHRcdFx0dGhpcy5fZHJhdyhpZCwgZmFsc2UpO1xuXHRcdH1cblxuXHR9IGVsc2UgeyAvKiBkcmF3IG9ubHkgZGlydHkgKi9cblx0XHRmb3IgKHZhciBrZXkgaW4gdGhpcy5fZGlydHkpIHtcblx0XHRcdHRoaXMuX2RyYXcoa2V5LCB0cnVlKTtcblx0XHR9XG5cdH1cblxuXHR0aGlzLl9kaXJ0eSA9IGZhbHNlO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgV2hhdCB0byBkcmF3XG4gKiBAcGFyYW0ge2Jvb2x9IGNsZWFyQmVmb3JlIElzIGl0IG5lY2Vzc2FyeSB0byBjbGVhbiBiZWZvcmU/XG4gKi9cblJPVC5EaXNwbGF5LnByb3RvdHlwZS5fZHJhdyA9IGZ1bmN0aW9uKGtleSwgY2xlYXJCZWZvcmUpIHtcblx0dmFyIGRhdGEgPSB0aGlzLl9kYXRhW2tleV07XG5cdGlmIChkYXRhWzRdICE9IHRoaXMuX29wdGlvbnMuYmcpIHsgY2xlYXJCZWZvcmUgPSB0cnVlOyB9XG5cblx0dGhpcy5fYmFja2VuZC5kcmF3KGRhdGEsIGNsZWFyQmVmb3JlKTtcbn1cbi8qKlxuICogQGNsYXNzIEFic3RyYWN0IGRpc3BsYXkgYmFja2VuZCBtb2R1bGVcbiAqIEBwcml2YXRlXG4gKi9cblJPVC5EaXNwbGF5LkJhY2tlbmQgPSBmdW5jdGlvbihjb250ZXh0KSB7XG5cdHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xufVxuXG5ST1QuRGlzcGxheS5CYWNrZW5kLnByb3RvdHlwZS5jb21wdXRlID0gZnVuY3Rpb24ob3B0aW9ucykge1xufVxuXG5ST1QuRGlzcGxheS5CYWNrZW5kLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oZGF0YSwgY2xlYXJCZWZvcmUpIHtcbn1cblxuUk9ULkRpc3BsYXkuQmFja2VuZC5wcm90b3R5cGUuY29tcHV0ZVNpemUgPSBmdW5jdGlvbihhdmFpbFdpZHRoLCBhdmFpbEhlaWdodCkge1xufVxuXG5ST1QuRGlzcGxheS5CYWNrZW5kLnByb3RvdHlwZS5jb21wdXRlRm9udFNpemUgPSBmdW5jdGlvbihhdmFpbFdpZHRoLCBhdmFpbEhlaWdodCkge1xufVxuXG5ST1QuRGlzcGxheS5CYWNrZW5kLnByb3RvdHlwZS5ldmVudFRvUG9zaXRpb24gPSBmdW5jdGlvbih4LCB5KSB7XG59XG4vKipcbiAqIEBjbGFzcyBSZWN0YW5ndWxhciBiYWNrZW5kXG4gKiBAcHJpdmF0ZVxuICovXG5ST1QuRGlzcGxheS5SZWN0ID0gZnVuY3Rpb24oY29udGV4dCkge1xuXHRST1QuRGlzcGxheS5CYWNrZW5kLmNhbGwodGhpcywgY29udGV4dCk7XG5cdFxuXHR0aGlzLl9zcGFjaW5nWCA9IDA7XG5cdHRoaXMuX3NwYWNpbmdZID0gMDtcblx0dGhpcy5fY2FudmFzQ2FjaGUgPSB7fTtcblx0dGhpcy5fb3B0aW9ucyA9IHt9O1xufVxuUk9ULkRpc3BsYXkuUmVjdC5leHRlbmQoUk9ULkRpc3BsYXkuQmFja2VuZCk7XG5cblJPVC5EaXNwbGF5LlJlY3QuY2FjaGUgPSBmYWxzZTtcblxuUk9ULkRpc3BsYXkuUmVjdC5wcm90b3R5cGUuY29tcHV0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0dGhpcy5fY2FudmFzQ2FjaGUgPSB7fTtcblx0dGhpcy5fb3B0aW9ucyA9IG9wdGlvbnM7XG5cblx0dmFyIGNoYXJXaWR0aCA9IE1hdGguY2VpbCh0aGlzLl9jb250ZXh0Lm1lYXN1cmVUZXh0KFwiV1wiKS53aWR0aCk7XG5cdHRoaXMuX3NwYWNpbmdYID0gTWF0aC5jZWlsKG9wdGlvbnMuc3BhY2luZyAqIGNoYXJXaWR0aCk7XG5cdHRoaXMuX3NwYWNpbmdZID0gTWF0aC5jZWlsKG9wdGlvbnMuc3BhY2luZyAqIG9wdGlvbnMuZm9udFNpemUpO1xuXHR0aGlzLl9jb250ZXh0LmNhbnZhcy53aWR0aCA9IG9wdGlvbnMud2lkdGggKiB0aGlzLl9zcGFjaW5nWDtcblx0dGhpcy5fY29udGV4dC5jYW52YXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgKiB0aGlzLl9zcGFjaW5nWTtcbn1cblxuUk9ULkRpc3BsYXkuUmVjdC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGRhdGEsIGNsZWFyQmVmb3JlKSB7XG5cdGlmICh0aGlzLmNvbnN0cnVjdG9yLmNhY2hlKSB7XG5cdFx0dGhpcy5fZHJhd1dpdGhDYWNoZShkYXRhLCBjbGVhckJlZm9yZSk7XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5fZHJhd05vQ2FjaGUoZGF0YSwgY2xlYXJCZWZvcmUpO1xuXHR9XG59XG5cblJPVC5EaXNwbGF5LlJlY3QucHJvdG90eXBlLl9kcmF3V2l0aENhY2hlID0gZnVuY3Rpb24oZGF0YSwgY2xlYXJCZWZvcmUpIHtcblx0dmFyIHggPSBkYXRhWzBdO1xuXHR2YXIgeSA9IGRhdGFbMV07XG5cdHZhciBjaCA9IGRhdGFbMl07XG5cdHZhciBmZyA9IGRhdGFbM107XG5cdHZhciBiZyA9IGRhdGFbNF07XG5cblx0dmFyIGhhc2ggPSBcIlwiK2NoK2ZnK2JnO1xuXHRpZiAoaGFzaCBpbiB0aGlzLl9jYW52YXNDYWNoZSkge1xuXHRcdHZhciBjYW52YXMgPSB0aGlzLl9jYW52YXNDYWNoZVtoYXNoXTtcblx0fSBlbHNlIHtcblx0XHR2YXIgYiA9IHRoaXMuX29wdGlvbnMuYm9yZGVyO1xuXHRcdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHRcdHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHRcdGNhbnZhcy53aWR0aCA9IHRoaXMuX3NwYWNpbmdYO1xuXHRcdGNhbnZhcy5oZWlnaHQgPSB0aGlzLl9zcGFjaW5nWTtcblx0XHRjdHguZmlsbFN0eWxlID0gYmc7XG5cdFx0Y3R4LmZpbGxSZWN0KGIsIGIsIGNhbnZhcy53aWR0aC1iLCBjYW52YXMuaGVpZ2h0LWIpO1xuXHRcdFxuXHRcdGlmIChjaCkge1xuXHRcdFx0Y3R4LmZpbGxTdHlsZSA9IGZnO1xuXHRcdFx0Y3R4LmZvbnQgPSB0aGlzLl9jb250ZXh0LmZvbnQ7XG5cdFx0XHRjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcblx0XHRcdGN0eC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuXG5cdFx0XHR2YXIgY2hhcnMgPSBbXS5jb25jYXQoY2gpO1xuXHRcdFx0Zm9yICh2YXIgaT0wO2k8Y2hhcnMubGVuZ3RoO2krKykge1xuXHRcdFx0XHRjdHguZmlsbFRleHQoY2hhcnNbaV0sIHRoaXMuX3NwYWNpbmdYLzIsIHRoaXMuX3NwYWNpbmdZLzIpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLl9jYW52YXNDYWNoZVtoYXNoXSA9IGNhbnZhcztcblx0fVxuXHRcblx0dGhpcy5fY29udGV4dC5kcmF3SW1hZ2UoY2FudmFzLCB4KnRoaXMuX3NwYWNpbmdYLCB5KnRoaXMuX3NwYWNpbmdZKTtcbn1cblxuUk9ULkRpc3BsYXkuUmVjdC5wcm90b3R5cGUuX2RyYXdOb0NhY2hlID0gZnVuY3Rpb24oZGF0YSwgY2xlYXJCZWZvcmUpIHtcblx0dmFyIHggPSBkYXRhWzBdO1xuXHR2YXIgeSA9IGRhdGFbMV07XG5cdHZhciBjaCA9IGRhdGFbMl07XG5cdHZhciBmZyA9IGRhdGFbM107XG5cdHZhciBiZyA9IGRhdGFbNF07XG5cblx0aWYgKGNsZWFyQmVmb3JlKSB7IFxuXHRcdHZhciBiID0gdGhpcy5fb3B0aW9ucy5ib3JkZXI7XG5cdFx0dGhpcy5fY29udGV4dC5maWxsU3R5bGUgPSBiZztcblx0XHR0aGlzLl9jb250ZXh0LmZpbGxSZWN0KHgqdGhpcy5fc3BhY2luZ1ggKyBiLCB5KnRoaXMuX3NwYWNpbmdZICsgYiwgdGhpcy5fc3BhY2luZ1ggLSBiLCB0aGlzLl9zcGFjaW5nWSAtIGIpO1xuXHR9XG5cdFxuXHRpZiAoIWNoKSB7IHJldHVybjsgfVxuXG5cdHRoaXMuX2NvbnRleHQuZmlsbFN0eWxlID0gZmc7XG5cblx0dmFyIGNoYXJzID0gW10uY29uY2F0KGNoKTtcblx0Zm9yICh2YXIgaT0wO2k8Y2hhcnMubGVuZ3RoO2krKykge1xuXHRcdHRoaXMuX2NvbnRleHQuZmlsbFRleHQoY2hhcnNbaV0sICh4KzAuNSkgKiB0aGlzLl9zcGFjaW5nWCwgKHkrMC41KSAqIHRoaXMuX3NwYWNpbmdZKTtcblx0fVxufVxuXG5ST1QuRGlzcGxheS5SZWN0LnByb3RvdHlwZS5jb21wdXRlU2l6ZSA9IGZ1bmN0aW9uKGF2YWlsV2lkdGgsIGF2YWlsSGVpZ2h0KSB7XG5cdHZhciB3aWR0aCA9IE1hdGguZmxvb3IoYXZhaWxXaWR0aCAvIHRoaXMuX3NwYWNpbmdYKTtcblx0dmFyIGhlaWdodCA9IE1hdGguZmxvb3IoYXZhaWxIZWlnaHQgLyB0aGlzLl9zcGFjaW5nWSk7XG5cdHJldHVybiBbd2lkdGgsIGhlaWdodF07XG59XG5cblJPVC5EaXNwbGF5LlJlY3QucHJvdG90eXBlLmNvbXB1dGVGb250U2l6ZSA9IGZ1bmN0aW9uKGF2YWlsV2lkdGgsIGF2YWlsSGVpZ2h0KSB7XG5cdHZhciBib3hXaWR0aCA9IE1hdGguZmxvb3IoYXZhaWxXaWR0aCAvIHRoaXMuX29wdGlvbnMud2lkdGgpO1xuXHR2YXIgYm94SGVpZ2h0ID0gTWF0aC5mbG9vcihhdmFpbEhlaWdodCAvIHRoaXMuX29wdGlvbnMuaGVpZ2h0KTtcblxuXHQvKiBjb21wdXRlIGNoYXIgcmF0aW8gKi9cblx0dmFyIG9sZEZvbnQgPSB0aGlzLl9jb250ZXh0LmZvbnQ7XG5cdHRoaXMuX2NvbnRleHQuZm9udCA9IFwiMTAwcHggXCIgKyB0aGlzLl9vcHRpb25zLmZvbnRGYW1pbHk7XG5cdHZhciB3aWR0aCA9IE1hdGguY2VpbCh0aGlzLl9jb250ZXh0Lm1lYXN1cmVUZXh0KFwiV1wiKS53aWR0aCk7XG5cdHRoaXMuX2NvbnRleHQuZm9udCA9IG9sZEZvbnQ7XG5cdHZhciByYXRpbyA9IHdpZHRoIC8gMTAwO1xuXHRcdFxuXHR2YXIgd2lkdGhGcmFjdGlvbiA9IHJhdGlvICogYm94SGVpZ2h0IC8gYm94V2lkdGg7XG5cdGlmICh3aWR0aEZyYWN0aW9uID4gMSkgeyAvKiB0b28gd2lkZSB3aXRoIGN1cnJlbnQgYXNwZWN0IHJhdGlvICovXG5cdFx0Ym94SGVpZ2h0ID0gTWF0aC5mbG9vcihib3hIZWlnaHQgLyB3aWR0aEZyYWN0aW9uKTtcblx0fVxuXHRyZXR1cm4gTWF0aC5mbG9vcihib3hIZWlnaHQgLyB0aGlzLl9vcHRpb25zLnNwYWNpbmcpO1xufVxuXG5ST1QuRGlzcGxheS5SZWN0LnByb3RvdHlwZS5ldmVudFRvUG9zaXRpb24gPSBmdW5jdGlvbih4LCB5KSB7XG5cdHJldHVybiBbTWF0aC5mbG9vcih4L3RoaXMuX3NwYWNpbmdYKSwgTWF0aC5mbG9vcih5L3RoaXMuX3NwYWNpbmdZKV07XG59XG4vKipcbiAqIEBjbGFzcyBIZXhhZ29uYWwgYmFja2VuZFxuICogQHByaXZhdGVcbiAqL1xuUk9ULkRpc3BsYXkuSGV4ID0gZnVuY3Rpb24oY29udGV4dCkge1xuXHRST1QuRGlzcGxheS5CYWNrZW5kLmNhbGwodGhpcywgY29udGV4dCk7XG5cblx0dGhpcy5fc3BhY2luZ1ggPSAwO1xuXHR0aGlzLl9zcGFjaW5nWSA9IDA7XG5cdHRoaXMuX2hleFNpemUgPSAwO1xuXHR0aGlzLl9vcHRpb25zID0ge307XG59XG5ST1QuRGlzcGxheS5IZXguZXh0ZW5kKFJPVC5EaXNwbGF5LkJhY2tlbmQpO1xuXG5ST1QuRGlzcGxheS5IZXgucHJvdG90eXBlLmNvbXB1dGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cdHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xuXG5cdHZhciBjaGFyV2lkdGggPSBNYXRoLmNlaWwodGhpcy5fY29udGV4dC5tZWFzdXJlVGV4dChcIldcIikud2lkdGgpO1xuXHR0aGlzLl9oZXhTaXplID0gTWF0aC5mbG9vcihvcHRpb25zLnNwYWNpbmcgKiAob3B0aW9ucy5mb250U2l6ZSArIGNoYXJXaWR0aC9NYXRoLnNxcnQoMykpIC8gMik7XG5cdHRoaXMuX3NwYWNpbmdYID0gdGhpcy5faGV4U2l6ZSAqIE1hdGguc3FydCgzKSAvIDI7XG5cdHRoaXMuX3NwYWNpbmdZID0gdGhpcy5faGV4U2l6ZSAqIDEuNTtcblx0dGhpcy5fY29udGV4dC5jYW52YXMud2lkdGggPSBNYXRoLmNlaWwoIChvcHRpb25zLndpZHRoICsgMSkgKiB0aGlzLl9zcGFjaW5nWCApO1xuXHR0aGlzLl9jb250ZXh0LmNhbnZhcy5oZWlnaHQgPSBNYXRoLmNlaWwoIChvcHRpb25zLmhlaWdodCAtIDEpICogdGhpcy5fc3BhY2luZ1kgKyAyKnRoaXMuX2hleFNpemUgKTtcbn1cblxuUk9ULkRpc3BsYXkuSGV4LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oZGF0YSwgY2xlYXJCZWZvcmUpIHtcblx0dmFyIHggPSBkYXRhWzBdO1xuXHR2YXIgeSA9IGRhdGFbMV07XG5cdHZhciBjaCA9IGRhdGFbMl07XG5cdHZhciBmZyA9IGRhdGFbM107XG5cdHZhciBiZyA9IGRhdGFbNF07XG5cblx0dmFyIGN4ID0gKHgrMSkgKiB0aGlzLl9zcGFjaW5nWDtcblx0dmFyIGN5ID0geSAqIHRoaXMuX3NwYWNpbmdZICsgdGhpcy5faGV4U2l6ZTtcblxuXHRpZiAoY2xlYXJCZWZvcmUpIHsgXG5cdFx0dGhpcy5fY29udGV4dC5maWxsU3R5bGUgPSBiZztcblx0XHR0aGlzLl9maWxsKGN4LCBjeSk7XG5cdH1cblx0XG5cdGlmICghY2gpIHsgcmV0dXJuOyB9XG5cblx0dGhpcy5fY29udGV4dC5maWxsU3R5bGUgPSBmZztcblxuXHR2YXIgY2hhcnMgPSBbXS5jb25jYXQoY2gpO1xuXHRmb3IgKHZhciBpPTA7aTxjaGFycy5sZW5ndGg7aSsrKSB7XG5cdFx0dGhpcy5fY29udGV4dC5maWxsVGV4dChjaGFyc1tpXSwgY3gsIGN5KTtcblx0fVxufVxuXG5cblJPVC5EaXNwbGF5LkhleC5wcm90b3R5cGUuY29tcHV0ZVNpemUgPSBmdW5jdGlvbihhdmFpbFdpZHRoLCBhdmFpbEhlaWdodCkge1xuXHR2YXIgd2lkdGggPSBNYXRoLmZsb29yKGF2YWlsV2lkdGggLyB0aGlzLl9zcGFjaW5nWCkgLSAxO1xuXHR2YXIgaGVpZ2h0ID0gTWF0aC5mbG9vcigoYXZhaWxIZWlnaHQgLSAyKnRoaXMuX2hleFNpemUpIC8gdGhpcy5fc3BhY2luZ1kgKyAxKTtcblx0cmV0dXJuIFt3aWR0aCwgaGVpZ2h0XTtcbn1cblxuUk9ULkRpc3BsYXkuSGV4LnByb3RvdHlwZS5jb21wdXRlRm9udFNpemUgPSBmdW5jdGlvbihhdmFpbFdpZHRoLCBhdmFpbEhlaWdodCkge1xuXHR2YXIgaGV4U2l6ZVdpZHRoID0gMiphdmFpbFdpZHRoIC8gKCh0aGlzLl9vcHRpb25zLndpZHRoKzEpICogTWF0aC5zcXJ0KDMpKSAtIDE7XG5cdHZhciBoZXhTaXplSGVpZ2h0ID0gYXZhaWxIZWlnaHQgLyAoMiArIDEuNSoodGhpcy5fb3B0aW9ucy5oZWlnaHQtMSkpO1xuXHR2YXIgaGV4U2l6ZSA9IE1hdGgubWluKGhleFNpemVXaWR0aCwgaGV4U2l6ZUhlaWdodCk7XG5cblx0LyogY29tcHV0ZSBjaGFyIHJhdGlvICovXG5cdHZhciBvbGRGb250ID0gdGhpcy5fY29udGV4dC5mb250O1xuXHR0aGlzLl9jb250ZXh0LmZvbnQgPSBcIjEwMHB4IFwiICsgdGhpcy5fb3B0aW9ucy5mb250RmFtaWx5O1xuXHR2YXIgd2lkdGggPSBNYXRoLmNlaWwodGhpcy5fY29udGV4dC5tZWFzdXJlVGV4dChcIldcIikud2lkdGgpO1xuXHR0aGlzLl9jb250ZXh0LmZvbnQgPSBvbGRGb250O1xuXHR2YXIgcmF0aW8gPSB3aWR0aCAvIDEwMDtcblxuXHRoZXhTaXplID0gTWF0aC5mbG9vcihoZXhTaXplKSsxOyAvKiBjbG9zZXN0IGxhcmdlciBoZXhTaXplICovXG5cblx0dmFyIGZvbnRTaXplID0gMipoZXhTaXplIC8gKHRoaXMuX29wdGlvbnMuc3BhY2luZyAqICgxICsgcmF0aW8gLyBNYXRoLnNxcnQoMykpKTtcblxuXHQvKiBjbG9zZXN0IHNtYWxsZXIgZm9udFNpemUgKi9cblx0cmV0dXJuIE1hdGguY2VpbChmb250U2l6ZSktMTtcbn1cblxuUk9ULkRpc3BsYXkuSGV4LnByb3RvdHlwZS5ldmVudFRvUG9zaXRpb24gPSBmdW5jdGlvbih4LCB5KSB7XG5cdHZhciBoZWlnaHQgPSB0aGlzLl9jb250ZXh0LmNhbnZhcy5oZWlnaHQgLyB0aGlzLl9vcHRpb25zLmhlaWdodDtcblx0eSA9IE1hdGguZmxvb3IoeS9oZWlnaHQpO1xuXHRcblx0aWYgKHkubW9kKDIpKSB7IC8qIG9kZCByb3cgKi9cblx0XHR4IC09IHRoaXMuX3NwYWNpbmdYO1xuXHRcdHggPSAxICsgMipNYXRoLmZsb29yKHgvKDIqdGhpcy5fc3BhY2luZ1gpKTtcblx0fSBlbHNlIHtcblx0XHR4ID0gMipNYXRoLmZsb29yKHgvKDIqdGhpcy5fc3BhY2luZ1gpKTtcblx0fVxuXHRcblx0cmV0dXJuIFt4LCB5XTtcbn1cblxuUk9ULkRpc3BsYXkuSGV4LnByb3RvdHlwZS5fZmlsbCA9IGZ1bmN0aW9uKGN4LCBjeSkge1xuXHR2YXIgYSA9IHRoaXMuX2hleFNpemU7XG5cdHZhciBiID0gdGhpcy5fb3B0aW9ucy5ib3JkZXI7XG5cdFxuXHR0aGlzLl9jb250ZXh0LmJlZ2luUGF0aCgpO1xuXHR0aGlzLl9jb250ZXh0Lm1vdmVUbyhjeCwgY3ktYStiKTtcblx0dGhpcy5fY29udGV4dC5saW5lVG8oY3ggKyB0aGlzLl9zcGFjaW5nWCAtIGIsIGN5LWEvMitiKTtcblx0dGhpcy5fY29udGV4dC5saW5lVG8oY3ggKyB0aGlzLl9zcGFjaW5nWCAtIGIsIGN5K2EvMi1iKTtcblx0dGhpcy5fY29udGV4dC5saW5lVG8oY3gsIGN5K2EtYik7XG5cdHRoaXMuX2NvbnRleHQubGluZVRvKGN4IC0gdGhpcy5fc3BhY2luZ1ggKyBiLCBjeSthLzItYik7XG5cdHRoaXMuX2NvbnRleHQubGluZVRvKGN4IC0gdGhpcy5fc3BhY2luZ1ggKyBiLCBjeS1hLzIrYik7XG5cdHRoaXMuX2NvbnRleHQubGluZVRvKGN4LCBjeS1hK2IpO1xuXHR0aGlzLl9jb250ZXh0LmZpbGwoKTtcbn1cbi8qKlxuICogQGNsYXNzIFRpbGUgYmFja2VuZFxuICogQHByaXZhdGVcbiAqL1xuUk9ULkRpc3BsYXkuVGlsZSA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcblx0Uk9ULkRpc3BsYXkuUmVjdC5jYWxsKHRoaXMsIGNvbnRleHQpO1xuXHRcblx0dGhpcy5fb3B0aW9ucyA9IHt9O1xufVxuUk9ULkRpc3BsYXkuVGlsZS5leHRlbmQoUk9ULkRpc3BsYXkuUmVjdCk7XG5cblJPVC5EaXNwbGF5LlRpbGUucHJvdG90eXBlLmNvbXB1dGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cdHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xuXHR0aGlzLl9jb250ZXh0LmNhbnZhcy53aWR0aCA9IG9wdGlvbnMud2lkdGggKiBvcHRpb25zLnRpbGVXaWR0aDtcblx0dGhpcy5fY29udGV4dC5jYW52YXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgKiBvcHRpb25zLnRpbGVIZWlnaHQ7XG59XG5cblJPVC5EaXNwbGF5LlRpbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihkYXRhLCBjbGVhckJlZm9yZSkge1xuXHR2YXIgeCA9IGRhdGFbMF07XG5cdHZhciB5ID0gZGF0YVsxXTtcblx0dmFyIGNoID0gZGF0YVsyXTtcblx0dmFyIGZnID0gZGF0YVszXTtcblx0dmFyIGJnID0gZGF0YVs0XTtcblxuXHR2YXIgdGlsZVdpZHRoID0gdGhpcy5fb3B0aW9ucy50aWxlV2lkdGg7XG5cdHZhciB0aWxlSGVpZ2h0ID0gdGhpcy5fb3B0aW9ucy50aWxlSGVpZ2h0O1xuXG5cdGlmIChjbGVhckJlZm9yZSkge1xuXHRcdHZhciBiID0gdGhpcy5fb3B0aW9ucy5ib3JkZXI7XG5cdFx0dGhpcy5fY29udGV4dC5maWxsU3R5bGUgPSBiZztcblx0XHR0aGlzLl9jb250ZXh0LmZpbGxSZWN0KHgqdGlsZVdpZHRoLCB5KnRpbGVIZWlnaHQsIHRpbGVXaWR0aCwgdGlsZUhlaWdodCk7XG5cdH1cblxuXHRpZiAoIWNoKSB7IHJldHVybjsgfVxuXG5cdHZhciBjaGFycyA9IFtdLmNvbmNhdChjaCk7XG5cdGZvciAodmFyIGk9MDtpPGNoYXJzLmxlbmd0aDtpKyspIHtcblx0XHR2YXIgdGlsZSA9IHRoaXMuX29wdGlvbnMudGlsZU1hcFtjaGFyc1tpXV07XG5cdFx0aWYgKCF0aWxlKSB7IHRocm93IG5ldyBFcnJvcihcIkNoYXIgJ1wiICsgY2hhcnNbaV0gKyBcIicgbm90IGZvdW5kIGluIHRpbGVNYXBcIik7IH1cblx0XHRcblx0XHR0aGlzLl9jb250ZXh0LmRyYXdJbWFnZShcblx0XHRcdHRoaXMuX29wdGlvbnMudGlsZVNldCxcblx0XHRcdHRpbGVbMF0sIHRpbGVbMV0sIHRpbGVXaWR0aCwgdGlsZUhlaWdodCxcblx0XHRcdHgqdGlsZVdpZHRoLCB5KnRpbGVIZWlnaHQsIHRpbGVXaWR0aCwgdGlsZUhlaWdodFxuXHRcdCk7XG5cdH1cbn1cblxuUk9ULkRpc3BsYXkuVGlsZS5wcm90b3R5cGUuY29tcHV0ZVNpemUgPSBmdW5jdGlvbihhdmFpbFdpZHRoLCBhdmFpbEhlaWdodCkge1xuXHR2YXIgd2lkdGggPSBNYXRoLmZsb29yKGF2YWlsV2lkdGggLyB0aGlzLl9vcHRpb25zLnRpbGVXaWR0aCk7XG5cdHZhciBoZWlnaHQgPSBNYXRoLmZsb29yKGF2YWlsSGVpZ2h0IC8gdGhpcy5fb3B0aW9ucy50aWxlSGVpZ2h0KTtcblx0cmV0dXJuIFt3aWR0aCwgaGVpZ2h0XTtcbn1cblxuUk9ULkRpc3BsYXkuVGlsZS5wcm90b3R5cGUuY29tcHV0ZUZvbnRTaXplID0gZnVuY3Rpb24oYXZhaWxXaWR0aCwgYXZhaWxIZWlnaHQpIHtcblx0dmFyIHdpZHRoID0gTWF0aC5mbG9vcihhdmFpbFdpZHRoIC8gdGhpcy5fb3B0aW9ucy53aWR0aCk7XG5cdHZhciBoZWlnaHQgPSBNYXRoLmZsb29yKGF2YWlsSGVpZ2h0IC8gdGhpcy5fb3B0aW9ucy5oZWlnaHQpO1xuXHRyZXR1cm4gW3dpZHRoLCBoZWlnaHRdO1xufVxuLyoqXG4gKiBAbmFtZXNwYWNlXG4gKiBUaGlzIGNvZGUgaXMgYW4gaW1wbGVtZW50YXRpb24gb2YgQWxlYSBhbGdvcml0aG07IChDKSAyMDEwIEpvaGFubmVzIEJhYWfDuGUuXG4gKiBBbGVhIGlzIGxpY2Vuc2VkIGFjY29yZGluZyB0byB0aGUgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NSVRfTGljZW5zZS5cbiAqL1xuUk9ULlJORyA9IHtcblx0LyoqXG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9IFxuXHQgKi9cblx0Z2V0U2VlZDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3NlZWQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBzZWVkIFNlZWQgdGhlIG51bWJlciBnZW5lcmF0b3Jcblx0ICovXG5cdHNldFNlZWQ6IGZ1bmN0aW9uKHNlZWQpIHtcblx0XHRzZWVkID0gKHNlZWQgPCAxID8gMS9zZWVkIDogc2VlZCk7XG5cblx0XHR0aGlzLl9zZWVkID0gc2VlZDtcblx0XHR0aGlzLl9zMCA9IChzZWVkID4+PiAwKSAqIHRoaXMuX2ZyYWM7XG5cblx0XHRzZWVkID0gKHNlZWQqNjkwNjkgKyAxKSA+Pj4gMDtcblx0XHR0aGlzLl9zMSA9IHNlZWQgKiB0aGlzLl9mcmFjO1xuXG5cdFx0c2VlZCA9IChzZWVkKjY5MDY5ICsgMSkgPj4+IDA7XG5cdFx0dGhpcy5fczIgPSBzZWVkICogdGhpcy5fZnJhYztcblxuXHRcdHRoaXMuX2MgPSAxO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7ZmxvYXR9IFBzZXVkb3JhbmRvbSB2YWx1ZSBbMCwxKSwgdW5pZm9ybWx5IGRpc3RyaWJ1dGVkXG5cdCAqL1xuXHRnZXRVbmlmb3JtOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdCA9IDIwOTE2MzkgKiB0aGlzLl9zMCArIHRoaXMuX2MgKiB0aGlzLl9mcmFjO1xuXHRcdHRoaXMuX3MwID0gdGhpcy5fczE7XG5cdFx0dGhpcy5fczEgPSB0aGlzLl9zMjtcblx0XHR0aGlzLl9jID0gdCB8IDA7XG5cdFx0dGhpcy5fczIgPSB0IC0gdGhpcy5fYztcblx0XHRyZXR1cm4gdGhpcy5fczI7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7aW50fSBsb3dlckJvdW5kIFRoZSBsb3dlciBlbmQgb2YgdGhlIHJhbmdlIHRvIHJldHVybiBhIHZhbHVlIGZyb20sIGluY2x1c2l2ZVxuXHQgKiBAcGFyYW0ge2ludH0gdXBwZXJCb3VuZCBUaGUgdXBwZXIgZW5kIG9mIHRoZSByYW5nZSB0byByZXR1cm4gYSB2YWx1ZSBmcm9tLCBpbmNsdXNpdmVcblx0ICogQHJldHVybnMge2ludH0gUHNldWRvcmFuZG9tIHZhbHVlIFtsb3dlckJvdW5kLCB1cHBlckJvdW5kXSwgdXNpbmcgUk9ULlJORy5nZXRVbmlmb3JtKCkgdG8gZGlzdHJpYnV0ZSB0aGUgdmFsdWVcblx0ICovXG5cdGdldFVuaWZvcm1JbnQ6IGZ1bmN0aW9uKGxvd2VyQm91bmQsIHVwcGVyQm91bmQpIHtcblx0XHR2YXIgbWF4ID0gTWF0aC5tYXgobG93ZXJCb3VuZCwgdXBwZXJCb3VuZCk7XG5cdFx0dmFyIG1pbiA9IE1hdGgubWluKGxvd2VyQm91bmQsIHVwcGVyQm91bmQpO1xuXHRcdHJldHVybiBNYXRoLmZsb29yKHRoaXMuZ2V0VW5pZm9ybSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcblx0fSxcblxuXHQvKipcblx0ICogQHBhcmFtIHtmbG9hdH0gW21lYW49MF0gTWVhbiB2YWx1ZVxuXHQgKiBAcGFyYW0ge2Zsb2F0fSBbc3RkZGV2PTFdIFN0YW5kYXJkIGRldmlhdGlvbi4gfjk1JSBvZiB0aGUgYWJzb2x1dGUgdmFsdWVzIHdpbGwgYmUgbG93ZXIgdGhhbiAyKnN0ZGRldi5cblx0ICogQHJldHVybnMge2Zsb2F0fSBBIG5vcm1hbGx5IGRpc3RyaWJ1dGVkIHBzZXVkb3JhbmRvbSB2YWx1ZVxuXHQgKi9cblx0Z2V0Tm9ybWFsOiBmdW5jdGlvbihtZWFuLCBzdGRkZXYpIHtcblx0XHRkbyB7XG5cdFx0XHR2YXIgdSA9IDIqdGhpcy5nZXRVbmlmb3JtKCktMTtcblx0XHRcdHZhciB2ID0gMip0aGlzLmdldFVuaWZvcm0oKS0xO1xuXHRcdFx0dmFyIHIgPSB1KnUgKyB2KnY7XG5cdFx0fSB3aGlsZSAociA+IDEgfHwgciA9PSAwKTtcblxuXHRcdHZhciBnYXVzcyA9IHUgKiBNYXRoLnNxcnQoLTIqTWF0aC5sb2cocikvcik7XG5cdFx0cmV0dXJuIChtZWFuIHx8IDApICsgZ2F1c3MqKHN0ZGRldiB8fCAxKTtcblx0fSxcblxuXHQvKipcblx0ICogQHJldHVybnMge2ludH0gUHNldWRvcmFuZG9tIHZhbHVlIFsxLDEwMF0gaW5jbHVzaXZlLCB1bmlmb3JtbHkgZGlzdHJpYnV0ZWRcblx0ICovXG5cdGdldFBlcmNlbnRhZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAxICsgTWF0aC5mbG9vcih0aGlzLmdldFVuaWZvcm0oKSoxMDApO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIGtleT13aGF0ZXZlciwgdmFsdWU9d2VpZ2h0IChyZWxhdGl2ZSBwcm9iYWJpbGl0eSlcblx0ICogQHJldHVybnMge3N0cmluZ30gd2hhdGV2ZXJcblx0ICovXG5cdGdldFdlaWdodGVkVmFsdWU6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHR2YXIgYXZhaWwgPSBbXTtcblx0XHR2YXIgdG90YWwgPSAwO1xuXHRcdFxuXHRcdGZvciAodmFyIGlkIGluIGRhdGEpIHtcblx0XHRcdHRvdGFsICs9IGRhdGFbaWRdO1xuXHRcdH1cblx0XHR2YXIgcmFuZG9tID0gTWF0aC5mbG9vcih0aGlzLmdldFVuaWZvcm0oKSp0b3RhbCk7XG5cdFx0XG5cdFx0dmFyIHBhcnQgPSAwO1xuXHRcdGZvciAodmFyIGlkIGluIGRhdGEpIHtcblx0XHRcdHBhcnQgKz0gZGF0YVtpZF07XG5cdFx0XHRpZiAocmFuZG9tIDwgcGFydCkgeyByZXR1cm4gaWQ7IH1cblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIG51bGw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCBSTkcgc3RhdGUuIFVzZWZ1bCBmb3Igc3RvcmluZyB0aGUgc3RhdGUgYW5kIHJlLXNldHRpbmcgaXQgdmlhIHNldFN0YXRlLlxuXHQgKiBAcmV0dXJucyB7P30gSW50ZXJuYWwgc3RhdGVcblx0ICovXG5cdGdldFN0YXRlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gW3RoaXMuX3MwLCB0aGlzLl9zMSwgdGhpcy5fczIsIHRoaXMuX2NdO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBTZXQgYSBwcmV2aW91c2x5IHJldHJpZXZlZCBzdGF0ZS5cblx0ICogQHBhcmFtIHs/fSBzdGF0ZVxuXHQgKi9cblx0c2V0U3RhdGU6IGZ1bmN0aW9uKHN0YXRlKSB7XG5cdFx0dGhpcy5fczAgPSBzdGF0ZVswXTtcblx0XHR0aGlzLl9zMSA9IHN0YXRlWzFdO1xuXHRcdHRoaXMuX3MyID0gc3RhdGVbMl07XG5cdFx0dGhpcy5fYyAgPSBzdGF0ZVszXTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRfczA6IDAsXG5cdF9zMTogMCxcblx0X3MyOiAwLFxuXHRfYzogMCxcblx0X2ZyYWM6IDIuMzI4MzA2NDM2NTM4Njk2M2UtMTAgLyogMl4tMzIgKi9cbn1cblxuUk9ULlJORy5zZXRTZWVkKERhdGUubm93KCkpO1xuLyoqXG4gKiBAY2xhc3MgKE1hcmtvdiBwcm9jZXNzKS1iYXNlZCBzdHJpbmcgZ2VuZXJhdG9yLiBcbiAqIENvcGllZCBmcm9tIGEgPGEgaHJlZj1cImh0dHA6Ly93d3cucm9ndWViYXNpbi5yb2d1ZWxpa2VkZXZlbG9wbWVudC5vcmcvaW5kZXgucGhwP3RpdGxlPU5hbWVzX2Zyb21fYV9oaWdoX29yZGVyX01hcmtvdl9Qcm9jZXNzX2FuZF9hX3NpbXBsaWZpZWRfS2F0el9iYWNrLW9mZl9zY2hlbWVcIj5Sb2d1ZUJhc2luIGFydGljbGU8L2E+LiBcbiAqIE9mZmVycyBjb25maWd1cmFibGUgb3JkZXIgYW5kIHByaW9yLlxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtib29sfSBbb3B0aW9ucy53b3Jkcz1mYWxzZV0gVXNlIHdvcmQgbW9kZT9cbiAqIEBwYXJhbSB7aW50fSBbb3B0aW9ucy5vcmRlcj0zXVxuICogQHBhcmFtIHtmbG9hdH0gW29wdGlvbnMucHJpb3I9MC4wMDFdXG4gKi9cblJPVC5TdHJpbmdHZW5lcmF0b3IgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cdHRoaXMuX29wdGlvbnMgPSB7XG5cdFx0d29yZHM6IGZhbHNlLFxuXHRcdG9yZGVyOiAzLFxuXHRcdHByaW9yOiAwLjAwMVxuXHR9XG5cdGZvciAodmFyIHAgaW4gb3B0aW9ucykgeyB0aGlzLl9vcHRpb25zW3BdID0gb3B0aW9uc1twXTsgfVxuXG5cdHRoaXMuX2JvdW5kYXJ5ID0gU3RyaW5nLmZyb21DaGFyQ29kZSgwKTtcblx0dGhpcy5fc3VmZml4ID0gdGhpcy5fYm91bmRhcnk7XG5cdHRoaXMuX3ByZWZpeCA9IFtdO1xuXHRmb3IgKHZhciBpPTA7aTx0aGlzLl9vcHRpb25zLm9yZGVyO2krKykgeyB0aGlzLl9wcmVmaXgucHVzaCh0aGlzLl9ib3VuZGFyeSk7IH1cblxuXHR0aGlzLl9wcmlvclZhbHVlcyA9IHt9O1xuXHR0aGlzLl9wcmlvclZhbHVlc1t0aGlzLl9ib3VuZGFyeV0gPSB0aGlzLl9vcHRpb25zLnByaW9yO1xuXG5cdHRoaXMuX2RhdGEgPSB7fTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYWxsIGxlYXJuaW5nIGRhdGFcbiAqL1xuUk9ULlN0cmluZ0dlbmVyYXRvci5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5fZGF0YSA9IHt9O1xuXHR0aGlzLl9wcmlvclZhbHVlcyA9IHt9O1xufVxuXG4vKipcbiAqIEByZXR1cm5zIHtzdHJpbmd9IEdlbmVyYXRlZCBzdHJpbmdcbiAqL1xuUk9ULlN0cmluZ0dlbmVyYXRvci5wcm90b3R5cGUuZ2VuZXJhdGUgPSBmdW5jdGlvbigpIHtcblx0dmFyIHJlc3VsdCA9IFt0aGlzLl9zYW1wbGUodGhpcy5fcHJlZml4KV07XG5cdHdoaWxlIChyZXN1bHRbcmVzdWx0Lmxlbmd0aC0xXSAhPSB0aGlzLl9ib3VuZGFyeSkge1xuXHRcdHJlc3VsdC5wdXNoKHRoaXMuX3NhbXBsZShyZXN1bHQpKTtcblx0fVxuXHRyZXR1cm4gdGhpcy5fam9pbihyZXN1bHQuc2xpY2UoMCwgLTEpKTtcbn1cblxuLyoqXG4gKiBPYnNlcnZlIChsZWFybikgYSBzdHJpbmcgZnJvbSBhIHRyYWluaW5nIHNldFxuICovXG5ST1QuU3RyaW5nR2VuZXJhdG9yLnByb3RvdHlwZS5vYnNlcnZlID0gZnVuY3Rpb24oc3RyaW5nKSB7XG5cdHZhciB0b2tlbnMgPSB0aGlzLl9zcGxpdChzdHJpbmcpO1xuXG5cdGZvciAodmFyIGk9MDsgaTx0b2tlbnMubGVuZ3RoOyBpKyspIHtcblx0XHR0aGlzLl9wcmlvclZhbHVlc1t0b2tlbnNbaV1dID0gdGhpcy5fb3B0aW9ucy5wcmlvcjtcblx0fVxuXG5cdHRva2VucyA9IHRoaXMuX3ByZWZpeC5jb25jYXQodG9rZW5zKS5jb25jYXQodGhpcy5fc3VmZml4KTsgLyogYWRkIGJvdW5kYXJ5IHN5bWJvbHMgKi9cblxuXHRmb3IgKHZhciBpPXRoaXMuX29wdGlvbnMub3JkZXI7IGk8dG9rZW5zLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGNvbnRleHQgPSB0b2tlbnMuc2xpY2UoaS10aGlzLl9vcHRpb25zLm9yZGVyLCBpKTtcblx0XHR2YXIgZXZlbnQgPSB0b2tlbnNbaV07XG5cdFx0Zm9yICh2YXIgaj0wOyBqPGNvbnRleHQubGVuZ3RoOyBqKyspIHtcblx0XHRcdHZhciBzdWJjb250ZXh0ID0gY29udGV4dC5zbGljZShqKTtcblx0XHRcdHRoaXMuX29ic2VydmVFdmVudChzdWJjb250ZXh0LCBldmVudCk7XG5cdFx0fVxuXHR9XG59XG5cblJPVC5TdHJpbmdHZW5lcmF0b3IucHJvdG90eXBlLmdldFN0YXRzID0gZnVuY3Rpb24oKSB7XG5cdHZhciBwYXJ0cyA9IFtdO1xuXG5cdHZhciBwcmlvckNvdW50ID0gMDtcblx0Zm9yICh2YXIgcCBpbiB0aGlzLl9wcmlvclZhbHVlcykgeyBwcmlvckNvdW50Kys7IH1cblx0cHJpb3JDb3VudC0tOyAvKiBib3VuZGFyeSAqL1xuXHRwYXJ0cy5wdXNoKFwiZGlzdGluY3Qgc2FtcGxlczogXCIgKyBwcmlvckNvdW50KTtcblxuXHR2YXIgZGF0YUNvdW50ID0gMDtcblx0dmFyIGV2ZW50Q291bnQgPSAwO1xuXHRmb3IgKHZhciBwIGluIHRoaXMuX2RhdGEpIHsgXG5cdFx0ZGF0YUNvdW50Kys7IFxuXHRcdGZvciAodmFyIGtleSBpbiB0aGlzLl9kYXRhW3BdKSB7XG5cdFx0XHRldmVudENvdW50Kys7XG5cdFx0fVxuXHR9XG5cdHBhcnRzLnB1c2goXCJkaWN0aW9uYXJ5IHNpemUgKGNvbnRleHRzKTogXCIgKyBkYXRhQ291bnQpO1xuXHRwYXJ0cy5wdXNoKFwiZGljdGlvbmFyeSBzaXplIChldmVudHMpOiBcIiArIGV2ZW50Q291bnQpO1xuXG5cdHJldHVybiBwYXJ0cy5qb2luKFwiLCBcIik7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9XG4gKiBAcmV0dXJucyB7c3RyaW5nW119XG4gKi9cblJPVC5TdHJpbmdHZW5lcmF0b3IucHJvdG90eXBlLl9zcGxpdCA9IGZ1bmN0aW9uKHN0cikge1xuXHRyZXR1cm4gc3RyLnNwbGl0KHRoaXMuX29wdGlvbnMud29yZHMgPyAvXFxzKy8gOiBcIlwiKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ1tdfVxuICogQHJldHVybnMge3N0cmluZ30gXG4gKi9cblJPVC5TdHJpbmdHZW5lcmF0b3IucHJvdG90eXBlLl9qb2luID0gZnVuY3Rpb24oYXJyKSB7XG5cdHJldHVybiBhcnIuam9pbih0aGlzLl9vcHRpb25zLndvcmRzID8gXCIgXCIgOiBcIlwiKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBjb250ZXh0XG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRcbiAqL1xuUk9ULlN0cmluZ0dlbmVyYXRvci5wcm90b3R5cGUuX29ic2VydmVFdmVudCA9IGZ1bmN0aW9uKGNvbnRleHQsIGV2ZW50KSB7XG5cdHZhciBrZXkgPSB0aGlzLl9qb2luKGNvbnRleHQpO1xuXHRpZiAoIShrZXkgaW4gdGhpcy5fZGF0YSkpIHsgdGhpcy5fZGF0YVtrZXldID0ge307IH1cblx0dmFyIGRhdGEgPSB0aGlzLl9kYXRhW2tleV07XG5cblx0aWYgKCEoZXZlbnQgaW4gZGF0YSkpIHsgZGF0YVtldmVudF0gPSAwOyB9XG5cdGRhdGFbZXZlbnRdKys7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmdbXX1cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cblJPVC5TdHJpbmdHZW5lcmF0b3IucHJvdG90eXBlLl9zYW1wbGUgPSBmdW5jdGlvbihjb250ZXh0KSB7XG5cdGNvbnRleHQgPSB0aGlzLl9iYWNrb2ZmKGNvbnRleHQpO1xuXHR2YXIga2V5ID0gdGhpcy5fam9pbihjb250ZXh0KTtcblx0dmFyIGRhdGEgPSB0aGlzLl9kYXRhW2tleV07XG5cblx0dmFyIGF2YWlsYWJsZSA9IHt9O1xuXG5cdGlmICh0aGlzLl9vcHRpb25zLnByaW9yKSB7XG5cdFx0Zm9yICh2YXIgZXZlbnQgaW4gdGhpcy5fcHJpb3JWYWx1ZXMpIHsgYXZhaWxhYmxlW2V2ZW50XSA9IHRoaXMuX3ByaW9yVmFsdWVzW2V2ZW50XTsgfVxuXHRcdGZvciAodmFyIGV2ZW50IGluIGRhdGEpIHsgYXZhaWxhYmxlW2V2ZW50XSArPSBkYXRhW2V2ZW50XTsgfVxuXHR9IGVsc2UgeyBcblx0XHRhdmFpbGFibGUgPSBkYXRhO1xuXHR9XG5cblx0cmV0dXJuIHRoaXMuX3BpY2tSYW5kb20oYXZhaWxhYmxlKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ1tdfVxuICogQHJldHVybnMge3N0cmluZ1tdfVxuICovXG5ST1QuU3RyaW5nR2VuZXJhdG9yLnByb3RvdHlwZS5fYmFja29mZiA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcblx0aWYgKGNvbnRleHQubGVuZ3RoID4gdGhpcy5fb3B0aW9ucy5vcmRlcikge1xuXHRcdGNvbnRleHQgPSBjb250ZXh0LnNsaWNlKC10aGlzLl9vcHRpb25zLm9yZGVyKTtcblx0fSBlbHNlIGlmIChjb250ZXh0Lmxlbmd0aCA8IHRoaXMuX29wdGlvbnMub3JkZXIpIHtcblx0XHRjb250ZXh0ID0gdGhpcy5fcHJlZml4LnNsaWNlKDAsIHRoaXMuX29wdGlvbnMub3JkZXIgLSBjb250ZXh0Lmxlbmd0aCkuY29uY2F0KGNvbnRleHQpO1xuXHR9XG5cblx0d2hpbGUgKCEodGhpcy5fam9pbihjb250ZXh0KSBpbiB0aGlzLl9kYXRhKSAmJiBjb250ZXh0Lmxlbmd0aCA+IDApIHsgY29udGV4dCA9IGNvbnRleHQuc2xpY2UoMSk7IH1cblxuXHRyZXR1cm4gY29udGV4dDtcbn1cblxuXG5ST1QuU3RyaW5nR2VuZXJhdG9yLnByb3RvdHlwZS5fcGlja1JhbmRvbSA9IGZ1bmN0aW9uKGRhdGEpIHtcblx0dmFyIHRvdGFsID0gMDtcblx0XG5cdGZvciAodmFyIGlkIGluIGRhdGEpIHtcblx0XHR0b3RhbCArPSBkYXRhW2lkXTtcblx0fVxuXHR2YXIgcmFuZG9tID0gUk9ULlJORy5nZXRVbmlmb3JtKCkqdG90YWw7XG5cdFxuXHR2YXIgcGFydCA9IDA7XG5cdGZvciAodmFyIGlkIGluIGRhdGEpIHtcblx0XHRwYXJ0ICs9IGRhdGFbaWRdO1xuXHRcdGlmIChyYW5kb20gPCBwYXJ0KSB7IHJldHVybiBpZDsgfVxuXHR9XG59XG4vKipcbiAqIEBjbGFzcyBHZW5lcmljIGV2ZW50IHF1ZXVlOiBzdG9yZXMgZXZlbnRzIGFuZCByZXRyaWV2ZXMgdGhlbSBiYXNlZCBvbiB0aGVpciB0aW1lXG4gKi9cblJPVC5FdmVudFF1ZXVlID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuX3RpbWUgPSAwO1xuXHR0aGlzLl9ldmVudHMgPSBbXTtcblx0dGhpcy5fZXZlbnRUaW1lcyA9IFtdO1xufVxuXG4vKipcbiAqIEByZXR1cm5zIHtudW1iZXJ9IEVsYXBzZWQgdGltZVxuICovXG5ST1QuRXZlbnRRdWV1ZS5wcm90b3R5cGUuZ2V0VGltZSA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5fdGltZTtcbn1cblxuLyoqXG4gKiBDbGVhciBhbGwgc2NoZWR1bGVkIGV2ZW50c1xuICovXG5ST1QuRXZlbnRRdWV1ZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5fZXZlbnRzID0gW107XG5cdHRoaXMuX2V2ZW50VGltZXMgPSBbXTtcblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogQHBhcmFtIHs/fSBldmVudFxuICogQHBhcmFtIHtudW1iZXJ9IHRpbWVcbiAqL1xuUk9ULkV2ZW50UXVldWUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKGV2ZW50LCB0aW1lKSB7XG5cdHZhciBpbmRleCA9IHRoaXMuX2V2ZW50cy5sZW5ndGg7XG5cdGZvciAodmFyIGk9MDtpPHRoaXMuX2V2ZW50VGltZXMubGVuZ3RoO2krKykge1xuXHRcdGlmICh0aGlzLl9ldmVudFRpbWVzW2ldID4gdGltZSkge1xuXHRcdFx0aW5kZXggPSBpO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0dGhpcy5fZXZlbnRzLnNwbGljZShpbmRleCwgMCwgZXZlbnQpO1xuXHR0aGlzLl9ldmVudFRpbWVzLnNwbGljZShpbmRleCwgMCwgdGltZSk7XG59XG5cbi8qKlxuICogTG9jYXRlcyB0aGUgbmVhcmVzdCBldmVudCwgYWR2YW5jZXMgdGltZSBpZiBuZWNlc3NhcnkuIFJldHVybnMgdGhhdCBldmVudCBhbmQgcmVtb3ZlcyBpdCBmcm9tIHRoZSBxdWV1ZS5cbiAqIEByZXR1cm5zIHs/IHx8IG51bGx9IFRoZSBldmVudCBwcmV2aW91c2x5IGFkZGVkIGJ5IGFkZEV2ZW50LCBudWxsIGlmIG5vIGV2ZW50IGF2YWlsYWJsZVxuICovXG5ST1QuRXZlbnRRdWV1ZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oKSB7XG5cdGlmICghdGhpcy5fZXZlbnRzLmxlbmd0aCkgeyByZXR1cm4gbnVsbDsgfVxuXG5cdHZhciB0aW1lID0gdGhpcy5fZXZlbnRUaW1lcy5zcGxpY2UoMCwgMSlbMF07XG5cdGlmICh0aW1lID4gMCkgeyAvKiBhZHZhbmNlICovXG5cdFx0dGhpcy5fdGltZSArPSB0aW1lO1xuXHRcdGZvciAodmFyIGk9MDtpPHRoaXMuX2V2ZW50VGltZXMubGVuZ3RoO2krKykgeyB0aGlzLl9ldmVudFRpbWVzW2ldIC09IHRpbWU7IH1cblx0fVxuXG5cdHJldHVybiB0aGlzLl9ldmVudHMuc3BsaWNlKDAsIDEpWzBdO1xufVxuXG4vKipcbiAqIFJlbW92ZSBhbiBldmVudCBmcm9tIHRoZSBxdWV1ZVxuICogQHBhcmFtIHs/fSBldmVudFxuICogQHJldHVybnMge2Jvb2x9IHN1Y2Nlc3M/XG4gKi9cblJPVC5FdmVudFF1ZXVlLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbihldmVudCkge1xuXHR2YXIgaW5kZXggPSB0aGlzLl9ldmVudHMuaW5kZXhPZihldmVudCk7XG5cdGlmIChpbmRleCA9PSAtMSkgeyByZXR1cm4gZmFsc2UgfVxuXHR0aGlzLl9yZW1vdmUoaW5kZXgpO1xuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYW4gZXZlbnQgZnJvbSB0aGUgcXVldWVcbiAqIEBwYXJhbSB7aW50fSBpbmRleFxuICovXG5ST1QuRXZlbnRRdWV1ZS5wcm90b3R5cGUuX3JlbW92ZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cdHRoaXMuX2V2ZW50cy5zcGxpY2UoaW5kZXgsIDEpO1xuXHR0aGlzLl9ldmVudFRpbWVzLnNwbGljZShpbmRleCwgMSk7XG59XG4vKipcbiAqIEBjbGFzcyBBYnN0cmFjdCBzY2hlZHVsZXJcbiAqL1xuUk9ULlNjaGVkdWxlciA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9xdWV1ZSA9IG5ldyBST1QuRXZlbnRRdWV1ZSgpO1xuXHR0aGlzLl9yZXBlYXQgPSBbXTtcblx0dGhpcy5fY3VycmVudCA9IG51bGw7XG59XG5cbi8qKlxuICogQHNlZSBST1QuRXZlbnRRdWV1ZSNnZXRUaW1lXG4gKi9cblJPVC5TY2hlZHVsZXIucHJvdG90eXBlLmdldFRpbWUgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuX3F1ZXVlLmdldFRpbWUoKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gez99IGl0ZW1cbiAqIEBwYXJhbSB7Ym9vbH0gcmVwZWF0XG4gKi9cblJPVC5TY2hlZHVsZXIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKGl0ZW0sIHJlcGVhdCkge1xuXHRpZiAocmVwZWF0KSB7IHRoaXMuX3JlcGVhdC5wdXNoKGl0ZW0pOyB9XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIENsZWFyIGFsbCBpdGVtc1xuICovXG5ST1QuU2NoZWR1bGVyLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9xdWV1ZS5jbGVhcigpO1xuXHR0aGlzLl9yZXBlYXQgPSBbXTtcblx0dGhpcy5fY3VycmVudCA9IG51bGw7XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFJlbW92ZSBhIHByZXZpb3VzbHkgYWRkZWQgaXRlbVxuICogQHBhcmFtIHs/fSBpdGVtXG4gKiBAcmV0dXJucyB7Ym9vbH0gc3VjY2Vzc2Z1bD9cbiAqL1xuUk9ULlNjaGVkdWxlci5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oaXRlbSkge1xuXHR2YXIgcmVzdWx0ID0gdGhpcy5fcXVldWUucmVtb3ZlKGl0ZW0pO1xuXG5cdHZhciBpbmRleCA9IHRoaXMuX3JlcGVhdC5pbmRleE9mKGl0ZW0pO1xuXHRpZiAoaW5kZXggIT0gLTEpIHsgdGhpcy5fcmVwZWF0LnNwbGljZShpbmRleCwgMSk7IH1cblxuXHRpZiAodGhpcy5fY3VycmVudCA9PSBpdGVtKSB7IHRoaXMuX2N1cnJlbnQgPSBudWxsOyB9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBTY2hlZHVsZSBuZXh0IGl0ZW1cbiAqIEByZXR1cm5zIHs/fVxuICovXG5ST1QuU2NoZWR1bGVyLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuX2N1cnJlbnQgPSB0aGlzLl9xdWV1ZS5nZXQoKTtcblx0cmV0dXJuIHRoaXMuX2N1cnJlbnQ7XG59XG4vKipcbiAqIEBjbGFzcyBTaW1wbGUgZmFpciBzY2hlZHVsZXIgKHJvdW5kLXJvYmluIHN0eWxlKVxuICogQGF1Z21lbnRzIFJPVC5TY2hlZHVsZXJcbiAqL1xuUk9ULlNjaGVkdWxlci5TaW1wbGUgPSBmdW5jdGlvbigpIHtcblx0Uk9ULlNjaGVkdWxlci5jYWxsKHRoaXMpO1xufVxuUk9ULlNjaGVkdWxlci5TaW1wbGUuZXh0ZW5kKFJPVC5TY2hlZHVsZXIpO1xuXG4vKipcbiAqIEBzZWUgUk9ULlNjaGVkdWxlciNhZGRcbiAqL1xuUk9ULlNjaGVkdWxlci5TaW1wbGUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKGl0ZW0sIHJlcGVhdCkge1xuXHR0aGlzLl9xdWV1ZS5hZGQoaXRlbSwgMCk7XG5cdHJldHVybiBST1QuU2NoZWR1bGVyLnByb3RvdHlwZS5hZGQuY2FsbCh0aGlzLCBpdGVtLCByZXBlYXQpO1xufVxuXG4vKipcbiAqIEBzZWUgUk9ULlNjaGVkdWxlciNuZXh0XG4gKi9cblJPVC5TY2hlZHVsZXIuU2ltcGxlLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG5cdGlmICh0aGlzLl9jdXJyZW50ICYmIHRoaXMuX3JlcGVhdC5pbmRleE9mKHRoaXMuX2N1cnJlbnQpICE9IC0xKSB7XG5cdFx0dGhpcy5fcXVldWUuYWRkKHRoaXMuX2N1cnJlbnQsIDApO1xuXHR9XG5cdHJldHVybiBST1QuU2NoZWR1bGVyLnByb3RvdHlwZS5uZXh0LmNhbGwodGhpcyk7XG59XG4vKipcbiAqIEBjbGFzcyBTcGVlZC1iYXNlZCBzY2hlZHVsZXJcbiAqIEBhdWdtZW50cyBST1QuU2NoZWR1bGVyXG4gKi9cblJPVC5TY2hlZHVsZXIuU3BlZWQgPSBmdW5jdGlvbigpIHtcblx0Uk9ULlNjaGVkdWxlci5jYWxsKHRoaXMpO1xufVxuUk9ULlNjaGVkdWxlci5TcGVlZC5leHRlbmQoUk9ULlNjaGVkdWxlcik7XG5cbi8qKlxuICogQHBhcmFtIHtvYmplY3R9IGl0ZW0gYW55dGhpbmcgd2l0aCBcImdldFNwZWVkXCIgbWV0aG9kXG4gKiBAcGFyYW0ge2Jvb2x9IHJlcGVhdFxuICogQHNlZSBST1QuU2NoZWR1bGVyI2FkZFxuICovXG5ST1QuU2NoZWR1bGVyLlNwZWVkLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihpdGVtLCByZXBlYXQpIHtcblx0dGhpcy5fcXVldWUuYWRkKGl0ZW0sIDEvaXRlbS5nZXRTcGVlZCgpKTtcblx0cmV0dXJuIFJPVC5TY2hlZHVsZXIucHJvdG90eXBlLmFkZC5jYWxsKHRoaXMsIGl0ZW0sIHJlcGVhdCk7XG59XG5cbi8qKlxuICogQHNlZSBST1QuU2NoZWR1bGVyI25leHRcbiAqL1xuUk9ULlNjaGVkdWxlci5TcGVlZC5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuXHRpZiAodGhpcy5fY3VycmVudCAmJiB0aGlzLl9yZXBlYXQuaW5kZXhPZih0aGlzLl9jdXJyZW50KSAhPSAtMSkge1xuXHRcdHRoaXMuX3F1ZXVlLmFkZCh0aGlzLl9jdXJyZW50LCAxL3RoaXMuX2N1cnJlbnQuZ2V0U3BlZWQoKSk7XG5cdH1cblx0cmV0dXJuIFJPVC5TY2hlZHVsZXIucHJvdG90eXBlLm5leHQuY2FsbCh0aGlzKTtcbn1cbi8qKlxuICogQGNsYXNzIEFjdGlvbi1iYXNlZCBzY2hlZHVsZXJcbiAqIEBhdWdtZW50cyBST1QuU2NoZWR1bGVyXG4gKi9cblJPVC5TY2hlZHVsZXIuQWN0aW9uID0gZnVuY3Rpb24oKSB7XG5cdFJPVC5TY2hlZHVsZXIuY2FsbCh0aGlzKTtcblx0dGhpcy5fZGVmYXVsdER1cmF0aW9uID0gMTsgLyogZm9yIG5ld2x5IGFkZGVkICovXG5cdHRoaXMuX2R1cmF0aW9uID0gdGhpcy5fZGVmYXVsdER1cmF0aW9uOyAvKiBmb3IgdGhpcy5fY3VycmVudCAqL1xufVxuUk9ULlNjaGVkdWxlci5BY3Rpb24uZXh0ZW5kKFJPVC5TY2hlZHVsZXIpO1xuXG4vKipcbiAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtXG4gKiBAcGFyYW0ge2Jvb2x9IHJlcGVhdFxuICogQHBhcmFtIHtudW1iZXJ9IFt0aW1lPTFdXG4gKiBAc2VlIFJPVC5TY2hlZHVsZXIjYWRkXG4gKi9cblJPVC5TY2hlZHVsZXIuQWN0aW9uLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihpdGVtLCByZXBlYXQsIHRpbWUpIHtcblx0dGhpcy5fcXVldWUuYWRkKGl0ZW0sIHRpbWUgfHwgdGhpcy5fZGVmYXVsdER1cmF0aW9uKTtcblx0cmV0dXJuIFJPVC5TY2hlZHVsZXIucHJvdG90eXBlLmFkZC5jYWxsKHRoaXMsIGl0ZW0sIHJlcGVhdCk7XG59XG5cblJPVC5TY2hlZHVsZXIuQWN0aW9uLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9kdXJhdGlvbiA9IHRoaXMuX2RlZmF1bHREdXJhdGlvbjtcblx0cmV0dXJuIFJPVC5TY2hlZHVsZXIucHJvdG90eXBlLmNsZWFyLmNhbGwodGhpcyk7XG59XG5cblJPVC5TY2hlZHVsZXIuQWN0aW9uLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbihpdGVtKSB7XG5cdGlmIChpdGVtID09IHRoaXMuX2N1cnJlbnQpIHsgdGhpcy5fZHVyYXRpb24gPSB0aGlzLl9kZWZhdWx0RHVyYXRpb247IH1cblx0cmV0dXJuIFJPVC5TY2hlZHVsZXIucHJvdG90eXBlLnJlbW92ZS5jYWxsKHRoaXMsIGl0ZW0pO1xufVxuXG4vKipcbiAqIEBzZWUgUk9ULlNjaGVkdWxlciNuZXh0XG4gKi9cblJPVC5TY2hlZHVsZXIuQWN0aW9uLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG5cdGlmICh0aGlzLl9jdXJyZW50ICYmIHRoaXMuX3JlcGVhdC5pbmRleE9mKHRoaXMuX2N1cnJlbnQpICE9IC0xKSB7XG5cdFx0dGhpcy5fcXVldWUuYWRkKHRoaXMuX2N1cnJlbnQsIHRoaXMuX2R1cmF0aW9uIHx8IHRoaXMuX2RlZmF1bHREdXJhdGlvbik7XG5cdFx0dGhpcy5fZHVyYXRpb24gPSB0aGlzLl9kZWZhdWx0RHVyYXRpb247XG5cdH1cblx0cmV0dXJuIFJPVC5TY2hlZHVsZXIucHJvdG90eXBlLm5leHQuY2FsbCh0aGlzKTtcbn1cblxuLyoqXG4gKiBTZXQgZHVyYXRpb24gZm9yIHRoZSBhY3RpdmUgaXRlbVxuICovXG5ST1QuU2NoZWR1bGVyLkFjdGlvbi5wcm90b3R5cGUuc2V0RHVyYXRpb24gPSBmdW5jdGlvbih0aW1lKSB7XG5cdGlmICh0aGlzLl9jdXJyZW50KSB7IHRoaXMuX2R1cmF0aW9uID0gdGltZTsgfVxuXHRyZXR1cm4gdGhpcztcbn1cbi8qKlxuICogQGNsYXNzIEFzeW5jaHJvbm91cyBtYWluIGxvb3BcbiAqIEBwYXJhbSB7Uk9ULlNjaGVkdWxlcn0gc2NoZWR1bGVyXG4gKi9cblJPVC5FbmdpbmUgPSBmdW5jdGlvbihzY2hlZHVsZXIpIHtcblx0dGhpcy5fc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuXHR0aGlzLl9sb2NrID0gMTtcbn1cblxuLyoqXG4gKiBTdGFydCB0aGUgbWFpbiBsb29wLiBXaGVuIHRoaXMgY2FsbCByZXR1cm5zLCB0aGUgbG9vcCBpcyBsb2NrZWQuXG4gKi9cblJPVC5FbmdpbmUucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLnVubG9jaygpO1xufVxuXG4vKipcbiAqIEludGVycnVwdCB0aGUgZW5naW5lIGJ5IGFuIGFzeW5jaHJvbm91cyBhY3Rpb25cbiAqL1xuUk9ULkVuZ2luZS5wcm90b3R5cGUubG9jayA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9sb2NrKys7XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFJlc3VtZSBleGVjdXRpb24gKHBhdXNlZCBieSBhIHByZXZpb3VzIGxvY2spXG4gKi9cblJPVC5FbmdpbmUucHJvdG90eXBlLnVubG9jayA9IGZ1bmN0aW9uKCkge1xuXHRpZiAoIXRoaXMuX2xvY2spIHsgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHVubG9jayB1bmxvY2tlZCBlbmdpbmVcIik7IH1cblx0dGhpcy5fbG9jay0tO1xuXG5cdHdoaWxlICghdGhpcy5fbG9jaykge1xuXHRcdHZhciBhY3RvciA9IHRoaXMuX3NjaGVkdWxlci5uZXh0KCk7XG5cdFx0aWYgKCFhY3RvcikgeyByZXR1cm4gdGhpcy5sb2NrKCk7IH0gLyogbm8gYWN0b3JzICovXG5cdFx0dmFyIHJlc3VsdCA9IGFjdG9yLmFjdCgpO1xuXHRcdGlmIChyZXN1bHQgJiYgcmVzdWx0LnRoZW4pIHsgLyogYWN0b3IgcmV0dXJuZWQgYSBcInRoZW5hYmxlXCIsIGxvb2tzIGxpa2UgYSBQcm9taXNlICovXG5cdFx0XHR0aGlzLmxvY2soKTtcblx0XHRcdHJlc3VsdC50aGVuKHRoaXMudW5sb2NrLmJpbmQodGhpcykpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0aGlzO1xufVxuLyoqXG4gKiBAY2xhc3MgQmFzZSBtYXAgZ2VuZXJhdG9yXG4gKiBAcGFyYW0ge2ludH0gW3dpZHRoPVJPVC5ERUZBVUxUX1dJRFRIXVxuICogQHBhcmFtIHtpbnR9IFtoZWlnaHQ9Uk9ULkRFRkFVTFRfSEVJR0hUXVxuICovXG5ST1QuTWFwID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuXHR0aGlzLl93aWR0aCA9IHdpZHRoIHx8IFJPVC5ERUZBVUxUX1dJRFRIO1xuXHR0aGlzLl9oZWlnaHQgPSBoZWlnaHQgfHwgUk9ULkRFRkFVTFRfSEVJR0hUO1xufTtcblxuUk9ULk1hcC5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oY2FsbGJhY2spIHt9XG5cblJPVC5NYXAucHJvdG90eXBlLl9maWxsTWFwID0gZnVuY3Rpb24odmFsdWUpIHtcblx0dmFyIG1hcCA9IFtdO1xuXHRmb3IgKHZhciBpPTA7aTx0aGlzLl93aWR0aDtpKyspIHtcblx0XHRtYXAucHVzaChbXSk7XG5cdFx0Zm9yICh2YXIgaj0wO2o8dGhpcy5faGVpZ2h0O2orKykgeyBtYXBbaV0ucHVzaCh2YWx1ZSk7IH1cblx0fVxuXHRyZXR1cm4gbWFwO1xufVxuLyoqXG4gKiBAY2xhc3MgU2ltcGxlIGVtcHR5IHJlY3Rhbmd1bGFyIHJvb21cbiAqIEBhdWdtZW50cyBST1QuTWFwXG4gKi9cblJPVC5NYXAuQXJlbmEgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG5cdFJPVC5NYXAuY2FsbCh0aGlzLCB3aWR0aCwgaGVpZ2h0KTtcbn1cblJPVC5NYXAuQXJlbmEuZXh0ZW5kKFJPVC5NYXApO1xuXG5ST1QuTWFwLkFyZW5hLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHR2YXIgdyA9IHRoaXMuX3dpZHRoLTE7XG5cdHZhciBoID0gdGhpcy5faGVpZ2h0LTE7XG5cdGZvciAodmFyIGk9MDtpPD13O2krKykge1xuXHRcdGZvciAodmFyIGo9MDtqPD1oO2orKykge1xuXHRcdFx0dmFyIGVtcHR5ID0gKGkgJiYgaiAmJiBpPHcgJiYgajxoKTtcblx0XHRcdGNhbGxiYWNrKGksIGosIGVtcHR5ID8gMCA6IDEpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdGhpcztcbn1cbi8qKlxuICogQGNsYXNzIFJlY3Vyc2l2ZWx5IGRpdmlkZWQgbWF6ZSwgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NYXplX2dlbmVyYXRpb25fYWxnb3JpdGhtI1JlY3Vyc2l2ZV9kaXZpc2lvbl9tZXRob2RcbiAqIEBhdWdtZW50cyBST1QuTWFwXG4gKi9cblJPVC5NYXAuRGl2aWRlZE1hemUgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG5cdFJPVC5NYXAuY2FsbCh0aGlzLCB3aWR0aCwgaGVpZ2h0KTtcblx0dGhpcy5fc3RhY2sgPSBbXTtcbn1cblJPVC5NYXAuRGl2aWRlZE1hemUuZXh0ZW5kKFJPVC5NYXApO1xuXG5ST1QuTWFwLkRpdmlkZWRNYXplLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHR2YXIgdyA9IHRoaXMuX3dpZHRoO1xuXHR2YXIgaCA9IHRoaXMuX2hlaWdodDtcblx0XG5cdHRoaXMuX21hcCA9IFtdO1xuXHRcblx0Zm9yICh2YXIgaT0wO2k8dztpKyspIHtcblx0XHR0aGlzLl9tYXAucHVzaChbXSk7XG5cdFx0Zm9yICh2YXIgaj0wO2o8aDtqKyspIHtcblx0XHRcdHZhciBib3JkZXIgPSAoaSA9PSAwIHx8IGogPT0gMCB8fCBpKzEgPT0gdyB8fCBqKzEgPT0gaCk7XG5cdFx0XHR0aGlzLl9tYXBbaV0ucHVzaChib3JkZXIgPyAxIDogMCk7XG5cdFx0fVxuXHR9XG5cdFxuXHR0aGlzLl9zdGFjayA9IFtcblx0XHRbMSwgMSwgdy0yLCBoLTJdXG5cdF07XG5cdHRoaXMuX3Byb2Nlc3MoKTtcblx0XG5cdGZvciAodmFyIGk9MDtpPHc7aSsrKSB7XG5cdFx0Zm9yICh2YXIgaj0wO2o8aDtqKyspIHtcblx0XHRcdGNhbGxiYWNrKGksIGosIHRoaXMuX21hcFtpXVtqXSk7XG5cdFx0fVxuXHR9XG5cdHRoaXMuX21hcCA9IG51bGw7XG5cdHJldHVybiB0aGlzO1xufVxuXG5ST1QuTWFwLkRpdmlkZWRNYXplLnByb3RvdHlwZS5fcHJvY2VzcyA9IGZ1bmN0aW9uKCkge1xuXHR3aGlsZSAodGhpcy5fc3RhY2subGVuZ3RoKSB7XG5cdFx0dmFyIHJvb20gPSB0aGlzLl9zdGFjay5zaGlmdCgpOyAvKiBbbGVmdCwgdG9wLCByaWdodCwgYm90dG9tXSAqL1xuXHRcdHRoaXMuX3BhcnRpdGlvblJvb20ocm9vbSk7XG5cdH1cbn1cblxuUk9ULk1hcC5EaXZpZGVkTWF6ZS5wcm90b3R5cGUuX3BhcnRpdGlvblJvb20gPSBmdW5jdGlvbihyb29tKSB7XG5cdHZhciBhdmFpbFggPSBbXTtcblx0dmFyIGF2YWlsWSA9IFtdO1xuXHRcblx0Zm9yICh2YXIgaT1yb29tWzBdKzE7aTxyb29tWzJdO2krKykge1xuXHRcdHZhciB0b3AgPSB0aGlzLl9tYXBbaV1bcm9vbVsxXS0xXTtcblx0XHR2YXIgYm90dG9tID0gdGhpcy5fbWFwW2ldW3Jvb21bM10rMV07XG5cdFx0aWYgKHRvcCAmJiBib3R0b20gJiYgIShpICUgMikpIHsgYXZhaWxYLnB1c2goaSk7IH1cblx0fVxuXHRcblx0Zm9yICh2YXIgaj1yb29tWzFdKzE7ajxyb29tWzNdO2orKykge1xuXHRcdHZhciBsZWZ0ID0gdGhpcy5fbWFwW3Jvb21bMF0tMV1bal07XG5cdFx0dmFyIHJpZ2h0ID0gdGhpcy5fbWFwW3Jvb21bMl0rMV1bal07XG5cdFx0aWYgKGxlZnQgJiYgcmlnaHQgJiYgIShqICUgMikpIHsgYXZhaWxZLnB1c2goaik7IH1cblx0fVxuXG5cdGlmICghYXZhaWxYLmxlbmd0aCB8fCAhYXZhaWxZLmxlbmd0aCkgeyByZXR1cm47IH1cblxuXHR2YXIgeCA9IGF2YWlsWC5yYW5kb20oKTtcblx0dmFyIHkgPSBhdmFpbFkucmFuZG9tKCk7XG5cdFxuXHR0aGlzLl9tYXBbeF1beV0gPSAxO1xuXHRcblx0dmFyIHdhbGxzID0gW107XG5cdFxuXHR2YXIgdyA9IFtdOyB3YWxscy5wdXNoKHcpOyAvKiBsZWZ0IHBhcnQgKi9cblx0Zm9yICh2YXIgaT1yb29tWzBdOyBpPHg7IGkrKykgeyBcblx0XHR0aGlzLl9tYXBbaV1beV0gPSAxO1xuXHRcdHcucHVzaChbaSwgeV0pOyBcblx0fVxuXHRcblx0dmFyIHcgPSBbXTsgd2FsbHMucHVzaCh3KTsgLyogcmlnaHQgcGFydCAqL1xuXHRmb3IgKHZhciBpPXgrMTsgaTw9cm9vbVsyXTsgaSsrKSB7IFxuXHRcdHRoaXMuX21hcFtpXVt5XSA9IDE7XG5cdFx0dy5wdXNoKFtpLCB5XSk7IFxuXHR9XG5cblx0dmFyIHcgPSBbXTsgd2FsbHMucHVzaCh3KTsgLyogdG9wIHBhcnQgKi9cblx0Zm9yICh2YXIgaj1yb29tWzFdOyBqPHk7IGorKykgeyBcblx0XHR0aGlzLl9tYXBbeF1bal0gPSAxO1xuXHRcdHcucHVzaChbeCwgal0pOyBcblx0fVxuXHRcblx0dmFyIHcgPSBbXTsgd2FsbHMucHVzaCh3KTsgLyogYm90dG9tIHBhcnQgKi9cblx0Zm9yICh2YXIgaj15KzE7IGo8PXJvb21bM107IGorKykgeyBcblx0XHR0aGlzLl9tYXBbeF1bal0gPSAxO1xuXHRcdHcucHVzaChbeCwgal0pOyBcblx0fVxuXHRcdFxuXHR2YXIgc29saWQgPSB3YWxscy5yYW5kb20oKTtcblx0Zm9yICh2YXIgaT0wO2k8d2FsbHMubGVuZ3RoO2krKykge1xuXHRcdHZhciB3ID0gd2FsbHNbaV07XG5cdFx0aWYgKHcgPT0gc29saWQpIHsgY29udGludWU7IH1cblx0XHRcblx0XHR2YXIgaG9sZSA9IHcucmFuZG9tKCk7XG5cdFx0dGhpcy5fbWFwW2hvbGVbMF1dW2hvbGVbMV1dID0gMDtcblx0fVxuXG5cdHRoaXMuX3N0YWNrLnB1c2goW3Jvb21bMF0sIHJvb21bMV0sIHgtMSwgeS0xXSk7IC8qIGxlZnQgdG9wICovXG5cdHRoaXMuX3N0YWNrLnB1c2goW3grMSwgcm9vbVsxXSwgcm9vbVsyXSwgeS0xXSk7IC8qIHJpZ2h0IHRvcCAqL1xuXHR0aGlzLl9zdGFjay5wdXNoKFtyb29tWzBdLCB5KzEsIHgtMSwgcm9vbVszXV0pOyAvKiBsZWZ0IGJvdHRvbSAqL1xuXHR0aGlzLl9zdGFjay5wdXNoKFt4KzEsIHkrMSwgcm9vbVsyXSwgcm9vbVszXV0pOyAvKiByaWdodCBib3R0b20gKi9cbn1cbi8qKlxuICogQGNsYXNzIEljZXkncyBNYXplIGdlbmVyYXRvclxuICogU2VlIGh0dHA6Ly93d3cucm9ndWViYXNpbi5yb2d1ZWxpa2VkZXZlbG9wbWVudC5vcmcvaW5kZXgucGhwP3RpdGxlPVNpbXBsZV9tYXplIGZvciBleHBsYW5hdGlvblxuICogQGF1Z21lbnRzIFJPVC5NYXBcbiAqL1xuUk9ULk1hcC5JY2V5TWF6ZSA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQsIHJlZ3VsYXJpdHkpIHtcblx0Uk9ULk1hcC5jYWxsKHRoaXMsIHdpZHRoLCBoZWlnaHQpO1xuXHR0aGlzLl9yZWd1bGFyaXR5ID0gcmVndWxhcml0eSB8fCAwO1xufVxuUk9ULk1hcC5JY2V5TWF6ZS5leHRlbmQoUk9ULk1hcCk7XG5cblJPVC5NYXAuSWNleU1hemUucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdHZhciB3aWR0aCA9IHRoaXMuX3dpZHRoO1xuXHR2YXIgaGVpZ2h0ID0gdGhpcy5faGVpZ2h0O1xuXHRcblx0dmFyIG1hcCA9IHRoaXMuX2ZpbGxNYXAoMSk7XG5cdFxuXHR3aWR0aCAtPSAod2lkdGggJSAyID8gMSA6IDIpO1xuXHRoZWlnaHQgLT0gKGhlaWdodCAlIDIgPyAxIDogMik7XG5cblx0dmFyIGN4ID0gMDtcblx0dmFyIGN5ID0gMDtcblx0dmFyIG54ID0gMDtcblx0dmFyIG55ID0gMDtcblxuXHR2YXIgZG9uZSA9IDA7XG5cdHZhciBibG9ja2VkID0gZmFsc2U7XG5cdHZhciBkaXJzID0gW1xuXHRcdFswLCAwXSxcblx0XHRbMCwgMF0sXG5cdFx0WzAsIDBdLFxuXHRcdFswLCAwXVxuXHRdO1xuXHRkbyB7XG5cdFx0Y3ggPSAxICsgMipNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpKih3aWR0aC0xKSAvIDIpO1xuXHRcdGN5ID0gMSArIDIqTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSooaGVpZ2h0LTEpIC8gMik7XG5cblx0XHRpZiAoIWRvbmUpIHsgbWFwW2N4XVtjeV0gPSAwOyB9XG5cdFx0XG5cdFx0aWYgKCFtYXBbY3hdW2N5XSkge1xuXHRcdFx0dGhpcy5fcmFuZG9taXplKGRpcnMpO1xuXHRcdFx0ZG8ge1xuXHRcdFx0XHRpZiAoTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSoodGhpcy5fcmVndWxhcml0eSsxKSkgPT0gMCkgeyB0aGlzLl9yYW5kb21pemUoZGlycyk7IH1cblx0XHRcdFx0YmxvY2tlZCA9IHRydWU7XG5cdFx0XHRcdGZvciAodmFyIGk9MDtpPDQ7aSsrKSB7XG5cdFx0XHRcdFx0bnggPSBjeCArIGRpcnNbaV1bMF0qMjtcblx0XHRcdFx0XHRueSA9IGN5ICsgZGlyc1tpXVsxXSoyO1xuXHRcdFx0XHRcdGlmICh0aGlzLl9pc0ZyZWUobWFwLCBueCwgbnksIHdpZHRoLCBoZWlnaHQpKSB7XG5cdFx0XHRcdFx0XHRtYXBbbnhdW255XSA9IDA7XG5cdFx0XHRcdFx0XHRtYXBbY3ggKyBkaXJzW2ldWzBdXVtjeSArIGRpcnNbaV1bMV1dID0gMDtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0Y3ggPSBueDtcblx0XHRcdFx0XHRcdGN5ID0gbnk7XG5cdFx0XHRcdFx0XHRibG9ja2VkID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRkb25lKys7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gd2hpbGUgKCFibG9ja2VkKTtcblx0XHR9XG5cdH0gd2hpbGUgKGRvbmUrMSA8IHdpZHRoKmhlaWdodC80KTtcblx0XG5cdGZvciAodmFyIGk9MDtpPHRoaXMuX3dpZHRoO2krKykge1xuXHRcdGZvciAodmFyIGo9MDtqPHRoaXMuX2hlaWdodDtqKyspIHtcblx0XHRcdGNhbGxiYWNrKGksIGosIG1hcFtpXVtqXSk7XG5cdFx0fVxuXHR9XG5cdHRoaXMuX21hcCA9IG51bGw7XG5cdHJldHVybiB0aGlzO1xufVxuXG5ST1QuTWFwLkljZXlNYXplLnByb3RvdHlwZS5fcmFuZG9taXplID0gZnVuY3Rpb24oZGlycykge1xuXHRmb3IgKHZhciBpPTA7aTw0O2krKykge1xuXHRcdGRpcnNbaV1bMF0gPSAwO1xuXHRcdGRpcnNbaV1bMV0gPSAwO1xuXHR9XG5cdFxuXHRzd2l0Y2ggKE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkqNCkpIHtcblx0XHRjYXNlIDA6XG5cdFx0XHRkaXJzWzBdWzBdID0gLTE7IGRpcnNbMV1bMF0gPSAxO1xuXHRcdFx0ZGlyc1syXVsxXSA9IC0xOyBkaXJzWzNdWzFdID0gMTtcblx0XHRicmVhaztcblx0XHRjYXNlIDE6XG5cdFx0XHRkaXJzWzNdWzBdID0gLTE7IGRpcnNbMl1bMF0gPSAxO1xuXHRcdFx0ZGlyc1sxXVsxXSA9IC0xOyBkaXJzWzBdWzFdID0gMTtcblx0XHRicmVhaztcblx0XHRjYXNlIDI6XG5cdFx0XHRkaXJzWzJdWzBdID0gLTE7IGRpcnNbM11bMF0gPSAxO1xuXHRcdFx0ZGlyc1swXVsxXSA9IC0xOyBkaXJzWzFdWzFdID0gMTtcblx0XHRicmVhaztcblx0XHRjYXNlIDM6XG5cdFx0XHRkaXJzWzFdWzBdID0gLTE7IGRpcnNbMF1bMF0gPSAxO1xuXHRcdFx0ZGlyc1szXVsxXSA9IC0xOyBkaXJzWzJdWzFdID0gMTtcblx0XHRicmVhaztcblx0fVxufVxuXG5ST1QuTWFwLkljZXlNYXplLnByb3RvdHlwZS5faXNGcmVlID0gZnVuY3Rpb24obWFwLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG5cdGlmICh4IDwgMSB8fCB5IDwgMSB8fCB4ID49IHdpZHRoIHx8IHkgPj0gaGVpZ2h0KSB7IHJldHVybiBmYWxzZTsgfVxuXHRyZXR1cm4gbWFwW3hdW3ldO1xufVxuLyoqXG4gKiBAY2xhc3MgTWF6ZSBnZW5lcmF0b3IgLSBFbGxlcidzIGFsZ29yaXRobVxuICogU2VlIGh0dHA6Ly9ob21lcGFnZXMuY3dpLm5sL350cm9tcC9tYXplLmh0bWwgZm9yIGV4cGxhbmF0aW9uXG4gKiBAYXVnbWVudHMgUk9ULk1hcFxuICovXG5ST1QuTWFwLkVsbGVyTWF6ZSA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcblx0Uk9ULk1hcC5jYWxsKHRoaXMsIHdpZHRoLCBoZWlnaHQpO1xufVxuUk9ULk1hcC5FbGxlck1hemUuZXh0ZW5kKFJPVC5NYXApO1xuXG5ST1QuTWFwLkVsbGVyTWF6ZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0dmFyIG1hcCA9IHRoaXMuX2ZpbGxNYXAoMSk7XG5cdHZhciB3ID0gTWF0aC5jZWlsKCh0aGlzLl93aWR0aC0yKS8yKTtcblx0XG5cdHZhciByYW5kID0gOS8yNDtcblx0XG5cdHZhciBMID0gW107XG5cdHZhciBSID0gW107XG5cdFxuXHRmb3IgKHZhciBpPTA7aTx3O2krKykge1xuXHRcdEwucHVzaChpKTtcblx0XHRSLnB1c2goaSk7XG5cdH1cblx0TC5wdXNoKHctMSk7IC8qIGZha2Ugc3RvcC1ibG9jayBhdCB0aGUgcmlnaHQgc2lkZSAqL1xuXG5cdGZvciAodmFyIGo9MTtqKzM8dGhpcy5faGVpZ2h0O2orPTIpIHtcblx0XHQvKiBvbmUgcm93ICovXG5cdFx0Zm9yICh2YXIgaT0wO2k8dztpKyspIHtcblx0XHRcdC8qIGNlbGwgY29vcmRzICh3aWxsIGJlIGFsd2F5cyBlbXB0eSkgKi9cblx0XHRcdHZhciB4ID0gMippKzE7XG5cdFx0XHR2YXIgeSA9IGo7XG5cdFx0XHRtYXBbeF1beV0gPSAwO1xuXHRcdFx0XG5cdFx0XHQvKiByaWdodCBjb25uZWN0aW9uICovXG5cdFx0XHRpZiAoaSAhPSBMW2krMV0gJiYgUk9ULlJORy5nZXRVbmlmb3JtKCkgPiByYW5kKSB7XG5cdFx0XHRcdHRoaXMuX2FkZFRvTGlzdChpLCBMLCBSKTtcblx0XHRcdFx0bWFwW3grMV1beV0gPSAwO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiBib3R0b20gY29ubmVjdGlvbiAqL1xuXHRcdFx0aWYgKGkgIT0gTFtpXSAmJiBST1QuUk5HLmdldFVuaWZvcm0oKSA+IHJhbmQpIHtcblx0XHRcdFx0LyogcmVtb3ZlIGNvbm5lY3Rpb24gKi9cblx0XHRcdFx0dGhpcy5fcmVtb3ZlRnJvbUxpc3QoaSwgTCwgUik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvKiBjcmVhdGUgY29ubmVjdGlvbiAqL1xuXHRcdFx0XHRtYXBbeF1beSsxXSA9IDA7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyogbGFzdCByb3cgKi9cblx0Zm9yICh2YXIgaT0wO2k8dztpKyspIHtcblx0XHQvKiBjZWxsIGNvb3JkcyAod2lsbCBiZSBhbHdheXMgZW1wdHkpICovXG5cdFx0dmFyIHggPSAyKmkrMTtcblx0XHR2YXIgeSA9IGo7XG5cdFx0bWFwW3hdW3ldID0gMDtcblx0XHRcblx0XHQvKiByaWdodCBjb25uZWN0aW9uICovXG5cdFx0aWYgKGkgIT0gTFtpKzFdICYmIChpID09IExbaV0gfHwgUk9ULlJORy5nZXRVbmlmb3JtKCkgPiByYW5kKSkge1xuXHRcdFx0LyogZGlnIHJpZ2h0IGFsc28gaWYgdGhlIGNlbGwgaXMgc2VwYXJhdGVkLCBzbyBpdCBnZXRzIGNvbm5lY3RlZCB0byB0aGUgcmVzdCBvZiBtYXplICovXG5cdFx0XHR0aGlzLl9hZGRUb0xpc3QoaSwgTCwgUik7XG5cdFx0XHRtYXBbeCsxXVt5XSA9IDA7XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMuX3JlbW92ZUZyb21MaXN0KGksIEwsIFIpO1xuXHR9XG5cdFxuXHRmb3IgKHZhciBpPTA7aTx0aGlzLl93aWR0aDtpKyspIHtcblx0XHRmb3IgKHZhciBqPTA7ajx0aGlzLl9oZWlnaHQ7aisrKSB7XG5cdFx0XHRjYWxsYmFjayhpLCBqLCBtYXBbaV1bal0pO1xuXHRcdH1cblx0fVxuXHRcblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogUmVtb3ZlIFwiaVwiIGZyb20gaXRzIGxpc3RcbiAqL1xuUk9ULk1hcC5FbGxlck1hemUucHJvdG90eXBlLl9yZW1vdmVGcm9tTGlzdCA9IGZ1bmN0aW9uKGksIEwsIFIpIHtcblx0UltMW2ldXSA9IFJbaV07XG5cdExbUltpXV0gPSBMW2ldO1xuXHRSW2ldID0gaTtcblx0TFtpXSA9IGk7XG59XG5cbi8qKlxuICogSm9pbiBsaXN0cyB3aXRoIFwiaVwiIGFuZCBcImkrMVwiXG4gKi9cblJPVC5NYXAuRWxsZXJNYXplLnByb3RvdHlwZS5fYWRkVG9MaXN0ID0gZnVuY3Rpb24oaSwgTCwgUikge1xuXHRSW0xbaSsxXV0gPSBSW2ldO1xuXHRMW1JbaV1dID0gTFtpKzFdO1xuXHRSW2ldID0gaSsxO1xuXHRMW2krMV0gPSBpO1xufVxuLyoqXG4gKiBAY2xhc3MgQ2VsbHVsYXIgYXV0b21hdG9uIG1hcCBnZW5lcmF0b3JcbiAqIEBhdWdtZW50cyBST1QuTWFwXG4gKiBAcGFyYW0ge2ludH0gW3dpZHRoPVJPVC5ERUZBVUxUX1dJRFRIXVxuICogQHBhcmFtIHtpbnR9IFtoZWlnaHQ9Uk9ULkRFRkFVTFRfSEVJR0hUXVxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSBPcHRpb25zXG4gKiBAcGFyYW0ge2ludFtdfSBbb3B0aW9ucy5ib3JuXSBMaXN0IG9mIG5laWdoYm9yIGNvdW50cyBmb3IgYSBuZXcgY2VsbCB0byBiZSBib3JuIGluIGVtcHR5IHNwYWNlXG4gKiBAcGFyYW0ge2ludFtdfSBbb3B0aW9ucy5zdXJ2aXZlXSBMaXN0IG9mIG5laWdoYm9yIGNvdW50cyBmb3IgYW4gZXhpc3RpbmcgIGNlbGwgdG8gc3Vydml2ZVxuICogQHBhcmFtIHtpbnR9IFtvcHRpb25zLnRvcG9sb2d5XSBUb3BvbG9neSA0IG9yIDYgb3IgOFxuICovXG5ST1QuTWFwLkNlbGx1bGFyID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCwgb3B0aW9ucykge1xuXHRST1QuTWFwLmNhbGwodGhpcywgd2lkdGgsIGhlaWdodCk7XG5cdHRoaXMuX29wdGlvbnMgPSB7XG5cdFx0Ym9ybjogWzUsIDYsIDcsIDhdLFxuXHRcdHN1cnZpdmU6IFs0LCA1LCA2LCA3LCA4XSxcblx0XHR0b3BvbG9neTogOFxuXHR9O1xuXHR0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG5cdFxuXHR0aGlzLl9kaXJzID0gUk9ULkRJUlNbdGhpcy5fb3B0aW9ucy50b3BvbG9neV07XG5cdHRoaXMuX21hcCA9IHRoaXMuX2ZpbGxNYXAoMCk7XG59XG5ST1QuTWFwLkNlbGx1bGFyLmV4dGVuZChST1QuTWFwKTtcblxuLyoqXG4gKiBGaWxsIHRoZSBtYXAgd2l0aCByYW5kb20gdmFsdWVzXG4gKiBAcGFyYW0ge2Zsb2F0fSBwcm9iYWJpbGl0eSBQcm9iYWJpbGl0eSBmb3IgYSBjZWxsIHRvIGJlY29tZSBhbGl2ZTsgMCA9IGFsbCBlbXB0eSwgMSA9IGFsbCBmdWxsXG4gKi9cblJPVC5NYXAuQ2VsbHVsYXIucHJvdG90eXBlLnJhbmRvbWl6ZSA9IGZ1bmN0aW9uKHByb2JhYmlsaXR5KSB7XG5cdGZvciAodmFyIGk9MDtpPHRoaXMuX3dpZHRoO2krKykge1xuXHRcdGZvciAodmFyIGo9MDtqPHRoaXMuX2hlaWdodDtqKyspIHtcblx0XHRcdHRoaXMuX21hcFtpXVtqXSA9IChST1QuUk5HLmdldFVuaWZvcm0oKSA8IHByb2JhYmlsaXR5ID8gMSA6IDApO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBDaGFuZ2Ugb3B0aW9ucy5cbiAqIEBzZWUgUk9ULk1hcC5DZWxsdWxhclxuICovXG5ST1QuTWFwLkNlbGx1bGFyLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXHRmb3IgKHZhciBwIGluIG9wdGlvbnMpIHsgdGhpcy5fb3B0aW9uc1twXSA9IG9wdGlvbnNbcF07IH1cbn1cblxuUk9ULk1hcC5DZWxsdWxhci5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oeCwgeSwgdmFsdWUpIHtcblx0dGhpcy5fbWFwW3hdW3ldID0gdmFsdWU7XG59XG5cblJPVC5NYXAuQ2VsbHVsYXIucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdHZhciBuZXdNYXAgPSB0aGlzLl9maWxsTWFwKDApO1xuXHR2YXIgYm9ybiA9IHRoaXMuX29wdGlvbnMuYm9ybjtcblx0dmFyIHN1cnZpdmUgPSB0aGlzLl9vcHRpb25zLnN1cnZpdmU7XG5cblxuXHRmb3IgKHZhciBqPTA7ajx0aGlzLl9oZWlnaHQ7aisrKSB7XG5cdFx0dmFyIHdpZHRoU3RlcCA9IDE7XG5cdFx0dmFyIHdpZHRoU3RhcnQgPSAwO1xuXHRcdGlmICh0aGlzLl9vcHRpb25zLnRvcG9sb2d5ID09IDYpIHsgXG5cdFx0XHR3aWR0aFN0ZXAgPSAyO1xuXHRcdFx0d2lkdGhTdGFydCA9IGolMjtcblx0XHR9XG5cblx0XHRmb3IgKHZhciBpPXdpZHRoU3RhcnQ7IGk8dGhpcy5fd2lkdGg7IGkrPXdpZHRoU3RlcCkge1xuXG5cdFx0XHR2YXIgY3VyID0gdGhpcy5fbWFwW2ldW2pdO1xuXHRcdFx0dmFyIG5jb3VudCA9IHRoaXMuX2dldE5laWdoYm9ycyhpLCBqKTtcblx0XHRcdFxuXHRcdFx0aWYgKGN1ciAmJiBzdXJ2aXZlLmluZGV4T2YobmNvdW50KSAhPSAtMSkgeyAvKiBzdXJ2aXZlICovXG5cdFx0XHRcdG5ld01hcFtpXVtqXSA9IDE7XG5cdFx0XHR9IGVsc2UgaWYgKCFjdXIgJiYgYm9ybi5pbmRleE9mKG5jb3VudCkgIT0gLTEpIHsgLyogYm9ybiAqL1xuXHRcdFx0XHRuZXdNYXBbaV1bal0gPSAxO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRpZiAoY2FsbGJhY2spIHsgY2FsbGJhY2soaSwgaiwgbmV3TWFwW2ldW2pdKTsgfVxuXHRcdH1cblx0fVxuXHRcblx0dGhpcy5fbWFwID0gbmV3TWFwO1xufVxuXG4vKipcbiAqIEdldCBuZWlnaGJvciBjb3VudCBhdCBbaSxqXSBpbiB0aGlzLl9tYXBcbiAqL1xuUk9ULk1hcC5DZWxsdWxhci5wcm90b3R5cGUuX2dldE5laWdoYm9ycyA9IGZ1bmN0aW9uKGN4LCBjeSkge1xuXHR2YXIgcmVzdWx0ID0gMDtcblx0Zm9yICh2YXIgaT0wO2k8dGhpcy5fZGlycy5sZW5ndGg7aSsrKSB7XG5cdFx0dmFyIGRpciA9IHRoaXMuX2RpcnNbaV07XG5cdFx0dmFyIHggPSBjeCArIGRpclswXTtcblx0XHR2YXIgeSA9IGN5ICsgZGlyWzFdO1xuXHRcdFxuXHRcdGlmICh4IDwgMCB8fCB4ID49IHRoaXMuX3dpZHRoIHx8IHggPCAwIHx8IHkgPj0gdGhpcy5fd2lkdGgpIHsgY29udGludWU7IH1cblx0XHRyZXN1bHQgKz0gKHRoaXMuX21hcFt4XVt5XSA9PSAxID8gMSA6IDApO1xuXHR9XG5cdFxuXHRyZXR1cm4gcmVzdWx0O1xufVxuLyoqXG4gKiBAY2xhc3MgRHVuZ2VvbiBtYXA6IGhhcyByb29tcyBhbmQgY29ycmlkb3JzXG4gKiBAYXVnbWVudHMgUk9ULk1hcFxuICovXG5ST1QuTWFwLkR1bmdlb24gPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG5cdFJPVC5NYXAuY2FsbCh0aGlzLCB3aWR0aCwgaGVpZ2h0KTtcblx0dGhpcy5fcm9vbXMgPSBbXTsgLyogbGlzdCBvZiBhbGwgcm9vbXMgKi9cblx0dGhpcy5fY29ycmlkb3JzID0gW107XG59XG5ST1QuTWFwLkR1bmdlb24uZXh0ZW5kKFJPVC5NYXApO1xuXG4vKipcbiAqIEdldCBhbGwgZ2VuZXJhdGVkIHJvb21zXG4gKiBAcmV0dXJucyB7Uk9ULk1hcC5GZWF0dXJlLlJvb21bXX1cbiAqL1xuUk9ULk1hcC5EdW5nZW9uLnByb3RvdHlwZS5nZXRSb29tcyA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5fcm9vbXM7XG59XG5cbi8qKlxuICogR2V0IGFsbCBnZW5lcmF0ZWQgY29ycmlkb3JzXG4gKiBAcmV0dXJucyB7Uk9ULk1hcC5GZWF0dXJlLkNvcnJpZG9yW119XG4gKi9cblJPVC5NYXAuRHVuZ2Vvbi5wcm90b3R5cGUuZ2V0Q29ycmlkb3JzID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLl9jb3JyaWRvcnM7XG59XG4vKipcbiAqIEBjbGFzcyBSYW5kb20gZHVuZ2VvbiBnZW5lcmF0b3IgdXNpbmcgaHVtYW4tbGlrZSBkaWdnaW5nIHBhdHRlcm5zLlxuICogSGVhdmlseSBiYXNlZCBvbiBNaWtlIEFuZGVyc29uJ3MgaWRlYXMgZnJvbSB0aGUgXCJUeXJhbnRcIiBhbGdvLCBtZW50aW9uZWQgYXQgXG4gKiBodHRwOi8vd3d3LnJvZ3VlYmFzaW4ucm9ndWVsaWtlZGV2ZWxvcG1lbnQub3JnL2luZGV4LnBocD90aXRsZT1EdW5nZW9uLUJ1aWxkaW5nX0FsZ29yaXRobS5cbiAqIEBhdWdtZW50cyBST1QuTWFwLkR1bmdlb25cbiAqL1xuUk9ULk1hcC5EaWdnZXIgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0LCBvcHRpb25zKSB7XG5cdFJPVC5NYXAuRHVuZ2Vvbi5jYWxsKHRoaXMsIHdpZHRoLCBoZWlnaHQpO1xuXHRcblx0dGhpcy5fb3B0aW9ucyA9IHtcblx0XHRyb29tV2lkdGg6IFszLCA5XSwgLyogcm9vbSBtaW5pbXVtIGFuZCBtYXhpbXVtIHdpZHRoICovXG5cdFx0cm9vbUhlaWdodDogWzMsIDVdLCAvKiByb29tIG1pbmltdW0gYW5kIG1heGltdW0gaGVpZ2h0ICovXG5cdFx0Y29ycmlkb3JMZW5ndGg6IFszLCAxMF0sIC8qIGNvcnJpZG9yIG1pbmltdW0gYW5kIG1heGltdW0gbGVuZ3RoICovXG5cdFx0ZHVnUGVyY2VudGFnZTogMC4yLCAvKiB3ZSBzdG9wIGFmdGVyIHRoaXMgcGVyY2VudGFnZSBvZiBsZXZlbCBhcmVhIGhhcyBiZWVuIGR1ZyBvdXQgKi9cblx0XHR0aW1lTGltaXQ6IDEwMDAgLyogd2Ugc3RvcCBhZnRlciB0aGlzIG11Y2ggdGltZSBoYXMgcGFzc2VkIChtc2VjKSAqL1xuXHR9XG5cdGZvciAodmFyIHAgaW4gb3B0aW9ucykgeyB0aGlzLl9vcHRpb25zW3BdID0gb3B0aW9uc1twXTsgfVxuXHRcblx0dGhpcy5fZmVhdHVyZXMgPSB7XG5cdFx0XCJSb29tXCI6IDQsXG5cdFx0XCJDb3JyaWRvclwiOiA0XG5cdH1cblx0dGhpcy5fZmVhdHVyZUF0dGVtcHRzID0gMjA7IC8qIGhvdyBtYW55IHRpbWVzIGRvIHdlIHRyeSB0byBjcmVhdGUgYSBmZWF0dXJlIG9uIGEgc3VpdGFibGUgd2FsbCAqL1xuXHR0aGlzLl93YWxscyA9IHt9OyAvKiB0aGVzZSBhcmUgYXZhaWxhYmxlIGZvciBkaWdnaW5nICovXG5cdFxuXHR0aGlzLl9kaWdDYWxsYmFjayA9IHRoaXMuX2RpZ0NhbGxiYWNrLmJpbmQodGhpcyk7XG5cdHRoaXMuX2NhbkJlRHVnQ2FsbGJhY2sgPSB0aGlzLl9jYW5CZUR1Z0NhbGxiYWNrLmJpbmQodGhpcyk7XG5cdHRoaXMuX2lzV2FsbENhbGxiYWNrID0gdGhpcy5faXNXYWxsQ2FsbGJhY2suYmluZCh0aGlzKTtcblx0dGhpcy5fcHJpb3JpdHlXYWxsQ2FsbGJhY2sgPSB0aGlzLl9wcmlvcml0eVdhbGxDYWxsYmFjay5iaW5kKHRoaXMpO1xufVxuUk9ULk1hcC5EaWdnZXIuZXh0ZW5kKFJPVC5NYXAuRHVuZ2Vvbik7XG5cbi8qKlxuICogQ3JlYXRlIGEgbWFwXG4gKiBAc2VlIFJPVC5NYXAjY3JlYXRlXG4gKi9cblJPVC5NYXAuRGlnZ2VyLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHR0aGlzLl9yb29tcyA9IFtdO1xuXHR0aGlzLl9jb3JyaWRvcnMgPSBbXTtcblx0dGhpcy5fbWFwID0gdGhpcy5fZmlsbE1hcCgxKTtcblx0dGhpcy5fd2FsbHMgPSB7fTtcblx0dGhpcy5fZHVnID0gMDtcblx0dmFyIGFyZWEgPSAodGhpcy5fd2lkdGgtMikgKiAodGhpcy5faGVpZ2h0LTIpO1xuXG5cdHRoaXMuX2ZpcnN0Um9vbSgpO1xuXHRcblx0dmFyIHQxID0gRGF0ZS5ub3coKTtcblxuXHRkbyB7XG5cdFx0dmFyIHQyID0gRGF0ZS5ub3coKTtcblx0XHRpZiAodDIgLSB0MSA+IHRoaXMuX29wdGlvbnMudGltZUxpbWl0KSB7IGJyZWFrOyB9XG5cblx0XHQvKiBmaW5kIGEgZ29vZCB3YWxsICovXG5cdFx0dmFyIHdhbGwgPSB0aGlzLl9maW5kV2FsbCgpO1xuXHRcdGlmICghd2FsbCkgeyBicmVhazsgfSAvKiBubyBtb3JlIHdhbGxzICovXG5cdFx0XG5cdFx0dmFyIHBhcnRzID0gd2FsbC5zcGxpdChcIixcIik7XG5cdFx0dmFyIHggPSBwYXJzZUludChwYXJ0c1swXSk7XG5cdFx0dmFyIHkgPSBwYXJzZUludChwYXJ0c1sxXSk7XG5cdFx0dmFyIGRpciA9IHRoaXMuX2dldERpZ2dpbmdEaXJlY3Rpb24oeCwgeSk7XG5cdFx0aWYgKCFkaXIpIHsgY29udGludWU7IH0gLyogdGhpcyB3YWxsIGlzIG5vdCBzdWl0YWJsZSAqL1xuXHRcdFxuLy9cdFx0Y29uc29sZS5sb2coXCJ3YWxsXCIsIHgsIHkpO1xuXG5cdFx0LyogdHJ5IGFkZGluZyBhIGZlYXR1cmUgKi9cblx0XHR2YXIgZmVhdHVyZUF0dGVtcHRzID0gMDtcblx0XHRkbyB7XG5cdFx0XHRmZWF0dXJlQXR0ZW1wdHMrKztcblx0XHRcdGlmICh0aGlzLl90cnlGZWF0dXJlKHgsIHksIGRpclswXSwgZGlyWzFdKSkgeyAvKiBmZWF0dXJlIGFkZGVkICovXG5cdFx0XHRcdC8vaWYgKHRoaXMuX3Jvb21zLmxlbmd0aCArIHRoaXMuX2NvcnJpZG9ycy5sZW5ndGggPT0gMikgeyB0aGlzLl9yb29tc1swXS5hZGREb29yKHgsIHkpOyB9IC8qIGZpcnN0IHJvb20gb2ZpY2lhbGx5IGhhcyBkb29ycyAqL1xuXHRcdFx0XHR0aGlzLl9yZW1vdmVTdXJyb3VuZGluZ1dhbGxzKHgsIHkpO1xuXHRcdFx0XHR0aGlzLl9yZW1vdmVTdXJyb3VuZGluZ1dhbGxzKHgtZGlyWzBdLCB5LWRpclsxXSk7XG5cdFx0XHRcdGJyZWFrOyBcblx0XHRcdH1cblx0XHR9IHdoaWxlIChmZWF0dXJlQXR0ZW1wdHMgPCB0aGlzLl9mZWF0dXJlQXR0ZW1wdHMpO1xuXHRcdFxuXHRcdHZhciBwcmlvcml0eVdhbGxzID0gMDtcblx0XHRmb3IgKHZhciBpZCBpbiB0aGlzLl93YWxscykgeyBcblx0XHRcdGlmICh0aGlzLl93YWxsc1tpZF0gPiAxKSB7IHByaW9yaXR5V2FsbHMrKzsgfVxuXHRcdH1cblxuXHR9IHdoaWxlICh0aGlzLl9kdWcvYXJlYSA8IHRoaXMuX29wdGlvbnMuZHVnUGVyY2VudGFnZSB8fCBwcmlvcml0eVdhbGxzKTsgLyogZml4bWUgbnVtYmVyIG9mIHByaW9yaXR5IHdhbGxzICovXG5cblx0dGhpcy5fYWRkRG9vcnMoKTtcblxuXHRpZiAoY2FsbGJhY2spIHtcblx0XHRmb3IgKHZhciBpPTA7aTx0aGlzLl93aWR0aDtpKyspIHtcblx0XHRcdGZvciAodmFyIGo9MDtqPHRoaXMuX2hlaWdodDtqKyspIHtcblx0XHRcdFx0Y2FsbGJhY2soaSwgaiwgdGhpcy5fbWFwW2ldW2pdKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0XG5cdHRoaXMuX3dhbGxzID0ge307XG5cdHRoaXMuX21hcCA9IG51bGw7XG5cblx0cmV0dXJuIHRoaXM7XG59XG5cblJPVC5NYXAuRGlnZ2VyLnByb3RvdHlwZS5fZGlnQ2FsbGJhY2sgPSBmdW5jdGlvbih4LCB5LCB2YWx1ZSkge1xuXHRpZiAodmFsdWUgPT0gMCB8fCB2YWx1ZSA9PSAyKSB7IC8qIGVtcHR5ICovXG5cdFx0dGhpcy5fbWFwW3hdW3ldID0gMDtcblx0XHR0aGlzLl9kdWcrKztcblx0fSBlbHNlIHsgLyogd2FsbCAqL1xuXHRcdHRoaXMuX3dhbGxzW3grXCIsXCIreV0gPSAxO1xuXHR9XG59XG5cblJPVC5NYXAuRGlnZ2VyLnByb3RvdHlwZS5faXNXYWxsQ2FsbGJhY2sgPSBmdW5jdGlvbih4LCB5KSB7XG5cdGlmICh4IDwgMCB8fCB5IDwgMCB8fCB4ID49IHRoaXMuX3dpZHRoIHx8IHkgPj0gdGhpcy5faGVpZ2h0KSB7IHJldHVybiBmYWxzZTsgfVxuXHRyZXR1cm4gKHRoaXMuX21hcFt4XVt5XSA9PSAxKTtcbn1cblxuUk9ULk1hcC5EaWdnZXIucHJvdG90eXBlLl9jYW5CZUR1Z0NhbGxiYWNrID0gZnVuY3Rpb24oeCwgeSkge1xuXHRpZiAoeCA8IDEgfHwgeSA8IDEgfHwgeCsxID49IHRoaXMuX3dpZHRoIHx8IHkrMSA+PSB0aGlzLl9oZWlnaHQpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdHJldHVybiAodGhpcy5fbWFwW3hdW3ldID09IDEpO1xufVxuXG5ST1QuTWFwLkRpZ2dlci5wcm90b3R5cGUuX3ByaW9yaXR5V2FsbENhbGxiYWNrID0gZnVuY3Rpb24oeCwgeSkge1xuXHR0aGlzLl93YWxsc1t4K1wiLFwiK3ldID0gMjtcbn1cblxuUk9ULk1hcC5EaWdnZXIucHJvdG90eXBlLl9maXJzdFJvb20gPSBmdW5jdGlvbigpIHtcblx0dmFyIGN4ID0gTWF0aC5mbG9vcih0aGlzLl93aWR0aC8yKTtcblx0dmFyIGN5ID0gTWF0aC5mbG9vcih0aGlzLl9oZWlnaHQvMik7XG5cdHZhciByb29tID0gUk9ULk1hcC5GZWF0dXJlLlJvb20uY3JlYXRlUmFuZG9tQ2VudGVyKGN4LCBjeSwgdGhpcy5fb3B0aW9ucyk7XG5cdHRoaXMuX3Jvb21zLnB1c2gocm9vbSk7XG5cdHJvb20uY3JlYXRlKHRoaXMuX2RpZ0NhbGxiYWNrKTtcbn1cblxuLyoqXG4gKiBHZXQgYSBzdWl0YWJsZSB3YWxsXG4gKi9cblJPVC5NYXAuRGlnZ2VyLnByb3RvdHlwZS5fZmluZFdhbGwgPSBmdW5jdGlvbigpIHtcblx0dmFyIHByaW8xID0gW107XG5cdHZhciBwcmlvMiA9IFtdO1xuXHRmb3IgKHZhciBpZCBpbiB0aGlzLl93YWxscykge1xuXHRcdHZhciBwcmlvID0gdGhpcy5fd2FsbHNbaWRdO1xuXHRcdGlmIChwcmlvID09IDIpIHsgXG5cdFx0XHRwcmlvMi5wdXNoKGlkKTsgXG5cdFx0fSBlbHNlIHtcblx0XHRcdHByaW8xLnB1c2goaWQpO1xuXHRcdH1cblx0fVxuXHRcblx0dmFyIGFyciA9IChwcmlvMi5sZW5ndGggPyBwcmlvMiA6IHByaW8xKTtcblx0aWYgKCFhcnIubGVuZ3RoKSB7IHJldHVybiBudWxsOyB9IC8qIG5vIHdhbGxzIDovICovXG5cdFxuXHR2YXIgaWQgPSBhcnIucmFuZG9tKCk7XG5cdGRlbGV0ZSB0aGlzLl93YWxsc1tpZF07XG5cblx0cmV0dXJuIGlkO1xufVxuXG4vKipcbiAqIFRyaWVzIGFkZGluZyBhIGZlYXR1cmVcbiAqIEByZXR1cm5zIHtib29sfSB3YXMgdGhpcyBhIHN1Y2Nlc3NmdWwgdHJ5P1xuICovXG5ST1QuTWFwLkRpZ2dlci5wcm90b3R5cGUuX3RyeUZlYXR1cmUgPSBmdW5jdGlvbih4LCB5LCBkeCwgZHkpIHtcblx0dmFyIGZlYXR1cmUgPSBST1QuUk5HLmdldFdlaWdodGVkVmFsdWUodGhpcy5fZmVhdHVyZXMpO1xuXHRmZWF0dXJlID0gUk9ULk1hcC5GZWF0dXJlW2ZlYXR1cmVdLmNyZWF0ZVJhbmRvbUF0KHgsIHksIGR4LCBkeSwgdGhpcy5fb3B0aW9ucyk7XG5cdFxuXHRpZiAoIWZlYXR1cmUuaXNWYWxpZCh0aGlzLl9pc1dhbGxDYWxsYmFjaywgdGhpcy5fY2FuQmVEdWdDYWxsYmFjaykpIHtcbi8vXHRcdGNvbnNvbGUubG9nKFwibm90IHZhbGlkXCIpO1xuLy9cdFx0ZmVhdHVyZS5kZWJ1ZygpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRcblx0ZmVhdHVyZS5jcmVhdGUodGhpcy5fZGlnQ2FsbGJhY2spO1xuLy9cdGZlYXR1cmUuZGVidWcoKTtcblxuXHRpZiAoZmVhdHVyZSBpbnN0YW5jZW9mIFJPVC5NYXAuRmVhdHVyZS5Sb29tKSB7IHRoaXMuX3Jvb21zLnB1c2goZmVhdHVyZSk7IH1cblx0aWYgKGZlYXR1cmUgaW5zdGFuY2VvZiBST1QuTWFwLkZlYXR1cmUuQ29ycmlkb3IpIHsgXG5cdFx0ZmVhdHVyZS5jcmVhdGVQcmlvcml0eVdhbGxzKHRoaXMuX3ByaW9yaXR5V2FsbENhbGxiYWNrKTtcblx0XHR0aGlzLl9jb3JyaWRvcnMucHVzaChmZWF0dXJlKTsgXG5cdH1cblx0XG5cdHJldHVybiB0cnVlO1xufVxuXG5ST1QuTWFwLkRpZ2dlci5wcm90b3R5cGUuX3JlbW92ZVN1cnJvdW5kaW5nV2FsbHMgPSBmdW5jdGlvbihjeCwgY3kpIHtcblx0dmFyIGRlbHRhcyA9IFJPVC5ESVJTWzRdO1xuXG5cdGZvciAodmFyIGk9MDtpPGRlbHRhcy5sZW5ndGg7aSsrKSB7XG5cdFx0dmFyIGRlbHRhID0gZGVsdGFzW2ldO1xuXHRcdHZhciB4ID0gY3ggKyBkZWx0YVswXTtcblx0XHR2YXIgeSA9IGN5ICsgZGVsdGFbMV07XG5cdFx0ZGVsZXRlIHRoaXMuX3dhbGxzW3grXCIsXCIreV07XG5cdFx0dmFyIHggPSBjeCArIDIqZGVsdGFbMF07XG5cdFx0dmFyIHkgPSBjeSArIDIqZGVsdGFbMV07XG5cdFx0ZGVsZXRlIHRoaXMuX3dhbGxzW3grXCIsXCIreV07XG5cdH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHZlY3RvciBpbiBcImRpZ2dpbmdcIiBkaXJlY3Rpb24sIG9yIGZhbHNlLCBpZiB0aGlzIGRvZXMgbm90IGV4aXN0IChvciBpcyBub3QgdW5pcXVlKVxuICovXG5ST1QuTWFwLkRpZ2dlci5wcm90b3R5cGUuX2dldERpZ2dpbmdEaXJlY3Rpb24gPSBmdW5jdGlvbihjeCwgY3kpIHtcblx0dmFyIHJlc3VsdCA9IG51bGw7XG5cdHZhciBkZWx0YXMgPSBST1QuRElSU1s0XTtcblx0XG5cdGZvciAodmFyIGk9MDtpPGRlbHRhcy5sZW5ndGg7aSsrKSB7XG5cdFx0dmFyIGRlbHRhID0gZGVsdGFzW2ldO1xuXHRcdHZhciB4ID0gY3ggKyBkZWx0YVswXTtcblx0XHR2YXIgeSA9IGN5ICsgZGVsdGFbMV07XG5cdFx0XG5cdFx0aWYgKHggPCAwIHx8IHkgPCAwIHx8IHggPj0gdGhpcy5fd2lkdGggfHwgeSA+PSB0aGlzLl93aWR0aCkgeyByZXR1cm4gbnVsbDsgfVxuXHRcdFxuXHRcdGlmICghdGhpcy5fbWFwW3hdW3ldKSB7IC8qIHRoZXJlIGFscmVhZHkgaXMgYW5vdGhlciBlbXB0eSBuZWlnaGJvciEgKi9cblx0XHRcdGlmIChyZXN1bHQpIHsgcmV0dXJuIG51bGw7IH1cblx0XHRcdHJlc3VsdCA9IGRlbHRhO1xuXHRcdH1cblx0fVxuXHRcblx0Lyogbm8gZW1wdHkgbmVpZ2hib3IgKi9cblx0aWYgKCFyZXN1bHQpIHsgcmV0dXJuIG51bGw7IH1cblx0XG5cdHJldHVybiBbLXJlc3VsdFswXSwgLXJlc3VsdFsxXV07XG59XG5cbi8qKlxuICogRmluZCBlbXB0eSBzcGFjZXMgc3Vycm91bmRpbmcgcm9vbXMsIGFuZCBhcHBseSBkb29ycy5cbiAqL1xuUk9ULk1hcC5EaWdnZXIucHJvdG90eXBlLl9hZGREb29ycyA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgZGF0YSA9IHRoaXMuX21hcDtcblx0dmFyIGlzV2FsbENhbGxiYWNrID0gZnVuY3Rpb24oeCwgeSkge1xuXHRcdHJldHVybiAoZGF0YVt4XVt5XSA9PSAxKTtcblx0fVxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3Jvb21zLmxlbmd0aDsgaSsrICkge1xuXHRcdHZhciByb29tID0gdGhpcy5fcm9vbXNbaV07XG5cdFx0cm9vbS5jbGVhckRvb3JzKCk7XG5cdFx0cm9vbS5hZGREb29ycyhpc1dhbGxDYWxsYmFjayk7XG5cdH1cbn1cbi8qKlxuICogQGNsYXNzIER1bmdlb24gZ2VuZXJhdG9yIHdoaWNoIHRyaWVzIHRvIGZpbGwgdGhlIHNwYWNlIGV2ZW5seS4gR2VuZXJhdGVzIGluZGVwZW5kZW50IHJvb21zIGFuZCB0cmllcyB0byBjb25uZWN0IHRoZW0uXG4gKiBAYXVnbWVudHMgUk9ULk1hcC5EdW5nZW9uXG4gKi9cblJPVC5NYXAuVW5pZm9ybSA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQsIG9wdGlvbnMpIHtcblx0Uk9ULk1hcC5EdW5nZW9uLmNhbGwodGhpcywgd2lkdGgsIGhlaWdodCk7XG5cblx0dGhpcy5fb3B0aW9ucyA9IHtcblx0XHRyb29tV2lkdGg6IFszLCA5XSwgLyogcm9vbSBtaW5pbXVtIGFuZCBtYXhpbXVtIHdpZHRoICovXG5cdFx0cm9vbUhlaWdodDogWzMsIDVdLCAvKiByb29tIG1pbmltdW0gYW5kIG1heGltdW0gaGVpZ2h0ICovXG5cdFx0cm9vbUR1Z1BlcmNlbnRhZ2U6IDAuMSwgLyogd2Ugc3RvcCBhZnRlciB0aGlzIHBlcmNlbnRhZ2Ugb2YgbGV2ZWwgYXJlYSBoYXMgYmVlbiBkdWcgb3V0IGJ5IHJvb21zICovXG5cdFx0dGltZUxpbWl0OiAxMDAwIC8qIHdlIHN0b3AgYWZ0ZXIgdGhpcyBtdWNoIHRpbWUgaGFzIHBhc3NlZCAobXNlYykgKi9cblx0fVxuXHRmb3IgKHZhciBwIGluIG9wdGlvbnMpIHsgdGhpcy5fb3B0aW9uc1twXSA9IG9wdGlvbnNbcF07IH1cblxuXHR0aGlzLl9yb29tQXR0ZW1wdHMgPSAyMDsgLyogbmV3IHJvb20gaXMgY3JlYXRlZCBOLXRpbWVzIHVudGlsIGlzIGNvbnNpZGVyZWQgYXMgaW1wb3NzaWJsZSB0byBnZW5lcmF0ZSAqL1xuXHR0aGlzLl9jb3JyaWRvckF0dGVtcHRzID0gMjA7IC8qIGNvcnJpZG9ycyBhcmUgdHJpZWQgTi10aW1lcyB1bnRpbCB0aGUgbGV2ZWwgaXMgY29uc2lkZXJlZCBhcyBpbXBvc3NpYmxlIHRvIGNvbm5lY3QgKi9cblxuXHR0aGlzLl9jb25uZWN0ZWQgPSBbXTsgLyogbGlzdCBvZiBhbHJlYWR5IGNvbm5lY3RlZCByb29tcyAqL1xuXHR0aGlzLl91bmNvbm5lY3RlZCA9IFtdOyAvKiBsaXN0IG9mIHJlbWFpbmluZyB1bmNvbm5lY3RlZCByb29tcyAqL1xuXHRcblx0dGhpcy5fZGlnQ2FsbGJhY2sgPSB0aGlzLl9kaWdDYWxsYmFjay5iaW5kKHRoaXMpO1xuXHR0aGlzLl9jYW5CZUR1Z0NhbGxiYWNrID0gdGhpcy5fY2FuQmVEdWdDYWxsYmFjay5iaW5kKHRoaXMpO1xuXHR0aGlzLl9pc1dhbGxDYWxsYmFjayA9IHRoaXMuX2lzV2FsbENhbGxiYWNrLmJpbmQodGhpcyk7XG59XG5ST1QuTWFwLlVuaWZvcm0uZXh0ZW5kKFJPVC5NYXAuRHVuZ2Vvbik7XG5cbi8qKlxuICogQ3JlYXRlIGEgbWFwLiBJZiB0aGUgdGltZSBsaW1pdCBoYXMgYmVlbiBoaXQsIHJldHVybnMgbnVsbC5cbiAqIEBzZWUgUk9ULk1hcCNjcmVhdGVcbiAqL1xuUk9ULk1hcC5Vbmlmb3JtLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHR2YXIgdDEgPSBEYXRlLm5vdygpO1xuXHR3aGlsZSAoMSkge1xuXHRcdHZhciB0MiA9IERhdGUubm93KCk7XG5cdFx0aWYgKHQyIC0gdDEgPiB0aGlzLl9vcHRpb25zLnRpbWVMaW1pdCkgeyByZXR1cm4gbnVsbDsgfSAvKiB0aW1lIGxpbWl0ISAqL1xuXHRcblx0XHR0aGlzLl9tYXAgPSB0aGlzLl9maWxsTWFwKDEpO1xuXHRcdHRoaXMuX2R1ZyA9IDA7XG5cdFx0dGhpcy5fcm9vbXMgPSBbXTtcblx0XHR0aGlzLl91bmNvbm5lY3RlZCA9IFtdO1xuXHRcdHRoaXMuX2dlbmVyYXRlUm9vbXMoKTtcblx0XHRpZiAodGhpcy5fcm9vbXMubGVuZ3RoIDwgMikgeyBjb250aW51ZTsgfVxuXHRcdGlmICh0aGlzLl9nZW5lcmF0ZUNvcnJpZG9ycygpKSB7IGJyZWFrOyB9XG5cdH1cblx0XG5cdGlmIChjYWxsYmFjaykge1xuXHRcdGZvciAodmFyIGk9MDtpPHRoaXMuX3dpZHRoO2krKykge1xuXHRcdFx0Zm9yICh2YXIgaj0wO2o8dGhpcy5faGVpZ2h0O2orKykge1xuXHRcdFx0XHRjYWxsYmFjayhpLCBqLCB0aGlzLl9tYXBbaV1bal0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRcblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgc3VpdGFibGUgYW1vdW50IG9mIHJvb21zXG4gKi9cblJPVC5NYXAuVW5pZm9ybS5wcm90b3R5cGUuX2dlbmVyYXRlUm9vbXMgPSBmdW5jdGlvbigpIHtcblx0dmFyIHcgPSB0aGlzLl93aWR0aC0yO1xuXHR2YXIgaCA9IHRoaXMuX2hlaWdodC0yO1xuXG5cdGRvIHtcblx0XHR2YXIgcm9vbSA9IHRoaXMuX2dlbmVyYXRlUm9vbSgpO1xuXHRcdGlmICh0aGlzLl9kdWcvKHcqaCkgPiB0aGlzLl9vcHRpb25zLnJvb21EdWdQZXJjZW50YWdlKSB7IGJyZWFrOyB9IC8qIGFjaGlldmVkIHJlcXVlc3RlZCBhbW91bnQgb2YgZnJlZSBzcGFjZSAqL1xuXHR9IHdoaWxlIChyb29tKTtcblxuXHQvKiBlaXRoZXIgZW5vdWdoIHJvb21zLCBvciBub3QgYWJsZSB0byBnZW5lcmF0ZSBtb3JlIG9mIHRoZW0gOikgKi9cbn1cblxuLyoqXG4gKiBUcnkgdG8gZ2VuZXJhdGUgb25lIHJvb21cbiAqL1xuUk9ULk1hcC5Vbmlmb3JtLnByb3RvdHlwZS5fZ2VuZXJhdGVSb29tID0gZnVuY3Rpb24oKSB7XG5cdHZhciBjb3VudCA9IDA7XG5cdHdoaWxlIChjb3VudCA8IHRoaXMuX3Jvb21BdHRlbXB0cykge1xuXHRcdGNvdW50Kys7XG5cdFx0XG5cdFx0dmFyIHJvb20gPSBST1QuTWFwLkZlYXR1cmUuUm9vbS5jcmVhdGVSYW5kb20odGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCwgdGhpcy5fb3B0aW9ucyk7XG5cdFx0aWYgKCFyb29tLmlzVmFsaWQodGhpcy5faXNXYWxsQ2FsbGJhY2ssIHRoaXMuX2NhbkJlRHVnQ2FsbGJhY2spKSB7IGNvbnRpbnVlOyB9XG5cdFx0XG5cdFx0cm9vbS5jcmVhdGUodGhpcy5fZGlnQ2FsbGJhY2spO1xuXHRcdHRoaXMuX3Jvb21zLnB1c2gocm9vbSk7XG5cdFx0cmV0dXJuIHJvb207XG5cdH0gXG5cblx0Lyogbm8gcm9vbSB3YXMgZ2VuZXJhdGVkIGluIGEgZ2l2ZW4gbnVtYmVyIG9mIGF0dGVtcHRzICovXG5cdHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBjb25uZWN0b3JzIGJld2VlbiByb29tc1xuICogQHJldHVybnMge2Jvb2x9IHN1Y2Nlc3MgV2FzIHRoaXMgYXR0ZW1wdCBzdWNjZXNzZnVsbD9cbiAqL1xuUk9ULk1hcC5Vbmlmb3JtLnByb3RvdHlwZS5fZ2VuZXJhdGVDb3JyaWRvcnMgPSBmdW5jdGlvbigpIHtcblx0dmFyIGNudCA9IDA7XG5cdHdoaWxlIChjbnQgPCB0aGlzLl9jb3JyaWRvckF0dGVtcHRzKSB7XG5cdFx0Y250Kys7XG5cdFx0dGhpcy5fY29ycmlkb3JzID0gW107XG5cblx0XHQvKiBkaWcgcm9vbXMgaW50byBhIGNsZWFyIG1hcCAqL1xuXHRcdHRoaXMuX21hcCA9IHRoaXMuX2ZpbGxNYXAoMSk7XG5cdFx0Zm9yICh2YXIgaT0wO2k8dGhpcy5fcm9vbXMubGVuZ3RoO2krKykgeyBcblx0XHRcdHZhciByb29tID0gdGhpcy5fcm9vbXNbaV07XG5cdFx0XHRyb29tLmNsZWFyRG9vcnMoKTtcblx0XHRcdHJvb20uY3JlYXRlKHRoaXMuX2RpZ0NhbGxiYWNrKTsgXG5cdFx0fVxuXG5cdFx0dGhpcy5fdW5jb25uZWN0ZWQgPSB0aGlzLl9yb29tcy5zbGljZSgpLnJhbmRvbWl6ZSgpO1xuXHRcdHRoaXMuX2Nvbm5lY3RlZCA9IFtdO1xuXHRcdGlmICh0aGlzLl91bmNvbm5lY3RlZC5sZW5ndGgpIHsgdGhpcy5fY29ubmVjdGVkLnB1c2godGhpcy5fdW5jb25uZWN0ZWQucG9wKCkpOyB9IC8qIGZpcnN0IG9uZSBpcyBhbHdheXMgY29ubmVjdGVkICovXG5cdFx0XG5cdFx0d2hpbGUgKDEpIHtcblx0XHRcdC8qIDEuIHBpY2sgcmFuZG9tIGNvbm5lY3RlZCByb29tICovXG5cdFx0XHR2YXIgY29ubmVjdGVkID0gdGhpcy5fY29ubmVjdGVkLnJhbmRvbSgpO1xuXHRcdFx0XG5cdFx0XHQvKiAyLiBmaW5kIGNsb3Nlc3QgdW5jb25uZWN0ZWQgKi9cblx0XHRcdHZhciByb29tMSA9IHRoaXMuX2Nsb3Nlc3RSb29tKHRoaXMuX3VuY29ubmVjdGVkLCBjb25uZWN0ZWQpO1xuXHRcdFx0XG5cdFx0XHQvKiAzLiBjb25uZWN0IGl0IHRvIGNsb3Nlc3QgY29ubmVjdGVkICovXG5cdFx0XHR2YXIgcm9vbTIgPSB0aGlzLl9jbG9zZXN0Um9vbSh0aGlzLl9jb25uZWN0ZWQsIHJvb20xKTtcblx0XHRcdFxuXHRcdFx0dmFyIG9rID0gdGhpcy5fY29ubmVjdFJvb21zKHJvb20xLCByb29tMik7XG5cdFx0XHRpZiAoIW9rKSB7IGJyZWFrOyB9IC8qIHN0b3AgY29ubmVjdGluZywgcmUtc2h1ZmZsZSAqL1xuXHRcdFx0XG5cdFx0XHRpZiAoIXRoaXMuX3VuY29ubmVjdGVkLmxlbmd0aCkgeyByZXR1cm4gdHJ1ZTsgfSAvKiBkb25lOyBubyByb29tcyByZW1haW4gKi9cblx0XHR9XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIEZvciBhIGdpdmVuIHJvb20sIGZpbmQgdGhlIGNsb3Nlc3Qgb25lIGZyb20gdGhlIGxpc3RcbiAqL1xuUk9ULk1hcC5Vbmlmb3JtLnByb3RvdHlwZS5fY2xvc2VzdFJvb20gPSBmdW5jdGlvbihyb29tcywgcm9vbSkge1xuXHR2YXIgZGlzdCA9IEluZmluaXR5O1xuXHR2YXIgY2VudGVyID0gcm9vbS5nZXRDZW50ZXIoKTtcblx0dmFyIHJlc3VsdCA9IG51bGw7XG5cdFxuXHRmb3IgKHZhciBpPTA7aTxyb29tcy5sZW5ndGg7aSsrKSB7XG5cdFx0dmFyIHIgPSByb29tc1tpXTtcblx0XHR2YXIgYyA9IHIuZ2V0Q2VudGVyKCk7XG5cdFx0dmFyIGR4ID0gY1swXS1jZW50ZXJbMF07XG5cdFx0dmFyIGR5ID0gY1sxXS1jZW50ZXJbMV07XG5cdFx0dmFyIGQgPSBkeCpkeCtkeSpkeTtcblx0XHRcblx0XHRpZiAoZCA8IGRpc3QpIHtcblx0XHRcdGRpc3QgPSBkO1xuXHRcdFx0cmVzdWx0ID0gcjtcblx0XHR9XG5cdH1cblx0XG5cdHJldHVybiByZXN1bHQ7XG59XG5cblJPVC5NYXAuVW5pZm9ybS5wcm90b3R5cGUuX2Nvbm5lY3RSb29tcyA9IGZ1bmN0aW9uKHJvb20xLCByb29tMikge1xuXHQvKlxuXHRcdHJvb20xLmRlYnVnKCk7XG5cdFx0cm9vbTIuZGVidWcoKTtcblx0Ki9cblxuXHR2YXIgY2VudGVyMSA9IHJvb20xLmdldENlbnRlcigpO1xuXHR2YXIgY2VudGVyMiA9IHJvb20yLmdldENlbnRlcigpO1xuXG5cdHZhciBkaWZmWCA9IGNlbnRlcjJbMF0gLSBjZW50ZXIxWzBdO1xuXHR2YXIgZGlmZlkgPSBjZW50ZXIyWzFdIC0gY2VudGVyMVsxXTtcblxuXHRpZiAoTWF0aC5hYnMoZGlmZlgpIDwgTWF0aC5hYnMoZGlmZlkpKSB7IC8qIGZpcnN0IHRyeSBjb25uZWN0aW5nIG5vcnRoLXNvdXRoIHdhbGxzICovXG5cdFx0dmFyIGRpckluZGV4MSA9IChkaWZmWSA+IDAgPyAyIDogMCk7XG5cdFx0dmFyIGRpckluZGV4MiA9IChkaXJJbmRleDEgKyAyKSAlIDQ7XG5cdFx0dmFyIG1pbiA9IHJvb20yLmdldExlZnQoKTtcblx0XHR2YXIgbWF4ID0gcm9vbTIuZ2V0UmlnaHQoKTtcblx0XHR2YXIgaW5kZXggPSAwO1xuXHR9IGVsc2UgeyAvKiBmaXJzdCB0cnkgY29ubmVjdGluZyBlYXN0LXdlc3Qgd2FsbHMgKi9cblx0XHR2YXIgZGlySW5kZXgxID0gKGRpZmZYID4gMCA/IDEgOiAzKTtcblx0XHR2YXIgZGlySW5kZXgyID0gKGRpckluZGV4MSArIDIpICUgNDtcblx0XHR2YXIgbWluID0gcm9vbTIuZ2V0VG9wKCk7XG5cdFx0dmFyIG1heCA9IHJvb20yLmdldEJvdHRvbSgpO1xuXHRcdHZhciBpbmRleCA9IDE7XG5cdH1cblxuXHR2YXIgc3RhcnQgPSB0aGlzLl9wbGFjZUluV2FsbChyb29tMSwgZGlySW5kZXgxKTsgLyogY29ycmlkb3Igd2lsbCBzdGFydCBoZXJlICovXG5cdGlmICghc3RhcnQpIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0aWYgKHN0YXJ0W2luZGV4XSA+PSBtaW4gJiYgc3RhcnRbaW5kZXhdIDw9IG1heCkgeyAvKiBwb3NzaWJsZSB0byBjb25uZWN0IHdpdGggc3RyYWlnaHQgbGluZSAoSS1saWtlKSAqL1xuXHRcdHZhciBlbmQgPSBzdGFydC5zbGljZSgpO1xuXHRcdHZhciB2YWx1ZSA9IG51bGw7XG5cdFx0c3dpdGNoIChkaXJJbmRleDIpIHtcblx0XHRcdGNhc2UgMDogdmFsdWUgPSByb29tMi5nZXRUb3AoKS0xOyBicmVhaztcblx0XHRcdGNhc2UgMTogdmFsdWUgPSByb29tMi5nZXRSaWdodCgpKzE7IGJyZWFrO1xuXHRcdFx0Y2FzZSAyOiB2YWx1ZSA9IHJvb20yLmdldEJvdHRvbSgpKzE7IGJyZWFrO1xuXHRcdFx0Y2FzZSAzOiB2YWx1ZSA9IHJvb20yLmdldExlZnQoKS0xOyBicmVhaztcblx0XHR9XG5cdFx0ZW5kWyhpbmRleCsxKSUyXSA9IHZhbHVlO1xuXHRcdHRoaXMuX2RpZ0xpbmUoW3N0YXJ0LCBlbmRdKTtcblx0XHRcblx0fSBlbHNlIGlmIChzdGFydFtpbmRleF0gPCBtaW4tMSB8fCBzdGFydFtpbmRleF0gPiBtYXgrMSkgeyAvKiBuZWVkIHRvIHN3aXRjaCB0YXJnZXQgd2FsbCAoTC1saWtlKSAqL1xuXG5cdFx0dmFyIGRpZmYgPSBzdGFydFtpbmRleF0gLSBjZW50ZXIyW2luZGV4XTtcblx0XHRzd2l0Y2ggKGRpckluZGV4Mikge1xuXHRcdFx0Y2FzZSAwOlxuXHRcdFx0Y2FzZSAxOlx0dmFyIHJvdGF0aW9uID0gKGRpZmYgPCAwID8gMyA6IDEpOyBicmVhaztcblx0XHRcdGNhc2UgMjpcblx0XHRcdGNhc2UgMzpcdHZhciByb3RhdGlvbiA9IChkaWZmIDwgMCA/IDEgOiAzKTsgYnJlYWs7XG5cdFx0fVxuXHRcdGRpckluZGV4MiA9IChkaXJJbmRleDIgKyByb3RhdGlvbikgJSA0O1xuXHRcdFxuXHRcdHZhciBlbmQgPSB0aGlzLl9wbGFjZUluV2FsbChyb29tMiwgZGlySW5kZXgyKTtcblx0XHRpZiAoIWVuZCkgeyByZXR1cm4gZmFsc2U7IH1cblxuXHRcdHZhciBtaWQgPSBbMCwgMF07XG5cdFx0bWlkW2luZGV4XSA9IHN0YXJ0W2luZGV4XTtcblx0XHR2YXIgaW5kZXgyID0gKGluZGV4KzEpJTI7XG5cdFx0bWlkW2luZGV4Ml0gPSBlbmRbaW5kZXgyXTtcblx0XHR0aGlzLl9kaWdMaW5lKFtzdGFydCwgbWlkLCBlbmRdKTtcblx0XHRcblx0fSBlbHNlIHsgLyogdXNlIGN1cnJlbnQgd2FsbCBwYWlyLCBidXQgYWRqdXN0IHRoZSBsaW5lIGluIHRoZSBtaWRkbGUgKFMtbGlrZSkgKi9cblx0XG5cdFx0dmFyIGluZGV4MiA9IChpbmRleCsxKSUyO1xuXHRcdHZhciBlbmQgPSB0aGlzLl9wbGFjZUluV2FsbChyb29tMiwgZGlySW5kZXgyKTtcblx0XHRpZiAoIWVuZCkgeyByZXR1cm47IH1cblx0XHR2YXIgbWlkID0gTWF0aC5yb3VuZCgoZW5kW2luZGV4Ml0gKyBzdGFydFtpbmRleDJdKS8yKTtcblxuXHRcdHZhciBtaWQxID0gWzAsIDBdO1xuXHRcdHZhciBtaWQyID0gWzAsIDBdO1xuXHRcdG1pZDFbaW5kZXhdID0gc3RhcnRbaW5kZXhdO1xuXHRcdG1pZDFbaW5kZXgyXSA9IG1pZDtcblx0XHRtaWQyW2luZGV4XSA9IGVuZFtpbmRleF07XG5cdFx0bWlkMltpbmRleDJdID0gbWlkO1xuXHRcdHRoaXMuX2RpZ0xpbmUoW3N0YXJ0LCBtaWQxLCBtaWQyLCBlbmRdKTtcblx0fVxuXG5cdHJvb20xLmFkZERvb3Ioc3RhcnRbMF0sIHN0YXJ0WzFdKTtcblx0cm9vbTIuYWRkRG9vcihlbmRbMF0sIGVuZFsxXSk7XG5cdFxuXHR2YXIgaW5kZXggPSB0aGlzLl91bmNvbm5lY3RlZC5pbmRleE9mKHJvb20xKTtcblx0aWYgKGluZGV4ICE9IC0xKSB7XG5cdFx0dGhpcy5fdW5jb25uZWN0ZWQuc3BsaWNlKGluZGV4LCAxKTtcblx0XHR0aGlzLl9jb25uZWN0ZWQucHVzaChyb29tMSk7XG5cdH1cblxuXHR2YXIgaW5kZXggPSB0aGlzLl91bmNvbm5lY3RlZC5pbmRleE9mKHJvb20yKTtcblx0aWYgKGluZGV4ICE9IC0xKSB7XG5cdFx0dGhpcy5fdW5jb25uZWN0ZWQuc3BsaWNlKGluZGV4LCAxKTtcblx0XHR0aGlzLl9jb25uZWN0ZWQucHVzaChyb29tMik7XG5cdH1cblx0XG5cdHJldHVybiB0cnVlO1xufVxuXG5ST1QuTWFwLlVuaWZvcm0ucHJvdG90eXBlLl9wbGFjZUluV2FsbCA9IGZ1bmN0aW9uKHJvb20sIGRpckluZGV4KSB7XG5cdHZhciBzdGFydCA9IFswLCAwXTtcblx0dmFyIGRpciA9IFswLCAwXTtcblx0dmFyIGxlbmd0aCA9IDA7XG5cdFxuXHRzd2l0Y2ggKGRpckluZGV4KSB7XG5cdFx0Y2FzZSAwOlxuXHRcdFx0ZGlyID0gWzEsIDBdO1xuXHRcdFx0c3RhcnQgPSBbcm9vbS5nZXRMZWZ0KCksIHJvb20uZ2V0VG9wKCktMV07XG5cdFx0XHRsZW5ndGggPSByb29tLmdldFJpZ2h0KCktcm9vbS5nZXRMZWZ0KCkrMTtcblx0XHRicmVhaztcblx0XHRjYXNlIDE6XG5cdFx0XHRkaXIgPSBbMCwgMV07XG5cdFx0XHRzdGFydCA9IFtyb29tLmdldFJpZ2h0KCkrMSwgcm9vbS5nZXRUb3AoKV07XG5cdFx0XHRsZW5ndGggPSByb29tLmdldEJvdHRvbSgpLXJvb20uZ2V0VG9wKCkrMTtcblx0XHRicmVhaztcblx0XHRjYXNlIDI6XG5cdFx0XHRkaXIgPSBbMSwgMF07XG5cdFx0XHRzdGFydCA9IFtyb29tLmdldExlZnQoKSwgcm9vbS5nZXRCb3R0b20oKSsxXTtcblx0XHRcdGxlbmd0aCA9IHJvb20uZ2V0UmlnaHQoKS1yb29tLmdldExlZnQoKSsxO1xuXHRcdGJyZWFrO1xuXHRcdGNhc2UgMzpcblx0XHRcdGRpciA9IFswLCAxXTtcblx0XHRcdHN0YXJ0ID0gW3Jvb20uZ2V0TGVmdCgpLTEsIHJvb20uZ2V0VG9wKCldO1xuXHRcdFx0bGVuZ3RoID0gcm9vbS5nZXRCb3R0b20oKS1yb29tLmdldFRvcCgpKzE7XG5cdFx0YnJlYWs7XG5cdH1cblx0XG5cdHZhciBhdmFpbCA9IFtdO1xuXHR2YXIgbGFzdEJhZEluZGV4ID0gLTI7XG5cblx0Zm9yICh2YXIgaT0wO2k8bGVuZ3RoO2krKykge1xuXHRcdHZhciB4ID0gc3RhcnRbMF0gKyBpKmRpclswXTtcblx0XHR2YXIgeSA9IHN0YXJ0WzFdICsgaSpkaXJbMV07XG5cdFx0YXZhaWwucHVzaChudWxsKTtcblx0XHRcblx0XHR2YXIgaXNXYWxsID0gKHRoaXMuX21hcFt4XVt5XSA9PSAxKTtcblx0XHRpZiAoaXNXYWxsKSB7XG5cdFx0XHRpZiAobGFzdEJhZEluZGV4ICE9IGktMSkgeyBhdmFpbFtpXSA9IFt4LCB5XTsgfVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRsYXN0QmFkSW5kZXggPSBpO1xuXHRcdFx0aWYgKGkpIHsgYXZhaWxbaS0xXSA9IG51bGw7IH1cblx0XHR9XG5cdH1cblx0XG5cdGZvciAodmFyIGk9YXZhaWwubGVuZ3RoLTE7IGk+PTA7IGktLSkge1xuXHRcdGlmICghYXZhaWxbaV0pIHsgYXZhaWwuc3BsaWNlKGksIDEpOyB9XG5cdH1cblx0cmV0dXJuIChhdmFpbC5sZW5ndGggPyBhdmFpbC5yYW5kb20oKSA6IG51bGwpO1xufVxuXG4vKipcbiAqIERpZyBhIHBvbHlsaW5lLlxuICovXG5ST1QuTWFwLlVuaWZvcm0ucHJvdG90eXBlLl9kaWdMaW5lID0gZnVuY3Rpb24ocG9pbnRzKSB7XG5cdGZvciAodmFyIGk9MTtpPHBvaW50cy5sZW5ndGg7aSsrKSB7XG5cdFx0dmFyIHN0YXJ0ID0gcG9pbnRzW2ktMV07XG5cdFx0dmFyIGVuZCA9IHBvaW50c1tpXTtcblx0XHR2YXIgY29ycmlkb3IgPSBuZXcgUk9ULk1hcC5GZWF0dXJlLkNvcnJpZG9yKHN0YXJ0WzBdLCBzdGFydFsxXSwgZW5kWzBdLCBlbmRbMV0pO1xuXHRcdGNvcnJpZG9yLmNyZWF0ZSh0aGlzLl9kaWdDYWxsYmFjayk7XG5cdFx0dGhpcy5fY29ycmlkb3JzLnB1c2goY29ycmlkb3IpO1xuXHR9XG59XG5cblJPVC5NYXAuVW5pZm9ybS5wcm90b3R5cGUuX2RpZ0NhbGxiYWNrID0gZnVuY3Rpb24oeCwgeSwgdmFsdWUpIHtcblx0dGhpcy5fbWFwW3hdW3ldID0gdmFsdWU7XG5cdGlmICh2YWx1ZSA9PSAwKSB7IHRoaXMuX2R1ZysrOyB9XG59XG5cblJPVC5NYXAuVW5pZm9ybS5wcm90b3R5cGUuX2lzV2FsbENhbGxiYWNrID0gZnVuY3Rpb24oeCwgeSkge1xuXHRpZiAoeCA8IDAgfHwgeSA8IDAgfHwgeCA+PSB0aGlzLl93aWR0aCB8fCB5ID49IHRoaXMuX2hlaWdodCkgeyByZXR1cm4gZmFsc2U7IH1cblx0cmV0dXJuICh0aGlzLl9tYXBbeF1beV0gPT0gMSk7XG59XG5cblJPVC5NYXAuVW5pZm9ybS5wcm90b3R5cGUuX2NhbkJlRHVnQ2FsbGJhY2sgPSBmdW5jdGlvbih4LCB5KSB7XG5cdGlmICh4IDwgMSB8fCB5IDwgMSB8fCB4KzEgPj0gdGhpcy5fd2lkdGggfHwgeSsxID49IHRoaXMuX2hlaWdodCkgeyByZXR1cm4gZmFsc2U7IH1cblx0cmV0dXJuICh0aGlzLl9tYXBbeF1beV0gPT0gMSk7XG59XG5cbi8qKlxuICogQGF1dGhvciBoeWFrdWdlaVxuICogQGNsYXNzIER1bmdlb24gZ2VuZXJhdG9yIHdoaWNoIHVzZXMgdGhlIFwib3JnaW5hbFwiIFJvZ3VlIGR1bmdlb24gZ2VuZXJhdGlvbiBhbGdvcml0aG0uIFNlZSBodHRwOi8va3VvaS5jb20vfmthbWlrYXplL0dhbWVEZXNpZ24vYXJ0MDdfcm9ndWVfZHVuZ2Vvbi5waHBcbiAqIEBhdWdtZW50cyBST1QuTWFwXG4gKiBAcGFyYW0ge2ludH0gW3dpZHRoPVJPVC5ERUZBVUxUX1dJRFRIXVxuICogQHBhcmFtIHtpbnR9IFtoZWlnaHQ9Uk9ULkRFRkFVTFRfSEVJR0hUXVxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSBPcHRpb25zXG4gKiBAcGFyYW0ge2ludFtdfSBbb3B0aW9ucy5jZWxsV2lkdGg9M10gTnVtYmVyIG9mIGNlbGxzIHRvIGNyZWF0ZSBvbiB0aGUgaG9yaXpvbnRhbCAobnVtYmVyIG9mIHJvb21zIGhvcml6b250YWxseSlcbiAqIEBwYXJhbSB7aW50W119IFtvcHRpb25zLmNlbGxIZWlnaHQ9M10gTnVtYmVyIG9mIGNlbGxzIHRvIGNyZWF0ZSBvbiB0aGUgdmVydGljYWwgKG51bWJlciBvZiByb29tcyB2ZXJ0aWNhbGx5KSBcbiAqIEBwYXJhbSB7aW50fSBbb3B0aW9ucy5yb29tV2lkdGhdIFJvb20gbWluIGFuZCBtYXggd2lkdGggLSBub3JtYWxseSBzZXQgYXV0by1tYWdpY2FsbHkgdmlhIHRoZSBjb25zdHJ1Y3Rvci5cbiAqIEBwYXJhbSB7aW50fSBbb3B0aW9ucy5yb29tSGVpZ2h0XSBSb29tIG1pbiBhbmQgbWF4IGhlaWdodCAtIG5vcm1hbGx5IHNldCBhdXRvLW1hZ2ljYWxseSB2aWEgdGhlIGNvbnN0cnVjdG9yLiBcbiAqL1xuUk9ULk1hcC5Sb2d1ZSA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQsIG9wdGlvbnMpIHtcblx0Uk9ULk1hcC5jYWxsKHRoaXMsIHdpZHRoLCBoZWlnaHQpO1xuXHRcblx0dGhpcy5fb3B0aW9ucyA9IHtcblx0XHRjZWxsV2lkdGg6IDMsICAvLyBOT1RFIHRvIHNlbGYsIHRoZXNlIGNvdWxkIHByb2JhYmx5IHdvcmsgdGhlIHNhbWUgYXMgdGhlIHJvb21XaWR0aC9yb29tIEhlaWdodCB2YWx1ZXNcblx0XHRjZWxsSGVpZ2h0OiAzICAvLyAgICAgaWUuIGFzIGFuIGFycmF5IHdpdGggbWluLW1heCB2YWx1ZXMgZm9yIGVhY2ggZGlyZWN0aW9uLi4uLlxuXHR9XG5cdFxuXHRmb3IgKHZhciBwIGluIG9wdGlvbnMpIHsgdGhpcy5fb3B0aW9uc1twXSA9IG9wdGlvbnNbcF07IH1cblx0XG5cdC8qXG5cdFNldCB0aGUgcm9vbSBzaXplcyBhY2NvcmRpbmcgdG8gdGhlIG92ZXItYWxsIHdpZHRoIG9mIHRoZSBtYXAsIFxuXHRhbmQgdGhlIGNlbGwgc2l6ZXMuIFxuXHQqL1xuXHRcblx0aWYgKCF0aGlzLl9vcHRpb25zLmhhc093blByb3BlcnR5KFwicm9vbVdpZHRoXCIpKSB7XG5cdFx0dGhpcy5fb3B0aW9uc1tcInJvb21XaWR0aFwiXSA9IHRoaXMuX2NhbGN1bGF0ZVJvb21TaXplKHdpZHRoLCB0aGlzLl9vcHRpb25zW1wiY2VsbFdpZHRoXCJdKTtcblx0fVxuXHRpZiAoIXRoaXMuX29wdGlvbnMuaGFzT3duUHJvcGVydHlbXCJyb29tSGVpZ2h0XCJdKSB7XG5cdFx0dGhpcy5fb3B0aW9uc1tcInJvb21IZWlnaHRcIl0gPSB0aGlzLl9jYWxjdWxhdGVSb29tU2l6ZShoZWlnaHQsIHRoaXMuX29wdGlvbnNbXCJjZWxsSGVpZ2h0XCJdKTtcblx0fVxuXHRcbn1cblxuUk9ULk1hcC5Sb2d1ZS5leHRlbmQoUk9ULk1hcCk7IFxuXG4vKipcbiAqIEBzZWUgUk9ULk1hcCNjcmVhdGVcbiAqL1xuUk9ULk1hcC5Sb2d1ZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0dGhpcy5tYXAgPSB0aGlzLl9maWxsTWFwKDEpO1xuXHR0aGlzLnJvb21zID0gW107XG5cdHRoaXMuY29ubmVjdGVkQ2VsbHMgPSBbXTtcblx0XG5cdHRoaXMuX2luaXRSb29tcygpO1xuXHR0aGlzLl9jb25uZWN0Um9vbXMoKTtcblx0dGhpcy5fY29ubmVjdFVuY29ubmVjdGVkUm9vbXMoKTtcblx0dGhpcy5fY3JlYXRlUmFuZG9tUm9vbUNvbm5lY3Rpb25zKCk7XG5cdHRoaXMuX2NyZWF0ZVJvb21zKCk7XG5cdHRoaXMuX2NyZWF0ZUNvcnJpZG9ycygpO1xuXHRcblx0aWYgKGNhbGxiYWNrKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl93aWR0aDsgaSsrKSB7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMuX2hlaWdodDsgaisrKSB7XG5cdFx0XHRcdGNhbGxiYWNrKGksIGosIHRoaXMubWFwW2ldW2pdKTsgICBcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0XG5cdHJldHVybiB0aGlzO1xufVxuXG5ST1QuTWFwLlJvZ3VlLnByb3RvdHlwZS5fZ2V0UmFuZG9tSW50ID0gZnVuY3Rpb24obWluLCBtYXgpIHtcblx0cmV0dXJuIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xufVxuXG5ST1QuTWFwLlJvZ3VlLnByb3RvdHlwZS5fY2FsY3VsYXRlUm9vbVNpemUgPSBmdW5jdGlvbihzaXplLCBjZWxsKSB7XG5cdHZhciBtYXggPSBNYXRoLmZsb29yKChzaXplL2NlbGwpICogMC44KTtcblx0dmFyIG1pbiA9IE1hdGguZmxvb3IoKHNpemUvY2VsbCkgKiAwLjI1KTtcblx0aWYgKG1pbiA8IDIpIG1pbiA9IDI7XG5cdGlmIChtYXggPCAyKSBtYXggPSAyO1xuXHRyZXR1cm4gW21pbiwgbWF4XTtcbn1cblxuUk9ULk1hcC5Sb2d1ZS5wcm90b3R5cGUuX2luaXRSb29tcyA9IGZ1bmN0aW9uICgpIHsgXG5cdC8vIGNyZWF0ZSByb29tcyBhcnJheS4gVGhpcyBpcyB0aGUgXCJncmlkXCIgbGlzdCBmcm9tIHRoZSBhbGdvLiAgXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fb3B0aW9ucy5jZWxsV2lkdGg7IGkrKykgeyAgXG5cdFx0dGhpcy5yb29tcy5wdXNoKFtdKTtcblx0XHRmb3IodmFyIGogPSAwOyBqIDwgdGhpcy5fb3B0aW9ucy5jZWxsSGVpZ2h0OyBqKyspIHtcblx0XHRcdHRoaXMucm9vbXNbaV0ucHVzaCh7XCJ4XCI6MCwgXCJ5XCI6MCwgXCJ3aWR0aFwiOjAsIFwiaGVpZ2h0XCI6MCwgXCJjb25uZWN0aW9uc1wiOltdLCBcImNlbGx4XCI6aSwgXCJjZWxseVwiOmp9KTtcblx0XHR9XG5cdH1cbn1cblxuUk9ULk1hcC5Sb2d1ZS5wcm90b3R5cGUuX2Nvbm5lY3RSb29tcyA9IGZ1bmN0aW9uKCkge1xuXHQvL3BpY2sgcmFuZG9tIHN0YXJ0aW5nIGdyaWRcblx0dmFyIGNneCA9IHRoaXMuX2dldFJhbmRvbUludCgwLCB0aGlzLl9vcHRpb25zLmNlbGxXaWR0aC0xKTtcblx0dmFyIGNneSA9IHRoaXMuX2dldFJhbmRvbUludCgwLCB0aGlzLl9vcHRpb25zLmNlbGxIZWlnaHQtMSk7XG5cdFxuXHR2YXIgaWR4O1xuXHR2YXIgbmNneDtcblx0dmFyIG5jZ3k7XG5cdFxuXHR2YXIgZm91bmQgPSBmYWxzZTtcblx0dmFyIHJvb207XG5cdHZhciBvdGhlclJvb207XG5cdFxuXHQvLyBmaW5kICB1bmNvbm5lY3RlZCBuZWlnaGJvdXIgY2VsbHNcblx0ZG8ge1xuXHRcblx0XHQvL3ZhciBkaXJUb0NoZWNrID0gWzAsMSwyLDMsNCw1LDYsN107XG5cdFx0dmFyIGRpclRvQ2hlY2sgPSBbMCwyLDQsNl07XG5cdFx0ZGlyVG9DaGVjayA9IGRpclRvQ2hlY2sucmFuZG9taXplKCk7XG5cdFx0XG5cdFx0ZG8ge1xuXHRcdFx0Zm91bmQgPSBmYWxzZTtcblx0XHRcdGlkeCA9IGRpclRvQ2hlY2sucG9wKCk7XG5cdFx0XHRcblx0XHRcdFxuXHRcdFx0bmNneCA9IGNneCArIFJPVC5ESVJTWzhdW2lkeF1bMF07XG5cdFx0XHRuY2d5ID0gY2d5ICsgUk9ULkRJUlNbOF1baWR4XVsxXTtcblx0XHRcdFxuXHRcdFx0aWYobmNneCA8IDAgfHwgbmNneCA+PSB0aGlzLl9vcHRpb25zLmNlbGxXaWR0aCkgY29udGludWU7XG5cdFx0XHRpZihuY2d5IDwgMCB8fCBuY2d5ID49IHRoaXMuX29wdGlvbnMuY2VsbEhlaWdodCkgY29udGludWU7XG5cdFx0XHRcblx0XHRcdHJvb20gPSB0aGlzLnJvb21zW2NneF1bY2d5XTtcblx0XHRcdFxuXHRcdFx0aWYocm9vbVtcImNvbm5lY3Rpb25zXCJdLmxlbmd0aCA+IDApXG5cdFx0XHR7XG5cdFx0XHRcdC8vIGFzIGxvbmcgYXMgdGhpcyByb29tIGRvZXNuJ3QgYWxyZWFkeSBjb29uZWN0IHRvIG1lLCB3ZSBhcmUgb2sgd2l0aCBpdC4gXG5cdFx0XHRcdGlmKHJvb21bXCJjb25uZWN0aW9uc1wiXVswXVswXSA9PSBuY2d4ICYmXG5cdFx0XHRcdHJvb21bXCJjb25uZWN0aW9uc1wiXVswXVsxXSA9PSBuY2d5KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0b3RoZXJSb29tID0gdGhpcy5yb29tc1tuY2d4XVtuY2d5XTtcblx0XHRcdFxuXHRcdFx0aWYgKG90aGVyUm9vbVtcImNvbm5lY3Rpb25zXCJdLmxlbmd0aCA9PSAwKSB7IFxuXHRcdFx0XHRvdGhlclJvb21bXCJjb25uZWN0aW9uc1wiXS5wdXNoKFtjZ3gsY2d5XSk7XG5cdFx0XHRcdFxuXHRcdFx0XHR0aGlzLmNvbm5lY3RlZENlbGxzLnB1c2goW25jZ3gsIG5jZ3ldKTtcblx0XHRcdFx0Y2d4ID0gbmNneDtcblx0XHRcdFx0Y2d5ID0gbmNneTtcblx0XHRcdFx0Zm91bmQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdH0gd2hpbGUgKGRpclRvQ2hlY2subGVuZ3RoID4gMCAmJiBmb3VuZCA9PSBmYWxzZSlcblx0XHRcblx0fSB3aGlsZSAoZGlyVG9DaGVjay5sZW5ndGggPiAwKVxuXG59XG5cblJPVC5NYXAuUm9ndWUucHJvdG90eXBlLl9jb25uZWN0VW5jb25uZWN0ZWRSb29tcyA9IGZ1bmN0aW9uKCkge1xuXHQvL1doaWxlIHRoZXJlIGFyZSB1bmNvbm5lY3RlZCByb29tcywgdHJ5IHRvIGNvbm5lY3QgdGhlbSB0byBhIHJhbmRvbSBjb25uZWN0ZWQgbmVpZ2hib3IgXG5cdC8vKGlmIGEgcm9vbSBoYXMgbm8gY29ubmVjdGVkIG5laWdoYm9ycyB5ZXQsIGp1c3Qga2VlcCBjeWNsaW5nLCB5b3UnbGwgZmlsbCBvdXQgdG8gaXQgZXZlbnR1YWxseSkuXG5cdHZhciBjdyA9IHRoaXMuX29wdGlvbnMuY2VsbFdpZHRoO1xuXHR2YXIgY2ggPSB0aGlzLl9vcHRpb25zLmNlbGxIZWlnaHQ7XG5cdFxuXHR2YXIgcmFuZG9tQ29ubmVjdGVkQ2VsbDtcblx0dGhpcy5jb25uZWN0ZWRDZWxscyA9IHRoaXMuY29ubmVjdGVkQ2VsbHMucmFuZG9taXplKCk7XG5cdHZhciByb29tO1xuXHR2YXIgb3RoZXJSb29tO1xuXHR2YXIgdmFsaWRSb29tO1xuXHRcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9vcHRpb25zLmNlbGxXaWR0aDsgaSsrKSB7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLl9vcHRpb25zLmNlbGxIZWlnaHQ7IGorKykgIHtcblx0XHRcdFx0XG5cdFx0XHRyb29tID0gdGhpcy5yb29tc1tpXVtqXTtcblx0XHRcdFxuXHRcdFx0aWYgKHJvb21bXCJjb25uZWN0aW9uc1wiXS5sZW5ndGggPT0gMCkge1xuXHRcdFx0XHR2YXIgZGlyZWN0aW9ucyA9IFswLDIsNCw2XTtcblx0XHRcdFx0ZGlyZWN0aW9ucyA9IGRpcmVjdGlvbnMucmFuZG9taXplKCk7XG5cdFx0XHRcdFxuXHRcdFx0XHR2YXIgdmFsaWRSb29tID0gZmFsc2U7XG5cdFx0XHRcdFxuXHRcdFx0XHRkbyB7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0dmFyIGRpcklkeCA9IGRpcmVjdGlvbnMucG9wKCk7XG5cdFx0XHRcdFx0dmFyIG5ld0kgPSBpICsgUk9ULkRJUlNbOF1bZGlySWR4XVswXTtcblx0XHRcdFx0XHR2YXIgbmV3SiA9IGogKyBST1QuRElSU1s4XVtkaXJJZHhdWzFdO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGlmIChuZXdJIDwgMCB8fCBuZXdJID49IGN3IHx8IFxuXHRcdFx0XHRcdG5ld0ogPCAwIHx8IG5ld0ogPj0gY2gpIHtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHRvdGhlclJvb20gPSB0aGlzLnJvb21zW25ld0ldW25ld0pdO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHZhbGlkUm9vbSA9IHRydWU7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0aWYgKG90aGVyUm9vbVtcImNvbm5lY3Rpb25zXCJdLmxlbmd0aCA9PSAwKSB7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Zm9yICh2YXIgayA9IDA7IGsgPCBvdGhlclJvb21bXCJjb25uZWN0aW9uc1wiXS5sZW5ndGg7IGsrKykge1xuXHRcdFx0XHRcdFx0aWYob3RoZXJSb29tW1wiY29ubmVjdGlvbnNcIl1ba11bMF0gPT0gaSAmJiBcblx0XHRcdFx0XHRcdG90aGVyUm9vbVtcImNvbm5lY3Rpb25zXCJdW2tdWzFdID09IGopIHtcblx0XHRcdFx0XHRcdFx0dmFsaWRSb29tID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAodmFsaWRSb29tKSBicmVhaztcblx0XHRcdFx0XHRcblx0XHRcdFx0fSB3aGlsZSAoZGlyZWN0aW9ucy5sZW5ndGgpXG5cdFx0XHRcdFxuXHRcdFx0XHRpZih2YWxpZFJvb20pIHsgXG5cdFx0XHRcdFx0cm9vbVtcImNvbm5lY3Rpb25zXCJdLnB1c2goIFtvdGhlclJvb21bXCJjZWxseFwiXSwgb3RoZXJSb29tW1wiY2VsbHlcIl1dICk7ICBcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcIi0tIFVuYWJsZSB0byBjb25uZWN0IHJvb20uXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cblJPVC5NYXAuUm9ndWUucHJvdG90eXBlLl9jcmVhdGVSYW5kb21Sb29tQ29ubmVjdGlvbnMgPSBmdW5jdGlvbihjb25uZWN0aW9ucykge1xuXHQvLyBFbXB0eSBmb3Igbm93LiBcbn1cblxuXG5ST1QuTWFwLlJvZ3VlLnByb3RvdHlwZS5fY3JlYXRlUm9vbXMgPSBmdW5jdGlvbigpIHtcblx0Ly8gQ3JlYXRlIFJvb21zIFxuXHRcblx0dmFyIHcgPSB0aGlzLl93aWR0aDtcblx0dmFyIGggPSB0aGlzLl9oZWlnaHQ7XG5cdFxuXHR2YXIgY3cgPSB0aGlzLl9vcHRpb25zLmNlbGxXaWR0aDtcblx0dmFyIGNoID0gdGhpcy5fb3B0aW9ucy5jZWxsSGVpZ2h0O1xuXHRcblx0dmFyIGN3cCA9IE1hdGguZmxvb3IodGhpcy5fd2lkdGggLyBjdyk7XG5cdHZhciBjaHAgPSBNYXRoLmZsb29yKHRoaXMuX2hlaWdodCAvIGNoKTtcblx0XG5cdHZhciByb29tdztcblx0dmFyIHJvb21oO1xuXHR2YXIgcm9vbVdpZHRoID0gdGhpcy5fb3B0aW9uc1tcInJvb21XaWR0aFwiXTtcblx0dmFyIHJvb21IZWlnaHQgPSB0aGlzLl9vcHRpb25zW1wicm9vbUhlaWdodFwiXTtcblx0dmFyIHN4O1xuXHR2YXIgc3k7XG5cdHZhciB0eDtcblx0dmFyIHR5O1xuXHR2YXIgb3RoZXJSb29tO1xuXHRcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjdzsgaSsrKSB7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBjaDsgaisrKSB7XG5cdFx0XHRzeCA9IGN3cCAqIGk7XG5cdFx0XHRzeSA9IGNocCAqIGo7XG5cdFx0XHRcblx0XHRcdGlmIChzeCA9PSAwKSBzeCA9IDE7XG5cdFx0XHRpZiAoc3kgPT0gMCkgc3kgPSAxO1xuXHRcdFx0XG5cdFx0XHRyb29tdyA9IHRoaXMuX2dldFJhbmRvbUludChyb29tV2lkdGhbMF0sIHJvb21XaWR0aFsxXSk7XG5cdFx0XHRyb29taCA9IHRoaXMuX2dldFJhbmRvbUludChyb29tSGVpZ2h0WzBdLCByb29tSGVpZ2h0WzFdKTtcblx0XHRcdFxuXHRcdFx0aWYgKGogPiAwKSB7XG5cdFx0XHRcdG90aGVyUm9vbSA9IHRoaXMucm9vbXNbaV1bai0xXTtcblx0XHRcdFx0d2hpbGUgKHN5IC0gKG90aGVyUm9vbVtcInlcIl0gKyBvdGhlclJvb21bXCJoZWlnaHRcIl0gKSA8IDMpIHtcblx0XHRcdFx0XHRzeSsrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGlmIChpID4gMCkge1xuXHRcdFx0XHRvdGhlclJvb20gPSB0aGlzLnJvb21zW2ktMV1bal07XG5cdFx0XHRcdHdoaWxlKHN4IC0gKG90aGVyUm9vbVtcInhcIl0gKyBvdGhlclJvb21bXCJ3aWR0aFwiXSkgPCAzKSB7XG5cdFx0XHRcdFx0c3grKztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XHRcdFx0XG5cdFx0XHR2YXIgc3hPZmZzZXQgPSBNYXRoLnJvdW5kKHRoaXMuX2dldFJhbmRvbUludCgwLCBjd3Atcm9vbXcpLzIpO1xuXHRcdFx0dmFyIHN5T2Zmc2V0ID0gTWF0aC5yb3VuZCh0aGlzLl9nZXRSYW5kb21JbnQoMCwgY2hwLXJvb21oKS8yKTtcblx0XHRcdFxuXHRcdFx0d2hpbGUgKHN4ICsgc3hPZmZzZXQgKyByb29tdyA+PSB3KSB7XG5cdFx0XHRcdGlmKHN4T2Zmc2V0KSB7XG5cdFx0XHRcdFx0c3hPZmZzZXQtLTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyb29tdy0tOyBcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHR3aGlsZSAoc3kgKyBzeU9mZnNldCArIHJvb21oID49IGgpIHsgXG5cdFx0XHRcdGlmKHN5T2Zmc2V0KSB7XG5cdFx0XHRcdFx0c3lPZmZzZXQtLTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyb29taC0tOyBcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRzeCA9IHN4ICsgc3hPZmZzZXQ7XG5cdFx0XHRzeSA9IHN5ICsgc3lPZmZzZXQ7XG5cdFx0XHRcblx0XHRcdHRoaXMucm9vbXNbaV1bal1bXCJ4XCJdID0gc3g7XG5cdFx0XHR0aGlzLnJvb21zW2ldW2pdW1wieVwiXSA9IHN5O1xuXHRcdFx0dGhpcy5yb29tc1tpXVtqXVtcIndpZHRoXCJdID0gcm9vbXc7XG5cdFx0XHR0aGlzLnJvb21zW2ldW2pdW1wiaGVpZ2h0XCJdID0gcm9vbWg7ICBcblx0XHRcdFxuXHRcdFx0Zm9yICh2YXIgaWkgPSBzeDsgaWkgPCBzeCArIHJvb213OyBpaSsrKSB7XG5cdFx0XHRcdGZvciAodmFyIGpqID0gc3k7IGpqIDwgc3kgKyByb29taDsgamorKykge1xuXHRcdFx0XHRcdHRoaXMubWFwW2lpXVtqal0gPSAwO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICBcblx0XHR9XG5cdH1cbn1cblxuUk9ULk1hcC5Sb2d1ZS5wcm90b3R5cGUuX2dldFdhbGxQb3NpdGlvbiA9IGZ1bmN0aW9uKGFSb29tLCBhRGlyZWN0aW9uKSB7XG5cdHZhciByeDtcblx0dmFyIHJ5O1xuXHR2YXIgZG9vcjtcblx0XG5cdGlmIChhRGlyZWN0aW9uID09IDEgfHwgYURpcmVjdGlvbiA9PSAzKSB7XG5cdFx0cnggPSB0aGlzLl9nZXRSYW5kb21JbnQoYVJvb21bXCJ4XCJdICsgMSwgYVJvb21bXCJ4XCJdICsgYVJvb21bXCJ3aWR0aFwiXSAtIDIpO1xuXHRcdGlmIChhRGlyZWN0aW9uID09IDEpIHtcblx0XHRcdHJ5ID0gYVJvb21bXCJ5XCJdIC0gMjtcblx0XHRcdGRvb3IgPSByeSArIDE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJ5ID0gYVJvb21bXCJ5XCJdICsgYVJvb21bXCJoZWlnaHRcIl0gKyAxO1xuXHRcdFx0ZG9vciA9IHJ5IC0xO1xuXHRcdH1cblx0XHRcblx0XHR0aGlzLm1hcFtyeF1bZG9vcl0gPSAwOyAvLyBpJ20gbm90IHNldHRpbmcgYSBzcGVjaWZpYyAnZG9vcicgdGlsZSB2YWx1ZSByaWdodCBub3csIGp1c3QgZW1wdHkgc3BhY2UuIFxuXHRcdFxuXHR9IGVsc2UgaWYgKGFEaXJlY3Rpb24gPT0gMiB8fCBhRGlyZWN0aW9uID09IDQpIHtcblx0XHRyeSA9IHRoaXMuX2dldFJhbmRvbUludChhUm9vbVtcInlcIl0gKyAxLCBhUm9vbVtcInlcIl0gKyBhUm9vbVtcImhlaWdodFwiXSAtIDIpO1xuXHRcdGlmKGFEaXJlY3Rpb24gPT0gMikge1xuXHRcdFx0cnggPSBhUm9vbVtcInhcIl0gKyBhUm9vbVtcIndpZHRoXCJdICsgMTtcblx0XHRcdGRvb3IgPSByeCAtIDE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJ4ID0gYVJvb21bXCJ4XCJdIC0gMjtcblx0XHRcdGRvb3IgPSByeCArIDE7XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMubWFwW2Rvb3JdW3J5XSA9IDA7IC8vIGknbSBub3Qgc2V0dGluZyBhIHNwZWNpZmljICdkb29yJyB0aWxlIHZhbHVlIHJpZ2h0IG5vdywganVzdCBlbXB0eSBzcGFjZS4gXG5cdFx0XG5cdH1cblx0cmV0dXJuIFtyeCwgcnldO1xufVxuXG4vKioqXG4qIEBwYXJhbSBzdGFydFBvc2l0aW9uIGEgMiBlbGVtZW50IGFycmF5XG4qIEBwYXJhbSBlbmRQb3NpdGlvbiBhIDIgZWxlbWVudCBhcnJheVxuKi9cblJPVC5NYXAuUm9ndWUucHJvdG90eXBlLl9kcmF3Q29ycmlkb3JlID0gZnVuY3Rpb24gKHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uKSB7XG5cdHZhciB4T2Zmc2V0ID0gZW5kUG9zaXRpb25bMF0gLSBzdGFydFBvc2l0aW9uWzBdO1xuXHR2YXIgeU9mZnNldCA9IGVuZFBvc2l0aW9uWzFdIC0gc3RhcnRQb3NpdGlvblsxXTtcblx0XG5cdHZhciB4cG9zID0gc3RhcnRQb3NpdGlvblswXTtcblx0dmFyIHlwb3MgPSBzdGFydFBvc2l0aW9uWzFdO1xuXHRcblx0dmFyIHRlbXBEaXN0O1xuXHR2YXIgeERpcjtcblx0dmFyIHlEaXI7XG5cdFxuXHR2YXIgbW92ZTsgLy8gMiBlbGVtZW50IGFycmF5LCBlbGVtZW50IDAgaXMgdGhlIGRpcmVjdGlvbiwgZWxlbWVudCAxIGlzIHRoZSB0b3RhbCB2YWx1ZSB0byBtb3ZlLiBcblx0dmFyIG1vdmVzID0gW107IC8vIGEgbGlzdCBvZiAyIGVsZW1lbnQgYXJyYXlzXG5cdFxuXHR2YXIgeEFicyA9IE1hdGguYWJzKHhPZmZzZXQpO1xuXHR2YXIgeUFicyA9IE1hdGguYWJzKHlPZmZzZXQpO1xuXHRcblx0dmFyIHBlcmNlbnQgPSBST1QuUk5HLmdldFVuaWZvcm0oKTsgLy8gdXNlZCB0byBzcGxpdCB0aGUgbW92ZSBhdCBkaWZmZXJlbnQgcGxhY2VzIGFsb25nIHRoZSBsb25nIGF4aXNcblx0dmFyIGZpcnN0SGFsZiA9IHBlcmNlbnQ7XG5cdHZhciBzZWNvbmRIYWxmID0gMSAtIHBlcmNlbnQ7XG5cdFxuXHR4RGlyID0geE9mZnNldCA+IDAgPyAyIDogNjtcblx0eURpciA9IHlPZmZzZXQgPiAwID8gNCA6IDA7XG5cdFxuXHRpZiAoeEFicyA8IHlBYnMpIHtcblx0XHQvLyBtb3ZlIGZpcnN0SGFsZiBvZiB0aGUgeSBvZmZzZXRcblx0XHR0ZW1wRGlzdCA9IE1hdGguY2VpbCh5QWJzICogZmlyc3RIYWxmKTtcblx0XHRtb3Zlcy5wdXNoKFt5RGlyLCB0ZW1wRGlzdF0pO1xuXHRcdC8vIG1vdmUgYWxsIHRoZSB4IG9mZnNldFxuXHRcdG1vdmVzLnB1c2goW3hEaXIsIHhBYnNdKTtcblx0XHQvLyBtb3ZlIHNlbmRIYWxmIG9mIHRoZSAgeSBvZmZzZXRcblx0XHR0ZW1wRGlzdCA9IE1hdGguZmxvb3IoeUFicyAqIHNlY29uZEhhbGYpO1xuXHRcdG1vdmVzLnB1c2goW3lEaXIsIHRlbXBEaXN0XSk7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gIG1vdmUgZmlyc3RIYWxmIG9mIHRoZSB4IG9mZnNldFxuXHRcdHRlbXBEaXN0ID0gTWF0aC5jZWlsKHhBYnMgKiBmaXJzdEhhbGYpO1xuXHRcdG1vdmVzLnB1c2goW3hEaXIsIHRlbXBEaXN0XSk7XG5cdFx0Ly8gbW92ZSBhbGwgdGhlIHkgb2Zmc2V0XG5cdFx0bW92ZXMucHVzaChbeURpciwgeUFic10pO1xuXHRcdC8vIG1vdmUgc2Vjb25kSGFsZiBvZiB0aGUgeCBvZmZzZXQuXG5cdFx0dGVtcERpc3QgPSBNYXRoLmZsb29yKHhBYnMgKiBzZWNvbmRIYWxmKTtcblx0XHRtb3Zlcy5wdXNoKFt4RGlyLCB0ZW1wRGlzdF0pOyAgXG5cdH1cblx0XG5cdHRoaXMubWFwW3hwb3NdW3lwb3NdID0gMDtcblx0XG5cdHdoaWxlIChtb3Zlcy5sZW5ndGggPiAwKSB7XG5cdFx0bW92ZSA9IG1vdmVzLnBvcCgpO1xuXHRcdHdoaWxlIChtb3ZlWzFdID4gMCkge1xuXHRcdFx0eHBvcyArPSBST1QuRElSU1s4XVttb3ZlWzBdXVswXTtcblx0XHRcdHlwb3MgKz0gUk9ULkRJUlNbOF1bbW92ZVswXV1bMV07XG5cdFx0XHR0aGlzLm1hcFt4cG9zXVt5cG9zXSA9IDA7XG5cdFx0XHRtb3ZlWzFdID0gbW92ZVsxXSAtIDE7XG5cdFx0fVxuXHR9XG59XG5cblJPVC5NYXAuUm9ndWUucHJvdG90eXBlLl9jcmVhdGVDb3JyaWRvcnMgPSBmdW5jdGlvbiAoKSB7XG5cdC8vIERyYXcgQ29ycmlkb3JzIGJldHdlZW4gY29ubmVjdGVkIHJvb21zXG5cdFxuXHR2YXIgY3cgPSB0aGlzLl9vcHRpb25zLmNlbGxXaWR0aDtcblx0dmFyIGNoID0gdGhpcy5fb3B0aW9ucy5jZWxsSGVpZ2h0O1xuXHR2YXIgcm9vbTtcblx0dmFyIGNvbm5lY3Rpb247XG5cdHZhciBvdGhlclJvb207XG5cdHZhciB3YWxsO1xuXHR2YXIgb3RoZXJXYWxsO1xuXHRcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjdzsgaSsrKSB7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBjaDsgaisrKSB7XG5cdFx0XHRyb29tID0gdGhpcy5yb29tc1tpXVtqXTtcblx0XHRcdFxuXHRcdFx0Zm9yICh2YXIgayA9IDA7IGsgPCByb29tW1wiY29ubmVjdGlvbnNcIl0ubGVuZ3RoOyBrKyspIHtcblx0XHRcdFx0XHRcblx0XHRcdFx0Y29ubmVjdGlvbiA9IHJvb21bXCJjb25uZWN0aW9uc1wiXVtrXTsgXG5cdFx0XHRcdFxuXHRcdFx0XHRvdGhlclJvb20gPSB0aGlzLnJvb21zW2Nvbm5lY3Rpb25bMF1dW2Nvbm5lY3Rpb25bMV1dO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gZmlndXJlIG91dCB3aGF0IHdhbGwgb3VyIGNvcnJpZG9yIHdpbGwgc3RhcnQgb25lLlxuXHRcdFx0XHQvLyBmaWd1cmUgb3V0IHdoYXQgd2FsbCBvdXIgY29ycmlkb3Igd2lsbCBlbmQgb24uIFxuXHRcdFx0XHRpZiAob3RoZXJSb29tW1wiY2VsbHhcIl0gPiByb29tW1wiY2VsbHhcIl0gKSB7XG5cdFx0XHRcdFx0d2FsbCA9IDI7XG5cdFx0XHRcdFx0b3RoZXJXYWxsID0gNDtcblx0XHRcdFx0fSBlbHNlIGlmIChvdGhlclJvb21bXCJjZWxseFwiXSA8IHJvb21bXCJjZWxseFwiXSApIHtcblx0XHRcdFx0XHR3YWxsID0gNDtcblx0XHRcdFx0XHRvdGhlcldhbGwgPSAyO1xuXHRcdFx0XHR9IGVsc2UgaWYob3RoZXJSb29tW1wiY2VsbHlcIl0gPiByb29tW1wiY2VsbHlcIl0pIHtcblx0XHRcdFx0XHR3YWxsID0gMztcblx0XHRcdFx0XHRvdGhlcldhbGwgPSAxO1xuXHRcdFx0XHR9IGVsc2UgaWYob3RoZXJSb29tW1wiY2VsbHlcIl0gPCByb29tW1wiY2VsbHlcIl0pIHtcblx0XHRcdFx0XHR3YWxsID0gMTtcblx0XHRcdFx0XHRvdGhlcldhbGwgPSAzO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHR0aGlzLl9kcmF3Q29ycmlkb3JlKHRoaXMuX2dldFdhbGxQb3NpdGlvbihyb29tLCB3YWxsKSwgdGhpcy5fZ2V0V2FsbFBvc2l0aW9uKG90aGVyUm9vbSwgb3RoZXJXYWxsKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG4vKipcbiAqIEBjbGFzcyBEdW5nZW9uIGZlYXR1cmU7IGhhcyBvd24gLmNyZWF0ZSgpIG1ldGhvZFxuICovXG5ST1QuTWFwLkZlYXR1cmUgPSBmdW5jdGlvbigpIHt9XG5ST1QuTWFwLkZlYXR1cmUucHJvdG90eXBlLmlzVmFsaWQgPSBmdW5jdGlvbihjYW5CZUR1Z0NhbGxiYWNrKSB7fVxuUk9ULk1hcC5GZWF0dXJlLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbihkaWdDYWxsYmFjaykge31cblJPVC5NYXAuRmVhdHVyZS5wcm90b3R5cGUuZGVidWcgPSBmdW5jdGlvbigpIHt9XG5ST1QuTWFwLkZlYXR1cmUuY3JlYXRlUmFuZG9tQXQgPSBmdW5jdGlvbih4LCB5LCBkeCwgZHksIG9wdGlvbnMpIHt9XG5cbi8qKlxuICogQGNsYXNzIFJvb21cbiAqIEBhdWdtZW50cyBST1QuTWFwLkZlYXR1cmVcbiAqIEBwYXJhbSB7aW50fSB4MVxuICogQHBhcmFtIHtpbnR9IHkxXG4gKiBAcGFyYW0ge2ludH0geDJcbiAqIEBwYXJhbSB7aW50fSB5MlxuICogQHBhcmFtIHtpbnR9IFtkb29yWF1cbiAqIEBwYXJhbSB7aW50fSBbZG9vclldXG4gKi9cblJPVC5NYXAuRmVhdHVyZS5Sb29tID0gZnVuY3Rpb24oeDEsIHkxLCB4MiwgeTIsIGRvb3JYLCBkb29yWSkge1xuXHR0aGlzLl94MSA9IHgxO1xuXHR0aGlzLl95MSA9IHkxO1xuXHR0aGlzLl94MiA9IHgyO1xuXHR0aGlzLl95MiA9IHkyO1xuXHR0aGlzLl9kb29ycyA9IHt9O1xuXHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDQpIHsgdGhpcy5hZGREb29yKGRvb3JYLCBkb29yWSk7IH1cbn1cblJPVC5NYXAuRmVhdHVyZS5Sb29tLmV4dGVuZChST1QuTWFwLkZlYXR1cmUpO1xuXG4vKipcbiAqIFJvb20gb2YgcmFuZG9tIHNpemUsIHdpdGggYSBnaXZlbiBkb29ycyBhbmQgZGlyZWN0aW9uXG4gKi9cblJPVC5NYXAuRmVhdHVyZS5Sb29tLmNyZWF0ZVJhbmRvbUF0ID0gZnVuY3Rpb24oeCwgeSwgZHgsIGR5LCBvcHRpb25zKSB7XG5cdHZhciBtaW4gPSBvcHRpb25zLnJvb21XaWR0aFswXTtcblx0dmFyIG1heCA9IG9wdGlvbnMucm9vbVdpZHRoWzFdO1xuXHR2YXIgd2lkdGggPSBtaW4gKyBNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpKihtYXgtbWluKzEpKTtcblx0XG5cdHZhciBtaW4gPSBvcHRpb25zLnJvb21IZWlnaHRbMF07XG5cdHZhciBtYXggPSBvcHRpb25zLnJvb21IZWlnaHRbMV07XG5cdHZhciBoZWlnaHQgPSBtaW4gKyBNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpKihtYXgtbWluKzEpKTtcblx0XG5cdGlmIChkeCA9PSAxKSB7IC8qIHRvIHRoZSByaWdodCAqL1xuXHRcdHZhciB5MiA9IHkgLSBNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpICogaGVpZ2h0KTtcblx0XHRyZXR1cm4gbmV3IHRoaXMoeCsxLCB5MiwgeCt3aWR0aCwgeTIraGVpZ2h0LTEsIHgsIHkpO1xuXHR9XG5cdFxuXHRpZiAoZHggPT0gLTEpIHsgLyogdG8gdGhlIGxlZnQgKi9cblx0XHR2YXIgeTIgPSB5IC0gTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSAqIGhlaWdodCk7XG5cdFx0cmV0dXJuIG5ldyB0aGlzKHgtd2lkdGgsIHkyLCB4LTEsIHkyK2hlaWdodC0xLCB4LCB5KTtcblx0fVxuXG5cdGlmIChkeSA9PSAxKSB7IC8qIHRvIHRoZSBib3R0b20gKi9cblx0XHR2YXIgeDIgPSB4IC0gTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSAqIHdpZHRoKTtcblx0XHRyZXR1cm4gbmV3IHRoaXMoeDIsIHkrMSwgeDIrd2lkdGgtMSwgeStoZWlnaHQsIHgsIHkpO1xuXHR9XG5cblx0aWYgKGR5ID09IC0xKSB7IC8qIHRvIHRoZSB0b3AgKi9cblx0XHR2YXIgeDIgPSB4IC0gTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSAqIHdpZHRoKTtcblx0XHRyZXR1cm4gbmV3IHRoaXMoeDIsIHktaGVpZ2h0LCB4Mit3aWR0aC0xLCB5LTEsIHgsIHkpO1xuXHR9XG59XG5cbi8qKlxuICogUm9vbSBvZiByYW5kb20gc2l6ZSwgcG9zaXRpb25lZCBhcm91bmQgY2VudGVyIGNvb3Jkc1xuICovXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5jcmVhdGVSYW5kb21DZW50ZXIgPSBmdW5jdGlvbihjeCwgY3ksIG9wdGlvbnMpIHtcblx0dmFyIG1pbiA9IG9wdGlvbnMucm9vbVdpZHRoWzBdO1xuXHR2YXIgbWF4ID0gb3B0aW9ucy5yb29tV2lkdGhbMV07XG5cdHZhciB3aWR0aCA9IG1pbiArIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkqKG1heC1taW4rMSkpO1xuXHRcblx0dmFyIG1pbiA9IG9wdGlvbnMucm9vbUhlaWdodFswXTtcblx0dmFyIG1heCA9IG9wdGlvbnMucm9vbUhlaWdodFsxXTtcblx0dmFyIGhlaWdodCA9IG1pbiArIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkqKG1heC1taW4rMSkpO1xuXG5cdHZhciB4MSA9IGN4IC0gTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSp3aWR0aCk7XG5cdHZhciB5MSA9IGN5IC0gTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSpoZWlnaHQpO1xuXHR2YXIgeDIgPSB4MSArIHdpZHRoIC0gMTtcblx0dmFyIHkyID0geTEgKyBoZWlnaHQgLSAxO1xuXG5cdHJldHVybiBuZXcgdGhpcyh4MSwgeTEsIHgyLCB5Mik7XG59XG5cbi8qKlxuICogUm9vbSBvZiByYW5kb20gc2l6ZSB3aXRoaW4gYSBnaXZlbiBkaW1lbnNpb25zXG4gKi9cblJPVC5NYXAuRmVhdHVyZS5Sb29tLmNyZWF0ZVJhbmRvbSA9IGZ1bmN0aW9uKGF2YWlsV2lkdGgsIGF2YWlsSGVpZ2h0LCBvcHRpb25zKSB7XG5cdHZhciBtaW4gPSBvcHRpb25zLnJvb21XaWR0aFswXTtcblx0dmFyIG1heCA9IG9wdGlvbnMucm9vbVdpZHRoWzFdO1xuXHR2YXIgd2lkdGggPSBtaW4gKyBNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpKihtYXgtbWluKzEpKTtcblx0XG5cdHZhciBtaW4gPSBvcHRpb25zLnJvb21IZWlnaHRbMF07XG5cdHZhciBtYXggPSBvcHRpb25zLnJvb21IZWlnaHRbMV07XG5cdHZhciBoZWlnaHQgPSBtaW4gKyBNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpKihtYXgtbWluKzEpKTtcblx0XG5cdHZhciBsZWZ0ID0gYXZhaWxXaWR0aCAtIHdpZHRoIC0gMTtcblx0dmFyIHRvcCA9IGF2YWlsSGVpZ2h0IC0gaGVpZ2h0IC0gMTtcblxuXHR2YXIgeDEgPSAxICsgTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSpsZWZ0KTtcblx0dmFyIHkxID0gMSArIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkqdG9wKTtcblx0dmFyIHgyID0geDEgKyB3aWR0aCAtIDE7XG5cdHZhciB5MiA9IHkxICsgaGVpZ2h0IC0gMTtcblxuXHRyZXR1cm4gbmV3IHRoaXMoeDEsIHkxLCB4MiwgeTIpO1xufVxuXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5wcm90b3R5cGUuYWRkRG9vciA9IGZ1bmN0aW9uKHgsIHkpIHtcblx0dGhpcy5fZG9vcnNbeCtcIixcIit5XSA9IDE7XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7ZnVuY3Rpb259XG4gKi9cblJPVC5NYXAuRmVhdHVyZS5Sb29tLnByb3RvdHlwZS5nZXREb29ycyA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdGZvciAodmFyIGtleSBpbiB0aGlzLl9kb29ycykge1xuXHRcdHZhciBwYXJ0cyA9IGtleS5zcGxpdChcIixcIik7XG5cdFx0Y2FsbGJhY2socGFyc2VJbnQocGFydHNbMF0pLCBwYXJzZUludChwYXJ0c1sxXSkpO1xuXHR9XG5cdHJldHVybiB0aGlzO1xufVxuXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5wcm90b3R5cGUuY2xlYXJEb29ycyA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9kb29ycyA9IHt9O1xuXHRyZXR1cm4gdGhpcztcbn1cblxuUk9ULk1hcC5GZWF0dXJlLlJvb20ucHJvdG90eXBlLmFkZERvb3JzID0gZnVuY3Rpb24oaXNXYWxsQ2FsbGJhY2spIHtcblx0dmFyIGxlZnQgPSB0aGlzLl94MS0xO1xuXHR2YXIgcmlnaHQgPSB0aGlzLl94MisxO1xuXHR2YXIgdG9wID0gdGhpcy5feTEtMTtcblx0dmFyIGJvdHRvbSA9IHRoaXMuX3kyKzE7XG5cblx0Zm9yICh2YXIgeD1sZWZ0OyB4PD1yaWdodDsgeCsrKSB7XG5cdFx0Zm9yICh2YXIgeT10b3A7IHk8PWJvdHRvbTsgeSsrKSB7XG5cdFx0XHRpZiAoeCAhPSBsZWZ0ICYmIHggIT0gcmlnaHQgJiYgeSAhPSB0b3AgJiYgeSAhPSBib3R0b20pIHsgY29udGludWU7IH1cblx0XHRcdGlmIChpc1dhbGxDYWxsYmFjayh4LCB5KSkgeyBjb250aW51ZTsgfVxuXG5cdFx0XHR0aGlzLmFkZERvb3IoeCwgeSk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRoaXM7XG59XG5cblJPVC5NYXAuRmVhdHVyZS5Sb29tLnByb3RvdHlwZS5kZWJ1ZyA9IGZ1bmN0aW9uKCkge1xuXHRjb25zb2xlLmxvZyhcInJvb21cIiwgdGhpcy5feDEsIHRoaXMuX3kxLCB0aGlzLl94MiwgdGhpcy5feTIpO1xufVxuXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5wcm90b3R5cGUuaXNWYWxpZCA9IGZ1bmN0aW9uKGlzV2FsbENhbGxiYWNrLCBjYW5CZUR1Z0NhbGxiYWNrKSB7IFxuXHR2YXIgbGVmdCA9IHRoaXMuX3gxLTE7XG5cdHZhciByaWdodCA9IHRoaXMuX3gyKzE7XG5cdHZhciB0b3AgPSB0aGlzLl95MS0xO1xuXHR2YXIgYm90dG9tID0gdGhpcy5feTIrMTtcblx0XG5cdGZvciAodmFyIHg9bGVmdDsgeDw9cmlnaHQ7IHgrKykge1xuXHRcdGZvciAodmFyIHk9dG9wOyB5PD1ib3R0b207IHkrKykge1xuXHRcdFx0aWYgKHggPT0gbGVmdCB8fCB4ID09IHJpZ2h0IHx8IHkgPT0gdG9wIHx8IHkgPT0gYm90dG9tKSB7XG5cdFx0XHRcdGlmICghaXNXYWxsQ2FsbGJhY2soeCwgeSkpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoIWNhbkJlRHVnQ2FsbGJhY2soeCwgeSkpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gZGlnQ2FsbGJhY2sgRGlnIGNhbGxiYWNrIHdpdGggYSBzaWduYXR1cmUgKHgsIHksIHZhbHVlKS4gVmFsdWVzOiAwID0gZW1wdHksIDEgPSB3YWxsLCAyID0gZG9vci4gTXVsdGlwbGUgZG9vcnMgYXJlIGFsbG93ZWQuXG4gKi9cblJPVC5NYXAuRmVhdHVyZS5Sb29tLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbihkaWdDYWxsYmFjaykgeyBcblx0dmFyIGxlZnQgPSB0aGlzLl94MS0xO1xuXHR2YXIgcmlnaHQgPSB0aGlzLl94MisxO1xuXHR2YXIgdG9wID0gdGhpcy5feTEtMTtcblx0dmFyIGJvdHRvbSA9IHRoaXMuX3kyKzE7XG5cdFxuXHR2YXIgdmFsdWUgPSAwO1xuXHRmb3IgKHZhciB4PWxlZnQ7IHg8PXJpZ2h0OyB4KyspIHtcblx0XHRmb3IgKHZhciB5PXRvcDsgeTw9Ym90dG9tOyB5KyspIHtcblx0XHRcdGlmICh4K1wiLFwiK3kgaW4gdGhpcy5fZG9vcnMpIHtcblx0XHRcdFx0dmFsdWUgPSAyO1xuXHRcdFx0fSBlbHNlIGlmICh4ID09IGxlZnQgfHwgeCA9PSByaWdodCB8fCB5ID09IHRvcCB8fCB5ID09IGJvdHRvbSkge1xuXHRcdFx0XHR2YWx1ZSA9IDE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YWx1ZSA9IDA7XG5cdFx0XHR9XG5cdFx0XHRkaWdDYWxsYmFjayh4LCB5LCB2YWx1ZSk7XG5cdFx0fVxuXHR9XG59XG5cblJPVC5NYXAuRmVhdHVyZS5Sb29tLnByb3RvdHlwZS5nZXRDZW50ZXIgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIFtNYXRoLnJvdW5kKCh0aGlzLl94MSArIHRoaXMuX3gyKS8yKSwgTWF0aC5yb3VuZCgodGhpcy5feTEgKyB0aGlzLl95MikvMildO1xufVxuXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5wcm90b3R5cGUuZ2V0TGVmdCA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5feDE7XG59XG5cblJPVC5NYXAuRmVhdHVyZS5Sb29tLnByb3RvdHlwZS5nZXRSaWdodCA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5feDI7XG59XG5cblJPVC5NYXAuRmVhdHVyZS5Sb29tLnByb3RvdHlwZS5nZXRUb3AgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuX3kxO1xufVxuXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5wcm90b3R5cGUuZ2V0Qm90dG9tID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLl95Mjtcbn1cblxuLyoqXG4gKiBAY2xhc3MgQ29ycmlkb3JcbiAqIEBhdWdtZW50cyBST1QuTWFwLkZlYXR1cmVcbiAqIEBwYXJhbSB7aW50fSBzdGFydFhcbiAqIEBwYXJhbSB7aW50fSBzdGFydFlcbiAqIEBwYXJhbSB7aW50fSBlbmRYXG4gKiBAcGFyYW0ge2ludH0gZW5kWVxuICovXG5ST1QuTWFwLkZlYXR1cmUuQ29ycmlkb3IgPSBmdW5jdGlvbihzdGFydFgsIHN0YXJ0WSwgZW5kWCwgZW5kWSkge1xuXHR0aGlzLl9zdGFydFggPSBzdGFydFg7XG5cdHRoaXMuX3N0YXJ0WSA9IHN0YXJ0WTtcblx0dGhpcy5fZW5kWCA9IGVuZFg7IFxuXHR0aGlzLl9lbmRZID0gZW5kWTtcblx0dGhpcy5fZW5kc1dpdGhBV2FsbCA9IHRydWU7XG59XG5ST1QuTWFwLkZlYXR1cmUuQ29ycmlkb3IuZXh0ZW5kKFJPVC5NYXAuRmVhdHVyZSk7XG5cblJPVC5NYXAuRmVhdHVyZS5Db3JyaWRvci5jcmVhdGVSYW5kb21BdCA9IGZ1bmN0aW9uKHgsIHksIGR4LCBkeSwgb3B0aW9ucykge1xuXHR2YXIgbWluID0gb3B0aW9ucy5jb3JyaWRvckxlbmd0aFswXTtcblx0dmFyIG1heCA9IG9wdGlvbnMuY29ycmlkb3JMZW5ndGhbMV07XG5cdHZhciBsZW5ndGggPSBtaW4gKyBNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpKihtYXgtbWluKzEpKTtcblx0XG5cdHJldHVybiBuZXcgdGhpcyh4LCB5LCB4ICsgZHgqbGVuZ3RoLCB5ICsgZHkqbGVuZ3RoKTtcbn1cblxuUk9ULk1hcC5GZWF0dXJlLkNvcnJpZG9yLnByb3RvdHlwZS5kZWJ1ZyA9IGZ1bmN0aW9uKCkge1xuXHRjb25zb2xlLmxvZyhcImNvcnJpZG9yXCIsIHRoaXMuX3N0YXJ0WCwgdGhpcy5fc3RhcnRZLCB0aGlzLl9lbmRYLCB0aGlzLl9lbmRZKTtcbn1cblxuUk9ULk1hcC5GZWF0dXJlLkNvcnJpZG9yLnByb3RvdHlwZS5pc1ZhbGlkID0gZnVuY3Rpb24oaXNXYWxsQ2FsbGJhY2ssIGNhbkJlRHVnQ2FsbGJhY2speyBcblx0dmFyIHN4ID0gdGhpcy5fc3RhcnRYO1xuXHR2YXIgc3kgPSB0aGlzLl9zdGFydFk7XG5cdHZhciBkeCA9IHRoaXMuX2VuZFgtc3g7XG5cdHZhciBkeSA9IHRoaXMuX2VuZFktc3k7XG5cdHZhciBsZW5ndGggPSAxICsgTWF0aC5tYXgoTWF0aC5hYnMoZHgpLCBNYXRoLmFicyhkeSkpO1xuXHRcblx0aWYgKGR4KSB7IGR4ID0gZHgvTWF0aC5hYnMoZHgpOyB9XG5cdGlmIChkeSkgeyBkeSA9IGR5L01hdGguYWJzKGR5KTsgfVxuXHR2YXIgbnggPSBkeTtcblx0dmFyIG55ID0gLWR4O1xuXHRcblx0dmFyIG9rID0gdHJ1ZTtcblx0Zm9yICh2YXIgaT0wOyBpPGxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIHggPSBzeCArIGkqZHg7XG5cdFx0dmFyIHkgPSBzeSArIGkqZHk7XG5cblx0XHRpZiAoIWNhbkJlRHVnQ2FsbGJhY2soICAgICB4LCAgICAgIHkpKSB7IG9rID0gZmFsc2U7IH1cblx0XHRpZiAoIWlzV2FsbENhbGxiYWNrICAoeCArIG54LCB5ICsgbnkpKSB7IG9rID0gZmFsc2U7IH1cblx0XHRpZiAoIWlzV2FsbENhbGxiYWNrICAoeCAtIG54LCB5IC0gbnkpKSB7IG9rID0gZmFsc2U7IH1cblx0XHRcblx0XHRpZiAoIW9rKSB7XG5cdFx0XHRsZW5ndGggPSBpO1xuXHRcdFx0dGhpcy5fZW5kWCA9IHgtZHg7XG5cdFx0XHR0aGlzLl9lbmRZID0geS1keTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqXG5cdCAqIElmIHRoZSBsZW5ndGggZGVnZW5lcmF0ZWQsIHRoaXMgY29ycmlkb3IgbWlnaHQgYmUgaW52YWxpZFxuXHQgKi9cblx0IFxuXHQvKiBub3Qgc3VwcG9ydGVkICovXG5cdGlmIChsZW5ndGggPT0gMCkgeyByZXR1cm4gZmFsc2U7IH0gXG5cdFxuXHQgLyogbGVuZ3RoIDEgYWxsb3dlZCBvbmx5IGlmIHRoZSBuZXh0IHNwYWNlIGlzIGVtcHR5ICovXG5cdGlmIChsZW5ndGggPT0gMSAmJiBpc1dhbGxDYWxsYmFjayh0aGlzLl9lbmRYICsgZHgsIHRoaXMuX2VuZFkgKyBkeSkpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdFxuXHQvKipcblx0ICogV2UgZG8gbm90IHdhbnQgdGhlIGNvcnJpZG9yIHRvIGNyYXNoIGludG8gYSBjb3JuZXIgb2YgYSByb29tO1xuXHQgKiBpZiBhbnkgb2YgdGhlIGVuZGluZyBjb3JuZXJzIGlzIGVtcHR5LCB0aGUgTisxdGggY2VsbCBvZiB0aGlzIGNvcnJpZG9yIG11c3QgYmUgZW1wdHkgdG9vLlxuXHQgKiBcblx0ICogU2l0dWF0aW9uOlxuXHQgKiAjIyMjIyMjMVxuXHQgKiAuLi4uLi4uP1xuXHQgKiAjIyMjIyMjMlxuXHQgKiBcblx0ICogVGhlIGNvcnJpZG9yIHdhcyBkdWcgZnJvbSBsZWZ0IHRvIHJpZ2h0LlxuXHQgKiAxLCAyIC0gcHJvYmxlbWF0aWMgY29ybmVycywgPyA9IE4rMXRoIGNlbGwgKG5vdCBkdWcpXG5cdCAqL1xuXHR2YXIgZmlyc3RDb3JuZXJCYWQgPSAhaXNXYWxsQ2FsbGJhY2sodGhpcy5fZW5kWCArIGR4ICsgbngsIHRoaXMuX2VuZFkgKyBkeSArIG55KTtcblx0dmFyIHNlY29uZENvcm5lckJhZCA9ICFpc1dhbGxDYWxsYmFjayh0aGlzLl9lbmRYICsgZHggLSBueCwgdGhpcy5fZW5kWSArIGR5IC0gbnkpO1xuXHR0aGlzLl9lbmRzV2l0aEFXYWxsID0gaXNXYWxsQ2FsbGJhY2sodGhpcy5fZW5kWCArIGR4LCB0aGlzLl9lbmRZICsgZHkpO1xuXHRpZiAoKGZpcnN0Q29ybmVyQmFkIHx8IHNlY29uZENvcm5lckJhZCkgJiYgdGhpcy5fZW5kc1dpdGhBV2FsbCkgeyByZXR1cm4gZmFsc2U7IH1cblxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBkaWdDYWxsYmFjayBEaWcgY2FsbGJhY2sgd2l0aCBhIHNpZ25hdHVyZSAoeCwgeSwgdmFsdWUpLiBWYWx1ZXM6IDAgPSBlbXB0eS5cbiAqL1xuUk9ULk1hcC5GZWF0dXJlLkNvcnJpZG9yLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbihkaWdDYWxsYmFjaykgeyBcblx0dmFyIHN4ID0gdGhpcy5fc3RhcnRYO1xuXHR2YXIgc3kgPSB0aGlzLl9zdGFydFk7XG5cdHZhciBkeCA9IHRoaXMuX2VuZFgtc3g7XG5cdHZhciBkeSA9IHRoaXMuX2VuZFktc3k7XG5cdHZhciBsZW5ndGggPSAxK01hdGgubWF4KE1hdGguYWJzKGR4KSwgTWF0aC5hYnMoZHkpKTtcblx0XG5cdGlmIChkeCkgeyBkeCA9IGR4L01hdGguYWJzKGR4KTsgfVxuXHRpZiAoZHkpIHsgZHkgPSBkeS9NYXRoLmFicyhkeSk7IH1cblx0dmFyIG54ID0gZHk7XG5cdHZhciBueSA9IC1keDtcblx0XG5cdGZvciAodmFyIGk9MDsgaTxsZW5ndGg7IGkrKykge1xuXHRcdHZhciB4ID0gc3ggKyBpKmR4O1xuXHRcdHZhciB5ID0gc3kgKyBpKmR5O1xuXHRcdGRpZ0NhbGxiYWNrKHgsIHksIDApO1xuXHR9XG5cdFxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuUk9ULk1hcC5GZWF0dXJlLkNvcnJpZG9yLnByb3RvdHlwZS5jcmVhdGVQcmlvcml0eVdhbGxzID0gZnVuY3Rpb24ocHJpb3JpdHlXYWxsQ2FsbGJhY2spIHtcblx0aWYgKCF0aGlzLl9lbmRzV2l0aEFXYWxsKSB7IHJldHVybjsgfVxuXG5cdHZhciBzeCA9IHRoaXMuX3N0YXJ0WDtcblx0dmFyIHN5ID0gdGhpcy5fc3RhcnRZO1xuXG5cdHZhciBkeCA9IHRoaXMuX2VuZFgtc3g7XG5cdHZhciBkeSA9IHRoaXMuX2VuZFktc3k7XG5cdGlmIChkeCkgeyBkeCA9IGR4L01hdGguYWJzKGR4KTsgfVxuXHRpZiAoZHkpIHsgZHkgPSBkeS9NYXRoLmFicyhkeSk7IH1cblx0dmFyIG54ID0gZHk7XG5cdHZhciBueSA9IC1keDtcblxuXHRwcmlvcml0eVdhbGxDYWxsYmFjayh0aGlzLl9lbmRYICsgZHgsIHRoaXMuX2VuZFkgKyBkeSk7XG5cdHByaW9yaXR5V2FsbENhbGxiYWNrKHRoaXMuX2VuZFggKyBueCwgdGhpcy5fZW5kWSArIG55KTtcblx0cHJpb3JpdHlXYWxsQ2FsbGJhY2sodGhpcy5fZW5kWCAtIG54LCB0aGlzLl9lbmRZIC0gbnkpO1xufS8qKlxuICogQGNsYXNzIEJhc2Ugbm9pc2UgZ2VuZXJhdG9yXG4gKi9cblJPVC5Ob2lzZSA9IGZ1bmN0aW9uKCkge1xufTtcblxuUk9ULk5vaXNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbih4LCB5KSB7fVxuLyoqXG4gKiBBIHNpbXBsZSAyZCBpbXBsZW1lbnRhdGlvbiBvZiBzaW1wbGV4IG5vaXNlIGJ5IE9uZHJlaiBaYXJhXG4gKlxuICogQmFzZWQgb24gYSBzcGVlZC1pbXByb3ZlZCBzaW1wbGV4IG5vaXNlIGFsZ29yaXRobSBmb3IgMkQsIDNEIGFuZCA0RCBpbiBKYXZhLlxuICogV2hpY2ggaXMgYmFzZWQgb24gZXhhbXBsZSBjb2RlIGJ5IFN0ZWZhbiBHdXN0YXZzb24gKHN0ZWd1QGl0bi5saXUuc2UpLlxuICogV2l0aCBPcHRpbWlzYXRpb25zIGJ5IFBldGVyIEVhc3RtYW4gKHBlYXN0bWFuQGRyaXp6bGUuc3RhbmZvcmQuZWR1KS5cbiAqIEJldHRlciByYW5rIG9yZGVyaW5nIG1ldGhvZCBieSBTdGVmYW4gR3VzdGF2c29uIGluIDIwMTIuXG4gKi9cblxuLyoqXG4gKiBAY2xhc3MgMkQgc2ltcGxleCBub2lzZSBnZW5lcmF0b3JcbiAqIEBwYXJhbSB7aW50fSBbZ3JhZGllbnRzPTI1Nl0gUmFuZG9tIGdyYWRpZW50c1xuICovXG5ST1QuTm9pc2UuU2ltcGxleCA9IGZ1bmN0aW9uKGdyYWRpZW50cykge1xuXHRST1QuTm9pc2UuY2FsbCh0aGlzKTtcblxuXHR0aGlzLl9GMiA9IDAuNSAqIChNYXRoLnNxcnQoMykgLSAxKTtcbiAgICB0aGlzLl9HMiA9ICgzIC0gTWF0aC5zcXJ0KDMpKSAvIDY7XG5cblx0dGhpcy5fZ3JhZGllbnRzID0gW1xuXHRcdFsgMCwgLTFdLFxuXHRcdFsgMSwgLTFdLFxuXHRcdFsgMSwgIDBdLFxuXHRcdFsgMSwgIDFdLFxuXHRcdFsgMCwgIDFdLFxuXHRcdFstMSwgIDFdLFxuXHRcdFstMSwgIDBdLFxuXHRcdFstMSwgLTFdXG5cdF07XG5cblx0dmFyIHBlcm11dGF0aW9ucyA9IFtdO1xuXHR2YXIgY291bnQgPSBncmFkaWVudHMgfHwgMjU2O1xuXHRmb3IgKHZhciBpPTA7aTxjb3VudDtpKyspIHsgcGVybXV0YXRpb25zLnB1c2goaSk7IH1cblx0cGVybXV0YXRpb25zID0gcGVybXV0YXRpb25zLnJhbmRvbWl6ZSgpO1xuXG5cdHRoaXMuX3Blcm1zID0gW107XG5cdHRoaXMuX2luZGV4ZXMgPSBbXTtcblxuXHRmb3IgKHZhciBpPTA7aTwyKmNvdW50O2krKykge1xuXHRcdHRoaXMuX3Blcm1zLnB1c2gocGVybXV0YXRpb25zW2kgJSBjb3VudF0pO1xuXHRcdHRoaXMuX2luZGV4ZXMucHVzaCh0aGlzLl9wZXJtc1tpXSAlIHRoaXMuX2dyYWRpZW50cy5sZW5ndGgpO1xuXHR9XG5cbn07XG5ST1QuTm9pc2UuU2ltcGxleC5leHRlbmQoUk9ULk5vaXNlKTtcblxuUk9ULk5vaXNlLlNpbXBsZXgucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKHhpbiwgeWluKSB7XG5cdHZhciBwZXJtcyA9IHRoaXMuX3Blcm1zO1xuXHR2YXIgaW5kZXhlcyA9IHRoaXMuX2luZGV4ZXM7XG5cdHZhciBjb3VudCA9IHBlcm1zLmxlbmd0aC8yO1xuXHR2YXIgRzIgPSB0aGlzLl9HMjtcblxuXHR2YXIgbjAgPTAsIG4xID0gMCwgbjIgPSAwLCBnaTsgLy8gTm9pc2UgY29udHJpYnV0aW9ucyBmcm9tIHRoZSB0aHJlZSBjb3JuZXJzXG5cblx0Ly8gU2tldyB0aGUgaW5wdXQgc3BhY2UgdG8gZGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggY2VsbCB3ZSdyZSBpblxuXHR2YXIgcyA9ICh4aW4gKyB5aW4pICogdGhpcy5fRjI7IC8vIEhhaXJ5IGZhY3RvciBmb3IgMkRcblx0dmFyIGkgPSBNYXRoLmZsb29yKHhpbiArIHMpO1xuXHR2YXIgaiA9IE1hdGguZmxvb3IoeWluICsgcyk7XG5cdHZhciB0ID0gKGkgKyBqKSAqIEcyO1xuXHR2YXIgWDAgPSBpIC0gdDsgLy8gVW5za2V3IHRoZSBjZWxsIG9yaWdpbiBiYWNrIHRvICh4LHkpIHNwYWNlXG5cdHZhciBZMCA9IGogLSB0O1xuXHR2YXIgeDAgPSB4aW4gLSBYMDsgLy8gVGhlIHgseSBkaXN0YW5jZXMgZnJvbSB0aGUgY2VsbCBvcmlnaW5cblx0dmFyIHkwID0geWluIC0gWTA7XG5cblx0Ly8gRm9yIHRoZSAyRCBjYXNlLCB0aGUgc2ltcGxleCBzaGFwZSBpcyBhbiBlcXVpbGF0ZXJhbCB0cmlhbmdsZS5cblx0Ly8gRGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggd2UgYXJlIGluLlxuXHR2YXIgaTEsIGoxOyAvLyBPZmZzZXRzIGZvciBzZWNvbmQgKG1pZGRsZSkgY29ybmVyIG9mIHNpbXBsZXggaW4gKGksaikgY29vcmRzXG5cdGlmICh4MCA+IHkwKSB7XG5cdFx0aTEgPSAxO1xuXHRcdGoxID0gMDtcblx0fSBlbHNlIHsgLy8gbG93ZXIgdHJpYW5nbGUsIFhZIG9yZGVyOiAoMCwwKS0+KDEsMCktPigxLDEpXG5cdFx0aTEgPSAwO1xuXHRcdGoxID0gMTtcblx0fSAvLyB1cHBlciB0cmlhbmdsZSwgWVggb3JkZXI6ICgwLDApLT4oMCwxKS0+KDEsMSlcblxuXHQvLyBBIHN0ZXAgb2YgKDEsMCkgaW4gKGksaikgbWVhbnMgYSBzdGVwIG9mICgxLWMsLWMpIGluICh4LHkpLCBhbmRcblx0Ly8gYSBzdGVwIG9mICgwLDEpIGluIChpLGopIG1lYW5zIGEgc3RlcCBvZiAoLWMsMS1jKSBpbiAoeCx5KSwgd2hlcmVcblx0Ly8gYyA9ICgzLXNxcnQoMykpLzZcblx0dmFyIHgxID0geDAgLSBpMSArIEcyOyAvLyBPZmZzZXRzIGZvciBtaWRkbGUgY29ybmVyIGluICh4LHkpIHVuc2tld2VkIGNvb3Jkc1xuXHR2YXIgeTEgPSB5MCAtIGoxICsgRzI7XG5cdHZhciB4MiA9IHgwIC0gMSArIDIqRzI7IC8vIE9mZnNldHMgZm9yIGxhc3QgY29ybmVyIGluICh4LHkpIHVuc2tld2VkIGNvb3Jkc1xuXHR2YXIgeTIgPSB5MCAtIDEgKyAyKkcyO1xuXG5cdC8vIFdvcmsgb3V0IHRoZSBoYXNoZWQgZ3JhZGllbnQgaW5kaWNlcyBvZiB0aGUgdGhyZWUgc2ltcGxleCBjb3JuZXJzXG5cdHZhciBpaSA9IGkubW9kKGNvdW50KTtcblx0dmFyIGpqID0gai5tb2QoY291bnQpO1xuXG5cdC8vIENhbGN1bGF0ZSB0aGUgY29udHJpYnV0aW9uIGZyb20gdGhlIHRocmVlIGNvcm5lcnNcblx0dmFyIHQwID0gMC41IC0geDAqeDAgLSB5MCp5MDtcblx0aWYgKHQwID49IDApIHtcblx0XHR0MCAqPSB0MDtcblx0XHRnaSA9IGluZGV4ZXNbaWkrcGVybXNbampdXTtcblx0XHR2YXIgZ3JhZCA9IHRoaXMuX2dyYWRpZW50c1tnaV07XG5cdFx0bjAgPSB0MCAqIHQwICogKGdyYWRbMF0gKiB4MCArIGdyYWRbMV0gKiB5MCk7XG5cdH1cblx0XG5cdHZhciB0MSA9IDAuNSAtIHgxKngxIC0geTEqeTE7XG5cdGlmICh0MSA+PSAwKSB7XG5cdFx0dDEgKj0gdDE7XG5cdFx0Z2kgPSBpbmRleGVzW2lpK2kxK3Blcm1zW2pqK2oxXV07XG5cdFx0dmFyIGdyYWQgPSB0aGlzLl9ncmFkaWVudHNbZ2ldO1xuXHRcdG4xID0gdDEgKiB0MSAqIChncmFkWzBdICogeDEgKyBncmFkWzFdICogeTEpO1xuXHR9XG5cdFxuXHR2YXIgdDIgPSAwLjUgLSB4Mip4MiAtIHkyKnkyO1xuXHRpZiAodDIgPj0gMCkge1xuXHRcdHQyICo9IHQyO1xuXHRcdGdpID0gaW5kZXhlc1tpaSsxK3Blcm1zW2pqKzFdXTtcblx0XHR2YXIgZ3JhZCA9IHRoaXMuX2dyYWRpZW50c1tnaV07XG5cdFx0bjIgPSB0MiAqIHQyICogKGdyYWRbMF0gKiB4MiArIGdyYWRbMV0gKiB5Mik7XG5cdH1cblxuXHQvLyBBZGQgY29udHJpYnV0aW9ucyBmcm9tIGVhY2ggY29ybmVyIHRvIGdldCB0aGUgZmluYWwgbm9pc2UgdmFsdWUuXG5cdC8vIFRoZSByZXN1bHQgaXMgc2NhbGVkIHRvIHJldHVybiB2YWx1ZXMgaW4gdGhlIGludGVydmFsIFstMSwxXS5cblx0cmV0dXJuIDcwICogKG4wICsgbjEgKyBuMik7XG59XG4vKipcbiAqIEBjbGFzcyBBYnN0cmFjdCBGT1YgYWxnb3JpdGhtXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBsaWdodFBhc3Nlc0NhbGxiYWNrIERvZXMgdGhlIGxpZ2h0IHBhc3MgdGhyb3VnaCB4LHk/XG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXG4gKiBAcGFyYW0ge2ludH0gW29wdGlvbnMudG9wb2xvZ3k9OF0gNC82LzhcbiAqL1xuUk9ULkZPViA9IGZ1bmN0aW9uKGxpZ2h0UGFzc2VzQ2FsbGJhY2ssIG9wdGlvbnMpIHtcblx0dGhpcy5fbGlnaHRQYXNzZXMgPSBsaWdodFBhc3Nlc0NhbGxiYWNrO1xuXHR0aGlzLl9vcHRpb25zID0ge1xuXHRcdHRvcG9sb2d5OiA4XG5cdH1cblx0Zm9yICh2YXIgcCBpbiBvcHRpb25zKSB7IHRoaXMuX29wdGlvbnNbcF0gPSBvcHRpb25zW3BdOyB9XG59O1xuXG4vKipcbiAqIENvbXB1dGUgdmlzaWJpbGl0eSBmb3IgYSAzNjAtZGVncmVlIGNpcmNsZVxuICogQHBhcmFtIHtpbnR9IHhcbiAqIEBwYXJhbSB7aW50fSB5XG4gKiBAcGFyYW0ge2ludH0gUiBNYXhpbXVtIHZpc2liaWxpdHkgcmFkaXVzXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICovXG5ST1QuRk9WLnByb3RvdHlwZS5jb21wdXRlID0gZnVuY3Rpb24oeCwgeSwgUiwgY2FsbGJhY2spIHt9XG5cbi8qKlxuICogUmV0dXJuIGFsbCBuZWlnaGJvcnMgaW4gYSBjb25jZW50cmljIHJpbmdcbiAqIEBwYXJhbSB7aW50fSBjeCBjZW50ZXIteFxuICogQHBhcmFtIHtpbnR9IGN5IGNlbnRlci15XG4gKiBAcGFyYW0ge2ludH0gciByYW5nZVxuICovXG5ST1QuRk9WLnByb3RvdHlwZS5fZ2V0Q2lyY2xlID0gZnVuY3Rpb24oY3gsIGN5LCByKSB7XG5cdHZhciByZXN1bHQgPSBbXTtcblx0dmFyIGRpcnMsIGNvdW50RmFjdG9yLCBzdGFydE9mZnNldDtcblxuXHRzd2l0Y2ggKHRoaXMuX29wdGlvbnMudG9wb2xvZ3kpIHtcblx0XHRjYXNlIDQ6XG5cdFx0XHRjb3VudEZhY3RvciA9IDE7XG5cdFx0XHRzdGFydE9mZnNldCA9IFswLCAxXTtcblx0XHRcdGRpcnMgPSBbXG5cdFx0XHRcdFJPVC5ESVJTWzhdWzddLFxuXHRcdFx0XHRST1QuRElSU1s4XVsxXSxcblx0XHRcdFx0Uk9ULkRJUlNbOF1bM10sXG5cdFx0XHRcdFJPVC5ESVJTWzhdWzVdXG5cdFx0XHRdXG5cdFx0YnJlYWs7XG5cblx0XHRjYXNlIDY6XG5cdFx0XHRkaXJzID0gUk9ULkRJUlNbNl07XG5cdFx0XHRjb3VudEZhY3RvciA9IDE7XG5cdFx0XHRzdGFydE9mZnNldCA9IFstMSwgMV07XG5cdFx0YnJlYWs7XG5cblx0XHRjYXNlIDg6XG5cdFx0XHRkaXJzID0gUk9ULkRJUlNbNF07XG5cdFx0XHRjb3VudEZhY3RvciA9IDI7XG5cdFx0XHRzdGFydE9mZnNldCA9IFstMSwgMV07XG5cdFx0YnJlYWs7XG5cdH1cblxuXHQvKiBzdGFydGluZyBuZWlnaGJvciAqL1xuXHR2YXIgeCA9IGN4ICsgc3RhcnRPZmZzZXRbMF0qcjtcblx0dmFyIHkgPSBjeSArIHN0YXJ0T2Zmc2V0WzFdKnI7XG5cblx0LyogY2lyY2xlICovXG5cdGZvciAodmFyIGk9MDtpPGRpcnMubGVuZ3RoO2krKykge1xuXHRcdGZvciAodmFyIGo9MDtqPHIqY291bnRGYWN0b3I7aisrKSB7XG5cdFx0XHRyZXN1bHQucHVzaChbeCwgeV0pO1xuXHRcdFx0eCArPSBkaXJzW2ldWzBdO1xuXHRcdFx0eSArPSBkaXJzW2ldWzFdO1xuXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn1cbi8qKlxuICogQGNsYXNzIERpc2NyZXRlIHNoYWRvd2Nhc3RpbmcgYWxnb3JpdGhtLiBPYnNvbGV0ZWQgYnkgUHJlY2lzZSBzaGFkb3djYXN0aW5nLlxuICogQGF1Z21lbnRzIFJPVC5GT1ZcbiAqL1xuUk9ULkZPVi5EaXNjcmV0ZVNoYWRvd2Nhc3RpbmcgPSBmdW5jdGlvbihsaWdodFBhc3Nlc0NhbGxiYWNrLCBvcHRpb25zKSB7XG5cdFJPVC5GT1YuY2FsbCh0aGlzLCBsaWdodFBhc3Nlc0NhbGxiYWNrLCBvcHRpb25zKTtcbn1cblJPVC5GT1YuRGlzY3JldGVTaGFkb3djYXN0aW5nLmV4dGVuZChST1QuRk9WKTtcblxuLyoqXG4gKiBAc2VlIFJPVC5GT1YjY29tcHV0ZVxuICovXG5ST1QuRk9WLkRpc2NyZXRlU2hhZG93Y2FzdGluZy5wcm90b3R5cGUuY29tcHV0ZSA9IGZ1bmN0aW9uKHgsIHksIFIsIGNhbGxiYWNrKSB7XG5cdHZhciBjZW50ZXIgPSB0aGlzLl9jb29yZHM7XG5cdHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cblx0LyogdGhpcyBwbGFjZSBpcyBhbHdheXMgdmlzaWJsZSAqL1xuXHRjYWxsYmFjayh4LCB5LCAwKTtcblxuXHQvKiBzdGFuZGluZyBpbiBhIGRhcmsgcGxhY2UuIEZJWE1FIGlzIHRoaXMgYSBnb29kIGlkZWE/ICAqL1xuXHRpZiAoIXRoaXMuX2xpZ2h0UGFzc2VzKHgsIHkpKSB7IHJldHVybjsgfVxuXHRcblx0Lyogc3RhcnQgYW5kIGVuZCBhbmdsZXMgKi9cblx0dmFyIERBVEEgPSBbXTtcblx0XG5cdHZhciBBLCBCLCBjeCwgY3ksIGJsb2NrcztcblxuXHQvKiBhbmFseXplIHN1cnJvdW5kaW5nIGNlbGxzIGluIGNvbmNlbnRyaWMgcmluZ3MsIHN0YXJ0aW5nIGZyb20gdGhlIGNlbnRlciAqL1xuXHRmb3IgKHZhciByPTE7IHI8PVI7IHIrKykge1xuXHRcdHZhciBuZWlnaGJvcnMgPSB0aGlzLl9nZXRDaXJjbGUoeCwgeSwgcik7XG5cdFx0dmFyIGFuZ2xlID0gMzYwIC8gbmVpZ2hib3JzLmxlbmd0aDtcblxuXHRcdGZvciAodmFyIGk9MDtpPG5laWdoYm9ycy5sZW5ndGg7aSsrKSB7XG5cdFx0XHRjeCA9IG5laWdoYm9yc1tpXVswXTtcblx0XHRcdGN5ID0gbmVpZ2hib3JzW2ldWzFdO1xuXHRcdFx0QSA9IGFuZ2xlICogKGkgLSAwLjUpO1xuXHRcdFx0QiA9IEEgKyBhbmdsZTtcblx0XHRcdFxuXHRcdFx0YmxvY2tzID0gIXRoaXMuX2xpZ2h0UGFzc2VzKGN4LCBjeSk7XG5cdFx0XHRpZiAodGhpcy5fdmlzaWJsZUNvb3JkcyhNYXRoLmZsb29yKEEpLCBNYXRoLmNlaWwoQiksIGJsb2NrcywgREFUQSkpIHsgY2FsbGJhY2soY3gsIGN5LCByLCAxKTsgfVxuXHRcdFx0XG5cdFx0XHRpZiAoREFUQS5sZW5ndGggPT0gMiAmJiBEQVRBWzBdID09IDAgJiYgREFUQVsxXSA9PSAzNjApIHsgcmV0dXJuOyB9IC8qIGN1dG9mZj8gKi9cblxuXHRcdH0gLyogZm9yIGFsbCBjZWxscyBpbiB0aGlzIHJpbmcgKi9cblx0fSAvKiBmb3IgYWxsIHJpbmdzICovXG59XG5cbi8qKlxuICogQHBhcmFtIHtpbnR9IEEgc3RhcnQgYW5nbGVcbiAqIEBwYXJhbSB7aW50fSBCIGVuZCBhbmdsZVxuICogQHBhcmFtIHtib29sfSBibG9ja3MgRG9lcyBjdXJyZW50IGNlbGwgYmxvY2sgdmlzaWJpbGl0eT9cbiAqIEBwYXJhbSB7aW50W11bXX0gREFUQSBzaGFkb3dlZCBhbmdsZSBwYWlyc1xuICovXG5ST1QuRk9WLkRpc2NyZXRlU2hhZG93Y2FzdGluZy5wcm90b3R5cGUuX3Zpc2libGVDb29yZHMgPSBmdW5jdGlvbihBLCBCLCBibG9ja3MsIERBVEEpIHtcblx0aWYgKEEgPCAwKSB7IFxuXHRcdHZhciB2MSA9IGFyZ3VtZW50cy5jYWxsZWUoMCwgQiwgYmxvY2tzLCBEQVRBKTtcblx0XHR2YXIgdjIgPSBhcmd1bWVudHMuY2FsbGVlKDM2MCtBLCAzNjAsIGJsb2NrcywgREFUQSk7XG5cdFx0cmV0dXJuIHYxIHx8IHYyO1xuXHR9XG5cdFxuXHR2YXIgaW5kZXggPSAwO1xuXHR3aGlsZSAoaW5kZXggPCBEQVRBLmxlbmd0aCAmJiBEQVRBW2luZGV4XSA8IEEpIHsgaW5kZXgrKzsgfVxuXHRcblx0aWYgKGluZGV4ID09IERBVEEubGVuZ3RoKSB7IC8qIGNvbXBsZXRlbHkgbmV3IHNoYWRvdyAqL1xuXHRcdGlmIChibG9ja3MpIHsgREFUQS5wdXNoKEEsIEIpOyB9IFxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdFxuXHR2YXIgY291bnQgPSAwO1xuXHRcblx0aWYgKGluZGV4ICUgMikgeyAvKiB0aGlzIHNoYWRvdyBzdGFydHMgaW4gYW4gZXhpc3Rpbmcgc2hhZG93LCBvciB3aXRoaW4gaXRzIGVuZGluZyBib3VuZGFyeSAqL1xuXHRcdHdoaWxlIChpbmRleCA8IERBVEEubGVuZ3RoICYmIERBVEFbaW5kZXhdIDwgQikge1xuXHRcdFx0aW5kZXgrKztcblx0XHRcdGNvdW50Kys7XG5cdFx0fVxuXHRcdFxuXHRcdGlmIChjb3VudCA9PSAwKSB7IHJldHVybiBmYWxzZTsgfVxuXHRcdFxuXHRcdGlmIChibG9ja3MpIHsgXG5cdFx0XHRpZiAoY291bnQgJSAyKSB7XG5cdFx0XHRcdERBVEEuc3BsaWNlKGluZGV4LWNvdW50LCBjb3VudCwgQik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHREQVRBLnNwbGljZShpbmRleC1jb3VudCwgY291bnQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gdHJ1ZTtcblxuXHR9IGVsc2UgeyAvKiB0aGlzIHNoYWRvdyBzdGFydHMgb3V0c2lkZSBhbiBleGlzdGluZyBzaGFkb3csIG9yIHdpdGhpbiBhIHN0YXJ0aW5nIGJvdW5kYXJ5ICovXG5cdFx0d2hpbGUgKGluZGV4IDwgREFUQS5sZW5ndGggJiYgREFUQVtpbmRleF0gPCBCKSB7XG5cdFx0XHRpbmRleCsrO1xuXHRcdFx0Y291bnQrKztcblx0XHR9XG5cdFx0XG5cdFx0LyogdmlzaWJsZSB3aGVuIG91dHNpZGUgYW4gZXhpc3Rpbmcgc2hhZG93LCBvciB3aGVuIG92ZXJsYXBwaW5nICovXG5cdFx0aWYgKEEgPT0gREFUQVtpbmRleC1jb3VudF0gJiYgY291bnQgPT0gMSkgeyByZXR1cm4gZmFsc2U7IH1cblx0XHRcblx0XHRpZiAoYmxvY2tzKSB7IFxuXHRcdFx0aWYgKGNvdW50ICUgMikge1xuXHRcdFx0XHREQVRBLnNwbGljZShpbmRleC1jb3VudCwgY291bnQsIEEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0REFUQS5zcGxpY2UoaW5kZXgtY291bnQsIGNvdW50LCBBLCBCKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XHRcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxufVxuLyoqXG4gKiBAY2xhc3MgUHJlY2lzZSBzaGFkb3djYXN0aW5nIGFsZ29yaXRobVxuICogQGF1Z21lbnRzIFJPVC5GT1ZcbiAqL1xuUk9ULkZPVi5QcmVjaXNlU2hhZG93Y2FzdGluZyA9IGZ1bmN0aW9uKGxpZ2h0UGFzc2VzQ2FsbGJhY2ssIG9wdGlvbnMpIHtcblx0Uk9ULkZPVi5jYWxsKHRoaXMsIGxpZ2h0UGFzc2VzQ2FsbGJhY2ssIG9wdGlvbnMpO1xufVxuUk9ULkZPVi5QcmVjaXNlU2hhZG93Y2FzdGluZy5leHRlbmQoUk9ULkZPVik7XG5cbi8qKlxuICogQHNlZSBST1QuRk9WI2NvbXB1dGVcbiAqL1xuUk9ULkZPVi5QcmVjaXNlU2hhZG93Y2FzdGluZy5wcm90b3R5cGUuY29tcHV0ZSA9IGZ1bmN0aW9uKHgsIHksIFIsIGNhbGxiYWNrKSB7XG5cdC8qIHRoaXMgcGxhY2UgaXMgYWx3YXlzIHZpc2libGUgKi9cblx0Y2FsbGJhY2soeCwgeSwgMCwgMSk7XG5cblx0Lyogc3RhbmRpbmcgaW4gYSBkYXJrIHBsYWNlLiBGSVhNRSBpcyB0aGlzIGEgZ29vZCBpZGVhPyAgKi9cblx0aWYgKCF0aGlzLl9saWdodFBhc3Nlcyh4LCB5KSkgeyByZXR1cm47IH1cblx0XG5cdC8qIGxpc3Qgb2YgYWxsIHNoYWRvd3MgKi9cblx0dmFyIFNIQURPV1MgPSBbXTtcblx0XG5cdHZhciBjeCwgY3ksIGJsb2NrcywgQTEsIEEyLCB2aXNpYmlsaXR5O1xuXG5cdC8qIGFuYWx5emUgc3Vycm91bmRpbmcgY2VsbHMgaW4gY29uY2VudHJpYyByaW5ncywgc3RhcnRpbmcgZnJvbSB0aGUgY2VudGVyICovXG5cdGZvciAodmFyIHI9MTsgcjw9UjsgcisrKSB7XG5cdFx0dmFyIG5laWdoYm9ycyA9IHRoaXMuX2dldENpcmNsZSh4LCB5LCByKTtcblx0XHR2YXIgbmVpZ2hib3JDb3VudCA9IG5laWdoYm9ycy5sZW5ndGg7XG5cblx0XHRmb3IgKHZhciBpPTA7aTxuZWlnaGJvckNvdW50O2krKykge1xuXHRcdFx0Y3ggPSBuZWlnaGJvcnNbaV1bMF07XG5cdFx0XHRjeSA9IG5laWdoYm9yc1tpXVsxXTtcblx0XHRcdC8qIHNoaWZ0IGhhbGYtYW4tYW5nbGUgYmFja3dhcmRzIHRvIG1haW50YWluIGNvbnNpc3RlbmN5IG9mIDAtdGggY2VsbHMgKi9cblx0XHRcdEExID0gW2kgPyAyKmktMSA6IDIqbmVpZ2hib3JDb3VudC0xLCAyKm5laWdoYm9yQ291bnRdO1xuXHRcdFx0QTIgPSBbMippKzEsIDIqbmVpZ2hib3JDb3VudF07IFxuXHRcdFx0XG5cdFx0XHRibG9ja3MgPSAhdGhpcy5fbGlnaHRQYXNzZXMoY3gsIGN5KTtcblx0XHRcdHZpc2liaWxpdHkgPSB0aGlzLl9jaGVja1Zpc2liaWxpdHkoQTEsIEEyLCBibG9ja3MsIFNIQURPV1MpO1xuXHRcdFx0aWYgKHZpc2liaWxpdHkpIHsgY2FsbGJhY2soY3gsIGN5LCByLCB2aXNpYmlsaXR5KTsgfVxuXG5cdFx0XHRpZiAoU0hBRE9XUy5sZW5ndGggPT0gMiAmJiBTSEFET1dTWzBdWzBdID09IDAgJiYgU0hBRE9XU1sxXVswXSA9PSBTSEFET1dTWzFdWzFdKSB7IHJldHVybjsgfSAvKiBjdXRvZmY/ICovXG5cblx0XHR9IC8qIGZvciBhbGwgY2VsbHMgaW4gdGhpcyByaW5nICovXG5cdH0gLyogZm9yIGFsbCByaW5ncyAqL1xufVxuXG4vKipcbiAqIEBwYXJhbSB7aW50WzJdfSBBMSBhcmMgc3RhcnRcbiAqIEBwYXJhbSB7aW50WzJdfSBBMiBhcmMgZW5kXG4gKiBAcGFyYW0ge2Jvb2x9IGJsb2NrcyBEb2VzIGN1cnJlbnQgYXJjIGJsb2NrIHZpc2liaWxpdHk/XG4gKiBAcGFyYW0ge2ludFtdW119IFNIQURPV1MgbGlzdCBvZiBhY3RpdmUgc2hhZG93c1xuICovXG5ST1QuRk9WLlByZWNpc2VTaGFkb3djYXN0aW5nLnByb3RvdHlwZS5fY2hlY2tWaXNpYmlsaXR5ID0gZnVuY3Rpb24oQTEsIEEyLCBibG9ja3MsIFNIQURPV1MpIHtcblx0aWYgKEExWzBdID4gQTJbMF0pIHsgLyogc3BsaXQgaW50byB0d28gc3ViLWFyY3MgKi9cblx0XHR2YXIgdjEgPSB0aGlzLl9jaGVja1Zpc2liaWxpdHkoQTEsIFtBMVsxXSwgQTFbMV1dLCBibG9ja3MsIFNIQURPV1MpO1xuXHRcdHZhciB2MiA9IHRoaXMuX2NoZWNrVmlzaWJpbGl0eShbMCwgMV0sIEEyLCBibG9ja3MsIFNIQURPV1MpO1xuXHRcdHJldHVybiAodjErdjIpLzI7XG5cdH1cblxuXHQvKiBpbmRleDE6IGZpcnN0IHNoYWRvdyA+PSBBMSAqL1xuXHR2YXIgaW5kZXgxID0gMCwgZWRnZTEgPSBmYWxzZTtcblx0d2hpbGUgKGluZGV4MSA8IFNIQURPV1MubGVuZ3RoKSB7XG5cdFx0dmFyIG9sZCA9IFNIQURPV1NbaW5kZXgxXTtcblx0XHR2YXIgZGlmZiA9IG9sZFswXSpBMVsxXSAtIEExWzBdKm9sZFsxXTtcblx0XHRpZiAoZGlmZiA+PSAwKSB7IC8qIG9sZCA+PSBBMSAqL1xuXHRcdFx0aWYgKGRpZmYgPT0gMCAmJiAhKGluZGV4MSAlIDIpKSB7IGVkZ2UxID0gdHJ1ZTsgfVxuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdGluZGV4MSsrO1xuXHR9XG5cblx0LyogaW5kZXgyOiBsYXN0IHNoYWRvdyA8PSBBMiAqL1xuXHR2YXIgaW5kZXgyID0gU0hBRE9XUy5sZW5ndGgsIGVkZ2UyID0gZmFsc2U7XG5cdHdoaWxlIChpbmRleDItLSkge1xuXHRcdHZhciBvbGQgPSBTSEFET1dTW2luZGV4Ml07XG5cdFx0dmFyIGRpZmYgPSBBMlswXSpvbGRbMV0gLSBvbGRbMF0qQTJbMV07XG5cdFx0aWYgKGRpZmYgPj0gMCkgeyAvKiBvbGQgPD0gQTIgKi9cblx0XHRcdGlmIChkaWZmID09IDAgJiYgKGluZGV4MiAlIDIpKSB7IGVkZ2UyID0gdHJ1ZTsgfVxuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0dmFyIHZpc2libGUgPSB0cnVlO1xuXHRpZiAoaW5kZXgxID09IGluZGV4MiAmJiAoZWRnZTEgfHwgZWRnZTIpKSB7ICAvKiBzdWJzZXQgb2YgZXhpc3Rpbmcgc2hhZG93LCBvbmUgb2YgdGhlIGVkZ2VzIG1hdGNoICovXG5cdFx0dmlzaWJsZSA9IGZhbHNlOyBcblx0fSBlbHNlIGlmIChlZGdlMSAmJiBlZGdlMiAmJiBpbmRleDErMT09aW5kZXgyICYmIChpbmRleDIgJSAyKSkgeyAvKiBjb21wbGV0ZWx5IGVxdWl2YWxlbnQgd2l0aCBleGlzdGluZyBzaGFkb3cgKi9cblx0XHR2aXNpYmxlID0gZmFsc2U7XG5cdH0gZWxzZSBpZiAoaW5kZXgxID4gaW5kZXgyICYmIChpbmRleDEgJSAyKSkgeyAvKiBzdWJzZXQgb2YgZXhpc3Rpbmcgc2hhZG93LCBub3QgdG91Y2hpbmcgKi9cblx0XHR2aXNpYmxlID0gZmFsc2U7XG5cdH1cblx0XG5cdGlmICghdmlzaWJsZSkgeyByZXR1cm4gMDsgfSAvKiBmYXN0IGNhc2U6IG5vdCB2aXNpYmxlICovXG5cdFxuXHR2YXIgdmlzaWJsZUxlbmd0aCwgUDtcblxuXHQvKiBjb21wdXRlIHRoZSBsZW5ndGggb2YgdmlzaWJsZSBhcmMsIGFkanVzdCBsaXN0IG9mIHNoYWRvd3MgKGlmIGJsb2NraW5nKSAqL1xuXHR2YXIgcmVtb3ZlID0gaW5kZXgyLWluZGV4MSsxO1xuXHRpZiAocmVtb3ZlICUgMikge1xuXHRcdGlmIChpbmRleDEgJSAyKSB7IC8qIGZpcnN0IGVkZ2Ugd2l0aGluIGV4aXN0aW5nIHNoYWRvdywgc2Vjb25kIG91dHNpZGUgKi9cblx0XHRcdHZhciBQID0gU0hBRE9XU1tpbmRleDFdO1xuXHRcdFx0dmlzaWJsZUxlbmd0aCA9IChBMlswXSpQWzFdIC0gUFswXSpBMlsxXSkgLyAoUFsxXSAqIEEyWzFdKTtcblx0XHRcdGlmIChibG9ja3MpIHsgU0hBRE9XUy5zcGxpY2UoaW5kZXgxLCByZW1vdmUsIEEyKTsgfVxuXHRcdH0gZWxzZSB7IC8qIHNlY29uZCBlZGdlIHdpdGhpbiBleGlzdGluZyBzaGFkb3csIGZpcnN0IG91dHNpZGUgKi9cblx0XHRcdHZhciBQID0gU0hBRE9XU1tpbmRleDJdO1xuXHRcdFx0dmlzaWJsZUxlbmd0aCA9IChQWzBdKkExWzFdIC0gQTFbMF0qUFsxXSkgLyAoQTFbMV0gKiBQWzFdKTtcblx0XHRcdGlmIChibG9ja3MpIHsgU0hBRE9XUy5zcGxpY2UoaW5kZXgxLCByZW1vdmUsIEExKTsgfVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRpZiAoaW5kZXgxICUgMikgeyAvKiBib3RoIGVkZ2VzIHdpdGhpbiBleGlzdGluZyBzaGFkb3dzICovXG5cdFx0XHR2YXIgUDEgPSBTSEFET1dTW2luZGV4MV07XG5cdFx0XHR2YXIgUDIgPSBTSEFET1dTW2luZGV4Ml07XG5cdFx0XHR2aXNpYmxlTGVuZ3RoID0gKFAyWzBdKlAxWzFdIC0gUDFbMF0qUDJbMV0pIC8gKFAxWzFdICogUDJbMV0pO1xuXHRcdFx0aWYgKGJsb2NrcykgeyBTSEFET1dTLnNwbGljZShpbmRleDEsIHJlbW92ZSk7IH1cblx0XHR9IGVsc2UgeyAvKiBib3RoIGVkZ2VzIG91dHNpZGUgZXhpc3Rpbmcgc2hhZG93cyAqL1xuXHRcdFx0aWYgKGJsb2NrcykgeyBTSEFET1dTLnNwbGljZShpbmRleDEsIHJlbW92ZSwgQTEsIEEyKTsgfVxuXHRcdFx0cmV0dXJuIDE7IC8qIHdob2xlIGFyYyB2aXNpYmxlISAqL1xuXHRcdH1cblx0fVxuXG5cdHZhciBhcmNMZW5ndGggPSAoQTJbMF0qQTFbMV0gLSBBMVswXSpBMlsxXSkgLyAoQTFbMV0gKiBBMlsxXSk7XG5cblx0cmV0dXJuIHZpc2libGVMZW5ndGgvYXJjTGVuZ3RoO1xufVxuLyoqXG4gKiBAY2xhc3MgUmVjdXJzaXZlIHNoYWRvd2Nhc3RpbmcgYWxnb3JpdGhtXG4gKiBDdXJyZW50bHkgb25seSBzdXBwb3J0cyA0LzggdG9wb2xvZ2llcywgbm90IGhleGFnb25hbC5cbiAqIEJhc2VkIG9uIFBldGVyIEhhcmtpbnMnIGltcGxlbWVudGF0aW9uIG9mIEJqw7ZybiBCZXJnc3Ryw7ZtJ3MgYWxnb3JpdGhtIGRlc2NyaWJlZCBoZXJlOiBodHRwOi8vd3d3LnJvZ3VlYmFzaW4uY29tL2luZGV4LnBocD90aXRsZT1GT1ZfdXNpbmdfcmVjdXJzaXZlX3NoYWRvd2Nhc3RpbmdcbiAqIEBhdWdtZW50cyBST1QuRk9WXG4gKi9cblJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZyA9IGZ1bmN0aW9uKGxpZ2h0UGFzc2VzQ2FsbGJhY2ssIG9wdGlvbnMpIHtcblx0Uk9ULkZPVi5jYWxsKHRoaXMsIGxpZ2h0UGFzc2VzQ2FsbGJhY2ssIG9wdGlvbnMpO1xufVxuUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLmV4dGVuZChST1QuRk9WKTtcblxuLyoqIE9jdGFudHMgdXNlZCBmb3IgdHJhbnNsYXRpbmcgcmVjdXJzaXZlIHNoYWRvd2Nhc3Rpbmcgb2Zmc2V0cyAqL1xuUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLk9DVEFOVFMgPSBbXG5cdFstMSwgIDAsICAwLCAgMV0sXG5cdFsgMCwgLTEsICAxLCAgMF0sXG5cdFsgMCwgLTEsIC0xLCAgMF0sXG5cdFstMSwgIDAsICAwLCAtMV0sXG5cdFsgMSwgIDAsICAwLCAtMV0sXG5cdFsgMCwgIDEsIC0xLCAgMF0sXG5cdFsgMCwgIDEsICAxLCAgMF0sXG5cdFsgMSwgIDAsICAwLCAgMV1cbl07XG5cbi8qKlxuICogQ29tcHV0ZSB2aXNpYmlsaXR5IGZvciBhIDM2MC1kZWdyZWUgY2lyY2xlXG4gKiBAcGFyYW0ge2ludH0geFxuICogQHBhcmFtIHtpbnR9IHlcbiAqIEBwYXJhbSB7aW50fSBSIE1heGltdW0gdmlzaWJpbGl0eSByYWRpdXNcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gKi9cblJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZy5wcm90b3R5cGUuY29tcHV0ZSA9IGZ1bmN0aW9uKHgsIHksIFIsIGNhbGxiYWNrKSB7XG5cdC8vWW91IGNhbiBhbHdheXMgc2VlIHlvdXIgb3duIHRpbGVcblx0Y2FsbGJhY2soeCwgeSwgMCwgdHJ1ZSk7XG5cdGZvcih2YXIgaSA9IDA7IGkgPCBST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcuT0NUQU5UUy5sZW5ndGg7IGkrKykge1xuXHRcdHRoaXMuX3JlbmRlck9jdGFudCh4LCB5LCBST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcuT0NUQU5UU1tpXSwgUiwgY2FsbGJhY2spO1xuXHR9XG59XG5cbi8qKlxuICogQ29tcHV0ZSB2aXNpYmlsaXR5IGZvciBhIDE4MC1kZWdyZWUgYXJjXG4gKiBAcGFyYW0ge2ludH0geFxuICogQHBhcmFtIHtpbnR9IHlcbiAqIEBwYXJhbSB7aW50fSBSIE1heGltdW0gdmlzaWJpbGl0eSByYWRpdXNcbiAqIEBwYXJhbSB7aW50fSBkaXIgRGlyZWN0aW9uIHRvIGxvb2sgaW4gKGV4cHJlc3NlZCBpbiBhIFJPVC5ESVIgdmFsdWUpO1xuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAqL1xuUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLnByb3RvdHlwZS5jb21wdXRlMTgwID0gZnVuY3Rpb24oeCwgeSwgUiwgZGlyLCBjYWxsYmFjaykge1xuXHQvL1lvdSBjYW4gYWx3YXlzIHNlZSB5b3VyIG93biB0aWxlXG5cdGNhbGxiYWNrKHgsIHksIDAsIHRydWUpO1xuXHR2YXIgcHJldmlvdXNPY3RhbnQgPSAoZGlyIC0gMSArIDgpICUgODsgLy9OZWVkIHRvIHJldHJpZXZlIHRoZSBwcmV2aW91cyBvY3RhbnQgdG8gcmVuZGVyIGEgZnVsbCAxODAgZGVncmVlc1xuXHR2YXIgbmV4dFByZXZpb3VzT2N0YW50ID0gKGRpciAtIDIgKyA4KSAlIDg7IC8vTmVlZCB0byByZXRyaWV2ZSB0aGUgcHJldmlvdXMgdHdvIG9jdGFudHMgdG8gcmVuZGVyIGEgZnVsbCAxODAgZGVncmVlc1xuXHR2YXIgbmV4dE9jdGFudCA9IChkaXIrIDEgKyA4KSAlIDg7IC8vTmVlZCB0byBncmFiIHRvIG5leHQgb2N0YW50IHRvIHJlbmRlciBhIGZ1bGwgMTgwIGRlZ3JlZXNcblx0dGhpcy5fcmVuZGVyT2N0YW50KHgsIHksIFJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZy5PQ1RBTlRTW25leHRQcmV2aW91c09jdGFudF0sIFIsIGNhbGxiYWNrKTtcblx0dGhpcy5fcmVuZGVyT2N0YW50KHgsIHksIFJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZy5PQ1RBTlRTW3ByZXZpb3VzT2N0YW50XSwgUiwgY2FsbGJhY2spO1xuXHR0aGlzLl9yZW5kZXJPY3RhbnQoeCwgeSwgUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLk9DVEFOVFNbZGlyXSwgUiwgY2FsbGJhY2spO1xuXHR0aGlzLl9yZW5kZXJPY3RhbnQoeCwgeSwgUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLk9DVEFOVFNbbmV4dE9jdGFudF0sIFIsIGNhbGxiYWNrKTtcbn1cblxuLyoqXG4gKiBDb21wdXRlIHZpc2liaWxpdHkgZm9yIGEgOTAtZGVncmVlIGFyY1xuICogQHBhcmFtIHtpbnR9IHhcbiAqIEBwYXJhbSB7aW50fSB5XG4gKiBAcGFyYW0ge2ludH0gUiBNYXhpbXVtIHZpc2liaWxpdHkgcmFkaXVzXG4gKiBAcGFyYW0ge2ludH0gZGlyIERpcmVjdGlvbiB0byBsb29rIGluIChleHByZXNzZWQgaW4gYSBST1QuRElSIHZhbHVlKTtcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gKi9cblJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZy5wcm90b3R5cGUuY29tcHV0ZTkwID0gZnVuY3Rpb24oeCwgeSwgUiwgZGlyLCBjYWxsYmFjaykge1xuXHQvL1lvdSBjYW4gYWx3YXlzIHNlZSB5b3VyIG93biB0aWxlXG5cdGNhbGxiYWNrKHgsIHksIDAsIHRydWUpO1xuXHR2YXIgcHJldmlvdXNPY3RhbnQgPSAoZGlyIC0gMSArIDgpICUgODsgLy9OZWVkIHRvIHJldHJpZXZlIHRoZSBwcmV2aW91cyBvY3RhbnQgdG8gcmVuZGVyIGEgZnVsbCA5MCBkZWdyZWVzXG5cdHRoaXMuX3JlbmRlck9jdGFudCh4LCB5LCBST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcuT0NUQU5UU1tkaXJdLCBSLCBjYWxsYmFjayk7XG5cdHRoaXMuX3JlbmRlck9jdGFudCh4LCB5LCBST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcuT0NUQU5UU1twcmV2aW91c09jdGFudF0sIFIsIGNhbGxiYWNrKTtcbn1cblxuLyoqXG4gKiBSZW5kZXIgb25lIG9jdGFudCAoNDUtZGVncmVlIGFyYykgb2YgdGhlIHZpZXdzaGVkXG4gKiBAcGFyYW0ge2ludH0geFxuICogQHBhcmFtIHtpbnR9IHlcbiAqIEBwYXJhbSB7aW50fSBvY3RhbnQgT2N0YW50IHRvIGJlIHJlbmRlcmVkXG4gKiBAcGFyYW0ge2ludH0gUiBNYXhpbXVtIHZpc2liaWxpdHkgcmFkaXVzXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICovXG5ST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcucHJvdG90eXBlLl9yZW5kZXJPY3RhbnQgPSBmdW5jdGlvbih4LCB5LCBvY3RhbnQsIFIsIGNhbGxiYWNrKSB7XG5cdC8vUmFkaXVzIGluY3JlbWVudGVkIGJ5IDEgdG8gcHJvdmlkZSBzYW1lIGNvdmVyYWdlIGFyZWEgYXMgb3RoZXIgc2hhZG93Y2FzdGluZyByYWRpdXNlc1xuXHR0aGlzLl9jYXN0VmlzaWJpbGl0eSh4LCB5LCAxLCAxLjAsIDAuMCwgUiArIDEsIG9jdGFudFswXSwgb2N0YW50WzFdLCBvY3RhbnRbMl0sIG9jdGFudFszXSwgY2FsbGJhY2spO1xufVxuXG4vKipcbiAqIEFjdHVhbGx5IGNhbGN1bGF0ZXMgdGhlIHZpc2liaWxpdHlcbiAqIEBwYXJhbSB7aW50fSBzdGFydFggVGhlIHN0YXJ0aW5nIFggY29vcmRpbmF0ZVxuICogQHBhcmFtIHtpbnR9IHN0YXJ0WSBUaGUgc3RhcnRpbmcgWSBjb29yZGluYXRlXG4gKiBAcGFyYW0ge2ludH0gcm93IFRoZSByb3cgdG8gcmVuZGVyXG4gKiBAcGFyYW0ge2Zsb2F0fSB2aXNTbG9wZVN0YXJ0IFRoZSBzbG9wZSB0byBzdGFydCBhdFxuICogQHBhcmFtIHtmbG9hdH0gdmlzU2xvcGVFbmQgVGhlIHNsb3BlIHRvIGVuZCBhdFxuICogQHBhcmFtIHtpbnR9IHJhZGl1cyBUaGUgcmFkaXVzIHRvIHJlYWNoIG91dCB0b1xuICogQHBhcmFtIHtpbnR9IHh4IFxuICogQHBhcmFtIHtpbnR9IHh5IFxuICogQHBhcmFtIHtpbnR9IHl4IFxuICogQHBhcmFtIHtpbnR9IHl5IFxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIHVzZSB3aGVuIHdlIGhpdCBhIGJsb2NrIHRoYXQgaXMgdmlzaWJsZVxuICovXG5ST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcucHJvdG90eXBlLl9jYXN0VmlzaWJpbGl0eSA9IGZ1bmN0aW9uKHN0YXJ0WCwgc3RhcnRZLCByb3csIHZpc1Nsb3BlU3RhcnQsIHZpc1Nsb3BlRW5kLCByYWRpdXMsIHh4LCB4eSwgeXgsIHl5LCBjYWxsYmFjaykge1xuXHRpZih2aXNTbG9wZVN0YXJ0IDwgdmlzU2xvcGVFbmQpIHsgcmV0dXJuOyB9XG5cdGZvcih2YXIgaSA9IHJvdzsgaSA8PSByYWRpdXM7IGkrKykge1xuXHRcdHZhciBkeCA9IC1pIC0gMTtcblx0XHR2YXIgZHkgPSAtaTtcblx0XHR2YXIgYmxvY2tlZCA9IGZhbHNlO1xuXHRcdHZhciBuZXdTdGFydCA9IDA7XG5cblx0XHQvLydSb3cnIGNvdWxkIGJlIGNvbHVtbiwgbmFtZXMgaGVyZSBhc3N1bWUgb2N0YW50IDAgYW5kIHdvdWxkIGJlIGZsaXBwZWQgZm9yIGhhbGYgdGhlIG9jdGFudHNcblx0XHR3aGlsZShkeCA8PSAwKSB7XG5cdFx0XHRkeCArPSAxO1xuXG5cdFx0XHQvL1RyYW5zbGF0ZSBmcm9tIHJlbGF0aXZlIGNvb3JkaW5hdGVzIHRvIG1hcCBjb29yZGluYXRlc1xuXHRcdFx0dmFyIG1hcFggPSBzdGFydFggKyBkeCAqIHh4ICsgZHkgKiB4eTtcblx0XHRcdHZhciBtYXBZID0gc3RhcnRZICsgZHggKiB5eCArIGR5ICogeXk7XG5cblx0XHRcdC8vUmFuZ2Ugb2YgdGhlIHJvd1xuXHRcdFx0dmFyIHNsb3BlU3RhcnQgPSAoZHggLSAwLjUpIC8gKGR5ICsgMC41KTtcblx0XHRcdHZhciBzbG9wZUVuZCA9IChkeCArIDAuNSkgLyAoZHkgLSAwLjUpO1xuXHRcdFxuXHRcdFx0Ly9JZ25vcmUgaWYgbm90IHlldCBhdCBsZWZ0IGVkZ2Ugb2YgT2N0YW50XG5cdFx0XHRpZihzbG9wZUVuZCA+IHZpc1Nsb3BlU3RhcnQpIHsgY29udGludWU7IH1cblx0XHRcdFxuXHRcdFx0Ly9Eb25lIGlmIHBhc3QgcmlnaHQgZWRnZVxuXHRcdFx0aWYoc2xvcGVTdGFydCA8IHZpc1Nsb3BlRW5kKSB7IGJyZWFrOyB9XG5cdFx0XHRcdFxuXHRcdFx0Ly9JZiBpdCdzIGluIHJhbmdlLCBpdCdzIHZpc2libGVcblx0XHRcdGlmKChkeCAqIGR4ICsgZHkgKiBkeSkgPCAocmFkaXVzICogcmFkaXVzKSkge1xuXHRcdFx0XHRjYWxsYmFjayhtYXBYLCBtYXBZLCBpLCB0cnVlKTtcblx0XHRcdH1cblx0XG5cdFx0XHRpZighYmxvY2tlZCkge1xuXHRcdFx0XHQvL0lmIHRpbGUgaXMgYSBibG9ja2luZyB0aWxlLCBjYXN0IGFyb3VuZCBpdFxuXHRcdFx0XHRpZighdGhpcy5fbGlnaHRQYXNzZXMobWFwWCwgbWFwWSkgJiYgaSA8IHJhZGl1cykge1xuXHRcdFx0XHRcdGJsb2NrZWQgPSB0cnVlO1xuXHRcdFx0XHRcdHRoaXMuX2Nhc3RWaXNpYmlsaXR5KHN0YXJ0WCwgc3RhcnRZLCBpICsgMSwgdmlzU2xvcGVTdGFydCwgc2xvcGVTdGFydCwgcmFkaXVzLCB4eCwgeHksIHl4LCB5eSwgY2FsbGJhY2spO1xuXHRcdFx0XHRcdG5ld1N0YXJ0ID0gc2xvcGVFbmQ7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vS2VlcCBuYXJyb3dpbmcgaWYgc2Nhbm5pbmcgYWNyb3NzIGEgYmxvY2tcblx0XHRcdFx0aWYoIXRoaXMuX2xpZ2h0UGFzc2VzKG1hcFgsIG1hcFkpKSB7XG5cdFx0XHRcdFx0bmV3U3RhcnQgPSBzbG9wZUVuZDtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRcdC8vQmxvY2sgaGFzIGVuZGVkXG5cdFx0XHRcdGJsb2NrZWQgPSBmYWxzZTtcblx0XHRcdFx0dmlzU2xvcGVTdGFydCA9IG5ld1N0YXJ0O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihibG9ja2VkKSB7IGJyZWFrOyB9XG5cdH1cbn1cbi8qKlxuICogQG5hbWVzcGFjZSBDb2xvciBvcGVyYXRpb25zXG4gKi9cblJPVC5Db2xvciA9IHtcblx0ZnJvbVN0cmluZzogZnVuY3Rpb24oc3RyKSB7XG5cdFx0dmFyIGNhY2hlZCwgcjtcblx0XHRpZiAoc3RyIGluIHRoaXMuX2NhY2hlKSB7XG5cdFx0XHRjYWNoZWQgPSB0aGlzLl9jYWNoZVtzdHJdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoc3RyLmNoYXJBdCgwKSA9PSBcIiNcIikgeyAvKiBoZXggcmdiICovXG5cblx0XHRcdFx0dmFyIHZhbHVlcyA9IHN0ci5tYXRjaCgvWzAtOWEtZl0vZ2kpLm1hcChmdW5jdGlvbih4KSB7IHJldHVybiBwYXJzZUludCh4LCAxNik7IH0pO1xuXHRcdFx0XHRpZiAodmFsdWVzLmxlbmd0aCA9PSAzKSB7XG5cdFx0XHRcdFx0Y2FjaGVkID0gdmFsdWVzLm1hcChmdW5jdGlvbih4KSB7IHJldHVybiB4KjE3OyB9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmb3IgKHZhciBpPTA7aTwzO2krKykge1xuXHRcdFx0XHRcdFx0dmFsdWVzW2krMV0gKz0gMTYqdmFsdWVzW2ldO1xuXHRcdFx0XHRcdFx0dmFsdWVzLnNwbGljZShpLCAxKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2FjaGVkID0gdmFsdWVzO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSBpZiAociA9IHN0ci5tYXRjaCgvcmdiXFwoKFswLTksIF0rKVxcKS9pKSkgeyAvKiBkZWNpbWFsIHJnYiAqL1xuXHRcdFx0XHRjYWNoZWQgPSByWzFdLnNwbGl0KC9cXHMqLFxccyovKS5tYXAoZnVuY3Rpb24oeCkgeyByZXR1cm4gcGFyc2VJbnQoeCk7IH0pO1xuXHRcdFx0fSBlbHNlIHsgLyogaHRtbCBuYW1lICovXG5cdFx0XHRcdGNhY2hlZCA9IFswLCAwLCAwXTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5fY2FjaGVbc3RyXSA9IGNhY2hlZDtcblx0XHR9XG5cblx0XHRyZXR1cm4gY2FjaGVkLnNsaWNlKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEFkZCB0d28gb3IgbW9yZSBjb2xvcnNcblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3IxXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yMlxuXHQgKiBAcmV0dXJucyB7bnVtYmVyW119XG5cdCAqL1xuXHRhZGQ6IGZ1bmN0aW9uKGNvbG9yMSwgY29sb3IyKSB7XG5cdFx0dmFyIHJlc3VsdCA9IGNvbG9yMS5zbGljZSgpO1xuXHRcdGZvciAodmFyIGk9MDtpPDM7aSsrKSB7XG5cdFx0XHRmb3IgKHZhciBqPTE7ajxhcmd1bWVudHMubGVuZ3RoO2orKykge1xuXHRcdFx0XHRyZXN1bHRbaV0gKz0gYXJndW1lbnRzW2pdW2ldO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGQgdHdvIG9yIG1vcmUgY29sb3JzLCBNT0RJRklFUyBGSVJTVCBBUkdVTUVOVFxuXHQgKiBAcGFyYW0ge251bWJlcltdfSBjb2xvcjFcblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3IyXG5cdCAqIEByZXR1cm5zIHtudW1iZXJbXX1cblx0ICovXG5cdGFkZF86IGZ1bmN0aW9uKGNvbG9yMSwgY29sb3IyKSB7XG5cdFx0Zm9yICh2YXIgaT0wO2k8MztpKyspIHtcblx0XHRcdGZvciAodmFyIGo9MTtqPGFyZ3VtZW50cy5sZW5ndGg7aisrKSB7XG5cdFx0XHRcdGNvbG9yMVtpXSArPSBhcmd1bWVudHNbal1baV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBjb2xvcjE7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE11bHRpcGx5IChtaXgpIHR3byBvciBtb3JlIGNvbG9yc1xuXHQgKiBAcGFyYW0ge251bWJlcltdfSBjb2xvcjFcblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3IyXG5cdCAqIEByZXR1cm5zIHtudW1iZXJbXX1cblx0ICovXG5cdG11bHRpcGx5OiBmdW5jdGlvbihjb2xvcjEsIGNvbG9yMikge1xuXHRcdHZhciByZXN1bHQgPSBjb2xvcjEuc2xpY2UoKTtcblx0XHRmb3IgKHZhciBpPTA7aTwzO2krKykge1xuXHRcdFx0Zm9yICh2YXIgaj0xO2o8YXJndW1lbnRzLmxlbmd0aDtqKyspIHtcblx0XHRcdFx0cmVzdWx0W2ldICo9IGFyZ3VtZW50c1tqXVtpXSAvIDI1NTtcblx0XHRcdH1cblx0XHRcdHJlc3VsdFtpXSA9IE1hdGgucm91bmQocmVzdWx0W2ldKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblxuXHQvKipcblx0ICogTXVsdGlwbHkgKG1peCkgdHdvIG9yIG1vcmUgY29sb3JzLCBNT0RJRklFUyBGSVJTVCBBUkdVTUVOVFxuXHQgKiBAcGFyYW0ge251bWJlcltdfSBjb2xvcjFcblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3IyXG5cdCAqIEByZXR1cm5zIHtudW1iZXJbXX1cblx0ICovXG5cdG11bHRpcGx5XzogZnVuY3Rpb24oY29sb3IxLCBjb2xvcjIpIHtcblx0XHRmb3IgKHZhciBpPTA7aTwzO2krKykge1xuXHRcdFx0Zm9yICh2YXIgaj0xO2o8YXJndW1lbnRzLmxlbmd0aDtqKyspIHtcblx0XHRcdFx0Y29sb3IxW2ldICo9IGFyZ3VtZW50c1tqXVtpXSAvIDI1NTtcblx0XHRcdH1cblx0XHRcdGNvbG9yMVtpXSA9IE1hdGgucm91bmQoY29sb3IxW2ldKTtcblx0XHR9XG5cdFx0cmV0dXJuIGNvbG9yMTtcblx0fSxcblxuXHQvKipcblx0ICogSW50ZXJwb2xhdGUgKGJsZW5kKSB0d28gY29sb3JzIHdpdGggYSBnaXZlbiBmYWN0b3Jcblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3IxXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yMlxuXHQgKiBAcGFyYW0ge2Zsb2F0fSBbZmFjdG9yPTAuNV0gMC4uMVxuXHQgKiBAcmV0dXJucyB7bnVtYmVyW119XG5cdCAqL1xuXHRpbnRlcnBvbGF0ZTogZnVuY3Rpb24oY29sb3IxLCBjb2xvcjIsIGZhY3Rvcikge1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykgeyBmYWN0b3IgPSAwLjU7IH1cblx0XHR2YXIgcmVzdWx0ID0gY29sb3IxLnNsaWNlKCk7XG5cdFx0Zm9yICh2YXIgaT0wO2k8MztpKyspIHtcblx0XHRcdHJlc3VsdFtpXSA9IE1hdGgucm91bmQocmVzdWx0W2ldICsgZmFjdG9yKihjb2xvcjJbaV0tY29sb3IxW2ldKSk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEludGVycG9sYXRlIChibGVuZCkgdHdvIGNvbG9ycyB3aXRoIGEgZ2l2ZW4gZmFjdG9yIGluIEhTTCBtb2RlXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yMVxuXHQgKiBAcGFyYW0ge251bWJlcltdfSBjb2xvcjJcblx0ICogQHBhcmFtIHtmbG9hdH0gW2ZhY3Rvcj0wLjVdIDAuLjFcblx0ICogQHJldHVybnMge251bWJlcltdfVxuXHQgKi9cblx0aW50ZXJwb2xhdGVIU0w6IGZ1bmN0aW9uKGNvbG9yMSwgY29sb3IyLCBmYWN0b3IpIHtcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHsgZmFjdG9yID0gMC41OyB9XG5cdFx0dmFyIGhzbDEgPSB0aGlzLnJnYjJoc2woY29sb3IxKTtcblx0XHR2YXIgaHNsMiA9IHRoaXMucmdiMmhzbChjb2xvcjIpO1xuXHRcdGZvciAodmFyIGk9MDtpPDM7aSsrKSB7XG5cdFx0XHRoc2wxW2ldICs9IGZhY3RvciooaHNsMltpXS1oc2wxW2ldKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuaHNsMnJnYihoc2wxKTtcblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlIGEgbmV3IHJhbmRvbSBjb2xvciBiYXNlZCBvbiB0aGlzIG9uZVxuXHQgKiBAcGFyYW0ge251bWJlcltdfSBjb2xvclxuXHQgKiBAcGFyYW0ge251bWJlcltdfSBkaWZmIFNldCBvZiBzdGFuZGFyZCBkZXZpYXRpb25zXG5cdCAqIEByZXR1cm5zIHtudW1iZXJbXX1cblx0ICovXG5cdHJhbmRvbWl6ZTogZnVuY3Rpb24oY29sb3IsIGRpZmYpIHtcblx0XHRpZiAoIShkaWZmIGluc3RhbmNlb2YgQXJyYXkpKSB7IGRpZmYgPSBST1QuUk5HLmdldE5vcm1hbCgwLCBkaWZmKTsgfVxuXHRcdHZhciByZXN1bHQgPSBjb2xvci5zbGljZSgpO1xuXHRcdGZvciAodmFyIGk9MDtpPDM7aSsrKSB7XG5cdFx0XHRyZXN1bHRbaV0gKz0gKGRpZmYgaW5zdGFuY2VvZiBBcnJheSA/IE1hdGgucm91bmQoUk9ULlJORy5nZXROb3JtYWwoMCwgZGlmZltpXSkpIDogZGlmZik7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGFuIFJHQiBjb2xvciB2YWx1ZSB0byBIU0wuIEV4cGVjdHMgMC4uMjU1IGlucHV0cywgcHJvZHVjZXMgMC4uMSBvdXRwdXRzLlxuXHQgKiBAcGFyYW0ge251bWJlcltdfSBjb2xvclxuXHQgKiBAcmV0dXJucyB7bnVtYmVyW119XG5cdCAqL1xuXHRyZ2IyaHNsOiBmdW5jdGlvbihjb2xvcikge1xuXHRcdHZhciByID0gY29sb3JbMF0vMjU1O1xuXHRcdHZhciBnID0gY29sb3JbMV0vMjU1O1xuXHRcdHZhciBiID0gY29sb3JbMl0vMjU1O1xuXG5cdFx0dmFyIG1heCA9IE1hdGgubWF4KHIsIGcsIGIpLCBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKTtcblx0XHR2YXIgaCwgcywgbCA9IChtYXggKyBtaW4pIC8gMjtcblxuXHRcdGlmIChtYXggPT0gbWluKSB7XG5cdFx0XHRoID0gcyA9IDA7IC8vIGFjaHJvbWF0aWNcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIGQgPSBtYXggLSBtaW47XG5cdFx0XHRzID0gKGwgPiAwLjUgPyBkIC8gKDIgLSBtYXggLSBtaW4pIDogZCAvIChtYXggKyBtaW4pKTtcblx0XHRcdHN3aXRjaChtYXgpIHtcblx0XHRcdFx0Y2FzZSByOiBoID0gKGcgLSBiKSAvIGQgKyAoZyA8IGIgPyA2IDogMCk7IGJyZWFrO1xuXHRcdFx0XHRjYXNlIGc6IGggPSAoYiAtIHIpIC8gZCArIDI7IGJyZWFrO1xuXHRcdFx0XHRjYXNlIGI6IGggPSAociAtIGcpIC8gZCArIDQ7IGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0aCAvPSA2O1xuXHRcdH1cblxuXHRcdHJldHVybiBbaCwgcywgbF07XG5cdH0sXG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGFuIEhTTCBjb2xvciB2YWx1ZSB0byBSR0IuIEV4cGVjdHMgMC4uMSBpbnB1dHMsIHByb2R1Y2VzIDAuLjI1NSBvdXRwdXRzLlxuXHQgKiBAcGFyYW0ge251bWJlcltdfSBjb2xvclxuXHQgKiBAcmV0dXJucyB7bnVtYmVyW119XG5cdCAqL1xuXHRoc2wycmdiOiBmdW5jdGlvbihjb2xvcikge1xuXHRcdHZhciBsID0gY29sb3JbMl07XG5cblx0XHRpZiAoY29sb3JbMV0gPT0gMCkge1xuXHRcdFx0bCA9IE1hdGgucm91bmQobCoyNTUpO1xuXHRcdFx0cmV0dXJuIFtsLCBsLCBsXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZnVuY3Rpb24gaHVlMnJnYihwLCBxLCB0KSB7XG5cdFx0XHRcdGlmICh0IDwgMCkgdCArPSAxO1xuXHRcdFx0XHRpZiAodCA+IDEpIHQgLT0gMTtcblx0XHRcdFx0aWYgKHQgPCAxLzYpIHJldHVybiBwICsgKHEgLSBwKSAqIDYgKiB0O1xuXHRcdFx0XHRpZiAodCA8IDEvMikgcmV0dXJuIHE7XG5cdFx0XHRcdGlmICh0IDwgMi8zKSByZXR1cm4gcCArIChxIC0gcCkgKiAoMi8zIC0gdCkgKiA2O1xuXHRcdFx0XHRyZXR1cm4gcDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHMgPSBjb2xvclsxXTtcblx0XHRcdHZhciBxID0gKGwgPCAwLjUgPyBsICogKDEgKyBzKSA6IGwgKyBzIC0gbCAqIHMpO1xuXHRcdFx0dmFyIHAgPSAyICogbCAtIHE7XG5cdFx0XHR2YXIgciA9IGh1ZTJyZ2IocCwgcSwgY29sb3JbMF0gKyAxLzMpO1xuXHRcdFx0dmFyIGcgPSBodWUycmdiKHAsIHEsIGNvbG9yWzBdKTtcblx0XHRcdHZhciBiID0gaHVlMnJnYihwLCBxLCBjb2xvclswXSAtIDEvMyk7XG5cdFx0XHRyZXR1cm4gW01hdGgucm91bmQocioyNTUpLCBNYXRoLnJvdW5kKGcqMjU1KSwgTWF0aC5yb3VuZChiKjI1NSldO1xuXHRcdH1cblx0fSxcblxuXHR0b1JHQjogZnVuY3Rpb24oY29sb3IpIHtcblx0XHRyZXR1cm4gXCJyZ2IoXCIgKyB0aGlzLl9jbGFtcChjb2xvclswXSkgKyBcIixcIiArIHRoaXMuX2NsYW1wKGNvbG9yWzFdKSArIFwiLFwiICsgdGhpcy5fY2xhbXAoY29sb3JbMl0pICsgXCIpXCI7XG5cdH0sXG5cblx0dG9IZXg6IGZ1bmN0aW9uKGNvbG9yKSB7XG5cdFx0dmFyIHBhcnRzID0gW107XG5cdFx0Zm9yICh2YXIgaT0wO2k8MztpKyspIHtcblx0XHRcdHBhcnRzLnB1c2godGhpcy5fY2xhbXAoY29sb3JbaV0pLnRvU3RyaW5nKDE2KS5scGFkKFwiMFwiLCAyKSk7XG5cdFx0fVxuXHRcdHJldHVybiBcIiNcIiArIHBhcnRzLmpvaW4oXCJcIik7XG5cdH0sXG5cblx0X2NsYW1wOiBmdW5jdGlvbihudW0pIHtcblx0XHRpZiAobnVtIDwgMCkge1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fSBlbHNlIGlmIChudW0gPiAyNTUpIHtcblx0XHRcdHJldHVybiAyNTU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBudW07XG5cdFx0fVxuXHR9LFxuXG5cdF9jYWNoZToge1xuXHRcdFwiYmxhY2tcIjogWzAsMCwwXSxcblx0XHRcIm5hdnlcIjogWzAsMCwxMjhdLFxuXHRcdFwiZGFya2JsdWVcIjogWzAsMCwxMzldLFxuXHRcdFwibWVkaXVtYmx1ZVwiOiBbMCwwLDIwNV0sXG5cdFx0XCJibHVlXCI6IFswLDAsMjU1XSxcblx0XHRcImRhcmtncmVlblwiOiBbMCwxMDAsMF0sXG5cdFx0XCJncmVlblwiOiBbMCwxMjgsMF0sXG5cdFx0XCJ0ZWFsXCI6IFswLDEyOCwxMjhdLFxuXHRcdFwiZGFya2N5YW5cIjogWzAsMTM5LDEzOV0sXG5cdFx0XCJkZWVwc2t5Ymx1ZVwiOiBbMCwxOTEsMjU1XSxcblx0XHRcImRhcmt0dXJxdW9pc2VcIjogWzAsMjA2LDIwOV0sXG5cdFx0XCJtZWRpdW1zcHJpbmdncmVlblwiOiBbMCwyNTAsMTU0XSxcblx0XHRcImxpbWVcIjogWzAsMjU1LDBdLFxuXHRcdFwic3ByaW5nZ3JlZW5cIjogWzAsMjU1LDEyN10sXG5cdFx0XCJhcXVhXCI6IFswLDI1NSwyNTVdLFxuXHRcdFwiY3lhblwiOiBbMCwyNTUsMjU1XSxcblx0XHRcIm1pZG5pZ2h0Ymx1ZVwiOiBbMjUsMjUsMTEyXSxcblx0XHRcImRvZGdlcmJsdWVcIjogWzMwLDE0NCwyNTVdLFxuXHRcdFwiZm9yZXN0Z3JlZW5cIjogWzM0LDEzOSwzNF0sXG5cdFx0XCJzZWFncmVlblwiOiBbNDYsMTM5LDg3XSxcblx0XHRcImRhcmtzbGF0ZWdyYXlcIjogWzQ3LDc5LDc5XSxcblx0XHRcImRhcmtzbGF0ZWdyZXlcIjogWzQ3LDc5LDc5XSxcblx0XHRcImxpbWVncmVlblwiOiBbNTAsMjA1LDUwXSxcblx0XHRcIm1lZGl1bXNlYWdyZWVuXCI6IFs2MCwxNzksMTEzXSxcblx0XHRcInR1cnF1b2lzZVwiOiBbNjQsMjI0LDIwOF0sXG5cdFx0XCJyb3lhbGJsdWVcIjogWzY1LDEwNSwyMjVdLFxuXHRcdFwic3RlZWxibHVlXCI6IFs3MCwxMzAsMTgwXSxcblx0XHRcImRhcmtzbGF0ZWJsdWVcIjogWzcyLDYxLDEzOV0sXG5cdFx0XCJtZWRpdW10dXJxdW9pc2VcIjogWzcyLDIwOSwyMDRdLFxuXHRcdFwiaW5kaWdvXCI6IFs3NSwwLDEzMF0sXG5cdFx0XCJkYXJrb2xpdmVncmVlblwiOiBbODUsMTA3LDQ3XSxcblx0XHRcImNhZGV0Ymx1ZVwiOiBbOTUsMTU4LDE2MF0sXG5cdFx0XCJjb3JuZmxvd2VyYmx1ZVwiOiBbMTAwLDE0OSwyMzddLFxuXHRcdFwibWVkaXVtYXF1YW1hcmluZVwiOiBbMTAyLDIwNSwxNzBdLFxuXHRcdFwiZGltZ3JheVwiOiBbMTA1LDEwNSwxMDVdLFxuXHRcdFwiZGltZ3JleVwiOiBbMTA1LDEwNSwxMDVdLFxuXHRcdFwic2xhdGVibHVlXCI6IFsxMDYsOTAsMjA1XSxcblx0XHRcIm9saXZlZHJhYlwiOiBbMTA3LDE0MiwzNV0sXG5cdFx0XCJzbGF0ZWdyYXlcIjogWzExMiwxMjgsMTQ0XSxcblx0XHRcInNsYXRlZ3JleVwiOiBbMTEyLDEyOCwxNDRdLFxuXHRcdFwibGlnaHRzbGF0ZWdyYXlcIjogWzExOSwxMzYsMTUzXSxcblx0XHRcImxpZ2h0c2xhdGVncmV5XCI6IFsxMTksMTM2LDE1M10sXG5cdFx0XCJtZWRpdW1zbGF0ZWJsdWVcIjogWzEyMywxMDQsMjM4XSxcblx0XHRcImxhd25ncmVlblwiOiBbMTI0LDI1MiwwXSxcblx0XHRcImNoYXJ0cmV1c2VcIjogWzEyNywyNTUsMF0sXG5cdFx0XCJhcXVhbWFyaW5lXCI6IFsxMjcsMjU1LDIxMl0sXG5cdFx0XCJtYXJvb25cIjogWzEyOCwwLDBdLFxuXHRcdFwicHVycGxlXCI6IFsxMjgsMCwxMjhdLFxuXHRcdFwib2xpdmVcIjogWzEyOCwxMjgsMF0sXG5cdFx0XCJncmF5XCI6IFsxMjgsMTI4LDEyOF0sXG5cdFx0XCJncmV5XCI6IFsxMjgsMTI4LDEyOF0sXG5cdFx0XCJza3libHVlXCI6IFsxMzUsMjA2LDIzNV0sXG5cdFx0XCJsaWdodHNreWJsdWVcIjogWzEzNSwyMDYsMjUwXSxcblx0XHRcImJsdWV2aW9sZXRcIjogWzEzOCw0MywyMjZdLFxuXHRcdFwiZGFya3JlZFwiOiBbMTM5LDAsMF0sXG5cdFx0XCJkYXJrbWFnZW50YVwiOiBbMTM5LDAsMTM5XSxcblx0XHRcInNhZGRsZWJyb3duXCI6IFsxMzksNjksMTldLFxuXHRcdFwiZGFya3NlYWdyZWVuXCI6IFsxNDMsMTg4LDE0M10sXG5cdFx0XCJsaWdodGdyZWVuXCI6IFsxNDQsMjM4LDE0NF0sXG5cdFx0XCJtZWRpdW1wdXJwbGVcIjogWzE0NywxMTIsMjE2XSxcblx0XHRcImRhcmt2aW9sZXRcIjogWzE0OCwwLDIxMV0sXG5cdFx0XCJwYWxlZ3JlZW5cIjogWzE1MiwyNTEsMTUyXSxcblx0XHRcImRhcmtvcmNoaWRcIjogWzE1Myw1MCwyMDRdLFxuXHRcdFwieWVsbG93Z3JlZW5cIjogWzE1NCwyMDUsNTBdLFxuXHRcdFwic2llbm5hXCI6IFsxNjAsODIsNDVdLFxuXHRcdFwiYnJvd25cIjogWzE2NSw0Miw0Ml0sXG5cdFx0XCJkYXJrZ3JheVwiOiBbMTY5LDE2OSwxNjldLFxuXHRcdFwiZGFya2dyZXlcIjogWzE2OSwxNjksMTY5XSxcblx0XHRcImxpZ2h0Ymx1ZVwiOiBbMTczLDIxNiwyMzBdLFxuXHRcdFwiZ3JlZW55ZWxsb3dcIjogWzE3MywyNTUsNDddLFxuXHRcdFwicGFsZXR1cnF1b2lzZVwiOiBbMTc1LDIzOCwyMzhdLFxuXHRcdFwibGlnaHRzdGVlbGJsdWVcIjogWzE3NiwxOTYsMjIyXSxcblx0XHRcInBvd2RlcmJsdWVcIjogWzE3NiwyMjQsMjMwXSxcblx0XHRcImZpcmVicmlja1wiOiBbMTc4LDM0LDM0XSxcblx0XHRcImRhcmtnb2xkZW5yb2RcIjogWzE4NCwxMzQsMTFdLFxuXHRcdFwibWVkaXVtb3JjaGlkXCI6IFsxODYsODUsMjExXSxcblx0XHRcInJvc3licm93blwiOiBbMTg4LDE0MywxNDNdLFxuXHRcdFwiZGFya2toYWtpXCI6IFsxODksMTgzLDEwN10sXG5cdFx0XCJzaWx2ZXJcIjogWzE5MiwxOTIsMTkyXSxcblx0XHRcIm1lZGl1bXZpb2xldHJlZFwiOiBbMTk5LDIxLDEzM10sXG5cdFx0XCJpbmRpYW5yZWRcIjogWzIwNSw5Miw5Ml0sXG5cdFx0XCJwZXJ1XCI6IFsyMDUsMTMzLDYzXSxcblx0XHRcImNob2NvbGF0ZVwiOiBbMjEwLDEwNSwzMF0sXG5cdFx0XCJ0YW5cIjogWzIxMCwxODAsMTQwXSxcblx0XHRcImxpZ2h0Z3JheVwiOiBbMjExLDIxMSwyMTFdLFxuXHRcdFwibGlnaHRncmV5XCI6IFsyMTEsMjExLDIxMV0sXG5cdFx0XCJwYWxldmlvbGV0cmVkXCI6IFsyMTYsMTEyLDE0N10sXG5cdFx0XCJ0aGlzdGxlXCI6IFsyMTYsMTkxLDIxNl0sXG5cdFx0XCJvcmNoaWRcIjogWzIxOCwxMTIsMjE0XSxcblx0XHRcImdvbGRlbnJvZFwiOiBbMjE4LDE2NSwzMl0sXG5cdFx0XCJjcmltc29uXCI6IFsyMjAsMjAsNjBdLFxuXHRcdFwiZ2FpbnNib3JvXCI6IFsyMjAsMjIwLDIyMF0sXG5cdFx0XCJwbHVtXCI6IFsyMjEsMTYwLDIyMV0sXG5cdFx0XCJidXJseXdvb2RcIjogWzIyMiwxODQsMTM1XSxcblx0XHRcImxpZ2h0Y3lhblwiOiBbMjI0LDI1NSwyNTVdLFxuXHRcdFwibGF2ZW5kZXJcIjogWzIzMCwyMzAsMjUwXSxcblx0XHRcImRhcmtzYWxtb25cIjogWzIzMywxNTAsMTIyXSxcblx0XHRcInZpb2xldFwiOiBbMjM4LDEzMCwyMzhdLFxuXHRcdFwicGFsZWdvbGRlbnJvZFwiOiBbMjM4LDIzMiwxNzBdLFxuXHRcdFwibGlnaHRjb3JhbFwiOiBbMjQwLDEyOCwxMjhdLFxuXHRcdFwia2hha2lcIjogWzI0MCwyMzAsMTQwXSxcblx0XHRcImFsaWNlYmx1ZVwiOiBbMjQwLDI0OCwyNTVdLFxuXHRcdFwiaG9uZXlkZXdcIjogWzI0MCwyNTUsMjQwXSxcblx0XHRcImF6dXJlXCI6IFsyNDAsMjU1LDI1NV0sXG5cdFx0XCJzYW5keWJyb3duXCI6IFsyNDQsMTY0LDk2XSxcblx0XHRcIndoZWF0XCI6IFsyNDUsMjIyLDE3OV0sXG5cdFx0XCJiZWlnZVwiOiBbMjQ1LDI0NSwyMjBdLFxuXHRcdFwid2hpdGVzbW9rZVwiOiBbMjQ1LDI0NSwyNDVdLFxuXHRcdFwibWludGNyZWFtXCI6IFsyNDUsMjU1LDI1MF0sXG5cdFx0XCJnaG9zdHdoaXRlXCI6IFsyNDgsMjQ4LDI1NV0sXG5cdFx0XCJzYWxtb25cIjogWzI1MCwxMjgsMTE0XSxcblx0XHRcImFudGlxdWV3aGl0ZVwiOiBbMjUwLDIzNSwyMTVdLFxuXHRcdFwibGluZW5cIjogWzI1MCwyNDAsMjMwXSxcblx0XHRcImxpZ2h0Z29sZGVucm9keWVsbG93XCI6IFsyNTAsMjUwLDIxMF0sXG5cdFx0XCJvbGRsYWNlXCI6IFsyNTMsMjQ1LDIzMF0sXG5cdFx0XCJyZWRcIjogWzI1NSwwLDBdLFxuXHRcdFwiZnVjaHNpYVwiOiBbMjU1LDAsMjU1XSxcblx0XHRcIm1hZ2VudGFcIjogWzI1NSwwLDI1NV0sXG5cdFx0XCJkZWVwcGlua1wiOiBbMjU1LDIwLDE0N10sXG5cdFx0XCJvcmFuZ2VyZWRcIjogWzI1NSw2OSwwXSxcblx0XHRcInRvbWF0b1wiOiBbMjU1LDk5LDcxXSxcblx0XHRcImhvdHBpbmtcIjogWzI1NSwxMDUsMTgwXSxcblx0XHRcImNvcmFsXCI6IFsyNTUsMTI3LDgwXSxcblx0XHRcImRhcmtvcmFuZ2VcIjogWzI1NSwxNDAsMF0sXG5cdFx0XCJsaWdodHNhbG1vblwiOiBbMjU1LDE2MCwxMjJdLFxuXHRcdFwib3JhbmdlXCI6IFsyNTUsMTY1LDBdLFxuXHRcdFwibGlnaHRwaW5rXCI6IFsyNTUsMTgyLDE5M10sXG5cdFx0XCJwaW5rXCI6IFsyNTUsMTkyLDIwM10sXG5cdFx0XCJnb2xkXCI6IFsyNTUsMjE1LDBdLFxuXHRcdFwicGVhY2hwdWZmXCI6IFsyNTUsMjE4LDE4NV0sXG5cdFx0XCJuYXZham93aGl0ZVwiOiBbMjU1LDIyMiwxNzNdLFxuXHRcdFwibW9jY2FzaW5cIjogWzI1NSwyMjgsMTgxXSxcblx0XHRcImJpc3F1ZVwiOiBbMjU1LDIyOCwxOTZdLFxuXHRcdFwibWlzdHlyb3NlXCI6IFsyNTUsMjI4LDIyNV0sXG5cdFx0XCJibGFuY2hlZGFsbW9uZFwiOiBbMjU1LDIzNSwyMDVdLFxuXHRcdFwicGFwYXlhd2hpcFwiOiBbMjU1LDIzOSwyMTNdLFxuXHRcdFwibGF2ZW5kZXJibHVzaFwiOiBbMjU1LDI0MCwyNDVdLFxuXHRcdFwic2Vhc2hlbGxcIjogWzI1NSwyNDUsMjM4XSxcblx0XHRcImNvcm5zaWxrXCI6IFsyNTUsMjQ4LDIyMF0sXG5cdFx0XCJsZW1vbmNoaWZmb25cIjogWzI1NSwyNTAsMjA1XSxcblx0XHRcImZsb3JhbHdoaXRlXCI6IFsyNTUsMjUwLDI0MF0sXG5cdFx0XCJzbm93XCI6IFsyNTUsMjUwLDI1MF0sXG5cdFx0XCJ5ZWxsb3dcIjogWzI1NSwyNTUsMF0sXG5cdFx0XCJsaWdodHllbGxvd1wiOiBbMjU1LDI1NSwyMjRdLFxuXHRcdFwiaXZvcnlcIjogWzI1NSwyNTUsMjQwXSxcblx0XHRcIndoaXRlXCI6IFsyNTUsMjU1LDI1NV1cblx0fVxufVxuLyoqXG4gKiBAY2xhc3MgTGlnaHRpbmcgY29tcHV0YXRpb24sIGJhc2VkIG9uIGEgdHJhZGl0aW9uYWwgRk9WIGZvciBtdWx0aXBsZSBsaWdodCBzb3VyY2VzIGFuZCBtdWx0aXBsZSBwYXNzZXMuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSByZWZsZWN0aXZpdHlDYWxsYmFjayBDYWxsYmFjayB0byByZXRyaWV2ZSBjZWxsIHJlZmxlY3Rpdml0eSAoMC4uMSlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cbiAqIEBwYXJhbSB7aW50fSBbb3B0aW9ucy5wYXNzZXM9MV0gTnVtYmVyIG9mIHBhc3Nlcy4gMSBlcXVhbHMgdG8gc2ltcGxlIEZPViBvZiBhbGwgbGlnaHQgc291cmNlcywgPjEgbWVhbnMgYSAqaGlnaGx5IHNpbXBsaWZpZWQqIHJhZGlvc2l0eS1saWtlIGFsZ29yaXRobS5cbiAqIEBwYXJhbSB7aW50fSBbb3B0aW9ucy5lbWlzc2lvblRocmVzaG9sZD0xMDBdIENlbGxzIHdpdGggZW1pc3Npdml0eSA+IHRocmVzaG9sZCB3aWxsIGJlIHRyZWF0ZWQgYXMgbGlnaHQgc291cmNlIGluIHRoZSBuZXh0IHBhc3MuXG4gKiBAcGFyYW0ge2ludH0gW29wdGlvbnMucmFuZ2U9MTBdIE1heCBsaWdodCByYW5nZVxuICovXG5ST1QuTGlnaHRpbmcgPSBmdW5jdGlvbihyZWZsZWN0aXZpdHlDYWxsYmFjaywgb3B0aW9ucykge1xuXHR0aGlzLl9yZWZsZWN0aXZpdHlDYWxsYmFjayA9IHJlZmxlY3Rpdml0eUNhbGxiYWNrO1xuXHR0aGlzLl9vcHRpb25zID0ge1xuXHRcdHBhc3NlczogMSxcblx0XHRlbWlzc2lvblRocmVzaG9sZDogMTAwLFxuXHRcdHJhbmdlOiAxMFxuXHR9O1xuXHR0aGlzLl9mb3YgPSBudWxsO1xuXG5cdHRoaXMuX2xpZ2h0cyA9IHt9O1xuXHR0aGlzLl9yZWZsZWN0aXZpdHlDYWNoZSA9IHt9O1xuXHR0aGlzLl9mb3ZDYWNoZSA9IHt9O1xuXG5cdHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBBZGp1c3Qgb3B0aW9ucyBhdCBydW50aW1lXG4gKiBAc2VlIFJPVC5MaWdodGluZ1xuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxuICovXG5ST1QuTGlnaHRpbmcucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cdGZvciAodmFyIHAgaW4gb3B0aW9ucykgeyB0aGlzLl9vcHRpb25zW3BdID0gb3B0aW9uc1twXTsgfVxuXHRpZiAob3B0aW9ucy5yYW5nZSkgeyB0aGlzLnJlc2V0KCk7IH1cblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogU2V0IHRoZSB1c2VkIEZpZWxkLU9mLVZpZXcgYWxnb1xuICogQHBhcmFtIHtST1QuRk9WfSBmb3ZcbiAqL1xuUk9ULkxpZ2h0aW5nLnByb3RvdHlwZS5zZXRGT1YgPSBmdW5jdGlvbihmb3YpIHtcblx0dGhpcy5fZm92ID0gZm92O1xuXHR0aGlzLl9mb3ZDYWNoZSA9IHt9O1xuXHRyZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBTZXQgKG9yIHJlbW92ZSkgYSBsaWdodCBzb3VyY2VcbiAqIEBwYXJhbSB7aW50fSB4XG4gKiBAcGFyYW0ge2ludH0geVxuICogQHBhcmFtIHtudWxsIHx8IHN0cmluZyB8fCBudW1iZXJbM119IGNvbG9yXG4gKi9cblJPVC5MaWdodGluZy5wcm90b3R5cGUuc2V0TGlnaHQgPSBmdW5jdGlvbih4LCB5LCBjb2xvcikge1xuXHR2YXIga2V5ID0geCtcIixcIit5O1xuXG5cdGlmIChjb2xvcikge1xuXHRcdHRoaXMuX2xpZ2h0c1trZXldID0gKHR5cGVvZihjb2xvcikgPT0gXCJzdHJpbmdcIiA/IFJPVC5Db2xvci5mcm9tU3RyaW5nKGNvbG9yKSA6IGNvbG9yKTtcblx0fSBlbHNlIHtcblx0XHRkZWxldGUgdGhpcy5fbGlnaHRzW2tleV07XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogUmVzZXQgdGhlIHByZS1jb21wdXRlZCB0b3BvbG9neSB2YWx1ZXMuIENhbGwgd2hlbmV2ZXIgdGhlIHVuZGVybHlpbmcgbWFwIGNoYW5nZXMgaXRzIGxpZ2h0LXBhc3NhYmlsaXR5LlxuICovXG5ST1QuTGlnaHRpbmcucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuX3JlZmxlY3Rpdml0eUNhY2hlID0ge307XG5cdHRoaXMuX2ZvdkNhY2hlID0ge307XG5cblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogQ29tcHV0ZSB0aGUgbGlnaHRpbmdcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpZ2h0aW5nQ2FsbGJhY2sgV2lsbCBiZSBjYWxsZWQgd2l0aCAoeCwgeSwgY29sb3IpIGZvciBldmVyeSBsaXQgY2VsbFxuICovXG5ST1QuTGlnaHRpbmcucHJvdG90eXBlLmNvbXB1dGUgPSBmdW5jdGlvbihsaWdodGluZ0NhbGxiYWNrKSB7XG5cdHZhciBkb25lQ2VsbHMgPSB7fTtcblx0dmFyIGVtaXR0aW5nQ2VsbHMgPSB7fTtcblx0dmFyIGxpdENlbGxzID0ge307XG5cblx0Zm9yICh2YXIga2V5IGluIHRoaXMuX2xpZ2h0cykgeyAvKiBwcmVwYXJlIGVtaXR0ZXJzIGZvciBmaXJzdCBwYXNzICovXG5cdFx0dmFyIGxpZ2h0ID0gdGhpcy5fbGlnaHRzW2tleV07XG5cdFx0aWYgKCEoa2V5IGluIGVtaXR0aW5nQ2VsbHMpKSB7IGVtaXR0aW5nQ2VsbHNba2V5XSA9IFswLCAwLCAwXTsgfVxuXG5cdFx0Uk9ULkNvbG9yLmFkZF8oZW1pdHRpbmdDZWxsc1trZXldLCBsaWdodCk7XG5cdH1cblxuXHRmb3IgKHZhciBpPTA7aTx0aGlzLl9vcHRpb25zLnBhc3NlcztpKyspIHsgLyogbWFpbiBsb29wICovXG5cdFx0dGhpcy5fZW1pdExpZ2h0KGVtaXR0aW5nQ2VsbHMsIGxpdENlbGxzLCBkb25lQ2VsbHMpO1xuXHRcdGlmIChpKzEgPT0gdGhpcy5fb3B0aW9ucy5wYXNzZXMpIHsgY29udGludWU7IH0gLyogbm90IGZvciB0aGUgbGFzdCBwYXNzICovXG5cdFx0ZW1pdHRpbmdDZWxscyA9IHRoaXMuX2NvbXB1dGVFbWl0dGVycyhsaXRDZWxscywgZG9uZUNlbGxzKTtcblx0fVxuXG5cdGZvciAodmFyIGxpdEtleSBpbiBsaXRDZWxscykgeyAvKiBsZXQgdGhlIHVzZXIga25vdyB3aGF0IGFuZCBob3cgaXMgbGl0ICovXG5cdFx0dmFyIHBhcnRzID0gbGl0S2V5LnNwbGl0KFwiLFwiKTtcblx0XHR2YXIgeCA9IHBhcnNlSW50KHBhcnRzWzBdKTtcblx0XHR2YXIgeSA9IHBhcnNlSW50KHBhcnRzWzFdKTtcblx0XHRsaWdodGluZ0NhbGxiYWNrKHgsIHksIGxpdENlbGxzW2xpdEtleV0pO1xuXHR9XG5cblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogQ29tcHV0ZSBvbmUgaXRlcmF0aW9uIGZyb20gYWxsIGVtaXR0aW5nIGNlbGxzXG4gKiBAcGFyYW0ge29iamVjdH0gZW1pdHRpbmdDZWxscyBUaGVzZSBlbWl0IGxpZ2h0XG4gKiBAcGFyYW0ge29iamVjdH0gbGl0Q2VsbHMgQWRkIHByb2plY3RlZCBsaWdodCB0byB0aGVzZVxuICogQHBhcmFtIHtvYmplY3R9IGRvbmVDZWxscyBUaGVzZSBhbHJlYWR5IGVtaXR0ZWQsIGZvcmJpZCB0aGVtIGZyb20gZnVydGhlciBjYWxjdWxhdGlvbnNcbiAqL1xuUk9ULkxpZ2h0aW5nLnByb3RvdHlwZS5fZW1pdExpZ2h0ID0gZnVuY3Rpb24oZW1pdHRpbmdDZWxscywgbGl0Q2VsbHMsIGRvbmVDZWxscykge1xuXHRmb3IgKHZhciBrZXkgaW4gZW1pdHRpbmdDZWxscykge1xuXHRcdHZhciBwYXJ0cyA9IGtleS5zcGxpdChcIixcIik7XG5cdFx0dmFyIHggPSBwYXJzZUludChwYXJ0c1swXSk7XG5cdFx0dmFyIHkgPSBwYXJzZUludChwYXJ0c1sxXSk7XG5cdFx0dGhpcy5fZW1pdExpZ2h0RnJvbUNlbGwoeCwgeSwgZW1pdHRpbmdDZWxsc1trZXldLCBsaXRDZWxscyk7XG5cdFx0ZG9uZUNlbGxzW2tleV0gPSAxO1xuXHR9XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFByZXBhcmUgYSBsaXN0IG9mIGVtaXR0ZXJzIGZvciBuZXh0IHBhc3NcbiAqIEBwYXJhbSB7b2JqZWN0fSBsaXRDZWxsc1xuICogQHBhcmFtIHtvYmplY3R9IGRvbmVDZWxsc1xuICogQHJldHVybnMge29iamVjdH1cbiAqL1xuUk9ULkxpZ2h0aW5nLnByb3RvdHlwZS5fY29tcHV0ZUVtaXR0ZXJzID0gZnVuY3Rpb24obGl0Q2VsbHMsIGRvbmVDZWxscykge1xuXHR2YXIgcmVzdWx0ID0ge307XG5cblx0Zm9yICh2YXIga2V5IGluIGxpdENlbGxzKSB7XG5cdFx0aWYgKGtleSBpbiBkb25lQ2VsbHMpIHsgY29udGludWU7IH0gLyogYWxyZWFkeSBlbWl0dGVkICovXG5cblx0XHR2YXIgY29sb3IgPSBsaXRDZWxsc1trZXldO1xuXG5cdFx0aWYgKGtleSBpbiB0aGlzLl9yZWZsZWN0aXZpdHlDYWNoZSkge1xuXHRcdFx0dmFyIHJlZmxlY3Rpdml0eSA9IHRoaXMuX3JlZmxlY3Rpdml0eUNhY2hlW2tleV07XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBwYXJ0cyA9IGtleS5zcGxpdChcIixcIik7XG5cdFx0XHR2YXIgeCA9IHBhcnNlSW50KHBhcnRzWzBdKTtcblx0XHRcdHZhciB5ID0gcGFyc2VJbnQocGFydHNbMV0pO1xuXHRcdFx0dmFyIHJlZmxlY3Rpdml0eSA9IHRoaXMuX3JlZmxlY3Rpdml0eUNhbGxiYWNrKHgsIHkpO1xuXHRcdFx0dGhpcy5fcmVmbGVjdGl2aXR5Q2FjaGVba2V5XSA9IHJlZmxlY3Rpdml0eTtcblx0XHR9XG5cblx0XHRpZiAocmVmbGVjdGl2aXR5ID09IDApIHsgY29udGludWU7IH0gLyogd2lsbCBub3QgcmVmbGVjdCBhdCBhbGwgKi9cblxuXHRcdC8qIGNvbXB1dGUgZW1pc3Npb24gY29sb3IgKi9cblx0XHR2YXIgZW1pc3Npb24gPSBbXTtcblx0XHR2YXIgaW50ZW5zaXR5ID0gMDtcblx0XHRmb3IgKHZhciBpPTA7aTwzO2krKykge1xuXHRcdFx0dmFyIHBhcnQgPSBNYXRoLnJvdW5kKGNvbG9yW2ldKnJlZmxlY3Rpdml0eSk7XG5cdFx0XHRlbWlzc2lvbltpXSA9IHBhcnQ7XG5cdFx0XHRpbnRlbnNpdHkgKz0gcGFydDtcblx0XHR9XG5cdFx0aWYgKGludGVuc2l0eSA+IHRoaXMuX29wdGlvbnMuZW1pc3Npb25UaHJlc2hvbGQpIHsgcmVzdWx0W2tleV0gPSBlbWlzc2lvbjsgfVxuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBDb21wdXRlIG9uZSBpdGVyYXRpb24gZnJvbSBvbmUgY2VsbFxuICogQHBhcmFtIHtpbnR9IHhcbiAqIEBwYXJhbSB7aW50fSB5XG4gKiBAcGFyYW0ge251bWJlcltdfSBjb2xvclxuICogQHBhcmFtIHtvYmplY3R9IGxpdENlbGxzIENlbGwgZGF0YSB0byBieSB1cGRhdGVkXG4gKi9cblJPVC5MaWdodGluZy5wcm90b3R5cGUuX2VtaXRMaWdodEZyb21DZWxsID0gZnVuY3Rpb24oeCwgeSwgY29sb3IsIGxpdENlbGxzKSB7XG5cdHZhciBrZXkgPSB4K1wiLFwiK3k7XG5cdGlmIChrZXkgaW4gdGhpcy5fZm92Q2FjaGUpIHtcblx0XHR2YXIgZm92ID0gdGhpcy5fZm92Q2FjaGVba2V5XTtcblx0fSBlbHNlIHtcblx0XHR2YXIgZm92ID0gdGhpcy5fdXBkYXRlRk9WKHgsIHkpO1xuXHR9XG5cblx0Zm9yICh2YXIgZm92S2V5IGluIGZvdikge1xuXHRcdHZhciBmb3JtRmFjdG9yID0gZm92W2ZvdktleV07XG5cblx0XHRpZiAoZm92S2V5IGluIGxpdENlbGxzKSB7IC8qIGFscmVhZHkgbGl0ICovXG5cdFx0XHR2YXIgcmVzdWx0ID0gbGl0Q2VsbHNbZm92S2V5XTtcblx0XHR9IGVsc2UgeyAvKiBuZXdseSBsaXQgKi9cblx0XHRcdHZhciByZXN1bHQgPSBbMCwgMCwgMF07XG5cdFx0XHRsaXRDZWxsc1tmb3ZLZXldID0gcmVzdWx0O1xuXHRcdH1cblxuXHRcdGZvciAodmFyIGk9MDtpPDM7aSsrKSB7IHJlc3VsdFtpXSArPSBNYXRoLnJvdW5kKGNvbG9yW2ldKmZvcm1GYWN0b3IpOyB9IC8qIGFkZCBsaWdodCBjb2xvciAqL1xuXHR9XG5cblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogQ29tcHV0ZSBGT1YgKFwiZm9ybSBmYWN0b3JcIikgZm9yIGEgcG90ZW50aWFsIGxpZ2h0IHNvdXJjZSBhdCBbeCx5XVxuICogQHBhcmFtIHtpbnR9IHhcbiAqIEBwYXJhbSB7aW50fSB5XG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5ST1QuTGlnaHRpbmcucHJvdG90eXBlLl91cGRhdGVGT1YgPSBmdW5jdGlvbih4LCB5KSB7XG5cdHZhciBrZXkxID0geCtcIixcIit5O1xuXHR2YXIgY2FjaGUgPSB7fTtcblx0dGhpcy5fZm92Q2FjaGVba2V5MV0gPSBjYWNoZTtcblx0dmFyIHJhbmdlID0gdGhpcy5fb3B0aW9ucy5yYW5nZTtcblx0dmFyIGNiID0gZnVuY3Rpb24oeCwgeSwgciwgdmlzKSB7XG5cdFx0dmFyIGtleTIgPSB4K1wiLFwiK3k7XG5cdFx0dmFyIGZvcm1GYWN0b3IgPSB2aXMgKiAoMS1yL3JhbmdlKTtcblx0XHRpZiAoZm9ybUZhY3RvciA9PSAwKSB7IHJldHVybjsgfVxuXHRcdGNhY2hlW2tleTJdID0gZm9ybUZhY3Rvcjtcblx0fVxuXHR0aGlzLl9mb3YuY29tcHV0ZSh4LCB5LCByYW5nZSwgY2IuYmluZCh0aGlzKSk7XG5cblx0cmV0dXJuIGNhY2hlO1xufVxuLyoqXG4gKiBAY2xhc3MgQWJzdHJhY3QgcGF0aGZpbmRlclxuICogQHBhcmFtIHtpbnR9IHRvWCBUYXJnZXQgWCBjb29yZFxuICogQHBhcmFtIHtpbnR9IHRvWSBUYXJnZXQgWSBjb29yZFxuICogQHBhcmFtIHtmdW5jdGlvbn0gcGFzc2FibGVDYWxsYmFjayBDYWxsYmFjayB0byBkZXRlcm1pbmUgbWFwIHBhc3NhYmlsaXR5XG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXG4gKiBAcGFyYW0ge2ludH0gW29wdGlvbnMudG9wb2xvZ3k9OF1cbiAqL1xuUk9ULlBhdGggPSBmdW5jdGlvbih0b1gsIHRvWSwgcGFzc2FibGVDYWxsYmFjaywgb3B0aW9ucykge1xuXHR0aGlzLl90b1ggPSB0b1g7XG5cdHRoaXMuX3RvWSA9IHRvWTtcblx0dGhpcy5fZnJvbVggPSBudWxsO1xuXHR0aGlzLl9mcm9tWSA9IG51bGw7XG5cdHRoaXMuX3Bhc3NhYmxlQ2FsbGJhY2sgPSBwYXNzYWJsZUNhbGxiYWNrO1xuXHR0aGlzLl9vcHRpb25zID0ge1xuXHRcdHRvcG9sb2d5OiA4XG5cdH1cblx0Zm9yICh2YXIgcCBpbiBvcHRpb25zKSB7IHRoaXMuX29wdGlvbnNbcF0gPSBvcHRpb25zW3BdOyB9XG5cblx0dGhpcy5fZGlycyA9IFJPVC5ESVJTW3RoaXMuX29wdGlvbnMudG9wb2xvZ3ldO1xuXHRpZiAodGhpcy5fb3B0aW9ucy50b3BvbG9neSA9PSA4KSB7IC8qIHJlb3JkZXIgZGlycyBmb3IgbW9yZSBhZXN0aGV0aWMgcmVzdWx0ICh2ZXJ0aWNhbC9ob3Jpem9udGFsIGZpcnN0KSAqL1xuXHRcdHRoaXMuX2RpcnMgPSBbXG5cdFx0XHR0aGlzLl9kaXJzWzBdLFxuXHRcdFx0dGhpcy5fZGlyc1syXSxcblx0XHRcdHRoaXMuX2RpcnNbNF0sXG5cdFx0XHR0aGlzLl9kaXJzWzZdLFxuXHRcdFx0dGhpcy5fZGlyc1sxXSxcblx0XHRcdHRoaXMuX2RpcnNbM10sXG5cdFx0XHR0aGlzLl9kaXJzWzVdLFxuXHRcdFx0dGhpcy5fZGlyc1s3XVxuXHRcdF1cblx0fVxufVxuXG4vKipcbiAqIENvbXB1dGUgYSBwYXRoIGZyb20gYSBnaXZlbiBwb2ludFxuICogQHBhcmFtIHtpbnR9IGZyb21YXG4gKiBAcGFyYW0ge2ludH0gZnJvbVlcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIFdpbGwgYmUgY2FsbGVkIGZvciBldmVyeSBwYXRoIGl0ZW0gd2l0aCBhcmd1bWVudHMgXCJ4XCIgYW5kIFwieVwiXG4gKi9cblJPVC5QYXRoLnByb3RvdHlwZS5jb21wdXRlID0gZnVuY3Rpb24oZnJvbVgsIGZyb21ZLCBjYWxsYmFjaykge1xufVxuXG5ST1QuUGF0aC5wcm90b3R5cGUuX2dldE5laWdoYm9ycyA9IGZ1bmN0aW9uKGN4LCBjeSkge1xuXHR2YXIgcmVzdWx0ID0gW107XG5cdGZvciAodmFyIGk9MDtpPHRoaXMuX2RpcnMubGVuZ3RoO2krKykge1xuXHRcdHZhciBkaXIgPSB0aGlzLl9kaXJzW2ldO1xuXHRcdHZhciB4ID0gY3ggKyBkaXJbMF07XG5cdFx0dmFyIHkgPSBjeSArIGRpclsxXTtcblx0XHRcblx0XHRpZiAoIXRoaXMuX3Bhc3NhYmxlQ2FsbGJhY2soeCwgeSkpIHsgY29udGludWU7IH1cblx0XHRyZXN1bHQucHVzaChbeCwgeV0pO1xuXHR9XG5cdFxuXHRyZXR1cm4gcmVzdWx0O1xufVxuLyoqXG4gKiBAY2xhc3MgU2ltcGxpZmllZCBEaWprc3RyYSdzIGFsZ29yaXRobTogYWxsIGVkZ2VzIGhhdmUgYSB2YWx1ZSBvZiAxXG4gKiBAYXVnbWVudHMgUk9ULlBhdGhcbiAqIEBzZWUgUk9ULlBhdGhcbiAqL1xuUk9ULlBhdGguRGlqa3N0cmEgPSBmdW5jdGlvbih0b1gsIHRvWSwgcGFzc2FibGVDYWxsYmFjaywgb3B0aW9ucykge1xuXHRST1QuUGF0aC5jYWxsKHRoaXMsIHRvWCwgdG9ZLCBwYXNzYWJsZUNhbGxiYWNrLCBvcHRpb25zKTtcblxuXHR0aGlzLl9jb21wdXRlZCA9IHt9O1xuXHR0aGlzLl90b2RvID0gW107XG5cdHRoaXMuX2FkZCh0b1gsIHRvWSwgbnVsbCk7XG59XG5ST1QuUGF0aC5EaWprc3RyYS5leHRlbmQoUk9ULlBhdGgpO1xuXG4vKipcbiAqIENvbXB1dGUgYSBwYXRoIGZyb20gYSBnaXZlbiBwb2ludFxuICogQHNlZSBST1QuUGF0aCNjb21wdXRlXG4gKi9cblJPVC5QYXRoLkRpamtzdHJhLnByb3RvdHlwZS5jb21wdXRlID0gZnVuY3Rpb24oZnJvbVgsIGZyb21ZLCBjYWxsYmFjaykge1xuXHR2YXIga2V5ID0gZnJvbVgrXCIsXCIrZnJvbVk7XG5cdGlmICghKGtleSBpbiB0aGlzLl9jb21wdXRlZCkpIHsgdGhpcy5fY29tcHV0ZShmcm9tWCwgZnJvbVkpOyB9XG5cdGlmICghKGtleSBpbiB0aGlzLl9jb21wdXRlZCkpIHsgcmV0dXJuOyB9XG5cdFxuXHR2YXIgaXRlbSA9IHRoaXMuX2NvbXB1dGVkW2tleV07XG5cdHdoaWxlIChpdGVtKSB7XG5cdFx0Y2FsbGJhY2soaXRlbS54LCBpdGVtLnkpO1xuXHRcdGl0ZW0gPSBpdGVtLnByZXY7XG5cdH1cbn1cblxuLyoqXG4gKiBDb21wdXRlIGEgbm9uLWNhY2hlZCB2YWx1ZVxuICovXG5ST1QuUGF0aC5EaWprc3RyYS5wcm90b3R5cGUuX2NvbXB1dGUgPSBmdW5jdGlvbihmcm9tWCwgZnJvbVkpIHtcblx0d2hpbGUgKHRoaXMuX3RvZG8ubGVuZ3RoKSB7XG5cdFx0dmFyIGl0ZW0gPSB0aGlzLl90b2RvLnNoaWZ0KCk7XG5cdFx0aWYgKGl0ZW0ueCA9PSBmcm9tWCAmJiBpdGVtLnkgPT0gZnJvbVkpIHsgcmV0dXJuOyB9XG5cdFx0XG5cdFx0dmFyIG5laWdoYm9ycyA9IHRoaXMuX2dldE5laWdoYm9ycyhpdGVtLngsIGl0ZW0ueSk7XG5cdFx0XG5cdFx0Zm9yICh2YXIgaT0wO2k8bmVpZ2hib3JzLmxlbmd0aDtpKyspIHtcblx0XHRcdHZhciBuZWlnaGJvciA9IG5laWdoYm9yc1tpXTtcblx0XHRcdHZhciB4ID0gbmVpZ2hib3JbMF07XG5cdFx0XHR2YXIgeSA9IG5laWdoYm9yWzFdO1xuXHRcdFx0dmFyIGlkID0geCtcIixcIit5O1xuXHRcdFx0aWYgKGlkIGluIHRoaXMuX2NvbXB1dGVkKSB7IGNvbnRpbnVlOyB9IC8qIGFscmVhZHkgZG9uZSAqL1x0XG5cdFx0XHR0aGlzLl9hZGQoeCwgeSwgaXRlbSk7IFxuXHRcdH1cblx0fVxufVxuXG5ST1QuUGF0aC5EaWprc3RyYS5wcm90b3R5cGUuX2FkZCA9IGZ1bmN0aW9uKHgsIHksIHByZXYpIHtcblx0dmFyIG9iaiA9IHtcblx0XHR4OiB4LFxuXHRcdHk6IHksXG5cdFx0cHJldjogcHJldlxuXHR9XG5cdHRoaXMuX2NvbXB1dGVkW3grXCIsXCIreV0gPSBvYmo7XG5cdHRoaXMuX3RvZG8ucHVzaChvYmopO1xufVxuLyoqXG4gKiBAY2xhc3MgU2ltcGxpZmllZCBBKiBhbGdvcml0aG06IGFsbCBlZGdlcyBoYXZlIGEgdmFsdWUgb2YgMVxuICogQGF1Z21lbnRzIFJPVC5QYXRoXG4gKiBAc2VlIFJPVC5QYXRoXG4gKi9cblJPVC5QYXRoLkFTdGFyID0gZnVuY3Rpb24odG9YLCB0b1ksIHBhc3NhYmxlQ2FsbGJhY2ssIG9wdGlvbnMpIHtcblx0Uk9ULlBhdGguY2FsbCh0aGlzLCB0b1gsIHRvWSwgcGFzc2FibGVDYWxsYmFjaywgb3B0aW9ucyk7XG5cblx0dGhpcy5fdG9kbyA9IFtdO1xuXHR0aGlzLl9kb25lID0ge307XG5cdHRoaXMuX2Zyb21YID0gbnVsbDtcblx0dGhpcy5fZnJvbVkgPSBudWxsO1xufVxuUk9ULlBhdGguQVN0YXIuZXh0ZW5kKFJPVC5QYXRoKTtcblxuLyoqXG4gKiBDb21wdXRlIGEgcGF0aCBmcm9tIGEgZ2l2ZW4gcG9pbnRcbiAqIEBzZWUgUk9ULlBhdGgjY29tcHV0ZVxuICovXG5ST1QuUGF0aC5BU3Rhci5wcm90b3R5cGUuY29tcHV0ZSA9IGZ1bmN0aW9uKGZyb21YLCBmcm9tWSwgY2FsbGJhY2spIHtcblx0dGhpcy5fdG9kbyA9IFtdO1xuXHR0aGlzLl9kb25lID0ge307XG5cdHRoaXMuX2Zyb21YID0gZnJvbVg7XG5cdHRoaXMuX2Zyb21ZID0gZnJvbVk7XG5cdHRoaXMuX2FkZCh0aGlzLl90b1gsIHRoaXMuX3RvWSwgbnVsbCk7XG5cblx0d2hpbGUgKHRoaXMuX3RvZG8ubGVuZ3RoKSB7XG5cdFx0dmFyIGl0ZW0gPSB0aGlzLl90b2RvLnNoaWZ0KCk7XG5cdFx0aWYgKGl0ZW0ueCA9PSBmcm9tWCAmJiBpdGVtLnkgPT0gZnJvbVkpIHsgYnJlYWs7IH1cblx0XHR2YXIgbmVpZ2hib3JzID0gdGhpcy5fZ2V0TmVpZ2hib3JzKGl0ZW0ueCwgaXRlbS55KTtcblxuXHRcdGZvciAodmFyIGk9MDtpPG5laWdoYm9ycy5sZW5ndGg7aSsrKSB7XG5cdFx0XHR2YXIgbmVpZ2hib3IgPSBuZWlnaGJvcnNbaV07XG5cdFx0XHR2YXIgeCA9IG5laWdoYm9yWzBdO1xuXHRcdFx0dmFyIHkgPSBuZWlnaGJvclsxXTtcblx0XHRcdHZhciBpZCA9IHgrXCIsXCIreTtcblx0XHRcdGlmIChpZCBpbiB0aGlzLl9kb25lKSB7IGNvbnRpbnVlOyB9XG5cdFx0XHR0aGlzLl9hZGQoeCwgeSwgaXRlbSk7IFxuXHRcdH1cblx0fVxuXHRcblx0dmFyIGl0ZW0gPSB0aGlzLl9kb25lW2Zyb21YK1wiLFwiK2Zyb21ZXTtcblx0aWYgKCFpdGVtKSB7IHJldHVybjsgfVxuXHRcblx0d2hpbGUgKGl0ZW0pIHtcblx0XHRjYWxsYmFjayhpdGVtLngsIGl0ZW0ueSk7XG5cdFx0aXRlbSA9IGl0ZW0ucHJldjtcblx0fVxufVxuXG5ST1QuUGF0aC5BU3Rhci5wcm90b3R5cGUuX2FkZCA9IGZ1bmN0aW9uKHgsIHksIHByZXYpIHtcblx0dmFyIG9iaiA9IHtcblx0XHR4OiB4LFxuXHRcdHk6IHksXG5cdFx0cHJldjogcHJldixcblx0XHRnOiAocHJldiA/IHByZXYuZysxIDogMCksXG5cdFx0aDogdGhpcy5fZGlzdGFuY2UoeCwgeSlcblx0fVxuXHR0aGlzLl9kb25lW3grXCIsXCIreV0gPSBvYmo7XG5cdFxuXHQvKiBpbnNlcnQgaW50byBwcmlvcml0eSBxdWV1ZSAqL1xuXHRcblx0dmFyIGYgPSBvYmouZyArIG9iai5oO1xuXHRmb3IgKHZhciBpPTA7aTx0aGlzLl90b2RvLmxlbmd0aDtpKyspIHtcblx0XHR2YXIgaXRlbSA9IHRoaXMuX3RvZG9baV07XG5cdFx0aWYgKGYgPCBpdGVtLmcgKyBpdGVtLmgpIHtcblx0XHRcdHRoaXMuX3RvZG8uc3BsaWNlKGksIDAsIG9iaik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHR9XG5cdFxuXHR0aGlzLl90b2RvLnB1c2gob2JqKTtcbn1cblxuUk9ULlBhdGguQVN0YXIucHJvdG90eXBlLl9kaXN0YW5jZSA9IGZ1bmN0aW9uKHgsIHkpIHtcblx0c3dpdGNoICh0aGlzLl9vcHRpb25zLnRvcG9sb2d5KSB7XG5cdFx0Y2FzZSA0OlxuXHRcdFx0cmV0dXJuIChNYXRoLmFicyh4LXRoaXMuX2Zyb21YKSArIE1hdGguYWJzKHktdGhpcy5fZnJvbVkpKTtcblx0XHRicmVhaztcblxuXHRcdGNhc2UgNjpcblx0XHRcdHZhciBkeCA9IE1hdGguYWJzKHggLSB0aGlzLl9mcm9tWCk7XG5cdFx0XHR2YXIgZHkgPSBNYXRoLmFicyh5IC0gdGhpcy5fZnJvbVkpO1xuXHRcdFx0cmV0dXJuIGR5ICsgTWF0aC5tYXgoMCwgKGR4LWR5KS8yKTtcblx0XHRicmVhaztcblxuXHRcdGNhc2UgODogXG5cdFx0XHRyZXR1cm4gTWF0aC5tYXgoTWF0aC5hYnMoeC10aGlzLl9mcm9tWCksIE1hdGguYWJzKHktdGhpcy5fZnJvbVkpKTtcblx0XHRicmVhaztcblx0fVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIFJPVDtcblxucmVxdWlyZSgnLi9saWIvcm90Jyk7XG5ST1QgPSB3aW5kb3cuUk9UO1xuXG5mdW5jdGlvbiBNYXAoY29uZmlnKXtcbiAgY29uZmlnLnByb2dyZXNzID0gY29uZmlnLnByb2dyZXNzIHx8IGZ1bmN0aW9uKCl7fTtcbiAgdmFyIGRhdGEgPSBbXSxcbiAgICAgIGhlaWdodCA9IGNvbmZpZy5oZWlnaHQsXG4gICAgICBkaWdnZXIgPSBuZXcgUk9ULk1hcC5EaWdnZXIoY29uZmlnLndpZHRoLCBoZWlnaHQsIHtcbiAgICAgICAgcm9vbUhlaWdodCA6IGNvbmZpZy5yb29tSGVpZ2h0LFxuICAgICAgICByb29tV2lkdGggOiBjb25maWcucm9vbVdpZHRoLFxuICAgICAgfSk7XG5cbiAgZGlnZ2VyLmNyZWF0ZShmdW5jdGlvbiBtYXBQcm9ncmVzcyh4LCB5LCB2YWx1ZSl7XG4gICAgZGF0YS5wdXNoKHZhbHVlKTtcbiAgICBjb25maWcucHJvZ3Jlc3MoeCwgeSwgdmFsdWUpO1xuICB9KTtcblxuICB2YXIgd2FsbHMsIGdyb3VuZHMsIHRpbGVzO1xuXG4gIHdhbGxzID0gW107XG4gIGdyb3VuZHMgPSBbXTtcbiAgdGlsZXMgPSBbXTtcbiAgY2hlY2tXYWxscyhkYXRhLCB0aWxlcywgZ3JvdW5kcywgd2FsbHMsIGhlaWdodCk7XG5cbiAgdGhpcy50aWxlcyA9IHRpbGVzO1xuICB0aGlzLmdyb3VuZHMgPSBncm91bmRzO1xuICB0aGlzLndhbGxzID0gd2FsbHM7XG4gIHRoaXMuZGF0YSA9IGRhdGE7XG4gIHRoaXMubWFwID0gZGlnZ2VyO1xufVxuXG5mdW5jdGlvbiBjaGVja1dhbGxzKGRhdGEsIHRpbGVzLCBncm91bmRzLCB3YWxscywgaGVpZ2h0KXtcbiAgdmFyIGksIGluZGV4LCB0eXBlLCB3YWxsO1xuXG4gIGZvcihpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspe1xuICAgIGluZGV4ID0gZGF0YVtpXTtcbiAgICB3YWxsID0ge1xuICAgICAgeCA6IE1hdGguZmxvb3IoaSAvIGhlaWdodCksXG4gICAgICB5IDogaSAlIGhlaWdodFxuICAgIH07XG4gICAgaWYoaW5kZXggPT09IDApe1xuICAgICAgd2FsbC50eXBlID0gJ2dyb3VuZCc7XG4gICAgICBncm91bmRzLnB1c2god2FsbCk7XG4gICAgICB0aWxlcy5wdXNoKG51Y2xlYXIuZW50aXR5KCd0aWxlJykuY3JlYXRlKHdhbGwpKTtcbiAgICB9IGVsc2UgaWYoaW5kZXggPT09IDEpe1xuICAgICAgaWYodGVzdFVwcGVyTGVmdChkYXRhLCBpLCBoZWlnaHQpKXtcbiAgICAgICAgd2FsbC50eXBlID0gJ3VwcGVyTGVmdCc7XG4gICAgICAgIHdhbGxzLnB1c2god2FsbCk7XG4gICAgICAgIHRpbGVzLnB1c2gobnVjbGVhci5lbnRpdHkoJ3RpbGUnKS5jcmVhdGUod2FsbCkpO1xuICAgICAgICBkYXRhW2ldID0gMjtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYodGVzdFVwcGVyUmlnaHQoZGF0YSwgaSwgaGVpZ2h0KSl7XG4gICAgICAgIHdhbGwudHlwZSA9ICd1cHBlclJpZ2h0JztcbiAgICAgICAgd2FsbHMucHVzaCh3YWxsKTtcbiAgICAgICAgdGlsZXMucHVzaChudWNsZWFyLmVudGl0eSgndGlsZScpLmNyZWF0ZSh3YWxsKSk7XG4gICAgICAgIGRhdGFbaV0gPSAyO1xuICAgICAgfVxuICAgICAgZWxzZSBpZih0ZXN0RG93bkxlZnQoZGF0YSwgaSwgaGVpZ2h0KSl7XG4gICAgICAgIHdhbGwudHlwZSA9ICdkb3duTGVmdCc7XG4gICAgICAgIHdhbGxzLnB1c2god2FsbCk7XG4gICAgICAgIHRpbGVzLnB1c2gobnVjbGVhci5lbnRpdHkoJ3RpbGUnKS5jcmVhdGUod2FsbCkpO1xuICAgICAgICBkYXRhW2ldID0gMjtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYodGVzdERvd25SaWdodChkYXRhLCBpLCBoZWlnaHQpKXtcbiAgICAgICAgd2FsbC50eXBlID0gJ2Rvd25SaWdodCc7XG4gICAgICAgIHdhbGxzLnB1c2god2FsbCk7XG4gICAgICAgIHRpbGVzLnB1c2gobnVjbGVhci5lbnRpdHkoJ3RpbGUnKS5jcmVhdGUod2FsbCkpO1xuICAgICAgICBkYXRhW2ldID0gMjtcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgIHR5cGUgPSB0ZXN0V2FsbChkYXRhLCBpLCBoZWlnaHQpO1xuICAgICAgICBpZih0eXBlKXtcbiAgICAgICAgICB3YWxsLnR5cGUgPSB0eXBlO1xuICAgICAgICAgIHdhbGxzLnB1c2god2FsbCk7XG4gICAgICAgICAgdGlsZXMucHVzaChudWNsZWFyLmVudGl0eSgndGlsZScpLmNyZWF0ZSh3YWxsKSk7XG4gICAgICAgICAgZGF0YVtpXSA9IDI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gdGVzdFdhbGwoZGF0YSwgaSwgaGVpZ2h0KXtcbiAgaWYoZGF0YVtpKzFdID09PSAwKXtcbiAgICByZXR1cm4gJ2xlZnQnO1xuICB9IGVsc2UgaWYoZGF0YVtpLTFdID09PSAwKXtcbiAgICByZXR1cm4gJ3JpZ2h0JztcbiAgfSBlbHNlIGlmKGRhdGFbaStoZWlnaHRdID09PSAwKXtcbiAgICByZXR1cm4gJ3VwJztcbiAgfSBlbHNlIGlmKGRhdGFbaS1oZWlnaHRdID09PSAwKXtcbiAgICByZXR1cm4gJ2Rvd24nO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiB0ZXN0VXBwZXJMZWZ0KGRhdGEsIGksIGhlaWdodCl7XG4gIHJldHVybihkYXRhW2krMV0gIT09IDAgJiYgZGF0YVtpLTFdID09PSAwICYmIGRhdGFbaStoZWlnaHRdICE9PSAwICYmIGRhdGFbaS1oZWlnaHRdID09PSAwKTtcbn1cblxuZnVuY3Rpb24gdGVzdFVwcGVyUmlnaHQoZGF0YSwgaSwgaGVpZ2h0KXtcbiAgcmV0dXJuKGRhdGFbaSsxXSA9PT0gMCAmJiBkYXRhW2ktMV0gIT09IDAgJiYgZGF0YVtpK2hlaWdodF0gIT09IDAgJiYgZGF0YVtpLWhlaWdodF0gPT09IDApO1xufVxuXG5mdW5jdGlvbiB0ZXN0RG93bkxlZnQoZGF0YSwgaSwgaGVpZ2h0KXtcbiAgcmV0dXJuKGRhdGFbaSsxXSAhPT0gMCAmJiBkYXRhW2ktMV0gPT09IDAgJiYgZGF0YVtpK2hlaWdodF0gPT09IDAgJiYgZGF0YVtpLWhlaWdodF0gIT09IDApO1xufVxuXG5mdW5jdGlvbiB0ZXN0RG93blJpZ2h0KGRhdGEsIGksIGhlaWdodCl7XG4gIHJldHVybihkYXRhW2krMV0gPT09IDAgJiYgZGF0YVtpLTFdICE9PSAwICYmIGRhdGFbaStoZWlnaHRdID09PSAwICYmIGRhdGFbaS1oZWlnaHRdICE9PSAwKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNYXA7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFRlbXBsYXRlKGlkLCBwb3NpdGlvbiwgd2lkdGgsIGhlaWdodCwgY29uZmlnKXtcbiAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gIHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgdGhpcy5pZCA9IGlkO1xuXG4gIHRoaXMuc2xvdHMgPSBnZW5lcmF0ZVNsb3RzKHRoaXMsIGNvbmZpZy5zbG90cyk7XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlU2xvdHMoc2VsZiwgc2xvdHMpe1xuICB2YXIgaSwgc2xvdCwgZGF0YSwgZW50aXRpZXM7XG5cbiAgZW50aXRpZXMgPSBbXTtcbiAgZm9yKGkgPSAwOyBpIDwgc2xvdHMubGVuZ3RoOyBpKyspe1xuICAgIHNsb3QgPSBzbG90c1tpXTtcbiAgICBkYXRhID0ge307XG4gICAgZGF0YS5wb3NpdGlvbiA9IHtcbiAgICAgIHggOiBzZWxmLnBvc2l0aW9uLnggKyBNYXRoLnJvdW5kKHNsb3QucG9zaXRpb24ueCpzZWxmLndpZHRoLzEwMCksXG4gICAgICB5IDogc2VsZi5wb3NpdGlvbi55ICsgTWF0aC5yb3VuZChzbG90LnBvc2l0aW9uLnkqc2VsZi5oZWlnaHQvMTAwKVxuICAgIH07XG4gICAgZGF0YS5idW5kbGUgPSBzZWxmLmNvbmZpZy5idW5kbGU7XG4gICAgZGF0YS50eXBlID0gc2xvdC50eXBlO1xuICAgIGRhdGEudGVtcGxhdGUgPSBzZWxmLmlkO1xuXG4gICAgZW50aXRpZXMucHVzaChudWNsZWFyLmVudGl0eSgnc2xvdCBmcm9tIHJvZ3VlbWFwJykuY3JlYXRlKGRhdGEpKTtcbiAgfVxuXG4gIHJldHVybiBlbnRpdGllcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUZW1wbGF0ZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gUG9zaXRpb25Db21wb25lbnQoeCwgeSkge1xuICB0aGlzLnggPSB4O1xuICB0aGlzLnkgPSB5O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvc2l0aW9uQ29tcG9uZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUG9zaXRpb25Db21wb25lbnQ7XG5cblBvc2l0aW9uQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3Bvc2l0aW9uLWNvbXBvbmVudCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG51Y2xlYXIubW9kdWxlKCdnYW1lLnRyYW5zZm9ybScsIFtdKVxuICAuY29tcG9uZW50KCdwb3NpdGlvbicsIGZ1bmN0aW9uIChlLCB4LCB5KSB7XG4gICAgcmV0dXJuIG5ldyBQb3NpdGlvbkNvbXBvbmVudCh4LCB5KTtcbiAgfSk7XG4iXX0=
;