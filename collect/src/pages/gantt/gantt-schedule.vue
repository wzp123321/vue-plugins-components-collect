<template>
  <div class="gantt-page">
    <header class="gantt-page__head">
      <h3 class="gantt-page__title">项目排期甘特图</h3>
      <div class="gantt-page__modes">
        <button
          v-for="mode in MODES"
          :key="mode"
          class="gantt-page__mode"
          :class="{ 'is-active': mode === currentMode }"
          @click="switchMode(mode)"
        >
          {{ mode }}
        </button>
      </div>
    </header>

    <div class="gantt-page__legend">
      <span class="gantt-page__legend-item"><i class="dot dot--done"></i>已完成</span>
      <span class="gantt-page__legend-item"><i class="dot dot--doing"></i>进行中（可拖动调整日期）</span>
      <span class="gantt-page__legend-item"><i class="dot dot--todo"></i>未开始</span>
    </div>

    <div class="gantt-page__chart">
      <svg ref="ganttEl" id="gantt-demo"></svg>
    </div>

    <p class="gantt-page__note">
      frappe-gantt（MIT）：任务条可拖拽改期、点击弹出详情、进度条内嵌。
      与后端对接时监听 on_date_change / on_progress_change 回调持久化即可。
      需求更重（资源负载、依赖折叠）时再上 dhtmlx-gantt（注意商用许可）。
    </p>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import Gantt from 'frappe-gantt';
// frappe-gantt 1.2 的 exports 不开放 css 子路径，样式复制到站内 vendor 引入
import '@/assets/style/vendor/frappe-gantt.css';

defineOptions({ name: 'GanttScheduleDemo' });

const MODES = ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'] as const;
type ViewMode = (typeof MODES)[number];
const currentMode = ref<ViewMode>('Day');

const ganttEl = ref<SVGSVGElement | null>(null);
let gantt: InstanceType<typeof Gantt> | null = null;

const TASKS = [
  {
    id: 't1',
    name: '需求评审',
    start: '2026-10-12',
    end: '2026-10-14',
    progress: 100,
    custom_class: 'bar-done',
  },
  {
    id: 't2',
    name: '接口联调',
    start: '2026-10-14',
    end: '2026-10-20',
    progress: 60,
    custom_class: 'bar-doing',
  },
  {
    id: 't3',
    name: '前端开发',
    start: '2026-10-15',
    end: '2026-10-24',
    progress: 40,
    custom_class: 'bar-doing',
  },
  {
    id: 't4',
    name: '测试回归',
    start: '2026-10-25',
    end: '2026-10-30',
    progress: 0,
    custom_class: 'bar-todo',
  },
  {
    id: 't5',
    name: '发布上线',
    start: '2026-10-31',
    end: '2026-11-02',
    progress: 0,
    custom_class: 'bar-todo',
  },
];

onMounted(() => {
  if (!ganttEl.value) return;
  gantt = new Gantt(ganttEl.value, TASKS, {
    view_mode: currentMode.value,
    language: 'zh',
    date_format: 'YYYY-MM-DD',
    on_date_change: (task: unknown, start: unknown, end: unknown) => {
      // 拖拽改期 → 持久化入口
      console.log('date change', task, start, end);
    },
    on_click: (task: unknown) => {
      console.log('task click', task);
    },
  });
});

const switchMode = (mode: ViewMode) => {
  currentMode.value = mode;
  gantt?.change_view_mode(mode);
}

onBeforeUnmount(() => {
  gantt = null;
});
</script>

<style lang="less" scoped>
.gantt-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__title {
    margin: 0;
    color: var(--ai-text);
    font-size: 18px;
  }

  &__modes {
    display: flex;
    gap: 4px;
    padding: 4px;
    border: 1px solid var(--ai-border);
    border-radius: 10px;
    background: var(--ai-surface-raised);
  }

  &__mode {
    height: 26px;
    padding: 0 12px;
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: var(--ai-text-dim);
    font-size: 12px;
    cursor: pointer;

    &.is-active {
      background: var(--ai-gradient-soft);
      color: var(--ai-text);
    }
  }

  &__legend {
    display: flex;
    gap: 16px;
  }

  &__legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--ai-text-mute);
    font-size: 11.5px;
  }

  &__chart {
    padding: 14px;
    border: 1px solid var(--ai-border);
    border-radius: var(--ai-radius-md);
    background: var(--ai-surface);
    overflow-x: auto;

    :deep(.gantt .bar) {
      border-radius: var(--ai-radius-sm);
    }

    :deep(.bar-done) {
      fill: rgba(52, 211, 153, 0.75) !important;
    }

    :deep(.bar-doing) {
      fill: rgba(124, 92, 255, 0.75) !important;
    }

    :deep(.bar-todo) {
      fill: rgba(148, 163, 184, 0.55) !important;
    }
  }

  &__note {
    margin: 0;
    color: var(--ai-text-mute);
    font-size: 11.5px;
    line-height: 1.7;
  }
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &--done {
    background: #34d399;
  }

  &--doing {
    background: #7c5cff;
  }

  &--todo {
    background: #94a3b8;
  }
}
</style>
