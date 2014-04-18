'use strict';
var context = nuclear.system.context();

function CurrentWeapon(e, name, data){
  this.name = name;
  this.data = data;
  this.e = e;
}

CurrentWeapon.prototype.generateNew = function generateNew(type){
  var data = context.loot(type);
  this.data = data;
  return data;
};

CurrentWeapon.prototype.applyStats = function applyStats(){
  nuclear.component('attack').of(this.e).change(this.data);
};

module.exports = CurrentWeapon;