<template>
  <div class="scatter-page">
    <h5>ECharts 散点图 / 气泡图</h5>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>① 基础散点图（身高-体重）</template>
          <div ref="basicScatterRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>② 气泡图（size 映射第三维度）</template>
          <div ref="bubbleRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="24" style="margin-top: 20px">
        <el-card>
          <template #header>③ 多系列散点 + 回归线</template>
          <div ref="multiRef" style="width: 100%; height: 360px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import { useEChartsInit } from '@/hooks';

defineOptions({ name: 'EChartsScatter' });

const { chartRef: basicScatterRef, initCharts: initBasic, addResize: addR1, removeResize: removeR1 } = useEChartsInit();
const { chartRef: bubbleRef, initCharts: initBubble, addResize: addR2, removeResize: removeR2 } = useEChartsInit();
const { chartRef: multiRef, initCharts: initMulti, addResize: addR3, removeResize: removeR3 } = useEChartsInit();

// 生成身高体重数据
const genHeightWeight = (n: number, ageGroup: string) => {
  const base = ageGroup === 'male' ? [175, 70] : [162, 55];
  return Array.from({ length: n }, () => [
    +(base[0] + (Math.random() - 0.5) * 20).toFixed(1),
    +(base[1] + (Math.random() - 0.5) * 15).toFixed(1),
  ]);
};

// 生成气泡数据 [x, y, size]
const genBubbleData = (n: number) =>
  Array.from({ length: n }, () => [
    +(Math.random() * 100).toFixed(1),
    +(Math.random() * 100).toFixed(1),
    +(Math.random() * 50 + 5).toFixed(1),
  ]);

onMounted(() => {
  // 基础散点
  initBasic({
    tooltip: { trigger: 'item', formatter: (p: any) => `身高：${p.data[0]}cm<br>体重：${p.data[1]}kg` },
    legend: { data: ['男性', '女性'] },
    xAxis: { name: '身高(cm)', nameLocation: 'end', scale: true },
    yAxis: { name: '体重(kg)', nameLocation: 'end', scale: true },
    series: [
      {
        name: '男性',
        type: 'scatter',
        data: genHeightWeight(60, 'male'),
        symbolSize: 8,
        itemStyle: { color: '#5470c6', opacity: 0.7 },
      },
      {
        name: '女性',
        type: 'scatter',
        data: genHeightWeight(60, 'female'),
        symbolSize: 8,
        itemStyle: { color: '#ee6666', opacity: 0.7 },
      },
    ],
  });
  addR1();

  // 气泡图
  initBubble({
    tooltip: { trigger: 'item', formatter: (p: any) => `X:${p.data[0]} Y:${p.data[1]} 大小:${p.data[2]}` },
    xAxis: { scale: true },
    yAxis: { scale: true },
    visualMap: { show: false, dimension: 2, min: 5, max: 55, inRange: { color: ['#59ab6e', '#ffa726', '#ef5350'] } },
    series: [
      {
        type: 'scatter',
        data: genBubbleData(40),
        symbolSize: (data: number[]) => Math.sqrt(data[2]) * 5,
        label: { show: false },
        emphasis: { label: { show: true, formatter: (p: any) => `大小:${p.data[2]}`, position: 'top' } },
      },
    ],
  });
  addR2();

  // 多系列 + 回归线
  const maleData = genHeightWeight(40, 'male');
  const femaleData = genHeightWeight(40, 'female');
  // 简单线性回归
  const linReg = (data: number[][]) => {
    const n = data.length;
    const sumX = data.reduce((s, d) => s + d[0], 0);
    const sumY = data.reduce((s, d) => s + d[1], 0);
    const sumXY = data.reduce((s, d) => s + d[0] * d[1], 0);
    const sumX2 = data.reduce((s, d) => s + d[0] * d[0], 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const minX = Math.min(...data.map((d) => d[0]));
    const maxX = Math.max(...data.map((d) => d[0]));
    return [
      [minX, slope * minX + intercept],
      [maxX, slope * maxX + intercept],
    ];
  };

  initMulti({
    tooltip: { trigger: 'item' },
    legend: { data: ['男性数据', '女性数据', '男性趋势', '女性趋势'] },
    xAxis: { name: '身高(cm)', scale: true },
    yAxis: { name: '体重(kg)', scale: true },
    series: [
      {
        name: '男性数据',
        type: 'scatter',
        data: maleData,
        symbolSize: 8,
        itemStyle: { color: '#5470c6', opacity: 0.6 },
      },
      {
        name: '女性数据',
        type: 'scatter',
        data: femaleData,
        symbolSize: 8,
        itemStyle: { color: '#ee6666', opacity: 0.6 },
      },
      {
        name: '男性趋势',
        type: 'line',
        data: linReg(maleData),
        showSymbol: false,
        lineStyle: { color: '#5470c6', type: 'dashed', width: 2 },
      },
      {
        name: '女性趋势',
        type: 'line',
        data: linReg(femaleData),
        showSymbol: false,
        lineStyle: { color: '#ee6666', type: 'dashed', width: 2 },
      },
    ],
  });
  addR3();
});

onUnmounted(() => {
  removeR1();
  removeR2();
  removeR3();
});
</script>

<style lang="less" scoped>
.scatter-page {
  padding: 20px;
  overflow-y: auto;
}
.chart-box {
  width: 100%;
  height: 300px;
}
</style>
