<template>
  <div>
    <div v-for="item in props.list"></div>
  </div>
</template>
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    list: [];
  }>(),
  {
    list: () => [],
  }
);
</script>
<style scoped>
/* @import '@tiansu/ts-web-package/dist/styles/index.css'; */
</style>
