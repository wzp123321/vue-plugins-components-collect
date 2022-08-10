/*
 * @Descrption: crypto-js加密解密
 * @Author: wanzp
 * @Date: 2022-08-10 22:16:00
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2022-08-10 22:35:14
 */
import { ref, defineComponent } from 'vue';

import { Radio, RadioGroup } from 'ant-design-vue';

export default defineComponent({
  name: 'PluginsCryptoJS',
  components: {
    'a-radio-group': RadioGroup,
    'a-radio': Radio,
  },
  setup() {
    const methods = ['MD5'];

    const text = ref<string>('');
    const checkedMethod = ref<string>('');

    return {
      text,
      methods,
      checkedMethod,
    };
  },
});
