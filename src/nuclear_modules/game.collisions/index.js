'use strict';

var ColliderComponent;

ColliderComponent = require('./components/collider-component');

module.exports = nuclear.module('game.collisions', ['game.transform'])
  .component('collider', function (e, options) {
    return new ColliderComponent(options);
  })
  .system('collisions', [
    'collider from game.collisions',
    'position from game.transform',
    'velocity from game.transform',
    'rigidbody from game.transform'
  ], require('./systems/collisions-system'))
  .system('debug-colliders', [
    'collider from game.collisions',
    'position from game.transform'
  ], require('./systems/debug-colliders-system'));
