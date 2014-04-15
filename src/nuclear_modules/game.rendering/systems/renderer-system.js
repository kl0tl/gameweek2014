'use strict';

nuclear.events.on('system:before:renderer from game.rendering', function () {
  var context;

  context = nuclear.system.context();

  context.dests[1].clearRect(0, 0, context.WIDTH, context.HEIGHT);
});

module.exports = function rendererSystem(e, components, context) {
  var sprite, position, dest, width, height, multiplicator;

  sprite = components.sprite;
  position = components.position;

  dest = context.dests[sprite.dest];

  width = sprite.width();
  height = sprite.height();
  multiplicator = (sprite.center) ? 0.5 : 1;

  dest.drawImage(sprite.buffer, position.x - width * multiplicator, position.y - height * multiplicator, width, height);
};
