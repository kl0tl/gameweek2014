'use strict';

function LightComponent(options) {
  this.shape = [];
  this.color = options.color;
  this.radius = options.radius;
  this.intensity = options.intensity;
}

module.exports = LightComponent;
