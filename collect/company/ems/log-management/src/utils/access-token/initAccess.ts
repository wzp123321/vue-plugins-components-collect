import message from '@/utils/message';
import GatewayUtil from './GatewayUtil';
import axios from 'axios';
// import ApiClient from "../http/ApiClientFactory";
import { APP_ID, ASSESS_TOKEN_BASE_PATH, APATH, ASSESS_TOKEN_Res, ASSESS_DecryptShareRes } from './api';

let initialized = false;

export class Access {
  static needShare() {
    return !initialized || !GatewayUtil.getShareStorage() || !GatewayUtil.getAccessTokenStorage();
  }
  /**
   * 初始化  如果能拿到assess-token 则返回assess-token 如果拿不到则返回空字符串
   * @returns
   */
  static init() {
    return new Promise((resolve) => {
      if (this.needShare()) {
        //已初始化后，不再进行初始化
        //判断是否存在握手记录，若存在，场景进行
        let shareText = GatewayUtil.getShareStorage();
        if (shareText) {
          //存在shareResponse，表示曾经握手过，此时直接尝试进行token获取
          let decryptShareRes = GatewayUtil.decryptShareRes(shareText);
          this.initAuthorize(shareText, decryptShareRes)
            .then((res) => {
              this.afterInitSuccess('', res);
              resolve(res);
            })
            .catch((e) => {
              if (e.response && e.response.errcode == '4f500002') {
                //前置握手流程失效，从握手开始重新走流程
                GatewayUtil.removeShareStorage();
                GatewayUtil.removeAccessTokenStorage();
                this.initFromShare()
                  .then(async (res: ASSESS_TOKEN_Res) => {
                    if (res?.errcode === '0') {
                      let decryptShareRes = GatewayUtil.decryptShareRes(res.data);
                      resolve(await this.initAuthorize(res.data, decryptShareRes));
                    } else {
                      resolve('');
                    }
                  })
                  .catch((error) => {
                    resolve('');
                  });
              } else {
                message.error(e.response);
              }
            });
        } else {
          this.initFromShare()
            .then(async (res) => {
              if (res?.errcode === '0') {
                const decryptShareRes = GatewayUtil.decryptShareRes(res?.data);
                const authRes = await this.initAuthorize(res.data, decryptShareRes);

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
        }
      } else {
        resolve(GatewayUtil.getAccessTokenStorage());
      }
    });
  }
  /**
   * 初始化share
   * @returns
   */
  static initFromShare(): Promise<ASSESS_TOKEN_Res> {
    return new Promise(async (resolve) => {
      try {
        const res = await axios({
          method: 'POST',
          url: `${ASSESS_TOKEN_BASE_PATH}${APATH.share}`,
          headers: {
            app_id: APP_ID,
            'Content-Type': 'application/json',
          },
          data: {
            cipher: GatewayUtil.buildShareText(),
          },
        });
        resolve(res?.data);
      } catch (error) {
        console.warn(error);

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
  static initAuthorize(shareResData: string, decryptShareRes: ASSESS_DecryptShareRes): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await axios({
          method: 'POST',
          url: `${ASSESS_TOKEN_BASE_PATH}${APATH.authorize}`,
          headers: {
            app_id: APP_ID,
            'Content-Type': 'application/json',
          },
          data: {
            cipher: GatewayUtil.buildAuthorizeText(APP_ID, decryptShareRes),
          },
        });
        if (res?.data?.errcode === '0') {
          resolve(res?.data?.data);
          this.afterInitSuccess(shareResData, res?.data?.data);
        } else {
          reject(res?.data?.data);
        }
      } catch (error) {
        resolve('');
        console.warn('authorize----------------', error);
      }
    });
  }

  /**
   * 添加缓存
   * @param shareData share数据
   * @param tokenData authorize数据
   */
  static afterInitSuccess(shareData: string, tokenData: string) {
    if (shareData) {
      GatewayUtil.setShareStorage(shareData);
    }
    if (tokenData) {
      GatewayUtil.setAccessTokenStorage(tokenData);
    }
    initialized = true;
  }
}
