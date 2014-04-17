'use strict';

var LightComponent, DynamicLightComponent, OccluderComponent;

LightComponent = require('./components/light-component');
DynamicLightComponent = require('./components/dynamic-light-component');
OccluderComponent = require('./components/occluder-component');

module.exports = nuclear.module('game.lighting', [])
  .component('occluder', function (e, vertices) {
    return new OccluderComponent(e, vertices);
  })
  .component('light', function (e, options) {
    return new LightComponent(e, options);
  })
  .component('dynamic-light', function (e, options) {
    return new DynamicLightComponent(e, options);
  })
  .entity('light', require('./entities/light-entity'))
  .system('dynamic-shadows', [
    'dynamic-light from game.lighting',
    'position from game.transform'
  ], require('./systems/dynamic-shadows-system'))
  .system('lighting', [
    'light from game.lighting',
    'sprite from game.rendering'
  ], require('./systems/lighting-system'))
  .system('debug-occluders', [
    'occluder from game.lighting',
    'position from game.transform'
  ], require('./systems/debug-occluders-system'));
