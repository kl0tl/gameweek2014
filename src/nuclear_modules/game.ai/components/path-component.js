'use strict';

var height, map;
var context = nuclear.system.context();
function PathComponent(entity, x, y, min, max){
  this.nodes = [];
  this.min = min || 0;
  this.max = max || 10;
}

PathComponent.prototype.from = function pathFrom(x, y){
  if(!this.path){
    height = Math.sqrt(map.length);
    map = context.map.data;
    this.path = new window.ROT.Path.AStar(x, y, function(x, y){
      return (map[x * height + y] === 0 || map[x * height + y] === 3);
    });
  }
  
  var self = this,
      resolution = nuclear.module('roguemap').config('resolution');

  self.nodes.length = 0;
  var i = 0;
  this.path.compute(x, y, function garbageNodes(x, y){
    i++;
    if(i > 1){
      self.nodes.push({
        x : x*resolution,
        y : y*resolution
      });
    }
  });

  return this;
};

PathComponent.prototype.to = function pathTo(x, y){
  if(!this.path){
    map = context.map.data;
    height = Math.sqrt(map.length);
    this.path = new window.ROT.Path.AStar(x, y, function(x, y){
      return (map[x * height + y] === 0 || map[x * height + y] === 3);
    });
  }
  this.path._toX = x;
  this.path._toY = y;

  return this;
};

module.exports = PathComponent;