'use strict';

var game, transform, rendering, animations, lighting, collisions, inputs;

game = require('game');

transform = require('./nuclear_modules/game.transform');
rendering = require('./nuclear_modules/game.rendering');
animations = require('./nuclear_modules/game.animations');
lighting = require('./nuclear_modules/game.lighting');
collisions = require('./nuclear_modules/game.collisions');
inputs = require('./nuclear_modules/game.inputs');

game.loader.load([
    'atlases/prinny.atlas.png',
    'atlases/prinny.atlas.json',
    'animations/prinny/prinny@dancing.json'
  ])
  .done(function () {
    var prinny, context, block;

    nuclear.import([transform, rendering, animations, lighting, collisions, inputs]);

    console.log('modules loaded!');

    context = nuclear.system.context();

    context.dests = [
      document.getElementById('screen').getContext('2d')
    ];

    context.lights = nuclear.system('lighting').query.entities;

    context.colliders = nuclear.query([
      'collider from game.collisions',
      'position from game.transform',
      'rigidbody from game.transform'
    ].join(' ')).entities;

    context.WIDTH = context.dests[0].canvas.width;
    context.HEIGHT = context.dests[0].canvas.height;

    prinny = nuclear.entity.create();

    nuclear.component('position').add(prinny, 250, 250);

    nuclear.component('sprite').add(prinny).fromAtlas('prinny', 0);
    nuclear.component('atlas').add(prinny, 'prinny');
    nuclear.component('animations').add(prinny, {
      target: 'prinny',
      animations: ['dancing'],
      defaultAnimation: 'dancing'
    });

    nuclear.component('light').add(prinny, {
      color: 'rgb(255, 0, 0)',
      radius: 50,
      intensity: 1
    });

    nuclear.component('velocity').add(prinny);

    nuclear.component('collider').add(prinny, {
      width: 74,
      height: 121
    });

    nuclear.component('rigidbody').add(prinny, {
      mass: 1,
      friction: 0.75
    });

    nuclear.component('inputs').add(prinny, {
      'UP': function (e, input) {
        nuclear.component('velocity').of(e).y -= 5 * input;
      },
      'DOWN': function (e, input) {
        nuclear.component('velocity').of(e).y += 5 * input;
      },
      'LEFT': function (e, input) {
        nuclear.component('velocity').of(e).x -= 5 * input;
      },
      'RIGHT': function (e, input) {
        nuclear.component('velocity').of(e).x += 5 * input;
      }
    });

    /*
    for (i = 0; i < 10; i += 1) {
      block = nuclear.entity.create();

      nuclear.component('position').add(block, Math.random() * context.WIDTH, Math.random() * context.HEIGHT);

      nuclear.component('collider').add(block, {
        width: Math.random() * 50 | 0 + 25,
        height: Math.random() * 50 | 0 + 25,
        offsetX: Math.random() * 5,
        offsetY: Math.random() * 5
      });

      nuclear.component('rigidbody').add(block, {
        mass: 100,
        friction: 0
      });
    }//*/

    block = nuclear.entity.create();

    nuclear.component('position').add(block, 250, 250);
    nuclear.component('collider').add(block, {
      width: 50, height: 50
    });
    nuclear.component('rigidbody').add(block, {mass: Infinity});

    nuclear.system.priority('kinematic', -2);
    nuclear.system.priority('collisions', -1);

    window.requestAnimationFrame(function loop() {
      window.requestAnimationFrame(loop);
      nuclear.system.run();
    });
  })
  .progress(console.log.bind(console, 'bundle progress'));
