'use strict';

function OccluderComponent(e, vertices) {
  var length, i, dx, dy, radius;

  this.vertices = vertices.slice();
  this.radius = 0;

  length = vertices.length;

  for (i = 0; i < length; i += 2) {
    dx = vertices[i];
    dy = vertices[i + 1];

    radius = Math.sqrt(dx * dx + dy * dy);

    if (radius > this.radius) {
      this.radius = radius;
    }
  }
}

module.exports = OccluderComponent;
