'use strict';

var PositionComponent;

PositionComponent = require('./components/position-component');

module.exports = nuclear.module('game.transform', [])
  .component('position', function (e, x, y) {
    return new PositionComponent(x, y);
  });
