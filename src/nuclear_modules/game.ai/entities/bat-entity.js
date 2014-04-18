'use strict';

module.exports = function batEntity(bat, options) {
  console.log('new bat entity', bat);

  nuclear.component('position').add(bat, options.x, options.y);

  nuclear.component('atlas').add(bat, 'bat');

  nuclear.component('sprite').add(bat, {
    scale: 4,
    width: 82 * 4,
    height: 58 * 4,
    dest: 3,
    dynamic: true,
    animable: true
  });

  nuclear.component('animations').add(bat, 'left', ['left', 'right']);
};
