import { App, DirectiveBinding } from 'vue';
import { EDirectiveType } from './directive-filter.api';
import { addEventListener, handleTextFilter, handleNumberFilter } from './directive-filter.utils';

const timeMap = new WeakMap<HTMLElement, number>();

const addEventByType = (el: HTMLInputElement, binding: DirectiveBinding<any>) => {
  const target: HTMLInputElement =
    el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
      ? el
      : (el.querySelector('input') as HTMLInputElement) || (el.querySelector('textarea') as HTMLTextAreaElement);

  addEventListener(target, 'input', (e) => {
    const lastTime = timeMap.get(el) ?? 0;
    const now = new Date().getTime();
    if (now - lastTime < 1) {
      return;
    }
    timeMap.set(el, now);
    if ((e.target as any).composing) return;
    target.value = filter(el, binding);
    target.dispatchEvent(new Event('input'));
  });
};
/**
 * 过滤
 */
const filter = (el: HTMLInputElement, binding: DirectiveBinding<any>): string => {
  const type = binding.arg;
  let domValue: string = el.value;
  switch (type) {
    case EDirectiveType.文本:
      domValue = handleTextFilter(domValue, binding);
      break;
    case EDirectiveType.数字:
      domValue = handleNumberFilter(domValue, binding);
      break;
  }
  return domValue;
};

const registerInputFilter = (app: App) => {
  app.directive('inputFilter', {
    created(el, binding) {
      addEventByType(el, binding);
    },
    beforeMount(_el, _binding) {},
    mounted(el, binding) {
      el.value = filter(el, binding);
    },
    beforeUpdate(el, binding) {
      addEventByType(el, binding);
    },
    deep: false,
  });
};

export default registerInputFilter;
