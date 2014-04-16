'use strict';

var PathComponent, StateComponent, idles, reachings;

PathComponent = require('./components/path-component');
StateComponent = require('./components/states-component');

idles = require('./systems/idle-ia-system');
reachings = require('./systems/reaching-ia-system');

module.exports = nuclear.module('game.ai', ['roguemap'])
  .component('path', function (e, map, x, y, topology) {
    return new PathComponent(e, map, x, y, topology);
  })
  .component('states', function (e, player, states, current) {
    return new StateComponent(e, player, states, current);
  })
  .system('idle-run', [
    'states from game.ai'
  ], idles.run)
  .system('idle-enter', [
  ], idles.enter)
  .system('idle-exit', [
  ], idles.exit)
  .system('reaching-run', [
  ], reachings.run)
  .system('reaching-enter', [
    'position from game.transform',
    'states from game.ai',
    'path from game.ai'
  ], reachings.enter)
  .system('reaching-exit', [
  ], reachings.exit)
  .system('states', [
    'states from game.ai',
  ], require('./systems/state-manager-system'), {
    disable : ['idle-run','idle-enter','idle-exit','reaching-run','reaching-enter','reaching-exit']
  });
