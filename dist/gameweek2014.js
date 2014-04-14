(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var nuclear, console;

console = window.console;
nuclear = window.nuclear;

require('./nuclear_modules/game.inputs/');
require('./nuclear_modules/game.roguemap/');

nuclear.module('inputs').config('gamepad').FACE_1 = 'FIRE';
var entity = nuclear.entity.create();
nuclear.component('inputs').add(entity, {
  FIRE : function(entity, input){
    if(input !== 0){
      console.log(input);
    }
  },
  UP : function(entity, input){
    if(input !== 0){
      console.log(input);
    }
  }
});

function loop(){
  nuclear.system.run();
  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);
},{"./nuclear_modules/game.inputs/":2,"./nuclear_modules/game.roguemap/":5}],2:[function(require,module,exports){
'use strict';
(function(nuclear, console){
    require('./lib/mousetrap.min');

    var inputs, Gamepad, Mousetrap;

    Gamepad = require('./lib/gamepad.min').Gamepad;
    Mousetrap = window.Mousetrap;

    inputs = nuclear.module('inputs', []);

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
        'a' : 'A',
        'up' : 'UP',
        'down' : 'DOWN',
        'left' : 'LEFT',
        'right' : 'RIGHT',
        'z' : 'UP',
        'q' : 'LEFT',
        's' : 'DOWN',
        'd' : 'RIGHT',
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
    nuclear.import([inputs]);
})(window.nuclear, window.console);
},{"./lib/gamepad.min":3,"./lib/mousetrap.min":4}],3:[function(require,module,exports){
!function(a){"use strict";var b=function(){},c={getType:function(){return"null"},isSupported:function(){return!1},update:b},d=function(a){var c=this,d=window;this.update=b;this.requestAnimationFrame=a||d.requestAnimationFrame||d.webkitRequestAnimationFrame||d.mozRequestAnimationFrame;this.tickFunction=function(){c.update();c.startTicker()};this.startTicker=function(){c.requestAnimationFrame.apply(d,[c.tickFunction])}};d.prototype.start=function(a){this.update=a||b;this.startTicker()};var e=function(){};e.prototype.update=b;e.prototype.start=function(a){this.update=a||b};var f=function(a,b){this.listener=a;this.gamepadGetter=b;this.knownGamepads=[]};f.factory=function(a){var b=c,d=window&&window.navigator;d&&("undefined"!=typeof d.webkitGamepads?b=new f(a,function(){return d.webkitGamepads}):"undefined"!=typeof d.webkitGetGamepads&&(b=new f(a,function(){return d.webkitGetGamepads()})));return b};f.getType=function(){return"WebKit"},f.prototype.getType=function(){return f.getType()},f.prototype.isSupported=function(){return!0};f.prototype.update=function(){var a,b,c=this,d=Array.prototype.slice.call(this.gamepadGetter(),0);for(b=this.knownGamepads.length-1;b>=0;b--){a=this.knownGamepads[b];if(d.indexOf(a)<0){this.knownGamepads.splice(b,1);this.listener._disconnect(a)}}for(b=0;b<d.length;b++){a=d[b];if(a&&c.knownGamepads.indexOf(a)<0){c.knownGamepads.push(a);c.listener._connect(a)}}};var g=function(a){this.listener=a;window.addEventListener("gamepadconnected",function(b){a._connect(b.gamepad)});window.addEventListener("gamepaddisconnected",function(b){a._disconnect(b.gamepad)})};g.factory=function(a){var b=c;window&&"undefined"!=typeof window.addEventListener&&(b=new g(a));return b};g.getType=function(){return"Firefox"},g.prototype.getType=function(){return g.getType()},g.prototype.isSupported=function(){return!0};g.prototype.update=b;var h=function(a){this.updateStrategy=a||new d;this.gamepads=[];this.listeners={};this.platform=c;this.deadzone=.03;this.maximizeThreshold=.97};h.UpdateStrategies={AnimFrameUpdateStrategy:d,ManualUpdateStrategy:e};h.PlatformFactories=[f.factory,g.factory];h.Type={PLAYSTATION:"playstation",LOGITECH:"logitech",XBOX:"xbox",UNKNOWN:"unknown"};h.Event={CONNECTED:"connected",UNSUPPORTED:"unsupported",DISCONNECTED:"disconnected",TICK:"tick",BUTTON_DOWN:"button-down",BUTTON_UP:"button-up",AXIS_CHANGED:"axis-changed"};h.StandardButtons=["FACE_1","FACE_2","FACE_3","FACE_4","LEFT_TOP_SHOULDER","RIGHT_TOP_SHOULDER","LEFT_BOTTOM_SHOULDER","RIGHT_BOTTOM_SHOULDER","SELECT_BACK","START_FORWARD","LEFT_STICK","RIGHT_STICK","DPAD_UP","DPAD_DOWN","DPAD_LEFT","DPAD_RIGHT","HOME"];h.StandardAxes=["LEFT_STICK_X","LEFT_STICK_Y","RIGHT_STICK_X","RIGHT_STICK_Y"];var i=function(a,b,c){return b<a.length?a[b]:c+(b-a.length+1)};h.StandardMapping={env:{},buttons:{byButton:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]},axes:{byAxis:[0,1,2,3]}};h.Mappings=[{env:{platform:g.getType(),type:h.Type.PLAYSTATION},buttons:{byButton:[14,13,15,12,10,11,8,9,0,3,1,2,4,6,7,5,16]},axes:{byAxis:[0,1,2,3]}},{env:{platform:f.getType(),type:h.Type.LOGITECH},buttons:{byButton:[1,2,0,3,4,5,6,7,8,9,10,11,11,12,13,14,10]},axes:{byAxis:[0,1,2,3]}},{env:{platform:g.getType(),type:h.Type.LOGITECH},buttons:{byButton:[0,1,2,3,4,5,-1,-1,6,7,8,9,11,12,13,14,10],byAxis:[-1,-1,-1,-1,-1,-1,[2,0,1],[2,0,-1]]},axes:{byAxis:[0,1,3,4]}}];h.prototype.init=function(){var a=h.resolvePlatform(this),b=this;this.platform=a;this.updateStrategy.start(function(){b._update()});return a.isSupported()};h.prototype.bind=function(a,b){"undefined"==typeof this.listeners[a]&&(this.listeners[a]=[]);this.listeners[a].push(b);return this};h.prototype.unbind=function(a,b){if("undefined"!=typeof a){if("undefined"!=typeof b){if("undefined"==typeof this.listeners[a])return!1;for(var c=0;c<this.listeners[a].length;c++)if(this.listeners[a][c]===b){this.listeners[a].splice(c,1);return!0}return!1}this.listeners[a]=[]}else this.listeners={}};h.prototype.count=function(){return this.gamepads.length};h.prototype._fire=function(a,b){if("undefined"!=typeof this.listeners[a])for(var c=0;c<this.listeners[a].length;c++)this.listeners[a][c].apply(this.listeners[a][c],[b])};h.getNullPlatform=function(){return Object.create(c)};h.resolvePlatform=function(a){var b,d=c;for(b=0;!d.isSupported()&&b<h.PlatformFactories.length;b++)d=h.PlatformFactories[b](a);return d};h.prototype._connect=function(a){var b,c,d=this._resolveMapping(a);a.state={};a.lastState={};a.updater=[];b=d.buttons.byButton.length;for(c=0;b>c;c++)this._addButtonUpdater(a,d,c);b=d.axes.byAxis.length;for(c=0;b>c;c++)this._addAxisUpdater(a,d,c);this.gamepads[a.index]=a;this._fire(h.Event.CONNECTED,a)};h.prototype._addButtonUpdater=function(a,c,d){var e=b,f=i(h.StandardButtons,d,"EXTRA_BUTTON_"),g=this._createButtonGetter(a,c.buttons,d),j=this,k={gamepad:a,control:f};a.state[f]=0;a.lastState[f]=0;e=function(){var b=g(),c=a.lastState[f],d=b>.5,e=c>.5;a.state[f]=b;d&&!e?j._fire(h.Event.BUTTON_DOWN,Object.create(k)):!d&&e&&j._fire(h.Event.BUTTON_UP,Object.create(k));0!==b&&1!==b&&b!==c&&j._fireAxisChangedEvent(a,f,b);a.lastState[f]=b};a.updater.push(e)};h.prototype._addAxisUpdater=function(a,c,d){var e=b,f=i(h.StandardAxes,d,"EXTRA_AXIS_"),g=this._createAxisGetter(a,c.axes,d),j=this;a.state[f]=0;a.lastState[f]=0;e=function(){var b=g(),c=a.lastState[f];a.state[f]=b;b!==c&&j._fireAxisChangedEvent(a,f,b);a.lastState[f]=b};a.updater.push(e)};h.prototype._fireAxisChangedEvent=function(a,b,c){var d={gamepad:a,axis:b,value:c};this._fire(h.Event.AXIS_CHANGED,d)};h.prototype._createButtonGetter=function(){var a=function(){return 0},b=function(b,c,d){var e=a;d>c?e=function(){var a=d-c,e=b();e=(e-c)/a;return 0>e?0:e}:c>d&&(e=function(){var a=c-d,e=b();e=(e-d)/a;return e>1?0:1-e});return e},c=function(a){return"[object Array]"===Object.prototype.toString.call(a)};return function(d,e,f){var g,h=a,i=this;g=e.byButton[f];if(-1!==g)"number"==typeof g&&g<d.buttons.length&&(h=function(){return d.buttons[g]});else if(e.byAxis&&f<e.byAxis.length){g=e.byAxis[f];if(c(g)&&3==g.length&&g[0]<d.axes.length){h=function(){var a=d.axes[g[0]];return i._applyDeadzoneMaximize(a)};h=b(h,g[1],g[2])}}return h}}();h.prototype._createAxisGetter=function(){var a=function(){return 0};return function(b,c,d){var e,f=a,g=this;e=c.byAxis[d];-1!==e&&"number"==typeof e&&e<b.axes.length&&(f=function(){var a=b.axes[e];return g._applyDeadzoneMaximize(a)});return f}}();h.prototype._disconnect=function(a){var b,c=[];"undefined"!=typeof this.gamepads[a.index]&&delete this.gamepads[a.index];for(b=0;b<this.gamepads.length;b++)"undefined"!=typeof this.gamepads[b]&&(c[b]=this.gamepads[b]);this.gamepads=c;this._fire(h.Event.DISCONNECTED,a)};h.prototype._resolveControllerType=function(a){a=a.toLowerCase();return-1!==a.indexOf("playstation")?h.Type.PLAYSTATION:-1!==a.indexOf("logitech")||-1!==a.indexOf("wireless gamepad")?h.Type.LOGITECH:-1!==a.indexOf("xbox")||-1!==a.indexOf("360")?h.Type.XBOX:h.Type.UNKNOWN};h.prototype._resolveMapping=function(a){var b,c,d=h.Mappings,e=null,f={platform:this.platform.getType(),type:this._resolveControllerType(a.id)};for(b=0;!e&&b<d.length;b++){c=d[b];h.envMatchesFilter(c.env,f)&&(e=c)}return e||h.StandardMapping};h.envMatchesFilter=function(a,b){var c,d=!0;for(c in a)a[c]!==b[c]&&(d=!1);return d};h.prototype._update=function(){this.platform.update();this.gamepads.forEach(function(a){a&&a.updater.forEach(function(a){a()})});this.gamepads.length>0&&this._fire(h.Event.TICK,this.gamepads)},h.prototype._applyDeadzoneMaximize=function(a,b,c){b="undefined"!=typeof b?b:this.deadzone;c="undefined"!=typeof c?c:this.maximizeThreshold;a>=0?b>a?a=0:a>c&&(a=1):a>-b?a=0:-c>a&&(a=-1);return a};a.Gamepad=h}("undefined"!=typeof module&&module.exports||window);
},{}],4:[function(require,module,exports){
/* mousetrap v1.4.6 craig.is/killing/mice */
(function(J,r,f){function s(a,b,d){a.addEventListener?a.addEventListener(b,d,!1):a.attachEvent("on"+b,d)}function A(a){if("keypress"==a.type){var b=String.fromCharCode(a.which);a.shiftKey||(b=b.toLowerCase());return b}return h[a.which]?h[a.which]:B[a.which]?B[a.which]:String.fromCharCode(a.which).toLowerCase()}function t(a){a=a||{};var b=!1,d;for(d in n)a[d]?b=!0:n[d]=0;b||(u=!1)}function C(a,b,d,c,e,v){var g,k,f=[],h=d.type;if(!l[a])return[];"keyup"==h&&w(a)&&(b=[a]);for(g=0;g<l[a].length;++g)if(k=
l[a][g],!(!c&&k.seq&&n[k.seq]!=k.level||h!=k.action||("keypress"!=h||d.metaKey||d.ctrlKey)&&b.sort().join(",")!==k.modifiers.sort().join(","))){var m=c&&k.seq==c&&k.level==v;(!c&&k.combo==e||m)&&l[a].splice(g,1);f.push(k)}return f}function K(a){var b=[];a.shiftKey&&b.push("shift");a.altKey&&b.push("alt");a.ctrlKey&&b.push("ctrl");a.metaKey&&b.push("meta");return b}function x(a,b,d,c){m.stopCallback(b,b.target||b.srcElement,d,c)||!1!==a(b,d)||(b.preventDefault?b.preventDefault():b.returnValue=!1,b.stopPropagation?
b.stopPropagation():b.cancelBubble=!0)}function y(a){"number"!==typeof a.which&&(a.which=a.keyCode);var b=A(a);b&&("keyup"==a.type&&z===b?z=!1:m.handleKey(b,K(a),a))}function w(a){return"shift"==a||"ctrl"==a||"alt"==a||"meta"==a}function L(a,b,d,c){function e(b){return function(){u=b;++n[a];clearTimeout(D);D=setTimeout(t,1E3)}}function v(b){x(d,b,a);"keyup"!==c&&(z=A(b));setTimeout(t,10)}for(var g=n[a]=0;g<b.length;++g){var f=g+1===b.length?v:e(c||E(b[g+1]).action);F(b[g],f,c,a,g)}}function E(a,b){var d,
c,e,f=[];d="+"===a?["+"]:a.split("+");for(e=0;e<d.length;++e)c=d[e],G[c]&&(c=G[c]),b&&"keypress"!=b&&H[c]&&(c=H[c],f.push("shift")),w(c)&&f.push(c);d=c;e=b;if(!e){if(!p){p={};for(var g in h)95<g&&112>g||h.hasOwnProperty(g)&&(p[h[g]]=g)}e=p[d]?"keydown":"keypress"}"keypress"==e&&f.length&&(e="keydown");return{key:c,modifiers:f,action:e}}function F(a,b,d,c,e){q[a+":"+d]=b;a=a.replace(/\s+/g," ");var f=a.split(" ");1<f.length?L(a,f,b,d):(d=E(a,d),l[d.key]=l[d.key]||[],C(d.key,d.modifiers,{type:d.action},
c,a,e),l[d.key][c?"unshift":"push"]({callback:b,modifiers:d.modifiers,action:d.action,seq:c,level:e,combo:a}))}var h={8:"backspace",9:"tab",13:"enter",16:"shift",17:"ctrl",18:"alt",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"ins",46:"del",91:"meta",93:"meta",224:"meta"},B={106:"*",107:"+",109:"-",110:".",111:"/",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},H={"~":"`","!":"1",
"@":"2","#":"3",$:"4","%":"5","^":"6","&":"7","*":"8","(":"9",")":"0",_:"-","+":"=",":":";",'"':"'","<":",",">":".","?":"/","|":"\\"},G={option:"alt",command:"meta","return":"enter",escape:"esc",mod:/Mac|iPod|iPhone|iPad/.test(navigator.platform)?"meta":"ctrl"},p,l={},q={},n={},D,z=!1,I=!1,u=!1;for(f=1;20>f;++f)h[111+f]="f"+f;for(f=0;9>=f;++f)h[f+96]=f;s(r,"keypress",y);s(r,"keydown",y);s(r,"keyup",y);var m={bind:function(a,b,d){a=a instanceof Array?a:[a];for(var c=0;c<a.length;++c)F(a[c],b,d);return this},
unbind:function(a,b){return m.bind(a,function(){},b)},trigger:function(a,b){if(q[a+":"+b])q[a+":"+b]({},a);return this},reset:function(){l={};q={};return this},stopCallback:function(a,b){return-1<(" "+b.className+" ").indexOf(" mousetrap ")?!1:"INPUT"==b.tagName||"SELECT"==b.tagName||"TEXTAREA"==b.tagName||b.isContentEditable},handleKey:function(a,b,d){var c=C(a,b,d),e;b={};var f=0,g=!1;for(e=0;e<c.length;++e)c[e].seq&&(f=Math.max(f,c[e].level));for(e=0;e<c.length;++e)c[e].seq?c[e].level==f&&(g=!0,
b[c[e].seq]=1,x(c[e].callback,d,c[e].combo,c[e].seq)):g||x(c[e].callback,d,c[e].combo);c="keypress"==d.type&&I;d.type!=u||w(a)||c||t(b);I=g&&"keydown"==d.type}};J.Mousetrap=m;"function"===typeof define&&define.amd&&define(m)})(window,document);

},{}],5:[function(require,module,exports){
'use strict';
var roguemap, ROT, nuclear, console;

console = window.console;
nuclear = window.nuclear;

require('./lib/rot');
ROT = window.ROT;

var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
document.body.appendChild(canvas);

canvas.width = 800;
canvas.height = 800;

roguemap = nuclear.module('roguemap', []);

var digger = new ROT.Map.Digger(200, 200, {
  roomHeight : [3, 20],
  roomWidth : [3, 20],
});

var templates = {
  'one' : {
    name : 'one',
    slots : [
      {
        type : 'crate',
        position : {
          x : 30,
          y : 20
        }
      },
      {
        type : 'crate',
        position : {
          x : 40,
          y : 20
        }
      },
      {
        type : 'torch',
        position : {
          x : 100,
          y : 10
        }
      }
    ],
    light : 'red',
    bundle : 'stone'
  },
  'two' : {
    name : 'two',
    slots : [
      {
        type : 'crate',
        position : {
          x : 30,
          y : 20
        }
      },
      {
        type : 'crate',
        position : {
          x : 40,
          y : 20
        }
      },
      {
        type : 'torch',
        position : {
          x : 100,
          y : 10
        }
      }
    ],
    light : 'red',
    bundle : 'stone'
  },
  'three' : {
    name : 'three',
    slots : [
      {
        type : 'crate',
        position : {
          x : 30,
          y : 20
        }
      },
      {
        type : 'crate',
        position : {
          x : 40,
          y : 20
        }
      },
      {
        type : 'torch',
        position : {
          x : 100,
          y : 10
        }
      }
    ],
    light : 'red',
    bundle : 'stone'
  },
  'four' : {
    name : 'four',
    slots : [
      {
        type : 'crate',
        position : {
          x : 30,
          y : 20
        }
      },
      {
        type : 'crate',
        position : {
          x : 40,
          y : 20
        }
      },
      {
        type : 'torch',
        position : {
          x : 100,
          y : 10
        }
      }
    ],
    light : 'red',
    bundle : 'stone'
  }
};
var ranges = {
  'one' : [9, 14],
  'two' : [15, 25],
  'three' : [26, 40],
  'four' : [41, 200],
};
digger.create(function(x, y, value){
  context.fillStyle = (value) ? 'black' : 'blue';
  context.fillRect(x*4, y*4, 4, 4);
});

for(var i = 0; i < digger._rooms.length; i++){
  var room = digger._rooms[i];
  var width = room._x2-room._x1;
  var height = room._y2-room._y1;
  var size = width*height;
  for(var x in ranges){
    var range = ranges[x],
        valid = false;
    for(var u = range[0]; u < range[1]; u++){
      if(size === u){
        valid = true;
        var template = templates[x];
        console.log('info', width, height, x);
        var indexX = Math.round(width*template.slots[2].position.x/100);
        var indexY = Math.round(height*template.slots[2].position.y/100);
        console.log(indexX, indexY);
      }
    }
    if(valid){
      break;
    }
  }
  console.log();
}

console.log(digger);

nuclear.import([roguemap]);
},{"./lib/rot":6}],6:[function(require,module,exports){
/*
	This is rot.js, the ROguelike Toolkit in JavaScript.
	Version 0.5~dev, generated on Mon Mar 31 15:10:41 CEST 2014.
*/
/**
 * @namespace Top-level ROT namespace
 */
window.ROT = {
	/**
	 * @returns {bool} Is rot.js supported by this browser?
	 */
	isSupported: function() {
		return !!(document.createElement("canvas").getContext && Function.prototype.bind);
	},

	/** Default with for display and map generators */
	DEFAULT_WIDTH: 80,
	/** Default height for display and map generators */
	DEFAULT_HEIGHT: 25,

	/** Directional constants. Ordering is important! */
	DIRS: {
		"4": [
			[ 0, -1],
			[ 1,  0],
			[ 0,  1],
			[-1,  0]
		],
		"8": [
			[ 0, -1],
			[ 1, -1],
			[ 1,  0],
			[ 1,  1],
			[ 0,  1],
			[-1,  1],
			[-1,  0],
			[-1, -1]
		],
		"6": [
			[-1, -1],
			[ 1, -1],
			[ 2,  0],
			[ 1,  1],
			[-1,  1],
			[-2,  0]
		]
	},

	/** Cancel key. */
	VK_CANCEL: 3, 
	/** Help key. */
	VK_HELP: 6, 
	/** Backspace key. */
	VK_BACK_SPACE: 8, 
	/** Tab key. */
	VK_TAB: 9, 
	/** 5 key on Numpad when NumLock is unlocked. Or on Mac, clear key which is positioned at NumLock key. */
	VK_CLEAR: 12, 
	/** Return/enter key on the main keyboard. */
	VK_RETURN: 13, 
	/** Reserved, but not used. */
	VK_ENTER: 14, 
	/** Shift key. */
	VK_SHIFT: 16, 
	/** Control key. */
	VK_CONTROL: 17, 
	/** Alt (Option on Mac) key. */
	VK_ALT: 18, 
	/** Pause key. */
	VK_PAUSE: 19, 
	/** Caps lock. */
	VK_CAPS_LOCK: 20, 
	/** Escape key. */
	VK_ESCAPE: 27, 
	/** Space bar. */
	VK_SPACE: 32, 
	/** Page Up key. */
	VK_PAGE_UP: 33, 
	/** Page Down key. */
	VK_PAGE_DOWN: 34, 
	/** End key. */
	VK_END: 35, 
	/** Home key. */
	VK_HOME: 36, 
	/** Left arrow. */
	VK_LEFT: 37, 
	/** Up arrow. */
	VK_UP: 38, 
	/** Right arrow. */
	VK_RIGHT: 39, 
	/** Down arrow. */
	VK_DOWN: 40, 
	/** Print Screen key. */
	VK_PRINTSCREEN: 44, 
	/** Ins(ert) key. */
	VK_INSERT: 45, 
	/** Del(ete) key. */
	VK_DELETE: 46, 
	/***/
	VK_0: 48,
	/***/
	VK_1: 49,
	/***/
	VK_2: 50,
	/***/
	VK_3: 51,
	/***/
	VK_4: 52,
	/***/
	VK_5: 53,
	/***/
	VK_6: 54,
	/***/
	VK_7: 55,
	/***/
	VK_8: 56,
	/***/
	VK_9: 57,
	/** Colon (:) key. Requires Gecko 15.0 */
	VK_COLON: 58, 
	/** Semicolon (;) key. */
	VK_SEMICOLON: 59, 
	/** Less-than (<) key. Requires Gecko 15.0 */
	VK_LESS_THAN: 60, 
	/** Equals (=) key. */
	VK_EQUALS: 61, 
	/** Greater-than (>) key. Requires Gecko 15.0 */
	VK_GREATER_THAN: 62, 
	/** Question mark (?) key. Requires Gecko 15.0 */
	VK_QUESTION_MARK: 63, 
	/** Atmark (@) key. Requires Gecko 15.0 */
	VK_AT: 64, 
	/***/
	VK_A: 65,
	/***/
	VK_B: 66,
	/***/
	VK_C: 67,
	/***/
	VK_D: 68,
	/***/
	VK_E: 69,
	/***/
	VK_F: 70,
	/***/
	VK_G: 71,
	/***/
	VK_H: 72,
	/***/
	VK_I: 73,
	/***/
	VK_J: 74,
	/***/
	VK_K: 75,
	/***/
	VK_L: 76,
	/***/
	VK_M: 77,
	/***/
	VK_N: 78,
	/***/
	VK_O: 79,
	/***/
	VK_P: 80,
	/***/
	VK_Q: 81,
	/***/
	VK_R: 82,
	/***/
	VK_S: 83,
	/***/
	VK_T: 84,
	/***/
	VK_U: 85,
	/***/
	VK_V: 86,
	/***/
	VK_W: 87,
	/***/
	VK_X: 88,
	/***/
	VK_Y: 89,
	/***/
	VK_Z: 90,
	/***/
	VK_CONTEXT_MENU: 93,
	/** 0 on the numeric keypad. */
	VK_NUMPAD0: 96, 
	/** 1 on the numeric keypad. */
	VK_NUMPAD1: 97, 
	/** 2 on the numeric keypad. */
	VK_NUMPAD2: 98, 
	/** 3 on the numeric keypad. */
	VK_NUMPAD3: 99, 
	/** 4 on the numeric keypad. */
	VK_NUMPAD4: 100, 
	/** 5 on the numeric keypad. */
	VK_NUMPAD5: 101, 
	/** 6 on the numeric keypad. */
	VK_NUMPAD6: 102, 
	/** 7 on the numeric keypad. */
	VK_NUMPAD7: 103, 
	/** 8 on the numeric keypad. */
	VK_NUMPAD8: 104, 
	/** 9 on the numeric keypad. */
	VK_NUMPAD9: 105, 
	/** * on the numeric keypad. */
	VK_MULTIPLY: 106,
	/** + on the numeric keypad. */
	VK_ADD: 107, 
	/***/
	VK_SEPARATOR: 108,
	/** - on the numeric keypad. */
	VK_SUBTRACT: 109, 
	/** Decimal point on the numeric keypad. */
	VK_DECIMAL: 110, 
	/** / on the numeric keypad. */
	VK_DIVIDE: 111, 
	/** F1 key. */
	VK_F1: 112, 
	/** F2 key. */
	VK_F2: 113, 
	/** F3 key. */
	VK_F3: 114, 
	/** F4 key. */
	VK_F4: 115, 
	/** F5 key. */
	VK_F5: 116, 
	/** F6 key. */
	VK_F6: 117, 
	/** F7 key. */
	VK_F7: 118, 
	/** F8 key. */
	VK_F8: 119, 
	/** F9 key. */
	VK_F9: 120, 
	/** F10 key. */
	VK_F10: 121, 
	/** F11 key. */
	VK_F11: 122, 
	/** F12 key. */
	VK_F12: 123, 
	/** F13 key. */
	VK_F13: 124, 
	/** F14 key. */
	VK_F14: 125, 
	/** F15 key. */
	VK_F15: 126, 
	/** F16 key. */
	VK_F16: 127, 
	/** F17 key. */
	VK_F17: 128, 
	/** F18 key. */
	VK_F18: 129, 
	/** F19 key. */
	VK_F19: 130, 
	/** F20 key. */
	VK_F20: 131, 
	/** F21 key. */
	VK_F21: 132, 
	/** F22 key. */
	VK_F22: 133, 
	/** F23 key. */
	VK_F23: 134, 
	/** F24 key. */
	VK_F24: 135, 
	/** Num Lock key. */
	VK_NUM_LOCK: 144, 
	/** Scroll Lock key. */
	VK_SCROLL_LOCK: 145, 
	/** Circumflex (^) key. Requires Gecko 15.0 */
	VK_CIRCUMFLEX: 160, 
	/** Exclamation (!) key. Requires Gecko 15.0 */
	VK_EXCLAMATION: 161, 
	/** Double quote () key. Requires Gecko 15.0 */
	VK_DOUBLE_QUOTE: 162, 
	/** Hash (#) key. Requires Gecko 15.0 */
	VK_HASH: 163, 
	/** Dollar sign ($) key. Requires Gecko 15.0 */
	VK_DOLLAR: 164, 
	/** Percent (%) key. Requires Gecko 15.0 */
	VK_PERCENT: 165, 
	/** Ampersand (&) key. Requires Gecko 15.0 */
	VK_AMPERSAND: 166, 
	/** Underscore (_) key. Requires Gecko 15.0 */
	VK_UNDERSCORE: 167, 
	/** Open parenthesis (() key. Requires Gecko 15.0 */
	VK_OPEN_PAREN: 168, 
	/** Close parenthesis ()) key. Requires Gecko 15.0 */
	VK_CLOSE_PAREN: 169, 
	/* Asterisk (*) key. Requires Gecko 15.0 */
	VK_ASTERISK: 170,
	/** Plus (+) key. Requires Gecko 15.0 */
	VK_PLUS: 171, 
	/** Pipe (|) key. Requires Gecko 15.0 */
	VK_PIPE: 172, 
	/** Hyphen-US/docs/Minus (-) key. Requires Gecko 15.0 */
	VK_HYPHEN_MINUS: 173, 
	/** Open curly bracket ({) key. Requires Gecko 15.0 */
	VK_OPEN_CURLY_BRACKET: 174, 
	/** Close curly bracket (}) key. Requires Gecko 15.0 */
	VK_CLOSE_CURLY_BRACKET: 175, 
	/** Tilde (~) key. Requires Gecko 15.0 */
	VK_TILDE: 176, 
	/** Comma (,) key. */
	VK_COMMA: 188, 
	/** Period (.) key. */
	VK_PERIOD: 190, 
	/** Slash (/) key. */
	VK_SLASH: 191, 
	/** Back tick (`) key. */
	VK_BACK_QUOTE: 192, 
	/** Open square bracket ([) key. */
	VK_OPEN_BRACKET: 219, 
	/** Back slash (\) key. */
	VK_BACK_SLASH: 220, 
	/** Close square bracket (]) key. */
	VK_CLOSE_BRACKET: 221, 
	/** Quote (''') key. */
	VK_QUOTE: 222, 
	/** Meta key on Linux, Command key on Mac. */
	VK_META: 224, 
	/** AltGr key on Linux. Requires Gecko 15.0 */
	VK_ALTGR: 225, 
	/** Windows logo key on Windows. Or Super or Hyper key on Linux. Requires Gecko 15.0 */
	VK_WIN: 91, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_KANA: 21, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_HANGUL: 21, 
	/** 英数 key on Japanese Mac keyboard. Requires Gecko 15.0 */
	VK_EISU: 22, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_JUNJA: 23, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_FINAL: 24, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_HANJA: 25, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_KANJI: 25, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_CONVERT: 28, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_NONCONVERT: 29, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_ACCEPT: 30, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_MODECHANGE: 31, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_SELECT: 41, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_PRINT: 42, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_EXECUTE: 43, 
	/** Linux support for this keycode was added in Gecko 4.0.	 */
	VK_SLEEP: 95 
};
/**
 * @namespace
 * Contains text tokenization and breaking routines
 */
ROT.Text = {
	RE_COLORS: /%([bc]){([^}]*)}/g,

	/* token types */
	TYPE_TEXT:		0,
	TYPE_NEWLINE:	1,
	TYPE_FG:		2,
	TYPE_BG:		3,

	/**
	 * Measure size of a resulting text block
	 */
	measure: function(str, maxWidth) {
		var result = {width:0, height:1};
		var tokens = this.tokenize(str, maxWidth);
		var lineWidth = 0;

		for (var i=0;i<tokens.length;i++) {
			var token = tokens[i];
			switch (token.type) {
				case this.TYPE_TEXT:
					lineWidth += token.value.length;
				break;

				case this.TYPE_NEWLINE:
					result.height++;
					result.width = Math.max(result.width, lineWidth);
					lineWidth = 0;
				break;
			}
		}
		result.width = Math.max(result.width, lineWidth);

		return result;
	},

	/**
	 * Convert string to a series of a formatting commands
	 */
	tokenize: function(str, maxWidth) {
		var result = [];

		/* first tokenization pass - split texts and color formatting commands */
		var offset = 0;
		str.replace(this.RE_COLORS, function(match, type, name, index) {
			/* string before */
			var part = str.substring(offset, index);
			if (part.length) {
				result.push({
					type: ROT.Text.TYPE_TEXT,
					value: part
				});
			}

			/* color command */
			result.push({
				type: (type == "c" ? ROT.Text.TYPE_FG : ROT.Text.TYPE_BG),
				value: name.trim()
			});

			offset = index + match.length;
			return "";
		});

		/* last remaining part */
		var part = str.substring(offset);
		if (part.length) {
			result.push({
				type: ROT.Text.TYPE_TEXT,
				value: part
			});
		}

		return this._breakLines(result, maxWidth);
	},

	/* insert line breaks into first-pass tokenized data */
	_breakLines: function(tokens, maxWidth) {
		if (!maxWidth) { maxWidth = Infinity; };

		var i = 0;
		var lineLength = 0;
		var lastTokenWithSpace = -1;

		while (i < tokens.length) { /* take all text tokens, remove space, apply linebreaks */
			var token = tokens[i];
			if (token.type == ROT.Text.TYPE_NEWLINE) { /* reset */
				lineLength = 0; 
				lastTokenWithSpace = -1;
			}
			if (token.type != ROT.Text.TYPE_TEXT) { /* skip non-text tokens */
				i++;
				continue; 
			}

			/* remove spaces at the beginning of line */
			while (lineLength == 0 && token.value.charAt(0) == " ") { token.value = token.value.substring(1); }

			/* forced newline? insert two new tokens after this one */
			var index = token.value.indexOf("\n");
			if (index != -1) { 
				token.value = this._breakInsideToken(tokens, i, index, true); 

				/* if there are spaces at the end, we must remove them (we do not want the line too long) */
				var arr = token.value.split("");
				while (arr[arr.length-1] == " ") { arr.pop(); }
				token.value = arr.join("");
			}

			/* token degenerated? */
			if (!token.value.length) {
				tokens.splice(i, 1);
				continue;
			}

			if (lineLength + token.value.length > maxWidth) { /* line too long, find a suitable breaking spot */

				/* is it possible to break within this token? */
				var index = -1;
				while (1) {
					var nextIndex = token.value.indexOf(" ", index+1);
					if (nextIndex == -1) { break; }
					if (lineLength + nextIndex > maxWidth) { break; }
					index = nextIndex;
				}

				if (index != -1) { /* break at space within this one */
					token.value = this._breakInsideToken(tokens, i, index, true);
				} else if (lastTokenWithSpace != -1) { /* is there a previous token where a break can occur? */
					var token = tokens[lastTokenWithSpace];
					var breakIndex = token.value.lastIndexOf(" ");
					token.value = this._breakInsideToken(tokens, lastTokenWithSpace, breakIndex, true);
					i = lastTokenWithSpace;
				} else { /* force break in this token */
					token.value = this._breakInsideToken(tokens, i, maxWidth-lineLength, false);
				}

			} else { /* line not long, continue */
				lineLength += token.value.length;
				if (token.value.indexOf(" ") != -1) { lastTokenWithSpace = i; }
			}
			
			i++; /* advance to next token */
		}


		tokens.push({type: ROT.Text.TYPE_NEWLINE}); /* insert fake newline to fix the last text line */

		/* remove trailing space from text tokens before newlines */
		var lastTextToken = null;
		for (var i=0;i<tokens.length;i++) {
			var token = tokens[i];
			switch (token.type) {
				case ROT.Text.TYPE_TEXT: lastTextToken = token; break;
				case ROT.Text.TYPE_NEWLINE: 
					if (lastTextToken) { /* remove trailing space */
						var arr = lastTextToken.value.split("");
						while (arr[arr.length-1] == " ") { arr.pop(); }
						lastTextToken.value = arr.join("");
					}
					lastTextToken = null;
				break;
			}
		}

		tokens.pop(); /* remove fake token */

		return tokens;
	},

	/**
	 * Create new tokens and insert them into the stream
	 * @param {object[]} tokens
	 * @param {int} tokenIndex Token being processed
	 * @param {int} breakIndex Index within current token's value
	 * @param {bool} removeBreakChar Do we want to remove the breaking character?
	 * @returns {string} remaining unbroken token value
	 */
	_breakInsideToken: function(tokens, tokenIndex, breakIndex, removeBreakChar) {
		var newBreakToken = {
			type: ROT.Text.TYPE_NEWLINE
		}
		var newTextToken = {
			type: ROT.Text.TYPE_TEXT,
			value: tokens[tokenIndex].value.substring(breakIndex + (removeBreakChar ? 1 : 0))
		}
		tokens.splice(tokenIndex+1, 0, newBreakToken, newTextToken);
		return tokens[tokenIndex].value.substring(0, breakIndex);
	}
}
/**
 * @returns {any} Randomly picked item, null when length=0
 */
Array.prototype.random = function() {
	if (!this.length) { return null; }
	return this[Math.floor(ROT.RNG.getUniform() * this.length)];
}

/**
 * @returns {array} New array with randomized items
 * FIXME destroys this!
 */
Array.prototype.randomize = function() {
	var result = [];
	while (this.length) {
		var index = this.indexOf(this.random());
		result.push(this.splice(index, 1)[0]);
	}
	return result;
}
/**
 * Always positive modulus
 * @param {int} n Modulus
 * @returns {int} this modulo n
 */
Number.prototype.mod = function(n) {
	return ((this%n)+n)%n;
}
/**
 * @returns {string} First letter capitalized
 */
String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.substring(1);
}

/** 
 * Left pad
 * @param {string} [character="0"]
 * @param {int} [count=2]
 */
String.prototype.lpad = function(character, count) {
	var ch = character || "0";
	var cnt = count || 2;

	var s = "";
	while (s.length < (cnt - this.length)) { s += ch; }
	s = s.substring(0, cnt-this.length);
	return s+this;
}

/** 
 * Right pad
 * @param {string} [character="0"]
 * @param {int} [count=2]
 */
String.prototype.rpad = function(character, count) {
	var ch = character || "0";
	var cnt = count || 2;

	var s = "";
	while (s.length < (cnt - this.length)) { s += ch; }
	s = s.substring(0, cnt-this.length);
	return this+s;
}

/**
 * Format a string in a flexible way. Scans for %s strings and replaces them with arguments. List of patterns is modifiable via String.format.map.
 * @param {string} template
 * @param {any} [argv]
 */
String.format = function(template) {
	var map = String.format.map;
	var args = Array.prototype.slice.call(arguments, 1);

	var replacer = function(match, group1, group2, index) {
		if (template.charAt(index-1) == "%") { return match.substring(1); }
		if (!args.length) { return match; }
		var obj = args[0];

		var group = group1 || group2;
		var parts = group.split(",");
		var name = parts.shift();
		var method = map[name.toLowerCase()];
		if (!method) { return match; }

		var obj = args.shift();
		var replaced = obj[method].apply(obj, parts);

		var first = name.charAt(0);
		if (first != first.toLowerCase()) { replaced = replaced.capitalize(); }

		return replaced;
	}
	return template.replace(/%(?:([a-z]+)|(?:{([^}]+)}))/gi, replacer);
}

String.format.map = {
	"s": "toString"
}

/**
 * Convenience shortcut to String.format(this)
 */
String.prototype.format = function() {
	var args = Array.prototype.slice.call(arguments);
	args.unshift(this);
	return String.format.apply(String, args);
}

if (!Object.create) {  
	/**
	 * ES5 Object.create
	 */
	Object.create = function(o) {  
		var tmp = function() {};
		tmp.prototype = o;
		return new tmp();
	};  
}  
/**
 * Sets prototype of this function to an instance of parent function
 * @param {function} parent
 */
Function.prototype.extend = function(parent) {
	this.prototype = Object.create(parent.prototype);
	this.prototype.constructor = this;
	return this;
}
window.requestAnimationFrame =
	window.requestAnimationFrame
	|| window.mozRequestAnimationFrame
	|| window.webkitRequestAnimationFrame
	|| window.oRequestAnimationFrame
	|| window.msRequestAnimationFrame
	|| function(cb) { return setTimeout(cb, 1000/60); };

window.cancelAnimationFrame =
	window.cancelAnimationFrame
	|| window.mozCancelAnimationFrame
	|| window.webkitCancelAnimationFrame
	|| window.oCancelAnimationFrame
	|| window.msCancelAnimationFrame
	|| function(id) { return clearTimeout(id); };
/**
 * @class Visual map display
 * @param {object} [options]
 * @param {int} [options.width=ROT.DEFAULT_WIDTH]
 * @param {int} [options.height=ROT.DEFAULT_HEIGHT]
 * @param {int} [options.fontSize=15]
 * @param {string} [options.fontFamily="monospace"]
 * @param {string} [options.fontStyle=""] bold/italic/none/both
 * @param {string} [options.fg="#ccc"]
 * @param {string} [options.bg="#000"]
 * @param {float} [options.spacing=1]
 * @param {float} [options.border=0]
 * @param {string} [options.layout="rect"]
 * @param {int} [options.tileWidth=32]
 * @param {int} [options.tileHeight=32]
 * @param {object} [options.tileMap={}]
 * @param {image} [options.tileSet=null]
 */
ROT.Display = function(options) {
	var canvas = document.createElement("canvas");
	this._context = canvas.getContext("2d");
	this._data = {};
	this._dirty = false; /* false = nothing, true = all, object = dirty cells */
	this._options = {};
	this._backend = null;
	
	var defaultOptions = {
		width: ROT.DEFAULT_WIDTH,
		height: ROT.DEFAULT_HEIGHT,
		layout: "rect",
		fontSize: 15,
		spacing: 1,
		border: 0,
		fontFamily: "monospace",
		fontStyle: "",
		fg: "#ccc",
		bg: "#000",
		tileWidth: 32,
		tileHeight: 32,
		tileMap: {},
		tileSet: null
	};
	for (var p in options) { defaultOptions[p] = options[p]; }
	this.setOptions(defaultOptions);
	this.DEBUG = this.DEBUG.bind(this);

	this._tick = this._tick.bind(this);
	requestAnimationFrame(this._tick);
}

/**
 * Debug helper, ideal as a map generator callback. Always bound to this.
 * @param {int} x
 * @param {int} y
 * @param {int} what
 */
ROT.Display.prototype.DEBUG = function(x, y, what) {
	var colors = [this._options.bg, this._options.fg];
	this.draw(x, y, null, null, colors[what % colors.length]);
}

/**
 * Clear the whole display (cover it with background color)
 */
ROT.Display.prototype.clear = function() {
	this._data = {};
	this._dirty = true;
}

/**
 * @see ROT.Display
 */
ROT.Display.prototype.setOptions = function(options) {
	for (var p in options) { this._options[p] = options[p]; }
	if (options.width || options.height || options.fontSize || options.fontFamily || options.spacing || options.layout) {
		if (options.layout) { 
			this._backend = new ROT.Display[options.layout.capitalize()](this._context);
		}

		var font = (this._options.fontStyle ? this._options.fontStyle + " " : "") + this._options.fontSize + "px " + this._options.fontFamily;
		this._context.font = font;
		this._backend.compute(this._options);
		this._context.font = font;
		this._context.textAlign = "center";
		this._context.textBaseline = "middle";
		this._dirty = true;
	}
	return this;
}

/**
 * Returns currently set options
 * @returns {object} Current options object 
 */
ROT.Display.prototype.getOptions = function() {
	return this._options;
}

/**
 * Returns the DOM node of this display
 * @returns {node} DOM node
 */
ROT.Display.prototype.getContainer = function() {
	return this._context.canvas;
}

/**
 * Compute the maximum width/height to fit into a set of given constraints
 * @param {int} availWidth Maximum allowed pixel width
 * @param {int} availHeight Maximum allowed pixel height
 * @returns {int[2]} cellWidth,cellHeight
 */
ROT.Display.prototype.computeSize = function(availWidth, availHeight) {
	return this._backend.computeSize(availWidth, availHeight, this._options);
}

/**
 * Compute the maximum font size to fit into a set of given constraints
 * @param {int} availWidth Maximum allowed pixel width
 * @param {int} availHeight Maximum allowed pixel height
 * @returns {int} fontSize
 */
ROT.Display.prototype.computeFontSize = function(availWidth, availHeight) {
	return this._backend.computeFontSize(availWidth, availHeight, this._options);
}

/**
 * Convert a DOM event (mouse or touch) to map coordinates. Uses first touch for multi-touch.
 * @param {Event} e event
 * @returns {int[2]} -1 for values outside of the canvas
 */
ROT.Display.prototype.eventToPosition = function(e) {
	if (e.touches) {
		var x = e.touches[0].clientX;
		var y = e.touches[0].clientY;
	} else {
		var x = e.clientX;
		var y = e.clientY;
	}

	var rect = this._context.canvas.getBoundingClientRect();
	x -= rect.left;
	y -= rect.top;
	
	if (x < 0 || y < 0 || x >= this._context.canvas.width || y >= this._context.canvas.height) { return [-1, -1]; }

	return this._backend.eventToPosition(x, y);
}

/**
 * @param {int} x
 * @param {int} y
 * @param {string || string[]} ch One or more chars (will be overlapping themselves)
 * @param {string} [fg] foreground color
 * @param {string} [bg] background color
 */
ROT.Display.prototype.draw = function(x, y, ch, fg, bg) {
	if (!fg) { fg = this._options.fg; }
	if (!bg) { bg = this._options.bg; }
	this._data[x+","+y] = [x, y, ch, fg, bg];
	
	if (this._dirty === true) { return; } /* will already redraw everything */
	if (!this._dirty) { this._dirty = {}; } /* first! */
	this._dirty[x+","+y] = true;
}

/**
 * Draws a text at given position. Optionally wraps at a maximum length. Currently does not work with hex layout.
 * @param {int} x
 * @param {int} y
 * @param {string} text May contain color/background format specifiers, %c{name}/%b{name}, both optional. %c{}/%b{} resets to default.
 * @param {int} [maxWidth] wrap at what width?
 * @returns {int} lines drawn
 */
ROT.Display.prototype.drawText = function(x, y, text, maxWidth) {
	var fg = null;
	var bg = null;
	var cx = x;
	var cy = y;
	var lines = 1;
	if (!maxWidth) { maxWidth = this._options.width-x; }

	var tokens = ROT.Text.tokenize(text, maxWidth);

	while (tokens.length) { /* interpret tokenized opcode stream */
		var token = tokens.shift();
		switch (token.type) {
			case ROT.Text.TYPE_TEXT:
				for (var i=0;i<token.value.length;i++) {
					this.draw(cx++, cy, token.value.charAt(i), fg, bg);
				}
			break;

			case ROT.Text.TYPE_FG:
				fg = token.value || null;
			break;

			case ROT.Text.TYPE_BG:
				bg = token.value || null;
			break;

			case ROT.Text.TYPE_NEWLINE:
				cx = x;
				cy++;
				lines++
			break;
		}
	}

	return lines;
}

/**
 * Timer tick: update dirty parts
 */
ROT.Display.prototype._tick = function() {
	requestAnimationFrame(this._tick);

	if (!this._dirty) { return; }

	if (this._dirty === true) { /* draw all */
		this._context.fillStyle = this._options.bg;
		this._context.fillRect(0, 0, this._context.canvas.width, this._context.canvas.height);

		for (var id in this._data) { /* redraw cached data */
			this._draw(id, false);
		}

	} else { /* draw only dirty */
		for (var key in this._dirty) {
			this._draw(key, true);
		}
	}

	this._dirty = false;
}

/**
 * @param {string} key What to draw
 * @param {bool} clearBefore Is it necessary to clean before?
 */
ROT.Display.prototype._draw = function(key, clearBefore) {
	var data = this._data[key];
	if (data[4] != this._options.bg) { clearBefore = true; }

	this._backend.draw(data, clearBefore);
}
/**
 * @class Abstract display backend module
 * @private
 */
ROT.Display.Backend = function(context) {
	this._context = context;
}

ROT.Display.Backend.prototype.compute = function(options) {
}

ROT.Display.Backend.prototype.draw = function(data, clearBefore) {
}

ROT.Display.Backend.prototype.computeSize = function(availWidth, availHeight) {
}

ROT.Display.Backend.prototype.computeFontSize = function(availWidth, availHeight) {
}

ROT.Display.Backend.prototype.eventToPosition = function(x, y) {
}
/**
 * @class Rectangular backend
 * @private
 */
ROT.Display.Rect = function(context) {
	ROT.Display.Backend.call(this, context);
	
	this._spacingX = 0;
	this._spacingY = 0;
	this._canvasCache = {};
	this._options = {};
}
ROT.Display.Rect.extend(ROT.Display.Backend);

ROT.Display.Rect.cache = false;

ROT.Display.Rect.prototype.compute = function(options) {
	this._canvasCache = {};
	this._options = options;

	var charWidth = Math.ceil(this._context.measureText("W").width);
	this._spacingX = Math.ceil(options.spacing * charWidth);
	this._spacingY = Math.ceil(options.spacing * options.fontSize);
	this._context.canvas.width = options.width * this._spacingX;
	this._context.canvas.height = options.height * this._spacingY;
}

ROT.Display.Rect.prototype.draw = function(data, clearBefore) {
	if (this.constructor.cache) {
		this._drawWithCache(data, clearBefore);
	} else {
		this._drawNoCache(data, clearBefore);
	}
}

ROT.Display.Rect.prototype._drawWithCache = function(data, clearBefore) {
	var x = data[0];
	var y = data[1];
	var ch = data[2];
	var fg = data[3];
	var bg = data[4];

	var hash = ""+ch+fg+bg;
	if (hash in this._canvasCache) {
		var canvas = this._canvasCache[hash];
	} else {
		var b = this._options.border;
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		canvas.width = this._spacingX;
		canvas.height = this._spacingY;
		ctx.fillStyle = bg;
		ctx.fillRect(b, b, canvas.width-b, canvas.height-b);
		
		if (ch) {
			ctx.fillStyle = fg;
			ctx.font = this._context.font;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			var chars = [].concat(ch);
			for (var i=0;i<chars.length;i++) {
				ctx.fillText(chars[i], this._spacingX/2, this._spacingY/2);
			}
		}
		this._canvasCache[hash] = canvas;
	}
	
	this._context.drawImage(canvas, x*this._spacingX, y*this._spacingY);
}

ROT.Display.Rect.prototype._drawNoCache = function(data, clearBefore) {
	var x = data[0];
	var y = data[1];
	var ch = data[2];
	var fg = data[3];
	var bg = data[4];

	if (clearBefore) { 
		var b = this._options.border;
		this._context.fillStyle = bg;
		this._context.fillRect(x*this._spacingX + b, y*this._spacingY + b, this._spacingX - b, this._spacingY - b);
	}
	
	if (!ch) { return; }

	this._context.fillStyle = fg;

	var chars = [].concat(ch);
	for (var i=0;i<chars.length;i++) {
		this._context.fillText(chars[i], (x+0.5) * this._spacingX, (y+0.5) * this._spacingY);
	}
}

ROT.Display.Rect.prototype.computeSize = function(availWidth, availHeight) {
	var width = Math.floor(availWidth / this._spacingX);
	var height = Math.floor(availHeight / this._spacingY);
	return [width, height];
}

ROT.Display.Rect.prototype.computeFontSize = function(availWidth, availHeight) {
	var boxWidth = Math.floor(availWidth / this._options.width);
	var boxHeight = Math.floor(availHeight / this._options.height);

	/* compute char ratio */
	var oldFont = this._context.font;
	this._context.font = "100px " + this._options.fontFamily;
	var width = Math.ceil(this._context.measureText("W").width);
	this._context.font = oldFont;
	var ratio = width / 100;
		
	var widthFraction = ratio * boxHeight / boxWidth;
	if (widthFraction > 1) { /* too wide with current aspect ratio */
		boxHeight = Math.floor(boxHeight / widthFraction);
	}
	return Math.floor(boxHeight / this._options.spacing);
}

ROT.Display.Rect.prototype.eventToPosition = function(x, y) {
	return [Math.floor(x/this._spacingX), Math.floor(y/this._spacingY)];
}
/**
 * @class Hexagonal backend
 * @private
 */
ROT.Display.Hex = function(context) {
	ROT.Display.Backend.call(this, context);

	this._spacingX = 0;
	this._spacingY = 0;
	this._hexSize = 0;
	this._options = {};
}
ROT.Display.Hex.extend(ROT.Display.Backend);

ROT.Display.Hex.prototype.compute = function(options) {
	this._options = options;

	var charWidth = Math.ceil(this._context.measureText("W").width);
	this._hexSize = Math.floor(options.spacing * (options.fontSize + charWidth/Math.sqrt(3)) / 2);
	this._spacingX = this._hexSize * Math.sqrt(3) / 2;
	this._spacingY = this._hexSize * 1.5;
	this._context.canvas.width = Math.ceil( (options.width + 1) * this._spacingX );
	this._context.canvas.height = Math.ceil( (options.height - 1) * this._spacingY + 2*this._hexSize );
}

ROT.Display.Hex.prototype.draw = function(data, clearBefore) {
	var x = data[0];
	var y = data[1];
	var ch = data[2];
	var fg = data[3];
	var bg = data[4];

	var cx = (x+1) * this._spacingX;
	var cy = y * this._spacingY + this._hexSize;

	if (clearBefore) { 
		this._context.fillStyle = bg;
		this._fill(cx, cy);
	}
	
	if (!ch) { return; }

	this._context.fillStyle = fg;

	var chars = [].concat(ch);
	for (var i=0;i<chars.length;i++) {
		this._context.fillText(chars[i], cx, cy);
	}
}


ROT.Display.Hex.prototype.computeSize = function(availWidth, availHeight) {
	var width = Math.floor(availWidth / this._spacingX) - 1;
	var height = Math.floor((availHeight - 2*this._hexSize) / this._spacingY + 1);
	return [width, height];
}

ROT.Display.Hex.prototype.computeFontSize = function(availWidth, availHeight) {
	var hexSizeWidth = 2*availWidth / ((this._options.width+1) * Math.sqrt(3)) - 1;
	var hexSizeHeight = availHeight / (2 + 1.5*(this._options.height-1));
	var hexSize = Math.min(hexSizeWidth, hexSizeHeight);

	/* compute char ratio */
	var oldFont = this._context.font;
	this._context.font = "100px " + this._options.fontFamily;
	var width = Math.ceil(this._context.measureText("W").width);
	this._context.font = oldFont;
	var ratio = width / 100;

	hexSize = Math.floor(hexSize)+1; /* closest larger hexSize */

	var fontSize = 2*hexSize / (this._options.spacing * (1 + ratio / Math.sqrt(3)));

	/* closest smaller fontSize */
	return Math.ceil(fontSize)-1;
}

ROT.Display.Hex.prototype.eventToPosition = function(x, y) {
	var height = this._context.canvas.height / this._options.height;
	y = Math.floor(y/height);
	
	if (y.mod(2)) { /* odd row */
		x -= this._spacingX;
		x = 1 + 2*Math.floor(x/(2*this._spacingX));
	} else {
		x = 2*Math.floor(x/(2*this._spacingX));
	}
	
	return [x, y];
}

ROT.Display.Hex.prototype._fill = function(cx, cy) {
	var a = this._hexSize;
	var b = this._options.border;
	
	this._context.beginPath();
	this._context.moveTo(cx, cy-a+b);
	this._context.lineTo(cx + this._spacingX - b, cy-a/2+b);
	this._context.lineTo(cx + this._spacingX - b, cy+a/2-b);
	this._context.lineTo(cx, cy+a-b);
	this._context.lineTo(cx - this._spacingX + b, cy+a/2-b);
	this._context.lineTo(cx - this._spacingX + b, cy-a/2+b);
	this._context.lineTo(cx, cy-a+b);
	this._context.fill();
}
/**
 * @class Tile backend
 * @private
 */
ROT.Display.Tile = function(context) {
	ROT.Display.Rect.call(this, context);
	
	this._options = {};
}
ROT.Display.Tile.extend(ROT.Display.Rect);

ROT.Display.Tile.prototype.compute = function(options) {
	this._options = options;
	this._context.canvas.width = options.width * options.tileWidth;
	this._context.canvas.height = options.height * options.tileHeight;
}

ROT.Display.Tile.prototype.draw = function(data, clearBefore) {
	var x = data[0];
	var y = data[1];
	var ch = data[2];
	var fg = data[3];
	var bg = data[4];

	var tileWidth = this._options.tileWidth;
	var tileHeight = this._options.tileHeight;

	if (clearBefore) {
		var b = this._options.border;
		this._context.fillStyle = bg;
		this._context.fillRect(x*tileWidth, y*tileHeight, tileWidth, tileHeight);
	}

	if (!ch) { return; }

	var chars = [].concat(ch);
	for (var i=0;i<chars.length;i++) {
		var tile = this._options.tileMap[chars[i]];
		if (!tile) { throw new Error("Char '" + chars[i] + "' not found in tileMap"); }
		
		this._context.drawImage(
			this._options.tileSet,
			tile[0], tile[1], tileWidth, tileHeight,
			x*tileWidth, y*tileHeight, tileWidth, tileHeight
		);
	}
}

ROT.Display.Tile.prototype.computeSize = function(availWidth, availHeight) {
	var width = Math.floor(availWidth / this._options.tileWidth);
	var height = Math.floor(availHeight / this._options.tileHeight);
	return [width, height];
}

ROT.Display.Tile.prototype.computeFontSize = function(availWidth, availHeight) {
	var width = Math.floor(availWidth / this._options.width);
	var height = Math.floor(availHeight / this._options.height);
	return [width, height];
}
/**
 * @namespace
 * This code is an implementation of Alea algorithm; (C) 2010 Johannes Baagøe.
 * Alea is licensed according to the http://en.wikipedia.org/wiki/MIT_License.
 */
ROT.RNG = {
	/**
	 * @returns {number} 
	 */
	getSeed: function() {
		return this._seed;
	},

	/**
	 * @param {number} seed Seed the number generator
	 */
	setSeed: function(seed) {
		seed = (seed < 1 ? 1/seed : seed);

		this._seed = seed;
		this._s0 = (seed >>> 0) * this._frac;

		seed = (seed*69069 + 1) >>> 0;
		this._s1 = seed * this._frac;

		seed = (seed*69069 + 1) >>> 0;
		this._s2 = seed * this._frac;

		this._c = 1;
		return this;
	},

	/**
	 * @returns {float} Pseudorandom value [0,1), uniformly distributed
	 */
	getUniform: function() {
		var t = 2091639 * this._s0 + this._c * this._frac;
		this._s0 = this._s1;
		this._s1 = this._s2;
		this._c = t | 0;
		this._s2 = t - this._c;
		return this._s2;
	},

	/**
	 * @param {int} lowerBound The lower end of the range to return a value from, inclusive
	 * @param {int} upperBound The upper end of the range to return a value from, inclusive
	 * @returns {int} Pseudorandom value [lowerBound, upperBound], using ROT.RNG.getUniform() to distribute the value
	 */
	getUniformInt: function(lowerBound, upperBound) {
		var max = Math.max(lowerBound, upperBound);
		var min = Math.min(lowerBound, upperBound);
		return Math.floor(this.getUniform() * (max - min + 1)) + min;
	},

	/**
	 * @param {float} [mean=0] Mean value
	 * @param {float} [stddev=1] Standard deviation. ~95% of the absolute values will be lower than 2*stddev.
	 * @returns {float} A normally distributed pseudorandom value
	 */
	getNormal: function(mean, stddev) {
		do {
			var u = 2*this.getUniform()-1;
			var v = 2*this.getUniform()-1;
			var r = u*u + v*v;
		} while (r > 1 || r == 0);

		var gauss = u * Math.sqrt(-2*Math.log(r)/r);
		return (mean || 0) + gauss*(stddev || 1);
	},

	/**
	 * @returns {int} Pseudorandom value [1,100] inclusive, uniformly distributed
	 */
	getPercentage: function() {
		return 1 + Math.floor(this.getUniform()*100);
	},
	
	/**
	 * @param {object} data key=whatever, value=weight (relative probability)
	 * @returns {string} whatever
	 */
	getWeightedValue: function(data) {
		var avail = [];
		var total = 0;
		
		for (var id in data) {
			total += data[id];
		}
		var random = Math.floor(this.getUniform()*total);
		
		var part = 0;
		for (var id in data) {
			part += data[id];
			if (random < part) { return id; }
		}
		
		return null;
	},

	/**
	 * Get RNG state. Useful for storing the state and re-setting it via setState.
	 * @returns {?} Internal state
	 */
	getState: function() {
		return [this._s0, this._s1, this._s2, this._c];
	},

	/**
	 * Set a previously retrieved state.
	 * @param {?} state
	 */
	setState: function(state) {
		this._s0 = state[0];
		this._s1 = state[1];
		this._s2 = state[2];
		this._c  = state[3];
		return this;
	},

	_s0: 0,
	_s1: 0,
	_s2: 0,
	_c: 0,
	_frac: 2.3283064365386963e-10 /* 2^-32 */
}

ROT.RNG.setSeed(Date.now());
/**
 * @class (Markov process)-based string generator. 
 * Copied from a <a href="http://www.roguebasin.roguelikedevelopment.org/index.php?title=Names_from_a_high_order_Markov_Process_and_a_simplified_Katz_back-off_scheme">RogueBasin article</a>. 
 * Offers configurable order and prior.
 * @param {object} [options]
 * @param {bool} [options.words=false] Use word mode?
 * @param {int} [options.order=3]
 * @param {float} [options.prior=0.001]
 */
ROT.StringGenerator = function(options) {
	this._options = {
		words: false,
		order: 3,
		prior: 0.001
	}
	for (var p in options) { this._options[p] = options[p]; }

	this._boundary = String.fromCharCode(0);
	this._suffix = this._boundary;
	this._prefix = [];
	for (var i=0;i<this._options.order;i++) { this._prefix.push(this._boundary); }

	this._priorValues = {};
	this._priorValues[this._boundary] = this._options.prior;

	this._data = {};
}

/**
 * Remove all learning data
 */
ROT.StringGenerator.prototype.clear = function() {
	this._data = {};
	this._priorValues = {};
}

/**
 * @returns {string} Generated string
 */
ROT.StringGenerator.prototype.generate = function() {
	var result = [this._sample(this._prefix)];
	while (result[result.length-1] != this._boundary) {
		result.push(this._sample(result));
	}
	return this._join(result.slice(0, -1));
}

/**
 * Observe (learn) a string from a training set
 */
ROT.StringGenerator.prototype.observe = function(string) {
	var tokens = this._split(string);

	for (var i=0; i<tokens.length; i++) {
		this._priorValues[tokens[i]] = this._options.prior;
	}

	tokens = this._prefix.concat(tokens).concat(this._suffix); /* add boundary symbols */

	for (var i=this._options.order; i<tokens.length; i++) {
		var context = tokens.slice(i-this._options.order, i);
		var event = tokens[i];
		for (var j=0; j<context.length; j++) {
			var subcontext = context.slice(j);
			this._observeEvent(subcontext, event);
		}
	}
}

ROT.StringGenerator.prototype.getStats = function() {
	var parts = [];

	var priorCount = 0;
	for (var p in this._priorValues) { priorCount++; }
	priorCount--; /* boundary */
	parts.push("distinct samples: " + priorCount);

	var dataCount = 0;
	var eventCount = 0;
	for (var p in this._data) { 
		dataCount++; 
		for (var key in this._data[p]) {
			eventCount++;
		}
	}
	parts.push("dictionary size (contexts): " + dataCount);
	parts.push("dictionary size (events): " + eventCount);

	return parts.join(", ");
}

/**
 * @param {string}
 * @returns {string[]}
 */
ROT.StringGenerator.prototype._split = function(str) {
	return str.split(this._options.words ? /\s+/ : "");
}

/**
 * @param {string[]}
 * @returns {string} 
 */
ROT.StringGenerator.prototype._join = function(arr) {
	return arr.join(this._options.words ? " " : "");
}

/**
 * @param {string[]} context
 * @param {string} event
 */
ROT.StringGenerator.prototype._observeEvent = function(context, event) {
	var key = this._join(context);
	if (!(key in this._data)) { this._data[key] = {}; }
	var data = this._data[key];

	if (!(event in data)) { data[event] = 0; }
	data[event]++;
}

/**
 * @param {string[]}
 * @returns {string}
 */
ROT.StringGenerator.prototype._sample = function(context) {
	context = this._backoff(context);
	var key = this._join(context);
	var data = this._data[key];

	var available = {};

	if (this._options.prior) {
		for (var event in this._priorValues) { available[event] = this._priorValues[event]; }
		for (var event in data) { available[event] += data[event]; }
	} else { 
		available = data;
	}

	return this._pickRandom(available);
}

/**
 * @param {string[]}
 * @returns {string[]}
 */
ROT.StringGenerator.prototype._backoff = function(context) {
	if (context.length > this._options.order) {
		context = context.slice(-this._options.order);
	} else if (context.length < this._options.order) {
		context = this._prefix.slice(0, this._options.order - context.length).concat(context);
	}

	while (!(this._join(context) in this._data) && context.length > 0) { context = context.slice(1); }

	return context;
}


ROT.StringGenerator.prototype._pickRandom = function(data) {
	var total = 0;
	
	for (var id in data) {
		total += data[id];
	}
	var random = ROT.RNG.getUniform()*total;
	
	var part = 0;
	for (var id in data) {
		part += data[id];
		if (random < part) { return id; }
	}
}
/**
 * @class Generic event queue: stores events and retrieves them based on their time
 */
ROT.EventQueue = function() {
	this._time = 0;
	this._events = [];
	this._eventTimes = [];
}

/**
 * @returns {number} Elapsed time
 */
ROT.EventQueue.prototype.getTime = function() {
	return this._time;
}

/**
 * Clear all scheduled events
 */
ROT.EventQueue.prototype.clear = function() {
	this._events = [];
	this._eventTimes = [];
	return this;
}

/**
 * @param {?} event
 * @param {number} time
 */
ROT.EventQueue.prototype.add = function(event, time) {
	var index = this._events.length;
	for (var i=0;i<this._eventTimes.length;i++) {
		if (this._eventTimes[i] > time) {
			index = i;
			break;
		}
	}

	this._events.splice(index, 0, event);
	this._eventTimes.splice(index, 0, time);
}

/**
 * Locates the nearest event, advances time if necessary. Returns that event and removes it from the queue.
 * @returns {? || null} The event previously added by addEvent, null if no event available
 */
ROT.EventQueue.prototype.get = function() {
	if (!this._events.length) { return null; }

	var time = this._eventTimes.splice(0, 1)[0];
	if (time > 0) { /* advance */
		this._time += time;
		for (var i=0;i<this._eventTimes.length;i++) { this._eventTimes[i] -= time; }
	}

	return this._events.splice(0, 1)[0];
}

/**
 * Remove an event from the queue
 * @param {?} event
 * @returns {bool} success?
 */
ROT.EventQueue.prototype.remove = function(event) {
	var index = this._events.indexOf(event);
	if (index == -1) { return false }
	this._remove(index);
	return true;
}

/**
 * Remove an event from the queue
 * @param {int} index
 */
ROT.EventQueue.prototype._remove = function(index) {
	this._events.splice(index, 1);
	this._eventTimes.splice(index, 1);
}
/**
 * @class Abstract scheduler
 */
ROT.Scheduler = function() {
	this._queue = new ROT.EventQueue();
	this._repeat = [];
	this._current = null;
}

/**
 * @see ROT.EventQueue#getTime
 */
ROT.Scheduler.prototype.getTime = function() {
	return this._queue.getTime();
}

/**
 * @param {?} item
 * @param {bool} repeat
 */
ROT.Scheduler.prototype.add = function(item, repeat) {
	if (repeat) { this._repeat.push(item); }
	return this;
}

/**
 * Clear all items
 */
ROT.Scheduler.prototype.clear = function() {
	this._queue.clear();
	this._repeat = [];
	this._current = null;
	return this;
}

/**
 * Remove a previously added item
 * @param {?} item
 * @returns {bool} successful?
 */
ROT.Scheduler.prototype.remove = function(item) {
	var result = this._queue.remove(item);

	var index = this._repeat.indexOf(item);
	if (index != -1) { this._repeat.splice(index, 1); }

	if (this._current == item) { this._current = null; }

	return result;
}

/**
 * Schedule next item
 * @returns {?}
 */
ROT.Scheduler.prototype.next = function() {
	this._current = this._queue.get();
	return this._current;
}
/**
 * @class Simple fair scheduler (round-robin style)
 * @augments ROT.Scheduler
 */
ROT.Scheduler.Simple = function() {
	ROT.Scheduler.call(this);
}
ROT.Scheduler.Simple.extend(ROT.Scheduler);

/**
 * @see ROT.Scheduler#add
 */
ROT.Scheduler.Simple.prototype.add = function(item, repeat) {
	this._queue.add(item, 0);
	return ROT.Scheduler.prototype.add.call(this, item, repeat);
}

/**
 * @see ROT.Scheduler#next
 */
ROT.Scheduler.Simple.prototype.next = function() {
	if (this._current && this._repeat.indexOf(this._current) != -1) {
		this._queue.add(this._current, 0);
	}
	return ROT.Scheduler.prototype.next.call(this);
}
/**
 * @class Speed-based scheduler
 * @augments ROT.Scheduler
 */
ROT.Scheduler.Speed = function() {
	ROT.Scheduler.call(this);
}
ROT.Scheduler.Speed.extend(ROT.Scheduler);

/**
 * @param {object} item anything with "getSpeed" method
 * @param {bool} repeat
 * @see ROT.Scheduler#add
 */
ROT.Scheduler.Speed.prototype.add = function(item, repeat) {
	this._queue.add(item, 1/item.getSpeed());
	return ROT.Scheduler.prototype.add.call(this, item, repeat);
}

/**
 * @see ROT.Scheduler#next
 */
ROT.Scheduler.Speed.prototype.next = function() {
	if (this._current && this._repeat.indexOf(this._current) != -1) {
		this._queue.add(this._current, 1/this._current.getSpeed());
	}
	return ROT.Scheduler.prototype.next.call(this);
}
/**
 * @class Action-based scheduler
 * @augments ROT.Scheduler
 */
ROT.Scheduler.Action = function() {
	ROT.Scheduler.call(this);
	this._defaultDuration = 1; /* for newly added */
	this._duration = this._defaultDuration; /* for this._current */
}
ROT.Scheduler.Action.extend(ROT.Scheduler);

/**
 * @param {object} item
 * @param {bool} repeat
 * @param {number} [time=1]
 * @see ROT.Scheduler#add
 */
ROT.Scheduler.Action.prototype.add = function(item, repeat, time) {
	this._queue.add(item, time || this._defaultDuration);
	return ROT.Scheduler.prototype.add.call(this, item, repeat);
}

ROT.Scheduler.Action.prototype.clear = function() {
	this._duration = this._defaultDuration;
	return ROT.Scheduler.prototype.clear.call(this);
}

ROT.Scheduler.Action.prototype.remove = function(item) {
	if (item == this._current) { this._duration = this._defaultDuration; }
	return ROT.Scheduler.prototype.remove.call(this, item);
}

/**
 * @see ROT.Scheduler#next
 */
ROT.Scheduler.Action.prototype.next = function() {
	if (this._current && this._repeat.indexOf(this._current) != -1) {
		this._queue.add(this._current, this._duration || this._defaultDuration);
		this._duration = this._defaultDuration;
	}
	return ROT.Scheduler.prototype.next.call(this);
}

/**
 * Set duration for the active item
 */
ROT.Scheduler.Action.prototype.setDuration = function(time) {
	if (this._current) { this._duration = time; }
	return this;
}
/**
 * @class Asynchronous main loop
 * @param {ROT.Scheduler} scheduler
 */
ROT.Engine = function(scheduler) {
	this._scheduler = scheduler;
	this._lock = 1;
}

/**
 * Start the main loop. When this call returns, the loop is locked.
 */
ROT.Engine.prototype.start = function() {
	return this.unlock();
}

/**
 * Interrupt the engine by an asynchronous action
 */
ROT.Engine.prototype.lock = function() {
	this._lock++;
	return this;
}

/**
 * Resume execution (paused by a previous lock)
 */
ROT.Engine.prototype.unlock = function() {
	if (!this._lock) { throw new Error("Cannot unlock unlocked engine"); }
	this._lock--;

	while (!this._lock) {
		var actor = this._scheduler.next();
		if (!actor) { return this.lock(); } /* no actors */
		var result = actor.act();
		if (result && result.then) { /* actor returned a "thenable", looks like a Promise */
			this.lock();
			result.then(this.unlock.bind(this));
		}
	}

	return this;
}
/**
 * @class Base map generator
 * @param {int} [width=ROT.DEFAULT_WIDTH]
 * @param {int} [height=ROT.DEFAULT_HEIGHT]
 */
ROT.Map = function(width, height) {
	this._width = width || ROT.DEFAULT_WIDTH;
	this._height = height || ROT.DEFAULT_HEIGHT;
};

ROT.Map.prototype.create = function(callback) {}

ROT.Map.prototype._fillMap = function(value) {
	var map = [];
	for (var i=0;i<this._width;i++) {
		map.push([]);
		for (var j=0;j<this._height;j++) { map[i].push(value); }
	}
	return map;
}
/**
 * @class Simple empty rectangular room
 * @augments ROT.Map
 */
ROT.Map.Arena = function(width, height) {
	ROT.Map.call(this, width, height);
}
ROT.Map.Arena.extend(ROT.Map);

ROT.Map.Arena.prototype.create = function(callback) {
	var w = this._width-1;
	var h = this._height-1;
	for (var i=0;i<=w;i++) {
		for (var j=0;j<=h;j++) {
			var empty = (i && j && i<w && j<h);
			callback(i, j, empty ? 0 : 1);
		}
	}
	return this;
}
/**
 * @class Recursively divided maze, http://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_division_method
 * @augments ROT.Map
 */
ROT.Map.DividedMaze = function(width, height) {
	ROT.Map.call(this, width, height);
	this._stack = [];
}
ROT.Map.DividedMaze.extend(ROT.Map);

ROT.Map.DividedMaze.prototype.create = function(callback) {
	var w = this._width;
	var h = this._height;
	
	this._map = [];
	
	for (var i=0;i<w;i++) {
		this._map.push([]);
		for (var j=0;j<h;j++) {
			var border = (i == 0 || j == 0 || i+1 == w || j+1 == h);
			this._map[i].push(border ? 1 : 0);
		}
	}
	
	this._stack = [
		[1, 1, w-2, h-2]
	];
	this._process();
	
	for (var i=0;i<w;i++) {
		for (var j=0;j<h;j++) {
			callback(i, j, this._map[i][j]);
		}
	}
	this._map = null;
	return this;
}

ROT.Map.DividedMaze.prototype._process = function() {
	while (this._stack.length) {
		var room = this._stack.shift(); /* [left, top, right, bottom] */
		this._partitionRoom(room);
	}
}

ROT.Map.DividedMaze.prototype._partitionRoom = function(room) {
	var availX = [];
	var availY = [];
	
	for (var i=room[0]+1;i<room[2];i++) {
		var top = this._map[i][room[1]-1];
		var bottom = this._map[i][room[3]+1];
		if (top && bottom && !(i % 2)) { availX.push(i); }
	}
	
	for (var j=room[1]+1;j<room[3];j++) {
		var left = this._map[room[0]-1][j];
		var right = this._map[room[2]+1][j];
		if (left && right && !(j % 2)) { availY.push(j); }
	}

	if (!availX.length || !availY.length) { return; }

	var x = availX.random();
	var y = availY.random();
	
	this._map[x][y] = 1;
	
	var walls = [];
	
	var w = []; walls.push(w); /* left part */
	for (var i=room[0]; i<x; i++) { 
		this._map[i][y] = 1;
		w.push([i, y]); 
	}
	
	var w = []; walls.push(w); /* right part */
	for (var i=x+1; i<=room[2]; i++) { 
		this._map[i][y] = 1;
		w.push([i, y]); 
	}

	var w = []; walls.push(w); /* top part */
	for (var j=room[1]; j<y; j++) { 
		this._map[x][j] = 1;
		w.push([x, j]); 
	}
	
	var w = []; walls.push(w); /* bottom part */
	for (var j=y+1; j<=room[3]; j++) { 
		this._map[x][j] = 1;
		w.push([x, j]); 
	}
		
	var solid = walls.random();
	for (var i=0;i<walls.length;i++) {
		var w = walls[i];
		if (w == solid) { continue; }
		
		var hole = w.random();
		this._map[hole[0]][hole[1]] = 0;
	}

	this._stack.push([room[0], room[1], x-1, y-1]); /* left top */
	this._stack.push([x+1, room[1], room[2], y-1]); /* right top */
	this._stack.push([room[0], y+1, x-1, room[3]]); /* left bottom */
	this._stack.push([x+1, y+1, room[2], room[3]]); /* right bottom */
}
/**
 * @class Icey's Maze generator
 * See http://www.roguebasin.roguelikedevelopment.org/index.php?title=Simple_maze for explanation
 * @augments ROT.Map
 */
ROT.Map.IceyMaze = function(width, height, regularity) {
	ROT.Map.call(this, width, height);
	this._regularity = regularity || 0;
}
ROT.Map.IceyMaze.extend(ROT.Map);

ROT.Map.IceyMaze.prototype.create = function(callback) {
	var width = this._width;
	var height = this._height;
	
	var map = this._fillMap(1);
	
	width -= (width % 2 ? 1 : 2);
	height -= (height % 2 ? 1 : 2);

	var cx = 0;
	var cy = 0;
	var nx = 0;
	var ny = 0;

	var done = 0;
	var blocked = false;
	var dirs = [
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0]
	];
	do {
		cx = 1 + 2*Math.floor(ROT.RNG.getUniform()*(width-1) / 2);
		cy = 1 + 2*Math.floor(ROT.RNG.getUniform()*(height-1) / 2);

		if (!done) { map[cx][cy] = 0; }
		
		if (!map[cx][cy]) {
			this._randomize(dirs);
			do {
				if (Math.floor(ROT.RNG.getUniform()*(this._regularity+1)) == 0) { this._randomize(dirs); }
				blocked = true;
				for (var i=0;i<4;i++) {
					nx = cx + dirs[i][0]*2;
					ny = cy + dirs[i][1]*2;
					if (this._isFree(map, nx, ny, width, height)) {
						map[nx][ny] = 0;
						map[cx + dirs[i][0]][cy + dirs[i][1]] = 0;
						
						cx = nx;
						cy = ny;
						blocked = false;
						done++;
						break;
					}
				}
			} while (!blocked);
		}
	} while (done+1 < width*height/4);
	
	for (var i=0;i<this._width;i++) {
		for (var j=0;j<this._height;j++) {
			callback(i, j, map[i][j]);
		}
	}
	this._map = null;
	return this;
}

ROT.Map.IceyMaze.prototype._randomize = function(dirs) {
	for (var i=0;i<4;i++) {
		dirs[i][0] = 0;
		dirs[i][1] = 0;
	}
	
	switch (Math.floor(ROT.RNG.getUniform()*4)) {
		case 0:
			dirs[0][0] = -1; dirs[1][0] = 1;
			dirs[2][1] = -1; dirs[3][1] = 1;
		break;
		case 1:
			dirs[3][0] = -1; dirs[2][0] = 1;
			dirs[1][1] = -1; dirs[0][1] = 1;
		break;
		case 2:
			dirs[2][0] = -1; dirs[3][0] = 1;
			dirs[0][1] = -1; dirs[1][1] = 1;
		break;
		case 3:
			dirs[1][0] = -1; dirs[0][0] = 1;
			dirs[3][1] = -1; dirs[2][1] = 1;
		break;
	}
}

ROT.Map.IceyMaze.prototype._isFree = function(map, x, y, width, height) {
	if (x < 1 || y < 1 || x >= width || y >= height) { return false; }
	return map[x][y];
}
/**
 * @class Maze generator - Eller's algorithm
 * See http://homepages.cwi.nl/~tromp/maze.html for explanation
 * @augments ROT.Map
 */
ROT.Map.EllerMaze = function(width, height) {
	ROT.Map.call(this, width, height);
}
ROT.Map.EllerMaze.extend(ROT.Map);

ROT.Map.EllerMaze.prototype.create = function(callback) {
	var map = this._fillMap(1);
	var w = Math.ceil((this._width-2)/2);
	
	var rand = 9/24;
	
	var L = [];
	var R = [];
	
	for (var i=0;i<w;i++) {
		L.push(i);
		R.push(i);
	}
	L.push(w-1); /* fake stop-block at the right side */

	for (var j=1;j+3<this._height;j+=2) {
		/* one row */
		for (var i=0;i<w;i++) {
			/* cell coords (will be always empty) */
			var x = 2*i+1;
			var y = j;
			map[x][y] = 0;
			
			/* right connection */
			if (i != L[i+1] && ROT.RNG.getUniform() > rand) {
				this._addToList(i, L, R);
				map[x+1][y] = 0;
			}
			
			/* bottom connection */
			if (i != L[i] && ROT.RNG.getUniform() > rand) {
				/* remove connection */
				this._removeFromList(i, L, R);
			} else {
				/* create connection */
				map[x][y+1] = 0;
			}
		}
	}

	/* last row */
	for (var i=0;i<w;i++) {
		/* cell coords (will be always empty) */
		var x = 2*i+1;
		var y = j;
		map[x][y] = 0;
		
		/* right connection */
		if (i != L[i+1] && (i == L[i] || ROT.RNG.getUniform() > rand)) {
			/* dig right also if the cell is separated, so it gets connected to the rest of maze */
			this._addToList(i, L, R);
			map[x+1][y] = 0;
		}
		
		this._removeFromList(i, L, R);
	}
	
	for (var i=0;i<this._width;i++) {
		for (var j=0;j<this._height;j++) {
			callback(i, j, map[i][j]);
		}
	}
	
	return this;
}

/**
 * Remove "i" from its list
 */
ROT.Map.EllerMaze.prototype._removeFromList = function(i, L, R) {
	R[L[i]] = R[i];
	L[R[i]] = L[i];
	R[i] = i;
	L[i] = i;
}

/**
 * Join lists with "i" and "i+1"
 */
ROT.Map.EllerMaze.prototype._addToList = function(i, L, R) {
	R[L[i+1]] = R[i];
	L[R[i]] = L[i+1];
	R[i] = i+1;
	L[i+1] = i;
}
/**
 * @class Cellular automaton map generator
 * @augments ROT.Map
 * @param {int} [width=ROT.DEFAULT_WIDTH]
 * @param {int} [height=ROT.DEFAULT_HEIGHT]
 * @param {object} [options] Options
 * @param {int[]} [options.born] List of neighbor counts for a new cell to be born in empty space
 * @param {int[]} [options.survive] List of neighbor counts for an existing  cell to survive
 * @param {int} [options.topology] Topology 4 or 6 or 8
 */
ROT.Map.Cellular = function(width, height, options) {
	ROT.Map.call(this, width, height);
	this._options = {
		born: [5, 6, 7, 8],
		survive: [4, 5, 6, 7, 8],
		topology: 8
	};
	this.setOptions(options);
	
	this._dirs = ROT.DIRS[this._options.topology];
	this._map = this._fillMap(0);
}
ROT.Map.Cellular.extend(ROT.Map);

/**
 * Fill the map with random values
 * @param {float} probability Probability for a cell to become alive; 0 = all empty, 1 = all full
 */
ROT.Map.Cellular.prototype.randomize = function(probability) {
	for (var i=0;i<this._width;i++) {
		for (var j=0;j<this._height;j++) {
			this._map[i][j] = (ROT.RNG.getUniform() < probability ? 1 : 0);
		}
	}
	return this;
}

/**
 * Change options.
 * @see ROT.Map.Cellular
 */
ROT.Map.Cellular.prototype.setOptions = function(options) {
	for (var p in options) { this._options[p] = options[p]; }
}

ROT.Map.Cellular.prototype.set = function(x, y, value) {
	this._map[x][y] = value;
}

ROT.Map.Cellular.prototype.create = function(callback) {
	var newMap = this._fillMap(0);
	var born = this._options.born;
	var survive = this._options.survive;


	for (var j=0;j<this._height;j++) {
		var widthStep = 1;
		var widthStart = 0;
		if (this._options.topology == 6) { 
			widthStep = 2;
			widthStart = j%2;
		}

		for (var i=widthStart; i<this._width; i+=widthStep) {

			var cur = this._map[i][j];
			var ncount = this._getNeighbors(i, j);
			
			if (cur && survive.indexOf(ncount) != -1) { /* survive */
				newMap[i][j] = 1;
			} else if (!cur && born.indexOf(ncount) != -1) { /* born */
				newMap[i][j] = 1;
			}
			
			if (callback) { callback(i, j, newMap[i][j]); }
		}
	}
	
	this._map = newMap;
}

/**
 * Get neighbor count at [i,j] in this._map
 */
ROT.Map.Cellular.prototype._getNeighbors = function(cx, cy) {
	var result = 0;
	for (var i=0;i<this._dirs.length;i++) {
		var dir = this._dirs[i];
		var x = cx + dir[0];
		var y = cy + dir[1];
		
		if (x < 0 || x >= this._width || x < 0 || y >= this._width) { continue; }
		result += (this._map[x][y] == 1 ? 1 : 0);
	}
	
	return result;
}
/**
 * @class Dungeon map: has rooms and corridors
 * @augments ROT.Map
 */
ROT.Map.Dungeon = function(width, height) {
	ROT.Map.call(this, width, height);
	this._rooms = []; /* list of all rooms */
	this._corridors = [];
}
ROT.Map.Dungeon.extend(ROT.Map);

/**
 * Get all generated rooms
 * @returns {ROT.Map.Feature.Room[]}
 */
ROT.Map.Dungeon.prototype.getRooms = function() {
	return this._rooms;
}

/**
 * Get all generated corridors
 * @returns {ROT.Map.Feature.Corridor[]}
 */
ROT.Map.Dungeon.prototype.getCorridors = function() {
	return this._corridors;
}
/**
 * @class Random dungeon generator using human-like digging patterns.
 * Heavily based on Mike Anderson's ideas from the "Tyrant" algo, mentioned at 
 * http://www.roguebasin.roguelikedevelopment.org/index.php?title=Dungeon-Building_Algorithm.
 * @augments ROT.Map.Dungeon
 */
ROT.Map.Digger = function(width, height, options) {
	ROT.Map.Dungeon.call(this, width, height);
	
	this._options = {
		roomWidth: [3, 9], /* room minimum and maximum width */
		roomHeight: [3, 5], /* room minimum and maximum height */
		corridorLength: [3, 10], /* corridor minimum and maximum length */
		dugPercentage: 0.2, /* we stop after this percentage of level area has been dug out */
		timeLimit: 1000 /* we stop after this much time has passed (msec) */
	}
	for (var p in options) { this._options[p] = options[p]; }
	
	this._features = {
		"Room": 4,
		"Corridor": 4
	}
	this._featureAttempts = 20; /* how many times do we try to create a feature on a suitable wall */
	this._walls = {}; /* these are available for digging */
	
	this._digCallback = this._digCallback.bind(this);
	this._canBeDugCallback = this._canBeDugCallback.bind(this);
	this._isWallCallback = this._isWallCallback.bind(this);
	this._priorityWallCallback = this._priorityWallCallback.bind(this);
}
ROT.Map.Digger.extend(ROT.Map.Dungeon);

/**
 * Create a map
 * @see ROT.Map#create
 */
ROT.Map.Digger.prototype.create = function(callback) {
	this._rooms = [];
	this._corridors = [];
	this._map = this._fillMap(1);
	this._walls = {};
	this._dug = 0;
	var area = (this._width-2) * (this._height-2);

	this._firstRoom();
	
	var t1 = Date.now();

	do {
		var t2 = Date.now();
		if (t2 - t1 > this._options.timeLimit) { break; }

		/* find a good wall */
		var wall = this._findWall();
		if (!wall) { break; } /* no more walls */
		
		var parts = wall.split(",");
		var x = parseInt(parts[0]);
		var y = parseInt(parts[1]);
		var dir = this._getDiggingDirection(x, y);
		if (!dir) { continue; } /* this wall is not suitable */
		
//		console.log("wall", x, y);

		/* try adding a feature */
		var featureAttempts = 0;
		do {
			featureAttempts++;
			if (this._tryFeature(x, y, dir[0], dir[1])) { /* feature added */
				//if (this._rooms.length + this._corridors.length == 2) { this._rooms[0].addDoor(x, y); } /* first room oficially has doors */
				this._removeSurroundingWalls(x, y);
				this._removeSurroundingWalls(x-dir[0], y-dir[1]);
				break; 
			}
		} while (featureAttempts < this._featureAttempts);
		
		var priorityWalls = 0;
		for (var id in this._walls) { 
			if (this._walls[id] > 1) { priorityWalls++; }
		}

	} while (this._dug/area < this._options.dugPercentage || priorityWalls); /* fixme number of priority walls */

	this._addDoors();

	if (callback) {
		for (var i=0;i<this._width;i++) {
			for (var j=0;j<this._height;j++) {
				callback(i, j, this._map[i][j]);
			}
		}
	}
	
	this._walls = {};
	this._map = null;

	return this;
}

ROT.Map.Digger.prototype._digCallback = function(x, y, value) {
	if (value == 0 || value == 2) { /* empty */
		this._map[x][y] = 0;
		this._dug++;
	} else { /* wall */
		this._walls[x+","+y] = 1;
	}
}

ROT.Map.Digger.prototype._isWallCallback = function(x, y) {
	if (x < 0 || y < 0 || x >= this._width || y >= this._height) { return false; }
	return (this._map[x][y] == 1);
}

ROT.Map.Digger.prototype._canBeDugCallback = function(x, y) {
	if (x < 1 || y < 1 || x+1 >= this._width || y+1 >= this._height) { return false; }
	return (this._map[x][y] == 1);
}

ROT.Map.Digger.prototype._priorityWallCallback = function(x, y) {
	this._walls[x+","+y] = 2;
}

ROT.Map.Digger.prototype._firstRoom = function() {
	var cx = Math.floor(this._width/2);
	var cy = Math.floor(this._height/2);
	var room = ROT.Map.Feature.Room.createRandomCenter(cx, cy, this._options);
	this._rooms.push(room);
	room.create(this._digCallback);
}

/**
 * Get a suitable wall
 */
ROT.Map.Digger.prototype._findWall = function() {
	var prio1 = [];
	var prio2 = [];
	for (var id in this._walls) {
		var prio = this._walls[id];
		if (prio == 2) { 
			prio2.push(id); 
		} else {
			prio1.push(id);
		}
	}
	
	var arr = (prio2.length ? prio2 : prio1);
	if (!arr.length) { return null; } /* no walls :/ */
	
	var id = arr.random();
	delete this._walls[id];

	return id;
}

/**
 * Tries adding a feature
 * @returns {bool} was this a successful try?
 */
ROT.Map.Digger.prototype._tryFeature = function(x, y, dx, dy) {
	var feature = ROT.RNG.getWeightedValue(this._features);
	feature = ROT.Map.Feature[feature].createRandomAt(x, y, dx, dy, this._options);
	
	if (!feature.isValid(this._isWallCallback, this._canBeDugCallback)) {
//		console.log("not valid");
//		feature.debug();
		return false;
	}
	
	feature.create(this._digCallback);
//	feature.debug();

	if (feature instanceof ROT.Map.Feature.Room) { this._rooms.push(feature); }
	if (feature instanceof ROT.Map.Feature.Corridor) { 
		feature.createPriorityWalls(this._priorityWallCallback);
		this._corridors.push(feature); 
	}
	
	return true;
}

ROT.Map.Digger.prototype._removeSurroundingWalls = function(cx, cy) {
	var deltas = ROT.DIRS[4];

	for (var i=0;i<deltas.length;i++) {
		var delta = deltas[i];
		var x = cx + delta[0];
		var y = cy + delta[1];
		delete this._walls[x+","+y];
		var x = cx + 2*delta[0];
		var y = cy + 2*delta[1];
		delete this._walls[x+","+y];
	}
}

/**
 * Returns vector in "digging" direction, or false, if this does not exist (or is not unique)
 */
ROT.Map.Digger.prototype._getDiggingDirection = function(cx, cy) {
	var result = null;
	var deltas = ROT.DIRS[4];
	
	for (var i=0;i<deltas.length;i++) {
		var delta = deltas[i];
		var x = cx + delta[0];
		var y = cy + delta[1];
		
		if (x < 0 || y < 0 || x >= this._width || y >= this._width) { return null; }
		
		if (!this._map[x][y]) { /* there already is another empty neighbor! */
			if (result) { return null; }
			result = delta;
		}
	}
	
	/* no empty neighbor */
	if (!result) { return null; }
	
	return [-result[0], -result[1]];
}

/**
 * Find empty spaces surrounding rooms, and apply doors.
 */
ROT.Map.Digger.prototype._addDoors = function() {
	var data = this._map;
	var isWallCallback = function(x, y) {
		return (data[x][y] == 1);
	}
	for (var i = 0; i < this._rooms.length; i++ ) {
		var room = this._rooms[i];
		room.clearDoors();
		room.addDoors(isWallCallback);
	}
}
/**
 * @class Dungeon generator which tries to fill the space evenly. Generates independent rooms and tries to connect them.
 * @augments ROT.Map.Dungeon
 */
ROT.Map.Uniform = function(width, height, options) {
	ROT.Map.Dungeon.call(this, width, height);

	this._options = {
		roomWidth: [3, 9], /* room minimum and maximum width */
		roomHeight: [3, 5], /* room minimum and maximum height */
		roomDugPercentage: 0.1, /* we stop after this percentage of level area has been dug out by rooms */
		timeLimit: 1000 /* we stop after this much time has passed (msec) */
	}
	for (var p in options) { this._options[p] = options[p]; }

	this._roomAttempts = 20; /* new room is created N-times until is considered as impossible to generate */
	this._corridorAttempts = 20; /* corridors are tried N-times until the level is considered as impossible to connect */

	this._connected = []; /* list of already connected rooms */
	this._unconnected = []; /* list of remaining unconnected rooms */
	
	this._digCallback = this._digCallback.bind(this);
	this._canBeDugCallback = this._canBeDugCallback.bind(this);
	this._isWallCallback = this._isWallCallback.bind(this);
}
ROT.Map.Uniform.extend(ROT.Map.Dungeon);

/**
 * Create a map. If the time limit has been hit, returns null.
 * @see ROT.Map#create
 */
ROT.Map.Uniform.prototype.create = function(callback) {
	var t1 = Date.now();
	while (1) {
		var t2 = Date.now();
		if (t2 - t1 > this._options.timeLimit) { return null; } /* time limit! */
	
		this._map = this._fillMap(1);
		this._dug = 0;
		this._rooms = [];
		this._unconnected = [];
		this._generateRooms();
		if (this._rooms.length < 2) { continue; }
		if (this._generateCorridors()) { break; }
	}
	
	if (callback) {
		for (var i=0;i<this._width;i++) {
			for (var j=0;j<this._height;j++) {
				callback(i, j, this._map[i][j]);
			}
		}
	}
	
	return this;
}

/**
 * Generates a suitable amount of rooms
 */
ROT.Map.Uniform.prototype._generateRooms = function() {
	var w = this._width-2;
	var h = this._height-2;

	do {
		var room = this._generateRoom();
		if (this._dug/(w*h) > this._options.roomDugPercentage) { break; } /* achieved requested amount of free space */
	} while (room);

	/* either enough rooms, or not able to generate more of them :) */
}

/**
 * Try to generate one room
 */
ROT.Map.Uniform.prototype._generateRoom = function() {
	var count = 0;
	while (count < this._roomAttempts) {
		count++;
		
		var room = ROT.Map.Feature.Room.createRandom(this._width, this._height, this._options);
		if (!room.isValid(this._isWallCallback, this._canBeDugCallback)) { continue; }
		
		room.create(this._digCallback);
		this._rooms.push(room);
		return room;
	} 

	/* no room was generated in a given number of attempts */
	return null;
}

/**
 * Generates connectors beween rooms
 * @returns {bool} success Was this attempt successfull?
 */
ROT.Map.Uniform.prototype._generateCorridors = function() {
	var cnt = 0;
	while (cnt < this._corridorAttempts) {
		cnt++;
		this._corridors = [];

		/* dig rooms into a clear map */
		this._map = this._fillMap(1);
		for (var i=0;i<this._rooms.length;i++) { 
			var room = this._rooms[i];
			room.clearDoors();
			room.create(this._digCallback); 
		}

		this._unconnected = this._rooms.slice().randomize();
		this._connected = [];
		if (this._unconnected.length) { this._connected.push(this._unconnected.pop()); } /* first one is always connected */
		
		while (1) {
			/* 1. pick random connected room */
			var connected = this._connected.random();
			
			/* 2. find closest unconnected */
			var room1 = this._closestRoom(this._unconnected, connected);
			
			/* 3. connect it to closest connected */
			var room2 = this._closestRoom(this._connected, room1);
			
			var ok = this._connectRooms(room1, room2);
			if (!ok) { break; } /* stop connecting, re-shuffle */
			
			if (!this._unconnected.length) { return true; } /* done; no rooms remain */
		}
	}
	return false;
}

/**
 * For a given room, find the closest one from the list
 */
ROT.Map.Uniform.prototype._closestRoom = function(rooms, room) {
	var dist = Infinity;
	var center = room.getCenter();
	var result = null;
	
	for (var i=0;i<rooms.length;i++) {
		var r = rooms[i];
		var c = r.getCenter();
		var dx = c[0]-center[0];
		var dy = c[1]-center[1];
		var d = dx*dx+dy*dy;
		
		if (d < dist) {
			dist = d;
			result = r;
		}
	}
	
	return result;
}

ROT.Map.Uniform.prototype._connectRooms = function(room1, room2) {
	/*
		room1.debug();
		room2.debug();
	*/

	var center1 = room1.getCenter();
	var center2 = room2.getCenter();

	var diffX = center2[0] - center1[0];
	var diffY = center2[1] - center1[1];

	if (Math.abs(diffX) < Math.abs(diffY)) { /* first try connecting north-south walls */
		var dirIndex1 = (diffY > 0 ? 2 : 0);
		var dirIndex2 = (dirIndex1 + 2) % 4;
		var min = room2.getLeft();
		var max = room2.getRight();
		var index = 0;
	} else { /* first try connecting east-west walls */
		var dirIndex1 = (diffX > 0 ? 1 : 3);
		var dirIndex2 = (dirIndex1 + 2) % 4;
		var min = room2.getTop();
		var max = room2.getBottom();
		var index = 1;
	}

	var start = this._placeInWall(room1, dirIndex1); /* corridor will start here */
	if (!start) { return false; }

	if (start[index] >= min && start[index] <= max) { /* possible to connect with straight line (I-like) */
		var end = start.slice();
		var value = null;
		switch (dirIndex2) {
			case 0: value = room2.getTop()-1; break;
			case 1: value = room2.getRight()+1; break;
			case 2: value = room2.getBottom()+1; break;
			case 3: value = room2.getLeft()-1; break;
		}
		end[(index+1)%2] = value;
		this._digLine([start, end]);
		
	} else if (start[index] < min-1 || start[index] > max+1) { /* need to switch target wall (L-like) */

		var diff = start[index] - center2[index];
		switch (dirIndex2) {
			case 0:
			case 1:	var rotation = (diff < 0 ? 3 : 1); break;
			case 2:
			case 3:	var rotation = (diff < 0 ? 1 : 3); break;
		}
		dirIndex2 = (dirIndex2 + rotation) % 4;
		
		var end = this._placeInWall(room2, dirIndex2);
		if (!end) { return false; }

		var mid = [0, 0];
		mid[index] = start[index];
		var index2 = (index+1)%2;
		mid[index2] = end[index2];
		this._digLine([start, mid, end]);
		
	} else { /* use current wall pair, but adjust the line in the middle (S-like) */
	
		var index2 = (index+1)%2;
		var end = this._placeInWall(room2, dirIndex2);
		if (!end) { return; }
		var mid = Math.round((end[index2] + start[index2])/2);

		var mid1 = [0, 0];
		var mid2 = [0, 0];
		mid1[index] = start[index];
		mid1[index2] = mid;
		mid2[index] = end[index];
		mid2[index2] = mid;
		this._digLine([start, mid1, mid2, end]);
	}

	room1.addDoor(start[0], start[1]);
	room2.addDoor(end[0], end[1]);
	
	var index = this._unconnected.indexOf(room1);
	if (index != -1) {
		this._unconnected.splice(index, 1);
		this._connected.push(room1);
	}

	var index = this._unconnected.indexOf(room2);
	if (index != -1) {
		this._unconnected.splice(index, 1);
		this._connected.push(room2);
	}
	
	return true;
}

ROT.Map.Uniform.prototype._placeInWall = function(room, dirIndex) {
	var start = [0, 0];
	var dir = [0, 0];
	var length = 0;
	
	switch (dirIndex) {
		case 0:
			dir = [1, 0];
			start = [room.getLeft(), room.getTop()-1];
			length = room.getRight()-room.getLeft()+1;
		break;
		case 1:
			dir = [0, 1];
			start = [room.getRight()+1, room.getTop()];
			length = room.getBottom()-room.getTop()+1;
		break;
		case 2:
			dir = [1, 0];
			start = [room.getLeft(), room.getBottom()+1];
			length = room.getRight()-room.getLeft()+1;
		break;
		case 3:
			dir = [0, 1];
			start = [room.getLeft()-1, room.getTop()];
			length = room.getBottom()-room.getTop()+1;
		break;
	}
	
	var avail = [];
	var lastBadIndex = -2;

	for (var i=0;i<length;i++) {
		var x = start[0] + i*dir[0];
		var y = start[1] + i*dir[1];
		avail.push(null);
		
		var isWall = (this._map[x][y] == 1);
		if (isWall) {
			if (lastBadIndex != i-1) { avail[i] = [x, y]; }
		} else {
			lastBadIndex = i;
			if (i) { avail[i-1] = null; }
		}
	}
	
	for (var i=avail.length-1; i>=0; i--) {
		if (!avail[i]) { avail.splice(i, 1); }
	}
	return (avail.length ? avail.random() : null);
}

/**
 * Dig a polyline.
 */
ROT.Map.Uniform.prototype._digLine = function(points) {
	for (var i=1;i<points.length;i++) {
		var start = points[i-1];
		var end = points[i];
		var corridor = new ROT.Map.Feature.Corridor(start[0], start[1], end[0], end[1]);
		corridor.create(this._digCallback);
		this._corridors.push(corridor);
	}
}

ROT.Map.Uniform.prototype._digCallback = function(x, y, value) {
	this._map[x][y] = value;
	if (value == 0) { this._dug++; }
}

ROT.Map.Uniform.prototype._isWallCallback = function(x, y) {
	if (x < 0 || y < 0 || x >= this._width || y >= this._height) { return false; }
	return (this._map[x][y] == 1);
}

ROT.Map.Uniform.prototype._canBeDugCallback = function(x, y) {
	if (x < 1 || y < 1 || x+1 >= this._width || y+1 >= this._height) { return false; }
	return (this._map[x][y] == 1);
}

/**
 * @author hyakugei
 * @class Dungeon generator which uses the "orginal" Rogue dungeon generation algorithm. See http://kuoi.com/~kamikaze/GameDesign/art07_rogue_dungeon.php
 * @augments ROT.Map
 * @param {int} [width=ROT.DEFAULT_WIDTH]
 * @param {int} [height=ROT.DEFAULT_HEIGHT]
 * @param {object} [options] Options
 * @param {int[]} [options.cellWidth=3] Number of cells to create on the horizontal (number of rooms horizontally)
 * @param {int[]} [options.cellHeight=3] Number of cells to create on the vertical (number of rooms vertically) 
 * @param {int} [options.roomWidth] Room min and max width - normally set auto-magically via the constructor.
 * @param {int} [options.roomHeight] Room min and max height - normally set auto-magically via the constructor. 
 */
ROT.Map.Rogue = function(width, height, options) {
	ROT.Map.call(this, width, height);
	
	this._options = {
		cellWidth: 3,  // NOTE to self, these could probably work the same as the roomWidth/room Height values
		cellHeight: 3  //     ie. as an array with min-max values for each direction....
	}
	
	for (var p in options) { this._options[p] = options[p]; }
	
	/*
	Set the room sizes according to the over-all width of the map, 
	and the cell sizes. 
	*/
	
	if (!this._options.hasOwnProperty("roomWidth")) {
		this._options["roomWidth"] = this._calculateRoomSize(width, this._options["cellWidth"]);
	}
	if (!this._options.hasOwnProperty["roomHeight"]) {
		this._options["roomHeight"] = this._calculateRoomSize(height, this._options["cellHeight"]);
	}
	
}

ROT.Map.Rogue.extend(ROT.Map); 

/**
 * @see ROT.Map#create
 */
ROT.Map.Rogue.prototype.create = function(callback) {
	this.map = this._fillMap(1);
	this.rooms = [];
	this.connectedCells = [];
	
	this._initRooms();
	this._connectRooms();
	this._connectUnconnectedRooms();
	this._createRandomRoomConnections();
	this._createRooms();
	this._createCorridors();
	
	if (callback) {
		for (var i = 0; i < this._width; i++) {
			for (var j = 0; j < this._height; j++) {
				callback(i, j, this.map[i][j]);   
			}
		}
	}
	
	return this;
}

ROT.Map.Rogue.prototype._getRandomInt = function(min, max) {
	return Math.floor(ROT.RNG.getUniform() * (max - min + 1)) + min;
}

ROT.Map.Rogue.prototype._calculateRoomSize = function(size, cell) {
	var max = Math.floor((size/cell) * 0.8);
	var min = Math.floor((size/cell) * 0.25);
	if (min < 2) min = 2;
	if (max < 2) max = 2;
	return [min, max];
}

ROT.Map.Rogue.prototype._initRooms = function () { 
	// create rooms array. This is the "grid" list from the algo.  
	for (var i = 0; i < this._options.cellWidth; i++) {  
		this.rooms.push([]);
		for(var j = 0; j < this._options.cellHeight; j++) {
			this.rooms[i].push({"x":0, "y":0, "width":0, "height":0, "connections":[], "cellx":i, "celly":j});
		}
	}
}

ROT.Map.Rogue.prototype._connectRooms = function() {
	//pick random starting grid
	var cgx = this._getRandomInt(0, this._options.cellWidth-1);
	var cgy = this._getRandomInt(0, this._options.cellHeight-1);
	
	var idx;
	var ncgx;
	var ncgy;
	
	var found = false;
	var room;
	var otherRoom;
	
	// find  unconnected neighbour cells
	do {
	
		//var dirToCheck = [0,1,2,3,4,5,6,7];
		var dirToCheck = [0,2,4,6];
		dirToCheck = dirToCheck.randomize();
		
		do {
			found = false;
			idx = dirToCheck.pop();
			
			
			ncgx = cgx + ROT.DIRS[8][idx][0];
			ncgy = cgy + ROT.DIRS[8][idx][1];
			
			if(ncgx < 0 || ncgx >= this._options.cellWidth) continue;
			if(ncgy < 0 || ncgy >= this._options.cellHeight) continue;
			
			room = this.rooms[cgx][cgy];
			
			if(room["connections"].length > 0)
			{
				// as long as this room doesn't already coonect to me, we are ok with it. 
				if(room["connections"][0][0] == ncgx &&
				room["connections"][0][1] == ncgy)
				{
					break;
				}
			}
			
			otherRoom = this.rooms[ncgx][ncgy];
			
			if (otherRoom["connections"].length == 0) { 
				otherRoom["connections"].push([cgx,cgy]);
				
				this.connectedCells.push([ncgx, ncgy]);
				cgx = ncgx;
				cgy = ncgy;
				found = true;
			}
					
		} while (dirToCheck.length > 0 && found == false)
		
	} while (dirToCheck.length > 0)

}

ROT.Map.Rogue.prototype._connectUnconnectedRooms = function() {
	//While there are unconnected rooms, try to connect them to a random connected neighbor 
	//(if a room has no connected neighbors yet, just keep cycling, you'll fill out to it eventually).
	var cw = this._options.cellWidth;
	var ch = this._options.cellHeight;
	
	var randomConnectedCell;
	this.connectedCells = this.connectedCells.randomize();
	var room;
	var otherRoom;
	var validRoom;
	
	for (var i = 0; i < this._options.cellWidth; i++) {
		for (var j = 0; j < this._options.cellHeight; j++)  {
				
			room = this.rooms[i][j];
			
			if (room["connections"].length == 0) {
				var directions = [0,2,4,6];
				directions = directions.randomize();
				
				var validRoom = false;
				
				do {
					
					var dirIdx = directions.pop();
					var newI = i + ROT.DIRS[8][dirIdx][0];
					var newJ = j + ROT.DIRS[8][dirIdx][1];
					
					if (newI < 0 || newI >= cw || 
					newJ < 0 || newJ >= ch) {
						continue;
					}
					
					otherRoom = this.rooms[newI][newJ];
					
					validRoom = true;
					
					if (otherRoom["connections"].length == 0) {
						break;
					}
					
					for (var k = 0; k < otherRoom["connections"].length; k++) {
						if(otherRoom["connections"][k][0] == i && 
						otherRoom["connections"][k][1] == j) {
							validRoom = false;
							break;
						}
					}
					
					if (validRoom) break;
					
				} while (directions.length)
				
				if(validRoom) { 
					room["connections"].push( [otherRoom["cellx"], otherRoom["celly"]] );  
				} else {
					console.log("-- Unable to connect room.");
				}
			}
		}
	}
}

ROT.Map.Rogue.prototype._createRandomRoomConnections = function(connections) {
	// Empty for now. 
}


ROT.Map.Rogue.prototype._createRooms = function() {
	// Create Rooms 
	
	var w = this._width;
	var h = this._height;
	
	var cw = this._options.cellWidth;
	var ch = this._options.cellHeight;
	
	var cwp = Math.floor(this._width / cw);
	var chp = Math.floor(this._height / ch);
	
	var roomw;
	var roomh;
	var roomWidth = this._options["roomWidth"];
	var roomHeight = this._options["roomHeight"];
	var sx;
	var sy;
	var tx;
	var ty;
	var otherRoom;
	
	for (var i = 0; i < cw; i++) {
		for (var j = 0; j < ch; j++) {
			sx = cwp * i;
			sy = chp * j;
			
			if (sx == 0) sx = 1;
			if (sy == 0) sy = 1;
			
			roomw = this._getRandomInt(roomWidth[0], roomWidth[1]);
			roomh = this._getRandomInt(roomHeight[0], roomHeight[1]);
			
			if (j > 0) {
				otherRoom = this.rooms[i][j-1];
				while (sy - (otherRoom["y"] + otherRoom["height"] ) < 3) {
					sy++;
				}
			}
			
			if (i > 0) {
				otherRoom = this.rooms[i-1][j];
				while(sx - (otherRoom["x"] + otherRoom["width"]) < 3) {
					sx++;
				}
			}
						
			var sxOffset = Math.round(this._getRandomInt(0, cwp-roomw)/2);
			var syOffset = Math.round(this._getRandomInt(0, chp-roomh)/2);
			
			while (sx + sxOffset + roomw >= w) {
				if(sxOffset) {
					sxOffset--;
				} else {
					roomw--; 
				}
			}
			
			while (sy + syOffset + roomh >= h) { 
				if(syOffset) {
					syOffset--;
				} else {
					roomh--; 
				}
			}
			
			sx = sx + sxOffset;
			sy = sy + syOffset;
			
			this.rooms[i][j]["x"] = sx;
			this.rooms[i][j]["y"] = sy;
			this.rooms[i][j]["width"] = roomw;
			this.rooms[i][j]["height"] = roomh;  
			
			for (var ii = sx; ii < sx + roomw; ii++) {
				for (var jj = sy; jj < sy + roomh; jj++) {
					this.map[ii][jj] = 0;
				}
			}  
		}
	}
}

ROT.Map.Rogue.prototype._getWallPosition = function(aRoom, aDirection) {
	var rx;
	var ry;
	var door;
	
	if (aDirection == 1 || aDirection == 3) {
		rx = this._getRandomInt(aRoom["x"] + 1, aRoom["x"] + aRoom["width"] - 2);
		if (aDirection == 1) {
			ry = aRoom["y"] - 2;
			door = ry + 1;
		} else {
			ry = aRoom["y"] + aRoom["height"] + 1;
			door = ry -1;
		}
		
		this.map[rx][door] = 0; // i'm not setting a specific 'door' tile value right now, just empty space. 
		
	} else if (aDirection == 2 || aDirection == 4) {
		ry = this._getRandomInt(aRoom["y"] + 1, aRoom["y"] + aRoom["height"] - 2);
		if(aDirection == 2) {
			rx = aRoom["x"] + aRoom["width"] + 1;
			door = rx - 1;
		} else {
			rx = aRoom["x"] - 2;
			door = rx + 1;
		}
		
		this.map[door][ry] = 0; // i'm not setting a specific 'door' tile value right now, just empty space. 
		
	}
	return [rx, ry];
}

/***
* @param startPosition a 2 element array
* @param endPosition a 2 element array
*/
ROT.Map.Rogue.prototype._drawCorridore = function (startPosition, endPosition) {
	var xOffset = endPosition[0] - startPosition[0];
	var yOffset = endPosition[1] - startPosition[1];
	
	var xpos = startPosition[0];
	var ypos = startPosition[1];
	
	var tempDist;
	var xDir;
	var yDir;
	
	var move; // 2 element array, element 0 is the direction, element 1 is the total value to move. 
	var moves = []; // a list of 2 element arrays
	
	var xAbs = Math.abs(xOffset);
	var yAbs = Math.abs(yOffset);
	
	var percent = ROT.RNG.getUniform(); // used to split the move at different places along the long axis
	var firstHalf = percent;
	var secondHalf = 1 - percent;
	
	xDir = xOffset > 0 ? 2 : 6;
	yDir = yOffset > 0 ? 4 : 0;
	
	if (xAbs < yAbs) {
		// move firstHalf of the y offset
		tempDist = Math.ceil(yAbs * firstHalf);
		moves.push([yDir, tempDist]);
		// move all the x offset
		moves.push([xDir, xAbs]);
		// move sendHalf of the  y offset
		tempDist = Math.floor(yAbs * secondHalf);
		moves.push([yDir, tempDist]);
	} else {
		//  move firstHalf of the x offset
		tempDist = Math.ceil(xAbs * firstHalf);
		moves.push([xDir, tempDist]);
		// move all the y offset
		moves.push([yDir, yAbs]);
		// move secondHalf of the x offset.
		tempDist = Math.floor(xAbs * secondHalf);
		moves.push([xDir, tempDist]);  
	}
	
	this.map[xpos][ypos] = 0;
	
	while (moves.length > 0) {
		move = moves.pop();
		while (move[1] > 0) {
			xpos += ROT.DIRS[8][move[0]][0];
			ypos += ROT.DIRS[8][move[0]][1];
			this.map[xpos][ypos] = 0;
			move[1] = move[1] - 1;
		}
	}
}

ROT.Map.Rogue.prototype._createCorridors = function () {
	// Draw Corridors between connected rooms
	
	var cw = this._options.cellWidth;
	var ch = this._options.cellHeight;
	var room;
	var connection;
	var otherRoom;
	var wall;
	var otherWall;
	
	for (var i = 0; i < cw; i++) {
		for (var j = 0; j < ch; j++) {
			room = this.rooms[i][j];
			
			for (var k = 0; k < room["connections"].length; k++) {
					
				connection = room["connections"][k]; 
				
				otherRoom = this.rooms[connection[0]][connection[1]];
				
				// figure out what wall our corridor will start one.
				// figure out what wall our corridor will end on. 
				if (otherRoom["cellx"] > room["cellx"] ) {
					wall = 2;
					otherWall = 4;
				} else if (otherRoom["cellx"] < room["cellx"] ) {
					wall = 4;
					otherWall = 2;
				} else if(otherRoom["celly"] > room["celly"]) {
					wall = 3;
					otherWall = 1;
				} else if(otherRoom["celly"] < room["celly"]) {
					wall = 1;
					otherWall = 3;
				}
				
				this._drawCorridore(this._getWallPosition(room, wall), this._getWallPosition(otherRoom, otherWall));
			}
		}
	}
}
/**
 * @class Dungeon feature; has own .create() method
 */
ROT.Map.Feature = function() {}
ROT.Map.Feature.prototype.isValid = function(canBeDugCallback) {}
ROT.Map.Feature.prototype.create = function(digCallback) {}
ROT.Map.Feature.prototype.debug = function() {}
ROT.Map.Feature.createRandomAt = function(x, y, dx, dy, options) {}

/**
 * @class Room
 * @augments ROT.Map.Feature
 * @param {int} x1
 * @param {int} y1
 * @param {int} x2
 * @param {int} y2
 * @param {int} [doorX]
 * @param {int} [doorY]
 */
ROT.Map.Feature.Room = function(x1, y1, x2, y2, doorX, doorY) {
	this._x1 = x1;
	this._y1 = y1;
	this._x2 = x2;
	this._y2 = y2;
	this._doors = {};
	if (arguments.length > 4) { this.addDoor(doorX, doorY); }
}
ROT.Map.Feature.Room.extend(ROT.Map.Feature);

/**
 * Room of random size, with a given doors and direction
 */
ROT.Map.Feature.Room.createRandomAt = function(x, y, dx, dy, options) {
	var min = options.roomWidth[0];
	var max = options.roomWidth[1];
	var width = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));
	
	var min = options.roomHeight[0];
	var max = options.roomHeight[1];
	var height = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));
	
	if (dx == 1) { /* to the right */
		var y2 = y - Math.floor(ROT.RNG.getUniform() * height);
		return new this(x+1, y2, x+width, y2+height-1, x, y);
	}
	
	if (dx == -1) { /* to the left */
		var y2 = y - Math.floor(ROT.RNG.getUniform() * height);
		return new this(x-width, y2, x-1, y2+height-1, x, y);
	}

	if (dy == 1) { /* to the bottom */
		var x2 = x - Math.floor(ROT.RNG.getUniform() * width);
		return new this(x2, y+1, x2+width-1, y+height, x, y);
	}

	if (dy == -1) { /* to the top */
		var x2 = x - Math.floor(ROT.RNG.getUniform() * width);
		return new this(x2, y-height, x2+width-1, y-1, x, y);
	}
}

/**
 * Room of random size, positioned around center coords
 */
ROT.Map.Feature.Room.createRandomCenter = function(cx, cy, options) {
	var min = options.roomWidth[0];
	var max = options.roomWidth[1];
	var width = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));
	
	var min = options.roomHeight[0];
	var max = options.roomHeight[1];
	var height = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));

	var x1 = cx - Math.floor(ROT.RNG.getUniform()*width);
	var y1 = cy - Math.floor(ROT.RNG.getUniform()*height);
	var x2 = x1 + width - 1;
	var y2 = y1 + height - 1;

	return new this(x1, y1, x2, y2);
}

/**
 * Room of random size within a given dimensions
 */
ROT.Map.Feature.Room.createRandom = function(availWidth, availHeight, options) {
	var min = options.roomWidth[0];
	var max = options.roomWidth[1];
	var width = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));
	
	var min = options.roomHeight[0];
	var max = options.roomHeight[1];
	var height = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));
	
	var left = availWidth - width - 1;
	var top = availHeight - height - 1;

	var x1 = 1 + Math.floor(ROT.RNG.getUniform()*left);
	var y1 = 1 + Math.floor(ROT.RNG.getUniform()*top);
	var x2 = x1 + width - 1;
	var y2 = y1 + height - 1;

	return new this(x1, y1, x2, y2);
}

ROT.Map.Feature.Room.prototype.addDoor = function(x, y) {
	this._doors[x+","+y] = 1;
	return this;
}

/**
 * @param {function}
 */
ROT.Map.Feature.Room.prototype.getDoors = function(callback) {
	for (var key in this._doors) {
		var parts = key.split(",");
		callback(parseInt(parts[0]), parseInt(parts[1]));
	}
	return this;
}

ROT.Map.Feature.Room.prototype.clearDoors = function() {
	this._doors = {};
	return this;
}

ROT.Map.Feature.Room.prototype.addDoors = function(isWallCallback) {
	var left = this._x1-1;
	var right = this._x2+1;
	var top = this._y1-1;
	var bottom = this._y2+1;

	for (var x=left; x<=right; x++) {
		for (var y=top; y<=bottom; y++) {
			if (x != left && x != right && y != top && y != bottom) { continue; }
			if (isWallCallback(x, y)) { continue; }

			this.addDoor(x, y);
		}
	}

	return this;
}

ROT.Map.Feature.Room.prototype.debug = function() {
	console.log("room", this._x1, this._y1, this._x2, this._y2);
}

ROT.Map.Feature.Room.prototype.isValid = function(isWallCallback, canBeDugCallback) { 
	var left = this._x1-1;
	var right = this._x2+1;
	var top = this._y1-1;
	var bottom = this._y2+1;
	
	for (var x=left; x<=right; x++) {
		for (var y=top; y<=bottom; y++) {
			if (x == left || x == right || y == top || y == bottom) {
				if (!isWallCallback(x, y)) { return false; }
			} else {
				if (!canBeDugCallback(x, y)) { return false; }
			}
		}
	}

	return true;
}

/**
 * @param {function} digCallback Dig callback with a signature (x, y, value). Values: 0 = empty, 1 = wall, 2 = door. Multiple doors are allowed.
 */
ROT.Map.Feature.Room.prototype.create = function(digCallback) { 
	var left = this._x1-1;
	var right = this._x2+1;
	var top = this._y1-1;
	var bottom = this._y2+1;
	
	var value = 0;
	for (var x=left; x<=right; x++) {
		for (var y=top; y<=bottom; y++) {
			if (x+","+y in this._doors) {
				value = 2;
			} else if (x == left || x == right || y == top || y == bottom) {
				value = 1;
			} else {
				value = 0;
			}
			digCallback(x, y, value);
		}
	}
}

ROT.Map.Feature.Room.prototype.getCenter = function() {
	return [Math.round((this._x1 + this._x2)/2), Math.round((this._y1 + this._y2)/2)];
}

ROT.Map.Feature.Room.prototype.getLeft = function() {
	return this._x1;
}

ROT.Map.Feature.Room.prototype.getRight = function() {
	return this._x2;
}

ROT.Map.Feature.Room.prototype.getTop = function() {
	return this._y1;
}

ROT.Map.Feature.Room.prototype.getBottom = function() {
	return this._y2;
}

/**
 * @class Corridor
 * @augments ROT.Map.Feature
 * @param {int} startX
 * @param {int} startY
 * @param {int} endX
 * @param {int} endY
 */
ROT.Map.Feature.Corridor = function(startX, startY, endX, endY) {
	this._startX = startX;
	this._startY = startY;
	this._endX = endX; 
	this._endY = endY;
	this._endsWithAWall = true;
}
ROT.Map.Feature.Corridor.extend(ROT.Map.Feature);

ROT.Map.Feature.Corridor.createRandomAt = function(x, y, dx, dy, options) {
	var min = options.corridorLength[0];
	var max = options.corridorLength[1];
	var length = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));
	
	return new this(x, y, x + dx*length, y + dy*length);
}

ROT.Map.Feature.Corridor.prototype.debug = function() {
	console.log("corridor", this._startX, this._startY, this._endX, this._endY);
}

ROT.Map.Feature.Corridor.prototype.isValid = function(isWallCallback, canBeDugCallback){ 
	var sx = this._startX;
	var sy = this._startY;
	var dx = this._endX-sx;
	var dy = this._endY-sy;
	var length = 1 + Math.max(Math.abs(dx), Math.abs(dy));
	
	if (dx) { dx = dx/Math.abs(dx); }
	if (dy) { dy = dy/Math.abs(dy); }
	var nx = dy;
	var ny = -dx;
	
	var ok = true;
	for (var i=0; i<length; i++) {
		var x = sx + i*dx;
		var y = sy + i*dy;

		if (!canBeDugCallback(     x,      y)) { ok = false; }
		if (!isWallCallback  (x + nx, y + ny)) { ok = false; }
		if (!isWallCallback  (x - nx, y - ny)) { ok = false; }
		
		if (!ok) {
			length = i;
			this._endX = x-dx;
			this._endY = y-dy;
			break;
		}
	}
	
	/**
	 * If the length degenerated, this corridor might be invalid
	 */
	 
	/* not supported */
	if (length == 0) { return false; } 
	
	 /* length 1 allowed only if the next space is empty */
	if (length == 1 && isWallCallback(this._endX + dx, this._endY + dy)) { return false; }
	
	/**
	 * We do not want the corridor to crash into a corner of a room;
	 * if any of the ending corners is empty, the N+1th cell of this corridor must be empty too.
	 * 
	 * Situation:
	 * #######1
	 * .......?
	 * #######2
	 * 
	 * The corridor was dug from left to right.
	 * 1, 2 - problematic corners, ? = N+1th cell (not dug)
	 */
	var firstCornerBad = !isWallCallback(this._endX + dx + nx, this._endY + dy + ny);
	var secondCornerBad = !isWallCallback(this._endX + dx - nx, this._endY + dy - ny);
	this._endsWithAWall = isWallCallback(this._endX + dx, this._endY + dy);
	if ((firstCornerBad || secondCornerBad) && this._endsWithAWall) { return false; }

	return true;
}

/**
 * @param {function} digCallback Dig callback with a signature (x, y, value). Values: 0 = empty.
 */
ROT.Map.Feature.Corridor.prototype.create = function(digCallback) { 
	var sx = this._startX;
	var sy = this._startY;
	var dx = this._endX-sx;
	var dy = this._endY-sy;
	var length = 1+Math.max(Math.abs(dx), Math.abs(dy));
	
	if (dx) { dx = dx/Math.abs(dx); }
	if (dy) { dy = dy/Math.abs(dy); }
	var nx = dy;
	var ny = -dx;
	
	for (var i=0; i<length; i++) {
		var x = sx + i*dx;
		var y = sy + i*dy;
		digCallback(x, y, 0);
	}
	
	return true;
}

ROT.Map.Feature.Corridor.prototype.createPriorityWalls = function(priorityWallCallback) {
	if (!this._endsWithAWall) { return; }

	var sx = this._startX;
	var sy = this._startY;

	var dx = this._endX-sx;
	var dy = this._endY-sy;
	if (dx) { dx = dx/Math.abs(dx); }
	if (dy) { dy = dy/Math.abs(dy); }
	var nx = dy;
	var ny = -dx;

	priorityWallCallback(this._endX + dx, this._endY + dy);
	priorityWallCallback(this._endX + nx, this._endY + ny);
	priorityWallCallback(this._endX - nx, this._endY - ny);
}/**
 * @class Base noise generator
 */
ROT.Noise = function() {
};

ROT.Noise.prototype.get = function(x, y) {}
/**
 * A simple 2d implementation of simplex noise by Ondrej Zara
 *
 * Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
 * Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 */

/**
 * @class 2D simplex noise generator
 * @param {int} [gradients=256] Random gradients
 */
ROT.Noise.Simplex = function(gradients) {
	ROT.Noise.call(this);

	this._F2 = 0.5 * (Math.sqrt(3) - 1);
    this._G2 = (3 - Math.sqrt(3)) / 6;

	this._gradients = [
		[ 0, -1],
		[ 1, -1],
		[ 1,  0],
		[ 1,  1],
		[ 0,  1],
		[-1,  1],
		[-1,  0],
		[-1, -1]
	];

	var permutations = [];
	var count = gradients || 256;
	for (var i=0;i<count;i++) { permutations.push(i); }
	permutations = permutations.randomize();

	this._perms = [];
	this._indexes = [];

	for (var i=0;i<2*count;i++) {
		this._perms.push(permutations[i % count]);
		this._indexes.push(this._perms[i] % this._gradients.length);
	}

};
ROT.Noise.Simplex.extend(ROT.Noise);

ROT.Noise.Simplex.prototype.get = function(xin, yin) {
	var perms = this._perms;
	var indexes = this._indexes;
	var count = perms.length/2;
	var G2 = this._G2;

	var n0 =0, n1 = 0, n2 = 0, gi; // Noise contributions from the three corners

	// Skew the input space to determine which simplex cell we're in
	var s = (xin + yin) * this._F2; // Hairy factor for 2D
	var i = Math.floor(xin + s);
	var j = Math.floor(yin + s);
	var t = (i + j) * G2;
	var X0 = i - t; // Unskew the cell origin back to (x,y) space
	var Y0 = j - t;
	var x0 = xin - X0; // The x,y distances from the cell origin
	var y0 = yin - Y0;

	// For the 2D case, the simplex shape is an equilateral triangle.
	// Determine which simplex we are in.
	var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
	if (x0 > y0) {
		i1 = 1;
		j1 = 0;
	} else { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
		i1 = 0;
		j1 = 1;
	} // upper triangle, YX order: (0,0)->(0,1)->(1,1)

	// A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
	// a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
	// c = (3-sqrt(3))/6
	var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
	var y1 = y0 - j1 + G2;
	var x2 = x0 - 1 + 2*G2; // Offsets for last corner in (x,y) unskewed coords
	var y2 = y0 - 1 + 2*G2;

	// Work out the hashed gradient indices of the three simplex corners
	var ii = i.mod(count);
	var jj = j.mod(count);

	// Calculate the contribution from the three corners
	var t0 = 0.5 - x0*x0 - y0*y0;
	if (t0 >= 0) {
		t0 *= t0;
		gi = indexes[ii+perms[jj]];
		var grad = this._gradients[gi];
		n0 = t0 * t0 * (grad[0] * x0 + grad[1] * y0);
	}
	
	var t1 = 0.5 - x1*x1 - y1*y1;
	if (t1 >= 0) {
		t1 *= t1;
		gi = indexes[ii+i1+perms[jj+j1]];
		var grad = this._gradients[gi];
		n1 = t1 * t1 * (grad[0] * x1 + grad[1] * y1);
	}
	
	var t2 = 0.5 - x2*x2 - y2*y2;
	if (t2 >= 0) {
		t2 *= t2;
		gi = indexes[ii+1+perms[jj+1]];
		var grad = this._gradients[gi];
		n2 = t2 * t2 * (grad[0] * x2 + grad[1] * y2);
	}

	// Add contributions from each corner to get the final noise value.
	// The result is scaled to return values in the interval [-1,1].
	return 70 * (n0 + n1 + n2);
}
/**
 * @class Abstract FOV algorithm
 * @param {function} lightPassesCallback Does the light pass through x,y?
 * @param {object} [options]
 * @param {int} [options.topology=8] 4/6/8
 */
ROT.FOV = function(lightPassesCallback, options) {
	this._lightPasses = lightPassesCallback;
	this._options = {
		topology: 8
	}
	for (var p in options) { this._options[p] = options[p]; }
};

/**
 * Compute visibility for a 360-degree circle
 * @param {int} x
 * @param {int} y
 * @param {int} R Maximum visibility radius
 * @param {function} callback
 */
ROT.FOV.prototype.compute = function(x, y, R, callback) {}

/**
 * Return all neighbors in a concentric ring
 * @param {int} cx center-x
 * @param {int} cy center-y
 * @param {int} r range
 */
ROT.FOV.prototype._getCircle = function(cx, cy, r) {
	var result = [];
	var dirs, countFactor, startOffset;

	switch (this._options.topology) {
		case 4:
			countFactor = 1;
			startOffset = [0, 1];
			dirs = [
				ROT.DIRS[8][7],
				ROT.DIRS[8][1],
				ROT.DIRS[8][3],
				ROT.DIRS[8][5]
			]
		break;

		case 6:
			dirs = ROT.DIRS[6];
			countFactor = 1;
			startOffset = [-1, 1];
		break;

		case 8:
			dirs = ROT.DIRS[4];
			countFactor = 2;
			startOffset = [-1, 1];
		break;
	}

	/* starting neighbor */
	var x = cx + startOffset[0]*r;
	var y = cy + startOffset[1]*r;

	/* circle */
	for (var i=0;i<dirs.length;i++) {
		for (var j=0;j<r*countFactor;j++) {
			result.push([x, y]);
			x += dirs[i][0];
			y += dirs[i][1];

		}
	}

	return result;
}
/**
 * @class Discrete shadowcasting algorithm. Obsoleted by Precise shadowcasting.
 * @augments ROT.FOV
 */
ROT.FOV.DiscreteShadowcasting = function(lightPassesCallback, options) {
	ROT.FOV.call(this, lightPassesCallback, options);
}
ROT.FOV.DiscreteShadowcasting.extend(ROT.FOV);

/**
 * @see ROT.FOV#compute
 */
ROT.FOV.DiscreteShadowcasting.prototype.compute = function(x, y, R, callback) {
	var center = this._coords;
	var map = this._map;

	/* this place is always visible */
	callback(x, y, 0);

	/* standing in a dark place. FIXME is this a good idea?  */
	if (!this._lightPasses(x, y)) { return; }
	
	/* start and end angles */
	var DATA = [];
	
	var A, B, cx, cy, blocks;

	/* analyze surrounding cells in concentric rings, starting from the center */
	for (var r=1; r<=R; r++) {
		var neighbors = this._getCircle(x, y, r);
		var angle = 360 / neighbors.length;

		for (var i=0;i<neighbors.length;i++) {
			cx = neighbors[i][0];
			cy = neighbors[i][1];
			A = angle * (i - 0.5);
			B = A + angle;
			
			blocks = !this._lightPasses(cx, cy);
			if (this._visibleCoords(Math.floor(A), Math.ceil(B), blocks, DATA)) { callback(cx, cy, r, 1); }
			
			if (DATA.length == 2 && DATA[0] == 0 && DATA[1] == 360) { return; } /* cutoff? */

		} /* for all cells in this ring */
	} /* for all rings */
}

/**
 * @param {int} A start angle
 * @param {int} B end angle
 * @param {bool} blocks Does current cell block visibility?
 * @param {int[][]} DATA shadowed angle pairs
 */
ROT.FOV.DiscreteShadowcasting.prototype._visibleCoords = function(A, B, blocks, DATA) {
	if (A < 0) { 
		var v1 = arguments.callee(0, B, blocks, DATA);
		var v2 = arguments.callee(360+A, 360, blocks, DATA);
		return v1 || v2;
	}
	
	var index = 0;
	while (index < DATA.length && DATA[index] < A) { index++; }
	
	if (index == DATA.length) { /* completely new shadow */
		if (blocks) { DATA.push(A, B); } 
		return true;
	}
	
	var count = 0;
	
	if (index % 2) { /* this shadow starts in an existing shadow, or within its ending boundary */
		while (index < DATA.length && DATA[index] < B) {
			index++;
			count++;
		}
		
		if (count == 0) { return false; }
		
		if (blocks) { 
			if (count % 2) {
				DATA.splice(index-count, count, B);
			} else {
				DATA.splice(index-count, count);
			}
		}
		
		return true;

	} else { /* this shadow starts outside an existing shadow, or within a starting boundary */
		while (index < DATA.length && DATA[index] < B) {
			index++;
			count++;
		}
		
		/* visible when outside an existing shadow, or when overlapping */
		if (A == DATA[index-count] && count == 1) { return false; }
		
		if (blocks) { 
			if (count % 2) {
				DATA.splice(index-count, count, A);
			} else {
				DATA.splice(index-count, count, A, B);
			}
		}
			
		return true;
	}
}
/**
 * @class Precise shadowcasting algorithm
 * @augments ROT.FOV
 */
ROT.FOV.PreciseShadowcasting = function(lightPassesCallback, options) {
	ROT.FOV.call(this, lightPassesCallback, options);
}
ROT.FOV.PreciseShadowcasting.extend(ROT.FOV);

/**
 * @see ROT.FOV#compute
 */
ROT.FOV.PreciseShadowcasting.prototype.compute = function(x, y, R, callback) {
	/* this place is always visible */
	callback(x, y, 0, 1);

	/* standing in a dark place. FIXME is this a good idea?  */
	if (!this._lightPasses(x, y)) { return; }
	
	/* list of all shadows */
	var SHADOWS = [];
	
	var cx, cy, blocks, A1, A2, visibility;

	/* analyze surrounding cells in concentric rings, starting from the center */
	for (var r=1; r<=R; r++) {
		var neighbors = this._getCircle(x, y, r);
		var neighborCount = neighbors.length;

		for (var i=0;i<neighborCount;i++) {
			cx = neighbors[i][0];
			cy = neighbors[i][1];
			/* shift half-an-angle backwards to maintain consistency of 0-th cells */
			A1 = [i ? 2*i-1 : 2*neighborCount-1, 2*neighborCount];
			A2 = [2*i+1, 2*neighborCount]; 
			
			blocks = !this._lightPasses(cx, cy);
			visibility = this._checkVisibility(A1, A2, blocks, SHADOWS);
			if (visibility) { callback(cx, cy, r, visibility); }

			if (SHADOWS.length == 2 && SHADOWS[0][0] == 0 && SHADOWS[1][0] == SHADOWS[1][1]) { return; } /* cutoff? */

		} /* for all cells in this ring */
	} /* for all rings */
}

/**
 * @param {int[2]} A1 arc start
 * @param {int[2]} A2 arc end
 * @param {bool} blocks Does current arc block visibility?
 * @param {int[][]} SHADOWS list of active shadows
 */
ROT.FOV.PreciseShadowcasting.prototype._checkVisibility = function(A1, A2, blocks, SHADOWS) {
	if (A1[0] > A2[0]) { /* split into two sub-arcs */
		var v1 = this._checkVisibility(A1, [A1[1], A1[1]], blocks, SHADOWS);
		var v2 = this._checkVisibility([0, 1], A2, blocks, SHADOWS);
		return (v1+v2)/2;
	}

	/* index1: first shadow >= A1 */
	var index1 = 0, edge1 = false;
	while (index1 < SHADOWS.length) {
		var old = SHADOWS[index1];
		var diff = old[0]*A1[1] - A1[0]*old[1];
		if (diff >= 0) { /* old >= A1 */
			if (diff == 0 && !(index1 % 2)) { edge1 = true; }
			break;
		}
		index1++;
	}

	/* index2: last shadow <= A2 */
	var index2 = SHADOWS.length, edge2 = false;
	while (index2--) {
		var old = SHADOWS[index2];
		var diff = A2[0]*old[1] - old[0]*A2[1];
		if (diff >= 0) { /* old <= A2 */
			if (diff == 0 && (index2 % 2)) { edge2 = true; }
			break;
		}
	}

	var visible = true;
	if (index1 == index2 && (edge1 || edge2)) {  /* subset of existing shadow, one of the edges match */
		visible = false; 
	} else if (edge1 && edge2 && index1+1==index2 && (index2 % 2)) { /* completely equivalent with existing shadow */
		visible = false;
	} else if (index1 > index2 && (index1 % 2)) { /* subset of existing shadow, not touching */
		visible = false;
	}
	
	if (!visible) { return 0; } /* fast case: not visible */
	
	var visibleLength, P;

	/* compute the length of visible arc, adjust list of shadows (if blocking) */
	var remove = index2-index1+1;
	if (remove % 2) {
		if (index1 % 2) { /* first edge within existing shadow, second outside */
			var P = SHADOWS[index1];
			visibleLength = (A2[0]*P[1] - P[0]*A2[1]) / (P[1] * A2[1]);
			if (blocks) { SHADOWS.splice(index1, remove, A2); }
		} else { /* second edge within existing shadow, first outside */
			var P = SHADOWS[index2];
			visibleLength = (P[0]*A1[1] - A1[0]*P[1]) / (A1[1] * P[1]);
			if (blocks) { SHADOWS.splice(index1, remove, A1); }
		}
	} else {
		if (index1 % 2) { /* both edges within existing shadows */
			var P1 = SHADOWS[index1];
			var P2 = SHADOWS[index2];
			visibleLength = (P2[0]*P1[1] - P1[0]*P2[1]) / (P1[1] * P2[1]);
			if (blocks) { SHADOWS.splice(index1, remove); }
		} else { /* both edges outside existing shadows */
			if (blocks) { SHADOWS.splice(index1, remove, A1, A2); }
			return 1; /* whole arc visible! */
		}
	}

	var arcLength = (A2[0]*A1[1] - A1[0]*A2[1]) / (A1[1] * A2[1]);

	return visibleLength/arcLength;
}
/**
 * @class Recursive shadowcasting algorithm
 * Currently only supports 4/8 topologies, not hexagonal.
 * Based on Peter Harkins' implementation of Björn Bergström's algorithm described here: http://www.roguebasin.com/index.php?title=FOV_using_recursive_shadowcasting
 * @augments ROT.FOV
 */
ROT.FOV.RecursiveShadowcasting = function(lightPassesCallback, options) {
	ROT.FOV.call(this, lightPassesCallback, options);
}
ROT.FOV.RecursiveShadowcasting.extend(ROT.FOV);

/** Octants used for translating recursive shadowcasting offsets */
ROT.FOV.RecursiveShadowcasting.OCTANTS = [
	[-1,  0,  0,  1],
	[ 0, -1,  1,  0],
	[ 0, -1, -1,  0],
	[-1,  0,  0, -1],
	[ 1,  0,  0, -1],
	[ 0,  1, -1,  0],
	[ 0,  1,  1,  0],
	[ 1,  0,  0,  1]
];

/**
 * Compute visibility for a 360-degree circle
 * @param {int} x
 * @param {int} y
 * @param {int} R Maximum visibility radius
 * @param {function} callback
 */
ROT.FOV.RecursiveShadowcasting.prototype.compute = function(x, y, R, callback) {
	//You can always see your own tile
	callback(x, y, 0, true);
	for(var i = 0; i < ROT.FOV.RecursiveShadowcasting.OCTANTS.length; i++) {
		this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[i], R, callback);
	}
}

/**
 * Compute visibility for a 180-degree arc
 * @param {int} x
 * @param {int} y
 * @param {int} R Maximum visibility radius
 * @param {int} dir Direction to look in (expressed in a ROT.DIR value);
 * @param {function} callback
 */
ROT.FOV.RecursiveShadowcasting.prototype.compute180 = function(x, y, R, dir, callback) {
	//You can always see your own tile
	callback(x, y, 0, true);
	var previousOctant = (dir - 1 + 8) % 8; //Need to retrieve the previous octant to render a full 180 degrees
	var nextPreviousOctant = (dir - 2 + 8) % 8; //Need to retrieve the previous two octants to render a full 180 degrees
	var nextOctant = (dir+ 1 + 8) % 8; //Need to grab to next octant to render a full 180 degrees
	this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[nextPreviousOctant], R, callback);
	this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[previousOctant], R, callback);
	this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[dir], R, callback);
	this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[nextOctant], R, callback);
}

/**
 * Compute visibility for a 90-degree arc
 * @param {int} x
 * @param {int} y
 * @param {int} R Maximum visibility radius
 * @param {int} dir Direction to look in (expressed in a ROT.DIR value);
 * @param {function} callback
 */
ROT.FOV.RecursiveShadowcasting.prototype.compute90 = function(x, y, R, dir, callback) {
	//You can always see your own tile
	callback(x, y, 0, true);
	var previousOctant = (dir - 1 + 8) % 8; //Need to retrieve the previous octant to render a full 90 degrees
	this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[dir], R, callback);
	this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[previousOctant], R, callback);
}

/**
 * Render one octant (45-degree arc) of the viewshed
 * @param {int} x
 * @param {int} y
 * @param {int} octant Octant to be rendered
 * @param {int} R Maximum visibility radius
 * @param {function} callback
 */
ROT.FOV.RecursiveShadowcasting.prototype._renderOctant = function(x, y, octant, R, callback) {
	//Radius incremented by 1 to provide same coverage area as other shadowcasting radiuses
	this._castVisibility(x, y, 1, 1.0, 0.0, R + 1, octant[0], octant[1], octant[2], octant[3], callback);
}

/**
 * Actually calculates the visibility
 * @param {int} startX The starting X coordinate
 * @param {int} startY The starting Y coordinate
 * @param {int} row The row to render
 * @param {float} visSlopeStart The slope to start at
 * @param {float} visSlopeEnd The slope to end at
 * @param {int} radius The radius to reach out to
 * @param {int} xx 
 * @param {int} xy 
 * @param {int} yx 
 * @param {int} yy 
 * @param {function} callback The callback to use when we hit a block that is visible
 */
ROT.FOV.RecursiveShadowcasting.prototype._castVisibility = function(startX, startY, row, visSlopeStart, visSlopeEnd, radius, xx, xy, yx, yy, callback) {
	if(visSlopeStart < visSlopeEnd) { return; }
	for(var i = row; i <= radius; i++) {
		var dx = -i - 1;
		var dy = -i;
		var blocked = false;
		var newStart = 0;

		//'Row' could be column, names here assume octant 0 and would be flipped for half the octants
		while(dx <= 0) {
			dx += 1;

			//Translate from relative coordinates to map coordinates
			var mapX = startX + dx * xx + dy * xy;
			var mapY = startY + dx * yx + dy * yy;

			//Range of the row
			var slopeStart = (dx - 0.5) / (dy + 0.5);
			var slopeEnd = (dx + 0.5) / (dy - 0.5);
		
			//Ignore if not yet at left edge of Octant
			if(slopeEnd > visSlopeStart) { continue; }
			
			//Done if past right edge
			if(slopeStart < visSlopeEnd) { break; }
				
			//If it's in range, it's visible
			if((dx * dx + dy * dy) < (radius * radius)) {
				callback(mapX, mapY, i, true);
			}
	
			if(!blocked) {
				//If tile is a blocking tile, cast around it
				if(!this._lightPasses(mapX, mapY) && i < radius) {
					blocked = true;
					this._castVisibility(startX, startY, i + 1, visSlopeStart, slopeStart, radius, xx, xy, yx, yy, callback);
					newStart = slopeEnd;
				}
			} else {
				//Keep narrowing if scanning across a block
				if(!this._lightPasses(mapX, mapY)) {
					newStart = slopeEnd;
					continue;
				}
			
				//Block has ended
				blocked = false;
				visSlopeStart = newStart;
			}
		}
		if(blocked) { break; }
	}
}
/**
 * @namespace Color operations
 */
ROT.Color = {
	fromString: function(str) {
		var cached, r;
		if (str in this._cache) {
			cached = this._cache[str];
		} else {
			if (str.charAt(0) == "#") { /* hex rgb */

				var values = str.match(/[0-9a-f]/gi).map(function(x) { return parseInt(x, 16); });
				if (values.length == 3) {
					cached = values.map(function(x) { return x*17; });
				} else {
					for (var i=0;i<3;i++) {
						values[i+1] += 16*values[i];
						values.splice(i, 1);
					}
					cached = values;
				}

			} else if (r = str.match(/rgb\(([0-9, ]+)\)/i)) { /* decimal rgb */
				cached = r[1].split(/\s*,\s*/).map(function(x) { return parseInt(x); });
			} else { /* html name */
				cached = [0, 0, 0];
			}

			this._cache[str] = cached;
		}

		return cached.slice();
	},

	/**
	 * Add two or more colors
	 * @param {number[]} color1
	 * @param {number[]} color2
	 * @returns {number[]}
	 */
	add: function(color1, color2) {
		var result = color1.slice();
		for (var i=0;i<3;i++) {
			for (var j=1;j<arguments.length;j++) {
				result[i] += arguments[j][i];
			}
		}
		return result;
	},

	/**
	 * Add two or more colors, MODIFIES FIRST ARGUMENT
	 * @param {number[]} color1
	 * @param {number[]} color2
	 * @returns {number[]}
	 */
	add_: function(color1, color2) {
		for (var i=0;i<3;i++) {
			for (var j=1;j<arguments.length;j++) {
				color1[i] += arguments[j][i];
			}
		}
		return color1;
	},

	/**
	 * Multiply (mix) two or more colors
	 * @param {number[]} color1
	 * @param {number[]} color2
	 * @returns {number[]}
	 */
	multiply: function(color1, color2) {
		var result = color1.slice();
		for (var i=0;i<3;i++) {
			for (var j=1;j<arguments.length;j++) {
				result[i] *= arguments[j][i] / 255;
			}
			result[i] = Math.round(result[i]);
		}
		return result;
	},

	/**
	 * Multiply (mix) two or more colors, MODIFIES FIRST ARGUMENT
	 * @param {number[]} color1
	 * @param {number[]} color2
	 * @returns {number[]}
	 */
	multiply_: function(color1, color2) {
		for (var i=0;i<3;i++) {
			for (var j=1;j<arguments.length;j++) {
				color1[i] *= arguments[j][i] / 255;
			}
			color1[i] = Math.round(color1[i]);
		}
		return color1;
	},

	/**
	 * Interpolate (blend) two colors with a given factor
	 * @param {number[]} color1
	 * @param {number[]} color2
	 * @param {float} [factor=0.5] 0..1
	 * @returns {number[]}
	 */
	interpolate: function(color1, color2, factor) {
		if (arguments.length < 3) { factor = 0.5; }
		var result = color1.slice();
		for (var i=0;i<3;i++) {
			result[i] = Math.round(result[i] + factor*(color2[i]-color1[i]));
		}
		return result;
	},

	/**
	 * Interpolate (blend) two colors with a given factor in HSL mode
	 * @param {number[]} color1
	 * @param {number[]} color2
	 * @param {float} [factor=0.5] 0..1
	 * @returns {number[]}
	 */
	interpolateHSL: function(color1, color2, factor) {
		if (arguments.length < 3) { factor = 0.5; }
		var hsl1 = this.rgb2hsl(color1);
		var hsl2 = this.rgb2hsl(color2);
		for (var i=0;i<3;i++) {
			hsl1[i] += factor*(hsl2[i]-hsl1[i]);
		}
		return this.hsl2rgb(hsl1);
	},

	/**
	 * Create a new random color based on this one
	 * @param {number[]} color
	 * @param {number[]} diff Set of standard deviations
	 * @returns {number[]}
	 */
	randomize: function(color, diff) {
		if (!(diff instanceof Array)) { diff = ROT.RNG.getNormal(0, diff); }
		var result = color.slice();
		for (var i=0;i<3;i++) {
			result[i] += (diff instanceof Array ? Math.round(ROT.RNG.getNormal(0, diff[i])) : diff);
		}
		return result;
	},

	/**
	 * Converts an RGB color value to HSL. Expects 0..255 inputs, produces 0..1 outputs.
	 * @param {number[]} color
	 * @returns {number[]}
	 */
	rgb2hsl: function(color) {
		var r = color[0]/255;
		var g = color[1]/255;
		var b = color[2]/255;

		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;

		if (max == min) {
			h = s = 0; // achromatic
		} else {
			var d = max - min;
			s = (l > 0.5 ? d / (2 - max - min) : d / (max + min));
			switch(max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}

		return [h, s, l];
	},

	/**
	 * Converts an HSL color value to RGB. Expects 0..1 inputs, produces 0..255 outputs.
	 * @param {number[]} color
	 * @returns {number[]}
	 */
	hsl2rgb: function(color) {
		var l = color[2];

		if (color[1] == 0) {
			l = Math.round(l*255);
			return [l, l, l];
		} else {
			function hue2rgb(p, q, t) {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1/6) return p + (q - p) * 6 * t;
				if (t < 1/2) return q;
				if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			}

			var s = color[1];
			var q = (l < 0.5 ? l * (1 + s) : l + s - l * s);
			var p = 2 * l - q;
			var r = hue2rgb(p, q, color[0] + 1/3);
			var g = hue2rgb(p, q, color[0]);
			var b = hue2rgb(p, q, color[0] - 1/3);
			return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
		}
	},

	toRGB: function(color) {
		return "rgb(" + this._clamp(color[0]) + "," + this._clamp(color[1]) + "," + this._clamp(color[2]) + ")";
	},

	toHex: function(color) {
		var parts = [];
		for (var i=0;i<3;i++) {
			parts.push(this._clamp(color[i]).toString(16).lpad("0", 2));
		}
		return "#" + parts.join("");
	},

	_clamp: function(num) {
		if (num < 0) {
			return 0;
		} else if (num > 255) {
			return 255;
		} else {
			return num;
		}
	},

	_cache: {
		"black": [0,0,0],
		"navy": [0,0,128],
		"darkblue": [0,0,139],
		"mediumblue": [0,0,205],
		"blue": [0,0,255],
		"darkgreen": [0,100,0],
		"green": [0,128,0],
		"teal": [0,128,128],
		"darkcyan": [0,139,139],
		"deepskyblue": [0,191,255],
		"darkturquoise": [0,206,209],
		"mediumspringgreen": [0,250,154],
		"lime": [0,255,0],
		"springgreen": [0,255,127],
		"aqua": [0,255,255],
		"cyan": [0,255,255],
		"midnightblue": [25,25,112],
		"dodgerblue": [30,144,255],
		"forestgreen": [34,139,34],
		"seagreen": [46,139,87],
		"darkslategray": [47,79,79],
		"darkslategrey": [47,79,79],
		"limegreen": [50,205,50],
		"mediumseagreen": [60,179,113],
		"turquoise": [64,224,208],
		"royalblue": [65,105,225],
		"steelblue": [70,130,180],
		"darkslateblue": [72,61,139],
		"mediumturquoise": [72,209,204],
		"indigo": [75,0,130],
		"darkolivegreen": [85,107,47],
		"cadetblue": [95,158,160],
		"cornflowerblue": [100,149,237],
		"mediumaquamarine": [102,205,170],
		"dimgray": [105,105,105],
		"dimgrey": [105,105,105],
		"slateblue": [106,90,205],
		"olivedrab": [107,142,35],
		"slategray": [112,128,144],
		"slategrey": [112,128,144],
		"lightslategray": [119,136,153],
		"lightslategrey": [119,136,153],
		"mediumslateblue": [123,104,238],
		"lawngreen": [124,252,0],
		"chartreuse": [127,255,0],
		"aquamarine": [127,255,212],
		"maroon": [128,0,0],
		"purple": [128,0,128],
		"olive": [128,128,0],
		"gray": [128,128,128],
		"grey": [128,128,128],
		"skyblue": [135,206,235],
		"lightskyblue": [135,206,250],
		"blueviolet": [138,43,226],
		"darkred": [139,0,0],
		"darkmagenta": [139,0,139],
		"saddlebrown": [139,69,19],
		"darkseagreen": [143,188,143],
		"lightgreen": [144,238,144],
		"mediumpurple": [147,112,216],
		"darkviolet": [148,0,211],
		"palegreen": [152,251,152],
		"darkorchid": [153,50,204],
		"yellowgreen": [154,205,50],
		"sienna": [160,82,45],
		"brown": [165,42,42],
		"darkgray": [169,169,169],
		"darkgrey": [169,169,169],
		"lightblue": [173,216,230],
		"greenyellow": [173,255,47],
		"paleturquoise": [175,238,238],
		"lightsteelblue": [176,196,222],
		"powderblue": [176,224,230],
		"firebrick": [178,34,34],
		"darkgoldenrod": [184,134,11],
		"mediumorchid": [186,85,211],
		"rosybrown": [188,143,143],
		"darkkhaki": [189,183,107],
		"silver": [192,192,192],
		"mediumvioletred": [199,21,133],
		"indianred": [205,92,92],
		"peru": [205,133,63],
		"chocolate": [210,105,30],
		"tan": [210,180,140],
		"lightgray": [211,211,211],
		"lightgrey": [211,211,211],
		"palevioletred": [216,112,147],
		"thistle": [216,191,216],
		"orchid": [218,112,214],
		"goldenrod": [218,165,32],
		"crimson": [220,20,60],
		"gainsboro": [220,220,220],
		"plum": [221,160,221],
		"burlywood": [222,184,135],
		"lightcyan": [224,255,255],
		"lavender": [230,230,250],
		"darksalmon": [233,150,122],
		"violet": [238,130,238],
		"palegoldenrod": [238,232,170],
		"lightcoral": [240,128,128],
		"khaki": [240,230,140],
		"aliceblue": [240,248,255],
		"honeydew": [240,255,240],
		"azure": [240,255,255],
		"sandybrown": [244,164,96],
		"wheat": [245,222,179],
		"beige": [245,245,220],
		"whitesmoke": [245,245,245],
		"mintcream": [245,255,250],
		"ghostwhite": [248,248,255],
		"salmon": [250,128,114],
		"antiquewhite": [250,235,215],
		"linen": [250,240,230],
		"lightgoldenrodyellow": [250,250,210],
		"oldlace": [253,245,230],
		"red": [255,0,0],
		"fuchsia": [255,0,255],
		"magenta": [255,0,255],
		"deeppink": [255,20,147],
		"orangered": [255,69,0],
		"tomato": [255,99,71],
		"hotpink": [255,105,180],
		"coral": [255,127,80],
		"darkorange": [255,140,0],
		"lightsalmon": [255,160,122],
		"orange": [255,165,0],
		"lightpink": [255,182,193],
		"pink": [255,192,203],
		"gold": [255,215,0],
		"peachpuff": [255,218,185],
		"navajowhite": [255,222,173],
		"moccasin": [255,228,181],
		"bisque": [255,228,196],
		"mistyrose": [255,228,225],
		"blanchedalmond": [255,235,205],
		"papayawhip": [255,239,213],
		"lavenderblush": [255,240,245],
		"seashell": [255,245,238],
		"cornsilk": [255,248,220],
		"lemonchiffon": [255,250,205],
		"floralwhite": [255,250,240],
		"snow": [255,250,250],
		"yellow": [255,255,0],
		"lightyellow": [255,255,224],
		"ivory": [255,255,240],
		"white": [255,255,255]
	}
}
/**
 * @class Lighting computation, based on a traditional FOV for multiple light sources and multiple passes.
 * @param {function} reflectivityCallback Callback to retrieve cell reflectivity (0..1)
 * @param {object} [options]
 * @param {int} [options.passes=1] Number of passes. 1 equals to simple FOV of all light sources, >1 means a *highly simplified* radiosity-like algorithm.
 * @param {int} [options.emissionThreshold=100] Cells with emissivity > threshold will be treated as light source in the next pass.
 * @param {int} [options.range=10] Max light range
 */
ROT.Lighting = function(reflectivityCallback, options) {
	this._reflectivityCallback = reflectivityCallback;
	this._options = {
		passes: 1,
		emissionThreshold: 100,
		range: 10
	};
	this._fov = null;

	this._lights = {};
	this._reflectivityCache = {};
	this._fovCache = {};

	this.setOptions(options);
}

/**
 * Adjust options at runtime
 * @see ROT.Lighting
 * @param {object} [options]
 */
ROT.Lighting.prototype.setOptions = function(options) {
	for (var p in options) { this._options[p] = options[p]; }
	if (options.range) { this.reset(); }
	return this;
}

/**
 * Set the used Field-Of-View algo
 * @param {ROT.FOV} fov
 */
ROT.Lighting.prototype.setFOV = function(fov) {
	this._fov = fov;
	this._fovCache = {};
	return this;
}

/**
 * Set (or remove) a light source
 * @param {int} x
 * @param {int} y
 * @param {null || string || number[3]} color
 */
ROT.Lighting.prototype.setLight = function(x, y, color) {
	var key = x+","+y;

	if (color) {
		this._lights[key] = (typeof(color) == "string" ? ROT.Color.fromString(color) : color);
	} else {
		delete this._lights[key];
	}
	return this;
}

/**
 * Reset the pre-computed topology values. Call whenever the underlying map changes its light-passability.
 */
ROT.Lighting.prototype.reset = function() {
	this._reflectivityCache = {};
	this._fovCache = {};

	return this;
}

/**
 * Compute the lighting
 * @param {function} lightingCallback Will be called with (x, y, color) for every lit cell
 */
ROT.Lighting.prototype.compute = function(lightingCallback) {
	var doneCells = {};
	var emittingCells = {};
	var litCells = {};

	for (var key in this._lights) { /* prepare emitters for first pass */
		var light = this._lights[key];
		if (!(key in emittingCells)) { emittingCells[key] = [0, 0, 0]; }

		ROT.Color.add_(emittingCells[key], light);
	}

	for (var i=0;i<this._options.passes;i++) { /* main loop */
		this._emitLight(emittingCells, litCells, doneCells);
		if (i+1 == this._options.passes) { continue; } /* not for the last pass */
		emittingCells = this._computeEmitters(litCells, doneCells);
	}

	for (var litKey in litCells) { /* let the user know what and how is lit */
		var parts = litKey.split(",");
		var x = parseInt(parts[0]);
		var y = parseInt(parts[1]);
		lightingCallback(x, y, litCells[litKey]);
	}

	return this;
}

/**
 * Compute one iteration from all emitting cells
 * @param {object} emittingCells These emit light
 * @param {object} litCells Add projected light to these
 * @param {object} doneCells These already emitted, forbid them from further calculations
 */
ROT.Lighting.prototype._emitLight = function(emittingCells, litCells, doneCells) {
	for (var key in emittingCells) {
		var parts = key.split(",");
		var x = parseInt(parts[0]);
		var y = parseInt(parts[1]);
		this._emitLightFromCell(x, y, emittingCells[key], litCells);
		doneCells[key] = 1;
	}
	return this;
}

/**
 * Prepare a list of emitters for next pass
 * @param {object} litCells
 * @param {object} doneCells
 * @returns {object}
 */
ROT.Lighting.prototype._computeEmitters = function(litCells, doneCells) {
	var result = {};

	for (var key in litCells) {
		if (key in doneCells) { continue; } /* already emitted */

		var color = litCells[key];

		if (key in this._reflectivityCache) {
			var reflectivity = this._reflectivityCache[key];
		} else {
			var parts = key.split(",");
			var x = parseInt(parts[0]);
			var y = parseInt(parts[1]);
			var reflectivity = this._reflectivityCallback(x, y);
			this._reflectivityCache[key] = reflectivity;
		}

		if (reflectivity == 0) { continue; } /* will not reflect at all */

		/* compute emission color */
		var emission = [];
		var intensity = 0;
		for (var i=0;i<3;i++) {
			var part = Math.round(color[i]*reflectivity);
			emission[i] = part;
			intensity += part;
		}
		if (intensity > this._options.emissionThreshold) { result[key] = emission; }
	}

	return result;
}

/**
 * Compute one iteration from one cell
 * @param {int} x
 * @param {int} y
 * @param {number[]} color
 * @param {object} litCells Cell data to by updated
 */
ROT.Lighting.prototype._emitLightFromCell = function(x, y, color, litCells) {
	var key = x+","+y;
	if (key in this._fovCache) {
		var fov = this._fovCache[key];
	} else {
		var fov = this._updateFOV(x, y);
	}

	for (var fovKey in fov) {
		var formFactor = fov[fovKey];

		if (fovKey in litCells) { /* already lit */
			var result = litCells[fovKey];
		} else { /* newly lit */
			var result = [0, 0, 0];
			litCells[fovKey] = result;
		}

		for (var i=0;i<3;i++) { result[i] += Math.round(color[i]*formFactor); } /* add light color */
	}

	return this;
}

/**
 * Compute FOV ("form factor") for a potential light source at [x,y]
 * @param {int} x
 * @param {int} y
 * @returns {object}
 */
ROT.Lighting.prototype._updateFOV = function(x, y) {
	var key1 = x+","+y;
	var cache = {};
	this._fovCache[key1] = cache;
	var range = this._options.range;
	var cb = function(x, y, r, vis) {
		var key2 = x+","+y;
		var formFactor = vis * (1-r/range);
		if (formFactor == 0) { return; }
		cache[key2] = formFactor;
	}
	this._fov.compute(x, y, range, cb.bind(this));

	return cache;
}
/**
 * @class Abstract pathfinder
 * @param {int} toX Target X coord
 * @param {int} toY Target Y coord
 * @param {function} passableCallback Callback to determine map passability
 * @param {object} [options]
 * @param {int} [options.topology=8]
 */
ROT.Path = function(toX, toY, passableCallback, options) {
	this._toX = toX;
	this._toY = toY;
	this._fromX = null;
	this._fromY = null;
	this._passableCallback = passableCallback;
	this._options = {
		topology: 8
	}
	for (var p in options) { this._options[p] = options[p]; }

	this._dirs = ROT.DIRS[this._options.topology];
	if (this._options.topology == 8) { /* reorder dirs for more aesthetic result (vertical/horizontal first) */
		this._dirs = [
			this._dirs[0],
			this._dirs[2],
			this._dirs[4],
			this._dirs[6],
			this._dirs[1],
			this._dirs[3],
			this._dirs[5],
			this._dirs[7]
		]
	}
}

/**
 * Compute a path from a given point
 * @param {int} fromX
 * @param {int} fromY
 * @param {function} callback Will be called for every path item with arguments "x" and "y"
 */
ROT.Path.prototype.compute = function(fromX, fromY, callback) {
}

ROT.Path.prototype._getNeighbors = function(cx, cy) {
	var result = [];
	for (var i=0;i<this._dirs.length;i++) {
		var dir = this._dirs[i];
		var x = cx + dir[0];
		var y = cy + dir[1];
		
		if (!this._passableCallback(x, y)) { continue; }
		result.push([x, y]);
	}
	
	return result;
}
/**
 * @class Simplified Dijkstra's algorithm: all edges have a value of 1
 * @augments ROT.Path
 * @see ROT.Path
 */
ROT.Path.Dijkstra = function(toX, toY, passableCallback, options) {
	ROT.Path.call(this, toX, toY, passableCallback, options);

	this._computed = {};
	this._todo = [];
	this._add(toX, toY, null);
}
ROT.Path.Dijkstra.extend(ROT.Path);

/**
 * Compute a path from a given point
 * @see ROT.Path#compute
 */
ROT.Path.Dijkstra.prototype.compute = function(fromX, fromY, callback) {
	var key = fromX+","+fromY;
	if (!(key in this._computed)) { this._compute(fromX, fromY); }
	if (!(key in this._computed)) { return; }
	
	var item = this._computed[key];
	while (item) {
		callback(item.x, item.y);
		item = item.prev;
	}
}

/**
 * Compute a non-cached value
 */
ROT.Path.Dijkstra.prototype._compute = function(fromX, fromY) {
	while (this._todo.length) {
		var item = this._todo.shift();
		if (item.x == fromX && item.y == fromY) { return; }
		
		var neighbors = this._getNeighbors(item.x, item.y);
		
		for (var i=0;i<neighbors.length;i++) {
			var neighbor = neighbors[i];
			var x = neighbor[0];
			var y = neighbor[1];
			var id = x+","+y;
			if (id in this._computed) { continue; } /* already done */	
			this._add(x, y, item); 
		}
	}
}

ROT.Path.Dijkstra.prototype._add = function(x, y, prev) {
	var obj = {
		x: x,
		y: y,
		prev: prev
	}
	this._computed[x+","+y] = obj;
	this._todo.push(obj);
}
/**
 * @class Simplified A* algorithm: all edges have a value of 1
 * @augments ROT.Path
 * @see ROT.Path
 */
ROT.Path.AStar = function(toX, toY, passableCallback, options) {
	ROT.Path.call(this, toX, toY, passableCallback, options);

	this._todo = [];
	this._done = {};
	this._fromX = null;
	this._fromY = null;
}
ROT.Path.AStar.extend(ROT.Path);

/**
 * Compute a path from a given point
 * @see ROT.Path#compute
 */
ROT.Path.AStar.prototype.compute = function(fromX, fromY, callback) {
	this._todo = [];
	this._done = {};
	this._fromX = fromX;
	this._fromY = fromY;
	this._add(this._toX, this._toY, null);

	while (this._todo.length) {
		var item = this._todo.shift();
		if (item.x == fromX && item.y == fromY) { break; }
		var neighbors = this._getNeighbors(item.x, item.y);

		for (var i=0;i<neighbors.length;i++) {
			var neighbor = neighbors[i];
			var x = neighbor[0];
			var y = neighbor[1];
			var id = x+","+y;
			if (id in this._done) { continue; }
			this._add(x, y, item); 
		}
	}
	
	var item = this._done[fromX+","+fromY];
	if (!item) { return; }
	
	while (item) {
		callback(item.x, item.y);
		item = item.prev;
	}
}

ROT.Path.AStar.prototype._add = function(x, y, prev) {
	var obj = {
		x: x,
		y: y,
		prev: prev,
		g: (prev ? prev.g+1 : 0),
		h: this._distance(x, y)
	}
	this._done[x+","+y] = obj;
	
	/* insert into priority queue */
	
	var f = obj.g + obj.h;
	for (var i=0;i<this._todo.length;i++) {
		var item = this._todo[i];
		if (f < item.g + item.h) {
			this._todo.splice(i, 0, obj);
			return;
		}
	}
	
	this._todo.push(obj);
}

ROT.Path.AStar.prototype._distance = function(x, y) {
	switch (this._options.topology) {
		case 4:
			return (Math.abs(x-this._fromX) + Math.abs(y-this._fromY));
		break;

		case 6:
			var dx = Math.abs(x - this._fromX);
			var dy = Math.abs(y - this._fromY);
			return dy + Math.max(0, (dx-dy)/2);
		break;

		case 8: 
			return Math.max(Math.abs(x-this._fromX), Math.abs(y-this._fromY));
		break;
	}
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYWRyaWVuY2FydGEvZ2FtZXdlZWsyMDE0L3NyYy9nYW1lLmpzIiwiL1VzZXJzL2FkcmllbmNhcnRhL2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUuaW5wdXRzL2luZGV4LmpzIiwiL1VzZXJzL2FkcmllbmNhcnRhL2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUuaW5wdXRzL2xpYi9nYW1lcGFkLm1pbi5qcyIsIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvc3JjL251Y2xlYXJfbW9kdWxlcy9nYW1lLmlucHV0cy9saWIvbW91c2V0cmFwLm1pbi5qcyIsIi9Vc2Vycy9hZHJpZW5jYXJ0YS9nYW1ld2VlazIwMTQvc3JjL251Y2xlYXJfbW9kdWxlcy9nYW1lLnJvZ3VlbWFwL2luZGV4LmpzIiwiL1VzZXJzL2FkcmllbmNhcnRhL2dhbWV3ZWVrMjAxNC9zcmMvbnVjbGVhcl9tb2R1bGVzL2dhbWUucm9ndWVtYXAvbGliL3JvdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcbnZhciBudWNsZWFyLCBjb25zb2xlO1xuXG5jb25zb2xlID0gd2luZG93LmNvbnNvbGU7XG5udWNsZWFyID0gd2luZG93Lm51Y2xlYXI7XG5cbnJlcXVpcmUoJy4vbnVjbGVhcl9tb2R1bGVzL2dhbWUuaW5wdXRzLycpO1xucmVxdWlyZSgnLi9udWNsZWFyX21vZHVsZXMvZ2FtZS5yb2d1ZW1hcC8nKTtcblxubnVjbGVhci5tb2R1bGUoJ2lucHV0cycpLmNvbmZpZygnZ2FtZXBhZCcpLkZBQ0VfMSA9ICdGSVJFJztcbnZhciBlbnRpdHkgPSBudWNsZWFyLmVudGl0eS5jcmVhdGUoKTtcbm51Y2xlYXIuY29tcG9uZW50KCdpbnB1dHMnKS5hZGQoZW50aXR5LCB7XG4gIEZJUkUgOiBmdW5jdGlvbihlbnRpdHksIGlucHV0KXtcbiAgICBpZihpbnB1dCAhPT0gMCl7XG4gICAgICBjb25zb2xlLmxvZyhpbnB1dCk7XG4gICAgfVxuICB9LFxuICBVUCA6IGZ1bmN0aW9uKGVudGl0eSwgaW5wdXQpe1xuICAgIGlmKGlucHV0ICE9PSAwKXtcbiAgICAgIGNvbnNvbGUubG9nKGlucHV0KTtcbiAgICB9XG4gIH1cbn0pO1xuXG5mdW5jdGlvbiBsb29wKCl7XG4gIG51Y2xlYXIuc3lzdGVtLnJ1bigpO1xuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xufVxuXG53aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3ApOyIsIid1c2Ugc3RyaWN0JztcbihmdW5jdGlvbihudWNsZWFyLCBjb25zb2xlKXtcbiAgICByZXF1aXJlKCcuL2xpYi9tb3VzZXRyYXAubWluJyk7XG5cbiAgICB2YXIgaW5wdXRzLCBHYW1lcGFkLCBNb3VzZXRyYXA7XG5cbiAgICBHYW1lcGFkID0gcmVxdWlyZSgnLi9saWIvZ2FtZXBhZC5taW4nKS5HYW1lcGFkO1xuICAgIE1vdXNldHJhcCA9IHdpbmRvdy5Nb3VzZXRyYXA7XG5cbiAgICBpbnB1dHMgPSBudWNsZWFyLm1vZHVsZSgnaW5wdXRzJywgW10pO1xuXG4gICAgaW5wdXRzLmNvbXBvbmVudCgnaW5wdXRzJywgZnVuY3Rpb24oZW50aXR5LCBkYXRhKXtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gaW5wdXRzTWFuYWdlcihlbnRpdHksIGNvbXBvbmVudHMpe1xuICAgICAgdmFyIGlucHV0cyA9IGNvbXBvbmVudHMuaW5wdXRzLFxuICAgICAgICAgIGlucHV0O1xuXG4gICAgICBmb3IodmFyIGkgaW4gaW5wdXRzTWFuYWdlci5tYW5hZ2VyKXtcbiAgICAgICAgaW5wdXQgPSBpbnB1dHNNYW5hZ2VyLm1hbmFnZXJbaV07XG4gICAgICAgIGlmKGlucHV0c1tpXSl7XG5cbiAgICAgICAgICBpbnB1dHNbaV0oZW50aXR5LCBpbnB1dCwgaW5wdXRzTWFuYWdlci5tYW5hZ2VyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpbnB1dHNNYW5hZ2VyLm1hbmFnZXIgPSB7fTtcblxuICAgIGlucHV0cy5zeXN0ZW0oJ2lucHV0c01hbmFnZXInLCBbJ2lucHV0cyddLCBpbnB1dHNNYW5hZ2VyLCB7XG4gICAgICBtc1BlclVwZGF0ZSA6IDUwXG4gICAgfSk7XG5cbiAgICBpbnB1dHMuY29uZmlnKHtcbiAgICAgIGdhbWVwYWQgOiB7XG4gICAgICAgICdGQUNFXzEnIDogJycsXG4gICAgICAgICdGQUNFXzInIDogJycsXG4gICAgICAgICdGQUNFXzMnIDogJycsXG4gICAgICAgICdGQUNFXzQnIDogJycsXG5cbiAgICAgICAgJ0xFRlRfVE9QX1NIT1VMREVSJyA6ICcnLFxuICAgICAgICAnUklHSFRfVE9QX1NIT1VMREVSJyA6ICcnLFxuICAgICAgICAnTEVGVF9CT1RUT01fU0hPVUxERVInIDogJycsXG4gICAgICAgICdSSUdIVF9CT1RUT01fU0hPVUxERVInIDogJycsXG5cbiAgICAgICAgJ1NFTEVDVF9CQUNLJyA6ICcnLFxuICAgICAgICAnU1RBUlRfRk9SV0FSRCcgOiAnJyxcbiAgICAgICAgJ0xFRlRfU1RJQ0tfWCcgOiAnTEVGVF9BWElTX1gnLFxuICAgICAgICAnUklHSFRfU1RJQ0tfWCcgOiAnUklHSFRfQVhJU19YJyxcbiAgICAgICAgJ0xFRlRfU1RJQ0tfWScgOiAnTEVGVF9BWElTX1knLFxuICAgICAgICAnUklHSFRfU1RJQ0tfWScgOiAnUklHSFRfQVhJU19ZJyxcblxuICAgICAgICAnRFBBRF9VUCcgOiAnVVAnLFxuICAgICAgICAnRFBBRF9ET1dOJyA6ICdET1dOJyxcbiAgICAgICAgJ0RQQURfTEVGVCcgOiAnTEVGVCcsXG4gICAgICAgICdEUEFEX1JJR0hUJyA6ICdSSUdIVCcsXG5cbiAgICAgICAgJ0hPTUUnIDogJydcbiAgICAgIH0sXG4gICAgICBrZXlib2FyZCA6IHtcbiAgICAgICAgJ2EnIDogJ0EnLFxuICAgICAgICAndXAnIDogJ1VQJyxcbiAgICAgICAgJ2Rvd24nIDogJ0RPV04nLFxuICAgICAgICAnbGVmdCcgOiAnTEVGVCcsXG4gICAgICAgICdyaWdodCcgOiAnUklHSFQnLFxuICAgICAgICAneicgOiAnVVAnLFxuICAgICAgICAncScgOiAnTEVGVCcsXG4gICAgICAgICdzJyA6ICdET1dOJyxcbiAgICAgICAgJ2QnIDogJ1JJR0hUJyxcbiAgICAgIH1cbiAgICB9KTtcbiAgICB2YXIgZ2FtZXBhZCA9IG5ldyBHYW1lcGFkKCk7XG4gICAgZ2FtZXBhZC5pbml0KCk7XG4gICAgZ2FtZXBhZC5iaW5kKEdhbWVwYWQuRXZlbnQuQ09OTkVDVEVELCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdbTU9EVUxFQElOUFVUU10gR0FNRVBBRCBDT05ORUNURUQnKTtcbiAgICB9KTtcbiAgICBnYW1lcGFkLmJpbmQoR2FtZXBhZC5FdmVudC5VTkNPTk5FQ1RFRCwgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zb2xlLmxvZygnW01PRFVMRUBJTlBVVFNdIEdBTUVQQUQgVU5DT05ORUNURUQnKTtcbiAgICB9KTtcbiAgICBnYW1lcGFkLmJpbmQoR2FtZXBhZC5FdmVudC5CVVRUT05fRE9XTiwgZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIGFsaWFzID0gaW5wdXRzLmNvbmZpZygnZ2FtZXBhZCcpW2UuY29udHJvbF07XG4gICAgICBpbnB1dHNNYW5hZ2VyLm1hbmFnZXJbYWxpYXNdID0gMTtcbiAgICB9KTtcbiAgICBnYW1lcGFkLmJpbmQoR2FtZXBhZC5FdmVudC5CVVRUT05fVVAsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBhbGlhcyA9IGlucHV0cy5jb25maWcoJ2dhbWVwYWQnKVtlLmNvbnRyb2xdO1xuICAgICAgaW5wdXRzTWFuYWdlci5tYW5hZ2VyW2FsaWFzXSA9IDA7XG4gICAgfSk7XG4gICAgZ2FtZXBhZC5iaW5kKEdhbWVwYWQuRXZlbnQuQVhJU19DSEFOR0VELCBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgYWxpYXMgPSBpbnB1dHMuY29uZmlnKCdnYW1lcGFkJylbZS5heGlzXTtcbiAgICAgIGlucHV0c01hbmFnZXIubWFuYWdlclthbGlhc10gPSBlLnZhbHVlO1xuICAgIH0pO1xuXG4gICAgdmFyIGtleSwgY29uZmlnO1xuICAgIGNvbmZpZyA9IGlucHV0cy5jb25maWcoJ2tleWJvYXJkJyk7XG5cbiAgICBmdW5jdGlvbiBvbktleURvd24oZSwga2V5KXtcbiAgICAgIHZhciBhbGlhcyA9IGlucHV0cy5jb25maWcoJ2tleWJvYXJkJylba2V5XTtcbiAgICAgIGlucHV0c01hbmFnZXIubWFuYWdlclthbGlhc10gPSAxO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uS2V5VXAoZSwga2V5KXtcbiAgICAgIHZhciBhbGlhcyA9IGlucHV0cy5jb25maWcoJ2tleWJvYXJkJylba2V5XTtcbiAgICAgIGlucHV0c01hbmFnZXIubWFuYWdlclthbGlhc10gPSAwO1xuICAgIH1cblxuICAgIGZvcih2YXIgaSBpbiBjb25maWcpe1xuICAgICAga2V5ID0gaTtcbiAgICAgIE1vdXNldHJhcC5iaW5kKGtleSwgb25LZXlEb3duLCAna2V5ZG93bicpO1xuICAgICAgTW91c2V0cmFwLmJpbmQoa2V5LCBvbktleVVwLCAna2V5dXAnKTtcbiAgICAgIC8qanNoaW50IGlnbm9yZTplbmQgKi9cbiAgICB9XG4gICAgbnVjbGVhci5pbXBvcnQoW2lucHV0c10pO1xufSkod2luZG93Lm51Y2xlYXIsIHdpbmRvdy5jb25zb2xlKTsiLCIhZnVuY3Rpb24oYSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIGI9ZnVuY3Rpb24oKXt9LGM9e2dldFR5cGU6ZnVuY3Rpb24oKXtyZXR1cm5cIm51bGxcIn0saXNTdXBwb3J0ZWQ6ZnVuY3Rpb24oKXtyZXR1cm4hMX0sdXBkYXRlOmJ9LGQ9ZnVuY3Rpb24oYSl7dmFyIGM9dGhpcyxkPXdpbmRvdzt0aGlzLnVwZGF0ZT1iO3RoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lPWF8fGQucmVxdWVzdEFuaW1hdGlvbkZyYW1lfHxkLndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZXx8ZC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7dGhpcy50aWNrRnVuY3Rpb249ZnVuY3Rpb24oKXtjLnVwZGF0ZSgpO2Muc3RhcnRUaWNrZXIoKX07dGhpcy5zdGFydFRpY2tlcj1mdW5jdGlvbigpe2MucmVxdWVzdEFuaW1hdGlvbkZyYW1lLmFwcGx5KGQsW2MudGlja0Z1bmN0aW9uXSl9fTtkLnByb3RvdHlwZS5zdGFydD1mdW5jdGlvbihhKXt0aGlzLnVwZGF0ZT1hfHxiO3RoaXMuc3RhcnRUaWNrZXIoKX07dmFyIGU9ZnVuY3Rpb24oKXt9O2UucHJvdG90eXBlLnVwZGF0ZT1iO2UucHJvdG90eXBlLnN0YXJ0PWZ1bmN0aW9uKGEpe3RoaXMudXBkYXRlPWF8fGJ9O3ZhciBmPWZ1bmN0aW9uKGEsYil7dGhpcy5saXN0ZW5lcj1hO3RoaXMuZ2FtZXBhZEdldHRlcj1iO3RoaXMua25vd25HYW1lcGFkcz1bXX07Zi5mYWN0b3J5PWZ1bmN0aW9uKGEpe3ZhciBiPWMsZD13aW5kb3cmJndpbmRvdy5uYXZpZ2F0b3I7ZCYmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBkLndlYmtpdEdhbWVwYWRzP2I9bmV3IGYoYSxmdW5jdGlvbigpe3JldHVybiBkLndlYmtpdEdhbWVwYWRzfSk6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGQud2Via2l0R2V0R2FtZXBhZHMmJihiPW5ldyBmKGEsZnVuY3Rpb24oKXtyZXR1cm4gZC53ZWJraXRHZXRHYW1lcGFkcygpfSkpKTtyZXR1cm4gYn07Zi5nZXRUeXBlPWZ1bmN0aW9uKCl7cmV0dXJuXCJXZWJLaXRcIn0sZi5wcm90b3R5cGUuZ2V0VHlwZT1mdW5jdGlvbigpe3JldHVybiBmLmdldFR5cGUoKX0sZi5wcm90b3R5cGUuaXNTdXBwb3J0ZWQ9ZnVuY3Rpb24oKXtyZXR1cm4hMH07Zi5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKCl7dmFyIGEsYixjPXRoaXMsZD1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLmdhbWVwYWRHZXR0ZXIoKSwwKTtmb3IoYj10aGlzLmtub3duR2FtZXBhZHMubGVuZ3RoLTE7Yj49MDtiLS0pe2E9dGhpcy5rbm93bkdhbWVwYWRzW2JdO2lmKGQuaW5kZXhPZihhKTwwKXt0aGlzLmtub3duR2FtZXBhZHMuc3BsaWNlKGIsMSk7dGhpcy5saXN0ZW5lci5fZGlzY29ubmVjdChhKX19Zm9yKGI9MDtiPGQubGVuZ3RoO2IrKyl7YT1kW2JdO2lmKGEmJmMua25vd25HYW1lcGFkcy5pbmRleE9mKGEpPDApe2Mua25vd25HYW1lcGFkcy5wdXNoKGEpO2MubGlzdGVuZXIuX2Nvbm5lY3QoYSl9fX07dmFyIGc9ZnVuY3Rpb24oYSl7dGhpcy5saXN0ZW5lcj1hO3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiZ2FtZXBhZGNvbm5lY3RlZFwiLGZ1bmN0aW9uKGIpe2EuX2Nvbm5lY3QoYi5nYW1lcGFkKX0pO3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiZ2FtZXBhZGRpc2Nvbm5lY3RlZFwiLGZ1bmN0aW9uKGIpe2EuX2Rpc2Nvbm5lY3QoYi5nYW1lcGFkKX0pfTtnLmZhY3Rvcnk9ZnVuY3Rpb24oYSl7dmFyIGI9Yzt3aW5kb3cmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciYmKGI9bmV3IGcoYSkpO3JldHVybiBifTtnLmdldFR5cGU9ZnVuY3Rpb24oKXtyZXR1cm5cIkZpcmVmb3hcIn0sZy5wcm90b3R5cGUuZ2V0VHlwZT1mdW5jdGlvbigpe3JldHVybiBnLmdldFR5cGUoKX0sZy5wcm90b3R5cGUuaXNTdXBwb3J0ZWQ9ZnVuY3Rpb24oKXtyZXR1cm4hMH07Zy5wcm90b3R5cGUudXBkYXRlPWI7dmFyIGg9ZnVuY3Rpb24oYSl7dGhpcy51cGRhdGVTdHJhdGVneT1hfHxuZXcgZDt0aGlzLmdhbWVwYWRzPVtdO3RoaXMubGlzdGVuZXJzPXt9O3RoaXMucGxhdGZvcm09Yzt0aGlzLmRlYWR6b25lPS4wMzt0aGlzLm1heGltaXplVGhyZXNob2xkPS45N307aC5VcGRhdGVTdHJhdGVnaWVzPXtBbmltRnJhbWVVcGRhdGVTdHJhdGVneTpkLE1hbnVhbFVwZGF0ZVN0cmF0ZWd5OmV9O2guUGxhdGZvcm1GYWN0b3JpZXM9W2YuZmFjdG9yeSxnLmZhY3RvcnldO2guVHlwZT17UExBWVNUQVRJT046XCJwbGF5c3RhdGlvblwiLExPR0lURUNIOlwibG9naXRlY2hcIixYQk9YOlwieGJveFwiLFVOS05PV046XCJ1bmtub3duXCJ9O2guRXZlbnQ9e0NPTk5FQ1RFRDpcImNvbm5lY3RlZFwiLFVOU1VQUE9SVEVEOlwidW5zdXBwb3J0ZWRcIixESVNDT05ORUNURUQ6XCJkaXNjb25uZWN0ZWRcIixUSUNLOlwidGlja1wiLEJVVFRPTl9ET1dOOlwiYnV0dG9uLWRvd25cIixCVVRUT05fVVA6XCJidXR0b24tdXBcIixBWElTX0NIQU5HRUQ6XCJheGlzLWNoYW5nZWRcIn07aC5TdGFuZGFyZEJ1dHRvbnM9W1wiRkFDRV8xXCIsXCJGQUNFXzJcIixcIkZBQ0VfM1wiLFwiRkFDRV80XCIsXCJMRUZUX1RPUF9TSE9VTERFUlwiLFwiUklHSFRfVE9QX1NIT1VMREVSXCIsXCJMRUZUX0JPVFRPTV9TSE9VTERFUlwiLFwiUklHSFRfQk9UVE9NX1NIT1VMREVSXCIsXCJTRUxFQ1RfQkFDS1wiLFwiU1RBUlRfRk9SV0FSRFwiLFwiTEVGVF9TVElDS1wiLFwiUklHSFRfU1RJQ0tcIixcIkRQQURfVVBcIixcIkRQQURfRE9XTlwiLFwiRFBBRF9MRUZUXCIsXCJEUEFEX1JJR0hUXCIsXCJIT01FXCJdO2guU3RhbmRhcmRBeGVzPVtcIkxFRlRfU1RJQ0tfWFwiLFwiTEVGVF9TVElDS19ZXCIsXCJSSUdIVF9TVElDS19YXCIsXCJSSUdIVF9TVElDS19ZXCJdO3ZhciBpPWZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gYjxhLmxlbmd0aD9hW2JdOmMrKGItYS5sZW5ndGgrMSl9O2guU3RhbmRhcmRNYXBwaW5nPXtlbnY6e30sYnV0dG9uczp7YnlCdXR0b246WzAsMSwyLDMsNCw1LDYsNyw4LDksMTAsMTEsMTIsMTMsMTQsMTUsMTZdfSxheGVzOntieUF4aXM6WzAsMSwyLDNdfX07aC5NYXBwaW5ncz1be2Vudjp7cGxhdGZvcm06Zy5nZXRUeXBlKCksdHlwZTpoLlR5cGUuUExBWVNUQVRJT059LGJ1dHRvbnM6e2J5QnV0dG9uOlsxNCwxMywxNSwxMiwxMCwxMSw4LDksMCwzLDEsMiw0LDYsNyw1LDE2XX0sYXhlczp7YnlBeGlzOlswLDEsMiwzXX19LHtlbnY6e3BsYXRmb3JtOmYuZ2V0VHlwZSgpLHR5cGU6aC5UeXBlLkxPR0lURUNIfSxidXR0b25zOntieUJ1dHRvbjpbMSwyLDAsMyw0LDUsNiw3LDgsOSwxMCwxMSwxMSwxMiwxMywxNCwxMF19LGF4ZXM6e2J5QXhpczpbMCwxLDIsM119fSx7ZW52OntwbGF0Zm9ybTpnLmdldFR5cGUoKSx0eXBlOmguVHlwZS5MT0dJVEVDSH0sYnV0dG9uczp7YnlCdXR0b246WzAsMSwyLDMsNCw1LC0xLC0xLDYsNyw4LDksMTEsMTIsMTMsMTQsMTBdLGJ5QXhpczpbLTEsLTEsLTEsLTEsLTEsLTEsWzIsMCwxXSxbMiwwLC0xXV19LGF4ZXM6e2J5QXhpczpbMCwxLDMsNF19fV07aC5wcm90b3R5cGUuaW5pdD1mdW5jdGlvbigpe3ZhciBhPWgucmVzb2x2ZVBsYXRmb3JtKHRoaXMpLGI9dGhpczt0aGlzLnBsYXRmb3JtPWE7dGhpcy51cGRhdGVTdHJhdGVneS5zdGFydChmdW5jdGlvbigpe2IuX3VwZGF0ZSgpfSk7cmV0dXJuIGEuaXNTdXBwb3J0ZWQoKX07aC5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIpe1widW5kZWZpbmVkXCI9PXR5cGVvZiB0aGlzLmxpc3RlbmVyc1thXSYmKHRoaXMubGlzdGVuZXJzW2FdPVtdKTt0aGlzLmxpc3RlbmVyc1thXS5wdXNoKGIpO3JldHVybiB0aGlzfTtoLnByb3RvdHlwZS51bmJpbmQ9ZnVuY3Rpb24oYSxiKXtpZihcInVuZGVmaW5lZFwiIT10eXBlb2YgYSl7aWYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGIpe2lmKFwidW5kZWZpbmVkXCI9PXR5cGVvZiB0aGlzLmxpc3RlbmVyc1thXSlyZXR1cm4hMTtmb3IodmFyIGM9MDtjPHRoaXMubGlzdGVuZXJzW2FdLmxlbmd0aDtjKyspaWYodGhpcy5saXN0ZW5lcnNbYV1bY109PT1iKXt0aGlzLmxpc3RlbmVyc1thXS5zcGxpY2UoYywxKTtyZXR1cm4hMH1yZXR1cm4hMX10aGlzLmxpc3RlbmVyc1thXT1bXX1lbHNlIHRoaXMubGlzdGVuZXJzPXt9fTtoLnByb3RvdHlwZS5jb3VudD1mdW5jdGlvbigpe3JldHVybiB0aGlzLmdhbWVwYWRzLmxlbmd0aH07aC5wcm90b3R5cGUuX2ZpcmU9ZnVuY3Rpb24oYSxiKXtpZihcInVuZGVmaW5lZFwiIT10eXBlb2YgdGhpcy5saXN0ZW5lcnNbYV0pZm9yKHZhciBjPTA7Yzx0aGlzLmxpc3RlbmVyc1thXS5sZW5ndGg7YysrKXRoaXMubGlzdGVuZXJzW2FdW2NdLmFwcGx5KHRoaXMubGlzdGVuZXJzW2FdW2NdLFtiXSl9O2guZ2V0TnVsbFBsYXRmb3JtPWZ1bmN0aW9uKCl7cmV0dXJuIE9iamVjdC5jcmVhdGUoYyl9O2gucmVzb2x2ZVBsYXRmb3JtPWZ1bmN0aW9uKGEpe3ZhciBiLGQ9Yztmb3IoYj0wOyFkLmlzU3VwcG9ydGVkKCkmJmI8aC5QbGF0Zm9ybUZhY3Rvcmllcy5sZW5ndGg7YisrKWQ9aC5QbGF0Zm9ybUZhY3Rvcmllc1tiXShhKTtyZXR1cm4gZH07aC5wcm90b3R5cGUuX2Nvbm5lY3Q9ZnVuY3Rpb24oYSl7dmFyIGIsYyxkPXRoaXMuX3Jlc29sdmVNYXBwaW5nKGEpO2Euc3RhdGU9e307YS5sYXN0U3RhdGU9e307YS51cGRhdGVyPVtdO2I9ZC5idXR0b25zLmJ5QnV0dG9uLmxlbmd0aDtmb3IoYz0wO2I+YztjKyspdGhpcy5fYWRkQnV0dG9uVXBkYXRlcihhLGQsYyk7Yj1kLmF4ZXMuYnlBeGlzLmxlbmd0aDtmb3IoYz0wO2I+YztjKyspdGhpcy5fYWRkQXhpc1VwZGF0ZXIoYSxkLGMpO3RoaXMuZ2FtZXBhZHNbYS5pbmRleF09YTt0aGlzLl9maXJlKGguRXZlbnQuQ09OTkVDVEVELGEpfTtoLnByb3RvdHlwZS5fYWRkQnV0dG9uVXBkYXRlcj1mdW5jdGlvbihhLGMsZCl7dmFyIGU9YixmPWkoaC5TdGFuZGFyZEJ1dHRvbnMsZCxcIkVYVFJBX0JVVFRPTl9cIiksZz10aGlzLl9jcmVhdGVCdXR0b25HZXR0ZXIoYSxjLmJ1dHRvbnMsZCksaj10aGlzLGs9e2dhbWVwYWQ6YSxjb250cm9sOmZ9O2Euc3RhdGVbZl09MDthLmxhc3RTdGF0ZVtmXT0wO2U9ZnVuY3Rpb24oKXt2YXIgYj1nKCksYz1hLmxhc3RTdGF0ZVtmXSxkPWI+LjUsZT1jPi41O2Euc3RhdGVbZl09YjtkJiYhZT9qLl9maXJlKGguRXZlbnQuQlVUVE9OX0RPV04sT2JqZWN0LmNyZWF0ZShrKSk6IWQmJmUmJmouX2ZpcmUoaC5FdmVudC5CVVRUT05fVVAsT2JqZWN0LmNyZWF0ZShrKSk7MCE9PWImJjEhPT1iJiZiIT09YyYmai5fZmlyZUF4aXNDaGFuZ2VkRXZlbnQoYSxmLGIpO2EubGFzdFN0YXRlW2ZdPWJ9O2EudXBkYXRlci5wdXNoKGUpfTtoLnByb3RvdHlwZS5fYWRkQXhpc1VwZGF0ZXI9ZnVuY3Rpb24oYSxjLGQpe3ZhciBlPWIsZj1pKGguU3RhbmRhcmRBeGVzLGQsXCJFWFRSQV9BWElTX1wiKSxnPXRoaXMuX2NyZWF0ZUF4aXNHZXR0ZXIoYSxjLmF4ZXMsZCksaj10aGlzO2Euc3RhdGVbZl09MDthLmxhc3RTdGF0ZVtmXT0wO2U9ZnVuY3Rpb24oKXt2YXIgYj1nKCksYz1hLmxhc3RTdGF0ZVtmXTthLnN0YXRlW2ZdPWI7YiE9PWMmJmouX2ZpcmVBeGlzQ2hhbmdlZEV2ZW50KGEsZixiKTthLmxhc3RTdGF0ZVtmXT1ifTthLnVwZGF0ZXIucHVzaChlKX07aC5wcm90b3R5cGUuX2ZpcmVBeGlzQ2hhbmdlZEV2ZW50PWZ1bmN0aW9uKGEsYixjKXt2YXIgZD17Z2FtZXBhZDphLGF4aXM6Yix2YWx1ZTpjfTt0aGlzLl9maXJlKGguRXZlbnQuQVhJU19DSEFOR0VELGQpfTtoLnByb3RvdHlwZS5fY3JlYXRlQnV0dG9uR2V0dGVyPWZ1bmN0aW9uKCl7dmFyIGE9ZnVuY3Rpb24oKXtyZXR1cm4gMH0sYj1mdW5jdGlvbihiLGMsZCl7dmFyIGU9YTtkPmM/ZT1mdW5jdGlvbigpe3ZhciBhPWQtYyxlPWIoKTtlPShlLWMpL2E7cmV0dXJuIDA+ZT8wOmV9OmM+ZCYmKGU9ZnVuY3Rpb24oKXt2YXIgYT1jLWQsZT1iKCk7ZT0oZS1kKS9hO3JldHVybiBlPjE/MDoxLWV9KTtyZXR1cm4gZX0sYz1mdW5jdGlvbihhKXtyZXR1cm5cIltvYmplY3QgQXJyYXldXCI9PT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSl9O3JldHVybiBmdW5jdGlvbihkLGUsZil7dmFyIGcsaD1hLGk9dGhpcztnPWUuYnlCdXR0b25bZl07aWYoLTEhPT1nKVwibnVtYmVyXCI9PXR5cGVvZiBnJiZnPGQuYnV0dG9ucy5sZW5ndGgmJihoPWZ1bmN0aW9uKCl7cmV0dXJuIGQuYnV0dG9uc1tnXX0pO2Vsc2UgaWYoZS5ieUF4aXMmJmY8ZS5ieUF4aXMubGVuZ3RoKXtnPWUuYnlBeGlzW2ZdO2lmKGMoZykmJjM9PWcubGVuZ3RoJiZnWzBdPGQuYXhlcy5sZW5ndGgpe2g9ZnVuY3Rpb24oKXt2YXIgYT1kLmF4ZXNbZ1swXV07cmV0dXJuIGkuX2FwcGx5RGVhZHpvbmVNYXhpbWl6ZShhKX07aD1iKGgsZ1sxXSxnWzJdKX19cmV0dXJuIGh9fSgpO2gucHJvdG90eXBlLl9jcmVhdGVBeGlzR2V0dGVyPWZ1bmN0aW9uKCl7dmFyIGE9ZnVuY3Rpb24oKXtyZXR1cm4gMH07cmV0dXJuIGZ1bmN0aW9uKGIsYyxkKXt2YXIgZSxmPWEsZz10aGlzO2U9Yy5ieUF4aXNbZF07LTEhPT1lJiZcIm51bWJlclwiPT10eXBlb2YgZSYmZTxiLmF4ZXMubGVuZ3RoJiYoZj1mdW5jdGlvbigpe3ZhciBhPWIuYXhlc1tlXTtyZXR1cm4gZy5fYXBwbHlEZWFkem9uZU1heGltaXplKGEpfSk7cmV0dXJuIGZ9fSgpO2gucHJvdG90eXBlLl9kaXNjb25uZWN0PWZ1bmN0aW9uKGEpe3ZhciBiLGM9W107XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHRoaXMuZ2FtZXBhZHNbYS5pbmRleF0mJmRlbGV0ZSB0aGlzLmdhbWVwYWRzW2EuaW5kZXhdO2ZvcihiPTA7Yjx0aGlzLmdhbWVwYWRzLmxlbmd0aDtiKyspXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHRoaXMuZ2FtZXBhZHNbYl0mJihjW2JdPXRoaXMuZ2FtZXBhZHNbYl0pO3RoaXMuZ2FtZXBhZHM9Yzt0aGlzLl9maXJlKGguRXZlbnQuRElTQ09OTkVDVEVELGEpfTtoLnByb3RvdHlwZS5fcmVzb2x2ZUNvbnRyb2xsZXJUeXBlPWZ1bmN0aW9uKGEpe2E9YS50b0xvd2VyQ2FzZSgpO3JldHVybi0xIT09YS5pbmRleE9mKFwicGxheXN0YXRpb25cIik/aC5UeXBlLlBMQVlTVEFUSU9OOi0xIT09YS5pbmRleE9mKFwibG9naXRlY2hcIil8fC0xIT09YS5pbmRleE9mKFwid2lyZWxlc3MgZ2FtZXBhZFwiKT9oLlR5cGUuTE9HSVRFQ0g6LTEhPT1hLmluZGV4T2YoXCJ4Ym94XCIpfHwtMSE9PWEuaW5kZXhPZihcIjM2MFwiKT9oLlR5cGUuWEJPWDpoLlR5cGUuVU5LTk9XTn07aC5wcm90b3R5cGUuX3Jlc29sdmVNYXBwaW5nPWZ1bmN0aW9uKGEpe3ZhciBiLGMsZD1oLk1hcHBpbmdzLGU9bnVsbCxmPXtwbGF0Zm9ybTp0aGlzLnBsYXRmb3JtLmdldFR5cGUoKSx0eXBlOnRoaXMuX3Jlc29sdmVDb250cm9sbGVyVHlwZShhLmlkKX07Zm9yKGI9MDshZSYmYjxkLmxlbmd0aDtiKyspe2M9ZFtiXTtoLmVudk1hdGNoZXNGaWx0ZXIoYy5lbnYsZikmJihlPWMpfXJldHVybiBlfHxoLlN0YW5kYXJkTWFwcGluZ307aC5lbnZNYXRjaGVzRmlsdGVyPWZ1bmN0aW9uKGEsYil7dmFyIGMsZD0hMDtmb3IoYyBpbiBhKWFbY10hPT1iW2NdJiYoZD0hMSk7cmV0dXJuIGR9O2gucHJvdG90eXBlLl91cGRhdGU9ZnVuY3Rpb24oKXt0aGlzLnBsYXRmb3JtLnVwZGF0ZSgpO3RoaXMuZ2FtZXBhZHMuZm9yRWFjaChmdW5jdGlvbihhKXthJiZhLnVwZGF0ZXIuZm9yRWFjaChmdW5jdGlvbihhKXthKCl9KX0pO3RoaXMuZ2FtZXBhZHMubGVuZ3RoPjAmJnRoaXMuX2ZpcmUoaC5FdmVudC5USUNLLHRoaXMuZ2FtZXBhZHMpfSxoLnByb3RvdHlwZS5fYXBwbHlEZWFkem9uZU1heGltaXplPWZ1bmN0aW9uKGEsYixjKXtiPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBiP2I6dGhpcy5kZWFkem9uZTtjPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBjP2M6dGhpcy5tYXhpbWl6ZVRocmVzaG9sZDthPj0wP2I+YT9hPTA6YT5jJiYoYT0xKTphPi1iP2E9MDotYz5hJiYoYT0tMSk7cmV0dXJuIGF9O2EuR2FtZXBhZD1ofShcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0c3x8d2luZG93KTsiLCIvKiBtb3VzZXRyYXAgdjEuNC42IGNyYWlnLmlzL2tpbGxpbmcvbWljZSAqL1xuKGZ1bmN0aW9uKEoscixmKXtmdW5jdGlvbiBzKGEsYixkKXthLmFkZEV2ZW50TGlzdGVuZXI/YS5hZGRFdmVudExpc3RlbmVyKGIsZCwhMSk6YS5hdHRhY2hFdmVudChcIm9uXCIrYixkKX1mdW5jdGlvbiBBKGEpe2lmKFwia2V5cHJlc3NcIj09YS50eXBlKXt2YXIgYj1TdHJpbmcuZnJvbUNoYXJDb2RlKGEud2hpY2gpO2Euc2hpZnRLZXl8fChiPWIudG9Mb3dlckNhc2UoKSk7cmV0dXJuIGJ9cmV0dXJuIGhbYS53aGljaF0/aFthLndoaWNoXTpCW2Eud2hpY2hdP0JbYS53aGljaF06U3RyaW5nLmZyb21DaGFyQ29kZShhLndoaWNoKS50b0xvd2VyQ2FzZSgpfWZ1bmN0aW9uIHQoYSl7YT1hfHx7fTt2YXIgYj0hMSxkO2ZvcihkIGluIG4pYVtkXT9iPSEwOm5bZF09MDtifHwodT0hMSl9ZnVuY3Rpb24gQyhhLGIsZCxjLGUsdil7dmFyIGcsayxmPVtdLGg9ZC50eXBlO2lmKCFsW2FdKXJldHVybltdO1wia2V5dXBcIj09aCYmdyhhKSYmKGI9W2FdKTtmb3IoZz0wO2c8bFthXS5sZW5ndGg7KytnKWlmKGs9XG5sW2FdW2ddLCEoIWMmJmsuc2VxJiZuW2suc2VxXSE9ay5sZXZlbHx8aCE9ay5hY3Rpb258fChcImtleXByZXNzXCIhPWh8fGQubWV0YUtleXx8ZC5jdHJsS2V5KSYmYi5zb3J0KCkuam9pbihcIixcIikhPT1rLm1vZGlmaWVycy5zb3J0KCkuam9pbihcIixcIikpKXt2YXIgbT1jJiZrLnNlcT09YyYmay5sZXZlbD09djsoIWMmJmsuY29tYm89PWV8fG0pJiZsW2FdLnNwbGljZShnLDEpO2YucHVzaChrKX1yZXR1cm4gZn1mdW5jdGlvbiBLKGEpe3ZhciBiPVtdO2Euc2hpZnRLZXkmJmIucHVzaChcInNoaWZ0XCIpO2EuYWx0S2V5JiZiLnB1c2goXCJhbHRcIik7YS5jdHJsS2V5JiZiLnB1c2goXCJjdHJsXCIpO2EubWV0YUtleSYmYi5wdXNoKFwibWV0YVwiKTtyZXR1cm4gYn1mdW5jdGlvbiB4KGEsYixkLGMpe20uc3RvcENhbGxiYWNrKGIsYi50YXJnZXR8fGIuc3JjRWxlbWVudCxkLGMpfHwhMSE9PWEoYixkKXx8KGIucHJldmVudERlZmF1bHQ/Yi5wcmV2ZW50RGVmYXVsdCgpOmIucmV0dXJuVmFsdWU9ITEsYi5zdG9wUHJvcGFnYXRpb24/XG5iLnN0b3BQcm9wYWdhdGlvbigpOmIuY2FuY2VsQnViYmxlPSEwKX1mdW5jdGlvbiB5KGEpe1wibnVtYmVyXCIhPT10eXBlb2YgYS53aGljaCYmKGEud2hpY2g9YS5rZXlDb2RlKTt2YXIgYj1BKGEpO2ImJihcImtleXVwXCI9PWEudHlwZSYmej09PWI/ej0hMTptLmhhbmRsZUtleShiLEsoYSksYSkpfWZ1bmN0aW9uIHcoYSl7cmV0dXJuXCJzaGlmdFwiPT1hfHxcImN0cmxcIj09YXx8XCJhbHRcIj09YXx8XCJtZXRhXCI9PWF9ZnVuY3Rpb24gTChhLGIsZCxjKXtmdW5jdGlvbiBlKGIpe3JldHVybiBmdW5jdGlvbigpe3U9YjsrK25bYV07Y2xlYXJUaW1lb3V0KEQpO0Q9c2V0VGltZW91dCh0LDFFMyl9fWZ1bmN0aW9uIHYoYil7eChkLGIsYSk7XCJrZXl1cFwiIT09YyYmKHo9QShiKSk7c2V0VGltZW91dCh0LDEwKX1mb3IodmFyIGc9blthXT0wO2c8Yi5sZW5ndGg7KytnKXt2YXIgZj1nKzE9PT1iLmxlbmd0aD92OmUoY3x8RShiW2crMV0pLmFjdGlvbik7RihiW2ddLGYsYyxhLGcpfX1mdW5jdGlvbiBFKGEsYil7dmFyIGQsXG5jLGUsZj1bXTtkPVwiK1wiPT09YT9bXCIrXCJdOmEuc3BsaXQoXCIrXCIpO2ZvcihlPTA7ZTxkLmxlbmd0aDsrK2UpYz1kW2VdLEdbY10mJihjPUdbY10pLGImJlwia2V5cHJlc3NcIiE9YiYmSFtjXSYmKGM9SFtjXSxmLnB1c2goXCJzaGlmdFwiKSksdyhjKSYmZi5wdXNoKGMpO2Q9YztlPWI7aWYoIWUpe2lmKCFwKXtwPXt9O2Zvcih2YXIgZyBpbiBoKTk1PGcmJjExMj5nfHxoLmhhc093blByb3BlcnR5KGcpJiYocFtoW2ddXT1nKX1lPXBbZF0/XCJrZXlkb3duXCI6XCJrZXlwcmVzc1wifVwia2V5cHJlc3NcIj09ZSYmZi5sZW5ndGgmJihlPVwia2V5ZG93blwiKTtyZXR1cm57a2V5OmMsbW9kaWZpZXJzOmYsYWN0aW9uOmV9fWZ1bmN0aW9uIEYoYSxiLGQsYyxlKXtxW2ErXCI6XCIrZF09YjthPWEucmVwbGFjZSgvXFxzKy9nLFwiIFwiKTt2YXIgZj1hLnNwbGl0KFwiIFwiKTsxPGYubGVuZ3RoP0woYSxmLGIsZCk6KGQ9RShhLGQpLGxbZC5rZXldPWxbZC5rZXldfHxbXSxDKGQua2V5LGQubW9kaWZpZXJzLHt0eXBlOmQuYWN0aW9ufSxcbmMsYSxlKSxsW2Qua2V5XVtjP1widW5zaGlmdFwiOlwicHVzaFwiXSh7Y2FsbGJhY2s6Yixtb2RpZmllcnM6ZC5tb2RpZmllcnMsYWN0aW9uOmQuYWN0aW9uLHNlcTpjLGxldmVsOmUsY29tYm86YX0pKX12YXIgaD17ODpcImJhY2tzcGFjZVwiLDk6XCJ0YWJcIiwxMzpcImVudGVyXCIsMTY6XCJzaGlmdFwiLDE3OlwiY3RybFwiLDE4OlwiYWx0XCIsMjA6XCJjYXBzbG9ja1wiLDI3OlwiZXNjXCIsMzI6XCJzcGFjZVwiLDMzOlwicGFnZXVwXCIsMzQ6XCJwYWdlZG93blwiLDM1OlwiZW5kXCIsMzY6XCJob21lXCIsMzc6XCJsZWZ0XCIsMzg6XCJ1cFwiLDM5OlwicmlnaHRcIiw0MDpcImRvd25cIiw0NTpcImluc1wiLDQ2OlwiZGVsXCIsOTE6XCJtZXRhXCIsOTM6XCJtZXRhXCIsMjI0OlwibWV0YVwifSxCPXsxMDY6XCIqXCIsMTA3OlwiK1wiLDEwOTpcIi1cIiwxMTA6XCIuXCIsMTExOlwiL1wiLDE4NjpcIjtcIiwxODc6XCI9XCIsMTg4OlwiLFwiLDE4OTpcIi1cIiwxOTA6XCIuXCIsMTkxOlwiL1wiLDE5MjpcImBcIiwyMTk6XCJbXCIsMjIwOlwiXFxcXFwiLDIyMTpcIl1cIiwyMjI6XCInXCJ9LEg9e1wiflwiOlwiYFwiLFwiIVwiOlwiMVwiLFxuXCJAXCI6XCIyXCIsXCIjXCI6XCIzXCIsJDpcIjRcIixcIiVcIjpcIjVcIixcIl5cIjpcIjZcIixcIiZcIjpcIjdcIixcIipcIjpcIjhcIixcIihcIjpcIjlcIixcIilcIjpcIjBcIixfOlwiLVwiLFwiK1wiOlwiPVwiLFwiOlwiOlwiO1wiLCdcIic6XCInXCIsXCI8XCI6XCIsXCIsXCI+XCI6XCIuXCIsXCI/XCI6XCIvXCIsXCJ8XCI6XCJcXFxcXCJ9LEc9e29wdGlvbjpcImFsdFwiLGNvbW1hbmQ6XCJtZXRhXCIsXCJyZXR1cm5cIjpcImVudGVyXCIsZXNjYXBlOlwiZXNjXCIsbW9kOi9NYWN8aVBvZHxpUGhvbmV8aVBhZC8udGVzdChuYXZpZ2F0b3IucGxhdGZvcm0pP1wibWV0YVwiOlwiY3RybFwifSxwLGw9e30scT17fSxuPXt9LEQsej0hMSxJPSExLHU9ITE7Zm9yKGY9MTsyMD5mOysrZiloWzExMStmXT1cImZcIitmO2ZvcihmPTA7OT49ZjsrK2YpaFtmKzk2XT1mO3MocixcImtleXByZXNzXCIseSk7cyhyLFwia2V5ZG93blwiLHkpO3MocixcImtleXVwXCIseSk7dmFyIG09e2JpbmQ6ZnVuY3Rpb24oYSxiLGQpe2E9YSBpbnN0YW5jZW9mIEFycmF5P2E6W2FdO2Zvcih2YXIgYz0wO2M8YS5sZW5ndGg7KytjKUYoYVtjXSxiLGQpO3JldHVybiB0aGlzfSxcbnVuYmluZDpmdW5jdGlvbihhLGIpe3JldHVybiBtLmJpbmQoYSxmdW5jdGlvbigpe30sYil9LHRyaWdnZXI6ZnVuY3Rpb24oYSxiKXtpZihxW2ErXCI6XCIrYl0pcVthK1wiOlwiK2JdKHt9LGEpO3JldHVybiB0aGlzfSxyZXNldDpmdW5jdGlvbigpe2w9e307cT17fTtyZXR1cm4gdGhpc30sc3RvcENhbGxiYWNrOmZ1bmN0aW9uKGEsYil7cmV0dXJuLTE8KFwiIFwiK2IuY2xhc3NOYW1lK1wiIFwiKS5pbmRleE9mKFwiIG1vdXNldHJhcCBcIik/ITE6XCJJTlBVVFwiPT1iLnRhZ05hbWV8fFwiU0VMRUNUXCI9PWIudGFnTmFtZXx8XCJURVhUQVJFQVwiPT1iLnRhZ05hbWV8fGIuaXNDb250ZW50RWRpdGFibGV9LGhhbmRsZUtleTpmdW5jdGlvbihhLGIsZCl7dmFyIGM9QyhhLGIsZCksZTtiPXt9O3ZhciBmPTAsZz0hMTtmb3IoZT0wO2U8Yy5sZW5ndGg7KytlKWNbZV0uc2VxJiYoZj1NYXRoLm1heChmLGNbZV0ubGV2ZWwpKTtmb3IoZT0wO2U8Yy5sZW5ndGg7KytlKWNbZV0uc2VxP2NbZV0ubGV2ZWw9PWYmJihnPSEwLFxuYltjW2VdLnNlcV09MSx4KGNbZV0uY2FsbGJhY2ssZCxjW2VdLmNvbWJvLGNbZV0uc2VxKSk6Z3x8eChjW2VdLmNhbGxiYWNrLGQsY1tlXS5jb21ibyk7Yz1cImtleXByZXNzXCI9PWQudHlwZSYmSTtkLnR5cGUhPXV8fHcoYSl8fGN8fHQoYik7ST1nJiZcImtleWRvd25cIj09ZC50eXBlfX07Si5Nb3VzZXRyYXA9bTtcImZ1bmN0aW9uXCI9PT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kJiZkZWZpbmUobSl9KSh3aW5kb3csZG9jdW1lbnQpO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHJvZ3VlbWFwLCBST1QsIG51Y2xlYXIsIGNvbnNvbGU7XG5cbmNvbnNvbGUgPSB3aW5kb3cuY29uc29sZTtcbm51Y2xlYXIgPSB3aW5kb3cubnVjbGVhcjtcblxucmVxdWlyZSgnLi9saWIvcm90Jyk7XG5ST1QgPSB3aW5kb3cuUk9UO1xuXG52YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG52YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpO1xuXG5jYW52YXMud2lkdGggPSA4MDA7XG5jYW52YXMuaGVpZ2h0ID0gODAwO1xuXG5yb2d1ZW1hcCA9IG51Y2xlYXIubW9kdWxlKCdyb2d1ZW1hcCcsIFtdKTtcblxudmFyIGRpZ2dlciA9IG5ldyBST1QuTWFwLkRpZ2dlcigyMDAsIDIwMCwge1xuICByb29tSGVpZ2h0IDogWzMsIDIwXSxcbiAgcm9vbVdpZHRoIDogWzMsIDIwXSxcbn0pO1xuXG52YXIgdGVtcGxhdGVzID0ge1xuICAnb25lJyA6IHtcbiAgICBuYW1lIDogJ29uZScsXG4gICAgc2xvdHMgOiBbXG4gICAgICB7XG4gICAgICAgIHR5cGUgOiAnY3JhdGUnLFxuICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICB4IDogMzAsXG4gICAgICAgICAgeSA6IDIwXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHR5cGUgOiAnY3JhdGUnLFxuICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICB4IDogNDAsXG4gICAgICAgICAgeSA6IDIwXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHR5cGUgOiAndG9yY2gnLFxuICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICB4IDogMTAwLFxuICAgICAgICAgIHkgOiAxMFxuICAgICAgICB9XG4gICAgICB9XG4gICAgXSxcbiAgICBsaWdodCA6ICdyZWQnLFxuICAgIGJ1bmRsZSA6ICdzdG9uZSdcbiAgfSxcbiAgJ3R3bycgOiB7XG4gICAgbmFtZSA6ICd0d28nLFxuICAgIHNsb3RzIDogW1xuICAgICAge1xuICAgICAgICB0eXBlIDogJ2NyYXRlJyxcbiAgICAgICAgcG9zaXRpb24gOiB7XG4gICAgICAgICAgeCA6IDMwLFxuICAgICAgICAgIHkgOiAyMFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0eXBlIDogJ2NyYXRlJyxcbiAgICAgICAgcG9zaXRpb24gOiB7XG4gICAgICAgICAgeCA6IDQwLFxuICAgICAgICAgIHkgOiAyMFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0eXBlIDogJ3RvcmNoJyxcbiAgICAgICAgcG9zaXRpb24gOiB7XG4gICAgICAgICAgeCA6IDEwMCxcbiAgICAgICAgICB5IDogMTBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF0sXG4gICAgbGlnaHQgOiAncmVkJyxcbiAgICBidW5kbGUgOiAnc3RvbmUnXG4gIH0sXG4gICd0aHJlZScgOiB7XG4gICAgbmFtZSA6ICd0aHJlZScsXG4gICAgc2xvdHMgOiBbXG4gICAgICB7XG4gICAgICAgIHR5cGUgOiAnY3JhdGUnLFxuICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICB4IDogMzAsXG4gICAgICAgICAgeSA6IDIwXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHR5cGUgOiAnY3JhdGUnLFxuICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICB4IDogNDAsXG4gICAgICAgICAgeSA6IDIwXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHR5cGUgOiAndG9yY2gnLFxuICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICB4IDogMTAwLFxuICAgICAgICAgIHkgOiAxMFxuICAgICAgICB9XG4gICAgICB9XG4gICAgXSxcbiAgICBsaWdodCA6ICdyZWQnLFxuICAgIGJ1bmRsZSA6ICdzdG9uZSdcbiAgfSxcbiAgJ2ZvdXInIDoge1xuICAgIG5hbWUgOiAnZm91cicsXG4gICAgc2xvdHMgOiBbXG4gICAgICB7XG4gICAgICAgIHR5cGUgOiAnY3JhdGUnLFxuICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICB4IDogMzAsXG4gICAgICAgICAgeSA6IDIwXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHR5cGUgOiAnY3JhdGUnLFxuICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICB4IDogNDAsXG4gICAgICAgICAgeSA6IDIwXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHR5cGUgOiAndG9yY2gnLFxuICAgICAgICBwb3NpdGlvbiA6IHtcbiAgICAgICAgICB4IDogMTAwLFxuICAgICAgICAgIHkgOiAxMFxuICAgICAgICB9XG4gICAgICB9XG4gICAgXSxcbiAgICBsaWdodCA6ICdyZWQnLFxuICAgIGJ1bmRsZSA6ICdzdG9uZSdcbiAgfVxufTtcbnZhciByYW5nZXMgPSB7XG4gICdvbmUnIDogWzksIDE0XSxcbiAgJ3R3bycgOiBbMTUsIDI1XSxcbiAgJ3RocmVlJyA6IFsyNiwgNDBdLFxuICAnZm91cicgOiBbNDEsIDIwMF0sXG59O1xuZGlnZ2VyLmNyZWF0ZShmdW5jdGlvbih4LCB5LCB2YWx1ZSl7XG4gIGNvbnRleHQuZmlsbFN0eWxlID0gKHZhbHVlKSA/ICdibGFjaycgOiAnYmx1ZSc7XG4gIGNvbnRleHQuZmlsbFJlY3QoeCo0LCB5KjQsIDQsIDQpO1xufSk7XG5cbmZvcih2YXIgaSA9IDA7IGkgPCBkaWdnZXIuX3Jvb21zLmxlbmd0aDsgaSsrKXtcbiAgdmFyIHJvb20gPSBkaWdnZXIuX3Jvb21zW2ldO1xuICB2YXIgd2lkdGggPSByb29tLl94Mi1yb29tLl94MTtcbiAgdmFyIGhlaWdodCA9IHJvb20uX3kyLXJvb20uX3kxO1xuICB2YXIgc2l6ZSA9IHdpZHRoKmhlaWdodDtcbiAgZm9yKHZhciB4IGluIHJhbmdlcyl7XG4gICAgdmFyIHJhbmdlID0gcmFuZ2VzW3hdLFxuICAgICAgICB2YWxpZCA9IGZhbHNlO1xuICAgIGZvcih2YXIgdSA9IHJhbmdlWzBdOyB1IDwgcmFuZ2VbMV07IHUrKyl7XG4gICAgICBpZihzaXplID09PSB1KXtcbiAgICAgICAgdmFsaWQgPSB0cnVlO1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSB0ZW1wbGF0ZXNbeF07XG4gICAgICAgIGNvbnNvbGUubG9nKCdpbmZvJywgd2lkdGgsIGhlaWdodCwgeCk7XG4gICAgICAgIHZhciBpbmRleFggPSBNYXRoLnJvdW5kKHdpZHRoKnRlbXBsYXRlLnNsb3RzWzJdLnBvc2l0aW9uLngvMTAwKTtcbiAgICAgICAgdmFyIGluZGV4WSA9IE1hdGgucm91bmQoaGVpZ2h0KnRlbXBsYXRlLnNsb3RzWzJdLnBvc2l0aW9uLnkvMTAwKTtcbiAgICAgICAgY29uc29sZS5sb2coaW5kZXhYLCBpbmRleFkpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZih2YWxpZCl7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgY29uc29sZS5sb2coKTtcbn1cblxuY29uc29sZS5sb2coZGlnZ2VyKTtcblxubnVjbGVhci5pbXBvcnQoW3JvZ3VlbWFwXSk7IiwiLypcblx0VGhpcyBpcyByb3QuanMsIHRoZSBST2d1ZWxpa2UgVG9vbGtpdCBpbiBKYXZhU2NyaXB0LlxuXHRWZXJzaW9uIDAuNX5kZXYsIGdlbmVyYXRlZCBvbiBNb24gTWFyIDMxIDE1OjEwOjQxIENFU1QgMjAxNC5cbiovXG4vKipcbiAqIEBuYW1lc3BhY2UgVG9wLWxldmVsIFJPVCBuYW1lc3BhY2VcbiAqL1xud2luZG93LlJPVCA9IHtcblx0LyoqXG5cdCAqIEByZXR1cm5zIHtib29sfSBJcyByb3QuanMgc3VwcG9ydGVkIGJ5IHRoaXMgYnJvd3Nlcj9cblx0ICovXG5cdGlzU3VwcG9ydGVkOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gISEoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKS5nZXRDb250ZXh0ICYmIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kKTtcblx0fSxcblxuXHQvKiogRGVmYXVsdCB3aXRoIGZvciBkaXNwbGF5IGFuZCBtYXAgZ2VuZXJhdG9ycyAqL1xuXHRERUZBVUxUX1dJRFRIOiA4MCxcblx0LyoqIERlZmF1bHQgaGVpZ2h0IGZvciBkaXNwbGF5IGFuZCBtYXAgZ2VuZXJhdG9ycyAqL1xuXHRERUZBVUxUX0hFSUdIVDogMjUsXG5cblx0LyoqIERpcmVjdGlvbmFsIGNvbnN0YW50cy4gT3JkZXJpbmcgaXMgaW1wb3J0YW50ISAqL1xuXHRESVJTOiB7XG5cdFx0XCI0XCI6IFtcblx0XHRcdFsgMCwgLTFdLFxuXHRcdFx0WyAxLCAgMF0sXG5cdFx0XHRbIDAsICAxXSxcblx0XHRcdFstMSwgIDBdXG5cdFx0XSxcblx0XHRcIjhcIjogW1xuXHRcdFx0WyAwLCAtMV0sXG5cdFx0XHRbIDEsIC0xXSxcblx0XHRcdFsgMSwgIDBdLFxuXHRcdFx0WyAxLCAgMV0sXG5cdFx0XHRbIDAsICAxXSxcblx0XHRcdFstMSwgIDFdLFxuXHRcdFx0Wy0xLCAgMF0sXG5cdFx0XHRbLTEsIC0xXVxuXHRcdF0sXG5cdFx0XCI2XCI6IFtcblx0XHRcdFstMSwgLTFdLFxuXHRcdFx0WyAxLCAtMV0sXG5cdFx0XHRbIDIsICAwXSxcblx0XHRcdFsgMSwgIDFdLFxuXHRcdFx0Wy0xLCAgMV0sXG5cdFx0XHRbLTIsICAwXVxuXHRcdF1cblx0fSxcblxuXHQvKiogQ2FuY2VsIGtleS4gKi9cblx0VktfQ0FOQ0VMOiAzLCBcblx0LyoqIEhlbHAga2V5LiAqL1xuXHRWS19IRUxQOiA2LCBcblx0LyoqIEJhY2tzcGFjZSBrZXkuICovXG5cdFZLX0JBQ0tfU1BBQ0U6IDgsIFxuXHQvKiogVGFiIGtleS4gKi9cblx0VktfVEFCOiA5LCBcblx0LyoqIDUga2V5IG9uIE51bXBhZCB3aGVuIE51bUxvY2sgaXMgdW5sb2NrZWQuIE9yIG9uIE1hYywgY2xlYXIga2V5IHdoaWNoIGlzIHBvc2l0aW9uZWQgYXQgTnVtTG9jayBrZXkuICovXG5cdFZLX0NMRUFSOiAxMiwgXG5cdC8qKiBSZXR1cm4vZW50ZXIga2V5IG9uIHRoZSBtYWluIGtleWJvYXJkLiAqL1xuXHRWS19SRVRVUk46IDEzLCBcblx0LyoqIFJlc2VydmVkLCBidXQgbm90IHVzZWQuICovXG5cdFZLX0VOVEVSOiAxNCwgXG5cdC8qKiBTaGlmdCBrZXkuICovXG5cdFZLX1NISUZUOiAxNiwgXG5cdC8qKiBDb250cm9sIGtleS4gKi9cblx0VktfQ09OVFJPTDogMTcsIFxuXHQvKiogQWx0IChPcHRpb24gb24gTWFjKSBrZXkuICovXG5cdFZLX0FMVDogMTgsIFxuXHQvKiogUGF1c2Uga2V5LiAqL1xuXHRWS19QQVVTRTogMTksIFxuXHQvKiogQ2FwcyBsb2NrLiAqL1xuXHRWS19DQVBTX0xPQ0s6IDIwLCBcblx0LyoqIEVzY2FwZSBrZXkuICovXG5cdFZLX0VTQ0FQRTogMjcsIFxuXHQvKiogU3BhY2UgYmFyLiAqL1xuXHRWS19TUEFDRTogMzIsIFxuXHQvKiogUGFnZSBVcCBrZXkuICovXG5cdFZLX1BBR0VfVVA6IDMzLCBcblx0LyoqIFBhZ2UgRG93biBrZXkuICovXG5cdFZLX1BBR0VfRE9XTjogMzQsIFxuXHQvKiogRW5kIGtleS4gKi9cblx0VktfRU5EOiAzNSwgXG5cdC8qKiBIb21lIGtleS4gKi9cblx0VktfSE9NRTogMzYsIFxuXHQvKiogTGVmdCBhcnJvdy4gKi9cblx0VktfTEVGVDogMzcsIFxuXHQvKiogVXAgYXJyb3cuICovXG5cdFZLX1VQOiAzOCwgXG5cdC8qKiBSaWdodCBhcnJvdy4gKi9cblx0VktfUklHSFQ6IDM5LCBcblx0LyoqIERvd24gYXJyb3cuICovXG5cdFZLX0RPV046IDQwLCBcblx0LyoqIFByaW50IFNjcmVlbiBrZXkuICovXG5cdFZLX1BSSU5UU0NSRUVOOiA0NCwgXG5cdC8qKiBJbnMoZXJ0KSBrZXkuICovXG5cdFZLX0lOU0VSVDogNDUsIFxuXHQvKiogRGVsKGV0ZSkga2V5LiAqL1xuXHRWS19ERUxFVEU6IDQ2LCBcblx0LyoqKi9cblx0VktfMDogNDgsXG5cdC8qKiovXG5cdFZLXzE6IDQ5LFxuXHQvKioqL1xuXHRWS18yOiA1MCxcblx0LyoqKi9cblx0VktfMzogNTEsXG5cdC8qKiovXG5cdFZLXzQ6IDUyLFxuXHQvKioqL1xuXHRWS181OiA1Myxcblx0LyoqKi9cblx0VktfNjogNTQsXG5cdC8qKiovXG5cdFZLXzc6IDU1LFxuXHQvKioqL1xuXHRWS184OiA1Nixcblx0LyoqKi9cblx0VktfOTogNTcsXG5cdC8qKiBDb2xvbiAoOikga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX0NPTE9OOiA1OCwgXG5cdC8qKiBTZW1pY29sb24gKDspIGtleS4gKi9cblx0VktfU0VNSUNPTE9OOiA1OSwgXG5cdC8qKiBMZXNzLXRoYW4gKDwpIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19MRVNTX1RIQU46IDYwLCBcblx0LyoqIEVxdWFscyAoPSkga2V5LiAqL1xuXHRWS19FUVVBTFM6IDYxLCBcblx0LyoqIEdyZWF0ZXItdGhhbiAoPikga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX0dSRUFURVJfVEhBTjogNjIsIFxuXHQvKiogUXVlc3Rpb24gbWFyayAoPykga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX1FVRVNUSU9OX01BUks6IDYzLCBcblx0LyoqIEF0bWFyayAoQCkga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX0FUOiA2NCwgXG5cdC8qKiovXG5cdFZLX0E6IDY1LFxuXHQvKioqL1xuXHRWS19COiA2Nixcblx0LyoqKi9cblx0VktfQzogNjcsXG5cdC8qKiovXG5cdFZLX0Q6IDY4LFxuXHQvKioqL1xuXHRWS19FOiA2OSxcblx0LyoqKi9cblx0VktfRjogNzAsXG5cdC8qKiovXG5cdFZLX0c6IDcxLFxuXHQvKioqL1xuXHRWS19IOiA3Mixcblx0LyoqKi9cblx0VktfSTogNzMsXG5cdC8qKiovXG5cdFZLX0o6IDc0LFxuXHQvKioqL1xuXHRWS19LOiA3NSxcblx0LyoqKi9cblx0VktfTDogNzYsXG5cdC8qKiovXG5cdFZLX006IDc3LFxuXHQvKioqL1xuXHRWS19OOiA3OCxcblx0LyoqKi9cblx0VktfTzogNzksXG5cdC8qKiovXG5cdFZLX1A6IDgwLFxuXHQvKioqL1xuXHRWS19ROiA4MSxcblx0LyoqKi9cblx0VktfUjogODIsXG5cdC8qKiovXG5cdFZLX1M6IDgzLFxuXHQvKioqL1xuXHRWS19UOiA4NCxcblx0LyoqKi9cblx0VktfVTogODUsXG5cdC8qKiovXG5cdFZLX1Y6IDg2LFxuXHQvKioqL1xuXHRWS19XOiA4Nyxcblx0LyoqKi9cblx0VktfWDogODgsXG5cdC8qKiovXG5cdFZLX1k6IDg5LFxuXHQvKioqL1xuXHRWS19aOiA5MCxcblx0LyoqKi9cblx0VktfQ09OVEVYVF9NRU5VOiA5Myxcblx0LyoqIDAgb24gdGhlIG51bWVyaWMga2V5cGFkLiAqL1xuXHRWS19OVU1QQUQwOiA5NiwgXG5cdC8qKiAxIG9uIHRoZSBudW1lcmljIGtleXBhZC4gKi9cblx0VktfTlVNUEFEMTogOTcsIFxuXHQvKiogMiBvbiB0aGUgbnVtZXJpYyBrZXlwYWQuICovXG5cdFZLX05VTVBBRDI6IDk4LCBcblx0LyoqIDMgb24gdGhlIG51bWVyaWMga2V5cGFkLiAqL1xuXHRWS19OVU1QQUQzOiA5OSwgXG5cdC8qKiA0IG9uIHRoZSBudW1lcmljIGtleXBhZC4gKi9cblx0VktfTlVNUEFENDogMTAwLCBcblx0LyoqIDUgb24gdGhlIG51bWVyaWMga2V5cGFkLiAqL1xuXHRWS19OVU1QQUQ1OiAxMDEsIFxuXHQvKiogNiBvbiB0aGUgbnVtZXJpYyBrZXlwYWQuICovXG5cdFZLX05VTVBBRDY6IDEwMiwgXG5cdC8qKiA3IG9uIHRoZSBudW1lcmljIGtleXBhZC4gKi9cblx0VktfTlVNUEFENzogMTAzLCBcblx0LyoqIDggb24gdGhlIG51bWVyaWMga2V5cGFkLiAqL1xuXHRWS19OVU1QQUQ4OiAxMDQsIFxuXHQvKiogOSBvbiB0aGUgbnVtZXJpYyBrZXlwYWQuICovXG5cdFZLX05VTVBBRDk6IDEwNSwgXG5cdC8qKiAqIG9uIHRoZSBudW1lcmljIGtleXBhZC4gKi9cblx0VktfTVVMVElQTFk6IDEwNixcblx0LyoqICsgb24gdGhlIG51bWVyaWMga2V5cGFkLiAqL1xuXHRWS19BREQ6IDEwNywgXG5cdC8qKiovXG5cdFZLX1NFUEFSQVRPUjogMTA4LFxuXHQvKiogLSBvbiB0aGUgbnVtZXJpYyBrZXlwYWQuICovXG5cdFZLX1NVQlRSQUNUOiAxMDksIFxuXHQvKiogRGVjaW1hbCBwb2ludCBvbiB0aGUgbnVtZXJpYyBrZXlwYWQuICovXG5cdFZLX0RFQ0lNQUw6IDExMCwgXG5cdC8qKiAvIG9uIHRoZSBudW1lcmljIGtleXBhZC4gKi9cblx0VktfRElWSURFOiAxMTEsIFxuXHQvKiogRjEga2V5LiAqL1xuXHRWS19GMTogMTEyLCBcblx0LyoqIEYyIGtleS4gKi9cblx0VktfRjI6IDExMywgXG5cdC8qKiBGMyBrZXkuICovXG5cdFZLX0YzOiAxMTQsIFxuXHQvKiogRjQga2V5LiAqL1xuXHRWS19GNDogMTE1LCBcblx0LyoqIEY1IGtleS4gKi9cblx0VktfRjU6IDExNiwgXG5cdC8qKiBGNiBrZXkuICovXG5cdFZLX0Y2OiAxMTcsIFxuXHQvKiogRjcga2V5LiAqL1xuXHRWS19GNzogMTE4LCBcblx0LyoqIEY4IGtleS4gKi9cblx0VktfRjg6IDExOSwgXG5cdC8qKiBGOSBrZXkuICovXG5cdFZLX0Y5OiAxMjAsIFxuXHQvKiogRjEwIGtleS4gKi9cblx0VktfRjEwOiAxMjEsIFxuXHQvKiogRjExIGtleS4gKi9cblx0VktfRjExOiAxMjIsIFxuXHQvKiogRjEyIGtleS4gKi9cblx0VktfRjEyOiAxMjMsIFxuXHQvKiogRjEzIGtleS4gKi9cblx0VktfRjEzOiAxMjQsIFxuXHQvKiogRjE0IGtleS4gKi9cblx0VktfRjE0OiAxMjUsIFxuXHQvKiogRjE1IGtleS4gKi9cblx0VktfRjE1OiAxMjYsIFxuXHQvKiogRjE2IGtleS4gKi9cblx0VktfRjE2OiAxMjcsIFxuXHQvKiogRjE3IGtleS4gKi9cblx0VktfRjE3OiAxMjgsIFxuXHQvKiogRjE4IGtleS4gKi9cblx0VktfRjE4OiAxMjksIFxuXHQvKiogRjE5IGtleS4gKi9cblx0VktfRjE5OiAxMzAsIFxuXHQvKiogRjIwIGtleS4gKi9cblx0VktfRjIwOiAxMzEsIFxuXHQvKiogRjIxIGtleS4gKi9cblx0VktfRjIxOiAxMzIsIFxuXHQvKiogRjIyIGtleS4gKi9cblx0VktfRjIyOiAxMzMsIFxuXHQvKiogRjIzIGtleS4gKi9cblx0VktfRjIzOiAxMzQsIFxuXHQvKiogRjI0IGtleS4gKi9cblx0VktfRjI0OiAxMzUsIFxuXHQvKiogTnVtIExvY2sga2V5LiAqL1xuXHRWS19OVU1fTE9DSzogMTQ0LCBcblx0LyoqIFNjcm9sbCBMb2NrIGtleS4gKi9cblx0VktfU0NST0xMX0xPQ0s6IDE0NSwgXG5cdC8qKiBDaXJjdW1mbGV4ICheKSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfQ0lSQ1VNRkxFWDogMTYwLCBcblx0LyoqIEV4Y2xhbWF0aW9uICghKSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfRVhDTEFNQVRJT046IDE2MSwgXG5cdC8qKiBEb3VibGUgcXVvdGUgKCkga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX0RPVUJMRV9RVU9URTogMTYyLCBcblx0LyoqIEhhc2ggKCMpIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19IQVNIOiAxNjMsIFxuXHQvKiogRG9sbGFyIHNpZ24gKCQpIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19ET0xMQVI6IDE2NCwgXG5cdC8qKiBQZXJjZW50ICglKSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfUEVSQ0VOVDogMTY1LCBcblx0LyoqIEFtcGVyc2FuZCAoJikga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX0FNUEVSU0FORDogMTY2LCBcblx0LyoqIFVuZGVyc2NvcmUgKF8pIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19VTkRFUlNDT1JFOiAxNjcsIFxuXHQvKiogT3BlbiBwYXJlbnRoZXNpcyAoKCkga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX09QRU5fUEFSRU46IDE2OCwgXG5cdC8qKiBDbG9zZSBwYXJlbnRoZXNpcyAoKSkga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX0NMT1NFX1BBUkVOOiAxNjksIFxuXHQvKiBBc3RlcmlzayAoKikga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX0FTVEVSSVNLOiAxNzAsXG5cdC8qKiBQbHVzICgrKSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfUExVUzogMTcxLCBcblx0LyoqIFBpcGUgKHwpIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19QSVBFOiAxNzIsIFxuXHQvKiogSHlwaGVuLVVTL2RvY3MvTWludXMgKC0pIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19IWVBIRU5fTUlOVVM6IDE3MywgXG5cdC8qKiBPcGVuIGN1cmx5IGJyYWNrZXQgKHspIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19PUEVOX0NVUkxZX0JSQUNLRVQ6IDE3NCwgXG5cdC8qKiBDbG9zZSBjdXJseSBicmFja2V0ICh9KSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfQ0xPU0VfQ1VSTFlfQlJBQ0tFVDogMTc1LCBcblx0LyoqIFRpbGRlICh+KSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfVElMREU6IDE3NiwgXG5cdC8qKiBDb21tYSAoLCkga2V5LiAqL1xuXHRWS19DT01NQTogMTg4LCBcblx0LyoqIFBlcmlvZCAoLikga2V5LiAqL1xuXHRWS19QRVJJT0Q6IDE5MCwgXG5cdC8qKiBTbGFzaCAoLykga2V5LiAqL1xuXHRWS19TTEFTSDogMTkxLCBcblx0LyoqIEJhY2sgdGljayAoYCkga2V5LiAqL1xuXHRWS19CQUNLX1FVT1RFOiAxOTIsIFxuXHQvKiogT3BlbiBzcXVhcmUgYnJhY2tldCAoWykga2V5LiAqL1xuXHRWS19PUEVOX0JSQUNLRVQ6IDIxOSwgXG5cdC8qKiBCYWNrIHNsYXNoIChcXCkga2V5LiAqL1xuXHRWS19CQUNLX1NMQVNIOiAyMjAsIFxuXHQvKiogQ2xvc2Ugc3F1YXJlIGJyYWNrZXQgKF0pIGtleS4gKi9cblx0VktfQ0xPU0VfQlJBQ0tFVDogMjIxLCBcblx0LyoqIFF1b3RlICgnJycpIGtleS4gKi9cblx0VktfUVVPVEU6IDIyMiwgXG5cdC8qKiBNZXRhIGtleSBvbiBMaW51eCwgQ29tbWFuZCBrZXkgb24gTWFjLiAqL1xuXHRWS19NRVRBOiAyMjQsIFxuXHQvKiogQWx0R3Iga2V5IG9uIExpbnV4LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX0FMVEdSOiAyMjUsIFxuXHQvKiogV2luZG93cyBsb2dvIGtleSBvbiBXaW5kb3dzLiBPciBTdXBlciBvciBIeXBlciBrZXkgb24gTGludXguIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfV0lOOiA5MSwgXG5cdC8qKiBMaW51eCBzdXBwb3J0IGZvciB0aGlzIGtleWNvZGUgd2FzIGFkZGVkIGluIEdlY2tvIDQuMC4gKi9cblx0VktfS0FOQTogMjEsIFxuXHQvKiogTGludXggc3VwcG9ydCBmb3IgdGhpcyBrZXljb2RlIHdhcyBhZGRlZCBpbiBHZWNrbyA0LjAuICovXG5cdFZLX0hBTkdVTDogMjEsIFxuXHQvKiog6Iux5pWwIGtleSBvbiBKYXBhbmVzZSBNYWMga2V5Ym9hcmQuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfRUlTVTogMjIsIFxuXHQvKiogTGludXggc3VwcG9ydCBmb3IgdGhpcyBrZXljb2RlIHdhcyBhZGRlZCBpbiBHZWNrbyA0LjAuICovXG5cdFZLX0pVTkpBOiAyMywgXG5cdC8qKiBMaW51eCBzdXBwb3J0IGZvciB0aGlzIGtleWNvZGUgd2FzIGFkZGVkIGluIEdlY2tvIDQuMC4gKi9cblx0VktfRklOQUw6IDI0LCBcblx0LyoqIExpbnV4IHN1cHBvcnQgZm9yIHRoaXMga2V5Y29kZSB3YXMgYWRkZWQgaW4gR2Vja28gNC4wLiAqL1xuXHRWS19IQU5KQTogMjUsIFxuXHQvKiogTGludXggc3VwcG9ydCBmb3IgdGhpcyBrZXljb2RlIHdhcyBhZGRlZCBpbiBHZWNrbyA0LjAuICovXG5cdFZLX0tBTkpJOiAyNSwgXG5cdC8qKiBMaW51eCBzdXBwb3J0IGZvciB0aGlzIGtleWNvZGUgd2FzIGFkZGVkIGluIEdlY2tvIDQuMC4gKi9cblx0VktfQ09OVkVSVDogMjgsIFxuXHQvKiogTGludXggc3VwcG9ydCBmb3IgdGhpcyBrZXljb2RlIHdhcyBhZGRlZCBpbiBHZWNrbyA0LjAuICovXG5cdFZLX05PTkNPTlZFUlQ6IDI5LCBcblx0LyoqIExpbnV4IHN1cHBvcnQgZm9yIHRoaXMga2V5Y29kZSB3YXMgYWRkZWQgaW4gR2Vja28gNC4wLiAqL1xuXHRWS19BQ0NFUFQ6IDMwLCBcblx0LyoqIExpbnV4IHN1cHBvcnQgZm9yIHRoaXMga2V5Y29kZSB3YXMgYWRkZWQgaW4gR2Vja28gNC4wLiAqL1xuXHRWS19NT0RFQ0hBTkdFOiAzMSwgXG5cdC8qKiBMaW51eCBzdXBwb3J0IGZvciB0aGlzIGtleWNvZGUgd2FzIGFkZGVkIGluIEdlY2tvIDQuMC4gKi9cblx0VktfU0VMRUNUOiA0MSwgXG5cdC8qKiBMaW51eCBzdXBwb3J0IGZvciB0aGlzIGtleWNvZGUgd2FzIGFkZGVkIGluIEdlY2tvIDQuMC4gKi9cblx0VktfUFJJTlQ6IDQyLCBcblx0LyoqIExpbnV4IHN1cHBvcnQgZm9yIHRoaXMga2V5Y29kZSB3YXMgYWRkZWQgaW4gR2Vja28gNC4wLiAqL1xuXHRWS19FWEVDVVRFOiA0MywgXG5cdC8qKiBMaW51eCBzdXBwb3J0IGZvciB0aGlzIGtleWNvZGUgd2FzIGFkZGVkIGluIEdlY2tvIDQuMC5cdCAqL1xuXHRWS19TTEVFUDogOTUgXG59O1xuLyoqXG4gKiBAbmFtZXNwYWNlXG4gKiBDb250YWlucyB0ZXh0IHRva2VuaXphdGlvbiBhbmQgYnJlYWtpbmcgcm91dGluZXNcbiAqL1xuUk9ULlRleHQgPSB7XG5cdFJFX0NPTE9SUzogLyUoW2JjXSl7KFtefV0qKX0vZyxcblxuXHQvKiB0b2tlbiB0eXBlcyAqL1xuXHRUWVBFX1RFWFQ6XHRcdDAsXG5cdFRZUEVfTkVXTElORTpcdDEsXG5cdFRZUEVfRkc6XHRcdDIsXG5cdFRZUEVfQkc6XHRcdDMsXG5cblx0LyoqXG5cdCAqIE1lYXN1cmUgc2l6ZSBvZiBhIHJlc3VsdGluZyB0ZXh0IGJsb2NrXG5cdCAqL1xuXHRtZWFzdXJlOiBmdW5jdGlvbihzdHIsIG1heFdpZHRoKSB7XG5cdFx0dmFyIHJlc3VsdCA9IHt3aWR0aDowLCBoZWlnaHQ6MX07XG5cdFx0dmFyIHRva2VucyA9IHRoaXMudG9rZW5pemUoc3RyLCBtYXhXaWR0aCk7XG5cdFx0dmFyIGxpbmVXaWR0aCA9IDA7XG5cblx0XHRmb3IgKHZhciBpPTA7aTx0b2tlbnMubGVuZ3RoO2krKykge1xuXHRcdFx0dmFyIHRva2VuID0gdG9rZW5zW2ldO1xuXHRcdFx0c3dpdGNoICh0b2tlbi50eXBlKSB7XG5cdFx0XHRcdGNhc2UgdGhpcy5UWVBFX1RFWFQ6XG5cdFx0XHRcdFx0bGluZVdpZHRoICs9IHRva2VuLnZhbHVlLmxlbmd0aDtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSB0aGlzLlRZUEVfTkVXTElORTpcblx0XHRcdFx0XHRyZXN1bHQuaGVpZ2h0Kys7XG5cdFx0XHRcdFx0cmVzdWx0LndpZHRoID0gTWF0aC5tYXgocmVzdWx0LndpZHRoLCBsaW5lV2lkdGgpO1xuXHRcdFx0XHRcdGxpbmVXaWR0aCA9IDA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXN1bHQud2lkdGggPSBNYXRoLm1heChyZXN1bHQud2lkdGgsIGxpbmVXaWR0aCk7XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0IHN0cmluZyB0byBhIHNlcmllcyBvZiBhIGZvcm1hdHRpbmcgY29tbWFuZHNcblx0ICovXG5cdHRva2VuaXplOiBmdW5jdGlvbihzdHIsIG1heFdpZHRoKSB7XG5cdFx0dmFyIHJlc3VsdCA9IFtdO1xuXG5cdFx0LyogZmlyc3QgdG9rZW5pemF0aW9uIHBhc3MgLSBzcGxpdCB0ZXh0cyBhbmQgY29sb3IgZm9ybWF0dGluZyBjb21tYW5kcyAqL1xuXHRcdHZhciBvZmZzZXQgPSAwO1xuXHRcdHN0ci5yZXBsYWNlKHRoaXMuUkVfQ09MT1JTLCBmdW5jdGlvbihtYXRjaCwgdHlwZSwgbmFtZSwgaW5kZXgpIHtcblx0XHRcdC8qIHN0cmluZyBiZWZvcmUgKi9cblx0XHRcdHZhciBwYXJ0ID0gc3RyLnN1YnN0cmluZyhvZmZzZXQsIGluZGV4KTtcblx0XHRcdGlmIChwYXJ0Lmxlbmd0aCkge1xuXHRcdFx0XHRyZXN1bHQucHVzaCh7XG5cdFx0XHRcdFx0dHlwZTogUk9ULlRleHQuVFlQRV9URVhULFxuXHRcdFx0XHRcdHZhbHVlOiBwYXJ0XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvKiBjb2xvciBjb21tYW5kICovXG5cdFx0XHRyZXN1bHQucHVzaCh7XG5cdFx0XHRcdHR5cGU6ICh0eXBlID09IFwiY1wiID8gUk9ULlRleHQuVFlQRV9GRyA6IFJPVC5UZXh0LlRZUEVfQkcpLFxuXHRcdFx0XHR2YWx1ZTogbmFtZS50cmltKClcblx0XHRcdH0pO1xuXG5cdFx0XHRvZmZzZXQgPSBpbmRleCArIG1hdGNoLmxlbmd0aDtcblx0XHRcdHJldHVybiBcIlwiO1xuXHRcdH0pO1xuXG5cdFx0LyogbGFzdCByZW1haW5pbmcgcGFydCAqL1xuXHRcdHZhciBwYXJ0ID0gc3RyLnN1YnN0cmluZyhvZmZzZXQpO1xuXHRcdGlmIChwYXJ0Lmxlbmd0aCkge1xuXHRcdFx0cmVzdWx0LnB1c2goe1xuXHRcdFx0XHR0eXBlOiBST1QuVGV4dC5UWVBFX1RFWFQsXG5cdFx0XHRcdHZhbHVlOiBwYXJ0XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5fYnJlYWtMaW5lcyhyZXN1bHQsIG1heFdpZHRoKTtcblx0fSxcblxuXHQvKiBpbnNlcnQgbGluZSBicmVha3MgaW50byBmaXJzdC1wYXNzIHRva2VuaXplZCBkYXRhICovXG5cdF9icmVha0xpbmVzOiBmdW5jdGlvbih0b2tlbnMsIG1heFdpZHRoKSB7XG5cdFx0aWYgKCFtYXhXaWR0aCkgeyBtYXhXaWR0aCA9IEluZmluaXR5OyB9O1xuXG5cdFx0dmFyIGkgPSAwO1xuXHRcdHZhciBsaW5lTGVuZ3RoID0gMDtcblx0XHR2YXIgbGFzdFRva2VuV2l0aFNwYWNlID0gLTE7XG5cblx0XHR3aGlsZSAoaSA8IHRva2Vucy5sZW5ndGgpIHsgLyogdGFrZSBhbGwgdGV4dCB0b2tlbnMsIHJlbW92ZSBzcGFjZSwgYXBwbHkgbGluZWJyZWFrcyAqL1xuXHRcdFx0dmFyIHRva2VuID0gdG9rZW5zW2ldO1xuXHRcdFx0aWYgKHRva2VuLnR5cGUgPT0gUk9ULlRleHQuVFlQRV9ORVdMSU5FKSB7IC8qIHJlc2V0ICovXG5cdFx0XHRcdGxpbmVMZW5ndGggPSAwOyBcblx0XHRcdFx0bGFzdFRva2VuV2l0aFNwYWNlID0gLTE7XG5cdFx0XHR9XG5cdFx0XHRpZiAodG9rZW4udHlwZSAhPSBST1QuVGV4dC5UWVBFX1RFWFQpIHsgLyogc2tpcCBub24tdGV4dCB0b2tlbnMgKi9cblx0XHRcdFx0aSsrO1xuXHRcdFx0XHRjb250aW51ZTsgXG5cdFx0XHR9XG5cblx0XHRcdC8qIHJlbW92ZSBzcGFjZXMgYXQgdGhlIGJlZ2lubmluZyBvZiBsaW5lICovXG5cdFx0XHR3aGlsZSAobGluZUxlbmd0aCA9PSAwICYmIHRva2VuLnZhbHVlLmNoYXJBdCgwKSA9PSBcIiBcIikgeyB0b2tlbi52YWx1ZSA9IHRva2VuLnZhbHVlLnN1YnN0cmluZygxKTsgfVxuXG5cdFx0XHQvKiBmb3JjZWQgbmV3bGluZT8gaW5zZXJ0IHR3byBuZXcgdG9rZW5zIGFmdGVyIHRoaXMgb25lICovXG5cdFx0XHR2YXIgaW5kZXggPSB0b2tlbi52YWx1ZS5pbmRleE9mKFwiXFxuXCIpO1xuXHRcdFx0aWYgKGluZGV4ICE9IC0xKSB7IFxuXHRcdFx0XHR0b2tlbi52YWx1ZSA9IHRoaXMuX2JyZWFrSW5zaWRlVG9rZW4odG9rZW5zLCBpLCBpbmRleCwgdHJ1ZSk7IFxuXG5cdFx0XHRcdC8qIGlmIHRoZXJlIGFyZSBzcGFjZXMgYXQgdGhlIGVuZCwgd2UgbXVzdCByZW1vdmUgdGhlbSAod2UgZG8gbm90IHdhbnQgdGhlIGxpbmUgdG9vIGxvbmcpICovXG5cdFx0XHRcdHZhciBhcnIgPSB0b2tlbi52YWx1ZS5zcGxpdChcIlwiKTtcblx0XHRcdFx0d2hpbGUgKGFyclthcnIubGVuZ3RoLTFdID09IFwiIFwiKSB7IGFyci5wb3AoKTsgfVxuXHRcdFx0XHR0b2tlbi52YWx1ZSA9IGFyci5qb2luKFwiXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKiB0b2tlbiBkZWdlbmVyYXRlZD8gKi9cblx0XHRcdGlmICghdG9rZW4udmFsdWUubGVuZ3RoKSB7XG5cdFx0XHRcdHRva2Vucy5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAobGluZUxlbmd0aCArIHRva2VuLnZhbHVlLmxlbmd0aCA+IG1heFdpZHRoKSB7IC8qIGxpbmUgdG9vIGxvbmcsIGZpbmQgYSBzdWl0YWJsZSBicmVha2luZyBzcG90ICovXG5cblx0XHRcdFx0LyogaXMgaXQgcG9zc2libGUgdG8gYnJlYWsgd2l0aGluIHRoaXMgdG9rZW4/ICovXG5cdFx0XHRcdHZhciBpbmRleCA9IC0xO1xuXHRcdFx0XHR3aGlsZSAoMSkge1xuXHRcdFx0XHRcdHZhciBuZXh0SW5kZXggPSB0b2tlbi52YWx1ZS5pbmRleE9mKFwiIFwiLCBpbmRleCsxKTtcblx0XHRcdFx0XHRpZiAobmV4dEluZGV4ID09IC0xKSB7IGJyZWFrOyB9XG5cdFx0XHRcdFx0aWYgKGxpbmVMZW5ndGggKyBuZXh0SW5kZXggPiBtYXhXaWR0aCkgeyBicmVhazsgfVxuXHRcdFx0XHRcdGluZGV4ID0gbmV4dEluZGV4O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGluZGV4ICE9IC0xKSB7IC8qIGJyZWFrIGF0IHNwYWNlIHdpdGhpbiB0aGlzIG9uZSAqL1xuXHRcdFx0XHRcdHRva2VuLnZhbHVlID0gdGhpcy5fYnJlYWtJbnNpZGVUb2tlbih0b2tlbnMsIGksIGluZGV4LCB0cnVlKTtcblx0XHRcdFx0fSBlbHNlIGlmIChsYXN0VG9rZW5XaXRoU3BhY2UgIT0gLTEpIHsgLyogaXMgdGhlcmUgYSBwcmV2aW91cyB0b2tlbiB3aGVyZSBhIGJyZWFrIGNhbiBvY2N1cj8gKi9cblx0XHRcdFx0XHR2YXIgdG9rZW4gPSB0b2tlbnNbbGFzdFRva2VuV2l0aFNwYWNlXTtcblx0XHRcdFx0XHR2YXIgYnJlYWtJbmRleCA9IHRva2VuLnZhbHVlLmxhc3RJbmRleE9mKFwiIFwiKTtcblx0XHRcdFx0XHR0b2tlbi52YWx1ZSA9IHRoaXMuX2JyZWFrSW5zaWRlVG9rZW4odG9rZW5zLCBsYXN0VG9rZW5XaXRoU3BhY2UsIGJyZWFrSW5kZXgsIHRydWUpO1xuXHRcdFx0XHRcdGkgPSBsYXN0VG9rZW5XaXRoU3BhY2U7XG5cdFx0XHRcdH0gZWxzZSB7IC8qIGZvcmNlIGJyZWFrIGluIHRoaXMgdG9rZW4gKi9cblx0XHRcdFx0XHR0b2tlbi52YWx1ZSA9IHRoaXMuX2JyZWFrSW5zaWRlVG9rZW4odG9rZW5zLCBpLCBtYXhXaWR0aC1saW5lTGVuZ3RoLCBmYWxzZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIHsgLyogbGluZSBub3QgbG9uZywgY29udGludWUgKi9cblx0XHRcdFx0bGluZUxlbmd0aCArPSB0b2tlbi52YWx1ZS5sZW5ndGg7XG5cdFx0XHRcdGlmICh0b2tlbi52YWx1ZS5pbmRleE9mKFwiIFwiKSAhPSAtMSkgeyBsYXN0VG9rZW5XaXRoU3BhY2UgPSBpOyB9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGkrKzsgLyogYWR2YW5jZSB0byBuZXh0IHRva2VuICovXG5cdFx0fVxuXG5cblx0XHR0b2tlbnMucHVzaCh7dHlwZTogUk9ULlRleHQuVFlQRV9ORVdMSU5FfSk7IC8qIGluc2VydCBmYWtlIG5ld2xpbmUgdG8gZml4IHRoZSBsYXN0IHRleHQgbGluZSAqL1xuXG5cdFx0LyogcmVtb3ZlIHRyYWlsaW5nIHNwYWNlIGZyb20gdGV4dCB0b2tlbnMgYmVmb3JlIG5ld2xpbmVzICovXG5cdFx0dmFyIGxhc3RUZXh0VG9rZW4gPSBudWxsO1xuXHRcdGZvciAodmFyIGk9MDtpPHRva2Vucy5sZW5ndGg7aSsrKSB7XG5cdFx0XHR2YXIgdG9rZW4gPSB0b2tlbnNbaV07XG5cdFx0XHRzd2l0Y2ggKHRva2VuLnR5cGUpIHtcblx0XHRcdFx0Y2FzZSBST1QuVGV4dC5UWVBFX1RFWFQ6IGxhc3RUZXh0VG9rZW4gPSB0b2tlbjsgYnJlYWs7XG5cdFx0XHRcdGNhc2UgUk9ULlRleHQuVFlQRV9ORVdMSU5FOiBcblx0XHRcdFx0XHRpZiAobGFzdFRleHRUb2tlbikgeyAvKiByZW1vdmUgdHJhaWxpbmcgc3BhY2UgKi9cblx0XHRcdFx0XHRcdHZhciBhcnIgPSBsYXN0VGV4dFRva2VuLnZhbHVlLnNwbGl0KFwiXCIpO1xuXHRcdFx0XHRcdFx0d2hpbGUgKGFyclthcnIubGVuZ3RoLTFdID09IFwiIFwiKSB7IGFyci5wb3AoKTsgfVxuXHRcdFx0XHRcdFx0bGFzdFRleHRUb2tlbi52YWx1ZSA9IGFyci5qb2luKFwiXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRsYXN0VGV4dFRva2VuID0gbnVsbDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dG9rZW5zLnBvcCgpOyAvKiByZW1vdmUgZmFrZSB0b2tlbiAqL1xuXG5cdFx0cmV0dXJuIHRva2Vucztcblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlIG5ldyB0b2tlbnMgYW5kIGluc2VydCB0aGVtIGludG8gdGhlIHN0cmVhbVxuXHQgKiBAcGFyYW0ge29iamVjdFtdfSB0b2tlbnNcblx0ICogQHBhcmFtIHtpbnR9IHRva2VuSW5kZXggVG9rZW4gYmVpbmcgcHJvY2Vzc2VkXG5cdCAqIEBwYXJhbSB7aW50fSBicmVha0luZGV4IEluZGV4IHdpdGhpbiBjdXJyZW50IHRva2VuJ3MgdmFsdWVcblx0ICogQHBhcmFtIHtib29sfSByZW1vdmVCcmVha0NoYXIgRG8gd2Ugd2FudCB0byByZW1vdmUgdGhlIGJyZWFraW5nIGNoYXJhY3Rlcj9cblx0ICogQHJldHVybnMge3N0cmluZ30gcmVtYWluaW5nIHVuYnJva2VuIHRva2VuIHZhbHVlXG5cdCAqL1xuXHRfYnJlYWtJbnNpZGVUb2tlbjogZnVuY3Rpb24odG9rZW5zLCB0b2tlbkluZGV4LCBicmVha0luZGV4LCByZW1vdmVCcmVha0NoYXIpIHtcblx0XHR2YXIgbmV3QnJlYWtUb2tlbiA9IHtcblx0XHRcdHR5cGU6IFJPVC5UZXh0LlRZUEVfTkVXTElORVxuXHRcdH1cblx0XHR2YXIgbmV3VGV4dFRva2VuID0ge1xuXHRcdFx0dHlwZTogUk9ULlRleHQuVFlQRV9URVhULFxuXHRcdFx0dmFsdWU6IHRva2Vuc1t0b2tlbkluZGV4XS52YWx1ZS5zdWJzdHJpbmcoYnJlYWtJbmRleCArIChyZW1vdmVCcmVha0NoYXIgPyAxIDogMCkpXG5cdFx0fVxuXHRcdHRva2Vucy5zcGxpY2UodG9rZW5JbmRleCsxLCAwLCBuZXdCcmVha1Rva2VuLCBuZXdUZXh0VG9rZW4pO1xuXHRcdHJldHVybiB0b2tlbnNbdG9rZW5JbmRleF0udmFsdWUuc3Vic3RyaW5nKDAsIGJyZWFrSW5kZXgpO1xuXHR9XG59XG4vKipcbiAqIEByZXR1cm5zIHthbnl9IFJhbmRvbWx5IHBpY2tlZCBpdGVtLCBudWxsIHdoZW4gbGVuZ3RoPTBcbiAqL1xuQXJyYXkucHJvdG90eXBlLnJhbmRvbSA9IGZ1bmN0aW9uKCkge1xuXHRpZiAoIXRoaXMubGVuZ3RoKSB7IHJldHVybiBudWxsOyB9XG5cdHJldHVybiB0aGlzW01hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkgKiB0aGlzLmxlbmd0aCldO1xufVxuXG4vKipcbiAqIEByZXR1cm5zIHthcnJheX0gTmV3IGFycmF5IHdpdGggcmFuZG9taXplZCBpdGVtc1xuICogRklYTUUgZGVzdHJveXMgdGhpcyFcbiAqL1xuQXJyYXkucHJvdG90eXBlLnJhbmRvbWl6ZSA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgcmVzdWx0ID0gW107XG5cdHdoaWxlICh0aGlzLmxlbmd0aCkge1xuXHRcdHZhciBpbmRleCA9IHRoaXMuaW5kZXhPZih0aGlzLnJhbmRvbSgpKTtcblx0XHRyZXN1bHQucHVzaCh0aGlzLnNwbGljZShpbmRleCwgMSlbMF0pO1xuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59XG4vKipcbiAqIEFsd2F5cyBwb3NpdGl2ZSBtb2R1bHVzXG4gKiBAcGFyYW0ge2ludH0gbiBNb2R1bHVzXG4gKiBAcmV0dXJucyB7aW50fSB0aGlzIG1vZHVsbyBuXG4gKi9cbk51bWJlci5wcm90b3R5cGUubW9kID0gZnVuY3Rpb24obikge1xuXHRyZXR1cm4gKCh0aGlzJW4pK24pJW47XG59XG4vKipcbiAqIEByZXR1cm5zIHtzdHJpbmd9IEZpcnN0IGxldHRlciBjYXBpdGFsaXplZFxuICovXG5TdHJpbmcucHJvdG90eXBlLmNhcGl0YWxpemUgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0aGlzLnN1YnN0cmluZygxKTtcbn1cblxuLyoqIFxuICogTGVmdCBwYWRcbiAqIEBwYXJhbSB7c3RyaW5nfSBbY2hhcmFjdGVyPVwiMFwiXVxuICogQHBhcmFtIHtpbnR9IFtjb3VudD0yXVxuICovXG5TdHJpbmcucHJvdG90eXBlLmxwYWQgPSBmdW5jdGlvbihjaGFyYWN0ZXIsIGNvdW50KSB7XG5cdHZhciBjaCA9IGNoYXJhY3RlciB8fCBcIjBcIjtcblx0dmFyIGNudCA9IGNvdW50IHx8IDI7XG5cblx0dmFyIHMgPSBcIlwiO1xuXHR3aGlsZSAocy5sZW5ndGggPCAoY250IC0gdGhpcy5sZW5ndGgpKSB7IHMgKz0gY2g7IH1cblx0cyA9IHMuc3Vic3RyaW5nKDAsIGNudC10aGlzLmxlbmd0aCk7XG5cdHJldHVybiBzK3RoaXM7XG59XG5cbi8qKiBcbiAqIFJpZ2h0IHBhZFxuICogQHBhcmFtIHtzdHJpbmd9IFtjaGFyYWN0ZXI9XCIwXCJdXG4gKiBAcGFyYW0ge2ludH0gW2NvdW50PTJdXG4gKi9cblN0cmluZy5wcm90b3R5cGUucnBhZCA9IGZ1bmN0aW9uKGNoYXJhY3RlciwgY291bnQpIHtcblx0dmFyIGNoID0gY2hhcmFjdGVyIHx8IFwiMFwiO1xuXHR2YXIgY250ID0gY291bnQgfHwgMjtcblxuXHR2YXIgcyA9IFwiXCI7XG5cdHdoaWxlIChzLmxlbmd0aCA8IChjbnQgLSB0aGlzLmxlbmd0aCkpIHsgcyArPSBjaDsgfVxuXHRzID0gcy5zdWJzdHJpbmcoMCwgY250LXRoaXMubGVuZ3RoKTtcblx0cmV0dXJuIHRoaXMrcztcbn1cblxuLyoqXG4gKiBGb3JtYXQgYSBzdHJpbmcgaW4gYSBmbGV4aWJsZSB3YXkuIFNjYW5zIGZvciAlcyBzdHJpbmdzIGFuZCByZXBsYWNlcyB0aGVtIHdpdGggYXJndW1lbnRzLiBMaXN0IG9mIHBhdHRlcm5zIGlzIG1vZGlmaWFibGUgdmlhIFN0cmluZy5mb3JtYXQubWFwLlxuICogQHBhcmFtIHtzdHJpbmd9IHRlbXBsYXRlXG4gKiBAcGFyYW0ge2FueX0gW2FyZ3ZdXG4gKi9cblN0cmluZy5mb3JtYXQgPSBmdW5jdGlvbih0ZW1wbGF0ZSkge1xuXHR2YXIgbWFwID0gU3RyaW5nLmZvcm1hdC5tYXA7XG5cdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuXHR2YXIgcmVwbGFjZXIgPSBmdW5jdGlvbihtYXRjaCwgZ3JvdXAxLCBncm91cDIsIGluZGV4KSB7XG5cdFx0aWYgKHRlbXBsYXRlLmNoYXJBdChpbmRleC0xKSA9PSBcIiVcIikgeyByZXR1cm4gbWF0Y2guc3Vic3RyaW5nKDEpOyB9XG5cdFx0aWYgKCFhcmdzLmxlbmd0aCkgeyByZXR1cm4gbWF0Y2g7IH1cblx0XHR2YXIgb2JqID0gYXJnc1swXTtcblxuXHRcdHZhciBncm91cCA9IGdyb3VwMSB8fCBncm91cDI7XG5cdFx0dmFyIHBhcnRzID0gZ3JvdXAuc3BsaXQoXCIsXCIpO1xuXHRcdHZhciBuYW1lID0gcGFydHMuc2hpZnQoKTtcblx0XHR2YXIgbWV0aG9kID0gbWFwW25hbWUudG9Mb3dlckNhc2UoKV07XG5cdFx0aWYgKCFtZXRob2QpIHsgcmV0dXJuIG1hdGNoOyB9XG5cblx0XHR2YXIgb2JqID0gYXJncy5zaGlmdCgpO1xuXHRcdHZhciByZXBsYWNlZCA9IG9ialttZXRob2RdLmFwcGx5KG9iaiwgcGFydHMpO1xuXG5cdFx0dmFyIGZpcnN0ID0gbmFtZS5jaGFyQXQoMCk7XG5cdFx0aWYgKGZpcnN0ICE9IGZpcnN0LnRvTG93ZXJDYXNlKCkpIHsgcmVwbGFjZWQgPSByZXBsYWNlZC5jYXBpdGFsaXplKCk7IH1cblxuXHRcdHJldHVybiByZXBsYWNlZDtcblx0fVxuXHRyZXR1cm4gdGVtcGxhdGUucmVwbGFjZSgvJSg/OihbYS16XSspfCg/OnsoW159XSspfSkpL2dpLCByZXBsYWNlcik7XG59XG5cblN0cmluZy5mb3JtYXQubWFwID0ge1xuXHRcInNcIjogXCJ0b1N0cmluZ1wiXG59XG5cbi8qKlxuICogQ29udmVuaWVuY2Ugc2hvcnRjdXQgdG8gU3RyaW5nLmZvcm1hdCh0aGlzKVxuICovXG5TdHJpbmcucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG5cdGFyZ3MudW5zaGlmdCh0aGlzKTtcblx0cmV0dXJuIFN0cmluZy5mb3JtYXQuYXBwbHkoU3RyaW5nLCBhcmdzKTtcbn1cblxuaWYgKCFPYmplY3QuY3JlYXRlKSB7ICBcblx0LyoqXG5cdCAqIEVTNSBPYmplY3QuY3JlYXRlXG5cdCAqL1xuXHRPYmplY3QuY3JlYXRlID0gZnVuY3Rpb24obykgeyAgXG5cdFx0dmFyIHRtcCA9IGZ1bmN0aW9uKCkge307XG5cdFx0dG1wLnByb3RvdHlwZSA9IG87XG5cdFx0cmV0dXJuIG5ldyB0bXAoKTtcblx0fTsgIFxufSAgXG4vKipcbiAqIFNldHMgcHJvdG90eXBlIG9mIHRoaXMgZnVuY3Rpb24gdG8gYW4gaW5zdGFuY2Ugb2YgcGFyZW50IGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBwYXJlbnRcbiAqL1xuRnVuY3Rpb24ucHJvdG90eXBlLmV4dGVuZCA9IGZ1bmN0aW9uKHBhcmVudCkge1xuXHR0aGlzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUocGFyZW50LnByb3RvdHlwZSk7XG5cdHRoaXMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gdGhpcztcblx0cmV0dXJuIHRoaXM7XG59XG53aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID1cblx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZVxuXHR8fCB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cdHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0fHwgd2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0fHwgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cdHx8IGZ1bmN0aW9uKGNiKSB7IHJldHVybiBzZXRUaW1lb3V0KGNiLCAxMDAwLzYwKTsgfTtcblxud2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID1cblx0d2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lXG5cdHx8IHdpbmRvdy5tb3pDYW5jZWxBbmltYXRpb25GcmFtZVxuXHR8fCB3aW5kb3cud2Via2l0Q2FuY2VsQW5pbWF0aW9uRnJhbWVcblx0fHwgd2luZG93Lm9DYW5jZWxBbmltYXRpb25GcmFtZVxuXHR8fCB3aW5kb3cubXNDYW5jZWxBbmltYXRpb25GcmFtZVxuXHR8fCBmdW5jdGlvbihpZCkgeyByZXR1cm4gY2xlYXJUaW1lb3V0KGlkKTsgfTtcbi8qKlxuICogQGNsYXNzIFZpc3VhbCBtYXAgZGlzcGxheVxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtpbnR9IFtvcHRpb25zLndpZHRoPVJPVC5ERUZBVUxUX1dJRFRIXVxuICogQHBhcmFtIHtpbnR9IFtvcHRpb25zLmhlaWdodD1ST1QuREVGQVVMVF9IRUlHSFRdXG4gKiBAcGFyYW0ge2ludH0gW29wdGlvbnMuZm9udFNpemU9MTVdXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZm9udEZhbWlseT1cIm1vbm9zcGFjZVwiXVxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmZvbnRTdHlsZT1cIlwiXSBib2xkL2l0YWxpYy9ub25lL2JvdGhcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5mZz1cIiNjY2NcIl1cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5iZz1cIiMwMDBcIl1cbiAqIEBwYXJhbSB7ZmxvYXR9IFtvcHRpb25zLnNwYWNpbmc9MV1cbiAqIEBwYXJhbSB7ZmxvYXR9IFtvcHRpb25zLmJvcmRlcj0wXVxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmxheW91dD1cInJlY3RcIl1cbiAqIEBwYXJhbSB7aW50fSBbb3B0aW9ucy50aWxlV2lkdGg9MzJdXG4gKiBAcGFyYW0ge2ludH0gW29wdGlvbnMudGlsZUhlaWdodD0zMl1cbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy50aWxlTWFwPXt9XVxuICogQHBhcmFtIHtpbWFnZX0gW29wdGlvbnMudGlsZVNldD1udWxsXVxuICovXG5ST1QuRGlzcGxheSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG5cdHRoaXMuX2NvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHR0aGlzLl9kYXRhID0ge307XG5cdHRoaXMuX2RpcnR5ID0gZmFsc2U7IC8qIGZhbHNlID0gbm90aGluZywgdHJ1ZSA9IGFsbCwgb2JqZWN0ID0gZGlydHkgY2VsbHMgKi9cblx0dGhpcy5fb3B0aW9ucyA9IHt9O1xuXHR0aGlzLl9iYWNrZW5kID0gbnVsbDtcblx0XG5cdHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcblx0XHR3aWR0aDogUk9ULkRFRkFVTFRfV0lEVEgsXG5cdFx0aGVpZ2h0OiBST1QuREVGQVVMVF9IRUlHSFQsXG5cdFx0bGF5b3V0OiBcInJlY3RcIixcblx0XHRmb250U2l6ZTogMTUsXG5cdFx0c3BhY2luZzogMSxcblx0XHRib3JkZXI6IDAsXG5cdFx0Zm9udEZhbWlseTogXCJtb25vc3BhY2VcIixcblx0XHRmb250U3R5bGU6IFwiXCIsXG5cdFx0Zmc6IFwiI2NjY1wiLFxuXHRcdGJnOiBcIiMwMDBcIixcblx0XHR0aWxlV2lkdGg6IDMyLFxuXHRcdHRpbGVIZWlnaHQ6IDMyLFxuXHRcdHRpbGVNYXA6IHt9LFxuXHRcdHRpbGVTZXQ6IG51bGxcblx0fTtcblx0Zm9yICh2YXIgcCBpbiBvcHRpb25zKSB7IGRlZmF1bHRPcHRpb25zW3BdID0gb3B0aW9uc1twXTsgfVxuXHR0aGlzLnNldE9wdGlvbnMoZGVmYXVsdE9wdGlvbnMpO1xuXHR0aGlzLkRFQlVHID0gdGhpcy5ERUJVRy5iaW5kKHRoaXMpO1xuXG5cdHRoaXMuX3RpY2sgPSB0aGlzLl90aWNrLmJpbmQodGhpcyk7XG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl90aWNrKTtcbn1cblxuLyoqXG4gKiBEZWJ1ZyBoZWxwZXIsIGlkZWFsIGFzIGEgbWFwIGdlbmVyYXRvciBjYWxsYmFjay4gQWx3YXlzIGJvdW5kIHRvIHRoaXMuXG4gKiBAcGFyYW0ge2ludH0geFxuICogQHBhcmFtIHtpbnR9IHlcbiAqIEBwYXJhbSB7aW50fSB3aGF0XG4gKi9cblJPVC5EaXNwbGF5LnByb3RvdHlwZS5ERUJVRyA9IGZ1bmN0aW9uKHgsIHksIHdoYXQpIHtcblx0dmFyIGNvbG9ycyA9IFt0aGlzLl9vcHRpb25zLmJnLCB0aGlzLl9vcHRpb25zLmZnXTtcblx0dGhpcy5kcmF3KHgsIHksIG51bGwsIG51bGwsIGNvbG9yc1t3aGF0ICUgY29sb3JzLmxlbmd0aF0pO1xufVxuXG4vKipcbiAqIENsZWFyIHRoZSB3aG9sZSBkaXNwbGF5IChjb3ZlciBpdCB3aXRoIGJhY2tncm91bmQgY29sb3IpXG4gKi9cblJPVC5EaXNwbGF5LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9kYXRhID0ge307XG5cdHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbn1cblxuLyoqXG4gKiBAc2VlIFJPVC5EaXNwbGF5XG4gKi9cblJPVC5EaXNwbGF5LnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXHRmb3IgKHZhciBwIGluIG9wdGlvbnMpIHsgdGhpcy5fb3B0aW9uc1twXSA9IG9wdGlvbnNbcF07IH1cblx0aWYgKG9wdGlvbnMud2lkdGggfHwgb3B0aW9ucy5oZWlnaHQgfHwgb3B0aW9ucy5mb250U2l6ZSB8fCBvcHRpb25zLmZvbnRGYW1pbHkgfHwgb3B0aW9ucy5zcGFjaW5nIHx8IG9wdGlvbnMubGF5b3V0KSB7XG5cdFx0aWYgKG9wdGlvbnMubGF5b3V0KSB7IFxuXHRcdFx0dGhpcy5fYmFja2VuZCA9IG5ldyBST1QuRGlzcGxheVtvcHRpb25zLmxheW91dC5jYXBpdGFsaXplKCldKHRoaXMuX2NvbnRleHQpO1xuXHRcdH1cblxuXHRcdHZhciBmb250ID0gKHRoaXMuX29wdGlvbnMuZm9udFN0eWxlID8gdGhpcy5fb3B0aW9ucy5mb250U3R5bGUgKyBcIiBcIiA6IFwiXCIpICsgdGhpcy5fb3B0aW9ucy5mb250U2l6ZSArIFwicHggXCIgKyB0aGlzLl9vcHRpb25zLmZvbnRGYW1pbHk7XG5cdFx0dGhpcy5fY29udGV4dC5mb250ID0gZm9udDtcblx0XHR0aGlzLl9iYWNrZW5kLmNvbXB1dGUodGhpcy5fb3B0aW9ucyk7XG5cdFx0dGhpcy5fY29udGV4dC5mb250ID0gZm9udDtcblx0XHR0aGlzLl9jb250ZXh0LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XG5cdFx0dGhpcy5fY29udGV4dC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuXHRcdHRoaXMuX2RpcnR5ID0gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGN1cnJlbnRseSBzZXQgb3B0aW9uc1xuICogQHJldHVybnMge29iamVjdH0gQ3VycmVudCBvcHRpb25zIG9iamVjdCBcbiAqL1xuUk9ULkRpc3BsYXkucHJvdG90eXBlLmdldE9wdGlvbnMgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuX29wdGlvbnM7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgRE9NIG5vZGUgb2YgdGhpcyBkaXNwbGF5XG4gKiBAcmV0dXJucyB7bm9kZX0gRE9NIG5vZGVcbiAqL1xuUk9ULkRpc3BsYXkucHJvdG90eXBlLmdldENvbnRhaW5lciA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5fY29udGV4dC5jYW52YXM7XG59XG5cbi8qKlxuICogQ29tcHV0ZSB0aGUgbWF4aW11bSB3aWR0aC9oZWlnaHQgdG8gZml0IGludG8gYSBzZXQgb2YgZ2l2ZW4gY29uc3RyYWludHNcbiAqIEBwYXJhbSB7aW50fSBhdmFpbFdpZHRoIE1heGltdW0gYWxsb3dlZCBwaXhlbCB3aWR0aFxuICogQHBhcmFtIHtpbnR9IGF2YWlsSGVpZ2h0IE1heGltdW0gYWxsb3dlZCBwaXhlbCBoZWlnaHRcbiAqIEByZXR1cm5zIHtpbnRbMl19IGNlbGxXaWR0aCxjZWxsSGVpZ2h0XG4gKi9cblJPVC5EaXNwbGF5LnByb3RvdHlwZS5jb21wdXRlU2l6ZSA9IGZ1bmN0aW9uKGF2YWlsV2lkdGgsIGF2YWlsSGVpZ2h0KSB7XG5cdHJldHVybiB0aGlzLl9iYWNrZW5kLmNvbXB1dGVTaXplKGF2YWlsV2lkdGgsIGF2YWlsSGVpZ2h0LCB0aGlzLl9vcHRpb25zKTtcbn1cblxuLyoqXG4gKiBDb21wdXRlIHRoZSBtYXhpbXVtIGZvbnQgc2l6ZSB0byBmaXQgaW50byBhIHNldCBvZiBnaXZlbiBjb25zdHJhaW50c1xuICogQHBhcmFtIHtpbnR9IGF2YWlsV2lkdGggTWF4aW11bSBhbGxvd2VkIHBpeGVsIHdpZHRoXG4gKiBAcGFyYW0ge2ludH0gYXZhaWxIZWlnaHQgTWF4aW11bSBhbGxvd2VkIHBpeGVsIGhlaWdodFxuICogQHJldHVybnMge2ludH0gZm9udFNpemVcbiAqL1xuUk9ULkRpc3BsYXkucHJvdG90eXBlLmNvbXB1dGVGb250U2l6ZSA9IGZ1bmN0aW9uKGF2YWlsV2lkdGgsIGF2YWlsSGVpZ2h0KSB7XG5cdHJldHVybiB0aGlzLl9iYWNrZW5kLmNvbXB1dGVGb250U2l6ZShhdmFpbFdpZHRoLCBhdmFpbEhlaWdodCwgdGhpcy5fb3B0aW9ucyk7XG59XG5cbi8qKlxuICogQ29udmVydCBhIERPTSBldmVudCAobW91c2Ugb3IgdG91Y2gpIHRvIG1hcCBjb29yZGluYXRlcy4gVXNlcyBmaXJzdCB0b3VjaCBmb3IgbXVsdGktdG91Y2guXG4gKiBAcGFyYW0ge0V2ZW50fSBlIGV2ZW50XG4gKiBAcmV0dXJucyB7aW50WzJdfSAtMSBmb3IgdmFsdWVzIG91dHNpZGUgb2YgdGhlIGNhbnZhc1xuICovXG5ST1QuRGlzcGxheS5wcm90b3R5cGUuZXZlbnRUb1Bvc2l0aW9uID0gZnVuY3Rpb24oZSkge1xuXHRpZiAoZS50b3VjaGVzKSB7XG5cdFx0dmFyIHggPSBlLnRvdWNoZXNbMF0uY2xpZW50WDtcblx0XHR2YXIgeSA9IGUudG91Y2hlc1swXS5jbGllbnRZO1xuXHR9IGVsc2Uge1xuXHRcdHZhciB4ID0gZS5jbGllbnRYO1xuXHRcdHZhciB5ID0gZS5jbGllbnRZO1xuXHR9XG5cblx0dmFyIHJlY3QgPSB0aGlzLl9jb250ZXh0LmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0eCAtPSByZWN0LmxlZnQ7XG5cdHkgLT0gcmVjdC50b3A7XG5cdFxuXHRpZiAoeCA8IDAgfHwgeSA8IDAgfHwgeCA+PSB0aGlzLl9jb250ZXh0LmNhbnZhcy53aWR0aCB8fCB5ID49IHRoaXMuX2NvbnRleHQuY2FudmFzLmhlaWdodCkgeyByZXR1cm4gWy0xLCAtMV07IH1cblxuXHRyZXR1cm4gdGhpcy5fYmFja2VuZC5ldmVudFRvUG9zaXRpb24oeCwgeSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtpbnR9IHhcbiAqIEBwYXJhbSB7aW50fSB5XG4gKiBAcGFyYW0ge3N0cmluZyB8fCBzdHJpbmdbXX0gY2ggT25lIG9yIG1vcmUgY2hhcnMgKHdpbGwgYmUgb3ZlcmxhcHBpbmcgdGhlbXNlbHZlcylcbiAqIEBwYXJhbSB7c3RyaW5nfSBbZmddIGZvcmVncm91bmQgY29sb3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBbYmddIGJhY2tncm91bmQgY29sb3JcbiAqL1xuUk9ULkRpc3BsYXkucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbih4LCB5LCBjaCwgZmcsIGJnKSB7XG5cdGlmICghZmcpIHsgZmcgPSB0aGlzLl9vcHRpb25zLmZnOyB9XG5cdGlmICghYmcpIHsgYmcgPSB0aGlzLl9vcHRpb25zLmJnOyB9XG5cdHRoaXMuX2RhdGFbeCtcIixcIit5XSA9IFt4LCB5LCBjaCwgZmcsIGJnXTtcblx0XG5cdGlmICh0aGlzLl9kaXJ0eSA9PT0gdHJ1ZSkgeyByZXR1cm47IH0gLyogd2lsbCBhbHJlYWR5IHJlZHJhdyBldmVyeXRoaW5nICovXG5cdGlmICghdGhpcy5fZGlydHkpIHsgdGhpcy5fZGlydHkgPSB7fTsgfSAvKiBmaXJzdCEgKi9cblx0dGhpcy5fZGlydHlbeCtcIixcIit5XSA9IHRydWU7XG59XG5cbi8qKlxuICogRHJhd3MgYSB0ZXh0IGF0IGdpdmVuIHBvc2l0aW9uLiBPcHRpb25hbGx5IHdyYXBzIGF0IGEgbWF4aW11bSBsZW5ndGguIEN1cnJlbnRseSBkb2VzIG5vdCB3b3JrIHdpdGggaGV4IGxheW91dC5cbiAqIEBwYXJhbSB7aW50fSB4XG4gKiBAcGFyYW0ge2ludH0geVxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgTWF5IGNvbnRhaW4gY29sb3IvYmFja2dyb3VuZCBmb3JtYXQgc3BlY2lmaWVycywgJWN7bmFtZX0vJWJ7bmFtZX0sIGJvdGggb3B0aW9uYWwuICVje30vJWJ7fSByZXNldHMgdG8gZGVmYXVsdC5cbiAqIEBwYXJhbSB7aW50fSBbbWF4V2lkdGhdIHdyYXAgYXQgd2hhdCB3aWR0aD9cbiAqIEByZXR1cm5zIHtpbnR9IGxpbmVzIGRyYXduXG4gKi9cblJPVC5EaXNwbGF5LnByb3RvdHlwZS5kcmF3VGV4dCA9IGZ1bmN0aW9uKHgsIHksIHRleHQsIG1heFdpZHRoKSB7XG5cdHZhciBmZyA9IG51bGw7XG5cdHZhciBiZyA9IG51bGw7XG5cdHZhciBjeCA9IHg7XG5cdHZhciBjeSA9IHk7XG5cdHZhciBsaW5lcyA9IDE7XG5cdGlmICghbWF4V2lkdGgpIHsgbWF4V2lkdGggPSB0aGlzLl9vcHRpb25zLndpZHRoLXg7IH1cblxuXHR2YXIgdG9rZW5zID0gUk9ULlRleHQudG9rZW5pemUodGV4dCwgbWF4V2lkdGgpO1xuXG5cdHdoaWxlICh0b2tlbnMubGVuZ3RoKSB7IC8qIGludGVycHJldCB0b2tlbml6ZWQgb3Bjb2RlIHN0cmVhbSAqL1xuXHRcdHZhciB0b2tlbiA9IHRva2Vucy5zaGlmdCgpO1xuXHRcdHN3aXRjaCAodG9rZW4udHlwZSkge1xuXHRcdFx0Y2FzZSBST1QuVGV4dC5UWVBFX1RFWFQ6XG5cdFx0XHRcdGZvciAodmFyIGk9MDtpPHRva2VuLnZhbHVlLmxlbmd0aDtpKyspIHtcblx0XHRcdFx0XHR0aGlzLmRyYXcoY3grKywgY3ksIHRva2VuLnZhbHVlLmNoYXJBdChpKSwgZmcsIGJnKTtcblx0XHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgUk9ULlRleHQuVFlQRV9GRzpcblx0XHRcdFx0ZmcgPSB0b2tlbi52YWx1ZSB8fCBudWxsO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgUk9ULlRleHQuVFlQRV9CRzpcblx0XHRcdFx0YmcgPSB0b2tlbi52YWx1ZSB8fCBudWxsO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgUk9ULlRleHQuVFlQRV9ORVdMSU5FOlxuXHRcdFx0XHRjeCA9IHg7XG5cdFx0XHRcdGN5Kys7XG5cdFx0XHRcdGxpbmVzKytcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBsaW5lcztcbn1cblxuLyoqXG4gKiBUaW1lciB0aWNrOiB1cGRhdGUgZGlydHkgcGFydHNcbiAqL1xuUk9ULkRpc3BsYXkucHJvdG90eXBlLl90aWNrID0gZnVuY3Rpb24oKSB7XG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl90aWNrKTtcblxuXHRpZiAoIXRoaXMuX2RpcnR5KSB7IHJldHVybjsgfVxuXG5cdGlmICh0aGlzLl9kaXJ0eSA9PT0gdHJ1ZSkgeyAvKiBkcmF3IGFsbCAqL1xuXHRcdHRoaXMuX2NvbnRleHQuZmlsbFN0eWxlID0gdGhpcy5fb3B0aW9ucy5iZztcblx0XHR0aGlzLl9jb250ZXh0LmZpbGxSZWN0KDAsIDAsIHRoaXMuX2NvbnRleHQuY2FudmFzLndpZHRoLCB0aGlzLl9jb250ZXh0LmNhbnZhcy5oZWlnaHQpO1xuXG5cdFx0Zm9yICh2YXIgaWQgaW4gdGhpcy5fZGF0YSkgeyAvKiByZWRyYXcgY2FjaGVkIGRhdGEgKi9cblx0XHRcdHRoaXMuX2RyYXcoaWQsIGZhbHNlKTtcblx0XHR9XG5cblx0fSBlbHNlIHsgLyogZHJhdyBvbmx5IGRpcnR5ICovXG5cdFx0Zm9yICh2YXIga2V5IGluIHRoaXMuX2RpcnR5KSB7XG5cdFx0XHR0aGlzLl9kcmF3KGtleSwgdHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0dGhpcy5fZGlydHkgPSBmYWxzZTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFdoYXQgdG8gZHJhd1xuICogQHBhcmFtIHtib29sfSBjbGVhckJlZm9yZSBJcyBpdCBuZWNlc3NhcnkgdG8gY2xlYW4gYmVmb3JlP1xuICovXG5ST1QuRGlzcGxheS5wcm90b3R5cGUuX2RyYXcgPSBmdW5jdGlvbihrZXksIGNsZWFyQmVmb3JlKSB7XG5cdHZhciBkYXRhID0gdGhpcy5fZGF0YVtrZXldO1xuXHRpZiAoZGF0YVs0XSAhPSB0aGlzLl9vcHRpb25zLmJnKSB7IGNsZWFyQmVmb3JlID0gdHJ1ZTsgfVxuXG5cdHRoaXMuX2JhY2tlbmQuZHJhdyhkYXRhLCBjbGVhckJlZm9yZSk7XG59XG4vKipcbiAqIEBjbGFzcyBBYnN0cmFjdCBkaXNwbGF5IGJhY2tlbmQgbW9kdWxlXG4gKiBAcHJpdmF0ZVxuICovXG5ST1QuRGlzcGxheS5CYWNrZW5kID0gZnVuY3Rpb24oY29udGV4dCkge1xuXHR0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbn1cblxuUk9ULkRpc3BsYXkuQmFja2VuZC5wcm90b3R5cGUuY29tcHV0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbn1cblxuUk9ULkRpc3BsYXkuQmFja2VuZC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGRhdGEsIGNsZWFyQmVmb3JlKSB7XG59XG5cblJPVC5EaXNwbGF5LkJhY2tlbmQucHJvdG90eXBlLmNvbXB1dGVTaXplID0gZnVuY3Rpb24oYXZhaWxXaWR0aCwgYXZhaWxIZWlnaHQpIHtcbn1cblxuUk9ULkRpc3BsYXkuQmFja2VuZC5wcm90b3R5cGUuY29tcHV0ZUZvbnRTaXplID0gZnVuY3Rpb24oYXZhaWxXaWR0aCwgYXZhaWxIZWlnaHQpIHtcbn1cblxuUk9ULkRpc3BsYXkuQmFja2VuZC5wcm90b3R5cGUuZXZlbnRUb1Bvc2l0aW9uID0gZnVuY3Rpb24oeCwgeSkge1xufVxuLyoqXG4gKiBAY2xhc3MgUmVjdGFuZ3VsYXIgYmFja2VuZFxuICogQHByaXZhdGVcbiAqL1xuUk9ULkRpc3BsYXkuUmVjdCA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcblx0Uk9ULkRpc3BsYXkuQmFja2VuZC5jYWxsKHRoaXMsIGNvbnRleHQpO1xuXHRcblx0dGhpcy5fc3BhY2luZ1ggPSAwO1xuXHR0aGlzLl9zcGFjaW5nWSA9IDA7XG5cdHRoaXMuX2NhbnZhc0NhY2hlID0ge307XG5cdHRoaXMuX29wdGlvbnMgPSB7fTtcbn1cblJPVC5EaXNwbGF5LlJlY3QuZXh0ZW5kKFJPVC5EaXNwbGF5LkJhY2tlbmQpO1xuXG5ST1QuRGlzcGxheS5SZWN0LmNhY2hlID0gZmFsc2U7XG5cblJPVC5EaXNwbGF5LlJlY3QucHJvdG90eXBlLmNvbXB1dGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cdHRoaXMuX2NhbnZhc0NhY2hlID0ge307XG5cdHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xuXG5cdHZhciBjaGFyV2lkdGggPSBNYXRoLmNlaWwodGhpcy5fY29udGV4dC5tZWFzdXJlVGV4dChcIldcIikud2lkdGgpO1xuXHR0aGlzLl9zcGFjaW5nWCA9IE1hdGguY2VpbChvcHRpb25zLnNwYWNpbmcgKiBjaGFyV2lkdGgpO1xuXHR0aGlzLl9zcGFjaW5nWSA9IE1hdGguY2VpbChvcHRpb25zLnNwYWNpbmcgKiBvcHRpb25zLmZvbnRTaXplKTtcblx0dGhpcy5fY29udGV4dC5jYW52YXMud2lkdGggPSBvcHRpb25zLndpZHRoICogdGhpcy5fc3BhY2luZ1g7XG5cdHRoaXMuX2NvbnRleHQuY2FudmFzLmhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0ICogdGhpcy5fc3BhY2luZ1k7XG59XG5cblJPVC5EaXNwbGF5LlJlY3QucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihkYXRhLCBjbGVhckJlZm9yZSkge1xuXHRpZiAodGhpcy5jb25zdHJ1Y3Rvci5jYWNoZSkge1xuXHRcdHRoaXMuX2RyYXdXaXRoQ2FjaGUoZGF0YSwgY2xlYXJCZWZvcmUpO1xuXHR9IGVsc2Uge1xuXHRcdHRoaXMuX2RyYXdOb0NhY2hlKGRhdGEsIGNsZWFyQmVmb3JlKTtcblx0fVxufVxuXG5ST1QuRGlzcGxheS5SZWN0LnByb3RvdHlwZS5fZHJhd1dpdGhDYWNoZSA9IGZ1bmN0aW9uKGRhdGEsIGNsZWFyQmVmb3JlKSB7XG5cdHZhciB4ID0gZGF0YVswXTtcblx0dmFyIHkgPSBkYXRhWzFdO1xuXHR2YXIgY2ggPSBkYXRhWzJdO1xuXHR2YXIgZmcgPSBkYXRhWzNdO1xuXHR2YXIgYmcgPSBkYXRhWzRdO1xuXG5cdHZhciBoYXNoID0gXCJcIitjaCtmZytiZztcblx0aWYgKGhhc2ggaW4gdGhpcy5fY2FudmFzQ2FjaGUpIHtcblx0XHR2YXIgY2FudmFzID0gdGhpcy5fY2FudmFzQ2FjaGVbaGFzaF07XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGIgPSB0aGlzLl9vcHRpb25zLmJvcmRlcjtcblx0XHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcblx0XHR2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcblx0XHRjYW52YXMud2lkdGggPSB0aGlzLl9zcGFjaW5nWDtcblx0XHRjYW52YXMuaGVpZ2h0ID0gdGhpcy5fc3BhY2luZ1k7XG5cdFx0Y3R4LmZpbGxTdHlsZSA9IGJnO1xuXHRcdGN0eC5maWxsUmVjdChiLCBiLCBjYW52YXMud2lkdGgtYiwgY2FudmFzLmhlaWdodC1iKTtcblx0XHRcblx0XHRpZiAoY2gpIHtcblx0XHRcdGN0eC5maWxsU3R5bGUgPSBmZztcblx0XHRcdGN0eC5mb250ID0gdGhpcy5fY29udGV4dC5mb250O1xuXHRcdFx0Y3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XG5cdFx0XHRjdHgudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcblxuXHRcdFx0dmFyIGNoYXJzID0gW10uY29uY2F0KGNoKTtcblx0XHRcdGZvciAodmFyIGk9MDtpPGNoYXJzLmxlbmd0aDtpKyspIHtcblx0XHRcdFx0Y3R4LmZpbGxUZXh0KGNoYXJzW2ldLCB0aGlzLl9zcGFjaW5nWC8yLCB0aGlzLl9zcGFjaW5nWS8yKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5fY2FudmFzQ2FjaGVbaGFzaF0gPSBjYW52YXM7XG5cdH1cblx0XG5cdHRoaXMuX2NvbnRleHQuZHJhd0ltYWdlKGNhbnZhcywgeCp0aGlzLl9zcGFjaW5nWCwgeSp0aGlzLl9zcGFjaW5nWSk7XG59XG5cblJPVC5EaXNwbGF5LlJlY3QucHJvdG90eXBlLl9kcmF3Tm9DYWNoZSA9IGZ1bmN0aW9uKGRhdGEsIGNsZWFyQmVmb3JlKSB7XG5cdHZhciB4ID0gZGF0YVswXTtcblx0dmFyIHkgPSBkYXRhWzFdO1xuXHR2YXIgY2ggPSBkYXRhWzJdO1xuXHR2YXIgZmcgPSBkYXRhWzNdO1xuXHR2YXIgYmcgPSBkYXRhWzRdO1xuXG5cdGlmIChjbGVhckJlZm9yZSkgeyBcblx0XHR2YXIgYiA9IHRoaXMuX29wdGlvbnMuYm9yZGVyO1xuXHRcdHRoaXMuX2NvbnRleHQuZmlsbFN0eWxlID0gYmc7XG5cdFx0dGhpcy5fY29udGV4dC5maWxsUmVjdCh4KnRoaXMuX3NwYWNpbmdYICsgYiwgeSp0aGlzLl9zcGFjaW5nWSArIGIsIHRoaXMuX3NwYWNpbmdYIC0gYiwgdGhpcy5fc3BhY2luZ1kgLSBiKTtcblx0fVxuXHRcblx0aWYgKCFjaCkgeyByZXR1cm47IH1cblxuXHR0aGlzLl9jb250ZXh0LmZpbGxTdHlsZSA9IGZnO1xuXG5cdHZhciBjaGFycyA9IFtdLmNvbmNhdChjaCk7XG5cdGZvciAodmFyIGk9MDtpPGNoYXJzLmxlbmd0aDtpKyspIHtcblx0XHR0aGlzLl9jb250ZXh0LmZpbGxUZXh0KGNoYXJzW2ldLCAoeCswLjUpICogdGhpcy5fc3BhY2luZ1gsICh5KzAuNSkgKiB0aGlzLl9zcGFjaW5nWSk7XG5cdH1cbn1cblxuUk9ULkRpc3BsYXkuUmVjdC5wcm90b3R5cGUuY29tcHV0ZVNpemUgPSBmdW5jdGlvbihhdmFpbFdpZHRoLCBhdmFpbEhlaWdodCkge1xuXHR2YXIgd2lkdGggPSBNYXRoLmZsb29yKGF2YWlsV2lkdGggLyB0aGlzLl9zcGFjaW5nWCk7XG5cdHZhciBoZWlnaHQgPSBNYXRoLmZsb29yKGF2YWlsSGVpZ2h0IC8gdGhpcy5fc3BhY2luZ1kpO1xuXHRyZXR1cm4gW3dpZHRoLCBoZWlnaHRdO1xufVxuXG5ST1QuRGlzcGxheS5SZWN0LnByb3RvdHlwZS5jb21wdXRlRm9udFNpemUgPSBmdW5jdGlvbihhdmFpbFdpZHRoLCBhdmFpbEhlaWdodCkge1xuXHR2YXIgYm94V2lkdGggPSBNYXRoLmZsb29yKGF2YWlsV2lkdGggLyB0aGlzLl9vcHRpb25zLndpZHRoKTtcblx0dmFyIGJveEhlaWdodCA9IE1hdGguZmxvb3IoYXZhaWxIZWlnaHQgLyB0aGlzLl9vcHRpb25zLmhlaWdodCk7XG5cblx0LyogY29tcHV0ZSBjaGFyIHJhdGlvICovXG5cdHZhciBvbGRGb250ID0gdGhpcy5fY29udGV4dC5mb250O1xuXHR0aGlzLl9jb250ZXh0LmZvbnQgPSBcIjEwMHB4IFwiICsgdGhpcy5fb3B0aW9ucy5mb250RmFtaWx5O1xuXHR2YXIgd2lkdGggPSBNYXRoLmNlaWwodGhpcy5fY29udGV4dC5tZWFzdXJlVGV4dChcIldcIikud2lkdGgpO1xuXHR0aGlzLl9jb250ZXh0LmZvbnQgPSBvbGRGb250O1xuXHR2YXIgcmF0aW8gPSB3aWR0aCAvIDEwMDtcblx0XHRcblx0dmFyIHdpZHRoRnJhY3Rpb24gPSByYXRpbyAqIGJveEhlaWdodCAvIGJveFdpZHRoO1xuXHRpZiAod2lkdGhGcmFjdGlvbiA+IDEpIHsgLyogdG9vIHdpZGUgd2l0aCBjdXJyZW50IGFzcGVjdCByYXRpbyAqL1xuXHRcdGJveEhlaWdodCA9IE1hdGguZmxvb3IoYm94SGVpZ2h0IC8gd2lkdGhGcmFjdGlvbik7XG5cdH1cblx0cmV0dXJuIE1hdGguZmxvb3IoYm94SGVpZ2h0IC8gdGhpcy5fb3B0aW9ucy5zcGFjaW5nKTtcbn1cblxuUk9ULkRpc3BsYXkuUmVjdC5wcm90b3R5cGUuZXZlbnRUb1Bvc2l0aW9uID0gZnVuY3Rpb24oeCwgeSkge1xuXHRyZXR1cm4gW01hdGguZmxvb3IoeC90aGlzLl9zcGFjaW5nWCksIE1hdGguZmxvb3IoeS90aGlzLl9zcGFjaW5nWSldO1xufVxuLyoqXG4gKiBAY2xhc3MgSGV4YWdvbmFsIGJhY2tlbmRcbiAqIEBwcml2YXRlXG4gKi9cblJPVC5EaXNwbGF5LkhleCA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcblx0Uk9ULkRpc3BsYXkuQmFja2VuZC5jYWxsKHRoaXMsIGNvbnRleHQpO1xuXG5cdHRoaXMuX3NwYWNpbmdYID0gMDtcblx0dGhpcy5fc3BhY2luZ1kgPSAwO1xuXHR0aGlzLl9oZXhTaXplID0gMDtcblx0dGhpcy5fb3B0aW9ucyA9IHt9O1xufVxuUk9ULkRpc3BsYXkuSGV4LmV4dGVuZChST1QuRGlzcGxheS5CYWNrZW5kKTtcblxuUk9ULkRpc3BsYXkuSGV4LnByb3RvdHlwZS5jb21wdXRlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXHR0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcblxuXHR2YXIgY2hhcldpZHRoID0gTWF0aC5jZWlsKHRoaXMuX2NvbnRleHQubWVhc3VyZVRleHQoXCJXXCIpLndpZHRoKTtcblx0dGhpcy5faGV4U2l6ZSA9IE1hdGguZmxvb3Iob3B0aW9ucy5zcGFjaW5nICogKG9wdGlvbnMuZm9udFNpemUgKyBjaGFyV2lkdGgvTWF0aC5zcXJ0KDMpKSAvIDIpO1xuXHR0aGlzLl9zcGFjaW5nWCA9IHRoaXMuX2hleFNpemUgKiBNYXRoLnNxcnQoMykgLyAyO1xuXHR0aGlzLl9zcGFjaW5nWSA9IHRoaXMuX2hleFNpemUgKiAxLjU7XG5cdHRoaXMuX2NvbnRleHQuY2FudmFzLndpZHRoID0gTWF0aC5jZWlsKCAob3B0aW9ucy53aWR0aCArIDEpICogdGhpcy5fc3BhY2luZ1ggKTtcblx0dGhpcy5fY29udGV4dC5jYW52YXMuaGVpZ2h0ID0gTWF0aC5jZWlsKCAob3B0aW9ucy5oZWlnaHQgLSAxKSAqIHRoaXMuX3NwYWNpbmdZICsgMip0aGlzLl9oZXhTaXplICk7XG59XG5cblJPVC5EaXNwbGF5LkhleC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGRhdGEsIGNsZWFyQmVmb3JlKSB7XG5cdHZhciB4ID0gZGF0YVswXTtcblx0dmFyIHkgPSBkYXRhWzFdO1xuXHR2YXIgY2ggPSBkYXRhWzJdO1xuXHR2YXIgZmcgPSBkYXRhWzNdO1xuXHR2YXIgYmcgPSBkYXRhWzRdO1xuXG5cdHZhciBjeCA9ICh4KzEpICogdGhpcy5fc3BhY2luZ1g7XG5cdHZhciBjeSA9IHkgKiB0aGlzLl9zcGFjaW5nWSArIHRoaXMuX2hleFNpemU7XG5cblx0aWYgKGNsZWFyQmVmb3JlKSB7IFxuXHRcdHRoaXMuX2NvbnRleHQuZmlsbFN0eWxlID0gYmc7XG5cdFx0dGhpcy5fZmlsbChjeCwgY3kpO1xuXHR9XG5cdFxuXHRpZiAoIWNoKSB7IHJldHVybjsgfVxuXG5cdHRoaXMuX2NvbnRleHQuZmlsbFN0eWxlID0gZmc7XG5cblx0dmFyIGNoYXJzID0gW10uY29uY2F0KGNoKTtcblx0Zm9yICh2YXIgaT0wO2k8Y2hhcnMubGVuZ3RoO2krKykge1xuXHRcdHRoaXMuX2NvbnRleHQuZmlsbFRleHQoY2hhcnNbaV0sIGN4LCBjeSk7XG5cdH1cbn1cblxuXG5ST1QuRGlzcGxheS5IZXgucHJvdG90eXBlLmNvbXB1dGVTaXplID0gZnVuY3Rpb24oYXZhaWxXaWR0aCwgYXZhaWxIZWlnaHQpIHtcblx0dmFyIHdpZHRoID0gTWF0aC5mbG9vcihhdmFpbFdpZHRoIC8gdGhpcy5fc3BhY2luZ1gpIC0gMTtcblx0dmFyIGhlaWdodCA9IE1hdGguZmxvb3IoKGF2YWlsSGVpZ2h0IC0gMip0aGlzLl9oZXhTaXplKSAvIHRoaXMuX3NwYWNpbmdZICsgMSk7XG5cdHJldHVybiBbd2lkdGgsIGhlaWdodF07XG59XG5cblJPVC5EaXNwbGF5LkhleC5wcm90b3R5cGUuY29tcHV0ZUZvbnRTaXplID0gZnVuY3Rpb24oYXZhaWxXaWR0aCwgYXZhaWxIZWlnaHQpIHtcblx0dmFyIGhleFNpemVXaWR0aCA9IDIqYXZhaWxXaWR0aCAvICgodGhpcy5fb3B0aW9ucy53aWR0aCsxKSAqIE1hdGguc3FydCgzKSkgLSAxO1xuXHR2YXIgaGV4U2l6ZUhlaWdodCA9IGF2YWlsSGVpZ2h0IC8gKDIgKyAxLjUqKHRoaXMuX29wdGlvbnMuaGVpZ2h0LTEpKTtcblx0dmFyIGhleFNpemUgPSBNYXRoLm1pbihoZXhTaXplV2lkdGgsIGhleFNpemVIZWlnaHQpO1xuXG5cdC8qIGNvbXB1dGUgY2hhciByYXRpbyAqL1xuXHR2YXIgb2xkRm9udCA9IHRoaXMuX2NvbnRleHQuZm9udDtcblx0dGhpcy5fY29udGV4dC5mb250ID0gXCIxMDBweCBcIiArIHRoaXMuX29wdGlvbnMuZm9udEZhbWlseTtcblx0dmFyIHdpZHRoID0gTWF0aC5jZWlsKHRoaXMuX2NvbnRleHQubWVhc3VyZVRleHQoXCJXXCIpLndpZHRoKTtcblx0dGhpcy5fY29udGV4dC5mb250ID0gb2xkRm9udDtcblx0dmFyIHJhdGlvID0gd2lkdGggLyAxMDA7XG5cblx0aGV4U2l6ZSA9IE1hdGguZmxvb3IoaGV4U2l6ZSkrMTsgLyogY2xvc2VzdCBsYXJnZXIgaGV4U2l6ZSAqL1xuXG5cdHZhciBmb250U2l6ZSA9IDIqaGV4U2l6ZSAvICh0aGlzLl9vcHRpb25zLnNwYWNpbmcgKiAoMSArIHJhdGlvIC8gTWF0aC5zcXJ0KDMpKSk7XG5cblx0LyogY2xvc2VzdCBzbWFsbGVyIGZvbnRTaXplICovXG5cdHJldHVybiBNYXRoLmNlaWwoZm9udFNpemUpLTE7XG59XG5cblJPVC5EaXNwbGF5LkhleC5wcm90b3R5cGUuZXZlbnRUb1Bvc2l0aW9uID0gZnVuY3Rpb24oeCwgeSkge1xuXHR2YXIgaGVpZ2h0ID0gdGhpcy5fY29udGV4dC5jYW52YXMuaGVpZ2h0IC8gdGhpcy5fb3B0aW9ucy5oZWlnaHQ7XG5cdHkgPSBNYXRoLmZsb29yKHkvaGVpZ2h0KTtcblx0XG5cdGlmICh5Lm1vZCgyKSkgeyAvKiBvZGQgcm93ICovXG5cdFx0eCAtPSB0aGlzLl9zcGFjaW5nWDtcblx0XHR4ID0gMSArIDIqTWF0aC5mbG9vcih4LygyKnRoaXMuX3NwYWNpbmdYKSk7XG5cdH0gZWxzZSB7XG5cdFx0eCA9IDIqTWF0aC5mbG9vcih4LygyKnRoaXMuX3NwYWNpbmdYKSk7XG5cdH1cblx0XG5cdHJldHVybiBbeCwgeV07XG59XG5cblJPVC5EaXNwbGF5LkhleC5wcm90b3R5cGUuX2ZpbGwgPSBmdW5jdGlvbihjeCwgY3kpIHtcblx0dmFyIGEgPSB0aGlzLl9oZXhTaXplO1xuXHR2YXIgYiA9IHRoaXMuX29wdGlvbnMuYm9yZGVyO1xuXHRcblx0dGhpcy5fY29udGV4dC5iZWdpblBhdGgoKTtcblx0dGhpcy5fY29udGV4dC5tb3ZlVG8oY3gsIGN5LWErYik7XG5cdHRoaXMuX2NvbnRleHQubGluZVRvKGN4ICsgdGhpcy5fc3BhY2luZ1ggLSBiLCBjeS1hLzIrYik7XG5cdHRoaXMuX2NvbnRleHQubGluZVRvKGN4ICsgdGhpcy5fc3BhY2luZ1ggLSBiLCBjeSthLzItYik7XG5cdHRoaXMuX2NvbnRleHQubGluZVRvKGN4LCBjeSthLWIpO1xuXHR0aGlzLl9jb250ZXh0LmxpbmVUbyhjeCAtIHRoaXMuX3NwYWNpbmdYICsgYiwgY3krYS8yLWIpO1xuXHR0aGlzLl9jb250ZXh0LmxpbmVUbyhjeCAtIHRoaXMuX3NwYWNpbmdYICsgYiwgY3ktYS8yK2IpO1xuXHR0aGlzLl9jb250ZXh0LmxpbmVUbyhjeCwgY3ktYStiKTtcblx0dGhpcy5fY29udGV4dC5maWxsKCk7XG59XG4vKipcbiAqIEBjbGFzcyBUaWxlIGJhY2tlbmRcbiAqIEBwcml2YXRlXG4gKi9cblJPVC5EaXNwbGF5LlRpbGUgPSBmdW5jdGlvbihjb250ZXh0KSB7XG5cdFJPVC5EaXNwbGF5LlJlY3QuY2FsbCh0aGlzLCBjb250ZXh0KTtcblx0XG5cdHRoaXMuX29wdGlvbnMgPSB7fTtcbn1cblJPVC5EaXNwbGF5LlRpbGUuZXh0ZW5kKFJPVC5EaXNwbGF5LlJlY3QpO1xuXG5ST1QuRGlzcGxheS5UaWxlLnByb3RvdHlwZS5jb21wdXRlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXHR0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcblx0dGhpcy5fY29udGV4dC5jYW52YXMud2lkdGggPSBvcHRpb25zLndpZHRoICogb3B0aW9ucy50aWxlV2lkdGg7XG5cdHRoaXMuX2NvbnRleHQuY2FudmFzLmhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0ICogb3B0aW9ucy50aWxlSGVpZ2h0O1xufVxuXG5ST1QuRGlzcGxheS5UaWxlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oZGF0YSwgY2xlYXJCZWZvcmUpIHtcblx0dmFyIHggPSBkYXRhWzBdO1xuXHR2YXIgeSA9IGRhdGFbMV07XG5cdHZhciBjaCA9IGRhdGFbMl07XG5cdHZhciBmZyA9IGRhdGFbM107XG5cdHZhciBiZyA9IGRhdGFbNF07XG5cblx0dmFyIHRpbGVXaWR0aCA9IHRoaXMuX29wdGlvbnMudGlsZVdpZHRoO1xuXHR2YXIgdGlsZUhlaWdodCA9IHRoaXMuX29wdGlvbnMudGlsZUhlaWdodDtcblxuXHRpZiAoY2xlYXJCZWZvcmUpIHtcblx0XHR2YXIgYiA9IHRoaXMuX29wdGlvbnMuYm9yZGVyO1xuXHRcdHRoaXMuX2NvbnRleHQuZmlsbFN0eWxlID0gYmc7XG5cdFx0dGhpcy5fY29udGV4dC5maWxsUmVjdCh4KnRpbGVXaWR0aCwgeSp0aWxlSGVpZ2h0LCB0aWxlV2lkdGgsIHRpbGVIZWlnaHQpO1xuXHR9XG5cblx0aWYgKCFjaCkgeyByZXR1cm47IH1cblxuXHR2YXIgY2hhcnMgPSBbXS5jb25jYXQoY2gpO1xuXHRmb3IgKHZhciBpPTA7aTxjaGFycy5sZW5ndGg7aSsrKSB7XG5cdFx0dmFyIHRpbGUgPSB0aGlzLl9vcHRpb25zLnRpbGVNYXBbY2hhcnNbaV1dO1xuXHRcdGlmICghdGlsZSkgeyB0aHJvdyBuZXcgRXJyb3IoXCJDaGFyICdcIiArIGNoYXJzW2ldICsgXCInIG5vdCBmb3VuZCBpbiB0aWxlTWFwXCIpOyB9XG5cdFx0XG5cdFx0dGhpcy5fY29udGV4dC5kcmF3SW1hZ2UoXG5cdFx0XHR0aGlzLl9vcHRpb25zLnRpbGVTZXQsXG5cdFx0XHR0aWxlWzBdLCB0aWxlWzFdLCB0aWxlV2lkdGgsIHRpbGVIZWlnaHQsXG5cdFx0XHR4KnRpbGVXaWR0aCwgeSp0aWxlSGVpZ2h0LCB0aWxlV2lkdGgsIHRpbGVIZWlnaHRcblx0XHQpO1xuXHR9XG59XG5cblJPVC5EaXNwbGF5LlRpbGUucHJvdG90eXBlLmNvbXB1dGVTaXplID0gZnVuY3Rpb24oYXZhaWxXaWR0aCwgYXZhaWxIZWlnaHQpIHtcblx0dmFyIHdpZHRoID0gTWF0aC5mbG9vcihhdmFpbFdpZHRoIC8gdGhpcy5fb3B0aW9ucy50aWxlV2lkdGgpO1xuXHR2YXIgaGVpZ2h0ID0gTWF0aC5mbG9vcihhdmFpbEhlaWdodCAvIHRoaXMuX29wdGlvbnMudGlsZUhlaWdodCk7XG5cdHJldHVybiBbd2lkdGgsIGhlaWdodF07XG59XG5cblJPVC5EaXNwbGF5LlRpbGUucHJvdG90eXBlLmNvbXB1dGVGb250U2l6ZSA9IGZ1bmN0aW9uKGF2YWlsV2lkdGgsIGF2YWlsSGVpZ2h0KSB7XG5cdHZhciB3aWR0aCA9IE1hdGguZmxvb3IoYXZhaWxXaWR0aCAvIHRoaXMuX29wdGlvbnMud2lkdGgpO1xuXHR2YXIgaGVpZ2h0ID0gTWF0aC5mbG9vcihhdmFpbEhlaWdodCAvIHRoaXMuX29wdGlvbnMuaGVpZ2h0KTtcblx0cmV0dXJuIFt3aWR0aCwgaGVpZ2h0XTtcbn1cbi8qKlxuICogQG5hbWVzcGFjZVxuICogVGhpcyBjb2RlIGlzIGFuIGltcGxlbWVudGF0aW9uIG9mIEFsZWEgYWxnb3JpdGhtOyAoQykgMjAxMCBKb2hhbm5lcyBCYWFnw7hlLlxuICogQWxlYSBpcyBsaWNlbnNlZCBhY2NvcmRpbmcgdG8gdGhlIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTUlUX0xpY2Vuc2UuXG4gKi9cblJPVC5STkcgPSB7XG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7bnVtYmVyfSBcblx0ICovXG5cdGdldFNlZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLl9zZWVkO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge251bWJlcn0gc2VlZCBTZWVkIHRoZSBudW1iZXIgZ2VuZXJhdG9yXG5cdCAqL1xuXHRzZXRTZWVkOiBmdW5jdGlvbihzZWVkKSB7XG5cdFx0c2VlZCA9IChzZWVkIDwgMSA/IDEvc2VlZCA6IHNlZWQpO1xuXG5cdFx0dGhpcy5fc2VlZCA9IHNlZWQ7XG5cdFx0dGhpcy5fczAgPSAoc2VlZCA+Pj4gMCkgKiB0aGlzLl9mcmFjO1xuXG5cdFx0c2VlZCA9IChzZWVkKjY5MDY5ICsgMSkgPj4+IDA7XG5cdFx0dGhpcy5fczEgPSBzZWVkICogdGhpcy5fZnJhYztcblxuXHRcdHNlZWQgPSAoc2VlZCo2OTA2OSArIDEpID4+PiAwO1xuXHRcdHRoaXMuX3MyID0gc2VlZCAqIHRoaXMuX2ZyYWM7XG5cblx0XHR0aGlzLl9jID0gMTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHQvKipcblx0ICogQHJldHVybnMge2Zsb2F0fSBQc2V1ZG9yYW5kb20gdmFsdWUgWzAsMSksIHVuaWZvcm1seSBkaXN0cmlidXRlZFxuXHQgKi9cblx0Z2V0VW5pZm9ybTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHQgPSAyMDkxNjM5ICogdGhpcy5fczAgKyB0aGlzLl9jICogdGhpcy5fZnJhYztcblx0XHR0aGlzLl9zMCA9IHRoaXMuX3MxO1xuXHRcdHRoaXMuX3MxID0gdGhpcy5fczI7XG5cdFx0dGhpcy5fYyA9IHQgfCAwO1xuXHRcdHRoaXMuX3MyID0gdCAtIHRoaXMuX2M7XG5cdFx0cmV0dXJuIHRoaXMuX3MyO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge2ludH0gbG93ZXJCb3VuZCBUaGUgbG93ZXIgZW5kIG9mIHRoZSByYW5nZSB0byByZXR1cm4gYSB2YWx1ZSBmcm9tLCBpbmNsdXNpdmVcblx0ICogQHBhcmFtIHtpbnR9IHVwcGVyQm91bmQgVGhlIHVwcGVyIGVuZCBvZiB0aGUgcmFuZ2UgdG8gcmV0dXJuIGEgdmFsdWUgZnJvbSwgaW5jbHVzaXZlXG5cdCAqIEByZXR1cm5zIHtpbnR9IFBzZXVkb3JhbmRvbSB2YWx1ZSBbbG93ZXJCb3VuZCwgdXBwZXJCb3VuZF0sIHVzaW5nIFJPVC5STkcuZ2V0VW5pZm9ybSgpIHRvIGRpc3RyaWJ1dGUgdGhlIHZhbHVlXG5cdCAqL1xuXHRnZXRVbmlmb3JtSW50OiBmdW5jdGlvbihsb3dlckJvdW5kLCB1cHBlckJvdW5kKSB7XG5cdFx0dmFyIG1heCA9IE1hdGgubWF4KGxvd2VyQm91bmQsIHVwcGVyQm91bmQpO1xuXHRcdHZhciBtaW4gPSBNYXRoLm1pbihsb3dlckJvdW5kLCB1cHBlckJvdW5kKTtcblx0XHRyZXR1cm4gTWF0aC5mbG9vcih0aGlzLmdldFVuaWZvcm0oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IFttZWFuPTBdIE1lYW4gdmFsdWVcblx0ICogQHBhcmFtIHtmbG9hdH0gW3N0ZGRldj0xXSBTdGFuZGFyZCBkZXZpYXRpb24uIH45NSUgb2YgdGhlIGFic29sdXRlIHZhbHVlcyB3aWxsIGJlIGxvd2VyIHRoYW4gMipzdGRkZXYuXG5cdCAqIEByZXR1cm5zIHtmbG9hdH0gQSBub3JtYWxseSBkaXN0cmlidXRlZCBwc2V1ZG9yYW5kb20gdmFsdWVcblx0ICovXG5cdGdldE5vcm1hbDogZnVuY3Rpb24obWVhbiwgc3RkZGV2KSB7XG5cdFx0ZG8ge1xuXHRcdFx0dmFyIHUgPSAyKnRoaXMuZ2V0VW5pZm9ybSgpLTE7XG5cdFx0XHR2YXIgdiA9IDIqdGhpcy5nZXRVbmlmb3JtKCktMTtcblx0XHRcdHZhciByID0gdSp1ICsgdip2O1xuXHRcdH0gd2hpbGUgKHIgPiAxIHx8IHIgPT0gMCk7XG5cblx0XHR2YXIgZ2F1c3MgPSB1ICogTWF0aC5zcXJ0KC0yKk1hdGgubG9nKHIpL3IpO1xuXHRcdHJldHVybiAobWVhbiB8fCAwKSArIGdhdXNzKihzdGRkZXYgfHwgMSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEByZXR1cm5zIHtpbnR9IFBzZXVkb3JhbmRvbSB2YWx1ZSBbMSwxMDBdIGluY2x1c2l2ZSwgdW5pZm9ybWx5IGRpc3RyaWJ1dGVkXG5cdCAqL1xuXHRnZXRQZXJjZW50YWdlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gMSArIE1hdGguZmxvb3IodGhpcy5nZXRVbmlmb3JtKCkqMTAwKTtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gZGF0YSBrZXk9d2hhdGV2ZXIsIHZhbHVlPXdlaWdodCAocmVsYXRpdmUgcHJvYmFiaWxpdHkpXG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9IHdoYXRldmVyXG5cdCAqL1xuXHRnZXRXZWlnaHRlZFZhbHVlOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0dmFyIGF2YWlsID0gW107XG5cdFx0dmFyIHRvdGFsID0gMDtcblx0XHRcblx0XHRmb3IgKHZhciBpZCBpbiBkYXRhKSB7XG5cdFx0XHR0b3RhbCArPSBkYXRhW2lkXTtcblx0XHR9XG5cdFx0dmFyIHJhbmRvbSA9IE1hdGguZmxvb3IodGhpcy5nZXRVbmlmb3JtKCkqdG90YWwpO1xuXHRcdFxuXHRcdHZhciBwYXJ0ID0gMDtcblx0XHRmb3IgKHZhciBpZCBpbiBkYXRhKSB7XG5cdFx0XHRwYXJ0ICs9IGRhdGFbaWRdO1xuXHRcdFx0aWYgKHJhbmRvbSA8IHBhcnQpIHsgcmV0dXJuIGlkOyB9XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBudWxsO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgUk5HIHN0YXRlLiBVc2VmdWwgZm9yIHN0b3JpbmcgdGhlIHN0YXRlIGFuZCByZS1zZXR0aW5nIGl0IHZpYSBzZXRTdGF0ZS5cblx0ICogQHJldHVybnMgez99IEludGVybmFsIHN0YXRlXG5cdCAqL1xuXHRnZXRTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIFt0aGlzLl9zMCwgdGhpcy5fczEsIHRoaXMuX3MyLCB0aGlzLl9jXTtcblx0fSxcblxuXHQvKipcblx0ICogU2V0IGEgcHJldmlvdXNseSByZXRyaWV2ZWQgc3RhdGUuXG5cdCAqIEBwYXJhbSB7P30gc3RhdGVcblx0ICovXG5cdHNldFN0YXRlOiBmdW5jdGlvbihzdGF0ZSkge1xuXHRcdHRoaXMuX3MwID0gc3RhdGVbMF07XG5cdFx0dGhpcy5fczEgPSBzdGF0ZVsxXTtcblx0XHR0aGlzLl9zMiA9IHN0YXRlWzJdO1xuXHRcdHRoaXMuX2MgID0gc3RhdGVbM107XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0X3MwOiAwLFxuXHRfczE6IDAsXG5cdF9zMjogMCxcblx0X2M6IDAsXG5cdF9mcmFjOiAyLjMyODMwNjQzNjUzODY5NjNlLTEwIC8qIDJeLTMyICovXG59XG5cblJPVC5STkcuc2V0U2VlZChEYXRlLm5vdygpKTtcbi8qKlxuICogQGNsYXNzIChNYXJrb3YgcHJvY2VzcyktYmFzZWQgc3RyaW5nIGdlbmVyYXRvci4gXG4gKiBDb3BpZWQgZnJvbSBhIDxhIGhyZWY9XCJodHRwOi8vd3d3LnJvZ3VlYmFzaW4ucm9ndWVsaWtlZGV2ZWxvcG1lbnQub3JnL2luZGV4LnBocD90aXRsZT1OYW1lc19mcm9tX2FfaGlnaF9vcmRlcl9NYXJrb3ZfUHJvY2Vzc19hbmRfYV9zaW1wbGlmaWVkX0thdHpfYmFjay1vZmZfc2NoZW1lXCI+Um9ndWVCYXNpbiBhcnRpY2xlPC9hPi4gXG4gKiBPZmZlcnMgY29uZmlndXJhYmxlIG9yZGVyIGFuZCBwcmlvci5cbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cbiAqIEBwYXJhbSB7Ym9vbH0gW29wdGlvbnMud29yZHM9ZmFsc2VdIFVzZSB3b3JkIG1vZGU/XG4gKiBAcGFyYW0ge2ludH0gW29wdGlvbnMub3JkZXI9M11cbiAqIEBwYXJhbSB7ZmxvYXR9IFtvcHRpb25zLnByaW9yPTAuMDAxXVxuICovXG5ST1QuU3RyaW5nR2VuZXJhdG9yID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXHR0aGlzLl9vcHRpb25zID0ge1xuXHRcdHdvcmRzOiBmYWxzZSxcblx0XHRvcmRlcjogMyxcblx0XHRwcmlvcjogMC4wMDFcblx0fVxuXHRmb3IgKHZhciBwIGluIG9wdGlvbnMpIHsgdGhpcy5fb3B0aW9uc1twXSA9IG9wdGlvbnNbcF07IH1cblxuXHR0aGlzLl9ib3VuZGFyeSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoMCk7XG5cdHRoaXMuX3N1ZmZpeCA9IHRoaXMuX2JvdW5kYXJ5O1xuXHR0aGlzLl9wcmVmaXggPSBbXTtcblx0Zm9yICh2YXIgaT0wO2k8dGhpcy5fb3B0aW9ucy5vcmRlcjtpKyspIHsgdGhpcy5fcHJlZml4LnB1c2godGhpcy5fYm91bmRhcnkpOyB9XG5cblx0dGhpcy5fcHJpb3JWYWx1ZXMgPSB7fTtcblx0dGhpcy5fcHJpb3JWYWx1ZXNbdGhpcy5fYm91bmRhcnldID0gdGhpcy5fb3B0aW9ucy5wcmlvcjtcblxuXHR0aGlzLl9kYXRhID0ge307XG59XG5cbi8qKlxuICogUmVtb3ZlIGFsbCBsZWFybmluZyBkYXRhXG4gKi9cblJPVC5TdHJpbmdHZW5lcmF0b3IucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuX2RhdGEgPSB7fTtcblx0dGhpcy5fcHJpb3JWYWx1ZXMgPSB7fTtcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBHZW5lcmF0ZWQgc3RyaW5nXG4gKi9cblJPVC5TdHJpbmdHZW5lcmF0b3IucHJvdG90eXBlLmdlbmVyYXRlID0gZnVuY3Rpb24oKSB7XG5cdHZhciByZXN1bHQgPSBbdGhpcy5fc2FtcGxlKHRoaXMuX3ByZWZpeCldO1xuXHR3aGlsZSAocmVzdWx0W3Jlc3VsdC5sZW5ndGgtMV0gIT0gdGhpcy5fYm91bmRhcnkpIHtcblx0XHRyZXN1bHQucHVzaCh0aGlzLl9zYW1wbGUocmVzdWx0KSk7XG5cdH1cblx0cmV0dXJuIHRoaXMuX2pvaW4ocmVzdWx0LnNsaWNlKDAsIC0xKSk7XG59XG5cbi8qKlxuICogT2JzZXJ2ZSAobGVhcm4pIGEgc3RyaW5nIGZyb20gYSB0cmFpbmluZyBzZXRcbiAqL1xuUk9ULlN0cmluZ0dlbmVyYXRvci5wcm90b3R5cGUub2JzZXJ2ZSA9IGZ1bmN0aW9uKHN0cmluZykge1xuXHR2YXIgdG9rZW5zID0gdGhpcy5fc3BsaXQoc3RyaW5nKTtcblxuXHRmb3IgKHZhciBpPTA7IGk8dG9rZW5zLmxlbmd0aDsgaSsrKSB7XG5cdFx0dGhpcy5fcHJpb3JWYWx1ZXNbdG9rZW5zW2ldXSA9IHRoaXMuX29wdGlvbnMucHJpb3I7XG5cdH1cblxuXHR0b2tlbnMgPSB0aGlzLl9wcmVmaXguY29uY2F0KHRva2VucykuY29uY2F0KHRoaXMuX3N1ZmZpeCk7IC8qIGFkZCBib3VuZGFyeSBzeW1ib2xzICovXG5cblx0Zm9yICh2YXIgaT10aGlzLl9vcHRpb25zLm9yZGVyOyBpPHRva2Vucy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBjb250ZXh0ID0gdG9rZW5zLnNsaWNlKGktdGhpcy5fb3B0aW9ucy5vcmRlciwgaSk7XG5cdFx0dmFyIGV2ZW50ID0gdG9rZW5zW2ldO1xuXHRcdGZvciAodmFyIGo9MDsgajxjb250ZXh0Lmxlbmd0aDsgaisrKSB7XG5cdFx0XHR2YXIgc3ViY29udGV4dCA9IGNvbnRleHQuc2xpY2Uoaik7XG5cdFx0XHR0aGlzLl9vYnNlcnZlRXZlbnQoc3ViY29udGV4dCwgZXZlbnQpO1xuXHRcdH1cblx0fVxufVxuXG5ST1QuU3RyaW5nR2VuZXJhdG9yLnByb3RvdHlwZS5nZXRTdGF0cyA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgcGFydHMgPSBbXTtcblxuXHR2YXIgcHJpb3JDb3VudCA9IDA7XG5cdGZvciAodmFyIHAgaW4gdGhpcy5fcHJpb3JWYWx1ZXMpIHsgcHJpb3JDb3VudCsrOyB9XG5cdHByaW9yQ291bnQtLTsgLyogYm91bmRhcnkgKi9cblx0cGFydHMucHVzaChcImRpc3RpbmN0IHNhbXBsZXM6IFwiICsgcHJpb3JDb3VudCk7XG5cblx0dmFyIGRhdGFDb3VudCA9IDA7XG5cdHZhciBldmVudENvdW50ID0gMDtcblx0Zm9yICh2YXIgcCBpbiB0aGlzLl9kYXRhKSB7IFxuXHRcdGRhdGFDb3VudCsrOyBcblx0XHRmb3IgKHZhciBrZXkgaW4gdGhpcy5fZGF0YVtwXSkge1xuXHRcdFx0ZXZlbnRDb3VudCsrO1xuXHRcdH1cblx0fVxuXHRwYXJ0cy5wdXNoKFwiZGljdGlvbmFyeSBzaXplIChjb250ZXh0cyk6IFwiICsgZGF0YUNvdW50KTtcblx0cGFydHMucHVzaChcImRpY3Rpb25hcnkgc2l6ZSAoZXZlbnRzKTogXCIgKyBldmVudENvdW50KTtcblxuXHRyZXR1cm4gcGFydHMuam9pbihcIiwgXCIpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfVxuICogQHJldHVybnMge3N0cmluZ1tdfVxuICovXG5ST1QuU3RyaW5nR2VuZXJhdG9yLnByb3RvdHlwZS5fc3BsaXQgPSBmdW5jdGlvbihzdHIpIHtcblx0cmV0dXJuIHN0ci5zcGxpdCh0aGlzLl9vcHRpb25zLndvcmRzID8gL1xccysvIDogXCJcIik7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmdbXX1cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFxuICovXG5ST1QuU3RyaW5nR2VuZXJhdG9yLnByb3RvdHlwZS5fam9pbiA9IGZ1bmN0aW9uKGFycikge1xuXHRyZXR1cm4gYXJyLmpvaW4odGhpcy5fb3B0aW9ucy53b3JkcyA/IFwiIFwiIDogXCJcIik7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmdbXX0gY29udGV4dFxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50XG4gKi9cblJPVC5TdHJpbmdHZW5lcmF0b3IucHJvdG90eXBlLl9vYnNlcnZlRXZlbnQgPSBmdW5jdGlvbihjb250ZXh0LCBldmVudCkge1xuXHR2YXIga2V5ID0gdGhpcy5fam9pbihjb250ZXh0KTtcblx0aWYgKCEoa2V5IGluIHRoaXMuX2RhdGEpKSB7IHRoaXMuX2RhdGFba2V5XSA9IHt9OyB9XG5cdHZhciBkYXRhID0gdGhpcy5fZGF0YVtrZXldO1xuXG5cdGlmICghKGV2ZW50IGluIGRhdGEpKSB7IGRhdGFbZXZlbnRdID0gMDsgfVxuXHRkYXRhW2V2ZW50XSsrO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nW119XG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5ST1QuU3RyaW5nR2VuZXJhdG9yLnByb3RvdHlwZS5fc2FtcGxlID0gZnVuY3Rpb24oY29udGV4dCkge1xuXHRjb250ZXh0ID0gdGhpcy5fYmFja29mZihjb250ZXh0KTtcblx0dmFyIGtleSA9IHRoaXMuX2pvaW4oY29udGV4dCk7XG5cdHZhciBkYXRhID0gdGhpcy5fZGF0YVtrZXldO1xuXG5cdHZhciBhdmFpbGFibGUgPSB7fTtcblxuXHRpZiAodGhpcy5fb3B0aW9ucy5wcmlvcikge1xuXHRcdGZvciAodmFyIGV2ZW50IGluIHRoaXMuX3ByaW9yVmFsdWVzKSB7IGF2YWlsYWJsZVtldmVudF0gPSB0aGlzLl9wcmlvclZhbHVlc1tldmVudF07IH1cblx0XHRmb3IgKHZhciBldmVudCBpbiBkYXRhKSB7IGF2YWlsYWJsZVtldmVudF0gKz0gZGF0YVtldmVudF07IH1cblx0fSBlbHNlIHsgXG5cdFx0YXZhaWxhYmxlID0gZGF0YTtcblx0fVxuXG5cdHJldHVybiB0aGlzLl9waWNrUmFuZG9tKGF2YWlsYWJsZSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmdbXX1cbiAqIEByZXR1cm5zIHtzdHJpbmdbXX1cbiAqL1xuUk9ULlN0cmluZ0dlbmVyYXRvci5wcm90b3R5cGUuX2JhY2tvZmYgPSBmdW5jdGlvbihjb250ZXh0KSB7XG5cdGlmIChjb250ZXh0Lmxlbmd0aCA+IHRoaXMuX29wdGlvbnMub3JkZXIpIHtcblx0XHRjb250ZXh0ID0gY29udGV4dC5zbGljZSgtdGhpcy5fb3B0aW9ucy5vcmRlcik7XG5cdH0gZWxzZSBpZiAoY29udGV4dC5sZW5ndGggPCB0aGlzLl9vcHRpb25zLm9yZGVyKSB7XG5cdFx0Y29udGV4dCA9IHRoaXMuX3ByZWZpeC5zbGljZSgwLCB0aGlzLl9vcHRpb25zLm9yZGVyIC0gY29udGV4dC5sZW5ndGgpLmNvbmNhdChjb250ZXh0KTtcblx0fVxuXG5cdHdoaWxlICghKHRoaXMuX2pvaW4oY29udGV4dCkgaW4gdGhpcy5fZGF0YSkgJiYgY29udGV4dC5sZW5ndGggPiAwKSB7IGNvbnRleHQgPSBjb250ZXh0LnNsaWNlKDEpOyB9XG5cblx0cmV0dXJuIGNvbnRleHQ7XG59XG5cblxuUk9ULlN0cmluZ0dlbmVyYXRvci5wcm90b3R5cGUuX3BpY2tSYW5kb20gPSBmdW5jdGlvbihkYXRhKSB7XG5cdHZhciB0b3RhbCA9IDA7XG5cdFxuXHRmb3IgKHZhciBpZCBpbiBkYXRhKSB7XG5cdFx0dG90YWwgKz0gZGF0YVtpZF07XG5cdH1cblx0dmFyIHJhbmRvbSA9IFJPVC5STkcuZ2V0VW5pZm9ybSgpKnRvdGFsO1xuXHRcblx0dmFyIHBhcnQgPSAwO1xuXHRmb3IgKHZhciBpZCBpbiBkYXRhKSB7XG5cdFx0cGFydCArPSBkYXRhW2lkXTtcblx0XHRpZiAocmFuZG9tIDwgcGFydCkgeyByZXR1cm4gaWQ7IH1cblx0fVxufVxuLyoqXG4gKiBAY2xhc3MgR2VuZXJpYyBldmVudCBxdWV1ZTogc3RvcmVzIGV2ZW50cyBhbmQgcmV0cmlldmVzIHRoZW0gYmFzZWQgb24gdGhlaXIgdGltZVxuICovXG5ST1QuRXZlbnRRdWV1ZSA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl90aW1lID0gMDtcblx0dGhpcy5fZXZlbnRzID0gW107XG5cdHRoaXMuX2V2ZW50VGltZXMgPSBbXTtcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBFbGFwc2VkIHRpbWVcbiAqL1xuUk9ULkV2ZW50UXVldWUucHJvdG90eXBlLmdldFRpbWUgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuX3RpbWU7XG59XG5cbi8qKlxuICogQ2xlYXIgYWxsIHNjaGVkdWxlZCBldmVudHNcbiAqL1xuUk9ULkV2ZW50UXVldWUucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuX2V2ZW50cyA9IFtdO1xuXHR0aGlzLl9ldmVudFRpbWVzID0gW107XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7P30gZXZlbnRcbiAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lXG4gKi9cblJPVC5FdmVudFF1ZXVlLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihldmVudCwgdGltZSkge1xuXHR2YXIgaW5kZXggPSB0aGlzLl9ldmVudHMubGVuZ3RoO1xuXHRmb3IgKHZhciBpPTA7aTx0aGlzLl9ldmVudFRpbWVzLmxlbmd0aDtpKyspIHtcblx0XHRpZiAodGhpcy5fZXZlbnRUaW1lc1tpXSA+IHRpbWUpIHtcblx0XHRcdGluZGV4ID0gaTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHRoaXMuX2V2ZW50cy5zcGxpY2UoaW5kZXgsIDAsIGV2ZW50KTtcblx0dGhpcy5fZXZlbnRUaW1lcy5zcGxpY2UoaW5kZXgsIDAsIHRpbWUpO1xufVxuXG4vKipcbiAqIExvY2F0ZXMgdGhlIG5lYXJlc3QgZXZlbnQsIGFkdmFuY2VzIHRpbWUgaWYgbmVjZXNzYXJ5LiBSZXR1cm5zIHRoYXQgZXZlbnQgYW5kIHJlbW92ZXMgaXQgZnJvbSB0aGUgcXVldWUuXG4gKiBAcmV0dXJucyB7PyB8fCBudWxsfSBUaGUgZXZlbnQgcHJldmlvdXNseSBhZGRlZCBieSBhZGRFdmVudCwgbnVsbCBpZiBubyBldmVudCBhdmFpbGFibGVcbiAqL1xuUk9ULkV2ZW50UXVldWUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKCkge1xuXHRpZiAoIXRoaXMuX2V2ZW50cy5sZW5ndGgpIHsgcmV0dXJuIG51bGw7IH1cblxuXHR2YXIgdGltZSA9IHRoaXMuX2V2ZW50VGltZXMuc3BsaWNlKDAsIDEpWzBdO1xuXHRpZiAodGltZSA+IDApIHsgLyogYWR2YW5jZSAqL1xuXHRcdHRoaXMuX3RpbWUgKz0gdGltZTtcblx0XHRmb3IgKHZhciBpPTA7aTx0aGlzLl9ldmVudFRpbWVzLmxlbmd0aDtpKyspIHsgdGhpcy5fZXZlbnRUaW1lc1tpXSAtPSB0aW1lOyB9XG5cdH1cblxuXHRyZXR1cm4gdGhpcy5fZXZlbnRzLnNwbGljZSgwLCAxKVswXTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYW4gZXZlbnQgZnJvbSB0aGUgcXVldWVcbiAqIEBwYXJhbSB7P30gZXZlbnRcbiAqIEByZXR1cm5zIHtib29sfSBzdWNjZXNzP1xuICovXG5ST1QuRXZlbnRRdWV1ZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0dmFyIGluZGV4ID0gdGhpcy5fZXZlbnRzLmluZGV4T2YoZXZlbnQpO1xuXHRpZiAoaW5kZXggPT0gLTEpIHsgcmV0dXJuIGZhbHNlIH1cblx0dGhpcy5fcmVtb3ZlKGluZGV4KTtcblx0cmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogUmVtb3ZlIGFuIGV2ZW50IGZyb20gdGhlIHF1ZXVlXG4gKiBAcGFyYW0ge2ludH0gaW5kZXhcbiAqL1xuUk9ULkV2ZW50UXVldWUucHJvdG90eXBlLl9yZW1vdmUgPSBmdW5jdGlvbihpbmRleCkge1xuXHR0aGlzLl9ldmVudHMuc3BsaWNlKGluZGV4LCAxKTtcblx0dGhpcy5fZXZlbnRUaW1lcy5zcGxpY2UoaW5kZXgsIDEpO1xufVxuLyoqXG4gKiBAY2xhc3MgQWJzdHJhY3Qgc2NoZWR1bGVyXG4gKi9cblJPVC5TY2hlZHVsZXIgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5fcXVldWUgPSBuZXcgUk9ULkV2ZW50UXVldWUoKTtcblx0dGhpcy5fcmVwZWF0ID0gW107XG5cdHRoaXMuX2N1cnJlbnQgPSBudWxsO1xufVxuXG4vKipcbiAqIEBzZWUgUk9ULkV2ZW50UXVldWUjZ2V0VGltZVxuICovXG5ST1QuU2NoZWR1bGVyLnByb3RvdHlwZS5nZXRUaW1lID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLl9xdWV1ZS5nZXRUaW1lKCk7XG59XG5cbi8qKlxuICogQHBhcmFtIHs/fSBpdGVtXG4gKiBAcGFyYW0ge2Jvb2x9IHJlcGVhdFxuICovXG5ST1QuU2NoZWR1bGVyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihpdGVtLCByZXBlYXQpIHtcblx0aWYgKHJlcGVhdCkgeyB0aGlzLl9yZXBlYXQucHVzaChpdGVtKTsgfVxuXHRyZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBDbGVhciBhbGwgaXRlbXNcbiAqL1xuUk9ULlNjaGVkdWxlci5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5fcXVldWUuY2xlYXIoKTtcblx0dGhpcy5fcmVwZWF0ID0gW107XG5cdHRoaXMuX2N1cnJlbnQgPSBudWxsO1xuXHRyZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBSZW1vdmUgYSBwcmV2aW91c2x5IGFkZGVkIGl0ZW1cbiAqIEBwYXJhbSB7P30gaXRlbVxuICogQHJldHVybnMge2Jvb2x9IHN1Y2Nlc3NmdWw/XG4gKi9cblJPVC5TY2hlZHVsZXIucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0dmFyIHJlc3VsdCA9IHRoaXMuX3F1ZXVlLnJlbW92ZShpdGVtKTtcblxuXHR2YXIgaW5kZXggPSB0aGlzLl9yZXBlYXQuaW5kZXhPZihpdGVtKTtcblx0aWYgKGluZGV4ICE9IC0xKSB7IHRoaXMuX3JlcGVhdC5zcGxpY2UoaW5kZXgsIDEpOyB9XG5cblx0aWYgKHRoaXMuX2N1cnJlbnQgPT0gaXRlbSkgeyB0aGlzLl9jdXJyZW50ID0gbnVsbDsgfVxuXG5cdHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogU2NoZWR1bGUgbmV4dCBpdGVtXG4gKiBAcmV0dXJucyB7P31cbiAqL1xuUk9ULlNjaGVkdWxlci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9jdXJyZW50ID0gdGhpcy5fcXVldWUuZ2V0KCk7XG5cdHJldHVybiB0aGlzLl9jdXJyZW50O1xufVxuLyoqXG4gKiBAY2xhc3MgU2ltcGxlIGZhaXIgc2NoZWR1bGVyIChyb3VuZC1yb2JpbiBzdHlsZSlcbiAqIEBhdWdtZW50cyBST1QuU2NoZWR1bGVyXG4gKi9cblJPVC5TY2hlZHVsZXIuU2ltcGxlID0gZnVuY3Rpb24oKSB7XG5cdFJPVC5TY2hlZHVsZXIuY2FsbCh0aGlzKTtcbn1cblJPVC5TY2hlZHVsZXIuU2ltcGxlLmV4dGVuZChST1QuU2NoZWR1bGVyKTtcblxuLyoqXG4gKiBAc2VlIFJPVC5TY2hlZHVsZXIjYWRkXG4gKi9cblJPVC5TY2hlZHVsZXIuU2ltcGxlLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihpdGVtLCByZXBlYXQpIHtcblx0dGhpcy5fcXVldWUuYWRkKGl0ZW0sIDApO1xuXHRyZXR1cm4gUk9ULlNjaGVkdWxlci5wcm90b3R5cGUuYWRkLmNhbGwodGhpcywgaXRlbSwgcmVwZWF0KTtcbn1cblxuLyoqXG4gKiBAc2VlIFJPVC5TY2hlZHVsZXIjbmV4dFxuICovXG5ST1QuU2NoZWR1bGVyLlNpbXBsZS5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuXHRpZiAodGhpcy5fY3VycmVudCAmJiB0aGlzLl9yZXBlYXQuaW5kZXhPZih0aGlzLl9jdXJyZW50KSAhPSAtMSkge1xuXHRcdHRoaXMuX3F1ZXVlLmFkZCh0aGlzLl9jdXJyZW50LCAwKTtcblx0fVxuXHRyZXR1cm4gUk9ULlNjaGVkdWxlci5wcm90b3R5cGUubmV4dC5jYWxsKHRoaXMpO1xufVxuLyoqXG4gKiBAY2xhc3MgU3BlZWQtYmFzZWQgc2NoZWR1bGVyXG4gKiBAYXVnbWVudHMgUk9ULlNjaGVkdWxlclxuICovXG5ST1QuU2NoZWR1bGVyLlNwZWVkID0gZnVuY3Rpb24oKSB7XG5cdFJPVC5TY2hlZHVsZXIuY2FsbCh0aGlzKTtcbn1cblJPVC5TY2hlZHVsZXIuU3BlZWQuZXh0ZW5kKFJPVC5TY2hlZHVsZXIpO1xuXG4vKipcbiAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtIGFueXRoaW5nIHdpdGggXCJnZXRTcGVlZFwiIG1ldGhvZFxuICogQHBhcmFtIHtib29sfSByZXBlYXRcbiAqIEBzZWUgUk9ULlNjaGVkdWxlciNhZGRcbiAqL1xuUk9ULlNjaGVkdWxlci5TcGVlZC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oaXRlbSwgcmVwZWF0KSB7XG5cdHRoaXMuX3F1ZXVlLmFkZChpdGVtLCAxL2l0ZW0uZ2V0U3BlZWQoKSk7XG5cdHJldHVybiBST1QuU2NoZWR1bGVyLnByb3RvdHlwZS5hZGQuY2FsbCh0aGlzLCBpdGVtLCByZXBlYXQpO1xufVxuXG4vKipcbiAqIEBzZWUgUk9ULlNjaGVkdWxlciNuZXh0XG4gKi9cblJPVC5TY2hlZHVsZXIuU3BlZWQucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcblx0aWYgKHRoaXMuX2N1cnJlbnQgJiYgdGhpcy5fcmVwZWF0LmluZGV4T2YodGhpcy5fY3VycmVudCkgIT0gLTEpIHtcblx0XHR0aGlzLl9xdWV1ZS5hZGQodGhpcy5fY3VycmVudCwgMS90aGlzLl9jdXJyZW50LmdldFNwZWVkKCkpO1xuXHR9XG5cdHJldHVybiBST1QuU2NoZWR1bGVyLnByb3RvdHlwZS5uZXh0LmNhbGwodGhpcyk7XG59XG4vKipcbiAqIEBjbGFzcyBBY3Rpb24tYmFzZWQgc2NoZWR1bGVyXG4gKiBAYXVnbWVudHMgUk9ULlNjaGVkdWxlclxuICovXG5ST1QuU2NoZWR1bGVyLkFjdGlvbiA9IGZ1bmN0aW9uKCkge1xuXHRST1QuU2NoZWR1bGVyLmNhbGwodGhpcyk7XG5cdHRoaXMuX2RlZmF1bHREdXJhdGlvbiA9IDE7IC8qIGZvciBuZXdseSBhZGRlZCAqL1xuXHR0aGlzLl9kdXJhdGlvbiA9IHRoaXMuX2RlZmF1bHREdXJhdGlvbjsgLyogZm9yIHRoaXMuX2N1cnJlbnQgKi9cbn1cblJPVC5TY2hlZHVsZXIuQWN0aW9uLmV4dGVuZChST1QuU2NoZWR1bGVyKTtcblxuLyoqXG4gKiBAcGFyYW0ge29iamVjdH0gaXRlbVxuICogQHBhcmFtIHtib29sfSByZXBlYXRcbiAqIEBwYXJhbSB7bnVtYmVyfSBbdGltZT0xXVxuICogQHNlZSBST1QuU2NoZWR1bGVyI2FkZFxuICovXG5ST1QuU2NoZWR1bGVyLkFjdGlvbi5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oaXRlbSwgcmVwZWF0LCB0aW1lKSB7XG5cdHRoaXMuX3F1ZXVlLmFkZChpdGVtLCB0aW1lIHx8IHRoaXMuX2RlZmF1bHREdXJhdGlvbik7XG5cdHJldHVybiBST1QuU2NoZWR1bGVyLnByb3RvdHlwZS5hZGQuY2FsbCh0aGlzLCBpdGVtLCByZXBlYXQpO1xufVxuXG5ST1QuU2NoZWR1bGVyLkFjdGlvbi5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5fZHVyYXRpb24gPSB0aGlzLl9kZWZhdWx0RHVyYXRpb247XG5cdHJldHVybiBST1QuU2NoZWR1bGVyLnByb3RvdHlwZS5jbGVhci5jYWxsKHRoaXMpO1xufVxuXG5ST1QuU2NoZWR1bGVyLkFjdGlvbi5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oaXRlbSkge1xuXHRpZiAoaXRlbSA9PSB0aGlzLl9jdXJyZW50KSB7IHRoaXMuX2R1cmF0aW9uID0gdGhpcy5fZGVmYXVsdER1cmF0aW9uOyB9XG5cdHJldHVybiBST1QuU2NoZWR1bGVyLnByb3RvdHlwZS5yZW1vdmUuY2FsbCh0aGlzLCBpdGVtKTtcbn1cblxuLyoqXG4gKiBAc2VlIFJPVC5TY2hlZHVsZXIjbmV4dFxuICovXG5ST1QuU2NoZWR1bGVyLkFjdGlvbi5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuXHRpZiAodGhpcy5fY3VycmVudCAmJiB0aGlzLl9yZXBlYXQuaW5kZXhPZih0aGlzLl9jdXJyZW50KSAhPSAtMSkge1xuXHRcdHRoaXMuX3F1ZXVlLmFkZCh0aGlzLl9jdXJyZW50LCB0aGlzLl9kdXJhdGlvbiB8fCB0aGlzLl9kZWZhdWx0RHVyYXRpb24pO1xuXHRcdHRoaXMuX2R1cmF0aW9uID0gdGhpcy5fZGVmYXVsdER1cmF0aW9uO1xuXHR9XG5cdHJldHVybiBST1QuU2NoZWR1bGVyLnByb3RvdHlwZS5uZXh0LmNhbGwodGhpcyk7XG59XG5cbi8qKlxuICogU2V0IGR1cmF0aW9uIGZvciB0aGUgYWN0aXZlIGl0ZW1cbiAqL1xuUk9ULlNjaGVkdWxlci5BY3Rpb24ucHJvdG90eXBlLnNldER1cmF0aW9uID0gZnVuY3Rpb24odGltZSkge1xuXHRpZiAodGhpcy5fY3VycmVudCkgeyB0aGlzLl9kdXJhdGlvbiA9IHRpbWU7IH1cblx0cmV0dXJuIHRoaXM7XG59XG4vKipcbiAqIEBjbGFzcyBBc3luY2hyb25vdXMgbWFpbiBsb29wXG4gKiBAcGFyYW0ge1JPVC5TY2hlZHVsZXJ9IHNjaGVkdWxlclxuICovXG5ST1QuRW5naW5lID0gZnVuY3Rpb24oc2NoZWR1bGVyKSB7XG5cdHRoaXMuX3NjaGVkdWxlciA9IHNjaGVkdWxlcjtcblx0dGhpcy5fbG9jayA9IDE7XG59XG5cbi8qKlxuICogU3RhcnQgdGhlIG1haW4gbG9vcC4gV2hlbiB0aGlzIGNhbGwgcmV0dXJucywgdGhlIGxvb3AgaXMgbG9ja2VkLlxuICovXG5ST1QuRW5naW5lLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy51bmxvY2soKTtcbn1cblxuLyoqXG4gKiBJbnRlcnJ1cHQgdGhlIGVuZ2luZSBieSBhbiBhc3luY2hyb25vdXMgYWN0aW9uXG4gKi9cblJPVC5FbmdpbmUucHJvdG90eXBlLmxvY2sgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5fbG9jaysrO1xuXHRyZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBSZXN1bWUgZXhlY3V0aW9uIChwYXVzZWQgYnkgYSBwcmV2aW91cyBsb2NrKVxuICovXG5ST1QuRW5naW5lLnByb3RvdHlwZS51bmxvY2sgPSBmdW5jdGlvbigpIHtcblx0aWYgKCF0aGlzLl9sb2NrKSB7IHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCB1bmxvY2sgdW5sb2NrZWQgZW5naW5lXCIpOyB9XG5cdHRoaXMuX2xvY2stLTtcblxuXHR3aGlsZSAoIXRoaXMuX2xvY2spIHtcblx0XHR2YXIgYWN0b3IgPSB0aGlzLl9zY2hlZHVsZXIubmV4dCgpO1xuXHRcdGlmICghYWN0b3IpIHsgcmV0dXJuIHRoaXMubG9jaygpOyB9IC8qIG5vIGFjdG9ycyAqL1xuXHRcdHZhciByZXN1bHQgPSBhY3Rvci5hY3QoKTtcblx0XHRpZiAocmVzdWx0ICYmIHJlc3VsdC50aGVuKSB7IC8qIGFjdG9yIHJldHVybmVkIGEgXCJ0aGVuYWJsZVwiLCBsb29rcyBsaWtlIGEgUHJvbWlzZSAqL1xuXHRcdFx0dGhpcy5sb2NrKCk7XG5cdFx0XHRyZXN1bHQudGhlbih0aGlzLnVubG9jay5iaW5kKHRoaXMpKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdGhpcztcbn1cbi8qKlxuICogQGNsYXNzIEJhc2UgbWFwIGdlbmVyYXRvclxuICogQHBhcmFtIHtpbnR9IFt3aWR0aD1ST1QuREVGQVVMVF9XSURUSF1cbiAqIEBwYXJhbSB7aW50fSBbaGVpZ2h0PVJPVC5ERUZBVUxUX0hFSUdIVF1cbiAqL1xuUk9ULk1hcCA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcblx0dGhpcy5fd2lkdGggPSB3aWR0aCB8fCBST1QuREVGQVVMVF9XSURUSDtcblx0dGhpcy5faGVpZ2h0ID0gaGVpZ2h0IHx8IFJPVC5ERUZBVUxUX0hFSUdIVDtcbn07XG5cblJPVC5NYXAucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7fVxuXG5ST1QuTWFwLnByb3RvdHlwZS5fZmlsbE1hcCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdHZhciBtYXAgPSBbXTtcblx0Zm9yICh2YXIgaT0wO2k8dGhpcy5fd2lkdGg7aSsrKSB7XG5cdFx0bWFwLnB1c2goW10pO1xuXHRcdGZvciAodmFyIGo9MDtqPHRoaXMuX2hlaWdodDtqKyspIHsgbWFwW2ldLnB1c2godmFsdWUpOyB9XG5cdH1cblx0cmV0dXJuIG1hcDtcbn1cbi8qKlxuICogQGNsYXNzIFNpbXBsZSBlbXB0eSByZWN0YW5ndWxhciByb29tXG4gKiBAYXVnbWVudHMgUk9ULk1hcFxuICovXG5ST1QuTWFwLkFyZW5hID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuXHRST1QuTWFwLmNhbGwodGhpcywgd2lkdGgsIGhlaWdodCk7XG59XG5ST1QuTWFwLkFyZW5hLmV4dGVuZChST1QuTWFwKTtcblxuUk9ULk1hcC5BcmVuYS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0dmFyIHcgPSB0aGlzLl93aWR0aC0xO1xuXHR2YXIgaCA9IHRoaXMuX2hlaWdodC0xO1xuXHRmb3IgKHZhciBpPTA7aTw9dztpKyspIHtcblx0XHRmb3IgKHZhciBqPTA7ajw9aDtqKyspIHtcblx0XHRcdHZhciBlbXB0eSA9IChpICYmIGogJiYgaTx3ICYmIGo8aCk7XG5cdFx0XHRjYWxsYmFjayhpLCBqLCBlbXB0eSA/IDAgOiAxKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59XG4vKipcbiAqIEBjbGFzcyBSZWN1cnNpdmVseSBkaXZpZGVkIG1hemUsIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTWF6ZV9nZW5lcmF0aW9uX2FsZ29yaXRobSNSZWN1cnNpdmVfZGl2aXNpb25fbWV0aG9kXG4gKiBAYXVnbWVudHMgUk9ULk1hcFxuICovXG5ST1QuTWFwLkRpdmlkZWRNYXplID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuXHRST1QuTWFwLmNhbGwodGhpcywgd2lkdGgsIGhlaWdodCk7XG5cdHRoaXMuX3N0YWNrID0gW107XG59XG5ST1QuTWFwLkRpdmlkZWRNYXplLmV4dGVuZChST1QuTWFwKTtcblxuUk9ULk1hcC5EaXZpZGVkTWF6ZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0dmFyIHcgPSB0aGlzLl93aWR0aDtcblx0dmFyIGggPSB0aGlzLl9oZWlnaHQ7XG5cdFxuXHR0aGlzLl9tYXAgPSBbXTtcblx0XG5cdGZvciAodmFyIGk9MDtpPHc7aSsrKSB7XG5cdFx0dGhpcy5fbWFwLnB1c2goW10pO1xuXHRcdGZvciAodmFyIGo9MDtqPGg7aisrKSB7XG5cdFx0XHR2YXIgYm9yZGVyID0gKGkgPT0gMCB8fCBqID09IDAgfHwgaSsxID09IHcgfHwgaisxID09IGgpO1xuXHRcdFx0dGhpcy5fbWFwW2ldLnB1c2goYm9yZGVyID8gMSA6IDApO1xuXHRcdH1cblx0fVxuXHRcblx0dGhpcy5fc3RhY2sgPSBbXG5cdFx0WzEsIDEsIHctMiwgaC0yXVxuXHRdO1xuXHR0aGlzLl9wcm9jZXNzKCk7XG5cdFxuXHRmb3IgKHZhciBpPTA7aTx3O2krKykge1xuXHRcdGZvciAodmFyIGo9MDtqPGg7aisrKSB7XG5cdFx0XHRjYWxsYmFjayhpLCBqLCB0aGlzLl9tYXBbaV1bal0pO1xuXHRcdH1cblx0fVxuXHR0aGlzLl9tYXAgPSBudWxsO1xuXHRyZXR1cm4gdGhpcztcbn1cblxuUk9ULk1hcC5EaXZpZGVkTWF6ZS5wcm90b3R5cGUuX3Byb2Nlc3MgPSBmdW5jdGlvbigpIHtcblx0d2hpbGUgKHRoaXMuX3N0YWNrLmxlbmd0aCkge1xuXHRcdHZhciByb29tID0gdGhpcy5fc3RhY2suc2hpZnQoKTsgLyogW2xlZnQsIHRvcCwgcmlnaHQsIGJvdHRvbV0gKi9cblx0XHR0aGlzLl9wYXJ0aXRpb25Sb29tKHJvb20pO1xuXHR9XG59XG5cblJPVC5NYXAuRGl2aWRlZE1hemUucHJvdG90eXBlLl9wYXJ0aXRpb25Sb29tID0gZnVuY3Rpb24ocm9vbSkge1xuXHR2YXIgYXZhaWxYID0gW107XG5cdHZhciBhdmFpbFkgPSBbXTtcblx0XG5cdGZvciAodmFyIGk9cm9vbVswXSsxO2k8cm9vbVsyXTtpKyspIHtcblx0XHR2YXIgdG9wID0gdGhpcy5fbWFwW2ldW3Jvb21bMV0tMV07XG5cdFx0dmFyIGJvdHRvbSA9IHRoaXMuX21hcFtpXVtyb29tWzNdKzFdO1xuXHRcdGlmICh0b3AgJiYgYm90dG9tICYmICEoaSAlIDIpKSB7IGF2YWlsWC5wdXNoKGkpOyB9XG5cdH1cblx0XG5cdGZvciAodmFyIGo9cm9vbVsxXSsxO2o8cm9vbVszXTtqKyspIHtcblx0XHR2YXIgbGVmdCA9IHRoaXMuX21hcFtyb29tWzBdLTFdW2pdO1xuXHRcdHZhciByaWdodCA9IHRoaXMuX21hcFtyb29tWzJdKzFdW2pdO1xuXHRcdGlmIChsZWZ0ICYmIHJpZ2h0ICYmICEoaiAlIDIpKSB7IGF2YWlsWS5wdXNoKGopOyB9XG5cdH1cblxuXHRpZiAoIWF2YWlsWC5sZW5ndGggfHwgIWF2YWlsWS5sZW5ndGgpIHsgcmV0dXJuOyB9XG5cblx0dmFyIHggPSBhdmFpbFgucmFuZG9tKCk7XG5cdHZhciB5ID0gYXZhaWxZLnJhbmRvbSgpO1xuXHRcblx0dGhpcy5fbWFwW3hdW3ldID0gMTtcblx0XG5cdHZhciB3YWxscyA9IFtdO1xuXHRcblx0dmFyIHcgPSBbXTsgd2FsbHMucHVzaCh3KTsgLyogbGVmdCBwYXJ0ICovXG5cdGZvciAodmFyIGk9cm9vbVswXTsgaTx4OyBpKyspIHsgXG5cdFx0dGhpcy5fbWFwW2ldW3ldID0gMTtcblx0XHR3LnB1c2goW2ksIHldKTsgXG5cdH1cblx0XG5cdHZhciB3ID0gW107IHdhbGxzLnB1c2godyk7IC8qIHJpZ2h0IHBhcnQgKi9cblx0Zm9yICh2YXIgaT14KzE7IGk8PXJvb21bMl07IGkrKykgeyBcblx0XHR0aGlzLl9tYXBbaV1beV0gPSAxO1xuXHRcdHcucHVzaChbaSwgeV0pOyBcblx0fVxuXG5cdHZhciB3ID0gW107IHdhbGxzLnB1c2godyk7IC8qIHRvcCBwYXJ0ICovXG5cdGZvciAodmFyIGo9cm9vbVsxXTsgajx5OyBqKyspIHsgXG5cdFx0dGhpcy5fbWFwW3hdW2pdID0gMTtcblx0XHR3LnB1c2goW3gsIGpdKTsgXG5cdH1cblx0XG5cdHZhciB3ID0gW107IHdhbGxzLnB1c2godyk7IC8qIGJvdHRvbSBwYXJ0ICovXG5cdGZvciAodmFyIGo9eSsxOyBqPD1yb29tWzNdOyBqKyspIHsgXG5cdFx0dGhpcy5fbWFwW3hdW2pdID0gMTtcblx0XHR3LnB1c2goW3gsIGpdKTsgXG5cdH1cblx0XHRcblx0dmFyIHNvbGlkID0gd2FsbHMucmFuZG9tKCk7XG5cdGZvciAodmFyIGk9MDtpPHdhbGxzLmxlbmd0aDtpKyspIHtcblx0XHR2YXIgdyA9IHdhbGxzW2ldO1xuXHRcdGlmICh3ID09IHNvbGlkKSB7IGNvbnRpbnVlOyB9XG5cdFx0XG5cdFx0dmFyIGhvbGUgPSB3LnJhbmRvbSgpO1xuXHRcdHRoaXMuX21hcFtob2xlWzBdXVtob2xlWzFdXSA9IDA7XG5cdH1cblxuXHR0aGlzLl9zdGFjay5wdXNoKFtyb29tWzBdLCByb29tWzFdLCB4LTEsIHktMV0pOyAvKiBsZWZ0IHRvcCAqL1xuXHR0aGlzLl9zdGFjay5wdXNoKFt4KzEsIHJvb21bMV0sIHJvb21bMl0sIHktMV0pOyAvKiByaWdodCB0b3AgKi9cblx0dGhpcy5fc3RhY2sucHVzaChbcm9vbVswXSwgeSsxLCB4LTEsIHJvb21bM11dKTsgLyogbGVmdCBib3R0b20gKi9cblx0dGhpcy5fc3RhY2sucHVzaChbeCsxLCB5KzEsIHJvb21bMl0sIHJvb21bM11dKTsgLyogcmlnaHQgYm90dG9tICovXG59XG4vKipcbiAqIEBjbGFzcyBJY2V5J3MgTWF6ZSBnZW5lcmF0b3JcbiAqIFNlZSBodHRwOi8vd3d3LnJvZ3VlYmFzaW4ucm9ndWVsaWtlZGV2ZWxvcG1lbnQub3JnL2luZGV4LnBocD90aXRsZT1TaW1wbGVfbWF6ZSBmb3IgZXhwbGFuYXRpb25cbiAqIEBhdWdtZW50cyBST1QuTWFwXG4gKi9cblJPVC5NYXAuSWNleU1hemUgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0LCByZWd1bGFyaXR5KSB7XG5cdFJPVC5NYXAuY2FsbCh0aGlzLCB3aWR0aCwgaGVpZ2h0KTtcblx0dGhpcy5fcmVndWxhcml0eSA9IHJlZ3VsYXJpdHkgfHwgMDtcbn1cblJPVC5NYXAuSWNleU1hemUuZXh0ZW5kKFJPVC5NYXApO1xuXG5ST1QuTWFwLkljZXlNYXplLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHR2YXIgd2lkdGggPSB0aGlzLl93aWR0aDtcblx0dmFyIGhlaWdodCA9IHRoaXMuX2hlaWdodDtcblx0XG5cdHZhciBtYXAgPSB0aGlzLl9maWxsTWFwKDEpO1xuXHRcblx0d2lkdGggLT0gKHdpZHRoICUgMiA/IDEgOiAyKTtcblx0aGVpZ2h0IC09IChoZWlnaHQgJSAyID8gMSA6IDIpO1xuXG5cdHZhciBjeCA9IDA7XG5cdHZhciBjeSA9IDA7XG5cdHZhciBueCA9IDA7XG5cdHZhciBueSA9IDA7XG5cblx0dmFyIGRvbmUgPSAwO1xuXHR2YXIgYmxvY2tlZCA9IGZhbHNlO1xuXHR2YXIgZGlycyA9IFtcblx0XHRbMCwgMF0sXG5cdFx0WzAsIDBdLFxuXHRcdFswLCAwXSxcblx0XHRbMCwgMF1cblx0XTtcblx0ZG8ge1xuXHRcdGN4ID0gMSArIDIqTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSood2lkdGgtMSkgLyAyKTtcblx0XHRjeSA9IDEgKyAyKk1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkqKGhlaWdodC0xKSAvIDIpO1xuXG5cdFx0aWYgKCFkb25lKSB7IG1hcFtjeF1bY3ldID0gMDsgfVxuXHRcdFxuXHRcdGlmICghbWFwW2N4XVtjeV0pIHtcblx0XHRcdHRoaXMuX3JhbmRvbWl6ZShkaXJzKTtcblx0XHRcdGRvIHtcblx0XHRcdFx0aWYgKE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkqKHRoaXMuX3JlZ3VsYXJpdHkrMSkpID09IDApIHsgdGhpcy5fcmFuZG9taXplKGRpcnMpOyB9XG5cdFx0XHRcdGJsb2NrZWQgPSB0cnVlO1xuXHRcdFx0XHRmb3IgKHZhciBpPTA7aTw0O2krKykge1xuXHRcdFx0XHRcdG54ID0gY3ggKyBkaXJzW2ldWzBdKjI7XG5cdFx0XHRcdFx0bnkgPSBjeSArIGRpcnNbaV1bMV0qMjtcblx0XHRcdFx0XHRpZiAodGhpcy5faXNGcmVlKG1hcCwgbngsIG55LCB3aWR0aCwgaGVpZ2h0KSkge1xuXHRcdFx0XHRcdFx0bWFwW254XVtueV0gPSAwO1xuXHRcdFx0XHRcdFx0bWFwW2N4ICsgZGlyc1tpXVswXV1bY3kgKyBkaXJzW2ldWzFdXSA9IDA7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGN4ID0gbng7XG5cdFx0XHRcdFx0XHRjeSA9IG55O1xuXHRcdFx0XHRcdFx0YmxvY2tlZCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0ZG9uZSsrO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IHdoaWxlICghYmxvY2tlZCk7XG5cdFx0fVxuXHR9IHdoaWxlIChkb25lKzEgPCB3aWR0aCpoZWlnaHQvNCk7XG5cdFxuXHRmb3IgKHZhciBpPTA7aTx0aGlzLl93aWR0aDtpKyspIHtcblx0XHRmb3IgKHZhciBqPTA7ajx0aGlzLl9oZWlnaHQ7aisrKSB7XG5cdFx0XHRjYWxsYmFjayhpLCBqLCBtYXBbaV1bal0pO1xuXHRcdH1cblx0fVxuXHR0aGlzLl9tYXAgPSBudWxsO1xuXHRyZXR1cm4gdGhpcztcbn1cblxuUk9ULk1hcC5JY2V5TWF6ZS5wcm90b3R5cGUuX3JhbmRvbWl6ZSA9IGZ1bmN0aW9uKGRpcnMpIHtcblx0Zm9yICh2YXIgaT0wO2k8NDtpKyspIHtcblx0XHRkaXJzW2ldWzBdID0gMDtcblx0XHRkaXJzW2ldWzFdID0gMDtcblx0fVxuXHRcblx0c3dpdGNoIChNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpKjQpKSB7XG5cdFx0Y2FzZSAwOlxuXHRcdFx0ZGlyc1swXVswXSA9IC0xOyBkaXJzWzFdWzBdID0gMTtcblx0XHRcdGRpcnNbMl1bMV0gPSAtMTsgZGlyc1szXVsxXSA9IDE7XG5cdFx0YnJlYWs7XG5cdFx0Y2FzZSAxOlxuXHRcdFx0ZGlyc1szXVswXSA9IC0xOyBkaXJzWzJdWzBdID0gMTtcblx0XHRcdGRpcnNbMV1bMV0gPSAtMTsgZGlyc1swXVsxXSA9IDE7XG5cdFx0YnJlYWs7XG5cdFx0Y2FzZSAyOlxuXHRcdFx0ZGlyc1syXVswXSA9IC0xOyBkaXJzWzNdWzBdID0gMTtcblx0XHRcdGRpcnNbMF1bMV0gPSAtMTsgZGlyc1sxXVsxXSA9IDE7XG5cdFx0YnJlYWs7XG5cdFx0Y2FzZSAzOlxuXHRcdFx0ZGlyc1sxXVswXSA9IC0xOyBkaXJzWzBdWzBdID0gMTtcblx0XHRcdGRpcnNbM11bMV0gPSAtMTsgZGlyc1syXVsxXSA9IDE7XG5cdFx0YnJlYWs7XG5cdH1cbn1cblxuUk9ULk1hcC5JY2V5TWF6ZS5wcm90b3R5cGUuX2lzRnJlZSA9IGZ1bmN0aW9uKG1hcCwgeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuXHRpZiAoeCA8IDEgfHwgeSA8IDEgfHwgeCA+PSB3aWR0aCB8fCB5ID49IGhlaWdodCkgeyByZXR1cm4gZmFsc2U7IH1cblx0cmV0dXJuIG1hcFt4XVt5XTtcbn1cbi8qKlxuICogQGNsYXNzIE1hemUgZ2VuZXJhdG9yIC0gRWxsZXIncyBhbGdvcml0aG1cbiAqIFNlZSBodHRwOi8vaG9tZXBhZ2VzLmN3aS5ubC9+dHJvbXAvbWF6ZS5odG1sIGZvciBleHBsYW5hdGlvblxuICogQGF1Z21lbnRzIFJPVC5NYXBcbiAqL1xuUk9ULk1hcC5FbGxlck1hemUgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG5cdFJPVC5NYXAuY2FsbCh0aGlzLCB3aWR0aCwgaGVpZ2h0KTtcbn1cblJPVC5NYXAuRWxsZXJNYXplLmV4dGVuZChST1QuTWFwKTtcblxuUk9ULk1hcC5FbGxlck1hemUucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdHZhciBtYXAgPSB0aGlzLl9maWxsTWFwKDEpO1xuXHR2YXIgdyA9IE1hdGguY2VpbCgodGhpcy5fd2lkdGgtMikvMik7XG5cdFxuXHR2YXIgcmFuZCA9IDkvMjQ7XG5cdFxuXHR2YXIgTCA9IFtdO1xuXHR2YXIgUiA9IFtdO1xuXHRcblx0Zm9yICh2YXIgaT0wO2k8dztpKyspIHtcblx0XHRMLnB1c2goaSk7XG5cdFx0Ui5wdXNoKGkpO1xuXHR9XG5cdEwucHVzaCh3LTEpOyAvKiBmYWtlIHN0b3AtYmxvY2sgYXQgdGhlIHJpZ2h0IHNpZGUgKi9cblxuXHRmb3IgKHZhciBqPTE7aiszPHRoaXMuX2hlaWdodDtqKz0yKSB7XG5cdFx0Lyogb25lIHJvdyAqL1xuXHRcdGZvciAodmFyIGk9MDtpPHc7aSsrKSB7XG5cdFx0XHQvKiBjZWxsIGNvb3JkcyAod2lsbCBiZSBhbHdheXMgZW1wdHkpICovXG5cdFx0XHR2YXIgeCA9IDIqaSsxO1xuXHRcdFx0dmFyIHkgPSBqO1xuXHRcdFx0bWFwW3hdW3ldID0gMDtcblx0XHRcdFxuXHRcdFx0LyogcmlnaHQgY29ubmVjdGlvbiAqL1xuXHRcdFx0aWYgKGkgIT0gTFtpKzFdICYmIFJPVC5STkcuZ2V0VW5pZm9ybSgpID4gcmFuZCkge1xuXHRcdFx0XHR0aGlzLl9hZGRUb0xpc3QoaSwgTCwgUik7XG5cdFx0XHRcdG1hcFt4KzFdW3ldID0gMDtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyogYm90dG9tIGNvbm5lY3Rpb24gKi9cblx0XHRcdGlmIChpICE9IExbaV0gJiYgUk9ULlJORy5nZXRVbmlmb3JtKCkgPiByYW5kKSB7XG5cdFx0XHRcdC8qIHJlbW92ZSBjb25uZWN0aW9uICovXG5cdFx0XHRcdHRoaXMuX3JlbW92ZUZyb21MaXN0KGksIEwsIFIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0LyogY3JlYXRlIGNvbm5lY3Rpb24gKi9cblx0XHRcdFx0bWFwW3hdW3krMV0gPSAwO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qIGxhc3Qgcm93ICovXG5cdGZvciAodmFyIGk9MDtpPHc7aSsrKSB7XG5cdFx0LyogY2VsbCBjb29yZHMgKHdpbGwgYmUgYWx3YXlzIGVtcHR5KSAqL1xuXHRcdHZhciB4ID0gMippKzE7XG5cdFx0dmFyIHkgPSBqO1xuXHRcdG1hcFt4XVt5XSA9IDA7XG5cdFx0XG5cdFx0LyogcmlnaHQgY29ubmVjdGlvbiAqL1xuXHRcdGlmIChpICE9IExbaSsxXSAmJiAoaSA9PSBMW2ldIHx8IFJPVC5STkcuZ2V0VW5pZm9ybSgpID4gcmFuZCkpIHtcblx0XHRcdC8qIGRpZyByaWdodCBhbHNvIGlmIHRoZSBjZWxsIGlzIHNlcGFyYXRlZCwgc28gaXQgZ2V0cyBjb25uZWN0ZWQgdG8gdGhlIHJlc3Qgb2YgbWF6ZSAqL1xuXHRcdFx0dGhpcy5fYWRkVG9MaXN0KGksIEwsIFIpO1xuXHRcdFx0bWFwW3grMV1beV0gPSAwO1xuXHRcdH1cblx0XHRcblx0XHR0aGlzLl9yZW1vdmVGcm9tTGlzdChpLCBMLCBSKTtcblx0fVxuXHRcblx0Zm9yICh2YXIgaT0wO2k8dGhpcy5fd2lkdGg7aSsrKSB7XG5cdFx0Zm9yICh2YXIgaj0wO2o8dGhpcy5faGVpZ2h0O2orKykge1xuXHRcdFx0Y2FsbGJhY2soaSwgaiwgbWFwW2ldW2pdKTtcblx0XHR9XG5cdH1cblx0XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFJlbW92ZSBcImlcIiBmcm9tIGl0cyBsaXN0XG4gKi9cblJPVC5NYXAuRWxsZXJNYXplLnByb3RvdHlwZS5fcmVtb3ZlRnJvbUxpc3QgPSBmdW5jdGlvbihpLCBMLCBSKSB7XG5cdFJbTFtpXV0gPSBSW2ldO1xuXHRMW1JbaV1dID0gTFtpXTtcblx0UltpXSA9IGk7XG5cdExbaV0gPSBpO1xufVxuXG4vKipcbiAqIEpvaW4gbGlzdHMgd2l0aCBcImlcIiBhbmQgXCJpKzFcIlxuICovXG5ST1QuTWFwLkVsbGVyTWF6ZS5wcm90b3R5cGUuX2FkZFRvTGlzdCA9IGZ1bmN0aW9uKGksIEwsIFIpIHtcblx0UltMW2krMV1dID0gUltpXTtcblx0TFtSW2ldXSA9IExbaSsxXTtcblx0UltpXSA9IGkrMTtcblx0TFtpKzFdID0gaTtcbn1cbi8qKlxuICogQGNsYXNzIENlbGx1bGFyIGF1dG9tYXRvbiBtYXAgZ2VuZXJhdG9yXG4gKiBAYXVnbWVudHMgUk9ULk1hcFxuICogQHBhcmFtIHtpbnR9IFt3aWR0aD1ST1QuREVGQVVMVF9XSURUSF1cbiAqIEBwYXJhbSB7aW50fSBbaGVpZ2h0PVJPVC5ERUZBVUxUX0hFSUdIVF1cbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc10gT3B0aW9uc1xuICogQHBhcmFtIHtpbnRbXX0gW29wdGlvbnMuYm9ybl0gTGlzdCBvZiBuZWlnaGJvciBjb3VudHMgZm9yIGEgbmV3IGNlbGwgdG8gYmUgYm9ybiBpbiBlbXB0eSBzcGFjZVxuICogQHBhcmFtIHtpbnRbXX0gW29wdGlvbnMuc3Vydml2ZV0gTGlzdCBvZiBuZWlnaGJvciBjb3VudHMgZm9yIGFuIGV4aXN0aW5nICBjZWxsIHRvIHN1cnZpdmVcbiAqIEBwYXJhbSB7aW50fSBbb3B0aW9ucy50b3BvbG9neV0gVG9wb2xvZ3kgNCBvciA2IG9yIDhcbiAqL1xuUk9ULk1hcC5DZWxsdWxhciA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQsIG9wdGlvbnMpIHtcblx0Uk9ULk1hcC5jYWxsKHRoaXMsIHdpZHRoLCBoZWlnaHQpO1xuXHR0aGlzLl9vcHRpb25zID0ge1xuXHRcdGJvcm46IFs1LCA2LCA3LCA4XSxcblx0XHRzdXJ2aXZlOiBbNCwgNSwgNiwgNywgOF0sXG5cdFx0dG9wb2xvZ3k6IDhcblx0fTtcblx0dGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuXHRcblx0dGhpcy5fZGlycyA9IFJPVC5ESVJTW3RoaXMuX29wdGlvbnMudG9wb2xvZ3ldO1xuXHR0aGlzLl9tYXAgPSB0aGlzLl9maWxsTWFwKDApO1xufVxuUk9ULk1hcC5DZWxsdWxhci5leHRlbmQoUk9ULk1hcCk7XG5cbi8qKlxuICogRmlsbCB0aGUgbWFwIHdpdGggcmFuZG9tIHZhbHVlc1xuICogQHBhcmFtIHtmbG9hdH0gcHJvYmFiaWxpdHkgUHJvYmFiaWxpdHkgZm9yIGEgY2VsbCB0byBiZWNvbWUgYWxpdmU7IDAgPSBhbGwgZW1wdHksIDEgPSBhbGwgZnVsbFxuICovXG5ST1QuTWFwLkNlbGx1bGFyLnByb3RvdHlwZS5yYW5kb21pemUgPSBmdW5jdGlvbihwcm9iYWJpbGl0eSkge1xuXHRmb3IgKHZhciBpPTA7aTx0aGlzLl93aWR0aDtpKyspIHtcblx0XHRmb3IgKHZhciBqPTA7ajx0aGlzLl9oZWlnaHQ7aisrKSB7XG5cdFx0XHR0aGlzLl9tYXBbaV1bal0gPSAoUk9ULlJORy5nZXRVbmlmb3JtKCkgPCBwcm9iYWJpbGl0eSA/IDEgOiAwKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogQ2hhbmdlIG9wdGlvbnMuXG4gKiBAc2VlIFJPVC5NYXAuQ2VsbHVsYXJcbiAqL1xuUk9ULk1hcC5DZWxsdWxhci5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0Zm9yICh2YXIgcCBpbiBvcHRpb25zKSB7IHRoaXMuX29wdGlvbnNbcF0gPSBvcHRpb25zW3BdOyB9XG59XG5cblJPVC5NYXAuQ2VsbHVsYXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKHgsIHksIHZhbHVlKSB7XG5cdHRoaXMuX21hcFt4XVt5XSA9IHZhbHVlO1xufVxuXG5ST1QuTWFwLkNlbGx1bGFyLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHR2YXIgbmV3TWFwID0gdGhpcy5fZmlsbE1hcCgwKTtcblx0dmFyIGJvcm4gPSB0aGlzLl9vcHRpb25zLmJvcm47XG5cdHZhciBzdXJ2aXZlID0gdGhpcy5fb3B0aW9ucy5zdXJ2aXZlO1xuXG5cblx0Zm9yICh2YXIgaj0wO2o8dGhpcy5faGVpZ2h0O2orKykge1xuXHRcdHZhciB3aWR0aFN0ZXAgPSAxO1xuXHRcdHZhciB3aWR0aFN0YXJ0ID0gMDtcblx0XHRpZiAodGhpcy5fb3B0aW9ucy50b3BvbG9neSA9PSA2KSB7IFxuXHRcdFx0d2lkdGhTdGVwID0gMjtcblx0XHRcdHdpZHRoU3RhcnQgPSBqJTI7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgaT13aWR0aFN0YXJ0OyBpPHRoaXMuX3dpZHRoOyBpKz13aWR0aFN0ZXApIHtcblxuXHRcdFx0dmFyIGN1ciA9IHRoaXMuX21hcFtpXVtqXTtcblx0XHRcdHZhciBuY291bnQgPSB0aGlzLl9nZXROZWlnaGJvcnMoaSwgaik7XG5cdFx0XHRcblx0XHRcdGlmIChjdXIgJiYgc3Vydml2ZS5pbmRleE9mKG5jb3VudCkgIT0gLTEpIHsgLyogc3Vydml2ZSAqL1xuXHRcdFx0XHRuZXdNYXBbaV1bal0gPSAxO1xuXHRcdFx0fSBlbHNlIGlmICghY3VyICYmIGJvcm4uaW5kZXhPZihuY291bnQpICE9IC0xKSB7IC8qIGJvcm4gKi9cblx0XHRcdFx0bmV3TWFwW2ldW2pdID0gMTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0aWYgKGNhbGxiYWNrKSB7IGNhbGxiYWNrKGksIGosIG5ld01hcFtpXVtqXSk7IH1cblx0XHR9XG5cdH1cblx0XG5cdHRoaXMuX21hcCA9IG5ld01hcDtcbn1cblxuLyoqXG4gKiBHZXQgbmVpZ2hib3IgY291bnQgYXQgW2ksal0gaW4gdGhpcy5fbWFwXG4gKi9cblJPVC5NYXAuQ2VsbHVsYXIucHJvdG90eXBlLl9nZXROZWlnaGJvcnMgPSBmdW5jdGlvbihjeCwgY3kpIHtcblx0dmFyIHJlc3VsdCA9IDA7XG5cdGZvciAodmFyIGk9MDtpPHRoaXMuX2RpcnMubGVuZ3RoO2krKykge1xuXHRcdHZhciBkaXIgPSB0aGlzLl9kaXJzW2ldO1xuXHRcdHZhciB4ID0gY3ggKyBkaXJbMF07XG5cdFx0dmFyIHkgPSBjeSArIGRpclsxXTtcblx0XHRcblx0XHRpZiAoeCA8IDAgfHwgeCA+PSB0aGlzLl93aWR0aCB8fCB4IDwgMCB8fCB5ID49IHRoaXMuX3dpZHRoKSB7IGNvbnRpbnVlOyB9XG5cdFx0cmVzdWx0ICs9ICh0aGlzLl9tYXBbeF1beV0gPT0gMSA/IDEgOiAwKTtcblx0fVxuXHRcblx0cmV0dXJuIHJlc3VsdDtcbn1cbi8qKlxuICogQGNsYXNzIER1bmdlb24gbWFwOiBoYXMgcm9vbXMgYW5kIGNvcnJpZG9yc1xuICogQGF1Z21lbnRzIFJPVC5NYXBcbiAqL1xuUk9ULk1hcC5EdW5nZW9uID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuXHRST1QuTWFwLmNhbGwodGhpcywgd2lkdGgsIGhlaWdodCk7XG5cdHRoaXMuX3Jvb21zID0gW107IC8qIGxpc3Qgb2YgYWxsIHJvb21zICovXG5cdHRoaXMuX2NvcnJpZG9ycyA9IFtdO1xufVxuUk9ULk1hcC5EdW5nZW9uLmV4dGVuZChST1QuTWFwKTtcblxuLyoqXG4gKiBHZXQgYWxsIGdlbmVyYXRlZCByb29tc1xuICogQHJldHVybnMge1JPVC5NYXAuRmVhdHVyZS5Sb29tW119XG4gKi9cblJPVC5NYXAuRHVuZ2Vvbi5wcm90b3R5cGUuZ2V0Um9vbXMgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuX3Jvb21zO1xufVxuXG4vKipcbiAqIEdldCBhbGwgZ2VuZXJhdGVkIGNvcnJpZG9yc1xuICogQHJldHVybnMge1JPVC5NYXAuRmVhdHVyZS5Db3JyaWRvcltdfVxuICovXG5ST1QuTWFwLkR1bmdlb24ucHJvdG90eXBlLmdldENvcnJpZG9ycyA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5fY29ycmlkb3JzO1xufVxuLyoqXG4gKiBAY2xhc3MgUmFuZG9tIGR1bmdlb24gZ2VuZXJhdG9yIHVzaW5nIGh1bWFuLWxpa2UgZGlnZ2luZyBwYXR0ZXJucy5cbiAqIEhlYXZpbHkgYmFzZWQgb24gTWlrZSBBbmRlcnNvbidzIGlkZWFzIGZyb20gdGhlIFwiVHlyYW50XCIgYWxnbywgbWVudGlvbmVkIGF0IFxuICogaHR0cDovL3d3dy5yb2d1ZWJhc2luLnJvZ3VlbGlrZWRldmVsb3BtZW50Lm9yZy9pbmRleC5waHA/dGl0bGU9RHVuZ2Vvbi1CdWlsZGluZ19BbGdvcml0aG0uXG4gKiBAYXVnbWVudHMgUk9ULk1hcC5EdW5nZW9uXG4gKi9cblJPVC5NYXAuRGlnZ2VyID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCwgb3B0aW9ucykge1xuXHRST1QuTWFwLkR1bmdlb24uY2FsbCh0aGlzLCB3aWR0aCwgaGVpZ2h0KTtcblx0XG5cdHRoaXMuX29wdGlvbnMgPSB7XG5cdFx0cm9vbVdpZHRoOiBbMywgOV0sIC8qIHJvb20gbWluaW11bSBhbmQgbWF4aW11bSB3aWR0aCAqL1xuXHRcdHJvb21IZWlnaHQ6IFszLCA1XSwgLyogcm9vbSBtaW5pbXVtIGFuZCBtYXhpbXVtIGhlaWdodCAqL1xuXHRcdGNvcnJpZG9yTGVuZ3RoOiBbMywgMTBdLCAvKiBjb3JyaWRvciBtaW5pbXVtIGFuZCBtYXhpbXVtIGxlbmd0aCAqL1xuXHRcdGR1Z1BlcmNlbnRhZ2U6IDAuMiwgLyogd2Ugc3RvcCBhZnRlciB0aGlzIHBlcmNlbnRhZ2Ugb2YgbGV2ZWwgYXJlYSBoYXMgYmVlbiBkdWcgb3V0ICovXG5cdFx0dGltZUxpbWl0OiAxMDAwIC8qIHdlIHN0b3AgYWZ0ZXIgdGhpcyBtdWNoIHRpbWUgaGFzIHBhc3NlZCAobXNlYykgKi9cblx0fVxuXHRmb3IgKHZhciBwIGluIG9wdGlvbnMpIHsgdGhpcy5fb3B0aW9uc1twXSA9IG9wdGlvbnNbcF07IH1cblx0XG5cdHRoaXMuX2ZlYXR1cmVzID0ge1xuXHRcdFwiUm9vbVwiOiA0LFxuXHRcdFwiQ29ycmlkb3JcIjogNFxuXHR9XG5cdHRoaXMuX2ZlYXR1cmVBdHRlbXB0cyA9IDIwOyAvKiBob3cgbWFueSB0aW1lcyBkbyB3ZSB0cnkgdG8gY3JlYXRlIGEgZmVhdHVyZSBvbiBhIHN1aXRhYmxlIHdhbGwgKi9cblx0dGhpcy5fd2FsbHMgPSB7fTsgLyogdGhlc2UgYXJlIGF2YWlsYWJsZSBmb3IgZGlnZ2luZyAqL1xuXHRcblx0dGhpcy5fZGlnQ2FsbGJhY2sgPSB0aGlzLl9kaWdDYWxsYmFjay5iaW5kKHRoaXMpO1xuXHR0aGlzLl9jYW5CZUR1Z0NhbGxiYWNrID0gdGhpcy5fY2FuQmVEdWdDYWxsYmFjay5iaW5kKHRoaXMpO1xuXHR0aGlzLl9pc1dhbGxDYWxsYmFjayA9IHRoaXMuX2lzV2FsbENhbGxiYWNrLmJpbmQodGhpcyk7XG5cdHRoaXMuX3ByaW9yaXR5V2FsbENhbGxiYWNrID0gdGhpcy5fcHJpb3JpdHlXYWxsQ2FsbGJhY2suYmluZCh0aGlzKTtcbn1cblJPVC5NYXAuRGlnZ2VyLmV4dGVuZChST1QuTWFwLkR1bmdlb24pO1xuXG4vKipcbiAqIENyZWF0ZSBhIG1hcFxuICogQHNlZSBST1QuTWFwI2NyZWF0ZVxuICovXG5ST1QuTWFwLkRpZ2dlci5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0dGhpcy5fcm9vbXMgPSBbXTtcblx0dGhpcy5fY29ycmlkb3JzID0gW107XG5cdHRoaXMuX21hcCA9IHRoaXMuX2ZpbGxNYXAoMSk7XG5cdHRoaXMuX3dhbGxzID0ge307XG5cdHRoaXMuX2R1ZyA9IDA7XG5cdHZhciBhcmVhID0gKHRoaXMuX3dpZHRoLTIpICogKHRoaXMuX2hlaWdodC0yKTtcblxuXHR0aGlzLl9maXJzdFJvb20oKTtcblx0XG5cdHZhciB0MSA9IERhdGUubm93KCk7XG5cblx0ZG8ge1xuXHRcdHZhciB0MiA9IERhdGUubm93KCk7XG5cdFx0aWYgKHQyIC0gdDEgPiB0aGlzLl9vcHRpb25zLnRpbWVMaW1pdCkgeyBicmVhazsgfVxuXG5cdFx0LyogZmluZCBhIGdvb2Qgd2FsbCAqL1xuXHRcdHZhciB3YWxsID0gdGhpcy5fZmluZFdhbGwoKTtcblx0XHRpZiAoIXdhbGwpIHsgYnJlYWs7IH0gLyogbm8gbW9yZSB3YWxscyAqL1xuXHRcdFxuXHRcdHZhciBwYXJ0cyA9IHdhbGwuc3BsaXQoXCIsXCIpO1xuXHRcdHZhciB4ID0gcGFyc2VJbnQocGFydHNbMF0pO1xuXHRcdHZhciB5ID0gcGFyc2VJbnQocGFydHNbMV0pO1xuXHRcdHZhciBkaXIgPSB0aGlzLl9nZXREaWdnaW5nRGlyZWN0aW9uKHgsIHkpO1xuXHRcdGlmICghZGlyKSB7IGNvbnRpbnVlOyB9IC8qIHRoaXMgd2FsbCBpcyBub3Qgc3VpdGFibGUgKi9cblx0XHRcbi8vXHRcdGNvbnNvbGUubG9nKFwid2FsbFwiLCB4LCB5KTtcblxuXHRcdC8qIHRyeSBhZGRpbmcgYSBmZWF0dXJlICovXG5cdFx0dmFyIGZlYXR1cmVBdHRlbXB0cyA9IDA7XG5cdFx0ZG8ge1xuXHRcdFx0ZmVhdHVyZUF0dGVtcHRzKys7XG5cdFx0XHRpZiAodGhpcy5fdHJ5RmVhdHVyZSh4LCB5LCBkaXJbMF0sIGRpclsxXSkpIHsgLyogZmVhdHVyZSBhZGRlZCAqL1xuXHRcdFx0XHQvL2lmICh0aGlzLl9yb29tcy5sZW5ndGggKyB0aGlzLl9jb3JyaWRvcnMubGVuZ3RoID09IDIpIHsgdGhpcy5fcm9vbXNbMF0uYWRkRG9vcih4LCB5KTsgfSAvKiBmaXJzdCByb29tIG9maWNpYWxseSBoYXMgZG9vcnMgKi9cblx0XHRcdFx0dGhpcy5fcmVtb3ZlU3Vycm91bmRpbmdXYWxscyh4LCB5KTtcblx0XHRcdFx0dGhpcy5fcmVtb3ZlU3Vycm91bmRpbmdXYWxscyh4LWRpclswXSwgeS1kaXJbMV0pO1xuXHRcdFx0XHRicmVhazsgXG5cdFx0XHR9XG5cdFx0fSB3aGlsZSAoZmVhdHVyZUF0dGVtcHRzIDwgdGhpcy5fZmVhdHVyZUF0dGVtcHRzKTtcblx0XHRcblx0XHR2YXIgcHJpb3JpdHlXYWxscyA9IDA7XG5cdFx0Zm9yICh2YXIgaWQgaW4gdGhpcy5fd2FsbHMpIHsgXG5cdFx0XHRpZiAodGhpcy5fd2FsbHNbaWRdID4gMSkgeyBwcmlvcml0eVdhbGxzKys7IH1cblx0XHR9XG5cblx0fSB3aGlsZSAodGhpcy5fZHVnL2FyZWEgPCB0aGlzLl9vcHRpb25zLmR1Z1BlcmNlbnRhZ2UgfHwgcHJpb3JpdHlXYWxscyk7IC8qIGZpeG1lIG51bWJlciBvZiBwcmlvcml0eSB3YWxscyAqL1xuXG5cdHRoaXMuX2FkZERvb3JzKCk7XG5cblx0aWYgKGNhbGxiYWNrKSB7XG5cdFx0Zm9yICh2YXIgaT0wO2k8dGhpcy5fd2lkdGg7aSsrKSB7XG5cdFx0XHRmb3IgKHZhciBqPTA7ajx0aGlzLl9oZWlnaHQ7aisrKSB7XG5cdFx0XHRcdGNhbGxiYWNrKGksIGosIHRoaXMuX21hcFtpXVtqXSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdFxuXHR0aGlzLl93YWxscyA9IHt9O1xuXHR0aGlzLl9tYXAgPSBudWxsO1xuXG5cdHJldHVybiB0aGlzO1xufVxuXG5ST1QuTWFwLkRpZ2dlci5wcm90b3R5cGUuX2RpZ0NhbGxiYWNrID0gZnVuY3Rpb24oeCwgeSwgdmFsdWUpIHtcblx0aWYgKHZhbHVlID09IDAgfHwgdmFsdWUgPT0gMikgeyAvKiBlbXB0eSAqL1xuXHRcdHRoaXMuX21hcFt4XVt5XSA9IDA7XG5cdFx0dGhpcy5fZHVnKys7XG5cdH0gZWxzZSB7IC8qIHdhbGwgKi9cblx0XHR0aGlzLl93YWxsc1t4K1wiLFwiK3ldID0gMTtcblx0fVxufVxuXG5ST1QuTWFwLkRpZ2dlci5wcm90b3R5cGUuX2lzV2FsbENhbGxiYWNrID0gZnVuY3Rpb24oeCwgeSkge1xuXHRpZiAoeCA8IDAgfHwgeSA8IDAgfHwgeCA+PSB0aGlzLl93aWR0aCB8fCB5ID49IHRoaXMuX2hlaWdodCkgeyByZXR1cm4gZmFsc2U7IH1cblx0cmV0dXJuICh0aGlzLl9tYXBbeF1beV0gPT0gMSk7XG59XG5cblJPVC5NYXAuRGlnZ2VyLnByb3RvdHlwZS5fY2FuQmVEdWdDYWxsYmFjayA9IGZ1bmN0aW9uKHgsIHkpIHtcblx0aWYgKHggPCAxIHx8IHkgPCAxIHx8IHgrMSA+PSB0aGlzLl93aWR0aCB8fCB5KzEgPj0gdGhpcy5faGVpZ2h0KSB7IHJldHVybiBmYWxzZTsgfVxuXHRyZXR1cm4gKHRoaXMuX21hcFt4XVt5XSA9PSAxKTtcbn1cblxuUk9ULk1hcC5EaWdnZXIucHJvdG90eXBlLl9wcmlvcml0eVdhbGxDYWxsYmFjayA9IGZ1bmN0aW9uKHgsIHkpIHtcblx0dGhpcy5fd2FsbHNbeCtcIixcIit5XSA9IDI7XG59XG5cblJPVC5NYXAuRGlnZ2VyLnByb3RvdHlwZS5fZmlyc3RSb29tID0gZnVuY3Rpb24oKSB7XG5cdHZhciBjeCA9IE1hdGguZmxvb3IodGhpcy5fd2lkdGgvMik7XG5cdHZhciBjeSA9IE1hdGguZmxvb3IodGhpcy5faGVpZ2h0LzIpO1xuXHR2YXIgcm9vbSA9IFJPVC5NYXAuRmVhdHVyZS5Sb29tLmNyZWF0ZVJhbmRvbUNlbnRlcihjeCwgY3ksIHRoaXMuX29wdGlvbnMpO1xuXHR0aGlzLl9yb29tcy5wdXNoKHJvb20pO1xuXHRyb29tLmNyZWF0ZSh0aGlzLl9kaWdDYWxsYmFjayk7XG59XG5cbi8qKlxuICogR2V0IGEgc3VpdGFibGUgd2FsbFxuICovXG5ST1QuTWFwLkRpZ2dlci5wcm90b3R5cGUuX2ZpbmRXYWxsID0gZnVuY3Rpb24oKSB7XG5cdHZhciBwcmlvMSA9IFtdO1xuXHR2YXIgcHJpbzIgPSBbXTtcblx0Zm9yICh2YXIgaWQgaW4gdGhpcy5fd2FsbHMpIHtcblx0XHR2YXIgcHJpbyA9IHRoaXMuX3dhbGxzW2lkXTtcblx0XHRpZiAocHJpbyA9PSAyKSB7IFxuXHRcdFx0cHJpbzIucHVzaChpZCk7IFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRwcmlvMS5wdXNoKGlkKTtcblx0XHR9XG5cdH1cblx0XG5cdHZhciBhcnIgPSAocHJpbzIubGVuZ3RoID8gcHJpbzIgOiBwcmlvMSk7XG5cdGlmICghYXJyLmxlbmd0aCkgeyByZXR1cm4gbnVsbDsgfSAvKiBubyB3YWxscyA6LyAqL1xuXHRcblx0dmFyIGlkID0gYXJyLnJhbmRvbSgpO1xuXHRkZWxldGUgdGhpcy5fd2FsbHNbaWRdO1xuXG5cdHJldHVybiBpZDtcbn1cblxuLyoqXG4gKiBUcmllcyBhZGRpbmcgYSBmZWF0dXJlXG4gKiBAcmV0dXJucyB7Ym9vbH0gd2FzIHRoaXMgYSBzdWNjZXNzZnVsIHRyeT9cbiAqL1xuUk9ULk1hcC5EaWdnZXIucHJvdG90eXBlLl90cnlGZWF0dXJlID0gZnVuY3Rpb24oeCwgeSwgZHgsIGR5KSB7XG5cdHZhciBmZWF0dXJlID0gUk9ULlJORy5nZXRXZWlnaHRlZFZhbHVlKHRoaXMuX2ZlYXR1cmVzKTtcblx0ZmVhdHVyZSA9IFJPVC5NYXAuRmVhdHVyZVtmZWF0dXJlXS5jcmVhdGVSYW5kb21BdCh4LCB5LCBkeCwgZHksIHRoaXMuX29wdGlvbnMpO1xuXHRcblx0aWYgKCFmZWF0dXJlLmlzVmFsaWQodGhpcy5faXNXYWxsQ2FsbGJhY2ssIHRoaXMuX2NhbkJlRHVnQ2FsbGJhY2spKSB7XG4vL1x0XHRjb25zb2xlLmxvZyhcIm5vdCB2YWxpZFwiKTtcbi8vXHRcdGZlYXR1cmUuZGVidWcoKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0XG5cdGZlYXR1cmUuY3JlYXRlKHRoaXMuX2RpZ0NhbGxiYWNrKTtcbi8vXHRmZWF0dXJlLmRlYnVnKCk7XG5cblx0aWYgKGZlYXR1cmUgaW5zdGFuY2VvZiBST1QuTWFwLkZlYXR1cmUuUm9vbSkgeyB0aGlzLl9yb29tcy5wdXNoKGZlYXR1cmUpOyB9XG5cdGlmIChmZWF0dXJlIGluc3RhbmNlb2YgUk9ULk1hcC5GZWF0dXJlLkNvcnJpZG9yKSB7IFxuXHRcdGZlYXR1cmUuY3JlYXRlUHJpb3JpdHlXYWxscyh0aGlzLl9wcmlvcml0eVdhbGxDYWxsYmFjayk7XG5cdFx0dGhpcy5fY29ycmlkb3JzLnB1c2goZmVhdHVyZSk7IFxuXHR9XG5cdFxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuUk9ULk1hcC5EaWdnZXIucHJvdG90eXBlLl9yZW1vdmVTdXJyb3VuZGluZ1dhbGxzID0gZnVuY3Rpb24oY3gsIGN5KSB7XG5cdHZhciBkZWx0YXMgPSBST1QuRElSU1s0XTtcblxuXHRmb3IgKHZhciBpPTA7aTxkZWx0YXMubGVuZ3RoO2krKykge1xuXHRcdHZhciBkZWx0YSA9IGRlbHRhc1tpXTtcblx0XHR2YXIgeCA9IGN4ICsgZGVsdGFbMF07XG5cdFx0dmFyIHkgPSBjeSArIGRlbHRhWzFdO1xuXHRcdGRlbGV0ZSB0aGlzLl93YWxsc1t4K1wiLFwiK3ldO1xuXHRcdHZhciB4ID0gY3ggKyAyKmRlbHRhWzBdO1xuXHRcdHZhciB5ID0gY3kgKyAyKmRlbHRhWzFdO1xuXHRcdGRlbGV0ZSB0aGlzLl93YWxsc1t4K1wiLFwiK3ldO1xuXHR9XG59XG5cbi8qKlxuICogUmV0dXJucyB2ZWN0b3IgaW4gXCJkaWdnaW5nXCIgZGlyZWN0aW9uLCBvciBmYWxzZSwgaWYgdGhpcyBkb2VzIG5vdCBleGlzdCAob3IgaXMgbm90IHVuaXF1ZSlcbiAqL1xuUk9ULk1hcC5EaWdnZXIucHJvdG90eXBlLl9nZXREaWdnaW5nRGlyZWN0aW9uID0gZnVuY3Rpb24oY3gsIGN5KSB7XG5cdHZhciByZXN1bHQgPSBudWxsO1xuXHR2YXIgZGVsdGFzID0gUk9ULkRJUlNbNF07XG5cdFxuXHRmb3IgKHZhciBpPTA7aTxkZWx0YXMubGVuZ3RoO2krKykge1xuXHRcdHZhciBkZWx0YSA9IGRlbHRhc1tpXTtcblx0XHR2YXIgeCA9IGN4ICsgZGVsdGFbMF07XG5cdFx0dmFyIHkgPSBjeSArIGRlbHRhWzFdO1xuXHRcdFxuXHRcdGlmICh4IDwgMCB8fCB5IDwgMCB8fCB4ID49IHRoaXMuX3dpZHRoIHx8IHkgPj0gdGhpcy5fd2lkdGgpIHsgcmV0dXJuIG51bGw7IH1cblx0XHRcblx0XHRpZiAoIXRoaXMuX21hcFt4XVt5XSkgeyAvKiB0aGVyZSBhbHJlYWR5IGlzIGFub3RoZXIgZW1wdHkgbmVpZ2hib3IhICovXG5cdFx0XHRpZiAocmVzdWx0KSB7IHJldHVybiBudWxsOyB9XG5cdFx0XHRyZXN1bHQgPSBkZWx0YTtcblx0XHR9XG5cdH1cblx0XG5cdC8qIG5vIGVtcHR5IG5laWdoYm9yICovXG5cdGlmICghcmVzdWx0KSB7IHJldHVybiBudWxsOyB9XG5cdFxuXHRyZXR1cm4gWy1yZXN1bHRbMF0sIC1yZXN1bHRbMV1dO1xufVxuXG4vKipcbiAqIEZpbmQgZW1wdHkgc3BhY2VzIHN1cnJvdW5kaW5nIHJvb21zLCBhbmQgYXBwbHkgZG9vcnMuXG4gKi9cblJPVC5NYXAuRGlnZ2VyLnByb3RvdHlwZS5fYWRkRG9vcnMgPSBmdW5jdGlvbigpIHtcblx0dmFyIGRhdGEgPSB0aGlzLl9tYXA7XG5cdHZhciBpc1dhbGxDYWxsYmFjayA9IGZ1bmN0aW9uKHgsIHkpIHtcblx0XHRyZXR1cm4gKGRhdGFbeF1beV0gPT0gMSk7XG5cdH1cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9yb29tcy5sZW5ndGg7IGkrKyApIHtcblx0XHR2YXIgcm9vbSA9IHRoaXMuX3Jvb21zW2ldO1xuXHRcdHJvb20uY2xlYXJEb29ycygpO1xuXHRcdHJvb20uYWRkRG9vcnMoaXNXYWxsQ2FsbGJhY2spO1xuXHR9XG59XG4vKipcbiAqIEBjbGFzcyBEdW5nZW9uIGdlbmVyYXRvciB3aGljaCB0cmllcyB0byBmaWxsIHRoZSBzcGFjZSBldmVubHkuIEdlbmVyYXRlcyBpbmRlcGVuZGVudCByb29tcyBhbmQgdHJpZXMgdG8gY29ubmVjdCB0aGVtLlxuICogQGF1Z21lbnRzIFJPVC5NYXAuRHVuZ2VvblxuICovXG5ST1QuTWFwLlVuaWZvcm0gPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0LCBvcHRpb25zKSB7XG5cdFJPVC5NYXAuRHVuZ2Vvbi5jYWxsKHRoaXMsIHdpZHRoLCBoZWlnaHQpO1xuXG5cdHRoaXMuX29wdGlvbnMgPSB7XG5cdFx0cm9vbVdpZHRoOiBbMywgOV0sIC8qIHJvb20gbWluaW11bSBhbmQgbWF4aW11bSB3aWR0aCAqL1xuXHRcdHJvb21IZWlnaHQ6IFszLCA1XSwgLyogcm9vbSBtaW5pbXVtIGFuZCBtYXhpbXVtIGhlaWdodCAqL1xuXHRcdHJvb21EdWdQZXJjZW50YWdlOiAwLjEsIC8qIHdlIHN0b3AgYWZ0ZXIgdGhpcyBwZXJjZW50YWdlIG9mIGxldmVsIGFyZWEgaGFzIGJlZW4gZHVnIG91dCBieSByb29tcyAqL1xuXHRcdHRpbWVMaW1pdDogMTAwMCAvKiB3ZSBzdG9wIGFmdGVyIHRoaXMgbXVjaCB0aW1lIGhhcyBwYXNzZWQgKG1zZWMpICovXG5cdH1cblx0Zm9yICh2YXIgcCBpbiBvcHRpb25zKSB7IHRoaXMuX29wdGlvbnNbcF0gPSBvcHRpb25zW3BdOyB9XG5cblx0dGhpcy5fcm9vbUF0dGVtcHRzID0gMjA7IC8qIG5ldyByb29tIGlzIGNyZWF0ZWQgTi10aW1lcyB1bnRpbCBpcyBjb25zaWRlcmVkIGFzIGltcG9zc2libGUgdG8gZ2VuZXJhdGUgKi9cblx0dGhpcy5fY29ycmlkb3JBdHRlbXB0cyA9IDIwOyAvKiBjb3JyaWRvcnMgYXJlIHRyaWVkIE4tdGltZXMgdW50aWwgdGhlIGxldmVsIGlzIGNvbnNpZGVyZWQgYXMgaW1wb3NzaWJsZSB0byBjb25uZWN0ICovXG5cblx0dGhpcy5fY29ubmVjdGVkID0gW107IC8qIGxpc3Qgb2YgYWxyZWFkeSBjb25uZWN0ZWQgcm9vbXMgKi9cblx0dGhpcy5fdW5jb25uZWN0ZWQgPSBbXTsgLyogbGlzdCBvZiByZW1haW5pbmcgdW5jb25uZWN0ZWQgcm9vbXMgKi9cblx0XG5cdHRoaXMuX2RpZ0NhbGxiYWNrID0gdGhpcy5fZGlnQ2FsbGJhY2suYmluZCh0aGlzKTtcblx0dGhpcy5fY2FuQmVEdWdDYWxsYmFjayA9IHRoaXMuX2NhbkJlRHVnQ2FsbGJhY2suYmluZCh0aGlzKTtcblx0dGhpcy5faXNXYWxsQ2FsbGJhY2sgPSB0aGlzLl9pc1dhbGxDYWxsYmFjay5iaW5kKHRoaXMpO1xufVxuUk9ULk1hcC5Vbmlmb3JtLmV4dGVuZChST1QuTWFwLkR1bmdlb24pO1xuXG4vKipcbiAqIENyZWF0ZSBhIG1hcC4gSWYgdGhlIHRpbWUgbGltaXQgaGFzIGJlZW4gaGl0LCByZXR1cm5zIG51bGwuXG4gKiBAc2VlIFJPVC5NYXAjY3JlYXRlXG4gKi9cblJPVC5NYXAuVW5pZm9ybS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0dmFyIHQxID0gRGF0ZS5ub3coKTtcblx0d2hpbGUgKDEpIHtcblx0XHR2YXIgdDIgPSBEYXRlLm5vdygpO1xuXHRcdGlmICh0MiAtIHQxID4gdGhpcy5fb3B0aW9ucy50aW1lTGltaXQpIHsgcmV0dXJuIG51bGw7IH0gLyogdGltZSBsaW1pdCEgKi9cblx0XG5cdFx0dGhpcy5fbWFwID0gdGhpcy5fZmlsbE1hcCgxKTtcblx0XHR0aGlzLl9kdWcgPSAwO1xuXHRcdHRoaXMuX3Jvb21zID0gW107XG5cdFx0dGhpcy5fdW5jb25uZWN0ZWQgPSBbXTtcblx0XHR0aGlzLl9nZW5lcmF0ZVJvb21zKCk7XG5cdFx0aWYgKHRoaXMuX3Jvb21zLmxlbmd0aCA8IDIpIHsgY29udGludWU7IH1cblx0XHRpZiAodGhpcy5fZ2VuZXJhdGVDb3JyaWRvcnMoKSkgeyBicmVhazsgfVxuXHR9XG5cdFxuXHRpZiAoY2FsbGJhY2spIHtcblx0XHRmb3IgKHZhciBpPTA7aTx0aGlzLl93aWR0aDtpKyspIHtcblx0XHRcdGZvciAodmFyIGo9MDtqPHRoaXMuX2hlaWdodDtqKyspIHtcblx0XHRcdFx0Y2FsbGJhY2soaSwgaiwgdGhpcy5fbWFwW2ldW2pdKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHN1aXRhYmxlIGFtb3VudCBvZiByb29tc1xuICovXG5ST1QuTWFwLlVuaWZvcm0ucHJvdG90eXBlLl9nZW5lcmF0ZVJvb21zID0gZnVuY3Rpb24oKSB7XG5cdHZhciB3ID0gdGhpcy5fd2lkdGgtMjtcblx0dmFyIGggPSB0aGlzLl9oZWlnaHQtMjtcblxuXHRkbyB7XG5cdFx0dmFyIHJvb20gPSB0aGlzLl9nZW5lcmF0ZVJvb20oKTtcblx0XHRpZiAodGhpcy5fZHVnLyh3KmgpID4gdGhpcy5fb3B0aW9ucy5yb29tRHVnUGVyY2VudGFnZSkgeyBicmVhazsgfSAvKiBhY2hpZXZlZCByZXF1ZXN0ZWQgYW1vdW50IG9mIGZyZWUgc3BhY2UgKi9cblx0fSB3aGlsZSAocm9vbSk7XG5cblx0LyogZWl0aGVyIGVub3VnaCByb29tcywgb3Igbm90IGFibGUgdG8gZ2VuZXJhdGUgbW9yZSBvZiB0aGVtIDopICovXG59XG5cbi8qKlxuICogVHJ5IHRvIGdlbmVyYXRlIG9uZSByb29tXG4gKi9cblJPVC5NYXAuVW5pZm9ybS5wcm90b3R5cGUuX2dlbmVyYXRlUm9vbSA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgY291bnQgPSAwO1xuXHR3aGlsZSAoY291bnQgPCB0aGlzLl9yb29tQXR0ZW1wdHMpIHtcblx0XHRjb3VudCsrO1xuXHRcdFxuXHRcdHZhciByb29tID0gUk9ULk1hcC5GZWF0dXJlLlJvb20uY3JlYXRlUmFuZG9tKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQsIHRoaXMuX29wdGlvbnMpO1xuXHRcdGlmICghcm9vbS5pc1ZhbGlkKHRoaXMuX2lzV2FsbENhbGxiYWNrLCB0aGlzLl9jYW5CZUR1Z0NhbGxiYWNrKSkgeyBjb250aW51ZTsgfVxuXHRcdFxuXHRcdHJvb20uY3JlYXRlKHRoaXMuX2RpZ0NhbGxiYWNrKTtcblx0XHR0aGlzLl9yb29tcy5wdXNoKHJvb20pO1xuXHRcdHJldHVybiByb29tO1xuXHR9IFxuXG5cdC8qIG5vIHJvb20gd2FzIGdlbmVyYXRlZCBpbiBhIGdpdmVuIG51bWJlciBvZiBhdHRlbXB0cyAqL1xuXHRyZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgY29ubmVjdG9ycyBiZXdlZW4gcm9vbXNcbiAqIEByZXR1cm5zIHtib29sfSBzdWNjZXNzIFdhcyB0aGlzIGF0dGVtcHQgc3VjY2Vzc2Z1bGw/XG4gKi9cblJPVC5NYXAuVW5pZm9ybS5wcm90b3R5cGUuX2dlbmVyYXRlQ29ycmlkb3JzID0gZnVuY3Rpb24oKSB7XG5cdHZhciBjbnQgPSAwO1xuXHR3aGlsZSAoY250IDwgdGhpcy5fY29ycmlkb3JBdHRlbXB0cykge1xuXHRcdGNudCsrO1xuXHRcdHRoaXMuX2NvcnJpZG9ycyA9IFtdO1xuXG5cdFx0LyogZGlnIHJvb21zIGludG8gYSBjbGVhciBtYXAgKi9cblx0XHR0aGlzLl9tYXAgPSB0aGlzLl9maWxsTWFwKDEpO1xuXHRcdGZvciAodmFyIGk9MDtpPHRoaXMuX3Jvb21zLmxlbmd0aDtpKyspIHsgXG5cdFx0XHR2YXIgcm9vbSA9IHRoaXMuX3Jvb21zW2ldO1xuXHRcdFx0cm9vbS5jbGVhckRvb3JzKCk7XG5cdFx0XHRyb29tLmNyZWF0ZSh0aGlzLl9kaWdDYWxsYmFjayk7IFxuXHRcdH1cblxuXHRcdHRoaXMuX3VuY29ubmVjdGVkID0gdGhpcy5fcm9vbXMuc2xpY2UoKS5yYW5kb21pemUoKTtcblx0XHR0aGlzLl9jb25uZWN0ZWQgPSBbXTtcblx0XHRpZiAodGhpcy5fdW5jb25uZWN0ZWQubGVuZ3RoKSB7IHRoaXMuX2Nvbm5lY3RlZC5wdXNoKHRoaXMuX3VuY29ubmVjdGVkLnBvcCgpKTsgfSAvKiBmaXJzdCBvbmUgaXMgYWx3YXlzIGNvbm5lY3RlZCAqL1xuXHRcdFxuXHRcdHdoaWxlICgxKSB7XG5cdFx0XHQvKiAxLiBwaWNrIHJhbmRvbSBjb25uZWN0ZWQgcm9vbSAqL1xuXHRcdFx0dmFyIGNvbm5lY3RlZCA9IHRoaXMuX2Nvbm5lY3RlZC5yYW5kb20oKTtcblx0XHRcdFxuXHRcdFx0LyogMi4gZmluZCBjbG9zZXN0IHVuY29ubmVjdGVkICovXG5cdFx0XHR2YXIgcm9vbTEgPSB0aGlzLl9jbG9zZXN0Um9vbSh0aGlzLl91bmNvbm5lY3RlZCwgY29ubmVjdGVkKTtcblx0XHRcdFxuXHRcdFx0LyogMy4gY29ubmVjdCBpdCB0byBjbG9zZXN0IGNvbm5lY3RlZCAqL1xuXHRcdFx0dmFyIHJvb20yID0gdGhpcy5fY2xvc2VzdFJvb20odGhpcy5fY29ubmVjdGVkLCByb29tMSk7XG5cdFx0XHRcblx0XHRcdHZhciBvayA9IHRoaXMuX2Nvbm5lY3RSb29tcyhyb29tMSwgcm9vbTIpO1xuXHRcdFx0aWYgKCFvaykgeyBicmVhazsgfSAvKiBzdG9wIGNvbm5lY3RpbmcsIHJlLXNodWZmbGUgKi9cblx0XHRcdFxuXHRcdFx0aWYgKCF0aGlzLl91bmNvbm5lY3RlZC5sZW5ndGgpIHsgcmV0dXJuIHRydWU7IH0gLyogZG9uZTsgbm8gcm9vbXMgcmVtYWluICovXG5cdFx0fVxuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBGb3IgYSBnaXZlbiByb29tLCBmaW5kIHRoZSBjbG9zZXN0IG9uZSBmcm9tIHRoZSBsaXN0XG4gKi9cblJPVC5NYXAuVW5pZm9ybS5wcm90b3R5cGUuX2Nsb3Nlc3RSb29tID0gZnVuY3Rpb24ocm9vbXMsIHJvb20pIHtcblx0dmFyIGRpc3QgPSBJbmZpbml0eTtcblx0dmFyIGNlbnRlciA9IHJvb20uZ2V0Q2VudGVyKCk7XG5cdHZhciByZXN1bHQgPSBudWxsO1xuXHRcblx0Zm9yICh2YXIgaT0wO2k8cm9vbXMubGVuZ3RoO2krKykge1xuXHRcdHZhciByID0gcm9vbXNbaV07XG5cdFx0dmFyIGMgPSByLmdldENlbnRlcigpO1xuXHRcdHZhciBkeCA9IGNbMF0tY2VudGVyWzBdO1xuXHRcdHZhciBkeSA9IGNbMV0tY2VudGVyWzFdO1xuXHRcdHZhciBkID0gZHgqZHgrZHkqZHk7XG5cdFx0XG5cdFx0aWYgKGQgPCBkaXN0KSB7XG5cdFx0XHRkaXN0ID0gZDtcblx0XHRcdHJlc3VsdCA9IHI7XG5cdFx0fVxuXHR9XG5cdFxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG5ST1QuTWFwLlVuaWZvcm0ucHJvdG90eXBlLl9jb25uZWN0Um9vbXMgPSBmdW5jdGlvbihyb29tMSwgcm9vbTIpIHtcblx0Lypcblx0XHRyb29tMS5kZWJ1ZygpO1xuXHRcdHJvb20yLmRlYnVnKCk7XG5cdCovXG5cblx0dmFyIGNlbnRlcjEgPSByb29tMS5nZXRDZW50ZXIoKTtcblx0dmFyIGNlbnRlcjIgPSByb29tMi5nZXRDZW50ZXIoKTtcblxuXHR2YXIgZGlmZlggPSBjZW50ZXIyWzBdIC0gY2VudGVyMVswXTtcblx0dmFyIGRpZmZZID0gY2VudGVyMlsxXSAtIGNlbnRlcjFbMV07XG5cblx0aWYgKE1hdGguYWJzKGRpZmZYKSA8IE1hdGguYWJzKGRpZmZZKSkgeyAvKiBmaXJzdCB0cnkgY29ubmVjdGluZyBub3J0aC1zb3V0aCB3YWxscyAqL1xuXHRcdHZhciBkaXJJbmRleDEgPSAoZGlmZlkgPiAwID8gMiA6IDApO1xuXHRcdHZhciBkaXJJbmRleDIgPSAoZGlySW5kZXgxICsgMikgJSA0O1xuXHRcdHZhciBtaW4gPSByb29tMi5nZXRMZWZ0KCk7XG5cdFx0dmFyIG1heCA9IHJvb20yLmdldFJpZ2h0KCk7XG5cdFx0dmFyIGluZGV4ID0gMDtcblx0fSBlbHNlIHsgLyogZmlyc3QgdHJ5IGNvbm5lY3RpbmcgZWFzdC13ZXN0IHdhbGxzICovXG5cdFx0dmFyIGRpckluZGV4MSA9IChkaWZmWCA+IDAgPyAxIDogMyk7XG5cdFx0dmFyIGRpckluZGV4MiA9IChkaXJJbmRleDEgKyAyKSAlIDQ7XG5cdFx0dmFyIG1pbiA9IHJvb20yLmdldFRvcCgpO1xuXHRcdHZhciBtYXggPSByb29tMi5nZXRCb3R0b20oKTtcblx0XHR2YXIgaW5kZXggPSAxO1xuXHR9XG5cblx0dmFyIHN0YXJ0ID0gdGhpcy5fcGxhY2VJbldhbGwocm9vbTEsIGRpckluZGV4MSk7IC8qIGNvcnJpZG9yIHdpbGwgc3RhcnQgaGVyZSAqL1xuXHRpZiAoIXN0YXJ0KSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdGlmIChzdGFydFtpbmRleF0gPj0gbWluICYmIHN0YXJ0W2luZGV4XSA8PSBtYXgpIHsgLyogcG9zc2libGUgdG8gY29ubmVjdCB3aXRoIHN0cmFpZ2h0IGxpbmUgKEktbGlrZSkgKi9cblx0XHR2YXIgZW5kID0gc3RhcnQuc2xpY2UoKTtcblx0XHR2YXIgdmFsdWUgPSBudWxsO1xuXHRcdHN3aXRjaCAoZGlySW5kZXgyKSB7XG5cdFx0XHRjYXNlIDA6IHZhbHVlID0gcm9vbTIuZ2V0VG9wKCktMTsgYnJlYWs7XG5cdFx0XHRjYXNlIDE6IHZhbHVlID0gcm9vbTIuZ2V0UmlnaHQoKSsxOyBicmVhaztcblx0XHRcdGNhc2UgMjogdmFsdWUgPSByb29tMi5nZXRCb3R0b20oKSsxOyBicmVhaztcblx0XHRcdGNhc2UgMzogdmFsdWUgPSByb29tMi5nZXRMZWZ0KCktMTsgYnJlYWs7XG5cdFx0fVxuXHRcdGVuZFsoaW5kZXgrMSklMl0gPSB2YWx1ZTtcblx0XHR0aGlzLl9kaWdMaW5lKFtzdGFydCwgZW5kXSk7XG5cdFx0XG5cdH0gZWxzZSBpZiAoc3RhcnRbaW5kZXhdIDwgbWluLTEgfHwgc3RhcnRbaW5kZXhdID4gbWF4KzEpIHsgLyogbmVlZCB0byBzd2l0Y2ggdGFyZ2V0IHdhbGwgKEwtbGlrZSkgKi9cblxuXHRcdHZhciBkaWZmID0gc3RhcnRbaW5kZXhdIC0gY2VudGVyMltpbmRleF07XG5cdFx0c3dpdGNoIChkaXJJbmRleDIpIHtcblx0XHRcdGNhc2UgMDpcblx0XHRcdGNhc2UgMTpcdHZhciByb3RhdGlvbiA9IChkaWZmIDwgMCA/IDMgOiAxKTsgYnJlYWs7XG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRjYXNlIDM6XHR2YXIgcm90YXRpb24gPSAoZGlmZiA8IDAgPyAxIDogMyk7IGJyZWFrO1xuXHRcdH1cblx0XHRkaXJJbmRleDIgPSAoZGlySW5kZXgyICsgcm90YXRpb24pICUgNDtcblx0XHRcblx0XHR2YXIgZW5kID0gdGhpcy5fcGxhY2VJbldhbGwocm9vbTIsIGRpckluZGV4Mik7XG5cdFx0aWYgKCFlbmQpIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0XHR2YXIgbWlkID0gWzAsIDBdO1xuXHRcdG1pZFtpbmRleF0gPSBzdGFydFtpbmRleF07XG5cdFx0dmFyIGluZGV4MiA9IChpbmRleCsxKSUyO1xuXHRcdG1pZFtpbmRleDJdID0gZW5kW2luZGV4Ml07XG5cdFx0dGhpcy5fZGlnTGluZShbc3RhcnQsIG1pZCwgZW5kXSk7XG5cdFx0XG5cdH0gZWxzZSB7IC8qIHVzZSBjdXJyZW50IHdhbGwgcGFpciwgYnV0IGFkanVzdCB0aGUgbGluZSBpbiB0aGUgbWlkZGxlIChTLWxpa2UpICovXG5cdFxuXHRcdHZhciBpbmRleDIgPSAoaW5kZXgrMSklMjtcblx0XHR2YXIgZW5kID0gdGhpcy5fcGxhY2VJbldhbGwocm9vbTIsIGRpckluZGV4Mik7XG5cdFx0aWYgKCFlbmQpIHsgcmV0dXJuOyB9XG5cdFx0dmFyIG1pZCA9IE1hdGgucm91bmQoKGVuZFtpbmRleDJdICsgc3RhcnRbaW5kZXgyXSkvMik7XG5cblx0XHR2YXIgbWlkMSA9IFswLCAwXTtcblx0XHR2YXIgbWlkMiA9IFswLCAwXTtcblx0XHRtaWQxW2luZGV4XSA9IHN0YXJ0W2luZGV4XTtcblx0XHRtaWQxW2luZGV4Ml0gPSBtaWQ7XG5cdFx0bWlkMltpbmRleF0gPSBlbmRbaW5kZXhdO1xuXHRcdG1pZDJbaW5kZXgyXSA9IG1pZDtcblx0XHR0aGlzLl9kaWdMaW5lKFtzdGFydCwgbWlkMSwgbWlkMiwgZW5kXSk7XG5cdH1cblxuXHRyb29tMS5hZGREb29yKHN0YXJ0WzBdLCBzdGFydFsxXSk7XG5cdHJvb20yLmFkZERvb3IoZW5kWzBdLCBlbmRbMV0pO1xuXHRcblx0dmFyIGluZGV4ID0gdGhpcy5fdW5jb25uZWN0ZWQuaW5kZXhPZihyb29tMSk7XG5cdGlmIChpbmRleCAhPSAtMSkge1xuXHRcdHRoaXMuX3VuY29ubmVjdGVkLnNwbGljZShpbmRleCwgMSk7XG5cdFx0dGhpcy5fY29ubmVjdGVkLnB1c2gocm9vbTEpO1xuXHR9XG5cblx0dmFyIGluZGV4ID0gdGhpcy5fdW5jb25uZWN0ZWQuaW5kZXhPZihyb29tMik7XG5cdGlmIChpbmRleCAhPSAtMSkge1xuXHRcdHRoaXMuX3VuY29ubmVjdGVkLnNwbGljZShpbmRleCwgMSk7XG5cdFx0dGhpcy5fY29ubmVjdGVkLnB1c2gocm9vbTIpO1xuXHR9XG5cdFxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuUk9ULk1hcC5Vbmlmb3JtLnByb3RvdHlwZS5fcGxhY2VJbldhbGwgPSBmdW5jdGlvbihyb29tLCBkaXJJbmRleCkge1xuXHR2YXIgc3RhcnQgPSBbMCwgMF07XG5cdHZhciBkaXIgPSBbMCwgMF07XG5cdHZhciBsZW5ndGggPSAwO1xuXHRcblx0c3dpdGNoIChkaXJJbmRleCkge1xuXHRcdGNhc2UgMDpcblx0XHRcdGRpciA9IFsxLCAwXTtcblx0XHRcdHN0YXJ0ID0gW3Jvb20uZ2V0TGVmdCgpLCByb29tLmdldFRvcCgpLTFdO1xuXHRcdFx0bGVuZ3RoID0gcm9vbS5nZXRSaWdodCgpLXJvb20uZ2V0TGVmdCgpKzE7XG5cdFx0YnJlYWs7XG5cdFx0Y2FzZSAxOlxuXHRcdFx0ZGlyID0gWzAsIDFdO1xuXHRcdFx0c3RhcnQgPSBbcm9vbS5nZXRSaWdodCgpKzEsIHJvb20uZ2V0VG9wKCldO1xuXHRcdFx0bGVuZ3RoID0gcm9vbS5nZXRCb3R0b20oKS1yb29tLmdldFRvcCgpKzE7XG5cdFx0YnJlYWs7XG5cdFx0Y2FzZSAyOlxuXHRcdFx0ZGlyID0gWzEsIDBdO1xuXHRcdFx0c3RhcnQgPSBbcm9vbS5nZXRMZWZ0KCksIHJvb20uZ2V0Qm90dG9tKCkrMV07XG5cdFx0XHRsZW5ndGggPSByb29tLmdldFJpZ2h0KCktcm9vbS5nZXRMZWZ0KCkrMTtcblx0XHRicmVhaztcblx0XHRjYXNlIDM6XG5cdFx0XHRkaXIgPSBbMCwgMV07XG5cdFx0XHRzdGFydCA9IFtyb29tLmdldExlZnQoKS0xLCByb29tLmdldFRvcCgpXTtcblx0XHRcdGxlbmd0aCA9IHJvb20uZ2V0Qm90dG9tKCktcm9vbS5nZXRUb3AoKSsxO1xuXHRcdGJyZWFrO1xuXHR9XG5cdFxuXHR2YXIgYXZhaWwgPSBbXTtcblx0dmFyIGxhc3RCYWRJbmRleCA9IC0yO1xuXG5cdGZvciAodmFyIGk9MDtpPGxlbmd0aDtpKyspIHtcblx0XHR2YXIgeCA9IHN0YXJ0WzBdICsgaSpkaXJbMF07XG5cdFx0dmFyIHkgPSBzdGFydFsxXSArIGkqZGlyWzFdO1xuXHRcdGF2YWlsLnB1c2gobnVsbCk7XG5cdFx0XG5cdFx0dmFyIGlzV2FsbCA9ICh0aGlzLl9tYXBbeF1beV0gPT0gMSk7XG5cdFx0aWYgKGlzV2FsbCkge1xuXHRcdFx0aWYgKGxhc3RCYWRJbmRleCAhPSBpLTEpIHsgYXZhaWxbaV0gPSBbeCwgeV07IH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0bGFzdEJhZEluZGV4ID0gaTtcblx0XHRcdGlmIChpKSB7IGF2YWlsW2ktMV0gPSBudWxsOyB9XG5cdFx0fVxuXHR9XG5cdFxuXHRmb3IgKHZhciBpPWF2YWlsLmxlbmd0aC0xOyBpPj0wOyBpLS0pIHtcblx0XHRpZiAoIWF2YWlsW2ldKSB7IGF2YWlsLnNwbGljZShpLCAxKTsgfVxuXHR9XG5cdHJldHVybiAoYXZhaWwubGVuZ3RoID8gYXZhaWwucmFuZG9tKCkgOiBudWxsKTtcbn1cblxuLyoqXG4gKiBEaWcgYSBwb2x5bGluZS5cbiAqL1xuUk9ULk1hcC5Vbmlmb3JtLnByb3RvdHlwZS5fZGlnTGluZSA9IGZ1bmN0aW9uKHBvaW50cykge1xuXHRmb3IgKHZhciBpPTE7aTxwb2ludHMubGVuZ3RoO2krKykge1xuXHRcdHZhciBzdGFydCA9IHBvaW50c1tpLTFdO1xuXHRcdHZhciBlbmQgPSBwb2ludHNbaV07XG5cdFx0dmFyIGNvcnJpZG9yID0gbmV3IFJPVC5NYXAuRmVhdHVyZS5Db3JyaWRvcihzdGFydFswXSwgc3RhcnRbMV0sIGVuZFswXSwgZW5kWzFdKTtcblx0XHRjb3JyaWRvci5jcmVhdGUodGhpcy5fZGlnQ2FsbGJhY2spO1xuXHRcdHRoaXMuX2NvcnJpZG9ycy5wdXNoKGNvcnJpZG9yKTtcblx0fVxufVxuXG5ST1QuTWFwLlVuaWZvcm0ucHJvdG90eXBlLl9kaWdDYWxsYmFjayA9IGZ1bmN0aW9uKHgsIHksIHZhbHVlKSB7XG5cdHRoaXMuX21hcFt4XVt5XSA9IHZhbHVlO1xuXHRpZiAodmFsdWUgPT0gMCkgeyB0aGlzLl9kdWcrKzsgfVxufVxuXG5ST1QuTWFwLlVuaWZvcm0ucHJvdG90eXBlLl9pc1dhbGxDYWxsYmFjayA9IGZ1bmN0aW9uKHgsIHkpIHtcblx0aWYgKHggPCAwIHx8IHkgPCAwIHx8IHggPj0gdGhpcy5fd2lkdGggfHwgeSA+PSB0aGlzLl9oZWlnaHQpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdHJldHVybiAodGhpcy5fbWFwW3hdW3ldID09IDEpO1xufVxuXG5ST1QuTWFwLlVuaWZvcm0ucHJvdG90eXBlLl9jYW5CZUR1Z0NhbGxiYWNrID0gZnVuY3Rpb24oeCwgeSkge1xuXHRpZiAoeCA8IDEgfHwgeSA8IDEgfHwgeCsxID49IHRoaXMuX3dpZHRoIHx8IHkrMSA+PSB0aGlzLl9oZWlnaHQpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdHJldHVybiAodGhpcy5fbWFwW3hdW3ldID09IDEpO1xufVxuXG4vKipcbiAqIEBhdXRob3IgaHlha3VnZWlcbiAqIEBjbGFzcyBEdW5nZW9uIGdlbmVyYXRvciB3aGljaCB1c2VzIHRoZSBcIm9yZ2luYWxcIiBSb2d1ZSBkdW5nZW9uIGdlbmVyYXRpb24gYWxnb3JpdGhtLiBTZWUgaHR0cDovL2t1b2kuY29tL35rYW1pa2F6ZS9HYW1lRGVzaWduL2FydDA3X3JvZ3VlX2R1bmdlb24ucGhwXG4gKiBAYXVnbWVudHMgUk9ULk1hcFxuICogQHBhcmFtIHtpbnR9IFt3aWR0aD1ST1QuREVGQVVMVF9XSURUSF1cbiAqIEBwYXJhbSB7aW50fSBbaGVpZ2h0PVJPVC5ERUZBVUxUX0hFSUdIVF1cbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc10gT3B0aW9uc1xuICogQHBhcmFtIHtpbnRbXX0gW29wdGlvbnMuY2VsbFdpZHRoPTNdIE51bWJlciBvZiBjZWxscyB0byBjcmVhdGUgb24gdGhlIGhvcml6b250YWwgKG51bWJlciBvZiByb29tcyBob3Jpem9udGFsbHkpXG4gKiBAcGFyYW0ge2ludFtdfSBbb3B0aW9ucy5jZWxsSGVpZ2h0PTNdIE51bWJlciBvZiBjZWxscyB0byBjcmVhdGUgb24gdGhlIHZlcnRpY2FsIChudW1iZXIgb2Ygcm9vbXMgdmVydGljYWxseSkgXG4gKiBAcGFyYW0ge2ludH0gW29wdGlvbnMucm9vbVdpZHRoXSBSb29tIG1pbiBhbmQgbWF4IHdpZHRoIC0gbm9ybWFsbHkgc2V0IGF1dG8tbWFnaWNhbGx5IHZpYSB0aGUgY29uc3RydWN0b3IuXG4gKiBAcGFyYW0ge2ludH0gW29wdGlvbnMucm9vbUhlaWdodF0gUm9vbSBtaW4gYW5kIG1heCBoZWlnaHQgLSBub3JtYWxseSBzZXQgYXV0by1tYWdpY2FsbHkgdmlhIHRoZSBjb25zdHJ1Y3Rvci4gXG4gKi9cblJPVC5NYXAuUm9ndWUgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0LCBvcHRpb25zKSB7XG5cdFJPVC5NYXAuY2FsbCh0aGlzLCB3aWR0aCwgaGVpZ2h0KTtcblx0XG5cdHRoaXMuX29wdGlvbnMgPSB7XG5cdFx0Y2VsbFdpZHRoOiAzLCAgLy8gTk9URSB0byBzZWxmLCB0aGVzZSBjb3VsZCBwcm9iYWJseSB3b3JrIHRoZSBzYW1lIGFzIHRoZSByb29tV2lkdGgvcm9vbSBIZWlnaHQgdmFsdWVzXG5cdFx0Y2VsbEhlaWdodDogMyAgLy8gICAgIGllLiBhcyBhbiBhcnJheSB3aXRoIG1pbi1tYXggdmFsdWVzIGZvciBlYWNoIGRpcmVjdGlvbi4uLi5cblx0fVxuXHRcblx0Zm9yICh2YXIgcCBpbiBvcHRpb25zKSB7IHRoaXMuX29wdGlvbnNbcF0gPSBvcHRpb25zW3BdOyB9XG5cdFxuXHQvKlxuXHRTZXQgdGhlIHJvb20gc2l6ZXMgYWNjb3JkaW5nIHRvIHRoZSBvdmVyLWFsbCB3aWR0aCBvZiB0aGUgbWFwLCBcblx0YW5kIHRoZSBjZWxsIHNpemVzLiBcblx0Ki9cblx0XG5cdGlmICghdGhpcy5fb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShcInJvb21XaWR0aFwiKSkge1xuXHRcdHRoaXMuX29wdGlvbnNbXCJyb29tV2lkdGhcIl0gPSB0aGlzLl9jYWxjdWxhdGVSb29tU2l6ZSh3aWR0aCwgdGhpcy5fb3B0aW9uc1tcImNlbGxXaWR0aFwiXSk7XG5cdH1cblx0aWYgKCF0aGlzLl9vcHRpb25zLmhhc093blByb3BlcnR5W1wicm9vbUhlaWdodFwiXSkge1xuXHRcdHRoaXMuX29wdGlvbnNbXCJyb29tSGVpZ2h0XCJdID0gdGhpcy5fY2FsY3VsYXRlUm9vbVNpemUoaGVpZ2h0LCB0aGlzLl9vcHRpb25zW1wiY2VsbEhlaWdodFwiXSk7XG5cdH1cblx0XG59XG5cblJPVC5NYXAuUm9ndWUuZXh0ZW5kKFJPVC5NYXApOyBcblxuLyoqXG4gKiBAc2VlIFJPVC5NYXAjY3JlYXRlXG4gKi9cblJPVC5NYXAuUm9ndWUucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdHRoaXMubWFwID0gdGhpcy5fZmlsbE1hcCgxKTtcblx0dGhpcy5yb29tcyA9IFtdO1xuXHR0aGlzLmNvbm5lY3RlZENlbGxzID0gW107XG5cdFxuXHR0aGlzLl9pbml0Um9vbXMoKTtcblx0dGhpcy5fY29ubmVjdFJvb21zKCk7XG5cdHRoaXMuX2Nvbm5lY3RVbmNvbm5lY3RlZFJvb21zKCk7XG5cdHRoaXMuX2NyZWF0ZVJhbmRvbVJvb21Db25uZWN0aW9ucygpO1xuXHR0aGlzLl9jcmVhdGVSb29tcygpO1xuXHR0aGlzLl9jcmVhdGVDb3JyaWRvcnMoKTtcblx0XG5cdGlmIChjYWxsYmFjaykge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fd2lkdGg7IGkrKykge1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLl9oZWlnaHQ7IGorKykge1xuXHRcdFx0XHRjYWxsYmFjayhpLCBqLCB0aGlzLm1hcFtpXVtqXSk7ICAgXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdFxuXHRyZXR1cm4gdGhpcztcbn1cblxuUk9ULk1hcC5Sb2d1ZS5wcm90b3R5cGUuX2dldFJhbmRvbUludCA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG5cdHJldHVybiBNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcbn1cblxuUk9ULk1hcC5Sb2d1ZS5wcm90b3R5cGUuX2NhbGN1bGF0ZVJvb21TaXplID0gZnVuY3Rpb24oc2l6ZSwgY2VsbCkge1xuXHR2YXIgbWF4ID0gTWF0aC5mbG9vcigoc2l6ZS9jZWxsKSAqIDAuOCk7XG5cdHZhciBtaW4gPSBNYXRoLmZsb29yKChzaXplL2NlbGwpICogMC4yNSk7XG5cdGlmIChtaW4gPCAyKSBtaW4gPSAyO1xuXHRpZiAobWF4IDwgMikgbWF4ID0gMjtcblx0cmV0dXJuIFttaW4sIG1heF07XG59XG5cblJPVC5NYXAuUm9ndWUucHJvdG90eXBlLl9pbml0Um9vbXMgPSBmdW5jdGlvbiAoKSB7IFxuXHQvLyBjcmVhdGUgcm9vbXMgYXJyYXkuIFRoaXMgaXMgdGhlIFwiZ3JpZFwiIGxpc3QgZnJvbSB0aGUgYWxnby4gIFxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX29wdGlvbnMuY2VsbFdpZHRoOyBpKyspIHsgIFxuXHRcdHRoaXMucm9vbXMucHVzaChbXSk7XG5cdFx0Zm9yKHZhciBqID0gMDsgaiA8IHRoaXMuX29wdGlvbnMuY2VsbEhlaWdodDsgaisrKSB7XG5cdFx0XHR0aGlzLnJvb21zW2ldLnB1c2goe1wieFwiOjAsIFwieVwiOjAsIFwid2lkdGhcIjowLCBcImhlaWdodFwiOjAsIFwiY29ubmVjdGlvbnNcIjpbXSwgXCJjZWxseFwiOmksIFwiY2VsbHlcIjpqfSk7XG5cdFx0fVxuXHR9XG59XG5cblJPVC5NYXAuUm9ndWUucHJvdG90eXBlLl9jb25uZWN0Um9vbXMgPSBmdW5jdGlvbigpIHtcblx0Ly9waWNrIHJhbmRvbSBzdGFydGluZyBncmlkXG5cdHZhciBjZ3ggPSB0aGlzLl9nZXRSYW5kb21JbnQoMCwgdGhpcy5fb3B0aW9ucy5jZWxsV2lkdGgtMSk7XG5cdHZhciBjZ3kgPSB0aGlzLl9nZXRSYW5kb21JbnQoMCwgdGhpcy5fb3B0aW9ucy5jZWxsSGVpZ2h0LTEpO1xuXHRcblx0dmFyIGlkeDtcblx0dmFyIG5jZ3g7XG5cdHZhciBuY2d5O1xuXHRcblx0dmFyIGZvdW5kID0gZmFsc2U7XG5cdHZhciByb29tO1xuXHR2YXIgb3RoZXJSb29tO1xuXHRcblx0Ly8gZmluZCAgdW5jb25uZWN0ZWQgbmVpZ2hib3VyIGNlbGxzXG5cdGRvIHtcblx0XG5cdFx0Ly92YXIgZGlyVG9DaGVjayA9IFswLDEsMiwzLDQsNSw2LDddO1xuXHRcdHZhciBkaXJUb0NoZWNrID0gWzAsMiw0LDZdO1xuXHRcdGRpclRvQ2hlY2sgPSBkaXJUb0NoZWNrLnJhbmRvbWl6ZSgpO1xuXHRcdFxuXHRcdGRvIHtcblx0XHRcdGZvdW5kID0gZmFsc2U7XG5cdFx0XHRpZHggPSBkaXJUb0NoZWNrLnBvcCgpO1xuXHRcdFx0XG5cdFx0XHRcblx0XHRcdG5jZ3ggPSBjZ3ggKyBST1QuRElSU1s4XVtpZHhdWzBdO1xuXHRcdFx0bmNneSA9IGNneSArIFJPVC5ESVJTWzhdW2lkeF1bMV07XG5cdFx0XHRcblx0XHRcdGlmKG5jZ3ggPCAwIHx8IG5jZ3ggPj0gdGhpcy5fb3B0aW9ucy5jZWxsV2lkdGgpIGNvbnRpbnVlO1xuXHRcdFx0aWYobmNneSA8IDAgfHwgbmNneSA+PSB0aGlzLl9vcHRpb25zLmNlbGxIZWlnaHQpIGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHRyb29tID0gdGhpcy5yb29tc1tjZ3hdW2NneV07XG5cdFx0XHRcblx0XHRcdGlmKHJvb21bXCJjb25uZWN0aW9uc1wiXS5sZW5ndGggPiAwKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBhcyBsb25nIGFzIHRoaXMgcm9vbSBkb2Vzbid0IGFscmVhZHkgY29vbmVjdCB0byBtZSwgd2UgYXJlIG9rIHdpdGggaXQuIFxuXHRcdFx0XHRpZihyb29tW1wiY29ubmVjdGlvbnNcIl1bMF1bMF0gPT0gbmNneCAmJlxuXHRcdFx0XHRyb29tW1wiY29ubmVjdGlvbnNcIl1bMF1bMV0gPT0gbmNneSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdG90aGVyUm9vbSA9IHRoaXMucm9vbXNbbmNneF1bbmNneV07XG5cdFx0XHRcblx0XHRcdGlmIChvdGhlclJvb21bXCJjb25uZWN0aW9uc1wiXS5sZW5ndGggPT0gMCkgeyBcblx0XHRcdFx0b3RoZXJSb29tW1wiY29ubmVjdGlvbnNcIl0ucHVzaChbY2d4LGNneV0pO1xuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5jb25uZWN0ZWRDZWxscy5wdXNoKFtuY2d4LCBuY2d5XSk7XG5cdFx0XHRcdGNneCA9IG5jZ3g7XG5cdFx0XHRcdGNneSA9IG5jZ3k7XG5cdFx0XHRcdGZvdW5kID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHR9IHdoaWxlIChkaXJUb0NoZWNrLmxlbmd0aCA+IDAgJiYgZm91bmQgPT0gZmFsc2UpXG5cdFx0XG5cdH0gd2hpbGUgKGRpclRvQ2hlY2subGVuZ3RoID4gMClcblxufVxuXG5ST1QuTWFwLlJvZ3VlLnByb3RvdHlwZS5fY29ubmVjdFVuY29ubmVjdGVkUm9vbXMgPSBmdW5jdGlvbigpIHtcblx0Ly9XaGlsZSB0aGVyZSBhcmUgdW5jb25uZWN0ZWQgcm9vbXMsIHRyeSB0byBjb25uZWN0IHRoZW0gdG8gYSByYW5kb20gY29ubmVjdGVkIG5laWdoYm9yIFxuXHQvLyhpZiBhIHJvb20gaGFzIG5vIGNvbm5lY3RlZCBuZWlnaGJvcnMgeWV0LCBqdXN0IGtlZXAgY3ljbGluZywgeW91J2xsIGZpbGwgb3V0IHRvIGl0IGV2ZW50dWFsbHkpLlxuXHR2YXIgY3cgPSB0aGlzLl9vcHRpb25zLmNlbGxXaWR0aDtcblx0dmFyIGNoID0gdGhpcy5fb3B0aW9ucy5jZWxsSGVpZ2h0O1xuXHRcblx0dmFyIHJhbmRvbUNvbm5lY3RlZENlbGw7XG5cdHRoaXMuY29ubmVjdGVkQ2VsbHMgPSB0aGlzLmNvbm5lY3RlZENlbGxzLnJhbmRvbWl6ZSgpO1xuXHR2YXIgcm9vbTtcblx0dmFyIG90aGVyUm9vbTtcblx0dmFyIHZhbGlkUm9vbTtcblx0XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fb3B0aW9ucy5jZWxsV2lkdGg7IGkrKykge1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5fb3B0aW9ucy5jZWxsSGVpZ2h0OyBqKyspICB7XG5cdFx0XHRcdFxuXHRcdFx0cm9vbSA9IHRoaXMucm9vbXNbaV1bal07XG5cdFx0XHRcblx0XHRcdGlmIChyb29tW1wiY29ubmVjdGlvbnNcIl0ubGVuZ3RoID09IDApIHtcblx0XHRcdFx0dmFyIGRpcmVjdGlvbnMgPSBbMCwyLDQsNl07XG5cdFx0XHRcdGRpcmVjdGlvbnMgPSBkaXJlY3Rpb25zLnJhbmRvbWl6ZSgpO1xuXHRcdFx0XHRcblx0XHRcdFx0dmFyIHZhbGlkUm9vbSA9IGZhbHNlO1xuXHRcdFx0XHRcblx0XHRcdFx0ZG8ge1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHZhciBkaXJJZHggPSBkaXJlY3Rpb25zLnBvcCgpO1xuXHRcdFx0XHRcdHZhciBuZXdJID0gaSArIFJPVC5ESVJTWzhdW2RpcklkeF1bMF07XG5cdFx0XHRcdFx0dmFyIG5ld0ogPSBqICsgUk9ULkRJUlNbOF1bZGlySWR4XVsxXTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAobmV3SSA8IDAgfHwgbmV3SSA+PSBjdyB8fCBcblx0XHRcdFx0XHRuZXdKIDwgMCB8fCBuZXdKID49IGNoKSB7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0b3RoZXJSb29tID0gdGhpcy5yb29tc1tuZXdJXVtuZXdKXTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHR2YWxpZFJvb20gPSB0cnVlO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGlmIChvdGhlclJvb21bXCJjb25uZWN0aW9uc1wiXS5sZW5ndGggPT0gMCkge1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGZvciAodmFyIGsgPSAwOyBrIDwgb3RoZXJSb29tW1wiY29ubmVjdGlvbnNcIl0ubGVuZ3RoOyBrKyspIHtcblx0XHRcdFx0XHRcdGlmKG90aGVyUm9vbVtcImNvbm5lY3Rpb25zXCJdW2tdWzBdID09IGkgJiYgXG5cdFx0XHRcdFx0XHRvdGhlclJvb21bXCJjb25uZWN0aW9uc1wiXVtrXVsxXSA9PSBqKSB7XG5cdFx0XHRcdFx0XHRcdHZhbGlkUm9vbSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0aWYgKHZhbGlkUm9vbSkgYnJlYWs7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdH0gd2hpbGUgKGRpcmVjdGlvbnMubGVuZ3RoKVxuXHRcdFx0XHRcblx0XHRcdFx0aWYodmFsaWRSb29tKSB7IFxuXHRcdFx0XHRcdHJvb21bXCJjb25uZWN0aW9uc1wiXS5wdXNoKCBbb3RoZXJSb29tW1wiY2VsbHhcIl0sIG90aGVyUm9vbVtcImNlbGx5XCJdXSApOyAgXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCItLSBVbmFibGUgdG8gY29ubmVjdCByb29tLlwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5ST1QuTWFwLlJvZ3VlLnByb3RvdHlwZS5fY3JlYXRlUmFuZG9tUm9vbUNvbm5lY3Rpb25zID0gZnVuY3Rpb24oY29ubmVjdGlvbnMpIHtcblx0Ly8gRW1wdHkgZm9yIG5vdy4gXG59XG5cblxuUk9ULk1hcC5Sb2d1ZS5wcm90b3R5cGUuX2NyZWF0ZVJvb21zID0gZnVuY3Rpb24oKSB7XG5cdC8vIENyZWF0ZSBSb29tcyBcblx0XG5cdHZhciB3ID0gdGhpcy5fd2lkdGg7XG5cdHZhciBoID0gdGhpcy5faGVpZ2h0O1xuXHRcblx0dmFyIGN3ID0gdGhpcy5fb3B0aW9ucy5jZWxsV2lkdGg7XG5cdHZhciBjaCA9IHRoaXMuX29wdGlvbnMuY2VsbEhlaWdodDtcblx0XG5cdHZhciBjd3AgPSBNYXRoLmZsb29yKHRoaXMuX3dpZHRoIC8gY3cpO1xuXHR2YXIgY2hwID0gTWF0aC5mbG9vcih0aGlzLl9oZWlnaHQgLyBjaCk7XG5cdFxuXHR2YXIgcm9vbXc7XG5cdHZhciByb29taDtcblx0dmFyIHJvb21XaWR0aCA9IHRoaXMuX29wdGlvbnNbXCJyb29tV2lkdGhcIl07XG5cdHZhciByb29tSGVpZ2h0ID0gdGhpcy5fb3B0aW9uc1tcInJvb21IZWlnaHRcIl07XG5cdHZhciBzeDtcblx0dmFyIHN5O1xuXHR2YXIgdHg7XG5cdHZhciB0eTtcblx0dmFyIG90aGVyUm9vbTtcblx0XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgY3c7IGkrKykge1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgY2g7IGorKykge1xuXHRcdFx0c3ggPSBjd3AgKiBpO1xuXHRcdFx0c3kgPSBjaHAgKiBqO1xuXHRcdFx0XG5cdFx0XHRpZiAoc3ggPT0gMCkgc3ggPSAxO1xuXHRcdFx0aWYgKHN5ID09IDApIHN5ID0gMTtcblx0XHRcdFxuXHRcdFx0cm9vbXcgPSB0aGlzLl9nZXRSYW5kb21JbnQocm9vbVdpZHRoWzBdLCByb29tV2lkdGhbMV0pO1xuXHRcdFx0cm9vbWggPSB0aGlzLl9nZXRSYW5kb21JbnQocm9vbUhlaWdodFswXSwgcm9vbUhlaWdodFsxXSk7XG5cdFx0XHRcblx0XHRcdGlmIChqID4gMCkge1xuXHRcdFx0XHRvdGhlclJvb20gPSB0aGlzLnJvb21zW2ldW2otMV07XG5cdFx0XHRcdHdoaWxlIChzeSAtIChvdGhlclJvb21bXCJ5XCJdICsgb3RoZXJSb29tW1wiaGVpZ2h0XCJdICkgPCAzKSB7XG5cdFx0XHRcdFx0c3krKztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRpZiAoaSA+IDApIHtcblx0XHRcdFx0b3RoZXJSb29tID0gdGhpcy5yb29tc1tpLTFdW2pdO1xuXHRcdFx0XHR3aGlsZShzeCAtIChvdGhlclJvb21bXCJ4XCJdICsgb3RoZXJSb29tW1wid2lkdGhcIl0pIDwgMykge1xuXHRcdFx0XHRcdHN4Kys7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFx0XHRcdFxuXHRcdFx0dmFyIHN4T2Zmc2V0ID0gTWF0aC5yb3VuZCh0aGlzLl9nZXRSYW5kb21JbnQoMCwgY3dwLXJvb213KS8yKTtcblx0XHRcdHZhciBzeU9mZnNldCA9IE1hdGgucm91bmQodGhpcy5fZ2V0UmFuZG9tSW50KDAsIGNocC1yb29taCkvMik7XG5cdFx0XHRcblx0XHRcdHdoaWxlIChzeCArIHN4T2Zmc2V0ICsgcm9vbXcgPj0gdykge1xuXHRcdFx0XHRpZihzeE9mZnNldCkge1xuXHRcdFx0XHRcdHN4T2Zmc2V0LS07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cm9vbXctLTsgXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0d2hpbGUgKHN5ICsgc3lPZmZzZXQgKyByb29taCA+PSBoKSB7IFxuXHRcdFx0XHRpZihzeU9mZnNldCkge1xuXHRcdFx0XHRcdHN5T2Zmc2V0LS07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cm9vbWgtLTsgXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0c3ggPSBzeCArIHN4T2Zmc2V0O1xuXHRcdFx0c3kgPSBzeSArIHN5T2Zmc2V0O1xuXHRcdFx0XG5cdFx0XHR0aGlzLnJvb21zW2ldW2pdW1wieFwiXSA9IHN4O1xuXHRcdFx0dGhpcy5yb29tc1tpXVtqXVtcInlcIl0gPSBzeTtcblx0XHRcdHRoaXMucm9vbXNbaV1bal1bXCJ3aWR0aFwiXSA9IHJvb213O1xuXHRcdFx0dGhpcy5yb29tc1tpXVtqXVtcImhlaWdodFwiXSA9IHJvb21oOyAgXG5cdFx0XHRcblx0XHRcdGZvciAodmFyIGlpID0gc3g7IGlpIDwgc3ggKyByb29tdzsgaWkrKykge1xuXHRcdFx0XHRmb3IgKHZhciBqaiA9IHN5OyBqaiA8IHN5ICsgcm9vbWg7IGpqKyspIHtcblx0XHRcdFx0XHR0aGlzLm1hcFtpaV1bampdID0gMDtcblx0XHRcdFx0fVxuXHRcdFx0fSAgXG5cdFx0fVxuXHR9XG59XG5cblJPVC5NYXAuUm9ndWUucHJvdG90eXBlLl9nZXRXYWxsUG9zaXRpb24gPSBmdW5jdGlvbihhUm9vbSwgYURpcmVjdGlvbikge1xuXHR2YXIgcng7XG5cdHZhciByeTtcblx0dmFyIGRvb3I7XG5cdFxuXHRpZiAoYURpcmVjdGlvbiA9PSAxIHx8IGFEaXJlY3Rpb24gPT0gMykge1xuXHRcdHJ4ID0gdGhpcy5fZ2V0UmFuZG9tSW50KGFSb29tW1wieFwiXSArIDEsIGFSb29tW1wieFwiXSArIGFSb29tW1wid2lkdGhcIl0gLSAyKTtcblx0XHRpZiAoYURpcmVjdGlvbiA9PSAxKSB7XG5cdFx0XHRyeSA9IGFSb29tW1wieVwiXSAtIDI7XG5cdFx0XHRkb29yID0gcnkgKyAxO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyeSA9IGFSb29tW1wieVwiXSArIGFSb29tW1wiaGVpZ2h0XCJdICsgMTtcblx0XHRcdGRvb3IgPSByeSAtMTtcblx0XHR9XG5cdFx0XG5cdFx0dGhpcy5tYXBbcnhdW2Rvb3JdID0gMDsgLy8gaSdtIG5vdCBzZXR0aW5nIGEgc3BlY2lmaWMgJ2Rvb3InIHRpbGUgdmFsdWUgcmlnaHQgbm93LCBqdXN0IGVtcHR5IHNwYWNlLiBcblx0XHRcblx0fSBlbHNlIGlmIChhRGlyZWN0aW9uID09IDIgfHwgYURpcmVjdGlvbiA9PSA0KSB7XG5cdFx0cnkgPSB0aGlzLl9nZXRSYW5kb21JbnQoYVJvb21bXCJ5XCJdICsgMSwgYVJvb21bXCJ5XCJdICsgYVJvb21bXCJoZWlnaHRcIl0gLSAyKTtcblx0XHRpZihhRGlyZWN0aW9uID09IDIpIHtcblx0XHRcdHJ4ID0gYVJvb21bXCJ4XCJdICsgYVJvb21bXCJ3aWR0aFwiXSArIDE7XG5cdFx0XHRkb29yID0gcnggLSAxO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyeCA9IGFSb29tW1wieFwiXSAtIDI7XG5cdFx0XHRkb29yID0gcnggKyAxO1xuXHRcdH1cblx0XHRcblx0XHR0aGlzLm1hcFtkb29yXVtyeV0gPSAwOyAvLyBpJ20gbm90IHNldHRpbmcgYSBzcGVjaWZpYyAnZG9vcicgdGlsZSB2YWx1ZSByaWdodCBub3csIGp1c3QgZW1wdHkgc3BhY2UuIFxuXHRcdFxuXHR9XG5cdHJldHVybiBbcngsIHJ5XTtcbn1cblxuLyoqKlxuKiBAcGFyYW0gc3RhcnRQb3NpdGlvbiBhIDIgZWxlbWVudCBhcnJheVxuKiBAcGFyYW0gZW5kUG9zaXRpb24gYSAyIGVsZW1lbnQgYXJyYXlcbiovXG5ST1QuTWFwLlJvZ3VlLnByb3RvdHlwZS5fZHJhd0NvcnJpZG9yZSA9IGZ1bmN0aW9uIChzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbikge1xuXHR2YXIgeE9mZnNldCA9IGVuZFBvc2l0aW9uWzBdIC0gc3RhcnRQb3NpdGlvblswXTtcblx0dmFyIHlPZmZzZXQgPSBlbmRQb3NpdGlvblsxXSAtIHN0YXJ0UG9zaXRpb25bMV07XG5cdFxuXHR2YXIgeHBvcyA9IHN0YXJ0UG9zaXRpb25bMF07XG5cdHZhciB5cG9zID0gc3RhcnRQb3NpdGlvblsxXTtcblx0XG5cdHZhciB0ZW1wRGlzdDtcblx0dmFyIHhEaXI7XG5cdHZhciB5RGlyO1xuXHRcblx0dmFyIG1vdmU7IC8vIDIgZWxlbWVudCBhcnJheSwgZWxlbWVudCAwIGlzIHRoZSBkaXJlY3Rpb24sIGVsZW1lbnQgMSBpcyB0aGUgdG90YWwgdmFsdWUgdG8gbW92ZS4gXG5cdHZhciBtb3ZlcyA9IFtdOyAvLyBhIGxpc3Qgb2YgMiBlbGVtZW50IGFycmF5c1xuXHRcblx0dmFyIHhBYnMgPSBNYXRoLmFicyh4T2Zmc2V0KTtcblx0dmFyIHlBYnMgPSBNYXRoLmFicyh5T2Zmc2V0KTtcblx0XG5cdHZhciBwZXJjZW50ID0gUk9ULlJORy5nZXRVbmlmb3JtKCk7IC8vIHVzZWQgdG8gc3BsaXQgdGhlIG1vdmUgYXQgZGlmZmVyZW50IHBsYWNlcyBhbG9uZyB0aGUgbG9uZyBheGlzXG5cdHZhciBmaXJzdEhhbGYgPSBwZXJjZW50O1xuXHR2YXIgc2Vjb25kSGFsZiA9IDEgLSBwZXJjZW50O1xuXHRcblx0eERpciA9IHhPZmZzZXQgPiAwID8gMiA6IDY7XG5cdHlEaXIgPSB5T2Zmc2V0ID4gMCA/IDQgOiAwO1xuXHRcblx0aWYgKHhBYnMgPCB5QWJzKSB7XG5cdFx0Ly8gbW92ZSBmaXJzdEhhbGYgb2YgdGhlIHkgb2Zmc2V0XG5cdFx0dGVtcERpc3QgPSBNYXRoLmNlaWwoeUFicyAqIGZpcnN0SGFsZik7XG5cdFx0bW92ZXMucHVzaChbeURpciwgdGVtcERpc3RdKTtcblx0XHQvLyBtb3ZlIGFsbCB0aGUgeCBvZmZzZXRcblx0XHRtb3Zlcy5wdXNoKFt4RGlyLCB4QWJzXSk7XG5cdFx0Ly8gbW92ZSBzZW5kSGFsZiBvZiB0aGUgIHkgb2Zmc2V0XG5cdFx0dGVtcERpc3QgPSBNYXRoLmZsb29yKHlBYnMgKiBzZWNvbmRIYWxmKTtcblx0XHRtb3Zlcy5wdXNoKFt5RGlyLCB0ZW1wRGlzdF0pO1xuXHR9IGVsc2Uge1xuXHRcdC8vICBtb3ZlIGZpcnN0SGFsZiBvZiB0aGUgeCBvZmZzZXRcblx0XHR0ZW1wRGlzdCA9IE1hdGguY2VpbCh4QWJzICogZmlyc3RIYWxmKTtcblx0XHRtb3Zlcy5wdXNoKFt4RGlyLCB0ZW1wRGlzdF0pO1xuXHRcdC8vIG1vdmUgYWxsIHRoZSB5IG9mZnNldFxuXHRcdG1vdmVzLnB1c2goW3lEaXIsIHlBYnNdKTtcblx0XHQvLyBtb3ZlIHNlY29uZEhhbGYgb2YgdGhlIHggb2Zmc2V0LlxuXHRcdHRlbXBEaXN0ID0gTWF0aC5mbG9vcih4QWJzICogc2Vjb25kSGFsZik7XG5cdFx0bW92ZXMucHVzaChbeERpciwgdGVtcERpc3RdKTsgIFxuXHR9XG5cdFxuXHR0aGlzLm1hcFt4cG9zXVt5cG9zXSA9IDA7XG5cdFxuXHR3aGlsZSAobW92ZXMubGVuZ3RoID4gMCkge1xuXHRcdG1vdmUgPSBtb3Zlcy5wb3AoKTtcblx0XHR3aGlsZSAobW92ZVsxXSA+IDApIHtcblx0XHRcdHhwb3MgKz0gUk9ULkRJUlNbOF1bbW92ZVswXV1bMF07XG5cdFx0XHR5cG9zICs9IFJPVC5ESVJTWzhdW21vdmVbMF1dWzFdO1xuXHRcdFx0dGhpcy5tYXBbeHBvc11beXBvc10gPSAwO1xuXHRcdFx0bW92ZVsxXSA9IG1vdmVbMV0gLSAxO1xuXHRcdH1cblx0fVxufVxuXG5ST1QuTWFwLlJvZ3VlLnByb3RvdHlwZS5fY3JlYXRlQ29ycmlkb3JzID0gZnVuY3Rpb24gKCkge1xuXHQvLyBEcmF3IENvcnJpZG9ycyBiZXR3ZWVuIGNvbm5lY3RlZCByb29tc1xuXHRcblx0dmFyIGN3ID0gdGhpcy5fb3B0aW9ucy5jZWxsV2lkdGg7XG5cdHZhciBjaCA9IHRoaXMuX29wdGlvbnMuY2VsbEhlaWdodDtcblx0dmFyIHJvb207XG5cdHZhciBjb25uZWN0aW9uO1xuXHR2YXIgb3RoZXJSb29tO1xuXHR2YXIgd2FsbDtcblx0dmFyIG90aGVyV2FsbDtcblx0XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgY3c7IGkrKykge1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgY2g7IGorKykge1xuXHRcdFx0cm9vbSA9IHRoaXMucm9vbXNbaV1bal07XG5cdFx0XHRcblx0XHRcdGZvciAodmFyIGsgPSAwOyBrIDwgcm9vbVtcImNvbm5lY3Rpb25zXCJdLmxlbmd0aDsgaysrKSB7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdGNvbm5lY3Rpb24gPSByb29tW1wiY29ubmVjdGlvbnNcIl1ba107IFxuXHRcdFx0XHRcblx0XHRcdFx0b3RoZXJSb29tID0gdGhpcy5yb29tc1tjb25uZWN0aW9uWzBdXVtjb25uZWN0aW9uWzFdXTtcblx0XHRcdFx0XG5cdFx0XHRcdC8vIGZpZ3VyZSBvdXQgd2hhdCB3YWxsIG91ciBjb3JyaWRvciB3aWxsIHN0YXJ0IG9uZS5cblx0XHRcdFx0Ly8gZmlndXJlIG91dCB3aGF0IHdhbGwgb3VyIGNvcnJpZG9yIHdpbGwgZW5kIG9uLiBcblx0XHRcdFx0aWYgKG90aGVyUm9vbVtcImNlbGx4XCJdID4gcm9vbVtcImNlbGx4XCJdICkge1xuXHRcdFx0XHRcdHdhbGwgPSAyO1xuXHRcdFx0XHRcdG90aGVyV2FsbCA9IDQ7XG5cdFx0XHRcdH0gZWxzZSBpZiAob3RoZXJSb29tW1wiY2VsbHhcIl0gPCByb29tW1wiY2VsbHhcIl0gKSB7XG5cdFx0XHRcdFx0d2FsbCA9IDQ7XG5cdFx0XHRcdFx0b3RoZXJXYWxsID0gMjtcblx0XHRcdFx0fSBlbHNlIGlmKG90aGVyUm9vbVtcImNlbGx5XCJdID4gcm9vbVtcImNlbGx5XCJdKSB7XG5cdFx0XHRcdFx0d2FsbCA9IDM7XG5cdFx0XHRcdFx0b3RoZXJXYWxsID0gMTtcblx0XHRcdFx0fSBlbHNlIGlmKG90aGVyUm9vbVtcImNlbGx5XCJdIDwgcm9vbVtcImNlbGx5XCJdKSB7XG5cdFx0XHRcdFx0d2FsbCA9IDE7XG5cdFx0XHRcdFx0b3RoZXJXYWxsID0gMztcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5fZHJhd0NvcnJpZG9yZSh0aGlzLl9nZXRXYWxsUG9zaXRpb24ocm9vbSwgd2FsbCksIHRoaXMuX2dldFdhbGxQb3NpdGlvbihvdGhlclJvb20sIG90aGVyV2FsbCkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuLyoqXG4gKiBAY2xhc3MgRHVuZ2VvbiBmZWF0dXJlOyBoYXMgb3duIC5jcmVhdGUoKSBtZXRob2RcbiAqL1xuUk9ULk1hcC5GZWF0dXJlID0gZnVuY3Rpb24oKSB7fVxuUk9ULk1hcC5GZWF0dXJlLnByb3RvdHlwZS5pc1ZhbGlkID0gZnVuY3Rpb24oY2FuQmVEdWdDYWxsYmFjaykge31cblJPVC5NYXAuRmVhdHVyZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oZGlnQ2FsbGJhY2spIHt9XG5ST1QuTWFwLkZlYXR1cmUucHJvdG90eXBlLmRlYnVnID0gZnVuY3Rpb24oKSB7fVxuUk9ULk1hcC5GZWF0dXJlLmNyZWF0ZVJhbmRvbUF0ID0gZnVuY3Rpb24oeCwgeSwgZHgsIGR5LCBvcHRpb25zKSB7fVxuXG4vKipcbiAqIEBjbGFzcyBSb29tXG4gKiBAYXVnbWVudHMgUk9ULk1hcC5GZWF0dXJlXG4gKiBAcGFyYW0ge2ludH0geDFcbiAqIEBwYXJhbSB7aW50fSB5MVxuICogQHBhcmFtIHtpbnR9IHgyXG4gKiBAcGFyYW0ge2ludH0geTJcbiAqIEBwYXJhbSB7aW50fSBbZG9vclhdXG4gKiBAcGFyYW0ge2ludH0gW2Rvb3JZXVxuICovXG5ST1QuTWFwLkZlYXR1cmUuUm9vbSA9IGZ1bmN0aW9uKHgxLCB5MSwgeDIsIHkyLCBkb29yWCwgZG9vclkpIHtcblx0dGhpcy5feDEgPSB4MTtcblx0dGhpcy5feTEgPSB5MTtcblx0dGhpcy5feDIgPSB4Mjtcblx0dGhpcy5feTIgPSB5Mjtcblx0dGhpcy5fZG9vcnMgPSB7fTtcblx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiA0KSB7IHRoaXMuYWRkRG9vcihkb29yWCwgZG9vclkpOyB9XG59XG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5leHRlbmQoUk9ULk1hcC5GZWF0dXJlKTtcblxuLyoqXG4gKiBSb29tIG9mIHJhbmRvbSBzaXplLCB3aXRoIGEgZ2l2ZW4gZG9vcnMgYW5kIGRpcmVjdGlvblxuICovXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5jcmVhdGVSYW5kb21BdCA9IGZ1bmN0aW9uKHgsIHksIGR4LCBkeSwgb3B0aW9ucykge1xuXHR2YXIgbWluID0gb3B0aW9ucy5yb29tV2lkdGhbMF07XG5cdHZhciBtYXggPSBvcHRpb25zLnJvb21XaWR0aFsxXTtcblx0dmFyIHdpZHRoID0gbWluICsgTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSoobWF4LW1pbisxKSk7XG5cdFxuXHR2YXIgbWluID0gb3B0aW9ucy5yb29tSGVpZ2h0WzBdO1xuXHR2YXIgbWF4ID0gb3B0aW9ucy5yb29tSGVpZ2h0WzFdO1xuXHR2YXIgaGVpZ2h0ID0gbWluICsgTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSoobWF4LW1pbisxKSk7XG5cdFxuXHRpZiAoZHggPT0gMSkgeyAvKiB0byB0aGUgcmlnaHQgKi9cblx0XHR2YXIgeTIgPSB5IC0gTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSAqIGhlaWdodCk7XG5cdFx0cmV0dXJuIG5ldyB0aGlzKHgrMSwgeTIsIHgrd2lkdGgsIHkyK2hlaWdodC0xLCB4LCB5KTtcblx0fVxuXHRcblx0aWYgKGR4ID09IC0xKSB7IC8qIHRvIHRoZSBsZWZ0ICovXG5cdFx0dmFyIHkyID0geSAtIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkgKiBoZWlnaHQpO1xuXHRcdHJldHVybiBuZXcgdGhpcyh4LXdpZHRoLCB5MiwgeC0xLCB5MitoZWlnaHQtMSwgeCwgeSk7XG5cdH1cblxuXHRpZiAoZHkgPT0gMSkgeyAvKiB0byB0aGUgYm90dG9tICovXG5cdFx0dmFyIHgyID0geCAtIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkgKiB3aWR0aCk7XG5cdFx0cmV0dXJuIG5ldyB0aGlzKHgyLCB5KzEsIHgyK3dpZHRoLTEsIHkraGVpZ2h0LCB4LCB5KTtcblx0fVxuXG5cdGlmIChkeSA9PSAtMSkgeyAvKiB0byB0aGUgdG9wICovXG5cdFx0dmFyIHgyID0geCAtIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkgKiB3aWR0aCk7XG5cdFx0cmV0dXJuIG5ldyB0aGlzKHgyLCB5LWhlaWdodCwgeDIrd2lkdGgtMSwgeS0xLCB4LCB5KTtcblx0fVxufVxuXG4vKipcbiAqIFJvb20gb2YgcmFuZG9tIHNpemUsIHBvc2l0aW9uZWQgYXJvdW5kIGNlbnRlciBjb29yZHNcbiAqL1xuUk9ULk1hcC5GZWF0dXJlLlJvb20uY3JlYXRlUmFuZG9tQ2VudGVyID0gZnVuY3Rpb24oY3gsIGN5LCBvcHRpb25zKSB7XG5cdHZhciBtaW4gPSBvcHRpb25zLnJvb21XaWR0aFswXTtcblx0dmFyIG1heCA9IG9wdGlvbnMucm9vbVdpZHRoWzFdO1xuXHR2YXIgd2lkdGggPSBtaW4gKyBNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpKihtYXgtbWluKzEpKTtcblx0XG5cdHZhciBtaW4gPSBvcHRpb25zLnJvb21IZWlnaHRbMF07XG5cdHZhciBtYXggPSBvcHRpb25zLnJvb21IZWlnaHRbMV07XG5cdHZhciBoZWlnaHQgPSBtaW4gKyBNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpKihtYXgtbWluKzEpKTtcblxuXHR2YXIgeDEgPSBjeCAtIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkqd2lkdGgpO1xuXHR2YXIgeTEgPSBjeSAtIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkqaGVpZ2h0KTtcblx0dmFyIHgyID0geDEgKyB3aWR0aCAtIDE7XG5cdHZhciB5MiA9IHkxICsgaGVpZ2h0IC0gMTtcblxuXHRyZXR1cm4gbmV3IHRoaXMoeDEsIHkxLCB4MiwgeTIpO1xufVxuXG4vKipcbiAqIFJvb20gb2YgcmFuZG9tIHNpemUgd2l0aGluIGEgZ2l2ZW4gZGltZW5zaW9uc1xuICovXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5jcmVhdGVSYW5kb20gPSBmdW5jdGlvbihhdmFpbFdpZHRoLCBhdmFpbEhlaWdodCwgb3B0aW9ucykge1xuXHR2YXIgbWluID0gb3B0aW9ucy5yb29tV2lkdGhbMF07XG5cdHZhciBtYXggPSBvcHRpb25zLnJvb21XaWR0aFsxXTtcblx0dmFyIHdpZHRoID0gbWluICsgTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSoobWF4LW1pbisxKSk7XG5cdFxuXHR2YXIgbWluID0gb3B0aW9ucy5yb29tSGVpZ2h0WzBdO1xuXHR2YXIgbWF4ID0gb3B0aW9ucy5yb29tSGVpZ2h0WzFdO1xuXHR2YXIgaGVpZ2h0ID0gbWluICsgTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSoobWF4LW1pbisxKSk7XG5cdFxuXHR2YXIgbGVmdCA9IGF2YWlsV2lkdGggLSB3aWR0aCAtIDE7XG5cdHZhciB0b3AgPSBhdmFpbEhlaWdodCAtIGhlaWdodCAtIDE7XG5cblx0dmFyIHgxID0gMSArIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkqbGVmdCk7XG5cdHZhciB5MSA9IDEgKyBNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpKnRvcCk7XG5cdHZhciB4MiA9IHgxICsgd2lkdGggLSAxO1xuXHR2YXIgeTIgPSB5MSArIGhlaWdodCAtIDE7XG5cblx0cmV0dXJuIG5ldyB0aGlzKHgxLCB5MSwgeDIsIHkyKTtcbn1cblxuUk9ULk1hcC5GZWF0dXJlLlJvb20ucHJvdG90eXBlLmFkZERvb3IgPSBmdW5jdGlvbih4LCB5KSB7XG5cdHRoaXMuX2Rvb3JzW3grXCIsXCIreV0gPSAxO1xuXHRyZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufVxuICovXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5wcm90b3R5cGUuZ2V0RG9vcnMgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHRmb3IgKHZhciBrZXkgaW4gdGhpcy5fZG9vcnMpIHtcblx0XHR2YXIgcGFydHMgPSBrZXkuc3BsaXQoXCIsXCIpO1xuXHRcdGNhbGxiYWNrKHBhcnNlSW50KHBhcnRzWzBdKSwgcGFyc2VJbnQocGFydHNbMV0pKTtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn1cblxuUk9ULk1hcC5GZWF0dXJlLlJvb20ucHJvdG90eXBlLmNsZWFyRG9vcnMgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5fZG9vcnMgPSB7fTtcblx0cmV0dXJuIHRoaXM7XG59XG5cblJPVC5NYXAuRmVhdHVyZS5Sb29tLnByb3RvdHlwZS5hZGREb29ycyA9IGZ1bmN0aW9uKGlzV2FsbENhbGxiYWNrKSB7XG5cdHZhciBsZWZ0ID0gdGhpcy5feDEtMTtcblx0dmFyIHJpZ2h0ID0gdGhpcy5feDIrMTtcblx0dmFyIHRvcCA9IHRoaXMuX3kxLTE7XG5cdHZhciBib3R0b20gPSB0aGlzLl95MisxO1xuXG5cdGZvciAodmFyIHg9bGVmdDsgeDw9cmlnaHQ7IHgrKykge1xuXHRcdGZvciAodmFyIHk9dG9wOyB5PD1ib3R0b207IHkrKykge1xuXHRcdFx0aWYgKHggIT0gbGVmdCAmJiB4ICE9IHJpZ2h0ICYmIHkgIT0gdG9wICYmIHkgIT0gYm90dG9tKSB7IGNvbnRpbnVlOyB9XG5cdFx0XHRpZiAoaXNXYWxsQ2FsbGJhY2soeCwgeSkpIHsgY29udGludWU7IH1cblxuXHRcdFx0dGhpcy5hZGREb29yKHgsIHkpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0aGlzO1xufVxuXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5wcm90b3R5cGUuZGVidWcgPSBmdW5jdGlvbigpIHtcblx0Y29uc29sZS5sb2coXCJyb29tXCIsIHRoaXMuX3gxLCB0aGlzLl95MSwgdGhpcy5feDIsIHRoaXMuX3kyKTtcbn1cblxuUk9ULk1hcC5GZWF0dXJlLlJvb20ucHJvdG90eXBlLmlzVmFsaWQgPSBmdW5jdGlvbihpc1dhbGxDYWxsYmFjaywgY2FuQmVEdWdDYWxsYmFjaykgeyBcblx0dmFyIGxlZnQgPSB0aGlzLl94MS0xO1xuXHR2YXIgcmlnaHQgPSB0aGlzLl94MisxO1xuXHR2YXIgdG9wID0gdGhpcy5feTEtMTtcblx0dmFyIGJvdHRvbSA9IHRoaXMuX3kyKzE7XG5cdFxuXHRmb3IgKHZhciB4PWxlZnQ7IHg8PXJpZ2h0OyB4KyspIHtcblx0XHRmb3IgKHZhciB5PXRvcDsgeTw9Ym90dG9tOyB5KyspIHtcblx0XHRcdGlmICh4ID09IGxlZnQgfHwgeCA9PSByaWdodCB8fCB5ID09IHRvcCB8fCB5ID09IGJvdHRvbSkge1xuXHRcdFx0XHRpZiAoIWlzV2FsbENhbGxiYWNrKHgsIHkpKSB7IHJldHVybiBmYWxzZTsgfVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKCFjYW5CZUR1Z0NhbGxiYWNrKHgsIHkpKSB7IHJldHVybiBmYWxzZTsgfVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGRpZ0NhbGxiYWNrIERpZyBjYWxsYmFjayB3aXRoIGEgc2lnbmF0dXJlICh4LCB5LCB2YWx1ZSkuIFZhbHVlczogMCA9IGVtcHR5LCAxID0gd2FsbCwgMiA9IGRvb3IuIE11bHRpcGxlIGRvb3JzIGFyZSBhbGxvd2VkLlxuICovXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oZGlnQ2FsbGJhY2spIHsgXG5cdHZhciBsZWZ0ID0gdGhpcy5feDEtMTtcblx0dmFyIHJpZ2h0ID0gdGhpcy5feDIrMTtcblx0dmFyIHRvcCA9IHRoaXMuX3kxLTE7XG5cdHZhciBib3R0b20gPSB0aGlzLl95MisxO1xuXHRcblx0dmFyIHZhbHVlID0gMDtcblx0Zm9yICh2YXIgeD1sZWZ0OyB4PD1yaWdodDsgeCsrKSB7XG5cdFx0Zm9yICh2YXIgeT10b3A7IHk8PWJvdHRvbTsgeSsrKSB7XG5cdFx0XHRpZiAoeCtcIixcIit5IGluIHRoaXMuX2Rvb3JzKSB7XG5cdFx0XHRcdHZhbHVlID0gMjtcblx0XHRcdH0gZWxzZSBpZiAoeCA9PSBsZWZ0IHx8IHggPT0gcmlnaHQgfHwgeSA9PSB0b3AgfHwgeSA9PSBib3R0b20pIHtcblx0XHRcdFx0dmFsdWUgPSAxO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFsdWUgPSAwO1xuXHRcdFx0fVxuXHRcdFx0ZGlnQ2FsbGJhY2soeCwgeSwgdmFsdWUpO1xuXHRcdH1cblx0fVxufVxuXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5wcm90b3R5cGUuZ2V0Q2VudGVyID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiBbTWF0aC5yb3VuZCgodGhpcy5feDEgKyB0aGlzLl94MikvMiksIE1hdGgucm91bmQoKHRoaXMuX3kxICsgdGhpcy5feTIpLzIpXTtcbn1cblxuUk9ULk1hcC5GZWF0dXJlLlJvb20ucHJvdG90eXBlLmdldExlZnQgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuX3gxO1xufVxuXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5wcm90b3R5cGUuZ2V0UmlnaHQgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuX3gyO1xufVxuXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5wcm90b3R5cGUuZ2V0VG9wID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLl95MTtcbn1cblxuUk9ULk1hcC5GZWF0dXJlLlJvb20ucHJvdG90eXBlLmdldEJvdHRvbSA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5feTI7XG59XG5cbi8qKlxuICogQGNsYXNzIENvcnJpZG9yXG4gKiBAYXVnbWVudHMgUk9ULk1hcC5GZWF0dXJlXG4gKiBAcGFyYW0ge2ludH0gc3RhcnRYXG4gKiBAcGFyYW0ge2ludH0gc3RhcnRZXG4gKiBAcGFyYW0ge2ludH0gZW5kWFxuICogQHBhcmFtIHtpbnR9IGVuZFlcbiAqL1xuUk9ULk1hcC5GZWF0dXJlLkNvcnJpZG9yID0gZnVuY3Rpb24oc3RhcnRYLCBzdGFydFksIGVuZFgsIGVuZFkpIHtcblx0dGhpcy5fc3RhcnRYID0gc3RhcnRYO1xuXHR0aGlzLl9zdGFydFkgPSBzdGFydFk7XG5cdHRoaXMuX2VuZFggPSBlbmRYOyBcblx0dGhpcy5fZW5kWSA9IGVuZFk7XG5cdHRoaXMuX2VuZHNXaXRoQVdhbGwgPSB0cnVlO1xufVxuUk9ULk1hcC5GZWF0dXJlLkNvcnJpZG9yLmV4dGVuZChST1QuTWFwLkZlYXR1cmUpO1xuXG5ST1QuTWFwLkZlYXR1cmUuQ29ycmlkb3IuY3JlYXRlUmFuZG9tQXQgPSBmdW5jdGlvbih4LCB5LCBkeCwgZHksIG9wdGlvbnMpIHtcblx0dmFyIG1pbiA9IG9wdGlvbnMuY29ycmlkb3JMZW5ndGhbMF07XG5cdHZhciBtYXggPSBvcHRpb25zLmNvcnJpZG9yTGVuZ3RoWzFdO1xuXHR2YXIgbGVuZ3RoID0gbWluICsgTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSoobWF4LW1pbisxKSk7XG5cdFxuXHRyZXR1cm4gbmV3IHRoaXMoeCwgeSwgeCArIGR4Kmxlbmd0aCwgeSArIGR5Kmxlbmd0aCk7XG59XG5cblJPVC5NYXAuRmVhdHVyZS5Db3JyaWRvci5wcm90b3R5cGUuZGVidWcgPSBmdW5jdGlvbigpIHtcblx0Y29uc29sZS5sb2coXCJjb3JyaWRvclwiLCB0aGlzLl9zdGFydFgsIHRoaXMuX3N0YXJ0WSwgdGhpcy5fZW5kWCwgdGhpcy5fZW5kWSk7XG59XG5cblJPVC5NYXAuRmVhdHVyZS5Db3JyaWRvci5wcm90b3R5cGUuaXNWYWxpZCA9IGZ1bmN0aW9uKGlzV2FsbENhbGxiYWNrLCBjYW5CZUR1Z0NhbGxiYWNrKXsgXG5cdHZhciBzeCA9IHRoaXMuX3N0YXJ0WDtcblx0dmFyIHN5ID0gdGhpcy5fc3RhcnRZO1xuXHR2YXIgZHggPSB0aGlzLl9lbmRYLXN4O1xuXHR2YXIgZHkgPSB0aGlzLl9lbmRZLXN5O1xuXHR2YXIgbGVuZ3RoID0gMSArIE1hdGgubWF4KE1hdGguYWJzKGR4KSwgTWF0aC5hYnMoZHkpKTtcblx0XG5cdGlmIChkeCkgeyBkeCA9IGR4L01hdGguYWJzKGR4KTsgfVxuXHRpZiAoZHkpIHsgZHkgPSBkeS9NYXRoLmFicyhkeSk7IH1cblx0dmFyIG54ID0gZHk7XG5cdHZhciBueSA9IC1keDtcblx0XG5cdHZhciBvayA9IHRydWU7XG5cdGZvciAodmFyIGk9MDsgaTxsZW5ndGg7IGkrKykge1xuXHRcdHZhciB4ID0gc3ggKyBpKmR4O1xuXHRcdHZhciB5ID0gc3kgKyBpKmR5O1xuXG5cdFx0aWYgKCFjYW5CZUR1Z0NhbGxiYWNrKCAgICAgeCwgICAgICB5KSkgeyBvayA9IGZhbHNlOyB9XG5cdFx0aWYgKCFpc1dhbGxDYWxsYmFjayAgKHggKyBueCwgeSArIG55KSkgeyBvayA9IGZhbHNlOyB9XG5cdFx0aWYgKCFpc1dhbGxDYWxsYmFjayAgKHggLSBueCwgeSAtIG55KSkgeyBvayA9IGZhbHNlOyB9XG5cdFx0XG5cdFx0aWYgKCFvaykge1xuXHRcdFx0bGVuZ3RoID0gaTtcblx0XHRcdHRoaXMuX2VuZFggPSB4LWR4O1xuXHRcdFx0dGhpcy5fZW5kWSA9IHktZHk7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBJZiB0aGUgbGVuZ3RoIGRlZ2VuZXJhdGVkLCB0aGlzIGNvcnJpZG9yIG1pZ2h0IGJlIGludmFsaWRcblx0ICovXG5cdCBcblx0Lyogbm90IHN1cHBvcnRlZCAqL1xuXHRpZiAobGVuZ3RoID09IDApIHsgcmV0dXJuIGZhbHNlOyB9IFxuXHRcblx0IC8qIGxlbmd0aCAxIGFsbG93ZWQgb25seSBpZiB0aGUgbmV4dCBzcGFjZSBpcyBlbXB0eSAqL1xuXHRpZiAobGVuZ3RoID09IDEgJiYgaXNXYWxsQ2FsbGJhY2sodGhpcy5fZW5kWCArIGR4LCB0aGlzLl9lbmRZICsgZHkpKSB7IHJldHVybiBmYWxzZTsgfVxuXHRcblx0LyoqXG5cdCAqIFdlIGRvIG5vdCB3YW50IHRoZSBjb3JyaWRvciB0byBjcmFzaCBpbnRvIGEgY29ybmVyIG9mIGEgcm9vbTtcblx0ICogaWYgYW55IG9mIHRoZSBlbmRpbmcgY29ybmVycyBpcyBlbXB0eSwgdGhlIE4rMXRoIGNlbGwgb2YgdGhpcyBjb3JyaWRvciBtdXN0IGJlIGVtcHR5IHRvby5cblx0ICogXG5cdCAqIFNpdHVhdGlvbjpcblx0ICogIyMjIyMjIzFcblx0ICogLi4uLi4uLj9cblx0ICogIyMjIyMjIzJcblx0ICogXG5cdCAqIFRoZSBjb3JyaWRvciB3YXMgZHVnIGZyb20gbGVmdCB0byByaWdodC5cblx0ICogMSwgMiAtIHByb2JsZW1hdGljIGNvcm5lcnMsID8gPSBOKzF0aCBjZWxsIChub3QgZHVnKVxuXHQgKi9cblx0dmFyIGZpcnN0Q29ybmVyQmFkID0gIWlzV2FsbENhbGxiYWNrKHRoaXMuX2VuZFggKyBkeCArIG54LCB0aGlzLl9lbmRZICsgZHkgKyBueSk7XG5cdHZhciBzZWNvbmRDb3JuZXJCYWQgPSAhaXNXYWxsQ2FsbGJhY2sodGhpcy5fZW5kWCArIGR4IC0gbngsIHRoaXMuX2VuZFkgKyBkeSAtIG55KTtcblx0dGhpcy5fZW5kc1dpdGhBV2FsbCA9IGlzV2FsbENhbGxiYWNrKHRoaXMuX2VuZFggKyBkeCwgdGhpcy5fZW5kWSArIGR5KTtcblx0aWYgKChmaXJzdENvcm5lckJhZCB8fCBzZWNvbmRDb3JuZXJCYWQpICYmIHRoaXMuX2VuZHNXaXRoQVdhbGwpIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0cmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gZGlnQ2FsbGJhY2sgRGlnIGNhbGxiYWNrIHdpdGggYSBzaWduYXR1cmUgKHgsIHksIHZhbHVlKS4gVmFsdWVzOiAwID0gZW1wdHkuXG4gKi9cblJPVC5NYXAuRmVhdHVyZS5Db3JyaWRvci5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oZGlnQ2FsbGJhY2spIHsgXG5cdHZhciBzeCA9IHRoaXMuX3N0YXJ0WDtcblx0dmFyIHN5ID0gdGhpcy5fc3RhcnRZO1xuXHR2YXIgZHggPSB0aGlzLl9lbmRYLXN4O1xuXHR2YXIgZHkgPSB0aGlzLl9lbmRZLXN5O1xuXHR2YXIgbGVuZ3RoID0gMStNYXRoLm1heChNYXRoLmFicyhkeCksIE1hdGguYWJzKGR5KSk7XG5cdFxuXHRpZiAoZHgpIHsgZHggPSBkeC9NYXRoLmFicyhkeCk7IH1cblx0aWYgKGR5KSB7IGR5ID0gZHkvTWF0aC5hYnMoZHkpOyB9XG5cdHZhciBueCA9IGR5O1xuXHR2YXIgbnkgPSAtZHg7XG5cdFxuXHRmb3IgKHZhciBpPTA7IGk8bGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgeCA9IHN4ICsgaSpkeDtcblx0XHR2YXIgeSA9IHN5ICsgaSpkeTtcblx0XHRkaWdDYWxsYmFjayh4LCB5LCAwKTtcblx0fVxuXHRcblx0cmV0dXJuIHRydWU7XG59XG5cblJPVC5NYXAuRmVhdHVyZS5Db3JyaWRvci5wcm90b3R5cGUuY3JlYXRlUHJpb3JpdHlXYWxscyA9IGZ1bmN0aW9uKHByaW9yaXR5V2FsbENhbGxiYWNrKSB7XG5cdGlmICghdGhpcy5fZW5kc1dpdGhBV2FsbCkgeyByZXR1cm47IH1cblxuXHR2YXIgc3ggPSB0aGlzLl9zdGFydFg7XG5cdHZhciBzeSA9IHRoaXMuX3N0YXJ0WTtcblxuXHR2YXIgZHggPSB0aGlzLl9lbmRYLXN4O1xuXHR2YXIgZHkgPSB0aGlzLl9lbmRZLXN5O1xuXHRpZiAoZHgpIHsgZHggPSBkeC9NYXRoLmFicyhkeCk7IH1cblx0aWYgKGR5KSB7IGR5ID0gZHkvTWF0aC5hYnMoZHkpOyB9XG5cdHZhciBueCA9IGR5O1xuXHR2YXIgbnkgPSAtZHg7XG5cblx0cHJpb3JpdHlXYWxsQ2FsbGJhY2sodGhpcy5fZW5kWCArIGR4LCB0aGlzLl9lbmRZICsgZHkpO1xuXHRwcmlvcml0eVdhbGxDYWxsYmFjayh0aGlzLl9lbmRYICsgbngsIHRoaXMuX2VuZFkgKyBueSk7XG5cdHByaW9yaXR5V2FsbENhbGxiYWNrKHRoaXMuX2VuZFggLSBueCwgdGhpcy5fZW5kWSAtIG55KTtcbn0vKipcbiAqIEBjbGFzcyBCYXNlIG5vaXNlIGdlbmVyYXRvclxuICovXG5ST1QuTm9pc2UgPSBmdW5jdGlvbigpIHtcbn07XG5cblJPVC5Ob2lzZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oeCwgeSkge31cbi8qKlxuICogQSBzaW1wbGUgMmQgaW1wbGVtZW50YXRpb24gb2Ygc2ltcGxleCBub2lzZSBieSBPbmRyZWogWmFyYVxuICpcbiAqIEJhc2VkIG9uIGEgc3BlZWQtaW1wcm92ZWQgc2ltcGxleCBub2lzZSBhbGdvcml0aG0gZm9yIDJELCAzRCBhbmQgNEQgaW4gSmF2YS5cbiAqIFdoaWNoIGlzIGJhc2VkIG9uIGV4YW1wbGUgY29kZSBieSBTdGVmYW4gR3VzdGF2c29uIChzdGVndUBpdG4ubGl1LnNlKS5cbiAqIFdpdGggT3B0aW1pc2F0aW9ucyBieSBQZXRlciBFYXN0bWFuIChwZWFzdG1hbkBkcml6emxlLnN0YW5mb3JkLmVkdSkuXG4gKiBCZXR0ZXIgcmFuayBvcmRlcmluZyBtZXRob2QgYnkgU3RlZmFuIEd1c3RhdnNvbiBpbiAyMDEyLlxuICovXG5cbi8qKlxuICogQGNsYXNzIDJEIHNpbXBsZXggbm9pc2UgZ2VuZXJhdG9yXG4gKiBAcGFyYW0ge2ludH0gW2dyYWRpZW50cz0yNTZdIFJhbmRvbSBncmFkaWVudHNcbiAqL1xuUk9ULk5vaXNlLlNpbXBsZXggPSBmdW5jdGlvbihncmFkaWVudHMpIHtcblx0Uk9ULk5vaXNlLmNhbGwodGhpcyk7XG5cblx0dGhpcy5fRjIgPSAwLjUgKiAoTWF0aC5zcXJ0KDMpIC0gMSk7XG4gICAgdGhpcy5fRzIgPSAoMyAtIE1hdGguc3FydCgzKSkgLyA2O1xuXG5cdHRoaXMuX2dyYWRpZW50cyA9IFtcblx0XHRbIDAsIC0xXSxcblx0XHRbIDEsIC0xXSxcblx0XHRbIDEsICAwXSxcblx0XHRbIDEsICAxXSxcblx0XHRbIDAsICAxXSxcblx0XHRbLTEsICAxXSxcblx0XHRbLTEsICAwXSxcblx0XHRbLTEsIC0xXVxuXHRdO1xuXG5cdHZhciBwZXJtdXRhdGlvbnMgPSBbXTtcblx0dmFyIGNvdW50ID0gZ3JhZGllbnRzIHx8IDI1Njtcblx0Zm9yICh2YXIgaT0wO2k8Y291bnQ7aSsrKSB7IHBlcm11dGF0aW9ucy5wdXNoKGkpOyB9XG5cdHBlcm11dGF0aW9ucyA9IHBlcm11dGF0aW9ucy5yYW5kb21pemUoKTtcblxuXHR0aGlzLl9wZXJtcyA9IFtdO1xuXHR0aGlzLl9pbmRleGVzID0gW107XG5cblx0Zm9yICh2YXIgaT0wO2k8Mipjb3VudDtpKyspIHtcblx0XHR0aGlzLl9wZXJtcy5wdXNoKHBlcm11dGF0aW9uc1tpICUgY291bnRdKTtcblx0XHR0aGlzLl9pbmRleGVzLnB1c2godGhpcy5fcGVybXNbaV0gJSB0aGlzLl9ncmFkaWVudHMubGVuZ3RoKTtcblx0fVxuXG59O1xuUk9ULk5vaXNlLlNpbXBsZXguZXh0ZW5kKFJPVC5Ob2lzZSk7XG5cblJPVC5Ob2lzZS5TaW1wbGV4LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbih4aW4sIHlpbikge1xuXHR2YXIgcGVybXMgPSB0aGlzLl9wZXJtcztcblx0dmFyIGluZGV4ZXMgPSB0aGlzLl9pbmRleGVzO1xuXHR2YXIgY291bnQgPSBwZXJtcy5sZW5ndGgvMjtcblx0dmFyIEcyID0gdGhpcy5fRzI7XG5cblx0dmFyIG4wID0wLCBuMSA9IDAsIG4yID0gMCwgZ2k7IC8vIE5vaXNlIGNvbnRyaWJ1dGlvbnMgZnJvbSB0aGUgdGhyZWUgY29ybmVyc1xuXG5cdC8vIFNrZXcgdGhlIGlucHV0IHNwYWNlIHRvIGRldGVybWluZSB3aGljaCBzaW1wbGV4IGNlbGwgd2UncmUgaW5cblx0dmFyIHMgPSAoeGluICsgeWluKSAqIHRoaXMuX0YyOyAvLyBIYWlyeSBmYWN0b3IgZm9yIDJEXG5cdHZhciBpID0gTWF0aC5mbG9vcih4aW4gKyBzKTtcblx0dmFyIGogPSBNYXRoLmZsb29yKHlpbiArIHMpO1xuXHR2YXIgdCA9IChpICsgaikgKiBHMjtcblx0dmFyIFgwID0gaSAtIHQ7IC8vIFVuc2tldyB0aGUgY2VsbCBvcmlnaW4gYmFjayB0byAoeCx5KSBzcGFjZVxuXHR2YXIgWTAgPSBqIC0gdDtcblx0dmFyIHgwID0geGluIC0gWDA7IC8vIFRoZSB4LHkgZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luXG5cdHZhciB5MCA9IHlpbiAtIFkwO1xuXG5cdC8vIEZvciB0aGUgMkQgY2FzZSwgdGhlIHNpbXBsZXggc2hhcGUgaXMgYW4gZXF1aWxhdGVyYWwgdHJpYW5nbGUuXG5cdC8vIERldGVybWluZSB3aGljaCBzaW1wbGV4IHdlIGFyZSBpbi5cblx0dmFyIGkxLCBqMTsgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIChtaWRkbGUpIGNvcm5lciBvZiBzaW1wbGV4IGluIChpLGopIGNvb3Jkc1xuXHRpZiAoeDAgPiB5MCkge1xuXHRcdGkxID0gMTtcblx0XHRqMSA9IDA7XG5cdH0gZWxzZSB7IC8vIGxvd2VyIHRyaWFuZ2xlLCBYWSBvcmRlcjogKDAsMCktPigxLDApLT4oMSwxKVxuXHRcdGkxID0gMDtcblx0XHRqMSA9IDE7XG5cdH0gLy8gdXBwZXIgdHJpYW5nbGUsIFlYIG9yZGVyOiAoMCwwKS0+KDAsMSktPigxLDEpXG5cblx0Ly8gQSBzdGVwIG9mICgxLDApIGluIChpLGopIG1lYW5zIGEgc3RlcCBvZiAoMS1jLC1jKSBpbiAoeCx5KSwgYW5kXG5cdC8vIGEgc3RlcCBvZiAoMCwxKSBpbiAoaSxqKSBtZWFucyBhIHN0ZXAgb2YgKC1jLDEtYykgaW4gKHgseSksIHdoZXJlXG5cdC8vIGMgPSAoMy1zcXJ0KDMpKS82XG5cdHZhciB4MSA9IHgwIC0gaTEgKyBHMjsgLy8gT2Zmc2V0cyBmb3IgbWlkZGxlIGNvcm5lciBpbiAoeCx5KSB1bnNrZXdlZCBjb29yZHNcblx0dmFyIHkxID0geTAgLSBqMSArIEcyO1xuXHR2YXIgeDIgPSB4MCAtIDEgKyAyKkcyOyAvLyBPZmZzZXRzIGZvciBsYXN0IGNvcm5lciBpbiAoeCx5KSB1bnNrZXdlZCBjb29yZHNcblx0dmFyIHkyID0geTAgLSAxICsgMipHMjtcblxuXHQvLyBXb3JrIG91dCB0aGUgaGFzaGVkIGdyYWRpZW50IGluZGljZXMgb2YgdGhlIHRocmVlIHNpbXBsZXggY29ybmVyc1xuXHR2YXIgaWkgPSBpLm1vZChjb3VudCk7XG5cdHZhciBqaiA9IGoubW9kKGNvdW50KTtcblxuXHQvLyBDYWxjdWxhdGUgdGhlIGNvbnRyaWJ1dGlvbiBmcm9tIHRoZSB0aHJlZSBjb3JuZXJzXG5cdHZhciB0MCA9IDAuNSAtIHgwKngwIC0geTAqeTA7XG5cdGlmICh0MCA+PSAwKSB7XG5cdFx0dDAgKj0gdDA7XG5cdFx0Z2kgPSBpbmRleGVzW2lpK3Blcm1zW2pqXV07XG5cdFx0dmFyIGdyYWQgPSB0aGlzLl9ncmFkaWVudHNbZ2ldO1xuXHRcdG4wID0gdDAgKiB0MCAqIChncmFkWzBdICogeDAgKyBncmFkWzFdICogeTApO1xuXHR9XG5cdFxuXHR2YXIgdDEgPSAwLjUgLSB4MSp4MSAtIHkxKnkxO1xuXHRpZiAodDEgPj0gMCkge1xuXHRcdHQxICo9IHQxO1xuXHRcdGdpID0gaW5kZXhlc1tpaStpMStwZXJtc1tqaitqMV1dO1xuXHRcdHZhciBncmFkID0gdGhpcy5fZ3JhZGllbnRzW2dpXTtcblx0XHRuMSA9IHQxICogdDEgKiAoZ3JhZFswXSAqIHgxICsgZ3JhZFsxXSAqIHkxKTtcblx0fVxuXHRcblx0dmFyIHQyID0gMC41IC0geDIqeDIgLSB5Mip5Mjtcblx0aWYgKHQyID49IDApIHtcblx0XHR0MiAqPSB0Mjtcblx0XHRnaSA9IGluZGV4ZXNbaWkrMStwZXJtc1tqaisxXV07XG5cdFx0dmFyIGdyYWQgPSB0aGlzLl9ncmFkaWVudHNbZ2ldO1xuXHRcdG4yID0gdDIgKiB0MiAqIChncmFkWzBdICogeDIgKyBncmFkWzFdICogeTIpO1xuXHR9XG5cblx0Ly8gQWRkIGNvbnRyaWJ1dGlvbnMgZnJvbSBlYWNoIGNvcm5lciB0byBnZXQgdGhlIGZpbmFsIG5vaXNlIHZhbHVlLlxuXHQvLyBUaGUgcmVzdWx0IGlzIHNjYWxlZCB0byByZXR1cm4gdmFsdWVzIGluIHRoZSBpbnRlcnZhbCBbLTEsMV0uXG5cdHJldHVybiA3MCAqIChuMCArIG4xICsgbjIpO1xufVxuLyoqXG4gKiBAY2xhc3MgQWJzdHJhY3QgRk9WIGFsZ29yaXRobVxuICogQHBhcmFtIHtmdW5jdGlvbn0gbGlnaHRQYXNzZXNDYWxsYmFjayBEb2VzIHRoZSBsaWdodCBwYXNzIHRocm91Z2ggeCx5P1xuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtpbnR9IFtvcHRpb25zLnRvcG9sb2d5PThdIDQvNi84XG4gKi9cblJPVC5GT1YgPSBmdW5jdGlvbihsaWdodFBhc3Nlc0NhbGxiYWNrLCBvcHRpb25zKSB7XG5cdHRoaXMuX2xpZ2h0UGFzc2VzID0gbGlnaHRQYXNzZXNDYWxsYmFjaztcblx0dGhpcy5fb3B0aW9ucyA9IHtcblx0XHR0b3BvbG9neTogOFxuXHR9XG5cdGZvciAodmFyIHAgaW4gb3B0aW9ucykgeyB0aGlzLl9vcHRpb25zW3BdID0gb3B0aW9uc1twXTsgfVxufTtcblxuLyoqXG4gKiBDb21wdXRlIHZpc2liaWxpdHkgZm9yIGEgMzYwLWRlZ3JlZSBjaXJjbGVcbiAqIEBwYXJhbSB7aW50fSB4XG4gKiBAcGFyYW0ge2ludH0geVxuICogQHBhcmFtIHtpbnR9IFIgTWF4aW11bSB2aXNpYmlsaXR5IHJhZGl1c1xuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAqL1xuUk9ULkZPVi5wcm90b3R5cGUuY29tcHV0ZSA9IGZ1bmN0aW9uKHgsIHksIFIsIGNhbGxiYWNrKSB7fVxuXG4vKipcbiAqIFJldHVybiBhbGwgbmVpZ2hib3JzIGluIGEgY29uY2VudHJpYyByaW5nXG4gKiBAcGFyYW0ge2ludH0gY3ggY2VudGVyLXhcbiAqIEBwYXJhbSB7aW50fSBjeSBjZW50ZXIteVxuICogQHBhcmFtIHtpbnR9IHIgcmFuZ2VcbiAqL1xuUk9ULkZPVi5wcm90b3R5cGUuX2dldENpcmNsZSA9IGZ1bmN0aW9uKGN4LCBjeSwgcikge1xuXHR2YXIgcmVzdWx0ID0gW107XG5cdHZhciBkaXJzLCBjb3VudEZhY3Rvciwgc3RhcnRPZmZzZXQ7XG5cblx0c3dpdGNoICh0aGlzLl9vcHRpb25zLnRvcG9sb2d5KSB7XG5cdFx0Y2FzZSA0OlxuXHRcdFx0Y291bnRGYWN0b3IgPSAxO1xuXHRcdFx0c3RhcnRPZmZzZXQgPSBbMCwgMV07XG5cdFx0XHRkaXJzID0gW1xuXHRcdFx0XHRST1QuRElSU1s4XVs3XSxcblx0XHRcdFx0Uk9ULkRJUlNbOF1bMV0sXG5cdFx0XHRcdFJPVC5ESVJTWzhdWzNdLFxuXHRcdFx0XHRST1QuRElSU1s4XVs1XVxuXHRcdFx0XVxuXHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSA2OlxuXHRcdFx0ZGlycyA9IFJPVC5ESVJTWzZdO1xuXHRcdFx0Y291bnRGYWN0b3IgPSAxO1xuXHRcdFx0c3RhcnRPZmZzZXQgPSBbLTEsIDFdO1xuXHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSA4OlxuXHRcdFx0ZGlycyA9IFJPVC5ESVJTWzRdO1xuXHRcdFx0Y291bnRGYWN0b3IgPSAyO1xuXHRcdFx0c3RhcnRPZmZzZXQgPSBbLTEsIDFdO1xuXHRcdGJyZWFrO1xuXHR9XG5cblx0Lyogc3RhcnRpbmcgbmVpZ2hib3IgKi9cblx0dmFyIHggPSBjeCArIHN0YXJ0T2Zmc2V0WzBdKnI7XG5cdHZhciB5ID0gY3kgKyBzdGFydE9mZnNldFsxXSpyO1xuXG5cdC8qIGNpcmNsZSAqL1xuXHRmb3IgKHZhciBpPTA7aTxkaXJzLmxlbmd0aDtpKyspIHtcblx0XHRmb3IgKHZhciBqPTA7ajxyKmNvdW50RmFjdG9yO2orKykge1xuXHRcdFx0cmVzdWx0LnB1c2goW3gsIHldKTtcblx0XHRcdHggKz0gZGlyc1tpXVswXTtcblx0XHRcdHkgKz0gZGlyc1tpXVsxXTtcblxuXHRcdH1cblx0fVxuXG5cdHJldHVybiByZXN1bHQ7XG59XG4vKipcbiAqIEBjbGFzcyBEaXNjcmV0ZSBzaGFkb3djYXN0aW5nIGFsZ29yaXRobS4gT2Jzb2xldGVkIGJ5IFByZWNpc2Ugc2hhZG93Y2FzdGluZy5cbiAqIEBhdWdtZW50cyBST1QuRk9WXG4gKi9cblJPVC5GT1YuRGlzY3JldGVTaGFkb3djYXN0aW5nID0gZnVuY3Rpb24obGlnaHRQYXNzZXNDYWxsYmFjaywgb3B0aW9ucykge1xuXHRST1QuRk9WLmNhbGwodGhpcywgbGlnaHRQYXNzZXNDYWxsYmFjaywgb3B0aW9ucyk7XG59XG5ST1QuRk9WLkRpc2NyZXRlU2hhZG93Y2FzdGluZy5leHRlbmQoUk9ULkZPVik7XG5cbi8qKlxuICogQHNlZSBST1QuRk9WI2NvbXB1dGVcbiAqL1xuUk9ULkZPVi5EaXNjcmV0ZVNoYWRvd2Nhc3RpbmcucHJvdG90eXBlLmNvbXB1dGUgPSBmdW5jdGlvbih4LCB5LCBSLCBjYWxsYmFjaykge1xuXHR2YXIgY2VudGVyID0gdGhpcy5fY29vcmRzO1xuXHR2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG5cdC8qIHRoaXMgcGxhY2UgaXMgYWx3YXlzIHZpc2libGUgKi9cblx0Y2FsbGJhY2soeCwgeSwgMCk7XG5cblx0Lyogc3RhbmRpbmcgaW4gYSBkYXJrIHBsYWNlLiBGSVhNRSBpcyB0aGlzIGEgZ29vZCBpZGVhPyAgKi9cblx0aWYgKCF0aGlzLl9saWdodFBhc3Nlcyh4LCB5KSkgeyByZXR1cm47IH1cblx0XG5cdC8qIHN0YXJ0IGFuZCBlbmQgYW5nbGVzICovXG5cdHZhciBEQVRBID0gW107XG5cdFxuXHR2YXIgQSwgQiwgY3gsIGN5LCBibG9ja3M7XG5cblx0LyogYW5hbHl6ZSBzdXJyb3VuZGluZyBjZWxscyBpbiBjb25jZW50cmljIHJpbmdzLCBzdGFydGluZyBmcm9tIHRoZSBjZW50ZXIgKi9cblx0Zm9yICh2YXIgcj0xOyByPD1SOyByKyspIHtcblx0XHR2YXIgbmVpZ2hib3JzID0gdGhpcy5fZ2V0Q2lyY2xlKHgsIHksIHIpO1xuXHRcdHZhciBhbmdsZSA9IDM2MCAvIG5laWdoYm9ycy5sZW5ndGg7XG5cblx0XHRmb3IgKHZhciBpPTA7aTxuZWlnaGJvcnMubGVuZ3RoO2krKykge1xuXHRcdFx0Y3ggPSBuZWlnaGJvcnNbaV1bMF07XG5cdFx0XHRjeSA9IG5laWdoYm9yc1tpXVsxXTtcblx0XHRcdEEgPSBhbmdsZSAqIChpIC0gMC41KTtcblx0XHRcdEIgPSBBICsgYW5nbGU7XG5cdFx0XHRcblx0XHRcdGJsb2NrcyA9ICF0aGlzLl9saWdodFBhc3NlcyhjeCwgY3kpO1xuXHRcdFx0aWYgKHRoaXMuX3Zpc2libGVDb29yZHMoTWF0aC5mbG9vcihBKSwgTWF0aC5jZWlsKEIpLCBibG9ja3MsIERBVEEpKSB7IGNhbGxiYWNrKGN4LCBjeSwgciwgMSk7IH1cblx0XHRcdFxuXHRcdFx0aWYgKERBVEEubGVuZ3RoID09IDIgJiYgREFUQVswXSA9PSAwICYmIERBVEFbMV0gPT0gMzYwKSB7IHJldHVybjsgfSAvKiBjdXRvZmY/ICovXG5cblx0XHR9IC8qIGZvciBhbGwgY2VsbHMgaW4gdGhpcyByaW5nICovXG5cdH0gLyogZm9yIGFsbCByaW5ncyAqL1xufVxuXG4vKipcbiAqIEBwYXJhbSB7aW50fSBBIHN0YXJ0IGFuZ2xlXG4gKiBAcGFyYW0ge2ludH0gQiBlbmQgYW5nbGVcbiAqIEBwYXJhbSB7Ym9vbH0gYmxvY2tzIERvZXMgY3VycmVudCBjZWxsIGJsb2NrIHZpc2liaWxpdHk/XG4gKiBAcGFyYW0ge2ludFtdW119IERBVEEgc2hhZG93ZWQgYW5nbGUgcGFpcnNcbiAqL1xuUk9ULkZPVi5EaXNjcmV0ZVNoYWRvd2Nhc3RpbmcucHJvdG90eXBlLl92aXNpYmxlQ29vcmRzID0gZnVuY3Rpb24oQSwgQiwgYmxvY2tzLCBEQVRBKSB7XG5cdGlmIChBIDwgMCkgeyBcblx0XHR2YXIgdjEgPSBhcmd1bWVudHMuY2FsbGVlKDAsIEIsIGJsb2NrcywgREFUQSk7XG5cdFx0dmFyIHYyID0gYXJndW1lbnRzLmNhbGxlZSgzNjArQSwgMzYwLCBibG9ja3MsIERBVEEpO1xuXHRcdHJldHVybiB2MSB8fCB2Mjtcblx0fVxuXHRcblx0dmFyIGluZGV4ID0gMDtcblx0d2hpbGUgKGluZGV4IDwgREFUQS5sZW5ndGggJiYgREFUQVtpbmRleF0gPCBBKSB7IGluZGV4Kys7IH1cblx0XG5cdGlmIChpbmRleCA9PSBEQVRBLmxlbmd0aCkgeyAvKiBjb21wbGV0ZWx5IG5ldyBzaGFkb3cgKi9cblx0XHRpZiAoYmxvY2tzKSB7IERBVEEucHVzaChBLCBCKTsgfSBcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRcblx0dmFyIGNvdW50ID0gMDtcblx0XG5cdGlmIChpbmRleCAlIDIpIHsgLyogdGhpcyBzaGFkb3cgc3RhcnRzIGluIGFuIGV4aXN0aW5nIHNoYWRvdywgb3Igd2l0aGluIGl0cyBlbmRpbmcgYm91bmRhcnkgKi9cblx0XHR3aGlsZSAoaW5kZXggPCBEQVRBLmxlbmd0aCAmJiBEQVRBW2luZGV4XSA8IEIpIHtcblx0XHRcdGluZGV4Kys7XG5cdFx0XHRjb3VudCsrO1xuXHRcdH1cblx0XHRcblx0XHRpZiAoY291bnQgPT0gMCkgeyByZXR1cm4gZmFsc2U7IH1cblx0XHRcblx0XHRpZiAoYmxvY2tzKSB7IFxuXHRcdFx0aWYgKGNvdW50ICUgMikge1xuXHRcdFx0XHREQVRBLnNwbGljZShpbmRleC1jb3VudCwgY291bnQsIEIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0REFUQS5zcGxpY2UoaW5kZXgtY291bnQsIGNvdW50KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIHRydWU7XG5cblx0fSBlbHNlIHsgLyogdGhpcyBzaGFkb3cgc3RhcnRzIG91dHNpZGUgYW4gZXhpc3Rpbmcgc2hhZG93LCBvciB3aXRoaW4gYSBzdGFydGluZyBib3VuZGFyeSAqL1xuXHRcdHdoaWxlIChpbmRleCA8IERBVEEubGVuZ3RoICYmIERBVEFbaW5kZXhdIDwgQikge1xuXHRcdFx0aW5kZXgrKztcblx0XHRcdGNvdW50Kys7XG5cdFx0fVxuXHRcdFxuXHRcdC8qIHZpc2libGUgd2hlbiBvdXRzaWRlIGFuIGV4aXN0aW5nIHNoYWRvdywgb3Igd2hlbiBvdmVybGFwcGluZyAqL1xuXHRcdGlmIChBID09IERBVEFbaW5kZXgtY291bnRdICYmIGNvdW50ID09IDEpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdFx0XG5cdFx0aWYgKGJsb2NrcykgeyBcblx0XHRcdGlmIChjb3VudCAlIDIpIHtcblx0XHRcdFx0REFUQS5zcGxpY2UoaW5kZXgtY291bnQsIGNvdW50LCBBKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdERBVEEuc3BsaWNlKGluZGV4LWNvdW50LCBjb3VudCwgQSwgQik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFx0XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cbn1cbi8qKlxuICogQGNsYXNzIFByZWNpc2Ugc2hhZG93Y2FzdGluZyBhbGdvcml0aG1cbiAqIEBhdWdtZW50cyBST1QuRk9WXG4gKi9cblJPVC5GT1YuUHJlY2lzZVNoYWRvd2Nhc3RpbmcgPSBmdW5jdGlvbihsaWdodFBhc3Nlc0NhbGxiYWNrLCBvcHRpb25zKSB7XG5cdFJPVC5GT1YuY2FsbCh0aGlzLCBsaWdodFBhc3Nlc0NhbGxiYWNrLCBvcHRpb25zKTtcbn1cblJPVC5GT1YuUHJlY2lzZVNoYWRvd2Nhc3RpbmcuZXh0ZW5kKFJPVC5GT1YpO1xuXG4vKipcbiAqIEBzZWUgUk9ULkZPViNjb21wdXRlXG4gKi9cblJPVC5GT1YuUHJlY2lzZVNoYWRvd2Nhc3RpbmcucHJvdG90eXBlLmNvbXB1dGUgPSBmdW5jdGlvbih4LCB5LCBSLCBjYWxsYmFjaykge1xuXHQvKiB0aGlzIHBsYWNlIGlzIGFsd2F5cyB2aXNpYmxlICovXG5cdGNhbGxiYWNrKHgsIHksIDAsIDEpO1xuXG5cdC8qIHN0YW5kaW5nIGluIGEgZGFyayBwbGFjZS4gRklYTUUgaXMgdGhpcyBhIGdvb2QgaWRlYT8gICovXG5cdGlmICghdGhpcy5fbGlnaHRQYXNzZXMoeCwgeSkpIHsgcmV0dXJuOyB9XG5cdFxuXHQvKiBsaXN0IG9mIGFsbCBzaGFkb3dzICovXG5cdHZhciBTSEFET1dTID0gW107XG5cdFxuXHR2YXIgY3gsIGN5LCBibG9ja3MsIEExLCBBMiwgdmlzaWJpbGl0eTtcblxuXHQvKiBhbmFseXplIHN1cnJvdW5kaW5nIGNlbGxzIGluIGNvbmNlbnRyaWMgcmluZ3MsIHN0YXJ0aW5nIGZyb20gdGhlIGNlbnRlciAqL1xuXHRmb3IgKHZhciByPTE7IHI8PVI7IHIrKykge1xuXHRcdHZhciBuZWlnaGJvcnMgPSB0aGlzLl9nZXRDaXJjbGUoeCwgeSwgcik7XG5cdFx0dmFyIG5laWdoYm9yQ291bnQgPSBuZWlnaGJvcnMubGVuZ3RoO1xuXG5cdFx0Zm9yICh2YXIgaT0wO2k8bmVpZ2hib3JDb3VudDtpKyspIHtcblx0XHRcdGN4ID0gbmVpZ2hib3JzW2ldWzBdO1xuXHRcdFx0Y3kgPSBuZWlnaGJvcnNbaV1bMV07XG5cdFx0XHQvKiBzaGlmdCBoYWxmLWFuLWFuZ2xlIGJhY2t3YXJkcyB0byBtYWludGFpbiBjb25zaXN0ZW5jeSBvZiAwLXRoIGNlbGxzICovXG5cdFx0XHRBMSA9IFtpID8gMippLTEgOiAyKm5laWdoYm9yQ291bnQtMSwgMipuZWlnaGJvckNvdW50XTtcblx0XHRcdEEyID0gWzIqaSsxLCAyKm5laWdoYm9yQ291bnRdOyBcblx0XHRcdFxuXHRcdFx0YmxvY2tzID0gIXRoaXMuX2xpZ2h0UGFzc2VzKGN4LCBjeSk7XG5cdFx0XHR2aXNpYmlsaXR5ID0gdGhpcy5fY2hlY2tWaXNpYmlsaXR5KEExLCBBMiwgYmxvY2tzLCBTSEFET1dTKTtcblx0XHRcdGlmICh2aXNpYmlsaXR5KSB7IGNhbGxiYWNrKGN4LCBjeSwgciwgdmlzaWJpbGl0eSk7IH1cblxuXHRcdFx0aWYgKFNIQURPV1MubGVuZ3RoID09IDIgJiYgU0hBRE9XU1swXVswXSA9PSAwICYmIFNIQURPV1NbMV1bMF0gPT0gU0hBRE9XU1sxXVsxXSkgeyByZXR1cm47IH0gLyogY3V0b2ZmPyAqL1xuXG5cdFx0fSAvKiBmb3IgYWxsIGNlbGxzIGluIHRoaXMgcmluZyAqL1xuXHR9IC8qIGZvciBhbGwgcmluZ3MgKi9cbn1cblxuLyoqXG4gKiBAcGFyYW0ge2ludFsyXX0gQTEgYXJjIHN0YXJ0XG4gKiBAcGFyYW0ge2ludFsyXX0gQTIgYXJjIGVuZFxuICogQHBhcmFtIHtib29sfSBibG9ja3MgRG9lcyBjdXJyZW50IGFyYyBibG9jayB2aXNpYmlsaXR5P1xuICogQHBhcmFtIHtpbnRbXVtdfSBTSEFET1dTIGxpc3Qgb2YgYWN0aXZlIHNoYWRvd3NcbiAqL1xuUk9ULkZPVi5QcmVjaXNlU2hhZG93Y2FzdGluZy5wcm90b3R5cGUuX2NoZWNrVmlzaWJpbGl0eSA9IGZ1bmN0aW9uKEExLCBBMiwgYmxvY2tzLCBTSEFET1dTKSB7XG5cdGlmIChBMVswXSA+IEEyWzBdKSB7IC8qIHNwbGl0IGludG8gdHdvIHN1Yi1hcmNzICovXG5cdFx0dmFyIHYxID0gdGhpcy5fY2hlY2tWaXNpYmlsaXR5KEExLCBbQTFbMV0sIEExWzFdXSwgYmxvY2tzLCBTSEFET1dTKTtcblx0XHR2YXIgdjIgPSB0aGlzLl9jaGVja1Zpc2liaWxpdHkoWzAsIDFdLCBBMiwgYmxvY2tzLCBTSEFET1dTKTtcblx0XHRyZXR1cm4gKHYxK3YyKS8yO1xuXHR9XG5cblx0LyogaW5kZXgxOiBmaXJzdCBzaGFkb3cgPj0gQTEgKi9cblx0dmFyIGluZGV4MSA9IDAsIGVkZ2UxID0gZmFsc2U7XG5cdHdoaWxlIChpbmRleDEgPCBTSEFET1dTLmxlbmd0aCkge1xuXHRcdHZhciBvbGQgPSBTSEFET1dTW2luZGV4MV07XG5cdFx0dmFyIGRpZmYgPSBvbGRbMF0qQTFbMV0gLSBBMVswXSpvbGRbMV07XG5cdFx0aWYgKGRpZmYgPj0gMCkgeyAvKiBvbGQgPj0gQTEgKi9cblx0XHRcdGlmIChkaWZmID09IDAgJiYgIShpbmRleDEgJSAyKSkgeyBlZGdlMSA9IHRydWU7IH1cblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRpbmRleDErKztcblx0fVxuXG5cdC8qIGluZGV4MjogbGFzdCBzaGFkb3cgPD0gQTIgKi9cblx0dmFyIGluZGV4MiA9IFNIQURPV1MubGVuZ3RoLCBlZGdlMiA9IGZhbHNlO1xuXHR3aGlsZSAoaW5kZXgyLS0pIHtcblx0XHR2YXIgb2xkID0gU0hBRE9XU1tpbmRleDJdO1xuXHRcdHZhciBkaWZmID0gQTJbMF0qb2xkWzFdIC0gb2xkWzBdKkEyWzFdO1xuXHRcdGlmIChkaWZmID49IDApIHsgLyogb2xkIDw9IEEyICovXG5cdFx0XHRpZiAoZGlmZiA9PSAwICYmIChpbmRleDIgJSAyKSkgeyBlZGdlMiA9IHRydWU7IH1cblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHZhciB2aXNpYmxlID0gdHJ1ZTtcblx0aWYgKGluZGV4MSA9PSBpbmRleDIgJiYgKGVkZ2UxIHx8IGVkZ2UyKSkgeyAgLyogc3Vic2V0IG9mIGV4aXN0aW5nIHNoYWRvdywgb25lIG9mIHRoZSBlZGdlcyBtYXRjaCAqL1xuXHRcdHZpc2libGUgPSBmYWxzZTsgXG5cdH0gZWxzZSBpZiAoZWRnZTEgJiYgZWRnZTIgJiYgaW5kZXgxKzE9PWluZGV4MiAmJiAoaW5kZXgyICUgMikpIHsgLyogY29tcGxldGVseSBlcXVpdmFsZW50IHdpdGggZXhpc3Rpbmcgc2hhZG93ICovXG5cdFx0dmlzaWJsZSA9IGZhbHNlO1xuXHR9IGVsc2UgaWYgKGluZGV4MSA+IGluZGV4MiAmJiAoaW5kZXgxICUgMikpIHsgLyogc3Vic2V0IG9mIGV4aXN0aW5nIHNoYWRvdywgbm90IHRvdWNoaW5nICovXG5cdFx0dmlzaWJsZSA9IGZhbHNlO1xuXHR9XG5cdFxuXHRpZiAoIXZpc2libGUpIHsgcmV0dXJuIDA7IH0gLyogZmFzdCBjYXNlOiBub3QgdmlzaWJsZSAqL1xuXHRcblx0dmFyIHZpc2libGVMZW5ndGgsIFA7XG5cblx0LyogY29tcHV0ZSB0aGUgbGVuZ3RoIG9mIHZpc2libGUgYXJjLCBhZGp1c3QgbGlzdCBvZiBzaGFkb3dzIChpZiBibG9ja2luZykgKi9cblx0dmFyIHJlbW92ZSA9IGluZGV4Mi1pbmRleDErMTtcblx0aWYgKHJlbW92ZSAlIDIpIHtcblx0XHRpZiAoaW5kZXgxICUgMikgeyAvKiBmaXJzdCBlZGdlIHdpdGhpbiBleGlzdGluZyBzaGFkb3csIHNlY29uZCBvdXRzaWRlICovXG5cdFx0XHR2YXIgUCA9IFNIQURPV1NbaW5kZXgxXTtcblx0XHRcdHZpc2libGVMZW5ndGggPSAoQTJbMF0qUFsxXSAtIFBbMF0qQTJbMV0pIC8gKFBbMV0gKiBBMlsxXSk7XG5cdFx0XHRpZiAoYmxvY2tzKSB7IFNIQURPV1Muc3BsaWNlKGluZGV4MSwgcmVtb3ZlLCBBMik7IH1cblx0XHR9IGVsc2UgeyAvKiBzZWNvbmQgZWRnZSB3aXRoaW4gZXhpc3Rpbmcgc2hhZG93LCBmaXJzdCBvdXRzaWRlICovXG5cdFx0XHR2YXIgUCA9IFNIQURPV1NbaW5kZXgyXTtcblx0XHRcdHZpc2libGVMZW5ndGggPSAoUFswXSpBMVsxXSAtIEExWzBdKlBbMV0pIC8gKEExWzFdICogUFsxXSk7XG5cdFx0XHRpZiAoYmxvY2tzKSB7IFNIQURPV1Muc3BsaWNlKGluZGV4MSwgcmVtb3ZlLCBBMSk7IH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0aWYgKGluZGV4MSAlIDIpIHsgLyogYm90aCBlZGdlcyB3aXRoaW4gZXhpc3Rpbmcgc2hhZG93cyAqL1xuXHRcdFx0dmFyIFAxID0gU0hBRE9XU1tpbmRleDFdO1xuXHRcdFx0dmFyIFAyID0gU0hBRE9XU1tpbmRleDJdO1xuXHRcdFx0dmlzaWJsZUxlbmd0aCA9IChQMlswXSpQMVsxXSAtIFAxWzBdKlAyWzFdKSAvIChQMVsxXSAqIFAyWzFdKTtcblx0XHRcdGlmIChibG9ja3MpIHsgU0hBRE9XUy5zcGxpY2UoaW5kZXgxLCByZW1vdmUpOyB9XG5cdFx0fSBlbHNlIHsgLyogYm90aCBlZGdlcyBvdXRzaWRlIGV4aXN0aW5nIHNoYWRvd3MgKi9cblx0XHRcdGlmIChibG9ja3MpIHsgU0hBRE9XUy5zcGxpY2UoaW5kZXgxLCByZW1vdmUsIEExLCBBMik7IH1cblx0XHRcdHJldHVybiAxOyAvKiB3aG9sZSBhcmMgdmlzaWJsZSEgKi9cblx0XHR9XG5cdH1cblxuXHR2YXIgYXJjTGVuZ3RoID0gKEEyWzBdKkExWzFdIC0gQTFbMF0qQTJbMV0pIC8gKEExWzFdICogQTJbMV0pO1xuXG5cdHJldHVybiB2aXNpYmxlTGVuZ3RoL2FyY0xlbmd0aDtcbn1cbi8qKlxuICogQGNsYXNzIFJlY3Vyc2l2ZSBzaGFkb3djYXN0aW5nIGFsZ29yaXRobVxuICogQ3VycmVudGx5IG9ubHkgc3VwcG9ydHMgNC84IHRvcG9sb2dpZXMsIG5vdCBoZXhhZ29uYWwuXG4gKiBCYXNlZCBvbiBQZXRlciBIYXJraW5zJyBpbXBsZW1lbnRhdGlvbiBvZiBCasO2cm4gQmVyZ3N0csO2bSdzIGFsZ29yaXRobSBkZXNjcmliZWQgaGVyZTogaHR0cDovL3d3dy5yb2d1ZWJhc2luLmNvbS9pbmRleC5waHA/dGl0bGU9Rk9WX3VzaW5nX3JlY3Vyc2l2ZV9zaGFkb3djYXN0aW5nXG4gKiBAYXVnbWVudHMgUk9ULkZPVlxuICovXG5ST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcgPSBmdW5jdGlvbihsaWdodFBhc3Nlc0NhbGxiYWNrLCBvcHRpb25zKSB7XG5cdFJPVC5GT1YuY2FsbCh0aGlzLCBsaWdodFBhc3Nlc0NhbGxiYWNrLCBvcHRpb25zKTtcbn1cblJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZy5leHRlbmQoUk9ULkZPVik7XG5cbi8qKiBPY3RhbnRzIHVzZWQgZm9yIHRyYW5zbGF0aW5nIHJlY3Vyc2l2ZSBzaGFkb3djYXN0aW5nIG9mZnNldHMgKi9cblJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZy5PQ1RBTlRTID0gW1xuXHRbLTEsICAwLCAgMCwgIDFdLFxuXHRbIDAsIC0xLCAgMSwgIDBdLFxuXHRbIDAsIC0xLCAtMSwgIDBdLFxuXHRbLTEsICAwLCAgMCwgLTFdLFxuXHRbIDEsICAwLCAgMCwgLTFdLFxuXHRbIDAsICAxLCAtMSwgIDBdLFxuXHRbIDAsICAxLCAgMSwgIDBdLFxuXHRbIDEsICAwLCAgMCwgIDFdXG5dO1xuXG4vKipcbiAqIENvbXB1dGUgdmlzaWJpbGl0eSBmb3IgYSAzNjAtZGVncmVlIGNpcmNsZVxuICogQHBhcmFtIHtpbnR9IHhcbiAqIEBwYXJhbSB7aW50fSB5XG4gKiBAcGFyYW0ge2ludH0gUiBNYXhpbXVtIHZpc2liaWxpdHkgcmFkaXVzXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICovXG5ST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcucHJvdG90eXBlLmNvbXB1dGUgPSBmdW5jdGlvbih4LCB5LCBSLCBjYWxsYmFjaykge1xuXHQvL1lvdSBjYW4gYWx3YXlzIHNlZSB5b3VyIG93biB0aWxlXG5cdGNhbGxiYWNrKHgsIHksIDAsIHRydWUpO1xuXHRmb3IodmFyIGkgPSAwOyBpIDwgUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLk9DVEFOVFMubGVuZ3RoOyBpKyspIHtcblx0XHR0aGlzLl9yZW5kZXJPY3RhbnQoeCwgeSwgUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLk9DVEFOVFNbaV0sIFIsIGNhbGxiYWNrKTtcblx0fVxufVxuXG4vKipcbiAqIENvbXB1dGUgdmlzaWJpbGl0eSBmb3IgYSAxODAtZGVncmVlIGFyY1xuICogQHBhcmFtIHtpbnR9IHhcbiAqIEBwYXJhbSB7aW50fSB5XG4gKiBAcGFyYW0ge2ludH0gUiBNYXhpbXVtIHZpc2liaWxpdHkgcmFkaXVzXG4gKiBAcGFyYW0ge2ludH0gZGlyIERpcmVjdGlvbiB0byBsb29rIGluIChleHByZXNzZWQgaW4gYSBST1QuRElSIHZhbHVlKTtcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gKi9cblJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZy5wcm90b3R5cGUuY29tcHV0ZTE4MCA9IGZ1bmN0aW9uKHgsIHksIFIsIGRpciwgY2FsbGJhY2spIHtcblx0Ly9Zb3UgY2FuIGFsd2F5cyBzZWUgeW91ciBvd24gdGlsZVxuXHRjYWxsYmFjayh4LCB5LCAwLCB0cnVlKTtcblx0dmFyIHByZXZpb3VzT2N0YW50ID0gKGRpciAtIDEgKyA4KSAlIDg7IC8vTmVlZCB0byByZXRyaWV2ZSB0aGUgcHJldmlvdXMgb2N0YW50IHRvIHJlbmRlciBhIGZ1bGwgMTgwIGRlZ3JlZXNcblx0dmFyIG5leHRQcmV2aW91c09jdGFudCA9IChkaXIgLSAyICsgOCkgJSA4OyAvL05lZWQgdG8gcmV0cmlldmUgdGhlIHByZXZpb3VzIHR3byBvY3RhbnRzIHRvIHJlbmRlciBhIGZ1bGwgMTgwIGRlZ3JlZXNcblx0dmFyIG5leHRPY3RhbnQgPSAoZGlyKyAxICsgOCkgJSA4OyAvL05lZWQgdG8gZ3JhYiB0byBuZXh0IG9jdGFudCB0byByZW5kZXIgYSBmdWxsIDE4MCBkZWdyZWVzXG5cdHRoaXMuX3JlbmRlck9jdGFudCh4LCB5LCBST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcuT0NUQU5UU1tuZXh0UHJldmlvdXNPY3RhbnRdLCBSLCBjYWxsYmFjayk7XG5cdHRoaXMuX3JlbmRlck9jdGFudCh4LCB5LCBST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcuT0NUQU5UU1twcmV2aW91c09jdGFudF0sIFIsIGNhbGxiYWNrKTtcblx0dGhpcy5fcmVuZGVyT2N0YW50KHgsIHksIFJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZy5PQ1RBTlRTW2Rpcl0sIFIsIGNhbGxiYWNrKTtcblx0dGhpcy5fcmVuZGVyT2N0YW50KHgsIHksIFJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZy5PQ1RBTlRTW25leHRPY3RhbnRdLCBSLCBjYWxsYmFjayk7XG59XG5cbi8qKlxuICogQ29tcHV0ZSB2aXNpYmlsaXR5IGZvciBhIDkwLWRlZ3JlZSBhcmNcbiAqIEBwYXJhbSB7aW50fSB4XG4gKiBAcGFyYW0ge2ludH0geVxuICogQHBhcmFtIHtpbnR9IFIgTWF4aW11bSB2aXNpYmlsaXR5IHJhZGl1c1xuICogQHBhcmFtIHtpbnR9IGRpciBEaXJlY3Rpb24gdG8gbG9vayBpbiAoZXhwcmVzc2VkIGluIGEgUk9ULkRJUiB2YWx1ZSk7XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICovXG5ST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcucHJvdG90eXBlLmNvbXB1dGU5MCA9IGZ1bmN0aW9uKHgsIHksIFIsIGRpciwgY2FsbGJhY2spIHtcblx0Ly9Zb3UgY2FuIGFsd2F5cyBzZWUgeW91ciBvd24gdGlsZVxuXHRjYWxsYmFjayh4LCB5LCAwLCB0cnVlKTtcblx0dmFyIHByZXZpb3VzT2N0YW50ID0gKGRpciAtIDEgKyA4KSAlIDg7IC8vTmVlZCB0byByZXRyaWV2ZSB0aGUgcHJldmlvdXMgb2N0YW50IHRvIHJlbmRlciBhIGZ1bGwgOTAgZGVncmVlc1xuXHR0aGlzLl9yZW5kZXJPY3RhbnQoeCwgeSwgUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLk9DVEFOVFNbZGlyXSwgUiwgY2FsbGJhY2spO1xuXHR0aGlzLl9yZW5kZXJPY3RhbnQoeCwgeSwgUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLk9DVEFOVFNbcHJldmlvdXNPY3RhbnRdLCBSLCBjYWxsYmFjayk7XG59XG5cbi8qKlxuICogUmVuZGVyIG9uZSBvY3RhbnQgKDQ1LWRlZ3JlZSBhcmMpIG9mIHRoZSB2aWV3c2hlZFxuICogQHBhcmFtIHtpbnR9IHhcbiAqIEBwYXJhbSB7aW50fSB5XG4gKiBAcGFyYW0ge2ludH0gb2N0YW50IE9jdGFudCB0byBiZSByZW5kZXJlZFxuICogQHBhcmFtIHtpbnR9IFIgTWF4aW11bSB2aXNpYmlsaXR5IHJhZGl1c1xuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAqL1xuUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLnByb3RvdHlwZS5fcmVuZGVyT2N0YW50ID0gZnVuY3Rpb24oeCwgeSwgb2N0YW50LCBSLCBjYWxsYmFjaykge1xuXHQvL1JhZGl1cyBpbmNyZW1lbnRlZCBieSAxIHRvIHByb3ZpZGUgc2FtZSBjb3ZlcmFnZSBhcmVhIGFzIG90aGVyIHNoYWRvd2Nhc3RpbmcgcmFkaXVzZXNcblx0dGhpcy5fY2FzdFZpc2liaWxpdHkoeCwgeSwgMSwgMS4wLCAwLjAsIFIgKyAxLCBvY3RhbnRbMF0sIG9jdGFudFsxXSwgb2N0YW50WzJdLCBvY3RhbnRbM10sIGNhbGxiYWNrKTtcbn1cblxuLyoqXG4gKiBBY3R1YWxseSBjYWxjdWxhdGVzIHRoZSB2aXNpYmlsaXR5XG4gKiBAcGFyYW0ge2ludH0gc3RhcnRYIFRoZSBzdGFydGluZyBYIGNvb3JkaW5hdGVcbiAqIEBwYXJhbSB7aW50fSBzdGFydFkgVGhlIHN0YXJ0aW5nIFkgY29vcmRpbmF0ZVxuICogQHBhcmFtIHtpbnR9IHJvdyBUaGUgcm93IHRvIHJlbmRlclxuICogQHBhcmFtIHtmbG9hdH0gdmlzU2xvcGVTdGFydCBUaGUgc2xvcGUgdG8gc3RhcnQgYXRcbiAqIEBwYXJhbSB7ZmxvYXR9IHZpc1Nsb3BlRW5kIFRoZSBzbG9wZSB0byBlbmQgYXRcbiAqIEBwYXJhbSB7aW50fSByYWRpdXMgVGhlIHJhZGl1cyB0byByZWFjaCBvdXQgdG9cbiAqIEBwYXJhbSB7aW50fSB4eCBcbiAqIEBwYXJhbSB7aW50fSB4eSBcbiAqIEBwYXJhbSB7aW50fSB5eCBcbiAqIEBwYXJhbSB7aW50fSB5eSBcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIFRoZSBjYWxsYmFjayB0byB1c2Ugd2hlbiB3ZSBoaXQgYSBibG9jayB0aGF0IGlzIHZpc2libGVcbiAqL1xuUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLnByb3RvdHlwZS5fY2FzdFZpc2liaWxpdHkgPSBmdW5jdGlvbihzdGFydFgsIHN0YXJ0WSwgcm93LCB2aXNTbG9wZVN0YXJ0LCB2aXNTbG9wZUVuZCwgcmFkaXVzLCB4eCwgeHksIHl4LCB5eSwgY2FsbGJhY2spIHtcblx0aWYodmlzU2xvcGVTdGFydCA8IHZpc1Nsb3BlRW5kKSB7IHJldHVybjsgfVxuXHRmb3IodmFyIGkgPSByb3c7IGkgPD0gcmFkaXVzOyBpKyspIHtcblx0XHR2YXIgZHggPSAtaSAtIDE7XG5cdFx0dmFyIGR5ID0gLWk7XG5cdFx0dmFyIGJsb2NrZWQgPSBmYWxzZTtcblx0XHR2YXIgbmV3U3RhcnQgPSAwO1xuXG5cdFx0Ly8nUm93JyBjb3VsZCBiZSBjb2x1bW4sIG5hbWVzIGhlcmUgYXNzdW1lIG9jdGFudCAwIGFuZCB3b3VsZCBiZSBmbGlwcGVkIGZvciBoYWxmIHRoZSBvY3RhbnRzXG5cdFx0d2hpbGUoZHggPD0gMCkge1xuXHRcdFx0ZHggKz0gMTtcblxuXHRcdFx0Ly9UcmFuc2xhdGUgZnJvbSByZWxhdGl2ZSBjb29yZGluYXRlcyB0byBtYXAgY29vcmRpbmF0ZXNcblx0XHRcdHZhciBtYXBYID0gc3RhcnRYICsgZHggKiB4eCArIGR5ICogeHk7XG5cdFx0XHR2YXIgbWFwWSA9IHN0YXJ0WSArIGR4ICogeXggKyBkeSAqIHl5O1xuXG5cdFx0XHQvL1JhbmdlIG9mIHRoZSByb3dcblx0XHRcdHZhciBzbG9wZVN0YXJ0ID0gKGR4IC0gMC41KSAvIChkeSArIDAuNSk7XG5cdFx0XHR2YXIgc2xvcGVFbmQgPSAoZHggKyAwLjUpIC8gKGR5IC0gMC41KTtcblx0XHRcblx0XHRcdC8vSWdub3JlIGlmIG5vdCB5ZXQgYXQgbGVmdCBlZGdlIG9mIE9jdGFudFxuXHRcdFx0aWYoc2xvcGVFbmQgPiB2aXNTbG9wZVN0YXJ0KSB7IGNvbnRpbnVlOyB9XG5cdFx0XHRcblx0XHRcdC8vRG9uZSBpZiBwYXN0IHJpZ2h0IGVkZ2Vcblx0XHRcdGlmKHNsb3BlU3RhcnQgPCB2aXNTbG9wZUVuZCkgeyBicmVhazsgfVxuXHRcdFx0XHRcblx0XHRcdC8vSWYgaXQncyBpbiByYW5nZSwgaXQncyB2aXNpYmxlXG5cdFx0XHRpZigoZHggKiBkeCArIGR5ICogZHkpIDwgKHJhZGl1cyAqIHJhZGl1cykpIHtcblx0XHRcdFx0Y2FsbGJhY2sobWFwWCwgbWFwWSwgaSwgdHJ1ZSk7XG5cdFx0XHR9XG5cdFxuXHRcdFx0aWYoIWJsb2NrZWQpIHtcblx0XHRcdFx0Ly9JZiB0aWxlIGlzIGEgYmxvY2tpbmcgdGlsZSwgY2FzdCBhcm91bmQgaXRcblx0XHRcdFx0aWYoIXRoaXMuX2xpZ2h0UGFzc2VzKG1hcFgsIG1hcFkpICYmIGkgPCByYWRpdXMpIHtcblx0XHRcdFx0XHRibG9ja2VkID0gdHJ1ZTtcblx0XHRcdFx0XHR0aGlzLl9jYXN0VmlzaWJpbGl0eShzdGFydFgsIHN0YXJ0WSwgaSArIDEsIHZpc1Nsb3BlU3RhcnQsIHNsb3BlU3RhcnQsIHJhZGl1cywgeHgsIHh5LCB5eCwgeXksIGNhbGxiYWNrKTtcblx0XHRcdFx0XHRuZXdTdGFydCA9IHNsb3BlRW5kO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL0tlZXAgbmFycm93aW5nIGlmIHNjYW5uaW5nIGFjcm9zcyBhIGJsb2NrXG5cdFx0XHRcdGlmKCF0aGlzLl9saWdodFBhc3NlcyhtYXBYLCBtYXBZKSkge1xuXHRcdFx0XHRcdG5ld1N0YXJ0ID0gc2xvcGVFbmQ7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdFxuXHRcdFx0XHQvL0Jsb2NrIGhhcyBlbmRlZFxuXHRcdFx0XHRibG9ja2VkID0gZmFsc2U7XG5cdFx0XHRcdHZpc1Nsb3BlU3RhcnQgPSBuZXdTdGFydDtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYoYmxvY2tlZCkgeyBicmVhazsgfVxuXHR9XG59XG4vKipcbiAqIEBuYW1lc3BhY2UgQ29sb3Igb3BlcmF0aW9uc1xuICovXG5ST1QuQ29sb3IgPSB7XG5cdGZyb21TdHJpbmc6IGZ1bmN0aW9uKHN0cikge1xuXHRcdHZhciBjYWNoZWQsIHI7XG5cdFx0aWYgKHN0ciBpbiB0aGlzLl9jYWNoZSkge1xuXHRcdFx0Y2FjaGVkID0gdGhpcy5fY2FjaGVbc3RyXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHN0ci5jaGFyQXQoMCkgPT0gXCIjXCIpIHsgLyogaGV4IHJnYiAqL1xuXG5cdFx0XHRcdHZhciB2YWx1ZXMgPSBzdHIubWF0Y2goL1swLTlhLWZdL2dpKS5tYXAoZnVuY3Rpb24oeCkgeyByZXR1cm4gcGFyc2VJbnQoeCwgMTYpOyB9KTtcblx0XHRcdFx0aWYgKHZhbHVlcy5sZW5ndGggPT0gMykge1xuXHRcdFx0XHRcdGNhY2hlZCA9IHZhbHVlcy5tYXAoZnVuY3Rpb24oeCkgeyByZXR1cm4geCoxNzsgfSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaT0wO2k8MztpKyspIHtcblx0XHRcdFx0XHRcdHZhbHVlc1tpKzFdICs9IDE2KnZhbHVlc1tpXTtcblx0XHRcdFx0XHRcdHZhbHVlcy5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhY2hlZCA9IHZhbHVlcztcblx0XHRcdFx0fVxuXG5cdFx0XHR9IGVsc2UgaWYgKHIgPSBzdHIubWF0Y2goL3JnYlxcKChbMC05LCBdKylcXCkvaSkpIHsgLyogZGVjaW1hbCByZ2IgKi9cblx0XHRcdFx0Y2FjaGVkID0gclsxXS5zcGxpdCgvXFxzKixcXHMqLykubWFwKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHBhcnNlSW50KHgpOyB9KTtcblx0XHRcdH0gZWxzZSB7IC8qIGh0bWwgbmFtZSAqL1xuXHRcdFx0XHRjYWNoZWQgPSBbMCwgMCwgMF07XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX2NhY2hlW3N0cl0gPSBjYWNoZWQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNhY2hlZC5zbGljZSgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGQgdHdvIG9yIG1vcmUgY29sb3JzXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yMVxuXHQgKiBAcGFyYW0ge251bWJlcltdfSBjb2xvcjJcblx0ICogQHJldHVybnMge251bWJlcltdfVxuXHQgKi9cblx0YWRkOiBmdW5jdGlvbihjb2xvcjEsIGNvbG9yMikge1xuXHRcdHZhciByZXN1bHQgPSBjb2xvcjEuc2xpY2UoKTtcblx0XHRmb3IgKHZhciBpPTA7aTwzO2krKykge1xuXHRcdFx0Zm9yICh2YXIgaj0xO2o8YXJndW1lbnRzLmxlbmd0aDtqKyspIHtcblx0XHRcdFx0cmVzdWx0W2ldICs9IGFyZ3VtZW50c1tqXVtpXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblxuXHQvKipcblx0ICogQWRkIHR3byBvciBtb3JlIGNvbG9ycywgTU9ESUZJRVMgRklSU1QgQVJHVU1FTlRcblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3IxXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yMlxuXHQgKiBAcmV0dXJucyB7bnVtYmVyW119XG5cdCAqL1xuXHRhZGRfOiBmdW5jdGlvbihjb2xvcjEsIGNvbG9yMikge1xuXHRcdGZvciAodmFyIGk9MDtpPDM7aSsrKSB7XG5cdFx0XHRmb3IgKHZhciBqPTE7ajxhcmd1bWVudHMubGVuZ3RoO2orKykge1xuXHRcdFx0XHRjb2xvcjFbaV0gKz0gYXJndW1lbnRzW2pdW2ldO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gY29sb3IxO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNdWx0aXBseSAobWl4KSB0d28gb3IgbW9yZSBjb2xvcnNcblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3IxXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yMlxuXHQgKiBAcmV0dXJucyB7bnVtYmVyW119XG5cdCAqL1xuXHRtdWx0aXBseTogZnVuY3Rpb24oY29sb3IxLCBjb2xvcjIpIHtcblx0XHR2YXIgcmVzdWx0ID0gY29sb3IxLnNsaWNlKCk7XG5cdFx0Zm9yICh2YXIgaT0wO2k8MztpKyspIHtcblx0XHRcdGZvciAodmFyIGo9MTtqPGFyZ3VtZW50cy5sZW5ndGg7aisrKSB7XG5cdFx0XHRcdHJlc3VsdFtpXSAqPSBhcmd1bWVudHNbal1baV0gLyAyNTU7XG5cdFx0XHR9XG5cdFx0XHRyZXN1bHRbaV0gPSBNYXRoLnJvdW5kKHJlc3VsdFtpXSk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE11bHRpcGx5IChtaXgpIHR3byBvciBtb3JlIGNvbG9ycywgTU9ESUZJRVMgRklSU1QgQVJHVU1FTlRcblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3IxXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yMlxuXHQgKiBAcmV0dXJucyB7bnVtYmVyW119XG5cdCAqL1xuXHRtdWx0aXBseV86IGZ1bmN0aW9uKGNvbG9yMSwgY29sb3IyKSB7XG5cdFx0Zm9yICh2YXIgaT0wO2k8MztpKyspIHtcblx0XHRcdGZvciAodmFyIGo9MTtqPGFyZ3VtZW50cy5sZW5ndGg7aisrKSB7XG5cdFx0XHRcdGNvbG9yMVtpXSAqPSBhcmd1bWVudHNbal1baV0gLyAyNTU7XG5cdFx0XHR9XG5cdFx0XHRjb2xvcjFbaV0gPSBNYXRoLnJvdW5kKGNvbG9yMVtpXSk7XG5cdFx0fVxuXHRcdHJldHVybiBjb2xvcjE7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEludGVycG9sYXRlIChibGVuZCkgdHdvIGNvbG9ycyB3aXRoIGEgZ2l2ZW4gZmFjdG9yXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yMVxuXHQgKiBAcGFyYW0ge251bWJlcltdfSBjb2xvcjJcblx0ICogQHBhcmFtIHtmbG9hdH0gW2ZhY3Rvcj0wLjVdIDAuLjFcblx0ICogQHJldHVybnMge251bWJlcltdfVxuXHQgKi9cblx0aW50ZXJwb2xhdGU6IGZ1bmN0aW9uKGNvbG9yMSwgY29sb3IyLCBmYWN0b3IpIHtcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHsgZmFjdG9yID0gMC41OyB9XG5cdFx0dmFyIHJlc3VsdCA9IGNvbG9yMS5zbGljZSgpO1xuXHRcdGZvciAodmFyIGk9MDtpPDM7aSsrKSB7XG5cdFx0XHRyZXN1bHRbaV0gPSBNYXRoLnJvdW5kKHJlc3VsdFtpXSArIGZhY3RvciooY29sb3IyW2ldLWNvbG9yMVtpXSkpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbnRlcnBvbGF0ZSAoYmxlbmQpIHR3byBjb2xvcnMgd2l0aCBhIGdpdmVuIGZhY3RvciBpbiBIU0wgbW9kZVxuXHQgKiBAcGFyYW0ge251bWJlcltdfSBjb2xvcjFcblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3IyXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IFtmYWN0b3I9MC41XSAwLi4xXG5cdCAqIEByZXR1cm5zIHtudW1iZXJbXX1cblx0ICovXG5cdGludGVycG9sYXRlSFNMOiBmdW5jdGlvbihjb2xvcjEsIGNvbG9yMiwgZmFjdG9yKSB7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7IGZhY3RvciA9IDAuNTsgfVxuXHRcdHZhciBoc2wxID0gdGhpcy5yZ2IyaHNsKGNvbG9yMSk7XG5cdFx0dmFyIGhzbDIgPSB0aGlzLnJnYjJoc2woY29sb3IyKTtcblx0XHRmb3IgKHZhciBpPTA7aTwzO2krKykge1xuXHRcdFx0aHNsMVtpXSArPSBmYWN0b3IqKGhzbDJbaV0taHNsMVtpXSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmhzbDJyZ2IoaHNsMSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhIG5ldyByYW5kb20gY29sb3IgYmFzZWQgb24gdGhpcyBvbmVcblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3Jcblx0ICogQHBhcmFtIHtudW1iZXJbXX0gZGlmZiBTZXQgb2Ygc3RhbmRhcmQgZGV2aWF0aW9uc1xuXHQgKiBAcmV0dXJucyB7bnVtYmVyW119XG5cdCAqL1xuXHRyYW5kb21pemU6IGZ1bmN0aW9uKGNvbG9yLCBkaWZmKSB7XG5cdFx0aWYgKCEoZGlmZiBpbnN0YW5jZW9mIEFycmF5KSkgeyBkaWZmID0gUk9ULlJORy5nZXROb3JtYWwoMCwgZGlmZik7IH1cblx0XHR2YXIgcmVzdWx0ID0gY29sb3Iuc2xpY2UoKTtcblx0XHRmb3IgKHZhciBpPTA7aTwzO2krKykge1xuXHRcdFx0cmVzdWx0W2ldICs9IChkaWZmIGluc3RhbmNlb2YgQXJyYXkgPyBNYXRoLnJvdW5kKFJPVC5STkcuZ2V0Tm9ybWFsKDAsIGRpZmZbaV0pKSA6IGRpZmYpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhbiBSR0IgY29sb3IgdmFsdWUgdG8gSFNMLiBFeHBlY3RzIDAuLjI1NSBpbnB1dHMsIHByb2R1Y2VzIDAuLjEgb3V0cHV0cy5cblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3Jcblx0ICogQHJldHVybnMge251bWJlcltdfVxuXHQgKi9cblx0cmdiMmhzbDogZnVuY3Rpb24oY29sb3IpIHtcblx0XHR2YXIgciA9IGNvbG9yWzBdLzI1NTtcblx0XHR2YXIgZyA9IGNvbG9yWzFdLzI1NTtcblx0XHR2YXIgYiA9IGNvbG9yWzJdLzI1NTtcblxuXHRcdHZhciBtYXggPSBNYXRoLm1heChyLCBnLCBiKSwgbWluID0gTWF0aC5taW4ociwgZywgYik7XG5cdFx0dmFyIGgsIHMsIGwgPSAobWF4ICsgbWluKSAvIDI7XG5cblx0XHRpZiAobWF4ID09IG1pbikge1xuXHRcdFx0aCA9IHMgPSAwOyAvLyBhY2hyb21hdGljXG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBkID0gbWF4IC0gbWluO1xuXHRcdFx0cyA9IChsID4gMC41ID8gZCAvICgyIC0gbWF4IC0gbWluKSA6IGQgLyAobWF4ICsgbWluKSk7XG5cdFx0XHRzd2l0Y2gobWF4KSB7XG5cdFx0XHRcdGNhc2UgcjogaCA9IChnIC0gYikgLyBkICsgKGcgPCBiID8gNiA6IDApOyBicmVhaztcblx0XHRcdFx0Y2FzZSBnOiBoID0gKGIgLSByKSAvIGQgKyAyOyBicmVhaztcblx0XHRcdFx0Y2FzZSBiOiBoID0gKHIgLSBnKSAvIGQgKyA0OyBicmVhaztcblx0XHRcdH1cblx0XHRcdGggLz0gNjtcblx0XHR9XG5cblx0XHRyZXR1cm4gW2gsIHMsIGxdO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhbiBIU0wgY29sb3IgdmFsdWUgdG8gUkdCLiBFeHBlY3RzIDAuLjEgaW5wdXRzLCBwcm9kdWNlcyAwLi4yNTUgb3V0cHV0cy5cblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3Jcblx0ICogQHJldHVybnMge251bWJlcltdfVxuXHQgKi9cblx0aHNsMnJnYjogZnVuY3Rpb24oY29sb3IpIHtcblx0XHR2YXIgbCA9IGNvbG9yWzJdO1xuXG5cdFx0aWYgKGNvbG9yWzFdID09IDApIHtcblx0XHRcdGwgPSBNYXRoLnJvdW5kKGwqMjU1KTtcblx0XHRcdHJldHVybiBbbCwgbCwgbF07XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZ1bmN0aW9uIGh1ZTJyZ2IocCwgcSwgdCkge1xuXHRcdFx0XHRpZiAodCA8IDApIHQgKz0gMTtcblx0XHRcdFx0aWYgKHQgPiAxKSB0IC09IDE7XG5cdFx0XHRcdGlmICh0IDwgMS82KSByZXR1cm4gcCArIChxIC0gcCkgKiA2ICogdDtcblx0XHRcdFx0aWYgKHQgPCAxLzIpIHJldHVybiBxO1xuXHRcdFx0XHRpZiAodCA8IDIvMykgcmV0dXJuIHAgKyAocSAtIHApICogKDIvMyAtIHQpICogNjtcblx0XHRcdFx0cmV0dXJuIHA7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBzID0gY29sb3JbMV07XG5cdFx0XHR2YXIgcSA9IChsIDwgMC41ID8gbCAqICgxICsgcykgOiBsICsgcyAtIGwgKiBzKTtcblx0XHRcdHZhciBwID0gMiAqIGwgLSBxO1xuXHRcdFx0dmFyIHIgPSBodWUycmdiKHAsIHEsIGNvbG9yWzBdICsgMS8zKTtcblx0XHRcdHZhciBnID0gaHVlMnJnYihwLCBxLCBjb2xvclswXSk7XG5cdFx0XHR2YXIgYiA9IGh1ZTJyZ2IocCwgcSwgY29sb3JbMF0gLSAxLzMpO1xuXHRcdFx0cmV0dXJuIFtNYXRoLnJvdW5kKHIqMjU1KSwgTWF0aC5yb3VuZChnKjI1NSksIE1hdGgucm91bmQoYioyNTUpXTtcblx0XHR9XG5cdH0sXG5cblx0dG9SR0I6IGZ1bmN0aW9uKGNvbG9yKSB7XG5cdFx0cmV0dXJuIFwicmdiKFwiICsgdGhpcy5fY2xhbXAoY29sb3JbMF0pICsgXCIsXCIgKyB0aGlzLl9jbGFtcChjb2xvclsxXSkgKyBcIixcIiArIHRoaXMuX2NsYW1wKGNvbG9yWzJdKSArIFwiKVwiO1xuXHR9LFxuXG5cdHRvSGV4OiBmdW5jdGlvbihjb2xvcikge1xuXHRcdHZhciBwYXJ0cyA9IFtdO1xuXHRcdGZvciAodmFyIGk9MDtpPDM7aSsrKSB7XG5cdFx0XHRwYXJ0cy5wdXNoKHRoaXMuX2NsYW1wKGNvbG9yW2ldKS50b1N0cmluZygxNikubHBhZChcIjBcIiwgMikpO1xuXHRcdH1cblx0XHRyZXR1cm4gXCIjXCIgKyBwYXJ0cy5qb2luKFwiXCIpO1xuXHR9LFxuXG5cdF9jbGFtcDogZnVuY3Rpb24obnVtKSB7XG5cdFx0aWYgKG51bSA8IDApIHtcblx0XHRcdHJldHVybiAwO1xuXHRcdH0gZWxzZSBpZiAobnVtID4gMjU1KSB7XG5cdFx0XHRyZXR1cm4gMjU1O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbnVtO1xuXHRcdH1cblx0fSxcblxuXHRfY2FjaGU6IHtcblx0XHRcImJsYWNrXCI6IFswLDAsMF0sXG5cdFx0XCJuYXZ5XCI6IFswLDAsMTI4XSxcblx0XHRcImRhcmtibHVlXCI6IFswLDAsMTM5XSxcblx0XHRcIm1lZGl1bWJsdWVcIjogWzAsMCwyMDVdLFxuXHRcdFwiYmx1ZVwiOiBbMCwwLDI1NV0sXG5cdFx0XCJkYXJrZ3JlZW5cIjogWzAsMTAwLDBdLFxuXHRcdFwiZ3JlZW5cIjogWzAsMTI4LDBdLFxuXHRcdFwidGVhbFwiOiBbMCwxMjgsMTI4XSxcblx0XHRcImRhcmtjeWFuXCI6IFswLDEzOSwxMzldLFxuXHRcdFwiZGVlcHNreWJsdWVcIjogWzAsMTkxLDI1NV0sXG5cdFx0XCJkYXJrdHVycXVvaXNlXCI6IFswLDIwNiwyMDldLFxuXHRcdFwibWVkaXVtc3ByaW5nZ3JlZW5cIjogWzAsMjUwLDE1NF0sXG5cdFx0XCJsaW1lXCI6IFswLDI1NSwwXSxcblx0XHRcInNwcmluZ2dyZWVuXCI6IFswLDI1NSwxMjddLFxuXHRcdFwiYXF1YVwiOiBbMCwyNTUsMjU1XSxcblx0XHRcImN5YW5cIjogWzAsMjU1LDI1NV0sXG5cdFx0XCJtaWRuaWdodGJsdWVcIjogWzI1LDI1LDExMl0sXG5cdFx0XCJkb2RnZXJibHVlXCI6IFszMCwxNDQsMjU1XSxcblx0XHRcImZvcmVzdGdyZWVuXCI6IFszNCwxMzksMzRdLFxuXHRcdFwic2VhZ3JlZW5cIjogWzQ2LDEzOSw4N10sXG5cdFx0XCJkYXJrc2xhdGVncmF5XCI6IFs0Nyw3OSw3OV0sXG5cdFx0XCJkYXJrc2xhdGVncmV5XCI6IFs0Nyw3OSw3OV0sXG5cdFx0XCJsaW1lZ3JlZW5cIjogWzUwLDIwNSw1MF0sXG5cdFx0XCJtZWRpdW1zZWFncmVlblwiOiBbNjAsMTc5LDExM10sXG5cdFx0XCJ0dXJxdW9pc2VcIjogWzY0LDIyNCwyMDhdLFxuXHRcdFwicm95YWxibHVlXCI6IFs2NSwxMDUsMjI1XSxcblx0XHRcInN0ZWVsYmx1ZVwiOiBbNzAsMTMwLDE4MF0sXG5cdFx0XCJkYXJrc2xhdGVibHVlXCI6IFs3Miw2MSwxMzldLFxuXHRcdFwibWVkaXVtdHVycXVvaXNlXCI6IFs3MiwyMDksMjA0XSxcblx0XHRcImluZGlnb1wiOiBbNzUsMCwxMzBdLFxuXHRcdFwiZGFya29saXZlZ3JlZW5cIjogWzg1LDEwNyw0N10sXG5cdFx0XCJjYWRldGJsdWVcIjogWzk1LDE1OCwxNjBdLFxuXHRcdFwiY29ybmZsb3dlcmJsdWVcIjogWzEwMCwxNDksMjM3XSxcblx0XHRcIm1lZGl1bWFxdWFtYXJpbmVcIjogWzEwMiwyMDUsMTcwXSxcblx0XHRcImRpbWdyYXlcIjogWzEwNSwxMDUsMTA1XSxcblx0XHRcImRpbWdyZXlcIjogWzEwNSwxMDUsMTA1XSxcblx0XHRcInNsYXRlYmx1ZVwiOiBbMTA2LDkwLDIwNV0sXG5cdFx0XCJvbGl2ZWRyYWJcIjogWzEwNywxNDIsMzVdLFxuXHRcdFwic2xhdGVncmF5XCI6IFsxMTIsMTI4LDE0NF0sXG5cdFx0XCJzbGF0ZWdyZXlcIjogWzExMiwxMjgsMTQ0XSxcblx0XHRcImxpZ2h0c2xhdGVncmF5XCI6IFsxMTksMTM2LDE1M10sXG5cdFx0XCJsaWdodHNsYXRlZ3JleVwiOiBbMTE5LDEzNiwxNTNdLFxuXHRcdFwibWVkaXVtc2xhdGVibHVlXCI6IFsxMjMsMTA0LDIzOF0sXG5cdFx0XCJsYXduZ3JlZW5cIjogWzEyNCwyNTIsMF0sXG5cdFx0XCJjaGFydHJldXNlXCI6IFsxMjcsMjU1LDBdLFxuXHRcdFwiYXF1YW1hcmluZVwiOiBbMTI3LDI1NSwyMTJdLFxuXHRcdFwibWFyb29uXCI6IFsxMjgsMCwwXSxcblx0XHRcInB1cnBsZVwiOiBbMTI4LDAsMTI4XSxcblx0XHRcIm9saXZlXCI6IFsxMjgsMTI4LDBdLFxuXHRcdFwiZ3JheVwiOiBbMTI4LDEyOCwxMjhdLFxuXHRcdFwiZ3JleVwiOiBbMTI4LDEyOCwxMjhdLFxuXHRcdFwic2t5Ymx1ZVwiOiBbMTM1LDIwNiwyMzVdLFxuXHRcdFwibGlnaHRza3libHVlXCI6IFsxMzUsMjA2LDI1MF0sXG5cdFx0XCJibHVldmlvbGV0XCI6IFsxMzgsNDMsMjI2XSxcblx0XHRcImRhcmtyZWRcIjogWzEzOSwwLDBdLFxuXHRcdFwiZGFya21hZ2VudGFcIjogWzEzOSwwLDEzOV0sXG5cdFx0XCJzYWRkbGVicm93blwiOiBbMTM5LDY5LDE5XSxcblx0XHRcImRhcmtzZWFncmVlblwiOiBbMTQzLDE4OCwxNDNdLFxuXHRcdFwibGlnaHRncmVlblwiOiBbMTQ0LDIzOCwxNDRdLFxuXHRcdFwibWVkaXVtcHVycGxlXCI6IFsxNDcsMTEyLDIxNl0sXG5cdFx0XCJkYXJrdmlvbGV0XCI6IFsxNDgsMCwyMTFdLFxuXHRcdFwicGFsZWdyZWVuXCI6IFsxNTIsMjUxLDE1Ml0sXG5cdFx0XCJkYXJrb3JjaGlkXCI6IFsxNTMsNTAsMjA0XSxcblx0XHRcInllbGxvd2dyZWVuXCI6IFsxNTQsMjA1LDUwXSxcblx0XHRcInNpZW5uYVwiOiBbMTYwLDgyLDQ1XSxcblx0XHRcImJyb3duXCI6IFsxNjUsNDIsNDJdLFxuXHRcdFwiZGFya2dyYXlcIjogWzE2OSwxNjksMTY5XSxcblx0XHRcImRhcmtncmV5XCI6IFsxNjksMTY5LDE2OV0sXG5cdFx0XCJsaWdodGJsdWVcIjogWzE3MywyMTYsMjMwXSxcblx0XHRcImdyZWVueWVsbG93XCI6IFsxNzMsMjU1LDQ3XSxcblx0XHRcInBhbGV0dXJxdW9pc2VcIjogWzE3NSwyMzgsMjM4XSxcblx0XHRcImxpZ2h0c3RlZWxibHVlXCI6IFsxNzYsMTk2LDIyMl0sXG5cdFx0XCJwb3dkZXJibHVlXCI6IFsxNzYsMjI0LDIzMF0sXG5cdFx0XCJmaXJlYnJpY2tcIjogWzE3OCwzNCwzNF0sXG5cdFx0XCJkYXJrZ29sZGVucm9kXCI6IFsxODQsMTM0LDExXSxcblx0XHRcIm1lZGl1bW9yY2hpZFwiOiBbMTg2LDg1LDIxMV0sXG5cdFx0XCJyb3N5YnJvd25cIjogWzE4OCwxNDMsMTQzXSxcblx0XHRcImRhcmtraGFraVwiOiBbMTg5LDE4MywxMDddLFxuXHRcdFwic2lsdmVyXCI6IFsxOTIsMTkyLDE5Ml0sXG5cdFx0XCJtZWRpdW12aW9sZXRyZWRcIjogWzE5OSwyMSwxMzNdLFxuXHRcdFwiaW5kaWFucmVkXCI6IFsyMDUsOTIsOTJdLFxuXHRcdFwicGVydVwiOiBbMjA1LDEzMyw2M10sXG5cdFx0XCJjaG9jb2xhdGVcIjogWzIxMCwxMDUsMzBdLFxuXHRcdFwidGFuXCI6IFsyMTAsMTgwLDE0MF0sXG5cdFx0XCJsaWdodGdyYXlcIjogWzIxMSwyMTEsMjExXSxcblx0XHRcImxpZ2h0Z3JleVwiOiBbMjExLDIxMSwyMTFdLFxuXHRcdFwicGFsZXZpb2xldHJlZFwiOiBbMjE2LDExMiwxNDddLFxuXHRcdFwidGhpc3RsZVwiOiBbMjE2LDE5MSwyMTZdLFxuXHRcdFwib3JjaGlkXCI6IFsyMTgsMTEyLDIxNF0sXG5cdFx0XCJnb2xkZW5yb2RcIjogWzIxOCwxNjUsMzJdLFxuXHRcdFwiY3JpbXNvblwiOiBbMjIwLDIwLDYwXSxcblx0XHRcImdhaW5zYm9yb1wiOiBbMjIwLDIyMCwyMjBdLFxuXHRcdFwicGx1bVwiOiBbMjIxLDE2MCwyMjFdLFxuXHRcdFwiYnVybHl3b29kXCI6IFsyMjIsMTg0LDEzNV0sXG5cdFx0XCJsaWdodGN5YW5cIjogWzIyNCwyNTUsMjU1XSxcblx0XHRcImxhdmVuZGVyXCI6IFsyMzAsMjMwLDI1MF0sXG5cdFx0XCJkYXJrc2FsbW9uXCI6IFsyMzMsMTUwLDEyMl0sXG5cdFx0XCJ2aW9sZXRcIjogWzIzOCwxMzAsMjM4XSxcblx0XHRcInBhbGVnb2xkZW5yb2RcIjogWzIzOCwyMzIsMTcwXSxcblx0XHRcImxpZ2h0Y29yYWxcIjogWzI0MCwxMjgsMTI4XSxcblx0XHRcImtoYWtpXCI6IFsyNDAsMjMwLDE0MF0sXG5cdFx0XCJhbGljZWJsdWVcIjogWzI0MCwyNDgsMjU1XSxcblx0XHRcImhvbmV5ZGV3XCI6IFsyNDAsMjU1LDI0MF0sXG5cdFx0XCJhenVyZVwiOiBbMjQwLDI1NSwyNTVdLFxuXHRcdFwic2FuZHlicm93blwiOiBbMjQ0LDE2NCw5Nl0sXG5cdFx0XCJ3aGVhdFwiOiBbMjQ1LDIyMiwxNzldLFxuXHRcdFwiYmVpZ2VcIjogWzI0NSwyNDUsMjIwXSxcblx0XHRcIndoaXRlc21va2VcIjogWzI0NSwyNDUsMjQ1XSxcblx0XHRcIm1pbnRjcmVhbVwiOiBbMjQ1LDI1NSwyNTBdLFxuXHRcdFwiZ2hvc3R3aGl0ZVwiOiBbMjQ4LDI0OCwyNTVdLFxuXHRcdFwic2FsbW9uXCI6IFsyNTAsMTI4LDExNF0sXG5cdFx0XCJhbnRpcXVld2hpdGVcIjogWzI1MCwyMzUsMjE1XSxcblx0XHRcImxpbmVuXCI6IFsyNTAsMjQwLDIzMF0sXG5cdFx0XCJsaWdodGdvbGRlbnJvZHllbGxvd1wiOiBbMjUwLDI1MCwyMTBdLFxuXHRcdFwib2xkbGFjZVwiOiBbMjUzLDI0NSwyMzBdLFxuXHRcdFwicmVkXCI6IFsyNTUsMCwwXSxcblx0XHRcImZ1Y2hzaWFcIjogWzI1NSwwLDI1NV0sXG5cdFx0XCJtYWdlbnRhXCI6IFsyNTUsMCwyNTVdLFxuXHRcdFwiZGVlcHBpbmtcIjogWzI1NSwyMCwxNDddLFxuXHRcdFwib3JhbmdlcmVkXCI6IFsyNTUsNjksMF0sXG5cdFx0XCJ0b21hdG9cIjogWzI1NSw5OSw3MV0sXG5cdFx0XCJob3RwaW5rXCI6IFsyNTUsMTA1LDE4MF0sXG5cdFx0XCJjb3JhbFwiOiBbMjU1LDEyNyw4MF0sXG5cdFx0XCJkYXJrb3JhbmdlXCI6IFsyNTUsMTQwLDBdLFxuXHRcdFwibGlnaHRzYWxtb25cIjogWzI1NSwxNjAsMTIyXSxcblx0XHRcIm9yYW5nZVwiOiBbMjU1LDE2NSwwXSxcblx0XHRcImxpZ2h0cGlua1wiOiBbMjU1LDE4MiwxOTNdLFxuXHRcdFwicGlua1wiOiBbMjU1LDE5MiwyMDNdLFxuXHRcdFwiZ29sZFwiOiBbMjU1LDIxNSwwXSxcblx0XHRcInBlYWNocHVmZlwiOiBbMjU1LDIxOCwxODVdLFxuXHRcdFwibmF2YWpvd2hpdGVcIjogWzI1NSwyMjIsMTczXSxcblx0XHRcIm1vY2Nhc2luXCI6IFsyNTUsMjI4LDE4MV0sXG5cdFx0XCJiaXNxdWVcIjogWzI1NSwyMjgsMTk2XSxcblx0XHRcIm1pc3R5cm9zZVwiOiBbMjU1LDIyOCwyMjVdLFxuXHRcdFwiYmxhbmNoZWRhbG1vbmRcIjogWzI1NSwyMzUsMjA1XSxcblx0XHRcInBhcGF5YXdoaXBcIjogWzI1NSwyMzksMjEzXSxcblx0XHRcImxhdmVuZGVyYmx1c2hcIjogWzI1NSwyNDAsMjQ1XSxcblx0XHRcInNlYXNoZWxsXCI6IFsyNTUsMjQ1LDIzOF0sXG5cdFx0XCJjb3Juc2lsa1wiOiBbMjU1LDI0OCwyMjBdLFxuXHRcdFwibGVtb25jaGlmZm9uXCI6IFsyNTUsMjUwLDIwNV0sXG5cdFx0XCJmbG9yYWx3aGl0ZVwiOiBbMjU1LDI1MCwyNDBdLFxuXHRcdFwic25vd1wiOiBbMjU1LDI1MCwyNTBdLFxuXHRcdFwieWVsbG93XCI6IFsyNTUsMjU1LDBdLFxuXHRcdFwibGlnaHR5ZWxsb3dcIjogWzI1NSwyNTUsMjI0XSxcblx0XHRcIml2b3J5XCI6IFsyNTUsMjU1LDI0MF0sXG5cdFx0XCJ3aGl0ZVwiOiBbMjU1LDI1NSwyNTVdXG5cdH1cbn1cbi8qKlxuICogQGNsYXNzIExpZ2h0aW5nIGNvbXB1dGF0aW9uLCBiYXNlZCBvbiBhIHRyYWRpdGlvbmFsIEZPViBmb3IgbXVsdGlwbGUgbGlnaHQgc291cmNlcyBhbmQgbXVsdGlwbGUgcGFzc2VzLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gcmVmbGVjdGl2aXR5Q2FsbGJhY2sgQ2FsbGJhY2sgdG8gcmV0cmlldmUgY2VsbCByZWZsZWN0aXZpdHkgKDAuLjEpXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXG4gKiBAcGFyYW0ge2ludH0gW29wdGlvbnMucGFzc2VzPTFdIE51bWJlciBvZiBwYXNzZXMuIDEgZXF1YWxzIHRvIHNpbXBsZSBGT1Ygb2YgYWxsIGxpZ2h0IHNvdXJjZXMsID4xIG1lYW5zIGEgKmhpZ2hseSBzaW1wbGlmaWVkKiByYWRpb3NpdHktbGlrZSBhbGdvcml0aG0uXG4gKiBAcGFyYW0ge2ludH0gW29wdGlvbnMuZW1pc3Npb25UaHJlc2hvbGQ9MTAwXSBDZWxscyB3aXRoIGVtaXNzaXZpdHkgPiB0aHJlc2hvbGQgd2lsbCBiZSB0cmVhdGVkIGFzIGxpZ2h0IHNvdXJjZSBpbiB0aGUgbmV4dCBwYXNzLlxuICogQHBhcmFtIHtpbnR9IFtvcHRpb25zLnJhbmdlPTEwXSBNYXggbGlnaHQgcmFuZ2VcbiAqL1xuUk9ULkxpZ2h0aW5nID0gZnVuY3Rpb24ocmVmbGVjdGl2aXR5Q2FsbGJhY2ssIG9wdGlvbnMpIHtcblx0dGhpcy5fcmVmbGVjdGl2aXR5Q2FsbGJhY2sgPSByZWZsZWN0aXZpdHlDYWxsYmFjaztcblx0dGhpcy5fb3B0aW9ucyA9IHtcblx0XHRwYXNzZXM6IDEsXG5cdFx0ZW1pc3Npb25UaHJlc2hvbGQ6IDEwMCxcblx0XHRyYW5nZTogMTBcblx0fTtcblx0dGhpcy5fZm92ID0gbnVsbDtcblxuXHR0aGlzLl9saWdodHMgPSB7fTtcblx0dGhpcy5fcmVmbGVjdGl2aXR5Q2FjaGUgPSB7fTtcblx0dGhpcy5fZm92Q2FjaGUgPSB7fTtcblxuXHR0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG59XG5cbi8qKlxuICogQWRqdXN0IG9wdGlvbnMgYXQgcnVudGltZVxuICogQHNlZSBST1QuTGlnaHRpbmdcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cbiAqL1xuUk9ULkxpZ2h0aW5nLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXHRmb3IgKHZhciBwIGluIG9wdGlvbnMpIHsgdGhpcy5fb3B0aW9uc1twXSA9IG9wdGlvbnNbcF07IH1cblx0aWYgKG9wdGlvbnMucmFuZ2UpIHsgdGhpcy5yZXNldCgpOyB9XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFNldCB0aGUgdXNlZCBGaWVsZC1PZi1WaWV3IGFsZ29cbiAqIEBwYXJhbSB7Uk9ULkZPVn0gZm92XG4gKi9cblJPVC5MaWdodGluZy5wcm90b3R5cGUuc2V0Rk9WID0gZnVuY3Rpb24oZm92KSB7XG5cdHRoaXMuX2ZvdiA9IGZvdjtcblx0dGhpcy5fZm92Q2FjaGUgPSB7fTtcblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogU2V0IChvciByZW1vdmUpIGEgbGlnaHQgc291cmNlXG4gKiBAcGFyYW0ge2ludH0geFxuICogQHBhcmFtIHtpbnR9IHlcbiAqIEBwYXJhbSB7bnVsbCB8fCBzdHJpbmcgfHwgbnVtYmVyWzNdfSBjb2xvclxuICovXG5ST1QuTGlnaHRpbmcucHJvdG90eXBlLnNldExpZ2h0ID0gZnVuY3Rpb24oeCwgeSwgY29sb3IpIHtcblx0dmFyIGtleSA9IHgrXCIsXCIreTtcblxuXHRpZiAoY29sb3IpIHtcblx0XHR0aGlzLl9saWdodHNba2V5XSA9ICh0eXBlb2YoY29sb3IpID09IFwic3RyaW5nXCIgPyBST1QuQ29sb3IuZnJvbVN0cmluZyhjb2xvcikgOiBjb2xvcik7XG5cdH0gZWxzZSB7XG5cdFx0ZGVsZXRlIHRoaXMuX2xpZ2h0c1trZXldO1xuXHR9XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFJlc2V0IHRoZSBwcmUtY29tcHV0ZWQgdG9wb2xvZ3kgdmFsdWVzLiBDYWxsIHdoZW5ldmVyIHRoZSB1bmRlcmx5aW5nIG1hcCBjaGFuZ2VzIGl0cyBsaWdodC1wYXNzYWJpbGl0eS5cbiAqL1xuUk9ULkxpZ2h0aW5nLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9yZWZsZWN0aXZpdHlDYWNoZSA9IHt9O1xuXHR0aGlzLl9mb3ZDYWNoZSA9IHt9O1xuXG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIENvbXB1dGUgdGhlIGxpZ2h0aW5nXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBsaWdodGluZ0NhbGxiYWNrIFdpbGwgYmUgY2FsbGVkIHdpdGggKHgsIHksIGNvbG9yKSBmb3IgZXZlcnkgbGl0IGNlbGxcbiAqL1xuUk9ULkxpZ2h0aW5nLnByb3RvdHlwZS5jb21wdXRlID0gZnVuY3Rpb24obGlnaHRpbmdDYWxsYmFjaykge1xuXHR2YXIgZG9uZUNlbGxzID0ge307XG5cdHZhciBlbWl0dGluZ0NlbGxzID0ge307XG5cdHZhciBsaXRDZWxscyA9IHt9O1xuXG5cdGZvciAodmFyIGtleSBpbiB0aGlzLl9saWdodHMpIHsgLyogcHJlcGFyZSBlbWl0dGVycyBmb3IgZmlyc3QgcGFzcyAqL1xuXHRcdHZhciBsaWdodCA9IHRoaXMuX2xpZ2h0c1trZXldO1xuXHRcdGlmICghKGtleSBpbiBlbWl0dGluZ0NlbGxzKSkgeyBlbWl0dGluZ0NlbGxzW2tleV0gPSBbMCwgMCwgMF07IH1cblxuXHRcdFJPVC5Db2xvci5hZGRfKGVtaXR0aW5nQ2VsbHNba2V5XSwgbGlnaHQpO1xuXHR9XG5cblx0Zm9yICh2YXIgaT0wO2k8dGhpcy5fb3B0aW9ucy5wYXNzZXM7aSsrKSB7IC8qIG1haW4gbG9vcCAqL1xuXHRcdHRoaXMuX2VtaXRMaWdodChlbWl0dGluZ0NlbGxzLCBsaXRDZWxscywgZG9uZUNlbGxzKTtcblx0XHRpZiAoaSsxID09IHRoaXMuX29wdGlvbnMucGFzc2VzKSB7IGNvbnRpbnVlOyB9IC8qIG5vdCBmb3IgdGhlIGxhc3QgcGFzcyAqL1xuXHRcdGVtaXR0aW5nQ2VsbHMgPSB0aGlzLl9jb21wdXRlRW1pdHRlcnMobGl0Q2VsbHMsIGRvbmVDZWxscyk7XG5cdH1cblxuXHRmb3IgKHZhciBsaXRLZXkgaW4gbGl0Q2VsbHMpIHsgLyogbGV0IHRoZSB1c2VyIGtub3cgd2hhdCBhbmQgaG93IGlzIGxpdCAqL1xuXHRcdHZhciBwYXJ0cyA9IGxpdEtleS5zcGxpdChcIixcIik7XG5cdFx0dmFyIHggPSBwYXJzZUludChwYXJ0c1swXSk7XG5cdFx0dmFyIHkgPSBwYXJzZUludChwYXJ0c1sxXSk7XG5cdFx0bGlnaHRpbmdDYWxsYmFjayh4LCB5LCBsaXRDZWxsc1tsaXRLZXldKTtcblx0fVxuXG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIENvbXB1dGUgb25lIGl0ZXJhdGlvbiBmcm9tIGFsbCBlbWl0dGluZyBjZWxsc1xuICogQHBhcmFtIHtvYmplY3R9IGVtaXR0aW5nQ2VsbHMgVGhlc2UgZW1pdCBsaWdodFxuICogQHBhcmFtIHtvYmplY3R9IGxpdENlbGxzIEFkZCBwcm9qZWN0ZWQgbGlnaHQgdG8gdGhlc2VcbiAqIEBwYXJhbSB7b2JqZWN0fSBkb25lQ2VsbHMgVGhlc2UgYWxyZWFkeSBlbWl0dGVkLCBmb3JiaWQgdGhlbSBmcm9tIGZ1cnRoZXIgY2FsY3VsYXRpb25zXG4gKi9cblJPVC5MaWdodGluZy5wcm90b3R5cGUuX2VtaXRMaWdodCA9IGZ1bmN0aW9uKGVtaXR0aW5nQ2VsbHMsIGxpdENlbGxzLCBkb25lQ2VsbHMpIHtcblx0Zm9yICh2YXIga2V5IGluIGVtaXR0aW5nQ2VsbHMpIHtcblx0XHR2YXIgcGFydHMgPSBrZXkuc3BsaXQoXCIsXCIpO1xuXHRcdHZhciB4ID0gcGFyc2VJbnQocGFydHNbMF0pO1xuXHRcdHZhciB5ID0gcGFyc2VJbnQocGFydHNbMV0pO1xuXHRcdHRoaXMuX2VtaXRMaWdodEZyb21DZWxsKHgsIHksIGVtaXR0aW5nQ2VsbHNba2V5XSwgbGl0Q2VsbHMpO1xuXHRcdGRvbmVDZWxsc1trZXldID0gMTtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBQcmVwYXJlIGEgbGlzdCBvZiBlbWl0dGVycyBmb3IgbmV4dCBwYXNzXG4gKiBAcGFyYW0ge29iamVjdH0gbGl0Q2VsbHNcbiAqIEBwYXJhbSB7b2JqZWN0fSBkb25lQ2VsbHNcbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKi9cblJPVC5MaWdodGluZy5wcm90b3R5cGUuX2NvbXB1dGVFbWl0dGVycyA9IGZ1bmN0aW9uKGxpdENlbGxzLCBkb25lQ2VsbHMpIHtcblx0dmFyIHJlc3VsdCA9IHt9O1xuXG5cdGZvciAodmFyIGtleSBpbiBsaXRDZWxscykge1xuXHRcdGlmIChrZXkgaW4gZG9uZUNlbGxzKSB7IGNvbnRpbnVlOyB9IC8qIGFscmVhZHkgZW1pdHRlZCAqL1xuXG5cdFx0dmFyIGNvbG9yID0gbGl0Q2VsbHNba2V5XTtcblxuXHRcdGlmIChrZXkgaW4gdGhpcy5fcmVmbGVjdGl2aXR5Q2FjaGUpIHtcblx0XHRcdHZhciByZWZsZWN0aXZpdHkgPSB0aGlzLl9yZWZsZWN0aXZpdHlDYWNoZVtrZXldO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgcGFydHMgPSBrZXkuc3BsaXQoXCIsXCIpO1xuXHRcdFx0dmFyIHggPSBwYXJzZUludChwYXJ0c1swXSk7XG5cdFx0XHR2YXIgeSA9IHBhcnNlSW50KHBhcnRzWzFdKTtcblx0XHRcdHZhciByZWZsZWN0aXZpdHkgPSB0aGlzLl9yZWZsZWN0aXZpdHlDYWxsYmFjayh4LCB5KTtcblx0XHRcdHRoaXMuX3JlZmxlY3Rpdml0eUNhY2hlW2tleV0gPSByZWZsZWN0aXZpdHk7XG5cdFx0fVxuXG5cdFx0aWYgKHJlZmxlY3Rpdml0eSA9PSAwKSB7IGNvbnRpbnVlOyB9IC8qIHdpbGwgbm90IHJlZmxlY3QgYXQgYWxsICovXG5cblx0XHQvKiBjb21wdXRlIGVtaXNzaW9uIGNvbG9yICovXG5cdFx0dmFyIGVtaXNzaW9uID0gW107XG5cdFx0dmFyIGludGVuc2l0eSA9IDA7XG5cdFx0Zm9yICh2YXIgaT0wO2k8MztpKyspIHtcblx0XHRcdHZhciBwYXJ0ID0gTWF0aC5yb3VuZChjb2xvcltpXSpyZWZsZWN0aXZpdHkpO1xuXHRcdFx0ZW1pc3Npb25baV0gPSBwYXJ0O1xuXHRcdFx0aW50ZW5zaXR5ICs9IHBhcnQ7XG5cdFx0fVxuXHRcdGlmIChpbnRlbnNpdHkgPiB0aGlzLl9vcHRpb25zLmVtaXNzaW9uVGhyZXNob2xkKSB7IHJlc3VsdFtrZXldID0gZW1pc3Npb247IH1cblx0fVxuXG5cdHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQ29tcHV0ZSBvbmUgaXRlcmF0aW9uIGZyb20gb25lIGNlbGxcbiAqIEBwYXJhbSB7aW50fSB4XG4gKiBAcGFyYW0ge2ludH0geVxuICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3JcbiAqIEBwYXJhbSB7b2JqZWN0fSBsaXRDZWxscyBDZWxsIGRhdGEgdG8gYnkgdXBkYXRlZFxuICovXG5ST1QuTGlnaHRpbmcucHJvdG90eXBlLl9lbWl0TGlnaHRGcm9tQ2VsbCA9IGZ1bmN0aW9uKHgsIHksIGNvbG9yLCBsaXRDZWxscykge1xuXHR2YXIga2V5ID0geCtcIixcIit5O1xuXHRpZiAoa2V5IGluIHRoaXMuX2ZvdkNhY2hlKSB7XG5cdFx0dmFyIGZvdiA9IHRoaXMuX2ZvdkNhY2hlW2tleV07XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGZvdiA9IHRoaXMuX3VwZGF0ZUZPVih4LCB5KTtcblx0fVxuXG5cdGZvciAodmFyIGZvdktleSBpbiBmb3YpIHtcblx0XHR2YXIgZm9ybUZhY3RvciA9IGZvdltmb3ZLZXldO1xuXG5cdFx0aWYgKGZvdktleSBpbiBsaXRDZWxscykgeyAvKiBhbHJlYWR5IGxpdCAqL1xuXHRcdFx0dmFyIHJlc3VsdCA9IGxpdENlbGxzW2ZvdktleV07XG5cdFx0fSBlbHNlIHsgLyogbmV3bHkgbGl0ICovXG5cdFx0XHR2YXIgcmVzdWx0ID0gWzAsIDAsIDBdO1xuXHRcdFx0bGl0Q2VsbHNbZm92S2V5XSA9IHJlc3VsdDtcblx0XHR9XG5cblx0XHRmb3IgKHZhciBpPTA7aTwzO2krKykgeyByZXN1bHRbaV0gKz0gTWF0aC5yb3VuZChjb2xvcltpXSpmb3JtRmFjdG9yKTsgfSAvKiBhZGQgbGlnaHQgY29sb3IgKi9cblx0fVxuXG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIENvbXB1dGUgRk9WIChcImZvcm0gZmFjdG9yXCIpIGZvciBhIHBvdGVudGlhbCBsaWdodCBzb3VyY2UgYXQgW3gseV1cbiAqIEBwYXJhbSB7aW50fSB4XG4gKiBAcGFyYW0ge2ludH0geVxuICogQHJldHVybnMge29iamVjdH1cbiAqL1xuUk9ULkxpZ2h0aW5nLnByb3RvdHlwZS5fdXBkYXRlRk9WID0gZnVuY3Rpb24oeCwgeSkge1xuXHR2YXIga2V5MSA9IHgrXCIsXCIreTtcblx0dmFyIGNhY2hlID0ge307XG5cdHRoaXMuX2ZvdkNhY2hlW2tleTFdID0gY2FjaGU7XG5cdHZhciByYW5nZSA9IHRoaXMuX29wdGlvbnMucmFuZ2U7XG5cdHZhciBjYiA9IGZ1bmN0aW9uKHgsIHksIHIsIHZpcykge1xuXHRcdHZhciBrZXkyID0geCtcIixcIit5O1xuXHRcdHZhciBmb3JtRmFjdG9yID0gdmlzICogKDEtci9yYW5nZSk7XG5cdFx0aWYgKGZvcm1GYWN0b3IgPT0gMCkgeyByZXR1cm47IH1cblx0XHRjYWNoZVtrZXkyXSA9IGZvcm1GYWN0b3I7XG5cdH1cblx0dGhpcy5fZm92LmNvbXB1dGUoeCwgeSwgcmFuZ2UsIGNiLmJpbmQodGhpcykpO1xuXG5cdHJldHVybiBjYWNoZTtcbn1cbi8qKlxuICogQGNsYXNzIEFic3RyYWN0IHBhdGhmaW5kZXJcbiAqIEBwYXJhbSB7aW50fSB0b1ggVGFyZ2V0IFggY29vcmRcbiAqIEBwYXJhbSB7aW50fSB0b1kgVGFyZ2V0IFkgY29vcmRcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHBhc3NhYmxlQ2FsbGJhY2sgQ2FsbGJhY2sgdG8gZGV0ZXJtaW5lIG1hcCBwYXNzYWJpbGl0eVxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtpbnR9IFtvcHRpb25zLnRvcG9sb2d5PThdXG4gKi9cblJPVC5QYXRoID0gZnVuY3Rpb24odG9YLCB0b1ksIHBhc3NhYmxlQ2FsbGJhY2ssIG9wdGlvbnMpIHtcblx0dGhpcy5fdG9YID0gdG9YO1xuXHR0aGlzLl90b1kgPSB0b1k7XG5cdHRoaXMuX2Zyb21YID0gbnVsbDtcblx0dGhpcy5fZnJvbVkgPSBudWxsO1xuXHR0aGlzLl9wYXNzYWJsZUNhbGxiYWNrID0gcGFzc2FibGVDYWxsYmFjaztcblx0dGhpcy5fb3B0aW9ucyA9IHtcblx0XHR0b3BvbG9neTogOFxuXHR9XG5cdGZvciAodmFyIHAgaW4gb3B0aW9ucykgeyB0aGlzLl9vcHRpb25zW3BdID0gb3B0aW9uc1twXTsgfVxuXG5cdHRoaXMuX2RpcnMgPSBST1QuRElSU1t0aGlzLl9vcHRpb25zLnRvcG9sb2d5XTtcblx0aWYgKHRoaXMuX29wdGlvbnMudG9wb2xvZ3kgPT0gOCkgeyAvKiByZW9yZGVyIGRpcnMgZm9yIG1vcmUgYWVzdGhldGljIHJlc3VsdCAodmVydGljYWwvaG9yaXpvbnRhbCBmaXJzdCkgKi9cblx0XHR0aGlzLl9kaXJzID0gW1xuXHRcdFx0dGhpcy5fZGlyc1swXSxcblx0XHRcdHRoaXMuX2RpcnNbMl0sXG5cdFx0XHR0aGlzLl9kaXJzWzRdLFxuXHRcdFx0dGhpcy5fZGlyc1s2XSxcblx0XHRcdHRoaXMuX2RpcnNbMV0sXG5cdFx0XHR0aGlzLl9kaXJzWzNdLFxuXHRcdFx0dGhpcy5fZGlyc1s1XSxcblx0XHRcdHRoaXMuX2RpcnNbN11cblx0XHRdXG5cdH1cbn1cblxuLyoqXG4gKiBDb21wdXRlIGEgcGF0aCBmcm9tIGEgZ2l2ZW4gcG9pbnRcbiAqIEBwYXJhbSB7aW50fSBmcm9tWFxuICogQHBhcmFtIHtpbnR9IGZyb21ZXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBXaWxsIGJlIGNhbGxlZCBmb3IgZXZlcnkgcGF0aCBpdGVtIHdpdGggYXJndW1lbnRzIFwieFwiIGFuZCBcInlcIlxuICovXG5ST1QuUGF0aC5wcm90b3R5cGUuY29tcHV0ZSA9IGZ1bmN0aW9uKGZyb21YLCBmcm9tWSwgY2FsbGJhY2spIHtcbn1cblxuUk9ULlBhdGgucHJvdG90eXBlLl9nZXROZWlnaGJvcnMgPSBmdW5jdGlvbihjeCwgY3kpIHtcblx0dmFyIHJlc3VsdCA9IFtdO1xuXHRmb3IgKHZhciBpPTA7aTx0aGlzLl9kaXJzLmxlbmd0aDtpKyspIHtcblx0XHR2YXIgZGlyID0gdGhpcy5fZGlyc1tpXTtcblx0XHR2YXIgeCA9IGN4ICsgZGlyWzBdO1xuXHRcdHZhciB5ID0gY3kgKyBkaXJbMV07XG5cdFx0XG5cdFx0aWYgKCF0aGlzLl9wYXNzYWJsZUNhbGxiYWNrKHgsIHkpKSB7IGNvbnRpbnVlOyB9XG5cdFx0cmVzdWx0LnB1c2goW3gsIHldKTtcblx0fVxuXHRcblx0cmV0dXJuIHJlc3VsdDtcbn1cbi8qKlxuICogQGNsYXNzIFNpbXBsaWZpZWQgRGlqa3N0cmEncyBhbGdvcml0aG06IGFsbCBlZGdlcyBoYXZlIGEgdmFsdWUgb2YgMVxuICogQGF1Z21lbnRzIFJPVC5QYXRoXG4gKiBAc2VlIFJPVC5QYXRoXG4gKi9cblJPVC5QYXRoLkRpamtzdHJhID0gZnVuY3Rpb24odG9YLCB0b1ksIHBhc3NhYmxlQ2FsbGJhY2ssIG9wdGlvbnMpIHtcblx0Uk9ULlBhdGguY2FsbCh0aGlzLCB0b1gsIHRvWSwgcGFzc2FibGVDYWxsYmFjaywgb3B0aW9ucyk7XG5cblx0dGhpcy5fY29tcHV0ZWQgPSB7fTtcblx0dGhpcy5fdG9kbyA9IFtdO1xuXHR0aGlzLl9hZGQodG9YLCB0b1ksIG51bGwpO1xufVxuUk9ULlBhdGguRGlqa3N0cmEuZXh0ZW5kKFJPVC5QYXRoKTtcblxuLyoqXG4gKiBDb21wdXRlIGEgcGF0aCBmcm9tIGEgZ2l2ZW4gcG9pbnRcbiAqIEBzZWUgUk9ULlBhdGgjY29tcHV0ZVxuICovXG5ST1QuUGF0aC5EaWprc3RyYS5wcm90b3R5cGUuY29tcHV0ZSA9IGZ1bmN0aW9uKGZyb21YLCBmcm9tWSwgY2FsbGJhY2spIHtcblx0dmFyIGtleSA9IGZyb21YK1wiLFwiK2Zyb21ZO1xuXHRpZiAoIShrZXkgaW4gdGhpcy5fY29tcHV0ZWQpKSB7IHRoaXMuX2NvbXB1dGUoZnJvbVgsIGZyb21ZKTsgfVxuXHRpZiAoIShrZXkgaW4gdGhpcy5fY29tcHV0ZWQpKSB7IHJldHVybjsgfVxuXHRcblx0dmFyIGl0ZW0gPSB0aGlzLl9jb21wdXRlZFtrZXldO1xuXHR3aGlsZSAoaXRlbSkge1xuXHRcdGNhbGxiYWNrKGl0ZW0ueCwgaXRlbS55KTtcblx0XHRpdGVtID0gaXRlbS5wcmV2O1xuXHR9XG59XG5cbi8qKlxuICogQ29tcHV0ZSBhIG5vbi1jYWNoZWQgdmFsdWVcbiAqL1xuUk9ULlBhdGguRGlqa3N0cmEucHJvdG90eXBlLl9jb21wdXRlID0gZnVuY3Rpb24oZnJvbVgsIGZyb21ZKSB7XG5cdHdoaWxlICh0aGlzLl90b2RvLmxlbmd0aCkge1xuXHRcdHZhciBpdGVtID0gdGhpcy5fdG9kby5zaGlmdCgpO1xuXHRcdGlmIChpdGVtLnggPT0gZnJvbVggJiYgaXRlbS55ID09IGZyb21ZKSB7IHJldHVybjsgfVxuXHRcdFxuXHRcdHZhciBuZWlnaGJvcnMgPSB0aGlzLl9nZXROZWlnaGJvcnMoaXRlbS54LCBpdGVtLnkpO1xuXHRcdFxuXHRcdGZvciAodmFyIGk9MDtpPG5laWdoYm9ycy5sZW5ndGg7aSsrKSB7XG5cdFx0XHR2YXIgbmVpZ2hib3IgPSBuZWlnaGJvcnNbaV07XG5cdFx0XHR2YXIgeCA9IG5laWdoYm9yWzBdO1xuXHRcdFx0dmFyIHkgPSBuZWlnaGJvclsxXTtcblx0XHRcdHZhciBpZCA9IHgrXCIsXCIreTtcblx0XHRcdGlmIChpZCBpbiB0aGlzLl9jb21wdXRlZCkgeyBjb250aW51ZTsgfSAvKiBhbHJlYWR5IGRvbmUgKi9cdFxuXHRcdFx0dGhpcy5fYWRkKHgsIHksIGl0ZW0pOyBcblx0XHR9XG5cdH1cbn1cblxuUk9ULlBhdGguRGlqa3N0cmEucHJvdG90eXBlLl9hZGQgPSBmdW5jdGlvbih4LCB5LCBwcmV2KSB7XG5cdHZhciBvYmogPSB7XG5cdFx0eDogeCxcblx0XHR5OiB5LFxuXHRcdHByZXY6IHByZXZcblx0fVxuXHR0aGlzLl9jb21wdXRlZFt4K1wiLFwiK3ldID0gb2JqO1xuXHR0aGlzLl90b2RvLnB1c2gob2JqKTtcbn1cbi8qKlxuICogQGNsYXNzIFNpbXBsaWZpZWQgQSogYWxnb3JpdGhtOiBhbGwgZWRnZXMgaGF2ZSBhIHZhbHVlIG9mIDFcbiAqIEBhdWdtZW50cyBST1QuUGF0aFxuICogQHNlZSBST1QuUGF0aFxuICovXG5ST1QuUGF0aC5BU3RhciA9IGZ1bmN0aW9uKHRvWCwgdG9ZLCBwYXNzYWJsZUNhbGxiYWNrLCBvcHRpb25zKSB7XG5cdFJPVC5QYXRoLmNhbGwodGhpcywgdG9YLCB0b1ksIHBhc3NhYmxlQ2FsbGJhY2ssIG9wdGlvbnMpO1xuXG5cdHRoaXMuX3RvZG8gPSBbXTtcblx0dGhpcy5fZG9uZSA9IHt9O1xuXHR0aGlzLl9mcm9tWCA9IG51bGw7XG5cdHRoaXMuX2Zyb21ZID0gbnVsbDtcbn1cblJPVC5QYXRoLkFTdGFyLmV4dGVuZChST1QuUGF0aCk7XG5cbi8qKlxuICogQ29tcHV0ZSBhIHBhdGggZnJvbSBhIGdpdmVuIHBvaW50XG4gKiBAc2VlIFJPVC5QYXRoI2NvbXB1dGVcbiAqL1xuUk9ULlBhdGguQVN0YXIucHJvdG90eXBlLmNvbXB1dGUgPSBmdW5jdGlvbihmcm9tWCwgZnJvbVksIGNhbGxiYWNrKSB7XG5cdHRoaXMuX3RvZG8gPSBbXTtcblx0dGhpcy5fZG9uZSA9IHt9O1xuXHR0aGlzLl9mcm9tWCA9IGZyb21YO1xuXHR0aGlzLl9mcm9tWSA9IGZyb21ZO1xuXHR0aGlzLl9hZGQodGhpcy5fdG9YLCB0aGlzLl90b1ksIG51bGwpO1xuXG5cdHdoaWxlICh0aGlzLl90b2RvLmxlbmd0aCkge1xuXHRcdHZhciBpdGVtID0gdGhpcy5fdG9kby5zaGlmdCgpO1xuXHRcdGlmIChpdGVtLnggPT0gZnJvbVggJiYgaXRlbS55ID09IGZyb21ZKSB7IGJyZWFrOyB9XG5cdFx0dmFyIG5laWdoYm9ycyA9IHRoaXMuX2dldE5laWdoYm9ycyhpdGVtLngsIGl0ZW0ueSk7XG5cblx0XHRmb3IgKHZhciBpPTA7aTxuZWlnaGJvcnMubGVuZ3RoO2krKykge1xuXHRcdFx0dmFyIG5laWdoYm9yID0gbmVpZ2hib3JzW2ldO1xuXHRcdFx0dmFyIHggPSBuZWlnaGJvclswXTtcblx0XHRcdHZhciB5ID0gbmVpZ2hib3JbMV07XG5cdFx0XHR2YXIgaWQgPSB4K1wiLFwiK3k7XG5cdFx0XHRpZiAoaWQgaW4gdGhpcy5fZG9uZSkgeyBjb250aW51ZTsgfVxuXHRcdFx0dGhpcy5fYWRkKHgsIHksIGl0ZW0pOyBcblx0XHR9XG5cdH1cblx0XG5cdHZhciBpdGVtID0gdGhpcy5fZG9uZVtmcm9tWCtcIixcIitmcm9tWV07XG5cdGlmICghaXRlbSkgeyByZXR1cm47IH1cblx0XG5cdHdoaWxlIChpdGVtKSB7XG5cdFx0Y2FsbGJhY2soaXRlbS54LCBpdGVtLnkpO1xuXHRcdGl0ZW0gPSBpdGVtLnByZXY7XG5cdH1cbn1cblxuUk9ULlBhdGguQVN0YXIucHJvdG90eXBlLl9hZGQgPSBmdW5jdGlvbih4LCB5LCBwcmV2KSB7XG5cdHZhciBvYmogPSB7XG5cdFx0eDogeCxcblx0XHR5OiB5LFxuXHRcdHByZXY6IHByZXYsXG5cdFx0ZzogKHByZXYgPyBwcmV2LmcrMSA6IDApLFxuXHRcdGg6IHRoaXMuX2Rpc3RhbmNlKHgsIHkpXG5cdH1cblx0dGhpcy5fZG9uZVt4K1wiLFwiK3ldID0gb2JqO1xuXHRcblx0LyogaW5zZXJ0IGludG8gcHJpb3JpdHkgcXVldWUgKi9cblx0XG5cdHZhciBmID0gb2JqLmcgKyBvYmouaDtcblx0Zm9yICh2YXIgaT0wO2k8dGhpcy5fdG9kby5sZW5ndGg7aSsrKSB7XG5cdFx0dmFyIGl0ZW0gPSB0aGlzLl90b2RvW2ldO1xuXHRcdGlmIChmIDwgaXRlbS5nICsgaXRlbS5oKSB7XG5cdFx0XHR0aGlzLl90b2RvLnNwbGljZShpLCAwLCBvYmopO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0fVxuXHRcblx0dGhpcy5fdG9kby5wdXNoKG9iaik7XG59XG5cblJPVC5QYXRoLkFTdGFyLnByb3RvdHlwZS5fZGlzdGFuY2UgPSBmdW5jdGlvbih4LCB5KSB7XG5cdHN3aXRjaCAodGhpcy5fb3B0aW9ucy50b3BvbG9neSkge1xuXHRcdGNhc2UgNDpcblx0XHRcdHJldHVybiAoTWF0aC5hYnMoeC10aGlzLl9mcm9tWCkgKyBNYXRoLmFicyh5LXRoaXMuX2Zyb21ZKSk7XG5cdFx0YnJlYWs7XG5cblx0XHRjYXNlIDY6XG5cdFx0XHR2YXIgZHggPSBNYXRoLmFicyh4IC0gdGhpcy5fZnJvbVgpO1xuXHRcdFx0dmFyIGR5ID0gTWF0aC5hYnMoeSAtIHRoaXMuX2Zyb21ZKTtcblx0XHRcdHJldHVybiBkeSArIE1hdGgubWF4KDAsIChkeC1keSkvMik7XG5cdFx0YnJlYWs7XG5cblx0XHRjYXNlIDg6IFxuXHRcdFx0cmV0dXJuIE1hdGgubWF4KE1hdGguYWJzKHgtdGhpcy5fZnJvbVgpLCBNYXRoLmFicyh5LXRoaXMuX2Zyb21ZKSk7XG5cdFx0YnJlYWs7XG5cdH1cbn1cbiJdfQ==
;