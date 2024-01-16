import { find } from 'lodash';
import { format } from 'date-fns';
// 节流防抖 时间戳
let timeStamp: any;
// components
import message from '@/utils/message';

import { HttpResponseImpl } from '@/services/common/common-api';

/**
 * 获取地址栏参数
 * @returns
 */
export const getUrlParams = (paramName: string) => {
  // 构造一个含有目标参数的正则表达式的对象
  const reg = new RegExp('(^|&)' + paramName + '=([^&]*)(&|$)');
  // 匹配目标参数
  const url = window.location.search.substr(1).match(reg);
  // 返回参数值
  let paramStr = '';
  if (url !== null) {
    paramStr = unescape(url[2]);
  }
  return paramStr;
};

/**
 * defer函数
 */
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
 * 根据时间戳返回标准时间
 * @param date 时间戳
 * @param formatString format格式
 * @returns 标准格式的时间
 */
export const formatDate = (date: any, formatStr = 'YYYY-MM-dd HH:mm:ss') => {
  if (!date) {
    return '--';
  }
  return format(date, formatStr);
};

/**
 * 禁用当前日期以后
 * @param d 日期
 * @returns
 */
export const disableCurrentDate = (d: Date) => {
  return d.getTime() > Date.now();
};

/**
 * 字典转换， 根据value返回label
 * @param {*} value 值
 * @param {*} data 字典数据
 * @returns
 */
export const dicFormat = (value: any, data: any) => {
  if (value === 0 || value) {
    return find(data, ['value', value]) && find(data, ['value', value]).label
      ? find(data, ['value', value]).label
      : '--';
  } else {
    return '--';
  }
};

/**
 * 处理数据空值返回
 * @param {*} value 传入数据
 */
export const formatEmptyValue = (value: string | number, suffix = '') => {
  return !value && value !== 0 ? '--' : `${value}${suffix}`;
};

/**
 * 获取tree展开节点数组
 * @param list 数组
 * @param key 节点key
 * @param childrenKey 子节点key
 */
export const getTreeExpandKeys = <T>(list: T, key: string, childrenKey: string) => {
  const keys: number[] = [];
  if (list && Array.isArray(list) && list.length) {
    list.forEach((item: T) => {
      keys.push(item[key]);
      if (item[childrenKey] && item[childrenKey].length) {
        item[childrenKey].forEach((childItem: T) => {
          keys.push(childItem[key]);
          // if (childItem[childrenKey] && childItem[childrenKey].length) {
          //   childItem[childrenKey].forEach((cItem: T) => {
          //     keys.push(cItem[key]);
          //   });
          // }
        });
      }
    });
  }
  return keys;
};

/**
 * 获取多层tree展开节点数组
 * @param list 数组
 * @param key 节点key
 * @param childrenKey 子节点key
 * @param level 多少层
 */
export const getTreeExpandKeysLevel = (list: Array<any>, key: string, childrenKey: string, level: number): string[] => {
  let keys: string[] = [];
  list.forEach((item) => {
    keys.push(item[key]);
    if (item[childrenKey] && level > 1) {
      keys = keys.concat(getTreeExpandKeysLevel(item[childrenKey], 'id', 'childTree', level - 1));
    }
  });
  return keys;
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
 * 获取当前域名
 * @returns
 */
export const getCurrentDomain = () => {
  return `${window.location.protocol}//${window.location.hostname}${
    window.location.port ? ':' + window.location.port : ''
  }`;
};

// 打开新网页
export const openBlankUrl = (path: string) => {
  const prefixUrl = getCurrentDomain();
  const url = `${prefixUrl}/energy/ems/ems-admin${path}${window.location.search}`;
  window.open(url, '_blank');
};

/**
 * 防抖函数
 *  -- 在一段时间内多次触发函数fn 当间隔一段时间没有再次触发fn后才会执行
 * @param fn
 * @param await
 */
export const debounce = (fn: () => void, timeout = 800) => {
  clearTimeout(timeStamp);
  timeStamp = setTimeout(fn, timeout);
};

/**
 * 节流函数
 *  --在一段时间内多次触发函数fn 一段时间内只会执行一次
 * @param fn
 * @param timeout
 * @returns
 */
export const throttle = (fn: () => void, timeout = 500) => {
  if (timeStamp) {
    return;
  }
  timeStamp = setTimeout(() => {
    fn();
    clearTimeout(timeStamp);
  }, timeout);
};

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

/**
 * 处理百分比展示
 * @param num1
 * @param num2
 * @returns
 */
export const transferPercent = (num1: number, num2: number) => {
  var baseNum = 0;
  try {
    baseNum += num1.toString().split('.')[1].length;
  } catch (e) {}
  try {
    baseNum += num2.toString().split('.')[1].length;
  } catch (e) {}
  return (Number(num1.toString().replace('.', '')) * Number(num2.toString().replace('.', ''))) / Math.pow(10, baseNum);
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

// 数组扁平化
export const flatten = <T>(list: T[], arr: T[] = [], childKey: string) => {
  list?.forEach((node: T) => {
    arr.push(node);
    flatten(node[childKey], arr, childKey);
  });
  return arr;
};

/**
 * 计算字符串dom长度
 * @param label
 * @returns
 */
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
