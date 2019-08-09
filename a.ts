interface props {
  data: {}
}
interface iData {
  [key: string]: any;
}
interface nData {
  [key: number]: Dep;
}

// Vue
class Vue {
  public _data: {};
  constructor(props: props) {
    let data = this._data = props.data;
    Object.keys(data).forEach(key => {
      this._proxy(key)
    })
    observe(data);
  }

  $Watch(exp: string, cb: Function) {
    return new Watcher(this, exp, cb);
  }
  
  // 将所有的 data 代理到 Vue 上
  private _proxy(key: string) {
    Object.defineProperty(this, key, {
      enumerable: false,
      get: () => {
        return this._data[key]
      },
      set: (newVal: any) => {
        this._data[key] = newVal
      }
    })
  }
}

// observe
class Observe {
  private data: {};
  constructor(data: iData) {
    this.data = data;
    this.walk()
  }

  private walk() {
    Object.keys(this.data).forEach(key => {
      defineReactive(this.data, key, this.data[key])
    })
  }

}
function observe(data: iData) {
  if (data === null || data === undefined || typeof data !== "object")
    return;
  return new Observe(data);
}

function defineReactive(obj: iData, key: string, val: any) {
  let dep = new Dep();
  observe(val);
  Object.defineProperty(obj, key, {
    enumerable: false,
    get: () => {
      if (Dep.target !== null) {
        dep.depend()
      }
      return val;
    },
    set: (newVal) => {
      if (newVal === val)
        return;

      val = newVal
      observe(newVal)
      dep.notify()
    }
  })
}

// Dep
let uid = 0;
class Dep {
  public id: number;
  private subs: Array<Watcher>;
  public static target: Watcher = null;
  constructor() {
    this.id = uid++;
    this.subs = [];
  }

  public depend() {
    Dep.target.addDep(this);
  }

  public addSub(sub) {
    this.subs.push(sub)
  }

  public notify() {
    this.subs.forEach(w => {
      w.update()
    })
  }
}

// Watcher
class Watcher {
  private depIds: Set<number> = new Set();
  private vm: Vue;
  private exp: string;
  private cb: Function;
  private val: any;
  constructor(vm: Vue, exp: string, cb: Function) {
    this.vm = vm;
    this.exp = exp;
    this.cb = cb;
    this.val = this.getNewVal(); // 首次获取值
  }

  public update() {
    let val = this.getNewVal(); // 获取最新的值
    if (val !== this.val) {
      this.val = val;
      this.cb.call(this.vm, val)
    }
  }

  private getNewVal() {
    Dep.target = this;
    let val = this.vm._data[this.exp]
    Dep.target = null;
    return val;
  }

  addDep(dep: Dep) {
    if (!this.depIds.has(dep.id)) {
      this.depIds.add(dep.id);
      dep.addSub(this);
    }
  }
}

let demo = new Vue({
  data: {
      text: ""
  }
})

let input: HTMLInputElement = document.getElementById("input") as HTMLInputElement;
let app = document.getElementById("app")

input.addEventListener("input", e => {
  (<any>demo).text = (<any>e.target).value;
})

demo.$Watch("text", (str) => {
  app.innerHTML = str
})