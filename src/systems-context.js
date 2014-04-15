'use strict';

var context;

context = nuclear.system.context();

context.dests = [
  document.getElementById('screen').getContext('2d')
];

context.WIDTH = context.dests[0].canvas.width;
context.HEIGHT = context.dests[0].canvas.height;

context.lights = nuclear.system('lighting').query.entities;

context.colliders = nuclear.query([
  'collider from game.collisions',
  'position from game.transform',
  'rigidbody from game.transform'
].join(' ')).entities;
