<template>
  <div id="demo">
    <button @click="close">关闭</button>
    <ParentComp v-if="visible"></ParentComp>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import ParentComp from './parent-comp/parent-comp.vue';

const visible = ref<boolean>(true)

function  close (){
  visible.value = false;
}

</script>
<style lang="less" scoped></style>
