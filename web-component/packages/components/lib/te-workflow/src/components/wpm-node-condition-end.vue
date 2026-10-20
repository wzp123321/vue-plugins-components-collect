<template>
  <div class="wpm-node-conditon-end">
    <div class="wpm-node-conditon-end-line"></div>
  </div>
</template>
<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { Node } from '@antv/x6';

interface NodeDTO {
  text: string;
}

const getNode: Function | undefined = inject<Function>('getNode');
const node = getNode?.() as Node;
const data = ref<NodeDTO | undefined>(undefined);
onMounted(() => {
  data.value = node?.getData();
});
</script>
<style scoped lang="less">
.wpm-node-conditon-end {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .wpm-node-conditon-end-line {
    width: 2px;
    height: 40px;
  }
}
</style>
