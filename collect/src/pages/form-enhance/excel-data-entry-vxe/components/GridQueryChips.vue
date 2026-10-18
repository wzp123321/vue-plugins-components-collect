<script setup lang="ts">
// 查询态可视化条：把"关键词 / 排序 / 筛选"这类隐式状态显式列出来，并可逐项清除。
// 动机：remote 排序筛选改了表格内容却不改任何可见 UI，用户容易误判"数据丢了"。
// 本组件只读取 useGridCore 的查询状态并渲染成可关闭的 chip；清除动作回调由父级（主组件）提供。
// 协作：props.core(GridCore)→searchText/sortList/columnFilters；props.onClearFilter/onClearSort/onClearAll(主组件接线)
import { computed } from 'vue';
import type { GridCore } from '../hooks/useGridCore';

defineOptions({ name: 'GridQueryChips' });
const props = defineProps<{
  core: GridCore;
  onClearFilter: (field: string, value?: string) => void;
  onClearSort: (field?: string) => void;
  onClearAll: () => void;
}>();

// 读 core 暴露的查询状态（均为响应式）
const { searchText, sortList, columnFilters } = props.core;

// 'asc'/'desc' 转中文：排序 chip 展示用
const orderText = (o: string) => (o === 'asc' ? '升序' : '降序');

// 把 columnFilters（{field: string[]}）拍平成可渲染的 chip 列表（每值一项）
const filterChips = computed(() =>
  Object.entries(columnFilters).flatMap(([f, vals]) => (vals ?? []).map((v) => ({ field: f, value: v }))),
);
// 排序 chip 直接取 sortList 快照（slice 避免直接引用响应式数组）
const sortChips = computed(() => sortList.value.slice());
// 是否存在任何查询态：决定整个 chips 条是否渲染
const hasAny = computed(() => !!searchText.value || filterChips.value.length > 0 || sortChips.value.length > 0);
</script>

<template>
  <!-- 仅在存在查询态时显示，把"隐式"查询条件显式化 -->
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
