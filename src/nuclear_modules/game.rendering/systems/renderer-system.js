'use strict';

nuclear.events.on('system:before:renderer from game.rendering', function () {
  var context;

  context = nuclear.system.context();

  context.dests[1].clearRect(0, 0, context.WIDTH, context.HEIGHT);
});

module.exports = function rendererSystem(e, components, context) {
  var sprite, position, dest, width, height, offsetX, offsetY, camera;

  sprite = components.sprite;
  position = components.position;
  camera = context.cameraPosition;

  dest = context.dests[sprite.dest];

  width = sprite.width();
  height = sprite.height();

  offsetX = sprite.anchorX * width;
  offsetY = sprite.anchorY * height;

  if(camera){
    dest.drawImage(sprite.buffer, position.x - width * 0.5 - camera.x, position.y - height * 0.5- camera.y);
  }else{
    dest.drawImage(sprite.buffer, position.x - width * 0.5, position.y - height * 0.5);
  }
};
