'use strict';

function CameraSensorComponent(entity, list) {
  this.list = list;
  this.entity = entity;
  var collider = nuclear.component('collider').of(entity);
  if(collider){
    collider.onCollisionEnter(disableComponents.bind(this));
    collider.onCollisionExit(enableComponents.bind(this));
  }
}


function enableComponents(other){
  console.log(other);
  var i, component;

  if(nuclear.component('camera').in(other)){
    /*jshint validthis:true*/
    for(i = 0; i < this.list.length; i++){
      component = this.list[i];

      nuclear.component(component).enable(this.entity);
    }
  }
}

function disableComponents(other){
  var i, component;

  if(nuclear.component('camera').in(other)){
    /*jshint validthis:true*/
    for(i = 0; i < this.list.length; i++){
      component = this.list[i];

      nuclear.component(component).disable(this.entity);
    }
  }
}

module.exports = CameraSensorComponent;
