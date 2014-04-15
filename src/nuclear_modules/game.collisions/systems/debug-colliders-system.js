'use strict';

module.exports = function debugCollidersSystem(e, components, context) {
  var dest, position, collider, x, y, w, h;

  dest = context.dests[1];

  position = components.position;
  collider = components.collider;

  x = position.x + collider.offsetX;
  y = position.y + collider.offsetY;
  w = collider.halfWidth;
  h = collider.halfHeight;

  dest.save();

  dest.strokeStyle = '#f0f';

  dest.beginPath();

  dest.moveTo(x - w, y - h);
  dest.lineTo(x + w, y - h);
  dest.lineTo(x + w, y + h);
  dest.lineTo(x - w, y + h);

  dest.closePath();

  dest.stroke();

  dest.restore();
};
