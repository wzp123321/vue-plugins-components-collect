import dayjs from 'dayjs';

/**
 * 日期格式化
 * @param timeStamp
 * @param formatStr
 * @returns
 */
export const formatDate = (timeStamp: number | Date, formatStr: string) => {
  return dayjs(timeStamp).format(formatStr);
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

// 全屏
const requestFullScreen = (element: any) => {
  const requestMethod =
    element.requestFullscreen ||
    element.webkitRequestFullscreen ||
    element.mozRequestFullscreen ||
    element.msRequestFullscreen;
  if (requestMethod) {
    requestMethod.call(element);
  } else if (typeof (window as any).ActiveXObject !== 'undefined') {
    const wscript = new (window as any).ActiveXObject('WScript.Shell');
    if (wscript !== null) {
      wscript.SendKeys('{F11}');
    }
  }
};

/**
 * 退出全屏
 */
const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if ((document as any).msExitFullscreen) {
    (document as any).msExitFullscreen();
  } else if ((document as any).mozCancelFullScreen) {
    (document as any).mozCancelFullScreen();
  } else if ((document as any).webkitExitFullscreen) {
    (document as any).webkitExitFullscreen();
  }
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
 * 生成颜色
 * @param index
 * @returns
 */
export const mapColor = (index: number) => {
  const colors = ['#19caad', '#8cc7b5', '#d1ba74', '#bee7e9', '#e6ceac', '#ecad9e'];
  return colors[index % colors.length];
};

/**
 * 处理字体大小
 * @param value
 * @returns
 */
export const formatFontSize = (value: number): number => {
  const clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  if (!clientWidth) return value;
  const fontSize = clientWidth / 1920;
  return value * fontSize;
};
