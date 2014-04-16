'use strict';

nuclear.events.on('system:before:renderer from game.rendering', function () {
  var context;

  context = nuclear.system.context();

  context.dests[0].clearRect(0, 0, context.WIDTH, context.HEIGHT);
  context.dests[2].clearRect(0, 0, 6000, 6000);

  nuclear.system('renderer').sort(function(a, b){
    a = nuclear.component('sprite').of(a).index;
    b = nuclear.component('sprite').of(b).index;

    return a-b;
  });
});

module.exports = function rendererSystem(e, components, context) {
  var sprite, position, dest, width, height, offsetX, offsetY, camera, camX, camY;

  sprite = components.sprite;
  position = components.position;

  if(sprite.dynamic) sprite.index = position.y;
  
  if(sprite.relativeCamera){
    camera = context.cameraPosition || {};

      camX = camera.x || 0;
      camY = camera.y || 0;
  } else{
    camX = 0;
    camY = 0;
  }
  
  dest = context.dests[sprite.dest];

  width = sprite.width();
  height = sprite.height();
  offsetX = sprite.anchorX * width;
  offsetY = sprite.anchorY * height;

  dest.drawImage(sprite.buffer, position.x - camX - offsetX, position.y - camY - offsetY);
};
