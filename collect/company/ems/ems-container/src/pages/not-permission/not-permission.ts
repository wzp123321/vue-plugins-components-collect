/*
 * @Description: 403
 * @Autor: kongxiang
 * @Date: 2022-06-16 13:07:05
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-06 11:10:19
 */
import { defineComponent, onMounted } from 'vue';

import { clearCookies } from '@/utils';

export default defineComponent({
  setup() {
    onMounted(() => {
      clearCookies();
    });
  },
});
