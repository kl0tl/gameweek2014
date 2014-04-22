'use strict';

module.exports = function lighting(){
    var context;

    context = nuclear.system.context();

    nuclear.system.priority('dynamic-shadows', -1);

    context.mainLight = nuclear.entity('light').create({
      x: 250,
      y: 250,
      radius: 500,
      color: [222, 218, 152],
      intensity: 1,
      constraint: context.hero,
      damping: 0.6,
      offsetX: -1,
      offsetY: -1,
      dynamic: true
    });

    nuclear.entity('light').create({
      x: 250,
      y: 250,
      radius: 500,
      color: [222, 218, 152],
      intensity: 1,
      constraint: context.hero,
      damping: 0.65,
      offsetX: 1,
      offsetY: -1,
      dynamic: true
    });

    nuclear.entity('light').create({
      x: 250,
      y: 250,
      radius: 500,
      color: [222, 218, 152],
      intensity: 1,
      constraint: context.hero,
      damping: 0.7,
      offsetX: 1,
      offsetY: 1,
      dynamic: true
    });

    nuclear.entity('light').create({
      x: 250,
      y: 250,
      radius: 500,
      color: [222, 218, 152],
      intensity: 1,
      constraint: context.hero,
      damping: 0.75,
      offsetX: -1,
      offsetY: 1,
      dynamic: true
    });
};
