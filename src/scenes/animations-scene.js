'use strict';

[
  'pentagram',
  'monster-death',
  'hit1',
  'hit2',
  'bat',
  'skeleton'
].forEach(function (fx) {
  nuclear.entity(fx).create({
    x: Math.random() * 500,
    y: Math.random() * 500
  });
});
