<template>
  <div v-if="items.length" class="map-legend">
    <div class="map-legend__title">{{ title }}</div>
    <div v-for="(item, index) in items" :key="index" class="map-legend__row">
      <i class="map-legend__dot" :style="{ background: item.color, boxShadow: `0 0 6px ${item.color}` }"></i>
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
  position: absolute;
  left: 22px;
  bottom: 22px;
  z-index: 30;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(6, 16, 34, 0.72);
  border: 1px solid rgba(95, 201, 238, 0.16);
  backdrop-filter: blur(8px);
  pointer-events: none;
}
.map-legend__title {
  font-size: 11px;
  letter-spacing: 1px;
  color: #7fa8c8;
  margin-bottom: 7px;
}
.map-legend__row { display: flex; align-items: center; gap: 7px; margin-top: 5px; }
.map-legend__dot { width: 8px; height: 8px; border-radius: 2px; }
.map-legend__label {
  font-size: 11px;
  color: #cfe9ff;
  font-variant-numeric: tabular-nums;
}
</style>
