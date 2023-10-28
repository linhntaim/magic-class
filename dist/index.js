"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MagicMixin = exports.MagicClass = void 0;
exports.magic = magic;
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
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
    get: function get(target, p) {
      if (Reflect.has(instance, p)) {
        return Reflect.get(instance, p, instanceProxy);
      }
      var getter = Reflect.get(instance, '__get');
      if (typeof getter === 'function') {
        var value = Reflect.apply(getter, instanceProxy, [p]);
        if (value !== undefined) {
          return value;
        }
      }
      var caller = Reflect.get(instance, '__call');
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
    set: function set(target, p, newValue) {
      if (Reflect.has(instance, p)) {
        return Reflect.set(instance, p, newValue, instanceProxy);
      }
      var setter = Reflect.get(instance, '__set');
      if (typeof setter === 'function') {
        var _Reflect$apply;
        return (_Reflect$apply = Reflect.apply(setter, instanceProxy, [p, newValue])) !== null && _Reflect$apply !== void 0 ? _Reflect$apply : true;
      }
      if (strict) {
        throw new ReferenceError("Property [".concat(p, "] does not exist."));
      }
      return Reflect.set(instance, p, newValue, instanceProxy);
    },
    has: function has(target, p) {
      if (Reflect.has(instance, p)) {
        return true;
      }
      var caller = Reflect.get(instance, '__call');
      if (typeof caller === 'function') {
        return true;
      }
      var getter = Reflect.get(instance, '__get');
      if (typeof getter === 'function') {
        if (Reflect.apply(getter, instanceProxy, [p]) !== undefined) {
          return true;
        }
      }
      return false;
    },
    deleteProperty: function deleteProperty(target, p) {
      if (strict) {
        throw new TypeError("Cannot delete property [".concat(p, "]"));
      }
      if (Reflect.has(instance, p)) {
        return Reflect.deleteProperty(instance, p);
      }

      // TODO: should implement magic delete ??

      return true;
    },
    getPrototypeOf: function getPrototypeOf() {
      return Reflect.getPrototypeOf(instance);
    }
  };
  var invoke = Reflect.get(instance, '__invoke');
  if (typeof invoke === 'function') {
    return instanceProxy = new Proxy(invoke, _objectSpread({
      apply: function apply(target, thisArg, argArray) {
        return Reflect.apply(invoke, instanceProxy, argArray);
      }
    }, handler));
  }
  return instanceProxy = new Proxy(instance, handler);
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
    get: function get(target, p) {
      switch (p) {
        case '__static':
          return ClassProxy;
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
          var getter = Reflect.get(Class, '__get');
          if (typeof getter === 'function') {
            var value = Reflect.apply(getter, ClassProxy, [p]);
            if (value !== undefined) {
              return value;
            }
          }
          var caller = Reflect.get(Class, '__call');
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
    set: function set(target, p, newValue) {
      if (Reflect.has(Class, p)) {
        return Reflect.set(Class, p, newValue, ClassProxy);
      }
      var setter = Reflect.get(Class, '__set');
      if (typeof setter === 'function') {
        var _Reflect$apply2;
        return (_Reflect$apply2 = Reflect.apply(setter, ClassProxy, [p, newValue])) !== null && _Reflect$apply2 !== void 0 ? _Reflect$apply2 : true;
      }
      if (strict) {
        throw new ReferenceError("Static property [".concat(p, "] does not exist."));
      }
      return Reflect.set(Class, p, newValue, ClassProxy);
    },
    has: function has(target, p) {
      if (Reflect.has(Class, p)) {
        return true;
      }
      if (['__static', '__instance', '__singleton'].includes(p)) {
        return true;
      }
      var caller = Reflect.get(Class, '__call');
      if (typeof caller === 'function') {
        return true;
      }
      var getter = Reflect.get(Class, '__get');
      if (typeof getter === 'function') {
        if (Reflect.apply(getter, ClassProxy, [p]) !== undefined) {
          return true;
        }
      }
      return false;
    },
    deleteProperty: function deleteProperty(target, p) {
      if (strict || ['__static', '__instance', '__singleton'].includes(p)) {
        throw new TypeError("Cannot delete static property [".concat(p, "]"));
      }
      if (Reflect.has(Class, p)) {
        return Reflect.deleteProperty(Class, p);
      }

      // TODO: should implement magic delete ??

      return true;
    },
    getPrototypeOf: function getPrototypeOf() {
      return Reflect.getPrototypeOf(Class);
    }
  });
}
function magic(target) {
  var strict = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  if (target !== null && _typeof(target) === 'object') {
    return magicInstance(target, strict);
  }
  if (typeof target !== 'function') {
    throw new TypeError('The [target] parameter must be a function or an object.');
  }
  return magicClass(target, strict);
}
var MagicMixin = exports.MagicMixin = function MagicMixin(Class) {
  var _class;
  var strict = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  return _class = /*#__PURE__*/function (_Class) {
    _inherits(_class, _Class);
    var _super = _createSuper(_class);
    function _class() {
      _classCallCheck(this, _class);
      return _super.apply(this, arguments);
    }
    _createClass(_class, null, [{
      key: "__static",
      get: function get() {
        return this.___magic;
      }
    }, {
      key: "__instance",
      value: function __instance() {
        var _this$__static;
        return (_this$__static = this.__static).__instance.apply(_this$__static, arguments);
      }
    }, {
      key: "__singleton",
      value: function __singleton() {
        var _this$__static2;
        return (_this$__static2 = this.__static).__singleton.apply(_this$__static2, arguments);
      }
    }]);
    return _class;
  }(Class), _defineProperty(_class, "___magic", void 0), _class.___magic = magic(_class, strict), _class;
};
var MagicClass = exports.MagicClass = /*#__PURE__*/function () {
  function MagicClass() {
    _classCallCheck(this, MagicClass);
  }
  _createClass(MagicClass, null, [{
    key: "__static",
    get: function get() {
      return this.___magic;
    }
  }, {
    key: "__instance",
    value: function __instance() {
      var _this$__static3;
      return (_this$__static3 = this.__static).__instance.apply(_this$__static3, arguments);
    }
  }, {
    key: "__singleton",
    value: function __singleton() {
      var _this$__static4;
      return (_this$__static4 = this.__static).__singleton.apply(_this$__static4, arguments);
    }
  }, {
    key: "__magic",
    value: function __magic() {
      var strict = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      this.___magic = magic(this, strict);
      return this;
    }
  }]);
  return MagicClass;
}();
_defineProperty(MagicClass, "___magic", void 0);