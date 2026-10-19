<!-- 指标试算面板：勾选维度 → 查询 → 结果表格 -->
<template>
  <el-card class="metric-calc-panel" shadow="never">
    <template #header>
      <div class="panel-title">
        <span>指标试算</span>
        <span v-if="detail" class="panel-sub">按维度组合聚合 · {{ detail.name }}</span>
      </div>
    </template>

    <el-empty v-if="!detail" description="请先选择指标" />

    <template v-else>
      <div class="block-label">可用维度（可多选，不选则输出全量汇总）</div>
      <el-checkbox-group v-model="dims" class="dimension-group">
        <el-checkbox v-for="d in detail.dimensions" :key="d.key" :value="d.key" :label="d.label" border />
      </el-checkbox-group>

      <div class="toolbar">
        <span class="toolbar__label">统计区间</span>
        <el-date-picker
          v-model="range"
          type="monthrange"
          range-separator="至"
          start-placeholder="开始月份"
          end-placeholder="结束月份"
          value-format="YYYY-MM"
          class="range-picker"
        />
        <el-button type="primary" :loading="loading" @click="emit('query')">查询</el-button>
        <el-button @click="emit('reset')">重置</el-button>
      </div>

      <el-divider />

      <div v-if="result" class="result-head">
        <span>查询结果</span>
        <span class="result-meta">{{ result.rows.length }} 行 · 耗时 {{ result.elapsedMs }} ms（本地 mock）</span>
      </div>

      <el-table v-loading="loading" :data="result?.rows ?? []" border size="small" class="result-table">
        <el-table-column
          v-for="col in result?.columns ?? []"
          :key="col.key"
          :prop="col.key"
          :label="col.label"
          min-width="120"
        />
      </el-table>

      <el-empty v-if="!result" description="点击「查询」查看试算结果" :image-size="80" />
    </template>
  </el-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { MetricDetail, MetricQueryResult } from '../metric.api';

const props = defineProps<{
  detail: MetricDetail | null;
  selected: string[];
  dateRange: [string, string] | null;
  result: MetricQueryResult | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:selected', value: string[]): void;
  (e: 'update:dateRange', value: [string, string] | null): void;
  (e: 'query'): void;
  (e: 'reset'): void;
}>();

const dims = computed({
  get: () => props.selected,
  set: (v: string[]) => emit('update:selected', v),
});

const range = computed({
  get: () => props.dateRange,
  set: (v: [string, string] | null) => emit('update:dateRange', v),
});
</script>

<style lang="less" scoped>
.metric-calc-panel {
  :deep(.el-card__body) {
    padding: 16px;
  }
}

.panel-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-weight: 600;
}

.panel-sub {
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
}

.block-label {
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.dimension-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  :deep(.el-checkbox) {
    margin-right: 0;
  }
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
}

.toolbar__label {
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.range-picker {
  width: 280px;
}

.result-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
}

.result-meta {
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
}

.result-table {
  margin-top: 4px;
}
</style>
