<template>
  <tem-cell titleText="基础用法" layout="vertical" showContent>
    <template #content>
      <tem-search
        placeholder="请通过关键字搜索"
        filter-show
        v-model:model-value="searchValue"
        @handle-filter="onClick"
      >
      </tem-search>
    </template>
  </tem-cell>
  <tem-cell titleText="尺寸大小" layout="vertical" showContent>
    <template #content>
      <tem-search
        v-model:modelValue="searchValue"
        v-for="item in ['default', 'medium', 'large']"
        :placeholder="item"
        :size="item"
      >
      </tem-search>
    </template>
  </tem-cell>

  <tem-popup-toast ref="toastRef">{{ messageText }}</tem-popup-toast>
</template>

<script setup lang="ts">
// import { TemSearch, TemCell, TemPopupToast } from '@tiansu/ts-mobile-package';
import { ref } from 'vue';

const searchValue = ref<string>(''); // 搜索框的值
const toastRef = ref();
const messageText = ref('');

const onClick = () => {
  messageText.value = '点击了筛选按钮';
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
