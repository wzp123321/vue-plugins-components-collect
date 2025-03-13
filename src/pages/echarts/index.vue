<template>
  <div class="echarts">
    <h5>ECharts图表</h5>
    <a-row :gutter="20">
      <a-col v-for="item in customComponents" :span="12">
        <a-card class="box-card">
          <h5>{{ item.description }}</h5>
          <component :is="item.component"></component>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import { customComponents } from './components/model';

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

    .ant-card,
    .ant-card-body {
      height: 360px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  }
}
</style>
