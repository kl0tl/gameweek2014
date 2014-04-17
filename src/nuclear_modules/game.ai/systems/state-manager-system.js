'use strict';

module.exports = function stateManager(entity, components){
  var states;
  states = components.states;

  if(states.current !== states.last){
    if(states.states[states.last].exit){
      nuclear.system(states.states[states.last].exit).once(entity);
    }
    if(states.states[states.current].enter){
      nuclear.system(states.states[states.current].enter).once(entity);
    }
  }

  states.last = states.current;
  nuclear.system(states.states[states.current].run).once(entity);
};