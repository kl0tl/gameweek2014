'use strict';

var AtlasComponent, SpriteComponent;

AtlasComponent = require('./components/atlas-component');
SpriteComponent = require('./components/sprite-component');

nuclear.events.on('system:before:renderer from game.rendering', function () {
  // var context;

  // context = nuclear.system.context();

  // context.dests[0].clearRect(0, 0, context.WIDTH, context.HEIGHT);
});

module.exports = nuclear.module('game.rendering', ['game.transform'])
  .component('atlas', function (e, key) {
    return new AtlasComponent(key);
  })
  .component('sprite', function (e, width, height, dest) {
    return new SpriteComponent(width, height, dest);
  })
  .system('renderer', [
    'sprite from game.rendering',
    'position from game.transform'
  ], require('./systems/renderer-system'));
