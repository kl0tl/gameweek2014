'use strict';

var path, source, data;

path = require('path');

source = require(process.argv[2]);

data = {};

source.frames.forEach(function (frame, index) {
  var dirname;

  dirname = path.dirname(frame.filename);

  (data[dirname] || (data[dirname] = [])).push(index);
});

console.dir(data);
