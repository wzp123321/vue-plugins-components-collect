import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HTTP_INTERCEPTORS,
  HttpResponse,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { getStorageData, setStorageData } from '@tiansu/tools';
// import GatewayUtil from '../access-token/GatewayUtil';
// import { APP_ID } from '../access-token/api';
const asmCrypto = require('asmcrypto.js/asmcrypto.all.es5');
let modalIns: any;
getUrlParams();
/**
 *  请求头处理拦截器
 */
@Injectable()
class HeaderInterceptor implements HttpInterceptor {
  constructor(private modal: NzModalService) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const tenantCode = FGetStorageData('energy-corpid') || 'njts';
    const loginName = FGetStorageData('energy-loginName') || '';
    const token = FGetStorageData('energy-token') || '';
    const Authorization = FGetAuthorization();
    const sourceValue = FGetStorageData('ems-sourceValue') ?? '';
    // const access_token = GatewayUtil.buildClientAccessToken() || '';
    // const app_id = APP_ID;
    return next
      .handle(
        req.clone({
          setHeaders: {
            tenantCode,
            loginName,
            token,
            Authorization,
            sourceValue,
            // access_token,
            // app_id,
          },
        })
      )
      .pipe(
        tap({
          next: (event) => {
            if (event instanceof HttpResponse) {
              if (Number(event?.body?.errcode) === 401) {
                if (getQueryParam('sourceValue') && event?.body?.errmsg) {
                  this.modal.confirm({
                    nzTitle: '登录信息已失效，请重新登录',
                    nzClosable: false,
                    nzCancelText: null,
                    nzOnOk: () => {
                      window.open(
                        `${event?.body?.errmsg}?callback=${encodeURIComponent(
                          window.location.href
                        )}`,
                        '_self'
                      );
                    },
                  });
                } else {
                  window.parent.postMessage(
                    {
                      code: Number(event.body.errcode),
                      message: event.body.errmsg,
                      type: 'ems-login-failure',
                    },
                    window.location.origin
                  );
                }
              }
            }
          },
          error: (e) => {
            if (getQueryParam('sourceValue') && e) {
              if (modalIns) {
                return;
              }
              modalIns = this.modal.confirm({
                nzTitle: '登录信息已失效，请重新登录',
                nzClosable: false,
                nzCancelText: null,
                nzOnOk: () => {
                  window.open(
                    `${e}?callback=${encodeURIComponent(window.location.href)}`,
                    '_self'
                  );
                },
              });
            } else {
              if (
                e?.includes('login') ||
                e?.toLocaleLowerCase()?.includes('login')
              ) {
                window.parent.postMessage(
                  {
                    code: '4f000002',
                    message: e ?? '',
                    type: 'ems-login-failure',
                  },
                  window.location.origin
                );
              }
            }
          },
        })
      );
  }
}

export const HEADER_INTERCEPTOR = {
  provide: HTTP_INTERCEPTORS,
  useClass: HeaderInterceptor,
  multi: true,
};
/**
 * 获取缓存数据
 * @param name
 * @returns
 */
function FGetStorageData(name: string) {
  return getStorageData(name);
}

function setCookie(key: string, value?: string): void {
  if (!key) {
    return;
  }
  // 先置空
  document.cookie = `${key.toLowerCase()}=${encodeURIComponent('')};path=/`;
  document.cookie = `${key.toLowerCase()}=${encodeURIComponent(
    value ?? ''
  )};path=/`;
}
/**
 * 获取地址参数项
 * @param key 参数名
 * @returns 参数名对应的值
 */
function getQueryParam(key: string) {
  const reg = new RegExp(`(^|&)${key}=([^&]*)(&|$)`, 'i');
  const match = window.location.search.substring(1).match(reg) ?? '';
  if (match.length > 2) {
    return decodeURIComponent(match[2]);
  } else {
    return '';
  }
}

function getUrlParams() {
  if (getQueryParam('sourceValue')) {
    setStorageData('ems-sourcevalue', getQueryParam('sourceValue'));
    setStorageData('ems-wholeHospitalFlag', 'true');
    if (getQueryParam('cloudToken')) {
      setStorageData('ems-cloudToken', getQueryParam('cloudToken'));
    }
    if (getQueryParam('tenantId')) {
      setStorageData('energy-corpid', getQueryParam('tenantId'));
    }
    if (getQueryParam('token')) {
      setStorageData('energy-token', getQueryParam('token'));
    }
    if (getQueryParam('loginName')) {
      setStorageData('energy-loginName', getQueryParam('loginName'));
    }
  }
}

/**
 * 加密
 * @param data 加密字段
 * @returns 参数名对应的加密值
 */
export function FEncrypto(data: string): string {
  const encoder = new TextEncoder();
  const text = encoder.encode(data);
  const key = encoder.encode('yPiwWYoeTGuUTAW7');
  // const iv = crypto.randomBytes(12);
  let iv = new Uint8Array(getArrayRound()); //12位的iv
  // 4、加密
  const encText = asmCrypto.AES_GCM.encrypt(text, key, iv);
  //5.将iv向量与加密后的密文（Uint8Array）相加再转换成BASE64字符串
  return asmCrypto.bytes_to_base64([...iv, ...encText]);
}

// 随机生成六位首位非0数
export const getRandomSixNum = () => {
  let RandomSixStr = '';
  for (let i = 0; i < 6; i++) {
    if (i === 0) {
      RandomSixStr += getRandomNum();
    } else {
      RandomSixStr += String(Math.floor(Math.random() * 10));
    }
  }
  return RandomSixStr;
};

const getRandomNum = () => {
  let number = String(Math.floor(Math.random() * 10));
  if (number === '0') {
    number = getRandomNum();
  }
  return number;
};

// 生成一组随机数
function getArrayRound(): number[] {
  let arr = [];
  for (let i = 0; i < 12; i++) {
    const randomNum6 = Math.round(Math.random() * 128);
    arr.push(randomNum6);
  }
  return arr;
}

/**
 * 生成权限校验字段
 * @returns
 */
export const FGetAuthorization = () => {
  const diffTime = Number(sessionStorage.getItem('dTimeValue')) ?? 0;
  const authorization = `${
    new Date().getTime() + diffTime
  }_${getRandomSixNum()}_${FGetStorageData('energy-loginName')}`;
  return FEncrypto(authorization);
};
