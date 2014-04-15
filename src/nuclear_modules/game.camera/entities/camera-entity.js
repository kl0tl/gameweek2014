'use strict';
function camera(entity, data){
  nuclear.component('camera').add(entity, data.target);
  nuclear.component('position').add(entity, data.x, data.y);
  nuclear.component('collider').add(entity, {
    offsetX : data.collider.offsetX,
    offsetY : data.collider.offsetY,
    width : data.collider.width,
    height : data.collider.height
  });
}

module.exports = camera;