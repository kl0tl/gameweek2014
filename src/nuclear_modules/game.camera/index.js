'use strict';

var CameraComponent, CameraSensorComponent, camera;

CameraComponent = require('./components/camera-component');
CameraSensorComponent = require('./components/camera-sensor-component');
camera = require('./entities/camera-entity');

module.exports = nuclear.module('game.camera', ['game.transform', 'game.collisions'])
  .entity('camera', camera)
  .component('camera', function (e, target) {
    return new CameraComponent(e, target);
  })
  .component('camera-sensor', function (e, list) {
    return new CameraSensorComponent(e, list);
  })
  .system('follow', [
    'camera from game.camera',
    'position from game.transform',
    'collider from game.collisions',
  ], require('./systems/follow-system'));