/* eslint-disable */
/*
 * @Description: 输入框过滤指令处理
 * @Autor: zpwan
 * @Date: 2022-03-22 09:56:47
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-25 14:29:42
 */
import { App } from 'vue';

let time = 0;

const getModelAssigner = (vnode: any) => {
  const fn = vnode.props['onUpdate:modelValue'];
  return Array.isArray(fn) ? (value: any) => invokeArrayFns(fn, value) : fn;
};
export const invokeArrayFns = (fns: any[], arg?: any) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg);
  }
};

function onCompositionStart(e: any) {
  e.target.composing = true;
}
function onCompositionEnd(e: any) {
  const target = e.target;
  if (target.composing) {
    target.composing = false;
    trigger(target, 'input');
  }
}
function trigger(el: HTMLElement, type: string) {
  const e = document.createEvent('HTMLEvents');
  e.initEvent(type, true, true);
  el.dispatchEvent(e);
}

// 过滤连续.等特殊字符
const deduplicate = (target: string, symbol: string): string => {
  if (target.includes(symbol)) {
    const temp = target.split(symbol);
    let str = `${temp.shift() ?? ''}${symbol}`;
    temp.filter((v) => v).forEach((v) => (str += v));
    return str;
  }
  return target;
};

export function addEventListener(el: Element, event: string, handler: EventListener, options?: EventListenerOptions) {
  el.addEventListener(event, handler, options);
}
/**
 * 指令注册
 * @param app
 */
const vInputFilterV2 = (app: App) => {
  app.directive('textInputFilter', {
    created(el, { modifiers: { allowSpace } }, vnode) {
      const as = Object.prototype.toString.call(allowSpace) === '[object Boolean]' ? allowSpace : true;
      const ele: any =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      ele._assign = getModelAssigner(vnode);
      addEventListener(ele, 'input', (e) => {
        if ((e.target as any).composing) return;
        const characters: string = '';
        const defaultStr = String.raw`\`\\;\'\"<>`;
        const reg = new RegExp(String.raw`[${defaultStr}${characters}]`, 'g');
        if (as) {
          ele.value = ele.value.replace(reg, '');
        }
        const domValue: string | number = ele.value;
        ele._assign(domValue);
      });
      addEventListener(ele, 'compositionstart', onCompositionStart);
      addEventListener(ele, 'compositionend', onCompositionEnd);
    },
    // set value on mounted so it's after min/max for type="range"
    mounted(el, { value }) {
      const ele: any =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      ele.value = value == null ? '' : value;
    },
    beforeUpdate(el, { value, modifiers: { lazy, trim, number } }, vnode) {
      const ele: any =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      ele._assign = getModelAssigner(vnode);
      // avoid clearing unresolved text. #2302
      if ((ele as any).composing) return;
      if (document.activeElement === ele) {
        if (lazy) {
          return;
        }
        if (trim && ele.value.trim() === value) {
          return;
        }
      }
      const newValue = value == null ? '' : value;
      if (ele.value !== newValue) {
        ele.value = newValue;
      }
    },
  });
  /**
   * 小数
   */
  app.directive('numberFilter', {
    created(el, binding, vnode) {
      const integral = binding?.value?.integral ? binding?.value?.integral : 10;
      const decimal = binding?.value?.decimal ? binding?.value?.decimal : 4;
      const ele: any =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      ele._assign = getModelAssigner(vnode);
      const handleInput = (e: any) => {
        if (new Date().getTime() - time < 1) {
          return;
        }
        // 是否在剪切板
        if (e.isComposing) {
          return;
        }
        time = new Date().getTime();
        ele.value = ele.value.replace(/[^0-9\.]/g, '');
        // 处理首位小数点
        if (ele.value.substring(0, 1) === '.') {
          ele.value = `0${ele.value}`;
        }
        // 禁止头部连续输入0
        if (ele.value.length > 1 && ele.value.substring(0, 1) === '0' && ele.value.substring(1, 2) !== '.') {
          ele.value = ele.value.substring(1);
        }
        if (ele.value.indexOf('.') !== ele.value.lastIndexOf('.')) {
          ele.value = deduplicate(ele.value, '.');
        }

        if (ele.value.indexOf('.') !== -1) {
          const valueArr = ele.value.split('.');
          ele.value = `${valueArr[0].substring(0, integral)}.${valueArr[1].substring(0, decimal) || ''}`;
        } else {
          ele.value = ele.value.substring(0, integral);
        }
        ele.value = ele.value.trim();

        // 限制小数点后几位
        ele.value = ele.value.replace(`/^(\-)*(\d+)\.(\d{0,${decimal}}).*$/`, '$1$2.$3');
        console.log(ele.value);
        // const domValue: string | number = ele.value;
        // ele._assign(domValue);

        ele.dispatchEvent(new Event('input'));
      };
      console.log(ele, integral, decimal, vnode, binding);
      addEventListener(ele, 'input', (e) => {
        handleInput(e);
      });
      addEventListener(ele, 'compositionstart', onCompositionStart);
      addEventListener(ele, 'compositionend', (e) => {
        handleInput(e);
      });
    },
    // set value on mounted so it's after min/max for type="range"
    mounted(el, { value }) {
      const ele: any =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      ele.value = value == null ? '' : value;
    },
    beforeUpdate(el, { value, modifiers: { lazy, trim, number } }, vnode) {
      const ele: any =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      ele._assign = getModelAssigner(vnode);
      // avoid clearing unresolved text. #2302
      if ((ele as any).composing) return;
      if (document.activeElement === ele) {
        if (lazy) {
          return;
        }
        if (trim && ele.value.trim() === value) {
          return;
        }
      }
      const newValue = value == null ? '' : value;
      if (ele.value !== newValue) {
        ele.value = newValue;
      }
    },
  });
  /**
   * 正整数
   */
  app.directive('positiveNumberFilter', {
    created(el, binding, vnode) {
      const integral = binding?.value?.integral ?? 10;
      const ele: any =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      ele._assign = getModelAssigner(vnode);
      const handleInput = (e: any) => {
        if (new Date().getTime() - time < 1) {
          return;
        }
        // 是否在剪切板
        if (e.isComposing) {
          return;
        }
        time = new Date().getTime();
        ele.value = ele.value.replace(/\D+/g, '');
        if (ele.value.length > 1 && ele.value.substring(0, 1) === '0') {
          ele.value = ele.value.substring(1);
        }
        if (ele.value.substring(0, 1) === '0') {
          ele.value = ele.value.replace(/[^1-9]/g, '');
        }
        ele.value = ele.value.substring(0, integral);
        ele.dispatchEvent(new Event('input'));
      };
      addEventListener(ele, 'input', (e) => {
        handleInput(e);
      });
      addEventListener(ele, 'compositionstart', onCompositionStart);
      addEventListener(ele, 'compositionend', (e) => {
        handleInput(e);
      });
    },
    // set value on mounted so it's after min/max for type="range"
    mounted(el, { value }) {
      const ele: any =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      ele.value = value == null ? '' : value;
    },
    beforeUpdate(el, { value, modifiers: { lazy, trim, number } }, vnode) {
      const ele: any =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      ele._assign = getModelAssigner(vnode);
      // avoid clearing unresolved text. #2302
      if ((ele as any).composing) return;
      if (document.activeElement === ele) {
        if (lazy) {
          return;
        }
        if (trim && ele.value.trim() === value) {
          return;
        }
      }
      const newValue = value == null ? '' : value;
      if (ele.value !== newValue) {
        ele.value = newValue;
      }
    },
  });
  /**
   * 自然数，可以0开头
   */
  app.directive('naturalNumberFilter', {
    created(el, binding, vnode) {
      const integral = binding?.value?.integral ?? 32;
      const ele: any =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      ele._assign = getModelAssigner(vnode);
      const handleInput = (e: any) => {
        if (new Date().getTime() - time < 1) {
          return;
        }
        // 是否在剪切板
        if (e.isComposing) {
          return;
        }
        time = new Date().getTime();
        ele.value = ele.value.replace(/\D+/g, '');
        ele.value = ele.value.substring(0, integral);
        ele.dispatchEvent(new Event('input'));
      };
      addEventListener(ele, 'input', (e) => {
        handleInput(e);
      });
      addEventListener(ele, 'compositionstart', onCompositionStart);
      addEventListener(ele, 'compositionend', (e) => {
        handleInput(e);
      });
    },
    // set value on mounted so it's after min/max for type="range"
    mounted(el, { value }) {
      const ele: any =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      ele.value = value == null ? '' : value;
    },
    beforeUpdate(el, { value, modifiers: { lazy, trim, number } }, vnode) {
      const ele: any =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      ele._assign = getModelAssigner(vnode);
      // avoid clearing unresolved text. #2302
      if ((ele as any).composing) return;
      if (document.activeElement === ele) {
        if (lazy) {
          return;
        }
        if (trim && ele.value.trim() === value) {
          return;
        }
      }
      const newValue = value == null ? '' : value;
      if (ele.value !== newValue) {
        ele.value = newValue;
      }
    },
  });
  /**
   * 正负小数 (保留四位小数)
   */
  app.directive('positiveAndNegativeNumberForeDecimalFilter', {
    created(el, binding, vnode) {
      let integral = binding?.value?.integral ? binding?.value?.integral : 10;
      const decimal = binding?.value?.decimal ? binding?.value?.decimal : 4;
      const ele: any =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      ele._assign = getModelAssigner(vnode);
      const handleInput = (e: any) => {
        if (new Date().getTime() - time < 1) {
          return;
        }
        // 是否在剪切板
        if (e.isComposing) {
          return;
        }
        time = new Date().getTime();
        ele.value = ele.value.replace(/[^-0-9\.]/g, '');
        // 为负数 整数可输入11位
        if (ele.value.substring(0, 1) === '-') {
          integral = 11;
        }
        // 为负数 连续输入负号
        if (ele.value.substring(0, 1) === '-' && ele.value.substring(1, 2) === '-') {
          ele.value = ele.value.substring(1);
        }
        // 为负数 禁止负号后面连续输入0
        if (
          ele.value.length > 1 &&
          ele.value.substring(0, 1) === '-' &&
          ele.value.substring(1, 2) === '0' &&
          ele.value.substring(2, 3) !== '.'
        ) {
          ele.value = ele.value.substring(0, 2);
        }
        // 为负数 处理负号后面小数点
        if (ele.value.length > 1 && ele.value.substring(0, 1) === '-' && ele.value.substring(1, 2) === '.') {
          ele.value = ele.value.substring(0, 1);
          // ele.value = `-0${ele.value}`;
        }
        // 正数 处理首位小数点
        if (ele.value.substring(0, 1) === '.') {
          ele.value = `0${ele.value}`;
        }
        // 正数 禁止头部连续输入0
        if (ele.value.length > 1 && ele.value.substring(0, 1) === '0' && ele.value.substring(1, 2) !== '.') {
          ele.value = ele.value.substring(1);
        }
        if (ele.value.indexOf('.') !== ele.value.lastIndexOf('.')) {
          ele.value = deduplicate(ele.value, '.');
        }

        if (ele.value.indexOf('.') !== -1) {
          const valueArr = ele.value.split('.');
          ele.value = `${valueArr[0].substring(0, integral)}.${valueArr[1].substring(0, decimal) || ''}`;
        } else {
          ele.value = ele.value.substring(0, integral);
        }
        ele.value = ele.value.trim();

        // 限制小数点后几位
        ele.value = ele.value.replace(`/^(\-)*(\d+)\.(\d{0,${decimal}}).*$/`, '$1$2.$3');
        // console.log(ele.value);
        // const domValue: string | number = ele.value;
        // ele._assign(domValue);

        ele.dispatchEvent(new Event('input'));
      };
      // console.log(ele, integral, decimal, vnode, binding);
      addEventListener(ele, 'input', (e) => {
        handleInput(e);
      });
      // ele.oninput = handleInput;

      addEventListener(ele, 'compositionstart', onCompositionStart);
      addEventListener(ele, 'compositionend', (e) => {
        handleInput(e);
      });
    },
    // set value on mounted so it's after min/max for type="range"
    mounted(el, { value }) {
      const ele: any =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      ele.value = value == null ? '' : value;
    },
    beforeUpdate(el, { value, modifiers: { lazy, trim, number } }, vnode) {
      const ele: any =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      ele._assign = getModelAssigner(vnode);
      // avoid clearing unresolved text. #2302
      if ((ele as any).composing) return;
      if (document.activeElement === ele) {
        if (lazy) {
          return;
        }
        if (trim && ele.value.trim() === value) {
          return;
        }
      }
      const newValue = value == null ? '' : value;
      if (ele.value !== newValue) {
        ele.value = newValue;
      }
    },
  });
  /**
   * 正负小数 (保留两位小数)
   */
  app.directive('positiveAndNegativeNumberTwoDecimalFilter', {
    created(el, binding, vnode) {
      let integral = binding?.value?.integral ? binding?.value?.integral : 10;
      const decimal = binding?.value?.decimal ? binding?.value?.decimal : 2;
      const ele: any =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      ele._assign = getModelAssigner(vnode);
      const handleInput = (e: any) => {
        if (new Date().getTime() - time < 1) {
          return;
        }
        // 是否在剪切板
        if (e.isComposing) {
          return;
        }
        time = new Date().getTime();
        ele.value = ele.value.replace(/[^-0-9\.]/g, '');
        // 为负数 整数可输入11位
        if (ele.value.substring(0, 1) === '-') {
          integral = 11;
        }
        // 为负数 连续输入负号
        if (ele.value.substring(0, 1) === '-' && ele.value.substring(1, 2) === '-') {
          ele.value = ele.value.substring(1);
        }
        // 为负数 禁止负号后面连续输入0
        if (
          ele.value.length > 1 &&
          ele.value.substring(0, 1) === '-' &&
          ele.value.substring(1, 2) === '0' &&
          ele.value.substring(2, 3) !== '.'
        ) {
          ele.value = ele.value.substring(0, 2);
        }
        // 为负数 处理负号后面小数点
        if (ele.value.length > 1 && ele.value.substring(0, 1) === '-' && ele.value.substring(1, 2) === '.') {
          ele.value = ele.value.substring(0, 1);
          // ele.value = `-0${ele.value}`;
        }
        // 正数 处理首位小数点
        if (ele.value.substring(0, 1) === '.') {
          ele.value = `0${ele.value}`;
        }
        // 正数 禁止头部连续输入0
        if (ele.value.length > 1 && ele.value.substring(0, 1) === '0' && ele.value.substring(1, 2) !== '.') {
          ele.value = ele.value.substring(1);
        }
        if (ele.value.indexOf('.') !== ele.value.lastIndexOf('.')) {
          ele.value = deduplicate(ele.value, '.');
        }

        if (ele.value.indexOf('.') !== -1) {
          const valueArr = ele.value.split('.');
          ele.value = `${valueArr[0].substring(0, integral)}.${valueArr[1].substring(0, decimal) || ''}`;
        } else {
          ele.value = ele.value.substring(0, integral);
        }
        ele.value = ele.value.trim();

        // 限制小数点后几位
        ele.value = ele.value.replace(`/^(\-)*(\d+)\.(\d{0,${decimal}}).*$/`, '$1$2.$3');
        // console.log(ele.value);
        // const domValue: string | number = ele.value;
        // ele._assign(domValue);

        ele.dispatchEvent(new Event('input'));
      };
      // console.log(ele, integral, decimal, vnode, binding);
      addEventListener(ele, 'input', (e) => {
        handleInput(e);
      });
      // ele.oninput = handleInput;

      addEventListener(ele, 'compositionstart', onCompositionStart);
      addEventListener(ele, 'compositionend', (e) => {
        handleInput(e);
      });
    },
    // set value on mounted so it's after min/max for type="range"
    mounted(el, { value }) {
      const ele: any =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      ele.value = value == null ? '' : value;
    },
    beforeUpdate(el, { value, modifiers: { lazy, trim, number } }, vnode) {
      const ele: any =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      ele._assign = getModelAssigner(vnode);
      // avoid clearing unresolved text. #2302
      if ((ele as any).composing) return;
      if (document.activeElement === ele) {
        if (lazy) {
          return;
        }
        if (trim && ele.value.trim() === value) {
          return;
        }
      }
      const newValue = value == null ? '' : value;
      if (ele.value !== newValue) {
        ele.value = newValue;
      }
    },
  });
};

export default vInputFilterV2;
