'use strict';

module.exports = function defineContext(context){
    context = context || {};

    context = nuclear.system.context();
    context.buffers = [];
    context.difficulties = [0.1, 0.3, 0.5];
    context.difficulty = context.difficulty || 1;
    context.dests = [
      document.getElementById('main').getContext('2d'),

      document.getElementById('ambient-buffer').getContext('2d'),

      document.getElementById('top-buffer').getContext('2d'),
      document.getElementById('dynamic-buffer').getContext('2d'),
      document.getElementById('bottom-buffer').getContext('2d')
      ];

    for(var i = 1; i < context.dests.length; i++){
      var entity = nuclear.entity.create();

      context.dests[i].imageSmoothingEnabled = false;

      nuclear.component('position').add(entity, 0, 0);

      nuclear.component('sprite').add(entity, {
        buffer : context.dests[i].canvas,
        anchorX: 0,
        anchorY: 0,
        index : 100000-i,
        relativeCamera : true,
        viewPort : {
            w : 1280,
            h : 768
        }
      });

      context.buffers.push(entity);
    }

    context.WIDTH = 1280;
    context.HEIGHT = 768;

    delete context.colliders;
    context.colliders = nuclear.query([
      'collider from game.collisions',
      'position from game.transform'
    ].join(' '), {
      enabled : true
    }).entities;

    delete context.occluders;
    context.occluders = nuclear.query([
      'occluder from game.lighting',
      'position from game.transform'
    ].join(' '), {
      enabled: true
    }).entities;

    context._loots = {
      axe : [{
        damages : 20,
        impulse : 1,
        w : 20,
        h : 20,
        offset : 20,
        cooldown : 10,
        type: 'axe'
      }, {
        damages : 40,
        impulse : 1,
        w : 20,
        h : 20,
        offset : 20,
        cooldown : 10,
        type: 'axe'
      }],

      sword : [{
        damages : 10,
        impulse : 0.5,
        w : 20,
        h : 50,
        offset : 20,
        cooldown : 5,
        type: 'sword'
      }],

      life : [{
        life : 1
      }]
    };

    context.loot = function generateLoot(type){
      var weapons = this._loots[type];
      var index = Math.round((Math.random()*(weapons.length-1))+(this.difficulty-1));
      if(index > weapons.length-1) index = weapons.length-1;

      return weapons[index];
    };

    if(context.difficulty){
        context.pastPlayers = {};

        for(i in window.localStorage){
            context.pastPlayers[i] = window.localStorage[i];
        }

        Object.defineProperty(context.pastPlayers, 'length', {
            value : window.localStorage.length,
            enumerable : false,
            writable : true
        });
    }

    console.log(context.pastPlayers);
};
