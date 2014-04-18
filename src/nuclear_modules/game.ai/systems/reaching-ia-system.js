'use strict';

module.exports = {
    enter : function reachingIAEnter(entity, components, context){
      var mapPositionX, mapPositionY, resolution, playerX, playerY, playerPosition;

      resolution = nuclear.module('roguemap').config('resolution');
      playerPosition = nuclear.component('position').of(context.hero);

      mapPositionX = Math.round(components.position.x/resolution);
      mapPositionY = Math.round(components.position.y/resolution);

      playerX = Math.round(playerPosition.x/resolution);
      playerY = Math.round(playerPosition.y/resolution);

      components.path.to(playerX, playerY).from(mapPositionX, mapPositionY);
    },
    exit : function reachingIAExit(){

    },
    run : function reachingIARun(entity, components, context){
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
      
      if(components.path.nodes.length <= components.path.min){
        states.state('fight');
      }
      if(components.path.nodes.length >= components.path.max){
        states.state('idle');
      }
    }
};