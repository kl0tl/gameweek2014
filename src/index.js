'use strict';

var game, transform, rendering, animations;

game = require('game');

transform = require('./nuclear_modules/game.transform');
rendering = require('./nuclear_modules/game.rendering');
animations = require('./nuclear_modules/game.animations');

game.loader.load([
    'atlases/prinny.atlas.png',
    'atlases/prinny.atlas.json',
    'animations/prinny/prinny@dancing.json'
  ])
  .done(function () {
    var prinny, context;

    nuclear.import([transform, rendering, animations]);

    console.log('modules loaded!');

    prinny = nuclear.entity.create();

    nuclear.component('position').add(prinny, 250, 250);
    nuclear.component('sprite').add(prinny, 50, 50);
    nuclear.component('atlas').add(prinny, 'prinny');
    nuclear.component('animations').add(prinny, {
      target: 'prinny',
      animations: ['dancing'],
      defaultAnimation: 'dancing'
    });

    context = nuclear.system.context();

    context.dests = [
      document.getElementById('screen').getContext('2d')
    ];

    context.WIDTH = context.dests[0].canvas.width;
    context.HEIGHT = context.dests[0].canvas.height;

    window.requestAnimationFrame(function loop() {
      window.requestAnimationFrame(loop);
      nuclear.system.run();
    });
  })
  .progress(console.log.bind(console, 'bundle progress'));
