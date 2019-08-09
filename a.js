// Vue
var Vue = /** @class */ (function () {
    function Vue(props) {
        var _this = this;
        var data = this._data = props.data;
        Object.keys(data).forEach(function (key) {
            _this._proxy(key);
        });
        observe(this._data);
    }
    Vue.prototype.$Watch = function (exp, cb) {
        return new Watcher(this, exp, cb);
    };
    // 将所有的 data 代理到 Vue 上
    Vue.prototype._proxy = function (key) {
        var _this = this;
        Object.defineProperty(this, key, {
            enumerable: false,
            get: function () {
                return _this._data[key];
            },
            set: function (newVal) {
                _this._data[key] = newVal;
            }
        });
    };
    return Vue;
}());
// observe
var Observe = /** @class */ (function () {
    function Observe(data) {
        this.data = data;
        this.walk();
    }
    Observe.prototype.walk = function () {
        var _this = this;
        Object.keys(this.data).forEach(function (key) {
            defineReactive(_this.data, key, _this.data[key]);
        });
    };
    return Observe;
}());
function observe(data) {
    if (data === null || data === undefined || typeof data !== "object")
        return;
    return new Observe(data);
}
function defineReactive(obj, key, val) {
    var dep = new Dep();
    observe(val);
    Object.defineProperty(obj, key, {
        enumerable: false,
        get: function () {
            if (Dep.target !== null) {
                dep.depend();
            }
            return val;
        },
        set: function (newVal) {
            if (newVal === val)
                return;
            console.log(val, typeof val, "before");
            val = newVal;
            console.log(val, typeof val, "after");
            observe(newVal);
            dep.notify();
        }
    });
}
// Dep
var uid = 0;
var Dep = /** @class */ (function () {
    function Dep() {
        this.id = uid++;
        this.subs = [];
    }
    Dep.prototype.depend = function () {
        Dep.target.addDep(this);
    };
    Dep.prototype.addSub = function (sub) {
        this.subs.push(sub);
    };
    Dep.prototype.notify = function () {
        this.subs.forEach(function (w) {
            w.update();
        });
    };
    Dep.target = null;
    return Dep;
}());
// Watcher
var Watcher = /** @class */ (function () {
    function Watcher(vm, exp, cb) {
        this.depIds = new Set();
        this.vm = vm;
        this.exp = exp;
        this.cb = cb;
        this.val = this.getNewVal(); // 首次获取值
    }
    Watcher.prototype.update = function () {
        var val = this.getNewVal(); // 获取最新的值
        if (val !== this.val) {
            this.val = val;
            this.cb.call(this.vm, val);
        }
    };
    Watcher.prototype.getNewVal = function () {
        Dep.target = this;
        var val = this.vm._data[this.exp];
        Dep.target = null;
        return val;
    };
    Watcher.prototype.addDep = function (dep) {
        if (!this.depIds.has(dep.id)) {
            this.depIds.add(dep.id);
            dep.addSub(this);
        }
    };
    return Watcher;
}());
var demo = new Vue({
    data: {
        text: ""
    }
});
var input = document.getElementById("input");
var app = document.getElementById("app");
input.addEventListener("input", function (e) {
    demo.text = e.target.value;
});
demo.$Watch("text", function (str) {
    app.innerHTML = str;
});
