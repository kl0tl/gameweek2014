'use strict';

module.exports = function rendererSystem(e, components, context) {
  var sprite, position, dest, width, height;

  sprite = components.sprite;
  position = components.position;

  dest = context.dests[sprite.dest];

  width = sprite.width();
  height = sprite.height();

  dest.drawImage(sprite.buffer, position.x - width * 0.5, position.y - height * 0.5, width, height);
};
