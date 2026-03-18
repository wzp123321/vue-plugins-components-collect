import bigInt from 'big-integer';
import DHUtil from './DHUtil';
import Base64Util from './Base64Util';
import AesGcmNoPaddingUtil from './AesGcmNoPaddingUtil';
import { getEnvValue } from '@/utils/common';
import { InternalAxiosRequestConfig, AxiosInstance } from 'axios';
import Access from './initAccess';

const storageNameSpace = getEnvValue('VITE_APP_ID') || 'sec-web';
const secret =
  getEnvValue('VITE_APP_SECRET') ||
  'FjBp43w02kacRbJe5T6Rh/ObUTcBlu8xij5YzMQNxrRx/Gk=';
export default class GatewayUtil {
  static getShareStorage() {
    return localStorage.getItem(`${storageNameSpace}.share`);
  }

  static setShareStorage(data: any) {
    return localStorage.setItem(`${storageNameSpace}.share`, data);
  }

  static removeShareStorage() {
    return localStorage.removeItem(`${storageNameSpace}.share`);
  }

  static getAccessTokenStorage() {
    return localStorage.getItem(`${storageNameSpace}.act`);
  }

  static setAccessTokenStorage(data: any) {
    return localStorage.setItem(`${storageNameSpace}.act`, data);
  }

  static removeAccessTokenStorage() {
    return localStorage.removeItem(`${storageNameSpace}.act`);
  }

  static storageNameSpace() {
    return storageNameSpace;
  }

  static decryptSecret() {
    const key =
      storageNameSpace.length < 16
        ? storageNameSpace.padEnd(16, '0')
        : storageNameSpace.substring(0, 16);
    return AesGcmNoPaddingUtil.decrypt(secret, Base64Util.encode(key));
  }

  /**
   * 获取握手接口的入参
   */
  static buildShareText(): string {
    const requestId = this.randomNumber32();
    const applyTime = new Date().getTime().toString();
    const clientPublicKey = DHUtil.getClientPublicKey(
      DHUtil.getClientPrivateKey(),
      DHUtil.getP(),
      DHUtil.getG(),
    );
    const obfuscate = this.obfuscate(requestId, applyTime);
    return Base64Util.encode(obfuscate + clientPublicKey.toString());
  }

  /**
   *  将请求标识和请求时间混淆
   * @param requestId 请求标识
   * @param applyTime 请求时间
   */
  static obfuscate(requestId: string, applyTime: string): string {
    const results = [[], []] as any;
    const temp = (requestId + applyTime).split('');
    for (let i = 0; i < temp.length; i++) {
      const t = temp[i];
      results[i % 2].push(t);
    }
    return results[0].join('') + results[1].join('');
  }

  /**
   * 解析dh公钥及相关参数
   * @param encrypted
   *
   */
  static decryptShareRes(encrypted: any) {
    const decode = Base64Util.decode(encrypted);
    const shareInfo = decode.split('.'); // decode：服务端公钥.dh加密的aesKey
    const serverPublicKey = shareInfo[0];
    const encryptedAesKeyPair = shareInfo[1];
    const shareKey = DHUtil.getShareKey(
      bigInt(serverPublicKey),
      DHUtil.getClientPrivateKey(),
      DHUtil.getP(),
    );
    const dhDecryptedText = DHUtil.decrypt(encryptedAesKeyPair, shareKey);
    const decryptedTexts = dhDecryptedText.split('.') as string[];
    return {
      shareKey, // 握手秘钥
      shareId: decryptedTexts[1], // 握手标识
      randomAESBase64Key: decryptedTexts[0], // 后台签发的aes动态秘钥与shareId一一对应
    };
  }

  /**
   * 构造颁发accessToken请求体
   * @param appId
   * @param decryptedShareResponse
   */
  static buildAuthorizeText(appId: any, decryptedShareResponse: any): string {
    // getToken
    const plainText = `app_id=${appId}&share_id=${
      decryptedShareResponse.shareId
    }&request_time=${new Date().getTime()}&request_id=${this.uuid32()}`;
    const dhEncrypt = DHUtil.encrypt(
      decryptedShareResponse.shareId,
      decryptedShareResponse.shareKey,
    );
    const aesEncrypt = AesGcmNoPaddingUtil.encrypt(
      plainText,
      decryptedShareResponse.randomAESBase64Key,
    );
    const text = `${dhEncrypt}.${aesEncrypt}`;
    return Base64Util.encode(text);
  }

  /**
   * 解密Authorize接口的响应
   * @param cipher
   * @param aesBase64Key
   */
  static decryptAuthorizeRes(cipher: any, aesBase64Key: any) {
    return AesGcmNoPaddingUtil.decrypt(cipher, aesBase64Key);
  }

  /**
   * 构造访问使用的AccessToken
   */
  static buildClientAccessToken() {
    const item = this.getAccessTokenStorage();
    if (item) {
      try {
        const shareText = this.getShareStorage();
        const decryptShareRes = GatewayUtil.decryptShareRes(shareText);
        const serverToken = this.decryptAuthorizeRes(
          item,
          decryptShareRes.randomAESBase64Key,
        );
        const accessToken = `${this.uuid32()}.${new Date().getTime()}.${serverToken}`;
        const encrypt = AesGcmNoPaddingUtil.encrypt(
          accessToken,
          decryptShareRes.randomAESBase64Key,
        );
        const encryptRequestIdText = DHUtil.encrypt(
          decryptShareRes.shareId,
          decryptShareRes.shareKey,
        );
        return Base64Util.encode(`${encryptRequestIdText}.${encrypt}`);
      } catch (e) {
        console.log(e);
        return null;
      }
    }
    return null;
  }

  static randomNumber32() {
    return (
      this.n4() +
      this.n4() +
      this.n4() +
      this.n4() +
      this.n4() +
      this.n4() +
      this.n4() +
      this.n4()
    ).padStart(32, '0');
  }

  static n4() {
    return Math.floor(Math.random() * 10000).toString();
  }

  /**
   * 生成uuid
   */
  static uuid32() {
    return (
      this.s4() +
      this.s4() +
      this.s4() +
      this.s4() +
      this.s4() +
      this.s4() +
      this.s4() +
      this.s4()
    );
  }

  /**
   * 生成4位随机数
   */
  static s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  /**
   * 重试请求accessToken
   * @param config 请求配置
   * @returns 重试请求结果
   */
  static async retryAccessToken(
    config: InternalAxiosRequestConfig,
    request: AxiosInstance,
  ) {
    GatewayUtil.removeShareStorage();
    GatewayUtil.removeAccessTokenStorage();
    try {
      await Access.initFromShare();
    } catch (error) {
      console.log(error);
      return request(config);
    }
    return request(config);
  }
}
