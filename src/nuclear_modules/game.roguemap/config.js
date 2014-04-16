'use strict';

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
      ],
      data : {
        sprite : {
            width : 90,
            height : 90,
            scale : 3,
            dest : 2,
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
        }]
      }
    }
  },
  bundles : {
    'stone' : {
      'upperLeft' : [{
        index : 1,
        dest : 3,
        collider : {
            w : 120,
            h : 200,
            x : 60
        }
      }],
      'upperLeft_top' : [{
        index : 0,
        y : -90,
        dest : 1
      }],
      'downLeft' : [{
        index : 3,
        dest : 3,
        collider : {
            w : 120,
            h : 200,
            x : 60
        }
      }],
      'downLeft_top' : [{
        index : 2,
        y : -90,
        dest : 1
      }],
      'upperRight' : [{
        index : 5,
        dest : 3,
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
        dest : 1
      }],
      'downRight' : [{
        index : 7,
        dest : 3,
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
        dest : 1
      }],
      'ground' : [{
        index : 8,
        dest : 3
      },{
        index : 9,
        dest : 3
      },{
        index : 10,
        dest : 3
      },{
        index : 33,
        dest : 3
      },{
        index : 29,
        dest : 3
      },{
        index : 30,
        dest : 3
      },{
        index : 31,
        dest : 3
      },{
        index : 32,
        dest : 3
      },{
        index : 33,
        dest : 3
      },{
        index : 34,
        dest : 3
      },{
        index : 35,
        dest : 3
      }],
      'left' : [{
        index : 11,
        dest : 3,
        collider : {
            w : 120,
            h : 230,
            x : 60
        }
      }],
      'right' : [{
        index : 12,
        dest : 3,
        collider : {
            w : 120,
            h : 230,
            x : 60
        }
      }],
      'up' : [{
        index : 14,
        dest : 3,
        collider : {
            w : 120,
            h : 150,
            x : 60,
            y : 20
        }
      },{
        index : 16,
        dest : 3,
        collider : {
            w : 120,
            h : 150,
            x : 60,
            y : 20
        }
      },{
        index : 18,
        dest : 3,
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
        dest : 1
      },{
        index : 15,
        y : -95,
        dest : 1
      },{
        index : 17,
        y : -95,
        dest : 1
      }],
      'down' : [{
        index : 19,
        y : -90,
        dest : 1,
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
        dest : 3
      }],
      'upperExternalLeft' : [{
        index : 21,
        aX : -0.3,
        dest : 3
      }],
      'doubleSides' : [{
        index : 23,
        dest : 3,
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
        dest : 1,
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
        dest : 1,
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