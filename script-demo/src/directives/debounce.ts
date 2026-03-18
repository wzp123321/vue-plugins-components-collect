/**
 * @description 示例：v-debounce="{ time: 1000, handle:() => {} }"
 * 防抖指令
 */
import { DirectiveBinding } from 'vue';
import { debounce } from 'lodash-es';

interface ExHTMLElement extends HTMLElement {
  timer: number | null;
}
export default {
  mounted(el: ExHTMLElement, binding: DirectiveBinding) {
    const time = binding.value?.time ?? 1000;
    const fn = binding.value?.handle ?? null;
    console.log(fn);
    el.addEventListener(
      'click',
      debounce((e: Event) => {
        if (fn) {
          fn(e);
        } else {
          throw new Error('Handle is undefined!');
        }
      }, time),
    );
  },
};
