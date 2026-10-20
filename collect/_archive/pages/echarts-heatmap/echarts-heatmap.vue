<template>
  <div class="heatmap-page">
    <h5>ECharts 热力图</h5>
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>① 日历热力图（类 GitHub 提交记录）</template>
          <div ref="calendarHeatRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="12" style="margin-top: 20px">
        <el-card>
          <template #header>② 笛卡尔坐标热力图（矩阵）</template>
          <div ref="matrixHeatRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="12" style="margin-top: 20px">
        <el-card>
          <template #header>③ 热力图配置要点</template>
          <pre class="code-block">{{ heatmapCode }}</pre>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import { useEChartsInit } from '@/hooks';

defineOptions({ name: 'EChartsHeatmap' });

const {
  chartRef: calendarHeatRef,
  initCharts: initCalendar,
  addResize: addR1,
  removeResize: removeR1,
} = useEChartsInit();
const { chartRef: matrixHeatRef, initCharts: initMatrix, addResize: addR2, removeResize: removeR2 } = useEChartsInit();

// 生成全年日历数据
const generateYearData = () => {
  const data: [string, number][] = [];
  const start = new Date('2025-01-01');
  const end = new Date('2025-12-31');
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    data.push([dateStr, Math.floor(Math.random() * 20)]);
  }
  return data;
};

// 矩阵热力图数据
const hours = [
  '12a',
  '1a',
  '2a',
  '3a',
  '4a',
  '5a',
  '6a',
  '7a',
  '8a',
  '9a',
  '10a',
  '11a',
  '12p',
  '1p',
  '2p',
  '3p',
  '4p',
  '5p',
  '6p',
  '7p',
  '8p',
  '9p',
  '10p',
  '11p',
];
const days = ['周六', '周五', '周四', '周三', '周二', '周一', '周日'];
const generateMatrixData = () => {
  return Array.from({ length: days.length * hours.length }, (_, i) => [
    i % hours.length,
    Math.floor(i / hours.length),
    Math.floor(Math.random() * 10),
  ]);
};

onMounted(() => {
  // 日历热力图
  initCalendar({
    tooltip: { position: 'top', formatter: (p: any) => `${p.data[0]}: ${p.data[1]} 次提交` },
    visualMap: {
      min: 0,
      max: 20,
      type: 'piecewise',
      orient: 'horizontal',
      left: 'center',
      top: 0,
      inRange: { color: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'] },
    },
    calendar: {
      top: 60,
      left: 30,
      right: 20,
      cellSize: ['auto', 16],
      range: '2025',
      itemStyle: { borderWidth: 2, borderColor: '#fff' },
      yearLabel: { show: false },
    },
    series: [{ type: 'heatmap', coordinateSystem: 'calendar', data: generateYearData() }],
  });
  addR1();

  // 矩阵热力图
  initMatrix({
    tooltip: { position: 'top' },
    grid: { height: '60%', top: '10%' },
    xAxis: { type: 'category', data: hours, splitArea: { show: true } },
    yAxis: { type: 'category', data: days, splitArea: { show: true } },
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: { color: ['#f0f5ff', '#1890ff', '#003a8c'] },
    },
    series: [
      {
        name: '活跃度',
        type: 'heatmap',
        data: generateMatrixData(),
        label: { show: true, fontSize: 10 },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } },
      },
    ],
  });
  addR2();
});

onUnmounted(() => {
  removeR1();
  removeR2();
});

const heatmapCode = `// 热力图核心配置
series: [{
  type: 'heatmap',

  // 使用直角坐标系（矩阵热力图）
  coordinateSystem: 'cartesian2d',
  // 或使用日历坐标系
  coordinateSystem: 'calendar',

  data: [[x, y, value], ...],

  // 数值标签
  label: { show: true },

  // 高亮效果
  emphasis: {
    itemStyle: { shadowBlur: 10 }
  }
}]

// visualMap 控制颜色映射
visualMap: {
  min: 0, max: 100,
  type: 'continuous',  // 或 'piecewise'
  inRange: {
    color: ['#f0f5ff', '#1890ff', '#003a8c']
  }
}`;
</script>

<style lang="less" scoped>
.heatmap-page {
  padding: 20px;
  overflow-y: auto;
}
.chart-box {
  width: 100%;
  height: 300px;
}
.code-block {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 8px;
  padding: 14px;
  font-size: 11.5px;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre;
}
</style>
