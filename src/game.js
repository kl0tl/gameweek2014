'use strict';
var nuclear, console;

console = window.console;
nuclear = window.nuclear;

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

function loop(){
  nuclear.system.run();
  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);