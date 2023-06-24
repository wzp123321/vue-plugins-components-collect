/*
 * @Author: wanzp
 * @Date: 2022-08-21 20:42:49
 * @LastEditors: wanzp
 * @LastEditTime: 2023-06-24 13:12:26
 * @Description:
 */
import { App } from 'vue';
import { addEventListener, handleNumberFilter, handleTextFilter } from './directive-filter/directive-filter.utils';

let time = 0;

enum EDirectiveType {
  文本 = 'search',
  数字 = 'number',
}

/**
 * 改造这边
 * @param app
 */
const registerInputFilter = (app: App) => {
  app.directive('inputFilter', {
    mounted(el, binding) {
      const type = binding.arg;
      const target: HTMLInputElement =
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
          ? el
          : (el.querySelector('input') as HTMLInputElement) || (el.querySelector('textarea') as HTMLInputElement);

      addEventListener(target, 'input', (e) => {
        if (new Date().getTime() - time < 1) {
          return;
        }
        time = new Date().getTime();
        let domValue: string = target.value;
        if ((e.target as any).composing) return;
        switch (type) {
          case EDirectiveType.文本:
            domValue = handleTextFilter(domValue, binding);
            break;
          case EDirectiveType.数字:
            domValue = handleNumberFilter(domValue, binding);
            break;
        }
        // 调用 el._assign 方法更新数据
        target.value = domValue;
        target.dispatchEvent(new Event('input'));
      });
    },
  });
};

export default registerInputFilter;
