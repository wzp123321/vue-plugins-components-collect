<script setup lang="ts">
// 列设置抽屉（Univer 版 · 引擎薄壳）
// ---------------------------------------------------------------------------
// 视觉与交互全交给三套共用的 components/bi-column-manager，本文件只做「列定义 ⇄ 操作」映射。
//
// 分工不变：
//   · 本抽屉 = 列表级管理（增删移序显隐必填），入口在工具栏「列设置」；
//   · 单列配置抽屉 = components/bi-column-drawer（三套共用），入口是点列标或本列表的「配置」。
//
// ⚠️ 管理类开关用「点一下即生效」而非草稿：它们各自是一条独立命令，
//    用户预期是立刻看到表格变化；要整体编辑列定义时走「配置」里的草稿 + 确定。
// 能力开关：Univer 只支持冻结首列（不是任意列），所以不渲染冻结开关。
import type { ColDef, ColType } from '../schema';
import type { EntryOps } from '../useEntryOps';
import BiColumnManager from '@/components/bi-column-manager/bi-column-manager.vue';

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

const find = (field: string) => props.defs.find((d) => d.field === field);

const onRename = (field: string, label: string) => props.ops.updateColumn(field, { label });

const onRetype = (field: string, type: ColType) => props.ops.updateColumn(field, { type });

const onToggle = (field: string, flag: 'required' | 'visible' | 'frozen') => {
  const def = find(field);
  if (!def) {
    return;
  }
  if (flag === 'visible') {
    props.ops.toggleColumnVisible(field);
  } else if (flag === 'required') {
    props.ops.updateColumn(field, { required: !def.required });
  }
  // frozen 未开放（Univer 只支持冻结首列），caps.frozen=false 时不会触发
};

const onAdd = (payload: { label: string; type: ColType; required: boolean; options?: string[] }) => {
  props.ops.addColumn(payload);
};
</script>

<template>
  <BiColumnManager
    :visible="visible"
    :cols="defs"
    :caps="{ frozen: false, retype: true, add: true }"
    @update:visible="(v: boolean) => emit('update:visible', v)"
    @rename="onRename"
    @retype="onRetype"
    @toggle="onToggle"
    @add="onAdd"
    @move="(i: number, dir: -1 | 1) => ops.moveColumn(i, dir)"
    @config="(field: string) => emit('config', field)"
    @remove="(field: string) => ops.removeColumn(field)"
  />
</template>
