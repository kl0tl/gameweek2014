'use strict';

var context;

context = nuclear.system.context();

context.dests = [
  document.getElementById('bottom-buffer').getContext('2d'),
  document.getElementById('dynamic-buffer').getContext('2d'),
  document.getElementById('top-buffer').getContext('2d'),
  document.getElementById('main').getContext('2d'),
];

context.WIDTH = context.dests[2].canvas.width;
context.HEIGHT = context.dests[2].canvas.height;

context.colliders = nuclear.query([
  'collider from game.collisions',
  'position from game.transform'
].join(' ')).entities;
