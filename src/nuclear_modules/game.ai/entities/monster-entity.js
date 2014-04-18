'use strict';

module.exports = function monsterEntity(monster, options) {
  var animations, velocity, context;

  context = nuclear.system.context();
  nuclear.component('position').add(monster, options.x, options.y);

  nuclear.component('atlas').add(monster, 'hero');

  nuclear.component('sprite').add(monster, {
    scale: 4,
    width: 64,
    height: 120,
    dest : 3,
    dynamic : true
  });

  console.log('new monster entity', monster);

  animations = nuclear.component('animations').add(monster, 'idleface', [
    'idleback',
    'idleface',
    'idleleft',
    'idleright',
    'walkback',
    'walkface',
    'walkleft',
    'walkright'
  ]);

  nuclear.component('collider').add(monster, {
    width: 64,
    height: 60,
    offsetY : 20
  });

  nuclear.component('rigidbody').add(monster, {
    mass: 1, friction: 0.1
  });

  velocity = nuclear.component('velocity').add(monster);
  
  console.log(nuclear.component('states').add(monster, context.hero, {
    idle : {
                run : 'idle-run'
            },
    reaching : {
                run : 'reaching-run',
                enter : 'reaching-enter'
            },
    fight : {
                run : 'fight-run'
            }
}, 'idle'));
var path;
console.log(path = nuclear.component('path').add(monster, options.map.data, 0, 0));
console.log(nuclear.component('goTo').add(monster, path.nodes, 3));
var attack = nuclear.component('attack').add(monster, {
  w : 50,
  h : 90,
  damages : 1,
  offset : 30,
  cooldown : 20,
  onEnter : function(other){
    if(other === context.hero){
        nuclear.component('life').of(context.hero).less(attack.damages);
    }
  },
  onExit : function(){}
});
console.log(nuclear.component('life').add(monster, options.life || 100, options.life || 100, function(){
    //looting
    //feedbacks
}, function(){
    //feedbacks
}));
};
