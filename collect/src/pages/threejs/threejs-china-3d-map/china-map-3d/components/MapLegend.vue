<!--
 * MapLegend.vue — 左下角「数据量分级图例」
 * 职责：展示当前地图的数据量分级色板（颜色 → 区间标签）。
 * 数据来源：items 由 ChinaMap3D 的 markers.legend 计算属性下发
 *   （数据柱按 columnColor 高值锚点生成的分级配色）。
 * 角色：纯展示组件，pointer-events: none 不拦截地图交互。
 -->
<template>
  <div v-if="items.length" class="map-legend">
    <div class="map-legend__title">{{ title }}</div>
    <div v-for="(item, index) in items" :key="index" class="map-legend__row">
      <i class="map-legend__dot" :style="{ background: item.color }"></i>
      <span class="map-legend__label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  items: Array<{ color: string; label: string }>
  title?: string
}>(), {
  title: '数据量分级',
})
</script>

<style scoped>
.map-legend {
  /* 位置由父级 .map-left-rail 统一排列（原先 left:22 / bottom:22 与饼图差 6px） */
  position: relative;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(5, 10, 18, 0.72);
  border: 1px solid rgba(127, 179, 212, 0.16);
  backdrop-filter: blur(8px);
  pointer-events: none;
}
.map-legend__title {
  font-size: 11px;
  letter-spacing: 1px;
  color: #7FB3D4;
  margin-bottom: 7px;
}
.map-legend__row { display: flex; align-items: center; gap: 7px; margin-top: 5px; }
.map-legend__dot { width: 8px; height: 8px; border-radius: 2px; }
.map-legend__label {
  font-size: 11px;
  color: #C9DDEB;
  font-variant-numeric: tabular-nums;
}
</style>
