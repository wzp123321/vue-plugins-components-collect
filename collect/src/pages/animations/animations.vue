<template>
  <div class="animations-little">
    <h5>动画大全</h5>
    <el-row :gutter="20">
      <el-col v-for="item in customComponents" :key="item" :span="12">
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
  name: 'AnimationsLittle',
});
</script>
<style lang="less" scoped>
.animations-little {
  width: 100%;

  .el-row {
    row-gap: 20px;

    .el-card {
      height: 100%;
    }
  }
}
</style>
