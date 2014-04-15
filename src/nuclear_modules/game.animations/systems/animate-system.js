'use strict';

module.exports = function animateSystem(e, components, context, dt) {
  var atlas, sprite, animations, currentAnimation, frame, width, height;

  atlas = components.atlas;
  sprite = components.sprite;
  animations = components.animations;

  currentAnimation = animations.animations[animations.currentAnimation];

  animations.timeElapsedSinceLastFrame += dt * 16;//nuclear.system('animate')._scheduler.lag;

  if (animations.timeElapsedSinceLastFrame > currentAnimation.interval) {
    animations.currentFrame += 1;
    animations.timeElapsedSinceLastFrame -= currentAnimation.interval;

    if (animations.currentFrame > currentAnimation.frames.length - 1) {
      animations.currentFrame = 0;

      if (!animations.loop) {
        animations.currentAnimation = animations.defaultAnimation;
        currentAnimation = animations.animations[animations.currentAnimation];
      }
    }

    frame = atlas.sprites.frames[currentAnimation.frames[animations.currentFrame]].frame;

    width = sprite.width();
    height = sprite.height();

    sprite.context.clearRect(0, 0, width, height);
    sprite.context.drawImage(atlas.source, frame.x, frame.y, frame.w, frame.h, 0, 0, width, height);
  }
};
