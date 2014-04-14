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