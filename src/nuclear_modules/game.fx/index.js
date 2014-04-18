'use strict';

module.exports = nuclear.module('game.fx', [
  'game.transform',
  'game.rendering',
  'game.animations'
])
  .entity('hit1', require('./entities/hit1-entity'))
  .entity('hit2', require('./entities/hit2-entity'))
  .entity('monster-death', require('./entities/monster-death-entity'))
  .entity('pentagram', require('./entities/pentagram-entity'));
