<template>
  <div class="children-comp">
    <h1>children-component</h1>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, onBeforeMount, onBeforeUnmount, onUnmounted } from 'vue';

onBeforeMount(() => {
  console.log('children-onBeforeMount================================>');
});
onMounted(() => {
  console.log('children-onMounted================================>');
});
onBeforeUnmount(() => {
  console.log('children-onBeforeUnmount================================>');
});
onUnmounted(() => {
  console.log('children-onUnmounted================================>');
});
</script>
