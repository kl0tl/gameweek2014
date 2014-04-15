'use strict';

var RigidbodyComponent, vec2;

RigidbodyComponent = require('./components/rigidbody-component');
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
  .system('kinematic', [
    'position from game.transform',
    'velocity from game.transform',
    'rigidbody from game.transform',
  ], require('./systems/kinematic-system'));
