'use strict';

var LightComponent;

LightComponent = require('./light-component');

function DynamicLightComponent(e, options) {
  LightComponent.call(this, e, options);
  this.vertices = [];
}

DynamicLightComponent.prototype.contains = function dynamicLightComponentContains(e) {
  var position, x, y, i, length;

  position = nuclear.component('position').of(e);

  x = position.x - this._position.x;
  y = position.y - this._position.y;

  length = this.vertices.length;

  for (i = 0; i < length; i += 1) {
    if (0 > (this.vertices[(i + 1) % length].x - this.vertices[i].x) * (y - this.vertices[i].y) -
      (this.vertices[(i + 1) % length].y - this.vertices[i].y) * (x - this.vertices[i].x)) {
      return false;
    }
  }

  return true;
};

module.exports = DynamicLightComponent;
