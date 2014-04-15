'use strict';

function ColliderComponent(e, options) {
  this.entity = e;

  this.offsetX = options.offsetX || 0;
  this.offsetY = options.offsetY || 0;

  this.halfWidth = options.width * 0.5;
  this.halfHeight = options.height * 0.5;

  this._currentCollisions = Object.create(null);

  this._onCollisionEnterListeners = [];
  this._onCollisionExitListeners = [];
  this._onCollisionStayListeners = [];
}

ColliderComponent.prototype.onCollisionEnter = function (callback) {
  this._onCollisionEnterListeners.push(callback);
  return this;
};

ColliderComponent.prototype.onCollisionStay = function (callback) {
  this._onCollisionStayListeners.push(callback);
  return this;
};

ColliderComponent.prototype.onCollisionExit = function (callback) {
  this._onCollisionExitListeners.push(callback);
  return this;
};

ColliderComponent.prototype.triggerCollisionEnter = function colliderComponentTriggerCollisionEnter(other, collider) {
  if (other in this._currentCollisions) {
    this.triggerCollisionStay(other);
  } else {
    this._currentCollisions[other] = collider;
    this._triggerCollisionListeners(this._onCollisionEnterListeners, other);
  }
};

ColliderComponent.prototype.triggerCollisionStay = function colliderComponentTriggerCollisionStay(other) {
  this._triggerCollisionListeners(this._onCollisionStayListeners, other);
};

ColliderComponent.prototype.triggerCollisionExit = function colliderComponentTriggerCollisionExit(other) {
  delete this._currentCollisions[other];
  this._triggerCollisionListeners(this._onCollisionExitListeners, other);
};

ColliderComponent.prototype._triggerCollisionListeners = function _colliderComponentTriggerCollisionListeners(listeners, other) {
  var i, listener;

  for (i = 0; (listener = listeners[i]); i += 1) {
    listener(other, this.entity);
  }
};

ColliderComponent.prototype.width = function colliderComponentWidth(value) {
  if (arguments.length === 0) {
    return this.halfWidth * 2;
  }

  this.halfWidth = value * 0.5;

  return this;
};

ColliderComponent.prototype.height = function colliderComponentHeight(value) {
  if (arguments.length === 0) {
    return this.halfHeight;
  }

  this.halfHeight = value * 0.5;

  return this;
};

module.exports = ColliderComponent;
