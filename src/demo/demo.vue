<template>
  <div id="demo">
    {{ text }}
    <button @click="test">测试</button>
    <VNode :content="renderTable"></VNode>
  </div>
</template>
<script lang="ts" setup>
import { h, ref } from 'vue';
import { VNode } from './vnode';

let renderTable = ref<any>(h('div', {}, '132'));
const text = ref<string>('2133');

const test = () => {
  console.log(1321);
  renderTable.value = h('input', {
    value: text.value,
    oninput: (e: InputEvent) => {
      console.log(123123);
      (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value?.replaceAll(' ', '');
    },
  });
};
</script>
<style lang="less" scoped></style>
