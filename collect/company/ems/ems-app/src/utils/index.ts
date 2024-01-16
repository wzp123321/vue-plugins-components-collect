import type { Common_IHttpResponseImpl, Common_IObject, Common_ITHCompareVO } from '@/api/model';
import { commonHttp } from '@/api/request';
import { Common_EBridgeType, Common_EKeyboardType, Common_ELoadPlatform, Common_ETimeUnit } from '@/config/enum';
import nativeBridgeService from '@/core/nativeBridge';
import {
  endOfDay,
  endOfMonth,
  endOfYear,
  format,
  isThisMonth,
  isThisYear,
  isToday,
  startOfDay,
  startOfMonth,
  startOfYear,
} from 'date-fns';
import store from '../store/index';
import { FGetStorageData, FSetStorageData } from './storage';
import { SESSION_KEY_LOAD_PLAT, SESSION_KEY_TIME_DIFF } from '@/config/session-key';

/**
 *
 * @returns 获取系统信息字段
 */
export const mapSystemInfo = () => {
  const sys = uni.getSystemInfoSync();
  const { windowHeight, windowWidth, platform, screenHeight, screenWidth } = sys;
  console.log('%c✨✨获取系统信息✨✨', 'font-size: 24px', sys, windowHeight, windowWidth, platform);

  return { windowHeight, windowWidth, screenHeight, screenWidth, platform };
};

/**
 * 处理数据千分位
 * @param state
 * @returns
 */
export const thousandSeparation = (value: number | null, returnType?: string) => {
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
    if (after || after === '0') {
      return before.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + after;
    } else {
      return before.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  } else {
    return returnType ? returnType : '-';
  }
};

/**
 * 获取地址参数项
 * @param key 参数名
 * @returns 参数名对应的值
 */
export const FGetQueryParam = (key: string): string | undefined => {
  const reg = new RegExp('(^|&)' + key + '=([^&]*)(&|$)', 'i');
  const match = window.location.search.substring(1).match(reg) ?? '';
  if (match.length > 2) {
    return decodeURIComponent(match[2]);
  }
};

/**
 * 解决乘法导致精度丢失
 * @param arg1
 * @param arg2
 * @returns
 */
export const floatMultiply = (arg1: number | null, arg2: number | null) => {
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
 * 跳转页面
 * @param url
 * @param params
 */
export const handlePageTo = (url: string, params?: Common_IObject) => {
  if (params) {
    Object.entries(params).forEach(([k, v], index) => {
      url += (index === 0 ? '?' : '&') + `${k}=${v}`;
    });
  }
  uni.navigateTo({
    url,
  });
};

/**
 * rpx转px
 * @param rpx
 * @returns
 */
export const rpxToPx = (rpx: string) => {
  const screenWidth = uni.getSystemInfoSync().screenWidth;
  return (screenWidth * Number.parseInt(rpx)) / 750;
};

/**
 * px转rpx
 * @param px
 * @returns
 */
export const pxToRpx = (px: string) => {
  const screenWidth = uni.getSystemInfoSync().screenWidth;
  return (750 * Number.parseInt(px)) / screenWidth;
};

/**
 * 获取当前时间
 * @returns
 */
export const mapDatePickerField = (timeUnit: string): string => {
  let field = 'day';
  switch (timeUnit) {
    case Common_ETimeUnit.日:
      field = 'day';
      break;
    case Common_ETimeUnit.月:
      field = 'month';
      break;
    case Common_ETimeUnit.年:
      field = 'year';
      break;
  }
  return field;
};

/**
 * 获取当前时间
 * @returns
 */
export const getCurrentDateStr = (): string => {
  const date = new Date();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  return `${date.getFullYear()}-${m > 9 ? m : '0' + m}-${d > 9 ? d : '0' + d}`;
};

/**
 * 隐藏顶部状态栏
 */
export const mapStatusBarHide = () => {
  if (mapIsAppPlat()) {
    nativeBridgeService.nativeCall(Common_EBridgeType.隐藏状态栏, { type: 1 }, () => {});
  }
};

/**
 * 适配原生键盘
 */
export const mapAdaptiveKeyboard = (type: Common_EKeyboardType = Common_EKeyboardType.关闭原生适配键盘) => {
  if (mapIsAppPlat()) {
    nativeBridgeService.nativeCall(Common_EBridgeType.原生键盘适配, { type }, () => {});
  }
};

/**
 * 安卓系统
 * @returns
 */
export const mapIsAndroid = () => {
  const u = navigator.userAgent;
  return u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //判断是否是 android终端
};

/**
 * IOS系统
 * @returns
 */
export const mapIsIOS = () => {
  const u = navigator.userAgent;
  return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //判断是否是 iOS终端
};

/**
 * 响应处理
 * @param res 响应体
 * @returns 返回数据
 * @throws 异常信息
 */
export function FResHandler<T = void>(res: Common_IHttpResponseImpl<T>): T {
  if (res?.success) {
    return res.data;
  }

  throw res?.message ?? '未知原因';
}

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
 * 查询系统时间
 */
export const getSystemTime = async () => {
  try {
    const res = await commonHttp.post<unknown, string>('/common/system/time', {});
    const result = FResHandler<string>(res);

    store.dispatch('setSystemTime', result);
    // 兼容mac
    const dTimeValue = String(new Date(result.replaceAll('-', '/')).getTime() - new Date().getTime());

    FSetStorageData(SESSION_KEY_TIME_DIFF, dTimeValue);
    console.log('%c✨✨查询系统时间✨✨', 'font-size: 24px', result, new Date().getTime());
  } catch (error) {
    console.log('%c✨✨查询系统时间✨✨', 'font-size: 24px', error);
    FSetStorageData(SESSION_KEY_TIME_DIFF, '0');
    store.dispatch('setSystemTime', new Date());
  }
};

/**
 * 是APP平台
 * @returns {boolean}
 */
export const mapIsAppPlat = () => {
  return FGetStorageData(SESSION_KEY_LOAD_PLAT) && FGetStorageData(SESSION_KEY_LOAD_PLAT) === Common_ELoadPlatform.APP;
};

/**
 * 是企业微信平台
 * @returns {boolean}
 */
export const mapIsWxWorkH5Plat = () => {
  return (
    FGetStorageData(SESSION_KEY_LOAD_PLAT) && FGetStorageData(SESSION_KEY_LOAD_PLAT) === Common_ELoadPlatform.企业微信
  );
};

/**
 * 处理时间格式化
 * 10m -- YYYY-MM-DD HH:mm
 *  如果末尾时间是今天需要格式化到当前时间 如果是历史时间即23:59
 * 1h  -- YYYY-MM-DD HH
 *  如果末尾时间是今天需要格式化到当前时间 如果是历史时间即23:59
 * 1d  -- YYYY-MM-DD
 *  如果末尾时间是今天需要格式化到当前时间 如果是历史时间即23:59
 * 1M -- YYYY-MM
 *  如果末尾时间是当月需要格式化到当前时间 如果是历史时间即月尾 23:59
 * 1y -- YYYY
 *  如果末尾时间是今年需要格式化到当前时间 如果是历史时间即年尾 23:59
 * @param timeUnit 时间颗粒度
 * @param dateStr 时间
 * @returns 字符串数组
 */
export const getTimeScopeByTimeUnit = (timeUnit: string, dateStr: string) => {
  const convertDate = !!dateStr ? new Date(dateStr) : new Date();
  const formatUnit = 'yyyy-MM-dd HH:mm';
  let startTime = '';
  let endTime = '';
  switch (timeUnit) {
    case Common_ETimeUnit.年:
      startTime = formatDate(startOfYear(convertDate), formatUnit);
      endTime = formatDate(!isThisYear(convertDate) ? endOfYear(convertDate) : new Date(), formatUnit);
      break;
    case Common_ETimeUnit.月:
      startTime = formatDate(startOfMonth(convertDate), formatUnit);
      endTime = formatDate(!isThisMonth(convertDate) ? endOfMonth(convertDate) : new Date(), formatUnit);
      break;
    case Common_ETimeUnit.日:
      startTime = formatDate(startOfDay(convertDate), formatUnit);
      endTime = formatDate(!isToday(convertDate) ? endOfDay(convertDate) : new Date(), formatUnit);
      break;
  }
  return { startTime, endTime };
};

/**
 * @Author: zpwan
 * @Date: 2022-10-12 15:07:10
 * @Last Modified by: zpwan
 * @Last Modified time: 2023-04-27 18:47:03
 *
 * 10m，1h
 *  没有同环比
 * 1d：
 *  1.包含当天 如 2022.10.11-2022.10.12 没有同环比，
 *  2.不包含当天&跨月不跨年如 2022.09.28-2022.10.01 只有同比没有环比
 *  3.跨年 如 2021.11.11-2022.09.09 没有同环比
 *  4.非钻取情况，查询时间只有当天的没有同环比
 * 1M：
 *  1.包含当月 如2022.09-2022.10 没有同环比
 *  2.不包含当月&跨年 如 2021.11-2022.09 没有同环比
 *  3.非钻取情况，查询时间只有当月的没有同环比
 * 1y：
 *  1.没有环比
 *  2.钻取情况，查询时间包含当年的没有同比
 *  3.非钻取情况，查询时间只有当年的没有同比
 *
 * @param timeUnit 时间颗粒度  10m  1h  1d  1M  1y
 * @param dateArr 时间范围
 */
export const checkHasTHCompare = (timeUnit: string, date: string): Common_ITHCompareVO => {
  const { startTime, endTime } = getTimeScopeByTimeUnit(timeUnit, date);
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  const compareVO: Common_ITHCompareVO = {
    tbFlag: true,
    hbFlag: true,
  };
  switch (String(timeUnit)) {
    case '10m':
    case '1h':
      compareVO.hbFlag = false;
      compareVO.tbFlag = false;
      break;
    case '1d':
      if (isToday(startDate) || isToday(endDate)) {
        compareVO.hbFlag = false;
        compareVO.tbFlag = false;
      } else if (startDate?.getMonth() !== endDate?.getMonth() && startDate?.getFullYear() === endDate?.getFullYear()) {
        compareVO.hbFlag = false;
        compareVO.tbFlag = true;
      } else if (startDate?.getFullYear() !== endDate?.getFullYear()) {
        compareVO.hbFlag = false;
        compareVO.tbFlag = false;
      }
      break;
    case '1M':
      if (isThisMonth(startDate) || isThisMonth(endDate)) {
        compareVO.hbFlag = false;
        compareVO.tbFlag = false;
      } else if (startDate?.getFullYear() !== endDate?.getFullYear()) {
        compareVO.hbFlag = false;
        compareVO.tbFlag = false;
      }
      break;
    case '1y':
      if (isThisYear(startDate) || isThisYear(endDate)) {
        compareVO.hbFlag = false;
        compareVO.tbFlag = false;
      } else if (startDate?.getFullYear() !== endDate?.getFullYear()) {
        compareVO.hbFlag = false;
        compareVO.tbFlag = false;
      }
      compareVO.hbFlag = false;
      break;
    default:
      compareVO.hbFlag = false;
      compareVO.tbFlag = false;
      break;
  }
  return compareVO;
};

/**
 * 根据颗粒度返回格式化
 * @param timeUnit
 * @returns {string}
 */
export const mapTimeUnitFormat = (timeUnit: string): string => {
  return timeUnit === Common_ETimeUnit.年 ? 'yyyy' : timeUnit === Common_ETimeUnit.月 ? 'yyyy-MM' : 'yyyy-MM-dd';
};
