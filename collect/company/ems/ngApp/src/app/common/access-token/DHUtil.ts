import AesGcmNoPaddingUtil from './AesGcmNoPaddingUtil';
import { APP_ID, ASSESS_SECRET } from './api';
import Base64Util from './Base64Util';
const bigInt = require('big-integer');
const CryptoJS = require('crypto-js');
/**
 * DH算法
 */
export default class DHUtil {
  /**
   * 固定值，无需变更
   */
  static getP() {
    return bigInt(
      '179769313486231590770839156793787453197860296048756011706444423684197180216158519368947833795864925541502180565485980503646440548199239100050792877003355816639229553136239076508735759914822574862575007425302077447712589550957937778424442426617334727629299387668709205606050270810842907692932019128194467627007'
    );
  }

  /***
   * 固定值，无需变更
   */
  static getG() {
    return bigInt('2');
  }

  static decryptSecret() {
    const key =
      APP_ID.length < 16 ? APP_ID.padEnd(16, '0') : APP_ID.substr(0, 16);
    const secret = this.FGetCookie('energy-ems-access-secret') as string;
    console.log(
      Base64Util.encode(key),
      secret,
      AesGcmNoPaddingUtil.decrypt(secret, Base64Util.encode(key)),
      '-----'
    );
    return AesGcmNoPaddingUtil.decrypt(secret, Base64Util.encode(key));
  }

  /**
   * 获取我方私钥
   */
  static getClientPrivateKey() {
    //FIXME 测试使用，正式场景请调整获取我方私钥的方式，通常为取环境变量，不可以进行存储
    return bigInt(this.decryptSecret());
  }

  /**
   * 获取我方公钥
   * @param clientPrivate 我方私钥
   * @param p 素数
   * @param g p的原根
   */
  static getClientPublicKey(clientPrivate: any, p: any, g: any) {
    return this.calc(g, clientPrivate, p);
  }

  /**
   * 获取共享秘钥
   * @param serverPublicKey
   * @param clientPrivate
   * @param p
   * @return 返回一个大数，非string
   */
  static getShareKey(serverPublicKey: any, clientPrivate: any, p: any) {
    return this.calc(serverPublicKey, clientPrivate, p);
  }

  /**
   * dh加密,用于对加密报文适用的aesKey进行加密
   * @param plainText 原文
   * @param shareKey dh共享秘钥
   * @return base64转码的密文
   */
  static encrypt(plainText: string, shareKey: string) {
    let aesKey = this.getDhSecretKey(shareKey);
    const key = CryptoJS.enc.Utf8.parse(aesKey);
    const utf8Text = CryptoJS.enc.Utf8.parse(plainText); // 转成Utf8
    let encrypted = CryptoJS.AES.encrypt(utf8Text, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  }

  /**
   * dh解密,用于对加密报文适用的aesKey进行解密
   * @param base64EncryptedText base64后的密文
   * @param shareKey dh共享秘钥
   * @return utf8编码的明文
   */
  static decrypt(base64EncryptedText: string, shareKey: string) {
    let aesKey = this.getDhSecretKey(shareKey);
    const key = CryptoJS.enc.Utf8.parse(aesKey);
    let decrypted = CryptoJS.AES.decrypt(base64EncryptedText, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return CryptoJS.enc.Utf8.stringify(decrypted);
  }

  /**
   * 通过对shareKey进行md5编码得到32位的字符串作为用于dh加密的秘钥
   * 该值仅用于对aes进行加解密
   * 根据shareKey获取用于加解密的aesKey
   * @param shareKey
   * @return 32位的md5值，用作dh加密时的秘钥
   */
  static getDhSecretKey(shareKey: any) {
    if (shareKey instanceof String) {
      return CryptoJS.MD5(shareKey.toString()).toString();
    } else {
      return CryptoJS.MD5(shareKey.toString()).toString();
    }
  }

  /**
   * x^y mod z
   */
  static calc(x: any, y: any, z: any) {
    return x.modPow(y, z);
  }

  // 取cookie
  static FGetCookie(key: string) {
    const reg = new RegExp(`(^| )${key.toLowerCase()}=([^;]*)(;|$)`, 'i');
    const match = document.cookie.match(reg) ?? '';
    if (match.length > 2) {
      return decodeURIComponent(match[2]);
    }

    return '';
  }
}
