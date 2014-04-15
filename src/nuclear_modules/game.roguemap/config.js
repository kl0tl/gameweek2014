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
      }],
      'upperLeft_top' : [{
        index : 0,
        h : 0.75,
        y : -119,
        dest : 2
      }],
      'downLeft' : [{
        index : 3,
      }],
      'downLeft_top' : [{
        index : 2,
        h : 0.75,
        y : -119,
        dest : 2
      }],
      'upperRight' : [{
        index : 5,
      }],
      'upperRight_top' : [{
        index : 4,
        h : 0.75,
        y : -119,
        dest : 2
      }],
      'downRight' : [{
        index : 7,
      }],
      'downRight_top' : [{
        index : 6,
        h : 0.75,
        y : -119,
        dest : 2
      }],
      'ground' : [{
        index : 8,
      },{
        index : 9,
      },{
        index : 10,
      }],
      'left' : [{
        index : 11,
      }],
      'right' : [{
        index : 12,
      }],
      'up' : [{
        index : 14,
      },{
        index : 16,
      },{
        index : 18,
      }],
      'up_top' : [{
        index : 13,
        h : 0.75,
        y : -119,
        dest : 2
      },{
        index : 15,
        h : 0.75,
        y : -119,
        dest : 2
      },{
        index : 17,
        h : 0.75,
        y : -119,
        dest : 2
      }],
      'down' : [{
        index : 19,
        y : - 119,
        h : 0.75,
        dest : 2
      }],
      'upperExternalRight' : [{
        index : 22,
        y : 30,
        h : 2,
        w : 0.4,
        x : -72
      }],
      'upperExternalLeft' : [{
        index : 21,
        y : 30,
        h : 2,
        w : 0.4
      }],
      'doubleSides' : [{
        index : 23,
      }],
      'downExternalLeft' : [{
        index : 26,
        y : - 15,
        h : 1.6,
        dest : 2
      }],
      'downExternalRight' : [{
        index : 24,
        y : - 15,
        h : 1.6,
        dest : 2
      }],
    }
  },
  resolution : 120,
  currentBundle : 'stone'
};