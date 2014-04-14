'use strict';
var roguemap, ROT, Template, config;

require('./lib/rot');
ROT = window.ROT;
Template = require('./template');
config = require('./config');

roguemap = nuclear.module('roguemap', []);

roguemap.component('map', function(entity, config){
  config.progress = config.progress || function(){};
  var data = [],
      digger = new ROT.Map.Digger(config.width, config.height, {
        roomHeight : config.roomHeight,
        roomWidth : config.roomWidth,
      });

  digger.create(function mapProgress(x, y, value){
    data.push(value);
    config.progress(x, y, value);
  });

  return {
    data : data,
    map : digger
  };
});

roguemap.component('rooms_manager', function(entity, data){
  return data;
}); 

roguemap.component('room', function(entity, data){
  var room = {};

  room.position = {
    x : data._x1,
    y : data._y1
  };

  room.width = data._x2-data._x1;
  room.height = data._y2-data._y1;
  room.size = room.width*room.height;

  return room;
});

roguemap.component('template', function(entity, data){
  var template = new Template(entity, data.position, data.width, data.height, data.config);

  return template;
});

roguemap.entity('room', function(entity, data){
  var room   = nuclear.component('room').add(entity, data),
      ranges = roguemap.config('ranges'),
      templates = roguemap.config('templates'),
      range, valid, u, template;
  for(var x in ranges){
    range = ranges[x];
    valid = false;
    for(u = range[0]; u < range[1]; u++){
      if(room.size === u){
        valid = true;
        template = templates[x];
        nuclear.component('template').add(entity, {
          config : template,
          width : room.width,
          height : room.height,
          position : room.position
        });
      }
    }
    if(valid){
      break;
    }
  }
});

roguemap.entity('map', function(entity, data){
  var digger = nuclear.component('map from roguemap').add(entity, data.mapData).map;
  var rooms = [];
  for(var i = 0; i < digger._rooms.length; i++){
    var room = digger._rooms[i];
    rooms.push(roguemap.entity('room').create(room));
  }

  nuclear.component('rooms_manager from roguemap').add(entity, rooms);
});

roguemap.component('slot', function(entity, data){
  return data;
});

roguemap.entity('slot', function(entity, data){
  var slots = roguemap.config('slots'),
      slot  = slots[data.type];

  if(slot){
    slot = {
      components : slot,
      position : data.position,
      bundle : data.bundle,
      template : data.template
    };

    nuclear.component('slot').add(entity, slot);
  }
});

roguemap.config(config || {
  templates : {},
  ranges : {},
  slots : {}
});

nuclear.import([roguemap]);

module.exports = roguemap;
