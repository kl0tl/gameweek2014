'use strict';
(function(nuclear, console){
  require('./nuclear_modules/game.inputs/');
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
})(window.nuclear, window.console);