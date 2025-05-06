<!--
 * @Author: wanzp
 * @Date: 2023-02-20 21:53:11
 * @LastEditors: wanzp
 * @LastEditTime: 2023-05-10 21:45:33
 * @Description: 
-->
<template>
  <div class="children-comp">
    <h1 ref="hRef">children-component</h1>

    <div class="content-div">content-div</div>
    <div class="border-div">border-div</div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, onBeforeMount, onBeforeUnmount, onUnmounted, ref } from 'vue';
const hRef = ref();

onBeforeMount(() => {
  console.log('children-onBeforeMount================================>', hRef.value);
});
onMounted(() => {
  testFn();
  testFn2();
  console.log(value.value);
  console.log('children-onMounted================================>', hRef.value);
});
onBeforeUnmount(() => {
  console.log('children-onBeforeUnmount================================>');
});
onUnmounted(() => {
  console.log('children-onUnmounted================================>');
});

const value = ref('11');

const testFn = () => {
  console.log('testFn');
};
function testFn2() {
  console.log('testFn2');
}
</script>
<style lang="less">
.border-div,
.content-div {
  height: 100px;
  width: 100px;
  border: 1px solid;
  padding: 10px;
  margin: 10px;
}

.content-div {
  box-sizing: content-box;
}

.border-div {
  box-sizing: border-box;
}
</style>
