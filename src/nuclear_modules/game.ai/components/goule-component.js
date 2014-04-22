'use strict';

var loader;

loader = require('assets-loader');

function GouleComponent(e, intensity) {
  var source, filter, ctx;

  source = loader.get('textures/fx/goule-filter.png');

  filter = document.createElement('canvas');

  filter.width = source.width;
  filter.height = source.height;

  ctx = filter.getContext('2d');

  if (arguments.length === 2) ctx.globalAlpha = intensity;
  else ctx.globalAlpha = 0.5;

  ctx.drawImage(source, 0, 0);

  nuclear.component('sprite').of(e).filter = filter;
}

module.exports = GouleComponent;
