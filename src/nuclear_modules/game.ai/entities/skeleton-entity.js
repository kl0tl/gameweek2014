'use strict';

module.exports = function skeletonEntity(skeleton, options) {
  console.log('new skeleton entity', skeleton);
  var context = nuclear.system.context();
  if(context.pastPlayers.length > 0){
        var key = Object.keys(context.pastPlayers)[0];
        options.name = key;
        options.weapon = JSON.parse(context.pastPlayers[key]);

        nuclear.entity('monster').create(options);
        context.pastPlayers.length--;
        return;
    }
  nuclear.component('position').add(skeleton, options.x, options.y);

  nuclear.component('atlas').add(skeleton, 'skeleton');

  nuclear.component('sprite').add(skeleton, {
    scale: 4,
    width: 120 * 4,
    height: 120 * 4,
    dest: 3,
    dynamic: true,
    animable: true
  });

  nuclear.component('animations').add(skeleton, 'left', ['left', 'right', 'attack']);

  nuclear.component('collider').add(skeleton, {
    width: 120,
    height: 120,
    offsetY : 60
  });

  nuclear.component('rigidbody').add(skeleton, {
    mass: 1, friction: 0.75
  });

  nuclear.component('velocity').add(skeleton);
  
  console.log(nuclear.component('states').add(skeleton, context.hero, {
        idle : {
                    run : 'idle-run'
                },
        reaching : {
                    run : 'reaching-run',
                    enter : 'reaching-enter'
                },
        fight : {
                    run : 'fight-run'
                }
    }, 'idle'));
    var path;
    console.log(path = nuclear.component('path').add(skeleton, 0, 0));
    console.log(nuclear.component('goTo').add(skeleton, path.nodes, 2));
    var attack = nuclear.component('attack').add(skeleton, {
      w : 50,
      h : 90,
      damages : 1,
      offset : 30,
      cooldown : 20,
      onEnter : function(other){
        if(other === context.hero){
            var position = nuclear.component('position').of(other);
              position = {
                x : position.x + Math.random()*100,
                y : position.y + Math.random()*100
              };
            nuclear.component('life').of(context.hero).less(attack.damages);
            nuclear.entity('hit1').create(position);
        }
      },
      onExit : function(){}
    });
    console.log(nuclear.component('life').add(skeleton, options.life || 50, options.life || 50, function(e){
        //looting
       nuclear.entity('monster-death').create(nuclear.component('position').of(e));
    }, function(){
        
    }));

    if(Math.random() > 0.7) {
        nuclear.component('goule').add(skeleton);
      }
};
