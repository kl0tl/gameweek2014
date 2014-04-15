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
