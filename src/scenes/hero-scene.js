'use strict';

var hero, camera, context;

context = nuclear.system.context();


hero = nuclear.entity('hero').create();

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
console.log(hero);
context.cameraPosition = nuclear.component('position').of(camera);

nuclear.system.priority('kinematic', -3);
nuclear.system.priority('collisions', -2);
nuclear.system.priority('follow', -1);
