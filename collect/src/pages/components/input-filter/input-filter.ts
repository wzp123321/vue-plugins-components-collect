/*
 * @Descrption: 输入框过滤
 * @Author: wanzp
 * @Date: 2022-08-20 20:44:00
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2022-08-21 21:59:31
 */
import { defineComponent } from 'vue';

import TextInputFilter from './if-text-filter/if-text-filter.vue';
import NumberInputFilter from './if-number-filter/if-number-filter.vue';

export default defineComponent({
  name: 'InputFilter',
  components: {
    'if-text-input-filter': TextInputFilter,
    'if-number-input-filter': NumberInputFilter,
  },
  setup() {},
});
