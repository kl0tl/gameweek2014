'use strict';

module.exports = function lootEntity(loot, options) {
  console.log('new loot entity', loot);
  var context = nuclear.system.context();

  nuclear.component('position').add(loot, options.x, options.y);

  nuclear.component('sprite').add(loot, {
    scale: 2,
    width: 60 * 4,
    height: 60 * 4,
    dest: 5,
    dynamic: true,
    frame : 0
  });

  var collider = nuclear.component('collider').add(loot, {
    width: 60,
    height: 60
  });

  collider.onCollisionEnter(function(other){
    if(other === context.hero){
        nuclear.component('life').of(loot).less(10);
        nuclear.component('currentWeapon').of(other).generateNew('axe');
    }
  });
  nuclear.component('rigidbody').add(loot, {
    mass: 1, friction: 0.75
  });

  nuclear.component('velocity').add(loot);
    console.log(nuclear.component('life').add(loot, options.life || 1, options.life || 1, function(){

    }, function(){

    }));

};
