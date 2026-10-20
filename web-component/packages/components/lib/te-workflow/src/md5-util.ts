import CryptoJS from 'crypto-js';

export class MD5Util {
  constructor() {}
  public static encode(source) {
    return CryptoJS.SHA256(source).toString();
  }

  /**
   * 生成md5签名
   * @param method http方法，转大写
   * @param uri 请求的uri
   * @param params 请求的query参数
   * @param data 请求的body
   * @param salt md5盐值
   * @return md5签名字符串
   */
  public static signHttpMd5(method: string, uri: string, params: any, data: any): string {
    let source = MD5Util.buildSource(method, uri, params, data, 'nts==2022');
    console.log('source', source);
    let encode = this.encode(source);
    console.log('md5', encode);
    return encode;
  }

  /**
   * 构建编码前的字符串 method+salt+uri+body+query（key按ASCII码排序）
   * @param method http方法，转大写
   * @param uri 请求的uri
   * @param params 请求的query参数
   * @param data 请求的body
   * @param salt md5盐值
   * @private
   */
  private static buildSource(method: string, uri: string, params: any, data: any, salt: string) {
    let source = method;
    if (!!salt) {
      source += salt;
    }
    source += uri;
    if (data) {
      if (typeof data === 'string') {
        source += data;
      } else {
        source += JSON.stringify(data);
      }
    }
    if (params) {
      let keys = Object.keys(params).sort();
      if (keys.length > 0) {
        let p = '?';
        keys.forEach((key) => {
          let param = params[key];
          if (param instanceof Array) {
            let sortedParam = param.sort();
            sortedParam.forEach((item) => {
              p += key + '=' + decodeURIComponent(item) + '&';
            });
          } else {
            p += key + '=' + decodeURIComponent(param) + '&';
          }
        });
        source += p;
      }
    }
    return source;
  }
}
