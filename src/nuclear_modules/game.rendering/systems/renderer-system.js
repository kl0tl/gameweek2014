'use strict';

nuclear.events.on('system:before:renderer from game.rendering', function onBeforeRendererSystem() {
  var context, main2dContext, dynamics2dContext, lights2dContext, ambient2dContext;

  context = nuclear.system.context();

  main2dContext = context.dests[0];
  lights2dContext = context.dests[1];
  ambient2dContext = context.dests[2];
  dynamics2dContext = context.dests[4];

  main2dContext.clearRect(0, 0, context.WIDTH, context.HEIGHT);

  lights2dContext.clearRect(0, 0, lights2dContext.canvas.width, lights2dContext.canvas.height);
  lights2dContext.clearRect(0, 0, lights2dContext.canvas.width, lights2dContext.canvas.height);

  ambient2dContext.save();

  ambient2dContext.fillStyle = '#0A0D0B';
  ambient2dContext.globalAlpha = 0.95;

  ambient2dContext.clearRect(0, 0, ambient2dContext.canvas.width, ambient2dContext.canvas.height);
  ambient2dContext.fillRect(0, 0, ambient2dContext.canvas.width, ambient2dContext.canvas.height);

  ambient2dContext.restore();

  dynamics2dContext.clearRect(0, 0, dynamics2dContext.canvas.width, dynamics2dContext.canvas.height);
});

module.exports = function rendererSystem(e, components, context) {
  var sprite, position, dest, width, height, offsetX, offsetY, camera, camX, camY;

  sprite = components.sprite;
  position = components.position;

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

  dest.save();

  if (sprite.blending) {
    dest.globalCompositeOperation = sprite.blending;
  }

  dest.globalAlpha = sprite.alpha;

  dest.drawImage(sprite.buffer, position.x - camX - offsetX, position.y - camY - offsetY);

  dest.restore();
};
