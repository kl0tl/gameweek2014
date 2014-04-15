'use strict';

var hero;

hero = nuclear.entity.create();

nuclear.component('position').add(hero, 250, 250);

nuclear.component('atlas').add(hero, 'hero');

nuclear.component('sprite').add(hero, {
  scale: 4,
  width: 64,
  height: 120
});

nuclear.component('animations').add(hero, 'walkleft', [
  'idleback',
  'idleface',
  'idleleft',
  'idleright',
  'walkback',
  'walkface',
  'walkleft',
  'walkright'
]);
