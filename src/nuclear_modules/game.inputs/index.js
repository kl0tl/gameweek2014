'use strict';
(function(nuclear, console){
    require('./lib/mousetrap.min');

    var inputs, Gamepad, Mousetrap;

    Gamepad = require('./lib/gamepad.min').Gamepad;
    Mousetrap = window.Mousetrap;

    inputs = nuclear.module('game.inputs', []);

    inputs.component('inputs', function(entity, data){
      return data;
    });

    function inputsManager(entity, components){
      var inputs = components.inputs,
          input;

      for(var i in inputsManager.manager){
        input = inputsManager.manager[i];
        if(inputs[i]){

          inputs[i](entity, input, inputsManager.manager);
        }
      }
    }
    inputsManager.manager = {};

    inputs.system('inputsManager', ['inputs'], inputsManager, {
      msPerUpdate : 50
    });

    inputs.config({
      gamepad : {
        'FACE_1' : '',
        'FACE_2' : '',
        'FACE_3' : '',
        'FACE_4' : '',

        'LEFT_TOP_SHOULDER' : '',
        'RIGHT_TOP_SHOULDER' : '',
        'LEFT_BOTTOM_SHOULDER' : '',
        'RIGHT_BOTTOM_SHOULDER' : '',

        'SELECT_BACK' : '',
        'START_FORWARD' : '',
        'LEFT_STICK_X' : 'LEFT_AXIS_X',
        'RIGHT_STICK_X' : 'RIGHT_AXIS_X',
        'LEFT_STICK_Y' : 'LEFT_AXIS_Y',
        'RIGHT_STICK_Y' : 'RIGHT_AXIS_Y',

        'DPAD_UP' : 'UP',
        'DPAD_DOWN' : 'DOWN',
        'DPAD_LEFT' : 'LEFT',
        'DPAD_RIGHT' : 'RIGHT',

        'HOME' : ''
      },
      keyboard : {
        'a' : 'FIRE',
        'up' : 'UP',
        'down' : 'DOWN',
        'left' : 'LEFT',
        'right' : 'RIGHT',
        'z' : 'UP',
        'q' : 'LEFT',
        's' : 'DOWN',
        'd' : 'RIGHT',
        'space' : 'FIRE',
        'o': 'DAMAGE',
        'p': 'DIE'
      }
    });
    var gamepad = new Gamepad();
    gamepad.init();
    gamepad.bind(Gamepad.Event.CONNECTED, function() {
      console.log('[MODULE@INPUTS] GAMEPAD CONNECTED');
    });
    gamepad.bind(Gamepad.Event.UNCONNECTED, function() {
      console.log('[MODULE@INPUTS] GAMEPAD UNCONNECTED');
    });
    gamepad.bind(Gamepad.Event.BUTTON_DOWN, function(e) {
      var alias = inputs.config('gamepad')[e.control];
      inputsManager.manager[alias] = 1;
    });
    gamepad.bind(Gamepad.Event.BUTTON_UP, function(e) {
      var alias = inputs.config('gamepad')[e.control];
      inputsManager.manager[alias] = 0;
    });
    gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(e) {
      var alias = inputs.config('gamepad')[e.axis];
      inputsManager.manager[alias] = e.value;
    });

    var key, config;
    config = inputs.config('keyboard');

    function onKeyDown(e, key){
      var alias = inputs.config('keyboard')[key];
      inputsManager.manager[alias] = 1;
    }

    function onKeyUp(e, key){
      var alias = inputs.config('keyboard')[key];
      inputsManager.manager[alias] = 0;
    }

    for(var i in config){
      key = i;
      Mousetrap.bind(key, onKeyDown, 'keydown');
      Mousetrap.bind(key, onKeyUp, 'keyup');
      /*jshint ignore:end */
    }
    module.exports = inputs;
})(window.nuclear, window.console);
