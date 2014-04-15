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

  this.stretch = Boolean(options.stretch);

  if ('anchorX' in options) this.anchorX = options.anchorX;
  else this.anchorX = 0.5;

  if ('anchorY' in options) this.anchorY = options.anchorY;
  else this.anchorY = 0.5;

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

SpriteComponent.prototype.redrawBuffer = function spriteComponentRedrawBuffer(source, sx, sy, sw, sh) {
  var dw, dh, scaledSourceWidth, scaledSourceHeight;

  if (arguments.lengt === 1) {
    sx = 0;
    sy = 0;
    sw = source.width;
    sh = source.height;
  }

  dw = this.width();
  dh = this.height();

  scaledSourceWidth = sw * this.scale;
  scaledSourceHeight = sh * this.scale;

  this.context.clearRect(0, 0, dw, dh);

  if (this.stretch) {
    this.context.drawImage(source, sx, sy, sw, sh, 0, 0, dw, dh);
  } else {
    this.context.drawImage(source, sx, sy, sw, sh, 0.5 * (dw - scaledSourceWidth), 0.5 * (dh - scaledSourceHeight), scaledSourceWidth, scaledSourceHeight);
  }
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
