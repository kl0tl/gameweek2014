'use strict';
var maths = require('../lib/maths');

function GoTo(target, speed){
    if(!Array.isArray(target)) target = [target];

    this.target = target;
    this.speed = speed;
    this.currentIndex = 0;
}

GoTo.prototype.computeNext = function(position){
    if(this.target.length === 0){
        return false;
    }
    var target = this.target[0];
    var direction = maths.vectors.sub(target, position);
    return maths.vectors.mult(maths.vectors.normalize(direction), this.speed);
};

GoTo.prototype.testReach = function(position){
    var target, dx, dy;

    target = this.target[0];

    dx = position.x - target.x;
    dy = position.y - target.y;

    return (dx * dx + dy * dy) < (this.speed*10) * (this.speed*10);
};

module.exports = GoTo;