'use strict';

module.exports = function debugOccludersSystem(e, components, context) {
  var dest, shape, length, i;

  dest = context.dests[0];

  shape = components.occluder.shape;
  length = shape.length;

  dest.save();

  dest.translate(components.position.x, components.position.y);

  dest.fillStyle = 'black';

  dest.moveTo(shape[0], shape[1]);

  for (i = 2; i < length; i += 2) {
    dest.lineTo(shape[i], shape[i + 1]);
  }

  dest.closePath();

  dest.fill();

  dest.restore();
};
