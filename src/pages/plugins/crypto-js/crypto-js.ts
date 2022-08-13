/*
 * @Descrption: crypto-js加密解密
 * @Author: wanzp
 * @Date: 2022-08-10 22:16:00
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2022-08-13 21:36:32
 */
import { ref, defineComponent } from 'vue';

import { Radio, RadioGroup, Button, message } from 'ant-design-vue';

import Crypto from 'crypto-js';
import CryptoAES from './utils/aes';
import CryptoBase64 from './utils/base64';

enum ENCRYPT_METHOD {
  MD5 = 'MD5',
  BASE64 = 'base64',
  AES = 'aes',
}

enum TYPE {
  加密 = '加密',
  解密 = '解密',
}

const UN_DECRYPTO = [ENCRYPT_METHOD.MD5];

export default defineComponent({
  name: 'PluginsCryptoJS',
  components: {
    'a-radio-group': RadioGroup,
    'a-radio': Radio,
    'a-button': Button,
  },
  setup() {
    const methods = [ENCRYPT_METHOD.MD5, ENCRYPT_METHOD.BASE64, ENCRYPT_METHOD.AES];
    const types = [TYPE.加密, TYPE.解密];

    const text = ref<string>('');
    const cryptoText = ref<string>('');

    const checkedMethod = ref<string>(methods[0]);
    const cryptoType = ref<string>(types[0]);

    // 加密
    const onEncrypto = () => {
      if (!checkedMethod.value) {
        message.error('请选择加密方式');
        return;
      }
      try {
        switch (checkedMethod.value) {
          case ENCRYPT_METHOD.AES:
            cryptoText.value =
              cryptoType.value === TYPE.加密 ? CryptoAES.encrypt(text.value) : CryptoAES.decrypt(text.value);
            break;
          case ENCRYPT_METHOD.BASE64:
            cryptoText.value =
              cryptoType.value === TYPE.加密 ? CryptoBase64.encrypt(text.value) : CryptoBase64.decrypt(text.value);
            break;
          case ENCRYPT_METHOD.MD5:
            cryptoText.value = Crypto.MD5(text.value).toString();
            break;
        }
      } catch (e: any) {
        message.error(e.message);
      }
    };

    // 重置
    const reset = () => {
      text.value = '';
      cryptoText.value = '';
      checkedMethod.value = methods[0];
      cryptoType.value = types[0];
    };

    return {
      text,
      cryptoText,
      methods,
      types,
      cryptoType,
      checkedMethod,
      UN_DECRYPTO,
      TYPE,

      reset,
      onEncrypto,
    };
  },
});
