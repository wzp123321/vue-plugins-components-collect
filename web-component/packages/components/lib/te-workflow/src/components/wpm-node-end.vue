<template>
  <div class="wpm-node-end">
    <div class="wpm-node-end-circle">
      {{ data?.text }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { Node } from '@antv/x6';

interface NodeDTO {
  text: string;
}

const getNode: Function | undefined = inject<Function>('getNode');
const data = ref<NodeDTO | undefined>(undefined);
onMounted(() => {
  const node = getNode?.() as Node;
  data.value = node?.getData();
});
</script>
<style scoped lang="less">
.wpm-node-end {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .wpm-node-end-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--te-color-info);
    color: var(--te-color-white);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
