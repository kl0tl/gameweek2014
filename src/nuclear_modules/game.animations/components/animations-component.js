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

  this.currentAnimation = '';
  this.currentFrame = 0;

  this.timeElapsedSinceLastFrame = 0;

  this._queue = [];

  this.play(this.defaultAnimation);
}

AnimationsComponent.prototype.play = function animationComponentPlay(key) {
  var animation;

  if (!(key in this.animations)) {
    throw new Error('Unknown animation "' + key + '"');
  }

  if (this.currentAnimation !== key) {
    animation = this.animations[key];

    this.currentAnimation = key;
    this.currentFrame = 0;

    this.timeElapsedSinceLastFrame = animation.interval;

    if (animation.next) {
      this._queue.push.apply(this._queue, animation.next);
    }
  }

  return this;
};

AnimationsComponent.prototype.defer = function animationComponentDefer(key) {
  this._queue.push(key);

  return this;
};

AnimationsComponent.prototype.next = function animationComponentNext() {
  return this.play(this._queue.shift());
};

module.exports = AnimationsComponent;
