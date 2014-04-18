'use strict';
require('chance');
var chance = window.chance;

module.exports = function rogueMap(options){
    options = options || {};
    
    var hero, camera, context;
    
    context = nuclear.system.context();

    window.mapE = nuclear.entity('map').create({
      mapData : {
        width : 10*context.difficulty | 0,
        height : 10*context.difficulty | 0,
        roomWidth : [2*context.difficulty | 0, 5*context.difficulty | 0],
        roomHeight : [2*context.difficulty | 0, 5*context.difficulty | 0]
      }
    });

    var map = nuclear.component('map').of(window.mapE);

    console.log(map);

    var position = {
        x : map.start.x * 120,
        y : map.start.y * 120,
    };

    context.hero = hero = nuclear.entity('hero').create({
        x : position.x,
        y : position.y,
        name : chance.syllable()+chance.syllable()+chance.syllable(),
        life : options.heroLife || 100
    });

    var monster = nuclear.entity('monster').create({
        x : position.x + 100,
        y : position.y + 100,
        map : map
    });
    monster = nuclear.entity('monster').create({
        x : position.x + 200,
        y : position.y + 100,
        map : map
    });
    monster = nuclear.entity('monster').create({
        x : position.x + 300,
        y : position.y + 100,
        map : map
    });
    monster = nuclear.entity('monster').create({
        x : position.x + 200,
        y : position.y + 200,
        map : map
    });
    console.log(monster);
    var toDisable = ['idle-run','idle-enter','idle-exit','reaching-run',
                      'reaching-enter','reaching-exit','fight-run',
                      'fight-enter','fight-exit'];
    for(var i = 0; i < toDisable.length; i++){
        nuclear.system.disable(toDisable[i])
    ;}

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
};