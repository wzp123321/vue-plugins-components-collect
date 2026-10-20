<template>
  <tem-cell titleText="选项等分" layout="vertical" showContent>
    <template #content>
      <tem-tabs
        :values="values"
        activeColor="var(--tem-color-danger)"
        :activeColors="['var(--tem-color-success)', 'var(--tem-color-primary)']"
      ></tem-tabs>
    </template>
  </tem-cell>
  <tem-cell titleText="选项等距" layout="vertical" showContent>
    <template #content>
      <tem-tabs
        :values="values1"
        activeColor="var(--tem-color-danger)"
        :activeColors="['var(--tem-color-success)', 'var(--tem-color-primary)']"
        :isometric="true"
      ></tem-tabs>
    </template>
  </tem-cell>
</template>

<script setup lang="ts">
// import { TemTabs, TemCell } from '@tiansu/ts-mobile-package';
const values = [
  { text: '待处理' },
  { text: '已处理' },
  { text: '待处理' },
  { text: '已处理' },
];
const values1 = [
  { text: '待处理待处理待处理待处理' },
  { text: '已处理' },
  { text: '待处理' },
  { text: '已处理' },
  { text: '待处理' },
  { text: '已处理' },
];
</script>

<style lang="scss"></style>
