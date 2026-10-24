<!--
 * MapDashBoard.vue — 右下角「数据看板」面板（DIY 图表 + 地图双向联动）
 * ---------------------------------------------------------------
 * 职责：占据右下角（原常驻交互提示让出的空间），用三块轻量 DOM/SVG 图表
 *   展示当前层级的数据，并与 3D 地图双向联动：
 *   - KPI 行：下级区域数 / 项目总量 / 区域均值，随下钻自动刷新；
 *   - 区域排行 TOP6：横向条形图。悬浮条目 → 3D 地图高亮该区域（图表 → 地图）；
 *     点击可下钻 / 选中；地图侧选中的区域也会回亮对应条目（地图 → 图表）；
 *   - 近 12 月趋势：SVG 折线 + 面积图。默认展示当前层级各下级合计；当地图
 *     上有选中 / 悬停区域时，自动切换为该区域的月度曲线（地图 → 图表）。
 * 角色：纯 UI 图表面板，不含 Three.js 逻辑。数据由页面（threejs-china-3d-map.vue）
 *   计算后下发（subRegions / trend / trendLabel / trendMonths），条目的悬浮与
 *   点击通过 emit('select' / 'drill') 交还页面转调 ChinaMap3D 的 ref API。
 * 协作：threejs-china-3d-map.vue（数据源 + 事件转发到 mapRef）。
 * 样式：沿用可视化控制台 / 区域详情的玻璃拟态 + 青光风格，与整屏大屏统一。
 -->
<template>
  <div class="map-dash" :class="{ 'map-dash--collapsed': collapsed }">
    <div class="map-dash__head" @click="collapsed = !collapsed">
      <span class="map-dash__pulse"></span>
      <span class="map-dash__title">数据看板</span>
      <span class="map-dash__scope" :title="scopeName">{{ scopeName }}</span>
      <span class="map-dash__chev">{{ collapsed ? '▸' : '▾' }}</span>
    </div>

    <div v-show="!collapsed" class="map-dash__body">
      <!-- KPI 行：随层级下钻刷新 -->
      <div class="map-dash__kpis">
        <div class="map-dash__kpi">
          <b class="map-dash__kpi-num">{{ subRegions.length }}</b>
          <span class="map-dash__kpi-label">下级区域</span>
        </div>
        <div class="map-dash__kpi">
          <b class="map-dash__kpi-num">{{ total }}</b>
          <span class="map-dash__kpi-label">项目总量</span>
        </div>
        <div class="map-dash__kpi">
          <b class="map-dash__kpi-num">{{ avg }}</b>
          <span class="map-dash__kpi-label">区域均值</span>
        </div>
      </div>

      <!-- 区域排行 TOP6：悬浮联动地图高亮（图表 → 地图），点击下钻 -->
      <div class="map-dash__section">
        <div class="map-dash__secHead">
          <span class="map-dash__secTitle">区域排行 · TOP6</span>
          <span class="map-dash__secNote">悬浮高亮 / 点击下钻</span>
        </div>
        <div class="map-dash__ranks">
          <button
            v-for="(r, i) in top6"
            :key="r.adcode"
            type="button"
            class="map-dash__rankRow"
            :class="{ 'map-dash__rankRow--active': r.adcode === selectedAdcode }"
            :title="r.drillable ? `${r.name} · 点击下钻` : `${r.name} · 最末级，点击高亮`"
            @click.stop="r.drillable ? emit('drill', r.adcode) : emit('select', r.adcode)"
            @mouseenter="emit('select', r.adcode)"
            @mouseleave="emit('select', null)"
          >
            <span class="map-dash__rankNo" :class="i < 3 ? `map-dash__rankNo--${i + 1}` : ''">{{ i + 1 }}</span>
            <span class="map-dash__rankName">{{ r.name }}</span>
            <span class="map-dash__rankTrack">
              <i class="map-dash__rankFill" :style="{ width: pct(r.value), background: barColor(r.value) }"></i>
            </span>
            <span class="map-dash__rankValue">{{ r.value }}</span>
            <span v-if="r.drillable" class="map-dash__rankDrill">›</span>
          </button>
        </div>
        <div v-if="!top6.length" class="map-dash__empty">当前层级无下级区域</div>
      </div>

      <!-- 近 12 月趋势：跟随地图选中/悬停切换口径（地图 → 图表） -->
      <div class="map-dash__section">
        <div class="map-dash__secHead">
          <span class="map-dash__secTitle">近 12 月项目趋势</span>
          <span class="map-dash__secNote" :title="trendLabel">{{ trendLabel }}</span>
        </div>
        <div v-if="trend.length > 1" class="map-dash__trend" @mouseleave="hoverIdx = -1">
          <svg class="map-dash__trendSvg" viewBox="0 0 272 96" role="img" aria-label="近 12 月项目趋势图">
            <defs>
              <linearGradient id="map-dash-trend-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="rgba(95, 216, 255, 0.32)" />
                <stop offset="100%" stop-color="rgba(95, 216, 255, 0.02)" />
              </linearGradient>
            </defs>
            <!-- 面积 + 折线 + 基线 -->
            <path class="map-dash__trendArea" :d="areaPath" fill="url(#map-dash-trend-fill)" />
            <line class="map-dash__trendBase" :x1="PL" :y1="PB" :x2="PR" :y2="PB" />
            <!-- 时间轴当前月高亮竖线（随播放/拖动同步） -->
            <line
              v-if="activeMonth != null && activeMonth >= 0 && activeMonth < xs.length"
              class="map-dash__trendActive"
              :x1="xs[activeMonth]" :y1="PT"
              :x2="xs[activeMonth]" :y2="PB"
            />
            <polyline class="map-dash__trendLine" :points="pointsStr" />
            <!-- 数据点：悬浮点放大高亮，末点常驻脉冲 -->
            <circle
              v-for="(x, i) in xs"
              :key="`d${i}`"
              :cx="x"
              :cy="ys[i]"
              :r="i === hoverIdx ? 3.4 : 2"
              class="map-dash__trendDot"
              :class="{ 'map-dash__trendDot--hot': i === hoverIdx }"
            />
            <circle
              v-if="xs.length"
              class="map-dash__trendPulse"
              :cx="xs[xs.length - 1]"
              :cy="ys[ys.length - 1]"
              r="3"
            />
            <!-- 月份刻度（每 3 个月 + 末月）与末点数值 -->
            <text v-for="t in monthTicks" :key="`m${t.label}-${t.x}`" class="map-dash__trendMonth" :x="t.x" y="82">
              {{ t.label }}
            </text>
            <text v-if="ys.length" class="map-dash__trendLast" :x="PR + 4" :y="ys[ys.length - 1] + 3">
              {{ trend[trend.length - 1] }}
            </text>
            <!-- 悬浮命中区：每个数据点一根隐形竖条 -->
            <rect
              v-for="(x, i) in xs"
              :key="`h${i}`"
              :x="x - step / 2"
              y="0"
              :width="step"
              :height="VH"
              fill="transparent"
              @mouseenter="hoverIdx = i"
            />
          </svg>
          <!-- 悬浮数值气泡（HTML 层，跟随命中点的百分比坐标） -->
          <div v-if="hoverIdx >= 0 && trend[hoverIdx] != null" class="map-dash__tip" :style="tipStyle">
            <span>{{ trendMonths[hoverIdx] }}</span>
            <b>{{ trend[hoverIdx] }} 个</b>
          </div>
        </div>
        <div v-else class="map-dash__empty">暂无趋势数据</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

/** 与页面侧 subRegions 计算属性同构的下级行政区条目 */
interface SubRegion {
  adcode: number;
  name: string;
  value: number;
  drillable: boolean;
}

const props = withDefaults(
  defineProps<{
    /** 当前层级名（全国 / 江苏省…），展示在面板头部 */
    scopeName?: string;
    /** 当前层级的「下级行政区 + 项目数」，驱动 KPI 行与 TOP6 排行 */
    subRegions?: SubRegion[];
    /** 地图侧当前选中的 adcode（回亮 TOP6 对应条目） */
    selectedAdcode?: number | null;
    /** 近 12 月趋势序列：页面按 选中 > 悬停 > 层级合计 的口径算好下发 */
    trend?: number[];
    /** 趋势当前口径名（区域名 / 「xx · 合计」），展示在趋势小标题右侧 */
    trendLabel?: string;
    /** 趋势横轴月份标签（与 trend 等长） */
    trendMonths?: string[];
    /** 时间轴当前高亮月份下标（0~11），在趋势图上画一条竖高亮线 */
    activeMonth?: number | null;
  }>(),
  {
    scopeName: '全国',
    subRegions: () => [],
    selectedAdcode: null,
    trend: () => [],
    trendLabel: '',
    trendMonths: () => [],
    activeMonth: null,
  },
);

const emit = defineEmits<{
  /** 悬浮/点击选中某区域（null 取消）→ 页面转调 mapRef.selectByAdcode 高亮地图 */
  (e: 'select', adcode: number | null): void;
  /** 点击可下钻条目 → 页面转调 mapRef.drillByAdcode 下钻 */
  (e: 'drill', adcode: number): void;
}>();

// 默认收起：与其他面板（控制台/区域详情/时间轴）一致——一进页面只露标题栏小卡，
// 需要看数据时点标题栏展开，避免右下角大块面板挡住地图。
const collapsed = ref(true);

// ---- KPI 与 TOP6 ----
const total = computed(() => props.subRegions.reduce((s, r) => s + r.value, 0));
const avg = computed(() => (props.subRegions.length ? Math.round(total.value / props.subRegions.length) : 0));
/** subRegions 由页面按 value 降序传入，TOP6 直接取前 6 条 */
const top6 = computed(() => props.subRegions.slice(0, 6));
const maxValue = computed(() => props.subRegions.reduce((m, r) => Math.max(m, r.value), 0));

/** 条宽：相对当前层级最大值归一化，最小 4% 保证可见 */
const pct = (v: number) => (maxValue.value > 0 ? `${Math.max(4, (v / maxValue.value) * 100).toFixed(1)}%` : '0%');

/** 条色：与地图数据柱 / 区域详情同一套「深蓝→青光」插值，越高越亮 */
const barColor = (v: number) => {
  const ratio = maxValue.value > 0 ? v / maxValue.value : 0;
  const k = 0.3 + 0.7 * Math.min(1, ratio);
  const from = [15, 58, 87]; // #0F3A57
  const to = [95, 201, 238]; // #5FC9EE
  const c = from.map((f, i) => Math.round(f + (to[i] - f) * k));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

// ---- 趋势折线几何（viewBox 272×96，绘制区四周留白） ----
const VW = 272;
const VH = 96;
const PL = 6; // 绘制区左界
const PR = 240; // 绘制区右界（右侧留 32 给末点数值）
const PT = 10; // 绘制区上界
const PB = 66; // 绘制区下界（基线）

/** 悬浮命中的数据点下标，-1 表示未悬浮 */
const hoverIdx = ref(-1);
// 口径切换（换区域 / 换层级）后旧的下标不再有意义，立即复位
watch(
  () => props.trend,
  () => {
    hoverIdx.value = -1;
  },
);

const step = computed(() => (props.trend.length > 1 ? (PR - PL) / (props.trend.length - 1) : 0));
/** y 轴上界：最大值上浮 12% 留头部空间；空数据兜底 1 防除零 */
const vmax = computed(() => {
  const m = props.trend.length ? Math.max(...props.trend) : 0;
  return m > 0 ? m * 1.12 : 1;
});
const xs = computed(() => props.trend.map((_, i) => PL + i * step.value));
const ys = computed(() => props.trend.map((v) => PB - (v / vmax.value) * (PB - PT)));
const pointsStr = computed(() => xs.value.map((x, i) => `${x.toFixed(1)},${ys.value[i].toFixed(1)}`).join(' '));
/** 面积路径：基线起点 → 各数据点 → 基线终点闭合 */
const areaPath = computed(() => {
  if (!xs.value.length) return '';
  const line = xs.value.map((x, i) => `L ${x.toFixed(1)} ${ys.value[i].toFixed(1)}`).join(' ');
  return `M ${PL} ${PB} ${line} L ${PR} ${PB} Z`;
});
/** 月份刻度：每 3 个月一个 + 末月，避免 12 个标签挤在一起 */
const monthTicks = computed(() =>
  xs.value
    .map((x, i) => ({ x, label: props.trendMonths[i] ?? '', show: i % 3 === 0 || i === props.trend.length - 1 }))
    .filter((t) => t.show),
);
/** 气泡定位：把命中点的 viewBox 坐标换算成容器百分比（top 设下限防溢出） */
const tipStyle = computed(() => {
  if (hoverIdx.value < 0 || !xs.value.length) return {};
  const i = Math.min(hoverIdx.value, xs.value.length - 1);
  return {
    left: `${(xs.value[i] / VW) * 100}%`,
    top: `${Math.max(16, (ys.value[i] / VH) * 100)}%`,
  };
});
</script>

<style scoped>
.map-dash {
  /* 位置由外部 .china3d-rail 决定：夹在纵向末尾，自然落在栏底 */
  position: relative;
  flex: 0 0 auto;
  width: 300px;
  /* 与「可视化控制台」配比：控制台 36%，看板 30%，余下留给区域详情 */
  max-height: 30%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 12px 14px 14px;
  background: rgba(6, 16, 40, 0.8);
  border: 1px solid rgba(95, 216, 255, 0.22);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.03);
  color: #dcefff;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  user-select: none;
}
.map-dash--collapsed {
  width: auto;
  max-height: none;
  min-height: 0;
}
.map-dash__head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #eaf6ff;
  text-shadow: 0 0 10px rgba(54, 224, 255, 0.5);
  white-space: nowrap;
}
.map-dash__pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #5fd8ff;
  box-shadow: 0 0 8px #5fd8ff;
  animation: map-dash-blink 1.6s ease-in-out infinite;
}
@keyframes map-dash-blink {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
.map-dash__title {
  flex: 0 0 auto;
}
.map-dash__scope {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0;
  color: #6f9fc4;
  text-align: right;
}
.map-dash__chev {
  font-size: 12px;
  color: #6f9fc4;
}
.map-dash__body {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
}
/* ---- KPI 行 ---- */
.map-dash__kpis {
  display: flex;
  gap: 8px;
}
.map-dash__kpi {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 4px;
  border-radius: 8px;
  background: rgba(120, 150, 180, 0.08);
  border: 1px solid rgba(95, 216, 255, 0.1);
}
.map-dash__kpi-num {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  color: #fff;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 10px rgba(95, 216, 255, 0.45);
}
.map-dash__kpi-label {
  font-size: 10px;
  letter-spacing: 1px;
  color: #7fa8c8;
}
/* ---- 小节标题 ---- */
.map-dash__secHead {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.map-dash__secTitle {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #9fc4e0;
  white-space: nowrap;
}
.map-dash__secNote {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
  color: #6f9fc4;
  text-align: right;
}
/* ---- 区域排行 TOP6 ---- */
.map-dash__ranks {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.map-dash__rankRow {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border: none;
  border-radius: 6px;
  background: rgba(120, 150, 180, 0.08);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  overflow: hidden;
}
.map-dash__rankRow:hover {
  background: rgba(120, 150, 180, 0.18);
}
.map-dash__rankRow--active {
  background: rgba(47, 192, 255, 0.12);
  box-shadow: inset 0 0 0 1px rgba(95, 216, 255, 0.6);
}
.map-dash__rankNo {
  flex: 0 0 16px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  background: rgba(95, 216, 255, 0.14);
  color: #8fb8d6;
}
.map-dash__rankNo--1 {
  background: rgba(255, 190, 64, 0.2);
  color: #ffd98a;
  box-shadow: 0 0 8px rgba(255, 190, 64, 0.35);
}
.map-dash__rankNo--2 {
  background: rgba(210, 225, 240, 0.18);
  color: #dcefff;
}
.map-dash__rankNo--3 {
  background: rgba(255, 150, 90, 0.16);
  color: #ffb894;
}
.map-dash__rankName {
  flex: 0 0 62px;
  font-size: 11px;
  color: #dcefff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.map-dash__rankTrack {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(120, 150, 180, 0.14);
  overflow: hidden;
}
.map-dash__rankFill {
  display: block;
  height: 100%;
  border-radius: 3px;
  box-shadow: 0 0 6px currentColor;
  transition: width 0.4s ease;
}
.map-dash__rankValue {
  flex: 0 0 26px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.map-dash__rankDrill {
  flex: 0 0 auto;
  font-size: 11px;
  color: #4d7ea3;
}
/* ---- 近 12 月趋势 ---- */
.map-dash__trend {
  position: relative;
}
.map-dash__trendSvg {
  display: block;
  width: 100%;
}
.map-dash__trendArea {
  transition: d 0.3s ease;
}
.map-dash__trendLine {
  fill: none;
  stroke: #5fd8ff;
  stroke-width: 1.6;
  stroke-linejoin: round;
  stroke-linecap: round;
  filter: drop-shadow(0 0 4px rgba(95, 216, 255, 0.7));
}
.map-dash__trendBase {
  stroke: rgba(95, 216, 255, 0.18);
  stroke-width: 1;
}
.map-dash__trendActive {
  stroke: rgba(255, 214, 120, 0.85);
  stroke-width: 1.4;
  stroke-dasharray: 3 2;
}
.map-dash__trendDot {
  fill: #0a1e33;
  stroke: #8fe9ff;
  stroke-width: 1;
  transition: r 0.15s ease;
}
.map-dash__trendDot--hot {
  fill: #eaf6ff;
}
.map-dash__trendPulse {
  fill: #8fe9ff;
  transform-box: fill-box;
  transform-origin: center;
  animation: map-dash-pulse 2s ease-in-out infinite;
}
@keyframes map-dash-pulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.6);
  }
}
.map-dash__trendMonth {
  fill: #5b86a8;
  font-size: 8.5px;
  text-anchor: middle;
}
.map-dash__trendLast {
  fill: #8fe9ff;
  font-size: 10px;
  font-weight: 700;
}
.map-dash__tip {
  position: absolute;
  transform: translate(-50%, -135%);
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(6, 16, 30, 0.92);
  border: 1px solid rgba(143, 235, 255, 0.45);
  color: #cfe9ff;
  font-size: 11px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
}
.map-dash__tip b {
  margin-left: 6px;
  color: #8fe9ff;
  font-variant-numeric: tabular-nums;
}
.map-dash__empty {
  font-size: 11px;
  color: #6f9fc4;
  padding: 6px 2px;
}
</style>
