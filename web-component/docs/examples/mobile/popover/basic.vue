<template>
  <tem-cell titleText="基础用法" layout="vertical" showContent>
    <template #content>
      <view style="display: flex; gap: 10px; flex-wrap: wrap">
        <tem-popover-menu
          v-for="item in [
            'bottom-start',
            'bottom',
            'bottom-end',
            'top-start',
            'top',
            'top-end',
          ]"
          :placement="item"
          :options="actions"
          :theme="theme"
          @select="onSelect"
        >
          <tem-button type="primary">{{ item }}</tem-button>
        </tem-popover-menu>
      </view>
    </template>
  </tem-cell>
  <tem-cell titleText="主题样式" layout="vertical" showContent>
    <template #content>
      <tem-switch
        checked
        activeText="light"
        inactiveText="dark"
        @change="(e) => (theme = e.detail.value ? 'light' : 'dark')"
      />
    </template>
  </tem-cell>

  <tem-popup-toast ref="toastRef">{{ messageText }}</tem-popup-toast>
</template>

<script setup lang="ts">
// import {
//   TemPopoverMenu,
//   TemCell,
//   TemPopupToast,
//   TemButton,
//   TemSwitch,
// } from '@tiansu/ts-mobile-package';
import { ref } from 'vue';
// import { IconPlus } from '@arco-iconbox/vue-tem';

const theme = ref<string>('light');
const toastRef = ref();
const messageText = ref('');
const actions = [
  {
    icon: IconPlus,
    text: '选项一',
  },
  {
    icon: IconPlus,
    text: '选项二',
  },
];
const onSelect = (item) => {
  messageText.value = `点击了${item.text}选项`;
  toastRef.value.showToast();
};
</script>

<style lang="scss">
:deep(.tem-cell) {
  overflow: unset;
}
</style>
