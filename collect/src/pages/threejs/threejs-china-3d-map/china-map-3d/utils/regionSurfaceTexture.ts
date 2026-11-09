/**
 * regionSurfaceTexture.ts —— 省份顶面的连续明暗渐变贴图
 *
 * 本文件职责：
 *   生成一张覆盖整张地图的低频渐变调制图，给纯平涂的省份顶面补上连续的
 *   墨蓝明暗层次。纹理值作为亮度系数与 MeshPhongMaterial.color 相乘，不新增
 *   draw call；换主题只需改 color，渐变本身不随主题重建。
 *
 * 在整体架构中的角色：顶面材质的贴图来源，所有省份共用一张模块级单例。
 *
 * ⚠️ 坑 1：ExtrudeGeometry 顶面 UV 来自 shape 的 2D 顶点，即投影后的世界
 *   xy。fitProjection 把投影包围盒中心移到原点、最大边长归一到 MAP_EXTENT，
 *   故 uv 落在约 ±MAP_EXTENT/2。用 repeat = 1/MAP_EXTENT + offset = 0.5
 *   映射成 0..1，一张贴图恰好铺满全图；ClampToEdge 兜住 bbox 非正方时的
 *   偏差。渐变因此跨省连续，不会每省各自重复一遍。
 * ⚠️ 坑 2：disposeObject3D 会释放非 shared 的 material.map。下钻重建会销毁旧
 *   层级，本纹理必须打 userData.shared = true，否则重建后贴图失效。
 * ⚠️ 坑 3：不设置 colorSpace。工程关闭了 ColorManagement、renderer 输出
 *   LinearSRGB，材质渲染进 composer 的线性 renderTarget，最终转换由 mixPass
 *   统一完成；这里让采样值直接作为线性亮度系数参与相乘。
 */

import * as THREE from 'three'
import { mapConfig } from './mapConfig'
import { MAP_EXTENT } from './projection'

let surfaceTexture: THREE.Texture | null = null

const channels = (hexColor: string): [number, number, number] => [
  parseInt(hexColor.slice(1, 3), 16),
  parseInt(hexColor.slice(3, 5), 16),
  parseInt(hexColor.slice(5, 7), 16),
]

/** 取顶面渐变纹理（跨层级复用，不随旧层销毁） */
export const getRegionSurfaceTexture = (): THREE.Texture => {
  if (surfaceTexture) return surfaceTexture

  const { size, dark, light, highlights, baseGain, gamma, ripple } = mapConfig.surfaceGradient
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  // 拿不到 2D 上下文时退化成 1×1 纯白贴图：顶面维持原色，不让地图变黑
  if (!ctx) {
    const white = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1)
    white.needsUpdate = true
    white.userData = { shared: true }
    surfaceTexture = white
    return white
  }

  const image = ctx.createImageData(size, size)
  const darkRGB = channels(dark)
  const lightRGB = channels(light)

  for (let py = 0; py < size; py += 1) {
    // canvas 的 y 向下，v 向上，与 UV 方向一致
    const v = 1 - py / (size - 1)
    for (let px = 0; px < size; px += 1) {
      const u = px / (size - 1)

      // 低频线性基底：左下暗、右上亮，撑起连续明度阶梯的骨架
      let level = baseGain * (0.62 * u + 0.38 * v)

      // 两处大半径柔光：模拟球体受光的局部高光，越亮的层级占面积越小
      highlights.forEach((spot) => {
        const dx = (u - spot.x) / spot.radius
        const dy = (v - spot.y) / spot.radius
        level += spot.gain * Math.exp(-(dx * dx + dy * dy) * 1.6)
      })

      // 极低频起伏：避免渐变读成一张规整的塑料色卡，幅度小到不成图案
      level += ripple * Math.sin(u * 5.1 + v * 3.3) * Math.cos(v * 4.7 - u * 2.2)
      // gamma > 1 把明度分布压向暗端，让高光只占很小的面积
      // 先钳位再取幂：负底数配非整数指数会得到 NaN，写进贴图就是黑点
      level = Math.min(1, Math.max(0, level)) ** gamma

      const i = (py * size + px) * 4
      image.data[i] = darkRGB[0] + (lightRGB[0] - darkRGB[0]) * level
      image.data[i + 1] = darkRGB[1] + (lightRGB[1] - darkRGB[1]) * level
      image.data[i + 2] = darkRGB[2] + (lightRGB[2] - darkRGB[2]) * level
      image.data[i + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  // 一张贴图铺满整张地图（世界 xy 约 -65..65），渐变跨省连续且不重复
  texture.repeat.set(1 / MAP_EXTENT, 1 / MAP_EXTENT)
  texture.offset.set(0.5, 0.5)
  texture.anisotropy = 2
  texture.userData = { shared: true }
  surfaceTexture = texture
  return texture
};
