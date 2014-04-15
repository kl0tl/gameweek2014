'use strict';

nuclear.events.on('system:before:renderer from game.rendering', function () {
  var context;

  context = nuclear.system.context();

  context.dests[0].clearRect(0, 0, context.WIDTH, context.HEIGHT);
});

module.exports = function rendererSystem(e, components, context) {
  var sprite, position, dest, width, height;

  sprite = components.sprite;
  position = components.position;

  dest = context.dests[sprite.dest];

  width = sprite.width();
  height = sprite.height();

  dest.drawImage(sprite.buffer, position.x - width * 0.5, position.y - height * 0.5);
};
