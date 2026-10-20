<template>
  <div class="wpm-node-task">
    <div class="wpn-wrap-name" :title="data.text">
          {{ data.text || '外部流程' }}
        </div>
  </div>
</template>
<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';

const getNode: Function | undefined = inject<Function>('getNode');
const node = getNode?.();
const data = ref(node.data || {});
node.data.refData = data;
onMounted(() => {});
</script>
<style scoped lang="less">
.wpm-node-task {
  width: 160px;
  height: 48px;
  background-color: rgba(114, 46, 209, 0.3);
  border-radius: 8px;
  .wpn-wrap-name {
    text-align: center;
    color: rgba(114, 46, 209);
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
