<!--
  交叉表（行 = 园区，列 = 月份）
  ============================================================================
  对齐帆软「交叉表」的展示形态：行表头 / 列表头 / 行列合计 / 总计 + 条件格式色阶。
  色阶用 color-mix 叠加 accent 令牌，随主题自动适配。
-->
<template>
  <div class="cross-report">
    <div class="cross-report__scroll">
      <table class="cross-table">
        <thead>
          <tr>
            <th class="is-stub">园区 ＼ 月份</th>
            <th v-for="col in CROSS_TABLE.columns" :key="col">{{ col }}</th>
            <th class="is-total">合计</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in CROSS_TABLE.rows" :key="row.park">
            <th class="is-stub">{{ row.park }}</th>
            <td v-for="(value, i) in row.values" :key="`${row.park}-${i}`" :style="cellStyle(value)">
              {{ fmtKwh(value) }}
            </td>
            <td class="is-total">{{ fmtKwh(row.total) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th class="is-stub">合计</th>
            <td v-for="(value, i) in CROSS_TABLE.columnTotals" :key="`t-${i}`">{{ fmtKwh(value) }}</td>
            <td class="is-total">{{ fmtKwh(CROSS_TABLE.total) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <p class="cross-report__note">
      单位 kWh · 单元格底色为条件格式色阶（按列内最大值的 6%→30% 叠加），末行 / 末列为自动合计
    </p>
  </div>
</template>

<script lang="ts" setup>
import { CROSS_TABLE, fmtKwh } from '../mock';

defineOptions({ name: 'CrossTableReport' });

/** 色阶：按值占最大值的比例叠色，最高 30% 不透明度，保证文字可读 */
const cellStyle = (value: number) => ({
  background: `color-mix(in srgb, var(--ai-accent) ${Math.round(6 + (value / CROSS_TABLE.max) * 24)}%, transparent)`,
});
</script>

<style lang="less" scoped>
.cross-report {
  &__scroll {
    overflow-x: auto;
  }

  &__note {
    margin: 10px 0 0;
    font-size: 12px;
    color: var(--ai-text-mute);
  }
}

.cross-table {
  width: 100%;
  overflow: hidden;
  font-size: 13px;
  color: var(--ai-text-dim);
  border-collapse: separate;
  border-spacing: 0;

  th,
  td {
    padding: 10px 12px;
    text-align: right;
    white-space: nowrap;
    border-bottom: 1px solid var(--ai-hairline);
  }

  thead th {
    font-weight: 600;
    color: var(--ai-text);
    background: var(--ai-surface-hover);
  }

  .is-stub {
    position: sticky;
    left: 0;
    z-index: 1;
    text-align: left;
    color: var(--ai-text);
    background: var(--ai-surface-solid);
  }

  thead .is-stub {
    background: var(--ai-surface-hover);
  }

  .is-total {
    font-weight: 600;
    color: var(--ai-text);
    background: var(--ai-surface-active);
  }

  tbody tr:hover td:not(.is-total) {
    box-shadow: inset 0 0 0 999px var(--ai-surface-hover);
  }

  tfoot td,
  tfoot th {
    font-weight: 600;
    color: var(--ai-text);
    border-bottom: 0;
  }

  tfoot .is-stub {
    background: var(--ai-surface-active);
  }
}
</style>
