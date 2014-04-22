'use strict';
var toAdd, toDelete;

toAdd = [];
toDelete = [];
// nuclear.events.on('system:after_running', function () {
//   var i, u, component, list, name;

//   for(i = 0; i < toAdd.length; i++){
//     component = toAdd[i];
//     list = component.list;

//     for(u = 0; u < list.length; u++){
//       name = list[u];

//       nuclear.component(name).enable(component.entity);
//     }
//   }

//   for(i = 0; i < toDelete.length; i++){
//     component = toDelete[i];
//     list = component.list;

//     for(u = 0; u < list.length; u++){
//       name = list[u];

//       nuclear.component(name).disable(component.entity);
//     }
//   }

//   toAdd.length = 0;
//   toDelete.length = 0;
// });

function CameraSensorComponent(entity, list) {
  this.list = list;
  this.entity = entity;
  var collider = nuclear.component('collider').of(entity);
  if(collider){
    collider.onCollisionEnter(enableComponents.bind(this));
    collider.onCollisionExit(disableComponents.bind(this));
  }
}


function enableComponents(other){
  /*jshint validthis:true*/
  if(nuclear.component('camera').in(other)){
    toAdd.push(this);
  }
}

function disableComponents(other){
  /*jshint validthis:true*/
  if(nuclear.component('camera').in(other)){
    toDelete.push(this);
  }
}

module.exports = CameraSensorComponent;
