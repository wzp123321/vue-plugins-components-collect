<!--
 * MapPieChart.vue —— 数据分档饼图（展示型大屏，DOM/SVG 叠加层）
 *
 * 职责：把 markers 的"分档图例 + 各档城市数量"渲染成一张环形饼图卡片，悬浮在
 *   地图角落。与 three 内的 Sprite/Shader 无关，纯 DOM，天然高清、可放文字。
 *
 * 协作：ChinaMap3D 计算 segments（color/label/value）后传入；本组件只负责画。
 * 约定：环形图用 SVG path 画扇区（外 R 50 / 内 r 28），中心显示城市总数。
 -->
<template>
  <div class="map-pie" v-if="segments.length">
    <div class="map-pie__head">{{ title }}</div>
    <div class="map-pie__body">
      <svg class="map-pie__svg" viewBox="0 0 120 120">
        <path v-for="(s, i) in arcs" :key="i" :d="s.d" :fill="s.color" class="map-pie__arc" />
        <text x="60" y="56" class="map-pie__total">{{ total }}</text>
        <text x="60" y="72" class="map-pie__total-label">城市</text>
      </svg>
      <ul class="map-pie__legend">
        <li v-for="(s, i) in segments" :key="i">
          <i :style="{ background: s.color }"></i>
          <span class="map-pie__legend-label">{{ s.label }}</span>
          <span class="map-pie__legend-value">{{ s.value }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Segment {
  color: string
  label: string
  value: number
}

const props = withDefaults(
  defineProps<{
    segments: Segment[]
    title?: string
  }>(),
  { title: '数据分档' },
)

/** 极坐标 → 笛卡尔（SVG 坐标，y 向下） */
const polar = (cx: number, cy: number, r: number, angle: number) => {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const
}

const total = computed(() => props.segments.reduce((sum, s) => sum + s.value, 0))

/** 计算各扇区 path（环形：外弧 + 内弧回绕） */
const arcs = computed(() => {
  const sum = total.value
  if (sum <= 0) return []
  const cx = 60
  const cy = 60
  const R = 50
  const r = 28
  let start = -Math.PI / 2 // 从正上方起笔
  const out: Array<{ d: string; color: string }> = []
  for (const s of props.segments) {
    const angle = (s.value / sum) * Math.PI * 2
    const end = start + angle
    const large = angle > Math.PI ? 1 : 0
    const [x0, y0] = polar(cx, cy, R, start)
    const [x1, y1] = polar(cx, cy, R, end)
    const [x2, y2] = polar(cx, cy, r, end)
    const [x3, y3] = polar(cx, cy, r, start)
    // 单段整圆时 arc 退化，特殊处理
    const d =
      angle >= Math.PI * 2 - 1e-3
        ? `M ${cx - R} ${cy} A ${R} ${R} 0 1 1 ${cx + R} ${cy} A ${R} ${R} 0 1 1 ${cx - R} ${cy} Z M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`
        : `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${r} ${r} 0 ${large} 0 ${x3} ${y3} Z`
    out.push({ d, color: s.color })
    start = end
  }
  return out
})
</script>

<style scoped>
.map-pie {
  /* 位置由父级 .map-left-rail 统一排列（贴左下角、与图例同一条左边缘） */
  position: relative;
  padding: 12px 14px;
  background: rgba(6, 16, 30, 0.82);
  border: 1px solid rgba(95, 201, 238, 0.32);
  border-radius: 10px;
  color: #eaf8ff;
  backdrop-filter: blur(4px);
  user-select: none;
}
.map-pie__head {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #a9dcf2;
  margin-bottom: 8px;
}
.map-pie__body {
  display: flex;
  align-items: center;
  gap: 14px;
}
.map-pie__svg {
  width: 110px;
  height: 110px;
  flex: 0 0 auto;
}
.map-pie__arc {
  stroke: rgba(4, 14, 28, 0.6);
  stroke-width: 0.5;
}
.map-pie__total {
  fill: #ffffff;
  font-size: 26px;
  font-weight: 800;
  text-anchor: middle;
}
.map-pie__total-label {
  fill: #8fb8cc;
  font-size: 11px;
  text-anchor: middle;
}
.map-pie__legend {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 12px;
}
.map-pie__legend li {
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.7;
}
.map-pie__legend i {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex: 0 0 auto;
}
.map-pie__legend-label {
  color: #cfe8f5;
  min-width: 52px;
}
.map-pie__legend-value {
  color: #ffffff;
  font-weight: 700;
}
</style>
