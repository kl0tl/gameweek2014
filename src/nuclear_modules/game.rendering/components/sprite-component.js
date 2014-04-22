'use strict';

var path, loader;

path = require('path');
loader = require('assets-loader');

function SpriteComponent(e, options) {
  var atlas, source, scaledWidth, scaledHeight;

  atlas = nuclear.component('atlas').of(e);

  if(options.buffer){
    this.buffer = options.buffer;
  } else{
    this.buffer = document.createElement('canvas');
    this.buffer.width = options.width;
    this.buffer.height = options.height;
  }

  this.filter = options.filter || null;

  this.viewPort = options.viewPort;
  this.context = this.buffer.getContext('2d');

  this.index = options.index || 0;

  this.dynamic = Boolean(options.dynamic);

  this.animable = Boolean(options.animable);

  this.relativeCamera = Boolean(options.relativeCamera);

  this.dest = options.dest || 0;

  this.scale = options.scale || 1;

  this.stretch = Boolean(options.stretch);

  if ('anchorX' in options) this.anchorX = options.anchorX;
  else this.anchorX = 0.5;

  if ('anchorY' in options) this.anchorY = options.anchorY;
  else this.anchorY = 0.5;

  if ('alpha' in options) this.alpha = options.alpha;
  else this.alpha = 1;

  this.blending = options.blending || '';

  this.context.imageSmoothingEnabled = false;

  if (atlas) {
    source = loader.get(path.join('atlases', atlas.name + '.atlas.json')).frames[options.frame || 0];

    scaledWidth = source.frame.w * this.scale;
    scaledHeight = source.frame.h * this.scale;

    this.redrawBuffer(atlas.source, source.frame.x, source.frame.y, source.frame.w, source.frame.h);
  }
}

SpriteComponent.prototype.redrawBuffer = function spriteComponentRedrawBuffer(source, sx, sy, sw, sh, dx, dy, fw, fh) {
  var dw, dh, scaledSourceWidth, scaledSourceHeight;

  if (this.animable) {
    return this.redrawAnimableBuffer(source, sx, sy, sw, sh, dx, dy, fw, fh);
  }

  if (arguments.length === 1) {
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

  if (this.filter) this.applyFilter(this.filter);
};

SpriteComponent.prototype.redrawAnimableBuffer = function spriteComponentRedrawAnimableBuffer(source, sx, sy, sw, sh, dx, dy, fw, fh) {
  var width, height;

  width = this.width();
  height = this.height();

  if (arguments.length < 6) {
    if (arguments.length < 2) {
      sx = 0;
      sy = 0;
      sw = source.width;
      sh = source.height;
    }

    dx = 0;
    dy = 0;
    fw = sw;
    fh = sy;
  }

  this.context.clearRect(0, 0, width, height);

  this.context.drawImage(source, sx, sy, sw, sh, (dx + 0.5 * (width / this.scale - fw)) * this.scale, (dy + 0.75 * (height / this.scale - fh)) * this.scale, sw * this.scale, sh * this.scale);

  if (this.filter) this.applyFilter(this.filter);
};

SpriteComponent.prototype.width = function spriteWidth(value) {
  if (arguments.length === 0) {
    return this.buffer.width;
  }

  this.buffer.width = value;
  this.context.imageSmoothingEnabled = false;
  return this;
};

SpriteComponent.prototype.applyFilter = function spriteComponentApplyFilter(filter) {
  this.context.save();

  this.context.globalCompositeOperation = 'source-atop';

  this.context.drawImage(filter, 0, 0, this.width(), this.height());

  this.context.restore();
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
