/*
 * @Description: 语音播报
 * @Author: zpwan
 * @Date: 2022-06-07 09:42:18
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-06-07 09:43:42
 */
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'VideoBroadCast',
  setup() {
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

    return {
      text1,
      videoBroadCast,
      speak,
    };
  },
});
