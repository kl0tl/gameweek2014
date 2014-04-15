'use strict';

module.exports = function cameraFollow(entity, components){
  var center, otherPosition;

  center = components.camera.center();
  otherPosition = nuclear.component('position from game.transform').of(components.camera.target);
  if(otherPosition){
    components.position.x = otherPosition.x;
    components.position.y = otherPosition.y;
  }
};