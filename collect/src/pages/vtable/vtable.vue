<!--
 * 场景上下文：@visactor/vtable 是 VisActor 体系的高性能表格库（纯 Canvas 渲染，
 *   与框架无关），并配套 @visactor/vtable-editors 扩展「单元格编辑」能力。本站收编它
 *   作为 AG Grid / vxe-table 的高性能对照，本页用两个标签页分别演示「表格与编辑器」与「BI 数据录入」。
 * 技术组合：Vue3 <script setup> + @visactor/vtable 1.26.x + @visactor/vtable-editors 1.26.x + TypeScript
 * 踩坑落点：见 .workbuddy/memory/MEMORY.md「接缝本」
 -->
<template>
  <div class="vtable bi-page">
    <div class="bi-header">
      <div class="bi-title">
        <span class="bi-logo">V</span>
        <div>
          <h3>VTable BI 数据录入台</h3>
          <p class="bi-sub">
            @visactor/vtable 1.26.8 · 纯 Canvas 渲染，百万级数据流畅；两个标签页：① 表格与编辑器 ② BI 数据录入（能力对齐 vxe 录入台）
          </p>
        </div>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="vtable__tabs" @tab-change="onTabChange">
      <el-tab-pane label="表格与编辑器" name="grid">
        <div class="vtable__grid">
          <el-row :gutter="20">
            <el-col v-for="item in customComponents" :key="item.description" :span="item.span ?? 12">
              <el-card class="box-card">
                <h5>{{ item.description }}</h5>
                <component :is="item.component"></component>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <el-tab-pane label="BI 数据录入" name="bi">
        <div class="vtable__bi">
          <VtBiEntry v-if="biMounted" ref="biRef" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref } from 'vue';
import { customComponents } from './components/model';
import VtBiEntry from './components/vt-bi-entry.vue';

defineOptions({
  name: 'VTable',
});

const activeTab = ref<'grid' | 'bi'>('grid');
// BI 录入含 Canvas 表格，仅在首次进入该标签页时挂载，避免隐藏态初始化得到 0 尺寸画布
const biMounted = ref(false);
const biRef = ref<InstanceType<typeof VtBiEntry> | null>(null);

const onTabChange = async (name: string | number) => {
  if (name === 'bi') {
    biMounted.value = true;
    // 等待标签页显隐与尺寸稳定后再重算画布（首次挂载 + 再次切回都成立）
    await nextTick();
    biRef.value?.resize();
  }
};
</script>

<style lang="less" scoped>
/* 页面骨架（.bi-page / .bi-header / .stat-pill）与色板（--bi-*）由全局
   assets/style/bi-entry.less 提供，与 vxe / Univer 两套录入台一致；此处只留本页专有部分。 */
.vtable {
  width: 100%;

  .vtable__tabs {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;

    :deep(.el-tabs__header) {
      flex: 0 0 auto;
      margin-bottom: 8px;
    }

    :deep(.el-tabs__content) {
      flex: 1 1 auto;
      min-height: 0;
    }

    :deep(.el-tab-pane) {
      height: 100%;
    }
  }

  .vtable__grid {
    height: 100%;
    min-height: 0;
    overflow: auto;
    display: flex;
    flex-direction: column;

    :deep(.el-row) {
      flex: 1 1 auto;
      min-height: 0;
      // el-row 为 flex-wrap，多行（换行后的每个卡片行）平均吃满剩余高度
      align-content: stretch;
    }

    :deep(.el-col) {
      padding-top: 10px;
      padding-bottom: 10px;
      display: flex;

      .el-card {
        flex: 1 1 auto;
        min-height: 240px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .el-card__body {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
    }
  }

  .vtable__bi {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}
</style>
