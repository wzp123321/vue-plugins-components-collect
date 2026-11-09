<!--
 * SouthSeaInset.vue — 南海诸岛插图（右下角，屏幕固定）
 * ---------------------------------------------------------------
 * 职责：用同一份 china.json 里的九段线（adcode 以 _JD 结尾）与南海岛礁环，
 *       做一次独立线性投影，画成规范的「南海诸岛」小插图。
 *
 * 为什么不直接把九段线放进取景：fitProjection 的 focusRings 按面积累加到
 *   98.5% 定取景，九段线 10 个细环会被全部丢弃，取景纬度被抬到 20°N 以北，
 *   南海整片被推出视锥。若强行把九段线并进主图取景，相机得拉远约 1/3，
 *   主体明显缩小 —— 国内公开地图的标准做法是主体不变、右下角加插图。
 *
 * 为什么用 Canvas2D 而不是第二个 three.js 相机：插图必须屏幕固定、不随主相机
 *   拖拽旋转/缩放；DOM + 2D 画布天然满足，且不碰主渲染循环与 composer。
 *
 * 协作模块：
 *   - geo.ts（nineDashSegments / southSeaRings / SOUTH_SEA_BBOX）
 *   - mapConfig.ts（themePalettes，取与主题一致的外轮廓色）
 *   - ChinaMap3D.vue（仅在 country 层级挂载；@render 回报绘制段数做合规校验）
 -->
<template>
  <div class="south-sea-inset" :class="`south-sea-inset--${theme}`" aria-label="南海诸岛插图">
    <span class="south-sea-inset__title">南海诸岛</span>
    <canvas ref="canvasEl" class="south-sea-inset__canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { nineDashSegments, southSeaRings, SOUTH_SEA_BBOX } from '../utils/geo';
import { themePalettes, type ThemeName } from '../utils/mapConfig';
import type { GeoJsonType } from '../types';

const props = defineProps<{
  geo: GeoJsonType | null;
  theme: ThemeName;
}>();

/** 回报实际画出的九段线段数，供父组件做「渲染级」合规校验 */
const emit = defineEmits<{ (e: 'render', segments: number): void }>();

const canvasEl = ref<HTMLCanvasElement | null>(null);

/** 画布 CSS 尺寸（与下方 style 保持一致），绘制时按 devicePixelRatio 放大位图 */
const CANVAS_WIDTH = 176;
const CANVAS_HEIGHT = 224;
const PADDING = 10;

const EMPTY_GEO: GeoJsonType = { type: 'FeatureCollection', features: [] };

const hexOf = (value: number): string => `#${value.toString(16).padStart(6, '0')}`;

/**
 * 独立投影：把 SOUTH_SEA_BBOX 等比映射到画布内框并居中。
 * ⚠️ 与主图的墨卡托投影完全无关，插图比例只由这个 bbox 决定，
 *   主图取景 / 相机距离怎么变都不会影响它。
 */
const draw = () => {
  const canvas = canvasEl.value;
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(CANVAS_WIDTH * dpr);
  canvas.height = Math.round(CANVAS_HEIGHT * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const { minLng, maxLng, minLat, maxLat } = SOUTH_SEA_BBOX;
  const innerWidth = CANVAS_WIDTH - PADDING * 2;
  const innerHeight = CANVAS_HEIGHT - PADDING * 2;
  const scale = Math.min(innerWidth / (maxLng - minLng), innerHeight / (maxLat - minLat));
  const offsetX = PADDING + (innerWidth - (maxLng - minLng) * scale) / 2;
  const offsetY = PADDING + (innerHeight - (maxLat - minLat) * scale) / 2;
  const project = (lng: number, lat: number): [number, number] => [
    offsetX + (lng - minLng) * scale,
    offsetY + (maxLat - lat) * scale,
  ];

  const palette = themePalettes[props.theme] ?? themePalettes.dark;
  const lineColor = hexOf(Number(palette.outlineColor));
  const geo = props.geo ?? EMPTY_GEO;

  // 岛礁与海岸小环：极细描边作地理参照；3~4 点的微型环描边看不见，改画圆点。
  // ⚠️ 描边环与圆点必须分两个 path：共用 path 时下面的 fill() 会把海南岛等
  //   大环也实心填掉，插图就变成一片色块。
  ctx.strokeStyle = lineColor;
  ctx.fillStyle = lineColor;
  ctx.globalAlpha = props.theme === 'light' ? 0.42 : 0.3;
  ctx.lineWidth = 0.6;
  const dots: Array<[number, number]> = [];
  ctx.beginPath();
  southSeaRings(geo).forEach((ring) => {
    const points = ring.map(([lng, lat]) => project(lng, lat));
    const span = points.reduce((max, point, index) => {
      if (index === 0) return max;
      return Math.max(max, Math.abs(point[0] - points[0][0]), Math.abs(point[1] - points[0][1]));
    }, 0);
    if (ring.length <= 4 || span < 1.2) {
      dots.push(points[0]);
      return;
    }
    points.forEach(([x, y], index) => {
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
  });
  ctx.stroke();
  ctx.beginPath();
  dots.forEach(([cx, cy]) => {
    // 先移到圆弧起点，否则 arc 会从当前点拉一条直线到圆上
    ctx.moveTo(cx + 0.9, cy);
    ctx.arc(cx, cy, 0.9, 0, Math.PI * 2);
  });
  ctx.fill();

  // 九段线：每段是一条非闭合折线，段间天然断开；比岛礁更亮更粗
  const segments = nineDashSegments(geo);
  ctx.globalAlpha = 1;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  segments.forEach((segment) => {
    ctx.beginPath();
    segment.forEach(([lng, lat], index) => {
      const [x, y] = project(lng, lat);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
  emit('render', segments.length);
};

onMounted(draw);
watch(() => [props.geo, props.theme], draw, { flush: 'post' });
</script>

<style scoped>
.south-sea-inset {
  position: absolute;
  /* 让开页面右侧 300px 竖栏（right:18 + width:300）；页面可覆盖此变量 */
  right: var(--south-sea-inset-right, 334px);
  bottom: 26px;
  z-index: 20;
  box-sizing: border-box;
  width: 178px;
  border: 1px solid rgba(127, 179, 212, 0.52);
  background: rgba(5, 10, 18, 0.72);
  pointer-events: none;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.south-sea-inset--light {
  border-color: rgba(42, 108, 144, 0.38);
  background: rgba(238, 243, 248, 0.84);
}
.south-sea-inset__title {
  display: block;
  height: 22px;
  line-height: 22px;
  font-size: 12px;
  letter-spacing: 1px;
  text-align: center;
  color: #b4d8ee;
  border-bottom: 1px solid rgba(127, 179, 212, 0.2);
}
.south-sea-inset--light .south-sea-inset__title {
  color: #4a7d92;
  border-bottom-color: rgba(42, 108, 144, 0.2);
}
.south-sea-inset__canvas {
  display: block;
  width: 176px;
  height: 224px;
}
</style>
