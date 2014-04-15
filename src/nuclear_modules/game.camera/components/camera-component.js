'use strict';

function CameraComponent(entity, target) {
  this.entity = entity;
  this.target = target;
  this._center = {};
}

CameraComponent.prototype.follow = function(target){
  this.target = target;
};

CameraComponent.prototype.center = function(){
  var position, collider;

  position = nuclear.component('position from game.transform').of(this.entity);
  collider = nuclear.component('collider from game.collisions').of(this.entity);

  if(position && collider){
    this._center.x = position.x + collider.halfWidth;
    this._center.y = position.y + collider.halfHeight;

    return this._center;
  }
};

module.exports = CameraComponent;
