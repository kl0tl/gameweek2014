'use strict';

var hero, camera, context;

var map = nuclear.component('map').of(nuclear.entity('map').create({
  mapData : {
    width : 40,
    height : 40,
    roomWidth : [3, 20],
    roomHeight : [3, 20]
  }
}));
console.log(map);

context = nuclear.system.context();

var position = {
    x : map.start.x * 120,
    y : map.start.y * 120,
};

hero = nuclear.entity('hero').create(position);
console.log(hero);
camera = context.camera = nuclear.entity('camera').create({
    target : hero,
    x : 0,
    y : 0,
    collider : {
        width : 500,
        height : 500,
        offsetX : 250,
        offsetY : 250
    }
});

context.cameraPosition = nuclear.component('position').of(camera);

nuclear.system.priority('kinematic', -3);
nuclear.system.priority('collisions', -2);
nuclear.system.priority('follow', -1);