<script setup lang="ts">
// 列配置抽屉（vxe 版适配层）
// ---------------------------------------------------------------------------
// UI 已抽到 components/bi-column-drawer（三套录入台共用，交互唯一定义处）：
// 右侧 440px 抽屉 + 草稿确定 + 固定分区。本文件只做「vxe 列定义 ⇄ 共享草稿」的映射，
// 不再自己写布局——否则三套又会各自漂移（此前 vtable-sheet 是居中弹窗、Univer 是全量列表）。
//
// 能力差异：vxe 列宽由表头拖拽 + 容器等比分配决定，故不开放「手填列宽」；
// 冻结与表头分组是 vxe 原生能力，照常开放。
import { computed } from 'vue';
import { ElMessage } from 'element-plus';
import BiColumnDrawer from '@/components/bi-column-drawer/bi-column-drawer.vue';
import type { ColumnDraft } from '@/components/bi-column-drawer/types';
import type { GridCore } from '../hooks/useGridCore';
import type { GridOps } from '../hooks/useGridOps';
import { DEFAULT_DATE_FORMAT } from '../types';

defineOptions({ name: 'ColumnConfigDrawer' });
const props = defineProps<{ core: GridCore; ops: GridOps; field: string; visible: boolean }>();
const emit = defineEmits<{ (e: 'update:visible', v: boolean): void }>();

const { columnDefs } = props.core;
const { removeCol, duplicateColumn } = props.ops;

const proxyVisible = computed({
  get: () => props.visible,
  set: (v: boolean) => emit('update:visible', v),
});

/** 真实列定义（响应式）：field 变化或被删除时自动失效，抽屉里会显示"列不存在" */
const realDef = computed(() => columnDefs.value.find((d) => d.field === props.field) ?? null);

/** 复制当前正在配置的这一列（深拷贝 → 插到原列之后，新列名带"副本"） */
const onDuplicate = () => {
  const def = realDef.value;
  if (!def) return;
  duplicateColumn(def.field);
};

/**
 * 确定：整体回写并只入一次撤销栈，随后全量重校让标记立即同步。
 * 草稿里 options/rules/cross 已由共享抽屉裁剪过（空值不落盘），这里直接赋值即可。
 */
const apply = (d: ColumnDraft) => {
  const def = realDef.value;
  if (!def) {
    return;
  }
  props.core.pushSnapshot(props.core.snapshotNow());
  def.label = d.label;
  def.type = d.type;
  def.required = !!d.required;
  def.visible = d.visible;
  def.frozen = !!d.frozen;
  def.options = d.type === 'select' ? d.options : undefined;
  def.dateFormat = d.dateFormat || DEFAULT_DATE_FORMAT;
  def.group = d.group;
  def.rules = d.rules;
  def.cross = d.cross?.length ? d.cross : undefined;
  props.core.revalidateAll();
  props.core.bumpData();
  ElMessage.success(`已更新列「${def.label}」`);
};

/** 删除该列（沿用 ops.removeCol：内部已入撤销栈并处理行/错误/筛选清理） */
const onRemove = () => {
  const def = realDef.value;
  if (!def) {
    return;
  }
  removeCol(def.field);
};
</script>

<template>
  <BiColumnDrawer
    v-model:visible="proxyVisible"
    :column="realDef"
    :siblings="columnDefs"
    :caps="{ frozen: true, group: true }"
    @confirm="apply"
    @remove="onRemove"
  />
  <!-- 复制列：在单列配置抽屉里对"当前列"一键复制（深拷贝 + 插到其后），不改动共享的 BiColumnDrawer -->
  <el-button
    v-if="visible && realDef"
    type="primary"
    class="dt-dup-col-btn"
    @click="onDuplicate"
  >⧉ 复制该列</el-button>
</template>

<style scoped>
/* 复制该列按钮：抽屉在屏幕右侧，按钮贴在抽屉左侧稍低处，避免遮挡抽屉底部的「取消/确定」 */
.dt-dup-col-btn {
  position: fixed;
  right: 470px;
  bottom: 24px;
  z-index: 3000;
}
</style>
