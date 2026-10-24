<template>
  <tem-cell titleText="基础用法" layout="vertical" showContent>
    <template #content>
      <tem-notice-bar
        v-for="item in types"
        :key="item"
        :type="item"
        :text="item"
        suffix-icon="more"
        @click="onClick"
      ></tem-notice-bar>
    </template>
  </tem-cell>
  <tem-cell titleText="文字滚动" layout="vertical" showContent>
    <template #content>
      <tem-notice-bar
        v-for="item in types"
        :key="item"
        :type="item"
        text="文字滚动"
        suffix-icon="more"
        scrollable
        @click="onClick"
      ></tem-notice-bar>
    </template>
  </tem-cell>

  <tem-popup-toast ref="toastRef">{{ messageText }}</tem-popup-toast>
</template>

<script setup lang="ts">
// import {
//   TemNoticeBar,
//   TemCell,
//   TemPopupToast,
// } from '@zpackage/mobile-package';
import { ref } from 'vue';

const types = ['default', 'success', 'warning', 'danger', 'customize'];
const toastRef = ref();
const messageText = ref('');

const onClick = () => {
  messageText.value = '点击了通告栏';
  toastRef.value.showToast();
};
</script>

<style lang="scss">
.row {
  display: flex;
  gap: var(--tem-spacing-l);
  flex-wrap: wrap;
  margin-bottom: var(--tem-spacing-5xl);
}
</style>
