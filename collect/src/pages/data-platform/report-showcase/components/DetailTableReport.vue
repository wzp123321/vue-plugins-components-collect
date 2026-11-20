<!--
  明细表（分页 + 排序 + 表头冻结 + 合计行）
  ============================================================================
  用 el-table 承载：列宽固定、表头随滚动固定、末行自动合计（show-summary）。
  排序走 sort-change 全量排序后再切页，避免只排当前页。
-->
<template>
  <div class="detail-report">
    <el-table
      :data="pageRows"
      size="small"
      height="330"
      :show-summary="true"
      :summary-method="summaryMethod"
      @sort-change="onSortChange"
    >
      <el-table-column prop="month" label="月份" width="110" />
      <el-table-column prop="park" label="园区" width="110" />
      <el-table-column prop="transformer" label="台区" width="100" />
      <el-table-column prop="energyType" label="用电类型" width="110" />
      <el-table-column prop="kwh" label="售电量 (kWh)" min-width="130" align="right" sortable="custom">
        <template #default="{ row }">{{ fmtKwh(row.kwh) }}</template>
      </el-table-column>
      <el-table-column prop="yoy" label="同比" width="100" align="right" sortable="custom">
        <template #default="{ row }">
          <span :class="row.yoy > 0 ? 'is-up' : 'is-down'">{{ fmtPct(row.yoy) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="detail-report__foot">
      <span class="detail-report__hint">共 {{ sortedRows.length }} 条 · 点击「售电量 / 同比」列头排序</span>
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="PAGE_SIZE"
        :total="sortedRows.length"
        layout="prev, pager, next"
        small
        background
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { DETAIL_ROWS, fmtKwh, fmtPct, type DetailRow } from '../mock';

defineOptions({ name: 'DetailTableReport' });

const PAGE_SIZE = 8;
const currentPage = ref(1);
const sortProp = ref<'' | 'kwh' | 'yoy'>('');
const sortOrder = ref<'' | 'ascending' | 'descending'>('');

const sortedRows = computed<DetailRow[]>(() => {
  if (!sortProp.value || !sortOrder.value) return DETAIL_ROWS;
  const factor = sortOrder.value === 'ascending' ? 1 : -1;
  const key = sortProp.value;
  return [...DETAIL_ROWS].sort((a, b) => (a[key] - b[key]) * factor);
});

const pageRows = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return sortedRows.value.slice(start, start + PAGE_SIZE);
});

const onSortChange = ({ prop, order }: { prop: string; order: 'ascending' | 'descending' | null }) => {
  sortProp.value = order ? (prop as 'kwh' | 'yoy') : '';
  sortOrder.value = order ?? '';
  currentPage.value = 1;
};

/** 合计行：只对数值列求和，其余保持空白 */
const summaryMethod = ({ columns }: { columns: { property?: string }[] }) =>
  columns.map((column, index) => {
    if (index === 0) return '本页合计';
    if (column.property === 'kwh') {
      return fmtKwh(pageRows.value.reduce((acc, row) => acc + row.kwh, 0));
    }
    return '';
  });
</script>

<style lang="less" scoped>
.detail-report {
  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
  }

  &__hint {
    font-size: 12px;
    color: var(--ai-text-mute);
  }

  :deep(.el-table) {
    font-size: 13px;
  }

  :deep(.el-table__footer-wrapper td) {
    font-weight: 600;
  }

  .is-up {
    color: #ff5a3c;
  }

  .is-down {
    color: #38d39f;
  }
}
</style>
