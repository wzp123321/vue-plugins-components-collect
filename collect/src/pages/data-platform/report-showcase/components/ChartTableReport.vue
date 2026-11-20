<!--
  图文报表（图表 ↔ 明细联动）
  ============================================================================
  柱线混合（柱 = 售电量，线 = 同比，双轴）+ 下方台区明细表。
  点击柱子把下方明细切到该园区；再次点击取消选中回到默认园区。
-->
<template>
  <div class="chart-table">
    <div class="chart-table__head">
      <span class="chart-table__title">园区售电量与同比</span>
      <span class="chart-table__hint">点击柱子联动下方明细</span>
    </div>

    <div ref="el" class="chart-table__chart"></div>

    <div class="chart-table__detail">
      <div class="chart-table__detail-head">
        <span class="chart-table__park">{{ activePark }}</span>
        <span class="chart-table__sub">台区 × 月份明细 (kWh) · 小计 {{ totalText }}</span>
      </div>
      <table class="mini-table">
        <thead>
          <tr>
            <th class="is-stub">台区</th>
            <th v-for="month in MONTHS" :key="month">{{ month }}</th>
            <th>合计</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in detailRows" :key="row.transformer">
            <td class="is-stub">{{ row.transformer }}</td>
            <td v-for="(value, i) in row.values" :key="`${row.transformer}-${i}`">{{ fmtKwh(value) }}</td>
            <td class="is-strong">{{ fmtKwh(row.total) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import type { EChartsOption } from '@/config/echarts/setup';
import { chartToken } from '@/config/echarts/theme';
import { useChartContainer, type ChartEventParams } from '@/hooks';
import { MONTHS, PARKS, PARK_SUMMARY, fmtKwh, fmtWan, parkDetail } from '../mock';

defineOptions({ name: 'ChartTableReport' });

/** null 表示未选中，默认看第一个园区 */
const selectedIndex = ref<number | null>(null);
const activePark = computed(() => (selectedIndex.value === null ? PARKS[0] : PARKS[selectedIndex.value]));
const detailRows = computed(() => parkDetail(activePark.value));

const buildOption = (): EChartsOption => {
  const dim = chartToken('textDim');
  const border = chartToken('borderStrong');
  const selected = selectedIndex.value;

  return {
    grid: { left: 4, right: 4, top: 34, bottom: 4, containLabel: true },
    legend: { top: 0, right: 0, itemWidth: 8, itemHeight: 8, icon: 'roundRect' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category',
      data: PARKS,
      axisTick: { show: false },
      axisLabel: { color: dim },
      axisLine: { lineStyle: { color: border } },
    },
    yAxis: [
      {
        type: 'value',
        name: '万 kWh',
        nameTextStyle: { color: dim, align: 'left' },
        axisLabel: { color: dim },
        splitLine: { lineStyle: { color: chartToken('border'), type: 'dashed' } },
      },
      {
        type: 'value',
        name: '同比 %',
        nameTextStyle: { color: dim, align: 'right' },
        axisLabel: { color: dim },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '售电量',
        type: 'bar',
        barWidth: 26,
        itemStyle: { borderRadius: [4, 4, 0, 0], color: chartToken('accent') },
        data: PARK_SUMMARY.map((item, index) => ({
          value: Number((item.kwh / 10000).toFixed(1)),
          itemStyle: { opacity: selected === null || selected === index ? 1 : 0.32 },
        })),
      },
      {
        name: '同比',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbolSize: 6,
        lineStyle: { width: 2 },
        data: PARK_SUMMARY.map((item) => Number(item.yoy.toFixed(1))),
      },
    ],
  };
};

const onChartClick = (params: ChartEventParams) => {
  const index = params.dataIndex;
  if (index === undefined) return;
  selectedIndex.value = selectedIndex.value === index ? null : index;
};

const { el, chart } = useChartContainer(buildOption, { events: { click: onChartClick } });

/** 外部（表格/卡片）改选中时同步刷新图表 */
watch(selectedIndex, () => chart.value?.setOption(buildOption()));

const totalText = computed(() => fmtWan(detailRows.value.reduce((acc, row) => acc + row.total, 0)));
</script>

<style lang="less" scoped>
.chart-table {
  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  &__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--ai-text);
  }

  &__hint {
    font-size: 12px;
    color: var(--ai-text-mute);
  }

  &__chart {
    height: 240px;
  }

  &__detail {
    margin-top: 12px;
    border-top: 1px dashed var(--ai-hairline);
  }

  &__detail-head {
    display: flex;
    gap: 8px;
    align-items: baseline;
    padding: 10px 0 6px;
  }

  &__park {
    font-size: 13px;
    font-weight: 600;
    color: var(--ai-text);
  }

  &__sub {
    font-size: 11px;
    color: var(--ai-text-mute);
  }
}

.mini-table {
  width: 100%;
  font-size: 13px;
  color: var(--ai-text-dim);
  border-collapse: separate;
  border-spacing: 0;

  th,
  td {
    padding: 8px 10px;
    text-align: right;
    border-bottom: 1px solid var(--ai-hairline);
  }

  thead th {
    font-weight: 600;
    color: var(--ai-text);
    text-align: right;
    background: var(--ai-surface-hover);
  }

  .is-stub {
    text-align: left;
    color: var(--ai-text);
  }

  thead .is-stub {
    text-align: left;
  }

  .is-strong {
    font-weight: 600;
    color: var(--ai-text);
  }

  tbody tr:hover td {
    background: var(--ai-surface-hover);
  }
}
</style>
