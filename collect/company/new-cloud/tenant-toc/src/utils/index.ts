import { h, shallowRef } from 'vue';
import dayjs from 'dayjs';
import store from '@/store/index';
import CommonService from '@/service/pkg';
import message from '@/utils/message';
import { format } from 'date-fns';
import { FGetCookie } from '@/core/token';
import containerRoutes from '../router/containerRoutes';
const asmCrypto = require('asmcrypto.js');
import cryptoUtil from '@/utils/crypto';

export default class Deffer {
  public promise: any;
  public resolve: any;
  public reject: any;
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

/**
 * 设置缓存
 * @param key 键
 * @param data 数据
 */
export const setLocalStorage = <T>(key: string, data: T) => {
  const storage = !window.localStorage.getItem('tenantStorage')
    ? {}
    : JSON.parse(window.localStorage.getItem('tenantStorage') || '{}');
  storage[key] = data;
  window.localStorage.setItem('tenantStorage', JSON.stringify(storage));
};

/**
 * 获取缓存
 * @param key 键
 * @returns
 */
export const getLocalStorage = (key: string) => {
  const storage = !window.localStorage.getItem('tenantStorage')
    ? {}
    : JSON.parse(window.localStorage.getItem('tenantStorage') || '{}');
  return storage[key];
};

/**
 * 根据时间戳返回标准时间
 * @param date 时间戳
 * @param formatString format格式
 * @returns 标准格式的时间
 */
export const formatDate = (date: any, formatString = 'yyyy-MM-dd HH:mm:ss') => {
  return !date ? '--' : format(date, formatString);
};

/**
 * 格式化时间戳
 * @param time 时间戳
 * @param formatStr 格式
 * @returns 格式后的字符串
 */
export const formatDateStamp = (time: number, formatStr: string = 'YYYY-MM-DD HH:mm') => {
  if (!time) {
    return '--';
  }
  return dayjs(time).format(formatStr);
};

/**
 * 获取tree展开节点数组
 * @param list 数组
 * @param key 节点key
 * @param childrenKey 子节点key
 */
export const getTreeExpandKeys = (list: GeneralModule.TreeInfo[], key: string, childrenKey: string) => {
  const keys: number[] = [];
  if (list && Array.isArray(list) && list.length) {
    list.forEach((item: any) => {
      if (item) {
        keys.push(item[key]);
        if (item[childrenKey] && item[childrenKey].length) {
          item[childrenKey].forEach((childItem: any) => {
            keys.push(childItem[key]);
          });
        }
      }
    });
  }
  return keys;
};

// 处理百分比展示
export const transferPercent = (num1: number, num2: number) => {
  let baseNum = 0;
  try {
    baseNum += num1.toString().split('.')[1].length;
  } catch (e) {}
  try {
    baseNum += num2.toString().split('.')[1].length;
  } catch (e) {}
  return (Number(num1.toString().replace('.', '')) * Number(num2.toString().replace('.', ''))) / Math.pow(10, baseNum);
};

/**
 * 解决加法导致精度丢失
 * @param arg1 参数1
 * @param arg2 参数2
 * @returns
 */
export const floatAdd = (arg1: number, arg2: number) => {
  let r1;
  let r2;
  try {
    r1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    r2 = 0;
  }
  const m = Math.pow(10, Math.max(r1, r2));
  return (Number(floatMultiply(arg1, m)) + Number(floatMultiply(arg2, m))) / m;
};

/**
 * 解决减法导致精度丢失
 * @param arg1
 * @param arg2
 * @returns
 */
export const floatSub = (arg1: number, arg2: number) => {
  let r1;
  let r2;
  try {
    r1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    r2 = 0;
  }
  const m = Math.pow(10, Math.max(r1, r2));
  // 动态控制精度长度
  const n = r1 >= r2 ? r1 : r2;
  return (
    (Number(floatMultiply(Number(arg1), Number(m))) - Number(floatMultiply(Number(arg2), Number(m)))) /
    m
  ).toFixed(n);
};

/**
 * 解决乘法导致精度丢失
 * @param arg1
 * @param arg2
 * @returns
 */
export const floatMultiply = (arg1: number, arg2: number) => {
  if (arg1 == null || arg2 == null) {
    return null;
  }
  let r1;
  let r2; // 小数位数
  try {
    r1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    r2 = 0;
  }
  const n1 = Number(arg1.toString().replace('.', ''));
  const n2 = Number(arg2.toString().replace('.', ''));
  return (n1 * n2) / Math.pow(10, r1 + r2);
};

/**
 * 解决除法导致精度丢失
 * @param arg1
 * @param arg2
 * @returns
 */
export const floatDivide = (arg1: number, arg2: number) => {
  if (arg1 == null) {
    return null;
  }
  if (arg2 == null || arg2 == 0) {
    return null;
  }
  let r1;
  let r2; // 小数位数
  try {
    r1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    r2 = 0;
  }
  const n1 = Number(arg1.toString().replace('.', ''));
  const n2 = Number(arg2.toString().replace('.', ''));
  return floatMultiply(n1 / n2, Math.pow(10, r2 - r1));
  // return (n1 / n2) * Math.pow(10, r2 - r1);
};

/**
 * 获取缓存中的tenant信息
 * @returns
 */
export const getTenant = (): GeneralModule.TenantVO => {
  const urlArr = location.pathname.split('/');
  const urlIndex = urlArr.indexOf('home');
  let routePath = '';
  if (urlIndex !== -1) {
    routePath = '/' + urlArr.slice(urlIndex).join('/');
  }
  let index = -1;
  for (let i = 0; i < containerRoutes.length; i++) {
    if (containerRoutes[i].path === routePath) {
      index = i;
      break;
    }
    if (containerRoutes[i].children && containerRoutes[i].children?.length !== 0) {
      index =
        containerRoutes[i].children?.findIndex((item) => {
          return item.path === routePath;
        }) ?? -1;
      if (index !== -1) {
        break;
      }
    }
  }
  let tenantCode = '';
  if (index !== -1 || !routePath || ['/home/projectManage/editor', '/home/projectManage/view'].includes(routePath)) {
    tenantCode = sessionStorage.getItem('TENANT_CODE') ?? '';
  }
  return {
    tenantCode: tenantCode,
    tenantId: Number(sessionStorage.getItem('TENANT_ID')) ?? '',
  };
};

/**
 * 创建blob对象，并利用浏览器打开url进行下载
 * @param data 文件流数据
 */
export const downloadBlobFile = (data: any, name: string, type: string, cb?: () => void) => {
  try {
    // 下载类型
    const blob = new Blob([data], { type: data.type });
    const downloadUrl = window.URL.createObjectURL(blob);

    // 以动态创建a标签进行下载
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    message.success(`${type}成功！`);
    if (typeof cb === 'function') {
      cb();
    }
  } catch (error) {
    if (typeof cb === 'function') {
      cb();
    }
    message.error(`${type}失败！`);
  }
};

/**
 * 监听滚轮事件
 * 删除tooltip dom
 */
export const onScroll = () => {
  const tooltips = document.querySelector('.el-popper.is-dark[aria-hidden="false"]');
  if (tooltips) {
    (tooltips as any).style.display = 'none';
  }
};

/**
 * 根据url生成文件
 * @param url
 * @param imageName
 * @returns
 */
export const getImageFileFromUrl = (url: string, imageName: string): Promise<File> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Accept', 'image/jpeg');
    xhr.responseType = 'blob';
    xhr.onload = () => {
      const blob = xhr.response;
      const imgFile = new File([blob], imageName, { type: 'image/jpeg' });
      resolve(imgFile);
    };
    xhr.onerror = (e) => {
      reject(e);
    };
    xhr.send();
  });
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

/**
 * 获取地址参数项
 * @param key 参数名
 * @returns 参数名对应的值
 */
export function FGetQueryParam(key: string): string | undefined {
  const reg = new RegExp('(^|&)' + key + '=([^&]*)(&|$)', 'i');
  const match = window.location.search.substring(1).match(reg) ?? '';
  if (match.length > 2) {
    return decodeURIComponent(match[2]);
  }
}

/**
 * 处理数据千分位
 * @param state
 * @param decimal 小数位 等于0时代表不补充小数位
 * @returns
 */
export const thousandSeparation = (value: number | null, decimal: number = 0) => {
  if (value || value === 0) {
    const str = typeof value === 'number' ? String(value) : value;
    let before = '';
    let after = '';
    if (str.includes('.')) {
      before = str.split('.')[0];
      after = str.split('.')[1];
    } else {
      before = str;
    }
    let zero = '';
    if (decimal > 0 && decimal > after.length) {
      for (let i = 0; i < decimal - after.length; i++) {
        zero += '0';
      }
    }

    if (after || after === '0') {
      return before.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + after + zero;
    } else {
      return before.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (decimal > 0 ? '.' + zero : '');
    }
  } else {
    return '-';
  }
};

/**
 * 转为百分比
 * @param value
 * @returns
 */
export const convertToPercentage = (value: number | null | string) => {
  if (value || value === 0) {
    const num = typeof value === 'number' ? value : Number(value);
    return floatMultiply(num, 100) + '%';
  } else {
    return '-';
  }
};

// 时间选择器自定义图标
export const customPrefix = shallowRef({
  render() {
    return h('p', { class: 'toc-iconfont icon-toc-Calendar' }, '');
  },
});

export const customClose = shallowRef({
  render() {
    return h('i', { class: 'toc-iconfont icon-toc-qingkong' }, '');
  },
});

export const randomNumber32 = () => {
  return n4() + n4() + n4() + n4() + n4() + n4() + n4() + n4();
};

export const randomNumber16 = () => {
  return n4() + n4() + n4() + n4();
};

export const n4 = () => {
  return (Math.floor(Math.random() * 8999) + 1000).toString();
};

export const mapLabelWidth = (label: string): number => {
  const element = document.createElement('span');
  element.style.visibility = 'hidden';
  element.style.position = 'absolute';
  element.style.fontSize = '14px';
  element.textContent = label;
  document.body.appendChild(element);
  const width = element.clientWidth;
  document.body.removeChild(element);
  return width;
};

export const FGetAuthorization = () => {
  const dValue = Number(sessionStorage.getItem('dTimeValue'));
  const authorization = `${new Date().getTime() + dValue}_${getRandomSixNum()}_${FGetCookie('username')}`;
  return FEncrypto(authorization);
};

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
 * 加密
 * @param data 加密字段
 * @returns 参数名对应的加密值
 */

export function FEncrypto(data: string): string {
  // 接受一个字符串作为输入，返回一个包含 UTF-8 编码的文本的 Uint8Array。
  const encoder = new TextEncoder();
  // 需要加密的明文
  const text: Uint8Array = encoder.encode(data);
  // 秘钥
  const key: Uint8Array = encoder.encode('yPiwWYoeTGuUTAW7');
  // 初始向量
  const iv: Uint8Array = new Uint8Array(getArrayRound()); //12位的iv
  // 4、加密
  const encText: Uint8Array = asmCrypto.AES_GCM.encrypt(text, key, iv);
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

// 判断是否是mac
export function isMac() {
  return /macintosh|mac os x/i.test(navigator.userAgent);
}

/**
 * 生成数字数组
 * @param start
 * @param end
 * @returns
 */
export const makeRange = (start: number, end: number) => {
  const result = [];
  for (let index = start; index <= end; index++) {
    result.push(index);
  }
  return result;
};

/**
 * 阿拉伯数字转中文
 * @param num
 * @returns
 */
export const convertToChinaNum = (num: number) => {
  const arr1 = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const arr2 = ['', '十', '百', '千', '万', '十', '百', '千', '亿', '十', '百', '千', '万', '十', '百', '千', '亿']; //可继续追加更高位转换值
  if (!num || isNaN(num)) {
    return '零';
  }
  const english = num.toString().split('');
  let result = '';
  for (let i = 0; i < english.length; i++) {
    const des_i = english.length - 1 - i; //倒序排列设值
    result = arr2[i] + result;
    const arr1_index = english[des_i] as any;
    result = arr1[arr1_index] + result;
  }
  //将【零千、零百】换成【零】 【十零】换成【十】
  result = result.replace(/零(千|百|十)/g, '零').replace(/十零/g, '十');
  //合并中间多个零为一个零
  result = result.replace(/零+/g, '零');
  //将【零亿】换成【亿】【零万】换成【万】
  result = result.replace(/零亿/g, '亿').replace(/零万/g, '万');
  //将【亿万】换成【亿】
  result = result.replace(/亿万/g, '亿');
  //移除末尾的零
  result = result.replace(/零+$/, '');
  //将【零一十】换成【零十】
  //result = result.replace(/零一十/g, '零十');//貌似正规读法是零一十
  //将【一十】换成【十】
  result = result.replace(/^一十/g, '十');
  return result;
};
