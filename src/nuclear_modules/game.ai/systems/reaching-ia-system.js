'use strict';

module.exports = {
    enter : function reachingIAEnter(entity, components){
      var mapPositionX, mapPositionY, resolution, playerX, playerY, playerPosition;

      resolution = nuclear.module('roguemap').config('resolution');
      playerPosition = components.states.playerPosition;

      mapPositionX = Math.round(components.position.x/resolution);
      mapPositionY = Math.round(components.position.y/resolution);

      playerX = Math.round(playerPosition.x/resolution);
      playerY = Math.round(playerPosition.y/resolution);

      components.path.to(playerX, playerY).from(mapPositionX, mapPositionY, function(x, y){
        console.log(x, y);
      });
    },
    exit : function reachingIAExit(){

    },
    run : function reachingIARun(){
      
    }
};