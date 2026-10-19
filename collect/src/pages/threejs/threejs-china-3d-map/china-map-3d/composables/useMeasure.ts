/**
 * useMeasure.ts —— 距离 / 面积测量工具（P1 交互）
 *
 * 文件职责：
 *   在测量模式下，点击地图在地面（z = mapConfig.depth）落下测点，实时连成折线、
 *   标出每段距离与多边形面积。所有几何挂在 layer.root() 下，随层级重建时由调用方
 *   清掉；只在「点击」时重算，不每帧重建，性能无忧。
 *
 * 性能约定（与全局一致）：仅在落点时重建一次测量几何；顶点/线段/文字标签用轻量
 *   Sprite + Line，数量极少（≤ 数十），不会成为瓶颈。
 *
 * 协作：
 *   - utils/mapConfig：取地面高度 depth，把测量线/顶点抬到板块顶面之上
 *   - utils/textures.canvasToSprite：把距离/面积文字包成压顶 Sprite
 *   - usePointerPick：测量模式下用地面平面求交得到落点，再回调本模块 addPoint()
 *   - ChinaMap3D：传入 kmPerUnit()（按当前层投影 scale 换算），显示真实 km / km²
 */
import * as THREE from 'three'
import { mapConfig } from '../utils/mapConfig'
import { canvasToSprite } from '../utils/textures'

interface Options {
  getRoot: () => THREE.Object3D | null
  /**
   * 世界单位 → 千米的换算系数（按当前层级投影的 scale 与中心纬度实时计算）。
   * d3.geoMercator 的 scale 是「每弧度经度对应的世界单位数」，故
   *   kmPerUnit = 6371(km) * cos(中心纬度) / scale
   * 缺省 1 时退化为直接显示世界单位（调试用）。
   */
  kmPerUnit?: () => number
}

/** 数值格式化：≥100 取整，否则保留一位小数 */
const fmt = (value: number, unit: string) => (value >= 100 ? `${Math.round(value)} ${unit}` : `${value.toFixed(1)} ${unit}`)

/** 把距离/面积数值画成压顶文字 Sprite（暗底圆角，永远压在地图之上） */
const makeTextSprite = (text: string): THREE.Sprite => {
  const pad = 8
  const font = `700 22px Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif`
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d')!
  ctx.font = font
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2
  const h = 30
  c.width = w
  c.height = h
  ctx.fillStyle = 'rgba(6, 16, 30, 0.88)'
  ctx.strokeStyle = '#5FD8FF'
  ctx.lineWidth = 1.4
  ctx.globalAlpha = 0.95
  ctx.beginPath()
  ctx.rect(1, 1, w - 2, h - 2)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#EAF6FF'
  ctx.font = font
  ctx.textBaseline = 'middle'
  ctx.fillText(text, pad, h / 2 + 1)
  const sprite = canvasToSprite(c, 2.6, 25)
  return sprite
}

export const useMeasure = (options: Options) => {
  let group: THREE.Group | null = null
  let points: THREE.Vector3[] = []

  const ensureGroup = () => {
    if (group) return group
    const root = options.getRoot()
    if (!root) return null
    group = new THREE.Group()
    group.userData = { kind: 'measure' }
    root.add(group)
    return group
  }

  /** 落一个测点（世界坐标，已落到地面平面） */
  const addPoint = (world: THREE.Vector3): number => {
    const g = ensureGroup()
    if (!g) return points.length
    points.push(world.clone())
    rebuild()
    return points.length
  }

  /** 清空全部测点 */
  const clear = () => {
    if (group) {
      group.children.slice().forEach((c) => {
        const obj = c as THREE.Object3D
        const mesh = obj as THREE.Mesh
        mesh.geometry?.dispose?.()
        const mat = (obj as THREE.Sprite).material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else mat?.dispose?.()
        obj.removeFromParent()
      })
      group.removeFromParent()
      group = null
    }
    points = []
  }

  /** 重建测量几何：折线 + 顶点 + 每段距离 + 多边形面积（世界坐标，挂到 scene） */
  const rebuild = () => {
    if (!group) return
    // 先清空旧的可视对象（保留 group 本身）
    group.children.slice().forEach((c) => {
      const obj = c as THREE.Mesh
      obj.geometry?.dispose?.()
      const mat = (c as THREE.Sprite).material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
      else mat?.dispose?.()
      c.removeFromParent()
    })

    const z = mapConfig.depth + 0.5
    /** 世界单位 → 千米系数：每次重建只取一次，避免逐段调用 getter */
    const k = options.kmPerUnit?.() || 1
    // 顶点小球
    const dotGeo = new THREE.SphereGeometry(0.5, 12, 12)
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x5fd8ff, depthTest: false, depthWrite: false })
    dotGeo.userData = { shared: true }

    // 折线段
    for (let i = 0; i < points.length; i++) {
      const p = points[i]
      const dot = new THREE.Mesh(dotGeo, dotMat)
      dot.position.set(p.x, p.y, z)
      dot.renderOrder = 30
      dot.userData = { kind: 'measureDot' }
      group!.add(dot)

      if (i > 0) {
        const prev = points[i - 1]
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(prev.x, prev.y, z),
          new THREE.Vector3(p.x, p.y, z),
        ])
        const line = new THREE.Line(
          geo,
          new THREE.LineBasicMaterial({ color: 0x5fd8ff, depthTest: false, depthWrite: false, transparent: true, opacity: 0.9 }),
        )
        line.renderOrder = 29
        group!.add(line)
        // 每段地面距离（XY 平面，等距投影下即地表距离），按投影 scale 换算成 km
        const dist = Math.hypot(p.x - prev.x, p.y - prev.y) * k
        const mid = new THREE.Vector3((prev.x + p.x) / 2, (prev.y + p.y) / 2, z + 1.5)
        const label = makeTextSprite(fmt(dist, 'km'))
        label.position.copy(mid)
        group!.add(label)
      }
    }

    // 多边形面积（≥3 点时闭合，shoelace 公式，XY 平面）
    if (points.length >= 3) {
      let area = 0
      for (let i = 0; i < points.length; i++) {
        const a = points[i]
        const b = points[(i + 1) % points.length]
        area += a.x * b.y - b.x * a.y
      }
      area = (Math.abs(area) / 2) * k * k
      const cx = points.reduce((s, p) => s + p.x, 0) / points.length
      const cy = points.reduce((s, p) => s + p.y, 0) / points.length
      const label = makeTextSprite(`面积 ${fmt(area, 'km²')}`)
      label.position.set(cx, cy, z + 2)
      group!.add(label)
    }
  }

  return {
    addPoint,
    clear,
    /** 当前测点数 */
    count: () => points.length,
    /** 是否存在测量几何（供外部判断是否要清理） */
    active: () => group != null,
  }
}
