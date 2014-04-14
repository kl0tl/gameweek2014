'use strict';

module.exports = function animateSystem(e, components, context, dt) {
  var atlas, sprite, animations, currentAnimation, frame;

  atlas = components.atlas;
  sprite = components.sprite;
  animations = components.animations;

  currentAnimation = animations.animations[animations.currentAnimation];

  animations.timeElapsedSinceLastFrame += dt;

  if (animations.timeElapsedSinceLastFrame > currentAnimation.interval) {
    animations.currentFrame += 1;
    animations.timeElapsedSinceLastFrame -= currentAnimation.interval;

    if (animations.currentFrame > currentAnimation.frames.length) {
      animations.currentFrame = 0;

      if (!animations.loop) {
        animations.currentAnimation = currentAnimation = animations.defaultAnimation;
      }
    }

    frame = atlas.sprites[currentAnimation.frames[animations.currentFrame]].frame;

    sprite.context.drawImage(atlas.source, frame.x, frame.y, frame.w, frame.h, 0, 0, sprite.width(), sprite.height());
  }
};
