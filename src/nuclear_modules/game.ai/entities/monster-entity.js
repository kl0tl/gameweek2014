'use strict';

module.exports = function monsterEntity(monster, options) {
  var animations, context;

  context = nuclear.system.context();

  if(!nuclear.component('position').of(monster)){
    nuclear.component('position').add(monster, options.x, options.y);
  }

  nuclear.component('atlas').add(monster, 'hero');

  nuclear.component('sprite').add(monster, {
    scale: 4,
    width: 64,
    height: 120,
    dest : 3,
    dynamic : true
  });

  console.log('new monster entity', monster);

  animations = nuclear.component('animations').add(monster, 'idleface', [
    'idleback',
    'idleface',
    'idleleft',
    'idleright',
    'walkback',
    'walkface',
    'walkleft',
    'walkright'
  ]);

  nuclear.component('collider').add(monster, {
    width: 64,
    height: 60,
    offsetY : 20
  });
};
