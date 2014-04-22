'use strict';

module.exports = function hit2Entity(hit2, options) {
  var animations;

  console.log('new hit2 entity', hit2);

  nuclear.component('position').add(hit2, options.x, options.y);

  nuclear.component('atlas').add(hit2, 'fx');

  nuclear.component('sprite').add(hit2, {
    scale: 4,
    width: 30 * 4,
    height: 30 * 4,
    dest: 4,
    index : 10000,
    animable: true
  });

  animations = nuclear.component('animations').add(hit2, 'hit2', ['hit2']);

  setTimeout(function () {
    nuclear.entity.remove(hit2);
  }, animations.animations.hit2.frames.length * animations.animations.hit2.interval);
};
