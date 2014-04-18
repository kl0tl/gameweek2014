'use strict';

module.exports = function skeletonEntity(skeleton, options) {
  console.log('new skeleton entity', skeleton);

  nuclear.component('position').add(skeleton, options.x, options.y);

  nuclear.component('atlas').add(skeleton, 'skeleton');

  nuclear.component('sprite').add(skeleton, {
    scale: 4,
    width: 120 * 4,
    height: 120 * 4,
    dest: 3,
    dynamic: true,
    animable: true
  });

  nuclear.component('animations').add(skeleton, 'left', ['left', 'right', 'attack']);
};
