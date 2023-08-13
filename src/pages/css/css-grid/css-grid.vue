<template>
  <a-tabs v-model:activeKey="activeKey" class="css-grid">
    <a-tab-pane tab="示例" key="example">
      <CgExample></CgExample>
      >
    </a-tab-pane>
    <a-tab-pane tab="属性" key="property">
      <CgProperty></CgProperty>
    </a-tab-pane>
  </a-tabs>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import CgExample from './cg-example/cg-example.vue';
import CgProperty from './cg-property/cg-property.vue';

const activeKey = ref<string>('example');
</script>
<style lang="less" scoped>
.css-grid {
  width: 100%;
  height: 100%;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
