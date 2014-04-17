'use strict';

function Life(e, max, onDying, onLess){
    this.max = max;
    this.current = max;
    this.onDying = onDying;
    this.onLess = onLess;
    this.e = e;
}

Life.prototype.less = function lifeLess(number){
  this.current -= number;
  if(this.onLess){
    this.onLess(this.e);
  }
};

module.exports = Life;