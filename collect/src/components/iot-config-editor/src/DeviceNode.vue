<template>
  <g :class="['node', { alarm: status === '告警' }]">
    <!-- 状态底环 -->
    <circle :cx="55" :cy="55" r="52" fill="none" :stroke="bodyColor" stroke-width="2" opacity="0.35" />

    <!-- 电机 -->
    <g v-if="device.kind === 'motor'">
      <rect x="30" y="26" width="50" height="58" rx="7" :fill="fillColor" :stroke="bodyColor" stroke-width="2.5" />
      <rect x="38" y="18" width="24" height="9" rx="2" :fill="fillColor" :stroke="bodyColor" stroke-width="1.5" />
      <rect x="26" y="80" width="58" height="7" rx="2" :fill="bodyColor" opacity="0.5" />
      <g ref="spinRef" transform="rotate(0 55 55)">
        <circle cx="55" cy="55" r="18" fill="#0c1322" :stroke="bodyColor" stroke-width="2" />
        <g :stroke="bodyColor" stroke-width="3" stroke-linecap="round">
          <line x1="55" y1="42" x2="55" y2="68" />
          <line x1="42" y1="55" x2="68" y2="55" />
          <line x1="46" y1="46" x2="64" y2="64" />
          <line x1="64" y1="46" x2="46" y2="64" />
        </g>
        <circle cx="55" cy="55" r="4" :fill="bodyColor" />
      </g>
    </g>

    <!-- 离心泵 -->
    <g v-else-if="device.kind === 'pump'">
      <rect x="8" y="48" width="20" height="14" rx="3" :fill="fillColor" :stroke="bodyColor" stroke-width="2" />
      <rect x="80" y="20" width="20" height="14" rx="3" :fill="fillColor" :stroke="bodyColor" stroke-width="2" />
      <circle cx="55" cy="55" r="24" :fill="fillColor" :stroke="bodyColor" stroke-width="2.5" />
      <g ref="spinRef" transform="rotate(0 55 55)">
        <g :stroke="bodyColor" stroke-width="3" stroke-linecap="round">
          <line x1="55" y1="38" x2="55" y2="72" />
          <line x1="38" y1="55" x2="72" y2="55" />
          <line x1="43" y1="43" x2="67" y2="67" />
          <line x1="67" y1="43" x2="43" y2="67" />
        </g>
        <circle cx="55" cy="55" r="5" :fill="bodyColor" />
      </g>
    </g>

    <!-- 电动阀 -->
    <g v-else-if="device.kind === 'valve'">
      <rect x="14" y="50" width="82" height="10" rx="3" :fill="fillColor" :stroke="bodyColor" stroke-width="2" />
      <rect x="44" y="38" width="22" height="26" rx="3" :fill="fillColor" :stroke="bodyColor" stroke-width="2.5" />
      <line x1="55" y1="32" x2="55" y2="40" :stroke="bodyColor" stroke-width="2.5" />
      <g ref="spinRef" transform="rotate(0 55 32)">
        <circle cx="55" cy="32" r="13" fill="none" :stroke="bodyColor" stroke-width="2.5" />
        <g :stroke="bodyColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="55" y1="20" x2="55" y2="44" />
          <line x1="43" y1="32" x2="67" y2="32" />
          <line x1="47" y1="24" x2="63" y2="40" />
          <line x1="63" y1="24" x2="47" y2="40" />
        </g>
      </g>
    </g>

    <!-- 储液罐 -->
    <g v-else-if="device.kind === 'tank'">
      <rect x="30" y="20" width="50" height="66" rx="9" :fill="fillColor" :stroke="bodyColor" stroke-width="2.5" />
      <rect ref="fillRef" :x="33" :y="80" width="44" height="0" rx="4" :fill="liquidColor" opacity="0.85" />
      <ellipse cx="55" cy="20" rx="25" ry="6" :fill="fillColor" :stroke="bodyColor" stroke-width="2" />
    </g>

    <!-- 传送带 -->
    <g v-else-if="device.kind === 'conveyor'">
      <rect x="14" y="58" width="82" height="12" rx="4" :fill="fillColor" :stroke="bodyColor" stroke-width="2.5" />
      <circle cx="22" cy="64" r="7" :fill="fillColor" :stroke="bodyColor" stroke-width="2" />
      <circle cx="88" cy="64" r="7" :fill="fillColor" :stroke="bodyColor" stroke-width="2" />
      <line ref="beltRef" x1="22" y1="64" x2="88" y2="64" :stroke="bodyColor" stroke-width="3" stroke-dasharray="6 6" />
      <g v-for="i in BOX_COUNT" :key="i" :ref="(el) => setBox(i - 1, el)" transform="translate(0 0)">
        <rect x="-7" y="44" width="14" height="12" rx="2" :fill="bodyColor" opacity="0.8" />
      </g>
    </g>

    <!-- 振动传感器 -->
    <g v-else-if="device.kind === 'sensor'">
      <rect x="40" y="38" width="30" height="26" rx="4" :fill="fillColor" :stroke="bodyColor" stroke-width="2.5" />
      <line x1="55" y1="64" x2="55" y2="82" :stroke="bodyColor" stroke-width="2.5" />
      <circle cx="55" cy="82" r="4" :fill="bodyColor" />
      <circle ref="pulseRef" cx="55" cy="51" r="10" fill="none" :stroke="bodyColor" stroke-width="2.5" opacity="0.3" />
      <circle cx="55" cy="51" r="5" :fill="bodyColor" />
    </g>

    <!-- 实时迷你曲线 + 绑点值 -->
    <g transform="translate(55 118)">
      <rect x="-50" y="-16" width="100" height="15" rx="4" fill="#0c1322" :stroke="bodyColor" stroke-width="0.8" opacity="0.92" />
      <polyline
        ref="sparkRef"
        :points="sparkPoints"
        fill="none"
        :stroke="bodyColor"
        stroke-width="1.4"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <text x="0" y="8" text-anchor="middle" :fill="bodyColor" font-size="11" font-weight="600">
        {{ labelText }}
      </text>
    </g>
  </g>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, type ComponentPublicInstance } from 'vue'
import { dataBus, TAGS, type DeviceKind } from '@/components/three-iot-scene/dataBus'
import type { PlacedDevice } from './types'

const props = defineProps<{ device: PlacedDevice; status: '运行' | '告警' | '待机' }>()

const BOX_COUNT = 3
const TAG_BY_KEY = Object.fromEntries(TAGS.map((t) => [t.key, t]))

const spinRef = ref<SVGGElement | null>(null)
const fillRef = ref<SVGRectElement | null>(null)
const beltRef = ref<SVGLineElement | null>(null)
const pulseRef = ref<SVGCircleElement | null>(null)
const sparkRef = ref<SVGPolylineElement | null>(null)
const boxEls: (SVGGElement | null)[] = []
const setBox = (i: number, el: Element | ComponentPublicInstance | null) => {
  // 模板函数 ref 的形参宽类型（可能落到组件实例），按需窄化到 SVG 元素
  boxEls[i] = el instanceof SVGGElement ? el : null
}

// 实时迷你曲线：滚动采样绑定数据点的历史值
const HIST = 24
const SAMPLE_DT = 0.12
const hist: number[] = []
let sampleAcc = 0
const sparkPoints = ref('')
const pushSample = (v: number, dt: number) => {
  sampleAcc += dt
  if (sampleAcc < SAMPLE_DT) return
  sampleAcc = 0
  hist.push(v)
  if (hist.length > HIST) hist.shift()
  if (!hist.length) return
  let min = Infinity
  let max = -Infinity
  hist.forEach((x) => {
    if (x < min) min = x
    if (x > max) max = x
  })
  const range = max - min || 1
  const n = hist.length
  const W = 96
  let pts = ''
  for (let i = 0; i < n; i++) {
    const x = -W / 2 + (n === 1 ? 0 : (i / (n - 1)) * W)
    const y = -((hist[i] - min) / range) * 10
    pts += `${x.toFixed(1)},${y.toFixed(1)} `
  }
  sparkPoints.value = pts.trim()
}

const STATUS_TEXT_COLOR: Record<'运行' | '告警' | '待机', string> = {
  运行: '#37e07a',
  告警: '#ff5a3c',
  待机: '#9aa7bd',
}
const bodyColor = computed(() => STATUS_TEXT_COLOR[props.status])
const fillColor = computed(() =>
  props.status === '告警' ? 'rgba(255,90,60,0.12)' : 'rgba(57,224,255,0.10)',
)
// 罐内液体颜色：温度越高越偏橙
const liquidColor = computed(() => {
  const t = dataBus.values['tank.temp'] ?? 38
  const k = Math.min(1, Math.max(0, (t - 30) / 50))
  const r = Math.round(57 + k * 198)
  const g = Math.round(224 - k * 134)
  const b = Math.round(255 - k * 195)
  return `rgb(${r},${g},${b})`
})
const labelText = computed(() => {
  const v = dataBus.values[props.device.tagKey] ?? 0
  const t = TAG_BY_KEY[props.device.tagKey]
  return t ? `${t.label} ${v.toFixed(t.decimals)} ${t.unit}` : props.device.tagKey
})

let raf = 0
let last = 0
let phase = 0
let curVal = 0
let curAngle = 0

const loop = (now: number) => {
  if (!last) last = now
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  const v = dataBus.values[props.device.tagKey] ?? 0
  const k: DeviceKind = props.device.kind
  pushSample(v, dt)

  if (k === 'motor' || k === 'pump') {
    const dps = k === 'motor' ? v / 10 : v * 1.6
    phase += dps * dt
    spinRef.value?.setAttribute('transform', `rotate(${phase} 55 55)`)
  } else if (k === 'valve') {
    const target = v * 3.6
    curAngle += (target - curAngle) * Math.min(1, dt * 3)
    spinRef.value?.setAttribute('transform', `rotate(${curAngle} 55 32)`)
  } else if (k === 'tank') {
    const target = (v / 100) * 60
    curVal += (target - curVal) * Math.min(1, dt * 3)
    const h = Math.max(0, curVal)
    fillRef.value?.setAttribute('height', String(h))
    fillRef.value?.setAttribute('y', String(80 - h))
  } else if (k === 'conveyor') {
    const pps = v * 55
    phase += pps * dt
    beltRef.value?.setAttribute('stroke-dashoffset', String(-phase))
    const span = 110
    for (let i = 0; i < boxEls.length; i++) {
      const x = ((phase + (i * span) / BOX_COUNT) % span) - 14
      boxEls[i]?.setAttribute('transform', `translate(${x.toFixed(1)} 0)`)
    }
  } else if (k === 'sensor') {
    const amp = Math.min(1, v / 9)
    const s = Math.abs(Math.sin(now * 0.006))
    pulseRef.value?.setAttribute('opacity', String(0.25 + 0.75 * s * amp))
    pulseRef.value?.setAttribute('r', String(8 + 12 * s * amp))
  }

  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  raf = requestAnimationFrame(loop)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
})
</script>
