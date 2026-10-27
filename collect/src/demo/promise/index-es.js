const resolvePromise = (promise2, x, resolve, reject) => {
  // 循环引用报错
  if(x === promise2){
    // reject报错
    reject(new TypeError('Chaining cycle detected for promise'));
    return;
  }
  // 防止多次调用
  let called;
  // x不是null 且x是对象或者函数
  if (x != null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      // A+规定，声明then = x的then方法
      const then = x.then;
      // 如果then是函数，就默认是promise了
      if (typeof then === 'function') { 
        // 就让then执行 第一个参数是this   后面是成功的回调 和 失败的回调
        then.call(x, y => {
          // 成功和失败只能调用一个
          if (called) return;
          called = true;
          // resolve的结果依旧是promise 那就继续解析
          resolvePromise(promise2, y, resolve, reject);
        }, err => {
          // 成功和失败只能调用一个
          if (called) return;
          called = true;
          reject(err);// 失败了就失败了
        })
      } else {
        resolve(x); // 直接成功即可
      }
    } catch (e) {
      // 也属于失败
      if (called) return;
      called = true;
      // 取then出错了那就不要在继续执行了
      reject(e); 
    }
  } else {
    resolve(x);
  }
}

// Class
class CustomPromise {
  // 状态
  status = 'pending'; // pending fulfilled rejected

  // 成功回调
  successCallback = [];

  // 失败回调
  failCallback = [];

  //  构造函数
  constructor(executor) {
    this.status = 'pending';
    this.result = undefined;
    this.successCallback = [];
    this.failCallback = [];

    executor(this.resolve, this.reject);
  }

  // 如果是resolve
  resolve = (result) => {
    if (this.status === 'pending') {
      this.status = 'fulfilled';
      this.value = result;

      this.successCallback.forEach((cb) => {
        cb(result);
      });
    }
  };

  // 如果是reject
  reject = (result) => {
    if (this.status === 'pending') {
      this.status = 'rejected';
      this.value = result;

      this.failCallback.forEach((cb) => {
        cb(result);
      });
    }
  };

  // then
  then = (successCb, failCb) => {
       // successCb如果不是函数，就忽略successCb，直接返回value
       successCb = typeof successCb === 'function' ? successCb : value => value;
       // failCb如果不是函数，就忽略failCb，直接扔出错误
       failCb = typeof failCb === 'function' ? failCb : err => { throw err };
   

    const promise2 = new CustomPromise((resolve, reject) => {
      if (this.status === 'fulfilled') {
        // 判断返回值类型
        const successRes = successCb(this.value);
        resolvePromise(promise2, successRes, resolve, reject);
      } else if (this.status === 'rejected') {
        const failRes = failCb(this.value);
          resolvePromise(promise2, failRes, resolve, reject);
      } else if (this.status === 'pending') {
        // 解决异步
        if (successCb) {
          this.successCallback.push(() => {
            const successRes = successCb(this.value);
            resolvePromise(promise2, successRes, resolve, reject);
          });
        }
        if (failCb) {
          this.failCallback.push(() => {
            const failRes = failCb(this.value);
            resolvePromise(promise2, failRes, resolve, reject);
          });
        }
      }
    });

    return promise2
  };
}

// test.html 通过 script 标签全局加载后以小写类名 customPromise 使用, 显式挂到全局保持兼容
window.customPromise = CustomPromise;

