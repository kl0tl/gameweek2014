'use strict';

module.exports = function axeEntity(axe, options) {
  var animations, constraint, OFFSETS;

  OFFSETS = {
    WALK_LEFT: {
      x: 0, y: 35,
    },
    IDLE_LEFT: {
      x: 0, y: 35,
    },
    WALK_RIGHT: {
      x: 0, y: 35
    },
    IDLE_RIGHT: {
      x: 0, y: 35
    },
    WALK_FACE: {
      x: -2, y: 35
    },
    IDLE_FACE: {
      x: -2, y: 35
    },
    WALK_BACK: {
      x: 0.5, y: 40
    },
    IDLE_BACK: {
      x: 0.5, y: 40,
    }
  };

  nuclear.component('position').add(axe);

  constraint = nuclear.component('position-constraint').add(axe, {
    constraint: options.owner,
    offsetX: OFFSETS.IDLE_FACE.x,
    offsetY: OFFSETS.IDLE_FACE.y
  });

  nuclear.component('atlas').add(axe, 'hero');

  nuclear.component('sprite').add(axe, {
    scale: 4,
    width: 120,
    height: 120,
    dest: 5,
    dynamic: true,
    animable: true/*,
    index: nuclear.component('sprite').of(options.owner).index + 1*/
  });

  console.log('new axe entity', axe);

  animations = nuclear.component('animations').add(axe, 'idlefaceaxe', [
    'idlebackaxe',
    'idlefaceaxe',
    'idleleftaxe',
    'idlerightaxe',

    'walkbackaxe',
    'walkfaceaxe',
    'walkleftaxe',
    'walkrightaxe'
  ]);

  nuclear.component('inputs').add(axe, {
    FIRE: function onLanternFireHandler(e, input) {
      if (input) nuclear.component('sprite').disable(axe);
      else if (nuclear.component('animations').of(options.owner).currentAnimation !== 'death') nuclear.component('sprite').enable(axe);
    },
    LEFT: function onLanternLeftHandler(e, input) {
      if (input) {
        animations.play('walkleftaxe');
        constraint.offsetX = OFFSETS.WALK_LEFT.x;
        constraint.offsetY = OFFSETS.WALK_LEFT.y;
      } else if (animations.currentAnimation === 'walkleftaxe') {
        animations.play('idleleftaxe');
        constraint.offsetX = OFFSETS.IDLE_LEFT.x;
        constraint.offsetY = OFFSETS.IDLE_LEFT.y;
      }
    },
    RIGHT: function onLanternRightHandler(e, input) {
      if (input) {
        animations.play('walkrightaxe');
        constraint.offsetX = OFFSETS.WALK_RIGHT.x;
        constraint.offsetY = OFFSETS.WALK_RIGHT.y;
      } else if (animations.currentAnimation === 'walkrightaxe') {
        animations.play('idlerightaxe');
        constraint.offsetX = OFFSETS.IDLE_RIGHT.x;
        constraint.offsetY = OFFSETS.IDLE_RIGHT.y;
      }
    },
    UP: function onLanternUpHandler(e, input) {
      if (input) {
        animations.play('walkbackaxe');
        constraint.offsetX = OFFSETS.WALK_BACK.x;
        constraint.offsetY = OFFSETS.WALK_BACK.y;
      } else if (animations.currentAnimation === 'walkbackaxe') {
        animations.play('idlebackaxe');
        constraint.offsetX = OFFSETS.IDLE_BACK.x;
        constraint.offsetY = OFFSETS.IDLE_BACK.y;
      }
    },
    DOWN: function onLanternBottomHandler(e, input) {
      if (input) {
        animations.play('walkfaceaxe');
        constraint.offsetX = OFFSETS.WALK_FACE.x;
        constraint.offsetY = OFFSETS.WALK_FACE.y;
      } else if (animations.currentAnimation === 'walkfaceaxe') {
        animations.play('idlefaceaxe');
        constraint.offsetX = OFFSETS.IDLE_FACE.x;
        constraint.offsetY = OFFSETS.IDLE_FACE.y;
      }
    }
  });
};
