<!--
 * 场景上下文：VChart（字节跳动 VisActor 体系图表库）作为 ECharts 的对比/备选收编，
 *   在本站验证其声明式 spec、视觉编码写法与自研 VRender 渲染的可用性，
 *   为后续"同数据源 echarts vs VChart 选型对比"留基础。
 * 技术组合：Vue3 <script setup> + @visactor/vchart v2 + TypeScript + Element Plus
 * 踩坑落点：接入与 spec 写法相关坑统一记入 .workbuddy/memory/MEMORY.md「接缝本」
 -->
<template>
  <div class="vchart">
    <h5>VChart 图表</h5>
    <el-alert class="vchart__intro" type="info" :closable="false">
      <template #title>
        <span>
          VChart 是字节跳动 VisActor 可视化体系的图表库（声明式 spec + VRender 渲染），
          定位“叙事可视化”。与本站 ECharts 页互为参照：ECharts 用 option 对象，VChart 用
          type + data + xField/yField 的视觉编码。当前版本 v2，MIT 协议。
          下方覆盖基础图型（折线/柱/饼/散点/动态）到进阶图型（双轴组合/大数据缩略轴/十字准星/主题切换）。
        </span>
      </template>
    </el-alert>
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
  name: 'VChart',
});
</script>
<style lang="less" scoped>
.vchart {
  width: 100%;
  height: 100%;

  .vchart__intro {
    margin-bottom: 4px;
  }

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
