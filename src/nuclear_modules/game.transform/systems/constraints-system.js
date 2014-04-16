'use strict';

module.exports = function constraintsSystem(e, components) {
  var target, constraint, position, targetX, targetY;

  constraint = components['position-constraint'];
  position = components.position;

  target = nuclear.component('position').of(constraint.target);

  targetX = target.x + constraint.offsetX;
  targetY = target.y + constraint.offsetY;

  position.x += (targetX - position.x) * (1 - constraint.damping);
  position.y += (targetY - position.y) * (1 - constraint.damping);
};
