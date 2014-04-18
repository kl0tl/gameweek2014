'use strict';

var context = nuclear.system.context();
var loader = require('assets-loader');
var path = require('path');
var playScenes = require('../../../scenes/scene-loader');
var contextDefining = require('../../../systems-context');
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
    height: 40,
    offsetY : 30,
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
    FIRE: function onFire(e, input) {
      var position, atkDirection, currentAtkAnimations, atkAnimation;

      if (!input) return;

      //if (true) return animations.play('death');

      currentAtkAnimations = ATTACK_ANIMATIONS[window.CURRENT_WEAPON];


      
      position = nuclear.component('position').of(e);

      nuclear.component('attack').of(e).to(position, {
        x : position.x + direction.x,
        y: position.y + direction.y
      });

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
    console.log(nuclear.component('life').add(hero, 100, options.life || 100, function(){
        //death anim
        setTimeout(function(){
          var currentWeapon = nuclear.component('currentWeapon').of(hero);
          var name = nuclear.component('name').of(hero);
          window.localStorage.setItem(name, JSON.stringify(currentWeapon));
          var i, u, x, entities, all;
          for(i in nuclear.registry.systems){
              entities = nuclear.registry.systems[i].entities;
              for(u = 0; u < entities.length; u++){
                  if(nuclear.component('collider').in(entities[u])){
                      all = nuclear.component.all(entities[u]);
                      for(x = 0; x < all.length; x++){
                          nuclear.component(all[x]).disable(entities[u]);
                      }
                      continue;
                  }
                  nuclear.entity.remove(entities[u]);
              }
          }
          for(i = 0; i < context.dests.length; i++){
              context.dests[i].clearRect(0, 0, 6000, 6000);
          }

          contextDefining();
          playScenes();
        }, animations.death.frames.length*animations.death.interval+2000);
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

    var weapon = nuclear.component('currentWeapon').add(hero, 'axe de la mor', context.loot('axe'));
    weapon.applyStats();

    console.log(attack);
};
