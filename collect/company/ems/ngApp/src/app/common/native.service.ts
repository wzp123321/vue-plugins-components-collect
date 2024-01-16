import { Injectable } from '@angular/core';

declare const window: Window & {
  WVJBCallbacks: any;
  WebViewJavascriptBridge: any;
};

@Injectable({
  providedIn: 'root',
})
export class NativeService {
  funs: any = { goBack: [], RFIDListener: [] };

  constructor() {
    let that = this;
    this.setupWebViewJavascriptBridge(function (bridge: any) {
      if (bridge.registerHandler) {
        for (let k in that.funs) {
          bridge.registerHandler(
            k,
            (function (fname) {
              return function (data: any, callback: any) {
                for (
                  let i: number = 0, len = that.funs[fname].length;
                  i < len;
                  i++
                ) {
                  if (!that.funs[fname][i](data, callback)) {
                    break;
                  }
                }
              };
            })(k)
          );
        }
      }
    });
  }

  /**搭建与原生交互的通道，固定写法*/
  setupWebViewJavascriptBridge(callback: any): void {
    if (window.WebViewJavascriptBridge) {
      return callback(window.WebViewJavascriptBridge);
    }

    if (window.WVJBCallbacks) {
      return window.WVJBCallbacks.push(callback);
    }
    window.WVJBCallbacks = [callback];
    document.addEventListener(
      'WebViewJavascriptBridgeReady',
      function () {
        //  moduleConfig.window.WebViewJavascriptBridge = (window as any).WebViewJavascriptBridge;
        for (let i = 0, len = window.WVJBCallbacks.length; i < len; i++) {
          window.WVJBCallbacks[i](window.WebViewJavascriptBridge);
        }
      },
      false
    );
    const WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    // WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
    WVJBIframe.src = 'https://__bridge_loaded__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function () {
      document.documentElement.removeChild(WVJBIframe);
    }, 0);
  }

  /**
   * 调用原生接口
   * @param fName 原生接口名称
   * @param params 接口参数json
   * @param success 调用成功回调函数
   * @param fault 调用失败回调函数（暂未实现）
   */
  nativeCall(fName: any, params: any, success: any, fault: any): void {
    try {
      this.setupWebViewJavascriptBridge(function (bridge: any) {
        bridge.callHandler &&
          bridge.callHandler(fName, params, function (result: any) {
            typeof success === 'function' ? success(result) : '';
          });
      });
    } catch (E) {
      console.log(E);
    }
  }

  /**
   * 注册一个函数给原生调用或注册一个事件侦听器
   * @param fName  注册的函数名或侦听器名
   * @param fun  注册的函数体或侦听器触发的执行函数
   */
  registerHandler(fName: any, fun: any): void {
    const nameSpace = 'auto';
    if (this.funs[fName]) {
      this.funs[fName].unshift(fun);
    }
  }
}
