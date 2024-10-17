<template>
  <div class="plugins-simple">
    <h1>语音播报</h1>
    <div class="ps-container">
      <textarea rows="10" v-model="text1"></textarea>
      <button @click="videoBroadCast">播报</button>
      <button @click="speak">播放</button>
    </div>
    <h1>文本框自适应高度</h1>
    <div class="ps-container">
      <textarea rows="1" v-model="text" :maxlength="MAX_LENGTH" @input="handleInput"></textarea>
    </div>
    <h1>加密解密</h1>
    <div class="ps-container">
      <div class="crypto-js">
        <h5>加密&解密</h5>
        <div class="flex-row-start-center">
          <textarea v-model="textCry" cols="50" rows="10" placeholder="请输入"></textarea>
          <div class="flex-column-start-center">
            <a-radio-group v-model:value="checkedMethod">
              <a-radio v-for="(item, index) in methods" :key="'method' + index" :value="item">{{ item }}</a-radio>
            </a-radio-group>
          </div>
          <div class="flex-column-start-center">
            <a-radio-group v-model:value="cryptoType">
              <a-radio
                v-for="(item, index) in types"
                :key="'type' + index"
                :value="item"
                :disabled="UN_DECRYPTO.includes(checkedMethod as any) && item === TYPE.解密"
              >
                {{ item }}
              </a-radio>
            </a-radio-group>
          </div>
          <div class="flex-column-start-center">
            <a-button type="primary" @click="onEncrypto">确认</a-button>
            <a-button style="margin-top: 12px" @click="reset">重置</a-button>
          </div>
          <textarea v-model="cryptoText" cols="50" rows="10"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
const MAX_LENGTH = 200;
import { Button, message } from 'ant-design-vue';

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

const text1 = ref<string>(
  '仆去月谢病，还觅薜萝。梅溪之西，有石门山者，森壁争霞，孤峰限日；幽岫含云，深溪蓄翠；蝉吟鹤唳，水响猿啼，英英相杂，绵绵成韵。既素重幽居，遂葺宇其上。幸富菊花，偏饶竹实。山谷所资，于斯已办。仁智之乐，岂徒语哉！',
);
const audioContext = new AudioContext({ latencyHint: 'balanced' });
const videoBroadCast = async () => {
  const mp3 =
    'https://tts.baidu.com/text2audio?cuid=baike&lan=zh&ctp=1&pdt=301&vol=9&rate=32&per=0&tex=' +
    encodeURI(text1.value);
  const musicArrayBuffer = await getMp3ArrayBuffer(mp3);
  const decodedAudioData = await decode(musicArrayBuffer);
  play(decodedAudioData);
};
/**
 * @param {AudioBuffer} decodedAudioData
 * @returns
 */
const play = async (decodedAudioData: any) => {
  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = decodedAudioData;
  sourceNode.connect(audioContext.destination);
  sourceNode.start(0);
};

/**
 * @param {string} url
 * @returns {ArrayBuffer}
 */
const getMp3ArrayBuffer = async (url: string) => {
  return fetch(url).then((r) => r.arrayBuffer());
};

/**
 * @param {ArrayBuffer} arrayBuffer
 * @returns {AudioBuffer}
 */
const decode = async (arrayBuffer: any) => {
  return audioContext.decodeAudioData(arrayBuffer);
};

const speak = () => {
  const speechSynthesis = window.speechSynthesis;
  const speechUtterance = new SpeechSynthesisUtterance(text1.value);
  // speechUtterance.text = '支付宝到账1万元'; // 文字内容
  // speechUtterance.lang = 'zh-CN'; // 使用的语言:中文-zh-CN
  // speechUtterance.volume = 1; // 声音音量：1
  // speechUtterance.rate = 0.75; // 语速：1
  // speechUtterance.pitch = 1; // 音高：1
  speechSynthesis.speak(speechUtterance); // 这个播放是重复播放
  // speechSynthesis.speak(speechUtterance); //这个是不重复播放
};

const text = ref<string>('');

const handleInput = (e: Event) => {
  const inputEle = e.target as HTMLInputElement;

  inputEle.style.height = `${inputEle.scrollHeight + 2}px`;

  if ((e as any).isComposing) {
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

const methods = [ENCRYPT_METHOD.MD5, ENCRYPT_METHOD.BASE64, ENCRYPT_METHOD.AES];
const types = [TYPE.加密, TYPE.解密];

const textCry = ref<string>('');
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
    message.error((e as any).message);
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
.plugins-simple {
  .ps-container {
    textarea {
      line-height: 22px;
      font-size: 14px;

      padding: 5px 8px;
      border: 1px solid rgba(0, 0, 0, 0.15);
      border-radius: 4px;
      resize: none;

      word-break: break-all;
      box-sizing: border-box;

      &:focus {
        outline: none;
        border-color: #06a5ff;
      }
    }

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
  }
}
</style>
