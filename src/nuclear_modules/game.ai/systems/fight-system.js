'use strict';

module.exports = {
    enter : function fightIAEnter(){

    },
    exit : function fightIAExit(){

    },
    run : function fightIARun(entity, components){
      var position, mapPositionX, mapPositionY, playerX, playerY, resolution, states;

      resolution = nuclear.module('roguemap').config('resolution');
      states = components.states;

      playerX = Math.round(states.playerPosition.x/resolution);
      playerY = Math.round(states.playerPosition.y/resolution);

      position = components.position;

      mapPositionX = Math.round(position.x/resolution);
      mapPositionY = Math.round(position.y/resolution);

      components.path.to(playerX, playerY).from(mapPositionX, mapPositionY);
      components.attack.to(components.position, states.playerPosition);
      components.attack.count--;
      if(components.path.nodes.length > components.path.min){
        states.state('reaching');
      }
    }
};