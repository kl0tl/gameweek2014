'use strict';

function ColliderComponent(options) {
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

ColliderComponent.prototype.triggerCollisionEnter = function colliderComponentTriggerCollisionEnter(e, collider) {
  if (e in this._currentCollisions) {
    this.triggerCollisionStay();
  } else {
    this._currentCollisions[e] = collider;
    this._triggerCollisionListeners(this._onCollisionEnterListeners, e);
  }
};

ColliderComponent.prototype.triggerCollisionStay = function colliderComponentTriggerCollisionStay() {
  this._triggerCollisionListeners(this._onCollisionStayListeners);
};

ColliderComponent.prototype.triggerCollisionExit = function colliderComponentTriggerCollisionExit(e) {
  delete this._currentCollisions[e];
  this._triggerCollisionListeners(this._onCollisionExitListeners, e);
};

ColliderComponent.prototype._triggerCollisionListeners = function _colliderComponentTriggerCollisionListeners(listeners, collider) {
  var i, listener;
  
  for (i = 0; (listener = listeners[i]); i += 1) {
    listener(collider);
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
