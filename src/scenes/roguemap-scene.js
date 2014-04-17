'use strict';

var hero, camera, context;

var ennemiQuery = nuclear.query('states from game.ai');

window.mapE = nuclear.entity('map').create({
  mapData : {
    width : 20,
    height : 20,
    roomWidth : [2, 5],
    roomHeight : [2, 5]
  }
});

var map = nuclear.component('map').of(window.mapE);



console.log(map);

context = nuclear.system.context();

ennemiQuery.listen(function(entity, state){
    console.log('ENNEMY IS : '+entity);
    if(!state && ennemiQuery.entities.length <= 0){
        nuclear.entity.remove(window.mapE);
        context.dests[0].clearRect(0, 0, 1300, 800);
        context.dests[1].clearRect(0, 0, 1300, 800);
        context.dests[2].clearRect(0, 0, 1300, 800);
        context.dests[3].clearRect(0, 0, 1300, 800);
        context.dests[4].clearRect(0, 0, 1300, 800);
        nuclear.component('sprite').of(context.buffers[0]).context.clearRect(0, 0, 1300, 800);
        nuclear.component('sprite').of(context.buffers[1]).context.clearRect(0, 0, 1300, 800);
        nuclear.component('sprite').of(context.buffers[2]).context.clearRect(0, 0, 1300, 800);
        nuclear.component('sprite').of(context.buffers[3]).context.clearRect(0, 0, 1300, 800);
        var colliders = nuclear.system('collisions').entities;
        for(var i = 0; i < colliders.length; i++){
          nuclear.entity.remove(colliders[i]);
        }
        window.mapE = nuclear.entity('map').create({
          mapData : {
            width : 20,
            height : 20,
            roomWidth : [2, 5],
            roomHeight : [2, 5]
          }
        });

    }
});
var position = {
    x : map.start.x * 120,
    y : map.start.y * 120,
};

hero = nuclear.entity('hero').create(position);
console.log(hero);
console.log(nuclear.component('life').add(hero, 100, function(e){
    console.log('Hero Died'+e);
}));
console.log(nuclear.component('attack').add(hero, {
  w : 50,
  h : 90,
  offset : 30,
  cooldown : 0,
  onEnter : function(){
    console.log('BIM MACHIN');
  },
  onExit : function(){}
}));
console.log(nuclear.component('states').add(hero-1, hero, {
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
console.log(path = nuclear.component('path').add(hero-1, map.data, 0, 0));
console.log(nuclear.component('goTo').add(hero-1, path.nodes, 3));
console.log(nuclear.component('attack').add(hero-1, {
  w : 50,
  h : 90,
  offset : 30,
  cooldown : 20,
  onEnter : function(other){
    if(other === hero){
        nuclear.component('life').of(hero).less(10);
    }
  },
  onExit : function(){}
}));
var toDisable = ['idle-run','idle-enter','idle-exit','reaching-run',
                  'reaching-enter','reaching-exit','fight-run',
                  'fight-enter','fight-exit'];
for(var i = 0; i < toDisable.length; i++){
    nuclear.system.disable(toDisable[i])
;}
nuclear.component('position').of(hero-1).x = nuclear.component('position').of(hero).x +200;
nuclear.component('position').of(hero-1).y = nuclear.component('position').of(hero).y +200;
camera = context.camera = nuclear.entity('camera').create({
    target : hero,
    x : 0,
    y : 0,
    collider : {
        width : 1280,
        height : 768,
        offsetX : 640,
        offsetY : 382
    }
});

context.cameraPosition = nuclear.component('position').of(camera);

nuclear.system.priority('kinematic', -3);
nuclear.system.priority('collisions', -2);
nuclear.system.priority('follow', -1);
