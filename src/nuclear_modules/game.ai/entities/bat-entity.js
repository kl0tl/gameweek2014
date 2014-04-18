'use strict';

module.exports = function batEntity(bat, options) {
  console.log('new bat entity', bat);
  var context = nuclear.system.context();
    if(context.pastPlayers.length > 0){
        var key = Object.keys(context.pastPlayers)[0];
        options.name = key;
        options.weapon = JSON.parse(context.pastPlayers[key]);

        nuclear.entity('monster').create(options);
        context.pastPlayers.length--;
        return;
    }

  nuclear.component('position').add(bat, options.x, options.y);

  nuclear.component('atlas').add(bat, 'bat');

  nuclear.component('sprite').add(bat, {
    scale: 2,
    width: 82 * 4,
    height: 58 * 4,
    dest: 3,
    dynamic: true,
    animable: true
  });

  nuclear.component('animations').add(bat, 'left', ['left', 'right']);

  nuclear.component('collider').add(bat, {
    width: 60,
    height: 30
  });

  nuclear.component('rigidbody').add(bat, {
    mass: 1, friction: 0.30
  });

  nuclear.component('velocity').add(bat);
  
  console.log(nuclear.component('states').add(bat, context.hero, {
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
    console.log(path = nuclear.component('path').add(bat, 0, 0));
    console.log(nuclear.component('goTo').add(bat, path.nodes, 5));
    var attack = nuclear.component('attack').add(bat, {
      w : 50,
      h : 90,
      damages : 1,
      offset : 30,
      cooldown : 20,
      onEnter : function(other){
        if(other === context.hero){
            var position = nuclear.component('position').of(other);
              position = {
                x : position.x + Math.random()*30,
                y : position.y + Math.random()*30
              };
            nuclear.component('life').of(context.hero).less(attack.damages);
            nuclear.entity('hit1').create(position);
        }
      },
      onExit : function(){}
    });
    console.log(nuclear.component('life').add(bat, options.life || 20, options.life || 20, function(e){
       if(Math.random() > 0.75) nuclear.entity('loot-axe').create(nuclear.component('position').of(e));
       else if(Math.random() > 0.75) nuclear.entity('loot-sword').create(nuclear.component('position').of(e));
       
       nuclear.entity('monster-death').create(nuclear.component('position').of(e));
    }, function(){
        
    }));

    if(Math.random() > 0.7) {
        nuclear.component('goule').add(bat);
      }
};
