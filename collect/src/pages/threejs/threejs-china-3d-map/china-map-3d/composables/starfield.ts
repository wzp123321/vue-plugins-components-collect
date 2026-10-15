/**
 * 星空背景。球面 360° 环绕地图，种子随机数确保位置固定。
 * 6 组独立闪烁，PointsMaterial 可靠渲染。
 */

import * as THREE from 'three'

/** 种子随机数生成器（mulberry32），固定种子 → 固定序列 */
function createRng(seed: number) {
  let s = seed | 0
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0
    let t = Math.imul(s ^ s >>> 15, 1 | s)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function createStarSprite(size = 100): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')!
  const h = size / 2, arm = h * 0.95

  // 中心光晕（缩小）
  const glow = ctx.createRadialGradient(h, h, 0, h, h, h * 0.1)
  glow.addColorStop(0, 'rgba(255,255,255,1)')
  glow.addColorStop(0.3, 'rgba(200,220,255,0.5)')
  glow.addColorStop(0.6, 'rgba(100,140,200,0.1)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow; ctx.fillRect(0, 0, size, size)

  // 十字旋转45°：对角线为主光芒，十字为副
  const rays: [number, number, number, number][] = [
    [h, h, h - arm, h - arm], [h, h, h + arm, h + arm],
    [h, h, h + arm, h - arm], [h, h, h - arm, h + arm],
    [h, h, h, h - arm * 0.6], [h, h, h, h + arm * 0.6],
    [h, h, h - arm * 0.6, h], [h, h, h + arm * 0.6, h],
  ]

  ctx.globalCompositeOperation = 'lighter'
  for (const [x1, y1, x2, y2] of rays) {
    const dx = x2 - x1, dy = y2 - y1, s = 0.5
    const sx = x1 + dx * s, sy = y1 + dy * s
    // 粗光芒（变细）
    const g1 = ctx.createLinearGradient(x1, y1, sx, sy)
    g1.addColorStop(0, 'rgba(230,245,255,0.85)')
    g1.addColorStop(0.3, 'rgba(160,200,240,0.3)')
    g1.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.strokeStyle = g1; ctx.lineWidth = 1.8
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(sx, sy); ctx.stroke()

    // 细光芒（变细）
    const g2 = ctx.createLinearGradient(x1, y1, x2, y2)
    g2.addColorStop(0, 'rgba(255,255,255,0.85)')
    g2.addColorStop(0.4, 'rgba(140,180,220,0.1)')
    g2.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.strokeStyle = g2; ctx.lineWidth = 0.8
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  }

  const t = new THREE.CanvasTexture(canvas); t.needsUpdate = true
  return t
}

/**
 * 环形分布：在 xy 平面上的宽环中分布星星，z 在各层变化。
 * 保证从俯视摄像机角度地图四周星星数量均匀。
 */
function ringDistribution(count: number, rng: () => number): Float32Array {
  const arr = new Float32Array(count * 3)
  // 均匀覆盖地图下方及四周
  const innerR = 50, outerR = 220
  for (let i = 0; i < count; i++) {
    const angle = rng() * Math.PI * 2
    const r = innerR + rng() * (outerR - innerR)  // 均匀半径分布
    arr[i * 3]     = Math.cos(angle) * r
    arr[i * 3 + 1] = Math.sin(angle) * r
    arr[i * 3 + 2] = (rng() - 0.5) * 120
  }
  return arr
}

const MASTER_SEED = 20240608

export function createStarfield(count = 500) {
  const groups = 15
  const perGroup = Math.ceil(count / groups)
  const sprite = createStarSprite()

  // 每层用不同种子生成独立分布
  const items = Array.from({ length: groups }, (_, g) => {
    const rng = createRng(MASTER_SEED + g * 1000)
    const positions = ringDistribution(perGroup, rng)

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      map: sprite,
      size: 80,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.5,
      depthTest: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    return {
      points: new THREE.Points(geometry, material),
      phase: (g / groups) * Math.PI * 2,  // 15组均匀错开，始终有亮有暗
      speed: 0.3,  // 统一节奏，不漂移
    }
  })

  const t0 = performance.now() * 0.001
  const colorDim = new THREE.Color(0x1166FF)
  const colorBright = new THREE.Color(0x66AAFF)

  return {
    points: items.map((g) => g.points),

    update(time: number) {
      const t = time - t0
      for (const g of items) {
        const mat = g.points.material as THREE.PointsMaterial
        const raw = Math.sin(t * g.speed + g.phase)
        const b = raw * raw; const brightness = b * b * b * b * b * b // sin¹²: 亮峰更短
        mat.opacity = 0.25 + brightness * 0.9
        mat.color.copy(colorDim).lerp(colorBright, brightness)
      }
    },

    dispose() {
      for (const g of items) {
        g.points.geometry.dispose()
        ;(g.points.material as THREE.PointsMaterial).dispose()
      }
      sprite.dispose()
    },
  }
}
