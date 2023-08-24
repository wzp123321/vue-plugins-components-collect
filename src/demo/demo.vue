<template>
  <div id="demo">
    <draggable v-model="myArray" group="people" animation="1000" @start="onStart" @end="onEnd">
      <template #item="{ element }">
        <div class="item">{{ element.name }}</div>
      </template>
    </draggable>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import draggable from 'vuedraggable';

const myArray = ref([
  { people: 'cn', id: 1, name: '张三' },
  { people: 'cn', id: 2, name: '李四' },
  { people: 'cn', id: 3, name: '王五' },
  { people: 'cn', id: 4, name: '钟馗' },
]);

// 开始拖拽事件
function onStart() {
  // to do
}
// 拖拽结束事件
function onEnd() {
  // to do
}
</script>
<style lang="less" scoped>
.demo {
  width: 100%;
  height: 100%;
}
</style>
