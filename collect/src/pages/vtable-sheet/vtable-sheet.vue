<!--
 * 场景上下文：本页是 VTable-Sheet 数据录入台演示。表格内核为 @visactor/vtable-sheet
 *   （底层 @visactor/vtable，纯 Canvas 渲染），数据录入能力对齐站内 vxe 录入台；
 *   工具栏 / 撤销栈 / 右键菜单均为自绘，sheet 自带 UI（菜单栏 / 公式栏 / sheet 页签 / 撤销）已关闭。
 * 技术组合：Vue3 <script setup> + @visactor/vtable-sheet 1.26.8 + @visactor/vtable-editors 1.26.8 + TypeScript
 * 踩坑落点：见 .workbuddy/memory/MEMORY.md「接缝本」
 -->
<template>
  <div class="vtable-sheet bi-page">
    <div class="bi-header">
      <div class="bi-title">
        <span class="bi-logo">V</span>
        <div>
          <h3>vtable-sheet 数据录入台</h3>
          <p class="bi-sub">
            @visactor/vtable-sheet 1.26.8（底层 @visactor/vtable 1.26.8）· Canvas 渲染，百万级数据流畅；数据录入能力对齐 vxe 录入台
          </p>
        </div>
      </div>
    </div>

    <div class="vtable-sheet__bi">
      <VtBiEntry />
    </div>
  </div>
</template>

<script lang="ts" setup>
import VtBiEntry from './components/vt-bi-entry.vue';

defineOptions({
  name: 'VTableSheetEntry',
});
</script>

<style lang="less" scoped>
/* 页面骨架（.bi-page / .bi-header）与色板（--bi-*）由全局
   assets/style/bi-entry.less 提供，与 vxe / Univer 两套录入台一致；此处只留本页专有部分。 */
.vtable-sheet {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;

  .vtable-sheet__bi {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}
</style>
