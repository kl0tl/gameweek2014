'use strict';

function RigidbodyComponent(options) {
  this._mass = options.mass || 1;

  this.inverseMass = 1 / this._mass;
  this.friction = options.friction || 0;
}

RigidbodyComponent.prototype.mass = function rigidbodyComponentMass(value) {
  if (arguments.length === 0) {
    return this._mass;
  }

  this._mass = value;
  this.inverseMass = 1 / value;

  return this;
};

module.exports = RigidbodyComponent;
