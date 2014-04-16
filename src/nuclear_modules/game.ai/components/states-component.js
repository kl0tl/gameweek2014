'use strict';

function StateComponent(entity, player, states, current){
  this.current = current;
  this.last = current;
  this.states = states;
  this.entity = entity;
  this.playerPosition = nuclear.component('position from game.transform').of(player);
}

StateComponent.prototype.state = function stateChange(state){
  if(arguments.length === 0) return this.current;

  this.current = state;
  return this.current;
};

module.exports = StateComponent;