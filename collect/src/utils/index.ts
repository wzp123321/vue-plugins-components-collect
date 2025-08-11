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

/**
 * 复制dom节点
 * @param element
 * @returns
 */
export const copyElementWithAllStyles = (element: HTMLElement) => {
  const clone = element.cloneNode(true);
  const usedClasses = new Set();

  const processNode = (node: any) => {
    if (node.nodeType !== 1) return;

    // 优先用 classList，兼容 SVG/HTMLElement
    if (node.classList && node.classList.length > 0) {
      node.classList.forEach((cls: any) => usedClasses.add(cls));
    } else if (typeof node.className === 'string' && node.className.trim()) {
      node.className.split(/\s+/).forEach((cls: any) => usedClasses.add(cls));
    }

    const computedStyle = window.getComputedStyle(node);
    for (let i = 0; i < computedStyle.length; i++) {
      const property = computedStyle[i];
      node.style.setProperty(
        property,
        computedStyle.getPropertyValue(property),
        computedStyle.getPropertyPriority(property),
      );
    }
    Array.from(node.children).forEach(processNode);
  };
  processNode(clone);

  const escapeClassForSelector = (cls: any) => {
    if (window.CSS && window.CSS.escape) {
      return '.' + window.CSS.escape(cls);
    }
    return '.' + cls.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
  };

  const styleSheet = document.createElement('style');
  let cssText = '';

  Array.from(document.styleSheets).forEach((sheet) => {
    let rules;
    try {
      rules = sheet.rules || sheet.cssRules;
    } catch (e) {
      return;
    }
    if (!rules) return;
    Array.from(rules).forEach((rule: any) => {
      if (rule.type === CSSRule.STYLE_RULE) {
        const selector = rule.selectorText;
        for (const cls of usedClasses) {
          const escaped = escapeClassForSelector(cls);
          if (selector && selector.includes(escaped)) {
            cssText += rule.cssText + '\n';
            break;
          }
        }
      }
    });
  });

  if (cssText) {
    styleSheet.textContent = cssText;
    if (clone.firstChild) {
      clone.insertBefore(styleSheet, clone.firstChild);
    } else {
      clone.appendChild(styleSheet);
    }
  }
  return clone;
};
