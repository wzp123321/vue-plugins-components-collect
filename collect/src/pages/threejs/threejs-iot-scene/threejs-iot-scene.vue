<template>
  <div class="iot-page">
    <!-- 顶栏 -->
    <header class="iot-top">
      <div class="iot-title">
        <span class="iot-logo">⬡</span>
        <div>
          <div class="t1">物联网 3D 组态 · 设备运转监视</div>
          <div class="t2">Three.js 程序化设备 + 实时数据总线 + 浮动绑点</div>
        </div>
      </div>
      <div class="iot-tools">
        <div class="seg">
          <button
            v-for="s in scenarios"
            :key="s.key"
            :class="['seg-btn', { active: dataBus.scenario === s.key }]"
            @click="onScenario(s.key)"
          >
            {{ s.label }}
          </button>
        </div>
        <button class="ghost" :class="{ on: autoRotate }" @click="toggleRotate">
          {{ autoRotate ? '⏸ 自动旋转' : '▶ 自动旋转' }}
        </button>
        <button class="ghost" @click="handle?.resetView()">⟲ 重置视角</button>
      </div>
    </header>

    <!-- 主体 -->
    <div class="iot-body">
      <div class="iot-stage">
        <ThreeIotScene ref="sceneRef" :auto-rotate="autoRotate" />
        <div class="hint">拖拽旋转 · 滚轮缩放 · 浮动标签即设备绑点（实时数据点）</div>
      </div>

      <aside class="iot-panel">
        <!-- KPI -->
        <section class="card">
          <h3>系统总览</h3>
          <div class="kpis">
            <div class="kpi">
              <Ring :value="kpis.power" :max="120" unit="kW" color="#39e0ff" />
              <span class="kpi-label">系统总功率</span>
            </div>
            <div class="kpi">
              <Ring :value="kpis.avgTemp" :max="100" unit="℃" :color="tempColor" />
              <span class="kpi-label">平均温度</span>
            </div>
            <div class="kpi">
              <div class="alarm-num" :class="{ hot: kpis.alarmCount > 0 }">{{ kpis.alarmCount }}</div>
              <span class="kpi-label">活动报警</span>
            </div>
          </div>
        </section>

        <!-- 设备状态 -->
        <section class="card">
          <h3>设备状态</h3>
          <ul class="dev-list">
            <li v-for="d in DEVICES" :key="d.id">
              <span class="dot" :style="{ background: stColor(deviceStatus[d.id]) }"></span>
              <span class="dn">{{ d.name }}</span>
              <span class="dv">{{ fmt(d.bindings[0].tag) }}</span>
              <span class="ds" :style="{ color: stColor(deviceStatus[d.id]) }">{{ deviceStatus[d.id] }}</span>
            </li>
          </ul>
        </section>

        <!-- 报警 -->
        <section class="card">
          <h3>报警列表 <span class="cnt">{{ alarms.length }}</span></h3>
          <ul class="alarm-list" v-if="alarms.length">
            <li v-for="(a, i) in alarms" :key="i">
              <span class="tag">{{ a.label }}</span>
              <span class="val">{{ a.value.toFixed(a.decimals) }} {{ a.unit }}</span>
              <span class="dev">{{ devName(a.device) }}</span>
            </li>
          </ul>
          <div class="empty" v-else>暂无报警 · 运行正常</div>
        </section>

        <!-- 绑点明细 -->
        <section class="card">
          <h3>绑点明细</h3>
          <div class="bind" v-for="d in DEVICES" :key="d.id">
            <div class="bind-h">{{ d.name }}</div>
            <table>
              <tr v-for="b in d.bindings" :key="b.tag">
                <td class="tg">{{ tagLabel(b.tag) }}</td>
                <td class="pr">{{ b.prop }}</td>
                <td class="ds">{{ b.desc }}</td>
              </tr>
            </table>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, defineComponent } from 'vue'
import ThreeIotScene from '@/components/three-iot-scene/index'
import type { IotSceneHandle } from '@/components/three-iot-scene/src/useIotScene'
import {
  dataBus,
  DEVICES,
  alarms,
  deviceStatus,
  kpis,
  fmt,
  setScenario,
  TAGS,
  type Scenario,
} from '@/components/three-iot-scene/dataBus'

const sceneRef = ref<InstanceType<typeof ThreeIotScene> | null>(null)
const handle = computed(() => sceneRef.value as unknown as IotSceneHandle | null)
const autoRotate = ref(true)

const scenarios: { key: Scenario; label: string }[] = [
  { key: 'normal', label: '正常' },
  { key: 'alarm', label: '告警' },
  { key: 'stop', label: '停机' },
]

const onScenario = (s: Scenario) => {
  setScenario(s)
  handle.value?.setScenario(s)
}
const toggleRotate = () => {
  autoRotate.value = !autoRotate.value
  handle.value?.setAutoRotate(autoRotate.value)
}

const stColorMap: Record<string, string> = { 运行: '#37e07a', 告警: '#ff5a3c', 待机: '#9aa7bd' }
const stColor = (s: string) => stColorMap[s] || '#9aa7bd'
const tempColor = computed(() => (kpis.value.avgTemp > 68 ? '#ff5a3c' : '#39e0ff'))

const devName = (id: string) => DEVICES.find((d) => d.id === id)?.name || id
const tagLabel = (key: string) => TAGS.find((t) => t.key === key)?.label || key

// KPI 环形仪表（轻量 SVG，避免引入额外依赖）
const Ring = defineComponent({
  props: {
    value: Number,
    max: Number,
    unit: String,
    color: { type: String, default: '#39e0ff' },
  },
  setup(props) {
    return () =>
      h('div', { class: 'ring' }, [
        h('svg', { viewBox: '0 0 80 80', width: 72, height: 72 }, [
          h('circle', { cx: 40, cy: 40, r: 32, fill: 'none', stroke: 'rgba(255,255,255,0.08)', 'stroke-width': 8 }),
          h('circle', {
            cx: 40,
            cy: 40,
            r: 32,
            fill: 'none',
            stroke: props.color,
            'stroke-width': 8,
            'stroke-linecap': 'round',
            transform: 'rotate(-90 40 40)',
            'stroke-dasharray': 2 * Math.PI * 32,
            'stroke-dashoffset': 2 * Math.PI * 32 * (1 - (props.value || 0) / (props.max || 1)),
          }),
          h('text', { x: 40, y: 38, 'text-anchor': 'middle', fill: '#e8f0fb', 'font-size': 18, 'font-weight': 600 }, `${Math.round(props.value || 0)}`),
          h('text', { x: 40, y: 54, 'text-anchor': 'middle', fill: '#8aa0bd', 'font-size': 11 }, props.unit || ''),
        ]),
      ])
  },
})
</script>

<style scoped>
.iot-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0b1020;
  color: #dbe6f5;
  font-family: system-ui, 'Segoe UI', sans-serif;
}
.iot-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: linear-gradient(90deg, #121a2e, #0c1322);
  border-bottom: 1px solid rgba(120, 160, 220, 0.18);
}
.iot-title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.iot-logo {
  font-size: 26px;
  color: #39e0ff;
}
.t1 {
  font-size: 16px;
  font-weight: 700;
}
.t2 {
  font-size: 12px;
  color: #8aa0bd;
}
.iot-tools {
  display: flex;
  align-items: center;
  gap: 10px;
}
.seg {
  display: flex;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 3px;
}
.seg-btn {
  border: 0;
  background: transparent;
  color: #aebfd6;
  padding: 6px 14px;
  border-radius: var(--ai-radius-sm);
  cursor: pointer;
  font-size: 13px;
}
.seg-btn.active {
  background: #2f6bff;
  color: #fff;
}
.ghost {
  border: 1px solid rgba(120, 160, 220, 0.3);
  background: transparent;
  color: #cfe0f5;
  padding: 7px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
}
.ghost.on {
  border-color: #39e0ff;
  color: #39e0ff;
}
.iot-body {
  flex: 1;
  display: flex;
  min-height: 0;
}
.iot-stage {
  position: relative;
  flex: 1;
  min-width: 0;
}
.hint {
  position: absolute;
  left: 14px;
  bottom: 12px;
  font-size: 12px;
  color: #8aa0bd;
  background: rgba(12, 18, 30, 0.6);
  padding: 5px 10px;
  border-radius: var(--ai-radius-sm);
}
.iot-panel {
  width: 360px;
  flex-shrink: 0;
  overflow-y: auto;
  padding: 14px;
  background: #0c1322;
  border-left: 1px solid rgba(120, 160, 220, 0.18);
}
.card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(120, 160, 220, 0.14);
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 14px;
}
.card h3 {
  margin: 0 0 10px;
  font-size: 13px;
  color: #9fc4ff;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.cnt {
  font-size: 11px;
  background: #ff5a3c;
  color: #fff;
  border-radius: 10px;
  padding: 1px 7px;
}
.kpis {
  display: flex;
  justify-content: space-between;
}
.kpi {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.kpi-label {
  font-size: 11px;
  color: #8aa0bd;
}
.alarm-num {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.05);
  color: #9aa7bd;
}
.alarm-num.hot {
  color: #ff5a3c;
  background: rgba(255, 90, 60, 0.12);
  box-shadow: 0 0 16px rgba(255, 90, 60, 0.4);
}
.dev-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.dev-list li {
  display: grid;
  grid-template-columns: 14px 1fr auto auto;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
  font-size: 13px;
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.dn {
  color: #dbe6f5;
}
.dv {
  color: #8aa0bd;
  font-family: ui-monospace, monospace;
  font-size: 12px;
}
.ds {
  font-size: 12px;
  font-weight: 600;
}
.alarm-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.alarm-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 12px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
}
.alarm-list .tag {
  background: rgba(255, 90, 60, 0.18);
  color: #ff8a72;
  padding: 2px 7px;
  border-radius: var(--ai-radius-xs);
}
.alarm-list .val {
  font-family: ui-monospace, monospace;
  color: #ffd0c4;
}
.alarm-list .dev {
  margin-left: auto;
  color: #8aa0bd;
}
.empty {
  font-size: 12px;
  color: #37e07a;
  padding: 6px 0;
}
.bind {
  margin-bottom: 10px;
}
.bind-h {
  font-size: 12px;
  color: #cfe0f5;
  font-weight: 600;
  margin-bottom: 4px;
}
.bind table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}
.bind td {
  padding: 3px 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: top;
}
.bind .tg {
  color: #39e0ff;
  white-space: nowrap;
}
.bind .pr {
  color: #dbe6f5;
}
.bind .ds {
  color: #8aa0bd;
}
</style>
