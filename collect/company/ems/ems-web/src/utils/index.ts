import { FGetSession } from '@/utils/token';
// sessionstorage key值
import themeOptions from '@/config/theme';
import { MANAGE_PUBLIC_PATH, PUBLIC_PATH } from '@/config/config';

import { find, filter } from 'lodash';
import { differenceInCalendarDays, format, isToday, endOfMonth, isThisMonth, isThisYear } from 'date-fns';
import { init, EChartsOption } from 'echarts';
import { clearCookies, FGetStorageData, jointSkipParams } from '@/utils/token';
import { useCommonController } from './use-common-controller';

import message from '@/utils/message';

import { Common_IHttpResponse } from '@/services/common/common-api';
import commonService from '@/services/common/common.service';
import { h, shallowRef } from 'vue';

// 节流防抖 时间戳
let timeStamp: number;

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
    message.success(`${type}成功`);
    if (typeof cb === 'function') {
      cb();
    }
  } catch (error) {
    if (typeof cb === 'function') {
      cb();
    }
    message.error(`${type}失败`);
  }
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
 * 设置主题色
 * @param mode 模式 light/dark
 */
export const switchCustomTheme = (mode = 'light' || 'dark') => {
  const rootElement: Element | null = document.querySelector(':root');
  if (!rootElement) {
    return;
  }

  const options: GlobalModule.CommonObject = themeOptions[mode];
  if (!options) {
    return;
  }
  Object.keys(options).forEach((key: string) => {
    (rootElement as any).style.setProperty(key, options[key]);
  });

  document.getElementsByTagName('body')[0].className = mode + '-mode';
};

/**
 * 防抖函数
 *  -- 在一段时间内多次触发函数fn 当间隔一段时间没有再次触发fn后才会执行
 * @param fn
 * @param await
 */
let timeout: any;
export const debounce = (fn: () => void, delay = 800) => {
  clearTimeout(timeout);
  timeout = setTimeout(fn, delay);
};

/**
 * 节流函数
 *  --在一段时间内多次触发函数fn 一段时间内只会执行一次
 * @param fn
 * @param timeout
 * @returns
 */
export const throttle = (fn: () => void, timeout = 800) => {
  if (new Date().getTime() - timeStamp < timeout) {
    return;
  }
  timeStamp = new Date().getTime();
  if (typeof fn === 'function') {
    fn();
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
 * 根据时间戳返回标准时间
 * @param date 时间戳
 * @param formatString format格式
 * @returns 标准格式的时间
 */
export const formatDate = (date: any, formatString = 'yyyy-MM-dd HH:mm:ss') => {
  return !date ? '--' : format(date, formatString);
};

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

// 获取地址栏参数
export const getQueryString = (name: string) => {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  // searchStr，获取url中?及之后的字符串
  const searchStr = window.location.href.match(/\?.+$/i);
  if (searchStr) {
    const r = searchStr[0].substr(1).match(reg);
    if (r != null) {
      return r[2];
    }
  }
  return null;
};

/**
 * 处理数据千分位
 * @param state
 * @returns
 */
export const thousandSeparation = (value: number, returnType?: string) => {
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
    return returnType ? returnType : '--';
  }
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
 * 获取时间颗粒度数组方法
 * @startTime 开始日期
 * @endTime 结束日期
 * @returns
 */
export const getTimeUnitItems = async (startTime: any, endTime: any) => {
  const { getDictDataByCode } = useCommonController();
  const timeUnitArr: GlobalModule.DictionaryInfo[] = await getDictDataByCode('time_unit');
  if (timeUnitArr?.length === 0) {
    return [];
  }
  const newArr = timeUnitArr.map((item: any) => {
    return {
      value: item.code,
      label: item.name,
    };
  });
  const particles = [
    // 一日之内，颗粒度为 10分钟、小时
    [filter(newArr, ['value', '10m'])[0], filter(newArr, ['value', '1h'])[0]],
    // 30天之内，颗粒度为 小时、日
    [filter(newArr, ['value', '1h'])[0], filter(newArr, ['value', '1d'])[0]],
    // 超过30日跨度，小于等于365年的，只显示日、月
    [filter(newArr, ['value', '1d'])[0], filter(newArr, ['value', '1M'])[0]],
    // 超过一年跨度的，显示月、年
    [filter(newArr, ['value', '1M'])[0], filter(newArr, ['value', '1y'])[0]],
  ];
  const diffDays = differenceInCalendarDays(endTime, startTime);
  let particleItems = [];
  if (diffDays < 1) {
    particleItems = particles[0];
  } else if (diffDays < 31) {
    particleItems = particles[1];
  } else if (diffDays < 365) {
    particleItems = particles[2];
  } else {
    particleItems = particles[3];
  }
  return particleItems;
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
export const openBlankUrl = (path: string, type: string = 'web', params: GlobalModule.CommonObject = {}) => {
  const prefix =
    type === 'web'
      ? PUBLIC_PATH === '/'
        ? ''
        : PUBLIC_PATH
      : MANAGE_PUBLIC_PATH === '/'
      ? '/energy/ems/ems-admin'
      : MANAGE_PUBLIC_PATH;
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
  // 跳转到外壳页面,如果是云端跳转则不带壳子
  if (FGetStorageData('ems-sourceValue')) {
    const suffixPath = path.replace('/web/', '/');
    switch (suffixPath) {
      case '/costAnalysis':
      case '/energyRate':
        path = path.replace('/web/', '/ems-rate/');
        break;
      case '/eetManualEntry':
      case '/eetEnergyEvent':
      case '/eetBoiler':
      case '/eetFreezer':
      case '/eetGroupControl':
      case '/eetWorkPlan':
      case '/eetWorkRecord':
      case '/eetMeasureLibrary':
        path = path.replace('/web/', '/ems-energy-trusteeship/');
        break;
      default:
        path = path.replace('/web/', '/ems-web/');
        break;
    }
  } else {
    path = path.replace('/web/', '/ems-container/');
  }
  let arr = jointSkipParams().split('&');
  if (paramUrl) {
    arr = arr.concat(paramUrl.slice(1).split('&'));
  }
  const paramStr = [...new Set(arr)].join('&');
  const url = `${prefixUrl}${prefix}${path}?${paramStr}`;
  window.open(url, FGetStorageData('ems-sourceValue') ? '_self' : '_blank');
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
      if (item) {
        keys.push(item[key]);
        if (item[childrenKey] && item[childrenKey].length) {
          item[childrenKey].forEach((childItem: T) => {
            keys.push(childItem[key]);
          });
        }
      }
    });
  }
  return keys;
};

/**
 * 根据options生成echarts 图片
 * @param options 配置
 * @param height 高度
 * @returns 图片文件
 */
export const canvasToFile = (options: EChartsOption, width: number, height: number) => {
  const domEle = document.createElement('canvas');
  domEle.setAttribute('width', `${width}px`);
  domEle.setAttribute('height', `${height}px`);
  const echarts = init(domEle);
  echarts.setOption(options);

  return dataURLtoFile(
    echarts.getDataURL({
      type: 'png',
    }),
    `ehcarts_${Number(Math.random() * 1000).toFixed(0)}`,
  );
};

/**
 * base64转file
 * @param dataUrl base64地址
 * @param filename 文件名
 * @returns file对象
 */
export const dataURLtoFile = (dataUrl: any, filename: string) => {
  if (!dataUrl) {
    return;
  }
  const arr = dataUrl.split(',');
  if (arr?.length === 0) {
    return;
  }
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
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
 * @param dates 时间数组
 * @returns 字符串数组
 */
export const getFormatDateByTimeUnit = (timeUnit: string, dates: Date[]) => {
  let startDate = '';
  let endDate = '';
  switch (timeUnit) {
    case '10m':
      startDate = dates && dates?.length === 2 && dates[0] ? `${formatDate(dates[0], 'yyyy-MM-dd HH:mm')}` : '';
      endDate = dates && dates?.length === 2 && dates[1] ? formatDate(dates[1], 'yyyy-MM-dd HH:mm') : '';
      break;
    case '1h':
      startDate = dates && dates?.length === 2 && dates[0] ? `${formatDate(dates[0], 'yyyy-MM-dd HH')}:00` : '';
      endDate = dates && dates?.length === 2 && dates[1] ? `${formatDate(dates[1], 'yyyy-MM-dd HH:mm')}` : '';
      break;
    case '1d':
      const istoDay = isToday(dates[1]);
      startDate = dates && dates?.length === 2 && dates[0] ? `${formatDate(dates[0], 'yyyy-MM-dd')} 00:00` : '';
      endDate =
        dates && dates?.length === 2 && dates[1]
          ? istoDay
            ? `${formatDate(new Date(), 'yyyy-MM-dd HH:mm')}`
            : `${formatDate(dates[1], 'yyyy-MM-dd')} 23:59`
          : '';
      break;
    case '1M':
      const isToMonth = dates && dates?.length === 2 && dates[1] && isThisMonth(dates[1]);
      startDate = dates && dates?.length === 2 && dates[0] ? `${formatDate(dates[0], 'yyyy-MM')}-01 00:00` : '';
      endDate =
        dates && dates?.length === 2 && dates[1]
          ? isToMonth
            ? formatDate(new Date(), 'yyyy-MM-dd HH:mm')
            : formatDate(endOfMonth(dates[1]), 'yyyy-MM-dd HH:mm')
          : '';
      break;
    case '1y':
      const isToYear = dates && dates?.length === 2 && dates[1] && isThisYear(dates[1]);
      startDate = dates && dates?.length === 2 && dates[0] ? `${formatDate(dates[0], 'yyyy')}-01-01 00:00` : '';
      endDate =
        dates && dates?.length === 2 && dates[1]
          ? isToYear
            ? formatDate(new Date(), 'yyyy-MM-dd HH:mm')
            : `${formatDate(dates[1], 'yyyy')}-12-31 23:59`
          : '';
      break;
  }
  return { startDate, endDate };
};

/**
 * 响应处理
 * @param res 响应体
 * @returns 返回数据
 * @throws 异常信息
 */
export function FResHandler<T = void>(res: Common_IHttpResponse<T>): T {
  if (res?.success) {
    return res.data;
  }

  throw res?.message ?? '未知原因';
}

/**
 * 退出登录
 */
export const handleLogOut = async () => {
  try {
    const parms = {
      tenantId: Number(FGetStorageData('energy-corpid')),
      tenantCode: FGetStorageData('energy-corpid') as string,
      token: FGetStorageData('energy-token') as string,
    };
    const res = await commonService.logOut(parms);
    if (res && res?.code === 200) {
      // GatewayUtil.removeShareStorage();
      // GatewayUtil.removeAccessTokenStorage();
      window.location.href = res?.data;
      clearCookies();
    }
  } catch (error) {
    console.warn('logout-error=-================', error);
  }
};

// 自定义图标
export const customPrefix = shallowRef({
  render() {
    return h('p', { class: 'iconfont icon-Calendar' }, '');
  },
});

export const customClose = shallowRef({
  render() {
    return h('i', { class: 'iconfont icon-Close-Circle-Fill' }, '');
  },
});
