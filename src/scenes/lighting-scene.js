'use strict';

var renderables, context;

context = nuclear.system.context();

renderables = nuclear.system('renderer').entities;

context.mainLight = nuclear.entity('light').create({
  x: 250,
  y: 250,
  radius: 500,
  color: [222, 218, 152],
  intensity: 1,
  constraint: renderables[renderables.length - 1],
  damping: 0.65
});
