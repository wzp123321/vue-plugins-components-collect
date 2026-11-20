<!--
  分组表（园区分组 + 台区明细 + 分组小计）
  ============================================================================
  对齐帆软「分组报表」形态：按园区分组，组内列台区，组头展示小计与占比。
  涨跌配色按国内习惯：涨红跌绿。
-->
<template>
  <div class="group-report">
    <table class="group-table">
      <thead>
        <tr>
          <th class="is-stub">园区 / 台区</th>
          <th>售电量 (kWh)</th>
          <th>占比</th>
          <th>环比</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(block, bi) in GROUP_TABLE" :key="block.park">
          <tr :class="['group-row', { 'is-first': bi === 0 }]">
            <th class="is-stub">{{ block.park }}</th>
            <td class="is-strong">{{ fmtKwh(block.total) }}</td>
            <td>{{ block.share.toFixed(1) }}%</td>
            <td :class="deltaClass(block.mom)">{{ fmtPct(block.mom) }}</td>
          </tr>
          <tr v-for="child in block.children" :key="`${block.park}-${child.transformer}`" class="child-row">
            <td class="is-stub is-child">{{ child.transformer }}</td>
            <td>{{ fmtKwh(child.kwh) }}</td>
            <td>{{ child.share.toFixed(1) }}%</td>
            <td :class="deltaClass(child.mom)">{{ fmtPct(child.mom) }}</td>
          </tr>
        </template>
      </tbody>
    </table>
    <p class="group-report__note">组头为园区小计，灰底行为组内台区明细；环比为 10 月对 9 月</p>
  </div>
</template>

<script lang="ts" setup>
import { GROUP_TABLE, fmtKwh, fmtPct } from '../mock';

defineOptions({ name: 'GroupTableReport' });

const deltaClass = (value: number) => {
  if (value > 0) return 'is-up';
  if (value < 0) return 'is-down';
  return '';
};
</script>

<style lang="less" scoped>
.group-report {
  &__note {
    margin: 10px 0 0;
    font-size: 12px;
    color: var(--ai-text-mute);
  }
}

.group-table {
  width: 100%;
  font-size: 13px;
  color: var(--ai-text-dim);
  border-collapse: separate;
  border-spacing: 0;

  th,
  td {
    padding: 9px 12px;
    text-align: right;
    border-bottom: 1px solid var(--ai-hairline);
  }

  thead th {
    font-weight: 600;
    color: var(--ai-text);
    background: var(--ai-surface-hover);
  }

  .is-stub {
    text-align: left;
    color: var(--ai-text);
  }

  .is-strong {
    font-weight: 600;
    color: var(--ai-text);
  }

  .is-child {
    padding-left: 30px;
    font-weight: 400;
    color: var(--ai-text-dim);

    &::before {
      content: '└';
      margin-right: 8px;
      color: var(--ai-text-mute);
    }
  }

  .group-row {
    th,
    td {
      background: var(--ai-surface-raised);
    }
  }

  .child-row:hover td {
    background: var(--ai-surface-hover);
  }

  .is-up {
    color: #ff5a3c;
  }

  .is-down {
    color: #38d39f;
  }
}
</style>
