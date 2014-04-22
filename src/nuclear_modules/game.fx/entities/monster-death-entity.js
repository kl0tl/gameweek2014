'use strict';

module.exports = function monsterDeathEntity(death, options) {
  var animations;

  console.log('new monster death entity', death);

  nuclear.component('position').add(death, options.x, options.y);

  nuclear.component('atlas').add(death, 'fx');

  nuclear.component('sprite').add(death, {
    scale: 4,
    width: 79 * 4,
    height: 92 * 4,
    dest: 5,
    index : 10000,
    animable: true
  });

  animations = nuclear.component('animations').add(death, 'monster-death', ['monster-death']);

  setTimeout(function () {
    nuclear.entity.remove(death);
  }, animations.animations['monster-death'].frames.length * animations.animations['monster-death'].interval);
};
