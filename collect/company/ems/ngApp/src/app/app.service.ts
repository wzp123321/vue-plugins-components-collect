import {
  FCommonResponseHandler,
  ICommonResponse,
} from './common/services/communication/communication.api';
import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { NativeService } from './common/native.service';
import { SHA256 } from 'crypto-js';
import { RESTFULService } from '@src/app/common/services/communication/restful.service';
import { URL_PATH } from '@src/app/common/services/communication/communication.api';

// import { Access } from '@src/app/common/access-token/initAccess';
import { HttpClient } from '@angular/common/http';
// import { ToastService } from 'ng-zorro-antd-mobile';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private _config: { [key: string]: any } = null;
  public get config(): { [key: string]: any } {
    return this._config;
  }

  constructor(
    private sNative: NativeService,
    private loadingCtrl: LoadingController,
    private sRESTFUL: RESTFULService,
    private client: HttpClient
  ) {}

  public async initialize(): Promise<void> {
    const loading = await this.presentLoading();
    // 清除session
    sessionStorage.clear();

    return new Promise((resolve, reject) => {
      // new Access(_this.client).init().then((res: any) => {
      //   if (!res) {
      //     loading.dismiss(); // !网页调试用，App端使用时清除
      //   }

      // sessionStorage.setItem(
      //   'token',
      //   '99e6a477efd647dc897127030b6335bee46646272beff82dac0492342f0edf411666405168647'
      // );
      // document.cookie = `energy-token=99e6a477efd647dc897127030b6335bee46646272beff82dac0492342f0edf411666405168647;path=/`;
      // sessionStorage.setItem('tenantId', '8');
      // sessionStorage.setItem('loginName', 'admin');

      // loading.dismiss(); // !网页调试用，App端使用时清除
      // resolve(); // !网页调试用，App端使用时清除

      // return; // !网页调试用，App端使用时清除

      // 初始化全局环境
      this.sNative.nativeCall(
        'config',
        {},
        async (v: string) => {
          this._config = JSON.parse(v);
          console.log('v===', this._config);
          console.log('this._config', this._config);
          if (this._config?.ts_sign) {
            let myUrl = window.location.pathname + '?';
            Object.keys(this._config)
              .sort()
              .forEach((item) => {
                if (item !== 'ts_sign') {
                  myUrl += item + '=' + this._config[item] + '&';
                }
              });
            if (
              this._config.ts_sign !== this.signHttpSha256('GET', myUrl, '')
            ) {
              loading.dismiss();
              resolve();
              return;
            }
          }
          sessionStorage.setItem('token', this._config.token);
          document.cookie = `energy-token=${this._config.token};path=/`;
          sessionStorage.setItem('tenantId', this._config.tenantId);
          sessionStorage.setItem('userName', this._config.name);
          if (this._config.loginInfo) {
            const loginInfo = JSON.parse(this._config.loginInfo);
            console.log(
              'loginInfo?.loginName------------------',
              loginInfo?.resultBody?.loginName
            );
            sessionStorage.setItem(
              'loginName',
              loginInfo?.resultBody?.loginName
            );

            await this.getSystemDate();
          }
          loading.dismiss();
          resolve();
          // 去掉导航栏
          this.sNative.nativeCall('loadSuccess', {}, null, null);
        },
        null
      );
      // });
    });
  }

  private buildSource(method: string, url: string, data: string, salt: string) {
    let source = method;
    if (!!salt) {
      source += salt;
    }
    source += url;
    if (data) {
      source += data;
    }
    return source;
  }
  //验签校验
  private signHttpSha256(method: string, url: string, data: string) {
    if (url.indexOf('http://') === 0) {
      url = url.replace(/http:\/\/[^\/]+/, '');
    }
    const source = this.buildSource(method, url, data, 'nts==2022');
    return SHA256(source).toString();
  }

  private async presentLoading(): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingCtrl.create({
      cssClass: 'my-custom-class',
      message: '数据加载中...',
    });
    await loading.present();
    return loading;
  }

  public async getSystemDate(): Promise<void> {
    try {
      const res = await this.sRESTFUL.post<ICommonResponse<string>>(
        URL_PATH.Common.getSystemDate,
        {
          tenantCode: sessionStorage.getItem('tenantId'),
        }
      );
      const result = FCommonResponseHandler<string>(res);
      if (result) {
        const timeStamp = new Date(result.replace(/-/g, '/')).getTime();
        window.sessionStorage.setItem(
          'ems-app-sys-time',
          String(timeStamp - new Date().getTime())
        );
      } else {
        window.sessionStorage.setItem('ems-app-sys-time', '0');
      }
    } catch (error) {
      window.sessionStorage.setItem('ems-app-sys-time', '0');
    }
  }
}
