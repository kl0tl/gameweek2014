'use strict';

var console, nuclear;

console = window.console;
nuclear = window.nuclear;

function Template(id, position, width, height, config){
  this.config = config;
  this.position = position;
  this.width = width;
  this.height = height;
  this.id = id;

  this.slots = generateSlots(this, config.slots);
}

function generateSlots(self, slots){
  var i, slot, data, entities;

  entities = [];
  for(i = 0; i < slots.length; i++){
    slot = slots[i];
    data = {};
    data.position = {
      x : self.position.x + Math.round(slot.position.x*self.width/100),
      y : self.position.y + Math.round(slot.position.y*self.height/100)
    };
    data.bundle = self.config.bundle;
    data.type = slot.type;
    data.template = self.id;

    entities.push(nuclear.entity('slot from roguemap').create(data));
  }

  return entities;
}

module.exports = Template;
