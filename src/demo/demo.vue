<!--
 * @Author: wanzp
 * @Date: 2022-10-31 21:20:45
 * @LastEditors: wanzp
 * @LastEditTime: 2023-02-28 22:27:49
 * @Description: 
-->
<template>
  <div id="demo">
    <button @click="close">关闭</button>
    <ParentComp v-if="visible"></ParentComp>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import ParentComp from './parent-comp/parent-comp.vue';

const visible = ref<boolean>(true);

function close() {
  visible.value = false;
}

function strSort() {
  let list = ['Y831-03-10', 'J342-50-22', 'X200-02-01', 'J342-40-22', 'Y831-03-09'];
  list = list?.sort();
  console.log(list);
}

onMounted(() => {
  strSort();
});
</script>
<style lang="less" scoped></style>
