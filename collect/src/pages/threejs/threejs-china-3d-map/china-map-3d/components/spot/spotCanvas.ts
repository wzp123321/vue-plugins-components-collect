import * as THREE from 'three'
import { canvasToSprite, measureText, roundRect } from '../../utils/textures'

const NAME_FONT = (size: number) => `500 ${size}px Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif`
const VALUE_FONT = (size: number) => `800 ${size}px Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif`

/** 柱顶数据卡片：暗底圆角 + 名称（浅青）/ 数值（白色加粗） */
export function createValueCard(name: string, value: string, accent: string): THREE.Sprite {
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
}

/** 地理位置标牌：圆角暗底 + 名称/数值 + 底部指示三角（点击城市时展示） */
export function createPlate(name: string, value: string, accent: string): THREE.Sprite {
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
}

let anchorGeometry: THREE.CircleGeometry | null = null

/** 标牌锚点：贴在地表的小亮圆点（共享几何，避免逐点创建） */
export function createAnchor(color: string): THREE.Mesh {
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
}
