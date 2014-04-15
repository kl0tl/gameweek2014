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
  sprite = loader.get(path.join('atlases', atlas + '.atlas.json')).frames[frame];

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
