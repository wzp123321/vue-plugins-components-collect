import { Base64 } from 'js-base64';

export default class Base64Util {
  /**
   * base64编码
   * @param data
   */
  static encode(data: string) {
    return Base64.encode(data);
  }

  /**
   * base64解码
   * @param data
   */
  static decode(data: string) {
    return Base64.decode(data);
  }
}
