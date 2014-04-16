  'use strict';

module.exports = function lightingSystem(e, components) {
  components.sprite.alpha = components.light.intensity;
};
