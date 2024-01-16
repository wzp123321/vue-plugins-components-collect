/*
 * @Description: 输入框过滤指令处理
 * @Autor: zpwan
 * @Date: 2022-03-22 09:56:47
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-02 18:04:15
 */
import { App } from 'vue';
const getModelAssigner = (vnode: any) => {
  const fn = vnode.props['onUpdate:modelValue'];
  return Array.isArray(fn) ? (value: any) => invokeArrayFns(fn, value) : fn;
};
export const invokeArrayFns = (fns: Function[], arg?: any) => {
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

export function addEventListener(
  el: Element,
  event: string,
  handler: EventListener,
  options?: EventListenerOptions,
) {
  el.addEventListener(event, handler, options);
}
/**
 * 指令注册
 * @param app
 */
const registerInputFilter = (app: App) => {
  app.directive('textInputFilter', {
    created(el, { modifiers }, vnode) {
      const ele: any =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : el.querySelector('input') || el.querySelector('textarea');
      ele._assign = getModelAssigner(vnode);
      addEventListener(ele, 'input', (e) => {
        if ((e.target as any).composing) return;
        const characters: string = '';
        const defaultStr = String.raw`\`\-\\;\'\"<>`;
        const reg = new RegExp(String.raw`[${defaultStr}${characters}]`, 'g');
        ele.value = ele.value.replace(reg, '');
        let domValue: string | number = ele.value;
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
};

export default registerInputFilter;
