'use strict';

var map = nuclear.component('map').of(nuclear.entity('map').create({
  mapData : {
    width : 40,
    height : 40,
    roomWidth : [3, 20],
    roomHeight : [3, 20]
  }
}));

for(var i = 0; i < nuclear.system.context('buffers').length; i++){
    var buffer = nuclear.system.context('buffers')[i];
    nuclear.component('sprite').of(buffer).redrawBuffer(nuclear.system.context('dests')[i+1].canvas);
}
console.log(map);