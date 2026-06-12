<template>
  <view>
    <tsm-button @click="showToast">显示 Toast</tsm-button>
  </view>
  <tsm-toast ref="toastRef" :message="message" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
const toastRef = ref<any>();
const message = ref('最长文案不超过2行，最多可以显示24个字符。');
const showToast = () => {
  toastRef.value?.show({ message: message.value });
};
</script>

<style scoped lang="scss"></style>
