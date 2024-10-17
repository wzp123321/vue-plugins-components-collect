<script setup lang="ts">
import Container from './views/container/container.vue';
import { message } from 'ant-design-vue';

message.config({
  top: `100px`,
  duration: 2,
  maxCount: 1,
  rtl: true,
  prefixCls: 'my-message',
});
</script>

<template>
  <container></container>
</template>

<style>
#app {
  width: 100%;
  height: 100%;
}
</style>
