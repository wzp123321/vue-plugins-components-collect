import { moduleConfig } from './module-config';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataFactoryService {
  dataConfig: any = {
    simulate: false,
    httpUrl: '',
    data: {
      login: {
        simulate: true,
        method: 'post',
        description: '登录信息，用于在开发时浏览器中调试页面用',
        simulateUrl: 'assets/data/login.json',
      },
      // 考核接口文档
      serviceList: {
        url: 'http://36.152.29.162:60133/hlms/api/quality/service/list',
        simulate: false,
        method: 'post',
        description: '服务考核列表',
        simulateUrl: 'assets/data/serviceList.json',
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    },
  };
  data: any = {};

  constructor(private ajaxService: HttpClient) {
    /**
     * 将appConfig中配置的接口转换成方法，方法支持5个参数
     * 1：接口传给后台的参数，json对象
     * 2：接口成功的回调函数
     * 3：接口请求过程中是否展示loading框
     * 4：id号，动态追加在url后面的参数,仅限于get请求，post时该参数请省略
     * 5：请求的消息头配置
     */
    const that = this;
    for (const name in this.dataConfig.data) {
      const api: any = this.dataConfig.data[name];
      if (this.dataConfig.simulate) {
        that.data[name] = function (arg: any, callBack: any) {
          return that.ajaxService.get(api.simulateUrl, arg);
        };
      } else {
        if (api.simulate) {
          that.data[name] = function (arg: any, callBack: any) {
            return that.ajaxService.get(api.simulateUrl, arg);
          };
        } else {
          // post请求
          if (api.method === 'post') {
            that.data[name] = function (arg: any, isShowLoading: boolean, headersConfig: any) {
              if (isShowLoading) {
                // that.ajaxService.showLoading();
              }
              let httpUrlConfig;
              if (arg.ipIf) {
                httpUrlConfig = '';
                delete arg.ipIf;
              } else {
                httpUrlConfig = moduleConfig.iomUrl;
              }
              // 合并headers
              const headers = Object.assign({}, api.headers ? api.headers : {}, headersConfig || {}, {
                tenantCode: moduleConfig.tenantId,
                token: moduleConfig.token,
              });
              // tslint:disable-next-line:max-line-length
              const observable = that.ajaxService.post(httpUrlConfig + api.url, arg, {
                headers: new HttpHeaders(headers),
              }); // ajax请求返回的observable对象
              return observable;
            };
            // get请求
          } else {
            that.data[name] = function (arg: any, isShowLoading: any, headersConfig: any, id: any) {
              id = id || ''; //
              if (isShowLoading) {
                // that.ajaxService.showLoading();
              }
              let httpUrlConfig;
              if (arg.ipIf) {
                httpUrlConfig = '';
                delete arg.ipIf;
              } else {
                httpUrlConfig = moduleConfig.iomUrl;
              }
              // 合并headers
              const headers = Object.assign({}, api.headers ? api.headers : {}, headersConfig || {}, {
                tenantCode: moduleConfig.tenantId,
                token: moduleConfig.token,
              });
              // 处理arg
              let params = '';
              for (const k in arg) {
                if (params) {
                  params = params + '&' + k + '=' + arg[k];
                } else {
                  params = '?' + k + '=' + arg[k];
                }
              }
              // tslint:disable-next-line:max-line-length
              const observable = that.ajaxService.get(httpUrlConfig + api.url + params, {
                headers: new HttpHeaders(headers),
              }); // ajax请求返回的observable对象
              return observable;
            };
          }
        }
      }
    }
  }
}
