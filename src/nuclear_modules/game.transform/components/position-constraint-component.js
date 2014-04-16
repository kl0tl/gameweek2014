'use strict';

function PositionConstraintComponent(options) {
  this.target = options.constraint;

  this.offsetX = options.offsetX || 0;
  this.offsetY = options.offsetY || 0;

  this.damping = options.damping || 0;
}

module.exports = PositionConstraintComponent;
