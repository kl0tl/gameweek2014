'use strict';

nuclear.events.on('system:before:shadowing from game.lighting', function () {
  var lightComponent, context, i, e;

  lightComponent = nuclear.component('light');
  context = nuclear.system.context();

  for (i = 0; (e = context.lights[i]); i += 1) {
    lightComponent.of(e).shape.length = 0;
  }
});

module.exports = function shadowingSystem(e, components, context) {
  var lightComponent, positionComponent, dest, lights, position, shape, i, lightEntity, lightPosition, light, j, length;
  var t1, t2, rpx, rpy, rdx, rdy, spx, spy, sdx, sdy, im;

  lightComponent = nuclear.component('light');
  positionComponent = nuclear.component('position');

  dest = context.dests[0];

  dest.save();

  lights = context.lights;
  position = components.position;

  shape = components.occluder.shape;

  for (i = 0; (lightEntity = lights[i]); i += 1) {
    lightPosition = positionComponent.of(lightEntity);
    light = lightComponent.of(lightEntity);

    rpx = lightPosition.x;
    rpy = lightPosition.y;

    length = shape.length;

    for (j = 0; j < length; j += 2) {
      spx = shape[j];
      spy = shape[(j + 1) % length];

      rdx = spx - rpx;
      rdy = spy - rpy;

      sdx = shape[(j + 2) % length] - spx;
      sdy = shape[(j + 3) % length] - spy;

      t2 = (rdx * (spy - rpy) + rdy * (rpx - spx)) / (sdx * rdy - sdy * rdx);
      t1 = (spx + sdx * t2 - rpx) / rdx;

      if (t1 < 0) break;
      if (t2 < 0 || t2 > 1) break;

      im = Math.sqrt(sdx * sdx + sdy * sdy);

      light.shape.push(spx + sdx * im * t2, spy + sdy * t2);
    }

    length = light.shape.length;

    dest.strokeStyle = 'red';

    for (j = 0; j < length; j += 2) {
      dest.beginPath();
      dest.moveTo(rpx, rpy);
      dest.lineTo(light.shape[j], light.shape[j + 1]);
      dest.closePath();
      dest.stroke();
    }
  }

  dest.restore();

/*
  on after
    sort vertices of the shape of each light

*/};
