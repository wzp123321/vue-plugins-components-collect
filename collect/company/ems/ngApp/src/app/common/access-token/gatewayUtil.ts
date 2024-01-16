import DHUtil from './DHUtil';
import Base64Util from './Base64Util';
const bigInt = require('big-integer');
import AesGcmNoPaddingUtil from './AesGcmNoPaddingUtil';

import { ASSESS_DecryptShareRes, APP_ID } from './api';

export default class gatewayUtil {
  static getShareStorage() {
    return sessionStorage.getItem(APP_ID + '.share');
  }

  static setShareStorage(data: string) {
    return sessionStorage.setItem(APP_ID + '.share', data);
  }

  static removeShareStorage() {
    return sessionStorage.removeItem(APP_ID + '.share');
  }

  static getAccessTokenStorage() {
    return sessionStorage.getItem(APP_ID + '.act');
  }

  static setAccessTokenStorage(data: string) {
    return sessionStorage.setItem(APP_ID + '.act', data);
  }

  static removeAccessTokenStorage() {
    return sessionStorage.removeItem(APP_ID + '.act');
  }

  static APP_ID() {
    return APP_ID;
  }

  /**
   * 获取握手接口的入参
   */
  static buildShareText() {
    let requestId = this.randomNumber32();
    let applyTime = new Date().getTime().toString();
    console.log('requestId', requestId, applyTime);
    let clientPublicKey = DHUtil.getClientPublicKey(
      DHUtil.getClientPrivateKey(),
      DHUtil.getP(),
      DHUtil.getG()
    );
    let obfuscate = this.obfuscate(requestId, applyTime);
    return Base64Util.encode(obfuscate + clientPublicKey.toString());
  }

  /**
   *  将请求标识和请求时间混淆
   * @param requestId 请求标识
   * @param applyTime 请求时间
   */
  static obfuscate(requestId: string, applyTime: string) {
    let results: string[][] = [[], []];
    let temp = (requestId + applyTime).split('');
    for (let i = 0; i < temp.length; i++) {
      const t = temp[i];
      results[i % 2].push(t);
    }

    console.log(results[1].join(''));
    return results[0].join('') + results[1].join('');
  }

  /**
   * 解析dh公钥及相关参数
   * @param encrypted
   *
   */
  static decryptShareRes(encrypted: string) {
    let decode = Base64Util.decode(encrypted);
    let shareInfo = decode.split('.'); // decode：服务端公钥.dh加密的aesKey
    let serverPublicKey = shareInfo[0];
    let encryptedAesKeyPair = shareInfo[1];
    let shareKey = DHUtil.getShareKey(
      bigInt(serverPublicKey),
      DHUtil.getClientPrivateKey(),
      DHUtil.getP()
    );
    let dhDecryptedText = DHUtil.decrypt(encryptedAesKeyPair, shareKey);
    let decryptedTexts = dhDecryptedText.split('.');
    return {
      shareKey: shareKey, //握手秘钥
      shareId: decryptedTexts[1], //握手标识
      randomAESBase64Key: decryptedTexts[0], //后台签发的aes动态秘钥与shareId一一对应
    };
  }

  /**
   * 构造颁发accessToken请求体
   * @param appId
   * @param decryptedShareResponse
   */
  static buildAuthorizeText(
    appId: string,
    decryptedShareResponse: ASSESS_DecryptShareRes
  ) {
    // getToken
    let plainText =
      'app_id=' +
      appId +
      '&share_id=' +
      decryptedShareResponse.shareId +
      '&request_time=' +
      new Date().getTime() +
      '&request_id=' +
      this.uuid32();
    let dhEncrypt = DHUtil.encrypt(
      decryptedShareResponse.shareId,
      decryptedShareResponse.shareKey
    );
    let aesEncrypt = AesGcmNoPaddingUtil.encrypt(
      plainText,
      decryptedShareResponse.randomAESBase64Key
    );
    let text = dhEncrypt + '.' + aesEncrypt;
    console.log('text', text);
    return Base64Util.encode(text);
  }

  /**
   * 解密Authorize接口的响应
   * @param cipher
   * @param aesBase64Key
   */
  static decryptAuthorizeRes(cipher: string, aesBase64Key: string) {
    return AesGcmNoPaddingUtil.decrypt(cipher, aesBase64Key);
  }

  /**
   * 构造访问使用的AccessToken
   */
  static buildClientAccessToken() {
    let item = this.getAccessTokenStorage();
    if (item) {
      try {
        let shareText = this.getShareStorage() as string;

        let decryptShareRes = gatewayUtil.decryptShareRes(shareText);
        let serverToken = this.decryptAuthorizeRes(
          item,
          decryptShareRes.randomAESBase64Key
        );
        let accessToken =
          this.uuid32() + '.' + new Date().getTime() + '.' + serverToken;
        let encrypt = AesGcmNoPaddingUtil.encrypt(
          accessToken,
          decryptShareRes.randomAESBase64Key
        );
        let encryptRequestIdText = DHUtil.encrypt(
          decryptShareRes.shareId,
          decryptShareRes.shareKey
        );
        console.log();
        return Base64Util.encode(encryptRequestIdText + '.' + encrypt);
      } catch (e) {
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
    );
  }

  static n4() {
    return (Math.floor(Math.random() * 8999) + 1000).toString();
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
}
