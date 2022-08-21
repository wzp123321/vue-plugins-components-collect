/*
 * @Descrption: 数字过滤
 * @Author: wanzp
 * @Date: 2022-08-20 20:44:00
 * @Last Modified by:   mikey.zhaopeng
 * @Last Modified time: 2022-08-20 20:44:00
 */
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'IfNumberInputFilter',
  setup() {
    const value = ref<string>('');
    const handleInput = (e: InputEvent) => {
      console.log(e);
    };

    return {
      value,
      handleInput,
    };
  },
});
