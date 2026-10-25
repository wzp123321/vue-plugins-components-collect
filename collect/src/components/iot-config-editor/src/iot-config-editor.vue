<template>
  <div class="editor">
    <!-- 元件库 -->
    <aside class="palette">
      <div class="pal-h">元件库</div>
      <p class="pal-tip">拖拽或点击添加到画布</p>
      <button
        v-for="p in palette"
        :key="p.kind"
        class="pal-item"
        @pointerdown.prevent="onPaletteDown(p.kind, $event)"
        @click="onPaletteClick(p.kind)"
      >
        <span class="pal-ico" v-html="p.ico"></span>
        <span class="pal-name">{{ p.name }}</span>
      </button>
    </aside>

    <!-- 画布 -->
    <div class="canvas-wrap" ref="wrapRef">
      <!-- 顶部工具条 -->
      <div class="topbar">
        <div class="grp">
          <button :class="['tb', { on: tool === 'select' }]" @click="tool = 'select'">➤ 选择</button>
          <button :class="['tb', { on: tool === 'hand' }]" @click="tool = 'hand'">✋ 抓手</button>
        </div>
        <div class="grp">
          <button class="tb" :disabled="!past.length" @click="undo">↩ 撤销</button>
          <button class="tb" :disabled="!future.length" @click="redo">↪ 重做</button>
        </div>
        <div class="grp">
          <button class="tb" @click="zoomBy(1 / 1.2)">－</button>
          <span class="z">{{ zoomPct }}%</span>
          <button class="tb" @click="zoomBy(1.2)">＋</button>
          <button class="tb" @click="fitView">适配</button>
          <button class="tb" @click="resetView">复位</button>
        </div>
        <div class="grp">
          <button :class="['tb', { on: snapOn }]" @click="snapOn = !snapOn">⊞ 吸附</button>
          <button class="tb" :disabled="!selectedIds.length" @click="copySel">复制</button>
          <button class="tb" :disabled="!clipboard" @click="paste">粘贴</button>
          <button class="tb" @click="selectAll">全选</button>
          <button class="tb danger" :disabled="!selectedIds.length" @click="deleteSelected">删除</button>
        </div>
        <div class="grp">
          <button class="tb" @click="fileRef?.click()">导入</button>
          <button class="tb" @click="exportJson">导出</button>
        </div>
      </div>
      <input ref="fileRef" type="file" accept="application/json,.json" hidden @change="onFile" />

      <svg
        ref="svgRef"
        class="canvas"
        viewBox="0 0 1280 720"
        preserveAspectRatio="xMidYMid meet"
        @pointerdown.self="onBgDown"
        @wheel.prevent="onWheel"
        @contextmenu.prevent
      >
        <defs>
          <pattern id="iot-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0 L0 0 0 40" fill="none" stroke="rgba(120,160,220,0.08)" stroke-width="1" />
          </pattern>
        </defs>

        <!-- 内容层（缩放/平移） -->
        <g :transform="viewTransform">
          <!-- 网格背景，随内容移动 -->
          <rect x="-4000" y="-4000" width="8000" height="8000" fill="url(#iot-grid)" pointer-events="none" />

          <!-- 连线 -->
          <g class="wires">
            <template v-for="g in wireGeoms" :key="g.id">
              <path
                :id="'wp-' + g.id"
                class="wire"
                :class="{ flow: g.active }"
                :d="g.d"
                @click.stop="removeWire(g.id)"
              />
              <!-- 方向箭头（连线中点，指向被驱动设备） -->
              <path
                class="wire-arrow"
                :class="{ on: g.active }"
                :transform="`translate(${g.mx},${g.my}) rotate(${g.ang})`"
                d="M -5 -4 L 6 0 L -5 4 Z"
              />
              <!-- 流动粒子（仅激活时，沿路径由 from→to） -->
              <g v-if="g.active" class="particles">
                <circle v-for="off in particleOffsets" :key="off" r="3" class="dot">
                  <animateMotion dur="1.1s" repeatCount="indefinite" :begin="off">
                    <mpath :href="'#wp-' + g.id" />
                  </animateMotion>
                </circle>
              </g>
            </template>
            <path v-if="drag.mode === 'wire'" class="wire draft" :d="draftPath" />
          </g>

          <!-- 框选 -->
          <rect
            v-if="marquee.active"
            class="marquee"
            :x="Math.min(marquee.start.x, marquee.cur.x)"
            :y="Math.min(marquee.start.y, marquee.cur.y)"
            :width="Math.abs(marquee.cur.x - marquee.start.x)"
            :height="Math.abs(marquee.cur.y - marquee.start.y)"
          />

          <!-- 设备 -->
          <g
            v-for="d in devices"
            :key="d.uid"
            class="dev-g"
            :class="{ sel: selectedIds.includes(d.uid) }"
            :transform="`translate(${d.x},${d.y})`"
            @pointerdown="onDeviceDown(d, $event)"
            @contextmenu.prevent="onCtx(d, $event)"
          >
            <rect x="0" y="0" :width="DEVICE_W" :height="DEVICE_H" fill="none" pointer-events="all" />
            <DeviceNode :device="d" :status="statusOf(d)" />
            <circle class="port" cx="0" :cy="DEVICE_H / 2" r="7" @pointerdown.stop="onPortDown(d, $event)" />
            <circle class="port" :cx="DEVICE_W" :cy="DEVICE_H / 2" r="7" @pointerdown.stop="onPortDown(d, $event)" />
          </g>
        </g>
      </svg>

      <!-- 拖拽 ghost -->
      <div v-if="drag.mode === 'palette'" class="ghost" :style="{ left: drag.gx + 'px', top: drag.gy + 'px' }">
        {{ kindName(drag.kind) }}
      </div>

      <!-- 空态 -->
      <div v-if="!devices.length" class="empty-hint">
        从左侧元件库拖拽 / 点击添加设备，开始搭建你的物联网组态
      </div>

      <!-- 右键菜单 -->
      <div v-if="ctx.show" class="ctx" :style="{ left: ctx.x + 'px', top: ctx.y + 'px' }" @pointerdown.stop>
        <button @click="dupOne(ctx.uid)">复制</button>
        <button @click="delOne(ctx.uid)">删除</button>
      </div>

      <!-- 底部工具条 -->
      <div class="toolbar">
        <div class="seg">
          <button
            v-for="s in scenarios"
            :key="s.key"
            :class="['seg-btn', { active: dataBus.scenario === s.key }]"
            @click="setScenario(s.key)"
          >
            {{ s.label }}
          </button>
        </div>
        <span class="tc">设备 {{ devices.length }} · 连线 {{ wires.length }} · 选中 {{ selectedIds.length }}</span>
        <button class="tb" @click="saveLayout">保存布局</button>
        <button class="tb" @click="clearAll">清空</button>
        <span v-if="savedAt" class="saved">已保存 {{ savedAt }}</span>
      </div>
    </div>

    <!-- 属性面板 -->
    <aside class="props">
      <template v-if="primary">
        <div class="props-h">设备属性 <span v-if="selectedIds.length > 1" class="badge">已选 {{ selectedIds.length }}</span></div>
        <div class="row">
          <label>类型</label><span class="val">{{ kindName(primary.kind) }}</span>
        </div>
        <div class="row">
          <label>名称</label>
          <input v-model="primary.label" class="inp" @focusin="commit" />
        </div>
        <div class="row">
          <label>绑点数据</label>
          <select v-model="primary.tagKey" class="inp" @focusin="commit">
            <option v-for="t in tagOptions(primary.kind)" :key="t.key" :value="t.key">
              {{ t.label }} ({{ t.unit }})
            </option>
          </select>
        </div>
        <div class="row">
          <label>状态</label>
          <span class="val" :style="{ color: statusColor(statusOf(primary)) }">{{ statusOf(primary) }}</span>
        </div>
        <div class="row">
          <label>当前值</label>
          <span class="val mono">{{ liveValue(primary) }}</span>
        </div>
        <button class="del" @click="delOne(primary.uid)">删除此设备</button>
        <p class="hint" v-if="selectedIds.length > 1">已选中多个设备：可一键批量删除，或在画布上整体拖动。</p>
      </template>

      <template v-else>
        <div class="props-h">提示</div>
        <ul class="tips">
          <li>点击设备查看 / 修改属性</li>
          <li>拖动设备主体自由布局（可整组移动）</li>
          <li><strong>Shift</strong> 点选可多选，空白处拖拽框选</li>
          <li>从设备左右<strong>圆点</strong>拖到另一设备连线，点击连线删除</li>
          <li>连线激活后出现<strong>方向箭头 + 流动粒子</strong>，表示 from → to 的信号/动力流向</li>
          <li>设备底部为绑定数据点的<strong>实时迷你曲线</strong></li>
          <li>滚轮缩放、抓手(或中键)平移画布</li>
          <li><strong>Ctrl+Z</strong> 撤销 / <strong>Ctrl+C/V</strong> 复制粘贴 / <strong>Del</strong> 删除</li>
          <li>顶部可导入 / 导出组态 JSON，切换「正常 / 告警 / 停机」</li>
        </ul>
      </template>

      <div class="props-h" style="margin-top: 16px">连线列表</div>
      <ul class="wire-list" v-if="wires.length">
        <li v-for="w in wires" :key="w.id">
          <span>{{ devName(w.from) }} → {{ devName(w.to) }}</span>
          <button class="x" @click="removeWire(w.id)">×</button>
        </li>
      </ul>
      <div class="muted" v-else>暂无连线</div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import DeviceNode from './DeviceNode.vue'
import {
  dataBus,
  DEVICES,
  TAGS,
  deviceStatus,
  setScenario,
  startBus,
  type DeviceKind,
  type Scenario,
} from '@/components/three-iot-scene/dataBus'
import type { PlacedDevice, Wire, Layout } from './types'

const DEVICE_W = 110
const DEVICE_H = 110
const SNAP = 20
const STORE_KEY = 'iot-config-editor-v1'

const svgRef = ref<SVGSVGElement | null>(null)
const wrapRef = ref<HTMLElement | null>(null)
const fileRef = ref<HTMLInputElement | null>(null)
const devices = reactive<PlacedDevice[]>([])
const wires = reactive<Wire[]>([])
const selectedIds = reactive<string[]>([])

const view = reactive({ scale: 1, tx: 0, ty: 0 })
const tool = ref<'select' | 'hand'>('select')
const snapOn = ref(true)

const drag = reactive({
  mode: 'idle' as 'idle' | 'move' | 'wire' | 'palette' | 'pan' | 'marquee',
  kind: '' as DeviceKind | '',
  uid: '',
  gx: 0,
  gy: 0,
  moved: false,
})
const dragOffsets: Record<string, { ox: number; oy: number }> = {}
const draft = reactive({ x: 0, y: 0 })
const marquee = reactive({ active: false, start: { x: 0, y: 0 }, cur: { x: 0, y: 0 }, moved: false })
const panLast = reactive({ x: 0, y: 0 })
const ctx = reactive({ show: false, x: 0, y: 0, uid: '' })
const savedAt = ref('')
const clipboard = ref<string>('')

// 撤销/重做
const past = ref<string[]>([])
const future = ref<string[]>([])

const primary = computed(() => devices.find((d) => d.uid === selectedIds[0]) || null)
const zoomPct = computed(() => Math.round(view.scale * 100))
const viewTransform = computed(() => `translate(${view.tx},${view.ty}) scale(${view.scale})`)

const scenarios: { key: Scenario; label: string }[] = [
  { key: 'normal', label: '正常' },
  { key: 'alarm', label: '告警' },
  { key: 'stop', label: '停机' },
]
// 简易元件图标（SVG path 串）——须在 palette 之前声明
const ICON: Record<string, string> = {
  motor: '<svg width="22" height="22" viewBox="0 0 24 24"><rect x="6" y="5" width="12" height="14" rx="2" fill="none" stroke="#39e0ff" stroke-width="1.6"/><circle cx="12" cy="12" r="4" fill="none" stroke="#39e0ff" stroke-width="1.6"/></svg>',
  pump: '<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" fill="none" stroke="#39e0ff" stroke-width="1.6"/><path d="M12 6v12M6 12h12" stroke="#39e0ff" stroke-width="1.4"/></svg>',
  valve: '<svg width="22" height="22" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="3" fill="none" stroke="#39e0ff" stroke-width="1.6"/><circle cx="12" cy="8" r="3" fill="none" stroke="#39e0ff" stroke-width="1.6"/></svg>',
  tank: '<svg width="22" height="22" viewBox="0 0 24 24"><rect x="7" y="4" width="10" height="16" rx="2" fill="none" stroke="#39e0ff" stroke-width="1.6"/><rect x="8" y="12" width="8" height="7" fill="#39e0ff" opacity=".5"/></svg>',
  conveyor: '<svg width="22" height="22" viewBox="0 0 24 24"><rect x="3" y="13" width="18" height="4" rx="2" fill="none" stroke="#39e0ff" stroke-width="1.6"/><circle cx="6" cy="15" r="2" stroke="#39e0ff" stroke-width="1.4"/></svg>',
  sensor: '<svg width="22" height="22" viewBox="0 0 24 24"><rect x="8" y="6" width="8" height="7" rx="1" fill="none" stroke="#39e0ff" stroke-width="1.6"/><path d="M12 13v6" stroke="#39e0ff" stroke-width="1.6"/></svg>',
}

const palette = DEVICES.map((d) => ({ kind: d.kind as DeviceKind, name: d.name, ico: ICON[d.kind] || '◆' }))

const uidSeq = { n: 0 }
const widSeq = { n: 0 }
const nextUid = () => `d${  ++uidSeq.n}`
const nextWid = () => `w${  ++widSeq.n}`

const byUid = (uid: string) => devices.find((d) => d.uid === uid)
const round = (n: number) => Math.round(n)
const defaultTagFor = (kind: DeviceKind): string => TAGS.find((t) => t.device === kind)?.key || TAGS[0].key
const kindName = (kind: string): string => DEVICES.find((d) => d.kind === kind)?.name || kind
const tagOptions = (kind: DeviceKind) => TAGS.filter((t) => t.device === kind)
const statusOf = (d: PlacedDevice): '运行' | '告警' | '待机' => deviceStatus.value[d.kind] || '待机'
const STATUS_TEXT_COLOR: Record<string, string> = { 运行: '#37e07a', 告警: '#ff5a3c', 待机: '#9aa7bd' }
const statusColor = (s: string) => STATUS_TEXT_COLOR[s] || '#37e07a'
const liveValue = (d: PlacedDevice) => {
  const t = TAGS.find((x) => x.key === d.tagKey)
  const v = dataBus.values[d.tagKey] ?? 0
  return t ? `${v.toFixed(t.decimals)} ${t.unit}` : String(v)
}
const devName = (uid: string) => devices.find((d) => d.uid === uid)?.label || uid

// ---- 历史 ---- //
const snapshot = () =>
  JSON.stringify({
    devices: devices.map((d) => ({ ...d })),
    wires: wires.map((w) => ({ ...w })),
  })
const resyncSeq = () => {
  let mu = 0
  let mw = 0
  devices.forEach((d) => {
    mu = Math.max(mu, Number(d.uid.replace('d', '')) || 0)
  })
  wires.forEach((w) => {
    mw = Math.max(mw, Number(w.id.replace('w', '')) || 0)
  })
  uidSeq.n = mu
  widSeq.n = mw
}
const commit = () => {
  past.value.push(snapshot())
  if (past.value.length > 60) past.value.shift()
  future.value = []
}
const restore = (s: string) => {
  const o = JSON.parse(s) as Layout
  devices.splice(0, devices.length, ...o.devices)
  wires.splice(0, wires.length, ...(o.wires || []))
  selectedIds.splice(0, selectedIds.length)
  resyncSeq()
}
const undo = () => {
  if (!past.value.length) return
  future.value.push(snapshot())
  restore(past.value.pop() as string)
}
const redo = () => {
  if (!future.value.length) return
  past.value.push(snapshot())
  restore(future.value.pop() as string)
}

// ---- 增删 ---- //
const addDevice = (kind: DeviceKind, x: number, y: number, tagKey?: string, label?: string) => {
  commit()
  const uid = nextUid()
  devices.push({
    uid,
    kind,
    x: round(x - DEVICE_W / 2),
    y: round(y - DEVICE_H / 2),
    label: label || kindName(kind),
    tagKey: tagKey || defaultTagFor(kind),
  })
  selectedIds.splice(0, selectedIds.length, uid)
}
const removeDeviceNow = (uid: string) => {
  const i = devices.findIndex((d) => d.uid === uid)
  if (i >= 0) devices.splice(i, 1)
  for (let j = wires.length - 1; j >= 0; j--) {
    if (wires[j].from === uid || wires[j].to === uid) wires.splice(j, 1)
  }
  const si = selectedIds.indexOf(uid)
  if (si >= 0) selectedIds.splice(si, 1)
}
const removeDevice = (uid: string) => {
  commit()
  removeDeviceNow(uid)
}
const delOne = (uid: string) => {
  removeDevice(uid)
}
const selectAll = () => {
  selectedIds.splice(0, selectedIds.length, ...devices.map((d) => d.uid))
}
const addWire = (from: string, to: string) => {
  if (from === to) return
  if (wires.some((w) => w.from === from && w.to === to)) return
  commit()
  wires.push({ id: nextWid(), from, to })
}
const removeWire = (id: string) => {
  commit()
  const i = wires.findIndex((w) => w.id === id)
  if (i >= 0) wires.splice(i, 1)
}
const dupOne = (uid: string) => {
  const d = byUid(uid)
  if (!d) return
  addDevice(d.kind, d.x + DEVICE_W + 30, d.y, d.tagKey, `${d.label} 副本`)
}
const deleteSelected = () => {
  if (!selectedIds.length) return
  commit()
  ;[...selectedIds].forEach((uid) => removeDeviceNow(uid))
}
const clearAll = () => {
  if (!window.confirm('确定清空当前组态？（已保存的本地布局仍可通过刷新恢复）')) return
  commit()
  devices.splice(0, devices.length)
  wires.splice(0, wires.length)
  selectedIds.splice(0, selectedIds.length)
}

// ---- 端口 / 连线坐标 ---- //
const portRight = (d: PlacedDevice) => ({ x: d.x + DEVICE_W, y: d.y + DEVICE_H / 2 })
const portLeft = (d: PlacedDevice) => ({ x: d.x, y: d.y + DEVICE_H / 2 })
interface WireGeom {
  id: string
  d: string
  active: boolean
  mx: number
  my: number
  ang: number
}
const isWireActive = (w: Wire): boolean => {
  const a = byUid(w.from)
  const b = byUid(w.to)
  if (!a || !b) return false
  return statusOf(a) !== '待机' && statusOf(b) !== '待机'
}
const wireGeom = (w: Wire): WireGeom | null => {
  const a = byUid(w.from)
  const b = byUid(w.to)
  if (!a || !b) return null
  const p1 = portRight(a)
  const p2 = portLeft(b)
  const dx = Math.max(40, Math.abs(p2.x - p1.x) / 2)
  const c1x = p1.x + dx
  const c1y = p1.y
  const c2x = p2.x - dx
  const c2y = p2.y
  const d = `M ${p1.x} ${p1.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  // 三次贝塞尔中点 t=0.5 与切线方向（用于箭头朝向）
  const mx = 0.125 * p1.x + 0.375 * c1x + 0.375 * c2x + 0.125 * p2.x
  const my = 0.125 * p1.y + 0.375 * c1y + 0.375 * c2y + 0.125 * p2.y
  const tx = 0.75 * (c1x - p1.x) + 1.5 * (c2x - c1x) + 0.75 * (p2.x - c2x)
  const ty = 0.75 * (c1y - p1.y) + 1.5 * (c2y - c1y) + 0.75 * (p2.y - c2y)
  const ang = (Math.atan2(ty, tx) * 180) / Math.PI
  return { id: w.id, d, active: isWireActive(w), mx, my, ang }
}
const particleOffsets = ['0s', '-0.55s']
const wireGeoms = computed<WireGeom[]>(() => wires.map(wireGeom).filter((x): x is WireGeom => x !== null))
const draftPath = computed(() => {
  const a = byUid(drag.uid)
  if (!a) return ''
  const p1 = portRight(a)
  return `M ${p1.x} ${p1.y} L ${draft.x} ${draft.y}`
})

// ---- 坐标转换（含视图变换） ---- //
const clientToVb = (clientX: number, clientY: number) => {
  const svg = svgRef.value
  if (!svg) return { x: 0, y: 0 }
  const pt = svg.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return { x: 0, y: 0 }
  const p = pt.matrixTransform(ctm.inverse())
  return { x: p.x, y: p.y }
}
const toSvg = (e: PointerEvent) => {
  const v = clientToVb(e.clientX, e.clientY)
  return { x: (v.x - view.tx) / view.scale, y: (v.y - view.ty) / view.scale }
}
const deviceAt = (pt: { x: number; y: number }): PlacedDevice | null => {
  for (let i = devices.length - 1; i >= 0; i--) {
    const d = devices[i]
    if (pt.x >= d.x && pt.x <= d.x + DEVICE_W && pt.y >= d.y && pt.y <= d.y + DEVICE_H) return d
  }
  return null
}

// ---- 视图：缩放/平移/适配 ---- //
const applyZoom = (vbx: number, vby: number, factor: number) => {
  const cx = (vbx - view.tx) / view.scale
  const cy = (vby - view.ty) / view.scale
  view.scale = Math.min(4, Math.max(0.25, view.scale * factor))
  view.tx = vbx - cx * view.scale
  view.ty = vby - cy * view.scale
}
const zoomBy = (factor: number) => {
  const c = clientToVb(window.innerWidth / 2, window.innerHeight / 2)
  applyZoom(c.x, c.y, factor)
}
const onWheel = (e: WheelEvent) => {
  const v = clientToVb(e.clientX, e.clientY)
  applyZoom(v.x, v.y, e.deltaY < 0 ? 1.1 : 1 / 1.1)
}
const resetView = () => {
  view.scale = 1
  view.tx = 0
  view.ty = 0
}
const fitView = () => {
  if (!devices.length) {
    resetView()
    return
  }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  devices.forEach((d) => {
    minX = Math.min(minX, d.x)
    minY = Math.min(minY, d.y)
    maxX = Math.max(maxX, d.x + DEVICE_W)
    maxY = Math.max(maxY, d.y + DEVICE_H)
  })
  const pad = 80
  const w = maxX - minX + pad * 2
  const h = maxY - minY + pad * 2
  const scale = Math.min(4, Math.max(0.25, Math.min(1280 / w, 720 / h)))
  view.scale = scale
  view.tx = 640 - (minX - pad + w / 2) * scale
  view.ty = 360 - (minY - pad + h / 2) * scale
}

// ---- 窗口拖拽监听 ---- //
let winMove: ((e: PointerEvent) => void) | null = null
let winUp: ((e: PointerEvent) => void) | null = null
const removeWin = () => {
  if (winMove) window.removeEventListener('pointermove', winMove)
  if (winUp) window.removeEventListener('pointerup', winUp)
  winMove = null
  winUp = null
}
const isOverCanvas = (e: PointerEvent): boolean => {
  const w = wrapRef.value
  if (!w) return false
  const r = w.getBoundingClientRect()
  return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
}
const applyMarquee = (shift: boolean) => {
  const x1 = Math.min(marquee.start.x, marquee.cur.x)
  const y1 = Math.min(marquee.start.y, marquee.cur.y)
  const x2 = Math.max(marquee.start.x, marquee.cur.x)
  const y2 = Math.max(marquee.start.y, marquee.cur.y)
  const hit = devices.filter((d) => {
    const cx = d.x + DEVICE_W / 2
    const cy = d.y + DEVICE_H / 2
    return cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2
  })
  if (!shift) selectedIds.splice(0, selectedIds.length)
  hit.forEach((d) => {
    if (!selectedIds.includes(d.uid)) selectedIds.push(d.uid)
  })
}
const addWin = () => {
  winMove = (e: PointerEvent) => {
    if (drag.mode === 'move') {
      if (!drag.moved) {
        commit()
        drag.moved = true
      }
      const pt = toSvg(e)
      selectedIds.forEach((uid) => {
        const d = byUid(uid)
        const o = dragOffsets[uid]
        if (!d || !o) return
        let nx = pt.x - o.ox
        let ny = pt.y - o.oy
        if (snapOn.value) {
          nx = Math.round(nx / SNAP) * SNAP
          ny = Math.round(ny / SNAP) * SNAP
        }
        d.x = nx
        d.y = ny
      })
    } else if (drag.mode === 'wire') {
      const pt = toSvg(e)
      draft.x = pt.x
      draft.y = pt.y
    } else if (drag.mode === 'palette') {
      drag.gx = e.clientX
      drag.gy = e.clientY
    } else if (drag.mode === 'pan') {
      const v = clientToVb(e.clientX, e.clientY)
      view.tx += v.x - panLast.x
      view.ty += v.y - panLast.y
      panLast.x = v.x
      panLast.y = v.y
    } else if (drag.mode === 'marquee') {
      const pt = toSvg(e)
      marquee.cur = { x: pt.x, y: pt.y }
      marquee.moved = true
    }
  }
  winUp = (e: PointerEvent) => {
    if (drag.mode === 'wire') {
      const pt = toSvg(e)
      const tgt = deviceAt(pt)
      if (tgt && tgt.uid !== drag.uid) addWire(drag.uid, tgt.uid)
    } else if (drag.mode === 'palette') {
      if (isOverCanvas(e)) {
        const pt = toSvg(e)
        addDevice(drag.kind as DeviceKind, pt.x, pt.y)
      }
    } else if (drag.mode === 'marquee') {
      const dx = Math.abs(marquee.cur.x - marquee.start.x)
      const dy = Math.abs(marquee.cur.y - marquee.start.y)
      if (dx < 3 && dy < 3) {
        if (!e.shiftKey) selectedIds.splice(0, selectedIds.length)
      } else {
        applyMarquee(e.shiftKey)
      }
      marquee.active = false
    }
    drag.mode = 'idle'
    drag.kind = ''
    drag.uid = ''
    removeWin()
  }
  window.addEventListener('pointermove', winMove)
  window.addEventListener('pointerup', winUp)
}
const startPan = (e: PointerEvent) => {
  drag.mode = 'pan'
  const v = clientToVb(e.clientX, e.clientY)
  panLast.x = v.x
  panLast.y = v.y
  addWin()
}

// ---- 交互 ---- //
const onPaletteDown = (kind: DeviceKind, e: PointerEvent) => {
  drag.mode = 'palette'
  drag.kind = kind
  drag.gx = e.clientX
  drag.gy = e.clientY
  addWin()
}
const onPaletteClick = (kind: DeviceKind) => {
  addDevice(kind, 640 + (Math.random() - 0.5) * 200, 360 + (Math.random() - 0.5) * 160)
}
const onDeviceDown = (d: PlacedDevice, e: PointerEvent) => {
  if (e.button === 2) return // 右键交给 contextmenu
  if (e.button === 1) {
    startPan(e)
    return
  }
  e.stopPropagation()
  if (e.shiftKey) {
    const i = selectedIds.indexOf(d.uid)
    if (i >= 0) selectedIds.splice(i, 1)
    else selectedIds.push(d.uid)
    return
  }
  if (!selectedIds.includes(d.uid)) selectedIds.splice(0, selectedIds.length, d.uid)
  drag.mode = 'move'
  drag.uid = d.uid
  drag.moved = false
  const pt = toSvg(e)
  selectedIds.forEach((uid) => {
    const dd = byUid(uid)
    if (dd) dragOffsets[uid] = { ox: pt.x - dd.x, oy: pt.y - dd.y }
  })
  addWin()
}
const onPortDown = (d: PlacedDevice, e: PointerEvent) => {
  drag.mode = 'wire'
  drag.uid = d.uid
  const pt = toSvg(e)
  draft.x = pt.x
  draft.y = pt.y
  addWin()
}
const onBgDown = (e: PointerEvent) => {
  if (e.button === 1 || tool.value === 'hand') {
    startPan(e)
    return
  }
  if (e.button !== 0) return
  marquee.active = true
  marquee.moved = false
  const pt = toSvg(e)
  marquee.start = { x: pt.x, y: pt.y }
  marquee.cur = { x: pt.x, y: pt.y }
  addWin()
}
const onCtx = (d: PlacedDevice, e: MouseEvent) => {
  if (!selectedIds.includes(d.uid)) selectedIds.splice(0, selectedIds.length, d.uid)
  ctx.show = true
  ctx.uid = d.uid
  ctx.x = e.clientX
  ctx.y = e.clientY
}

// ---- 复制 / 粘贴 ---- //
const copySel = () => {
  if (!selectedIds.length) return
  const sel = devices.filter((d) => selectedIds.includes(d.uid))
  clipboard.value = JSON.stringify(sel.map((d) => ({ kind: d.kind, label: d.label, tagKey: d.tagKey })))
}
const paste = () => {
  if (!clipboard.value) return
  const arr = JSON.parse(clipboard.value) as { kind: DeviceKind; label: string; tagKey: string }[]
  commit()
  const baseX = (devices.length ? Math.max(...devices.map((d) => d.x)) : 300) + DEVICE_W + 40
  arr.forEach((s, i) => {
    addDevice(s.kind, baseX + i * 20, 360 + i * 20, s.tagKey, s.label)
  })
}

// ---- 导入 / 导出 ---- //
const exportJson = () => {
  const layout: Layout = {
    devices: JSON.parse(JSON.stringify(devices)),
    wires: JSON.parse(JSON.stringify(wires)),
  }
  const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'iot-config.json'
  a.click()
  URL.revokeObjectURL(a.href)
}
const onFile = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  const r = new FileReader()
  r.onload = () => {
    try {
      const o = JSON.parse(r.result as string) as Layout
      if (!o.devices?.length) throw new Error('no devices')
      commit()
      devices.splice(0, devices.length, ...o.devices)
      wires.splice(0, wires.length, ...(o.wires || []))
      selectedIds.splice(0, selectedIds.length)
      resyncSeq()
      fitView()
    } catch {
      window.alert('导入失败：JSON 格式不正确')
    }
    ;(e.target as HTMLInputElement).value = ''
  }
  r.readAsText(f)
}

// ---- 持久化 ---- //
const saveLayout = () => {
  const layout: Layout = {
    devices: JSON.parse(JSON.stringify(devices)),
    wires: JSON.parse(JSON.stringify(wires)),
  }
  localStorage.setItem(STORE_KEY, JSON.stringify(layout))
  const d = new Date()
  savedAt.value = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d
    .getSeconds()
    .toString()
    .padStart(2, '0')}`
}
const loadLayout = (): boolean => {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return false
    const layout = JSON.parse(raw) as Layout
    if (!layout.devices?.length) return false
    devices.splice(0, devices.length, ...layout.devices)
    wires.splice(0, wires.length, ...(layout.wires || []))
    resyncSeq()
    return true
  } catch {
    return false
  }
}

// ---- 键盘 ---- //
const onKey = (e: KeyboardEvent) => {
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
  const mod = e.ctrlKey || e.metaKey
  const k = e.key.toLowerCase()
  if (mod && k === 'z') {
    e.preventDefault()
    if (e.shiftKey) {
      redo()
    } else {
      undo()
    }
  } else if (mod && k === 'y') {
    e.preventDefault()
    redo()
  } else if (mod && k === 'c') {
    e.preventDefault()
    copySel()
  } else if (mod && k === 'v') {
    e.preventDefault()
    paste()
  } else if (mod && k === 'a') {
    e.preventDefault()
    selectedIds.splice(0, selectedIds.length, ...devices.map((d) => d.uid))
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedIds.length) {
      e.preventDefault()
      deleteSelected()
    }
  } else if (e.key === 'Escape') {
    selectedIds.splice(0, selectedIds.length)
    ctx.show = false
  }
}

const seedDefault = () => {
  const seed: [DeviceKind, number, number, string][] = [
    ['motor', 140, 130, 'motor.rpm'],
    ['pump', 400, 160, 'pump.flow'],
    ['valve', 680, 170, 'valve.position'],
    ['tank', 940, 130, 'tank.level'],
    ['conveyor', 340, 440, 'conveyor.speed'],
    ['sensor', 140, 410, 'sensor.vibration'],
  ]
  seed.forEach(([k, x, y, t]) => addDevice(k, x + DEVICE_W / 2, y + DEVICE_H / 2, t))
  addWire(devices[0].uid, devices[1].uid)
  addWire(devices[1].uid, devices[2].uid)
  addWire(devices[1].uid, devices[3].uid)
  addWire(devices[0].uid, devices[5].uid)
}

// 任意点击关闭右键菜单（菜单自身 @pointerdown.stop 已阻止冒泡）
const closeCtx = () => {
  if (ctx.show) ctx.show = false
}

onMounted(() => {
  startBus()
  if (!loadLayout()) seedDefault()
  window.addEventListener('keydown', onKey)
  window.addEventListener('pointerdown', closeCtx)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('pointerdown', closeCtx)
  removeWin()
})
</script>

<style scoped>
.editor {
  height: 100%;
  display: flex;
  background: #0b1020;
  color: #dbe6f5;
  font-family: system-ui, 'Segoe UI', sans-serif;
  user-select: none;
}
.palette {
  width: 132px;
  flex-shrink: 0;
  padding: 12px 10px;
  background: #0c1322;
  border-right: 1px solid rgba(120, 160, 220, 0.16);
  overflow-y: auto;
}
.pal-h {
  font-size: 13px;
  font-weight: 700;
  color: #9fc4ff;
  margin-bottom: 4px;
}
.pal-tip {
  font-size: 11px;
  color: #8aa0bd;
  margin: 0 0 10px;
}
.pal-item {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(120, 160, 220, 0.18);
  border-radius: 9px;
  color: #cfe0f5;
  cursor: grab;
  font-size: 12px;
  transition: all 0.15s;
}
.pal-item:hover {
  border-color: #39e0ff;
  background: rgba(57, 224, 255, 0.08);
  color: #fff;
}
.pal-item:active {
  cursor: grabbing;
}
.pal-ico {
  height: 24px;
  display: flex;
  align-items: center;
}
.canvas-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.canvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
  background: #0a0f1d;
}
.dev-g {
  cursor: move;
}
.dev-g.sel :deep(.node) > circle:first-child {
  stroke: #ffd34e !important;
  opacity: 0.9 !important;
}
.dev-g.sel {
  filter: drop-shadow(0 0 6px rgba(255, 211, 78, 0.5));
}
.port {
  fill: #0b1020;
  stroke: #ffd34e;
  stroke-width: 2.5;
  cursor: crosshair;
}
.port:hover {
  fill: #ffd34e;
}
.wire {
  fill: none;
  stroke: #5b7fb0;
  stroke-width: 2.5;
  cursor: pointer;
}
.wire.flow {
  stroke: #39e0ff;
  stroke-dasharray: 8 6;
  animation: flow 0.8s linear infinite;
}
@keyframes flow {
  to {
    stroke-dashoffset: -14;
  }
}
.wire.draft {
  stroke: #ffd34e;
  stroke-dasharray: 5 5;
}
.wire-arrow {
  fill: #5b7fb0;
  opacity: 0.85;
  pointer-events: none;
}
.wire-arrow.on {
  fill: #39e0ff;
  filter: drop-shadow(0 0 3px rgba(57, 224, 255, 0.85));
}
.particles {
  pointer-events: none;
}
.dot {
  fill: #9bf0ff;
  filter: drop-shadow(0 0 3px rgba(155, 240, 255, 0.9));
}
.marquee {
  fill: rgba(57, 224, 255, 0.12);
  stroke: #39e0ff;
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
}
.ghost {
  position: fixed;
  transform: translate(-50%, -50%);
  background: rgba(57, 224, 255, 0.9);
  color: #06121f;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  pointer-events: none;
  z-index: 50;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
}
.empty-hint {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #6b7e9c;
  font-size: 14px;
  pointer-events: none;
}
.topbar {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  background: rgba(12, 18, 30, 0.82);
  padding: 7px 10px;
  border-radius: 10px;
  border: 1px solid rgba(120, 160, 220, 0.18);
  z-index: 20;
}
.grp {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-right: 8px;
  border-right: 1px solid rgba(120, 160, 220, 0.12);
}
.grp:last-child {
  border-right: 0;
}
.tb {
  border: 1px solid rgba(120, 160, 220, 0.3);
  background: transparent;
  color: #cfe0f5;
  padding: 5px 9px;
  border-radius: 7px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.12s;
}
.tb.on {
  background: #2f6bff;
  border-color: #2f6bff;
  color: #fff;
}
.tb:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.tb.danger {
  border-color: rgba(255, 90, 60, 0.5);
  color: #ff8a72;
}
.tb:hover:not(:disabled) {
  border-color: #39e0ff;
  color: #39e0ff;
}
.tb.danger:hover:not(:disabled) {
  background: rgba(255, 90, 60, 0.15);
  border-color: #ff5a3c;
  color: #ff5a3c;
}
.z {
  font-size: 12px;
  color: #9fc4ff;
  min-width: 42px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.ctx {
  position: fixed;
  z-index: 60;
  background: #0e1626;
  border: 1px solid rgba(120, 160, 220, 0.3);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}
.ctx button {
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  color: #dbe6f5;
  padding: 7px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
.ctx button:hover {
  background: rgba(57, 224, 255, 0.12);
  color: #39e0ff;
}
.toolbar {
  position: absolute;
  left: 12px;
  bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(12, 18, 30, 0.82);
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(120, 160, 220, 0.18);
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
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}
.seg-btn.active {
  background: #2f6bff;
  color: #fff;
}
.tc {
  font-size: 12px;
  color: #8aa0bd;
}
.tb2 {
  border: 1px solid rgba(120, 160, 220, 0.3);
  background: transparent;
  color: #cfe0f5;
  padding: 6px 10px;
  border-radius: 7px;
  cursor: pointer;
  font-size: 12px;
}
.tb2:hover {
  border-color: #39e0ff;
  color: #39e0ff;
}
.saved {
  font-size: 11px;
  color: #37e07a;
}
.props {
  width: 300px;
  flex-shrink: 0;
  padding: 14px;
  background: #0c1322;
  border-left: 1px solid rgba(120, 160, 220, 0.16);
  overflow-y: auto;
}
.props-h {
  font-size: 13px;
  font-weight: 700;
  color: #9fc4ff;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.badge {
  font-size: 11px;
  font-weight: 600;
  background: rgba(57, 224, 255, 0.15);
  color: #39e0ff;
  padding: 1px 7px;
  border-radius: 10px;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.row label {
  font-size: 12px;
  color: #8aa0bd;
  white-space: nowrap;
}
.row .val {
  font-size: 13px;
  color: #dbe6f5;
}
.row .mono {
  font-family: ui-monospace, monospace;
}
.inp {
  flex: 1;
  min-width: 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(120, 160, 220, 0.25);
  border-radius: 6px;
  color: #e8f0fb;
  padding: 6px 8px;
  font-size: 12px;
}
.del {
  width: 100%;
  border: 1px solid rgba(255, 90, 60, 0.5);
  background: rgba(255, 90, 60, 0.1);
  color: #ff8a72;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  margin-top: 6px;
}
.del:hover {
  background: rgba(255, 90, 60, 0.2);
}
.hint {
  font-size: 11px;
  color: #8aa0bd;
  line-height: 1.6;
  margin: 8px 0 0;
}
.tips {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: #aebfd6;
  line-height: 1.8;
}
.tips strong {
  color: #ffd34e;
}
.wire-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.wire-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  padding: 6px 0;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
}
.wire-list .x {
  border: 0;
  background: transparent;
  color: #ff8a72;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}
.muted {
  font-size: 12px;
  color: #6b7e9c;
}
</style>
