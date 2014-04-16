'use strict';

module.exports = {
  templates : {
    'one' : {
      name : 'one',
      slots : [
        {
          type : 'crate',
          position : {
            x : 30,
            y : 20
          }
        },
        {
          type : 'crate',
          position : {
            x : 40,
            y : 20
          }
        },
        {
          type : 'crate',
          position : {
            x : 100,
            y : 10
          }
        }
      ],
      light : 'red',
      bundle : 'stone'
    },
    'two' : {
      name : 'two',
      slots : [
        {
          type : 'crate',
          position : {
            x : 30,
            y : 20
          }
        },
        {
          type : 'crate',
          position : {
            x : 40,
            y : 20
          }
        },
        {
          type : 'crate',
          position : {
            x : 100,
            y : 10
          }
        }
      ],
      light : 'red',
      bundle : 'stone'
    },
    'three' : {
      name : 'three',
      slots : [
        {
          type : 'crate',
          position : {
            x : 30,
            y : 20
          }
        },
        {
          type : 'crate',
          position : {
            x : 40,
            y : 20
          }
        },
        {
          type : 'crate',
          position : {
            x : 100,
            y : 10
          }
        }
      ],
      light : 'red',
      bundle : 'stone'
    },
    'four' : {
      name : 'four',
      slots : [
        {
          type : 'crate',
          position : {
            x : 30,
            y : 20
          }
        },
        {
          type : 'crate',
          position : {
            x : 40,
            y : 20
          }
        },
        {
          type : 'crate',
          position : {
            x : 100,
            y : 10
          }
        }
      ],
      light : 'red',
      bundle : 'stone'
    }
  },
  ranges : {
    'one' : [9, 14],
    'two' : [15, 25],
    'three' : [26, 40],
    'four' : [41, 200],
  },
  slots : {
    torch : {
      components : [
        'destructible',
        'collider',
        'sprite',
        'scale'
      ],
      data : {

      }
    },
    crate : {
      components : [
      ],
      data : {
        sprite : [0, 120, 120],
        atlas : [0, 'crate']
      }
    }
  },
  bundles : {
    'stone' : {
      'upperLeft' : [{
        index : 1,
        dest : 3
      }],
      'upperLeft_top' : [{
        index : 0,
        h : 0.75,
        y : -119,
        dest : 1
      }],
      'downLeft' : [{
        index : 3,
        dest : 3
      }],
      'downLeft_top' : [{
        index : 2,
        h : 0.75,
        y : -119,
        dest : 1
      }],
      'upperRight' : [{
        index : 5,
        dest : 3
      }],
      'upperRight_top' : [{
        index : 4,
        h : 0.75,
        y : -119,
        dest : 1
      }],
      'downRight' : [{
        index : 7,
        dest : 3
      }],
      'downRight_top' : [{
        index : 6,
        h : 0.75,
        y : -119,
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
      }],
      'left' : [{
        index : 11,
        dest : 3
      }],
      'right' : [{
        index : 12,
        dest : 3
      }],
      'up' : [{
        index : 14,
        dest : 3
      },{
        index : 16,
        dest : 3
      },{
        index : 18,
        dest : 3
      }],
      'up_top' : [{
        index : 13,
        h : 0.75,
        y : -119,
        dest : 1
      },{
        index : 15,
        h : 0.75,
        y : -119,
        dest : 1
      },{
        index : 17,
        h : 0.75,
        y : -119,
        dest : 1
      }],
      'down' : [{
        index : 19,
        y : - 119,
        h : 0.75,
        dest : 1
      }],
      'upperExternalRight' : [{
        index : 22,
        y : 30,
        h : 2,
        w : 0.4,
        x : -72,
        dest : 3
      }],
      'upperExternalLeft' : [{
        index : 21,
        y : 30,
        h : 2,
        w : 0.4,
        dest : 3
      }],
      'doubleSides' : [{
        index : 23,
        dest : 3
      }],
      'downExternalLeft' : [{
        index : 26,
        y : - 15,
        h : 1.6,
        dest : 1
      }],
      'downExternalRight' : [{
        index : 24,
        y : - 15,
        h : 1.6,
        dest : 1
      }],
    }
  },
  resolution : 120,
  currentBundle : 'stone'
};