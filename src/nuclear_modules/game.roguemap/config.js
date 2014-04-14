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
          type : 'torch',
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
          type : 'torch',
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
          type : 'torch',
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
          type : 'torch',
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
    crate : [
      'destructible',
      'collider',
      'sprite',
      'position'
    ],
    torch : [
      'sprite',
      'position',
      'light'
    ],
  }
};