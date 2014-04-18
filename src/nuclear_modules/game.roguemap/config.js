'use strict';

var TOP_BUFFER, DYNAMIC_BUFFER, BOTTOM_BUFFER;

TOP_BUFFER = 2;
DYNAMIC_BUFFER = 3;
BOTTOM_BUFFER = 4;

module.exports = {
  templates : {
    'one' : {
      name : 'one',
      slots : [
        {
          type : ['crate'],
          position : {
            x : 30,
            y : 20
          }
        },
        {
          type : ['crate'],
          position : {
            x : 40,
            y : 30
          }
        },
        {
          type : ['crate'],
          position : {
            x : 40,
            y : 10
          }
        }
      ],
      light : 'red',
      bundle : 'stone'
    }
  },
  ranges : {
    'one' : [0, 200],
  },
  slots : {
    crate : {
      components : [
        'collider',
        'velocity',
        'rigidbody',
        'occluder'
      ],
      data : {
        sprite : {
            width : 90,
            height : 90,
            scale : 3,
            dest : DYNAMIC_BUFFER,
            frame : [7,8,9],
            dynamic : true
        },
        atlas : 'props',
        rigidbody : [0, {
            mass : 1
        }],
        velocity : [0, 0, 0],
        collider : [0, {
            offsetY : 20,
            width : 90,
            height : 45
        }],
        occluder: [0, [
          -45, -22.5,
           45, -22.5,
           45,  22.5,
          -45,  22.5
        ]]
      }
    }
  },
  bundles : {
    'stone' : {
      'upperLeft' : [{
        index : 1,
        dest : BOTTOM_BUFFER,
        collider : {
            w : 120,
            h : 200,
            x : 60
        }
      }],
      'upperLeft_top' : [{
        index : 0,
        y : -90,
        dest : TOP_BUFFER
      }],
      'downLeft' : [{
        index : 3,
        dest : BOTTOM_BUFFER,
        collider : {
            w : 120,
            h : 200,
            x : 60
        }
      }],
      'downLeft_top' : [{
        index : 2,
        y : -90,
        dest : TOP_BUFFER
      }],
      'upperRight' : [{
        index : 5,
        dest : BOTTOM_BUFFER,
        collider : {
            w : 120,
            h : 120,
            x : 60,
            y : 60
        }
      }],
      'upperRight_top' : [{
        index : 4,
        y : -90,
        dest : TOP_BUFFER
      }],
      'downRight' : [{
        index : 7,
        dest : BOTTOM_BUFFER,
        collider : {
            w : 120,
            h : 120,
            x : 60,
            y : 60
        }
      }],
      'downRight_top' : [{
        index : 6,
        y : -90,
        dest : TOP_BUFFER
      }],
      'ground' : [{
        index : 8,
        dest : BOTTOM_BUFFER
      },{
        index : 9,
        dest : BOTTOM_BUFFER
      },{
        index : 10,
        dest : BOTTOM_BUFFER
      },{
        index : 33,
        dest : BOTTOM_BUFFER
      },{
        index : 29,
        dest : BOTTOM_BUFFER
      },{
        index : 30,
        dest : BOTTOM_BUFFER
      },{
        index : 31,
        dest : BOTTOM_BUFFER
      },{
        index : 32,
        dest : BOTTOM_BUFFER
      },{
        index : 33,
        dest : BOTTOM_BUFFER
      },{
        index : 34,
        dest : BOTTOM_BUFFER
      },{
        index : 35,
        dest : BOTTOM_BUFFER
      }],
      'left' : [{
        index : 11,
        dest : BOTTOM_BUFFER,
        collider : {
            w : 120,
            h : 230,
            x : 60
        }
      }],
      'right' : [{
        index : 12,
        dest : BOTTOM_BUFFER,
        collider : {
            w : 120,
            h : 230,
            x : 60
        }
      }],
      'up' : [{
        index : 14,
        dest : BOTTOM_BUFFER,
        collider : {
            w : 120,
            h : 150,
            x : 60,
            y : 20
        }
      },{
        index : 16,
        dest : BOTTOM_BUFFER,
        collider : {
            w : 120,
            h : 150,
            x : 60,
            y : 20
        }
      },{
        index : 18,
        dest : BOTTOM_BUFFER,
        collider : {
            w : 120,
            h : 150,
            x : 60,
            y : 20
        }
      }],
      'up_top' : [{
        index : 13,
        y : -95,
        dest : TOP_BUFFER
      },{
        index : 15,
        y : -95,
        dest : TOP_BUFFER
      },{
        index : 17,
        y : -95,
        dest : TOP_BUFFER
      }],
      'down' : [{
        index : 19,
        y : -90,
        dest : TOP_BUFFER,
        collider : {
            w : 120,
            h : 120,
            x : 60,
            y : 150
        }
      }],
      'upperExternalRight' : [{
        index : 22,
        aX : 0.3,
        dest : BOTTOM_BUFFER
      }],
      'upperExternalLeft' : [{
        index : 21,
        aX : -0.3,
        dest : BOTTOM_BUFFER
      }],
      'doubleSides' : [{
        index : 23,
        dest : BOTTOM_BUFFER,
        collider : {
            w : 120,
            h : 120,
            x : 60,
            y : 60
        }
      }],
      'downExternalLeft' : [{
        index : 26,
        y : - 15,
        dest : TOP_BUFFER,
        collider : {
            w : 120,
            h : 120,
            x : 60,
            y : 150
        }
      }],
      'downExternalRight' : [{
        index : 24,
        y : - 15,
        dest : TOP_BUFFER,
        collider : {
            w : 120,
            h : 120,
            x : 60,
            y : 150
        }
      }],
    }
  },
  resolution : 120,
  currentBundle : 'stone'
};
