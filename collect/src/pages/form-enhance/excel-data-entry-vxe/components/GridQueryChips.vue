<script setup lang="ts">
// 查询态可视化条：把"关键词 / 排序 / 筛选"这类隐式状态显式列出来，并可逐项清除。
// 动机：remote 排序筛选改了表格内容却不改任何可见 UI，用户容易误判"数据丢了"。
import { computed } from 'vue';
import type { GridCore } from '../hooks/useGridCore';

defineOptions({ name: 'GridQueryChips' });
const props = defineProps<{
  core: GridCore;
  onClearFilter: (field: string, value?: string) => void;
  onClearSort: (field?: string) => void;
  onClearAll: () => void;
}>();

const { searchText, sortList, columnFilters } = props.core;

const orderText = (o: string) => (o === 'asc' ? '升序' : '降序');

const filterChips = computed(() =>
  Object.entries(columnFilters).flatMap(([f, vals]) => (vals ?? []).map((v) => ({ field: f, value: v }))),
);
const sortChips = computed(() => sortList.value.slice());
const hasAny = computed(() => !!searchText.value || filterChips.value.length > 0 || sortChips.value.length > 0);
</script>

<template>
  <div v-if="hasAny" class="dt-chips">
    <span class="chips-label">查询条件</span>
    <el-tag v-if="searchText" closable type="primary" effect="light" size="small" @close="searchText = ''">
      关键词：{{ searchText }}
    </el-tag>
    <el-tag
      v-for="c in sortChips"
      :key="'s' + c.field"
      closable
      type="warning"
      effect="light"
      size="small"
      @close="onClearSort(c.field)"
    >
      排序：{{ core.labelOf(c.field) }} {{ orderText(c.order) }}
    </el-tag>
    <el-tag
      v-for="c in filterChips"
      :key="'f' + c.field + c.value"
      closable
      type="success"
      effect="light"
      size="small"
      @close="onClearFilter(c.field, c.value)"
    >
      {{ core.labelOf(c.field) }} = {{ c.value }}
    </el-tag>
    <el-button size="small" text type="danger" @click="onClearAll">清除全部</el-button>
  </div>
</template>

<style scoped>
.dt-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 6px 10px;
  margin-bottom: 8px;
  border: 1px dashed var(--dt-border);
  border-radius: 8px;
  background: var(--dt-hover);
}
.chips-label {
  font-size: 12px;
  color: var(--dt-sub);
  margin-right: 2px;
}
</style>
