/*
 * @Description: 倒计时动画实现
 * @Author: zpwan
 * @Date: 2022-07-18 08:48:04
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-07-18 08:53:41
 */
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CountDown',
  setup() {
    const total = 5;

    return {
      total,
    };
  },
});
