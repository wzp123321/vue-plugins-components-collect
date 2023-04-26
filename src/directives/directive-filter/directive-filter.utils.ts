import { ThrottleSettings } from './directive-filter.api';
var nativeMax = Math.max,
  nativeMin = Math.min;

export function onCompositionEnd(e: Event) {
  const target = e.target as any;
  if (target.composing) {
    target.composing = false;
    target.dispatchEvent(new Event('input'));
  }
}

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
