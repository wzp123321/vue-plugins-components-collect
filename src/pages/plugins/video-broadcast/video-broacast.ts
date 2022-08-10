/*
 * @Description: 语音播报
 * @Author: zpwan
 * @Date: 2022-06-07 09:42:18
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-06-07 09:43:42
 */
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'VideoBroadCast',
  setup() {
    const audioContext = new AudioContext({ latencyHint: 'balanced' });
    const videoBroadCast = async () => {
      const mp3 =
        'https://tts.baidu.com/text2audio?cuid=baike&lan=zh&ctp=1&pdt=301&vol=9&rate=32&per=0&tex=' +
        encodeURI('支付宝到账1亿元》》》');
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
      return fetch(url).then(r => r.arrayBuffer());
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
      const speechUtterance = new SpeechSynthesisUtterance('支付宝到账1万元');
      // speechUtterance.text = '支付宝到账1万元'; // 文字内容
      // speechUtterance.lang = 'zh-CN'; // 使用的语言:中文-zh-CN
      // speechUtterance.volume = 1; // 声音音量：1
      // speechUtterance.rate = 0.75; // 语速：1
      // speechUtterance.pitch = 1; // 音高：1
      speechSynthesis.speak(speechUtterance); // 这个播放是重复播放
      // speechSynthesis.speak(speechUtterance); //这个是不重复播放
    };

    return {
      videoBroadCast,
      speak,
    };
  },
});
