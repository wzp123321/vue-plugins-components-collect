<template>
  <div class="vue-usevmediacontrolls" id="vue-usevmediacontrolls">
    <video ref="video" />
    <a-button @click="playing = !playing">Play / Pause</a-button>
    <span>{{ currentTime }} / {{ duration }}</span>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useMediaControls } from '@vueuse/core';

const video = ref();
const { playing, currentTime, duration, volume } = useMediaControls(video, {
  src: '../../../../../../company/iot-energy-cloud/cloud-portal/src/assets/img/cloud-home/ch-bg-loop.mp4',
});

// Change initial media properties
onMounted(() => {
  volume.value = 0.5;
  currentTime.value = 60;
});
</script>

<style scoped lang="less">
#vue-usevmediacontrolls {
  width: 100%;
  height: 100px;
}
</style>
