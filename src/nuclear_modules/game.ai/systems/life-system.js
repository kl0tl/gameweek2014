'use strict';
var toDie = [];

nuclear.events.on('system:after_running', function () {
  var i, entity;

  for(i = 0; i < toDie.length; i++){
    entity = toDie[i];
    nuclear.entity.remove(entity);
  }

  toDie.length = 0;
});

module.exports = function lifeSystem(entity, components) {
  if(components.life.current <= 0){
    if (components.life.onDying(entity) !== false) {
      toDie.push(entity);
    }
  }
};
