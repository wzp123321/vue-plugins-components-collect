<script setup lang="ts">
// 列筛选面板（vxe 自定义筛选渲染器 dt-filter，见 cells/index.ts 注册）
// 动机：vxe 原生筛选只支持"候选值复选"，文本/数字/日期列没有筛选入口。这里统一接管：
//   - 下拉列：按 options 多选（与原行为一致）；
//   - 文本/日期：按包含匹配，可写表达式（>= / <= / > / < / != / a..b）；
//   - 数字：默认精确匹配，可写比较表达式。
// 值的流向：面板把选择结果同步到 column.filters（含 _checked），vxe 底部"确定"读取它并 emit filter-change
// → core.columnFilters；面板初值从 RT.filters（= core.columnFilters 的引用）回显，
// 避免列配置重建后 vxe 的 column.filters 被重置、导致再次点确定时把筛选静默清空。
import { computed, ref, watch } from 'vue';
import { RT } from './runtime';

defineOptions({ name: 'DtFilterPanel' });

const props = defineProps<{ column: any }>();

// 列类型来自 buildColumns 写入的 cellRender.ctype（vxe 的 ColumnInfo 会原样保留 cellRender）
const ctype = computed(() => props.column?.cellRender?.ctype as string | undefined);
const isSelect = computed(() => ctype.value === 'select');
const options = computed<string[]>(() => props.column?.cellRender?.options ?? []);

const text = ref('');
const picked = ref<string[]>([]);

/** 该列当前生效的筛选值（RT.filters 就是 core.columnFilters 的引用） */
const currentValues = (): string[] => {
  const f = props.column?.field;
  return (f && RT.filters[f]) || [];
};

/** 用当前生效的筛选值回显面板（每次打开/换列时执行） */
const initFromCore = () => {
  const vals = currentValues();
  if (isSelect.value) picked.value = options.value.filter((o) => vals.includes(o));
  else text.value = vals[0] ?? '';
};
watch(() => props.column?.id, initFromCore, { immediate: true });

/**
 * 把面板状态写回 column.filters：vxe 的"确定"会先把 _checked 同步成 checked，再收集 value 发 filter-change。
 * 非下拉列用一条 value=表达式 的选项承载。
 */
const syncToColumn = () => {
  const col = props.column;
  if (!col) return;
  if (isSelect.value) {
    const list = col.filters ?? [];
    list.forEach((f: any) => {
      const on = picked.value.includes(f.value);
      f.checked = on;
      f._checked = on;
    });
  } else {
    const v = text.value.trim();
    col.filters = v ? [{ label: v, value: v, checked: true, _checked: true }] : [];
  }
};
watch([text, picked], syncToColumn, { deep: true, immediate: true });
</script>

<template>
  <div class="dt-filter-panel">
    <template v-if="isSelect">
      <el-checkbox-group v-model="picked" class="dt-filter-options">
        <el-checkbox v-for="o in options" :key="o" :value="o">{{ o }}</el-checkbox>
      </el-checkbox-group>
      <div v-if="!options.length" class="dt-filter-hint">该列没有可选项</div>
    </template>
    <template v-else>
      <el-input v-model="text" size="small" clearable placeholder="筛选值或表达式" />
      <div class="dt-filter-hint">
        文本/日期按包含匹配；数字精确匹配。支持
        <code>&gt;=30</code> <code>&lt;=2024-12-31</code> <code>2024-01..2024-06</code>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* 面板挂在 vxe 的筛选弹层里（脱离 .dt-page，且 vxe 未接暗色主题），故用固定浅色面板配色而非主题变量 */
.dt-filter-panel {
  width: 212px;
  padding: 2px 4px;
  color: #1f2329;
}
.dt-filter-options {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 220px;
  overflow: auto;
}
.dt-filter-hint {
  margin-top: 6px;
  font-size: 11.5px;
  line-height: 1.6;
  color: #8a909c;
}
.dt-filter-hint code {
  background: #f5f6f8;
  border: 1px solid #e6e8ee;
  border-radius: 4px;
  padding: 0 3px;
  font-size: 11px;
}
</style>
