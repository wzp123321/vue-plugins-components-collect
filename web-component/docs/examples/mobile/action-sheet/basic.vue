<template>
  <tem-action-sheet
    ref="popup"
    :actions="
      types.map((item) => ({
        text: item,
        type: item,
      }))
    "
    @changeSelected="changeSelected"
  >
  </tem-action-sheet>
  <tem-cell titleText="基本使用" layout="vertical" showContent>
    <template #content>
      <view>
        <tem-button @click="popup.open()">打开</tem-button>
      </view>
    </template>
  </tem-cell>
</template>

<script lang="ts" setup>
// import { TemActionSheet, TemButton, TemCell } from '@tiansu/ts-mobile-package';
import { ref } from 'vue';

const popup = ref();
const types = ['default', 'primary', 'success', 'danger', 'disable'];

const changeSelected = (e) => {
  console.log('当前选中：' + JSON.stringify(e));
};
</script>

<style lang="scss"></style>
