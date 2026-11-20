<!--
  指标卡组（KPI + 同比环比 + 迷你走势）
  ============================================================================
  驾驶舱顶部的指标卡形态：主数值 + 变化率胶囊 + sparkline 走势线。
  数据全部来自 mock.ts 的预聚合结果，不在模板里做计算。
-->
<template>
  <div class="kpi-report">
    <article v-for="card in cards" :key="card.label" class="kpi-card">
      <header class="kpi-card__head">
        <span class="kpi-card__label">{{ card.label }}</span>
        <span v-if="card.delta !== undefined" :class="['kpi-card__delta', card.delta > 0 ? 'is-up' : 'is-down']">
          {{ card.delta > 0 ? '↑' : '↓' }} {{ Math.abs(card.delta).toFixed(1) }}%
        </span>
      </header>

      <div class="kpi-card__value">
        <span class="kpi-card__num">{{ card.value }}</span>
        <span class="kpi-card__unit">{{ card.unit }}</span>
      </div>

      <SparkLine :values="card.spark" :color="card.color" class="kpi-card__spark" />

      <footer class="kpi-card__foot">{{ card.note }}</footer>
    </article>
  </div>
</template>

<script lang="ts" setup>
import SparkLine from './SparkLine.vue';
import { MOM_TOTAL, MONTH_SUMMARY, PARK_SUMMARY, TOTAL_KWH, TOTAL_YOY, fmtWan } from '../mock';

defineOptions({ name: 'KpiCardReport' });

const monthSpark = MONTH_SUMMARY.map((item) => item.kwh);
const peakPark = PARK_SUMMARY.reduce((acc, item) => (item.kwh > acc.kwh ? item : acc), PARK_SUMMARY[0]);

interface KpiCard {
  label: string;
  value: string;
  unit: string;
  delta?: number;
  note: string;
  spark: number[];
  color: string;
}

const cards: KpiCard[] = [
  {
    label: '季度售电量',
    value: fmtWan(TOTAL_KWH).replace(' 万', ''),
    unit: '万 kWh',
    delta: TOTAL_YOY,
    note: '2026 Q3 · 同比口径',
    spark: monthSpark,
    color: 'var(--ai-accent)',
  },
  {
    label: '末月售电量',
    value: fmtWan(MONTH_SUMMARY[2].kwh).replace(' 万', ''),
    unit: '万 kWh',
    delta: MOM_TOTAL,
    note: '2026-10 · 环比上月',
    spark: monthSpark,
    color: 'var(--ai-accent-2)',
  },
  {
    label: '峰值园区',
    value: peakPark.park,
    unit: fmtWan(peakPark.kwh),
    delta: peakPark.yoy,
    note: '四园区中用电量最高',
    spark: PARK_SUMMARY.map((item) => item.kwh),
    color: '#f5a623',
  },
  {
    label: '数据覆盖',
    value: '12',
    unit: '个台区',
    note: '4 园区 × 3 台区 · 3 类用电',
    spark: PARK_SUMMARY.map((item) => item.kwh),
    color: '#38d39f',
  },
];
</script>

<style lang="less" scoped>
.kpi-report {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px 12px;
  border: 1px solid var(--ai-hairline);
  border-radius: var(--ai-radius-md);
  background: var(--ai-surface);

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__label {
    font-size: 12px;
    color: var(--ai-text-mute);
  }

  &__delta {
    padding: 1px 7px;
    font-family: var(--ai-font-mono);
    font-size: 11px;
    border-radius: 999px;

    &.is-up {
      color: #ff5a3c;
      background: rgb(255 90 60 / 12%);
    }

    &.is-down {
      color: #38d39f;
      background: rgb(56 211 159 / 12%);
    }
  }

  &__value {
    display: flex;
    gap: 6px;
    align-items: baseline;
  }

  &__num {
    font-family: var(--ai-font-mono);
    font-size: 24px;
    font-weight: 600;
    line-height: 1.1;
    color: var(--ai-text);
  }

  &__unit {
    font-size: 12px;
    color: var(--ai-text-mute);
  }

  &__spark {
    margin: 2px 0;
  }

  &__foot {
    font-size: 11px;
    color: var(--ai-text-mute);
  }
}
</style>
