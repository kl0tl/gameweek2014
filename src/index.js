'use strict';

var loader, transform, rendering, animations, collisions, inputs, roguemap, camera, hero, ai, lighting, fx;

loader = require('./assets-loader');

var contextDefining = require('./systems-context');
var playScenes = require('./scenes/scene-loader');

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
fx = require('./nuclear_modules/game.fx');

loader.load([
    'atlases/prinny.atlas.png',
    'atlases/prinny.atlas.json',
    'animations/prinny/prinny@dancing.json',

//* HERO ATLAS
    'atlases/hero.atlas.png',
    'atlases/hero.atlas.json',
// end */

/* HERO DEATH ANIMATIONS
    'animations/hero/hero@death.json',
    'animations/hero/hero@deathcloth.json',
// end */

//* HERO IDLE ANIMATIONS
    'animations/hero/hero@idleback.json',
    'animations/hero/hero@idleface.json',
    'animations/hero/hero@idleleft.json',
    'animations/hero/hero@idleright.json',
//   Axe
      'animations/hero/hero@idlebackaxe.json',
      'animations/hero/hero@idlefaceaxe.json',
      'animations/hero/hero@idleleftaxe.json',
      'animations/hero/hero@idlerightaxe.json',
//   Bow
      'animations/hero/hero@idlebackbow.json',
      'animations/hero/hero@idlefacebow.json',
      'animations/hero/hero@idleleftbow.json',
      'animations/hero/hero@idlerightbow.json',
//   Cloth
      'animations/hero/hero@idlebackcloth.json',
      'animations/hero/hero@idlefacecloth.json',
      'animations/hero/hero@idleleftcloth.json',
      'animations/hero/hero@idlerightcloth.json',
//   Lantern
      'animations/hero/hero@idlebacklantern.json',
      'animations/hero/hero@idlefacelantern.json',
      'animations/hero/hero@idleleftlantern.json',
      'animations/hero/hero@idlerightlantern.json',
//   Sword
      'animations/hero/hero@idlebacksword.json',
      'animations/hero/hero@idlefacesword.json',
      'animations/hero/hero@idleleftsword.json',
      'animations/hero/hero@idlerightsword.json',
// end */

//* HERO WALK ANIMATIONS
    'animations/hero/hero@walkback.json',
    'animations/hero/hero@walkface.json',
    'animations/hero/hero@walkleft.json',
    'animations/hero/hero@walkright.json',
//   Axe
      'animations/hero/hero@walkbackaxe.json',
      'animations/hero/hero@walkfaceaxe.json',
      'animations/hero/hero@walkleftaxe.json',
      'animations/hero/hero@walkrightaxe.json',
//   Bow
      'animations/hero/hero@walkbackbow.json',
      'animations/hero/hero@walkfacebow.json',
      'animations/hero/hero@walkleftbow.json',
      'animations/hero/hero@walkrightbow.json',
//   Cloth
      'animations/hero/hero@walkbackcloth.json',
      'animations/hero/hero@walkfacecloth.json',
      'animations/hero/hero@walkleftcloth.json',
      'animations/hero/hero@walkrightcloth.json',
//   Lantern
      'animations/hero/hero@walkbacklantern.json',
      'animations/hero/hero@walkfacelantern.json',
      'animations/hero/hero@walkleftlantern.json',
      'animations/hero/hero@walkrightlantern.json',
//   Sword
      'animations/hero/hero@walkbacksword.json',
      'animations/hero/hero@walkfacesword.json',
      'animations/hero/hero@walkleftsword.json',
      'animations/hero/hero@walkrightsword.json',
// end */

// HERO ATTACK ANIMATIONS
//   Axe
      'animations/hero/hero@attackaxeback.json',
      'animations/hero/hero@attackaxeface.json',
      'animations/hero/hero@attackaxeleft.json',
      'animations/hero/hero@attackaxeright.json',
//     Axe AND Cloth
        'animations/hero/hero@attackaxebackcloth.json',
        'animations/hero/hero@attackaxefacecloth.json',
        'animations/hero/hero@attackaxeleftcloth.json',
        'animations/hero/hero@attackaxerightcloth.json',
//   Bow
      'animations/hero/hero@attackbowback.json',
      'animations/hero/hero@attackbowface.json',
      'animations/hero/hero@attackbowleft.json',
      'animations/hero/hero@attackbowright.json',
//     Bow AND Cloth
        'animations/hero/hero@attackbowbackcloth.json',
        'animations/hero/hero@attackbowfacecloth.json',
        'animations/hero/hero@attackbowleftcloth.json',
        'animations/hero/hero@attackbowrightcloth.json',
//   Sword
      'animations/hero/hero@attackswordback.json',
      'animations/hero/hero@attackswordface.json',
      'animations/hero/hero@attackswordleft.json',
      'animations/hero/hero@attackswordright.json',
//     Sword AND Cloth
        'animations/hero/hero@attackswordbackcloth.json',
        'animations/hero/hero@attackswordfacecloth.json',
        'animations/hero/hero@attackswordleftcloth.json',
        'animations/hero/hero@attackswordrightcloth.json',
// end */

    'atlases/bat.atlas.png',
    'atlases/bat.atlas.json',
    'animations/bat/bat@left.json',
    'animations/bat/bat@right.json',

    'atlases/skeleton.atlas.png',
    'atlases/skeleton.atlas.json',
    'animations/skeleton/skeleton@left.json',
    'animations/skeleton/skeleton@attack.json',
    'animations/skeleton/skeleton@right.json',

    'atlases/stone.atlas.png',
    'atlases/stone.atlas.json',

    'atlases/props.atlas.png',
    'atlases/props.atlas.json',

    'atlases/head.atlas.png',
    'atlases/head.atlas.json',
    'gui/gothface1.png',
    'gui/gothface2.png',
    'gui/gothface3.png',

    'atlases/fx.atlas.png',
    'atlases/fx.atlas.json',
    'animations/fx/fx@pentagram.json',
    'animations/fx/fx@monster-death.json',
    'animations/fx/fx@hit1.json',
    'animations/fx/fx@hit2.json',

    'textures/fx/goule-filter.png'
  ])
  .error(function (oO) {
    throw oO;
  })
  .done(function () {
    console.log('assets loaded', this.assets);

    document.getElementById('button-play').addEventListener('click', function(){
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
          ai,
          fx
        ]);

        console.log('modules loaded!');

        contextDefining();
        playScenes();

        window.requestAnimationFrame(function loop() {
          window.requestAnimationFrame(loop);
          nuclear.system.run();
        });

        document.getElementById('menu').style.display = 'none';
    });
  })
  .progress(console.log.bind(console, 'bundle progress'));
