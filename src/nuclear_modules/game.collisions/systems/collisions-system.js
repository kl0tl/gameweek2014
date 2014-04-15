'use strict';

module.exports = function collisionsSystem(e, components, context) {
  var position, velocity, collider, rigidbody, sqrVelocityMagnitude, colliderX, colliderY, others, length, i, other, otherPosition, otherCollider, otherRigidbody, otherX, otherY, dx, dy, overlapX, overlapY, tx, ty, inverseMassSum, inverseMass;

  position = components.position;
  velocity = components.velocity;
  collider = components.collider;
  rigidbody = components.rigidbody;

  sqrVelocityMagnitude = velocity.x * velocity.x + velocity.y * velocity.y;

  inverseMass = rigidbody.inverseMass;

  colliderX = position.x + collider.offsetX;
  colliderY = position.y + collider.offsetY;

  others = context.colliders;
  length = others.length;

  for (i = 0; i < length; i += 1) {
    other = others[i];

    if (other === e) continue;

    otherPosition = nuclear.component('position').of(other);
    otherCollider = nuclear.component('collider').of(other);
    otherRigidbody = nuclear.component('rigidbody').of(other);

    otherX = otherPosition.x + otherCollider.offsetX;
    otherY = otherPosition.y + otherCollider.offsetY;

    dx = otherX - colliderX;
    dy = otherY - colliderY;

    overlapX = Math.abs(dx) - (collider.halfWidth + otherCollider.halfWidth);
    overlapY = Math.abs(dy) - (collider.halfHeight + otherCollider.halfHeight);

    if (overlapX < -0.1 && overlapY < -0.1) {
      tx = Math.abs(velocity.x) / overlapX || 0;
      ty = Math.abs(velocity.y) / overlapY || 0;

      if(otherRigidbody){
        inverseMassSum = inverseMass + otherRigidbody.inverseMass;

        if (tx < ty || (sqrVelocityMagnitude < 0.1 && overlapX > overlapY)) {
          if (dx < 0) {
            position.x -= overlapX / (inverseMassSum / inverseMass || 0);
            otherPosition.x += overlapX / (inverseMassSum / otherRigidbody.inverseMass || 0);
          } else if (dx > 0) {
            position.x += overlapX / (inverseMassSum / inverseMass || 0);
            otherPosition.x -= overlapX / (inverseMassSum / otherRigidbody.inverseMass || 0);
          }
        }

        if (ty < tx || (sqrVelocityMagnitude < 0.1 && overlapY > overlapX)) {
          if (dy < 0) {
            position.y -= overlapY / (inverseMassSum / inverseMass || 0);
            otherPosition.y += overlapY  / (inverseMassSum / otherRigidbody.inverseMass || 0);
          } else if (dy > 0) {
            position.y += overlapY / (inverseMassSum / inverseMass || 0);
            otherPosition.y -= overlapY / (inverseMassSum / otherRigidbody.inverseMass || 0);
          }
        }

        colliderX = position.x + collider.offsetX;
        colliderY = position.y + collider.offsetY;
      }

      if (other in collider._currentCollisions) {
        collider.triggerCollisionStay(other);
      } else {
        collider.triggerCollisionEnter(other);
      }
    } else if (other in collider._currentCollisions) {
      if (sqrVelocityMagnitude > 1) collider.triggerCollisionExit(other);
      else collider.triggerCollisionStay(other);
    }
  }
};
