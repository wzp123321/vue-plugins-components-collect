import GatewayUtil from './gatewayUtil';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { loadAccessSecretConfigure } from './loadAccessSecret';
import {
  APP_ID,
  ASSESS_TOKEN_BASE_PATH,
  APATH,
  ASSESS_TOKEN_Res,
  ASSESS_DecryptShareRes,
} from './api';

let retryIndex = 0;
let initialized = false;

export class Access {
  constructor(private http: HttpClient) {}
  needShare() {
    return (
      !initialized ||
      !GatewayUtil.getShareStorage() ||
      !GatewayUtil.getAccessTokenStorage()
    );
  }
  /**
   * 初始化  如果能拿到assess-token 则返回assess-token 如果拿不到则返回空字符串
   * @returns
   */
  init() {
    const _this = this;
    return new Promise(async (resolve) => {
      await loadAccessSecretConfigure();
      _this
        .initFromShare()
        .then(async (res) => {
          if (res?.errcode === '0') {
            const decryptShareRes = GatewayUtil.decryptShareRes(res?.data);

            const authRes = await _this.initAuthorize(
              res.data,
              decryptShareRes
            );
            if (authRes) {
              resolve(authRes);
            } else {
              resolve('');
            }
          } else {
            resolve('');
          }
        })
        .catch((error) => {
          resolve('');
        });
    });
  }
  /**
   * 初始化share
   * @returns
   */
  initFromShare(): Promise<ASSESS_TOKEN_Res> {
    const _this = this;
    return new Promise(async (resolve) => {
      try {
        let params = {
          cipher: GatewayUtil.buildShareText(),
        };

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            app_id: APP_ID,
          }),
        };
        _this.http
          .post(`${ASSESS_TOKEN_BASE_PATH}${APATH.share}`, params, httpOptions)
          .subscribe((res: any) => {
            if (res?.errcode === '0') {
              resolve(res);
            } else {
              resolve({
                data: '',
                errcode: '',
                errmsg: '',
                secretFields: '',
              });
            }
          });
      } catch (error) {
        console.log('error', error);
        resolve({
          data: '',
          errcode: '',
          errmsg: '',
          secretFields: '',
        });
      }
    });
  }

  /**
   * 初始化authorize
   * @param shareResData share拿到的加密串
   * @param decryptShareRes
   * @returns
   */
  initAuthorize(
    shareResData: string,
    decryptShareRes: ASSESS_DecryptShareRes
  ): Promise<string> {
    const _this = this;
    return new Promise(async (resolve, reject) => {
      try {
        let params = {
          cipher: GatewayUtil.buildAuthorizeText(APP_ID, decryptShareRes),
        };
        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            app_id: APP_ID,
          }),
        };
        _this.http
          .post(
            `${ASSESS_TOKEN_BASE_PATH}${APATH.authorize}`,
            params,
            httpOptions
          )
          .subscribe((res: any) => {
            if (res?.errcode === '0') {
              resolve(res?.data);
              initialized = true;
              console.warn(
                'shareResData----------------',
                shareResData,
                res?.data
              );
              _this.afterInitSuccess(shareResData, res?.data);
            } else {
              reject(res?.data);
            }
          });
      } catch (error) {
        reject('');
        console.warn('authorize----------------', error);
      }
    });
  }

  /**
   * 添加缓存
   * @param shareData share数据
   * @param tokenData authorize数据
   */
  afterInitSuccess(shareData: string | null, tokenData: string) {
    if (shareData) {
      GatewayUtil.setShareStorage(shareData);
    }
    if (tokenData) {
      GatewayUtil.setAccessTokenStorage(tokenData);
    }
  }
}
