'use strict';

module.exports = nuclear.module('game.hero', [
  'game.transform',
  'game.collisions',
  'game.rendering',
  'game.animations',
  'game.inputs'
])
  .entity('hero', require('./entities/hero-entity'));
