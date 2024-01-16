import message from '@/utils/message';

import { CheckTokenRes } from '@/services/common/common-api';
import commonService from '@/services/common/common.service';

import { ElMessageBox } from 'element-plus';
import { setStorageData, getStorageData, batchRemoveStorageData } from '@tiansu/tools';

import { FORBIDDEN_CODE } from '../config/config';
import store from '@/store/index';

const asmCrypto = require('asmcrypto.js');

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
  const params = FGetStorageData('energy-token')
    ? {
        showtype: (FGetStorageData('energy-showtype') as string) ?? '',
        corpid: (FGetStorageData('energy-corpid') as string) ?? '',
        token: (FGetStorageData('energy-token') as string) ?? '',
      }
    : {
        tenantCode: FGetStorageData('energy-corpid') as string,
        loginName: FGetStorageData('energy-loginName') as string,
      };
  return Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
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
    return decodeURIComponent(match[2]) ? decodeURIComponent(match[2]) : FGetSession(key);
  } else {
    return FGetSession(key);
  }
}

/**
 * 调用公共方法设置本地缓存数据
 * @param key
 * @param value
 */
export function FSetStorageData(key: string, value?: string): void {
  setStorageData(key, value);
}
/**
 * 调用公共方法获取本地缓存数据
 * @param key
 * @returns
 */
export function FGetStorageData(key: string): string | undefined {
  return getStorageData(key);
}
/**
 * 批量删除缓存
 * @param keys
 */
export function FBatchRemoveStorageData(keys?: string[]): void {
  batchRemoveStorageData(keys);
}
/**
 * 设置session
 * @param key
 * @param value
 * @returns
 */
export function FSetSession(key: string, value?: string): void {
  if (!key || !value) {
    return;
  }

  sessionStorage.setItem(key.toLowerCase(), encodeURIComponent(value));
}
/**
 * 取session
 * @param key
 * @returns
 */
export function FGetSession(key: string): string | undefined {
  const value = sessionStorage.getItem(key.toLowerCase());
  if (value) {
    return decodeURIComponent(value);
  }
}

// 清除cookie
export function clearCookies() {
  const cnames: string[] = [
    'energy-token',
    'energy-corpid',
    'energy-showtype',
    'energy-loginName',
    'ems-used-campus',
    'ems-username',
    'ems-wholehospitalflag',
  ];
  const exdays = -1;
  if (cnames?.length) {
    cnames.forEach((cname) => {
      const d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      const expires = 'expires=' + d.toUTCString();
      document.cookie = cname.toLowerCase() + '=' + '' + '; ' + expires;

      FSetStorageData(cname, '');
    });
  }
}

/**
 * token鉴权，获取用户信息
 * @param params
 * @returns
 */
export const getUserInfoByTokenCheck = () => {
  return new Promise(async (resolve) => {
    try {
      const token = FGetStorageData('energy-token') as string;
      const res: HttpRequestModule.ResTemplate<CheckTokenRes> = await commonService.getTenantInfoByToken(token);
      if (res && res.success && res?.code === 200) {
        FSetStorageData('energy-loginName', res?.data?.user?.loginName);
        FSetStorageData('ems-username', res?.data?.user?.name);
        store.dispatch('setTenantVO', res?.data);
        resolve(true);
      } else {
        resolve(false);

        if (res?.code === FORBIDDEN_CODE) {
          if (store.getters.forbiddenReqFlag) {
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
              if (res?.message) {
                window.location.href = (res?.message as string) ?? store?.getters?.tenantVO?.tenant?.loginUrl;
              }
              clearCookies();
            })
            .catch(() => {
              console.warn('cancel');
            });
        } else {
          message.error(res?.message ?? '页面加载失败');
        }
      }
    } catch (error) {
      message.error('页面加载失败');
      resolve(false);
    }
  });
};

// 跳转至无权限
export function linkToForbiddenPage() {
  window.location.href = `${process.env.NODE_ENV === 'development' ? '' : '/ems'}/forbidden`;
}

// 获取补充的院区字段
export function getCampusParams() {
  return {
    hospitalCodeList: FGetStorageData('ems-used-campus')
      ? JSON.parse(FGetStorageData('ems-used-campus') as string)
      : [],
    wholeHospitalFlag: FGetStorageData('ems-wholeHospitalFlag') == 'true',
  };
}

// 获取公共树--props
export function FGetElTreeDefaultProps(
  children: string = 'childTree',
  label: string = 'treeName',
  disabledKey: string = 'lockFlag',
  disabledValue: any = true,
) {
  return {
    children,
    label,
    disabled: (data: GlobalModule.CommonObject, tree: GlobalModule.CommonObject) => {
      return data[disabledKey] === disabledValue;
    },
  };
}

// 禁用props
export const disabledProps = {
  disabledKey: 'lockFlag',
  disabledValue: true,
};

/**
 * 加密
 * @param data 加密字段
 * @returns 参数名对应的加密值
 */
export function FEncrypto(data: string): string {
  const encoder = new TextEncoder();
  const text = encoder.encode(data);
  const key = encoder.encode('yPiwWYoeTGuUTAW7');
  const iv = new Uint8Array(getArrayRound()); //12位的iv
  // const iv = crypto.randomBytes(12);
  // 4、加密
  const encText = asmCrypto.AES_GCM.encrypt(text, key, iv);
  //5.将iv向量与加密后的密文（Uint8Array）相加再转换成BASE64字符串
  return asmCrypto.bytes_to_base64([...iv, ...encText]);
}

// 生成一组随机数
function getArrayRound(): number[] {
  const arr = [];
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
 * @returns
 */
export const FGetAuthorization = () => {
  const dValue = Number(sessionStorage.getItem('dTimeValue'));
  const authorization = `${new Date().getTime() + dValue}_${getRandomSixNum()}_${FGetStorageData('energy-loginName')}`;
  return FEncrypto(authorization);
};
