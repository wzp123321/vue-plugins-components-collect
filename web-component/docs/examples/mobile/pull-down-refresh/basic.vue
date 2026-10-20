<template>
  <tem-cell titleText="列表刷新" layout="vertical" showContent>
    <template #content>
      <tem-scroll-view
        refresher-enabled
        :refresher-triggered="refreshStatus"
        @refresherrefresh="onRefresh"
      >
        <view
          style="
            height: 300px;
            background-color: var(--tem-bg-color-component-light);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--tem-text-color-placeholder);
          "
          >拖拽该区域演示 顶部下拉刷新</view
        >
      </tem-scroll-view>
    </template>
  </tem-cell>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// import { TemScrollView, TemCell } from '@tiansu/ts-mobile-package';

const refreshStatus = ref<boolean>(false);
const onRefresh = () => {
  if (!refreshStatus.value) {
    refreshStatus.value = true;
  }
  setTimeout(() => {
    refreshStatus.value = false;
  }, 3000);
};
</script>

<style lang="scss"></style>
