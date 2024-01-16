var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var HTTP_EState = /* @__PURE__ */ ((HTTP_EState2) => {
  HTTP_EState2[HTTP_EState2["block"] = 0] = "block";
  HTTP_EState2[HTTP_EState2["success"] = 1] = "success";
  HTTP_EState2[HTTP_EState2["error"] = 2] = "error";
  return HTTP_EState2;
})(HTTP_EState || {});
var HTTP_EContent = /* @__PURE__ */ ((HTTP_EContent2) => {
  HTTP_EContent2["json"] = "application/json";
  HTTP_EContent2["form"] = "multipart/form-data";
  return HTTP_EContent2;
})(HTTP_EContent || {});
var EKeyCode = /* @__PURE__ */ ((EKeyCode2) => {
  EKeyCode2["Esc"] = "Escape";
  EKeyCode2["F1"] = "F1";
  EKeyCode2["F2"] = "F2";
  EKeyCode2["F3"] = "F3";
  EKeyCode2["F4"] = "F4";
  EKeyCode2["F5"] = "F5";
  EKeyCode2["F6"] = "F6";
  EKeyCode2["F7"] = "F7";
  EKeyCode2["F8"] = "F8";
  EKeyCode2["F9"] = "F9";
  EKeyCode2["F10"] = "F10";
  EKeyCode2["F11"] = "F11";
  EKeyCode2["F12"] = "F12";
  EKeyCode2["`~"] = "Backquote";
  EKeyCode2["1!"] = "Digit1";
  EKeyCode2["2@"] = "Digit2";
  EKeyCode2["3#"] = "Digit3";
  EKeyCode2["4$"] = "Digit4";
  EKeyCode2["5%"] = "Digit5";
  EKeyCode2["6^"] = "Digit6";
  EKeyCode2["7&"] = "Digit7";
  EKeyCode2["8*"] = "Digit8";
  EKeyCode2["9("] = "Digit9";
  EKeyCode2["0)"] = "Digit0";
  EKeyCode2["-_"] = "Minus";
  EKeyCode2["=+"] = "Equal";
  EKeyCode2["Backspace"] = "Backspace";
  EKeyCode2["Tab"] = "Tab";
  EKeyCode2["Q"] = "KeyQ";
  EKeyCode2["W"] = "KeyW";
  EKeyCode2["E"] = "KeyE";
  EKeyCode2["R"] = "KeyR";
  EKeyCode2["T"] = "KeyT";
  EKeyCode2["Y"] = "KeyY";
  EKeyCode2["U"] = "KeyU";
  EKeyCode2["I"] = "KeyI";
  EKeyCode2["O"] = "KeyO";
  EKeyCode2["P"] = "KeyP";
  EKeyCode2["[{"] = "BracketLeft";
  EKeyCode2["]}"] = "BracketRight";
  EKeyCode2["\\|"] = "Backslash";
  EKeyCode2["CapsLock"] = "CapsLock";
  EKeyCode2["A"] = "KeyA";
  EKeyCode2["S"] = "KeyS";
  EKeyCode2["D"] = "KeyD";
  EKeyCode2["F"] = "KeyF";
  EKeyCode2["G"] = "KeyG";
  EKeyCode2["H"] = "KeyH";
  EKeyCode2["J"] = "KeyJ";
  EKeyCode2["K"] = "KeyK";
  EKeyCode2["L"] = "KeyL";
  EKeyCode2[";:"] = "Semicolon";
  EKeyCode2[`'"`] = "Quote";
  EKeyCode2["Enter"] = "Enter";
  EKeyCode2["ShiftLeft"] = "ShiftLeft";
  EKeyCode2["Z"] = "KeyZ";
  EKeyCode2["X"] = "KeyX";
  EKeyCode2["C"] = "KeyC";
  EKeyCode2["V"] = "KeyV";
  EKeyCode2["B"] = "KeyB";
  EKeyCode2["N"] = "KeyN";
  EKeyCode2["M"] = "KeyM";
  EKeyCode2[",<"] = "Comma";
  EKeyCode2[".>"] = "Period";
  EKeyCode2["/?"] = "Slash";
  EKeyCode2["ShiftRight"] = "ShiftRight";
  EKeyCode2["ControlLeft"] = "ControlLeft";
  EKeyCode2["WinLeft"] = "MetaLeft";
  EKeyCode2["AltLeft"] = "AltLeft";
  EKeyCode2["Space"] = "Space";
  EKeyCode2["AltRight"] = "AltRight";
  EKeyCode2["WinRight"] = "MetaRight";
  EKeyCode2["ControlRight"] = "ControlRight";
  EKeyCode2["ArrowUp"] = "ArrowUp";
  EKeyCode2["ArrowRight"] = "ArrowRight";
  EKeyCode2["ArrowDown"] = "ArrowDown";
  EKeyCode2["ArrowLeft"] = "ArrowLeft";
  EKeyCode2["PrintScreen"] = "PrintScreen";
  EKeyCode2["ScrollLock"] = "ScrollLock";
  EKeyCode2["PauseBreak"] = "Pause";
  EKeyCode2["Insert"] = "Insert";
  EKeyCode2["Home"] = "Home";
  EKeyCode2["PageUp"] = "PageUp";
  EKeyCode2["Delete"] = "Delete";
  EKeyCode2["End"] = "End";
  EKeyCode2["PageDown"] = "PageDown";
  return EKeyCode2;
})(EKeyCode || {});
function FLabelSizeCalculator(label, fontSize = "14px", lineHeight = "1") {
  const element = document.createElement("span");
  element.style.visibility = "hidden";
  element.style.position = "absolute";
  element.style.whiteSpace = "pre";
  element.style.lineHeight = lineHeight;
  element.style.fontSize = fontSize;
  element.textContent = label;
  document.body.appendChild(element);
  const width = element.clientWidth;
  const height = element.clientHeight;
  document.body.removeChild(element);
  return { width, height };
}
function FFormConverter(data) {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => form.append(k, v));
  return form;
}
function FSealDecorator(target) {
  Object.seal(target);
  Object.seal(target.prototype);
}
function FDownLoadHandler(url, name) {
  return new Promise((resolve, reject) => {
    if (url) {
      const element = document.createElement("a");
      element.href = url;
      name && (element.download = name);
      element.click();
      resolve();
      element.remove();
    } else {
      reject(new Error(`\u65E0\u6CD5\u4E0B\u8F7D${name || "\u6587\u4EF6"}`));
    }
  });
}
function FTypeMatcher(target, matcher) {
  const type = Object.prototype.toString.call(target).slice(8, -1).toLocaleLowerCase();
  return matcher ? type === matcher.toLocaleLowerCase() : type;
}
function FParameterMatcher(target, matcher) {
  var _a, _b;
  return (_b = (_a = target.match(matcher)) == null ? void 0 : _a[2]) != null ? _b : "";
}
function FParametersMatcher(target, separator, ...keys) {
  return keys.map((key) => FParameterMatcher(target, new RegExp(`(^|${separator[1]})${key}${separator[0]}([^${separator[1]}]*)(${separator[1]}|$)`, "i")));
}
function FCookieMatcher(...keys) {
  const result = /* @__PURE__ */ new Map();
  const values = FParametersMatcher(document.cookie, ["=", "; "], ...keys);
  for (let i = 0; i < keys.length; i++) {
    result.set(keys[i], decodeURIComponent(values[i]));
  }
  return result;
}
function FHeaderMatcher(headers, target, ...keys) {
  var _a;
  const result = /* @__PURE__ */ new Map();
  const values = FParametersMatcher((_a = headers.get(target)) != null ? _a : "", ["=", ";"], ...keys);
  for (let i = 0; i < keys.length; i++) {
    result.set(keys[i], decodeURIComponent(values[i]));
  }
  return result;
}
function FUrlMatcher(...keys) {
  const result = /* @__PURE__ */ new Map();
  const values = FParametersMatcher(window.location.search.substring(1), ["=", "&"], ...keys);
  for (let i = 0; i < keys.length; i++) {
    result.set(keys[i], decodeURIComponent(values[i]));
  }
  return result;
}
var __defProp$2 = Object.defineProperty;
var __getOwnPropDesc$2 = Object.getOwnPropertyDescriptor;
var __decorateClass$2 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$2(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp$2(target, key, result);
  return result;
};
let HttpConfig = class {
  constructor() {
    __publicField(this, "_proxy", "/api");
  }
  get proxy() {
    return this._proxy;
  }
  set proxy(v) {
    this._proxy = v;
  }
};
HttpConfig = __decorateClass$2([
  FSealDecorator
], HttpConfig);
const HTTP_CONFIG = new HttpConfig();
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __decorateClass$1 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$1(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp$1(target, key, result);
  return result;
};
class HttpInterceptor {
  constructor() {
    __publicField(this, "_interceptors", /* @__PURE__ */ new Set());
  }
  add(interceptor) {
    this._interceptors.add(interceptor);
  }
  delete(interceptor) {
    this._interceptors.delete(interceptor);
  }
  clear() {
    this._interceptors.clear();
  }
  async use(origin) {
    return Array.from(this._interceptors).reduce(async (p, interceptor) => interceptor(await p), Promise.resolve(origin));
  }
}
let HttpRequestInterceptor = class extends HttpInterceptor {
};
HttpRequestInterceptor = __decorateClass$1([
  FSealDecorator
], HttpRequestInterceptor);
const HTTP_REQUEST_INTERCEPTORS = new HttpRequestInterceptor();
Object.freeze(HTTP_REQUEST_INTERCEPTORS);
let HttpResponseInterceptor = class extends HttpInterceptor {
};
HttpResponseInterceptor = __decorateClass$1([
  FSealDecorator
], HttpResponseInterceptor);
const HTTP_RESPONSE_INTERCEPTORS = new HttpResponseInterceptor();
Object.freeze(HTTP_RESPONSE_INTERCEPTORS);
var extendStatics = function (d, b) {
  extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d2, b2) {
    d2.__proto__ = b2;
  } || function (d2, b2) {
    for (var p in b2)
      if (Object.prototype.hasOwnProperty.call(b2, p))
        d2[p] = b2[p];
  };
  return extendStatics(d, b);
};
function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
    throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign = function () {
  __assign = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
function __rest(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __generator(thisArg, body) {
  var _ = {
    label: 0, sent: function () {
      if (t[0] & 1)
        throw t[1];
      return t[1];
    }, trys: [], ops: []
  }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;
  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f)
      throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t)
          op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
}
function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m)
    return m.call(o);
  if (o && typeof o.length === "number")
    return {
      next: function () {
        if (o && i >= o.length)
          o = void 0;
        return { value: o && o[i++], done: !o };
      }
    };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m)
    return o;
  var i = m.call(o), r, ar = [], e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
      ar.push(r.value);
  } catch (error) {
    e = { error };
  } finally {
    try {
      if (r && !r.done && (m = i["return"]))
        m.call(i);
    } finally {
      if (e)
        throw e.error;
    }
  }
  return ar;
}
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2)
    for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar)
          ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
  return to.concat(ar || Array.prototype.slice.call(from));
}
function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator)
    throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () {
    return this;
  }, i;
  function verb(n) {
    if (g[n])
      i[n] = function (v) {
        return new Promise(function (a, b) {
          q.push([n, v, a, b]) > 1 || resume(n, v);
        });
      };
  }
  function resume(n, v) {
    try {
      step(g[n](v));
    } catch (e) {
      settle(q[0][3], e);
    }
  }
  function step(r) {
    r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
  }
  function fulfill(value) {
    resume("next", value);
  }
  function reject(value) {
    resume("throw", value);
  }
  function settle(f, v) {
    if (f(v), q.shift(), q.length)
      resume(q[0][0], q[0][1]);
  }
}
function __asyncValues(o) {
  if (!Symbol.asyncIterator)
    throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () {
    return this;
  }, i);
  function verb(n) {
    i[n] = o[n] && function (v) {
      return new Promise(function (resolve, reject) {
        v = o[n](v), settle(resolve, reject, v.done, v.value);
      });
    };
  }
  function settle(resolve, reject, d, v) {
    Promise.resolve(v).then(function (v2) {
      resolve({ value: v2, done: d });
    }, reject);
  }
}
function isFunction(value) {
  return typeof value === "function";
}
function createErrorClass(createImpl) {
  var _super = function (instance) {
    Error.call(instance);
    instance.stack = new Error().stack;
  };
  var ctorFunc = createImpl(_super);
  ctorFunc.prototype = Object.create(Error.prototype);
  ctorFunc.prototype.constructor = ctorFunc;
  return ctorFunc;
}
var UnsubscriptionError = createErrorClass(function (_super) {
  return function UnsubscriptionErrorImpl(errors) {
    _super(this);
    this.message = errors ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) {
      return i + 1 + ") " + err.toString();
    }).join("\n  ") : "";
    this.name = "UnsubscriptionError";
    this.errors = errors;
  };
});
function arrRemove(arr, item) {
  if (arr) {
    var index = arr.indexOf(item);
    0 <= index && arr.splice(index, 1);
  }
}
var Subscription = function () {
  function Subscription2(initialTeardown) {
    this.initialTeardown = initialTeardown;
    this.closed = false;
    this._parentage = null;
    this._finalizers = null;
  }
  Subscription2.prototype.unsubscribe = function () {
    var e_1, _a, e_2, _b;
    var errors;
    if (!this.closed) {
      this.closed = true;
      var _parentage = this._parentage;
      if (_parentage) {
        this._parentage = null;
        if (Array.isArray(_parentage)) {
          try {
            for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
              var parent_1 = _parentage_1_1.value;
              parent_1.remove(this);
            }
          } catch (e_1_1) {
            e_1 = { error: e_1_1 };
          } finally {
            try {
              if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return))
                _a.call(_parentage_1);
            } finally {
              if (e_1)
                throw e_1.error;
            }
          }
        } else {
          _parentage.remove(this);
        }
      }
      var initialFinalizer = this.initialTeardown;
      if (isFunction(initialFinalizer)) {
        try {
          initialFinalizer();
        } catch (e) {
          errors = e instanceof UnsubscriptionError ? e.errors : [e];
        }
      }
      var _finalizers = this._finalizers;
      if (_finalizers) {
        this._finalizers = null;
        try {
          for (var _finalizers_1 = __values(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
            var finalizer = _finalizers_1_1.value;
            try {
              execFinalizer(finalizer);
            } catch (err) {
              errors = errors !== null && errors !== void 0 ? errors : [];
              if (err instanceof UnsubscriptionError) {
                errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
              } else {
                errors.push(err);
              }
            }
          }
        } catch (e_2_1) {
          e_2 = { error: e_2_1 };
        } finally {
          try {
            if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return))
              _b.call(_finalizers_1);
          } finally {
            if (e_2)
              throw e_2.error;
          }
        }
      }
      if (errors) {
        throw new UnsubscriptionError(errors);
      }
    }
  };
  Subscription2.prototype.add = function (teardown) {
    var _a;
    if (teardown && teardown !== this) {
      if (this.closed) {
        execFinalizer(teardown);
      } else {
        if (teardown instanceof Subscription2) {
          if (teardown.closed || teardown._hasParent(this)) {
            return;
          }
          teardown._addParent(this);
        }
        (this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
      }
    }
  };
  Subscription2.prototype._hasParent = function (parent) {
    var _parentage = this._parentage;
    return _parentage === parent || Array.isArray(_parentage) && _parentage.includes(parent);
  };
  Subscription2.prototype._addParent = function (parent) {
    var _parentage = this._parentage;
    this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
  };
  Subscription2.prototype._removeParent = function (parent) {
    var _parentage = this._parentage;
    if (_parentage === parent) {
      this._parentage = null;
    } else if (Array.isArray(_parentage)) {
      arrRemove(_parentage, parent);
    }
  };
  Subscription2.prototype.remove = function (teardown) {
    var _finalizers = this._finalizers;
    _finalizers && arrRemove(_finalizers, teardown);
    if (teardown instanceof Subscription2) {
      teardown._removeParent(this);
    }
  };
  Subscription2.EMPTY = function () {
    var empty = new Subscription2();
    empty.closed = true;
    return empty;
  }();
  return Subscription2;
}();
var EMPTY_SUBSCRIPTION = Subscription.EMPTY;
function isSubscription(value) {
  return value instanceof Subscription || value && "closed" in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe);
}
function execFinalizer(finalizer) {
  if (isFunction(finalizer)) {
    finalizer();
  } else {
    finalizer.unsubscribe();
  }
}
var config = {
  onUnhandledError: null,
  onStoppedNotification: null,
  Promise: void 0,
  useDeprecatedSynchronousErrorHandling: false,
  useDeprecatedNextContext: false
};
var timeoutProvider = {
  setTimeout: function (handler, timeout) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      args[_i - 2] = arguments[_i];
    }
    var delegate = timeoutProvider.delegate;
    if (delegate === null || delegate === void 0 ? void 0 : delegate.setTimeout) {
      return delegate.setTimeout.apply(delegate, __spreadArray([handler, timeout], __read(args)));
    }
    return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
  },
  clearTimeout: function (handle) {
    var delegate = timeoutProvider.delegate;
    return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearTimeout) || clearTimeout)(handle);
  },
  delegate: void 0
};
function reportUnhandledError(err) {
  timeoutProvider.setTimeout(function () {
    {
      throw err;
    }
  });
}
function noop() {
}
function errorContext(cb) {
  {
    cb();
  }
}
var Subscriber = function (_super) {
  __extends(Subscriber2, _super);
  function Subscriber2(destination) {
    var _this = _super.call(this) || this;
    _this.isStopped = false;
    if (destination) {
      _this.destination = destination;
      if (isSubscription(destination)) {
        destination.add(_this);
      }
    } else {
      _this.destination = EMPTY_OBSERVER;
    }
    return _this;
  }
  Subscriber2.create = function (next, error, complete) {
    return new SafeSubscriber(next, error, complete);
  };
  Subscriber2.prototype.next = function (value) {
    if (this.isStopped)
      ;
    else {
      this._next(value);
    }
  };
  Subscriber2.prototype.error = function (err) {
    if (this.isStopped)
      ;
    else {
      this.isStopped = true;
      this._error(err);
    }
  };
  Subscriber2.prototype.complete = function () {
    if (this.isStopped)
      ;
    else {
      this.isStopped = true;
      this._complete();
    }
  };
  Subscriber2.prototype.unsubscribe = function () {
    if (!this.closed) {
      this.isStopped = true;
      _super.prototype.unsubscribe.call(this);
      this.destination = null;
    }
  };
  Subscriber2.prototype._next = function (value) {
    this.destination.next(value);
  };
  Subscriber2.prototype._error = function (err) {
    try {
      this.destination.error(err);
    } finally {
      this.unsubscribe();
    }
  };
  Subscriber2.prototype._complete = function () {
    try {
      this.destination.complete();
    } finally {
      this.unsubscribe();
    }
  };
  return Subscriber2;
}(Subscription);
var _bind = Function.prototype.bind;
function bind(fn, thisArg) {
  return _bind.call(fn, thisArg);
}
var ConsumerObserver = function () {
  function ConsumerObserver2(partialObserver) {
    this.partialObserver = partialObserver;
  }
  ConsumerObserver2.prototype.next = function (value) {
    var partialObserver = this.partialObserver;
    if (partialObserver.next) {
      try {
        partialObserver.next(value);
      } catch (error) {
        handleUnhandledError(error);
      }
    }
  };
  ConsumerObserver2.prototype.error = function (err) {
    var partialObserver = this.partialObserver;
    if (partialObserver.error) {
      try {
        partialObserver.error(err);
      } catch (error) {
        handleUnhandledError(error);
      }
    } else {
      handleUnhandledError(err);
    }
  };
  ConsumerObserver2.prototype.complete = function () {
    var partialObserver = this.partialObserver;
    if (partialObserver.complete) {
      try {
        partialObserver.complete();
      } catch (error) {
        handleUnhandledError(error);
      }
    }
  };
  return ConsumerObserver2;
}();
var SafeSubscriber = function (_super) {
  __extends(SafeSubscriber2, _super);
  function SafeSubscriber2(observerOrNext, error, complete) {
    var _this = _super.call(this) || this;
    var partialObserver;
    if (isFunction(observerOrNext) || !observerOrNext) {
      partialObserver = {
        next: observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : void 0,
        error: error !== null && error !== void 0 ? error : void 0,
        complete: complete !== null && complete !== void 0 ? complete : void 0
      };
    } else {
      var context_1;
      if (_this && config.useDeprecatedNextContext) {
        context_1 = Object.create(observerOrNext);
        context_1.unsubscribe = function () {
          return _this.unsubscribe();
        };
        partialObserver = {
          next: observerOrNext.next && bind(observerOrNext.next, context_1),
          error: observerOrNext.error && bind(observerOrNext.error, context_1),
          complete: observerOrNext.complete && bind(observerOrNext.complete, context_1)
        };
      } else {
        partialObserver = observerOrNext;
      }
    }
    _this.destination = new ConsumerObserver(partialObserver);
    return _this;
  }
  return SafeSubscriber2;
}(Subscriber);
function handleUnhandledError(error) {
  {
    reportUnhandledError(error);
  }
}
function defaultErrorHandler(err) {
  throw err;
}
var EMPTY_OBSERVER = {
  closed: true,
  next: noop,
  error: defaultErrorHandler,
  complete: noop
};
var observable = function () {
  return typeof Symbol === "function" && Symbol.observable || "@@observable";
}();
function identity(x) {
  return x;
}
function pipeFromArray(fns) {
  if (fns.length === 0) {
    return identity;
  }
  if (fns.length === 1) {
    return fns[0];
  }
  return function piped(input) {
    return fns.reduce(function (prev, fn) {
      return fn(prev);
    }, input);
  };
}
var Observable = function () {
  function Observable2(subscribe) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }
  Observable2.prototype.lift = function (operator) {
    var observable2 = new Observable2();
    observable2.source = this;
    observable2.operator = operator;
    return observable2;
  };
  Observable2.prototype.subscribe = function (observerOrNext, error, complete) {
    var _this = this;
    var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
    errorContext(function () {
      var _a = _this, operator = _a.operator, source = _a.source;
      subscriber.add(operator ? operator.call(subscriber, source) : source ? _this._subscribe(subscriber) : _this._trySubscribe(subscriber));
    });
    return subscriber;
  };
  Observable2.prototype._trySubscribe = function (sink) {
    try {
      return this._subscribe(sink);
    } catch (err) {
      sink.error(err);
    }
  };
  Observable2.prototype.forEach = function (next, promiseCtor) {
    var _this = this;
    promiseCtor = getPromiseCtor(promiseCtor);
    return new promiseCtor(function (resolve, reject) {
      var subscriber = new SafeSubscriber({
        next: function (value) {
          try {
            next(value);
          } catch (err) {
            reject(err);
            subscriber.unsubscribe();
          }
        },
        error: reject,
        complete: resolve
      });
      _this.subscribe(subscriber);
    });
  };
  Observable2.prototype._subscribe = function (subscriber) {
    var _a;
    return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
  };
  Observable2.prototype[observable] = function () {
    return this;
  };
  Observable2.prototype.pipe = function () {
    var operations = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      operations[_i] = arguments[_i];
    }
    return pipeFromArray(operations)(this);
  };
  Observable2.prototype.toPromise = function (promiseCtor) {
    var _this = this;
    promiseCtor = getPromiseCtor(promiseCtor);
    return new promiseCtor(function (resolve, reject) {
      var value;
      _this.subscribe(function (x) {
        return value = x;
      }, function (err) {
        return reject(err);
      }, function () {
        return resolve(value);
      });
    });
  };
  Observable2.create = function (subscribe) {
    return new Observable2(subscribe);
  };
  return Observable2;
}();
function getPromiseCtor(promiseCtor) {
  var _a;
  return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
}
function isObserver(value) {
  return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
}
function isSubscriber(value) {
  return value && value instanceof Subscriber || isObserver(value) && isSubscription(value);
}
function hasLift(source) {
  return isFunction(source === null || source === void 0 ? void 0 : source.lift);
}
function operate(init) {
  return function (source) {
    if (hasLift(source)) {
      return source.lift(function (liftedSource) {
        try {
          return init(liftedSource, this);
        } catch (err) {
          this.error(err);
        }
      });
    }
    throw new TypeError("Unable to lift unknown Observable type");
  };
}
function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
  return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
}
var OperatorSubscriber = function (_super) {
  __extends(OperatorSubscriber2, _super);
  function OperatorSubscriber2(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
    var _this = _super.call(this, destination) || this;
    _this.onFinalize = onFinalize;
    _this.shouldUnsubscribe = shouldUnsubscribe;
    _this._next = onNext ? function (value) {
      try {
        onNext(value);
      } catch (err) {
        destination.error(err);
      }
    } : _super.prototype._next;
    _this._error = onError ? function (err) {
      try {
        onError(err);
      } catch (err2) {
        destination.error(err2);
      } finally {
        this.unsubscribe();
      }
    } : _super.prototype._error;
    _this._complete = onComplete ? function () {
      try {
        onComplete();
      } catch (err) {
        destination.error(err);
      } finally {
        this.unsubscribe();
      }
    } : _super.prototype._complete;
    return _this;
  }
  OperatorSubscriber2.prototype.unsubscribe = function () {
    var _a;
    if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
      var closed_1 = this.closed;
      _super.prototype.unsubscribe.call(this);
      !closed_1 && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
    }
  };
  return OperatorSubscriber2;
}(Subscriber);
var ObjectUnsubscribedError = createErrorClass(function (_super) {
  return function ObjectUnsubscribedErrorImpl() {
    _super(this);
    this.name = "ObjectUnsubscribedError";
    this.message = "object unsubscribed";
  };
});
var Subject = function (_super) {
  __extends(Subject2, _super);
  function Subject2() {
    var _this = _super.call(this) || this;
    _this.closed = false;
    _this.currentObservers = null;
    _this.observers = [];
    _this.isStopped = false;
    _this.hasError = false;
    _this.thrownError = null;
    return _this;
  }
  Subject2.prototype.lift = function (operator) {
    var subject = new AnonymousSubject(this, this);
    subject.operator = operator;
    return subject;
  };
  Subject2.prototype._throwIfClosed = function () {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
  };
  Subject2.prototype.next = function (value) {
    var _this = this;
    errorContext(function () {
      var e_1, _a;
      _this._throwIfClosed();
      if (!_this.isStopped) {
        if (!_this.currentObservers) {
          _this.currentObservers = Array.from(_this.observers);
        }
        try {
          for (var _b = __values(_this.currentObservers), _c = _b.next(); !_c.done; _c = _b.next()) {
            var observer = _c.value;
            observer.next(value);
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (_c && !_c.done && (_a = _b.return))
              _a.call(_b);
          } finally {
            if (e_1)
              throw e_1.error;
          }
        }
      }
    });
  };
  Subject2.prototype.error = function (err) {
    var _this = this;
    errorContext(function () {
      _this._throwIfClosed();
      if (!_this.isStopped) {
        _this.hasError = _this.isStopped = true;
        _this.thrownError = err;
        var observers = _this.observers;
        while (observers.length) {
          observers.shift().error(err);
        }
      }
    });
  };
  Subject2.prototype.complete = function () {
    var _this = this;
    errorContext(function () {
      _this._throwIfClosed();
      if (!_this.isStopped) {
        _this.isStopped = true;
        var observers = _this.observers;
        while (observers.length) {
          observers.shift().complete();
        }
      }
    });
  };
  Subject2.prototype.unsubscribe = function () {
    this.isStopped = this.closed = true;
    this.observers = this.currentObservers = null;
  };
  Object.defineProperty(Subject2.prototype, "observed", {
    get: function () {
      var _a;
      return ((_a = this.observers) === null || _a === void 0 ? void 0 : _a.length) > 0;
    },
    enumerable: false,
    configurable: true
  });
  Subject2.prototype._trySubscribe = function (subscriber) {
    this._throwIfClosed();
    return _super.prototype._trySubscribe.call(this, subscriber);
  };
  Subject2.prototype._subscribe = function (subscriber) {
    this._throwIfClosed();
    this._checkFinalizedStatuses(subscriber);
    return this._innerSubscribe(subscriber);
  };
  Subject2.prototype._innerSubscribe = function (subscriber) {
    var _this = this;
    var _a = this, hasError = _a.hasError, isStopped = _a.isStopped, observers = _a.observers;
    if (hasError || isStopped) {
      return EMPTY_SUBSCRIPTION;
    }
    this.currentObservers = null;
    observers.push(subscriber);
    return new Subscription(function () {
      _this.currentObservers = null;
      arrRemove(observers, subscriber);
    });
  };
  Subject2.prototype._checkFinalizedStatuses = function (subscriber) {
    var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, isStopped = _a.isStopped;
    if (hasError) {
      subscriber.error(thrownError);
    } else if (isStopped) {
      subscriber.complete();
    }
  };
  Subject2.prototype.asObservable = function () {
    var observable2 = new Observable();
    observable2.source = this;
    return observable2;
  };
  Subject2.create = function (destination, source) {
    return new AnonymousSubject(destination, source);
  };
  return Subject2;
}(Observable);
var AnonymousSubject = function (_super) {
  __extends(AnonymousSubject2, _super);
  function AnonymousSubject2(destination, source) {
    var _this = _super.call(this) || this;
    _this.destination = destination;
    _this.source = source;
    return _this;
  }
  AnonymousSubject2.prototype.next = function (value) {
    var _a, _b;
    (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.call(_a, value);
  };
  AnonymousSubject2.prototype.error = function (err) {
    var _a, _b;
    (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.call(_a, err);
  };
  AnonymousSubject2.prototype.complete = function () {
    var _a, _b;
    (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.complete) === null || _b === void 0 ? void 0 : _b.call(_a);
  };
  AnonymousSubject2.prototype._subscribe = function (subscriber) {
    var _a, _b;
    return (_b = (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber)) !== null && _b !== void 0 ? _b : EMPTY_SUBSCRIPTION;
  };
  return AnonymousSubject2;
}(Subject);
var dateTimestampProvider = {
  now: function () {
    return (dateTimestampProvider.delegate || Date).now();
  },
  delegate: void 0
};
var ReplaySubject = function (_super) {
  __extends(ReplaySubject2, _super);
  function ReplaySubject2(_bufferSize, _windowTime, _timestampProvider) {
    if (_bufferSize === void 0) {
      _bufferSize = Infinity;
    }
    if (_windowTime === void 0) {
      _windowTime = Infinity;
    }
    if (_timestampProvider === void 0) {
      _timestampProvider = dateTimestampProvider;
    }
    var _this = _super.call(this) || this;
    _this._bufferSize = _bufferSize;
    _this._windowTime = _windowTime;
    _this._timestampProvider = _timestampProvider;
    _this._buffer = [];
    _this._infiniteTimeWindow = true;
    _this._infiniteTimeWindow = _windowTime === Infinity;
    _this._bufferSize = Math.max(1, _bufferSize);
    _this._windowTime = Math.max(1, _windowTime);
    return _this;
  }
  ReplaySubject2.prototype.next = function (value) {
    var _a = this, isStopped = _a.isStopped, _buffer = _a._buffer, _infiniteTimeWindow = _a._infiniteTimeWindow, _timestampProvider = _a._timestampProvider, _windowTime = _a._windowTime;
    if (!isStopped) {
      _buffer.push(value);
      !_infiniteTimeWindow && _buffer.push(_timestampProvider.now() + _windowTime);
    }
    this._trimBuffer();
    _super.prototype.next.call(this, value);
  };
  ReplaySubject2.prototype._subscribe = function (subscriber) {
    this._throwIfClosed();
    this._trimBuffer();
    var subscription = this._innerSubscribe(subscriber);
    var _a = this, _infiniteTimeWindow = _a._infiniteTimeWindow, _buffer = _a._buffer;
    var copy = _buffer.slice();
    for (var i = 0; i < copy.length && !subscriber.closed; i += _infiniteTimeWindow ? 1 : 2) {
      subscriber.next(copy[i]);
    }
    this._checkFinalizedStatuses(subscriber);
    return subscription;
  };
  ReplaySubject2.prototype._trimBuffer = function () {
    var _a = this, _bufferSize = _a._bufferSize, _timestampProvider = _a._timestampProvider, _buffer = _a._buffer, _infiniteTimeWindow = _a._infiniteTimeWindow;
    var adjustedBufferSize = (_infiniteTimeWindow ? 1 : 2) * _bufferSize;
    _bufferSize < Infinity && adjustedBufferSize < _buffer.length && _buffer.splice(0, _buffer.length - adjustedBufferSize);
    if (!_infiniteTimeWindow) {
      var now = _timestampProvider.now();
      var last = 0;
      for (var i = 1; i < _buffer.length && _buffer[i] <= now; i += 2) {
        last = i;
      }
      last && _buffer.splice(0, last + 1);
    }
  };
  return ReplaySubject2;
}(Subject);
var Action = function (_super) {
  __extends(Action2, _super);
  function Action2(scheduler, work) {
    return _super.call(this) || this;
  }
  Action2.prototype.schedule = function (state, delay) {
    return this;
  };
  return Action2;
}(Subscription);
var intervalProvider = {
  setInterval: function (handler, timeout) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      args[_i - 2] = arguments[_i];
    }
    var delegate = intervalProvider.delegate;
    if (delegate === null || delegate === void 0 ? void 0 : delegate.setInterval) {
      return delegate.setInterval.apply(delegate, __spreadArray([handler, timeout], __read(args)));
    }
    return setInterval.apply(void 0, __spreadArray([handler, timeout], __read(args)));
  },
  clearInterval: function (handle) {
    var delegate = intervalProvider.delegate;
    return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearInterval) || clearInterval)(handle);
  },
  delegate: void 0
};
var AsyncAction = function (_super) {
  __extends(AsyncAction2, _super);
  function AsyncAction2(scheduler, work) {
    var _this = _super.call(this, scheduler, work) || this;
    _this.scheduler = scheduler;
    _this.work = work;
    _this.pending = false;
    return _this;
  }
  AsyncAction2.prototype.schedule = function (state, delay) {
    if (delay === void 0) {
      delay = 0;
    }
    if (this.closed) {
      return this;
    }
    this.state = state;
    var id = this.id;
    var scheduler = this.scheduler;
    if (id != null) {
      this.id = this.recycleAsyncId(scheduler, id, delay);
    }
    this.pending = true;
    this.delay = delay;
    this.id = this.id || this.requestAsyncId(scheduler, this.id, delay);
    return this;
  };
  AsyncAction2.prototype.requestAsyncId = function (scheduler, _id, delay) {
    if (delay === void 0) {
      delay = 0;
    }
    return intervalProvider.setInterval(scheduler.flush.bind(scheduler, this), delay);
  };
  AsyncAction2.prototype.recycleAsyncId = function (_scheduler, id, delay) {
    if (delay === void 0) {
      delay = 0;
    }
    if (delay != null && this.delay === delay && this.pending === false) {
      return id;
    }
    intervalProvider.clearInterval(id);
    return void 0;
  };
  AsyncAction2.prototype.execute = function (state, delay) {
    if (this.closed) {
      return new Error("executing a cancelled action");
    }
    this.pending = false;
    var error = this._execute(state, delay);
    if (error) {
      return error;
    } else if (this.pending === false && this.id != null) {
      this.id = this.recycleAsyncId(this.scheduler, this.id, null);
    }
  };
  AsyncAction2.prototype._execute = function (state, _delay) {
    var errored = false;
    var errorValue;
    try {
      this.work(state);
    } catch (e) {
      errored = true;
      errorValue = e ? e : new Error("Scheduled action threw falsy error");
    }
    if (errored) {
      this.unsubscribe();
      return errorValue;
    }
  };
  AsyncAction2.prototype.unsubscribe = function () {
    if (!this.closed) {
      var _a = this, id = _a.id, scheduler = _a.scheduler;
      var actions = scheduler.actions;
      this.work = this.state = this.scheduler = null;
      this.pending = false;
      arrRemove(actions, this);
      if (id != null) {
        this.id = this.recycleAsyncId(scheduler, id, null);
      }
      this.delay = null;
      _super.prototype.unsubscribe.call(this);
    }
  };
  return AsyncAction2;
}(Action);
var Scheduler = function () {
  function Scheduler2(schedulerActionCtor, now) {
    if (now === void 0) {
      now = Scheduler2.now;
    }
    this.schedulerActionCtor = schedulerActionCtor;
    this.now = now;
  }
  Scheduler2.prototype.schedule = function (work, delay, state) {
    if (delay === void 0) {
      delay = 0;
    }
    return new this.schedulerActionCtor(this, work).schedule(state, delay);
  };
  Scheduler2.now = dateTimestampProvider.now;
  return Scheduler2;
}();
var AsyncScheduler = function (_super) {
  __extends(AsyncScheduler2, _super);
  function AsyncScheduler2(SchedulerAction, now) {
    if (now === void 0) {
      now = Scheduler.now;
    }
    var _this = _super.call(this, SchedulerAction, now) || this;
    _this.actions = [];
    _this._active = false;
    _this._scheduled = void 0;
    return _this;
  }
  AsyncScheduler2.prototype.flush = function (action) {
    var actions = this.actions;
    if (this._active) {
      actions.push(action);
      return;
    }
    var error;
    this._active = true;
    do {
      if (error = action.execute(action.state, action.delay)) {
        break;
      }
    } while (action = actions.shift());
    this._active = false;
    if (error) {
      while (action = actions.shift()) {
        action.unsubscribe();
      }
      throw error;
    }
  };
  return AsyncScheduler2;
}(Scheduler);
var asyncScheduler = new AsyncScheduler(AsyncAction);
var async = asyncScheduler;
function isScheduler(value) {
  return value && isFunction(value.schedule);
}
var isArrayLike = function (x) {
  return x && typeof x.length === "number" && typeof x !== "function";
};
function isPromise(value) {
  return isFunction(value === null || value === void 0 ? void 0 : value.then);
}
function isInteropObservable(input) {
  return isFunction(input[observable]);
}
function isAsyncIterable(obj) {
  return Symbol.asyncIterator && isFunction(obj === null || obj === void 0 ? void 0 : obj[Symbol.asyncIterator]);
}
function createInvalidObservableTypeError(input) {
  return new TypeError("You provided " + (input !== null && typeof input === "object" ? "an invalid object" : "'" + input + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
}
function getSymbolIterator() {
  if (typeof Symbol !== "function" || !Symbol.iterator) {
    return "@@iterator";
  }
  return Symbol.iterator;
}
var iterator = getSymbolIterator();
function isIterable(input) {
  return isFunction(input === null || input === void 0 ? void 0 : input[iterator]);
}
function readableStreamLikeToAsyncGenerator(readableStream) {
  return __asyncGenerator(this, arguments, function readableStreamLikeToAsyncGenerator_1() {
    var reader, _a, value, done;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          reader = readableStream.getReader();
          _b.label = 1;
        case 1:
          _b.trys.push([1, , 9, 10]);
          _b.label = 2;
        case 2:
          return [4, __await(reader.read())];
        case 3:
          _a = _b.sent(), value = _a.value, done = _a.done;
          if (!done)
            return [3, 5];
          return [4, __await(void 0)];
        case 4:
          return [2, _b.sent()];
        case 5:
          return [4, __await(value)];
        case 6:
          return [4, _b.sent()];
        case 7:
          _b.sent();
          return [3, 2];
        case 8:
          return [3, 10];
        case 9:
          reader.releaseLock();
          return [7];
        case 10:
          return [2];
      }
    });
  });
}
function isReadableStreamLike(obj) {
  return isFunction(obj === null || obj === void 0 ? void 0 : obj.getReader);
}
function innerFrom(input) {
  if (input instanceof Observable) {
    return input;
  }
  if (input != null) {
    if (isInteropObservable(input)) {
      return fromInteropObservable(input);
    }
    if (isArrayLike(input)) {
      return fromArrayLike(input);
    }
    if (isPromise(input)) {
      return fromPromise(input);
    }
    if (isAsyncIterable(input)) {
      return fromAsyncIterable(input);
    }
    if (isIterable(input)) {
      return fromIterable(input);
    }
    if (isReadableStreamLike(input)) {
      return fromReadableStreamLike(input);
    }
  }
  throw createInvalidObservableTypeError(input);
}
function fromInteropObservable(obj) {
  return new Observable(function (subscriber) {
    var obs = obj[observable]();
    if (isFunction(obs.subscribe)) {
      return obs.subscribe(subscriber);
    }
    throw new TypeError("Provided object does not correctly implement Symbol.observable");
  });
}
function fromArrayLike(array) {
  return new Observable(function (subscriber) {
    for (var i = 0; i < array.length && !subscriber.closed; i++) {
      subscriber.next(array[i]);
    }
    subscriber.complete();
  });
}
function fromPromise(promise) {
  return new Observable(function (subscriber) {
    promise.then(function (value) {
      if (!subscriber.closed) {
        subscriber.next(value);
        subscriber.complete();
      }
    }, function (err) {
      return subscriber.error(err);
    }).then(null, reportUnhandledError);
  });
}
function fromIterable(iterable) {
  return new Observable(function (subscriber) {
    var e_1, _a;
    try {
      for (var iterable_1 = __values(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
        var value = iterable_1_1.value;
        subscriber.next(value);
        if (subscriber.closed) {
          return;
        }
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return))
          _a.call(iterable_1);
      } finally {
        if (e_1)
          throw e_1.error;
      }
    }
    subscriber.complete();
  });
}
function fromAsyncIterable(asyncIterable) {
  return new Observable(function (subscriber) {
    process(asyncIterable, subscriber).catch(function (err) {
      return subscriber.error(err);
    });
  });
}
function fromReadableStreamLike(readableStream) {
  return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
}
function process(asyncIterable, subscriber) {
  var asyncIterable_1, asyncIterable_1_1;
  var e_2, _a;
  return __awaiter(this, void 0, void 0, function () {
    var value, e_2_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, 6, 11]);
          asyncIterable_1 = __asyncValues(asyncIterable);
          _b.label = 1;
        case 1:
          return [4, asyncIterable_1.next()];
        case 2:
          if (!(asyncIterable_1_1 = _b.sent(), !asyncIterable_1_1.done))
            return [3, 4];
          value = asyncIterable_1_1.value;
          subscriber.next(value);
          if (subscriber.closed) {
            return [2];
          }
          _b.label = 3;
        case 3:
          return [3, 1];
        case 4:
          return [3, 11];
        case 5:
          e_2_1 = _b.sent();
          e_2 = { error: e_2_1 };
          return [3, 11];
        case 6:
          _b.trys.push([6, , 9, 10]);
          if (!(asyncIterable_1_1 && !asyncIterable_1_1.done && (_a = asyncIterable_1.return)))
            return [3, 8];
          return [4, _a.call(asyncIterable_1)];
        case 7:
          _b.sent();
          _b.label = 8;
        case 8:
          return [3, 10];
        case 9:
          if (e_2)
            throw e_2.error;
          return [7];
        case 10:
          return [7];
        case 11:
          subscriber.complete();
          return [2];
      }
    });
  });
}
function throwError(errorOrErrorFactory, scheduler) {
  var errorFactory = isFunction(errorOrErrorFactory) ? errorOrErrorFactory : function () {
    return errorOrErrorFactory;
  };
  var init = function (subscriber) {
    return subscriber.error(errorFactory());
  };
  return new Observable(scheduler ? function (subscriber) {
    return scheduler.schedule(init, 0, subscriber);
  } : init);
}
function isValidDate(value) {
  return value instanceof Date && !isNaN(value);
}
function map(project, thisArg) {
  return operate(function (source, subscriber) {
    var index = 0;
    source.subscribe(createOperatorSubscriber(subscriber, function (value) {
      subscriber.next(project.call(thisArg, value, index++));
    }));
  });
}
function timer(dueTime, intervalOrScheduler, scheduler) {
  if (dueTime === void 0) {
    dueTime = 0;
  }
  if (scheduler === void 0) {
    scheduler = async;
  }
  var intervalDuration = -1;
  if (intervalOrScheduler != null) {
    if (isScheduler(intervalOrScheduler)) {
      scheduler = intervalOrScheduler;
    } else {
      intervalDuration = intervalOrScheduler;
    }
  }
  return new Observable(function (subscriber) {
    var due = isValidDate(dueTime) ? +dueTime - scheduler.now() : dueTime;
    if (due < 0) {
      due = 0;
    }
    var n = 0;
    return scheduler.schedule(function () {
      if (!subscriber.closed) {
        subscriber.next(n++);
        if (0 <= intervalDuration) {
          this.schedule(void 0, intervalDuration);
        } else {
          subscriber.complete();
        }
      }
    }, due);
  });
}
function filter(predicate, thisArg) {
  return operate(function (source, subscriber) {
    var index = 0;
    source.subscribe(createOperatorSubscriber(subscriber, function (value) {
      return predicate.call(thisArg, value, index++) && subscriber.next(value);
    }));
  });
}
function catchError(selector) {
  return operate(function (source, subscriber) {
    var innerSub = null;
    var syncUnsub = false;
    var handledResult;
    innerSub = source.subscribe(createOperatorSubscriber(subscriber, void 0, void 0, function (err) {
      handledResult = innerFrom(selector(err, catchError(selector)(source)));
      if (innerSub) {
        innerSub.unsubscribe();
        innerSub = null;
        handledResult.subscribe(subscriber);
      } else {
        syncUnsub = true;
      }
    }));
    if (syncUnsub) {
      innerSub.unsubscribe();
      innerSub = null;
      handledResult.subscribe(subscriber);
    }
  });
}
function debounceTime(dueTime, scheduler) {
  if (scheduler === void 0) {
    scheduler = asyncScheduler;
  }
  return operate(function (source, subscriber) {
    var activeTask = null;
    var lastValue = null;
    var lastTime = null;
    var emit = function () {
      if (activeTask) {
        activeTask.unsubscribe();
        activeTask = null;
        var value = lastValue;
        lastValue = null;
        subscriber.next(value);
      }
    };
    function emitWhenIdle() {
      var targetTime = lastTime + dueTime;
      var now = scheduler.now();
      if (now < targetTime) {
        activeTask = this.schedule(void 0, targetTime - now);
        subscriber.add(activeTask);
        return;
      }
      emit();
    }
    source.subscribe(createOperatorSubscriber(subscriber, function (value) {
      lastValue = value;
      lastTime = scheduler.now();
      if (!activeTask) {
        activeTask = scheduler.schedule(emitWhenIdle, dueTime);
        subscriber.add(activeTask);
      }
    }, function () {
      emit();
      subscriber.complete();
    }, void 0, function () {
      lastValue = activeTask = null;
    }));
  });
}
function distinctUntilChanged(comparator, keySelector) {
  if (keySelector === void 0) {
    keySelector = identity;
  }
  comparator = comparator !== null && comparator !== void 0 ? comparator : defaultCompare;
  return operate(function (source, subscriber) {
    var previousKey;
    var first = true;
    source.subscribe(createOperatorSubscriber(subscriber, function (value) {
      var currentKey = keySelector(value);
      if (first || !comparator(previousKey, currentKey)) {
        first = false;
        previousKey = currentKey;
        subscriber.next(value);
      }
    }));
  });
}
function defaultCompare(a, b) {
  return a === b;
}
function distinctUntilKeyChanged(key, compare) {
  return distinctUntilChanged(function (x, y) {
    return compare ? compare(x[key], y[key]) : x[key] === y[key];
  });
}
function switchMap(project, resultSelector) {
  return operate(function (source, subscriber) {
    var innerSubscriber = null;
    var index = 0;
    var isComplete = false;
    var checkComplete = function () {
      return isComplete && !innerSubscriber && subscriber.complete();
    };
    source.subscribe(createOperatorSubscriber(subscriber, function (value) {
      innerSubscriber === null || innerSubscriber === void 0 ? void 0 : innerSubscriber.unsubscribe();
      var innerIndex = 0;
      var outerIndex = index++;
      innerFrom(project(value, outerIndex)).subscribe(innerSubscriber = createOperatorSubscriber(subscriber, function (innerValue) {
        return subscriber.next(resultSelector ? resultSelector(value, innerValue, outerIndex, innerIndex++) : innerValue);
      }, function () {
        innerSubscriber = null;
        checkComplete();
      }));
    }, function () {
      isComplete = true;
      checkComplete();
    }));
  });
}
function tap(observerOrNext, error, complete) {
  var tapObserver = isFunction(observerOrNext) || error || complete ? { next: observerOrNext, error, complete } : observerOrNext;
  return tapObserver ? operate(function (source, subscriber) {
    var _a;
    (_a = tapObserver.subscribe) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
    var isUnsub = true;
    source.subscribe(createOperatorSubscriber(subscriber, function (value) {
      var _a2;
      (_a2 = tapObserver.next) === null || _a2 === void 0 ? void 0 : _a2.call(tapObserver, value);
      subscriber.next(value);
    }, function () {
      var _a2;
      isUnsub = false;
      (_a2 = tapObserver.complete) === null || _a2 === void 0 ? void 0 : _a2.call(tapObserver);
      subscriber.complete();
    }, function (err) {
      var _a2;
      isUnsub = false;
      (_a2 = tapObserver.error) === null || _a2 === void 0 ? void 0 : _a2.call(tapObserver, err);
      subscriber.error(err);
    }, function () {
      var _a2, _b;
      if (isUnsub) {
        (_a2 = tapObserver.unsubscribe) === null || _a2 === void 0 ? void 0 : _a2.call(tapObserver);
      }
      (_b = tapObserver.finalize) === null || _b === void 0 ? void 0 : _b.call(tapObserver);
    }));
  }) : identity;
}
var defaultThrottleConfig = {
  leading: true,
  trailing: false
};
function throttle(durationSelector, config2) {
  if (config2 === void 0) {
    config2 = defaultThrottleConfig;
  }
  return operate(function (source, subscriber) {
    var leading = config2.leading, trailing = config2.trailing;
    var hasValue = false;
    var sendValue = null;
    var throttled = null;
    var isComplete = false;
    var endThrottling = function () {
      throttled === null || throttled === void 0 ? void 0 : throttled.unsubscribe();
      throttled = null;
      if (trailing) {
        send();
        isComplete && subscriber.complete();
      }
    };
    var cleanupThrottling = function () {
      throttled = null;
      isComplete && subscriber.complete();
    };
    var startThrottle = function (value) {
      return throttled = innerFrom(durationSelector(value)).subscribe(createOperatorSubscriber(subscriber, endThrottling, cleanupThrottling));
    };
    var send = function () {
      if (hasValue) {
        hasValue = false;
        var value = sendValue;
        sendValue = null;
        subscriber.next(value);
        !isComplete && startThrottle(value);
      }
    };
    source.subscribe(createOperatorSubscriber(subscriber, function (value) {
      hasValue = true;
      sendValue = value;
      !(throttled && !throttled.closed) && (leading ? send() : startThrottle(value));
    }, function () {
      isComplete = true;
      !(trailing && hasValue && throttled && !throttled.closed) && subscriber.complete();
    }));
  });
}
function throttleTime(duration, scheduler, config2) {
  if (scheduler === void 0) {
    scheduler = asyncScheduler;
  }
  if (config2 === void 0) {
    config2 = defaultThrottleConfig;
  }
  var duration$ = timer(duration, scheduler);
  return throttle(function () {
    return duration$;
  }, config2);
}
function fromFetch(input, initWithSelector) {
  if (initWithSelector === void 0) {
    initWithSelector = {};
  }
  var selector = initWithSelector.selector, init = __rest(initWithSelector, ["selector"]);
  return new Observable(function (subscriber) {
    var controller = new AbortController();
    var signal = controller.signal;
    var abortable = true;
    var outerSignal = init.signal;
    if (outerSignal) {
      if (outerSignal.aborted) {
        controller.abort();
      } else {
        var outerSignalHandler_1 = function () {
          if (!signal.aborted) {
            controller.abort();
          }
        };
        outerSignal.addEventListener("abort", outerSignalHandler_1);
        subscriber.add(function () {
          return outerSignal.removeEventListener("abort", outerSignalHandler_1);
        });
      }
    }
    var perSubscriberInit = __assign(__assign({}, init), { signal });
    var handleError = function (err) {
      abortable = false;
      subscriber.error(err);
    };
    fetch(input, perSubscriberInit).then(function (response) {
      if (selector) {
        innerFrom(selector(response)).subscribe(createOperatorSubscriber(subscriber, void 0, function () {
          abortable = false;
          subscriber.complete();
        }, handleError));
      } else {
        abortable = false;
        subscriber.next(response);
        subscriber.complete();
      }
    }).catch(handleError);
    return function () {
      if (abortable) {
        controller.abort();
      }
    };
  });
}
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp2(target, key, result);
  return result;
};
class HttpService {
  constructor(base, config2) {
    __publicField(this, "_catch$", new ReplaySubject(1));
    __publicField(this, "_trigger$", new Subject());
    var _a, _b;
    this._trigger$.pipe(throttleTime((_a = config2 == null ? void 0 : config2.throttle) != null ? _a : 0), debounceTime((_b = config2 == null ? void 0 : config2.debounce) != null ? _b : 0), tap(() => this._catch$.next({ data: null, state: HTTP_EState.block })), map((data) => this.mapReq(base.url, data != null ? data : base.data, config2)), switchMap((req) => HTTP_REQUEST_INTERCEPTORS.use(req.clone())), switchMap((req) => this.mapSource(req, base.converter)), catchError((e, origin) => {
      var _a2, _b2;
      this._catch$.next({
        data: null,
        state: HTTP_EState.error,
        code: Number((_a2 = e.cause) == null ? void 0 : _a2.errcode) || Number((_b2 = e.cause) == null ? void 0 : _b2.code),
        message: e.errmsg || e.message
      });
      return origin;
    })).subscribe((v) => this._catch$.next({
      data: v,
      state: HTTP_EState.success
    }));
  }
  get result$() {
    return this._catch$.pipe(distinctUntilKeyChanged("state"));
  }
  get data$() {
    return this._catch$.pipe(filter((v) => v.state !== HTTP_EState.block), map((v) => v.data));
  }
  get state$() {
    return this._catch$.pipe(map((v) => v.state), distinctUntilChanged());
  }
  get code$() {
    return this._catch$.pipe(filter((v) => v.state === HTTP_EState.error), map((v) => {
      var _a;
      return (_a = v.code) != null ? _a : 500;
    }));
  }
  get message$() {
    return this._catch$.pipe(filter((v) => v.state === HTTP_EState.error), map((v) => {
      var _a;
      return (_a = v.message) != null ? _a : "\u672A\u77E5\u539F\u56E0";
    }));
  }
  send(data) {
    this._trigger$.next(data != null ? data : null);
  }
  mapType(type, data) {
    if (type) {
      return { "Content-Type": type };
    } else {
      switch (FTypeMatcher(data)) {
        case "formdata":
          return {};
        default:
          return { "Content-Type": HTTP_EContent.json };
      }
    }
  }
  mapReq(url, data, config2) {
    var _a, _b;
    return new Request(`${(_a = config2 == null ? void 0 : config2.proxy) != null ? _a : HTTP_CONFIG.proxy}/${url}`, {
      method: "POST",
      headers: {
        "Core-Proxy-Tag": `/${(_b = config2 == null ? void 0 : config2.proxy) != null ? _b : "api"}`,
        ...this.mapType(config2 == null ? void 0 : config2.type, data),
        ...config2 == null ? void 0 : config2.headers
      },
      body: data
    });
  }
  checkRes(res) {
    switch (res.status) {
      case 200:
      case 400:
      case 420:
        return;
      case 403:
        throw new Error("\u65E0\u6743\u9650", { cause: { code: res.status } });
      case 404:
        throw new Error("\u5730\u5740\u9519\u8BEF", { cause: { code: res.status } });
      default:
        throw new Error("\u7F51\u7EDC\u4E0D\u4F73", { cause: { code: res.status } });
    }
  }
}
let HTTP_SCommon = class extends HttpService {
  constructor(base, config2) {
    super(base, config2);
  }
  mapSource(req, converter) {
    return fromFetch(req).pipe(tap((res) => this.checkRes(res)), switchMap((res) => HTTP_RESPONSE_INTERCEPTORS.use(res)), switchMap((res) => this.mapRes(res)), map((data) => {
      var _a;
      return (_a = converter == null ? void 0 : converter(data)) != null ? _a : null;
    }), catchError((e) => throwError(() => e)));
  }
  async mapRes(res) {
    const temp = await res.json();
    if (temp == null ? void 0 : temp.success) {
      return temp.data;
    }
    throw new Error((temp == null ? void 0 : temp.message) || (temp == null ? void 0 : temp.errmsg), {
      cause: { code: Number(temp == null ? void 0 : temp.errcode) }
    });
  }
};
HTTP_SCommon = __decorateClass([
  FSealDecorator
], HTTP_SCommon);
let HTTP_SDownload = class extends HttpService {
  constructor(base, config2) {
    super(base, config2);
  }
  mapSource(req) {
    return fromFetch(req).pipe(tap((res) => this.checkRes(res)), switchMap((res) => this.mapRes(res)), switchMap((file) => this.download(file)), catchError((e) => throwError(() => e)));
  }
  async mapRes(res) {
    const name = FHeaderMatcher(res.headers, "content-disposition", "filename").get("filename");
    if (name) {
      return new File([await res.blob()], name);
    } else {
      const temp = await res.json();
      throw new Error((temp == null ? void 0 : temp.message) || (temp == null ? void 0 : temp.errmsg), {
        cause: { code: Number(temp == null ? void 0 : temp.errcode) }
      });
    }
  }
  async download(file) {
    const url = URL.createObjectURL(file);
    await FDownLoadHandler(url, file.name);
    URL.revokeObjectURL(url);
  }
};
HTTP_SDownload = __decorateClass([
  FSealDecorator
], HTTP_SDownload);
export { EKeyCode, FCookieMatcher, FDownLoadHandler, FFormConverter, FHeaderMatcher, FLabelSizeCalculator, FSealDecorator, FTypeMatcher, FUrlMatcher, HTTP_CONFIG, HTTP_EContent, HTTP_EState, HTTP_REQUEST_INTERCEPTORS, HTTP_RESPONSE_INTERCEPTORS, HTTP_SCommon, HTTP_SDownload };
