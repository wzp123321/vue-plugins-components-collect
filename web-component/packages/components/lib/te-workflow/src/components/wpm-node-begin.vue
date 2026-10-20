<template>
  <div class="wpm-node-begin">
    <div class="wpm-node-begin-circle">
      {{ data?.text }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { Node } from '@antv/x6';
const getNode: Function | undefined = inject<Function>('getNode');
const node = getNode?.() as Node;
const data = ref(node?.getData() || {});
node.data.refData = data;
onMounted(() => {
  data.value = node?.getData();
});
</script>
<style scoped lang="less">
.wpm-node-begin {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .wpm-node-begin-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--te-color-info);
    color: var(--te-color-white);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .wpm-node-begin-line {
    width: 2px;
    height: 40px;
    /* background: var(--te-border-color); */
  }
}
</style>
