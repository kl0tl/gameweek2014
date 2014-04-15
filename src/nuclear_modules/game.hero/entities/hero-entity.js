'use strict';

module.exports = function heroEntity(hero, x, y) {
  var animations, velocity;

  nuclear.component('position').add(hero, x, y);

  nuclear.component('atlas').add(hero, 'hero');

  nuclear.component('sprite').add(hero, {
    scale: 4,
    width: 64,
    height: 120
  });

  animations = nuclear.component('animations').add(hero, 'idleface', [
    'idleback',
    'idleface',
    'idleleft',
    'idleright',
    'walkback',
    'walkface',
    'walkleft',
    'walkright'
  ]);

  nuclear.component('collider').add(hero, {
    width: 64,
    height: 120
  });

  nuclear.component('rigidbody').add(hero, {
    mass: 1, friction: 0.75
  });

  velocity = nuclear.component('velocity').add(hero);

  nuclear.component('inputs').add(hero, {
    UP: function onUpHeroHandler(e, input) {
      velocity.y -= 5 * input;
      if (input) {
        if (animations.play('walkback')) {
          animations.clearQueue();
        }
      } else if (animations.currentAnimation === 'walkback') {
        animations.next();
      }
    },
    DOWN: function onDownHeroHandler(e, input) {
      velocity.y += 5 * input;
      if (input) {
        if (animations.play('walkface')) {
          animations.clearQueue();
        }
      } else if (animations.currentAnimation === 'walkface') {
        animations.next();
      }
    },
    LEFT: function onLeftHeroHandler(e, input) {
      velocity.x -= 5 * input;
      if (input) {
        if (animations.play('walkleft')) {
          animations.clearQueue();
        }
      } else if (animations.currentAnimation === 'walkleft') {
        animations.next();
      }
    },
    RIGHT: function onRightHeroHandler(e, input) {
      velocity.x += 5 * input;
      if (input) {
        if (animations.play('walkright')) {
          animations.clearQueue();
        }
      } else if (animations.currentAnimation === 'walkright') {
        animations.next();
      }
    }
  });
};
