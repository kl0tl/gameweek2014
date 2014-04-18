'use strict';

module.exports = nuclear.module('game.hero', [
  'game.transform',
  'game.collisions',
  'game.rendering',
  'game.animations',
  'game.inputs'
])
  .component('name', function(entity, name){
    return name;
  })
  .entity('hero', require('./entities/hero-entity'));
