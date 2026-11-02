<script setup lang="ts">
// 列设置抽屉（Univer 版 · 全量管理）：新增列 / 移序 / 显隐 / 必填 / 删除 + 逐列「配置」入口
// ---------------------------------------------------------------------------
// 与另两套的分工完全一致：
//   · 本抽屉 = 列表级管理（增删移序显隐），入口在工具栏「列设置」；
//   · 单列配置抽屉 = components/bi-column-drawer（三套共用），入口是点列标或本列表的「配置」。
// 这里不再内联规则/列宽编辑——那会变成第二套"改列定义"的 UI，跟共享抽屉两处漂移
// （此前正是这么漂的：Univer 内联折叠表单、vxe 有独立规则弹窗、VTable 是居中弹窗）。
//
// ⚠️ 管理类开关用 @update（点一下即生效）而非草稿：它们各自是一条独立命令，
//    用户预期是"立刻看到表格变化"；要整体编辑列定义时走「配置」里的草稿 + 确定。
import { computed, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import type { ColDef, ColType } from '../schema';
import { typeLabel } from '../schema';
import type { EntryOps } from '../useEntryOps';

defineOptions({ name: 'ColumnDrawer' });

const props = defineProps<{
  visible: boolean;
  defs: ColDef[];
  ops: EntryOps;
}>();

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void;
  /** 请求打开单列配置（页面挂共享抽屉） */
  (e: 'config', field: string): void;
}>();

const types: ColType[] = ['text', 'number', 'select', 'date'];

/** 新增列表单 */
const addForm = reactive({ label: '', type: 'text' as ColType, options: '', required: false });

const close = () => emit('update:visible', false);

const onAdd = () => {
  const label = addForm.label.trim();
  if (!label) {
    ElMessage.warning('请输入列名');
    return;
  }
  const options = addForm.type === 'select' ? addForm.options.split(/[,，]/).map((s) => s.trim()).filter(Boolean) : undefined;
  if (addForm.type === 'select' && !options?.length) {
    ElMessage.warning('下拉列至少填一个选项（用逗号分隔）');
    return;
  }
  props.ops.addColumn({ label, type: addForm.type, options, required: addForm.required });
  addForm.label = '';
  addForm.options = '';
  addForm.required = false;
};

/** 已隐藏列数：提示用户"隐藏列仍在，只是不显示"，避免以为数据丢了 */
const hiddenCount = computed(() => props.defs.filter((d) => !d.visible).length);
</script>

<template>
  <el-drawer :model-value="visible" title="列设置" size="520px" class="ue-dlg" @close="close" @update:model-value="(v: boolean) => emit('update:visible', v)">
    <div class="cd-add">
      <div class="cd-add-title">新增列</div>
      <div class="cd-add-row">
        <el-input v-model="addForm.label" placeholder="列名" size="small" style="width: 130px" />
        <el-select v-model="addForm.type" size="small" style="width: 96px">
          <el-option v-for="t in types" :key="t" :label="typeLabel[t]" :value="t" />
        </el-select>
        <el-checkbox v-model="addForm.required" size="small">必填</el-checkbox>
        <el-button size="small" type="primary" @click="onAdd">添加</el-button>
      </div>
      <el-input
        v-if="addForm.type === 'select'"
        v-model="addForm.options"
        placeholder="下拉选项，用逗号分隔，如：在职,试用期,离职"
        size="small"
        style="margin-top: 6px"
      />
    </div>

    <div class="cd-tip">点「配置」编辑该列的类型专属项与校验规则；开关类改动即时生效。</div>

    <div class="cd-list">
      <div v-for="(d, i) in defs" :key="d.field" class="cd-item" :class="{ 'is-hidden': !d.visible }">
        <div class="cd-item-head">
          <span class="cd-index">{{ i + 1 }}</span>
          <el-input
            :model-value="d.label"
            size="small"
            class="cd-name"
            @change="(v: string) => ops.updateColumn(d.field, { label: v })"
          />
          <el-select
            :model-value="d.type"
            size="small"
            class="cd-type"
            @change="(v: ColType) => ops.updateColumn(d.field, { type: v })"
          >
            <el-option v-for="t in types" :key="t" :label="typeLabel[t]" :value="t" />
          </el-select>
          <el-tooltip content="必填" placement="top">
            <el-switch
              :model-value="d.required"
              size="small"
              inline-prompt
              active-text="必"
              inactive-text="选"
              @update:model-value="(v: boolean | string | number) => ops.updateColumn(d.field, { required: Boolean(v) })"
            />
          </el-tooltip>
          <el-tooltip content="显示 / 隐藏" placement="top">
            <el-switch
              :model-value="d.visible"
              size="small"
              inline-prompt
              active-text="显"
              inactive-text="隐"
              @update:model-value="() => ops.toggleColumnVisible(d.field)"
            />
          </el-tooltip>
          <div class="cd-item-actions">
            <el-button size="small" text :disabled="i === 0" title="上移" @click="ops.moveColumn(i, -1)">←</el-button>
            <el-button size="small" text :disabled="i === defs.length - 1" title="下移" @click="ops.moveColumn(i, 1)">→</el-button>
            <el-button size="small" text type="primary" @click="emit('config', d.field)">配置</el-button>
            <el-button size="small" text type="danger" title="删除该列" @click="ops.removeColumn(d.field)">删</el-button>
          </div>
        </div>
        <div class="cd-item-meta">
          <el-tag v-if="d.rules || d.cross" size="small" type="warning" effect="plain">已配校验</el-tag>
          <el-tag v-if="!d.visible" size="small" type="info" effect="plain">已隐藏</el-tag>
        </div>
      </div>
    </div>

    <div v-if="hiddenCount" class="cd-hint">有 {{ hiddenCount }} 列处于隐藏状态：数据仍在，导出会按可见列输出。</div>
  </el-drawer>
</template>

<style scoped>
.cd-add {
  border: 1px solid var(--ue-border);
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 12px;
  background: var(--ue-panel);
}
.cd-add-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}
.cd-add-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cd-tip,
.cd-hint {
  font-size: 12px;
  color: var(--ue-sub);
  margin-bottom: 8px;
}
.cd-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cd-item {
  border: 1px solid var(--ue-border);
  border-radius: 10px;
  padding: 8px 10px;
  background: var(--ue-panel);
}
.cd-item.is-hidden {
  opacity: 0.72;
}
.cd-item-head {
  display: flex;
  align-items: center;
  gap: 6px;
}
.cd-name {
  flex: 1 1 auto;
  min-width: 76px;
}
.cd-type {
  flex: 0 0 auto;
  width: 76px;
}
.cd-item-meta {
  display: flex;
  gap: 6px;
  margin-top: 6px;
  padding-left: 26px;
}
.cd-index {
  width: 18px;
  color: var(--ue-sub);
  font-variant-numeric: tabular-nums;
}
.cd-item-actions {
  margin-left: auto;
  display: flex;
  gap: 2px;
}
</style>
