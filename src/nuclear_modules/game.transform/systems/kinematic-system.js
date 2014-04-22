'use strict';

module.exports = function kinematicSystem(e, components, context, dt) {
  var friction;

  friction = components.rigidbody.friction;

  components.position.x += components.velocity.x * dt;
  components.position.y += components.velocity.y * dt;

  components.velocity.x *= friction;
  components.velocity.y *= friction;
};
