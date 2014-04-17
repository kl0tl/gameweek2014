'use strict';

nuclear.events.on('system:before:dynamic-shadows from game.lighting', function () {
var ambient2dContext;

  ambient2dContext = nuclear.system.context().dests[1];

  ambient2dContext.save();

  ambient2dContext.fillStyle = '#0A0D0B';
  ambient2dContext.globalAlpha = 0.8;

  ambient2dContext.clearRect(0, 0, ambient2dContext.canvas.width, ambient2dContext.canvas.height);
  ambient2dContext.fillRect(0, 0, ambient2dContext.canvas.width, ambient2dContext.canvas.height);

  ambient2dContext.restore();
});

module.exports = dynamicShadowsSystem;

function dynamicShadowsSystem(e, components, context) {
  var occluderComponent, positionComponent, dest, angles, angle, light, lightVertices, radius, sqrRadius, occluders, occluder, occluderPosition, occluderVertices, i, j, k, length, dx, dy, radii, rsx, rsy, rdx, rdy, vsx, vsy, vdx, vdy, t1, t2, closestT1, closestX, closestY, sqrm;

  occluderComponent = nuclear.component('occluder');
  positionComponent = nuclear.component('position');

  //dest = context.dests[0];

  //dest.save();

  /*
  if (context.cameraPosition) {
    dest.translate(-context.cameraPosition.x, -context.cameraPosition.y);
  }*/

  angles = [];

  light = components['dynamic-light'];

  lightVertices = light.vertices;
  lightVertices.length = 0;

  radius = light.radius;
  sqrRadius = radius * radius;

  rsx = components.position.x;
  rsy = components.position.y;

  /*
  dest.fillStyle = 'red';

  dest.beginPath();
  dest.arc(rsx, rsy, 5, 0, Math.PI * 2);
  dest.closePath();

  dest.fill();*/

  occluders = context.occluders;

  for (i = 0; (occluder = occluderComponent.of(occluders[i])); i += 1) {
    occluderPosition = positionComponent.of(occluders[i]);

    dx = occluderPosition.x - rsx;
    dy = occluderPosition.y - rsy;

    radii = radius + occluder.radius;

    if (dx * dx + dy * dy > radii * radii) {
      continue;
    }

    occluderVertices = occluder.vertices;

    length = occluderVertices.length;

    for (j = 0; j < length; j += 2) {
      angle = Math.atan2(occluderPosition.y + occluderVertices[j + 1] - rsy, occluderPosition.x + occluderVertices[j] - rsx);
      angles.push(angle - 0.00001, angle, angle + 0.00001);
    }
  }

  for (i = 0; i < angles.length; i += 1) {
    angle = angles[i];

    rdx = Math.cos(angle) * radius;
    rdy = Math.sin(angle) * radius;

    closestT1 = Infinity;

    closestX = rsx + rdx;
    closestX = rsy + rdy;

    for (j = 0; (occluder = occluderComponent.of(occluders[j])); j += 1) {
      occluderPosition = positionComponent.of(occluders[j]);
      occluderVertices = occluder.vertices;

      length = occluderVertices.length;

      for (k = 0; k < length; k += 2) {
        vsx = occluderPosition.x + occluderVertices[k];
        vsy = occluderPosition.y + occluderVertices[(k + 1) % length];

        vdx = occluderPosition.x + occluderVertices[(k + 2) % length] - vsx;
        vdy = occluderPosition.y + occluderVertices[(k + 3) % length] - vsy;

        t2 = (rdx * (vsy - rsy) + rdy * (rsx - vsx)) / (vdx * rdy - vdy * rdx);
        t1 = (vsx + vdx * t2 - rsx) / rdx;

        if (t1 < 0) continue;
        if (t2 < 0 || t2 > 1) continue;

        if (t1 > closestT1) continue;

        closestT1 = t1;

        closestX = vsx + vdx * t2;
        closestY = vsy + vdy * t2;
      }
    }

    dx = closestX - rsx;
    dy = closestY - rsy;

    sqrm = dx * dx + dy * dy;

    if (sqrm > sqrRadius) {
      closestX = rsx + rdx;
      closestY = rsy + rdy;
    }

    lightVertices.push({x: closestX, y: closestY, angle: angle});

    /*
    dest.strokeStyle = 'red';
    dest.beginPath();
    dest.moveTo(rsx, rsy);
    dest.lineTo(closestX, closestY);
    dest.closePath();
    dest.stroke();//*/
  }

  lightVertices.sort(dynamicShadowsSystem.intersectsComparator);

  length = lightVertices.length;

  if (length > 0) {
    dest = context.dests[1];

    dest.save();

    /*
    if (context.cameraPosition) {
      dest.translate(-context.cameraPosition.x, -context.cameraPosition.y);
    }//*/

    //dest.globalCompositeOperation = 'destination-out';

    //dest.fillStyle = 'rgba(255, 0, 0, 0.5)';

    dest.beginPath();

    dest.moveTo(lightVertices[0].x | 0, lightVertices[0].y | 0);

    for (i = 1; i < length; i += 1) {
      dest.lineTo(lightVertices[i].x | 0, lightVertices[i].y | 0);
    }

    dest.closePath();

    dest.clip();

    //dest.clearRect(rsx - radius, rsy - radius, rsx, rsy);

    //dest.fill();

    dest.globalCompositeOperation = 'destination-out';

    dest.drawImage(nuclear.component('sprite').of(e).buffer, rsx - radius, rsy - radius);

    dest.restore();
  }

  //dest.restore();
}

dynamicShadowsSystem.intersectsComparator = function dynamicShadowsSystemIntersectsComparator(a, b) {
  return b.angle - a.angle;
};
