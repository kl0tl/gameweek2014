'use strict';

var context = nuclear.system.context();
var loader = require('assets-loader');
var path = require('path');

module.exports = function heroEntity(hero, options) {
  var animations, velocity, direction, weapon, lantern, ATTACK_ANIMATIONS;

  ATTACK_ANIMATIONS = {
    axe: {
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

    bow: {
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

    sword: {
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

  animations = nuclear.component('animations').add(hero,
    'idleface', [
    'idleback',
    'idleface',
    'idleleft',
    'idleright',

    'walkback',
    'walkface',
    'walkleft',
    'walkright',

    'death',
    'deathcloth',

    'attackaxeback',
    'attackaxeface',
    'attackaxeleft',
    'attackaxeright',

    'attackaxebackcloth',
    'attackaxefacecloth',
    'attackaxeleftcloth',
    'attackaxerightcloth',

    'attackswordback',
    'attackswordface',
    'attackswordleft',
    'attackswordright',

    'attackswordbackcloth',
    'attackswordfacecloth',
    'attackswordleftcloth',
    'attackswordrightcloth',

    'attackbowback',
    'attackbowface',
    'attackbowleft',
    'attackbowright',

    'attackbowbackcloth',
    'attackbowfacecloth',
    'attackbowleftcloth',
    'attackbowrightcloth'
  ]);

  nuclear.component('collider').add(hero, {
    width: 64,
    height: 40,
    offsetY : 60,
    mask : 'hero'
  });

  nuclear.component('rigidbody').add(hero, {
    mass: 1, friction: 0.75
  });

  nuclear.component('name').add(hero, options.name);

  velocity = nuclear.component('velocity').add(hero);

  direction = {
    x : 0,
    y : 1
  };

  nuclear.component('inputs').add(hero, {
    DAMAGE: function onDamageHeroHandler(e, input) {
      if (input) nuclear.component('life').of(e).less(1);
    },

    DIE: function onDieHeroHandler(e, input) {
      if (input) nuclear.component('life').of(e).less(999999999999999999999999);
    },

    FIRE: function onFire(e, input) {
      var position, currentWeapon, currentAtkAnimations, atkDirection, atkAnimation;

      if (!input) return;

      position = nuclear.component('position').of(e);

      nuclear.component('attack').of(e).to(position, {
        x : position.x + direction.x,
        y: position.y + direction.y
      });

      currentWeapon = nuclear.component('currentWeapon').of(e).data.type;
      currentAtkAnimations = ATTACK_ANIMATIONS[currentWeapon];

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
      velocity.y -= 2.5 * input;

      if (input && animations.currentAnimation !== 'walkleft' && animations.currentAnimation !== 'walkright') {
        animations.play('walkback');
        direction.x = 0;
        direction.y = -1;
      } else if (animations.currentAnimation === 'walkback') {
        animations.play('idleback');
      }
    },
    DOWN: function onDownHeroHandler(e, input) {
      velocity.y += 2.5 * input;

      if (input && animations.currentAnimation !== 'walkleft' && animations.currentAnimation !== 'walkright') {
        animations.play('walkface');
        direction.x = 0;
        direction.y = 1;

      } else if (animations.currentAnimation === 'walkface') {
        animations.play('idleface');
      }
    },
    LEFT: function onLeftHeroHandler(e, input) {
      velocity.x -= 2.5 * input;

      if (input && animations.currentAnimation !== 'walkface' && animations.currentAnimation !== 'walkback') {
        animations.play('walkleft');
        direction.x = -1;
        direction.y = 0;
      } else if (animations.currentAnimation === 'walkleft') {
        animations.play('idleleft');
      }
    },
    RIGHT: function onRightHeroHandler(e, input) {
      velocity.x += 2.5 * input;

      if (input && animations.currentAnimation !== 'walkface' && animations.currentAnimation !== 'walkback') {
        animations.play('walkright');
        direction.x = 1;
        direction.y = 0;
      } else if (animations.currentAnimation === 'walkright') {
        animations.play('idleright');
      }
    }
  });

    var head = nuclear.entity.create();
    nuclear.component('position').add(head, 1150, 100);
    nuclear.component('sprite').add(head, {
      width: 76,
      height: 170,
      index : 1000000000000,
      dest : 0
    });

    var sprite = nuclear.component('sprite').of(head);

    sprite.context.drawImage(loader.get(path.join('gui', 'gothface1.png')), 0, 0, 76, 170);

    console.log(hero);

    console.log(options);

    console.log(nuclear.component('life').add(hero, 100, options.life || 100, function() {
        var deathAnimation;

        deathAnimation = animations.animations.death;

        nuclear.component('sprite').remove(weapon.entity);
        nuclear.entity.remove(lantern);

        animations.play('death');

        setTimeout(function(){
          var currentWeapon = nuclear.component('currentWeapon').of(hero);
          var name = nuclear.component('name').of(hero);

          window.localStorage.setItem(name, JSON.stringify(currentWeapon));

          nuclear.entity.remove(hero);
        }, deathAnimation.frames.length * deathAnimation.interval+1000);

        return false;
    }, function(){
        var life = nuclear.component('life').of(hero);
        var sprite = nuclear.component('sprite').of(head);
        if(life.current < 30){
          sprite.context.drawImage(loader.get(path.join('gui', 'gothface3.png')), 0, 0, 76, 170);
        }
        else if(life.current < 60){
          sprite.context.drawImage(loader.get(path.join('gui', 'gothface2.png')), 0, 0, 76, 170);
        }
    }));

    var attack = nuclear.component('attack').add(hero, {
      w : 50,
      h : 90,
      offset : 30,
      impulse : 10,
      damages : 10,
      cooldown : 10,
      mask : 'hero',
      onEnter : function(other){
        if(nuclear.component('states').of(other)){
          var position = nuclear.component('position').of(other);

          position = {
            x : position.x + Math.random()*30,
            y : position.y + Math.random()*30
          };

          nuclear.component('life').of(other).less(attack.damages);
          nuclear.entity('hit1').create(position);
        }
      },
      onExit : function(){}
    });

    weapon = nuclear.component('currentWeapon').add(hero, 'axe de la mor', context.loot('axe'));

    weapon.applyStats();

    console.log(attack);

    lantern = nuclear.entity('lantern').create({
      owner: hero
    });
};
