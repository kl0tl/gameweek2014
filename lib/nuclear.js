(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* events-emitter 30-12-2013 */
!function(a,b){"function"==typeof define&&define.amd?define(function(){return b(a)}):"object"==typeof module&&module&&module.exports?module.exports=b(a):"object"==typeof exports&&exports?exports.EventsEmitter=b(a):a.EventsEmitter=b(a)}(this,function(a){"use strict";function b(){}function c(b,c,d,e,f){var i=h;h+=1,"_listeners"in b||(b._listeners={callbacks:Object.create(null),contexts:Object.create(null),times:Object.create(null)}),"_events"in b||(b._events=Object.create(null)),b._listeners.callbacks[i]=d,b._listeners.contexts[i]=e,5===arguments.length&&(b._listeners.times[i]=f),"_memories"in b&&Array.isArray(b._memories[c])&&(a.setImmediate||a.setTimeout)(function(){g(b,i,b._memories[c])},0);var j=b._events[c];return"number"==typeof j?b._events[c]=[j,i]:Array.isArray(j)?j.push(i):b._events[c]=i,i}function d(a,b,c){var d=(a._listeners.callbacks,a._events[b]);if("number"==typeof d)f(a,d);else if(Array.isArray(d))for(var e=d.length,g=0;e>g;g+=1){var h=d[g];f(a,h)}c||delete a._events[b]}function e(a,b,c){var d=a._listeners.callbacks,e=a._events[b];if("number"==typeof e)e in d||(f(a,e),delete a._events[b]);else if(Array.isArray(e)){for(var g=e.length,h=0;g>h;h+=1){var i=e[h];i in d||(f(a,i),e.splice(h,1),g-=1,h-=1)}0!==g||c||delete a._events[b]}}function f(a,b){delete a._listeners.callbacks[b],delete a._listeners.contexts[b],delete a._listeners.times[b]}function g(b,c,d){if(c in b._listeners.callbacks){var e=b._listeners.callbacks[c],g=b._listeners.contexts[c]||a;switch(c in b._listeners.times&&(b._listeners.times[c]-=1,b._listeners.times[c]<1&&f(b,c)),d.length){case 0:return e.call(g);case 1:return e.call(g,d[0]);case 2:return e.call(g,d[0],d[1]);case 3:return e.call(g,d[0],d[1],d[2]);default:return e.apply(g,d)}}}var h=1;return b.prototype.on=function(b,d,e){return 3===arguments.length?"times"in e?e.times<1?0:c(this,b,d,e.context||a,e.times):c(this,b,d,e.context||a):c(this,b,d,a)},b.prototype.once=function(b,d,e){return 3===arguments.length?c(this,b,d,e.context||a,1):c(this,b,d,a,1)},b.prototype.off=function(a){return"_listeners"in this&&a in this._listeners.callbacks?(delete this._listeners.callbacks[a],delete this._listeners.contexts[a],delete this._listeners.times[a],!0):!1},b.prototype.clear=function(a,b){if("_listeners"in this&&"_events"in this){var c,f;switch(arguments.length){case 0:for(a in this._events)d(this,a,!1);break;case 1:if("string"==typeof a)d(this,a,!1);else if(Array.isArray(a))for(f=a.length;f--;)d(this,a[f],!1);else{b=a,c=b.soft||!1;for(a in this._events)b.ghosts?e(this,a,c):d(this,a,c)}break;case 2:if(c=b.soft||!1,"string"==typeof a)b.ghosts?e(this,a,c):d(this,a,c);else if(Array.isArray(a))for(f=a.length;f--;)b.ghosts?e(this,a[f],c):d(this,a[f],c)}}},b.prototype.listeners=function(a){var b=[];if(!("_listeners"in this&&"_events"in this))return b;var c=this._listeners.callbacks,d=this._events[a];if("number"==typeof d)d in c?b.push(c[d]):f(this,d);else if(Array.isArray(d))for(var e=d.length,g=0;e>g;g+=1){var h=d[g];h in c?b.push(c[h]):f(this,h)}return b},b.prototype.remember=function(a){if("_memories"in this||(this._memories=Object.create(null)),Array.isArray(a))for(var b=a.length;b--;)this._memories[a[b]]=null;else this._memories[a]=null},b.prototype.forget=function(a){if("_memories"in this)if(Array.isArray(a))for(var b=a.length;b--;)delete this._memories[a[b]];else delete this._memories[a]},b.prototype.trigger=function(a){var b=Array.prototype.slice.call(arguments,1);if("_memories"in this&&a in this._memories&&(this._memories[a]=b),!("_listeners"in this&&"_events"in this))return!1;var c=this._events[a];if("number"==typeof c)g(this,c,b);else{if(!Array.isArray(c))return!1;for(var d=c.length,e=0;d>e;e+=1){var f=c[e];g(this,f,b)}}return!0},b.mixins=function(a){var c=b.prototype;for(var d in c)a[d]=c[d];return a},b.mixins(b),b});
},{}],2:[function(require,module,exports){
'use strict';

var nuclearEvents = require('./nuclear.events'),
    registry = require('./nuclear.registry');

/**
 * Component constructor
 * This is the components factory
 * @param {string} name       The component name
 * @param {function} definition The component function which has to return its instance
 */
function Component(name, definition, moduleName) {
  this.name = name;
  this.definition = definition;

  this._components = Object.create(null);
  this._disabledComponents = Object.create(null);

  this.moduleName = moduleName;
}

/**
 * Return the component of the wanted entity if it has a component of this factory
 * If the options key 'required' is true, the method throw an error if the entity hasn't the component
 * If the options key 'add' is true, the method add the component to the entity and return it
 * @param  {number} entity  The entity which has the component
 * @param  {object} options The method options
 * @return {object/undefined}         Return the component if the entity has it, if it hasn't,
 * return undefined if th required key is false
 */
Component.prototype.of = function ComponentOf(entity, options) {
  var component = this._components[entity] || this._disabledComponents[entity];

  if (arguments.length === 2) {
    if (!this.in(entity)) {
      if (options.required) throw new Error();
      else if (options.add) component = this.add(entity);
    }
  }

  return component;
};

/**
 * Test if an entity has the component of this factory
 * @param  {number} entity The entity to test
 * @return {boolean}        True if the entity has it, fals if it hasn't
 */
Component.prototype.in = function ComponentIn(entity) {
  return entity in this._components || entity in this._disabledComponents;
};

/**
 * The method to add a component to an existing entity
 * All the arguments after the entity one will be passed to the component definition call
 * The component creation triggers a 'add:'componentName event on the component part of core
 * @param {number} entity The entity which will get the new component
 * @return {object}       The created component
 */
Component.prototype.add = function ComponentAdd(entity) {
  if (this. in (entity)) throw new Error();

  var component = this.definition.apply(this, arguments);

  this._components[entity] = component;

  nuclearEvents.trigger('component:add:' + this.identity(), entity, this.name, this.moduleName);
  nuclearEvents.trigger('component:add', entity, this.identity(), this.name, this.moduleName);

  return component;
};

/**
 * Remove the component of this factory to the selected entity
 * The component destruction triggers a 'remove:'ComponentName event on the component part of core
 * @param  {number} entity The entity which will lost the component
 * @return {boolean}        Return false if the entity hasn't the component, true in other case
 */
Component.prototype.remove = function ComponentRemove(entity) {
  if (!this. in (entity)) return false;

  delete this._components[entity];
  delete this._disabledComponents[entity];

  nuclearEvents.trigger('component:remove:' + this.identity(), entity, this.name, this.moduleName);
  nuclearEvents.trigger('component:remove', entity, this.identity(), this.name, this.moduleName);
  return true;
};

/**
 * Share an attached component to one or several entity(ies)
 * @param  {number} source The source entity, owning the component to share
 * @param  {number/array} dest   The selected entity(ies)
 * @return {object/null}        If the source has the component, it returns it, in other case, it returns null
 */
Component.prototype.share = function ComponentShare(source, dest) {
  if (!this. in (source)) return null;

  var component = this.of(source);

  if (Array.isArray(dest)) {
    var i;
    for (i = dest.length - 1; i >= 0; i -= 1) {
      this._components[dest[i]] = component;
      nuclearEvents.trigger('component:add:' + this.identity(), dest[i], this.name, this.moduleName);
      nuclearEvents.trigger('component:add', dest[i], this.identity(), this.name, this.moduleName);
    }
  } else {
    this._components[dest] = component;
    nuclearEvents.trigger('component:add:' + this.identity(), dest, this.name, this.moduleName);
    nuclearEvents.trigger('component:add', dest, this.identity(), this.name, this.moduleName);
  }

  return component;
};

/**
 * Disable the component of the selected entity
 * @param  {number} id The selected entity
 * @return {boolean}    If the entity owns the component and it is enabled, it returns true, in other case, it returns false
 */
Component.prototype.disable = function ComponentDisable(id) {
  if (id in this._components) {
    this._disabledComponents[id] = this._components[id];
    delete this._components[id];

    nuclearEvents.trigger('component:disable:' + this.identity(), id, this.name, this.moduleName);
    nuclearEvents.trigger('component:disable', id, this.identity(), this.name, this.moduleName);

    return true;
  }
  return false;
};

/**
 * Enable the component of the selected entity
 * @param  {number} id The selected entity
 * @return {boolean}    If the entity owns the component and it is disabled, it returns true, in other case, it returns false
 */
Component.prototype.enable = function ComponentEnable(id) {
  if (id in this._disabledComponents) {
    this._components[id] = this._disabledComponents[id];
    delete this._disabledComponents[id];

    nuclearEvents.trigger('component:enable:' + this.identity(), id, this.name, this.moduleName);
    nuclearEvents.trigger('component:enable', id, this.identity(), this.name, this.moduleName);

    return true;
  }
  return false;
};

/**
 * Test if the component of the selected entity is enabled or not
 * @param  {number}  id The selected entity
 * @return {Boolean}    True if it's enabled, false in other case
 */
Component.prototype.isEnabled = function ComponentIsEnabled(id) {
  if (this. in (id)) {
    if (id in this._components) return true;
    return false;
  }

  throw new Error();
};

/**
 * Return the Component's identity
 * It containes it's name and it's module's name
 * @return {String}    The component identity
 */
Component.prototype.identity = function ComponentIdentity(){
  return this.name+' from '+this.moduleName;
};

/**
 * Aliases this Component with the alias param
 * @return {Component}    The Component
 */
Component.prototype.alias = function nuclearEntityAlias(alias){
  registry.components[alias] = this;
  return this;
};
module.exports = Component;

},{"./nuclear.events":9,"./nuclear.registry":11}],3:[function(require,module,exports){
'use strict';

function EntityIdGenerator(seed) {
  this._seed = seed || 0;
  this._value = this._seed;
}

EntityIdGenerator.prototype.next = function entityIdGeneratorNext() {
  return (this._value += 1);
};

EntityIdGenerator.prototype.reset = function entityIdGeneratorReset() {
  this._value = this._seed;
};


module.exports = EntityIdGenerator;

},{}],4:[function(require,module,exports){
'use strict';

var EntityIdGenerator, entityIdGenerator, nuclearEvents, registry;

EntityIdGenerator = require('./entity-id-generator');
entityIdGenerator = new EntityIdGenerator();
nuclearEvents = require('./nuclear.events');
registry = require('./nuclear.registry');

/**
 * The Entity constructor
 * @param {string} name   The Entity name
 * @param {Object} source The Entity config
 */
function Entity(name, definition, moduleName) {
  this.name = name;
  this.definition = definition || function defaultDefinition(){};

  this.moduleName = moduleName;
}

Entity.next = function entityNext() {
  return entityIdGenerator.next();
};

/**
 * Create an entity depending on this Entity
 * @param  {object} options All the components data
 * @return {number}         The created entity
 */
Entity.prototype.create = function entityCreate(options) {
  var id = Entity.next();
  this.definition(id, options);

  nuclearEvents.trigger('entity:create:' + this.identity(), id, this.name, this.moduleName);
  nuclearEvents.trigger('entity:create_entity', id, this.identity(), this.name, this.moduleName);

  return id;
};

/**
 * Enhance an entity with this factory definition
 * @param  {number} entity The entity to enhance
 * @param  {object} data Data to configure components
 * @return {number}            The entity to enhance
 */
Entity.prototype.enhance = function entityEnhance(entity, data) {
  this.definition(entity, data);

  return entity;
};

/**
 * Return the Entity's identity
 * It contains it's name and it's module's name
 * @return {String}    The Entity identity
 */
Entity.prototype.identity = function entityIdentity(){
  return this.name+' from '+this.moduleName;
};

/**
 * Aliases this Entity with the alias param
 * @return {Entity}    The Entity
 */
Entity.prototype.alias = function nuclearEntityAlias(alias){
  registry.entities[alias] = this;
  return this;
};

module.exports = Entity;

},{"./entity-id-generator":3,"./nuclear.events":9,"./nuclear.registry":11}],5:[function(require,module,exports){
'use strict';

var nuclear, Module;

module.exports = nuclear = {};

Module = require('./module');

nuclear.events    = require('./nuclear.events');
nuclear.registry  = require('./nuclear.registry');
nuclear.component = require('./nuclear.component');
nuclear.entity    = require('./nuclear.entity');
nuclear.system    = require('./nuclear.system');
nuclear.query     = require('./nuclear.query');

nuclear.module = function nuclearModule(name, deps) {
  var module;

  if (arguments.length === 1) {
    return this.registry.module(name);
  }

  module = new Module(name, deps);

  return module;
};

nuclear.import = function nuclearImport(modules) {
  var i, length;

  length = modules.length;

  for (i = 0; i < length; i += 1) {
    this.registry.import(modules[i]);
  }
};

},{"./module":6,"./nuclear.component":7,"./nuclear.entity":8,"./nuclear.events":9,"./nuclear.query":10,"./nuclear.registry":11,"./nuclear.system":12}],6:[function(require,module,exports){
'use strict';

var Component, Entity, System, resolver;

Component = require('./component');
Entity = require('./entity');
System = require('./system');
resolver = require('./resolver');

function Module(name, deps) {
  this.name = name.trim();
  this.requires = deps;

  this.components = Object.create(null);
  this.entities = Object.create(null);
  this.systems = Object.create(null);

  this._config = Object.create(null);
}

Module.prototype.config = function moduleConfig(config) {
  var key, descriptor;

  if (typeof config === 'string') {
    return this._config[key = config];
  }

  for (key in config) {
    descriptor = Object.getOwnPropertyDescriptor(config, key);
    if (descriptor) Object.defineProperty(this._config, key, descriptor);
  }

  return this;
};

Module.prototype.component = function moduleComponent(name, factory) {
  var component;

  if (arguments.length === 1) {
    component = this.components[name];

    if (component) return component;

    throw new Error();
  }

  if (name in this.components) {
    throw new Error();
  }

  this.components[name] = new Component(name, factory, this.name);

  return this;
};

Module.prototype.entity = function moduleEntity(name, factory) {
  var entity;

  if (arguments.length === 1) {
    entity = this.entities[name];

    if (entity) return entity;

    throw new Error();
  }

  if (name in this.entities) {
    throw new Error();
  }

  this.entities[name] = new Entity(name, factory, this.name);

  return this;
};

Module.prototype.system = function moduleSystem(name, components, definition, options) {
  var system, i, length, component;

  if (arguments.length === 1) {
    system = this.systems[name];

    if (system) return system;

    throw new Error();
  }

  if (name in this.systems) {
    throw new Error();
  }

  length = components.length;

  for(i = 0; i < length; i += 1) {
    component = components[i];

    if (resolver.module(component) === '') {
      components[i] = resolver.module(component, this.name);
    }
  }

  this.systems[name] = new System(name, components, definition, this.name, options);

  return this;
};

module.exports = Module;

},{"./component":2,"./entity":4,"./resolver":20,"./system":22}],7:[function(require,module,exports){
'use strict';

var registry = require('./nuclear.registry'),
    nuclearEvents = require('./nuclear.events'),
    entityList = Object.create(null);

/**
 * The nuclearComponent method which contains all Component definition
 * This is also the nuclearComponents definition getter (throws an error if the Component doesn't exist)
 * @param  {string} name The Component name
 * @return {object}      The selected Component
 */
function nuclearComponent(name) {
  return registry.component(name);
}

/**
 * Get all the selected entity nuclearComponents
 * @param  {number} id The selected entity
 * @return {array}    A simple string array containing all the nuclearComponents names of the selected entity
 */
nuclearComponent.all = function nuclearComponentOf(id) {
  if (entityList[id]) return entityList[id];

  throw new Error();
};

function linkComponent(id, name) {
  var components = entityList[id] || [];
  components.push(name);
  entityList[id] = components;
}

function unLinkComponent(id, name) {
  var components = nuclearComponent.all(id);
  var index = components.indexOf(name);

  components.splice(index, 1);
}

nuclearEvents.on('component:add', linkComponent);
nuclearEvents.on('component:remove', unLinkComponent);

module.exports = nuclearComponent;
},{"./nuclear.events":9,"./nuclear.registry":11}],8:[function(require,module,exports){
'use strict';

var registry = require('./nuclear.registry'),
    nuclearComponent = require('./nuclear.component'),
    Entity = require('./entity'),
    nuclearEvents = require('./nuclear.events');

/**
 * The nuclearEntity method which contains all entities definitions
 * This is also the nuclearEntity definition getter (throws an error if the Entity doesn't exist)
 * @param  {string} name The Entity name
 * @return {object}      The selected Entity
 */
function nuclearEntity(name) {
  return registry.entity(name);
}

/**
 * Serialize the selected nuclearEntity
 * @param  {number} id The selected nuclearEntity
 * @return {string}    The serialized nuclearEntity
 */
nuclearEntity.serialize = function nuclearEntitySerialize(id) {
  var serialized = Object.create(null),
    components = nuclearComponent.all(id); //change .of to .all here

  serialized.id = id;
  serialized.options = Object.create(null);

  for (var i = components.length - 1; i > 0; i--) {
    var name = components[i];
    var definition = nuclearComponent(name);
    var data = definition.of(id);

    if (typeof data.toJSON === 'function') data = data.toJSON();
    serialized.options[name] = data;
  }

  return JSON.stringify(serialized);
};

/**
 * Deserialize a serialized nuclearEntity
 * @param  {string} serialized The serialized nuclearEntity
 * @return {number}            The created nuclearEntity id
 */
nuclearEntity.deserialize = function nuclearEntityDeserialize(serialized) {
  serialized = JSON.parse(serialized);
  var id = nuclearEntity.create(serialized.options);

  return id;
};

/**
 * Remove the selected nuclearEntity and its components
 * @param  {number} id The selected nuclearEntity
 * @return {boolean}    Return true
 */
nuclearEntity.remove = function nuclearEntityRemove(id) {
  var components = nuclearComponent.of(id);

  for (var i = components.length - 1; i >= 0; i -= 1) {
    nuclearComponent(components[i]).remove(id);
  }

  nuclearEvents.trigger('entity:remove', id);
  return true;
};

nuclearEntity.create = function nuclearEntityCreate(options){
  var id = Entity.next(),
      i;
  for(i in options){
    nuclearComponent(i).add(id, options[i]);
  }

  return id;
};

module.exports = nuclearEntity;

},{"./entity":4,"./nuclear.component":7,"./nuclear.events":9,"./nuclear.registry":11}],9:[function(require,module,exports){
'use strict';

var EventsEmitter;

EventsEmitter = require('../../lib/events-emitter.min');

module.exports = new EventsEmitter();

},{"../../lib/events-emitter.min":1}],10:[function(require,module,exports){
'use strict';

var QueryExpression;

QueryExpression = require('./query-expression');

function nuclearQuery(expression, meta) {
  return nuclearQuery.live(expression, meta);
}

nuclearQuery.raw = function nuclearQueryRaw() {};

nuclearQuery.live = function nuclearQueryLive(expression, meta) {
  return new QueryExpression(expression, meta);
};

module.exports = nuclearQuery;

},{"./query-expression":16}],11:[function(require,module,exports){
'use strict';

var Registry;

Registry = require('./registry');

module.exports = new Registry();

},{"./registry":19}],12:[function(require,module,exports){
'use strict';

var registry = require('./nuclear.registry'),
    nuclearEvents = require('./nuclear.events'),
    context = {};

/**
 * The nuclearSystem method which contains all nuclearSystem definitions
 * This is also the nuclearSystem definition getter (throws an error if the System doesn't exist)
 * @param  {string} name The System name
 * @return {object}      The selected System
 */
function nuclearSystem(name) {
  return registry.system(name);
}

/**
 * Define the run priority of the selected nuclearSystem
 * @param  {string} name The selected System name
 * @param  {number} prio The priority of the nuclearSystem
 */
nuclearSystem.priority = function nuclearSystemPriority(name, prio) {
  if (arguments.length === 1) {
    return nuclearSystem(name)._priority;
  }

  nuclearSystem(name)._priority = prio;
  registry._systemList.sort(nuclearSystemsPriorityComparator);
};

function nuclearSystemsPriorityComparator(a, b) {
  return a._priority - b._priority;
}

/**
 * Run all the nuclearSystem list
 */
nuclearSystem.run = function nuclearSystemRun() {
  nuclearEvents.trigger('system:before_running', nuclearSystem._list);
  var x;
  for (x = 0; x < registry._systemLength; x++) {
    nuclearSystem(registry._systemList[x]).run();
  }
  nuclearEvents.trigger('system:after_running', registry._systemList);
};

/**
 * Disable a nuclearSystem in the nuclearSystem list
 * @param  {string} name The System name
 */
nuclearSystem.disable = function nuclearSystemDisable(name) {
  var index = registry.systems.indexOf(name);
  registry.systems.splice(index, 1);
};

/**
 * Get the global systems context
 */
nuclearSystem.context = function nuclearSystemContext() {
  return context;
};

module.exports = nuclearSystem;

},{"./nuclear.events":9,"./nuclear.registry":11}],13:[function(require,module,exports){
'use strict';

var OperatorNode;

OperatorNode = require('./query-operator-node');

function AndOperator(sources) {
  OperatorNode.call(this, sources);
}

AndOperator.prototype = Object.create(OperatorNode.prototype);

AndOperator.prototype.state = function andOperatorState(entity) {
  return this._masks[entity] === this.children.length;
};

AndOperator.prototype._onSourceStateChanged = function _andOperatorOnSourceStateChanged(entity, state) {
  if (!(entity in this._masks)) {
    this._masks[entity] = 0;
  }

  if (state) {
    this._masks[entity] += 1;
    if (this.state(entity)) {
      this.emit(entity, true);
    }
  } else if (this._masks[entity] > 0) {
    if (this.state(entity)) {
      this.emit(entity, false);
    }
    this._masks[entity] -= 1;
  }
};

module.exports = AndOperator;

},{"./query-operator-node":17}],14:[function(require,module,exports){
'use strict';

function BaseNode(children) {
  this.children = children ? children.slice() : [];
  this._listeners = [];
}

BaseNode.prototype.emit = function baseNodeEmit(entity, state) {
  var i, listener;

  for (i = 0; (listener = this._listeners[i]); i += 1) {
    listener(entity, state);
  }
};

BaseNode.prototype.listen = function baseNodeListen(listener) {
  this._listeners.push(listener);
};

module.exports = BaseNode;

},{}],15:[function(require,module,exports){
'use strict';

var BaseNode, nuclearEvents;

BaseNode = require('./query-base-node');
nuclearEvents = require('./nuclear.events');

function ComponentSelector(component, meta) {
  BaseNode.call(this);

  this._onComponentAdded = this._onComponentAdded.bind(this);
  this._onComponentRemoved = this._onComponentRemoved.bind(this);

  nuclearEvents.on('component:add:' + component, this._onComponentAdded);
  nuclearEvents.on('component:remove:' + component, this._onComponentRemoved);

  if (meta && meta.enabled) {
    nuclearEvents.on('component:enable:' + component, this._onComponentAdded);
    nuclearEvents.on('component:disable:' + component, this._onComponentRemoved);
  }
}

ComponentSelector.prototype = Object.create(BaseNode.prototype);

ComponentSelector.prototype._onComponentAdded = function _componentSelectorOnComponentAdded(entity) {
  this.emit(entity, true);
};

ComponentSelector.prototype._onComponentRemoved = function _componentSelectorOnComponentRemoved(entity) {
  this.emit(entity, false);
};

module.exports = ComponentSelector;

},{"./nuclear.events":9,"./query-base-node":14}],16:[function(require,module,exports){
'use strict';

var ComponentSelector, AndOperator, OrOperator;

ComponentSelector = require('./query-component-selector');
AndOperator = require('./query-and-operator');
OrOperator = require('./query-or-operator');

function QueryExpression(source, meta) {
  this.tree = null;
  this.entities = [];

  this._source = '';
  this._listeners = [this._onTreeStateChanged.bind(this)];

  if (arguments.length > 0) {
    this.source(source, meta);
  }
}

QueryExpression.tokenize = function QueryExpressionTokenize(source) {
  var tokens, i, chunk, matches;

  tokens = [];
  i = 0;

  while (i < source.length) {
    chunk = source.slice(i);

    if ((matches = chunk.match(/^\b[^\s]+\b(?:\s+from\s+[^\s]+\b)?/))) {
      tokens.push(['COMPONENT_SELECTOR', matches[0]]);
      i += matches[0].length;
    } else if ((matches = chunk.match(/^\s+/))) {
      tokens.push(['AND_OPERATOR', matches[0]]);
      i += matches[0].length;
    } else if ((matches = chunk.match(/^,\s+/))) {
      tokens.push(['OR_OPERATOR', matches[0]]);
      i += matches[0].length;
    } else {
      tokens.push([chunk[0], chunk[0]]);
      i += 1;
    }
  }

  return tokens;
};

QueryExpression.parse = function QueryExpressionParse(tokens) {
  var parsedTokens, length, i, token, lookahead, currentOperator;

  parsedTokens = [];
  length = tokens.length - 1;

  for (i = 0; i < length; i += 1) {
    token = tokens[i];

    switch (token[0]) {
    case 'COMPONENT_SELECTOR':
      break;

    case 'AND_OPERATOR':
    case 'OR_OPERATOR':
      lookahead = tokens[i + 1];

      if (lookahead[0] === 'COMPONENT_SELECTOR') {
        currentOperator = token[0];

        tokens[i + 1] = token;
        tokens[i] = token = lookahead;
      } else if (lookahead[0] === currentOperator) {
        continue;
      } else {
        currentOperator = lookahead[0];
      }
      break;

    default:
      throw new Error('ERR_INVALID_TOKEN ' + token);
    }

    parsedTokens.push(token);
  }

  parsedTokens.push(tokens[length]);

  if (parsedTokens.length === 1) {
    parsedTokens.push(['AND_OPERATOR', ' ']);
  }

  return parsedTokens;
};

QueryExpression.compile = function QueryExpressionCompile(tokens, meta) {
  var stack, i, token, node;

  stack = [];

  for (i = 0; (token = tokens[i]); i += 1) {
    switch (token[0]) {
    case 'COMPONENT_SELECTOR':
      stack.push(new ComponentSelector(token[1], meta));
      break;

    case 'AND_OPERATOR':
      if (node) stack.push(node);
      node = new AndOperator(stack);
      stack.length = 0;
      break;

    case 'OR_OPERATOR':
      if (node) stack.push(node);
      node = new OrOperator(stack);
      stack.length = 0;
      break;
    }
  }

  return node;
};

QueryExpression.prototype._onTreeStateChanged = function _queryExpressionOnTreeStateChanged(entity, state) {
  if (state) this.entities.push(entity);
  else this.entities.splice(this.entities.indexOf(entity));
};

QueryExpression.prototype.source = function queryExpressionSource(source, meta) {
  if (arguments.length === 0) {
    return this._source;
  }

  if (source !== this._source) {
    this._source = source;

    this.tree = this.compile(meta);

    while (this._listeners.length > 0) {
      this.tree.listen(this._listeners.pop());
    }
  }

  return this;
};

QueryExpression.prototype.tokenize = function queryExpressionTokenize() {
  return QueryExpression.tokenize(this._source);
};

QueryExpression.prototype.parse = function queryExpressionParse() {
  return QueryExpression.parse(this.tokenize());
};

QueryExpression.prototype.compile = function queryExpressionCompile(meta) {
  return QueryExpression.compile(this.parse(), meta);
};

QueryExpression.prototype.listen = function queryExpressionListen(listener) {
  if (this.tree) this.tree.listen(listener);
  else this._listeners.push(listener);

  return this;
};

module.exports = QueryExpression;

},{"./query-and-operator":13,"./query-component-selector":15,"./query-or-operator":18}],17:[function(require,module,exports){
'use strict';

var BaseNode;

BaseNode = require('./query-base-node');

function OperatorNode(sources) {
  var i, source;

  BaseNode.call(this, sources);

  this._masks = Object.create(null);

  this._onSourceStateChanged = this._onSourceStateChanged.bind(this);

  for (i = 0; (source = sources[i]); i += 1) {
    source.listen(this._onSourceStateChanged);
  }
}

OperatorNode.prototype = Object.create(BaseNode.prototype);

OperatorNode.prototype._onSourceStateChanged = function _operatorNodeOnSourceStateChanged(/*entity, state*/) {};

OperatorNode.prototype.state = function operatorNodeState(/*entity*/) {
  return false;
};

module.exports = OperatorNode;

},{"./query-base-node":14}],18:[function(require,module,exports){
'use strict';

var OperatorNode;

OperatorNode = require('./query-operator-node');

function OrOperator(sources) {
  OperatorNode.call(this, sources);
}

OrOperator.prototype = Object.create(OperatorNode.prototype);

OrOperator.prototype.state = function orOperatorState(entity) {
  return this._masks[entity] > 0;
};

OrOperator.prototype._onSourceStateChanged = function _orOperatorOnSourceStateChanged(entity, state) {
  if (!(entity in this._masks)) {
    this._masks[entity] = 0;
  }

  if (state) {
    if (!this.state(entity)) {
      this.emit(entity, true);
    }
    this._masks[entity] += 1;
  } else if (this.state(entity)) {
    this._masks[entity] -= 1;
    if (!this.state(entity)) {
      this.emit(entity, false);
    }
  }
};

module.exports = OrOperator;

},{"./query-operator-node":17}],19:[function(require,module,exports){
'use strict';

var resolver;

resolver = require('./resolver');

function Registry() {
  this.modules = Object.create(null);
  this.components = Object.create(null);
  this.entities = Object.create(null);
  this.systems = Object.create(null);

  this._systemList = [];
  this._systemLength = 0;
}

Registry.prototype.import = function registryImport(module) {
  var length, i, storages, storage, source, dest, key;

  if (module.name in this.modules) return;

  length = module.requires.length;

  for (i = 0; i < length; i += 1) {
    if (!(module.requires[i] in this.modules)) {
      throw new Error();
    }
  }

  this.modules[module.name] = module;

  storages = ['components', 'entities', 'systems'];

  for (i = 0; (storage = storages[i]); i += 1) {
    source = module[storage];
    dest = this[storage];

    for (key in source) {
      if(storage === 'systems'){
        this._systemList.push(key +' from '+module.name);
        ++this._systemLength;
      }
      dest[key] = source[key];
    }
  }
};

Registry.prototype.clear = function registryClear() {
  var storages, i, storage, source, key;

  storages = ['modules', 'components', 'entities', 'systems'];

  for (i = 0; (storage = storages[i]); i += 1) {
    source = this[storage];

    for (key in source) {
      delete source[key];
    }
  }
};

Registry.prototype.module = function registryModule(name) {
  var module;

  module = this.modules[name];

  if (module) return module;

  throw new Error();
};

Registry.prototype.component = function registryComponent(name) {
  var component, moduleName;

  component = this.components[name];

  if (component) return component;

  if ((moduleName = resolver.module(name))) {
    return this.module(moduleName).component(resolver.name(name));
  }

  throw new Error();
};

Registry.prototype.entity = function registryEntity(name) {
  var entity, moduleName;

  entity = this.entities[name];

  if (entity) return entity;

  if ((moduleName = resolver.module(name))) {
    return this.module(moduleName).entity(resolver.name(name));
  }

  throw new Error();
};

Registry.prototype.system = function registrySystem(name) {
  var system, moduleName;

  system = this.systems[name];

  if (system) return system;
  
  if ((moduleName = resolver.module(name))) {
    return this.module(moduleName).system(resolver.name(name));
  }

  throw new Error();
};

module.exports = Registry;

},{"./resolver":20}],20:[function(require,module,exports){
'use strict';

var resolver, rValidPath;

module.exports = resolver = {};
rValidPath = /^([^\s]+)((?:\s+from\s+([^\s]+))?(?:\s+as\s+([^\s]+))?)$/;

resolver.validate = function resolverValidate(path) {
  if (!rValidPath.test(path)) {
    throw new Error();
  }
};

resolver.name = function resolverName(path, value) {
  this.validate(path);

  if (arguments.length === 1) {
    return RegExp.$1 || path;
  }

  return RegExp.$2 && value + RegExp.$2 || value;
};

resolver.alias = function resolverAlias(path, value) {
  this.validate(path);

  if (arguments.length === 1) {
    return RegExp.$4 || '';
  }

  return RegExp.$1 + (RegExp.$3 ? ' from ' + RegExp.$3 : '') + ' as ' + value;
};

resolver.module = function resolverModule(path, value) {
  this.validate(path);

  if (arguments.length === 1) {
    return RegExp.$3 || '';
  }

  return RegExp.$1 + ' from ' + value + (RegExp.$4 ? ' as ' + RegExp.$4 : '');
};

resolver.identity = function resolverIdentity(path) {
  this.validate(path);

  if (RegExp.$1 && RegExp.$3) {
    return RegExp.$1 + ' from ' + RegExp.$3;
  }

  throw new Error();
};

},{}],21:[function(require,module,exports){
'use strict';

function Scheduler(msPerUpdate, extrapolation) {
  var self = this;

  self.msPerUpdate = msPerUpdate || 0;
  self.extrapolation = extrapolation || false;

  self.lag = 0;
  self.previous = 0;

  self.listen();
}

Scheduler.prototype.run = function schedulerRun(callback) {
  var current = Date.now();
  var elapsed = current - this.previous;
  this.previous = current;
  this.lag += elapsed;
  if (this.msPerUpdate > 0) {
    while (this.lag >= this.msPerUpdate) {
      callback(1);
      this.lag -= this.msPerUpdate;
    }
    if (this.extrapolation) {
      callback(this.lag / elapsed);
      this.lag = 0;
    }
  } else {
    callback(1);
  }
};

Scheduler.prototype.start = function schedulerInit() {
  this.previous = Date.now();
};

Scheduler.prototype.listen = function schedulerListen(){
  var self = this;

  window.addEventListener('focus', function () {
    self.start();
  });
};

module.exports = Scheduler;

},{}],22:[function(require,module,exports){
'use strict';

var nuclearComponent = require('./nuclear.component'),
    nuclearSystem = require('./nuclear.system'),
    nuclearEvents = require('./nuclear.events'),
    nuclearQuery = require('./nuclear.query'),
    resolver = require('./resolver'),
    Scheduler = require('./scheduler'),
    registry = require('./nuclear.registry');

/**
 * The System constructor
 * @param {string} name       The System name
 * @param {array} components The System required components
 * @param {function} definition The System definition
 * @param {object} options    The System options
 */
function System(name, components, definition, moduleName, options) {
  options = options || {};

  this.name = name;
  this.definition = definition;

  this.components = components.map(resolver.identity, resolver);
  this.aliases = components.map(function (path) {
    return resolver.alias(path) || resolver.name(path);
  });
  this.moduleName = moduleName;

  this._sorterManager = Object.create({
    comparator: function () {},
    toDeferred: false
  });

  this._componentPacks = Object.create(null);

  this._priority = 0;

  this._scheduler = new Scheduler(options.msPerUpdate, options.extrapolation);
  this._scheduler.start();
  this._schedulerCallback = systemSchedulerCallback.bind(this);
  
  if (options.disable !== undefined) {
    systemDisableSystems(this, options.disable);
  }

  systemListen(this);
  systemGenerateQuery(this);
}

/**
 * Check if an entity is runnable by the system
 * @param  {number} entity The selected entity
 * @return {null/object}   Return null if the entity isn't runnable, return its components in other case
 */
System.prototype.check = function SystemDefinitionCheck(entity) {
  return (this._componentPacks[entity] !== undefined);
};

/**
 * Run the system on all the entities
 * @return {System} Return the System itself
 */
System.prototype.run = function SystemRun() {
  var self = this;

  nuclearEvents.trigger('system:before:' + self.identity(), self.entities, self._componentPacks, self.name, self.moduleName);

  if (self._autosortComparator !== null) {
    self.entities.sort(self._autosortComparator);
  }

  self._scheduler.run(this._schedulerCallback);

  nuclearEvents.trigger('system:after:' + self.identity(), self.entities, self._componentPacks, self.name, self.moduleName);

  return self;
};

/**
 * Run the system on the selected entity
 * @param  {number} entity The selected entity
 * @return {System} Return the System itself
 */
System.prototype.once = function(entity){
  var self = this;

  if (this.entities.indexOf(entity) !== -1) {
    var componentPack = self._componentPacks[entity],
        toReturn;
    nuclearEvents.trigger('system:before:' + self.identity(), entity, componentPack, self.name, self.moduleName);
    toReturn = systemRunEntity(self, entity, componentPack);
    nuclearEvents.trigger('system:after:' + self.identity(), entity, componentPack, self.name, self.moduleName);
    return toReturn;
  }
  return false;
};

/**
 * Sort the internal entity list of the system
 * @param  {function} comparator The sorting function
 * @return {System}    The System itself
 */
System.prototype.sort = function SystemSort(comparator) {
  this._sorterManager.comparator = comparator;
  this._sorterManager.toDeferred = true;

  return this;
};

/**
 * Define an autosort compartor which will sort the System
 * at each frame
 * @param  {function} comparator The sorting function
 * @return {System}    The System itself
 */
System.prototype.autosort = function SystemAutoSort(comparator) {
  if (arguments.length === 0) {
    return this._autosortComparator;
  }

  this._autosortComparator = comparator;

  return this;
};

/**
 * Return the System's identity
 * It containes it's name and it's module's name
 * @return {String}    The System identity
 */
System.prototype.identity = function SystemIdentity(){
  return this.name+' from '+this.moduleName;
};

/**
 * Aliases this System with the alias param
 * @return {System}    The System
 */
System.prototype.alias = function nuclearEntityAlias(alias){
  registry.components[alias] = this;
  return this;
};

function systemGenerateQuery(self){
  var query, i, component;

  query = '';
  for(i = 0; i < self.components.length; i++){
    component = self.components[i];
    query += component;

    if(i !== self.components.length-1){
      query += ' ';
    }
  }
  self.query = nuclearQuery.live(query);
  self.entities = self.query.entities;
  self.query.listen(systemQueryUpdate.bind(self));
}

function systemQueryUpdate(entity, state){
  /*jshint validthis:true */
  if(state){
    this.componentPacks[entity] = systemGeneratePack(this, entity);
  }
  else{
    delete this.componentPacks[entity];
  }
}

function systemGeneratePack(self, entity){
  var i, component, componentPack;

  for (i = self.components.length - 1; i >= 0; i--) {
    component = nuclearComponent(self.components[i]).of(entity);
    if (component === undefined) return null;
    componentPack[self.components[i]] = component;
  }

  return componentPack;
}

function systemListen(self){
  var eventsOptions = {
    context: self
  };

  nuclearEvents.on('system:after_running', function () {
    if (self._sorterManager.toDeferred) {
      self.entities.sort(self._sorterManager.comparator);
      self._sorterManager.toDeferred = false;
    }
  }, eventsOptions);
}

function systemSchedulerCallback(deltaTime){
  /*jshint validthis:true */
  var length = this.entities.length;
  for (var i = 0; i < length; i++) {
    systemRunEntity(this, this.entities[i], this._componentPacks[this.entities[i]], deltaTime);
  }
}

function systemRunEntity(self, entity, componentPack, deltaTime) {
  return self.definition(entity, componentPack, nuclearSystem.context(), deltaTime);
}

function systemDisableSystems(self, systems) {
  for (var i = 0; i < systems.length; i++) {
    nuclearSystem.disable(systems[i]);
  }
}

module.exports = System;
},{"./nuclear.component":7,"./nuclear.events":9,"./nuclear.query":10,"./nuclear.registry":11,"./nuclear.system":12,"./resolver":20,"./scheduler":21}],23:[function(require,module,exports){
'use strict';

var nuclear, watchers, pool;

nuclear = require('./core/index');
watchers = require('./modules/core.watchers');

pool = require('./pool');

nuclear.import([watchers]);

window.nuclear = nuclear;

window.Pool = pool.Pool;
window.FixedPool = pool.FixedPool;

},{"./core/index":5,"./modules/core.watchers":24,"./pool":29}],24:[function(require,module,exports){
'use strict';

var nuclear, WatcherComponent, watchSystem;

nuclear = require('./../../core/index');
WatcherComponent = require('./watcher-component');
watchSystem = require('./watch-system');

module.exports = nuclear.module('core.watchers', [])
  .component('watcher', function (e) {
    return new WatcherComponent(e);
  })
  .system('watch', ['watchers'], watchSystem);

},{"./../../core/index":5,"./watch-system":25,"./watcher-component":26}],25:[function(require,module,exports){
'use strict';

function watchSystem(e) {
  /*jshint validthis: true*/
  var records, path, record, value;

  records = this.watcher.records;

  for (path in records) {
    record = records[path];
    value = record.getter(e);

    if (value !== record.old) {
      record.listener(value, record.old);
    }

    record.old = value;
  }
}

module.exports = watchSystem;

},{}],26:[function(require,module,exports){
'use strict';

var nuclear;

nuclear = require('./../../core/index');

function WatcherComponent(id) {
  this.entity = id;
  this.records = Object.create(null);
}

WatcherComponent.prototype.watch = function watcherComponentWatch(path, listener) {
  var paths;

  if (typeof path === 'string') {
    this._watch(path, listener);
  } else {
    paths = path;
    for (path in paths) {
      this._watch(path, paths[path]);
    }
  }
};

WatcherComponent.prototype._watch = function _watcherComponentWatch(path, listener) {
  var getter, setter, value, record;

  if (path in this.records) {
    throw new Error('A watcher is already defined for the ' + path + ' path');
  }

  getter = compileGetter(path);
  setter = compileSetter(path);

  value = getter(this.entity);

  record = {
    path: path,
    listener: listener,
    getter: getter,
    setter: setter,
    old: value
  };

  this.records[path] = record;
};

function compileGetter(path) {
  var getter, fragments;

  getter = compileGetter.cache[path];

  if (!getter) {
    fragments = path.split('.');

    compileGetter[path] = getter = new Function('n', 'return function compiledGetter(e) {' +
        'return n.component("' + fragments.shift() + '").of(e).' + fragments.join('.') +
      '}'
    )(nuclear);
  }

  return getter;
}

compileGetter.cache = Object.create(null);

function compileSetter(path) {
  var setter, fragments;

  setter = compileSetter.cache[path];

  if (!setter) {
    fragments = path.split('.');

    compileSetter.cache[path] = setter = new Function('n', 'return function compiledSetter(e,v) {' +
        'return n.component("' + fragments.shift() + '").of(e).' + fragments.join('.') + '=v' +
      '}'
    )(nuclear);
  }

  return setter;
}

compileSetter.cache = Object.create(null);

WatcherComponent.prototype.unwatch = function watcherComponentUnwatch(path) {
  var paths;

  if (arguments.length === 0) {
    this.records = {};
  } else if (typeof path === 'string') {
    this._unwatch(path);
  } else {
    paths = path;
    for (path in paths) {
      this._unwatch(path);
    }
  }
};

WatcherComponent.prototype._unwatch = function _watcherComponentUnwatch(path) {
  var record;

  record = this.records[path];

  if (record) {
    delete this.records[path];
  } else {
    throw new Error('There is no watcher defined for the ' + path + ' path');
  }
};

module.exports = WatcherComponent;

},{"./../../core/index":5}],27:[function(require,module,exports){
'use strict';

function FixedPool(factory, options) {
  var i;

  this._pool = [];

  this._defered = [];

  if (arguments.length === 2) {
    if ('size' in options) this._size = options.size;
    else this._size = FixedPool.defaults.size;
  } else {
    this._size = FixedPool.defaults.size;
  }

  for (i = 0; i < this._size; i += 1) {
    this._pool.push(factory());
  }
}


FixedPool.prototype.create = function fixedPoolCreate() {
  var instance;

  if (this._size > 0) {
    instance = this._pool[--this._size];

    this._pool[this._size] = null;

    return instance;
  }
};

FixedPool.prototype.defer = function fixedPoolDefer(callback) {
  var instance;

  if (this._size > 0) {
    instance = this._pool[--this._size];

    this._pool[this._size] = null;

    (setImmediate || setTimeout)(function () {
      callback(instance);
    }, 0);
  } else {
    this._defered.push(callback);
  }
};

FixedPool.prototype.release = function fixedPoolRelease(instance) {
  if (this._defered.length > 0) {
    this._defered.shift()(instance);
  } else {
    this._pool[this._size++] = instance;
  }
};

FixedPool.prototype.size = function fixedPoolSize() {
  return this._pool.length;
};

FixedPool.prototype.freeSize = function fixedPoolFreeSize() {
  return this._size;
};

FixedPool.prototype.allocatedSize = function fixedPoolAllocatedSize() {
  return this._pool.length - this._size;
};


FixedPool.defaults = {
  size: 100
};


module.exports = FixedPool;

},{}],28:[function(require,module,exports){
'use strict';

function Pool(factory, options) {
  this._factory = factory;

  this._pool = [];

  this._defered = [];

  if (arguments.length === 2) {
    if ('size' in options) this._size = options.size;
    else this._size = Pool.defaults.size;

    if ('growth' in options) this.growth = options.growth;
    else this.growth = Pool.defaults.growth;

    if ('threshold' in options) this.threshold = options.threshold;
    else this.threshold = Pool.defaults.threshold;
  } else {
    options = Pool.defaults;

    this._size = options.size;

    this.growth = options.growth;
    this.threshold = options.threshold;
  }

  this.allocate(this._size);
}


Pool.prototype.create = function poolCreate() {
  if (this._pool.length < this.threshold) {
    this.allocate(this.growth);
  }

  return this._pool.pop();
};

Pool.prototype.defer = function poolDefer(callback) {
  var instance;

  if (this._pool.length > 0) {
    instance = this._pool.pop();
    (setImmediate || setTimeout)(function () {
      callback(instance);
    }, 0);
  } else {
    this._defered.push(callback);
  }
};

Pool.prototype.allocate = function poolAllocate(count) {
  var i;

  for (i = 0; i < count; i += 1) {
    this._pool.push(this._factory());
  }

  this._size += count;
};

Pool.prototype.release = function poolRelease(instance) {
  if (this._defered.length > 0) {
    this._defered.shift()(instance);
  } else {
    this._pool.push(instance);
  }
};

Pool.prototype.size = function poolSize() {
  return this._size;
};

Pool.prototype.freeSize = function poolFreeSize() {
  return this._pool.length;
};

Pool.prototype.allocatedSize = function poolAllocatedSize() {
  return this._size - this._pool.length;
};


Pool.defaults = {
  size: 100,
  growth: 1,
  threshold: 1
};


module.exports = Pool;

},{}],29:[function(require,module,exports){
'use strict';

exports.Pool = require('./Pool');
exports.FixedPool = require('./FixedPool');

},{"./FixedPool":27,"./Pool":28}]},{},[23])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMva2wwdGwvZGV2L251Y2xlYXIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvbnVjbGVhci9saWIvZXZlbnRzLWVtaXR0ZXIubWluLmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9udWNsZWFyL3NyYy9jb3JlL2NvbXBvbmVudC5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvbnVjbGVhci9zcmMvY29yZS9lbnRpdHktaWQtZ2VuZXJhdG9yLmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9udWNsZWFyL3NyYy9jb3JlL2VudGl0eS5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvbnVjbGVhci9zcmMvY29yZS9pbmRleC5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvbnVjbGVhci9zcmMvY29yZS9tb2R1bGUuanMiLCIvVXNlcnMva2wwdGwvZGV2L251Y2xlYXIvc3JjL2NvcmUvbnVjbGVhci5jb21wb25lbnQuanMiLCIvVXNlcnMva2wwdGwvZGV2L251Y2xlYXIvc3JjL2NvcmUvbnVjbGVhci5lbnRpdHkuanMiLCIvVXNlcnMva2wwdGwvZGV2L251Y2xlYXIvc3JjL2NvcmUvbnVjbGVhci5ldmVudHMuanMiLCIvVXNlcnMva2wwdGwvZGV2L251Y2xlYXIvc3JjL2NvcmUvbnVjbGVhci5xdWVyeS5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvbnVjbGVhci9zcmMvY29yZS9udWNsZWFyLnJlZ2lzdHJ5LmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9udWNsZWFyL3NyYy9jb3JlL251Y2xlYXIuc3lzdGVtLmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9udWNsZWFyL3NyYy9jb3JlL3F1ZXJ5LWFuZC1vcGVyYXRvci5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvbnVjbGVhci9zcmMvY29yZS9xdWVyeS1iYXNlLW5vZGUuanMiLCIvVXNlcnMva2wwdGwvZGV2L251Y2xlYXIvc3JjL2NvcmUvcXVlcnktY29tcG9uZW50LXNlbGVjdG9yLmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9udWNsZWFyL3NyYy9jb3JlL3F1ZXJ5LWV4cHJlc3Npb24uanMiLCIvVXNlcnMva2wwdGwvZGV2L251Y2xlYXIvc3JjL2NvcmUvcXVlcnktb3BlcmF0b3Itbm9kZS5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvbnVjbGVhci9zcmMvY29yZS9xdWVyeS1vci1vcGVyYXRvci5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvbnVjbGVhci9zcmMvY29yZS9yZWdpc3RyeS5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvbnVjbGVhci9zcmMvY29yZS9yZXNvbHZlci5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvbnVjbGVhci9zcmMvY29yZS9zY2hlZHVsZXIuanMiLCIvVXNlcnMva2wwdGwvZGV2L251Y2xlYXIvc3JjL2NvcmUvc3lzdGVtLmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9udWNsZWFyL3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9rbDB0bC9kZXYvbnVjbGVhci9zcmMvbW9kdWxlcy9jb3JlLndhdGNoZXJzL2luZGV4LmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9udWNsZWFyL3NyYy9tb2R1bGVzL2NvcmUud2F0Y2hlcnMvd2F0Y2gtc3lzdGVtLmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9udWNsZWFyL3NyYy9tb2R1bGVzL2NvcmUud2F0Y2hlcnMvd2F0Y2hlci1jb21wb25lbnQuanMiLCIvVXNlcnMva2wwdGwvZGV2L251Y2xlYXIvc3JjL3Bvb2wvRml4ZWRQb29sLmpzIiwiL1VzZXJzL2tsMHRsL2Rldi9udWNsZWFyL3NyYy9wb29sL1Bvb2wuanMiLCIvVXNlcnMva2wwdGwvZGV2L251Y2xlYXIvc3JjL3Bvb2wvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBldmVudHMtZW1pdHRlciAzMC0xMi0yMDEzICovXHJcbiFmdW5jdGlvbihhLGIpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoZnVuY3Rpb24oKXtyZXR1cm4gYihhKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9YihhKTpcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyYmZXhwb3J0cz9leHBvcnRzLkV2ZW50c0VtaXR0ZXI9YihhKTphLkV2ZW50c0VtaXR0ZXI9YihhKX0odGhpcyxmdW5jdGlvbihhKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBiKCl7fWZ1bmN0aW9uIGMoYixjLGQsZSxmKXt2YXIgaT1oO2grPTEsXCJfbGlzdGVuZXJzXCJpbiBifHwoYi5fbGlzdGVuZXJzPXtjYWxsYmFja3M6T2JqZWN0LmNyZWF0ZShudWxsKSxjb250ZXh0czpPYmplY3QuY3JlYXRlKG51bGwpLHRpbWVzOk9iamVjdC5jcmVhdGUobnVsbCl9KSxcIl9ldmVudHNcImluIGJ8fChiLl9ldmVudHM9T2JqZWN0LmNyZWF0ZShudWxsKSksYi5fbGlzdGVuZXJzLmNhbGxiYWNrc1tpXT1kLGIuX2xpc3RlbmVycy5jb250ZXh0c1tpXT1lLDU9PT1hcmd1bWVudHMubGVuZ3RoJiYoYi5fbGlzdGVuZXJzLnRpbWVzW2ldPWYpLFwiX21lbW9yaWVzXCJpbiBiJiZBcnJheS5pc0FycmF5KGIuX21lbW9yaWVzW2NdKSYmKGEuc2V0SW1tZWRpYXRlfHxhLnNldFRpbWVvdXQpKGZ1bmN0aW9uKCl7ZyhiLGksYi5fbWVtb3JpZXNbY10pfSwwKTt2YXIgaj1iLl9ldmVudHNbY107cmV0dXJuXCJudW1iZXJcIj09dHlwZW9mIGo/Yi5fZXZlbnRzW2NdPVtqLGldOkFycmF5LmlzQXJyYXkoaik/ai5wdXNoKGkpOmIuX2V2ZW50c1tjXT1pLGl9ZnVuY3Rpb24gZChhLGIsYyl7dmFyIGQ9KGEuX2xpc3RlbmVycy5jYWxsYmFja3MsYS5fZXZlbnRzW2JdKTtpZihcIm51bWJlclwiPT10eXBlb2YgZClmKGEsZCk7ZWxzZSBpZihBcnJheS5pc0FycmF5KGQpKWZvcih2YXIgZT1kLmxlbmd0aCxnPTA7ZT5nO2crPTEpe3ZhciBoPWRbZ107ZihhLGgpfWN8fGRlbGV0ZSBhLl9ldmVudHNbYl19ZnVuY3Rpb24gZShhLGIsYyl7dmFyIGQ9YS5fbGlzdGVuZXJzLmNhbGxiYWNrcyxlPWEuX2V2ZW50c1tiXTtpZihcIm51bWJlclwiPT10eXBlb2YgZSllIGluIGR8fChmKGEsZSksZGVsZXRlIGEuX2V2ZW50c1tiXSk7ZWxzZSBpZihBcnJheS5pc0FycmF5KGUpKXtmb3IodmFyIGc9ZS5sZW5ndGgsaD0wO2c+aDtoKz0xKXt2YXIgaT1lW2hdO2kgaW4gZHx8KGYoYSxpKSxlLnNwbGljZShoLDEpLGctPTEsaC09MSl9MCE9PWd8fGN8fGRlbGV0ZSBhLl9ldmVudHNbYl19fWZ1bmN0aW9uIGYoYSxiKXtkZWxldGUgYS5fbGlzdGVuZXJzLmNhbGxiYWNrc1tiXSxkZWxldGUgYS5fbGlzdGVuZXJzLmNvbnRleHRzW2JdLGRlbGV0ZSBhLl9saXN0ZW5lcnMudGltZXNbYl19ZnVuY3Rpb24gZyhiLGMsZCl7aWYoYyBpbiBiLl9saXN0ZW5lcnMuY2FsbGJhY2tzKXt2YXIgZT1iLl9saXN0ZW5lcnMuY2FsbGJhY2tzW2NdLGc9Yi5fbGlzdGVuZXJzLmNvbnRleHRzW2NdfHxhO3N3aXRjaChjIGluIGIuX2xpc3RlbmVycy50aW1lcyYmKGIuX2xpc3RlbmVycy50aW1lc1tjXS09MSxiLl9saXN0ZW5lcnMudGltZXNbY108MSYmZihiLGMpKSxkLmxlbmd0aCl7Y2FzZSAwOnJldHVybiBlLmNhbGwoZyk7Y2FzZSAxOnJldHVybiBlLmNhbGwoZyxkWzBdKTtjYXNlIDI6cmV0dXJuIGUuY2FsbChnLGRbMF0sZFsxXSk7Y2FzZSAzOnJldHVybiBlLmNhbGwoZyxkWzBdLGRbMV0sZFsyXSk7ZGVmYXVsdDpyZXR1cm4gZS5hcHBseShnLGQpfX19dmFyIGg9MTtyZXR1cm4gYi5wcm90b3R5cGUub249ZnVuY3Rpb24oYixkLGUpe3JldHVybiAzPT09YXJndW1lbnRzLmxlbmd0aD9cInRpbWVzXCJpbiBlP2UudGltZXM8MT8wOmModGhpcyxiLGQsZS5jb250ZXh0fHxhLGUudGltZXMpOmModGhpcyxiLGQsZS5jb250ZXh0fHxhKTpjKHRoaXMsYixkLGEpfSxiLnByb3RvdHlwZS5vbmNlPWZ1bmN0aW9uKGIsZCxlKXtyZXR1cm4gMz09PWFyZ3VtZW50cy5sZW5ndGg/Yyh0aGlzLGIsZCxlLmNvbnRleHR8fGEsMSk6Yyh0aGlzLGIsZCxhLDEpfSxiLnByb3RvdHlwZS5vZmY9ZnVuY3Rpb24oYSl7cmV0dXJuXCJfbGlzdGVuZXJzXCJpbiB0aGlzJiZhIGluIHRoaXMuX2xpc3RlbmVycy5jYWxsYmFja3M/KGRlbGV0ZSB0aGlzLl9saXN0ZW5lcnMuY2FsbGJhY2tzW2FdLGRlbGV0ZSB0aGlzLl9saXN0ZW5lcnMuY29udGV4dHNbYV0sZGVsZXRlIHRoaXMuX2xpc3RlbmVycy50aW1lc1thXSwhMCk6ITF9LGIucHJvdG90eXBlLmNsZWFyPWZ1bmN0aW9uKGEsYil7aWYoXCJfbGlzdGVuZXJzXCJpbiB0aGlzJiZcIl9ldmVudHNcImluIHRoaXMpe3ZhciBjLGY7c3dpdGNoKGFyZ3VtZW50cy5sZW5ndGgpe2Nhc2UgMDpmb3IoYSBpbiB0aGlzLl9ldmVudHMpZCh0aGlzLGEsITEpO2JyZWFrO2Nhc2UgMTppZihcInN0cmluZ1wiPT10eXBlb2YgYSlkKHRoaXMsYSwhMSk7ZWxzZSBpZihBcnJheS5pc0FycmF5KGEpKWZvcihmPWEubGVuZ3RoO2YtLTspZCh0aGlzLGFbZl0sITEpO2Vsc2V7Yj1hLGM9Yi5zb2Z0fHwhMTtmb3IoYSBpbiB0aGlzLl9ldmVudHMpYi5naG9zdHM/ZSh0aGlzLGEsYyk6ZCh0aGlzLGEsYyl9YnJlYWs7Y2FzZSAyOmlmKGM9Yi5zb2Z0fHwhMSxcInN0cmluZ1wiPT10eXBlb2YgYSliLmdob3N0cz9lKHRoaXMsYSxjKTpkKHRoaXMsYSxjKTtlbHNlIGlmKEFycmF5LmlzQXJyYXkoYSkpZm9yKGY9YS5sZW5ndGg7Zi0tOyliLmdob3N0cz9lKHRoaXMsYVtmXSxjKTpkKHRoaXMsYVtmXSxjKX19fSxiLnByb3RvdHlwZS5saXN0ZW5lcnM9ZnVuY3Rpb24oYSl7dmFyIGI9W107aWYoIShcIl9saXN0ZW5lcnNcImluIHRoaXMmJlwiX2V2ZW50c1wiaW4gdGhpcykpcmV0dXJuIGI7dmFyIGM9dGhpcy5fbGlzdGVuZXJzLmNhbGxiYWNrcyxkPXRoaXMuX2V2ZW50c1thXTtpZihcIm51bWJlclwiPT10eXBlb2YgZClkIGluIGM/Yi5wdXNoKGNbZF0pOmYodGhpcyxkKTtlbHNlIGlmKEFycmF5LmlzQXJyYXkoZCkpZm9yKHZhciBlPWQubGVuZ3RoLGc9MDtlPmc7Zys9MSl7dmFyIGg9ZFtnXTtoIGluIGM/Yi5wdXNoKGNbaF0pOmYodGhpcyxoKX1yZXR1cm4gYn0sYi5wcm90b3R5cGUucmVtZW1iZXI9ZnVuY3Rpb24oYSl7aWYoXCJfbWVtb3JpZXNcImluIHRoaXN8fCh0aGlzLl9tZW1vcmllcz1PYmplY3QuY3JlYXRlKG51bGwpKSxBcnJheS5pc0FycmF5KGEpKWZvcih2YXIgYj1hLmxlbmd0aDtiLS07KXRoaXMuX21lbW9yaWVzW2FbYl1dPW51bGw7ZWxzZSB0aGlzLl9tZW1vcmllc1thXT1udWxsfSxiLnByb3RvdHlwZS5mb3JnZXQ9ZnVuY3Rpb24oYSl7aWYoXCJfbWVtb3JpZXNcImluIHRoaXMpaWYoQXJyYXkuaXNBcnJheShhKSlmb3IodmFyIGI9YS5sZW5ndGg7Yi0tOylkZWxldGUgdGhpcy5fbWVtb3JpZXNbYVtiXV07ZWxzZSBkZWxldGUgdGhpcy5fbWVtb3JpZXNbYV19LGIucHJvdG90eXBlLnRyaWdnZXI9ZnVuY3Rpb24oYSl7dmFyIGI9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLDEpO2lmKFwiX21lbW9yaWVzXCJpbiB0aGlzJiZhIGluIHRoaXMuX21lbW9yaWVzJiYodGhpcy5fbWVtb3JpZXNbYV09YiksIShcIl9saXN0ZW5lcnNcImluIHRoaXMmJlwiX2V2ZW50c1wiaW4gdGhpcykpcmV0dXJuITE7dmFyIGM9dGhpcy5fZXZlbnRzW2FdO2lmKFwibnVtYmVyXCI9PXR5cGVvZiBjKWcodGhpcyxjLGIpO2Vsc2V7aWYoIUFycmF5LmlzQXJyYXkoYykpcmV0dXJuITE7Zm9yKHZhciBkPWMubGVuZ3RoLGU9MDtkPmU7ZSs9MSl7dmFyIGY9Y1tlXTtnKHRoaXMsZixiKX19cmV0dXJuITB9LGIubWl4aW5zPWZ1bmN0aW9uKGEpe3ZhciBjPWIucHJvdG90eXBlO2Zvcih2YXIgZCBpbiBjKWFbZF09Y1tkXTtyZXR1cm4gYX0sYi5taXhpbnMoYiksYn0pOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIG51Y2xlYXJFdmVudHMgPSByZXF1aXJlKCcuL251Y2xlYXIuZXZlbnRzJyksXG4gICAgcmVnaXN0cnkgPSByZXF1aXJlKCcuL251Y2xlYXIucmVnaXN0cnknKTtcblxuLyoqXG4gKiBDb21wb25lbnQgY29uc3RydWN0b3JcbiAqIFRoaXMgaXMgdGhlIGNvbXBvbmVudHMgZmFjdG9yeVxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgICAgICAgVGhlIGNvbXBvbmVudCBuYW1lXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBkZWZpbml0aW9uIFRoZSBjb21wb25lbnQgZnVuY3Rpb24gd2hpY2ggaGFzIHRvIHJldHVybiBpdHMgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gQ29tcG9uZW50KG5hbWUsIGRlZmluaXRpb24sIG1vZHVsZU5hbWUpIHtcbiAgdGhpcy5uYW1lID0gbmFtZTtcbiAgdGhpcy5kZWZpbml0aW9uID0gZGVmaW5pdGlvbjtcblxuICB0aGlzLl9jb21wb25lbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgdGhpcy5fZGlzYWJsZWRDb21wb25lbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICB0aGlzLm1vZHVsZU5hbWUgPSBtb2R1bGVOYW1lO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgY29tcG9uZW50IG9mIHRoZSB3YW50ZWQgZW50aXR5IGlmIGl0IGhhcyBhIGNvbXBvbmVudCBvZiB0aGlzIGZhY3RvcnlcbiAqIElmIHRoZSBvcHRpb25zIGtleSAncmVxdWlyZWQnIGlzIHRydWUsIHRoZSBtZXRob2QgdGhyb3cgYW4gZXJyb3IgaWYgdGhlIGVudGl0eSBoYXNuJ3QgdGhlIGNvbXBvbmVudFxuICogSWYgdGhlIG9wdGlvbnMga2V5ICdhZGQnIGlzIHRydWUsIHRoZSBtZXRob2QgYWRkIHRoZSBjb21wb25lbnQgdG8gdGhlIGVudGl0eSBhbmQgcmV0dXJuIGl0XG4gKiBAcGFyYW0gIHtudW1iZXJ9IGVudGl0eSAgVGhlIGVudGl0eSB3aGljaCBoYXMgdGhlIGNvbXBvbmVudFxuICogQHBhcmFtICB7b2JqZWN0fSBvcHRpb25zIFRoZSBtZXRob2Qgb3B0aW9uc1xuICogQHJldHVybiB7b2JqZWN0L3VuZGVmaW5lZH0gICAgICAgICBSZXR1cm4gdGhlIGNvbXBvbmVudCBpZiB0aGUgZW50aXR5IGhhcyBpdCwgaWYgaXQgaGFzbid0LFxuICogcmV0dXJuIHVuZGVmaW5lZCBpZiB0aCByZXF1aXJlZCBrZXkgaXMgZmFsc2VcbiAqL1xuQ29tcG9uZW50LnByb3RvdHlwZS5vZiA9IGZ1bmN0aW9uIENvbXBvbmVudE9mKGVudGl0eSwgb3B0aW9ucykge1xuICB2YXIgY29tcG9uZW50ID0gdGhpcy5fY29tcG9uZW50c1tlbnRpdHldIHx8IHRoaXMuX2Rpc2FibGVkQ29tcG9uZW50c1tlbnRpdHldO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgaWYgKCF0aGlzLmluKGVudGl0eSkpIHtcbiAgICAgIGlmIChvcHRpb25zLnJlcXVpcmVkKSB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgIGVsc2UgaWYgKG9wdGlvbnMuYWRkKSBjb21wb25lbnQgPSB0aGlzLmFkZChlbnRpdHkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb21wb25lbnQ7XG59O1xuXG4vKipcbiAqIFRlc3QgaWYgYW4gZW50aXR5IGhhcyB0aGUgY29tcG9uZW50IG9mIHRoaXMgZmFjdG9yeVxuICogQHBhcmFtICB7bnVtYmVyfSBlbnRpdHkgVGhlIGVudGl0eSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSAgICAgICAgVHJ1ZSBpZiB0aGUgZW50aXR5IGhhcyBpdCwgZmFscyBpZiBpdCBoYXNuJ3RcbiAqL1xuQ29tcG9uZW50LnByb3RvdHlwZS5pbiA9IGZ1bmN0aW9uIENvbXBvbmVudEluKGVudGl0eSkge1xuICByZXR1cm4gZW50aXR5IGluIHRoaXMuX2NvbXBvbmVudHMgfHwgZW50aXR5IGluIHRoaXMuX2Rpc2FibGVkQ29tcG9uZW50cztcbn07XG5cbi8qKlxuICogVGhlIG1ldGhvZCB0byBhZGQgYSBjb21wb25lbnQgdG8gYW4gZXhpc3RpbmcgZW50aXR5XG4gKiBBbGwgdGhlIGFyZ3VtZW50cyBhZnRlciB0aGUgZW50aXR5IG9uZSB3aWxsIGJlIHBhc3NlZCB0byB0aGUgY29tcG9uZW50IGRlZmluaXRpb24gY2FsbFxuICogVGhlIGNvbXBvbmVudCBjcmVhdGlvbiB0cmlnZ2VycyBhICdhZGQ6J2NvbXBvbmVudE5hbWUgZXZlbnQgb24gdGhlIGNvbXBvbmVudCBwYXJ0IG9mIGNvcmVcbiAqIEBwYXJhbSB7bnVtYmVyfSBlbnRpdHkgVGhlIGVudGl0eSB3aGljaCB3aWxsIGdldCB0aGUgbmV3IGNvbXBvbmVudFxuICogQHJldHVybiB7b2JqZWN0fSAgICAgICBUaGUgY3JlYXRlZCBjb21wb25lbnRcbiAqL1xuQ29tcG9uZW50LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiBDb21wb25lbnRBZGQoZW50aXR5KSB7XG4gIGlmICh0aGlzLiBpbiAoZW50aXR5KSkgdGhyb3cgbmV3IEVycm9yKCk7XG5cbiAgdmFyIGNvbXBvbmVudCA9IHRoaXMuZGVmaW5pdGlvbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gIHRoaXMuX2NvbXBvbmVudHNbZW50aXR5XSA9IGNvbXBvbmVudDtcblxuICBudWNsZWFyRXZlbnRzLnRyaWdnZXIoJ2NvbXBvbmVudDphZGQ6JyArIHRoaXMuaWRlbnRpdHkoKSwgZW50aXR5LCB0aGlzLm5hbWUsIHRoaXMubW9kdWxlTmFtZSk7XG4gIG51Y2xlYXJFdmVudHMudHJpZ2dlcignY29tcG9uZW50OmFkZCcsIGVudGl0eSwgdGhpcy5pZGVudGl0eSgpLCB0aGlzLm5hbWUsIHRoaXMubW9kdWxlTmFtZSk7XG5cbiAgcmV0dXJuIGNvbXBvbmVudDtcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBjb21wb25lbnQgb2YgdGhpcyBmYWN0b3J5IHRvIHRoZSBzZWxlY3RlZCBlbnRpdHlcbiAqIFRoZSBjb21wb25lbnQgZGVzdHJ1Y3Rpb24gdHJpZ2dlcnMgYSAncmVtb3ZlOidDb21wb25lbnROYW1lIGV2ZW50IG9uIHRoZSBjb21wb25lbnQgcGFydCBvZiBjb3JlXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGVudGl0eSBUaGUgZW50aXR5IHdoaWNoIHdpbGwgbG9zdCB0aGUgY29tcG9uZW50XG4gKiBAcmV0dXJuIHtib29sZWFufSAgICAgICAgUmV0dXJuIGZhbHNlIGlmIHRoZSBlbnRpdHkgaGFzbid0IHRoZSBjb21wb25lbnQsIHRydWUgaW4gb3RoZXIgY2FzZVxuICovXG5Db21wb25lbnQucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIENvbXBvbmVudFJlbW92ZShlbnRpdHkpIHtcbiAgaWYgKCF0aGlzLiBpbiAoZW50aXR5KSkgcmV0dXJuIGZhbHNlO1xuXG4gIGRlbGV0ZSB0aGlzLl9jb21wb25lbnRzW2VudGl0eV07XG4gIGRlbGV0ZSB0aGlzLl9kaXNhYmxlZENvbXBvbmVudHNbZW50aXR5XTtcblxuICBudWNsZWFyRXZlbnRzLnRyaWdnZXIoJ2NvbXBvbmVudDpyZW1vdmU6JyArIHRoaXMuaWRlbnRpdHkoKSwgZW50aXR5LCB0aGlzLm5hbWUsIHRoaXMubW9kdWxlTmFtZSk7XG4gIG51Y2xlYXJFdmVudHMudHJpZ2dlcignY29tcG9uZW50OnJlbW92ZScsIGVudGl0eSwgdGhpcy5pZGVudGl0eSgpLCB0aGlzLm5hbWUsIHRoaXMubW9kdWxlTmFtZSk7XG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBTaGFyZSBhbiBhdHRhY2hlZCBjb21wb25lbnQgdG8gb25lIG9yIHNldmVyYWwgZW50aXR5KGllcylcbiAqIEBwYXJhbSAge251bWJlcn0gc291cmNlIFRoZSBzb3VyY2UgZW50aXR5LCBvd25pbmcgdGhlIGNvbXBvbmVudCB0byBzaGFyZVxuICogQHBhcmFtICB7bnVtYmVyL2FycmF5fSBkZXN0ICAgVGhlIHNlbGVjdGVkIGVudGl0eShpZXMpXG4gKiBAcmV0dXJuIHtvYmplY3QvbnVsbH0gICAgICAgIElmIHRoZSBzb3VyY2UgaGFzIHRoZSBjb21wb25lbnQsIGl0IHJldHVybnMgaXQsIGluIG90aGVyIGNhc2UsIGl0IHJldHVybnMgbnVsbFxuICovXG5Db21wb25lbnQucHJvdG90eXBlLnNoYXJlID0gZnVuY3Rpb24gQ29tcG9uZW50U2hhcmUoc291cmNlLCBkZXN0KSB7XG4gIGlmICghdGhpcy4gaW4gKHNvdXJjZSkpIHJldHVybiBudWxsO1xuXG4gIHZhciBjb21wb25lbnQgPSB0aGlzLm9mKHNvdXJjZSk7XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkoZGVzdCkpIHtcbiAgICB2YXIgaTtcbiAgICBmb3IgKGkgPSBkZXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaSAtPSAxKSB7XG4gICAgICB0aGlzLl9jb21wb25lbnRzW2Rlc3RbaV1dID0gY29tcG9uZW50O1xuICAgICAgbnVjbGVhckV2ZW50cy50cmlnZ2VyKCdjb21wb25lbnQ6YWRkOicgKyB0aGlzLmlkZW50aXR5KCksIGRlc3RbaV0sIHRoaXMubmFtZSwgdGhpcy5tb2R1bGVOYW1lKTtcbiAgICAgIG51Y2xlYXJFdmVudHMudHJpZ2dlcignY29tcG9uZW50OmFkZCcsIGRlc3RbaV0sIHRoaXMuaWRlbnRpdHkoKSwgdGhpcy5uYW1lLCB0aGlzLm1vZHVsZU5hbWUpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9jb21wb25lbnRzW2Rlc3RdID0gY29tcG9uZW50O1xuICAgIG51Y2xlYXJFdmVudHMudHJpZ2dlcignY29tcG9uZW50OmFkZDonICsgdGhpcy5pZGVudGl0eSgpLCBkZXN0LCB0aGlzLm5hbWUsIHRoaXMubW9kdWxlTmFtZSk7XG4gICAgbnVjbGVhckV2ZW50cy50cmlnZ2VyKCdjb21wb25lbnQ6YWRkJywgZGVzdCwgdGhpcy5pZGVudGl0eSgpLCB0aGlzLm5hbWUsIHRoaXMubW9kdWxlTmFtZSk7XG4gIH1cblxuICByZXR1cm4gY29tcG9uZW50O1xufTtcblxuLyoqXG4gKiBEaXNhYmxlIHRoZSBjb21wb25lbnQgb2YgdGhlIHNlbGVjdGVkIGVudGl0eVxuICogQHBhcmFtICB7bnVtYmVyfSBpZCBUaGUgc2VsZWN0ZWQgZW50aXR5XG4gKiBAcmV0dXJuIHtib29sZWFufSAgICBJZiB0aGUgZW50aXR5IG93bnMgdGhlIGNvbXBvbmVudCBhbmQgaXQgaXMgZW5hYmxlZCwgaXQgcmV0dXJucyB0cnVlLCBpbiBvdGhlciBjYXNlLCBpdCByZXR1cm5zIGZhbHNlXG4gKi9cbkNvbXBvbmVudC5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uIENvbXBvbmVudERpc2FibGUoaWQpIHtcbiAgaWYgKGlkIGluIHRoaXMuX2NvbXBvbmVudHMpIHtcbiAgICB0aGlzLl9kaXNhYmxlZENvbXBvbmVudHNbaWRdID0gdGhpcy5fY29tcG9uZW50c1tpZF07XG4gICAgZGVsZXRlIHRoaXMuX2NvbXBvbmVudHNbaWRdO1xuXG4gICAgbnVjbGVhckV2ZW50cy50cmlnZ2VyKCdjb21wb25lbnQ6ZGlzYWJsZTonICsgdGhpcy5pZGVudGl0eSgpLCBpZCwgdGhpcy5uYW1lLCB0aGlzLm1vZHVsZU5hbWUpO1xuICAgIG51Y2xlYXJFdmVudHMudHJpZ2dlcignY29tcG9uZW50OmRpc2FibGUnLCBpZCwgdGhpcy5pZGVudGl0eSgpLCB0aGlzLm5hbWUsIHRoaXMubW9kdWxlTmFtZSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIEVuYWJsZSB0aGUgY29tcG9uZW50IG9mIHRoZSBzZWxlY3RlZCBlbnRpdHlcbiAqIEBwYXJhbSAge251bWJlcn0gaWQgVGhlIHNlbGVjdGVkIGVudGl0eVxuICogQHJldHVybiB7Ym9vbGVhbn0gICAgSWYgdGhlIGVudGl0eSBvd25zIHRoZSBjb21wb25lbnQgYW5kIGl0IGlzIGRpc2FibGVkLCBpdCByZXR1cm5zIHRydWUsIGluIG90aGVyIGNhc2UsIGl0IHJldHVybnMgZmFsc2VcbiAqL1xuQ29tcG9uZW50LnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbiBDb21wb25lbnRFbmFibGUoaWQpIHtcbiAgaWYgKGlkIGluIHRoaXMuX2Rpc2FibGVkQ29tcG9uZW50cykge1xuICAgIHRoaXMuX2NvbXBvbmVudHNbaWRdID0gdGhpcy5fZGlzYWJsZWRDb21wb25lbnRzW2lkXTtcbiAgICBkZWxldGUgdGhpcy5fZGlzYWJsZWRDb21wb25lbnRzW2lkXTtcblxuICAgIG51Y2xlYXJFdmVudHMudHJpZ2dlcignY29tcG9uZW50OmVuYWJsZTonICsgdGhpcy5pZGVudGl0eSgpLCBpZCwgdGhpcy5uYW1lLCB0aGlzLm1vZHVsZU5hbWUpO1xuICAgIG51Y2xlYXJFdmVudHMudHJpZ2dlcignY29tcG9uZW50OmVuYWJsZScsIGlkLCB0aGlzLmlkZW50aXR5KCksIHRoaXMubmFtZSwgdGhpcy5tb2R1bGVOYW1lKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogVGVzdCBpZiB0aGUgY29tcG9uZW50IG9mIHRoZSBzZWxlY3RlZCBlbnRpdHkgaXMgZW5hYmxlZCBvciBub3RcbiAqIEBwYXJhbSAge251bWJlcn0gIGlkIFRoZSBzZWxlY3RlZCBlbnRpdHlcbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgIFRydWUgaWYgaXQncyBlbmFibGVkLCBmYWxzZSBpbiBvdGhlciBjYXNlXG4gKi9cbkNvbXBvbmVudC5wcm90b3R5cGUuaXNFbmFibGVkID0gZnVuY3Rpb24gQ29tcG9uZW50SXNFbmFibGVkKGlkKSB7XG4gIGlmICh0aGlzLiBpbiAoaWQpKSB7XG4gICAgaWYgKGlkIGluIHRoaXMuX2NvbXBvbmVudHMpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcigpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIENvbXBvbmVudCdzIGlkZW50aXR5XG4gKiBJdCBjb250YWluZXMgaXQncyBuYW1lIGFuZCBpdCdzIG1vZHVsZSdzIG5hbWVcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgVGhlIGNvbXBvbmVudCBpZGVudGl0eVxuICovXG5Db21wb25lbnQucHJvdG90eXBlLmlkZW50aXR5ID0gZnVuY3Rpb24gQ29tcG9uZW50SWRlbnRpdHkoKXtcbiAgcmV0dXJuIHRoaXMubmFtZSsnIGZyb20gJyt0aGlzLm1vZHVsZU5hbWU7XG59O1xuXG4vKipcbiAqIEFsaWFzZXMgdGhpcyBDb21wb25lbnQgd2l0aCB0aGUgYWxpYXMgcGFyYW1cbiAqIEByZXR1cm4ge0NvbXBvbmVudH0gICAgVGhlIENvbXBvbmVudFxuICovXG5Db21wb25lbnQucHJvdG90eXBlLmFsaWFzID0gZnVuY3Rpb24gbnVjbGVhckVudGl0eUFsaWFzKGFsaWFzKXtcbiAgcmVnaXN0cnkuY29tcG9uZW50c1thbGlhc10gPSB0aGlzO1xuICByZXR1cm4gdGhpcztcbn07XG5tb2R1bGUuZXhwb3J0cyA9IENvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gRW50aXR5SWRHZW5lcmF0b3Ioc2VlZCkge1xuICB0aGlzLl9zZWVkID0gc2VlZCB8fCAwO1xuICB0aGlzLl92YWx1ZSA9IHRoaXMuX3NlZWQ7XG59XG5cbkVudGl0eUlkR2VuZXJhdG9yLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gZW50aXR5SWRHZW5lcmF0b3JOZXh0KCkge1xuICByZXR1cm4gKHRoaXMuX3ZhbHVlICs9IDEpO1xufTtcblxuRW50aXR5SWRHZW5lcmF0b3IucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gZW50aXR5SWRHZW5lcmF0b3JSZXNldCgpIHtcbiAgdGhpcy5fdmFsdWUgPSB0aGlzLl9zZWVkO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEVudGl0eUlkR2VuZXJhdG9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRW50aXR5SWRHZW5lcmF0b3IsIGVudGl0eUlkR2VuZXJhdG9yLCBudWNsZWFyRXZlbnRzLCByZWdpc3RyeTtcblxuRW50aXR5SWRHZW5lcmF0b3IgPSByZXF1aXJlKCcuL2VudGl0eS1pZC1nZW5lcmF0b3InKTtcbmVudGl0eUlkR2VuZXJhdG9yID0gbmV3IEVudGl0eUlkR2VuZXJhdG9yKCk7XG5udWNsZWFyRXZlbnRzID0gcmVxdWlyZSgnLi9udWNsZWFyLmV2ZW50cycpO1xucmVnaXN0cnkgPSByZXF1aXJlKCcuL251Y2xlYXIucmVnaXN0cnknKTtcblxuLyoqXG4gKiBUaGUgRW50aXR5IGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAgIFRoZSBFbnRpdHkgbmFtZVxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgRW50aXR5IGNvbmZpZ1xuICovXG5mdW5jdGlvbiBFbnRpdHkobmFtZSwgZGVmaW5pdGlvbiwgbW9kdWxlTmFtZSkge1xuICB0aGlzLm5hbWUgPSBuYW1lO1xuICB0aGlzLmRlZmluaXRpb24gPSBkZWZpbml0aW9uIHx8IGZ1bmN0aW9uIGRlZmF1bHREZWZpbml0aW9uKCl7fTtcblxuICB0aGlzLm1vZHVsZU5hbWUgPSBtb2R1bGVOYW1lO1xufVxuXG5FbnRpdHkubmV4dCA9IGZ1bmN0aW9uIGVudGl0eU5leHQoKSB7XG4gIHJldHVybiBlbnRpdHlJZEdlbmVyYXRvci5uZXh0KCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZSBhbiBlbnRpdHkgZGVwZW5kaW5nIG9uIHRoaXMgRW50aXR5XG4gKiBAcGFyYW0gIHtvYmplY3R9IG9wdGlvbnMgQWxsIHRoZSBjb21wb25lbnRzIGRhdGFcbiAqIEByZXR1cm4ge251bWJlcn0gICAgICAgICBUaGUgY3JlYXRlZCBlbnRpdHlcbiAqL1xuRW50aXR5LnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbiBlbnRpdHlDcmVhdGUob3B0aW9ucykge1xuICB2YXIgaWQgPSBFbnRpdHkubmV4dCgpO1xuICB0aGlzLmRlZmluaXRpb24oaWQsIG9wdGlvbnMpO1xuXG4gIG51Y2xlYXJFdmVudHMudHJpZ2dlcignZW50aXR5OmNyZWF0ZTonICsgdGhpcy5pZGVudGl0eSgpLCBpZCwgdGhpcy5uYW1lLCB0aGlzLm1vZHVsZU5hbWUpO1xuICBudWNsZWFyRXZlbnRzLnRyaWdnZXIoJ2VudGl0eTpjcmVhdGVfZW50aXR5JywgaWQsIHRoaXMuaWRlbnRpdHkoKSwgdGhpcy5uYW1lLCB0aGlzLm1vZHVsZU5hbWUpO1xuXG4gIHJldHVybiBpZDtcbn07XG5cbi8qKlxuICogRW5oYW5jZSBhbiBlbnRpdHkgd2l0aCB0aGlzIGZhY3RvcnkgZGVmaW5pdGlvblxuICogQHBhcmFtICB7bnVtYmVyfSBlbnRpdHkgVGhlIGVudGl0eSB0byBlbmhhbmNlXG4gKiBAcGFyYW0gIHtvYmplY3R9IGRhdGEgRGF0YSB0byBjb25maWd1cmUgY29tcG9uZW50c1xuICogQHJldHVybiB7bnVtYmVyfSAgICAgICAgICAgIFRoZSBlbnRpdHkgdG8gZW5oYW5jZVxuICovXG5FbnRpdHkucHJvdG90eXBlLmVuaGFuY2UgPSBmdW5jdGlvbiBlbnRpdHlFbmhhbmNlKGVudGl0eSwgZGF0YSkge1xuICB0aGlzLmRlZmluaXRpb24oZW50aXR5LCBkYXRhKTtcblxuICByZXR1cm4gZW50aXR5O1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIEVudGl0eSdzIGlkZW50aXR5XG4gKiBJdCBjb250YWlucyBpdCdzIG5hbWUgYW5kIGl0J3MgbW9kdWxlJ3MgbmFtZVxuICogQHJldHVybiB7U3RyaW5nfSAgICBUaGUgRW50aXR5IGlkZW50aXR5XG4gKi9cbkVudGl0eS5wcm90b3R5cGUuaWRlbnRpdHkgPSBmdW5jdGlvbiBlbnRpdHlJZGVudGl0eSgpe1xuICByZXR1cm4gdGhpcy5uYW1lKycgZnJvbSAnK3RoaXMubW9kdWxlTmFtZTtcbn07XG5cbi8qKlxuICogQWxpYXNlcyB0aGlzIEVudGl0eSB3aXRoIHRoZSBhbGlhcyBwYXJhbVxuICogQHJldHVybiB7RW50aXR5fSAgICBUaGUgRW50aXR5XG4gKi9cbkVudGl0eS5wcm90b3R5cGUuYWxpYXMgPSBmdW5jdGlvbiBudWNsZWFyRW50aXR5QWxpYXMoYWxpYXMpe1xuICByZWdpc3RyeS5lbnRpdGllc1thbGlhc10gPSB0aGlzO1xuICByZXR1cm4gdGhpcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRW50aXR5O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbnVjbGVhciwgTW9kdWxlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG51Y2xlYXIgPSB7fTtcblxuTW9kdWxlID0gcmVxdWlyZSgnLi9tb2R1bGUnKTtcblxubnVjbGVhci5ldmVudHMgICAgPSByZXF1aXJlKCcuL251Y2xlYXIuZXZlbnRzJyk7XG5udWNsZWFyLnJlZ2lzdHJ5ICA9IHJlcXVpcmUoJy4vbnVjbGVhci5yZWdpc3RyeScpO1xubnVjbGVhci5jb21wb25lbnQgPSByZXF1aXJlKCcuL251Y2xlYXIuY29tcG9uZW50Jyk7XG5udWNsZWFyLmVudGl0eSAgICA9IHJlcXVpcmUoJy4vbnVjbGVhci5lbnRpdHknKTtcbm51Y2xlYXIuc3lzdGVtICAgID0gcmVxdWlyZSgnLi9udWNsZWFyLnN5c3RlbScpO1xubnVjbGVhci5xdWVyeSAgICAgPSByZXF1aXJlKCcuL251Y2xlYXIucXVlcnknKTtcblxubnVjbGVhci5tb2R1bGUgPSBmdW5jdGlvbiBudWNsZWFyTW9kdWxlKG5hbWUsIGRlcHMpIHtcbiAgdmFyIG1vZHVsZTtcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5Lm1vZHVsZShuYW1lKTtcbiAgfVxuXG4gIG1vZHVsZSA9IG5ldyBNb2R1bGUobmFtZSwgZGVwcyk7XG5cbiAgcmV0dXJuIG1vZHVsZTtcbn07XG5cbm51Y2xlYXIuaW1wb3J0ID0gZnVuY3Rpb24gbnVjbGVhckltcG9ydChtb2R1bGVzKSB7XG4gIHZhciBpLCBsZW5ndGg7XG5cbiAgbGVuZ3RoID0gbW9kdWxlcy5sZW5ndGg7XG5cbiAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgdGhpcy5yZWdpc3RyeS5pbXBvcnQobW9kdWxlc1tpXSk7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQsIEVudGl0eSwgU3lzdGVtLCByZXNvbHZlcjtcblxuQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnQnKTtcbkVudGl0eSA9IHJlcXVpcmUoJy4vZW50aXR5Jyk7XG5TeXN0ZW0gPSByZXF1aXJlKCcuL3N5c3RlbScpO1xucmVzb2x2ZXIgPSByZXF1aXJlKCcuL3Jlc29sdmVyJyk7XG5cbmZ1bmN0aW9uIE1vZHVsZShuYW1lLCBkZXBzKSB7XG4gIHRoaXMubmFtZSA9IG5hbWUudHJpbSgpO1xuICB0aGlzLnJlcXVpcmVzID0gZGVwcztcblxuICB0aGlzLmNvbXBvbmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB0aGlzLmVudGl0aWVzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgdGhpcy5zeXN0ZW1zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICB0aGlzLl9jb25maWcgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xufVxuXG5Nb2R1bGUucHJvdG90eXBlLmNvbmZpZyA9IGZ1bmN0aW9uIG1vZHVsZUNvbmZpZyhjb25maWcpIHtcbiAgdmFyIGtleSwgZGVzY3JpcHRvcjtcblxuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdGhpcy5fY29uZmlnW2tleSA9IGNvbmZpZ107XG4gIH1cblxuICBmb3IgKGtleSBpbiBjb25maWcpIHtcbiAgICBkZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihjb25maWcsIGtleSk7XG4gICAgaWYgKGRlc2NyaXB0b3IpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLl9jb25maWcsIGtleSwgZGVzY3JpcHRvcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbk1vZHVsZS5wcm90b3R5cGUuY29tcG9uZW50ID0gZnVuY3Rpb24gbW9kdWxlQ29tcG9uZW50KG5hbWUsIGZhY3RvcnkpIHtcbiAgdmFyIGNvbXBvbmVudDtcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIGNvbXBvbmVudCA9IHRoaXMuY29tcG9uZW50c1tuYW1lXTtcblxuICAgIGlmIChjb21wb25lbnQpIHJldHVybiBjb21wb25lbnQ7XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgfVxuXG4gIGlmIChuYW1lIGluIHRoaXMuY29tcG9uZW50cykge1xuICAgIHRocm93IG5ldyBFcnJvcigpO1xuICB9XG5cbiAgdGhpcy5jb21wb25lbnRzW25hbWVdID0gbmV3IENvbXBvbmVudChuYW1lLCBmYWN0b3J5LCB0aGlzLm5hbWUpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuTW9kdWxlLnByb3RvdHlwZS5lbnRpdHkgPSBmdW5jdGlvbiBtb2R1bGVFbnRpdHkobmFtZSwgZmFjdG9yeSkge1xuICB2YXIgZW50aXR5O1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgZW50aXR5ID0gdGhpcy5lbnRpdGllc1tuYW1lXTtcblxuICAgIGlmIChlbnRpdHkpIHJldHVybiBlbnRpdHk7XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgfVxuXG4gIGlmIChuYW1lIGluIHRoaXMuZW50aXRpZXMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgfVxuXG4gIHRoaXMuZW50aXRpZXNbbmFtZV0gPSBuZXcgRW50aXR5KG5hbWUsIGZhY3RvcnksIHRoaXMubmFtZSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Nb2R1bGUucHJvdG90eXBlLnN5c3RlbSA9IGZ1bmN0aW9uIG1vZHVsZVN5c3RlbShuYW1lLCBjb21wb25lbnRzLCBkZWZpbml0aW9uLCBvcHRpb25zKSB7XG4gIHZhciBzeXN0ZW0sIGksIGxlbmd0aCwgY29tcG9uZW50O1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgc3lzdGVtID0gdGhpcy5zeXN0ZW1zW25hbWVdO1xuXG4gICAgaWYgKHN5c3RlbSkgcmV0dXJuIHN5c3RlbTtcblxuICAgIHRocm93IG5ldyBFcnJvcigpO1xuICB9XG5cbiAgaWYgKG5hbWUgaW4gdGhpcy5zeXN0ZW1zKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gIH1cblxuICBsZW5ndGggPSBjb21wb25lbnRzLmxlbmd0aDtcblxuICBmb3IoaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgIGNvbXBvbmVudCA9IGNvbXBvbmVudHNbaV07XG5cbiAgICBpZiAocmVzb2x2ZXIubW9kdWxlKGNvbXBvbmVudCkgPT09ICcnKSB7XG4gICAgICBjb21wb25lbnRzW2ldID0gcmVzb2x2ZXIubW9kdWxlKGNvbXBvbmVudCwgdGhpcy5uYW1lKTtcbiAgICB9XG4gIH1cblxuICB0aGlzLnN5c3RlbXNbbmFtZV0gPSBuZXcgU3lzdGVtKG5hbWUsIGNvbXBvbmVudHMsIGRlZmluaXRpb24sIHRoaXMubmFtZSwgb3B0aW9ucyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi9udWNsZWFyLnJlZ2lzdHJ5JyksXG4gICAgbnVjbGVhckV2ZW50cyA9IHJlcXVpcmUoJy4vbnVjbGVhci5ldmVudHMnKSxcbiAgICBlbnRpdHlMaXN0ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuLyoqXG4gKiBUaGUgbnVjbGVhckNvbXBvbmVudCBtZXRob2Qgd2hpY2ggY29udGFpbnMgYWxsIENvbXBvbmVudCBkZWZpbml0aW9uXG4gKiBUaGlzIGlzIGFsc28gdGhlIG51Y2xlYXJDb21wb25lbnRzIGRlZmluaXRpb24gZ2V0dGVyICh0aHJvd3MgYW4gZXJyb3IgaWYgdGhlIENvbXBvbmVudCBkb2Vzbid0IGV4aXN0KVxuICogQHBhcmFtICB7c3RyaW5nfSBuYW1lIFRoZSBDb21wb25lbnQgbmFtZVxuICogQHJldHVybiB7b2JqZWN0fSAgICAgIFRoZSBzZWxlY3RlZCBDb21wb25lbnRcbiAqL1xuZnVuY3Rpb24gbnVjbGVhckNvbXBvbmVudChuYW1lKSB7XG4gIHJldHVybiByZWdpc3RyeS5jb21wb25lbnQobmFtZSk7XG59XG5cbi8qKlxuICogR2V0IGFsbCB0aGUgc2VsZWN0ZWQgZW50aXR5IG51Y2xlYXJDb21wb25lbnRzXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGlkIFRoZSBzZWxlY3RlZCBlbnRpdHlcbiAqIEByZXR1cm4ge2FycmF5fSAgICBBIHNpbXBsZSBzdHJpbmcgYXJyYXkgY29udGFpbmluZyBhbGwgdGhlIG51Y2xlYXJDb21wb25lbnRzIG5hbWVzIG9mIHRoZSBzZWxlY3RlZCBlbnRpdHlcbiAqL1xubnVjbGVhckNvbXBvbmVudC5hbGwgPSBmdW5jdGlvbiBudWNsZWFyQ29tcG9uZW50T2YoaWQpIHtcbiAgaWYgKGVudGl0eUxpc3RbaWRdKSByZXR1cm4gZW50aXR5TGlzdFtpZF07XG5cbiAgdGhyb3cgbmV3IEVycm9yKCk7XG59O1xuXG5mdW5jdGlvbiBsaW5rQ29tcG9uZW50KGlkLCBuYW1lKSB7XG4gIHZhciBjb21wb25lbnRzID0gZW50aXR5TGlzdFtpZF0gfHwgW107XG4gIGNvbXBvbmVudHMucHVzaChuYW1lKTtcbiAgZW50aXR5TGlzdFtpZF0gPSBjb21wb25lbnRzO1xufVxuXG5mdW5jdGlvbiB1bkxpbmtDb21wb25lbnQoaWQsIG5hbWUpIHtcbiAgdmFyIGNvbXBvbmVudHMgPSBudWNsZWFyQ29tcG9uZW50LmFsbChpZCk7XG4gIHZhciBpbmRleCA9IGNvbXBvbmVudHMuaW5kZXhPZihuYW1lKTtcblxuICBjb21wb25lbnRzLnNwbGljZShpbmRleCwgMSk7XG59XG5cbm51Y2xlYXJFdmVudHMub24oJ2NvbXBvbmVudDphZGQnLCBsaW5rQ29tcG9uZW50KTtcbm51Y2xlYXJFdmVudHMub24oJ2NvbXBvbmVudDpyZW1vdmUnLCB1bkxpbmtDb21wb25lbnQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG51Y2xlYXJDb21wb25lbnQ7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmVnaXN0cnkgPSByZXF1aXJlKCcuL251Y2xlYXIucmVnaXN0cnknKSxcbiAgICBudWNsZWFyQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9udWNsZWFyLmNvbXBvbmVudCcpLFxuICAgIEVudGl0eSA9IHJlcXVpcmUoJy4vZW50aXR5JyksXG4gICAgbnVjbGVhckV2ZW50cyA9IHJlcXVpcmUoJy4vbnVjbGVhci5ldmVudHMnKTtcblxuLyoqXG4gKiBUaGUgbnVjbGVhckVudGl0eSBtZXRob2Qgd2hpY2ggY29udGFpbnMgYWxsIGVudGl0aWVzIGRlZmluaXRpb25zXG4gKiBUaGlzIGlzIGFsc28gdGhlIG51Y2xlYXJFbnRpdHkgZGVmaW5pdGlvbiBnZXR0ZXIgKHRocm93cyBhbiBlcnJvciBpZiB0aGUgRW50aXR5IGRvZXNuJ3QgZXhpc3QpXG4gKiBAcGFyYW0gIHtzdHJpbmd9IG5hbWUgVGhlIEVudGl0eSBuYW1lXG4gKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgVGhlIHNlbGVjdGVkIEVudGl0eVxuICovXG5mdW5jdGlvbiBudWNsZWFyRW50aXR5KG5hbWUpIHtcbiAgcmV0dXJuIHJlZ2lzdHJ5LmVudGl0eShuYW1lKTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemUgdGhlIHNlbGVjdGVkIG51Y2xlYXJFbnRpdHlcbiAqIEBwYXJhbSAge251bWJlcn0gaWQgVGhlIHNlbGVjdGVkIG51Y2xlYXJFbnRpdHlcbiAqIEByZXR1cm4ge3N0cmluZ30gICAgVGhlIHNlcmlhbGl6ZWQgbnVjbGVhckVudGl0eVxuICovXG5udWNsZWFyRW50aXR5LnNlcmlhbGl6ZSA9IGZ1bmN0aW9uIG51Y2xlYXJFbnRpdHlTZXJpYWxpemUoaWQpIHtcbiAgdmFyIHNlcmlhbGl6ZWQgPSBPYmplY3QuY3JlYXRlKG51bGwpLFxuICAgIGNvbXBvbmVudHMgPSBudWNsZWFyQ29tcG9uZW50LmFsbChpZCk7IC8vY2hhbmdlIC5vZiB0byAuYWxsIGhlcmVcblxuICBzZXJpYWxpemVkLmlkID0gaWQ7XG4gIHNlcmlhbGl6ZWQub3B0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgZm9yICh2YXIgaSA9IGNvbXBvbmVudHMubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSkge1xuICAgIHZhciBuYW1lID0gY29tcG9uZW50c1tpXTtcbiAgICB2YXIgZGVmaW5pdGlvbiA9IG51Y2xlYXJDb21wb25lbnQobmFtZSk7XG4gICAgdmFyIGRhdGEgPSBkZWZpbml0aW9uLm9mKGlkKTtcblxuICAgIGlmICh0eXBlb2YgZGF0YS50b0pTT04gPT09ICdmdW5jdGlvbicpIGRhdGEgPSBkYXRhLnRvSlNPTigpO1xuICAgIHNlcmlhbGl6ZWQub3B0aW9uc1tuYW1lXSA9IGRhdGE7XG4gIH1cblxuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoc2VyaWFsaXplZCk7XG59O1xuXG4vKipcbiAqIERlc2VyaWFsaXplIGEgc2VyaWFsaXplZCBudWNsZWFyRW50aXR5XG4gKiBAcGFyYW0gIHtzdHJpbmd9IHNlcmlhbGl6ZWQgVGhlIHNlcmlhbGl6ZWQgbnVjbGVhckVudGl0eVxuICogQHJldHVybiB7bnVtYmVyfSAgICAgICAgICAgIFRoZSBjcmVhdGVkIG51Y2xlYXJFbnRpdHkgaWRcbiAqL1xubnVjbGVhckVudGl0eS5kZXNlcmlhbGl6ZSA9IGZ1bmN0aW9uIG51Y2xlYXJFbnRpdHlEZXNlcmlhbGl6ZShzZXJpYWxpemVkKSB7XG4gIHNlcmlhbGl6ZWQgPSBKU09OLnBhcnNlKHNlcmlhbGl6ZWQpO1xuICB2YXIgaWQgPSBudWNsZWFyRW50aXR5LmNyZWF0ZShzZXJpYWxpemVkLm9wdGlvbnMpO1xuXG4gIHJldHVybiBpZDtcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBzZWxlY3RlZCBudWNsZWFyRW50aXR5IGFuZCBpdHMgY29tcG9uZW50c1xuICogQHBhcmFtICB7bnVtYmVyfSBpZCBUaGUgc2VsZWN0ZWQgbnVjbGVhckVudGl0eVxuICogQHJldHVybiB7Ym9vbGVhbn0gICAgUmV0dXJuIHRydWVcbiAqL1xubnVjbGVhckVudGl0eS5yZW1vdmUgPSBmdW5jdGlvbiBudWNsZWFyRW50aXR5UmVtb3ZlKGlkKSB7XG4gIHZhciBjb21wb25lbnRzID0gbnVjbGVhckNvbXBvbmVudC5vZihpZCk7XG5cbiAgZm9yICh2YXIgaSA9IGNvbXBvbmVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpIC09IDEpIHtcbiAgICBudWNsZWFyQ29tcG9uZW50KGNvbXBvbmVudHNbaV0pLnJlbW92ZShpZCk7XG4gIH1cblxuICBudWNsZWFyRXZlbnRzLnRyaWdnZXIoJ2VudGl0eTpyZW1vdmUnLCBpZCk7XG4gIHJldHVybiB0cnVlO1xufTtcblxubnVjbGVhckVudGl0eS5jcmVhdGUgPSBmdW5jdGlvbiBudWNsZWFyRW50aXR5Q3JlYXRlKG9wdGlvbnMpe1xuICB2YXIgaWQgPSBFbnRpdHkubmV4dCgpLFxuICAgICAgaTtcbiAgZm9yKGkgaW4gb3B0aW9ucyl7XG4gICAgbnVjbGVhckNvbXBvbmVudChpKS5hZGQoaWQsIG9wdGlvbnNbaV0pO1xuICB9XG5cbiAgcmV0dXJuIGlkO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBudWNsZWFyRW50aXR5O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRXZlbnRzRW1pdHRlcjtcblxuRXZlbnRzRW1pdHRlciA9IHJlcXVpcmUoJy4uLy4uL2xpYi9ldmVudHMtZW1pdHRlci5taW4nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgRXZlbnRzRW1pdHRlcigpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUXVlcnlFeHByZXNzaW9uO1xuXG5RdWVyeUV4cHJlc3Npb24gPSByZXF1aXJlKCcuL3F1ZXJ5LWV4cHJlc3Npb24nKTtcblxuZnVuY3Rpb24gbnVjbGVhclF1ZXJ5KGV4cHJlc3Npb24sIG1ldGEpIHtcbiAgcmV0dXJuIG51Y2xlYXJRdWVyeS5saXZlKGV4cHJlc3Npb24sIG1ldGEpO1xufVxuXG5udWNsZWFyUXVlcnkucmF3ID0gZnVuY3Rpb24gbnVjbGVhclF1ZXJ5UmF3KCkge307XG5cbm51Y2xlYXJRdWVyeS5saXZlID0gZnVuY3Rpb24gbnVjbGVhclF1ZXJ5TGl2ZShleHByZXNzaW9uLCBtZXRhKSB7XG4gIHJldHVybiBuZXcgUXVlcnlFeHByZXNzaW9uKGV4cHJlc3Npb24sIG1ldGEpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBudWNsZWFyUXVlcnk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWdpc3RyeTtcblxuUmVnaXN0cnkgPSByZXF1aXJlKCcuL3JlZ2lzdHJ5Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFJlZ2lzdHJ5KCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciByZWdpc3RyeSA9IHJlcXVpcmUoJy4vbnVjbGVhci5yZWdpc3RyeScpLFxuICAgIG51Y2xlYXJFdmVudHMgPSByZXF1aXJlKCcuL251Y2xlYXIuZXZlbnRzJyksXG4gICAgY29udGV4dCA9IHt9O1xuXG4vKipcbiAqIFRoZSBudWNsZWFyU3lzdGVtIG1ldGhvZCB3aGljaCBjb250YWlucyBhbGwgbnVjbGVhclN5c3RlbSBkZWZpbml0aW9uc1xuICogVGhpcyBpcyBhbHNvIHRoZSBudWNsZWFyU3lzdGVtIGRlZmluaXRpb24gZ2V0dGVyICh0aHJvd3MgYW4gZXJyb3IgaWYgdGhlIFN5c3RlbSBkb2Vzbid0IGV4aXN0KVxuICogQHBhcmFtICB7c3RyaW5nfSBuYW1lIFRoZSBTeXN0ZW0gbmFtZVxuICogQHJldHVybiB7b2JqZWN0fSAgICAgIFRoZSBzZWxlY3RlZCBTeXN0ZW1cbiAqL1xuZnVuY3Rpb24gbnVjbGVhclN5c3RlbShuYW1lKSB7XG4gIHJldHVybiByZWdpc3RyeS5zeXN0ZW0obmFtZSk7XG59XG5cbi8qKlxuICogRGVmaW5lIHRoZSBydW4gcHJpb3JpdHkgb2YgdGhlIHNlbGVjdGVkIG51Y2xlYXJTeXN0ZW1cbiAqIEBwYXJhbSAge3N0cmluZ30gbmFtZSBUaGUgc2VsZWN0ZWQgU3lzdGVtIG5hbWVcbiAqIEBwYXJhbSAge251bWJlcn0gcHJpbyBUaGUgcHJpb3JpdHkgb2YgdGhlIG51Y2xlYXJTeXN0ZW1cbiAqL1xubnVjbGVhclN5c3RlbS5wcmlvcml0eSA9IGZ1bmN0aW9uIG51Y2xlYXJTeXN0ZW1Qcmlvcml0eShuYW1lLCBwcmlvKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIG51Y2xlYXJTeXN0ZW0obmFtZSkuX3ByaW9yaXR5O1xuICB9XG5cbiAgbnVjbGVhclN5c3RlbShuYW1lKS5fcHJpb3JpdHkgPSBwcmlvO1xuICByZWdpc3RyeS5fc3lzdGVtTGlzdC5zb3J0KG51Y2xlYXJTeXN0ZW1zUHJpb3JpdHlDb21wYXJhdG9yKTtcbn07XG5cbmZ1bmN0aW9uIG51Y2xlYXJTeXN0ZW1zUHJpb3JpdHlDb21wYXJhdG9yKGEsIGIpIHtcbiAgcmV0dXJuIGEuX3ByaW9yaXR5IC0gYi5fcHJpb3JpdHk7XG59XG5cbi8qKlxuICogUnVuIGFsbCB0aGUgbnVjbGVhclN5c3RlbSBsaXN0XG4gKi9cbm51Y2xlYXJTeXN0ZW0ucnVuID0gZnVuY3Rpb24gbnVjbGVhclN5c3RlbVJ1bigpIHtcbiAgbnVjbGVhckV2ZW50cy50cmlnZ2VyKCdzeXN0ZW06YmVmb3JlX3J1bm5pbmcnLCBudWNsZWFyU3lzdGVtLl9saXN0KTtcbiAgdmFyIHg7XG4gIGZvciAoeCA9IDA7IHggPCByZWdpc3RyeS5fc3lzdGVtTGVuZ3RoOyB4KyspIHtcbiAgICBudWNsZWFyU3lzdGVtKHJlZ2lzdHJ5Ll9zeXN0ZW1MaXN0W3hdKS5ydW4oKTtcbiAgfVxuICBudWNsZWFyRXZlbnRzLnRyaWdnZXIoJ3N5c3RlbTphZnRlcl9ydW5uaW5nJywgcmVnaXN0cnkuX3N5c3RlbUxpc3QpO1xufTtcblxuLyoqXG4gKiBEaXNhYmxlIGEgbnVjbGVhclN5c3RlbSBpbiB0aGUgbnVjbGVhclN5c3RlbSBsaXN0XG4gKiBAcGFyYW0gIHtzdHJpbmd9IG5hbWUgVGhlIFN5c3RlbSBuYW1lXG4gKi9cbm51Y2xlYXJTeXN0ZW0uZGlzYWJsZSA9IGZ1bmN0aW9uIG51Y2xlYXJTeXN0ZW1EaXNhYmxlKG5hbWUpIHtcbiAgdmFyIGluZGV4ID0gcmVnaXN0cnkuc3lzdGVtcy5pbmRleE9mKG5hbWUpO1xuICByZWdpc3RyeS5zeXN0ZW1zLnNwbGljZShpbmRleCwgMSk7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgZ2xvYmFsIHN5c3RlbXMgY29udGV4dFxuICovXG5udWNsZWFyU3lzdGVtLmNvbnRleHQgPSBmdW5jdGlvbiBudWNsZWFyU3lzdGVtQ29udGV4dCgpIHtcbiAgcmV0dXJuIGNvbnRleHQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG51Y2xlYXJTeXN0ZW07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBPcGVyYXRvck5vZGU7XG5cbk9wZXJhdG9yTm9kZSA9IHJlcXVpcmUoJy4vcXVlcnktb3BlcmF0b3Itbm9kZScpO1xuXG5mdW5jdGlvbiBBbmRPcGVyYXRvcihzb3VyY2VzKSB7XG4gIE9wZXJhdG9yTm9kZS5jYWxsKHRoaXMsIHNvdXJjZXMpO1xufVxuXG5BbmRPcGVyYXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKE9wZXJhdG9yTm9kZS5wcm90b3R5cGUpO1xuXG5BbmRPcGVyYXRvci5wcm90b3R5cGUuc3RhdGUgPSBmdW5jdGlvbiBhbmRPcGVyYXRvclN0YXRlKGVudGl0eSkge1xuICByZXR1cm4gdGhpcy5fbWFza3NbZW50aXR5XSA9PT0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7XG59O1xuXG5BbmRPcGVyYXRvci5wcm90b3R5cGUuX29uU291cmNlU3RhdGVDaGFuZ2VkID0gZnVuY3Rpb24gX2FuZE9wZXJhdG9yT25Tb3VyY2VTdGF0ZUNoYW5nZWQoZW50aXR5LCBzdGF0ZSkge1xuICBpZiAoIShlbnRpdHkgaW4gdGhpcy5fbWFza3MpKSB7XG4gICAgdGhpcy5fbWFza3NbZW50aXR5XSA9IDA7XG4gIH1cblxuICBpZiAoc3RhdGUpIHtcbiAgICB0aGlzLl9tYXNrc1tlbnRpdHldICs9IDE7XG4gICAgaWYgKHRoaXMuc3RhdGUoZW50aXR5KSkge1xuICAgICAgdGhpcy5lbWl0KGVudGl0eSwgdHJ1ZSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHRoaXMuX21hc2tzW2VudGl0eV0gPiAwKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUoZW50aXR5KSkge1xuICAgICAgdGhpcy5lbWl0KGVudGl0eSwgZmFsc2UpO1xuICAgIH1cbiAgICB0aGlzLl9tYXNrc1tlbnRpdHldIC09IDE7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQW5kT3BlcmF0b3I7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEJhc2VOb2RlKGNoaWxkcmVuKSB7XG4gIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbiA/IGNoaWxkcmVuLnNsaWNlKCkgOiBbXTtcbiAgdGhpcy5fbGlzdGVuZXJzID0gW107XG59XG5cbkJhc2VOb2RlLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gYmFzZU5vZGVFbWl0KGVudGl0eSwgc3RhdGUpIHtcbiAgdmFyIGksIGxpc3RlbmVyO1xuXG4gIGZvciAoaSA9IDA7IChsaXN0ZW5lciA9IHRoaXMuX2xpc3RlbmVyc1tpXSk7IGkgKz0gMSkge1xuICAgIGxpc3RlbmVyKGVudGl0eSwgc3RhdGUpO1xuICB9XG59O1xuXG5CYXNlTm9kZS5wcm90b3R5cGUubGlzdGVuID0gZnVuY3Rpb24gYmFzZU5vZGVMaXN0ZW4obGlzdGVuZXIpIHtcbiAgdGhpcy5fbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlTm9kZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEJhc2VOb2RlLCBudWNsZWFyRXZlbnRzO1xuXG5CYXNlTm9kZSA9IHJlcXVpcmUoJy4vcXVlcnktYmFzZS1ub2RlJyk7XG5udWNsZWFyRXZlbnRzID0gcmVxdWlyZSgnLi9udWNsZWFyLmV2ZW50cycpO1xuXG5mdW5jdGlvbiBDb21wb25lbnRTZWxlY3Rvcihjb21wb25lbnQsIG1ldGEpIHtcbiAgQmFzZU5vZGUuY2FsbCh0aGlzKTtcblxuICB0aGlzLl9vbkNvbXBvbmVudEFkZGVkID0gdGhpcy5fb25Db21wb25lbnRBZGRlZC5iaW5kKHRoaXMpO1xuICB0aGlzLl9vbkNvbXBvbmVudFJlbW92ZWQgPSB0aGlzLl9vbkNvbXBvbmVudFJlbW92ZWQuYmluZCh0aGlzKTtcblxuICBudWNsZWFyRXZlbnRzLm9uKCdjb21wb25lbnQ6YWRkOicgKyBjb21wb25lbnQsIHRoaXMuX29uQ29tcG9uZW50QWRkZWQpO1xuICBudWNsZWFyRXZlbnRzLm9uKCdjb21wb25lbnQ6cmVtb3ZlOicgKyBjb21wb25lbnQsIHRoaXMuX29uQ29tcG9uZW50UmVtb3ZlZCk7XG5cbiAgaWYgKG1ldGEgJiYgbWV0YS5lbmFibGVkKSB7XG4gICAgbnVjbGVhckV2ZW50cy5vbignY29tcG9uZW50OmVuYWJsZTonICsgY29tcG9uZW50LCB0aGlzLl9vbkNvbXBvbmVudEFkZGVkKTtcbiAgICBudWNsZWFyRXZlbnRzLm9uKCdjb21wb25lbnQ6ZGlzYWJsZTonICsgY29tcG9uZW50LCB0aGlzLl9vbkNvbXBvbmVudFJlbW92ZWQpO1xuICB9XG59XG5cbkNvbXBvbmVudFNlbGVjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZU5vZGUucHJvdG90eXBlKTtcblxuQ29tcG9uZW50U2VsZWN0b3IucHJvdG90eXBlLl9vbkNvbXBvbmVudEFkZGVkID0gZnVuY3Rpb24gX2NvbXBvbmVudFNlbGVjdG9yT25Db21wb25lbnRBZGRlZChlbnRpdHkpIHtcbiAgdGhpcy5lbWl0KGVudGl0eSwgdHJ1ZSk7XG59O1xuXG5Db21wb25lbnRTZWxlY3Rvci5wcm90b3R5cGUuX29uQ29tcG9uZW50UmVtb3ZlZCA9IGZ1bmN0aW9uIF9jb21wb25lbnRTZWxlY3Rvck9uQ29tcG9uZW50UmVtb3ZlZChlbnRpdHkpIHtcbiAgdGhpcy5lbWl0KGVudGl0eSwgZmFsc2UpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb21wb25lbnRTZWxlY3RvcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudFNlbGVjdG9yLCBBbmRPcGVyYXRvciwgT3JPcGVyYXRvcjtcblxuQ29tcG9uZW50U2VsZWN0b3IgPSByZXF1aXJlKCcuL3F1ZXJ5LWNvbXBvbmVudC1zZWxlY3RvcicpO1xuQW5kT3BlcmF0b3IgPSByZXF1aXJlKCcuL3F1ZXJ5LWFuZC1vcGVyYXRvcicpO1xuT3JPcGVyYXRvciA9IHJlcXVpcmUoJy4vcXVlcnktb3Itb3BlcmF0b3InKTtcblxuZnVuY3Rpb24gUXVlcnlFeHByZXNzaW9uKHNvdXJjZSwgbWV0YSkge1xuICB0aGlzLnRyZWUgPSBudWxsO1xuICB0aGlzLmVudGl0aWVzID0gW107XG5cbiAgdGhpcy5fc291cmNlID0gJyc7XG4gIHRoaXMuX2xpc3RlbmVycyA9IFt0aGlzLl9vblRyZWVTdGF0ZUNoYW5nZWQuYmluZCh0aGlzKV07XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgdGhpcy5zb3VyY2Uoc291cmNlLCBtZXRhKTtcbiAgfVxufVxuXG5RdWVyeUV4cHJlc3Npb24udG9rZW5pemUgPSBmdW5jdGlvbiBRdWVyeUV4cHJlc3Npb25Ub2tlbml6ZShzb3VyY2UpIHtcbiAgdmFyIHRva2VucywgaSwgY2h1bmssIG1hdGNoZXM7XG5cbiAgdG9rZW5zID0gW107XG4gIGkgPSAwO1xuXG4gIHdoaWxlIChpIDwgc291cmNlLmxlbmd0aCkge1xuICAgIGNodW5rID0gc291cmNlLnNsaWNlKGkpO1xuXG4gICAgaWYgKChtYXRjaGVzID0gY2h1bmsubWF0Y2goL15cXGJbXlxcc10rXFxiKD86XFxzK2Zyb21cXHMrW15cXHNdK1xcYik/LykpKSB7XG4gICAgICB0b2tlbnMucHVzaChbJ0NPTVBPTkVOVF9TRUxFQ1RPUicsIG1hdGNoZXNbMF1dKTtcbiAgICAgIGkgKz0gbWF0Y2hlc1swXS5sZW5ndGg7XG4gICAgfSBlbHNlIGlmICgobWF0Y2hlcyA9IGNodW5rLm1hdGNoKC9eXFxzKy8pKSkge1xuICAgICAgdG9rZW5zLnB1c2goWydBTkRfT1BFUkFUT1InLCBtYXRjaGVzWzBdXSk7XG4gICAgICBpICs9IG1hdGNoZXNbMF0ubGVuZ3RoO1xuICAgIH0gZWxzZSBpZiAoKG1hdGNoZXMgPSBjaHVuay5tYXRjaCgvXixcXHMrLykpKSB7XG4gICAgICB0b2tlbnMucHVzaChbJ09SX09QRVJBVE9SJywgbWF0Y2hlc1swXV0pO1xuICAgICAgaSArPSBtYXRjaGVzWzBdLmxlbmd0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgdG9rZW5zLnB1c2goW2NodW5rWzBdLCBjaHVua1swXV0pO1xuICAgICAgaSArPSAxO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0b2tlbnM7XG59O1xuXG5RdWVyeUV4cHJlc3Npb24ucGFyc2UgPSBmdW5jdGlvbiBRdWVyeUV4cHJlc3Npb25QYXJzZSh0b2tlbnMpIHtcbiAgdmFyIHBhcnNlZFRva2VucywgbGVuZ3RoLCBpLCB0b2tlbiwgbG9va2FoZWFkLCBjdXJyZW50T3BlcmF0b3I7XG5cbiAgcGFyc2VkVG9rZW5zID0gW107XG4gIGxlbmd0aCA9IHRva2Vucy5sZW5ndGggLSAxO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgIHRva2VuID0gdG9rZW5zW2ldO1xuXG4gICAgc3dpdGNoICh0b2tlblswXSkge1xuICAgIGNhc2UgJ0NPTVBPTkVOVF9TRUxFQ1RPUic6XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ0FORF9PUEVSQVRPUic6XG4gICAgY2FzZSAnT1JfT1BFUkFUT1InOlxuICAgICAgbG9va2FoZWFkID0gdG9rZW5zW2kgKyAxXTtcblxuICAgICAgaWYgKGxvb2thaGVhZFswXSA9PT0gJ0NPTVBPTkVOVF9TRUxFQ1RPUicpIHtcbiAgICAgICAgY3VycmVudE9wZXJhdG9yID0gdG9rZW5bMF07XG5cbiAgICAgICAgdG9rZW5zW2kgKyAxXSA9IHRva2VuO1xuICAgICAgICB0b2tlbnNbaV0gPSB0b2tlbiA9IGxvb2thaGVhZDtcbiAgICAgIH0gZWxzZSBpZiAobG9va2FoZWFkWzBdID09PSBjdXJyZW50T3BlcmF0b3IpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdXJyZW50T3BlcmF0b3IgPSBsb29rYWhlYWRbMF07XG4gICAgICB9XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VSUl9JTlZBTElEX1RPS0VOICcgKyB0b2tlbik7XG4gICAgfVxuXG4gICAgcGFyc2VkVG9rZW5zLnB1c2godG9rZW4pO1xuICB9XG5cbiAgcGFyc2VkVG9rZW5zLnB1c2godG9rZW5zW2xlbmd0aF0pO1xuXG4gIGlmIChwYXJzZWRUb2tlbnMubGVuZ3RoID09PSAxKSB7XG4gICAgcGFyc2VkVG9rZW5zLnB1c2goWydBTkRfT1BFUkFUT1InLCAnICddKTtcbiAgfVxuXG4gIHJldHVybiBwYXJzZWRUb2tlbnM7XG59O1xuXG5RdWVyeUV4cHJlc3Npb24uY29tcGlsZSA9IGZ1bmN0aW9uIFF1ZXJ5RXhwcmVzc2lvbkNvbXBpbGUodG9rZW5zLCBtZXRhKSB7XG4gIHZhciBzdGFjaywgaSwgdG9rZW4sIG5vZGU7XG5cbiAgc3RhY2sgPSBbXTtcblxuICBmb3IgKGkgPSAwOyAodG9rZW4gPSB0b2tlbnNbaV0pOyBpICs9IDEpIHtcbiAgICBzd2l0Y2ggKHRva2VuWzBdKSB7XG4gICAgY2FzZSAnQ09NUE9ORU5UX1NFTEVDVE9SJzpcbiAgICAgIHN0YWNrLnB1c2gobmV3IENvbXBvbmVudFNlbGVjdG9yKHRva2VuWzFdLCBtZXRhKSk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ0FORF9PUEVSQVRPUic6XG4gICAgICBpZiAobm9kZSkgc3RhY2sucHVzaChub2RlKTtcbiAgICAgIG5vZGUgPSBuZXcgQW5kT3BlcmF0b3Ioc3RhY2spO1xuICAgICAgc3RhY2subGVuZ3RoID0gMDtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnT1JfT1BFUkFUT1InOlxuICAgICAgaWYgKG5vZGUpIHN0YWNrLnB1c2gobm9kZSk7XG4gICAgICBub2RlID0gbmV3IE9yT3BlcmF0b3Ioc3RhY2spO1xuICAgICAgc3RhY2subGVuZ3RoID0gMDtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBub2RlO1xufTtcblxuUXVlcnlFeHByZXNzaW9uLnByb3RvdHlwZS5fb25UcmVlU3RhdGVDaGFuZ2VkID0gZnVuY3Rpb24gX3F1ZXJ5RXhwcmVzc2lvbk9uVHJlZVN0YXRlQ2hhbmdlZChlbnRpdHksIHN0YXRlKSB7XG4gIGlmIChzdGF0ZSkgdGhpcy5lbnRpdGllcy5wdXNoKGVudGl0eSk7XG4gIGVsc2UgdGhpcy5lbnRpdGllcy5zcGxpY2UodGhpcy5lbnRpdGllcy5pbmRleE9mKGVudGl0eSkpO1xufTtcblxuUXVlcnlFeHByZXNzaW9uLnByb3RvdHlwZS5zb3VyY2UgPSBmdW5jdGlvbiBxdWVyeUV4cHJlc3Npb25Tb3VyY2Uoc291cmNlLCBtZXRhKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NvdXJjZTtcbiAgfVxuXG4gIGlmIChzb3VyY2UgIT09IHRoaXMuX3NvdXJjZSkge1xuICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcblxuICAgIHRoaXMudHJlZSA9IHRoaXMuY29tcGlsZShtZXRhKTtcblxuICAgIHdoaWxlICh0aGlzLl9saXN0ZW5lcnMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy50cmVlLmxpc3Rlbih0aGlzLl9saXN0ZW5lcnMucG9wKCkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuUXVlcnlFeHByZXNzaW9uLnByb3RvdHlwZS50b2tlbml6ZSA9IGZ1bmN0aW9uIHF1ZXJ5RXhwcmVzc2lvblRva2VuaXplKCkge1xuICByZXR1cm4gUXVlcnlFeHByZXNzaW9uLnRva2VuaXplKHRoaXMuX3NvdXJjZSk7XG59O1xuXG5RdWVyeUV4cHJlc3Npb24ucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gcXVlcnlFeHByZXNzaW9uUGFyc2UoKSB7XG4gIHJldHVybiBRdWVyeUV4cHJlc3Npb24ucGFyc2UodGhpcy50b2tlbml6ZSgpKTtcbn07XG5cblF1ZXJ5RXhwcmVzc2lvbi5wcm90b3R5cGUuY29tcGlsZSA9IGZ1bmN0aW9uIHF1ZXJ5RXhwcmVzc2lvbkNvbXBpbGUobWV0YSkge1xuICByZXR1cm4gUXVlcnlFeHByZXNzaW9uLmNvbXBpbGUodGhpcy5wYXJzZSgpLCBtZXRhKTtcbn07XG5cblF1ZXJ5RXhwcmVzc2lvbi5wcm90b3R5cGUubGlzdGVuID0gZnVuY3Rpb24gcXVlcnlFeHByZXNzaW9uTGlzdGVuKGxpc3RlbmVyKSB7XG4gIGlmICh0aGlzLnRyZWUpIHRoaXMudHJlZS5saXN0ZW4obGlzdGVuZXIpO1xuICBlbHNlIHRoaXMuX2xpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUXVlcnlFeHByZXNzaW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQmFzZU5vZGU7XG5cbkJhc2VOb2RlID0gcmVxdWlyZSgnLi9xdWVyeS1iYXNlLW5vZGUnKTtcblxuZnVuY3Rpb24gT3BlcmF0b3JOb2RlKHNvdXJjZXMpIHtcbiAgdmFyIGksIHNvdXJjZTtcblxuICBCYXNlTm9kZS5jYWxsKHRoaXMsIHNvdXJjZXMpO1xuXG4gIHRoaXMuX21hc2tzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICB0aGlzLl9vblNvdXJjZVN0YXRlQ2hhbmdlZCA9IHRoaXMuX29uU291cmNlU3RhdGVDaGFuZ2VkLmJpbmQodGhpcyk7XG5cbiAgZm9yIChpID0gMDsgKHNvdXJjZSA9IHNvdXJjZXNbaV0pOyBpICs9IDEpIHtcbiAgICBzb3VyY2UubGlzdGVuKHRoaXMuX29uU291cmNlU3RhdGVDaGFuZ2VkKTtcbiAgfVxufVxuXG5PcGVyYXRvck5vZGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlTm9kZS5wcm90b3R5cGUpO1xuXG5PcGVyYXRvck5vZGUucHJvdG90eXBlLl9vblNvdXJjZVN0YXRlQ2hhbmdlZCA9IGZ1bmN0aW9uIF9vcGVyYXRvck5vZGVPblNvdXJjZVN0YXRlQ2hhbmdlZCgvKmVudGl0eSwgc3RhdGUqLykge307XG5cbk9wZXJhdG9yTm9kZS5wcm90b3R5cGUuc3RhdGUgPSBmdW5jdGlvbiBvcGVyYXRvck5vZGVTdGF0ZSgvKmVudGl0eSovKSB7XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gT3BlcmF0b3JOb2RlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgT3BlcmF0b3JOb2RlO1xuXG5PcGVyYXRvck5vZGUgPSByZXF1aXJlKCcuL3F1ZXJ5LW9wZXJhdG9yLW5vZGUnKTtcblxuZnVuY3Rpb24gT3JPcGVyYXRvcihzb3VyY2VzKSB7XG4gIE9wZXJhdG9yTm9kZS5jYWxsKHRoaXMsIHNvdXJjZXMpO1xufVxuXG5Pck9wZXJhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoT3BlcmF0b3JOb2RlLnByb3RvdHlwZSk7XG5cbk9yT3BlcmF0b3IucHJvdG90eXBlLnN0YXRlID0gZnVuY3Rpb24gb3JPcGVyYXRvclN0YXRlKGVudGl0eSkge1xuICByZXR1cm4gdGhpcy5fbWFza3NbZW50aXR5XSA+IDA7XG59O1xuXG5Pck9wZXJhdG9yLnByb3RvdHlwZS5fb25Tb3VyY2VTdGF0ZUNoYW5nZWQgPSBmdW5jdGlvbiBfb3JPcGVyYXRvck9uU291cmNlU3RhdGVDaGFuZ2VkKGVudGl0eSwgc3RhdGUpIHtcbiAgaWYgKCEoZW50aXR5IGluIHRoaXMuX21hc2tzKSkge1xuICAgIHRoaXMuX21hc2tzW2VudGl0eV0gPSAwO1xuICB9XG5cbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlKGVudGl0eSkpIHtcbiAgICAgIHRoaXMuZW1pdChlbnRpdHksIHRydWUpO1xuICAgIH1cbiAgICB0aGlzLl9tYXNrc1tlbnRpdHldICs9IDE7XG4gIH0gZWxzZSBpZiAodGhpcy5zdGF0ZShlbnRpdHkpKSB7XG4gICAgdGhpcy5fbWFza3NbZW50aXR5XSAtPSAxO1xuICAgIGlmICghdGhpcy5zdGF0ZShlbnRpdHkpKSB7XG4gICAgICB0aGlzLmVtaXQoZW50aXR5LCBmYWxzZSk7XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9yT3BlcmF0b3I7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciByZXNvbHZlcjtcblxucmVzb2x2ZXIgPSByZXF1aXJlKCcuL3Jlc29sdmVyJyk7XG5cbmZ1bmN0aW9uIFJlZ2lzdHJ5KCkge1xuICB0aGlzLm1vZHVsZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB0aGlzLmNvbXBvbmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB0aGlzLmVudGl0aWVzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgdGhpcy5zeXN0ZW1zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICB0aGlzLl9zeXN0ZW1MaXN0ID0gW107XG4gIHRoaXMuX3N5c3RlbUxlbmd0aCA9IDA7XG59XG5cblJlZ2lzdHJ5LnByb3RvdHlwZS5pbXBvcnQgPSBmdW5jdGlvbiByZWdpc3RyeUltcG9ydChtb2R1bGUpIHtcbiAgdmFyIGxlbmd0aCwgaSwgc3RvcmFnZXMsIHN0b3JhZ2UsIHNvdXJjZSwgZGVzdCwga2V5O1xuXG4gIGlmIChtb2R1bGUubmFtZSBpbiB0aGlzLm1vZHVsZXMpIHJldHVybjtcblxuICBsZW5ndGggPSBtb2R1bGUucmVxdWlyZXMubGVuZ3RoO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgIGlmICghKG1vZHVsZS5yZXF1aXJlc1tpXSBpbiB0aGlzLm1vZHVsZXMpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICB0aGlzLm1vZHVsZXNbbW9kdWxlLm5hbWVdID0gbW9kdWxlO1xuXG4gIHN0b3JhZ2VzID0gWydjb21wb25lbnRzJywgJ2VudGl0aWVzJywgJ3N5c3RlbXMnXTtcblxuICBmb3IgKGkgPSAwOyAoc3RvcmFnZSA9IHN0b3JhZ2VzW2ldKTsgaSArPSAxKSB7XG4gICAgc291cmNlID0gbW9kdWxlW3N0b3JhZ2VdO1xuICAgIGRlc3QgPSB0aGlzW3N0b3JhZ2VdO1xuXG4gICAgZm9yIChrZXkgaW4gc291cmNlKSB7XG4gICAgICBpZihzdG9yYWdlID09PSAnc3lzdGVtcycpe1xuICAgICAgICB0aGlzLl9zeXN0ZW1MaXN0LnB1c2goa2V5ICsnIGZyb20gJyttb2R1bGUubmFtZSk7XG4gICAgICAgICsrdGhpcy5fc3lzdGVtTGVuZ3RoO1xuICAgICAgfVxuICAgICAgZGVzdFtrZXldID0gc291cmNlW2tleV07XG4gICAgfVxuICB9XG59O1xuXG5SZWdpc3RyeS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiByZWdpc3RyeUNsZWFyKCkge1xuICB2YXIgc3RvcmFnZXMsIGksIHN0b3JhZ2UsIHNvdXJjZSwga2V5O1xuXG4gIHN0b3JhZ2VzID0gWydtb2R1bGVzJywgJ2NvbXBvbmVudHMnLCAnZW50aXRpZXMnLCAnc3lzdGVtcyddO1xuXG4gIGZvciAoaSA9IDA7IChzdG9yYWdlID0gc3RvcmFnZXNbaV0pOyBpICs9IDEpIHtcbiAgICBzb3VyY2UgPSB0aGlzW3N0b3JhZ2VdO1xuXG4gICAgZm9yIChrZXkgaW4gc291cmNlKSB7XG4gICAgICBkZWxldGUgc291cmNlW2tleV07XG4gICAgfVxuICB9XG59O1xuXG5SZWdpc3RyeS5wcm90b3R5cGUubW9kdWxlID0gZnVuY3Rpb24gcmVnaXN0cnlNb2R1bGUobmFtZSkge1xuICB2YXIgbW9kdWxlO1xuXG4gIG1vZHVsZSA9IHRoaXMubW9kdWxlc1tuYW1lXTtcblxuICBpZiAobW9kdWxlKSByZXR1cm4gbW9kdWxlO1xuXG4gIHRocm93IG5ldyBFcnJvcigpO1xufTtcblxuUmVnaXN0cnkucHJvdG90eXBlLmNvbXBvbmVudCA9IGZ1bmN0aW9uIHJlZ2lzdHJ5Q29tcG9uZW50KG5hbWUpIHtcbiAgdmFyIGNvbXBvbmVudCwgbW9kdWxlTmFtZTtcblxuICBjb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudHNbbmFtZV07XG5cbiAgaWYgKGNvbXBvbmVudCkgcmV0dXJuIGNvbXBvbmVudDtcblxuICBpZiAoKG1vZHVsZU5hbWUgPSByZXNvbHZlci5tb2R1bGUobmFtZSkpKSB7XG4gICAgcmV0dXJuIHRoaXMubW9kdWxlKG1vZHVsZU5hbWUpLmNvbXBvbmVudChyZXNvbHZlci5uYW1lKG5hbWUpKTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcigpO1xufTtcblxuUmVnaXN0cnkucHJvdG90eXBlLmVudGl0eSA9IGZ1bmN0aW9uIHJlZ2lzdHJ5RW50aXR5KG5hbWUpIHtcbiAgdmFyIGVudGl0eSwgbW9kdWxlTmFtZTtcblxuICBlbnRpdHkgPSB0aGlzLmVudGl0aWVzW25hbWVdO1xuXG4gIGlmIChlbnRpdHkpIHJldHVybiBlbnRpdHk7XG5cbiAgaWYgKChtb2R1bGVOYW1lID0gcmVzb2x2ZXIubW9kdWxlKG5hbWUpKSkge1xuICAgIHJldHVybiB0aGlzLm1vZHVsZShtb2R1bGVOYW1lKS5lbnRpdHkocmVzb2x2ZXIubmFtZShuYW1lKSk7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoKTtcbn07XG5cblJlZ2lzdHJ5LnByb3RvdHlwZS5zeXN0ZW0gPSBmdW5jdGlvbiByZWdpc3RyeVN5c3RlbShuYW1lKSB7XG4gIHZhciBzeXN0ZW0sIG1vZHVsZU5hbWU7XG5cbiAgc3lzdGVtID0gdGhpcy5zeXN0ZW1zW25hbWVdO1xuXG4gIGlmIChzeXN0ZW0pIHJldHVybiBzeXN0ZW07XG4gIFxuICBpZiAoKG1vZHVsZU5hbWUgPSByZXNvbHZlci5tb2R1bGUobmFtZSkpKSB7XG4gICAgcmV0dXJuIHRoaXMubW9kdWxlKG1vZHVsZU5hbWUpLnN5c3RlbShyZXNvbHZlci5uYW1lKG5hbWUpKTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcigpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWdpc3RyeTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHJlc29sdmVyLCByVmFsaWRQYXRoO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlc29sdmVyID0ge307XG5yVmFsaWRQYXRoID0gL14oW15cXHNdKykoKD86XFxzK2Zyb21cXHMrKFteXFxzXSspKT8oPzpcXHMrYXNcXHMrKFteXFxzXSspKT8pJC87XG5cbnJlc29sdmVyLnZhbGlkYXRlID0gZnVuY3Rpb24gcmVzb2x2ZXJWYWxpZGF0ZShwYXRoKSB7XG4gIGlmICghclZhbGlkUGF0aC50ZXN0KHBhdGgpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gIH1cbn07XG5cbnJlc29sdmVyLm5hbWUgPSBmdW5jdGlvbiByZXNvbHZlck5hbWUocGF0aCwgdmFsdWUpIHtcbiAgdGhpcy52YWxpZGF0ZShwYXRoKTtcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBSZWdFeHAuJDEgfHwgcGF0aDtcbiAgfVxuXG4gIHJldHVybiBSZWdFeHAuJDIgJiYgdmFsdWUgKyBSZWdFeHAuJDIgfHwgdmFsdWU7XG59O1xuXG5yZXNvbHZlci5hbGlhcyA9IGZ1bmN0aW9uIHJlc29sdmVyQWxpYXMocGF0aCwgdmFsdWUpIHtcbiAgdGhpcy52YWxpZGF0ZShwYXRoKTtcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBSZWdFeHAuJDQgfHwgJyc7XG4gIH1cblxuICByZXR1cm4gUmVnRXhwLiQxICsgKFJlZ0V4cC4kMyA/ICcgZnJvbSAnICsgUmVnRXhwLiQzIDogJycpICsgJyBhcyAnICsgdmFsdWU7XG59O1xuXG5yZXNvbHZlci5tb2R1bGUgPSBmdW5jdGlvbiByZXNvbHZlck1vZHVsZShwYXRoLCB2YWx1ZSkge1xuICB0aGlzLnZhbGlkYXRlKHBhdGgpO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIFJlZ0V4cC4kMyB8fCAnJztcbiAgfVxuXG4gIHJldHVybiBSZWdFeHAuJDEgKyAnIGZyb20gJyArIHZhbHVlICsgKFJlZ0V4cC4kNCA/ICcgYXMgJyArIFJlZ0V4cC4kNCA6ICcnKTtcbn07XG5cbnJlc29sdmVyLmlkZW50aXR5ID0gZnVuY3Rpb24gcmVzb2x2ZXJJZGVudGl0eShwYXRoKSB7XG4gIHRoaXMudmFsaWRhdGUocGF0aCk7XG5cbiAgaWYgKFJlZ0V4cC4kMSAmJiBSZWdFeHAuJDMpIHtcbiAgICByZXR1cm4gUmVnRXhwLiQxICsgJyBmcm9tICcgKyBSZWdFeHAuJDM7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFNjaGVkdWxlcihtc1BlclVwZGF0ZSwgZXh0cmFwb2xhdGlvbikge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgc2VsZi5tc1BlclVwZGF0ZSA9IG1zUGVyVXBkYXRlIHx8IDA7XG4gIHNlbGYuZXh0cmFwb2xhdGlvbiA9IGV4dHJhcG9sYXRpb24gfHwgZmFsc2U7XG5cbiAgc2VsZi5sYWcgPSAwO1xuICBzZWxmLnByZXZpb3VzID0gMDtcblxuICBzZWxmLmxpc3RlbigpO1xufVxuXG5TY2hlZHVsZXIucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uIHNjaGVkdWxlclJ1bihjYWxsYmFjaykge1xuICB2YXIgY3VycmVudCA9IERhdGUubm93KCk7XG4gIHZhciBlbGFwc2VkID0gY3VycmVudCAtIHRoaXMucHJldmlvdXM7XG4gIHRoaXMucHJldmlvdXMgPSBjdXJyZW50O1xuICB0aGlzLmxhZyArPSBlbGFwc2VkO1xuICBpZiAodGhpcy5tc1BlclVwZGF0ZSA+IDApIHtcbiAgICB3aGlsZSAodGhpcy5sYWcgPj0gdGhpcy5tc1BlclVwZGF0ZSkge1xuICAgICAgY2FsbGJhY2soMSk7XG4gICAgICB0aGlzLmxhZyAtPSB0aGlzLm1zUGVyVXBkYXRlO1xuICAgIH1cbiAgICBpZiAodGhpcy5leHRyYXBvbGF0aW9uKSB7XG4gICAgICBjYWxsYmFjayh0aGlzLmxhZyAvIGVsYXBzZWQpO1xuICAgICAgdGhpcy5sYWcgPSAwO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjYWxsYmFjaygxKTtcbiAgfVxufTtcblxuU2NoZWR1bGVyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uIHNjaGVkdWxlckluaXQoKSB7XG4gIHRoaXMucHJldmlvdXMgPSBEYXRlLm5vdygpO1xufTtcblxuU2NoZWR1bGVyLnByb3RvdHlwZS5saXN0ZW4gPSBmdW5jdGlvbiBzY2hlZHVsZXJMaXN0ZW4oKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIGZ1bmN0aW9uICgpIHtcbiAgICBzZWxmLnN0YXJ0KCk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTY2hlZHVsZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBudWNsZWFyQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9udWNsZWFyLmNvbXBvbmVudCcpLFxuICAgIG51Y2xlYXJTeXN0ZW0gPSByZXF1aXJlKCcuL251Y2xlYXIuc3lzdGVtJyksXG4gICAgbnVjbGVhckV2ZW50cyA9IHJlcXVpcmUoJy4vbnVjbGVhci5ldmVudHMnKSxcbiAgICBudWNsZWFyUXVlcnkgPSByZXF1aXJlKCcuL251Y2xlYXIucXVlcnknKSxcbiAgICByZXNvbHZlciA9IHJlcXVpcmUoJy4vcmVzb2x2ZXInKSxcbiAgICBTY2hlZHVsZXIgPSByZXF1aXJlKCcuL3NjaGVkdWxlcicpLFxuICAgIHJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi9udWNsZWFyLnJlZ2lzdHJ5Jyk7XG5cbi8qKlxuICogVGhlIFN5c3RlbSBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgICAgICAgVGhlIFN5c3RlbSBuYW1lXG4gKiBAcGFyYW0ge2FycmF5fSBjb21wb25lbnRzIFRoZSBTeXN0ZW0gcmVxdWlyZWQgY29tcG9uZW50c1xuICogQHBhcmFtIHtmdW5jdGlvbn0gZGVmaW5pdGlvbiBUaGUgU3lzdGVtIGRlZmluaXRpb25cbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zICAgIFRoZSBTeXN0ZW0gb3B0aW9uc1xuICovXG5mdW5jdGlvbiBTeXN0ZW0obmFtZSwgY29tcG9uZW50cywgZGVmaW5pdGlvbiwgbW9kdWxlTmFtZSwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICB0aGlzLm5hbWUgPSBuYW1lO1xuICB0aGlzLmRlZmluaXRpb24gPSBkZWZpbml0aW9uO1xuXG4gIHRoaXMuY29tcG9uZW50cyA9IGNvbXBvbmVudHMubWFwKHJlc29sdmVyLmlkZW50aXR5LCByZXNvbHZlcik7XG4gIHRoaXMuYWxpYXNlcyA9IGNvbXBvbmVudHMubWFwKGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgcmV0dXJuIHJlc29sdmVyLmFsaWFzKHBhdGgpIHx8IHJlc29sdmVyLm5hbWUocGF0aCk7XG4gIH0pO1xuICB0aGlzLm1vZHVsZU5hbWUgPSBtb2R1bGVOYW1lO1xuXG4gIHRoaXMuX3NvcnRlck1hbmFnZXIgPSBPYmplY3QuY3JlYXRlKHtcbiAgICBjb21wYXJhdG9yOiBmdW5jdGlvbiAoKSB7fSxcbiAgICB0b0RlZmVycmVkOiBmYWxzZVxuICB9KTtcblxuICB0aGlzLl9jb21wb25lbnRQYWNrcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgdGhpcy5fcHJpb3JpdHkgPSAwO1xuXG4gIHRoaXMuX3NjaGVkdWxlciA9IG5ldyBTY2hlZHVsZXIob3B0aW9ucy5tc1BlclVwZGF0ZSwgb3B0aW9ucy5leHRyYXBvbGF0aW9uKTtcbiAgdGhpcy5fc2NoZWR1bGVyLnN0YXJ0KCk7XG4gIHRoaXMuX3NjaGVkdWxlckNhbGxiYWNrID0gc3lzdGVtU2NoZWR1bGVyQ2FsbGJhY2suYmluZCh0aGlzKTtcbiAgXG4gIGlmIChvcHRpb25zLmRpc2FibGUgIT09IHVuZGVmaW5lZCkge1xuICAgIHN5c3RlbURpc2FibGVTeXN0ZW1zKHRoaXMsIG9wdGlvbnMuZGlzYWJsZSk7XG4gIH1cblxuICBzeXN0ZW1MaXN0ZW4odGhpcyk7XG4gIHN5c3RlbUdlbmVyYXRlUXVlcnkodGhpcyk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYW4gZW50aXR5IGlzIHJ1bm5hYmxlIGJ5IHRoZSBzeXN0ZW1cbiAqIEBwYXJhbSAge251bWJlcn0gZW50aXR5IFRoZSBzZWxlY3RlZCBlbnRpdHlcbiAqIEByZXR1cm4ge251bGwvb2JqZWN0fSAgIFJldHVybiBudWxsIGlmIHRoZSBlbnRpdHkgaXNuJ3QgcnVubmFibGUsIHJldHVybiBpdHMgY29tcG9uZW50cyBpbiBvdGhlciBjYXNlXG4gKi9cblN5c3RlbS5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbiBTeXN0ZW1EZWZpbml0aW9uQ2hlY2soZW50aXR5KSB7XG4gIHJldHVybiAodGhpcy5fY29tcG9uZW50UGFja3NbZW50aXR5XSAhPT0gdW5kZWZpbmVkKTtcbn07XG5cbi8qKlxuICogUnVuIHRoZSBzeXN0ZW0gb24gYWxsIHRoZSBlbnRpdGllc1xuICogQHJldHVybiB7U3lzdGVtfSBSZXR1cm4gdGhlIFN5c3RlbSBpdHNlbGZcbiAqL1xuU3lzdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiBTeXN0ZW1SdW4oKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBudWNsZWFyRXZlbnRzLnRyaWdnZXIoJ3N5c3RlbTpiZWZvcmU6JyArIHNlbGYuaWRlbnRpdHkoKSwgc2VsZi5lbnRpdGllcywgc2VsZi5fY29tcG9uZW50UGFja3MsIHNlbGYubmFtZSwgc2VsZi5tb2R1bGVOYW1lKTtcblxuICBpZiAoc2VsZi5fYXV0b3NvcnRDb21wYXJhdG9yICE9PSBudWxsKSB7XG4gICAgc2VsZi5lbnRpdGllcy5zb3J0KHNlbGYuX2F1dG9zb3J0Q29tcGFyYXRvcik7XG4gIH1cblxuICBzZWxmLl9zY2hlZHVsZXIucnVuKHRoaXMuX3NjaGVkdWxlckNhbGxiYWNrKTtcblxuICBudWNsZWFyRXZlbnRzLnRyaWdnZXIoJ3N5c3RlbTphZnRlcjonICsgc2VsZi5pZGVudGl0eSgpLCBzZWxmLmVudGl0aWVzLCBzZWxmLl9jb21wb25lbnRQYWNrcywgc2VsZi5uYW1lLCBzZWxmLm1vZHVsZU5hbWUpO1xuXG4gIHJldHVybiBzZWxmO1xufTtcblxuLyoqXG4gKiBSdW4gdGhlIHN5c3RlbSBvbiB0aGUgc2VsZWN0ZWQgZW50aXR5XG4gKiBAcGFyYW0gIHtudW1iZXJ9IGVudGl0eSBUaGUgc2VsZWN0ZWQgZW50aXR5XG4gKiBAcmV0dXJuIHtTeXN0ZW19IFJldHVybiB0aGUgU3lzdGVtIGl0c2VsZlxuICovXG5TeXN0ZW0ucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihlbnRpdHkpe1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgaWYgKHRoaXMuZW50aXRpZXMuaW5kZXhPZihlbnRpdHkpICE9PSAtMSkge1xuICAgIHZhciBjb21wb25lbnRQYWNrID0gc2VsZi5fY29tcG9uZW50UGFja3NbZW50aXR5XSxcbiAgICAgICAgdG9SZXR1cm47XG4gICAgbnVjbGVhckV2ZW50cy50cmlnZ2VyKCdzeXN0ZW06YmVmb3JlOicgKyBzZWxmLmlkZW50aXR5KCksIGVudGl0eSwgY29tcG9uZW50UGFjaywgc2VsZi5uYW1lLCBzZWxmLm1vZHVsZU5hbWUpO1xuICAgIHRvUmV0dXJuID0gc3lzdGVtUnVuRW50aXR5KHNlbGYsIGVudGl0eSwgY29tcG9uZW50UGFjayk7XG4gICAgbnVjbGVhckV2ZW50cy50cmlnZ2VyKCdzeXN0ZW06YWZ0ZXI6JyArIHNlbGYuaWRlbnRpdHkoKSwgZW50aXR5LCBjb21wb25lbnRQYWNrLCBzZWxmLm5hbWUsIHNlbGYubW9kdWxlTmFtZSk7XG4gICAgcmV0dXJuIHRvUmV0dXJuO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogU29ydCB0aGUgaW50ZXJuYWwgZW50aXR5IGxpc3Qgb2YgdGhlIHN5c3RlbVxuICogQHBhcmFtICB7ZnVuY3Rpb259IGNvbXBhcmF0b3IgVGhlIHNvcnRpbmcgZnVuY3Rpb25cbiAqIEByZXR1cm4ge1N5c3RlbX0gICAgVGhlIFN5c3RlbSBpdHNlbGZcbiAqL1xuU3lzdGVtLnByb3RvdHlwZS5zb3J0ID0gZnVuY3Rpb24gU3lzdGVtU29ydChjb21wYXJhdG9yKSB7XG4gIHRoaXMuX3NvcnRlck1hbmFnZXIuY29tcGFyYXRvciA9IGNvbXBhcmF0b3I7XG4gIHRoaXMuX3NvcnRlck1hbmFnZXIudG9EZWZlcnJlZCA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIERlZmluZSBhbiBhdXRvc29ydCBjb21wYXJ0b3Igd2hpY2ggd2lsbCBzb3J0IHRoZSBTeXN0ZW1cbiAqIGF0IGVhY2ggZnJhbWVcbiAqIEBwYXJhbSAge2Z1bmN0aW9ufSBjb21wYXJhdG9yIFRoZSBzb3J0aW5nIGZ1bmN0aW9uXG4gKiBAcmV0dXJuIHtTeXN0ZW19ICAgIFRoZSBTeXN0ZW0gaXRzZWxmXG4gKi9cblN5c3RlbS5wcm90b3R5cGUuYXV0b3NvcnQgPSBmdW5jdGlvbiBTeXN0ZW1BdXRvU29ydChjb21wYXJhdG9yKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRoaXMuX2F1dG9zb3J0Q29tcGFyYXRvcjtcbiAgfVxuXG4gIHRoaXMuX2F1dG9zb3J0Q29tcGFyYXRvciA9IGNvbXBhcmF0b3I7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJldHVybiB0aGUgU3lzdGVtJ3MgaWRlbnRpdHlcbiAqIEl0IGNvbnRhaW5lcyBpdCdzIG5hbWUgYW5kIGl0J3MgbW9kdWxlJ3MgbmFtZVxuICogQHJldHVybiB7U3RyaW5nfSAgICBUaGUgU3lzdGVtIGlkZW50aXR5XG4gKi9cblN5c3RlbS5wcm90b3R5cGUuaWRlbnRpdHkgPSBmdW5jdGlvbiBTeXN0ZW1JZGVudGl0eSgpe1xuICByZXR1cm4gdGhpcy5uYW1lKycgZnJvbSAnK3RoaXMubW9kdWxlTmFtZTtcbn07XG5cbi8qKlxuICogQWxpYXNlcyB0aGlzIFN5c3RlbSB3aXRoIHRoZSBhbGlhcyBwYXJhbVxuICogQHJldHVybiB7U3lzdGVtfSAgICBUaGUgU3lzdGVtXG4gKi9cblN5c3RlbS5wcm90b3R5cGUuYWxpYXMgPSBmdW5jdGlvbiBudWNsZWFyRW50aXR5QWxpYXMoYWxpYXMpe1xuICByZWdpc3RyeS5jb21wb25lbnRzW2FsaWFzXSA9IHRoaXM7XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gc3lzdGVtR2VuZXJhdGVRdWVyeShzZWxmKXtcbiAgdmFyIHF1ZXJ5LCBpLCBjb21wb25lbnQ7XG5cbiAgcXVlcnkgPSAnJztcbiAgZm9yKGkgPSAwOyBpIDwgc2VsZi5jb21wb25lbnRzLmxlbmd0aDsgaSsrKXtcbiAgICBjb21wb25lbnQgPSBzZWxmLmNvbXBvbmVudHNbaV07XG4gICAgcXVlcnkgKz0gY29tcG9uZW50O1xuXG4gICAgaWYoaSAhPT0gc2VsZi5jb21wb25lbnRzLmxlbmd0aC0xKXtcbiAgICAgIHF1ZXJ5ICs9ICcgJztcbiAgICB9XG4gIH1cbiAgc2VsZi5xdWVyeSA9IG51Y2xlYXJRdWVyeS5saXZlKHF1ZXJ5KTtcbiAgc2VsZi5lbnRpdGllcyA9IHNlbGYucXVlcnkuZW50aXRpZXM7XG4gIHNlbGYucXVlcnkubGlzdGVuKHN5c3RlbVF1ZXJ5VXBkYXRlLmJpbmQoc2VsZikpO1xufVxuXG5mdW5jdGlvbiBzeXN0ZW1RdWVyeVVwZGF0ZShlbnRpdHksIHN0YXRlKXtcbiAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgaWYoc3RhdGUpe1xuICAgIHRoaXMuY29tcG9uZW50UGFja3NbZW50aXR5XSA9IHN5c3RlbUdlbmVyYXRlUGFjayh0aGlzLCBlbnRpdHkpO1xuICB9XG4gIGVsc2V7XG4gICAgZGVsZXRlIHRoaXMuY29tcG9uZW50UGFja3NbZW50aXR5XTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzeXN0ZW1HZW5lcmF0ZVBhY2soc2VsZiwgZW50aXR5KXtcbiAgdmFyIGksIGNvbXBvbmVudCwgY29tcG9uZW50UGFjaztcblxuICBmb3IgKGkgPSBzZWxmLmNvbXBvbmVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBjb21wb25lbnQgPSBudWNsZWFyQ29tcG9uZW50KHNlbGYuY29tcG9uZW50c1tpXSkub2YoZW50aXR5KTtcbiAgICBpZiAoY29tcG9uZW50ID09PSB1bmRlZmluZWQpIHJldHVybiBudWxsO1xuICAgIGNvbXBvbmVudFBhY2tbc2VsZi5jb21wb25lbnRzW2ldXSA9IGNvbXBvbmVudDtcbiAgfVxuXG4gIHJldHVybiBjb21wb25lbnRQYWNrO1xufVxuXG5mdW5jdGlvbiBzeXN0ZW1MaXN0ZW4oc2VsZil7XG4gIHZhciBldmVudHNPcHRpb25zID0ge1xuICAgIGNvbnRleHQ6IHNlbGZcbiAgfTtcblxuICBudWNsZWFyRXZlbnRzLm9uKCdzeXN0ZW06YWZ0ZXJfcnVubmluZycsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoc2VsZi5fc29ydGVyTWFuYWdlci50b0RlZmVycmVkKSB7XG4gICAgICBzZWxmLmVudGl0aWVzLnNvcnQoc2VsZi5fc29ydGVyTWFuYWdlci5jb21wYXJhdG9yKTtcbiAgICAgIHNlbGYuX3NvcnRlck1hbmFnZXIudG9EZWZlcnJlZCA9IGZhbHNlO1xuICAgIH1cbiAgfSwgZXZlbnRzT3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIHN5c3RlbVNjaGVkdWxlckNhbGxiYWNrKGRlbHRhVGltZSl7XG4gIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gIHZhciBsZW5ndGggPSB0aGlzLmVudGl0aWVzLmxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHN5c3RlbVJ1bkVudGl0eSh0aGlzLCB0aGlzLmVudGl0aWVzW2ldLCB0aGlzLl9jb21wb25lbnRQYWNrc1t0aGlzLmVudGl0aWVzW2ldXSwgZGVsdGFUaW1lKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzeXN0ZW1SdW5FbnRpdHkoc2VsZiwgZW50aXR5LCBjb21wb25lbnRQYWNrLCBkZWx0YVRpbWUpIHtcbiAgcmV0dXJuIHNlbGYuZGVmaW5pdGlvbihlbnRpdHksIGNvbXBvbmVudFBhY2ssIG51Y2xlYXJTeXN0ZW0uY29udGV4dCgpLCBkZWx0YVRpbWUpO1xufVxuXG5mdW5jdGlvbiBzeXN0ZW1EaXNhYmxlU3lzdGVtcyhzZWxmLCBzeXN0ZW1zKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3lzdGVtcy5sZW5ndGg7IGkrKykge1xuICAgIG51Y2xlYXJTeXN0ZW0uZGlzYWJsZShzeXN0ZW1zW2ldKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN5c3RlbTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBudWNsZWFyLCB3YXRjaGVycywgcG9vbDtcblxubnVjbGVhciA9IHJlcXVpcmUoJy4vY29yZS9pbmRleCcpO1xud2F0Y2hlcnMgPSByZXF1aXJlKCcuL21vZHVsZXMvY29yZS53YXRjaGVycycpO1xuXG5wb29sID0gcmVxdWlyZSgnLi9wb29sJyk7XG5cbm51Y2xlYXIuaW1wb3J0KFt3YXRjaGVyc10pO1xuXG53aW5kb3cubnVjbGVhciA9IG51Y2xlYXI7XG5cbndpbmRvdy5Qb29sID0gcG9vbC5Qb29sO1xud2luZG93LkZpeGVkUG9vbCA9IHBvb2wuRml4ZWRQb29sO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbnVjbGVhciwgV2F0Y2hlckNvbXBvbmVudCwgd2F0Y2hTeXN0ZW07XG5cbm51Y2xlYXIgPSByZXF1aXJlKCcuLy4uLy4uL2NvcmUvaW5kZXgnKTtcbldhdGNoZXJDb21wb25lbnQgPSByZXF1aXJlKCcuL3dhdGNoZXItY29tcG9uZW50Jyk7XG53YXRjaFN5c3RlbSA9IHJlcXVpcmUoJy4vd2F0Y2gtc3lzdGVtJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gbnVjbGVhci5tb2R1bGUoJ2NvcmUud2F0Y2hlcnMnLCBbXSlcbiAgLmNvbXBvbmVudCgnd2F0Y2hlcicsIGZ1bmN0aW9uIChlKSB7XG4gICAgcmV0dXJuIG5ldyBXYXRjaGVyQ29tcG9uZW50KGUpO1xuICB9KVxuICAuc3lzdGVtKCd3YXRjaCcsIFsnd2F0Y2hlcnMnXSwgd2F0Y2hTeXN0ZW0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiB3YXRjaFN5c3RlbShlKSB7XG4gIC8qanNoaW50IHZhbGlkdGhpczogdHJ1ZSovXG4gIHZhciByZWNvcmRzLCBwYXRoLCByZWNvcmQsIHZhbHVlO1xuXG4gIHJlY29yZHMgPSB0aGlzLndhdGNoZXIucmVjb3JkcztcblxuICBmb3IgKHBhdGggaW4gcmVjb3Jkcykge1xuICAgIHJlY29yZCA9IHJlY29yZHNbcGF0aF07XG4gICAgdmFsdWUgPSByZWNvcmQuZ2V0dGVyKGUpO1xuXG4gICAgaWYgKHZhbHVlICE9PSByZWNvcmQub2xkKSB7XG4gICAgICByZWNvcmQubGlzdGVuZXIodmFsdWUsIHJlY29yZC5vbGQpO1xuICAgIH1cblxuICAgIHJlY29yZC5vbGQgPSB2YWx1ZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdhdGNoU3lzdGVtO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbnVjbGVhcjtcblxubnVjbGVhciA9IHJlcXVpcmUoJy4vLi4vLi4vY29yZS9pbmRleCcpO1xuXG5mdW5jdGlvbiBXYXRjaGVyQ29tcG9uZW50KGlkKSB7XG4gIHRoaXMuZW50aXR5ID0gaWQ7XG4gIHRoaXMucmVjb3JkcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG59XG5cbldhdGNoZXJDb21wb25lbnQucHJvdG90eXBlLndhdGNoID0gZnVuY3Rpb24gd2F0Y2hlckNvbXBvbmVudFdhdGNoKHBhdGgsIGxpc3RlbmVyKSB7XG4gIHZhciBwYXRocztcblxuICBpZiAodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgdGhpcy5fd2F0Y2gocGF0aCwgbGlzdGVuZXIpO1xuICB9IGVsc2Uge1xuICAgIHBhdGhzID0gcGF0aDtcbiAgICBmb3IgKHBhdGggaW4gcGF0aHMpIHtcbiAgICAgIHRoaXMuX3dhdGNoKHBhdGgsIHBhdGhzW3BhdGhdKTtcbiAgICB9XG4gIH1cbn07XG5cbldhdGNoZXJDb21wb25lbnQucHJvdG90eXBlLl93YXRjaCA9IGZ1bmN0aW9uIF93YXRjaGVyQ29tcG9uZW50V2F0Y2gocGF0aCwgbGlzdGVuZXIpIHtcbiAgdmFyIGdldHRlciwgc2V0dGVyLCB2YWx1ZSwgcmVjb3JkO1xuXG4gIGlmIChwYXRoIGluIHRoaXMucmVjb3Jkcykge1xuICAgIHRocm93IG5ldyBFcnJvcignQSB3YXRjaGVyIGlzIGFscmVhZHkgZGVmaW5lZCBmb3IgdGhlICcgKyBwYXRoICsgJyBwYXRoJyk7XG4gIH1cblxuICBnZXR0ZXIgPSBjb21waWxlR2V0dGVyKHBhdGgpO1xuICBzZXR0ZXIgPSBjb21waWxlU2V0dGVyKHBhdGgpO1xuXG4gIHZhbHVlID0gZ2V0dGVyKHRoaXMuZW50aXR5KTtcblxuICByZWNvcmQgPSB7XG4gICAgcGF0aDogcGF0aCxcbiAgICBsaXN0ZW5lcjogbGlzdGVuZXIsXG4gICAgZ2V0dGVyOiBnZXR0ZXIsXG4gICAgc2V0dGVyOiBzZXR0ZXIsXG4gICAgb2xkOiB2YWx1ZVxuICB9O1xuXG4gIHRoaXMucmVjb3Jkc1twYXRoXSA9IHJlY29yZDtcbn07XG5cbmZ1bmN0aW9uIGNvbXBpbGVHZXR0ZXIocGF0aCkge1xuICB2YXIgZ2V0dGVyLCBmcmFnbWVudHM7XG5cbiAgZ2V0dGVyID0gY29tcGlsZUdldHRlci5jYWNoZVtwYXRoXTtcblxuICBpZiAoIWdldHRlcikge1xuICAgIGZyYWdtZW50cyA9IHBhdGguc3BsaXQoJy4nKTtcblxuICAgIGNvbXBpbGVHZXR0ZXJbcGF0aF0gPSBnZXR0ZXIgPSBuZXcgRnVuY3Rpb24oJ24nLCAncmV0dXJuIGZ1bmN0aW9uIGNvbXBpbGVkR2V0dGVyKGUpIHsnICtcbiAgICAgICAgJ3JldHVybiBuLmNvbXBvbmVudChcIicgKyBmcmFnbWVudHMuc2hpZnQoKSArICdcIikub2YoZSkuJyArIGZyYWdtZW50cy5qb2luKCcuJykgK1xuICAgICAgJ30nXG4gICAgKShudWNsZWFyKTtcbiAgfVxuXG4gIHJldHVybiBnZXR0ZXI7XG59XG5cbmNvbXBpbGVHZXR0ZXIuY2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG5mdW5jdGlvbiBjb21waWxlU2V0dGVyKHBhdGgpIHtcbiAgdmFyIHNldHRlciwgZnJhZ21lbnRzO1xuXG4gIHNldHRlciA9IGNvbXBpbGVTZXR0ZXIuY2FjaGVbcGF0aF07XG5cbiAgaWYgKCFzZXR0ZXIpIHtcbiAgICBmcmFnbWVudHMgPSBwYXRoLnNwbGl0KCcuJyk7XG5cbiAgICBjb21waWxlU2V0dGVyLmNhY2hlW3BhdGhdID0gc2V0dGVyID0gbmV3IEZ1bmN0aW9uKCduJywgJ3JldHVybiBmdW5jdGlvbiBjb21waWxlZFNldHRlcihlLHYpIHsnICtcbiAgICAgICAgJ3JldHVybiBuLmNvbXBvbmVudChcIicgKyBmcmFnbWVudHMuc2hpZnQoKSArICdcIikub2YoZSkuJyArIGZyYWdtZW50cy5qb2luKCcuJykgKyAnPXYnICtcbiAgICAgICd9J1xuICAgICkobnVjbGVhcik7XG4gIH1cblxuICByZXR1cm4gc2V0dGVyO1xufVxuXG5jb21waWxlU2V0dGVyLmNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuV2F0Y2hlckNvbXBvbmVudC5wcm90b3R5cGUudW53YXRjaCA9IGZ1bmN0aW9uIHdhdGNoZXJDb21wb25lbnRVbndhdGNoKHBhdGgpIHtcbiAgdmFyIHBhdGhzO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhpcy5yZWNvcmRzID0ge307XG4gIH0gZWxzZSBpZiAodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgdGhpcy5fdW53YXRjaChwYXRoKTtcbiAgfSBlbHNlIHtcbiAgICBwYXRocyA9IHBhdGg7XG4gICAgZm9yIChwYXRoIGluIHBhdGhzKSB7XG4gICAgICB0aGlzLl91bndhdGNoKHBhdGgpO1xuICAgIH1cbiAgfVxufTtcblxuV2F0Y2hlckNvbXBvbmVudC5wcm90b3R5cGUuX3Vud2F0Y2ggPSBmdW5jdGlvbiBfd2F0Y2hlckNvbXBvbmVudFVud2F0Y2gocGF0aCkge1xuICB2YXIgcmVjb3JkO1xuXG4gIHJlY29yZCA9IHRoaXMucmVjb3Jkc1twYXRoXTtcblxuICBpZiAocmVjb3JkKSB7XG4gICAgZGVsZXRlIHRoaXMucmVjb3Jkc1twYXRoXTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZXJlIGlzIG5vIHdhdGNoZXIgZGVmaW5lZCBmb3IgdGhlICcgKyBwYXRoICsgJyBwYXRoJyk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gV2F0Y2hlckNvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gRml4ZWRQb29sKGZhY3RvcnksIG9wdGlvbnMpIHtcbiAgdmFyIGk7XG5cbiAgdGhpcy5fcG9vbCA9IFtdO1xuXG4gIHRoaXMuX2RlZmVyZWQgPSBbXTtcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgIGlmICgnc2l6ZScgaW4gb3B0aW9ucykgdGhpcy5fc2l6ZSA9IG9wdGlvbnMuc2l6ZTtcbiAgICBlbHNlIHRoaXMuX3NpemUgPSBGaXhlZFBvb2wuZGVmYXVsdHMuc2l6ZTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9zaXplID0gRml4ZWRQb29sLmRlZmF1bHRzLnNpemU7XG4gIH1cblxuICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5fc2l6ZTsgaSArPSAxKSB7XG4gICAgdGhpcy5fcG9vbC5wdXNoKGZhY3RvcnkoKSk7XG4gIH1cbn1cblxuXG5GaXhlZFBvb2wucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uIGZpeGVkUG9vbENyZWF0ZSgpIHtcbiAgdmFyIGluc3RhbmNlO1xuXG4gIGlmICh0aGlzLl9zaXplID4gMCkge1xuICAgIGluc3RhbmNlID0gdGhpcy5fcG9vbFstLXRoaXMuX3NpemVdO1xuXG4gICAgdGhpcy5fcG9vbFt0aGlzLl9zaXplXSA9IG51bGw7XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cbn07XG5cbkZpeGVkUG9vbC5wcm90b3R5cGUuZGVmZXIgPSBmdW5jdGlvbiBmaXhlZFBvb2xEZWZlcihjYWxsYmFjaykge1xuICB2YXIgaW5zdGFuY2U7XG5cbiAgaWYgKHRoaXMuX3NpemUgPiAwKSB7XG4gICAgaW5zdGFuY2UgPSB0aGlzLl9wb29sWy0tdGhpcy5fc2l6ZV07XG5cbiAgICB0aGlzLl9wb29sW3RoaXMuX3NpemVdID0gbnVsbDtcblxuICAgIChzZXRJbW1lZGlhdGUgfHwgc2V0VGltZW91dCkoZnVuY3Rpb24gKCkge1xuICAgICAgY2FsbGJhY2soaW5zdGFuY2UpO1xuICAgIH0sIDApO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX2RlZmVyZWQucHVzaChjYWxsYmFjayk7XG4gIH1cbn07XG5cbkZpeGVkUG9vbC5wcm90b3R5cGUucmVsZWFzZSA9IGZ1bmN0aW9uIGZpeGVkUG9vbFJlbGVhc2UoaW5zdGFuY2UpIHtcbiAgaWYgKHRoaXMuX2RlZmVyZWQubGVuZ3RoID4gMCkge1xuICAgIHRoaXMuX2RlZmVyZWQuc2hpZnQoKShpbnN0YW5jZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fcG9vbFt0aGlzLl9zaXplKytdID0gaW5zdGFuY2U7XG4gIH1cbn07XG5cbkZpeGVkUG9vbC5wcm90b3R5cGUuc2l6ZSA9IGZ1bmN0aW9uIGZpeGVkUG9vbFNpemUoKSB7XG4gIHJldHVybiB0aGlzLl9wb29sLmxlbmd0aDtcbn07XG5cbkZpeGVkUG9vbC5wcm90b3R5cGUuZnJlZVNpemUgPSBmdW5jdGlvbiBmaXhlZFBvb2xGcmVlU2l6ZSgpIHtcbiAgcmV0dXJuIHRoaXMuX3NpemU7XG59O1xuXG5GaXhlZFBvb2wucHJvdG90eXBlLmFsbG9jYXRlZFNpemUgPSBmdW5jdGlvbiBmaXhlZFBvb2xBbGxvY2F0ZWRTaXplKCkge1xuICByZXR1cm4gdGhpcy5fcG9vbC5sZW5ndGggLSB0aGlzLl9zaXplO1xufTtcblxuXG5GaXhlZFBvb2wuZGVmYXVsdHMgPSB7XG4gIHNpemU6IDEwMFxufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpeGVkUG9vbDtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gUG9vbChmYWN0b3J5LCBvcHRpb25zKSB7XG4gIHRoaXMuX2ZhY3RvcnkgPSBmYWN0b3J5O1xuXG4gIHRoaXMuX3Bvb2wgPSBbXTtcblxuICB0aGlzLl9kZWZlcmVkID0gW107XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICBpZiAoJ3NpemUnIGluIG9wdGlvbnMpIHRoaXMuX3NpemUgPSBvcHRpb25zLnNpemU7XG4gICAgZWxzZSB0aGlzLl9zaXplID0gUG9vbC5kZWZhdWx0cy5zaXplO1xuXG4gICAgaWYgKCdncm93dGgnIGluIG9wdGlvbnMpIHRoaXMuZ3Jvd3RoID0gb3B0aW9ucy5ncm93dGg7XG4gICAgZWxzZSB0aGlzLmdyb3d0aCA9IFBvb2wuZGVmYXVsdHMuZ3Jvd3RoO1xuXG4gICAgaWYgKCd0aHJlc2hvbGQnIGluIG9wdGlvbnMpIHRoaXMudGhyZXNob2xkID0gb3B0aW9ucy50aHJlc2hvbGQ7XG4gICAgZWxzZSB0aGlzLnRocmVzaG9sZCA9IFBvb2wuZGVmYXVsdHMudGhyZXNob2xkO1xuICB9IGVsc2Uge1xuICAgIG9wdGlvbnMgPSBQb29sLmRlZmF1bHRzO1xuXG4gICAgdGhpcy5fc2l6ZSA9IG9wdGlvbnMuc2l6ZTtcblxuICAgIHRoaXMuZ3Jvd3RoID0gb3B0aW9ucy5ncm93dGg7XG4gICAgdGhpcy50aHJlc2hvbGQgPSBvcHRpb25zLnRocmVzaG9sZDtcbiAgfVxuXG4gIHRoaXMuYWxsb2NhdGUodGhpcy5fc2l6ZSk7XG59XG5cblxuUG9vbC5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gcG9vbENyZWF0ZSgpIHtcbiAgaWYgKHRoaXMuX3Bvb2wubGVuZ3RoIDwgdGhpcy50aHJlc2hvbGQpIHtcbiAgICB0aGlzLmFsbG9jYXRlKHRoaXMuZ3Jvd3RoKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLl9wb29sLnBvcCgpO1xufTtcblxuUG9vbC5wcm90b3R5cGUuZGVmZXIgPSBmdW5jdGlvbiBwb29sRGVmZXIoY2FsbGJhY2spIHtcbiAgdmFyIGluc3RhbmNlO1xuXG4gIGlmICh0aGlzLl9wb29sLmxlbmd0aCA+IDApIHtcbiAgICBpbnN0YW5jZSA9IHRoaXMuX3Bvb2wucG9wKCk7XG4gICAgKHNldEltbWVkaWF0ZSB8fCBzZXRUaW1lb3V0KShmdW5jdGlvbiAoKSB7XG4gICAgICBjYWxsYmFjayhpbnN0YW5jZSk7XG4gICAgfSwgMCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGVmZXJlZC5wdXNoKGNhbGxiYWNrKTtcbiAgfVxufTtcblxuUG9vbC5wcm90b3R5cGUuYWxsb2NhdGUgPSBmdW5jdGlvbiBwb29sQWxsb2NhdGUoY291bnQpIHtcbiAgdmFyIGk7XG5cbiAgZm9yIChpID0gMDsgaSA8IGNvdW50OyBpICs9IDEpIHtcbiAgICB0aGlzLl9wb29sLnB1c2godGhpcy5fZmFjdG9yeSgpKTtcbiAgfVxuXG4gIHRoaXMuX3NpemUgKz0gY291bnQ7XG59O1xuXG5Qb29sLnByb3RvdHlwZS5yZWxlYXNlID0gZnVuY3Rpb24gcG9vbFJlbGVhc2UoaW5zdGFuY2UpIHtcbiAgaWYgKHRoaXMuX2RlZmVyZWQubGVuZ3RoID4gMCkge1xuICAgIHRoaXMuX2RlZmVyZWQuc2hpZnQoKShpbnN0YW5jZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fcG9vbC5wdXNoKGluc3RhbmNlKTtcbiAgfVxufTtcblxuUG9vbC5wcm90b3R5cGUuc2l6ZSA9IGZ1bmN0aW9uIHBvb2xTaXplKCkge1xuICByZXR1cm4gdGhpcy5fc2l6ZTtcbn07XG5cblBvb2wucHJvdG90eXBlLmZyZWVTaXplID0gZnVuY3Rpb24gcG9vbEZyZWVTaXplKCkge1xuICByZXR1cm4gdGhpcy5fcG9vbC5sZW5ndGg7XG59O1xuXG5Qb29sLnByb3RvdHlwZS5hbGxvY2F0ZWRTaXplID0gZnVuY3Rpb24gcG9vbEFsbG9jYXRlZFNpemUoKSB7XG4gIHJldHVybiB0aGlzLl9zaXplIC0gdGhpcy5fcG9vbC5sZW5ndGg7XG59O1xuXG5cblBvb2wuZGVmYXVsdHMgPSB7XG4gIHNpemU6IDEwMCxcbiAgZ3Jvd3RoOiAxLFxuICB0aHJlc2hvbGQ6IDFcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBQb29sO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLlBvb2wgPSByZXF1aXJlKCcuL1Bvb2wnKTtcbmV4cG9ydHMuRml4ZWRQb29sID0gcmVxdWlyZSgnLi9GaXhlZFBvb2wnKTtcbiJdfQ==
;