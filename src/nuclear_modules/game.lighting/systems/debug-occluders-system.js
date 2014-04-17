'use strict';

module.exports = function debugOccludersSystem(e, components, context) {
  var dest, position, vertices, length, i;

  dest = context.dests[0];

  position = components.position;

  vertices = components.occluder.vertices;
  length = vertices.length;

  dest.save();

  dest.translate(position.x, position.y);

  if (context.cameraPosition) {
    dest.translate(-context.cameraPosition.x, -context.cameraPosition.y);
  }

  dest.strokeStyle = 'blue';

  dest.beginPath();

  dest.moveTo(vertices[0], vertices[1]);

  for (i = 2; i < length; i += 2) {
    dest.lineTo(vertices[i], vertices[i + 1]);
  }

  dest.closePath();

  dest.stroke();

  dest.restore();
};
