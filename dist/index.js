"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 *
 * @param {Object} instance
 * @param {boolean} strict
 * @return {Object}
 */
function magicInstance(instance, strict) {
  var instanceProxy;
  var handler = {
    set: function set(target, p, newValue) {
      if (Reflect.has(instance, p)) {
        return Reflect.set(instance, p, newValue, instanceProxy);
      }
      var setter = Reflect.get(instance, magic.__set) || Reflect.get(instance, '__set');
      if (typeof setter === 'function') {
        var _Reflect$apply;
        return (_Reflect$apply = Reflect.apply(setter, instanceProxy, [p, newValue])) !== null && _Reflect$apply !== void 0 ? _Reflect$apply : true;
      }
      if (strict) {
        throw new ReferenceError("Property [".concat(p, "] does not exist."));
      }
      return Reflect.set(instance, p, newValue, instanceProxy);
    },
    get: function get(target, p) {
      if (Reflect.has(instance, p)) {
        return Reflect.get(instance, p, instanceProxy);
      }
      var getter = Reflect.get(instance, magic.__get) || Reflect.get(instance, '__get');
      if (typeof getter === 'function') {
        var value = Reflect.apply(getter, instanceProxy, [p]);
        if (value !== undefined) {
          return value;
        }
      }
      var caller = Reflect.get(instance, magic.__call) || Reflect.get(instance, '__call');
      if (typeof caller === 'function') {
        return function () {
          for (var _len = arguments.length, parameters = new Array(_len), _key = 0; _key < _len; _key++) {
            parameters[_key] = arguments[_key];
          }
          parameters.unshift(p);
          return Reflect.apply(caller, instanceProxy, parameters);
        };
      }
      if (strict) {
        throw new ReferenceError("Property [".concat(p, "] does not exist."));
      }
      return undefined;
    },
    has: function has(target, p) {
      if (Reflect.has(instance, p)) {
        return true;
      }
      var has = Reflect.get(instance, magic.__has) || Reflect.get(instance, '__has');
      if (typeof has === 'function') {
        var _Reflect$apply2;
        return (_Reflect$apply2 = Reflect.apply(has, instanceProxy, [p])) !== null && _Reflect$apply2 !== void 0 ? _Reflect$apply2 : false;
      }
      return false;
    },
    deleteProperty: function deleteProperty(target, p) {
      if (Reflect.has(instance, p)) {
        if (strict) {
          throw new TypeError("Cannot delete property [".concat(p, "]."));
        }
        return Reflect.deleteProperty(instance, p);
      }
      var deleter = Reflect.get(instance, magic.__delete) || Reflect.get(instance, '__delete');
      if (typeof deleter === 'function') {
        var _Reflect$apply3;
        return (_Reflect$apply3 = Reflect.apply(deleter, instanceProxy, [p])) !== null && _Reflect$apply3 !== void 0 ? _Reflect$apply3 : true;
      }
      return true;
    },
    setPrototypeOf: function setPrototypeOf(target, v) {
      throw new TypeError('Cannot change prototype of the instance.');
    },
    getPrototypeOf: function getPrototypeOf() {
      return Reflect.getPrototypeOf(instance);
    },
    defineProperty: function defineProperty(target, property, attributes) {
      return Reflect.defineProperty(instance, property, attributes);
    },
    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, p) {
      return Reflect.getOwnPropertyDescriptor(instance, p);
    },
    ownKeys: function ownKeys() {
      return Reflect.ownKeys(instance);
    },
    preventExtensions: function preventExtensions() {
      return Reflect.preventExtensions(instance);
    },
    isExtensible: function isExtensible() {
      return Reflect.isExtensible(instance);
    }
  };
  var invoke = Reflect.get(instance, magic.__invoke) || Reflect.get(instance, '__invoke');
  return instanceProxy = typeof invoke === 'function' ? new Proxy(invoke, _objectSpread({
    apply: function apply(target, thisArg, argArray) {
      return Reflect.apply(invoke, instanceProxy, argArray);
    }
  }, handler)) : new Proxy(instance, handler);
}
function magicClass(Class, strict) {
  var ClassProxy;
  var InstanceFactory = {
    singletonEnabled: false,
    singletonInstance: null,
    getInstance: function getInstance() {
      for (var _len2 = arguments.length, constructParams = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        constructParams[_key2] = arguments[_key2];
      }
      return Reflect.construct(ClassProxy, constructParams);
    },
    getSingleton: function getSingleton() {
      this.singletonEnabled = true;
      return this.getInstance.apply(this, arguments);
    },
    getInstanceProxy: function getInstanceProxy(constructParams, newTarget) {
      var createInstanceProxy = function createInstanceProxy() {
        return magicInstance(Reflect.construct(Class, constructParams, newTarget), strict);
      };
      if (this.singletonEnabled) {
        if (this.singletonInstance === null) {
          this.singletonInstance = createInstanceProxy();
        }
        return this.singletonInstance;
      }
      return createInstanceProxy();
    }
  };
  return ClassProxy = new Proxy(Class, {
    construct: function construct(target, argArray, newTarget) {
      return InstanceFactory.getInstanceProxy(argArray, newTarget);
    },
    set: function set(target, p, newValue) {
      if (Reflect.has(Class, p)) {
        return Reflect.set(Class, p, newValue, ClassProxy);
      }
      var setter = Reflect.get(Class, magic.__set) || Reflect.get(Class, '__set');
      if (typeof setter === 'function') {
        var _Reflect$apply4;
        return (_Reflect$apply4 = Reflect.apply(setter, ClassProxy, [p, newValue])) !== null && _Reflect$apply4 !== void 0 ? _Reflect$apply4 : true;
      }
      if (strict) {
        throw new ReferenceError("Static property [".concat(p, "] does not exist."));
      }
      return Reflect.set(Class, p, newValue, ClassProxy);
    },
    get: function get(target, p) {
      switch (p) {
        case '__instance':
          return function () {
            return InstanceFactory.getInstance.apply(InstanceFactory, arguments);
          };
        case '__singleton':
          return function () {
            return InstanceFactory.getSingleton.apply(InstanceFactory, arguments);
          };
        default:
          if (Reflect.has(Class, p)) {
            return Reflect.get(Class, p, ClassProxy);
          }
          var getter = Reflect.get(Class, magic.__get) || Reflect.get(Class, '__get');
          if (typeof getter === 'function') {
            var value = Reflect.apply(getter, ClassProxy, [p]);
            if (value !== undefined) {
              return value;
            }
          }
          var caller = Reflect.get(Class, magic.__call) || Reflect.get(Class, '__call');
          if (typeof caller === 'function') {
            return function () {
              for (var _len3 = arguments.length, parameters = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                parameters[_key3] = arguments[_key3];
              }
              parameters.unshift(p);
              return Reflect.apply(caller, ClassProxy, parameters);
            };
          }
          if (strict) {
            throw new ReferenceError("Static property [".concat(p, "] does not exist."));
          }
          return undefined;
      }
    },
    has: function has(target, p) {
      if (Reflect.has(Class, p)) {
        return true;
      }
      if (['__instance', '__singleton'].includes(p)) {
        return true;
      }
      var has = Reflect.get(Class, magic.__has) || Reflect.get(Class, '__has');
      if (typeof has === 'function') {
        var _Reflect$apply5;
        return (_Reflect$apply5 = Reflect.apply(has, ClassProxy, [p])) !== null && _Reflect$apply5 !== void 0 ? _Reflect$apply5 : false;
      }
      return false;
    },
    deleteProperty: function deleteProperty(target, p) {
      if (Reflect.has(Class, p)) {
        if (strict) {
          throw new TypeError("Cannot delete static property [".concat(p, "]."));
        }
        return Reflect.deleteProperty(Class, p);
      }
      if (['__instance', '__singleton'].includes(p)) {
        throw new TypeError("Cannot delete static property [".concat(p, "]."));
      }
      var deleter = Reflect.get(Class, magic.__delete) || Reflect.get(Class, '__delete');
      if (typeof deleter === 'function') {
        var _Reflect$apply6;
        return (_Reflect$apply6 = Reflect.apply(deleter, ClassProxy, [p])) !== null && _Reflect$apply6 !== void 0 ? _Reflect$apply6 : true;
      }
      return true;
    },
    setPrototypeOf: function setPrototypeOf(target, v) {
      throw new TypeError("Cannot change prototype of the class [".concat(Class.name, "]."));
    },
    getPrototypeOf: function getPrototypeOf() {
      return Reflect.getPrototypeOf(Class);
    },
    defineProperty: function defineProperty(target, property, attributes) {
      return Reflect.defineProperty(Class, property, attributes);
    },
    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, p) {
      return Reflect.getOwnPropertyDescriptor(Class, p);
    },
    ownKeys: function ownKeys() {
      return Reflect.ownKeys(Class);
    },
    preventExtensions: function preventExtensions() {
      return Reflect.preventExtensions(Class);
    },
    isExtensible: function isExtensible() {
      return Reflect.isExtensible(Class);
    }
  });
}
function magic(target) {
  var strict = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  if (typeof target === 'function') {
    return magicClass(target, strict);
  }
  if (target !== null && _typeof(target) === 'object') {
    return magicInstance(target, strict);
  }
  throw new TypeError('The [target] parameter must be a function or an object.');
}
magic.__set = Symbol('Symbol.__set');
magic.__get = Symbol('Symbol.__get');
magic.__call = Symbol('Symbol.__call');
magic.__has = Symbol('Symbol.__has');
magic.__delete = Symbol('Symbol.__delete');
magic.__invoke = Symbol('Symbol.__invoke');
var _default = exports["default"] = magic;
module.exports = exports.default;