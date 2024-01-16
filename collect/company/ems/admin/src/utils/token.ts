import message from '@/utils/message';
import { FORBIDDEN_CODE } from '../config/index';
import { CheckTokenRes } from '@/services/common/common-api';
import commonService from '@/services/common/common';
import { ElLoading, ElMessageBox } from 'element-plus';
import { HttpResponseImpl } from '../services/common/common-api';
import { SHA256 } from 'crypto-js';
import { setStorageData, getStorageData } from '@tiansu/tools';
import store from '@/store/index';
import GatewayUtil from './access-token/gatewayUtil';
const asmCrypto = require('asmcrypto.js');

/**
 * 响应处理
 * @param res 响应体
 * @returns 返回数据
 * @throws 异常信息
 */
export function FResHandler<T = void>(res: HttpResponseImpl<T>): T {
  if (res?.success) {
    return res.data;
  }

  throw res?.message ?? '未知原因';
}

/**
 * 获取地址参数项
 * @param key 参数名
 * @returns 参数名对应的值
 */
export function FGetQueryParam(key: string): string | undefined {
  const reg = new RegExp(`(^|&)${key}=([^&]*)(&|$)`, 'i');
  const match = window.location.search.substring(1).match(reg) ?? '';
  if (match.length > 2) {
    return decodeURIComponent(match[2]);
  }
}

// 获取路由参数
export function FGetRouterLinkParams() {
  return {
    showtype: FGetQueryParam('showtype') as string,
    corpid: FGetQueryParam('corpid') as string,
    token: FGetQueryParam('token') as string,
  };
}

// 拼接跳转参数
export const jointSkipParams = () => {
  const params = FGetSessionStorageData('energy-token')
    ? {
        showtype: FGetSessionStorageData('energy-showtype') as string,
        corpid: FGetSessionStorageData('energy-corpid') as string,
        token: FGetSessionStorageData('energy-token') as string,
        ts_sign: FGetSessionStorageData('energy-ts_sign') as string,
      }
    : {
        tenantCode: FGetSessionStorageData('energy-corpid') as string,
        loginName: FGetSessionStorageData('energy-loginName') as string,
      };
  return Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
};

// 存入cookie
export function FSetCookie(key: string, value?: string): void {
  if (!key) {
    return;
  }
  // 先置空
  document.cookie = `${key.toLowerCase()}=${encodeURIComponent('')};path=/`;
  document.cookie = `${key.toLowerCase()}=${encodeURIComponent(value ?? '')};path=/`;
}

// 取cookie
export function FGetCookie(key: string): string | undefined {
  const reg = new RegExp(`(^| )${key.toLowerCase()}=([^;]*)(;|$)`, 'i');
  const match = document.cookie.match(reg) ?? '';
  if (match.length > 2) {
    return decodeURIComponent(match[2]);
  }
}

export function FSetSession(key: string, value?: string): void {
  if (!key) {
    return;
  }

  sessionStorage.setItem(key.toLowerCase(), encodeURIComponent(value ?? ''));
}
export function FGetSession(key: string): string | undefined {
  const value = sessionStorage.getItem(key.toLowerCase());
  if (value) {
    return decodeURIComponent(value);
  }
}

/**
 * 设置缓存数据
 * @param key
 * @param value
 * @returns
 */
export function FSetSessionStorageData(key: string, value?: string): void {
  if (!key) {
    return;
  }
  setStorageData(key, value);
}

/**
 * 取缓存数据
 * @param key
 * @returns
 */
export function FGetSessionStorageData(key: string): string | undefined {
  return getStorageData(key);
}

/**
 * token鉴权，获取用户信息
 * @param params
 * @returns
 */
export const getUserInfoByTokenCheck = () => {
  return new Promise(async (resolve) => {
    const loadingInstance = ElLoading.service();
    try {
      const token = (FGetSessionStorageData('energy-token') as string) ?? '';
      const res: HttpRequestModule.ResTemplate<CheckTokenRes> = await commonService.getTenantInfoByToken(
        token ? token : {},
      );
      if (res && res.success) {
        FSetSessionStorageData('energy-loginName', res?.data?.user?.loginName);
        FSetSessionStorageData('ems-username', res?.data?.user?.name);
        store.dispatch('setTenantVO', res?.data);
        resolve(true);
      } else {
        resolve(false);

        if (res?.code === FORBIDDEN_CODE) {
          clearCookies();
          if (store?.getters?.forbiddenReqFlag) {
            return;
          }
          store.dispatch('setForbiddenReqFlag', true);
          ElMessageBox.alert('登录信息已失效，请重新登录', '', {
            confirmButtonText: '确认',
            showClose: false,
            showCancelButton: false,
            type: 'warning',
          })
            .then(() => {
              window.location.href = String(res?.message) ?? store?.getters?.tenantVO?.tenant?.loginUrl;
            })
            .catch(() => {
              console.warn('cancel');
            });
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            message.error(res?.message ?? '页面加载失败');
          }
        }
      }
    } catch (error) {
      console.log('error, ', error);
      resolve(false);
      message.error('页面加载失败');
    } finally {
      loadingInstance.close();
    }
  });
};

// 清空cookie
export function clearCookies() {
  const cnames: string[] = ['energy-token', 'energy-corpid', 'energy-showtype', 'energy-loginName', 'ems-username'];
  const exdays = -1;
  if (cnames?.length) {
    cnames.forEach((cname) => {
      const d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      const expires = 'expires=' + d.toUTCString();
      document.cookie = cname.toLowerCase() + '=' + '' + '; ' + expires;
    });
  }
}

// 跳转至无权限
export function linkToForbiddenPage() {
  window.location.href = `${process.env.NODE_ENV === 'development' ? '' : '/energy/ems/ems-admin'}/forbidden`;
}

function buildSource(method: string, url: string, data: string, salt: string) {
  let source = method;
  if (!!salt) {
    source += salt;
  }
  source += url;
  if (data) {
    source += data;
  }
  return source;
}
//验签校验
export function signHttpSha256(method: string, url: string, data: string) {
  if (url.indexOf('http://') === 0) {
    url = url.replace(/http:\/\/[^\/]+/, '');
  }
  const source = buildSource(method, url, data, 'nts==2022');
  return SHA256(source).toString();
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
  let iv = new Uint8Array(getArrayRound()); //12位的iv
  // const iv = crypto.randomBytes(12);
  // 4、加密
  const encText = asmCrypto.AES_GCM.encrypt(text, key, iv);
  //5.将iv向量与加密后的密文（Uint8Array）相加再转换成BASE64字符串
  return asmCrypto.bytes_to_base64([...iv, ...encText]);
}

// 生成一组随机数
function getArrayRound(): number[] {
  let arr = [];
  for (let i = 0; i < 12; i++) {
    const randomNum6 = Math.round(Math.random() * 128);
    arr.push(randomNum6);
  }
  return arr;
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

/**
 * 生成权限校验字段
 * 本机时间+时间差
 * @returns
 */
export const FGetAuthorization = () => {
  const dValue = Number(store.getters.diffTime);
  const authorization = `${new Date().getTime() + dValue}_${getRandomSixNum()}_${FGetSessionStorageData(
    'energy-loginName',
  )}`;
  return FEncrypto(authorization);
};

/**
 * 文件上传处理
 * @param accept 允许的后缀
 * @returns 目标文件域
 */
export function FUploadHandler(accept?: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const element = document.createElement('input');
    element.type = 'file';
    accept && (element.accept = accept);
    element.click();
    element.onchange = () => {
      const file = element.files?.[0];
      if (file?.size) {
        resolve(file);
      } else {
        reject('无法选取文件');
      }
      element.remove();
    };
  });
}

// 校验文件
export const verifyUpload = (
  list: File[],
  target: File,
  maxSize: number,
  accept: { [key: string]: string },
  total: number,
): boolean => {
  if (target?.size > maxSize * 1024 * 1024) {
    message.error(`上传${target?.name ?? ''}失败，文件大小不能超过${maxSize}MB！`);
    return false;
  }

  if (!Object.values(accept).includes(target?.type)) {
    message.error(`上传${target?.name ?? ''}失败，当前页面只支持上传${Object.keys(accept).join('/')}格式文件！`);
    return false;
  }

  if (list.map((file) => file.name).includes(target?.name)) {
    message.error(`上传${target?.name ?? ''}失败，已存在同名文件，请修改文件名称重新上传！`);
    return false;
  }

  let totalSize = list.reduce((total: number, currentValue: File) => {
    return total + currentValue.size;
  }, 0);

  totalSize += target.size;
  if (totalSize > total * 1024 * 1024) {
    message.error(`上传${target?.name ?? ''}失败，待上传附件总大小不能超过${total}MB！`);
    return false;
  }

  return true;
};

/**
 * 二进制响应处理
 * @param blob 二进制流
 * @param name 输出文件名
 */
export function FBlobHandler(blob: Blob, name?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (blob.size) {
      const reader = new FileReader();

      if (blob.type.includes('json')) {
        reader.onloadend = (e) => {
          const res: any = JSON.parse(e.target?.result as string);
          reject(res?.errmsg ?? '未知原因');
        };
        reader.readAsText(blob);
      } else {
        reader.onloadend = (e) => {
          FDownLoadHandler(e.target?.result as string, name)
            .then(() => resolve())
            .catch((error) => reject(error));
        };
        reader.readAsDataURL(blob);
      }
    } else {
      reject(`无法获取${name || '文件'}`);
    }
  });
}

/**
 * 文件下载处理
 * @param url 源路径
 * @param name 输出文件名
 */
export function FDownLoadHandler(url: string, name?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (url) {
      const element = document.createElement('a');
      element.href = url;
      name && (element.download = name);
      element.click();
      resolve();
      element.remove();
    } else {
      reject(`无法下载${name || '文件'}`);
    }
  });
}

/**
 * 退出登录
 */
export const handleLogOut = async () => {
  try {
    const parms = {
      tenantId: Number(FGetSessionStorageData('energy-corpid')),
      tenantCode: FGetSessionStorageData('energy-corpid') as string,
      token: FGetSessionStorageData('energy-token') as string,
    };
    const res = await commonService.logOut(parms);
    if (res && res?.code === 200) {
      GatewayUtil.removeShareStorage();
      GatewayUtil.removeAccessTokenStorage();
      window.location.href = res?.data;
      clearCookies();
    }
  } catch (error) {
    console.warn('logout-error=-================', error);
  }
};
