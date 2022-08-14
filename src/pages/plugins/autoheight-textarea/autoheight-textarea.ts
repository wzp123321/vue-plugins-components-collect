/*
 * @Descrption: 文本框自动高度
 * @Author: wanzp
 * @Date: 2022-08-13 22:10:01
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2022-08-14 21:16:00
 */
import { defineComponent, ref } from 'vue';

const MAX_LENGTH = 200;

export default defineComponent({
  name: 'AutoHeightTextArea',
  setup() {
    const text = ref<string>('');

    const handleInput = (e: InputEvent) => {
      const inputEle = e.target as HTMLInputElement;

      inputEle.style.height = `${inputEle.scrollHeight + 2}px`;

      if (e.isComposing) {
        return;
      }

      // 过滤特殊字符
      const characters: string = '';
      const defaultStr = String.raw`\`\\;\'\"&lt;&gt;`;
      const reg = new RegExp(String.raw`[${defaultStr}${characters}]`, 'g');
      inputEle.value = inputEle.value.replace(reg, '');

      // 过滤空格
      inputEle.value = inputEle.value.replace(/\s+/g, '');
    };

    return {
      text,
      MAX_LENGTH,

      handleInput,
    };
  },
});
