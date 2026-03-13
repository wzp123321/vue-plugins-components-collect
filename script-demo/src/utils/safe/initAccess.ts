import useAccess from '@/store/access';
import GatewayUtil from './GatewayUtil';
import { getAuthorize, getShare } from './api/access';

export default class Access {
  static accessStore = null;

  static needShare() {
    return (
      !useAccess().initialized ||
      !GatewayUtil.getShareStorage() ||
      !GatewayUtil.getAccessTokenStorage()
    );
  }

  static init() {
    return new Promise<void>((resolve, reject) => {
      if (this.needShare()) {
        const shareText = GatewayUtil.getShareStorage();
        if (shareText) {
          const decryptShareRes = GatewayUtil.decryptShareRes(shareText);
          getAuthorize({
            cipher: GatewayUtil.buildAuthorizeText(
              GatewayUtil.storageNameSpace(),
              decryptShareRes,
            ),
          })
            .then((res: any) => {
              this.afterInitSuccess(null, res.data);
              console.log('authorize成功');
              resolve();
            })
            .catch(async (e: any) => {
              if (e.response && e.response.errcode === '4f000002') {
                // 前置握手流程失效，从握手开始重新走流程
                GatewayUtil.removeShareStorage();
                GatewayUtil.removeAccessTokenStorage();
                await this.initFromShare();
              } else if (e.data && e.data.errcode === '4f000002') {
                GatewayUtil.removeShareStorage();
                GatewayUtil.removeAccessTokenStorage();
                await this.initFromShare();
              } else {
                console.log('authorize失败');
              }
              reject(new Error('失败'));
            });
        } else {
          this.initFromShare().then(() => {
            resolve();
          });
        }
      } else {
        resolve();
      }
    });
  }

  static initFromShare() {
    return new Promise((resolve, reject) => {
      getShare({
        cipher: GatewayUtil.buildShareText(),
      }).then((res: any) => {
        const shareResData = res.data;
        const decryptShareRes = GatewayUtil.decryptShareRes(shareResData);
        getAuthorize({
          cipher: GatewayUtil.buildAuthorizeText(
            GatewayUtil.storageNameSpace(),
            decryptShareRes,
          ),
        })
          .then((result: any) => {
            this.afterInitSuccess(shareResData, result.data);
            resolve(true);
          })
          .catch(() => {
            reject(new Error('失败'));
          });
      });
    });
  }

  static afterInitSuccess(shareData: any, tokenData: any) {
    if (shareData) {
      GatewayUtil.setShareStorage(shareData);
    }
    if (tokenData) {
      GatewayUtil.setAccessTokenStorage(tokenData);
    }
    useAccess().initialized = true;
  }
}
