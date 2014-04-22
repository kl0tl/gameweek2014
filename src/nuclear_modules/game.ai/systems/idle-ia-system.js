'use strict';

module.exports = {
    enter : function idleIAEnter(){

    },
    exit : function idleIAExit(){

    },
    run : function idleIARun(entity, components, context){
      var playerLight, states;

      states = components.states;

      playerLight = nuclear.component('dynamic-light').of(context.mainLight);
      if(playerLight.contains(entity)){
        states.state('reaching');
      }
    }
};