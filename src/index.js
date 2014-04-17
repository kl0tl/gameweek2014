'use strict';

var loader, transform, rendering, animations, collisions, inputs, roguemap, camera, hero, ai, lighting;

loader = require('./assets-loader');

transform = require('./nuclear_modules/game.transform');
rendering = require('./nuclear_modules/game.rendering');
animations = require('./nuclear_modules/game.animations');
collisions = require('./nuclear_modules/game.collisions');
inputs = require('./nuclear_modules/game.inputs');
roguemap = require('./nuclear_modules/game.roguemap');
camera = require('./nuclear_modules/game.camera');
hero = require('./nuclear_modules/game.hero');
ai = require('./nuclear_modules/game.ai');
lighting = require('./nuclear_modules/game.lighting');

loader.load([
    'atlases/prinny.atlas.png',
    'atlases/prinny.atlas.json',
    'animations/prinny/prinny@dancing.json',

    'atlases/hero.atlas.png',
    'atlases/hero.atlas.json',
    'animations/hero/hero@idleback.json',
    'animations/hero/hero@idleface.json',
    'animations/hero/hero@idleleft.json',
    'animations/hero/hero@idleright.json',
    'animations/hero/hero@walkback.json',
    'animations/hero/hero@walkface.json',
    'animations/hero/hero@walkleft.json',
    'animations/hero/hero@walkright.json',

    'atlases/stone.atlas.png',
    'atlases/stone.atlas.json',

    'atlases/props.atlas.png',
    'atlases/props.atlas.json'
  ])
  .error(function (oO) { throw oO; })
  .done(function () {
    console.log('assets loaded', this.assets);

    nuclear.import([
      transform,
      rendering,
      animations,
      collisions,
      inputs,
      roguemap,
      camera,
      hero,
      lighting,
      ai
    ]);

    console.log('modules loaded!');

    require('./systems-context');

    //require('./scenes/collisions-scene');
    //require('./scenes/hero-scene');
    require('./scenes/roguemap-scene');
    require('./scenes/lighting-scene');

    window.requestAnimationFrame(function loop() {
      window.requestAnimationFrame(loop);
      nuclear.system.run();
    });
  })
  .progress(console.log.bind(console, 'bundle progress'));
