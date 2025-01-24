<template>
  <div class="vueuse-mutationobserver" id="vueuse-mutationobserver">
    <h1>-监听样式或类名变化</h1>
    <a-button @click="handleAdd">添加</a-button>
    <ul ref="mutationobserverRef" :style="{ color }" :class="className">
      <li v-for="item in list">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useMutationObserver } from '@vueuse/core';

const list = ref<{ id: number; name: string }[]>([]);

const mutationobserverRef = ref(null);
const color = ref<string>('red');
const className = ref<string>('');

// 监听样式或类名变化
useMutationObserver(
  mutationobserverRef,
  (mutations) => {
    if (mutations[0]) {
      console.log(mutations[0]);
    }
  },
  {
    attributes: true,
  },
);

function handleAdd() {
  color.value = 'yellow';
  className.value = (Math.random() * 1000).toFixed(0);
  list.value.push({
    id: 1,
    name: '123123',
  });
}
</script>
<style lang="less" scoped></style>
