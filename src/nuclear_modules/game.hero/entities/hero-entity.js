'use strict';

module.exports = function heroEntity(hero, data) {
    console.log(data);
  var animations, velocity;

  nuclear.component('position').add(hero, data.x, data.y);

  nuclear.component('atlas').add(hero, 'hero');

  nuclear.component('sprite').add(hero, {
    scale: 4,
    width: 64,
    height: 120,
    dest : 2,
    dynamic : true
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
    height: 60,
    offsetY : 20
  });

  nuclear.component('rigidbody').add(hero, {
    mass: 1, friction: 0.75
  });

  velocity = nuclear.component('velocity').add(hero);

  nuclear.component('inputs').add(hero, {
    UP: function onUpHeroHandler(e, input) {
      velocity.y -= 5 * input;
      if (input) animations.play('walkback');
      else if (animations.currentAnimation === 'walkback') animations.play('idleback');
    },
    DOWN: function onDownHeroHandler(e, input) {
      velocity.y += 5 * input;
      if (input) animations.play('walkface');
      else if (animations.currentAnimation === 'walkface') animations.play('idleface');
    },
    LEFT: function onLeftHeroHandler(e, input) {
      velocity.x -= 5 * input;
      if (input) animations.play('walkleft');
      else if (animations.currentAnimation === 'walkleft') animations.play('idleleft');
    },
    RIGHT: function onRightHeroHandler(e, input) {
      velocity.x += 5 * input;
      if (input) animations.play('walkright');
      else if (animations.currentAnimation === 'walkright') animations.play('idleright');
    }
  });
};
