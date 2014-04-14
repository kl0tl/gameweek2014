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
