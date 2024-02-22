<template>
  <div id="demo">
    <input v-model="text" v-inputFilter:text placeholder="文本过滤" />
    <input v-model="num" v-inputFilter:number placeholder="数字过滤" />
    <TreeSelectTransfer></TreeSelectTransfer>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import TreeSelectTransfer from './tree-select-transfer/tree-select-transfer.vue';

const text = ref<string>('');
const num = ref<number | null>(null);
</script>
<style lang="less" scoped>
.demo {
  width: 100%;
  height: 100%;
}
</style>
