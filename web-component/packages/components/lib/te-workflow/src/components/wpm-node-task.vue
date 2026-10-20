<template>
  <div class="wpm-node-task">
    <div class="wpn-wrap-name-value" :title="data.text">{{ data.text || '用户任务' }}</div>
  </div>
</template>
<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';

const getNode: Function | undefined = inject<Function>('getNode');
const node = getNode?.();
const data = ref(node.data || {});
onMounted(() => {});
</script>
<style scoped lang="less">
.wpm-node-task {
  width: 160px;
  height: 48px;
  background-color: var(--te-color-primary-light);
  border-radius: 8px;
  .wpn-wrap-name-value {
    text-align: center;
    color: var(--te-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 48px;
    padding-left: var(--te-space-4);
    padding-right: var(--te-space-4);
    font-size: var(--te-font-size-b14);
  }
}
</style>
