import Base64Util from './Base64Util';
const asmcrypto = require('asmcrypto.js/asmcrypto.all.es5');
export default class AesGcmNoPaddingUtil {
  /**
   * 加密
   * @param plainText
   * @param base64Key
   * @return 返回base64编码后的密文字符串
   */
  static encrypt(plainText: string, base64Key: string) {
    //明文转base64后再转byte数组
    let base64Text = Base64Util.encode(plainText);
    const contentBytes = asmcrypto.base64_to_bytes(base64Text);
    let keyBytes = new Uint8Array(asmcrypto.base64_to_bytes(base64Key));
    let iv = new Uint8Array(this.getArrayRound()); //12位的iv
    let encrypt = asmcrypto.AES_GCM.encrypt(contentBytes, keyBytes, iv);
    let result = [];
    result.push(...Array.from(iv));
    result.push(...Array.from(encrypt));
    return asmcrypto.bytes_to_base64(result);
  }

  /**
   * 解密
   * @param encryptedText
   * @param base64Key
   */
  static decrypt(encryptedText: string, base64Key: string) {
    let base64Bytes = asmcrypto.base64_to_bytes(encryptedText);
    let iv = base64Bytes.subarray(0, 12); //切割掉前12位，剩余位数进行解密
    let array = base64Bytes.subarray(12);
    let decrypt = asmcrypto.AES_GCM.decrypt(array, new Uint8Array(asmcrypto.base64_to_bytes(base64Key)), iv);
    return asmcrypto.bytes_to_string(decrypt, true);
  }

  static getArrayRound() {
    let arr = [];
    for (let i = 0; i < 12; i++) {
      arr.push(Math.round(Math.random() * 128));
    }
    return arr;
  }
}
