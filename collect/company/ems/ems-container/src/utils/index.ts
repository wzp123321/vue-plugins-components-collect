import { IFRAME_ID, PUBLIC_PATH, FORBIDDEN_CODE, MANAGE_PUBLIC_PATH, CONTAINER_PUBLIC_PATH } from '../config/config';
import commonService from '../services/common.service';
import store from '@/store/index';

import { ElMessage } from 'element-plus';
import { CommonObject, ResTemplate, CheckTokenRes } from '../services/common.type';
import { SHA256 } from 'crypto-js';
import GatewayUtil from './access-token/GatewayUtil';
import { setStorageData, getStorageData, batchRemoveStorageData } from '@tiansu/tools';

const asmCrypto = require('asmcrypto.js');

/**
 * 创建a标签点击跳转
 * @param path 链接
 */
export const globalPageLink = async (path: string, query: CommonObject) => {
  if (document.getElementsByTagName('iframe')?.length === 0) {
    return;
  }
  const paramStr = jointIframeLoadParams(query);
  const url = path?.replace('/ems-container/', '/');

  if (url === '/404' || url === '/forbidden') {
    loadIframe(url, paramStr);
  } else {
    const checkUrl = await checkMenuUrl(url);
    loadIframe(checkUrl, paramStr);
  }
};
// 清除多余的跳转缓存数据
export const clearRedundantSession = () => {
  const keys = [
    'ems-energyAbnormalParams',
    'ems-analysis-query-params',
    'ems-energyRankingLinkParam',
    'ems-anomaly-event-params',
    'ems-departmentFlag',
  ];
  batchRemoveStorageData(keys);
};

// 加载iframe
const loadIframe = (url: string, paramStr: string) => {
  url = `${PUBLIC_PATH}${url}`;
  const aEle = document.createElement('a');
  const prefixUrl = `${getCurrentDomain()}${url}?${jointSkipParams()}&${paramStr}`;
  console.log('%c🚀 ~ index.ts ~ 48行', 'font-size: 18px', prefixUrl);
  aEle.href = prefixUrl;
  aEle.target = IFRAME_ID;
  aEle.click();
  window.sessionStorage.setItem('TENANT_CODE', FGetSessionStorageData('energy-corpid') as string);
};

/**
 * 拼接iframe跳转参数 --- 字符串格式
 */
const jointIframeLoadParams = (query: CommonObject) => {
  // 拼接的参数
  const tenantCode = FGetSessionStorageData('energy-corpid') as string;
  const username = FGetSessionStorageData('energy-loginName') as string;
  const ts_sign = FGetSessionStorageData('energy-ts_sign') as string;
  // 隐藏token corpid showtype等字段
  const ignoreKeys = ['token', 'corpid', 'showtype', 'loginName'];
  let params: {
    tenantCode?: string;
    username?: string;
    ts_sign?: string;
  } = {};
  if (ts_sign) {
    params = {
      tenantCode,
      username,
      ts_sign,
    };
  } else {
    params = {
      tenantCode,
      username,
    };
  }
  Object.keys(query)?.forEach((item) => {
    if (!ignoreKeys?.includes(item)) {
      params = {
        ...params,
        [item]: query[item],
      };
    }
  });
  const paramStr = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  return paramStr;
};

const checkMenuUrl = (url: string): Promise<string> => {
  return new Promise(async (resolve) => {
    try {
      const res = await commonService.getMenuUrlCheck({ url: replaceConfigureUrl(url) });
      if (res?.code === FORBIDDEN_CODE) {
      } else {
        FSetSessionStorageData(
          'ems-anomaly-authority-buttons',
          res?.data?.buttons ? JSON.stringify(res?.data?.buttons) : '',
        );
        // checkResult为false代表当前无权限
        if (
          Object.prototype.toString.call(res?.data?.checkMenuVO.checkResult) === '[object Boolean]' &&
          !res?.data?.checkMenuVO.checkResult
        ) {
          resolve('/ems-web/404');
        } else {
          resolve(url);
        }
      }
    } catch (error) {
      resolve('/forbidden');
    }
  });
};

/**
 * 替换配置页地址
 * @param url
 */
const replaceConfigureUrl = (url: string) => {
  const urlMap = {
    '/ems-web/kpiQuotaConfigurations': '/ems-web/kpiManagement',
    '/ems-web/energyConservationManage': '/ems-web/energyConservationAssess',
    '/ems-web/equipmentDetailInfo': '/ems-web/equipmentDetail',
    '/ems-log/logManagement': '/ems-log/logManagement?appName=ems',
    '/ems-web/benchmarkingManage': '/ems-web/benchmarkingAnalysis',
    '/ems-web/departmentAssessmentTarget': '/ems-web/departmentAssessment',
  };
  if (!Object.keys(urlMap)?.includes(url)) {
    return url;
  }
  return urlMap[url];
};

/**
 * 获取当前域名
 * @returns
 */
export const getCurrentDomain = () => {
  return `${window.location.protocol}//${window.location.hostname}${
    window.location.port ? ':' + window.location.port : ''
  }`;
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

//设置cookie
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
    });
  }
}

// 拼接跳转参数
export const jointSkipParams = () => {
  const params = FGetSessionStorageData('energy-token')
    ? {
        showtype: FGetSessionStorageData('energy-showtype') as string,
        corpid: FGetSessionStorageData('energy-corpid') as string,
        token: FGetSessionStorageData('energy-token') as string,
      }
    : {
        tenantCode: FGetSessionStorageData('energy-corpid') as string,
        loginName: FGetSessionStorageData('energy-loginName') as string,
      };
  return Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
    .join('&');
};

/**
 * 响应处理
 * @param res 响应体
 * @returns 返回数据
 * @throws 异常信息
 */
export function FResHandler<T = void>(res: ResTemplate<T>): T {
  if (res?.success) {
    return res.data;
  }
  throw res?.message ?? '未知原因';
}

// 跳转至无权限
export function linkToForbiddenPage() {
  window.location.href = `${process.env.NODE_ENV === 'development' ? '' : CONTAINER_PUBLIC_PATH}/forbidden`;
}

/**
 * token鉴权，获取用户信息
 * @param params
 * @returns
 */
export const getUserInfoByTokenCheck = () => {
  return new Promise(async (resolve) => {
    try {
      const token = FGetSessionStorageData('energy-token') as string;
      const res: ResTemplate<CheckTokenRes> = await commonService.getTenantInfoByToken(token ? token : {});
      if (res && res.success && res?.code === 200) {
        FSetSessionStorageData('energy-loginName', res?.data?.user?.loginName);
        FSetSessionStorageData('ems-username', res?.data?.user?.name);
        FSetSessionStorageData('ems-platformName', res?.data?.tenant?.platformName);
        store.dispatch('setTenantVO', res?.data);
        resolve(true);
      } else {
        resolve(false);

        if (res?.code === FORBIDDEN_CODE) {
          clearCookies();
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            ElMessage.error(res?.message ?? '页面加载失败');
          }
        }
      }
    } catch (error) {
      ElMessage.error('页面加载失败');
      resolve(false);
    }
  });
};

// 打开新网页
export const openBlankUrl = (path: string, type: string = 'ems-container', params: CommonObject = {}) => {
  const prefix =
    type === 'ems-container' ? PUBLIC_PATH : MANAGE_PUBLIC_PATH === '/' ? '/energy/ems/ems-admin' : MANAGE_PUBLIC_PATH;
  const prefixUrl = getCurrentDomain();
  // 处理额外参数
  let paramUrl = '';
  if (Object.keys(params)?.length) {
    Object.keys(params).forEach((key) => {
      if (key !== 'tenantCode' && key !== 'username') {
        paramUrl += `&${key}=${params[key]}`;
      }
    });
  }
  const url = `${prefixUrl}${prefix}${path}?${jointSkipParams()}` + paramUrl;
  window.open(url, '_blank');
};

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
  // const iv = crypto.randomBytes(12);
  let iv = new Uint8Array(getArrayRound()); //12位的iv
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
 * @returns
 */
export const FGetAuthorization = () => {
  const dValue = Number(sessionStorage.getItem('dTimeValue'));
  const authorization = `${new Date().getTime() + dValue}_${getRandomSixNum()}_${FGetSessionStorageData(
    'energy-loginName',
  )}`;
  return FEncrypto(authorization);
};

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
