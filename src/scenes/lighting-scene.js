'use strict';

var lights1Sprite, lights2Sprite;

lights1Sprite = nuclear.component('sprite').of(3);
lights2Sprite = nuclear.component('sprite').of(1);

lights1Sprite.blending = 'destination-out';
lights1Sprite.dest = 2;

lights2Sprite.blending = 'lighten';
lights2Sprite.dest = 0;


nuclear.entity('light').create({
  x: 250,
  y: 250,
  radius: 350,
  color: [222, 218, 152],
  intensity: 1,//*
  constraint: 7,
  damping: 0.65//*/
});
