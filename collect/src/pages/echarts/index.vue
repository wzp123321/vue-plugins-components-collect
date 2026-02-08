<template>
  <div class="echarts">
    <h5>ECharts图表</h5>
    <el-row :gutter="20">
      <el-col v-for="item in customComponents" :key="item.description" :span="12">
        <el-card class="box-card">
          <h5>{{ item.description }}</h5>
          <component :is="item.component"></component>
        </el-card>
      </el-col>
    </el-row>
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

  :deep(.el-col) {
    padding-top: 10px;
    padding-bottom: 10px;

    .el-card,
    .el-card__body {
      height: 360px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  }
}
</style>
