/*
 * AES-GCM加解密工具
 */
import * as asmCrypto from 'asmcrypto.js';
export const SafetyService = {
  // 秘钥
  KEY_STR: 'MTIzNDU2Nzg' + '5MDEyMzQ1Ng==',

  // 生成一组随机数
  getArrayRound(): number[] {
    let arr: number[] = [];
    for (let i = 0; i < 12; i++) {
      const randomNum6 = Math.round(Math.random() * 128);
      arr.push(randomNum6);
    }
    return arr;
  },

  /**
   * AEC-GCM加密
   * @param content 要加密的明文
   * @param inpukey base64格式的秘钥
   * @returns base64格式的密文
   */
  encryptGcm(content: string, inpukey?: string): string {
    if (content) {
      try {
        // 1、将content字符串转换成Uint8Array
        const text = asmCrypto.string_to_bytes(content, true);
        // 2、base64格式的秘钥转换成Uint8Array
        const key = asmCrypto.base64_to_bytes(inpukey ?? this.KEY_STR);
        // 3、生成一组随机数并转换成Uint8Array
        let iv = new Uint8Array(this.getArrayRound()); //12位的iv
        // 4、加密
        let encText = asmCrypto.AES_GCM.encrypt(text, key, iv);
        //5.将iv向量与加密后的密文（Uint8Array）相加再转换成BASE64字符串
        return asmCrypto.bytes_to_base64(new Uint8Array([...iv, ...encText]));
      } catch (e) {
        console.error(e);
        return content;
      }
    } else {
      return '';
    }
  },

  /**
   * AES-GCM解密
   * @param content 待解密的base64格式的密文
   * @param inpukey base64格式的秘钥
   * @returns 解密后的明文
   */
  decryptGcm(content: string, inpukey?: string): string {
    if (content) {
      try {
        if (content.startsWith('@@@@@@@@@@')) {
          let length = content.length;
          content = content.substring(10, length);
        }
        // 1、base64格式的秘钥转换成Uint8Array
        const key = asmCrypto.base64_to_bytes(inpukey ?? this.KEY_STR);
        // 2、将BASE64字符串转换成Uint8Array
        const text = asmCrypto.base64_to_bytes(content);
        // 3、取步骤2前12位作为向量
        const arrayText = Array.from(text).slice(0, 12);
        const iv = new Uint8Array(arrayText);
        // 4、去除步骤2前12位作为密文
        const sliceText = Array.from(text).slice(12);
        // 5、解密
        const realText = asmCrypto.AES_GCM.decrypt(new Uint8Array(sliceText), key, iv);
        // 6.将解密后的明文（Uint8Array）转换成明文字符串
        return asmCrypto.bytes_to_string(realText, true);
      } catch (e) {
        // console.error('e',e);
        return content;
      }
    } else {
      return '';
    }
  },
};
