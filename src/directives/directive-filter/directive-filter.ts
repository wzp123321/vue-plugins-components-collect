/*
 * @Author: wanzp
 * @Date: 2023-04-18 20:48:05
 * @LastEditors: wanzp
 * @LastEditTime: 2023-05-25 22:41:46
 * @Description:
 */
import { App, DirectiveBinding, VNode } from 'vue';
import { EDirectiveType } from './directive-filter.api';
import {
  getModelAssigner,
  addEventListener,
  removeEventListener,
  handleTextFilter,
  handleNumberFilter,
} from './directive-filter.utils';

function addEventByType(el: HTMLInputElement, binding: DirectiveBinding<any>, vnode: VNode) {
  // 通过 getModelAssigner 方法获取 props 中的 onUpdate:modelValue 属性对应的函数，赋值给 el._assign 属性；_assign可任意命名
  (el as any)._assign = getModelAssigner(vnode);
  const type = binding.arg;

  const onInput = (e: Event) => {
    if ((e.target as any).composing) return;
    let domValue: string = el.value;
    switch (type) {
      case EDirectiveType.文本:
        domValue = handleTextFilter(domValue, binding);
        break;
      case EDirectiveType.数字:
        domValue = handleNumberFilter(domValue, binding);
        break;
    }
    // 调用 el._assign 方法更新数据
    (el as any)._assign(domValue);
  };
  removeEventListener(el, 'input', onInput);
  addEventListener(el, 'input', onInput);
}

// https://www.bilibili.com/video/BV1td4y1r76e/?spm_id_from=333.337.search-card.all.click&vd_source=0f5e2a21dd6833ba3d8d41c10053181d
const registerInputFilter = (app: App) => {
  app.directive('inputFilter', {
    created(el, binding, vnode) {
      addEventByType(el, binding, vnode);
    },
    beforeMount(el, binding) {
      console.log('beforeMount----------------------------------------');
    },
    mounted(el, binding) {
      console.log('mounted----------------------------------------');
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
      el.value = domValue;
    },
    beforeUpdate(el, binding, vnode) {
      // 通过 getModelAssigner 方法获取 props 中的 onUpdate:modelValue 属性对应的函数，赋值给 el._assign 属性；_assign可任意命名
      el._assign = getModelAssigner(vnode);
      const type = binding.arg;
      addEventListener(el, 'input', (e) => {
        if ((e.target as any).composing) return;
        let domValue: string = el.value;
        switch (type) {
          case EDirectiveType.文本:
            domValue = handleTextFilter(domValue, binding);
            break;
          case EDirectiveType.数字:
            domValue = handleNumberFilter(domValue, binding);
            break;
        }
        // 调用 el._assign 方法更新数据
        el._assign(domValue);
      });
    },
    updated(el, binding) {
      console.log('updated---el, binding----------------------', el, binding);
    },
    beforeUnmount(el, binding) {
      console.log('beforeUnmount---el, binding----------------------', el, binding);
    },
    unmounted(el, binding) {
      console.log('unmounted---el, binding----------------------', el, binding);
    },
    deep: false,
  });
};

export default registerInputFilter;
