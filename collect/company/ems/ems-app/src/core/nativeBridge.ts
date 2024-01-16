import type { Common_IObject } from '@/api/model';
import type { Common_EBridgeType } from '@/config/enum';

// 与原生搭桥
declare const window: Window & {
  WVJBCallbacks: any;
  WebViewJavascriptBridge: any;
};

/**
 * 搭桥服务
 */
class NativeBridgeService {
  private functionList: {
    [key: string]: Array<(result: number | string | boolean | Common_IObject, callBack: any) => any>;
  } = {
    goBack: [],
    RFIDListener: [],
  };

  constructor() {
    let that = this;
    this.setupWebViewJavascriptBridge(function (bridge: any) {
      if (bridge.registerHandler) {
        for (let k in that.functionList) {
          bridge.registerHandler(
            k,
            (function (fname) {
              return function (data: any, callback: any) {
                for (let i: number = 0, len = that.functionList[fname].length; i < len; i++) {
                  if (!that.functionList[fname][i](data, callback)) {
                    break;
                  }
                }
              };
            })(k),
          );
        }
      }
    });
  }

  /**
   * 搭建与原生交互的通道，固定写法
   */
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
        for (let i = 0, len = window.WVJBCallbacks.length; i < len; i++) {
          window.WVJBCallbacks[i](window.WebViewJavascriptBridge);
        }
      },
      false,
    );
    const WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'https://__bridge_loaded__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function () {
      document.documentElement.removeChild(WVJBIframe);
    }, 0);
  }

  /**
   * 调用原生接口
   * @param functionName 原生接口名称
   * @param params 接口参数json
   * @param successCb 调用成功回调函数
   * @param failCb 调用失败回调函数（暂未实现）
   */
  public nativeCall(
    functionName: Common_EBridgeType,
    params: Common_IObject,
    successCb: (result: number | string | boolean | Common_IObject) => void,
    failCb?: (result: number | string | boolean | Common_IObject) => void,
  ): void {
    try {
      console.log('调用原生方法---------------', functionName, params);
      this.setupWebViewJavascriptBridge(function (bridge: any) {
        bridge.callHandler &&
          bridge.callHandler(functionName, params, function (result: any) {
            typeof successCb === 'function' ? successCb(result) : '';
          });
      });
    } catch (E) {
      console.log(E);
    }
  }

  /**
   * 注册一个函数给原生调用或注册一个事件侦听器
   * @param functionName  注册的函数名或侦听器名
   * @param fun  注册的函数体或侦听器触发的执行函数
   */
  registerHandler(functionName: string, fun: (result: number | string | boolean | Common_IObject) => void): void {
    if (this.functionList[functionName]) {
      this.functionList[functionName].unshift(fun);
    }
  }
}

const nativeBridgeService = new NativeBridgeService();
Object.freeze(nativeBridgeService);

export default nativeBridgeService;
