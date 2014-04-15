'use strict';

var loader, transform, rendering, animations, lighting, collisions, inputs;

loader = require('./assets-loader');

transform = require('./nuclear_modules/game.transform');
rendering = require('./nuclear_modules/game.rendering');
animations = require('./nuclear_modules/game.animations');
lighting = require('./nuclear_modules/game.lighting');
collisions = require('./nuclear_modules/game.collisions');
inputs = require('./nuclear_modules/game.inputs');

loader.load([
    'atlases/prinny.atlas.png',
    'atlases/prinny.atlas.json',
    'animations/prinny/prinny@dancing.json'
  ])
  .done(function () {
    nuclear.import([transform, rendering, animations, lighting, collisions, inputs]);

    console.log('modules loaded!');

    require('./systems-context');

    require('./scenes/collisions-scene');

    window.requestAnimationFrame(function loop() {
      window.requestAnimationFrame(loop);
      nuclear.system.run();
    });
  })
  .progress(console.log.bind(console, 'bundle progress'));
