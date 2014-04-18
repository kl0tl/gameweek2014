'use strict';

module.exports = function clothEntity(cloth, options) {
  var animations, constraint, OFFSETS;

  OFFSETS = {
    WALK_LEFT: {
      x: 0, y: 45,
    },
    IDLE_LEFT: {
      x: 0, y: 45,
    },
    WALK_RIGHT: {
      x: 0, y: 45
    },
    IDLE_RIGHT: {
      x: 0, y: 45
    },
    WALK_FACE: {
      x: 0, y: 55
    },
    IDLE_FACE: {
      x: 4, y: 55
    },
    WALK_BACK: {
      x: 0.5, y: 50
    },
    IDLE_BACK: {
      x: 0.5, y: 50,
    }
  };

  nuclear.component('position').add(cloth);

  constraint = nuclear.component('position-constraint').add(cloth, {
    constraint: options.owner,
    offsetX: OFFSETS.IDLE_FACE.x,
    offsetY: OFFSETS.IDLE_FACE.y
  });

  nuclear.component('atlas').add(cloth, 'hero');

  nuclear.component('sprite').add(cloth, {
    scale: 4,
    width: 120,
    height: 120,
    dest: 3,
    dynamic: true,
    animable: true,
    index: nuclear.component('sprite').of(options.owner).index + 1//*/
  });

  console.log('new cloth entity', cloth);

  animations = nuclear.component('animations').add(cloth, 'idlefacecloth', [
    'idlebackcloth',
    'idlefacecloth',
    'idleleftcloth',
    'idlerightcloth',

    'walkbackcloth',
    'walkfacecloth',
    'walkleftcloth',
    'walkrightcloth'
  ]);

  nuclear.component('inputs').add(cloth, {
    FIRE: function onLanternFireHandler(e, input) {
      var currentAnimation;

      if (input) {
        nuclear.component('sprite').disable(cloth);
      } else {
        currentAnimation = nuclear.component('animations').of(options.owner).currentAnimation;
        if (currentAnimation !== 'death' && currentAnimation.slice(0, 6) !== 'attack') {
          nuclear.component('sprite').enable(cloth);
        }
      }
    },
    LEFT: function onLanternLeftHandler(e, input) {
      if (input && animations.currentAnimation !== 'walkfacecloth' && animations.currentAnimation !== 'walkbackcloth') {
        animations.play('walkleftcloth');
        constraint.offsetX = OFFSETS.WALK_LEFT.x;
        constraint.offsetY = OFFSETS.WALK_LEFT.y;
      } else if (animations.currentAnimation === 'walkleftcloth') {
        animations.play('idleleftcloth');
        constraint.offsetX = OFFSETS.IDLE_LEFT.x;
        constraint.offsetY = OFFSETS.IDLE_LEFT.y;
      }
    },
    RIGHT: function onLanternRightHandler(e, input) {
      if (input && animations.currentAnimation !== 'walkfacecloth' && animations.currentAnimation !== 'walkbackcloth') {
        animations.play('walkrightcloth');
        constraint.offsetX = OFFSETS.WALK_RIGHT.x;
        constraint.offsetY = OFFSETS.WALK_RIGHT.y;
      } else if (animations.currentAnimation === 'walkrightcloth') {
        animations.play('idlerightcloth');
        constraint.offsetX = OFFSETS.IDLE_RIGHT.x;
        constraint.offsetY = OFFSETS.IDLE_RIGHT.y;
      }
    },
    UP: function onLanternUpHandler(e, input) {
      if (input && animations.currentAnimation !== 'walkleftcloth' && animations.currentAnimation !== 'walkrightcloth') {
        animations.play('walkbackcloth');
        constraint.offsetX = OFFSETS.WALK_BACK.x;
        constraint.offsetY = OFFSETS.WALK_BACK.y;
      } else if (animations.currentAnimation === 'walkbackcloth') {
        animations.play('idlebackcloth');
        constraint.offsetX = OFFSETS.IDLE_BACK.x;
        constraint.offsetY = OFFSETS.IDLE_BACK.y;
      }
    },
    DOWN: function onLanternBottomHandler(e, input) {
      if (input && animations.currentAnimation !== 'walkleftcloth' && animations.currentAnimation !== 'walkrightcloth') {
        animations.play('walkfacecloth');
        constraint.offsetX = OFFSETS.WALK_FACE.x;
        constraint.offsetY = OFFSETS.WALK_FACE.y;
      } else if (animations.currentAnimation === 'walkfacecloth') {
        animations.play('idlefacecloth');
        constraint.offsetX = OFFSETS.IDLE_FACE.x;
        constraint.offsetY = OFFSETS.IDLE_FACE.y;
      }
    }
  });
};
