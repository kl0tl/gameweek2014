'use strict';

var context;

context = nuclear.system.context();
context.buffers = [];
context.difficulties = [0.1, 0.3, 0.5];
context.difficulty = 2;
context.dests = [
  document.getElementById('main').getContext('2d'),

  document.getElementById('ambient-buffer').getContext('2d'),
  //document.getElementById('shadows-buffer').getContext('2d'),

  document.getElementById('top-buffer').getContext('2d'),
  document.getElementById('dynamic-buffer').getContext('2d'),
  document.getElementById('bottom-buffer').getContext('2d'),
];

for(var i = 1; i < context.dests.length; i++){
  context.dests[i].imageSmoothingEnabled = false;

  var entity = nuclear.entity.create();

  nuclear.component('position').add(entity, 0, 0);

  nuclear.component('sprite').add(entity, {
    buffer : context.dests[i].canvas,
    anchorX: 0,
    anchorY: 0,
    index : 100000-i,
    relativeCamera : true,
    viewPort : {
        w : 1280,
        h : 768
    }
  });

  context.buffers.push(entity);
}

context.WIDTH = 1280;
context.HEIGHT = 768;

context.colliders = nuclear.query([
  'collider from game.collisions',
  'position from game.transform'
].join(' '), {
  enabled : true
}).entities;

context.occluders = nuclear.query([
  'occluder from game.lighting',
  'position from game.transform'
].join(' '), {
  enabled: true
}).entities;
