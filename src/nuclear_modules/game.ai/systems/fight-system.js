'use strict';

module.exports = {
    enter : function fightIAEnter(){

    },
    exit : function fightIAExit(){

    },
    run : function fightIARun(entity, components, context){
      var position, mapPositionX, mapPositionY, playerX, playerY, resolution, states, playerPosition;

      resolution = nuclear.module('roguemap').config('resolution');
      states = components.states;
      playerPosition = nuclear.component('position').of(context.hero);

      playerX = Math.round(playerPosition.x/resolution);
      playerY = Math.round(playerPosition.y/resolution);

      position = components.position;

      mapPositionX = Math.round(position.x/resolution);
      mapPositionY = Math.round(position.y/resolution);

      components.path.to(playerX, playerY).from(mapPositionX, mapPositionY);
      components.attack.to(components.position, playerPosition);
      if(components.path.nodes.length > components.path.min){
        states.state('reaching');
      }
    }
};