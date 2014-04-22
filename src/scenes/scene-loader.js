'use strict';
var reload = false;
var ennemiQuery = nuclear.query('states from game.ai');

var contextDefining = require('../systems-context');
var context = nuclear.system.context();

var currentWeapon, heroLife;

var roguemap;

roguemap = require('./roguemap-scene');

nuclear.events.on('system:after_running', function checkReload(){
    if(reload){
        reload = false;
        nuclear.entity('pentagram').create(nuclear.component('position').of(context.hero));
        setTimeout(function(){
          load();
            context.difficulty += context.difficulty * context.difficulties[Math.round(Math.random()*context.difficulties.length)];
            contextDefining(context);
            playScenes({
                currentWeapon : currentWeapon,
                heroLife : heroLife
            });
        }, 3000);
    }
});
ennemiQuery.listen(function(entity, state){
    if(state === false && ennemiQuery.entities.length <= 0){
        reload = true;
    }
});

function playScenes(options){
    roguemap(options);
}

function load(){
    var i, u, x, entities, all;
    for(i in nuclear.registry.systems){
        entities = nuclear.registry.systems[i].entities;
        for(u = 0; u < entities.length; u++){
            if(context.hero === entities[u]){
                savePlayer(entities[u]);
            }

            if(nuclear.component('collider').in(entities[u])){
                all = nuclear.component.all(entities[u]);
                for(x = 0; x < all.length; x++){
                    nuclear.component(all[x]).disable(entities[u]);
                }
                continue;
            }
            nuclear.entity.remove(entities[u]);
        }
    }
    for(i = 0; i < context.dests.length; i++){
        context.dests[i].clearRect(0, 0, 6000, 6000);
    }
}

function savePlayer(player){
    heroLife = nuclear.component('life').of(player).current;
    currentWeapon = nuclear.component('currentWeapon').of(player);
}
module.exports = playScenes;
