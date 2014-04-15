'use strict';

var LightComponent, OccluderComponent;

LightComponent = require('./components/light-component');
OccluderComponent = require('./components/occluder-component');

module.exports = nuclear.module('game.lighting', [])
  .component('occluder', function (e, shape) {
    return new OccluderComponent(shape);
  })
  .component('light', function (e, options) {
    return new LightComponent(options);
  })
  .system('shadowing', [
    'occluder from game.lighting'
  ], require('./systems/shadowing-system'))
  .system('lighting', [
    'light from game.lighting',
    'position from game.transform'
  ], require('./systems/lighting-system'))
  .system('debug-occluders', [
    'occluder from game.lighting',
    'position from game.transform'
  ], require('./systems/debug-occluders-system'));
