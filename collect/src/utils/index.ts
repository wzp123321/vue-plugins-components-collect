import { ICommonRes } from '@/services/common.api';

export * from './date';
export * from './number';
export * from './storage';
export * from './gcm';

// 全屏
export const requestFullScreen = (element: any) => {
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
export const exitFullscreen = () => {
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

/**
 * 响应处理
 * @param res 响应体
 * @returns 返回数据
 * @throws 异常信息
 */
export function FResHandler<T = void>(res: ICommonRes<T>): T {
  if (res?.success) {
    return res.data;
  }
  throw res?.message ?? '未知原因';
}
