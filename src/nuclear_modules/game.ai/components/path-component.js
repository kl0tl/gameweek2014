'use strict';

function PathComponent(entity, map, x, y, topology){
  var height = Math.sqrt(map.length);

  this.path = new window.ROT.Path.AStar(x, y, function(x, y){
    return (map[x * height + y] === 0);
  }, topology || 8);
}

PathComponent.prototype.from = function pathFrom(x, y, callback){
  this.path.compile(x, y, callback || function(){});

  return this;
};

PathComponent.prototype.to = function pathFrom(x, y){
  this.path._toX = x;
  this.path._toY = y;

  return this;
};

module.exports = PathComponent;