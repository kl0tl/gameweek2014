'use strict';

module.exports = function pentagramEntity(pentagram, options) {
  console.log('new pentagram entity', pentagram);

  nuclear.component('position').add(pentagram, options.x, options.y);

  nuclear.component('atlas').add(pentagram, 'fx');

  nuclear.component('sprite').add(pentagram, {
    scale: 4,
    width: 60 * 4,
    height: 60 * 4,
    dest: 4,
    animable: true
  });

  nuclear.component('animations').add(pentagram, 'pentagram', ['pentagram']);
};
