'use strict';

var TOP_BUFFER, DYNAMIC_BUFFER, BOTTOM_BUFFER;

TOP_BUFFER = 4;
DYNAMIC_BUFFER = 5;
BOTTOM_BUFFER = 6;

module.exports = {
  templates : {
    'little' : {
      name : 'little',
      slots : [
        {
          type : ['crate'],
          position : {
            x : 50,
            y : 50
          }
        },
        {
          type : ['light'],
          position : {
            x : 0,
            y : 0
          }
        },
        {
          type : ['bat'],
          position : {
            x : 20,
            y : 20
          }
        },
      ],
      bundle : 'stone'
    },
    'death' : {
      name : 'death',
      slots : [
        {
          type : ['ghost'],
          position : {
            x : 50,
            y : 50
          }
        },
        {
          type : ['tomb'],
          position : {
            x : 50,
            y : 0
          }
        },
        {
          type : ['light'],
          position : {
            x : 80,
            y : 0
          }
        }
      ],
      bundle : 'stone'
    },
    'throne' : {
      name : 'death',
      slots : [
        {
          type : ['throne'],
          position : {
            x : 50,
            y : 70
          }
        },
        {
          type : ['light'],
          position : {
            x : 20,
            y : 70
          }
        },
        {
          type : ['ghost'],
          position : {
            x : 20,
            y : 20
          }
        },
        {
          type : ['ghost'],
          position : {
            x : 80,
            y : 20
          }
        },
        {
          type : ['light'],
          position : {
            x : 90,
            y : 70
          }
        }
      ],
      bundle : 'stone'
    },
    'cimetery' : {
      name : 'death',
      slots : [
        {
          type : ['bigtomb'],
          position : {
            x : 30,
            y : 20
          }
        },
        {
          type : ['bigtomb'],
          position : {
            x : 30,
            y : 40
          }
        },
        {
          type : ['bigtomb'],
          position : {
            x : 30,
            y : 60
          }
        },
        {
          type : ['bigtomb'],
          position : {
            x : 30,
            y : 80
          }
        },
        {
          type : ['bigtomb'],
          position : {
            x : 5,
            y : 20
          }
        },
      ],
      bundle : 'stone'
    }
  },
  ranges : {
    'little' : [0, 3],
    'death' : [4, 9],
    'throne' : [10, 15],
    'cimetery' : [16, 100],
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
            frame : [9,10,11,12],
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
    },
    tomb : {
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
            dest : 3,
            frame : [4,5],
            dynamic : true
        },
        atlas : 'props',
        rigidbody : [0, {
            mass : Infinity
        }],
        velocity : [0, 0, 0],
        collider : [0, {
            width : 45,
            height : 45,
            mask : 'wall'
        }],
        occluder: [0, [
          -22.5, -22.5,
           22.5, -22.5,
           22.5,  22.5,
          -22.5,  22.5
        ]]
      }
    },
    throne : {
      components : [
        'collider',
        'velocity',
        'rigidbody',
        'occluder'
      ],
      data : {
        sprite : {
            width : 120,
            height : 120,
            scale : 4,
            dest : 3,
            frame : [7],
            dynamic : true
        },
        atlas : 'props',
        rigidbody : [0, {
            mass : Infinity
        }],
        velocity : [0, 0, 0],
        collider : [0, {
            offsetY : 20,
            width : 90,
            height : 45,
            mask : 'wall'
        }],
        occluder: [0, [
          -45, -22.5,
           45, -22.5,
           45,  22.5,
          -45,  22.5
        ]]
      }
    },
    bigtomb : {
      components : [
        'collider',
        'velocity',
        'rigidbody',
        'occluder'
      ],
      data : {
        sprite : {
            width : 240,
            height : 120,
            scale : 4,
            dest : 3,
            frame : [0],
            dynamic : true
        },
        atlas : 'props',
        rigidbody : [0, {
            mass : Infinity
        }],
        velocity : [0, 0, 0],
        collider : [0, {
            offsetY : 20,
            width : 90,
            height : 45,
            mask : 'wall'
        }],
        occluder: [0, [
          -45, -22.5,
           45, -22.5,
           45,  22.5,
          -45,  22.5
        ]]
      }
    },
    light : {
      components : [
        'collider',
        'velocity',
        'rigidbody'
      ],
      data : {
        sprite : {
            width : 90,
            height : 90,
            scale : 3,
            dest : 3,
            frame : [3],
            dynamic : true
        },
        atlas : 'props',
        rigidbody : [0, {
            mass : Infinity
        }],
        velocity : [0, 0, 0],
        collider : [0, {
            offsetY : 20,
            width : 60,
            height : 45,
            mask : 'wall'
        }]
      },
      entities : {
        light : {
          radius: 300,
          color: [240, 0, 0],
          intensity: 1,
          dynamic : true
        }
      },
    },
    ghost : {
      entities : {
        skeleton : {

        }
      }
    },
    bat : {
      entities : {
        bat : {

        }
      }
    }
  },
  bundles : {
    'stone' : {
      'upperLeft' : [{ //upperleft
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
        dest : TOP_BUFFER,
        occluder : {
          w : 120,
          y : - 30,
          h : 90,
        }
      }],
      'downLeft' : [{ //upperright
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
        dest : TOP_BUFFER,
        occluder : {
          w : 120,
          h : 60,
        }
      }],
      'upperRight' : [{ //downright
        index : 5,
        dest : BOTTOM_BUFFER,
        collider : {
            w : 120,
            h : 120,
            x : 60,
            y : 30
        }
      }],
      'upperRight_top' : [{
        index : 4,
        y : -90,
        dest : TOP_BUFFER,
        occluder : {
          w : 120,
          h : 60,
          y : 30
        }
      }],
      'downRight' : [{ //downleft
        index : 7,
        dest : BOTTOM_BUFFER,
        collider : {
            w : 120,
            h : 120,
            x : 60,
            y : 30
        }
      }],
      'downRight_top' : [{
        index : 6,
        y : -90,
        dest : TOP_BUFFER,
        occluder : {
          w : 120,
          h : 60,
          y : 30
        }
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
        },
        occluder : {
          w : 1,
          h : 250,
          y : -140
        }
      }],
      'right' : [{
        index : 12,
        dest : BOTTOM_BUFFER,
        collider : {
            w : 120,
            h : 230,
            x : 60
        },
        occluder : {
          w : 1,
          h : 240,
          y : -150,
          x : 120
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
        dest : TOP_BUFFER,
        occluder : {
          w : 120,
          h : 30,
          y : 30
        }
      },{
        index : 15,
        y : -95,
        dest : TOP_BUFFER,
        occluder : {
          w : 120,
          h : 30,
          y : 30
        }
      },{
        index : 17,
        y : -95,
        dest : TOP_BUFFER,
        occluder : {
          w : 120,
          h : 30,
          y : 30
        }
      }],
      'down' : [{
        index : 19,
        y : -90,
        dest : TOP_BUFFER,
        collider : {
            w : 120,
            h : 120,
            x : 60,
            y : 120
        },
        occluder : {
          w : 120,
          h : 60,
          y : 30
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
        },
        occluder : {
          w : 120,
          h : 120
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
