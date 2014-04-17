'use strict';
function camera(entity, data){
  var width, height;

  width = data.collider.width;
  height = data.collider.height;

  nuclear.component('camera').add(entity, data.target);

  nuclear.component('position').add(entity, data.x, data.y);

  nuclear.component('collider').add(entity, {
    offsetX : data.collider.offsetX,
    offsetY : data.collider.offsetY,
    width : width,
    height : height
  });

  //*
  nuclear.component('occluder').add(entity, [
    0, 0,
    width - 0, 0,
    width - 0, height - 0,
    0, height - 0
  ]);//*/
}

module.exports = camera;
