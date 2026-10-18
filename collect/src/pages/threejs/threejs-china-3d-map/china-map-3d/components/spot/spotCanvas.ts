/**
 * spotCanvas.ts —— 标记贴图工厂（数值卡片 / 地理标牌 / 定位点）
 *
 * 本文件职责：
 *   用离屏 canvas 2D 绘制三类标牌贴图，再包成永远压在地图之上的 Sprite：
 *   - createValueCard：柱顶数值卡片（暗底圆角 + 名称 + 数值）
 *   - createPlate：地理标牌（圆角暗底 + 名称/数值 + 底部指示三角）
 *   - createAnchor：标牌定位点（贴地小亮圆点）
 *
 * 在整体架构中的角色：spotLayer 的「贴图供应商」。地理标牌 = canvas Sprite +
 *   引线（spotLayer 里画）+ 定位点（本文件 createAnchor）三者组合，由 spotLayer
 *   在「单击城市」时一起显隐。
 *
 * 协作模块：
 *   - spotLayer.ts（调用本文件产出各类 Sprite / Mesh）
 *   - textures.ts（measureText / roundRect / canvasToSprite 底层工具）
 *
 * ⚠️ 约定：标牌一律经 textures.canvasToSprite 包成 Sprite（线性过滤 + 关深度），
 *   保证永远压在地图之上；定位点（anchor）是标牌「钉」在地图上的视觉落点。
 */

import * as THREE from 'three'
import { canvasToSprite, measureText, roundRect } from '../../utils/textures'

const NAME_FONT = (size: number) => `500 ${size}px Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif`
const VALUE_FONT = (size: number) => `800 ${size}px Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif`

/**
 * 柱顶数据卡片：暗底圆角 + 名称（浅青）/ 数值（白色加粗）。
 * 尺寸由文字测量动态决定，避免截断或留白过多。
 *
 * @param name   行政区名（可空）
 * @param value  数值字符串
 * @param accent 主题色（描边 / 数值色）
 * @returns 包好的 Sprite（renderOrder 22，压在地图之上）
 */
export const createValueCard = (name: string, value: string, accent: string): THREE.Sprite => {
  const pad = 11
  const nameSize = 20
  const valueSize = 24
  const gap = 10
  const nameWidth = name ? measureText(name, NAME_FONT(nameSize)) : 0
  const valueWidth = measureText(value, VALUE_FONT(valueSize))

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(40, Math.ceil(nameWidth + (nameWidth ? gap : 0) + valueWidth + pad * 2))
  canvas.height = Math.max(30, Math.ceil(valueSize + pad * 2 - 4))

  const ctx = canvas.getContext('2d')!
  roundRect(ctx, 1, 1, canvas.width - 2, canvas.height - 2, 8)
  ctx.fillStyle = 'rgba(6, 16, 30, 0.88)'
  ctx.fill()
  ctx.strokeStyle = accent
  ctx.globalAlpha = 0.55
  ctx.lineWidth = 1.6
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.textBaseline = 'middle'
  let x = pad
  if (name) {
    ctx.font = NAME_FONT(nameSize)
    ctx.fillStyle = '#A9DCF2'
    ctx.fillText(name, x, canvas.height / 2 + 1)
    x += nameWidth + gap
  }
  ctx.font = VALUE_FONT(valueSize)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(value, x, canvas.height / 2 + 1)

  const sprite = canvasToSprite(canvas, 2.9, 22)
  sprite.userData = { kind: 'spot', variant: 'card' }
  return sprite
};

/**
 * 地理位置标牌：圆角暗底 + 名称/数值 + 底部指示三角（点击城市时展示）。
 * 底部三角指向地图定位点，配合 spotLayer 的引线形成「标牌钉在地图上」的观感。
 *
 * @param name   行政区名
 * @param value  数值字符串
 * @param accent 主题色
 * @returns 包好的 Sprite（renderOrder 23）
 */
export const createPlate = (name: string, value: string, accent: string): THREE.Sprite => {
  const pad = 14
  const nameSize = 24
  const valueSize = 22
  const gap = 10
  const tipHeight = 8
  const nameWidth = measureText(name, NAME_FONT(nameSize))
  const valueWidth = measureText(value, VALUE_FONT(valueSize))

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(20, Math.ceil(nameWidth + gap + valueWidth + pad * 2))
  canvas.height = Math.max(20, Math.ceil(nameSize + pad * 2 + tipHeight))

  const ctx = canvas.getContext('2d')!
  const boxHeight = canvas.height - tipHeight
  roundRect(ctx, 1, 1, canvas.width - 2, boxHeight - 2, 7)
  ctx.fillStyle = 'rgba(5, 16, 32, 0.92)'
  ctx.fill()
  ctx.strokeStyle = accent
  ctx.globalAlpha = 0.75
  ctx.lineWidth = 1.6
  ctx.stroke()
  ctx.globalAlpha = 1

  // 底部指示三角：尖朝下，指向地图上的定位点
  ctx.beginPath()
  ctx.moveTo(canvas.width / 2 - 7, boxHeight - 2)
  ctx.lineTo(canvas.width / 2 + 7, boxHeight - 2)
  ctx.lineTo(canvas.width / 2, canvas.height - 1)
  ctx.closePath()
  ctx.fillStyle = 'rgba(5, 16, 32, 0.92)'
  ctx.fill()

  ctx.textBaseline = 'middle'
  ctx.font = NAME_FONT(nameSize)
  ctx.fillStyle = '#EAF8FF'
  ctx.fillText(name, pad, boxHeight / 2 - 1)
  ctx.font = VALUE_FONT(valueSize)
  ctx.fillStyle = accent
  ctx.fillText(value, pad + nameWidth + gap, boxHeight / 2 - 1)

  const sprite = canvasToSprite(canvas, 3.2, 23)
  sprite.userData = { kind: 'spot', variant: 'plate' }
  return sprite
};

let anchorGeometry: THREE.CircleGeometry | null = null

/**
 * 标牌锚点：贴在地表的小亮圆点（共享几何，避免逐点创建）。
 * 它是地理标牌在地图上的「落点」，与标牌 + 引线三者共同构成地理标牌。
 *
 * @param color 主题色
 * @returns 圆点 Mesh（renderOrder 11，关深度，永远可见）
 */
export const createAnchor = (color: string): THREE.Mesh => {
  if (!anchorGeometry) {
    anchorGeometry = new THREE.CircleGeometry(0.36, 20)
    anchorGeometry.userData = { shared: true }
  }
  const mesh = new THREE.Mesh(
    anchorGeometry,
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.95,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  )
  mesh.renderOrder = 11
  mesh.userData = { kind: 'spot', variant: 'anchor' }
  return mesh
};
