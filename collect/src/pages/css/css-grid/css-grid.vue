<template>
  <el-tabs v-model="activeKey" class="css-grid">
    <el-tab-pane label="属性" name="property">
      <CgProperty></CgProperty>
    </el-tab-pane>
    <el-tab-pane label="示例" name="example">
      <CgExample></CgExample>
    </el-tab-pane>
  </el-tabs>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import CgExample from './cg-example/cg-example.vue';
import CgProperty from './cg-property/cg-property.vue';

defineOptions({
  name: 'CssGrid',
});

const activeKey = ref<string>('property');
</script>
<style lang="less" scoped>
.css-grid {
  width: 100%;
  height: 100%;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  gap: 16px;

  :deep(.el-tabs__content) {
    overflow-y: auto;
  }
}
</style>
