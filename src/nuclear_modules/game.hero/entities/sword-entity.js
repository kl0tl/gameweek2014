'use strict';

module.exports = function swordEntity(sword, options) {
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

  nuclear.component('position').add(sword);

  constraint = nuclear.component('position-constraint').add(sword, {
    constraint: options.owner,
    offsetX: OFFSETS.IDLE_FACE.x,
    offsetY: OFFSETS.IDLE_FACE.y
  });

  nuclear.component('atlas').add(sword, 'hero');

  nuclear.component('sprite').add(sword, {
    scale: 4,
    width: 120,
    height: 120,
    dest: 5,
    dynamic: true,
    animable: true/*,
    index: nuclear.component('sprite').of(options.owner).index + 1*/
  });

  console.log('new sword entity', sword);

  animations = nuclear.component('animations').add(sword, 'idlefacesword', [
    'idlebacksword',
    'idlefacesword',
    'idleleftsword',
    'idlerightsword',

    'walkbacksword',
    'walkfacesword',
    'walkleftsword',
    'walkrightsword'
  ]);

  nuclear.component('inputs').add(sword, {
    FIRE: function onLanternFireHandler(e, input) {
      var currentAnimation;

      if (input) {
        nuclear.component('sprite').disable(sword);
      } else {
        currentAnimation = nuclear.component('animations').of(options.owner).currentAnimation;
        if (currentAnimation !== 'death' && currentAnimation.slice(0, 6) !== 'attack') {
          nuclear.component('sprite').enable(sword);
        }
      }
    },
    LEFT: function onLanternLeftHandler(e, input) {
      if (input && animations.currentAnimation !== 'walkfacesword' && animations.currentAnimation !== 'walkbacksword') {
        animations.play('walkleftsword');
        constraint.offsetX = OFFSETS.WALK_LEFT.x;
        constraint.offsetY = OFFSETS.WALK_LEFT.y;
      } else if (animations.currentAnimation === 'walkleftsword') {
        animations.play('idleleftsword');
        constraint.offsetX = OFFSETS.IDLE_LEFT.x;
        constraint.offsetY = OFFSETS.IDLE_LEFT.y;
      }
    },
    RIGHT: function onLanternRightHandler(e, input) {
      if (input && animations.currentAnimation !== 'walkfacesword' && animations.currentAnimation !== 'walkbacksword') {
        animations.play('walkrightsword');
        constraint.offsetX = OFFSETS.WALK_RIGHT.x;
        constraint.offsetY = OFFSETS.WALK_RIGHT.y;
      } else if (animations.currentAnimation === 'walkrightsword') {
        animations.play('idlerightsword');
        constraint.offsetX = OFFSETS.IDLE_RIGHT.x;
        constraint.offsetY = OFFSETS.IDLE_RIGHT.y;
      }
    },
    UP: function onLanternUpHandler(e, input) {
      if (input && animations.currentAnimation !== 'walkleftsword' && animations.currentAnimation !== 'walkrightsword') {
        animations.play('walkbacksword');
        constraint.offsetX = OFFSETS.WALK_BACK.x;
        constraint.offsetY = OFFSETS.WALK_BACK.y;
      } else if (animations.currentAnimation === 'walkbacksword') {
        animations.play('idlebacksword');
        constraint.offsetX = OFFSETS.IDLE_BACK.x;
        constraint.offsetY = OFFSETS.IDLE_BACK.y;
      }
    },
    DOWN: function onLanternBottomHandler(e, input) {
      if (input && animations.currentAnimation !== 'walkleftsword' && animations.currentAnimation !== 'walkrightsword') {
        animations.play('walkfacesword');
        constraint.offsetX = OFFSETS.WALK_FACE.x;
        constraint.offsetY = OFFSETS.WALK_FACE.y;
      } else if (animations.currentAnimation === 'walkfacesword') {
        animations.play('idlefacesword');
        constraint.offsetX = OFFSETS.IDLE_FACE.x;
        constraint.offsetY = OFFSETS.IDLE_FACE.y;
      }
    }
  });
};
