/*
 * @Author: wanzp
 * @Date: 2023-04-18 20:48:05
 * @LastEditors: wanzp
 * @LastEditTime: 2023-04-18 22:18:42
 * @Description:
 */
import { App, DirectiveBinding } from 'vue';
import { EDirectiveType, IDirectiveTextBindingVO, IDirectiveNumberBindingVO } from './directive-filter.api';

function handleTextFilter(el: HTMLElement, binding: DirectiveBinding<IDirectiveTextBindingVO>) {
  const target: HTMLInputElement | HTMLTextAreaElement =
    el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
      ? (el as HTMLInputElement)
      : (el.querySelector('input') as HTMLInputElement) || (el.querySelector('textarea') as HTMLTextAreaElement);
  if (!target) {
    console.warn('指令绑定元素不包含输入框');
    return;
  }

  const handleInput = (ev: Event) => {
    // 是否在剪切板
    if ((ev as InputEvent).isComposing) {
      return;
    }
    const characters: string = '';
    const defaultStr = String.raw`\`\\;\'\"<>`;
    const reg = new RegExp(String.raw`[${defaultStr}${characters}]`, 'g');
    target.value = target.value.replace(binding.value.regExp instanceof RegExp ? binding.value.regExp : reg, '');
    // 过滤空格
    if (!binding.value.allowSpace) {
      target.value = target.value.replace(/\s+/g, '');
    }

    // target.dispatchEvent(new Event('input'));
  };
  target.oninput = handleInput;
  target.onblur = handleInput;
  // 解决输入中文的问题
  target.addEventListener('compositionend', (ev: Event) => {
    handleInput(ev);
  });
}

function handleNumberFilter(el: HTMLElement, binding: DirectiveBinding<IDirectiveNumberBindingVO>) {}

const registerInputFilter = (app: App) => {
  app.directive('inputFilter', {
    created(el, binding) {
      console.log('created---el, binding----------------------', el, binding);
    },
    beforeMount(el, binding) {
      console.log('beforeMount---el, binding----------------------', el, binding);
    },
    mounted(el, binding) {
      //   const type = binding.arg;
      //   // 普通搜索框
      //   switch (type) {
      //     case EDirectiveType.文本:
      //       handleTextFilter(el, binding);
      //       break;
      //     case EDirectiveType.数字:
      //       handleNumberFilter(el, binding);
      //       break;
      //   }
    },
    beforeUpdate(el, binding) {
      const type = binding.arg;
      // 普通搜索框
      switch (type) {
        case EDirectiveType.文本:
          handleTextFilter(el, binding);
          break;
        case EDirectiveType.数字:
          handleNumberFilter(el, binding);
          break;
      }
      console.log('beforeUpdate---el, binding----------------------', el, binding);
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
