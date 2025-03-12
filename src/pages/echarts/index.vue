<template>
  <div class="echarts">
    <h5>所有小组件</h5>
    <a-row :gutter="20">
      <a-col :span="12">
        <a-card class="box-card">
          <h5>二维码生成器</h5>
          <ComponentQrCode></ComponentQrCode>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card class="box-card">
          <h5>自定义分页器</h5>
          <ComponentPagination></ComponentPagination>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card class="box-card">
          <h5>拖拽布局</h5>
          <ComponentDragLayout></ComponentDragLayout>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import { ComponentQrCode, ComponentPagination, ComponentDragLayout } from './components';

defineOptions({
  name: 'ComponentsLittle',
});
</script>
<style lang="less" scoped>
.echarts {
  width: 100%;
  height: 100%;

  :deep(.ant-col) {
    padding-top: 10px;
    padding-bottom: 10px;

    .ant-card {
      height: 360px;
    }
  }
}
</style>
