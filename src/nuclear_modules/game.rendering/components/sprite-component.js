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
