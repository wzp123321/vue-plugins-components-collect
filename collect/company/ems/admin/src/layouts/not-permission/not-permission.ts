/*
 * @Description: 403
 * @Autor: kongxiang
 * @Date: 2022-06-16 13:07:05
 * @LastEditors: zpwan
 * @LastEditTime: 2022-06-16 14:07:05
 */
import { defineComponent, onMounted } from 'vue';

import { clearCookies } from '@/utils/token';

export default defineComponent({
  setup() {
    onMounted(() => {
      clearCookies();
    });
  },
});
