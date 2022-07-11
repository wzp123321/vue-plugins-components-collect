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
        encodeURI('测出猜测猜测测出猜测猜测测出猜测猜测测出猜测猜测测出猜测猜测测出猜测猜测');
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
    return {
      videoBroadCast,
    };
  },
});
