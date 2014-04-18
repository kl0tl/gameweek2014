'use strict';

module.exports = nuclear.module('game.hero', [
  'game.transform',
  'game.collisions',
  'game.rendering',
  'game.animations',
  'game.inputs'
])
  .entity('hero', require('./entities/hero-entity'))
  .entity('axe', require('./entities/axe-entity'))
  .entity('bow', require('./entities/bow-entity'))
  .entity('cloth', require('./entities/cloth-entity'))
  .entity('lantern', require('./entities/lantern-entity'))
  .entity('sword', require('./entities/sword-entity'));
