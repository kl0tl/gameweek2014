'use strict';

module.exports = function debugCollidersSystem(/*e, components, context*/) {/*
  var dest, position, collider, x, y, w, h;

  dest = context.dests[0];

  position = components.position;
  collider = components.collider;

  x = position.x + collider.offsetX;
  y = position.y + collider.offsetY;
  w = collider.halfWidth;
  h = collider.halfHeight;

  if (context.cameraPosition) {
    x -= context.cameraPosition.x;
    y -= context.cameraPosition.y;
  }

  dest.save();

  dest.strokeStyle = '#f0f';

  dest.strokeRect(x - w, y - h, w * 2, h * 2);

  dest.restore();*/
};
