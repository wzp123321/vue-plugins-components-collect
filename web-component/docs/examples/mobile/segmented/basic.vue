<template>
  <tem-cell titleText="自定义样式" layout="vertical" showContent>
    <template #content>
      <tem-segmented
        :list="routes"
        bold
        activeColor="var(--tem-color-danger)"
        inactiveColor="var(--tem-text-color-primary)"
      >
      </tem-segmented>
    </template>
  </tem-cell>
  <tem-cell titleText="开启动画属性" layout="vertical" showContent>
    <template #content>
      <tem-switch checked @change="(e) => (animation = e.detail.value)" />
      <tem-segmented :list="routes" :animation="animation"> </tem-segmented>
    </template>
  </tem-cell>
  <tem-cell titleText="尺寸属性" layout="vertical" showContent>
    <template #content>
      <tem-segmented :list="routes" v-for="size in sizes" :size="size">
      </tem-segmented>
    </template>
  </tem-cell>
</template>

<script setup lang="ts">
// import { TemSegmented, TemCell, TemSwitch } from '@zpackage/mobile-package';
import { ref } from 'vue';

const sizes = ['large', 'default', 'small'];
const animation = ref(true);
const routes = [
  {
    name: '按天',
  },
  {
    name: '按周',
  },
  {
    name: '按月',
  },
  {
    name: '按季度',
  },
  {
    name: '按年',
  },
];
</script>

<style lang="scss"></style>
