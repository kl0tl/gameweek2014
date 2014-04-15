'use strict';

var map = nuclear.component('map').of(nuclear.entity('map').create({
  mapData : {
    width : 40,
    height : 40,
    roomWidth : [3, 20],
    roomHeight : [3, 20]
  }
}));

console.log(map);