import { format } from 'date-fns';
import { Common_IHttpRes } from '../services/api';
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
    return returnType ? returnType : '--';
  }
};

/**
 * 根据时间戳返回标准时间
 * @param date 时间戳
 * @param formatString format格式
 * @returns 标准格式的时间
 */
export const formatDate = (date: any, formStr = 'yyyy-MM-dd HH:mm:ss') => {
  return !date ? '--' : format(date, formStr);
};
/**
 * 响应处理
 * @param res 响应体
 * @returns 返回数据
 * @throws 异常信息
 */
export function FResHandler<T = void>(res: Common_IHttpRes<T>): T {
  if (res?.success) {
    return res.data;
  }

  throw res?.message ?? '未知原因';
}

/**
 * 计算文本的宽度
 * @param str 
 * @param fontSize 
 * @param fontWeight 
 * @returns 
 */
export const  mapTextWidth=(str: string, fontSize: string, fontWeight: string) =>{
  let width = 0;
  const html = document.createElement('span');
  html.innerText = str;
  html.className = 'getTextWidth';
  html.style.fontSize = fontSize;
  html.style.fontWeight = fontWeight;
  document.querySelector('body')?.appendChild(html);
  width = (document.querySelector('.getTextWidth') as HTMLElement).offsetWidth;
  document.querySelector('.getTextWidth')?.remove();
  return width;
}