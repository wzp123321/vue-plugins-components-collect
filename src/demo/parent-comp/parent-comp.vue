<template>
  <div class="parent-comp">
    <h1>parent-component</h1>
    <ChildrenComp></ChildrenComp>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, onBeforeMount, onBeforeUnmount, onUnmounted } from 'vue';
import ChildrenComp from './children-comp/children-comp.vue';

onBeforeMount(() => {
  console.log('parent-onBeforeMount================================>');
});
onMounted(() => {
  console.log('parent-onMounted================================>');
});
onBeforeUnmount(() => {
  console.log('parent-onBeforeUnmount================================>');
});
onUnmounted(() => {
  console.log('parent-onUnmounted================================>');
});
</script>
<style lang="less" scoped>
.parent-comp {
  h1 {
    cursor: pointer;
  }
}
</style>
