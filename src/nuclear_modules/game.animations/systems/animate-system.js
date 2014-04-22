'use strict';

module.exports = function animateSystem(e, components, context, dt) {
  var atlas, sprite, animations, currentAnimation, data;

  atlas = components.atlas;
  sprite = components.sprite;
  animations = components.animations;

  currentAnimation = animations.animations[animations.currentAnimation];

  animations.timeElapsedSinceLastFrame += dt * 16;//nuclear.system('animate')._scheduler.lag;

  if (animations.timeElapsedSinceLastFrame > currentAnimation.interval) {
    animations.currentFrame += 1;
    animations.timeElapsedSinceLastFrame -= currentAnimation.interval;

    if (animations.currentFrame > currentAnimation.frames.length - 1) {
      if (currentAnimation.clamped) {
        animations.currentFrame -= 1;
      } else {
        animations.currentFrame = 0;

        if (!currentAnimation.loop) {
          if (animations._queue.length) {
            animations.currentAnimation = animations._queue.shift();
          } else {
            animations.currentAnimation = animations.defaultAnimation;
          }
          currentAnimation = animations.animations[animations.currentAnimation];
        }
      }
    }

    data = atlas.sprites.frames[currentAnimation.frames[animations.currentFrame]];

    sprite.redrawBuffer(atlas.source, data.frame.x, data.frame.y, data.frame.w, data.frame.h, data.spriteSourceSize.x + (currentAnimation.offsetX || 0), data.spriteSourceSize.y + (currentAnimation.offsetY || 0), data.sourceSize.w, data.sourceSize.h);
  }
};
