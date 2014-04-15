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

game.loader.load([
    'atlases/prinny.atlas.png',
    'atlases/prinny.atlas.json',
    'animations/prinny/prinny@dancing.json',
    
    'atlases/ground1.atlas.png',
    'atlases/ground1.atlas.json'
  ])
  .done(function () {
    var context;
    'animations/prinny/prinny@dancing.json'
  ])
  .done(function () {
    var prinny, context;

    nuclear.import([transform, rendering, animations]);

    console.log('modules loaded!');
    // var map = nuclear.entity('map').create({
    //   mapData : {
    //     width : 200,
    //     height : 200,
    //     roomWidth : [3, 20],
    //     roomHeight : [3, 20]
    //   }
    // });

    context = nuclear.system.context();

    context.dests = [
      document.getElementById('screen').getContext('2d')
    ];

    context.WIDTH = context.dests[0].canvas.width;
    context.HEIGHT = context.dests[0].canvas.height;

    window.requestAnimationFrame(function loop() {
      window.requestAnimationFrame(loop);
      nuclear.system.run();
    });
  })
  .progress(console.log.bind(console, 'bundle progress'));
