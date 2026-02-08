<template>
  <div class="plugins-crypto">
    <h1>加密解密</h1>
    <div class="ps-container">
      <div class="crypto-js">
        <h5>加密&解密</h5>
        <div class="flex-row-start-center">
          <textarea v-model="textCry" cols="50" rows="10" placeholder="请输入"></textarea>
          <div class="flex-column-start-center">
            <el-radio-group v-model="checkedMethod">
              <el-radio v-for="(item, index) in methods" :key="'method' + index" :value="item">{{ item }}</el-radio>
            </el-radio-group>
          </div>
          <div class="flex-column-start-center">
            <el-radio-group v-model="cryptoType">
              <el-radio
                v-for="(item, index) in types"
                :key="'type' + index"
                :value="item"
                :disabled="UN_DECRYPTO.includes(checkedMethod as any) && item === TYPE.解密"
              >
                {{ item }}
              </el-radio>
            </el-radio-group>
          </div>
          <div class="flex-column-start-center">
            <el-button type="primary" @click="onEncrypto">确认</el-button>
            <el-button style="margin-top: 12px" @click="reset">重置</el-button>
          </div>
          <textarea v-model="cryptoText" cols="50" rows="10"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ElMessage } from 'element-plus';
import Crypto from 'crypto-js';
import CryptoAES from './utils/aes';
import CryptoBase64 from './utils/base64';
import { ref } from 'vue';

defineOptions({
  name: 'PluginsCrypto',
});

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

const methods = [ENCRYPT_METHOD.MD5, ENCRYPT_METHOD.BASE64, ENCRYPT_METHOD.AES];
const types = [TYPE.加密, TYPE.解密];

const textCry = ref<string>('');
const cryptoText = ref<string>('');

const checkedMethod = ref<string>(methods[0]);
const cryptoType = ref<string>(types[0]);

// 加密
const onEncrypto = () => {
  if (!checkedMethod.value) {
    ElMessage.error('请选择加密方式');
    return;
  }
  try {
    switch (checkedMethod.value) {
      case ENCRYPT_METHOD.AES:
        cryptoText.value =
          cryptoType.value === TYPE.加密 ? CryptoAES.encrypt(textCry.value) : CryptoAES.decrypt(textCry.value);
        break;
      case ENCRYPT_METHOD.BASE64:
        cryptoText.value =
          cryptoType.value === TYPE.加密 ? CryptoBase64.encrypt(textCry.value) : CryptoBase64.decrypt(textCry.value);
        break;
      case ENCRYPT_METHOD.MD5:
        cryptoText.value = Crypto.MD5(textCry.value).toString();
        break;
    }
  } catch (e) {
    ElMessage.error((e as any).message);
  }
};

// 重置
const reset = () => {
  textCry.value = '';
  cryptoText.value = '';
  checkedMethod.value = methods[0];
  cryptoType.value = types[0];
};
</script>
<style lang="less" scoped>
.crypto-js {
  width: 100%;
  height: 100%;
  padding: 16px;

  h5 {
    font-size: 24px;
  }

  h6 {
    font-size: 20px;
  }

  .flex-row-start-center {
    display: flex;
    align-items: center;
    gap: 36px;
  }

  .flex-column-start-center {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  textarea {
    border: 1px solid rgba(0, 0, 0, 0.15);
    padding: 5px 12px;
    resize: none;

    &:focus {
      outline: none;
    }
  }

  .ant-radio-group {
    cursor: pointer;

    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  button {
    height: 36px;
    line-height: 36px;
    padding: 0 12px;
  }
}
</style>
