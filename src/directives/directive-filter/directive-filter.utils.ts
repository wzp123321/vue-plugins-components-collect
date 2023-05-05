/*
 * @Author: wanzp
 * @Date: 2023-04-26 21:15:54
 * @LastEditors: wanzp
 * @LastEditTime: 2023-05-05 20:22:19
 * @Description:
 */
import { VNode } from 'vue';

type AssignerFn = (value: any) => void;

export function onCompositionEnd(e: Event) {
  const target = e.target as any;
  if (target.composing) {
    target.composing = false;
    target.dispatchEvent(new Event('input'));
  }
}

export const invokeArrayFns = (fns: Function[], arg?: any) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg);
  }
};

export const getModelAssigner = (vnode: VNode): AssignerFn => {
  const fn = vnode.props!['onUpdate:modelValue'] || (__COMPAT__ && vnode.props!['onModelCompat:input']);
  return Array.isArray(fn) ? (value) => invokeArrayFns(fn, value) : fn;
};

/**
 * "123-foo" will be parsed to 123
 * This is used for the .number modifier in v-model
 */
export const looseToNumber = (val: any): any => {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
};

export function addEventListener(el: Element, event: string, handler: EventListener, options?: EventListenerOptions) {
  el.addEventListener(event, handler, options);
}

export function removeEventListener(
  el: Element,
  event: string,
  handler: EventListener,
  options?: EventListenerOptions,
) {
  el.removeEventListener(event, handler, options);
}

function isObject(value: { [key: string]: any }) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

export const deduplicate = (target: string, symbol: string): string => {
  if (target.includes(symbol)) {
    const temp = target.split(symbol);
    let str = `${temp.shift() ?? ''}${symbol}`;
    temp.filter((v) => v).forEach((v) => (str += v));
    return str;
  }
  return target;
};
