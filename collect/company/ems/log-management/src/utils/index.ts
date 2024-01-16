import { format } from 'date-fns';
import mitt from 'mitt';
import message from '@/utils/message';
import { setStorageData, getStorageData } from '@tiansu/tools';

const bus = mitt();
export default bus;

let timeStamp: any;

/**
 * 创建blob对象，并利用浏览器打开url进行下载
 * @param data 文件流数据
 */
export const downloadBlobFile = (
  data: any,
  name: string,
  type: string,
  cb?: () => void
) => {
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
export const throttle = (fn: () => void, timeout = 800) => {
  if (timeStamp) {
    return;
  }
  timeStamp = setTimeout(() => {
    fn();
    clearTimeout(timeStamp);
  }, timeout);
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
 * 获取tree展开节点数组
 * @param list 数组
 * @param key 节点key
 * @param childrenKey 子节点key
 */
export const getTreeExpandKeys = <T>(
  list: T,
  key: string,
  childrenKey: string
) => {
  const keys: number[] = [];
  if (list && Array.isArray(list) && list.length) {
    list.forEach((item: T) => {
      keys.push(item[key]);
      if (item[childrenKey] && item[childrenKey].length) {
        item[childrenKey].forEach((childItem: T) => {
          keys.push(childItem[key]);
        });
      }
    });
  }
  return keys;
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
 * 监听滚轮事件
 * 删除tooltip dom
 */
export const onScroll = () => {
  const tooltips = document.querySelector(
    '.el-popper.is-dark[aria-hidden="false"]'
  );
  if (tooltips) {
    (tooltips as any).style.display = 'none';
  }
};

// 取cookie
export function FGetCookie(key: string): string | undefined {
  const reg = new RegExp(`(^| )${key}=([^;]*)(;|$)`, 'i');
  const match = document.cookie.match(reg) ?? '';
  if (match.length > 2) {
    return decodeURIComponent(match[2]);
  }
}

/**
 * 取缓存数据
 * @param key
 * @returns
 */
export function FGetSessionStorageData(key: string): string | undefined {
  return getStorageData(key);
}
