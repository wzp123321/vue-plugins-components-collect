<!--
 * threejs-china-3d-map.vue — Three.js 立体中国地图「页面级入口」
 * ---------------------------------------------------------------
 * 职责：演示页面容器。本身不持有任何 Three.js 逻辑，只负责：
 *   1. 装配主组件 ChinaMap3D（真实 3D 场景所在）；
 *   2. 装配可视化控制台 MapControlPanel，通过 v-model 双向下发控制参数；
 *   3. 生成一份演示用的「项目数」数据 projectData，按省份 adcode 映射数值，
 *      驱动数据柱高度与分级配色；
 *   4. 装配右下角「数据看板」MapDashBoard：把当前层级的 KPI / TOP6 排行 /
 *      近 12 月趋势做成图表，并借 mapRef 与 3D 地图双向联动（悬浮/点击条目
 *      高亮或下钻地图、地图侧选中/悬停反向切换趋势口径）；
 *   5. 装配「交互说明」悬浮图标 MapHintFab：原先常驻右下角的四行提示收进
 *      图标悬浮框，把右下角空间让给数据看板。
 * 架构角色：位于本功能的最外层；所有交互/渲染细节都下沉到 ChinaMap3D 及其
 *   composables。这里只做"参数下发 + 演示数据注入 + 图表联动编排"，便于把
 *   地图当成一个可复用的子组件嵌入其它页面。
 * 协作模块：
 *   - ChinaMap3D：3D 地图主组件（核心编排层）
 *   - MapControlPanel：右上角可视化控制台（拖拽模式 / 数据柱 / 飞线）
 *   - MapDetailPanel：右侧区域详情面板（下级行政区条形图）
 *   - MapDashBoard：右下角数据看板（KPI / TOP6 排行 / 月度趋势，双向联动）
 *   - MapHintFab：右下角交互说明悬浮图标
 -->
<template>
  <div class="china3d-page" :class="{ 'china3d-page--light': theme === 'light' }">
    <ChinaMap3D
      ref="mapRef"
      :project-data="projectData"
      :theme="theme"
      :show-column="showColumn"
      :column-color="columnColor"
      :show-flyline="showFlyline"
      :flyline-color="flylineColor"
      :flyline-speed="flylineSpeed"
      :drag-mode="dragMode"
      :show-pyramid="showPyramid"
      :show-orbit="showOrbit"
      :show-heatmap="showHeatmap"
      :show-pie="showPie"
      :show-wall-scan="showWallScan"
      :label-mode="labelMode"
      :filter-threshold="filterThreshold"
      :timeline-playing="timelinePlaying"
      :timeline-month="timelineMonth"
      :timeline-speed="timelineSpeed"
      @level-change="onLevelChange"
      @select-change="onSelectChange"
      @hover-change="onHoverChange"
      @timeline-month-change="timelineMonth = $event"
      @update:timeline-playing="timelinePlaying = $event"
    />
    <MapControlPanel
      v-model:drag-mode="dragMode"
      v-model:show-column="showColumn"
      v-model:column-color="columnColor"
      v-model:show-flyline="showFlyline"
      v-model:flyline-color="flylineColor"
      v-model:flyline-speed="flylineSpeed"
      v-model:show-pyramid="showPyramid"
      v-model:show-orbit="showOrbit"
      v-model:show-heatmap="showHeatmap"
      v-model:show-pie="showPie"
      v-model:show-wall-scan="showWallScan"
      v-model:label-mode="labelMode"
      v-model:filter-threshold="filterThreshold"
      v-model:theme="theme"
    />
    <MapDetailPanel
      :region-name="currentName"
      :region-level="currentLevelKey"
      :level-text="currentLevelText"
      :sub-regions="subRegions"
      :total="detailTotal"
      :max-value="detailMax"
      :selected-adcode="selectedAdcode"
      @drill="onPanelDrill"
      @select="onPanelSelect"
      @reset="onPanelReset"
    />
    <!-- 右下角数据看板：DIY 图表 + 与地图双向联动（替代原先的提示文字占位） -->
    <MapDashBoard
      :scope-name="currentName"
      :sub-regions="subRegions"
      :selected-adcode="selectedAdcode"
      :trend="trend"
      :trend-label="trendLabel"
      :trend-months="trendMonths"
      :active-month="timelineMonth"
      @drill="onPanelDrill"
      @select="onPanelSelect"
    />
    <!-- 底部时间轴控制条：播放/暂停 + 滑块 + 倍速，驱动 3D 柱高按月演化 -->
    <MapTimeline
      v-model:playing="timelinePlaying"
      v-model:month="timelineMonth"
      v-model:speed="timelineSpeed"
      :months="trendMonths"
    />
    <!-- 右下角交互说明：图标 + 悬浮说明框 -->
    <MapHintFab />
    <div class="china3d-overlay">
      <div class="china3d-title">
        <span class="china3d-title__main">全国数据分布 · 3D 地图</span>
        <span class="china3d-title__sub">Three.js 立体中国地图 · 双击下钻省/市 · 底部按钮返回上级</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import ChinaMap3D from './china-map-3d/components/ChinaMap3D.vue';
import MapControlPanel from './china-map-3d/components/MapControlPanel.vue';
import MapDetailPanel from './china-map-3d/components/MapDetailPanel.vue';
import MapDashBoard from './china-map-3d/components/MapDashBoard.vue';
import MapHintFab from './china-map-3d/components/MapHintFab.vue';
import MapTimeline from './china-map-3d/components/MapTimeline.vue';
import { syntheticCount, readCount, monthlySeries, recentMonthLabels } from './china-map-3d/utils/data';
import type { GeoJsonFeature } from './china-map-3d/types';
import chinaGeo from '@/assets/geojson/china.json';

// 可视化控制参数（右上角控制台双向绑定）。这些 ref 即 ChinaMap3D 的 props，
// 通过 v-model 下发；改任意一项都会触发 ChinaMap3D 内对应的 watch 即时生效。
const showColumn = ref(true);
const columnColor = ref('#5FC9EE');
const showFlyline = ref(true);
const flylineColor = ref('#7FD4F5');
const flylineSpeed = ref(0.2);
const dragMode = ref<'pan' | 'rotate'>('pan');
// 展示型特效开关（下发到 ChinaMap3D，并由右上角控制台双向调节）
// 棱锥/热力默认关：避免与数据柱空间重叠显得杂乱；轨道环/饼图默认开（不与数据柱冲突）
const showPyramid = ref(false);
const showOrbit = ref(true);
const showHeatmap = ref(false);
const showPie = ref(true);
const showWallScan = ref(false);
const labelMode = ref<'sprite' | 'css2d'>('sprite');
// 阈值聚焦比例（0~1，相对当前层最大值）：下发到 ChinaMap3D，由右上角控制台调节
const filterThreshold = ref(0);
// 主题（暗/亮）：下发到 ChinaMap3D（覆写 mapConfig 配色并重绘板块），
// 同时切换页面底色，避免"亮色地图配漆黑背景"的割裂感
const theme = ref<'dark' | 'light'>('dark');
// 时间轴（Play）：播放态 / 当前月 / 倍速，下发到 ChinaMap3D 并由其回传月份
const timelinePlaying = ref(false);
const timelineMonth = ref(11);
const timelineSpeed = ref(1);

// 演示数据：给每个省份一个随机"项目数"，驱动数据柱高度与配色。
// 真实业务中应替换为后端按 adcode 返回的统计值。
const projectData = ref<Record<number, number>>({});
onMounted(() => {
  const data: Record<number, number> = {};
  for (const feature of (chinaGeo as any).features) {
    const adcode = Number(feature.properties.adcode);
    if (!adcode) continue;
    // 4~83 之间的随机整数：作为数据柱高度的原始计数（base 4 避免零高柱）
    data[adcode] = 4 + Math.floor(Math.random() * 80);
  }
  projectData.value = data;
});

// ---- 右侧「区域详情」面板：3D ↔ 图表数据交互 ----
// mapRef 指向 ChinaMap3D 实例，用来读取当前层级、驱动下钻/高亮/复位。
const mapRef = ref<any>(null);

// 当前层级概要（随 ChinaMap3D 的 level-change 同步）
const currentName = ref('全国');
const currentLevelKey = ref<string>('country');
const selectedAdcode = ref<number | null>(null);
// 地图侧当前悬停的 adcode：趋势图在「无选中」时跟随它切换口径（地图 → 图表的联动源）
const hoveredAdcode = ref<number | null>(null);

const LEVEL_TEXT_MAP: Record<string, string> = {
  country: '国家',
  province: '省',
  city: '市',
  district: '区/县',
};
const currentLevelText = computed(() => LEVEL_TEXT_MAP[currentLevelKey.value] ?? '');

/**
 * subRegions — 当前层级的「下级行政区 + 项目数」，供详情面板画条形图。
 * 数据取 projectData（与 3D 标记同一份）；缺失的下级 adcode 用 syntheticCount
 * 按 adcode 确定性补数（不抖动），保证下钻到任意层级后面板都有内容、且与 3D 一致。
 */
const subRegions = computed(() => {
  const lvl = mapRef.value?.currentLevel?.() as any;
  const feats: any[] = lvl?.geo?.features ?? [];
  return feats
    .filter((f) => f?.properties?.name)
    .map((f) => {
      const adcode = Number(f.properties.adcode);
      const value = readCount(projectData.value[adcode]) || syntheticCount(adcode, f.properties.level);
      const drillable = (f.properties.childrenNum ?? 0) > 0;
      return { adcode, name: String(f.properties.name), value, drillable };
    })
    .sort((a: any, b: any) => b.value - a.value);
});

const detailTotal = computed(() => subRegions.value.reduce((s: number, r: any) => s + r.value, 0));
const detailMax = computed(() => subRegions.value.reduce((m: number, r: any) => Math.max(m, r.value), 0));

// ---- 右下角「数据看板」：月度趋势数据（与地图选/悬停联动） ----
/** 趋势横轴月份标签（页面加载算一次：近 12 个月，以当前月收尾） */
const trendMonths = recentMonthLabels(12);

/**
 * trendTarget — 趋势图当前口径：优先地图选中项，其次地图悬停项，都没有则走
 * 「当前层级合计」。候选 adcode 必须在当前层级的 subRegions 里（下钻后旧的
 * 选中可能已不在本层，这里自动回落到下一优先级，避免趋势图显示幽灵区域）。
 */
const trendTarget = computed(() => {
  const pick = (adcode: number | null) => {
    if (adcode == null) return null;
    const region = subRegions.value.find((r) => r.adcode === adcode);
    return region ? { adcode: region.adcode, name: region.name, value: region.value } : null;
  };
  return pick(selectedAdcode.value) ?? pick(hoveredAdcode.value);
});

/** trendLabel — 趋势口径名：具体区域名，或「当前层级 · 合计」 */
const trendLabel = computed(() => (trendTarget.value ? trendTarget.value.name : `${currentName.value} · 合计`));

/**
 * trend — 近 12 月项目增量序列：
 *   - 区域口径：monthlySeries(adcode, value) 直接生成（按 adcode 确定性，来回切换不抖动）；
 *   - 合计口径：当前层级各下级的月度序列逐月求和，与区域口径同一数据源、量级自洽。
 */
const trend = computed(() => {
  const target = trendTarget.value;
  if (target) return monthlySeries(target.adcode, target.value);
  const sums = new Array(12).fill(0);
  subRegions.value.forEach((region) => {
    const series = monthlySeries(region.adcode, region.value);
    for (let i = 0; i < sums.length; i++) sums[i] += series[i];
  });
  return sums;
});

/**
 * onLevelChange — ChinaMap3D 下钻/返回/跳级后回调：同步概要，并为缺失的下级
 * adcode 补一份确定性数据（让 3D 标记与详情面板共用同一数据源）。
 */
const onLevelChange = (info: { name: string; level: string; adcode: number | null }) => {
  currentName.value = info?.name || '全国';
  currentLevelKey.value = info?.level || 'country';
  const lvl = mapRef.value?.currentLevel?.() as any;
  const feats: any[] = lvl?.geo?.features ?? [];
  const patch: Record<number, number> = {};
  for (const f of feats) {
    const adcode = Number(f?.properties?.adcode);
    if (!adcode) continue;
    if (projectData.value[adcode] == null) patch[adcode] = syntheticCount(adcode, f.properties.level);
  }
  if (Object.keys(patch).length) projectData.value = { ...projectData.value, ...patch };
};

/** onSelectChange — 3D 中单击选中区域时，同步高亮面板对应条 */
const onSelectChange = (adcode: number | null) => {
  selectedAdcode.value = adcode;
};

/**
 * onHoverChange — 3D 悬停区域时记录 adcode：趋势图在无选中时跟随悬停切换口径。
 * 悬停到空白（null）自动回到「当前层级合计」。
 */
const onHoverChange = (properties: GeoJsonFeature['properties'] | null) => {
  const adcode = Number(properties?.adcode);
  hoveredAdcode.value = Number.isFinite(adcode) && adcode > 0 ? adcode : null;
};

// 面板 → 3D 的反向联动：点条下钻 / 悬浮高亮 / 返回全国
const onPanelDrill = (adcode: number) => mapRef.value?.drillByAdcode?.(String(adcode));
const onPanelSelect = (adcode: number | null) => mapRef.value?.selectByAdcode?.(adcode);
const onPanelReset = () => mapRef.value?.resetToCountry?.();
</script>

<style scoped>
.china3d-page {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 38%, #05173e 0%, #030f2a 55%, #01060f 100%);
}
.china3d-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  color: #cfe9ff;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.china3d-title {
  position: absolute;
  /* 左上角主位让给搜索框（MapSearchBox 固定在 16,16），标题顺移到其正下方 */
  top: 62px;
  left: 16px;
  display: flex;
  flex-direction: column;
}
.china3d-title__main {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #eaf6ff;
  text-shadow: 0 0 12px rgba(54, 224, 255, 0.6);
}
.china3d-title__sub {
  margin-top: 4px;
  font-size: 12px;
  color: #6f9fc4;
}
/* 亮色主题：页面底色与标题同步改浅，避免「亮色地图 + 漆黑背景」的割裂感。
   各功能面板本身是深色玻璃拟态，在浅底上依然可读，故不逐个改写。 */
.china3d-page--light {
  background: radial-gradient(circle at 50% 38%, #f2f9ff 0%, #e0edf8 55%, #cbdded 100%);
}
.china3d-page--light .china3d-title__main {
  color: #0a2942;
  text-shadow: 0 0 12px rgba(120, 190, 235, 0.45);
}
.china3d-page--light .china3d-title__sub {
  color: #4d7793;
}
</style>
