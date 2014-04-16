'use strict';

nuclear.entity('hero').create({x: 250, y: 250});

nuclear.system.priority('kinematic', -2);
nuclear.system.priority('collisions', -1);
