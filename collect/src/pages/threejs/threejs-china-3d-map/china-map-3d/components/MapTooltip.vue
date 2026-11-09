<!--
 * MapTooltip.vue — 跟随鼠标的「悬停数据卡片」
 * 职责：鼠标悬停行政区/标记时，在光标右下方展示名称、级别与数据量。
 * 角色：纯展示组件；所有字段由 ChinaMap3D 的 tooltip 计算属性下发
 *   （x/y 为相对容器左上角的像素坐标，右侧 +16 偏移避免遮挡光标）。
 -->
<template>
  <transition name="tip-fade">
    <div v-if="visible" class="map-tip" :style="{ left: `${x}px`, top: `${y}px` }">
      <div class="map-tip__name">{{ name }}</div>
      <div class="map-tip__row"><span>级别</span><b>{{ levelText }}</b></div>
      <div class="map-tip__row"><span>数据量</span><b class="map-tip__value">{{ value }}</b></div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  /** 相对容器左上角的像素坐标 */
  x: number
  y: number
  name: string
  levelText: string
  value: number | string
}>()
</script>

<style scoped>
.map-tip {
  position: absolute;
  z-index: 45;
  min-width: 150px;
  padding: 10px 14px;
  background: rgba(8, 16, 26, 0.86);
  border: 0.5px solid rgba(127, 179, 212, 0.18);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  color: #cddce8;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  pointer-events: none;
  transform: translateZ(0);
}
.map-tip__name {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: #e8f1f8;
  margin-bottom: 8px;
  padding-bottom: 7px;
  border-bottom: 0.5px solid rgba(127, 179, 212, 0.12);
}
.map-tip__row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 12px;
  line-height: 1.8;
}
.map-tip__row span { color: #8299ad; }
.map-tip__row b { color: #d2e0ec; font-weight: 500; }
.map-tip__value {
  color: #f0f6fb;
  font-size: 15px;
  font-weight: 500;
}
.tip-fade-enter-active,
.tip-fade-leave-active { transition: opacity 0.16s ease, transform 0.16s ease; }
.tip-fade-enter-from,
.tip-fade-leave-to { opacity: 0; transform: translateY(4px); }
</style>
