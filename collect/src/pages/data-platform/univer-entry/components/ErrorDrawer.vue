<script setup lang="ts">
// 校验抽屉：列出全部错误（行首值 + 列名 + 提示），点击跳转到对应单元格
// 与 vxe 版 ErrorDrawer 等价；差别是跳转后由 Univer 自己滚动 + 激活，不再手写滚动重试。
//
// ⚠️ 当前页面**不再引用本组件**：录入台已改为行级校验（行内有值即校验，错误只用红框标出，不弹面板），
//    保存时也只在底部提示条给一句汇总。文件保留只为后续需要"错误清单"时能直接接回（props 未变）。
import type { CellError, EntryRules } from '../useEntryRules';

defineOptions({ name: 'ErrorDrawer' });

const props = defineProps<{
  visible: boolean;
  errors: CellError[];
  rules: EntryRules;
}>();

const emit = defineEmits<{ (e: 'update:visible', v: boolean): void }>();

const jump = (err: CellError) => {
  props.rules.jumpTo(err);
  emit('update:visible', false);
};
</script>

<template>
  <el-drawer
    :model-value="visible"
    :title="`校验面板（${errors.length}）`"
    size="420px"
    class="ue-dlg"
    @update:model-value="(v: boolean) => emit('update:visible', v)"
  >
    <div v-if="!errors.length" class="ed-empty">没有校验错误</div>
    <div v-else class="ed-list">
      <div v-for="(e, i) in errors" :key="`${e.sheetRow}-${e.field}-${i}`" class="ed-item" @click="jump(e)">
        <span class="ed-pos">第 {{ e.dataIndex + 1 }} 行 · {{ e.label }}</span>
        <span class="ed-row">{{ e.rowLabel || '（空行）' }}</span>
        <span class="ed-msg">{{ e.msg }}</span>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
.ed-empty {
  padding: 24px 0;
  text-align: center;
  color: var(--ue-sub);
  font-size: 13px;
}
.ed-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ed-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border: 1px solid var(--ue-border);
  border-left: 3px solid #d93025;
  border-radius: 8px;
  cursor: pointer;
  background: var(--ue-panel);
  transition: background 0.15s ease;
}
.ed-item:hover {
  background: var(--ue-hover);
}
.ed-pos {
  font-size: 12px;
  color: var(--ue-sub);
  font-variant-numeric: tabular-nums;
}
.ed-row {
  font-size: 13px;
  font-weight: 600;
  color: var(--ue-text);
}
.ed-msg {
  font-size: 12px;
  color: #d93025;
}
</style>
