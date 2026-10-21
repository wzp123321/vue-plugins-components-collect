<!--
 * MapScaleBar.vue — 左下角「实时比例尺 + 缩放倍率」
 * 职责：把 ChinaMap3D 算好的比例尺信息渲染成地图常见样式——
 *   一条随缩放伸缩的刻度条（标真实公里数）+ 一行当前相对本层 fit 的缩放倍率。
 * 缩放时实时更新，让"拉远看全国 / 拉近看省界"有了可量化的参照。
 * 样式与现有地图 UI 一致的玻璃拟态 + 青光，亮色主题下自动转浅。
 * 位置：固定在画布左下角（left:16 / bottom:16），是地图比例尺最不挡视野的
 *   经典落点。左下信息栏（饼图+图例）已上移到 bottom:84 让出底部空间；
 *   底部时间轴居中停靠，窄容器展开时左锚定到 180，均不会与本条重叠。
-->
<template>
  <div
    v-show="km > 0"
    class="map-scale"
    :class="theme === 'light' ? 'map-scale--light' : ''"
  >
    <div class="map-scale__bar" :style="{ width: px + 'px' }">
      <span class="map-scale__cap map-scale__cap--l"></span>
      <span class="map-scale__cap map-scale__cap--r"></span>
    </div>
    <div class="map-scale__text">
      <span class="map-scale__dist">{{ formattedKm }}</span>
      <span class="map-scale__ratio">缩放 ×{{ ratio.toFixed(1) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    /** 比例尺条代表的真实距离（公里，已取 1/2/5×10ⁿ 整刻度） */
    km: number;
    /** 比例尺条在屏幕上的像素长度（由父组件按 kmPerPx 反推） */
    px: number;
    /** 当前相机距离相对本层 fit 距离的倍率（1 = 正好贴合本层） */
    ratio: number;
    /** 主题（暗/亮），仅用于切换配色 */
    theme?: 'dark' | 'light';
  }>(),
  // 默认 0/1：宿主未下发数据时 v-show 直接隐藏，不留空条
  { km: 0, px: 0, ratio: 1, theme: 'dark' },
);

/**
 * formattedKm — 距离自适应单位：<1000m 用 m，<10km 留一位小数，
 * <1000km 取整，更大用「千 km」，避免数字过长撑破卡片。
 */
const formattedKm = computed(() => {
  const v = props.km;
  if (!v || v <= 0) return '';
  if (v < 1) return `${Math.round(v * 1000)} m`;
  if (v < 10) return `${v.toFixed(1)} km`;
  if (v < 1000) return `${Math.round(v)} km`;
  const k = v / 1000;
  return `${k >= 10 ? Math.round(k) : k.toFixed(1)} 千km`;
});
</script>

<style scoped>
.map-scale {
  position: absolute;
  /* 固定在画布左下角：地图比例尺最不挡视野的经典落点 */
  left: 16px;
  bottom: 16px;
  z-index: 31;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  padding: 7px 12px 8px;
  background: rgba(6, 16, 40, 0.78);
  border: 1px solid rgba(95, 216, 255, 0.28);
  border-radius: 8px;
  backdrop-filter: blur(6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  color: #cfeaff;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  user-select: none;
  pointer-events: none;
}
/* 比例尺刻度条：底部一条横线 + 左右端竖直帽，模拟地图比例尺 */
.map-scale__bar {
  position: relative;
  height: 0;
  min-width: 1px;
  border-bottom: 2px solid #5fd8ff;
  box-shadow: 0 0 8px rgba(95, 216, 255, 0.5);
}
.map-scale__cap {
  position: absolute;
  bottom: 0;
  width: 2px;
  height: 8px;
  background: #5fd8ff;
  box-shadow: 0 0 8px rgba(95, 216, 255, 0.5);
}
.map-scale__cap--l { left: 0; }
.map-scale__cap--r { right: 0; }

.map-scale__text {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
}
.map-scale__dist {
  font-weight: 700;
  color: #eaf6ff;
  font-variant-numeric: tabular-nums;
}
.map-scale__ratio {
  color: #8fe9ff;
  font-variant-numeric: tabular-nums;
  opacity: 0.85;
}
/* 亮色主题：卡片转浅，刻度与文字改深蓝，保持可读 */
.map-scale--light {
  background: rgba(232, 244, 255, 0.86);
  border-color: rgba(46, 110, 170, 0.4);
  color: #0a2942;
  box-shadow: 0 8px 24px rgba(120, 160, 200, 0.35);
}
.map-scale--light .map-scale__bar,
.map-scale--light .map-scale__cap {
  background: #2f7fc0;
  border-color: #2f7fc0;
  box-shadow: none;
}
.map-scale--light .map-scale__dist { color: #0a2942; }
.map-scale--light .map-scale__ratio { color: #3a6ea0; }
</style>
