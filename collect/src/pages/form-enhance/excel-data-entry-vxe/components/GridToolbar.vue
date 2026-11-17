<script setup lang="ts">
// 顶部工具条（Excel ribbon 风格）：纯图标按钮 + 悬浮提示，能图标的都用图标。
// 状态与动作全部来自页面装配的 hooks，本组件只做展示与事件转发（纯 UI 层，不含业务判断）。
// 协作：props.core(校验/历史/搜索) / props.ops(行与列操作) / props.find(查找)
// 工具条口径对齐 Univer 录入台：新增行 / 新增列 / 撤销重做 / 搜索 / 查找替换 / 保存。
import {
  Plus,
  Grid,
  RefreshLeft,
  RefreshRight,
  Search,
  EditPen,
  Select,
} from '@element-plus/icons-vue';
import type { GridCore } from '../hooks/useGridCore';
import type { GridOps } from '../hooks/useGridOps';
import type { GridFindReplace } from '../hooks/useGridFindReplace';

defineOptions({ name: 'GridToolbar' });
const props = defineProps<{
  core: GridCore;
  ops: GridOps;
  find: GridFindReplace;
}>();

// 把各个 hook 暴露的"动作/状态"解构到模板可直接用的局部变量（均为响应式 ref 或函数）
const { addRow, openAddCol, submit, submitting } = props.ops;
const { canUndo, undo, canRedo, redo, searchText } = props.core;
const { findVisible } = props.find;
</script>

<template>
  <div class="dt-toolbar bi-toolbar">
    <!-- 新增行 / 新增列 -->
    <div class="tb-group">
      <el-tooltip content="新增行" placement="bottom">
        <el-button :icon="Plus" size="small" @click="addRow" />
      </el-tooltip>
      <el-tooltip content="新增列" placement="bottom">
        <el-button :icon="Grid" size="small" @click="openAddCol" />
      </el-tooltip>
    </div>
    <el-divider direction="vertical" />

    <!-- 撤销重做 -->
    <div class="tb-group">
      <el-tooltip content="撤销 (Ctrl+Z)" placement="bottom">
        <el-button :icon="RefreshLeft" size="small" :disabled="!canUndo" @click="undo" />
      </el-tooltip>
      <el-tooltip content="重做 (Ctrl+Y)" placement="bottom">
        <el-button :icon="RefreshRight" size="small" :disabled="!canRedo" @click="redo" />
      </el-tooltip>
    </div>
    <el-divider direction="vertical" />

    <!-- 查找 / 搜索 -->
    <div class="tb-group">
      <el-input v-model="searchText" placeholder="全局搜索…" clearable :prefix-icon="Search" size="small" style="width: 170px" />
      <el-tooltip content="查找替换 (Ctrl+F)" placement="bottom">
        <el-button :icon="EditPen" size="small" type="primary" plain @click="findVisible = !findVisible" />
      </el-tooltip>
    </div>
    <el-divider direction="vertical" />

    <!-- 保存（全量复校验 → 标红 + 跳首个错误） -->
    <div class="tb-group">
      <el-tooltip content="保存（全量复校验，错误标红并跳首个）" placement="bottom">
        <el-button type="success" :icon="Select" size="small" :loading="submitting" @click="submit" />
      </el-tooltip>
    </div>
  </div>
</template>

<style scoped>
/* 骨架（横条 / 边框 / 圆角 / 分组间距）见全局 .bi-toolbar，此处只留 vxe 专有部分 */
/* 图标按钮去掉默认左右内边距，让 ribbon 更紧凑 */
.tb-group :deep(.el-button.is-circle),
.tb-group :deep(.el-button:not(.el-button--small) .el-icon) {
  padding: 0;
}
</style>
