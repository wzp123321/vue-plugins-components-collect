<!--
 * MapTimeline.vue — 底部「时间轴」控制条（P0 时间轴动画交互）
 * ---------------------------------------------------------------
 * 职责：数据大屏的"动感"入口。提供 播放/暂停、月份滑块、倍速，把当前月份与
 *   播放态通过 v-model 下发到 ChinaMap3D；ChinaMap3D 自动播放时又通过
 *   timeline-month-change 把月份回传，滑块与看板趋势高亮保持同步。
 * 设计：玻璃拟态 + 青光风格，与控制台/看板统一；固定在屏幕底部居中。
 * 协作：threejs-china-3d-map.vue（持有 timelinePlaying/timelineMonth/timelineSpeed 三态）。
 * 布局：窄容器（页面内容区 <1280px）且展开时左锚定，让开左下角固定停靠的实时比例尺，
 *   否则居中左缘会爬进比例尺区域（见文件末尾 @container 规则）。
 -->
<template>
  <div class="map-timeline" :class="{ 'map-timeline--collapsed': collapsed }">
    <div class="map-timeline__head" @click="collapsed = !collapsed">
      <span class="map-timeline__pulse"></span>
      <span class="map-timeline__title">时间轴</span>
      <span class="map-timeline__chev">{{ collapsed ? '▸' : '▾' }}</span>
    </div>

    <div v-show="!collapsed" class="map-timeline__body">
      <button type="button" class="map-timeline__play" :title="playing ? '暂停' : '播放'" @click="toggle">
        <span v-if="playing">❚❚</span>
        <span v-else>▶</span>
      </button>

      <div class="map-timeline__track">
        <input
          class="map-timeline__range"
          type="range"
          min="0"
          :max="lastIndex"
          step="1"
          :value="month"
          @input="onSlide"
        />
        <div class="map-timeline__labels">
          <span
            v-for="(m, i) in months"
            :key="m + i"
            class="map-timeline__label"
            :class="{ 'map-timeline__label--on': i === month, 'map-timeline__label--edge': i === 0 || i === lastIndex }"
          >{{ m }}</span>
        </div>
      </div>

      <span class="map-timeline__current">{{ months[month] || '' }}</span>

      <div class="map-timeline__speed">
        <button
          v-for="s in speeds"
          :key="s"
          type="button"
          class="map-timeline__speedBtn"
          :class="{ 'map-timeline__speedBtn--on': s === speed }"
          @click="speed = s"
        >{{ s }}×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  /** 月份标签（与趋势等长） */
  months: string[];
}>();

// 三个 v-model：playing / month / speed
const playing = defineModel<boolean>('playing', { default: false });
const month = defineModel<number>('month', { default: 11 });
const speed = defineModel<number>('speed', { default: 1 });

// 默认收起：只留「时间轴」小胶囊悬在底部，展开才露播放/滑块/倍速，
// 与其他右栏面板（控制台/详情/看板）保持一致的「默认收起」行为。
const collapsed = ref(true);
const speeds = [0.5, 1, 2, 4];

const lastIndex = computed(() => Math.max(0, props.months.length - 1));

const toggle = () => {
  playing.value = !playing.value;
};

const onSlide = (e: Event) => {
  const v = Number((e.target as HTMLInputElement).value);
  month.value = v;
};
</script>

<style scoped>
.map-timeline {
  position: absolute;
  /* 按「右栏之外的可用区域」居中：--rail-shift 由页面根节点下发，缺失时退化为普通居中 */
  left: calc(50% - var(--rail-shift, 0px));
  bottom: 18px;
  transform: translateX(-50%);
  z-index: 30;
  /* 宽度上限同时受两侧栏位约束：440 = 左信息卡让位 + 右控制栏让位，
     窄屏时时间轴自动收窄，不会被挤出画布或压到面板下面 */
  width: min(700px, calc(100% - 440px));
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 16px 12px;
  background: rgba(6, 16, 40, 0.82);
  border: 1px solid rgba(95, 216, 255, 0.22);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.03);
  color: #dcefff;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  user-select: none;
}
.map-timeline--collapsed {
  width: auto;
  padding: 8px 14px;
}
.map-timeline__head {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #eaf6ff;
  text-shadow: 0 0 10px rgba(54, 224, 255, 0.5);
}
.map-timeline__pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #5fd8ff;
  box-shadow: 0 0 8px #5fd8ff;
  animation: map-timeline-blink 1.6s ease-in-out infinite;
}
@keyframes map-timeline-blink {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
.map-timeline__title { flex: 1; }
.map-timeline__chev { font-size: 12px; color: #6f9fc4; }
.map-timeline__body {
  display: flex;
  align-items: center;
  gap: 12px;
}
.map-timeline__play {
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(95, 216, 255, 0.4);
  background: rgba(47, 192, 255, 0.16);
  color: #eaf6ff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.map-timeline__play:hover {
  background: rgba(47, 192, 255, 0.3);
}
.map-timeline__track {
  flex: 1;
  min-width: 0;
}
.map-timeline__range {
  width: 100%;
  accent-color: #5fd8ff;
  cursor: pointer;
}
.map-timeline__labels {
  display: flex;
  justify-content: space-between;
  margin-top: 2px;
}
.map-timeline__label {
  font-size: 10px;
  color: #5b86a8;
  font-variant-numeric: tabular-nums;
}
.map-timeline__label--on {
  color: #8fe9ff;
  font-weight: 700;
}
.map-timeline__label--edge {
  color: #7fa8c8;
}
.map-timeline__current {
  flex: 0 0 auto;
  min-width: 40px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: #eaf6ff;
  font-variant-numeric: tabular-nums;
}
.map-timeline__speed {
  flex: 0 0 auto;
  display: flex;
  gap: 4px;
}
.map-timeline__speedBtn {
  padding: 3px 7px;
  border: 1px solid rgba(95, 216, 255, 0.25);
  border-radius: 6px;
  background: rgba(120, 150, 180, 0.08);
  color: #9fc4e0;
  font-size: 11px;
  cursor: pointer;
  font-family: inherit;
}
.map-timeline__speedBtn--on {
  background: rgba(47, 192, 255, 0.2);
  color: #eaf6ff;
  border-color: rgba(95, 216, 255, 0.6);
}
/* 窄容器（页面内容区 < 1280px）且处于展开态：由居中改为左锚定。
   居中定位在此宽度下左缘会爬进左下角比例尺（16~160）区域——1280~1550 视口最明显；
   左锚到 left:180（比例尺右缘 160 + 20 间隙），右侧 right:336 让开 300 宽控制栏 + 间隙。
   收起态仍是居中小胶囊，默认观感不变。容器基准 .china3d-page 的 container-type 由页面下发。 */
@container (max-width: 1279px) {
  .map-timeline:not(.map-timeline--collapsed) {
    left: 180px;
    right: 336px;
    width: auto;
    max-width: 700px;
    transform: none;
  }
}
</style>
