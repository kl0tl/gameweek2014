'use strict';

module.exports = function bowEntity(bow, options) {
  nuclear.component('position').add(bow);

  nuclear.component('position-constraint').add(bow, {
    constraint: options.owner
  });

  nuclear.component('atlas').add(bow, 'hero');

  nuclear.component('sprite').add(bow, {
    scale: 4,
    width: 0,
    height: 0,
    dest: 3,
    dynamic: true,
    animable: true/*,
    index: nuclear.component('sprite').of(options.owner).index + 1*/
  });

  console.log('new bow entity', bow);

  nuclear.component('animations').add(bow, 'idlefacebow', [
    'idlebackbow',
    'idlefacebow',
    'idleleftbow',
    'idlerightbow',

    'walkbackbow',
    'walkfacebow',
    'walkleftbow',
    'walkrightbow',

    'attackbowback',
    'attackbowface',
    'attackbowleft',
    'attackbowright'
  ]);

  nuclear.component('sprite');
};
