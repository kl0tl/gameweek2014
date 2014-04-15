'use strict';

function ColliderComponent(options) {
  this.offsetX = options.offsetX || 0;
  this.offsetY = options.offsetY || 0;

  this.halfWidth = options.width * 0.5;
  this.halfHeight = options.height * 0.5;
}

ColliderComponent.prototype.width = function colliderComponentWidth(value) {
  if (arguments.length === 0) {
    return this.halfWidth * 2;
  }

  this.halfWidth = value * 0.5;

  return this;
};

ColliderComponent.prototype.height = function colliderComponentHeight(value) {
  if (arguments.length === 0) {
    return this.halfHeight;
  }

  this.halfHeight = value * 0.5;

  return this;
};

module.exports = ColliderComponent;
