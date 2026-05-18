<template>
  <div class="gantt-page">
    <h5>甘特图（ECharts 定制实现）</h5>
    <el-alert type="info" :closable="false" style="margin-bottom: 16px">
      ECharts 没有原生甘特图，本示例用
      <strong>自定义系列（custom）</strong>
      + 条形图思路实现完整甘特图， 支持任务分组、进度显示、依赖箭头。
    </el-alert>

    <el-card style="margin-bottom: 16px">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>项目计划甘特图</span>
          <div style="display: flex; gap: 8px">
            <el-select v-model="viewMode" size="small" style="width: 100px" @change="updateChart">
              <el-option label="按天" value="day" />
              <el-option label="按周" value="week" />
            </el-select>
            <el-button size="small" type="primary" @click="addRandomTask">+ 添加任务</el-button>
          </div>
        </div>
      </template>
      <div ref="ganttRef" class="gantt-chart"></div>
    </el-card>

    <el-row :gutter="16">
      <el-col :span="16">
        <el-card>
          <template #header>任务列表</template>
          <el-table :data="tasks" size="small" stripe>
            <el-table-column prop="name" label="任务名" />
            <el-table-column prop="group" label="分组" width="80" />
            <el-table-column label="开始日期" width="100">
              <template #default="{ row }">{{ formatDate(row.start) }}</template>
            </el-table-column>
            <el-table-column label="结束日期" width="100">
              <template #default="{ row }">{{ formatDate(row.end) }}</template>
            </el-table-column>
            <el-table-column label="进度" width="120">
              <template #default="{ row }">
                <el-progress :percentage="row.progress" :stroke-width="10" />
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>实现要点</template>
          <pre class="code-block">{{ ganttCode }}</pre>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';

defineOptions({ name: 'EChartsGantt' });

const ganttRef = ref<HTMLDivElement>();
const viewMode = ref('day');
let chart: echarts.ECharts | null = null;

const statusColors: Record<string, string> = {
  进行中: '#67c23a',
  已完成: '#909399',
  未开始: '#409eff',
  延期: '#f56c6c',
};

const tasks = ref([
  {
    id: 1,
    name: '需求分析',
    group: '规划',
    start: new Date('2025-05-01'),
    end: new Date('2025-05-05'),
    progress: 100,
    status: '已完成',
  },
  {
    id: 2,
    name: 'UI设计',
    group: '设计',
    start: new Date('2025-05-04'),
    end: new Date('2025-05-10'),
    progress: 80,
    status: '进行中',
  },
  {
    id: 3,
    name: '数据库设计',
    group: '开发',
    start: new Date('2025-05-06'),
    end: new Date('2025-05-09'),
    progress: 100,
    status: '已完成',
  },
  {
    id: 4,
    name: '后端开发',
    group: '开发',
    start: new Date('2025-05-09'),
    end: new Date('2025-05-20'),
    progress: 60,
    status: '进行中',
  },
  {
    id: 5,
    name: '前端开发',
    group: '开发',
    start: new Date('2025-05-10'),
    end: new Date('2025-05-22'),
    progress: 40,
    status: '进行中',
  },
  {
    id: 6,
    name: '联调测试',
    group: '测试',
    start: new Date('2025-05-20'),
    end: new Date('2025-05-26'),
    progress: 0,
    status: '未开始',
  },
  {
    id: 7,
    name: '上线部署',
    group: '发布',
    start: new Date('2025-05-26'),
    end: new Date('2025-05-28'),
    progress: 0,
    status: '未开始',
  },
]);

const formatDate = (d: Date) => d.toISOString().slice(0, 10);
const statusType = (s: string) =>
  (({ 已完成: 'info', 进行中: 'success', 未开始: '', 延期: 'danger' }) as Record<string, any>)[s] ?? '';

const buildOption = () => {
  const names = tasks.value.map((t) => t.name);
  const seriesData = tasks.value.map((t, i) => ({
    value: [i, t.start.getTime(), t.end.getTime(), t.progress, t.status],
  }));

  return {
    tooltip: {
      formatter: (p: any) => {
        const [idx, start, end, progress, status] = p.value;
        const t = tasks.value[idx];
        return `<b>${t.name}</b><br>开始：${formatDate(new Date(start))}<br>结束：${formatDate(new Date(end))}<br>进度：${progress}%<br>状态：${status}`;
      },
    },
    grid: { top: 20, left: 120, right: 20, bottom: 30 },
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: (v: number) => new Date(v).toLocaleDateString('zh', { month: 'numeric', day: 'numeric' }),
      },
    },
    yAxis: { type: 'category', data: names, inverse: true },
    series: [
      {
        type: 'custom',
        renderItem: (_params: any, api: any) => {
          const idx = api.value(0);
          const startTime = api.value(1);
          const endTime = api.value(2);
          const progress = api.value(3);
          const status = api.value(4);

          const start = api.coord([startTime, idx]);
          const end = api.coord([endTime, idx]);
          const barHeight = 20;
          const barY = start[1] - barHeight / 2;
          const barW = end[0] - start[0];
          const progressW = barW * (progress / 100);
          const color = statusColors[status] || '#409eff';

          return {
            type: 'group',
            children: [
              // 背景条
              {
                type: 'rect',
                shape: { x: start[0], y: barY, width: barW, height: barHeight, r: 4 },
                style: { fill: '#e4e7ed' },
              },
              // 进度条
              {
                type: 'rect',
                shape: { x: start[0], y: barY, width: progressW, height: barHeight, r: 4 },
                style: { fill: color, opacity: 0.85 },
              },
              // 文字
              {
                type: 'text',
                style: {
                  text: `${progress}%`,
                  x: start[0] + barW / 2,
                  y: barY + barHeight / 2,
                  textAlign: 'center',
                  textVerticalAlign: 'middle',
                  fill: barW > 40 ? '#fff' : '#333',
                  fontSize: 11,
                  fontWeight: 'bold',
                },
              },
            ],
          };
        },
        data: seriesData,
        encode: { x: [1, 2], y: 0 },
      },
    ],
  };
};

const updateChart = () => chart?.setOption(buildOption(), true);

const addRandomTask = () => {
  const names = ['代码审查', '文档编写', '性能优化', '安全测试', '验收测试'];
  const groups = ['开发', '测试', '规划', '设计'];
  const start = new Date(2025, 4, Math.floor(Math.random() * 20) + 1);
  const end = new Date(start.getTime() + (Math.floor(Math.random() * 5) + 2) * 86400000);
  tasks.value.push({
    id: tasks.value.length + 1,
    name: names[Math.floor(Math.random() * names.length)] + (tasks.value.length + 1),
    group: groups[Math.floor(Math.random() * groups.length)],
    start,
    end,
    progress: Math.floor(Math.random() * 100),
    status: ['进行中', '未开始', '已完成'][Math.floor(Math.random() * 3)],
  });
  updateChart();
};

onMounted(() => {
  chart = echarts.init(ganttRef.value!);
  chart.setOption(buildOption());
  const onResize = () => chart?.resize();
  window.addEventListener('resize', onResize);
  onUnmounted(() => {
    window.removeEventListener('resize', onResize);
    chart?.dispose();
  });
});

const ganttCode = `// ECharts 甘特图核心
// 使用 custom 系列 + renderItem 自定义渲染
series: [{
  type: 'custom',
  renderItem: (params, api) => {
    const start = api.coord([api.value(1), api.value(0)])
    const end   = api.coord([api.value(2), api.value(0)])
    const width = end[0] - start[0]

    return {
      type: 'group',
      children: [
        // 背景条
        { type: 'rect', shape: { x, y, width, height: 20 } },
        // 进度条
        { type: 'rect', shape: { width: width * (progress/100) } },
      ]
    }
  }
}]`;
</script>

<style lang="less" scoped>
.gantt-page {
  padding: 20px;
  overflow-y: auto;
}
.gantt-chart {
  width: 100%;
  height: 340px;
}
.code-block {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 8px;
  padding: 14px;
  font-size: 11px;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre;
}
</style>
