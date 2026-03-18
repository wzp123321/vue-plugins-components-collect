import CryptoJS from 'crypto-js';

const salt = 'nts==2022';

export class ShaUtil {
  static encode(source: any) {
    return CryptoJS.SHA256(source).toString();
  }

  /**
   * 把参数转变成对象
   * @param url 跳转地址的url
   * @return 参数对象
   */
  static urlToJson(url: any) {
    const obj: any = {};
    const index = url.indexOf('?');
    const params = url.substr(index + 1);

    // if (index != -1) {
    // 有参数时
    const parr = params.split('&');
    parr.forEach((i: string) => {
      // 遍历数组
      const arr = i.split('=');
      const val = arr[1];
      obj[arr[0]] = val;
    });

    return obj;
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
  static signHttpSha(method: any, uri: any, params: any, data: any) {
    const source = ShaUtil.buildSource(method, uri, params, data, salt);
    // console.log('source: ' + source)
    return this.encode(source);
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
  static buildSource(
    method: any,
    uri: any,
    params: any,
    data: any,
    saltVal: any,
  ) {
    // method+uri+data+params
    let source = method.toUpperCase();
    if (saltVal) {
      source += saltVal;
    }
    source += uri;
    if (data) {
      if (data instanceof String) {
        source += data;
      } else {
        source += JSON.stringify(data);
      }
    }
    if (params) {
      const keys = Object.keys(params).sort();
      if (keys.length > 0) {
        let p = '?';
        keys.forEach((key) => {
          const param = params[key];

          // if (uri === '/memsWeb/modules/bad-event/bad-event-edit' && key === 'statusName') {
          //   param = decodeURI(param)
          // }
          if (param instanceof Array) {
            const sortedParam = param.sort();
            sortedParam.forEach((item) => {
              p += `${key}=${item}&`;
            });
          } else {
            p += `${key}=${param}&`;
          }
        });
        source += p;
      }
    }
    return source;
  }
}
