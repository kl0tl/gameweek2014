'use strict';

module.exports = function lightEntity(e, options) {
  var position, light, sprite, gradient;

  position = nuclear.component('position').add(e, options.x, options.y);

  if (options.constraint) {
    nuclear.component('position-constraint').add(e, options);
  }

  light = nuclear.component('light').add(e, options);
  sprite = nuclear.component('sprite').add(e, {
    width: options.radius * 2,
    height: options.radius * 2,
    dest: 1,
    blending: 'destination-out'
  });

  gradient = sprite.context.createRadialGradient(
    options.radius,
    options.radius,
    0,//options.radius * 0.05,
    options.radius,
    options.radius,
    options.radius
  );

  /*
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(0.05, 'rgba(' + options.color.join(', ') + ', 0.5)');
  gradient.addColorStop(0.1, 'rgba(' + options.color.join(', ') + ', 0.33)');
  gradient.addColorStop(0.25, 'rgba(' + options.color.join(', ') + ', 0.2)');
  gradient.addColorStop(0.5, 'rgba(' + options.color.join(', ') + ', 0.1)');
  gradient.addColorStop(0.75, 'rgba(' + options.color.join(', ') + ', 0.05)');
  gradient.addColorStop(0.9, 'rgba(' + options.color.join(', ') + ', 0)');*/

  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
  //gradient.addColorStop(0.05, 'rgba(' + options.color.join(', ') + ', 0.5)');
  //gradient.addColorStop(0.1, 'rgba(' + options.color.join(', ') + ', 0.33)');
  //gradient.addColorStop(0.25, 'rgba(' + options.color.join(', ') + ', 0.2)');
  gradient.addColorStop(0.5, 'rgba(' + options.color.join(', ') + ', 0.1)');
  gradient.addColorStop(0.75, 'rgba(' + options.color.join(', ') + ', 0.05)');
  gradient.addColorStop(0.9, 'rgba(' + options.color.join(', ') + ', 0)');

  sprite.context.fillStyle = gradient;

  sprite.context.beginPath();
  sprite.context.arc(options.radius, options.radius, options.radius, 0, Math.PI * 2);
  sprite.context.closePath();

  sprite.context.fill();
};
