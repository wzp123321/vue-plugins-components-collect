/**
 * @description 示例：v-throttle="{ time: 1000, handle:() => {} }"
 * 节流指令
 */
import { DirectiveBinding } from 'vue';
import { throttle } from 'lodash-es';

interface ExHTMLElement extends HTMLElement {
  timer: number | null;
}
export default {
  mounted(el: ExHTMLElement, binding: DirectiveBinding) {
    const time = binding.value?.time ?? 1000;
    const fn = binding.value?.handle ?? null;
    el.addEventListener(
      'click',
      throttle((e: Event) => {
        if (fn) {
          fn(e);
        } else {
          throw new Error('Handle is undefined!');
        }
      }, time),
    );
  },
};
