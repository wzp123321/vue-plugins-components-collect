<template>
  <div class="plugins-little">
    <h5>所有小插件</h5>
    <a-row :gutter="20">
      <a-col :span="12">
        <a-card class="box-card">
          <h1>语音播报</h1>
          <div class="ps-container">
            <textarea rows="10" v-model="text1"></textarea>
            <a-button @click="videoBroadCast()">播报</a-button>
            <a-button @click="speak()">播放</a-button>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card class="box-card">
          <h1>文本框自适应高度</h1>
          <div class="ps-container">
            <textarea v-model="text" :maxlength="MAX_LENGTH" @input="handleInput"></textarea>
          </div>
        </a-card>
      </a-col>
      <a-col v-for="item in componentList" :span="12">
        <a-card class="box-card">
          <component :is="item"></component>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { PluginsCanvas, PluginsCrypto } from './components';

defineOptions({
  name: 'PluginsLittle',
});

const componentList = [PluginsCanvas, PluginsCrypto];

const text1 = ref<string>(
  '仆去月谢病，还觅薜萝。梅溪之西，有石门山者，森壁争霞，孤峰限日；幽岫含云，深溪蓄翠；蝉吟鹤唳，水响猿啼，英英相杂，绵绵成韵。既素重幽居，遂葺宇其上。幸富菊花，偏饶竹实。山谷所资，于斯已办。仁智之乐，岂徒语哉！',
);

const audioContext = new AudioContext({ latencyHint: 'balanced' });

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
const videoBroadCast = async () => {
  const mp3 =
    'https://tts.baidu.com/text2audio?cuid=baike&lan=zh&ctp=1&pdt=301&vol=9&rate=32&per=0&tex=' +
    encodeURI(text1.value);
  const musicArrayBuffer = await getMp3ArrayBuffer(mp3);
  const decodedAudioData = await decode(musicArrayBuffer);
  play(decodedAudioData);
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

const MAX_LENGTH = 2000;

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
</script>
<style lang="less" scoped>
.plugins-little {
  width: 100%;
  height: 100%;

  :deep(.ant-col) {
    padding-top: 10px;
    padding-bottom: 10px;

    .ant-card {
      height: 360px;
    }
  }
}
</style>
