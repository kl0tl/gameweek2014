'use strict';

module.exports = function heroEntity(hero, options) {
  var animations, velocity, direction, ATTACK_ANIMATIONS;

  window.CURRENT_WEAPON = 'AXE';

  ATTACK_ANIMATIONS = {
    AXE: {
      LEFT_DIRECTION: {
        animation: 'attackaxeleft', next: 'idleleft'
      },
      RIGHT_DIRECTION: {
        animation: 'attackaxeright', next: 'idleright'
      },
      BOTTOM_DIRECTION: {
        animation: 'attackaxeface', next: 'idleface'
      },
      TOP_DIRECTION: {
        animation: 'attackaxeback', next: 'idleback'
      },
      ONE_DIRECTION: 'lul'
    },

    BOW: {
      LEFT_DIRECTION: {
        animation: 'attackbowleft', next: 'idleleft'
      },
      RIGHT_DIRECTION: {
        animation: 'attackbowright', next: 'idleright'
      },
      BOTTOM_DIRECTION: {
        animation: 'attackbowface', next: 'idleface'
      },
      TOP_DIRECTION: {
        animation: 'attackbowback', next: 'idleback'
      },
      ONE_DIRECTION: 'lul'
    },

    SWORD: {
      LEFT_DIRECTION: {
        animation: 'attackswordleft', next: 'idleleft'
      },
      RIGHT_DIRECTION: {
        animation: 'attackswordright', next: 'idleright'
      },
      BOTTOM_DIRECTION: {
        animation: 'attackswordface', next: 'idleface'
      },
      TOP_DIRECTION: {
        animation: 'attackswordback', next: 'idleback'
      },
      ONE_DIRECTION: 'lul'
    }
  };

  nuclear.component('position').add(hero, options.x, options.y);

  nuclear.component('atlas').add(hero, 'hero');

  nuclear.component('sprite').add(hero, {
    scale: 4,
    width: 360,
    height: 276,
    dest : 3,
    dynamic : true,
    animable: true
  });

  console.log('new hero entity', hero);

  animations = nuclear.component('animations').add(hero, 'idleface', [
    'idleback',
    'idleface',
    'idleleft',
    'idleright',

    'walkback',
    'walkface',
    'walkleft',
    'walkright',

    'death',

    'attackaxeback',
    'attackaxeface',
    'attackaxeleft',
    'attackaxeright',

    'attackbowback',
    'attackbowface',
    'attackbowleft',
    'attackbowright',

    'attackswordback',
    'attackswordface',
    'attackswordleft',
    'attackswordright'
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

  direction = {
    x : 0,
    y : 1
  };

  nuclear.component('inputs').add(hero, {
    FIRE: function onFire(e, input) {
      var /*position, */atkDirection, currentAtkAnimations, atkAnimation;

      if (!input) return;

      //if (true) return animations.play('death');

      currentAtkAnimations = ATTACK_ANIMATIONS[window.CURRENT_WEAPON];


      /*
      position = nuclear.component('position').of(e);

      nuclear.component('attack').of(e).to(position, {
        x : position.x + direction.x,
        y: position.y + direction.y
      });*/

      if (direction.x === 0 && direction.y === -1) {
        atkDirection = 'TOP_DIRECTION';
      } else if (direction.x === 0 && direction.y === 1) {
        atkDirection = 'BOTTOM_DIRECTION';
      } else if (direction.x === -1 && direction.y === 0) {
        atkDirection = 'LEFT_DIRECTION';
      } else if (direction.x === 1 && direction.y === 0) {
        atkDirection = 'RIGHT_DIRECTION';
      }

      atkAnimation = currentAtkAnimations[atkDirection].animation;

      if (animations.currentAnimation !== atkAnimation) {
        animations.clearQueue();
        animations.play(atkAnimation);
        animations.defer(currentAtkAnimations[atkDirection].next);
      }
    },
    UP: function onUpHeroHandler(e, input) {
      velocity.y -= 5 * input;

      if (input && animations.currentAnimation !== 'walkleft' && animations.currentAnimation !== 'walkright') {
        animations.play('walkback');
        direction.x = 0;
        direction.y = -1;
      } else if (animations.currentAnimation === 'walkback') {
        animations.play('idleback');
      }
    },
    DOWN: function onDownHeroHandler(e, input) {
      velocity.y += 5 * input;

      if (input && animations.currentAnimation !== 'walkleft' && animations.currentAnimation !== 'walkright') {
        animations.play('walkface');
        direction.x = 0;
        direction.y = 1;
      } else if (animations.currentAnimation === 'walkface') {
        animations.play('idleface');
      }
    },
    LEFT: function onLeftHeroHandler(e, input) {
      velocity.x -= 5 * input;

      if (input && animations.currentAnimation !== 'walkface' && animations.currentAnimation !== 'walkback') {
        animations.play('walkleft');
        direction.x = -1;
        direction.y = 0;
      } else if (animations.currentAnimation === 'walkleft') {
        animations.play('idleleft');
      }
    },
    RIGHT: function onRightHeroHandler(e, input) {
      velocity.x += 5 * input;

      if (input && animations.currentAnimation !== 'walkface' && animations.currentAnimation !== 'walkback') {
        animations.play('walkright');
        direction.x = 1;
        direction.y = 0;
      } else if (animations.currentAnimation === 'walkright') {
        animations.play('idleright');
      }
    }
  });
};
