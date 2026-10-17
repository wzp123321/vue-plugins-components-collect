/**
 * 星空背景：环绕地图的单次绘制 Points + 着色器闪烁。
 * 全部星星共用一个 BufferGeometry（1 个 draw call），
 * 闪烁在 GPU 里按顶点相位计算，CPU 每帧只需要更新一个 uniform。
 */
import * as THREE from 'three'

const STAR_COUNT = 520
/** 地图半宽约 65，星星只铺在外围，避免压在地图与飞线上 */
const INNER_RADIUS = 110
const OUTER_RADIUS = 260
const SEED = 20240608

function createRng(seed: number) {
  let value = seed | 0
  return () => {
    value |= 0
    value = (value + 0x6d2b79f5) | 0
    let t = Math.imul(value ^ (value >>> 15), 1 | value)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function createStarTexture(size = 96): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const half = size / 2
  const arm = half * 0.95

  const glow = ctx.createRadialGradient(half, half, 0, half, half, half * 0.12)
  glow.addColorStop(0, 'rgba(255,255,255,1)')
  glow.addColorStop(0.35, 'rgba(200,220,255,0.45)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, size, size)

  // 对角线为主、十字为辅的四射线
  const rays: Array<[number, number, number, number]> = [
    [half, half, half - arm, half - arm],
    [half, half, half + arm, half + arm],
    [half, half, half + arm, half - arm],
    [half, half, half - arm, half + arm],
    [half, half, half, half - arm * 0.6],
    [half, half, half, half + arm * 0.6],
    [half, half, half - arm * 0.6, half],
    [half, half, half + arm * 0.6, half],
  ]
  ctx.globalCompositeOperation = 'lighter'
  for (const [x1, y1, x2, y2] of rays) {
    const gradient = ctx.createLinearGradient(x1, y1, (x1 + x2) / 2, (y1 + y2) / 2)
    gradient.addColorStop(0, 'rgba(235,248,255,0.9)')
    gradient.addColorStop(0.35, 'rgba(150,190,235,0.22)')
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.strokeStyle = gradient
    ctx.lineWidth = 1.6
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.userData = { shared: true }
  return texture
}

export function createStarfield() {
  const rng = createRng(SEED)
  const positions = new Float32Array(STAR_COUNT * 3)
  const phases = new Float32Array(STAR_COUNT)
  const scales = new Float32Array(STAR_COUNT)

  for (let i = 0; i < STAR_COUNT; i++) {
    const angle = rng() * Math.PI * 2
    const radius = INNER_RADIUS + rng() * (OUTER_RADIUS - INNER_RADIUS)
    positions[i * 3] = Math.cos(angle) * radius
    positions[i * 3 + 1] = Math.sin(angle) * radius
    positions[i * 3 + 2] = -20 + (rng() - 0.5) * 120
    phases[i] = rng() * Math.PI * 2
    scales[i] = 0.55 + rng() * 0.85
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

  const texture = createStarTexture()
  const uniforms = {
    uTime: { value: 0 },
    uMap: { value: texture },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uSize: { value: 42 },
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      attribute float aPhase;
      attribute float aScale;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uSize;
      varying float vBright;
      void main() {
        // sin¹² 让亮峰短促，闪烁更有「星星」感
        float wave = max(0.0, sin(uTime * 0.55 + aPhase));
        vBright = 0.22 + 0.78 * pow(wave, 12.0);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = uSize * aScale * uPixelRatio * (0.85 + 0.35 * vBright);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      varying float vBright;
      void main() {
        vec4 tex = texture2D(uMap, gl_PointCoord);
        gl_FragColor = vec4(tex.rgb * vBright, tex.a * vBright);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
  })

  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false

  return {
    points: [points],
    update(elapsed: number) {
      uniforms.uTime.value = elapsed
    },
    dispose() {
      geometry.dispose()
      material.dispose()
      texture.dispose()
    },
  }
}
