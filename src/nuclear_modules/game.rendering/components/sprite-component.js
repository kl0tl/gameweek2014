'use strict';

var path, loader;

path = require('path');
loader = require('assets-loader');

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
