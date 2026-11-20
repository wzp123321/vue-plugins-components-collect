<!--
  复杂表头（三级表头 + 合并单元格）
  ============================================================================
  对齐 FineReport 普通报表里典型的「季度 → 月份 → 电量/同比」多级表头。
  纯 table + rowspan/colspan 实现，不依赖设计器，重点在表头层级与合计对齐。
-->
<template>
  <div class="complex-report">
    <table class="complex-table">
      <thead>
        <tr>
          <th rowspan="3" class="is-stub">园区</th>
          <th colspan="6" class="is-group">2026 年第三季度</th>
          <th rowspan="3" class="is-total">季度合计 (kWh)</th>
        </tr>
        <tr>
          <th v-for="month in MONTHS" :key="month" colspan="2" class="is-group">{{ month }}</th>
        </tr>
        <tr>
          <template v-for="month in MONTHS" :key="month">
            <th class="is-sub" :title="`${month} 售电量`">售电量 (kWh)</th>
            <th class="is-sub" :title="`${month} 同比`">同比</th>
          </template>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in COMPLEX_ROWS" :key="row.park">
          <th class="is-stub">{{ row.park }}</th>
          <template v-for="cell in row.cells" :key="cell.month">
            <td>{{ fmtKwh(cell.kwh) }}</td>
            <td :class="cell.yoy > 0 ? 'is-up' : 'is-down'">{{ fmtPct(cell.yoy) }}</td>
          </template>
          <td class="is-total">{{ fmtKwh(row.quarter) }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th class="is-stub">合计</th>
          <template v-for="item in monthTotals" :key="item.month">
            <td>{{ fmtKwh(item.kwh) }}</td>
            <td :class="item.yoy > 0 ? 'is-up' : 'is-down'">{{ fmtPct(item.yoy) }}</td>
          </template>
          <td class="is-total">{{ fmtKwh(grandTotal) }}</td>
        </tr>
      </tfoot>
    </table>
    <p class="complex-report__note">
      表头三层合并：季度 → 月份 → 指标；同比按该月全部明细行的算术平均计算（演示口径）
    </p>
  </div>
</template>

<script lang="ts" setup>
import { COMPLEX_ROWS, MONTHS, fmtKwh, fmtPct } from '../mock';

defineOptions({ name: 'ComplexHeaderReport' });

const monthTotals = MONTHS.map((month, i) => {
  const cells = COMPLEX_ROWS.map((row) => row.cells[i]);
  const kwh = cells.reduce((acc, c) => acc + (c?.kwh ?? 0), 0);
  const yoy = cells.length ? cells.reduce((acc, c) => acc + (c?.yoy ?? 0), 0) / cells.length : 0;
  return { month, kwh, yoy };
});

const grandTotal = monthTotals.reduce((acc, item) => acc + item.kwh, 0);
</script>

<style lang="less" scoped>
.complex-report {
  &__note {
    margin: 10px 0 0;
    font-size: 12px;
    color: var(--ai-text-mute);
  }
}

.complex-table {
  width: 100%;
  font-size: 13px;
  color: var(--ai-text-dim);
  border-collapse: separate;
  border-spacing: 0;

  th,
  td {
    padding: 8px 12px;
    text-align: right;
    white-space: nowrap;
    border-right: 1px solid var(--ai-hairline);
    border-bottom: 1px solid var(--ai-hairline);

    &:last-child {
      border-right: 0;
    }
  }

  thead th {
    font-weight: 600;
    color: var(--ai-text);
    text-align: center;
    background: var(--ai-surface-hover);
  }

  .is-group {
    background: var(--ai-surface-active);
  }

  .is-sub {
    font-weight: 500;
    color: var(--ai-text-dim);
    background: transparent;
  }

  .is-stub {
    text-align: left;
    color: var(--ai-text);
  }

  tbody tr:hover td {
    background: var(--ai-surface-hover);
  }

  .is-total {
    font-weight: 600;
    color: var(--ai-text);
    background: var(--ai-surface-raised);
  }

  tfoot td,
  tfoot th {
    font-weight: 600;
    color: var(--ai-text);
    border-bottom: 0;
  }

  .is-up {
    color: #ff5a3c;
  }

  .is-down {
    color: #38d39f;
  }
}
</style>
