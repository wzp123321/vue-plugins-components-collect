/*
 * @Descrption: crypto-js加密解密
 * @Author: wanzp
 * @Date: 2022-08-10 22:16:00
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2022-08-10 22:42:15
 */
import { ref, defineComponent } from 'vue';

import { Radio, RadioGroup, Button } from 'ant-design-vue';

export default defineComponent({
  name: 'PluginsCryptoJS',
  components: {
    'a-radio-group': RadioGroup,
    'a-radio': Radio,
    'a-button': Button,
  },
  setup() {
    const methods = ['MD5', 'Base64'];

    const text = ref<string>('');
    const checkedMethod = ref<string>('');

    return {
      text,
      methods,
      checkedMethod,
    };
  },
});
