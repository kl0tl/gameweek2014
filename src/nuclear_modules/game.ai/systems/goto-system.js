'use strict';

module.exports = function (entity, components) {
  var goTo, direction;

  goTo = components.goTo;

  if(goTo.target.length){
    //var /*dest,*/ position, /*x, y, x1, y1,*/ target;

    // dest = context.dests[0];

    // position = components.position;
    // target = goTo.target[0];

    // x = position.x;
    // y = position.y;
    // x1 = target.x;
    // y1 = target.y;

    // if (context.cameraPosition) {
    //   x -= context.cameraPosition.x;
    //   y -= context.cameraPosition.y;
    //   x1 -= context.cameraPosition.x;
    //   y1 -= context.cameraPosition.y;
    // }

    // dest.save();

    // dest.strokeStyle = '#f0f';

    // dest.beginPath();
    // dest.moveTo(x, y);
    // dest.lineTo(x1, y1);
    // dest.arc(x1, y1, 50, 0, 2*Math.PI, true);
    // dest.stroke();
    // dest.restore();
    direction = goTo.computeNext(components.position);

    if(direction){
        components.velocity.x = direction.x;
        components.velocity.y = direction.y;
    } else{
        components.velocity.x = 0;
        components.velocity.y = 0;
    }

    if(goTo.testReach(components.position)){
      goTo.target.shift();
    }
  }
};
