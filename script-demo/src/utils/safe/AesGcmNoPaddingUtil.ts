import Base64Util from './Base64Util';
import * as asmcrypto from 'asmcrypto.js';

export default class AesGcmNoPaddingUtil {
  static SECRET_KEY = 'zM7tjKG65CnGKiuavhWF/w==';

  /**
   * 加密
   * @param plainText
   * @param base64Key
   * @return 返回base64编码后的密文字符串
   */
  static encrypt(plainText: any, base64Key: any): string {
    // 明文转base64后再转byte数组
    const base64Text = Base64Util.encode(plainText);
    const contentBytes = asmcrypto.base64_to_bytes(base64Text);
    const keyBytes = new Uint8Array(asmcrypto.base64_to_bytes(base64Key));
    const iv = new Uint8Array(this.getArrayRound()); // 12位的iv
    const encrypt = asmcrypto.AES_GCM.encrypt(contentBytes, keyBytes, iv);
    const result = [] as any;
    result.push(...Array.from(iv));
    result.push(...Array.from(encrypt));
    return asmcrypto.bytes_to_base64(result);
  }

  /**
   * 解密
   * @param encryptedText
   * @param base64Key
   */
  static decrypt(encryptedText: any, base64Key: any) {
    const base64Bytes = asmcrypto.base64_to_bytes(encryptedText);
    const iv = base64Bytes.subarray(0, 12); // 切割掉前12位，剩余位数进行解密
    const array = base64Bytes.subarray(12);
    const decrypt = asmcrypto.AES_GCM.decrypt(
      array,
      new Uint8Array(asmcrypto.base64_to_bytes(base64Key)),
      iv,
    );
    return asmcrypto.bytes_to_string(decrypt, true);
  }

  static getArrayRound() {
    const arr = [] as any[];
    for (let i = 0; i < 12; i++) {
      arr.push(Math.round(Math.random() * 128));
    }
    return arr;
  }
}
