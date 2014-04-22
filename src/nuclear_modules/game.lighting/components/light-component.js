'use strict';

function LightComponent(e, options) {
  this.color = options.color;
  this.radius = options.radius;
  this.intensity = options.intensity;

  this._position = nuclear.component('position').of(e);
}

LightComponent.prototype.contains = function lightComponentContains(e) {
  var position, dx, dy;

  position = nuclear.component('position').of(e);

  dx = position.x - this._position.x;
  dy = position.y - this._position.y;

  return (dx * dx + dy * dy) < (this.radius/2) * (this.radius/2);
};

module.exports = LightComponent;
