import * as THREE from 'three'

let glowTexture: THREE.Texture | null = null

/** 径向光斑（柱顶光点 / 流星头部共用），首次调用后缓存 */
export const getGlowTexture = (): THREE.Texture => {
  if (glowTexture) return glowTexture
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.22, 'rgba(205,248,255,0.92)')
  gradient.addColorStop(0.5, 'rgba(80,200,255,0.34)')
  gradient.addColorStop(1, 'rgba(54,224,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  glowTexture = new THREE.CanvasTexture(canvas)
  glowTexture.userData = { shared: true }
  return glowTexture
};

/** 统一的 Canvas 文本测量上下文（避免 DOM 测量触发强制重排） */
let measureCtx: CanvasRenderingContext2D | null = null

export const measureText = (text: string, font: string): number => {
  if (!measureCtx) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 4
    measureCtx = canvas.getContext('2d')!
  }
  measureCtx.font = font
  return measureCtx.measureText(text).width
};

export const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
};

/** 把 canvas 包成精灵：线性过滤 + 关闭深度测试，保证永远压在地图之上 */
export const canvasToSprite = (
  canvas: HTMLCanvasElement,
  height: number,
  renderOrder: number,
): THREE.Sprite => {
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false }),
  )
  sprite.renderOrder = renderOrder
  sprite.scale.set(height * (canvas.width / canvas.height), height, 1)
  return sprite
};
