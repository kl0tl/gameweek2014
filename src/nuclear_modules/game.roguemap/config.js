'use strict';

module.exports = {
  templates : {
    'one' : {
      name : 'one',
      slots : [
        {
          type : 'prinny',
          position : {
            x : 30,
            y : 20
          }
        },
        {
          type : 'prinny',
          position : {
            x : 40,
            y : 20
          }
        },
        {
          type : 'prinny',
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
          type : 'prinny',
          position : {
            x : 30,
            y : 20
          }
        },
        {
          type : 'prinny',
          position : {
            x : 40,
            y : 20
          }
        },
        {
          type : 'prinny',
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
          type : 'prinny',
          position : {
            x : 30,
            y : 20
          }
        },
        {
          type : 'prinny',
          position : {
            x : 40,
            y : 20
          }
        },
        {
          type : 'prinny',
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
          type : 'prinny',
          position : {
            x : 30,
            y : 20
          }
        },
        {
          type : 'prinny',
          position : {
            x : 40,
            y : 20
          }
        },
        {
          type : 'prinny',
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
    crate : {
      components : [
        'destructible',
        'collider',
        'sprite',
        'scale'
      ],
      data : {

      }
    },
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
    prinny : {
      components : [
        
      ],
      data : {
        sprite : [0, 20, 20],
        atlas : [0, 'prinny'],
        animations : [0, {
          target: 'prinny',
          animations: ['dancing'],
          defaultAnimation: 'dancing'
        }]
      }
    }
  },
  resolution : 30
};