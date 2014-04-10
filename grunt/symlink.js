'use strict';

module.exports = {
  options: {
    overwrite: true
  },
  hooks: {
    src: '.pre-commit',
    dest: '.git/hooks/pre-commit'
  },
};
