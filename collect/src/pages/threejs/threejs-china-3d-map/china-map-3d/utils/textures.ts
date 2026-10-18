/**
 * textures.ts —— Canvas 程序化纹理与文字标牌工具
 *
 * 本文件职责：
 *   - getGlowTexture：生成径向光斑贴图（柱顶光点 / 流星头部共用）
 *   - measureText：用离屏 canvas 测量文字宽度（避免触发 DOM 重排）
 *   - roundRect：圆角矩形路径（卡片 / 标牌底框）
 *   - canvasToSprite：把 2D canvas 包成永远压在地图之上的 Sprite
 *
 * 在整体架构中的角色：2D 标牌（数值卡片、地理标牌）与发光 Sprite 的底层
 *   绘制基础设施。spotCanvas.ts 依赖本文件产出各类标牌贴图。
 *
 * 协作模块：
 *   - spotCanvas.ts（数值卡片 / 标牌 / 锚点贴图）
 *   - spotLayer.ts / drawFlyLine.ts（光斑贴图 getGlowTexture）
 *
 * ⚠️ 约定：标牌一律走 canvasToSprite 包成 Sprite —— 线性过滤 + 关闭深度测试，
 *   保证标牌 / 光点永远压在地图之上，不会被板块或边框遮挡而闪烁。
 */

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

/**
 * 测量文字像素宽度（用离屏 4x4 canvas，仅作测量，永不进 DOM）。
 * @param text 待测量文本
 * @param font  CSS font 字符串（含字号与字体族）
 * @returns 文字宽度（px）
 */
export const measureText = (text: string, font: string): number => {
  if (!measureCtx) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 4
    measureCtx = canvas.getContext('2d')!
  }
  measureCtx.font = font
  return measureCtx.measureText(text).width
};

/**
 * 圆角矩形路径（不描边不填充，调用方自行 fill / stroke）。
 * 用四段 quadraticCurveTo 拼出四角圆弧，避免锯齿尖角。
 */
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

/**
 * 把 canvas 包成精灵：线性过滤 + 关闭深度测试，保证永远压在地图之上。
 * @param canvas      已绘制好的 2D 画布
 * @param height      精灵世界高度（宽度按画布宽高比自动算出）
 * @param renderOrder 渲染顺序（数值越大越晚画，越靠上）
 */
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
