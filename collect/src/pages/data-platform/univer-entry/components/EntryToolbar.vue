<script setup lang="ts">
// 顶部工具条（纯 UI 层）：把页面装配好的 composables 动作挂到按钮上，不做业务判断。
// 与 vxe 版工具的对应关系在按钮 tooltip 里标注，便于横向对照两套实现的能力差异。
import {
  Plus,
  ArrowUpBold,
  Delete,
  CopyDocument,
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
  QuestionFilled,
} from '@element-plus/icons-vue';
import type { EntryOps } from '../useEntryOps';
import type { EntryIO } from '../useEntryIO';
import type { EntryFind } from '../useEntryFind';
import type { EntryRules } from '../useEntryRules';

defineOptions({ name: 'EntryToolbar' });

const props = defineProps<{
  ops: EntryOps;
  io: EntryIO;
  find: EntryFind;
  rules: EntryRules;
  conditionalOn: boolean;
  freezeFirst: boolean;
  submitting: boolean;
  mergeCount: number;
}>();

const emit = defineEmits<{
  (e: 'toggle-cond'): void;
  (e: 'toggle-freeze'): void;
  (e: 'open-columns'): void;
  (e: 'open-fill'): void;
  (e: 'open-errors'): void;
  (e: 'gen-data', n: number): void;
  (e: 'undo'): void;
  (e: 'redo'): void;
  (e: 'merge'): void;
  (e: 'clear-merges'): void;
  (e: 'open-help'): void;
}>();

const { addRow, insertRowAbove, deleteSelectedRows, duplicateSelectedRows, clearAll } = props.ops;
const { removeEmptyRows, removeDuplicateRows, saveTemplate, loadTemplate, deleteTemplate, templates } = props.ops;
const { importExcel, onExportCommand } = props.io;
const { open: openFind, quickSearch, findText: quickText, hitCount } = props.find;
const { submit } = props.ops;

/** 模板下拉命令分发：save / load:<name> / del:<name> */
const onTplCommand = (cmd: string) => {
  if (cmd === 'save') {
    saveTemplate();
    return;
  }
  if (cmd.startsWith('load:')) {
    loadTemplate(cmd.slice(5));
    return;
  }
  if (cmd.startsWith('del:')) deleteTemplate(cmd.slice(4));
};
</script>

<template>
  <div class="ue-toolbar bi-toolbar">
    <div class="tb-group">
      <el-tooltip content="新增行" placement="bottom">
        <el-button :icon="Plus" size="small" @click="addRow" />
      </el-tooltip>
      <el-tooltip content="在活动行上方插入" placement="bottom">
        <el-button :icon="ArrowUpBold" size="small" @click="insertRowAbove" />
      </el-tooltip>
      <el-tooltip content="删除选中行" placement="bottom">
        <el-button type="danger" plain :icon="Delete" size="small" @click="deleteSelectedRows" />
      </el-tooltip>
      <el-tooltip content="复制选中行" placement="bottom">
        <el-button :icon="CopyDocument" size="small" @click="duplicateSelectedRows" />
      </el-tooltip>
    </div>
    <el-divider direction="vertical" />

    <div class="tb-group">
      <el-tooltip content="新增列 / 列设置（改名 · 类型 · 校验规则 · 显隐 · 宽度 · 移序）" placement="bottom">
        <el-button :icon="Setting" size="small" @click="emit('open-columns')" />
      </el-tooltip>
      <el-tooltip content="批量填充" placement="bottom">
        <el-button :icon="Operation" size="small" @click="emit('open-fill')" />
      </el-tooltip>
      <el-tooltip content="列结构模板（存 / 取 / 删）" placement="bottom">
        <el-dropdown trigger="click" @command="onTplCommand">
          <el-button :icon="Files" size="small" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="save">保存当前列为模板…</el-dropdown-item>
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

    <div class="tb-group">
      <el-tooltip content="撤销 (Ctrl+Z)" placement="bottom">
        <el-button :icon="RefreshLeft" size="small" @click="emit('undo')" />
      </el-tooltip>
      <el-tooltip content="重做 (Ctrl+Y / Ctrl+Shift+Z)" placement="bottom">
        <el-button :icon="RefreshRight" size="small" @click="emit('redo')" />
      </el-tooltip>
    </div>
    <el-divider direction="vertical" />

    <div class="tb-group">
      <el-input
        :model-value="quickText"
        placeholder="全局搜索（标黄）…"
        clearable
        :prefix-icon="Search"
        size="small"
        class="tb-search"
        @update:model-value="quickSearch"
      />
      <span v-if="quickText.trim()" class="tb-hint">{{ hitCount }} 命中</span>
      <el-tooltip content="查找替换 (Ctrl+F)：逐项跳转 + 替换" placement="bottom">
        <el-button :icon="EditPen" size="small" type="primary" plain @click="openFind" />
      </el-tooltip>
    </div>
    <el-divider direction="vertical" />

    <div class="tb-group">
      <el-tooltip content="合并选区（仅数据区，表头不可合并）" placement="bottom">
        <el-button :icon="FullScreen" size="small" @click="emit('merge')" />
      </el-tooltip>
      <el-tooltip :content="`取消合并（当前 ${mergeCount} 处）`" placement="bottom">
        <el-button :icon="Aim" size="small" :disabled="!mergeCount" @click="emit('clear-merges')" />
      </el-tooltip>
    </div>
    <el-divider direction="vertical" />

    <div class="tb-group">
      <el-tooltip content="导入 Excel（覆盖当前数据）" placement="bottom">
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

    <div class="tb-group">
      <el-tooltip content="提交（先本地校验，再 mock 服务端校验）" placement="bottom">
        <el-button type="success" :icon="Select" size="small" :loading="submitting" @click="submit" />
      </el-tooltip>
      <el-tooltip content="删除空行（所有列都为空）" placement="bottom">
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

    <div class="tb-group gen">
      <el-tooltip content="预制数据（500 行）" placement="bottom">
        <el-button size="small" type="primary" :icon="Lightning" @click="emit('gen-data', 500)" />
      </el-tooltip>
      <span class="gen-label">压测</span>
      <el-tooltip content="1 千行" placement="bottom">
        <el-button size="small" :icon="DataLine" @click="emit('gen-data', 1000)" />
      </el-tooltip>
      <el-tooltip content="5 千行" placement="bottom">
        <el-button size="small" :icon="DataLine" @click="emit('gen-data', 5000)" />
      </el-tooltip>
      <el-tooltip content="1 万行" placement="bottom">
        <el-button size="small" :icon="DataLine" @click="emit('gen-data', 10000)" />
      </el-tooltip>
    </div>
    <el-divider direction="vertical" />

    <div class="tb-group">
      <el-tooltip content="条件格式：数值列数据条" placement="bottom">
        <el-switch
          :model-value="conditionalOn"
          size="small"
          inline-prompt
          active-text="条"
          inactive-text="条"
          @update:model-value="emit('toggle-cond')"
        />
      </el-tooltip>
      <el-tooltip content="冻结首列（表头行恒冻结）" placement="bottom">
        <el-switch
          :model-value="freezeFirst"
          size="small"
          inline-prompt
          active-text="冻"
          inactive-text="冻"
          @update:model-value="emit('toggle-freeze')"
        />
      </el-tooltip>
      <el-tooltip :content="`校验面板（${rules.errorCount.value}）`" placement="bottom">
        <el-button size="small" :icon="Warning" :disabled="!rules.errorCount.value" @click="emit('open-errors')" />
      </el-tooltip>
      <el-tooltip content="操作与快捷键帮助 (F1)" placement="bottom">
        <el-button size="small" :icon="QuestionFilled" plain @click="emit('open-help')" />
      </el-tooltip>
    </div>
  </div>
</template>

<style scoped>
/* 骨架（横条 / 边框 / 圆角 / 分组间距）见全局 .bi-toolbar，此处只留 vxe 专有部分 */
.gen-label {
  font-size: 12px;
  color: var(--ue-sub);
}
.tb-search {
  width: 168px;
}
.tb-hint {
  font-size: 12px;
  color: var(--ue-sub);
  white-space: nowrap;
}
</style>
