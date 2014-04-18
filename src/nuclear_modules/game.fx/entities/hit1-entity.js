'use strict';

module.exports = function hit1Entity(hit1, options) {
  var animations;

  console.log('new hit1 entity', hit1);

  nuclear.component('position').add(hit1, options.x, options.y);

  nuclear.component('atlas').add(hit1, 'fx');

  nuclear.component('sprite').add(hit1, {
    scale: 4,
    width: 30 * 4,
    height: 30 * 4,
    dest: 3,
    animable: true
  });

  animations = nuclear.component('animations').add(hit1, 'hit1', ['hit1']);

  setTimeout(function () {
    nuclear.entity.remove(hit1);
  }, animations.animations.hit1.frames.length * animations.animations.hit1.interval);
};
