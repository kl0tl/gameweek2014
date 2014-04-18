'use strict';

var fs, path, dest;

fs = require('fs');
path = require('path');
dest = process.argv[2];

fs.readdir(dest, function (oO, files) {
  if (oO) throw oO;

  files.forEach(function (dir) {
    fs.stat(path.join(dest, dir), function (oO, stats) {
      if (oO) throw oO;

      if (stats.isDirectory()) {
        fs.readdir(path.join(dest, dir), function (oO, files) {
          if (oO) throw oO;

          files.forEach(function (file) {
            fs.rename(path.join(dest, dir, file), path.join(dest, dir, dir + file), function (oO) {
              if (oO) throw oO;
            });
          });
        });
      }
    });
  });
});
