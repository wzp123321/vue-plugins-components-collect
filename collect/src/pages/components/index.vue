<template>
  <div class="components-little">
    <h5>所有小组件</h5>
    <el-row :gutter="20">
      <el-col v-for="item in customComponents" :key="item.description" :span="12">
        <el-card class="box-card">
          <h5>{{ item?.description }}</h5>
          <component :is="item?.component"></component>
        </el-card>
      </el-col>
    </el-row>

    <h5 style="margin-top: 30px">te-* 业务组件（来自 hlms-portal-web-package）</h5>
    <el-row :gutter="20">
      <el-col v-for="item in teCustomComponents" :key="item.description" :span="12">
        <el-card class="box-card">
          <h5>{{ item?.description }}</h5>
          <component :is="item?.component"></component>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts" setup>
import { customComponents, teCustomComponents } from './components';

defineOptions({
  name: 'ComponentsLittle',
});
</script>
<style lang="less" scoped>
.components-little {
  width: 100%;
  min-height: 100%;
  height: auto;
  padding-bottom: 40px;

  :deep(.el-col) {
    padding-top: 10px;
    padding-bottom: 10px;

    .el-card {
      min-height: 360px;
    }
  }
}
</style>
