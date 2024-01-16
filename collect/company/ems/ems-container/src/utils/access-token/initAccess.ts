import message from '@/utils/message';
import GatewayUtil from './GatewayUtil';
import axios from 'axios';
// import ApiClient from "../http/ApiClientFactory";
import { APP_ID, ASSESS_TOKEN_BASE_PATH, APATH, ASSESS_DecryptShareRes } from './api';
import { loadAccessSecretConfigure } from '../loadAccessSecret';

let initialized = false;
let index = 0;

export class Access {
  static needShare() {
    return !initialized || !GatewayUtil.getShareStorage() || !GatewayUtil.getAccessTokenStorage();
  }
  /**
   * 初始化  如果能拿到assess-token 则返回assess-token 如果拿不到则返回空字符串
   * @returns
   */
  static init() {
    return new Promise(async (resolve) => {
      await loadAccessSecretConfigure();

      this.initFromShare()
        .then(async (res) => {
          const decryptShareRes = GatewayUtil.decryptShareRes(res);

          this.initAuthorize(res, decryptShareRes)
            .then((authRes) => {
              resolve(authRes);
            })
            .catch((err) => {
              // 只能重试一次
              if (index === 1) {
                resolve('');
                return;
              }
              index += 1;
              this.initFromShare()
                .then(async (res) => {
                  const decryptShareRes = GatewayUtil.decryptShareRes(res);

                  this.initAuthorize(res, decryptShareRes)
                    .then((authRes) => {
                      resolve(authRes);
                    })
                    .catch((err) => {
                      resolve('');
                    });
                })
                .catch((error) => {
                  resolve('');
                });
            });
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
  static initFromShare(): Promise<string> {
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
        if (res?.data?.errcode === '0') {
          resolve(res?.data?.data);
        } else {
          if (res?.data?.errmsg) {
            message.error(res?.data?.errmsg);
          }

          resolve('');
        }
      } catch (error) {
        console.warn('share----------------', error);

        resolve('');
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
          initialized = true;
          this.afterInitSuccess(shareResData, res?.data?.data);
        } else {
          reject(res?.data);
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
