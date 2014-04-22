'use strict';

var RigidbodyComponent, PositionConstraintComponent, vec2;

RigidbodyComponent = require('./components/rigidbody-component');
PositionConstraintComponent = require('./components/position-constraint-component');
vec2 = require('./vec2');

module.exports = nuclear.module('game.transform', [])
  .component('position', function (e, x, y) {
    return vec2(x, y);
  })
  .component('velocity', function (e, x, y) {
    return vec2(x, y);
  })
  .component('rigidbody', function (e, options) {
    return new RigidbodyComponent(options);
  })
  .component('position-constraint', function (e, options) {
    return new PositionConstraintComponent(options);
  })
  .system('constraints', [
    'position from game.transform',
    'position-constraint from game.transform'
  ], require('./systems/constraints-system'))
  .system('kinematic', [
    'position from game.transform',
    'velocity from game.transform',
    'rigidbody from game.transform',
  ], require('./systems/kinematic-system'));
