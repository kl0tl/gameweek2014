'use strict';

var loader, transform, rendering, animations, collisions, inputs, roguemap, camera;

loader = require('./assets-loader');

transform = require('./nuclear_modules/game.transform');
rendering = require('./nuclear_modules/game.rendering');
animations = require('./nuclear_modules/game.animations');
collisions = require('./nuclear_modules/game.collisions');
inputs = require('./nuclear_modules/game.inputs');
roguemap = require('./nuclear_modules/game.roguemap');
camera = require('./nuclear_modules/game.camera');

loader.load([
    'atlases/prinny.atlas.png',
    'atlases/prinny.atlas.json',
    'animations/prinny/prinny@dancing.json',

    'atlases/stone.atlas.png',
    'atlases/stone.atlas.json'
  ])
  .error(function(error){
    throw error;
  })
  .done(function () {
    nuclear.import([transform, rendering, animations, collisions, inputs, roguemap, camera]);

    console.log('modules loaded!');

    require('./systems-context');

    require('./scenes/collisions-scene');
    require('./scenes/roguemap-scene');

    window.requestAnimationFrame(function loop() {
      window.requestAnimationFrame(loop);
      nuclear.system.run();
    });
  })
  .progress(console.log.bind(console, 'bundle progress'));
