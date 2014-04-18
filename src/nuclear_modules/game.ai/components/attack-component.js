'use strict';
var maths = require('../lib/maths');

function Attack(data){
    this.w = data.w;
    this.h = data.h;
    this.mask = data.mask;
    this.damages = data.damages || 1;
    this.cooldown = data.cooldown || 0;
    this.count = 0;
    this.offset = data.offset || 1;
    this.impulse = data.impulse || 0.001;
    this._attack = nuclear.entity.create();
    var collider = nuclear.component('collider').add(this._attack, {
      width : this.w,
      height : this.h,
      mask : this.mask
    });

    if(data.onEnter) collider.onCollisionStay(data.onEnter);
    if(data.onExit) collider.onCollisionExit(data.onExit);

    nuclear.component('position').add(this._attack, {
      x : 0,
      y : 0
    });
    nuclear.component('velocity').add(this._attack);
    nuclear.component('rigidbody').add(this._attack, {
      mass : this.impulse
    });

    nuclear.component('collider').disable(this._attack);
    nuclear.component('velocity').disable(this._attack);
}

Attack.prototype.to = function(position, target){
  if(this.count <= 0){
    var direction = maths.vectors.sub(target, position);
    direction = maths.vectors.normalize(direction);

    var attackPos = maths.vectors.mult(direction, this.offset);
    var posComp = nuclear.component('position').of(this._attack);

    posComp.x = position.x + attackPos.x;
    posComp.y = position.y + attackPos.y;

    nuclear.component('collider').enable(this._attack);
    nuclear.component('velocity').enable(this._attack);

    nuclear.system('collisions').once(this._attack);
    nuclear.system('debug-colliders').once(this._attack);

    nuclear.component('collider').disable(this._attack);
    nuclear.component('velocity').disable(this._attack);

    this.count = this.cooldown;
  }
};

Attack.prototype.change = function(stats){
    this.impulse = stats.impulse;
    this.damages = stats.damages;
    this.cooldown = stats.cooldown;
    this.offset = stats.offset;
    this.w = stats.w;
    this.h = stats.h;
    nuclear.component('collider').of(this._attack).width = this.w;
    nuclear.component('collider').of(this._attack).height = this.h;
};

module.exports = Attack;