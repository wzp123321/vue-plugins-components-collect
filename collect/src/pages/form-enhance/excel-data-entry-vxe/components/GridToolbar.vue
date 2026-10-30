<script setup lang="ts">
// 顶部工具条（Excel ribbon 风格）：纯图标按钮 + 悬浮提示，能图标的都用图标。
// 状态与动作全部来自页面装配的 hooks，本组件只做展示与事件转发（纯 UI 层，不含业务判断）。
// 协作：props.core(校验/历史/视图) / props.ops(行与列操作) / props.tpl(模板) / props.demo(压测) / props.io(导入导出) / props.find(查找)
import {
  Plus,
  ArrowDown,
  Delete,
  CopyDocument,
  Grid,
  Setting,
  Operation,
  Files,
  RefreshLeft,
  RefreshRight,
  Search,
  EditPen,
  Upload,
  Download,
  Select,
  DocumentDelete,
  DocumentCopy,
  Close,
  Lightning,
  DataLine,
  Warning,
  FullScreen,
  Aim,
} from '@element-plus/icons-vue';
import type { GridCore } from '../hooks/useGridCore';
import type { GridOps } from '../hooks/useGridOps';
import type { GridTemplates } from '../hooks/useGridTemplates';
import type { GridDemoData } from '../hooks/useGridDemoData';
import type { GridIO } from '../hooks/useGridIO';
import type { GridFindReplace } from '../hooks/useGridFindReplace';

defineOptions({ name: 'GridToolbar' });
const props = defineProps<{
  core: GridCore;
  ops: GridOps;
  tpl: GridTemplates;
  demo: GridDemoData;
  io: GridIO;
  find: GridFindReplace;
}>();

// 把各个 hook 暴露的"动作/状态"解构到模板可直接用的局部变量（均为响应式 ref 或函数）
const { addRow, insertRow, deleteSelected, duplicateSelected, clearAll, selectionCount, mergeSelection, clearAllMerges } = props.ops;
const { removeEmptyRows, removeDuplicateRows } = props.ops;
const { openAddCol, colDrawer, fillVisible, submit, submitting, errDrawer } = props.ops;
const { importExcel, onExportCommand } = props.io;
const { onTplCommand, templates } = props.tpl;
const { presetData, genData } = props.demo;
const { canUndo, undo, canRedo, redo } = props.core;
const { searchText, viewMode, showFooter, conditionalOn, errorCount } = props.core;
const { findVisible } = props.find;
</script>

<template>
  <div class="dt-toolbar bi-toolbar">
    <!-- 行操作 -->
    <div class="tb-group">
      <el-tooltip content="新增行" placement="bottom">
        <el-button :icon="Plus" size="small" @click="addRow" />
      </el-tooltip>
      <el-tooltip content="在选中行上方插入" placement="bottom">
        <el-button :icon="ArrowDown" size="small" @click="insertRow" />
      </el-tooltip>
      <el-tooltip content="删除选中行" placement="bottom">
        <el-button type="danger" plain :icon="Delete" size="small" :disabled="!selectionCount" @click="deleteSelected" />
      </el-tooltip>
      <el-tooltip content="复制选中行" placement="bottom">
        <el-button :icon="CopyDocument" size="small" :disabled="!selectionCount" @click="duplicateSelected" />
      </el-tooltip>
    </div>
    <el-divider direction="vertical" />

    <!-- 列 / 合并 -->
    <div class="tb-group">
      <el-tooltip content="新增列" placement="bottom">
        <el-button :icon="Grid" size="small" @click="openAddCol" />
      </el-tooltip>
      <el-tooltip content="列设置 / 列分组" placement="bottom">
        <el-button :icon="Setting" size="small" @click="colDrawer = true" />
      </el-tooltip>
      <el-tooltip content="批量填充" placement="bottom">
        <el-button :icon="Operation" size="small" @click="fillVisible = !fillVisible" />
      </el-tooltip>
      <el-tooltip content="合并单元格（框选区域）" placement="bottom">
        <el-button :icon="FullScreen" size="small" :disabled="!selectionCount" @click="mergeSelection" />
      </el-tooltip>
      <el-tooltip content="取消合并（清除全部）" placement="bottom">
        <el-button :icon="Aim" size="small" @click="clearAllMerges" />
      </el-tooltip>
      <el-tooltip content="列模板" placement="bottom">
        <el-dropdown trigger="click" @command="onTplCommand">
          <el-button :icon="Files" size="small" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="save">保存当前为模板…</el-dropdown-item>
              <el-dropdown-item v-for="t in templates" :key="t.name" :command="'load:' + t.name">
                加载：{{ t.name }}
              </el-dropdown-item>
              <el-dropdown-item v-for="t in templates" :key="'del' + t.name" :command="'del:' + t.name" divided>
                删除模板：{{ t.name }}
              </el-dropdown-item>
              <el-dropdown-item v-if="!templates.length" disabled>暂无模板</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
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

    <!-- 导入 / 导出 -->
    <div class="tb-group">
      <el-tooltip content="导入 Excel" placement="bottom">
        <el-button :icon="Upload" size="small" @click="importExcel" />
      </el-tooltip>
      <el-tooltip content="导出" placement="bottom">
        <el-dropdown trigger="click" @command="onExportCommand">
          <el-button :icon="Download" size="small" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="excelAll">导出 Excel（全部）</el-dropdown-item>
              <el-dropdown-item command="excelResult">导出 Excel（当前结果）</el-dropdown-item>
              <el-dropdown-item command="csv">导出 CSV（当前结果）</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-tooltip>
    </div>
    <el-divider direction="vertical" />

    <!-- 数据操作 -->
    <div class="tb-group">
      <el-tooltip content="提交（mock）" placement="bottom">
        <el-button type="success" :icon="Select" size="small" :loading="submitting" @click="submit" />
      </el-tooltip>
      <el-tooltip content="删除空行（全部列为空）" placement="bottom">
        <el-button :icon="DocumentDelete" size="small" plain @click="removeEmptyRows" />
      </el-tooltip>
      <el-tooltip content="去重（整行相同只留首行）" placement="bottom">
        <el-button :icon="DocumentCopy" size="small" plain @click="removeDuplicateRows" />
      </el-tooltip>
      <el-tooltip content="清空全部数据" placement="bottom">
        <el-button :icon="Close" size="small" plain @click="clearAll" />
      </el-tooltip>
    </div>
    <el-divider direction="vertical" />

    <!-- 压测数据 -->
    <div class="tb-group gen">
      <el-tooltip content="预制数据（500 行）" placement="bottom">
        <el-button size="small" type="primary" :icon="Lightning" @click="presetData(500)" />
      </el-tooltip>
      <span class="gen-label">压测</span>
      <el-tooltip content="1 千行" placement="bottom">
        <el-button size="small" :icon="DataLine" @click="genData(1000)" />
      </el-tooltip>
      <el-tooltip content="1 万行" placement="bottom">
        <el-button size="small" :icon="DataLine" @click="genData(10000)" />
      </el-tooltip>
      <el-tooltip content="5 万行" placement="bottom">
        <el-button size="small" :icon="DataLine" @click="genData(50000)" />
      </el-tooltip>
      <el-tooltip content="10 万行" placement="bottom">
        <el-button size="small" :icon="DataLine" @click="genData(100000)" />
      </el-tooltip>
    </div>
    <el-divider direction="vertical" />

    <!-- 视图 / 汇总 / 格式 / 校验 -->
    <div class="tb-group">
      <el-radio-group v-model="viewMode" size="small">
        <el-radio-button value="virtual">虚拟滚动</el-radio-button>
        <el-radio-button value="paged">分页</el-radio-button>
      </el-radio-group>
      <el-tooltip content="列汇总" placement="bottom">
        <el-switch v-model="showFooter" size="small" inline-prompt active-text="汇" inactive-text="汇" />
      </el-tooltip>
      <el-tooltip content="条件格式（数值列数据条）" placement="bottom">
        <el-switch v-model="conditionalOn" size="small" inline-prompt active-text="格" inactive-text="格" />
      </el-tooltip>
      <el-tooltip :content="`校验面板 (${errorCount})`" placement="bottom">
        <el-button size="small" :icon="Warning" :disabled="!errorCount" @click="errDrawer = true" />
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
.gen-label {
  font-size: 12px;
  color: var(--dt-sub);
}
</style>
