'use strict';

module.exports = function debugCollidersSystem(e, components, context) {
  var dest, position, collider, x, y, w, h;

  dest = context.dests[0];

  position = components.position;
  collider = components.collider;

  x = position.x + collider.offsetX;
  y = position.y + collider.offsetY;
  w = collider.halfWidth;
  h = collider.halfHeight;

  dest.save();

  dest.strokeStyle = '#f0f';

  // dest.beginPath();

  // dest.moveTo(x - w, y - h);
  // dest.lineTo(x + w, y - h);
  // dest.lineTo(x + w, y + h);
  // dest.lineTo(x - w, y + h);

  // dest.closePath();
  //dest.strokeRect(x-w-context.cameraPosition.x, y-h-context.cameraPosition.y, w*2, h*2);

  //dest.stroke();

  dest.restore();
};
