'use strict';

var AnimationsComponent;

AnimationsComponent = require('./components/animations-component');

module.exports = nuclear.module('game.animations', ['game.rendering'])
  .component('animations', function (e, defaultAnimation, animations) {
    return new AnimationsComponent(e, defaultAnimation, animations);
  })
  .system('animate', [
    'sprite from game.rendering',
    'atlas from game.rendering',
    'animations from game.animations'
  ], require('./systems/animate-system'), {
    msPerUpdate: 16
  });
