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
    <div ref="canvasHost" class="china-map-3d-canvas"></div>

    <MapSearchBox
      v-if="showSearch"
      ref="searchRef"
      :items="searchItems"
      :disabled="busy"
      @pick="handleSearchPick"
      @search="handleSearchKeyword"
    />
    <MapTooltip v-bind="tooltip" />
    <MapLegend :items="legend" />
    <MapPieChart v-if="showPie" :segments="pie" title="数据分档" />
    <MapNavBar :crumbs="crumbs" @back="handleBack" @jump="handleJump" />
    <MapStageTip :stage="stage" :notice="notice" :raised="canGoBack" />
    <MapToolbar
      v-model:roam="roamOn"
      :current="currentView"
      @view="handleViewPreset"
      @fullscreen="toggleFullscreen"
      @screenshot="doScreenshot"
      @help="showHelp = true"
    />
    <MapHelpDialog v-model:visible="showHelp" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
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
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { updateRegionScan, setRegionScan } from '../utils/drawRegion';
import { usePyramidMarkers } from '../composables/usePyramidMarkers';
import { useOrbitRoutes } from '../composables/useOrbitRoutes';
import { useHeatmap } from '../composables/useHeatmap';
import { useCss2dLabels } from '../composables/useCss2dLabels';

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
}>();

// 画布容器 host：渲染器创建的 <canvas> 会 appendChild 进这里（不在模板里），
// ⚠️ 坑④：HMR 残留画布就发生在这个容器上，需在 viewport 内做 mount 清空。
const canvasHost = ref<HTMLDivElement | null>(null);
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

/** 标签模式同步：css2d 开 → 显示 DOM 标签并隐藏 Sprite 卡片；否则反之（并恢复选中态） */
const syncLabels = () => {
  const css2dOn = props.labelMode === 'css2d';
  c2d.setVisible(css2dOn);
  markers.setCardsVisible(!css2dOn && props.showColumn);
  if (!css2dOn) markers.applyMode();
};

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
//   currentLevel   读取当前层级对象
defineExpose({
  drillByAdcode,
  locateByAdcode: locateByCode,
  locateByName: locateByNames,
  jumpTo: handleJump,
  resetToCountry: resetToRoot,
  playEntrance,
  currentLevel: () => current.value as MapLevel | null,
});

watch(
  () => props.projectData,
  () => {
    const level = current.value;
    // 数据 / 配色变更即时生效，重播入场动画会显得整屏在抖
    if (level && layer.root()) {
      markers.build(level, false);
      // 依赖数据的装饰层同步重建：棱锥 / 热力 / CSS2D 标签
      pyramids.build(level);
      heat.build(level);
      c2d.build(level);
    }
  },
  { deep: true },
);

// showColumn 切换数据柱 ↔ 地理标牌：applyMode() 不重建，仅切换呈现模式。
// ⚠️ 坑⑦：切到标牌模式后默认全部收起，需单击城市才显示（见 selectAdcode）。
watch(
  () => props.showColumn,
  () => markers.applyMode(),
);

watch(
  () => props.columnColor,
  () => {
    const level = current.value;
    // 数据 / 配色变更即时生效，重播入场动画会显得整屏在抖
    if (level && layer.root()) markers.build(level, false);
  },
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
  }
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

  tickOff = viewport.onTick((dt, elapsed) => {
    flies.tick(dt, elapsed, viewport.camera());
    pyramids.tick(dt, elapsed);
    orbits.tick(dt);
    // 侧壁扫描流光：推进共享材质的时间戳
    updateRegionScan(elapsed);
    // CSS2D 标签：与 WebGL 同帧投影 DOM 标签
    const cam = viewport.camera();
    const scn = viewport.scene();
    if (cam && scn && css2dRenderer) css2dRenderer.render(scn, cam);
    zoom.update(viewport.camera()!, viewport.controls());
  });

  window.addEventListener('keydown', handleKeydown, false);

  await loadCountry(!props.deferEntrance);
  zoom.reset(viewport.camera(), viewport.controls());
  emit('ready');

  if (props.initialAdcode) drillByAdcode(props.initialAdcode);
});

onUnmounted(() => {
  tickOff?.();
  tickOff = null;
  window.removeEventListener('keydown', handleKeydown, false);
  window.removeEventListener('resize', onCss2dResize, false);
  if (noticeTimer) clearTimeout(noticeTimer);
  picker.detach();
  pyramids.clear();
  orbits.clear();
  heat.clear();
  c2d.clear();
  markers.clear();
  flies.clear();
  layer.dispose();
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
}
.china-map-3d-canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
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
