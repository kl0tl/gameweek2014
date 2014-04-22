'use strict';

module.exports = function lanternEntity(lantern, options) {
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

  nuclear.component('position').add(lantern);

  constraint = nuclear.component('position-constraint').add(lantern, {
    constraint: options.owner,
    offsetX: OFFSETS.IDLE_FACE.x,
    offsetY: OFFSETS.IDLE_FACE.y
  });

  nuclear.component('atlas').add(lantern, 'hero');

  nuclear.component('sprite').add(lantern, {
    scale: 4,
    width: 120,
    height: 120,
    dest: 5,
    dynamic: true,
    animable: true/*,
    index: nuclear.component('sprite').of(options.owner).index + 1*/
  });

  console.log('new lantern entity', lantern);

  animations = nuclear.component('animations').add(lantern, 'idlefacelantern', [
    'idlebacklantern',
    'idlefacelantern',
    'idleleftlantern',
    'idlerightlantern',

    'walkbacklantern',
    'walkfacelantern',
    'walkleftlantern',
    'walkrightlantern'
  ]);

  nuclear.component('inputs').add(lantern, {
    FIRE: function onLanternFireHandler(e, input) {
      var currentAnimation;

      currentAnimation = nuclear.component('animations').of(options.owner).currentAnimation;

      if (input && currentAnimation.indexOf('sword') === -1) {
        nuclear.component('sprite').disable(lantern);
      } else {
        if (currentAnimation !== 'death') {
          nuclear.component('sprite').enable(lantern);
        }
      }
    },
    LEFT: function onLanternLeftHandler(e, input) {
      if (input && animations.currentAnimation !== 'walkfacelantern' && animations.currentAnimation !== 'walkbacklantern') {
        animations.play('walkleftlantern');
        constraint.offsetX = OFFSETS.WALK_LEFT.x;
        constraint.offsetY = OFFSETS.WALK_LEFT.y;
      } else if (animations.currentAnimation === 'walkleftlantern') {
        animations.play('idleleftlantern');
        constraint.offsetX = OFFSETS.IDLE_LEFT.x;
        constraint.offsetY = OFFSETS.IDLE_LEFT.y;
      }
    },
    RIGHT: function onLanternRightHandler(e, input) {
      if (input && animations.currentAnimation !== 'walkfacelantern' && animations.currentAnimation !== 'walkbacklantern') {
        animations.play('walkrightlantern');
        constraint.offsetX = OFFSETS.WALK_RIGHT.x;
        constraint.offsetY = OFFSETS.WALK_RIGHT.y;
      } else if (animations.currentAnimation === 'walkrightlantern') {
        animations.play('idlerightlantern');
        constraint.offsetX = OFFSETS.IDLE_RIGHT.x;
        constraint.offsetY = OFFSETS.IDLE_RIGHT.y;
      }
    },
    UP: function onLanternUpHandler(e, input) {
      if (input && animations.currentAnimation !== 'walkleftlantern' && animations.currentAnimation !== 'walkrightlantern') {
        animations.play('walkbacklantern');
        constraint.offsetX = OFFSETS.WALK_BACK.x;
        constraint.offsetY = OFFSETS.WALK_BACK.y;
      } else if (animations.currentAnimation === 'walkbacklantern') {
        animations.play('idlebacklantern');
        constraint.offsetX = OFFSETS.IDLE_BACK.x;
        constraint.offsetY = OFFSETS.IDLE_BACK.y;
      }
    },
    DOWN: function onLanternBottomHandler(e, input) {
      if (input && animations.currentAnimation !== 'walkleftlantern' && animations.currentAnimation !== 'walkrightlantern') {
        animations.play('walkfacelantern');
        constraint.offsetX = OFFSETS.WALK_FACE.x;
        constraint.offsetY = OFFSETS.WALK_FACE.y;
      } else if (animations.currentAnimation === 'walkfacelantern') {
        animations.play('idlefacelantern');
        constraint.offsetX = OFFSETS.IDLE_FACE.x;
        constraint.offsetY = OFFSETS.IDLE_FACE.y;
      }
    }
  });

  nuclear.system.context().mainLight = nuclear.entity('light').create({
    x: 250,
    y: 250,
    radius: 500,
    color: [222, 218, 152],
    intensity: 1,
    constraint: lantern,
    damping: 0.6,
    offsetX: -1,
    offsetY: -1,
    dynamic: true
  });

  nuclear.entity('light').create({
    x: 250,
    y: 250,
    radius: 500,
    color: [222, 218, 152],
    intensity: 1,
    constraint: lantern,
    damping: 0.65,
    offsetX: 1,
    offsetY: -1,
    dynamic: true
  });

  nuclear.entity('light').create({
    x: 250,
    y: 250,
    radius: 500,
    color: [222, 218, 152],
    intensity: 1,
    constraint: lantern,
    damping: 0.7,
    offsetX: 1,
    offsetY: 1,
    dynamic: true
  });

  nuclear.entity('light').create({
    x: 250,
    y: 250,
    radius: 500,
    color: [222, 218, 152],
    intensity: 1,
    constraint: lantern,
    damping: 0.75,
    offsetX: -1,
    offsetY: 1,
    dynamic: true
  });
};
