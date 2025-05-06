<template>
  <div class="plugins-webrtc">
    <!-- 视屏区域 -->
    <div class="pw-container">
      <video id="pw-container-video"></video>
    </div>
    <footer class="pw-footer">
      <a-button @click="handleStart">打开</a-button>
      <a-button @click="handleClose">关闭</a-button>
    </footer>
  </div>
</template>
<script lang="ts" setup>
defineOptions({
  name: 'PluginsWebRTC',
});
let stream: MediaStream;

const handleStart = async () => {
  // 获取一个音视频流（MediaStream）
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  const video = document.getElementById('pw-container-video') as any;
  if (video) {
    // 将音视频流赋值video
    video.srcObject = stream;
    // 播放音视频流内容
    video.play();
  }
};

const handleClose = async () => {
  const video = document.getElementById('pw-container-video') as any;
  if (video) {
    video.srcObject = null;
    console.log(stream.getVideoTracks(), stream.getTracks());
    if (stream) {
      stream.getTracks()[0].stop();
    }
  }
};
</script>
<style lang="less" scoped>
.plugins-webrtc {
  width: 100%;
  height: 100%;
  position: relative;

  > .pw-container {
    width: 360px;
    height: 500px;

    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    box-shadow:
      0px 2px 6px -3px rgba(0, 0, 0, 0.1),
      0px 4px 12px rgba(0, 0, 0, 0.08),
      0px 6px 18px 6px rgba(0, 0, 0, 0.06);
  }

  > .pw-footer {
    position: absolute;
    top: 516px;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
