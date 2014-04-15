'use strict';

var game, transform, rendering, animations;

game = require('game');

transform = require('./nuclear_modules/game.transform');
rendering = require('./nuclear_modules/game.rendering');
animations = require('./nuclear_modules/game.animations');
require('./nuclear_modules/game.inputs/');
require('./nuclear_modules/game.roguemap/');

nuclear.module('inputs').config('gamepad').FACE_1 = 'FIRE';
var entity = nuclear.entity.create();

nuclear.component('inputs').add(entity, {
  FIRE : function(entity, input){
    if(input !== 0){
      console.log(input);
    }
  },
  UP : function(entity, input){
    if(input !== 0){
      console.log(input);
    }
  }
});
var context = nuclear.system.context();

context.dests = [
  document.getElementById('bottom-buffer').getContext('2d'),
  document.getElementById('dynamic-buffer').getContext('2d'),
  document.getElementById('top-buffer').getContext('2d'),
  document.getElementById('main').getContext('2d'),
];

context.WIDTH = context.dests[2].canvas.width;
context.HEIGHT = context.dests[2].canvas.height;
game.loader.load([
    'atlases/prinny.atlas.png',
    'atlases/prinny.atlas.json',
    'animations/prinny/prinny@dancing.json',
    
    'atlases/stone.atlas.png',
    'atlases/stone.atlas.json'
  ])
  .error(function(error){
    throw error;
  })
  .done(function () {
    nuclear.import([transform, rendering, animations]);
    console.log('modules loaded!');
    nuclear.entity('map').create({
      mapData : {
        width : 40,
        height : 40,
        roomWidth : [3, 20],
        roomHeight : [3, 20]
      }
    });

    window.requestAnimationFrame(function loop() {
      window.requestAnimationFrame(loop);
      nuclear.system.run();
    });
  })
  .progress(console.log.bind(console, 'bundle progress'));
