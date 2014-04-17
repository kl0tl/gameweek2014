'use strict';

var PathComponent, StateComponent, GoToComponent, AttackComponent, LifeComponent, idles, reachings, fights;

PathComponent = require('./components/path-component');
StateComponent = require('./components/states-component');
GoToComponent = require('./components/goto-component');
AttackComponent = require('./components/attack-component');
LifeComponent = require('./components/life-component');

idles = require('./systems/idle-ia-system');
reachings = require('./systems/reaching-ia-system');
fights = require('./systems/fight-system');

module.exports = nuclear.module('game.ai', ['roguemap'])
  .component('path', function (e, map, x, y, topology) {
    return new PathComponent(e, map, x, y, topology);
  })
  .component('states', function (e, player, states, current) {
    return new StateComponent(e, player, states, current);
  })
  .component('goTo', function (e, target, speed) {
    return new GoToComponent(target, speed);
  })
  .component('attack', function (e, data) {
    return new AttackComponent(data);
  })
  .component('life', function (e, max, onDying, onLess) {
    return new LifeComponent(e, max, onDying, onLess);
  })
  .system('idle-run', [
    'states from game.ai'
  ], idles.run)
  .system('idle-enter', [
  ], idles.enter)
  .system('idle-exit', [
  ], idles.exit)
  .system('reaching-run', [
    'position from game.transform',
    'states from game.ai',
    'path from game.ai',
    'attack from game.ai'
  ], reachings.run, {msPerUpdate : 100})
  .system('reaching-enter', [
    'position from game.transform',
    'states from game.ai',
    'path from game.ai'
  ], reachings.enter)
  .system('reaching-exit', [
  ], reachings.exit)
  .system('fight-run', [
    'position from game.transform',
    'states from game.ai',
    'path from game.ai',
    'attack from game.ai'
  ], fights.run)
  .system('fight-enter', [
  ], fights.enter)
  .system('fight-exit', [
  ], fights.exit)
  .system('states', [
    'states from game.ai',
  ], require('./systems/state-manager-system'))
  .system('life', [
    'life from game.ai',
  ], require('./systems/life-system'))
  .system('goto', [
    'goTo from game.ai',
    'velocity from game.transform',
    'position from game.transform'
  ], require('./systems/goto-system'));
