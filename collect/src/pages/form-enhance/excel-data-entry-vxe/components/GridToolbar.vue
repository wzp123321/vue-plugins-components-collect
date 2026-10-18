<script setup lang="ts">
// 顶部工具条：行操作 / 列与模板 / 撤销重做 / 搜索 / 导入导出 / 提交 / 压测数据 / 视图开关
// 状态与动作全部来自页面装配的 hooks，本组件只做展示与事件转发（纯 UI 层，不含业务判断）。
// 协作：props.core(校验/历史/视图) / props.ops(行与列操作) / props.tpl(模板) / props.demo(压测) / props.io(导入导出) / props.find(查找)
import { ArrowDown } from '@element-plus/icons-vue';
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
const { addRow, insertRow, deleteSelected, duplicateSelected, clearAll, selectionCount } = props.ops;
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
  <div class="dt-toolbar">
    <div class="tb-group">
      <el-button type="primary" @click="addRow">＋ 新增</el-button>
      <el-button @click="insertRow">⬇ 插入</el-button>
      <el-button type="danger" plain @click="deleteSelected" :disabled="!selectionCount">－ 删除选中行</el-button>
      <el-button @click="duplicateSelected" :disabled="!selectionCount">⧉ 复制选中行</el-button>
    </div>
    <el-divider direction="vertical" />
    <div class="tb-group">
      <el-button @click="openAddCol">＋ 列</el-button>
      <el-button @click="colDrawer = true">⚙ 列设置</el-button>
      <el-button @click="fillVisible = !fillVisible">▣ 批量填充</el-button>
      <el-dropdown trigger="click" @command="onTplCommand">
        <el-button>❖ 模板<el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button>
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
    </div>
    <el-divider direction="vertical" />
    <div class="tb-group">
      <el-button :disabled="!canUndo" @click="undo" title="Ctrl+Z">↶ 撤销</el-button>
      <el-button :disabled="!canRedo" @click="redo" title="Ctrl+Y">↷ 重做</el-button>
    </div>
    <el-divider direction="vertical" />
    <div class="tb-group">
      <el-input v-model="searchText" placeholder="全局搜索…" clearable style="width: 170px" />
      <el-button @click="findVisible = !findVisible" type="primary" plain title="Ctrl+F">🔍 查找替换</el-button>
    </div>
    <el-divider direction="vertical" />
    <div class="tb-group">
      <!-- ⚠️ 不做导入导出方向的新功能扩展，仅保留既有导入与三档导出 -->
      <el-button @click="importExcel">⬆ 导入</el-button>
      <el-dropdown @command="onExportCommand" trigger="click">
        <el-button>⬇ 导出<el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="excelAll">导出 Excel（全部）</el-dropdown-item>
            <el-dropdown-item command="excelResult">导出 Excel（当前结果）</el-dropdown-item>
            <el-dropdown-item command="csv">导出 CSV（当前结果）</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-divider direction="vertical" />
    <div class="tb-group">
      <el-button type="success" @click="submit" :loading="submitting">💾 提交</el-button>
      <el-button @click="removeEmptyRows" plain title="删除所有列都为空的整行">删空行</el-button>
      <el-button @click="removeDuplicateRows" plain title="整行完全相同只保留首行">去重</el-button>
      <el-button @click="clearAll" plain>清空</el-button>
    </div>
    <el-divider direction="vertical" />
    <div class="tb-group gen">
      <el-button size="small" type="primary" @click="presetData(500)">预制数据</el-button>
      <span class="gen-label">压测：</span>
      <!-- 压测数据量级参数（行数）直接透传给 useGridDemoData.genData -->
      <el-button size="small" @click="genData(1000)">1千</el-button>
      <el-button size="small" @click="genData(10000)">1万</el-button>
      <el-button size="small" @click="genData(50000)">5万</el-button>
      <el-button size="small" @click="genData(100000)">10万</el-button>
    </div>
    <el-divider direction="vertical" />
    <div class="tb-group">
      <el-radio-group v-model="viewMode" size="small">
        <el-radio-button value="virtual">虚拟滚动</el-radio-button>
        <el-radio-button value="paged">分页</el-radio-button>
      </el-radio-group>
      <!-- 列汇总开关 / 条件格式（数值列数据条）开关，直接绑定 core 状态 -->
      <el-switch v-model="showFooter" size="small" inline-prompt active-text="汇总" inactive-text="汇总" title="列汇总" />
      <el-switch v-model="conditionalOn" size="small" inline-prompt active-text="格式" inactive-text="格式" title="条件格式（数值列数据条）" />
      <el-button size="small" @click="errDrawer = true" :disabled="!errorCount">
        校验面板 ({{ errorCount }})
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.dt-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  background: var(--dt-panel);
  border: 1px solid var(--dt-border);
  border-radius: 10px;
  padding: 8px 10px;
  margin-bottom: 10px;
  box-shadow: var(--dt-shadow);
}
.tb-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
.gen-label {
  font-size: 12px;
  color: var(--dt-sub);
}
</style>
