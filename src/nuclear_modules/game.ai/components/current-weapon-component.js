'use strict';
var context = nuclear.system.context();

function CurrentWeapon(owner, name, data){
  this.name = name;
  this.data = data;
  this.owner = owner;

  this.entity = nuclear.entity(data.type).create({
    owner: owner
  });
}

CurrentWeapon.prototype.generateNew = function generateNew(type){
  var data = context.loot(type);

  if (type !== this.data.type) {
    nuclear.entity.remove(this.entity);
    this.entity = nuclear.entity(data.type).create({
      owner: this.owner
    });
  }

  this.data = data;

  return data;
};

CurrentWeapon.prototype.applyStats = function applyStats(){
  nuclear.component('attack').of(this.owner).change(this.data);
};

module.exports = CurrentWeapon;
