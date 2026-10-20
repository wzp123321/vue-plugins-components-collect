<!--
 * ChinaMap3D.vue — Three.js 立体中国地图「主组件 / 核心编排层」
 * ---------------------------------------------------------------
 * 职责：作为 3D 地图的"总装车间"，把多个 composable 编排到一起，真正持有
 *       Three.js 场景与渲染循环，并对外暴露统一的下钻 / 定位 / 复位 API。
 *   具体装配：
 *     - 渲染视口 viewport（相机 / 渲染器 / 控制器 / 渲染循环）
 *     - 图层 layer（GeoJSON → 三维网格、下钻重建、选择性泛光）
 *     - 标记 markers（数据柱 / 地理标牌）
 *     - 飞线 flies（流星飞线）
 *     - 指针拾取 picker（悬停 / 单击 / 双击）
 *     - 缩放下钻 zoom（滚轮触发）
 *     - 层级栈 levels（下钻 / 返回 / 跳级 / 合规校验）
 * 架构角色：位于 threejs-china-3d-map 页面之下；所有 UI 小组件
 *   (MapControlPanel / MapLegend / MapNavBar / MapSearchBox / MapStageTip /
 *   MapTooltip) 都只负责呈现，数据来自本组件的 props / computed。
 * 协作模块：见下方各 composable 引用的 JSDoc。
 *
 * ⚠️ 关键架构约定（务必遵守，违反会导致视觉/交互异常）：
 *   1. 下钻 = 重建地图，不是相机飞入。fitProjection() 把任意层级 GeoJSON
 *      投影后最大边长归一到 MAP_EXTENT=130 世界单位，全国/省/市三级共用同一
 *      套相机距离等参数。层级栈 history[] 末尾为当前层；返回上级即 pop 后重建。
 *   2. 相机必须 camera.up.set(0,0,1)：地图躺在 XY 平面（Z 朝上），
 *      OrbitControls 默认 Y-up 会让拖拽旋转变成翻面；改用 Z-up +
 *      minPolarAngle/maxPolarAngle 限幅永不翻面。
 *   3. 左键默认 PAN（上下拖＝远近），右键旋转；clampTarget 把视点夹在 ±130
 *      内并让相机同步补偿，避免地图被拖出画面。
 *   4. HMR 会残留画布：canvas 由 viewport 以 appendChild 注入容器（不在模板
 *      里），旧实例 unmount 不会摘 DOM → 两块 canvas 叠加。mount 时先清空
 *      容器内 canvas、unmount 时 canvas.remove()。
 *   5. 选择性泛光用相机图层切换（camera.layers.set(1) 渲 bloom → set(0) 主画面）。
 *   6. 标记位置用 properties.center，不要用 centroid。
 *   7. 地理标牌在数据柱模式下默认全部收起，单击城市才显示该城市标牌。
 -->
<template>
  <div class="china-map-3d-wrapper">
    <!--
      大屏底图（A）：2D 层，铺在 canvas 之下。canvas 是 alpha:true + clearColor(0,0,0,0)，
      所以这层能透上来。传了 bgImage 就用外部设计图，没传则用内置程序化底图（按主题两套）。
    -->
    <div
      class="map-bg-image"
      :class="[
        `map-bg-image--${theme}`,
        { 'map-bg-image--hidden': !showBgImage, 'map-bg-image--custom': !!resolvedBgImage },
      ]"
      :style="bgImageStyle"
      aria-hidden="true"
    >
      <span class="map-bg-image__veil"></span>
    </div>
    <div ref="canvasHost" class="china-map-3d-canvas"></div>

    <!-- 框选矩形（Shift + 拖拽实时绘制） -->
    <div v-if="boxRect" class="map-box-select" :style="boxStyle"></div>
    <!-- 批量统计浮层：框选 / 多选后展示合计与占比 -->
    <div v-if="selectionStats" class="map-sel-stats">
      <span class="map-sel-stats__item">已选 <b>{{ selectionStats.count }}</b> 区</span>
      <span class="map-sel-stats__item">合计 <b>{{ selectionStats.sum }}</b></span>
      <span class="map-sel-stats__item">占比 <b>{{ (selectionStats.ratio * 100).toFixed(1) }}%</b></span>
      <button type="button" class="map-sel-stats__clear" @click="selectAdcode(null)">清空</button>
    </div>

    <!-- 测量提示条：进入测量模式或存在测点时出现 -->
    <div v-if="measureOn || measurePoints > 0" class="map-measure">
      <span class="map-measure__title">测量</span>
      <span class="map-measure__num">{{ measurePoints }} 点</span>
      <button type="button" class="map-measure__btn" :disabled="!measurePoints" @click="clearMeasure">清空</button>
      <button v-if="measureOn" type="button" class="map-measure__btn" @click="measureOn = false">退出</button>
    </div>

    <MapSearchBox
      v-if="showSearch"
      ref="searchRef"
      :items="searchItems"
      :disabled="busy"
      @pick="handleSearchPick"
      @search="handleSearchKeyword"
    />
    <MapTooltip v-bind="tooltip" />
    <!--
      左下角信息栏：饼图在上、图例在下，共用同一条左边缘与间距。
      原先两块各自 absolute 写死 bottom（150 / 22），间距靠数字去猜、左边缘还差 6px。
    -->
    <div class="map-left-rail">
      <MapPieChart v-if="showPie" :segments="pie" title="数据分档" />
      <MapLegend :items="legend" />
    </div>
    <MapNavBar :crumbs="crumbs" @back="handleBack" @jump="handleJump" />
    <MapStageTip :stage="stage" :notice="notice" :raised="canGoBack" />
    <MapBookmarkPanel
      v-if="showBookmarks"
      :items="bookmarks"
      @save="saveBookmark"
      @apply="applyBookmark"
      @remove="deleteBookmark"
      @close="showBookmarks = false"
    />
    <MapToolbar
      v-model:roam="roamOn"
      v-model:measure="measureOn"
      :bookmarks="showBookmarks"
      :current="currentView"
      @view="handleViewPreset"
      @bookmarks="showBookmarks = !showBookmarks"
      @fullscreen="toggleFullscreen"
      @screenshot="doScreenshot"
      @help="showHelp = true"
    />
    <MapHelpDialog v-model:visible="showHelp" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import * as THREE from 'three';
import MapTooltip from './MapTooltip.vue';
import MapLegend from './MapLegend.vue';
import MapNavBar from './MapNavBar.vue';
import MapStageTip from './MapStageTip.vue';
import MapSearchBox from './MapSearchBox.vue';
import type { SearchItem } from './MapSearchBox.vue';
import { useMapViewport } from '../composables/useMapViewport';
import { useMapLayer } from '../composables/useMapLayer';
import type { MapLevel } from '../composables/useMapLayer';
import { useMapLevels } from '../composables/useMapLevels';
import { useSpotMarkers } from '../composables/useSpotMarkers';
import { useFlyLines } from '../composables/useFlyLines';
import { usePointerPick } from '../composables/usePointerPick';
import type { PickResult } from '../composables/usePointerPick';
import { useZoomDrill } from '../composables/useZoomDrill';
import { LEVEL_TEXT, readCount } from '../utils/data';
import { checkCountryCompliance } from '../utils/geo';
import { prefetchDistrictGeoJson } from '../utils/amap-loader';
import { mapConfig } from '../utils/mapConfig';
import type { GeoJsonFeature } from '../types';
import MapPieChart from './MapPieChart.vue';
import MapToolbar from './MapToolbar.vue';
import MapHelpDialog from './MapHelpDialog.vue';
import MapBookmarkPanel from './MapBookmarkPanel.vue';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { updateRegionScan, setRegionScan } from '../utils/drawRegion';
import { usePyramidMarkers } from '../composables/usePyramidMarkers';
import { useOrbitRoutes } from '../composables/useOrbitRoutes';
import { useHeatmap } from '../composables/useHeatmap';
import { useCss2dLabels } from '../composables/useCss2dLabels';
import { useMeasure } from '../composables/useMeasure';
import { useGroundPlane } from '../composables/useGroundPlane';
import { addBookmark, loadBookmarks, removeBookmark } from '../utils/viewBookmarks';
import type { ViewBookmark } from '../utils/viewBookmarks';

// 大屏底图预设：静态图片统一走 assets/backgrounds，用 import 让 Vite 参与哈希与按需加载
import bgHorizon from '../../../../../assets/backgrounds/horizon.webp';
import bgTopo from '../../../../../assets/backgrounds/topo.webp';
import bgHex from '../../../../../assets/backgrounds/hex.webp';
import bgCloud from '../../../../../assets/backgrounds/cloud.webp';

/** 预设名 → 图片地址；builtin 不在表内，回退到 CSS 程序化底图 */
const BG_PRESETS: Record<string, string> = {
  horizon: bgHorizon,
  topo: bgTopo,
  hex: bgHex,
  cloud: bgCloud,
};

/**
 * 预加载全部预设底图：4 张 webp 合计约 242KB。
 * 不预热的话，首次切到某个预设会有一帧空白（背景图正在下载，DOM 已切换）。
 * 这里只创建 Image 并给 src，浏览器把响应放进 HTTP 缓存，切换时即命中。
 */
const preloadBgPresets = () => {
  for (const url of Object.values(BG_PRESETS)) {
    if (!url) continue;
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
  }
};

const props = withDefaults(
  defineProps<{
    initialAdcode?: string;
    maxDrillLevel?: 'province' | 'city' | 'district';
    zoomDrillEnabled?: boolean;
    zoomDrillThreshold?: number;
    deferEntrance?: boolean;
    projectData?: Record<number, number | { count: number; names: string[]; ids: string[] }>;
    /** 是否显示数据柱（关闭时改为显示地理位置标牌） */
    showColumn?: boolean;
    /** 数据柱高值档颜色（分级色板以它为高值锚点） */
    columnColor?: string;
    showFlyline?: boolean;
    flylineColor?: string;
    flylineSpeed?: number;
    /** 是否显示搜索框（在当前层级内搜索行政区） */
    showSearch?: boolean;
    /** 左键拖拽行为：pan=拖动地图（上下拖即远近），rotate=绕地图旋转 */
    dragMode?: 'pan' | 'rotate';
    /** 展示型装饰：动态棱锥点位 */
    showPyramid?: boolean;
    /** 展示型装饰：轨道路线 + 卫星 */
    showOrbit?: boolean;
    /** 展示型装饰：高度热力图 */
    showHeatmap?: boolean;
    /** 标签渲染模式：sprite=现有 Sprite 卡片；css2d=DOM 高清标签 */
    labelMode?: 'sprite' | 'css2d';
    /** 是否显示分档饼图卡片 */
    showPie?: boolean;
    /** 展示型装饰：侧壁扫描流光 */
    showWallScan?: boolean;
    /** 阈值聚焦比例（0~1，相对当前层最大值）：低于该值的柱体淡出，0 = 不过滤 */
    filterThreshold?: number;
    /** 时间轴：是否自动播放（页面层播放/暂停按钮下发） */
    timelinePlaying?: boolean;
    /** 时间轴：当前月份下标 0~11（页面层滑块下发；自动播放时由组件回传） */
    timelineMonth?: number;
    /** 时间轴：播放速度（月/秒），默认 1 */
    timelineSpeed?: number;
    /** 主题（暗/亮），切换时覆写地图配色并重新上色 */
    theme?: 'dark' | 'light';
    /** 大屏底图（2D）：外部设计图 URL；不传则回退到 bgPreset 预设，再回退到内置 CSS 渐变 */
    bgImage?: string;
    /** 内置底图预设：builtin=程序化渐变，其余为 assets/backgrounds 下的静态图 */
    bgPreset?: 'builtin' | 'horizon' | 'topo' | 'hex' | 'cloud';
    /** 是否显示大屏底图（2D）。关闭后露出页面底色 */
    showBgImage?: boolean;
    /** 是否显示三维底板（3D 透视网格盘）。与大屏底图可各自独立开关 */
    showGroundPlane?: boolean;
    /**
     * 大屏底图强度（0~1）。canvas 上的地图/飞线/星空会压暗底图，
     * 两者同开时往往需要把它调低或调高来配平观感。0 等价于关闭。
     */
    bgOpacity?: number;
  }>(),
  {
    maxDrillLevel: 'district',
    zoomDrillEnabled: false,
    zoomDrillThreshold: 0.4,
    deferEntrance: false,
    showColumn: true,
    columnColor: '#5FC9EE',
    showFlyline: true,
    flylineColor: '#7FD4F5',
    flylineSpeed: mapConfig.fly.speed,
    showSearch: true,
    dragMode: 'pan',
    showPyramid: false,
    showOrbit: true,
    showHeatmap: false,
    labelMode: 'sprite',
    showPie: true,
    showWallScan: false,
    filterThreshold: 0,
    timelinePlaying: false,
    timelineMonth: 11,
    timelineSpeed: 1,
    theme: 'dark',
    bgImage: '',
    bgPreset: 'builtin',
    showBgImage: true,
    showGroundPlane: true,
    bgOpacity: 1,
  },
);

const emit = defineEmits<{
  (e: 'drill-down', properties: GeoJsonFeature['properties']): void;
  (e: 'ready'): void;
  (e: 'geo-data-loaded', geoJson: unknown): void;
  (e: 'reset-to-country'): void;
  (e: 'level-change', level: { name: string; level: MapLevel['level']; adcode: number | null }): void;
  (e: 'hover-change', properties: GeoJsonFeature['properties'] | null): void;
  (e: 'select-change', adcode: number | null): void;
  (e: 'error', error: unknown): void;
  /** 时间轴：自动播放时组件把当前月份回传给页面（驱动滑块/看板高亮） */
  (e: 'timeline-month-change', month: number): void;
  /** 时间轴：播放到末尾自动停止时，把 playing 回传 false 让页面同步按钮态 */
  (e: 'update:timelinePlaying', playing: boolean): void;
}>();

// 画布容器 host：渲染器创建的 <canvas> 会 appendChild 进这里（不在模板里），
// ⚠️ 坑④：HMR 残留画布就发生在这个容器上，需在 viewport 内做 mount 清空。
const canvasHost = ref<HTMLDivElement | null>(null);

/**
 * 大屏底图（A）内联样式：传了 bgImage 才覆盖内置程序化底图；
 * 没传就只有强度变量，背景由 .map-bg-image--dark / --light 里的 CSS 渐变兜底。
 */
const resolvedBgImage = computed(() => props.bgImage || BG_PRESETS[props.bgPreset] || '');
/**
 * 底图内联样式：图 URL + 强度变量。
 * ⚠️ 强度走 CSS 变量 `--bg-opacity` 而不是直接写 opacity ——
 *   内联的 opacity 优先级高于样式表，会把 `.map-bg-image--hidden` 的 0 覆盖掉。
 */
const bgImageStyle = computed<Record<string, string>>(() => ({
  ...(resolvedBgImage.value ? { backgroundImage: `url("${resolvedBgImage.value}")` } : {}),
  '--bg-opacity': String(Math.min(1, Math.max(0, props.bgOpacity))),
}));

// ── 框选 / 多选 / 批量统计 / 画框缩放（P0 交互）──
/** Shift 修饰键：按住时左键拖拽进入框选模式，并临时禁用轨道控制器 */
const shiftDown = ref(false);
/** 框选矩形（相对容器像素），null = 无 */
const boxRect = ref<{ x: number; y: number; w: number; h: number } | null>(null);
/** 当前选中集合（与 layer.selectedSet 同步，供统计浮层渲染） */
const selectedAdcodes = ref<number[]>([]);
/** CSS2D 标签渲染器：与 WebGL 共用 canvas 宿主，把 CSS2DObject 投影成 DOM 标签 */
let css2dRenderer: CSS2DRenderer | null = null;
// 搜索框实例引用，供键盘 "/" 聚焦使用。
const searchRef = ref<InstanceType<typeof MapSearchBox> | null>(null);
/** 帮助面板可见性（F1 / 工具栏「?」切换） */
const showHelp = ref(false);
/** 自动巡游开关（与工具栏 v-model:roam 同步） */
const roamOn = ref(false);
/** 当前视角预设（高亮工具栏分段按钮） */
const currentView = ref<'top' | 'oblique' | 'front'>('oblique');

/**
 * viewport — 渲染视口（相机 / 渲染器 / OrbitControls / 渲染循环）。
 * @param getter 返回挂载用的容器元素（canvas 注入目标）。
 * @returns 暴露 camera/controls/scene/raycaster/pointer/canvas 等，并提供
 *   start/stop/setDragMode/focus/onTick。
 * ⚠️ 坑②：内部已 camera.up.set(0,0,1) 设 Z-up，并 clampTarget 把视点夹在
 *   ±130 内（坑③）；canvas 由它 appendChild（坑④）。
 */
const viewport = useMapViewport(() => canvasHost.value);

/**
 * layer — 图层构建（GeoJSON → 三维网格、下钻重建、选择性泛光）。
 * @param sceneGetter 返回 viewport 的 scene，作为所有三维对象的挂载根。
 * ⚠️ 坑①：build() 即"下钻=重建地图"，fitProjection 把任意层级最大边长归一到
 *   MAP_EXTENT=130；⚠️ 坑⑤：泛光用相机图层切换实现选择性发光。
 */
const layer = useMapLayer(() => viewport.scene());

/**
 * ground — 三维底板（B）：地图下方随视角透视的网格盘。
 * 常驻 scene、不随层级重建（与星空同级别），仅受 showGroundPlane / theme 影响。
 * 与大屏底图（A，屏幕平面的 2D 层）互补，两者可独立开关、也可叠加。
 */
const ground = useGroundPlane(() => viewport.scene());

/**
 * markers — 标记层（数据柱 / 地理标牌）。
 * @param getRoot 三维对象挂载根（与 layer.root() 同一场景）。
 * @param projectData 按 adcode 映射的项目数/统计值，驱动柱高与分级配色。
 * @param columnColor 数据柱高值档锚点色。
 * @param showColumn true=数据柱模式，false=地理标牌模式。
 * ⚠️ 坑⑥：标记落点取 properties.center（不要用 centroid）；
 * ⚠️ 坑⑦：地理标牌在 showColumn=false 时默认全部收起，单击城市才显示该城市标牌。
 */
const markers = useSpotMarkers({
  getRoot: () => layer.root(),
  projectData: () => props.projectData,
  columnColor: () => props.columnColor,
  showColumn: () => props.showColumn,
  labelMode: () => props.labelMode,
});

/**
 * flies — 流星飞线层。
 * @param getRoot 三维对象挂载根。
 * @param visible 飞线总开关。
 * @param color 飞线颜色。
 * @param speed 飞线速度（与控制台 flylineSpeed 双向绑定）。
 */
const flies = useFlyLines({
  getRoot: () => layer.root(),
  visible: () => props.showFlyline,
  color: () => props.flylineColor,
  speed: () => props.flylineSpeed,
});

/**
 * 展示型装饰层（棱锥 / 轨道 / 热力 / CSS2D 标签）：与 markers/flys 同款 composable 模式，
 * 挂到同一 root，随层级重建，toggle 控制显隐。几何与层级无关的项（轨道）也借 root 挂载。
 */
const pyramids = usePyramidMarkers({
  getRoot: () => layer.root(),
  projectData: () => props.projectData,
  color: () => props.columnColor,
  visible: () => props.showPyramid,
});
const orbits = useOrbitRoutes({
  getRoot: () => layer.root(),
  visible: () => props.showOrbit,
});
const heat = useHeatmap({
  getRoot: () => layer.root(),
  projectData: () => props.projectData,
  visible: () => props.showHeatmap,
});
const c2d = useCss2dLabels({
  getRoot: () => layer.root(),
  projectData: () => props.projectData,
  visible: () => props.labelMode === 'css2d',
});

/**
 * 标签模式同步：css2d 开 → 显示 DOM 标签；sprite 开 → 显示 Sprite 文本标签。
 * 二者互斥由 markers.applyMode() 统一处理（css2d 时强制隐藏全部 Sprite 文本标签，
 * 否则会像此前那样同一省既挂 Sprite 标牌又挂 DOM 标签）。
 */
const syncLabels = () => {
  const css2dOn = props.labelMode === 'css2d';
  c2d.setVisible(css2dOn);
  // 重新套用一次显隐规则：css2d 模式据此隐藏 Sprite 标牌/卡片，sprite 模式据此恢复
  markers.applyMode();
};

// ── 测量（P1 交互）：单击地面落点，折线累计长度 + ≥3 点自动算面积 ──
/** 测量模式开关（由工具栏 v-model:measure 驱动） */
const measureOn = ref(false);
/** 已落测点数（useMeasure 内部数组不是响应式的，这里同步一份给模板） */
const measurePoints = ref(0);
const measure = useMeasure({
  getRoot: () => layer.root(),
  // d3 墨卡托 scale 是「每弧度经度对应的世界单位数」→ 反推每个世界单位多少 km，
  // 并按当前层中心纬度做墨卡托校正，这样三级的测量值都是真实量级
  kmPerUnit: () => {
    const fit = current.value?.fit;
    const scale = Number(fit?.scale) || 0;
    if (!scale) return 1;
    const lat = Number(fit?.center?.[1] ?? 35);
    return (6371 * Math.cos((lat * Math.PI) / 180)) / scale;
  },
});

/** 清空全部测点并复位计数 */
const clearMeasure = () => {
  measure.clear();
  measurePoints.value = 0;
};

// 进入测量模式：收起巡游（视角飘着没法落点），光标改十字准星
watch(measureOn, (on) => {
  if (on && roamOn.value) roamOn.value = false;
  picker.refreshCursor();
});

// ── 视角书签（P1 交互）：相机位置 + 视点存 localStorage，一键还原 ──
const showBookmarks = ref(false);
const bookmarks = ref<ViewBookmark[]>(loadBookmarks());

/** 保存当前机位（同名不覆盖，允许重复名，靠 id 区分） */
const saveBookmark = (name?: string) => {
  const camera = viewport.camera();
  const controls = viewport.controls();
  if (!camera || !controls) return;
  bookmarks.value = addBookmark(
    name ?? '',
    [camera.position.x, camera.position.y, camera.position.z],
    [controls.target.x, controls.target.y, controls.target.z],
  );
  pushNotice('已保存当前视角', 'info');
};

/** 切回某个书签机位（平滑飞过去，保留缩放/旋转/平移的完整状态） */
const applyBookmark = (id: string) => {
  const item = bookmarks.value.find((b) => b.id === id);
  if (!item) return;
  viewport.flyTo(item.position, item.target, 0.8);
  showBookmarks.value = false;
  pushNotice(`已切换到「${item.name}」`, 'info');
};

/** 删除书签（localStorage 同步） */
const deleteBookmark = (id: string) => {
  bookmarks.value = removeBookmark(id);
};

// ── 时间轴（Play）：柱高随月份补间演化 ──
const tlProgress = ref(11); // 浮点月份进度（月）
const tlLastMonth = ref(11); // 上一次已应用的整数月份
let tlRaf = 0;
let tlLastTs = 0;

/** 时间轴单帧推进：仅在 playing 时由 rAF 驱动；推进到末月自动停止并回传状态 */
const tlTick = (ts: number) => {
  if (!props.timelinePlaying) return;
  const dt = tlLastTs ? (ts - tlLastTs) / 1000 : 0;
  tlLastTs = ts;
  const months = markers.monthCount ?? 12;
  tlProgress.value += dt * (props.timelineSpeed || 1);
  if (tlProgress.value >= months - 1) {
    tlProgress.value = months - 1;
    markers.setMonth(months - 1, true);
    tlLastMonth.value = months - 1;
    emit('timeline-month-change', months - 1);
    emit('update:timelinePlaying', false);
    tlRaf = 0;
    return;
  }
  const mi = Math.floor(tlProgress.value);
  if (mi !== tlLastMonth.value) {
    tlLastMonth.value = mi;
    markers.setMonth(mi, true);
    emit('timeline-month-change', mi);
  }
  tlRaf = requestAnimationFrame(tlTick);
};

const startTimeline = () => {
  if (tlRaf) return;
  // 从头播放：若已停在末月则回到 0
  if (tlProgress.value >= (markers.monthCount ?? 12) - 1) tlProgress.value = 0;
  tlLastMonth.value = Math.floor(tlProgress.value);
  tlLastTs = 0;
  tlRaf = requestAnimationFrame(tlTick);
};

const stopTimeline = () => {
  if (tlRaf) {
    cancelAnimationFrame(tlRaf);
    tlRaf = 0;
  }
};

// 播放/暂停切换 → 启停 rAF
watch(
  () => props.timelinePlaying,
  (p) => {
    if (p) startTimeline();
    else stopTimeline();
  },
);

// 滑块改动月份 → 直接定位（平滑补间，不打断 playing 状态）
watch(
  () => props.timelineMonth,
  (m) => {
    if (m == null) return;
    tlProgress.value = m;
    tlLastMonth.value = m;
    markers.setMonth(m, true);
  },
);

onUnmounted(() => stopTimeline());

/** 一次性提示：错误 / 无数据，优先于进度条展示 */
const notice = ref<{ text: string; tone: 'info' | 'error' } | null>(null);
let noticeTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * pushNotice — 弹出一个一次性提示（toast），自动定时消失。
 * @param text 提示文案
 * @param tone 'info'（蓝）| 'error'（红），error 通常给更长停留时间
 * @param duration 自动消失毫秒数（默认 2800；错误提示常传 4000~6000）
 * 实现：先清掉旧定时器再起新的，避免多条提示互相覆盖提前消失。
 */
const pushNotice = (text: string, tone: 'info' | 'error' = 'info', duration = 2800) => {
  notice.value = { text, tone };
  if (noticeTimer) clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => {
    notice.value = null;
    noticeTimer = null;
  }, duration);
};

/**
 * levels — 层级栈与下钻流程编排（useMapLevels）。
 * 暴露：stage/busy/crumbs/current/canGoBack/canDrill/stack 以及
 *   loadCountry/drill/back/jumpTo/locateByName/locateByAdcode/resetToCountry/findFeature。
 * 通过 onEnter/onLeave 回调把"进入某层/离开某层"映射到本组件的 layer/markers/flies 操作。
 * ⚠️ 坑①：下钻=重建地图，这里的 onEnter 即触发 layer.build 重建；
 *   history[]（stack）末尾为当前层，back/jumpTo 都是对栈的 pop/截断后重建。
 */
const {
  stage,
  busy,
  crumbs,
  current,
  canGoBack,
  canDrill,
  stack,
  loadCountry,
  drill,
  back,
  jumpTo,
  locateByName,
  locateByAdcode,
  resetToCountry,
  findFeature,
} = useMapLevels({
  maxDrillLevel: () => props.maxDrillLevel,
  // 进入某一层（下钻 / 跳级 / 初始化）时执行。注意：这里不是相机飞入，
  // 而是"重建地图"，所有三维对象都会被重新投影与构建。
  onEnter: async (level, { rise, report }) => {
    // 全国底图合规校验：台湾省与九段线缺一不可
    if (level.level === 'country') {
      const compliance = checkCountryCompliance(level.geo);
      if (!compliance.ok) {
        console.warn(`[china-map-3d] 底图缺少要素：${compliance.missing.join('、')}`);
        pushNotice(`底图缺少${compliance.missing.join('、')}，请核对数据源`, 'error', 6000);
      }
    }
    // ⚠️ 坑①：level.fit 由 fitProjection 计算（最大边长归一到 MAP_EXTENT=130），
    //   全国/省/市三级共用同一套相机距离参数，因此聚焦逻辑无需按层级特判。
    viewport.focus(level.fit, 0.5);
    // 重建地图：把该层级 GeoJSON 投影成三维网格（见坑①说明）。
    await layer.build(level, { rise, report });
    report({ text: '正在投影数据…', ratio: 0.88 });
    // 数据柱/标牌：deferEntrance 为 true 时由外部 playEntrance() 触发增长动画，
    // 否则立即长出（!deferEntrance）。
    markers.build(level, !props.deferEntrance);
    // 柱体长到一半再让流星起飞，两个动画不抢同一个瞬间
    flies.build(level, props.deferEntrance ? 0 : 0.72);
    // 展示型装饰层随层级重建（几何与层级无关的项也借 root 挂载）
    pyramids.build(level);
    orbits.build(level);
    heat.build(level);
    c2d.build(level);
    syncLabels();
    // 下钻后把缩放/下钻控制器复位到初始距离，避免沿用上层的相机状态。
    zoom.reset(viewport.camera(), viewport.controls());
    emit('geo-data-loaded', level.geo);
  },
  // 离开当前层（准备下钻 / 返回 / 跳级）时执行：先清交互态，再下沉/清空图层。
  // 切层时先清掉悬停态（picker 在下方创建，回调可安全引用：切层发生在挂载之后）
  onLeave: async () => {
    picker.clearHover();
    // 测量几何挂在旧层 root 上，切层必须清掉，否则会悬在重建后的新地图上空
    clearMeasure();
    flies.clear();
    pyramids.clear();
    orbits.clear();
    heat.clear();
    c2d.clear();
    await layer.sink();
    markers.clear();
  },
  onError: (error) => {
    console.error('[china-map-3d] 图层加载失败：', error);
    pushNotice('地理数据加载失败，请检查网络后重试', 'error', 4000);
    emit('error', error);
  },
  onNoChild: (name) => pushNotice(`${name} 暂无下级行政区数据`),
});

// 主题切换 → 覆写 mapConfig 配色并重新上色（immediate 让首帧即落主题）
// ⚠️ 必须放在 useMapLevels 之后：下面要用 current（层级栈末尾）。immediate 的
//    watcher 回调在 setup 期间同步执行，若写在 current 声明之前会命中 TDZ
//    （ReferenceError: Cannot access 'current' before initialization）。
// ⚠️ paint() 只改顶面材质；侧壁渐变与描边线是建模时烘焙进材质的，换肤必须重建当前层。
//    主题切换是低频用户操作，重建一次（rise=false 不播入场）比逐材质改色更可靠。
// ⚠️ 重建必须把「挂在 root 上的所有装饰层」一起重建（markers/pyramids/heat/c2d）：
//    只重建 layer 会把它们的旧对象留在已销毁的 root 上。CSS2D 尤其致命 ——
//    CSS2DObject 的 DOM 只有在「对象自身被 remove」时才摘除，祖先 root 被移除时
//    事件不会冒泡到它，标签会以最后的位置冻结在屏幕上；等切回 sprite 模式后
//    这些残留 DOM 与 Sprite 卡片同显，看起来就是「有的省份多出一个标牌」
//    （CSS2D 只给前 18 名画标签，所以只有部分省份有）。
watch(
  () => props.theme,
  async (t) => {
    if (!t) return;
    layer.setTheme(t);
    // 三维底板跟着换配色（暗=青色加法混合 / 亮=深蓝正常混合）
    ground.setTheme(t);
    // 星空只在暗色主题显示：亮色底上加法混合的白色星芒会糊成一片"脏点"
    viewport.setStarfieldVisible(t === 'dark');
    const level = current.value;
    if (level && layer.root()) {
      // 重建会清掉旧 root，测量几何挂在旧 root 上 → 必须先清掉，否则残留失效引用
      clearMeasure();
      await layer.build(level, { rise: false, report: () => {} });
      markers.build(level, false);
      // 与下面 projectData watcher 保持同一套重建清单，避免装饰层停留在旧 root
      pyramids.build(level);
      heat.build(level);
      c2d.build(level);
      // build 内部按"无选中"重置显隐，这里补回落：选中态 / 标签模式 / 当前月份
      markers.applyMode();
      if (!props.timelinePlaying) markers.setMonth(props.timelineMonth, false);
    }
  },
  { immediate: true },
);

// 三维底板（B）显隐：只切 mesh.visible，不重建几何；scene 就绪前调用也无副作用
watch(
  () => props.showGroundPlane,
  (on) => ground.setVisible(on),
);

/**
 * zoom — 滚轮缩放下钻（useZoomDrill），默认关闭，仅当 zoomDrillEnabled=true 生效。
 * @param enabled 是否启用缩放下钻。
 * @param threshold 触发下钻的缩放阈值（0~1 比例）。
 * @param isBusy 正在加载时禁止触发。
 * @param hitCenter 命中检测：从屏幕中心向四周偏移几个采样点发射射线，命中带
 *   kind==='surface' 且带 customProperties 的板块即下钻。集中对中心区域采样，
 *   是因为缩放下钻语义上就是"放大到眼前这块区域"。
 */
const zoom = useZoomDrill({
  enabled: () => props.zoomDrillEnabled,
  threshold: () => props.zoomDrillThreshold,
  isBusy: () => busy.value,
  hitCenter: () => {
    const camera = viewport.camera();
    const root = layer.root();
    if (!camera || !root) return false;
    // 以屏幕中心为圆心，向四周取 5 个采样点（中心 + 上下左右各 0.05）发射射线，
    // 任一命中"可下钻板块"即触发下钻，提升命中宽容度。
    for (const [sx, sy] of [
      [0, 0],
      [0.05, 0],
      [-0.05, 0],
      [0, 0.05],
      [0, -0.05],
    ]) {
      viewport.pointer.set(sx, sy);
      viewport.raycaster.setFromCamera(viewport.pointer, camera);
      const hits = viewport.raycaster.intersectObjects(root.children, true);
      const hit = hits.find((item: any) => item.object.userData?.kind === 'surface');
      const region = (hit?.object as any)?.userData?.region;
      if (region?.customProperties) {
        drill(region.customProperties);
        return true;
      }
    }
    return false;
  },
});

/** 点击锁定：显示该城市的标牌并高亮板块 */
// ⚠️ 坑⑦：地理标牌默认全部收起，这里 markers.select(adcode) 才让"该城市"
//   的标牌单独显示；传 null 则恢复全部收起。
const selectAdcode = (adcode: number | null) => {
  markers.select(adcode);
  layer.setSelected(adcode);
  selectedAdcodes.value = adcode != null ? [adcode] : [];
  emit('select-change', adcode);
};

/**
 * adcodeOf — 从拾取结果中解析出行政区 adcode。
 * @param pick 指针拾取结果（spot=标记点，properties=板块属性），二者取其一。
 * @returns 合法的正数 adcode，否则 null（0 / NaN / 负数一律视为无效）。
 */
const adcodeOf = (pick: PickResult | null): number | null => {
  if (!pick) return null;
  const info = pick.spot ?? pick.properties;
  const adcode = Number(info?.adcode);
  return Number.isFinite(adcode) && adcode > 0 ? adcode : null;
};

/**
 * drillProperties — 对外广播 drill-down 事件并真正执行下钻。
 * @param properties 目标行政区属性（含 adcode / name / center 等）。
 */
const drillProperties = (properties: GeoJsonFeature['properties']) => {
  emit('drill-down', properties);
  drill(properties);
};

/**
 * handleDrill — 双击事件入口：从拾取结果取出属性并下钻。
 * @param pick 指针拾取结果，优先取 spot（标记），其次取板块 properties。
 */
const handleDrill = (pick: PickResult) => {
  const info = pick.spot ?? pick.properties;
  if (!info) return;
  drillProperties(info as GeoJsonFeature['properties']);
};

let lastHoverAdcode: number | null = null;

/**
 * picker — 指针拾取（usePointerPick）：把鼠标事件换算成"悬停/单击/双击谁"。
 * 回调说明：
 *   - onHover：高亮板块 + 后台预取下级数据 + 广播 hover-change。
 *   - onSelect：单击选中（显示标牌，见坑⑦）。
 *   - onDrill：双击下钻（走 handleDrill）。
 * 注意：canvas 不在模板里，故需 onMounted 时 picker.attach(canvas)。
 */

/**
 * 框选结束：把屏幕矩形内的行政区批量拾取为高亮选中。
 * - 非 Shift：直接替换为新集合，并聚焦到选区包围盒（画框缩放）。
 * - Shift：与现有集合做 toggle 累加（可正选 / 反选）。
 * 投影法取每个区域世界坐标投影到屏幕像素判断落框，框选只在 mouseup 执行一次，开销极低。
 */
const onBoxEnd = (rect: { x: number; y: number; w: number; h: number } | null, shift: boolean) => {
  boxRect.value = null
  const camera = viewport.camera()
  const root = layer.root()
  const hostEl = canvasHost.value
  if (!camera || !root || !rect || !hostEl) return
  const w = hostEl.clientWidth
  const h = hostEl.clientHeight
  const regions = layer.regions()
  const hits: number[] = []
  const v = new THREE.Vector3()
  for (const r of regions) {
    v.copy(r.world).project(camera)
    const sx = (v.x * 0.5 + 0.5) * w
    const sy = (-v.y * 0.5 + 0.5) * h
    if (sx >= rect.x && sx <= rect.x + rect.w && sy >= rect.y && sy <= rect.y + rect.h) hits.push(r.adcode)
  }
  if (!hits.length) return
  let next: Set<number>
  if (shift) {
    next = layer.selectedSet()
    for (const a of hits) { if (next.has(a)) next.delete(a); else next.add(a) }
  } else {
    next = new Set(hits)
  }
  layer.setSelectedSet(next)
  selectedAdcodes.value = [...next]
  if (!shift && next.size > 0) zoomToSelection(next)
};

/** 画框缩放：把相机平滑聚焦到选中区域的屏幕包围盒（复用 viewport.focus 的取景算法） */
const zoomToSelection = (set: Set<number>) => {
  const regs = layer.regions().filter((r) => set.has(r.adcode))
  if (regs.length < 1) return
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const r of regs) {
    minX = Math.min(minX, r.world.x); maxX = Math.max(maxX, r.world.x)
    minY = Math.min(minY, r.world.y); maxY = Math.max(maxY, r.world.y)
  }
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const hw = Math.max((maxX - minX) / 2, 6)
  const hh = Math.max((maxY - minY) / 2, 6)
  const fit = {
    center: [0, 0] as [number, number],
    scale: 1,
    bounds: { minX: -hw, minY: -hh, maxX: hw, maxY: hh, width: 2 * hw, height: 2 * hh, cx: 0, cy: 0 },
  }
  viewport.focus(fit, 0.6, new THREE.Vector3(cx, cy, mapConfig.depth))
};

const picker = usePointerPick({
  camera: () => viewport.camera(),
  getRoot: () => layer.root(),
  raycaster: viewport.raycaster,
  pointer: viewport.pointer,
  isBusy: () => busy.value,
  onHover: (pick) => {
    const adcode = adcodeOf(pick);
    layer.setHover(adcode);
    // 悬停即后台预取下级数据，等真正双击时通常已经落在本地
    if (pick?.properties && adcode && canDrill(pick.properties as GeoJsonFeature['properties'])) {
      prefetchDistrictGeoJson(String(adcode));
    }
    if (adcode !== lastHoverAdcode) {
      lastHoverAdcode = adcode;
      emit('hover-change', (pick?.spot ?? pick?.properties ?? null) as GeoJsonFeature['properties'] | null);
    }
  },
  onSelect: (pick) => selectAdcode(adcodeOf(pick)),
  onDrill: handleDrill,
  // 点空白（未命中任何板块 / 标记）→ 若当前有选中则取消选中
  onMiss: () => {
    if (markers.selectedAdcode.value != null) selectAdcode(null)
  },
  // ── 框选（Shift + 拖拽）：交给 usePointerPick 处理矩形，结果回传 onBoxEnd ──
  boxMode: () => shiftDown.value,
  setControlsEnabled: (enabled) => {
    const c = viewport.controls()
    if (!c) return
    // 仍按住 Shift 时不恢复轨道，否则 Shift 下再次拖拽会触发 pan
    if (enabled && shiftDown.value) return
    c.enabled = enabled
  },
  onBoxStart: () => {
    boxRect.value = { x: 0, y: 0, w: 0, h: 0 }
  },
  onBoxUpdate: (rect) => {
    boxRect.value = rect
  },
  onBoxEnd,
  // ── 测量：开启后单击改为在地面落点（不选中、不下钻）──
  measureMode: () => measureOn.value,
  onMeasure: (world) => {
    measure.addPoint(world);
    measurePoints.value = measure.count();
  },
});

const tooltip = computed(() => {
  const hover = picker.hovered.value;
  const info = hover ? (hover.spot ?? hover.properties) : null;
  if (!info) return { visible: false, x: 0, y: 0, name: '', levelText: '', value: '' };
  const adcode = Number(info.adcode);
  const value = info.value ?? readCount(props.projectData?.[adcode]);
  return {
    visible: true,
    x: picker.position.value.x + 16,
    y: picker.position.value.y + 16,
    name: String(info.name ?? ''),
    levelText: LEVEL_TEXT[info.level] ?? String(info.level ?? ''),
    value: value > 0 ? value : '—',
  };
});

const legend = computed(() => markers.legend.value);

/** 批量统计：选中集合的合计值 + 占全部比例（供统计浮层） */
const selectionStats = computed(() => {
  const list = selectedAdcodes.value
  if (!list.length) return null
  const data = props.projectData as Record<number, any> | undefined
  let sum = 0
  for (const a of list) sum += readCount(data?.[a])
  let total = 0
  if (data) for (const k of Object.keys(data)) total += readCount((data as any)[k])
  return { count: list.length, sum, ratio: total > 0 ? sum / total : 0 }
});

/** 框选矩形样式 */
const boxStyle = computed(() => {
  const r = boxRect.value
  if (!r) return {}
  return { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` }
});

/** 饼图分段：分档颜色 + 标签 + 各档城市数量（来自 markers 的统计） */
const pie = computed(() =>
  markers.legend.value
    .map((e, i) => ({ color: e.color, label: e.label, value: markers.tierCounts.value[i] ?? 0 }))
    .filter((s) => s.value > 0),
);

/**
 * searchItems — 搜索候选项 = 当前层级的全部行政区。
 * 直接从 current.value.geo.features 映射出 {name, adcode, levelText}，
 * 因此搜索永远只在本层级内发生（与 MapNavBar 跳级是两个概念）。
 */
const searchItems = computed<SearchItem[]>(() =>
  (current.value?.geo.features ?? [])
    .filter((feature) => feature?.properties?.name)
    .map((feature) => ({
      name: String(feature.properties.name),
      // ⚠️ 兜底为 0：adcode 缺失时不参与下钻，只会落到"选中"分支。
      adcode: Number(feature.properties.adcode) || 0,
      levelText: LEVEL_TEXT[feature.properties.level] ?? '',
    })),
);

/**
 * handleSearchPick — 用户从下拉候选中点选某行政区。
 * 能下钻（canDrill）就下钻，否则只选中并提示"无下级行政区"。
 * @param item 候选条目（含 adcode）。
 */
const handleSearchPick = (item: SearchItem) => {
  const feature = findFeature(String(item.adcode));
  if (!feature) return;
  if (canDrill(feature.properties)) drillProperties(feature.properties);
  else {
    selectAdcode(item.adcode);
    pushNotice(`已选中 ${feature.properties.name}（无下级行政区）`);
  }
};

/**
 * handleSearchKeyword — 回车但无候选时的兜底搜索（跨层级）。
 * 当前层没有候选（关键词搜不到）→ 调 locateByName 退回全国层沿省→市路径再找一次。
 * @param keyword 用户输入的原始关键词。
 */
const handleSearchKeyword = async (keyword: string) => {
  if (!keyword) return;
  const result = await locateByName(keyword);
  if (!result) {
    pushNotice(`未找到「${keyword}」`, 'info');
    return;
  }
  if (!result.drilled) selectAdcode(result.adcode);
};

/**
 * handleBack — 返回上一级（底部"返回上级"按钮）。
 * ⚠️ 坑①：返回即 pop history[] 后重建上一层地图，而非相机后退。
 * stack.length===2 表示"当前在省级、再退就回全国"，此时额外广播 reset-to-country。
 */
const handleBack = () => {
  selectAdcode(null);
  // 回到全国时通知外部
  if (stack.value.length === 2) emit('reset-to-country');
  back();
};

/**
 * handleJump — 面包屑跳级：直接切到路径上的第 index 层（可能跨多层）。
 * @param index 目标层级在 crumbs 中的下标（0 = 全国）。
 */
const handleJump = (index: number) => {
  selectAdcode(null);
  if (index === 0 && stack.value.length === 2) emit('reset-to-country');
  jumpTo(index);
};

/** 外部 API：按 adcode 下钻 */
const drillByAdcode = (adcode: string) => {
  const feature = findFeature(adcode);
  const camera = viewport.camera();
  if (!feature || !camera) return;
  // 没有真实鼠标事件，这里手工拼一个 PickResult（kind='region'），复用 handleDrill 下钻。
  handleDrill({ kind: 'region', properties: feature.properties, spot: null, point: camera.position.clone() });
};

/** 外部 API：按 adcode 跨层级定位（自动沿省→市路径下钻） */
const locateByCode = async (adcode: string | number) => {
  const code = await locateByAdcode(adcode);
  if (code == null) {
    pushNotice(`未找到 adcode ${adcode}`, 'info');
    return null;
  }
  selectAdcode(code);
  return code;
};

/** 外部 API：按名称定位 */
const locateByNames = async (name: string) => {
  const result = await locateByName(name);
  if (!result) {
    pushNotice(`未找到「${name}」`, 'info');
    return null;
  }
  if (!result.drilled) selectAdcode(result.adcode);
  return result.adcode;
};

/** 外部 API：回到全国 */
const resetToRoot = () => {
  selectAdcode(null);
  resetToCountry();
};

/** 入场动画（deferEntrance 时由外部触发） */
const playEntrance = () => {
  layer.playEntrance();
};

// 对外暴露的实例 API（父组件 / 外部可通过 ref 调用）：
//   drillByAdcode  按 adcode 下钻（合成拾取）
//   locateByAdcode 按 adcode 跨层级定位（沿省→市路径）
//   locateByName   按名称定位
//   jumpTo         面包屑跳级（复用 handleJump）
//   resetToCountry 回到全国
//   playEntrance   触发入场增长动画（deferEntrance 模式）
//   selectByAdcode 按 adcode 高亮选中（面板悬浮联动用；null 取消选中）
//   currentLevel   读取当前层级对象
//   setMeasure     开关测量模式（true=单击地面落点）
//   clearMeasure   清空全部测点
//   saveBookmark   保存当前视角书签（可选名称）
//   applyBookmark  切换到指定 id 的书签机位
//   deleteBookmark 删除指定书签
defineExpose({
  drillByAdcode,
  locateByAdcode: locateByCode,
  locateByName: locateByNames,
  jumpTo: handleJump,
  resetToCountry: resetToRoot,
  playEntrance,
  selectByAdcode: (adcode: number | null) => selectAdcode(adcode),
  currentLevel: () => current.value as MapLevel | null,
  setMeasure: (on: boolean) => {
    measureOn.value = on;
  },
  clearMeasure,
  saveBookmark,
  applyBookmark,
  deleteBookmark,
});

// 数据 / 配色变化 → 重建标记层与依赖数据的装饰层。
// 合成一个 watcher 的原因：projectData 与 columnColor 都只影响"标记 + 装饰层重建"这一件事，
// 分成两个 watcher 时若同一 tick 内两者都变，Vue 不会跨 watcher 去重 → 整套几何会被建两遍。
// ⚠️ 不要加 deep：页面侧始终整体替换 projectData（`{...old, ...patch}`），深监听只会
//    多付一次全量递归遍历，并把"原地改嵌套字段"变成隐性依赖。
watch(
  () => [props.projectData, props.columnColor],
  () => {
    const level = current.value;
    // 数据 / 配色变更即时生效，重播入场动画会显得整屏在抖
    if (!level || !layer.root()) return;
    markers.build(level, false);
    // 依赖数据的装饰层同步重建：棱锥 / 热力 / CSS2D 标签
    pyramids.build(level);
    heat.build(level);
    c2d.build(level);
  },
);

// showColumn 切换数据柱 ↔ 地理标牌：applyMode() 不重建，仅切换呈现模式。
// ⚠️ 坑⑦：切到标牌模式后默认全部收起，需单击城市才显示（见 selectAdcode）。
watch(
  () => props.showColumn,
  () => markers.applyMode(),
);

watch(
  () => props.dragMode,
  (mode) => viewport.setDragMode(mode),
);

watch(
  () => props.showFlyline,
  (visible) => flies.setVisible(visible),
);

watch(
  () => props.flylineColor,
  (color) => flies.setColor(color),
);

watch(
  () => props.flylineSpeed,
  (speed) => flies.setSpeed(speed),
);

// 装饰层开关：直接切换显隐（几何已随层级构建，不必重建）
watch(
  () => props.showPyramid,
  (v) => pyramids.setVisible(v),
);
watch(
  () => props.showOrbit,
  (v) => orbits.setVisible(v),
);
watch(
  () => props.showHeatmap,
  (v) => heat.setVisible(v),
);
// 标签模式：css2d 开 → 显示 DOM 标签并隐藏 Sprite 卡片；否则反之
watch(
  () => props.labelMode,
  () => syncLabels(),
);

// 自动巡游：开关 OrbitControls 自转
watch(
  () => roamOn.value,
  (on) => viewport.setAutoRotate(on),
  { immediate: true },
);

// 侧壁扫描流光：切换共享材质的强度 uniform
watch(
  () => props.showWallScan,
  (on) => setRegionScan(on),
  { immediate: true },
);

// 阈值聚焦：比例变化即时应用到标记层（只切柱体 visible，不重建几何）
watch(
  () => props.filterThreshold,
  (v) => markers.setThreshold(v ?? 0),
  { immediate: true },
);

// 层级变化对外广播（外部可据此同步标题 / 列表）
watch(
  () => current.value?.adcode,
  () => {
    const level = current.value;
    if (!level) return;
    emit('level-change', { name: level.name, level: level.level, adcode: level.adcode });
  },
);

/** CSS2D 渲染器随容器尺寸变化同步 */
const onCss2dResize = () => {
  const hostEl = canvasHost.value;
  if (css2dRenderer && hostEl) css2dRenderer.setSize(hostEl.clientWidth, hostEl.clientHeight);
};

/** 键盘：F1 帮助 · Esc 先取消选中再返回上级 · 空格复位视角 · / 聚焦搜索 */
const handleKeydown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

  if (event.key === 'F1') {
    // 浏览器默认会打开帮助页，必须阻止
    event.preventDefault();
    showHelp.value = !showHelp.value;
  } else if (event.key === 'Escape') {
    event.preventDefault();
    // 优先取消选中；已无选中且还能返回时才回上一级
    if (markers.selectedAdcode.value != null) selectAdcode(null);
    else if (canGoBack.value) handleBack();
    else if (showHelp.value) showHelp.value = false;
  } else if (event.code === 'Space') {
    event.preventDefault();
    viewport.focus(current.value?.fit ?? null, 0.5);
  } else if (event.key === '/' && props.showSearch) {
    event.preventDefault();
    searchRef.value?.focus();
  } else if (event.key === 'Shift') {
    // 按住 Shift 进入框选模式（仅修饰键，不拦截其它逻辑）
    shiftDown.value = true;
  }
};

/** Shift 松开：退出框选模式（恢复轨道控制器交由 setControlsEnabled 判定） */
const handleKeyUp = (event: KeyboardEvent) => {
  if (event.key === 'Shift') shiftDown.value = false;
};

/** 视角预设：转交 viewport 平滑切换，并回写 currentView 高亮 */
const handleViewPreset = (name: 'top' | 'oblique' | 'front') => {
  currentView.value = name;
  viewport.viewPreset(name);
};

/** 全屏切换：对画布容器调用 Fullscreen API */
const toggleFullscreen = () => {
  const el = canvasHost.value;
  if (!el) return;
  if (document.fullscreenElement) document.exitFullscreen?.();
  else el.requestFullscreen?.().catch(() => pushNotice('当前环境不支持全屏', 'info'));
};

/** 截图：从 viewport 取 PNG dataURL，触发下载 */
const doScreenshot = () => {
  const url = viewport.screenshot();
  if (!url) {
    pushNotice('截图失败，请稍后重试', 'error');
    return;
  }
  const a = document.createElement('a');
  a.href = url;
  a.download = `china-map-${Date.now()}.png`;
  a.click();
  pushNotice('已保存截图', 'info');
};

let tickOff: (() => void) | null = null;

onMounted(async () => {
  await nextTick();
  viewport.setDragMode(props.dragMode);
  viewport.start();
  // 三维底板（B）：scene 就绪后再建，按当前主题生成纹理，显隐跟 props 走。
  // 顺序不能反 —— setVisible 内部要往 scene 里挂 mesh。
  ground.setTheme(props.theme);
  ground.setVisible(props.showGroundPlane);
  // 底图预设预加载：不阻塞首屏，切预设时不再有一帧空白
  preloadBgPresets();
  // ⚠️ 坑④：canvas 由 viewport 以 appendChild 注入 canvasHost（不在模板里）。
  //   HMR 时旧实例可能残留画布，viewport 内部会在 mount 时先清空容器内已有
  //   canvas 再挂新的，避免两块画布叠加。
  const canvas = viewport.canvas() as any;
  if (canvas) picker.attach(canvas);

  // CSS2D 标签渲染器：与 WebGL 共用 canvas 宿主（绝对定位覆盖其上，不拦截鼠标）
  const hostEl = canvasHost.value;
  if (hostEl) {
    css2dRenderer = new CSS2DRenderer();
    css2dRenderer.setSize(hostEl.clientWidth || 1200, hostEl.clientHeight || 700);
    const c2dEl = css2dRenderer.domElement;
    c2dEl.style.position = 'absolute';
    c2dEl.style.top = '0';
    c2dEl.style.left = '0';
    c2dEl.style.pointerEvents = 'none';
    c2dEl.style.zIndex = '4';
    hostEl.appendChild(c2dEl);
    window.addEventListener('resize', onCss2dResize, false);
  }

  tickOff = viewport.onTick((dt, elapsed, view) => {
    // 传视口度量：飞线据此把世界线宽换算成屏幕像素，拉远时托住细线
    flies.tick(dt, elapsed, viewport.camera(), view);
    // 底板跟随轨道中心：地图平移/下钻后，圆环不会偏到一边
    ground.syncToFocus(viewport.controls()?.target ?? null);
    pyramids.tick(dt, elapsed);
    orbits.tick(dt);
    // 侧壁扫描流光：推进共享材质的时间戳
    updateRegionScan(elapsed);
    // CSS2D 标签：与 WebGL 同帧投影 DOM 标签。
    // 仅 css2d 模式才渲染 —— CSS2DRenderer 内部是 scene.traverse，sprite 模式下
    // DOM 元素已逐个 display:none，再每帧遍历整个场景纯属浪费。
    const cam = viewport.camera();
    const scn = viewport.scene();
    if (cam && scn && css2dRenderer && props.labelMode === 'css2d') css2dRenderer.render(scn, cam);
    zoom.update(viewport.camera()!, viewport.controls());
  });

  window.addEventListener('keydown', handleKeydown, false);
  window.addEventListener('keyup', handleKeyUp, false);

  await loadCountry(!props.deferEntrance);
  zoom.reset(viewport.camera(), viewport.controls());
  emit('ready');

  if (props.initialAdcode) drillByAdcode(props.initialAdcode);
});

onUnmounted(() => {
  tickOff?.();
  tickOff = null;
  window.removeEventListener('keydown', handleKeydown, false);
  window.removeEventListener('keyup', handleKeyUp, false);
  window.removeEventListener('resize', onCss2dResize, false);
  if (noticeTimer) clearTimeout(noticeTimer);
  picker.detach();
  measure.clear();
  pyramids.clear();
  orbits.clear();
  heat.clear();
  c2d.clear();
  markers.clear();
  flies.clear();
  layer.dispose();
  // 三维底板在 viewport.stop() 之前释放：dispose 内部还要从 scene 上摘 mesh
  ground.dispose();
  // ⚠️ 坑④：停掉渲染循环并释放 GPU 资源；viewport.stop() 内部还会把注入的
  //   canvas.remove() 摘掉 DOM，确保 unmount 后不残留画布。
  viewport.stop();
  // CSS2D 渲染器的 DOM 不在 scene 内，需手动摘除以免残留标签层
  if (css2dRenderer) {
    css2dRenderer.domElement.remove();
    css2dRenderer = null;
  }
});
</script>

<style scoped>
.china-map-3d-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
.china-map-3d-canvas {
  width: 100%;
  height: 100%;
  position: relative;
  /* 压在底图之上：canvas 自身 alpha 透明，底图才能透上来 */
  z-index: 1;
}

/* 左下角信息栏（数据分档饼图 + 数据量分级图例）：纵向排列，底边贴住画布左下角。
   底部留 18px 且整体高约 330px，正好停在上方时间轴（bottom 18 / 高 100）之上。 */
.map-left-rail {
  position: absolute;
  left: 16px;
  bottom: 18px;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  pointer-events: none;
}
.map-left-rail > * { pointer-events: auto; }

/* ── 大屏底图（A）：2D 层，位于 canvas 之下 ──
   没传 bgImage 时用这里的程序化底图（暗/亮两套 CSS 渐变）；
   传了 bgImage 则由内联 background-image 覆盖，并叠一层 veil 压暗/提亮保对比度。 */
.map-bg-image {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  /* 强度由组件内联注入的 --bg-opacity 控制（0~1）；不传时按 1 处理 */
  opacity: var(--bg-opacity, 1);
  transition: opacity 0.4s ease;
}
/* 超宽屏（≥ 2:1）时 cover 会大量裁掉上下；焦点上移到地平线辉光所在的上三分之一 */
@media (min-aspect-ratio: 2 / 1) {
  .map-bg-image { background-position: center 42%; }
}
.map-bg-image--hidden { opacity: 0; }

/* 暗色：中心聚光 + 稀疏网格 + 底部地平线辉光 */
.map-bg-image--dark {
  background-image:
    linear-gradient(to top, rgba(47, 192, 255, 0.15) 0%, rgba(47, 192, 255, 0) 27%),
    radial-gradient(circle at 50% 44%, rgba(38, 120, 220, 0.34) 0%, rgba(6, 30, 70, 0) 62%),
    radial-gradient(circle at 14% 82%, rgba(96, 64, 210, 0.2) 0%, rgba(96, 64, 210, 0) 55%),
    linear-gradient(rgba(95, 216, 255, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(95, 216, 255, 0.055) 1px, transparent 1px),
    radial-gradient(circle at 50% 42%, #061530 0%, #030c1c 58%, #01050d 100%);
  background-size: auto, auto, auto, 64px 64px, 64px 64px, auto;
}

/* 亮色：白心 + 淡蓝网格，避免亮色地图配深底 */
.map-bg-image--light {
  background-image:
    linear-gradient(to top, rgba(120, 190, 235, 0.26) 0%, rgba(120, 190, 235, 0) 27%),
    radial-gradient(circle at 50% 44%, #ffffff 0%, rgba(232, 244, 255, 0) 62%),
    linear-gradient(rgba(46, 110, 170, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(46, 110, 170, 0.08) 1px, transparent 1px),
    radial-gradient(circle at 50% 42%, #eaf4ff 0%, #d7e8f8 60%, #c3d9ee 100%);
  background-size: auto, auto, 64px 64px, 64px 64px, auto;
}

/* 自定义底图：单张图铺满（必须覆盖 --dark/--light 里的多层 background-size） */
.map-bg-image--custom { background-size: cover; }

/* 自定义底图的对比度蒙版：只有 --custom 才显形。
   中心几乎不压（保留图本身的纹理），只在四周收暗做暗角，
   避免把本来就很暗的科技底图压成一片死黑。 */
.map-bg-image__veil {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.map-bg-image--custom .map-bg-image__veil { opacity: 1; }
.map-bg-image--custom.map-bg-image--dark .map-bg-image__veil {
  background: radial-gradient(circle at 50% 44%, rgba(2, 10, 22, 0.04) 0%, rgba(1, 5, 12, 0.34) 92%);
}
.map-bg-image--custom.map-bg-image--light .map-bg-image__veil {
  background: radial-gradient(circle at 50% 44%, rgba(255, 255, 255, 0.18) 0%, rgba(228, 240, 252, 0.5) 92%);
}
/* 预设底图偏暗，轻微提亮让它从 canvas 下透得出来 */
.map-bg-image--custom.map-bg-image--dark { filter: brightness(1.22) saturate(1.08); }
.china-map-3d-canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
  /* 触屏：禁掉浏览器默认的滚动/双击缩放，手势全部交给 OrbitControls */
  touch-action: none;
}
/* 框选矩形：青色描边 + 半透明填充，不拦截鼠标避免拖拽中断 */
.map-box-select {
  position: absolute;
  border: 1px solid #5fc9ee;
  background: rgba(95, 201, 238, 0.14);
  pointer-events: none;
  z-index: 5;
}
/* 批量统计浮层（左下角，玻璃拟态 + 青光） */
.map-sel-stats {
  position: absolute;
  left: 16px;
  bottom: 16px;
  z-index: 6;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 14px;
  background: rgba(6, 16, 30, 0.82);
  border: 1px solid rgba(95, 201, 238, 0.5);
  border-radius: 8px;
  color: #cfeaff;
  font: 600 13px/1 'PingFang SC', 'Microsoft YaHei', sans-serif;
  backdrop-filter: blur(4px);
}
.map-sel-stats__item b {
  color: #fff;
  margin: 0 2px;
}
.map-sel-stats__clear {
  margin-left: 4px;
  padding: 3px 10px;
  background: transparent;
  border: 1px solid rgba(95, 201, 238, 0.6);
  border-radius: 5px;
  color: #9fd6ef;
  cursor: pointer;
  font: 600 12px/1 inherit;
}
.map-sel-stats__clear:hover {
  background: rgba(95, 201, 238, 0.16);
}
/* 测量提示条（左下角，位于批量统计浮层上方，两者可同时出现） */
.map-measure {
  position: absolute;
  left: 16px;
  bottom: 62px;
  z-index: 6;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  background: rgba(6, 16, 30, 0.82);
  border: 1px solid rgba(95, 216, 255, 0.5);
  border-radius: 8px;
  color: #cfeaff;
  font: 600 12px/1 'PingFang SC', 'Microsoft YaHei', sans-serif;
  backdrop-filter: blur(4px);
}
.map-measure__title {
  color: #5fd8ff;
  letter-spacing: 1px;
}
.map-measure__num {
  font-variant-numeric: tabular-nums;
  color: #fff;
}
.map-measure__btn {
  padding: 3px 9px;
  background: transparent;
  border: 1px solid rgba(95, 216, 255, 0.55);
  border-radius: 5px;
  color: #9fd6ef;
  cursor: pointer;
  font: 600 12px/1 inherit;
}
.map-measure__btn:hover:not(:disabled) {
  background: rgba(95, 216, 255, 0.16);
}
.map-measure__btn:disabled {
  opacity: 0.4;
  cursor: default;
}
/* CSS2D 城市标签样式见文件末尾非 scoped <style> 块：
   标签 DOM 由 useCss2dLabels 用 document.createElement 动态注入到
   CSS2DRenderer.domElement，scoped 样式不会命中它，故必须放全局块，
   否则会回落到浏览器默认样式（透明底 + 黑字）。 */
</style>

<!--
  非 scoped 样式块：CSS2D 城市标签。
  标签 DOM 由 composables/useCss2dLabels.ts 用 document.createElement 动态创建，
  并 append 到 CSS2DRenderer.domElement（在组件根之外注入），Vue 的 scoped 属性
  选择器无法命中这类动态节点，会把它们留成浏览器默认样式（透明底 + 黑字）。
  因此这一组样式必须放在非 scoped 块里，才能稳定生效。
-->
<style>
.map-c2d-label {
  padding: 2px 8px;
  background: rgba(6, 16, 30, 0.82);
  border: 1px solid #5fc9ee;
  border-left-width: 3px;
  border-radius: 4px;
  color: #eaf8ff;
  font:
    600 12px/1.2 'PingFang SC',
    'Microsoft YaHei',
    sans-serif;
  white-space: nowrap;
  pointer-events: none;
  transform: translate(-50%, -120%);
}
.map-c2d-label__name {
  color: #a9dcf2;
  margin-right: 6px;
}
.map-c2d-label__value {
  color: #ffffff;
}
</style>
