/**
 * lineMaterials.ts —— Line2 线材质工厂（世界单位线宽）
 *
 * 本文件职责：
 *   统一管理三种共享的 Line2 线材质：内部界线、外轮廓实线、外轮廓光晕。
 *   集中创建 + 集中同步分辨率，避免每个模块各自 new 一份、各自维护 resolution。
 *
 * 在整体架构中的角色：线框绘制（drawRegion 内部界线、drawOutline 外轮廓）
 *   的材质来源。与 mapConfig 的线宽 / 颜色参数联动。
 *
 * 协作模块：
 *   - drawRegion.ts（取内部界线材质）
 *   - drawOutline.ts（取外轮廓实线 + 光晕材质）
 *   - 视口 resize 时调用 setLineResolution 同步
 *
 * ⚠️ 坑：Line2（LineMaterial）的线宽以「屏幕像素」为单位，必须知道视口分辨率，
 *   否则线宽会随画布缩放错乱。所有共享材质在创建时 clone 一份 resolution，
 *   resize 时通过 setLineResolution 一次性同步给全部材质。
 */

import * as THREE from 'three'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { mapConfig } from './mapConfig'

/**
 * Line2 的线宽以「屏幕像素」为单位，必须知道视口分辨率。
 * 所有共享线材质集中在这里创建，改分辨率时一次性同步。
 */
const resolution = new THREE.Vector2(1, 1)

/**
 * 创建一份共享 LineMaterial：把全局 resolution 一并写入，并打上
 * userData.shared 标记，供 dispose.ts 跳过释放（跨层级复用）。
 */
const createLineMaterial = (options: Record<string, unknown>): LineMaterial => {
  const material = new (LineMaterial as any)({ ...options, resolution: resolution.clone() }) as LineMaterial
  ;(material as any).userData = { shared: true }
  return material
};

let innerLine: LineMaterial | null = null
/** 层级内部界线（省界 / 市界） */
export const getInnerLineMaterial = (): LineMaterial => {
  if (!innerLine) {
    innerLine = createLineMaterial({
      color: mapConfig.innerLineColor,
      linewidth: mapConfig.innerLineWidth,
      transparent: true,
      opacity: 0.95,
      depthTest: true,
      depthWrite: false,
    })
  }
  return innerLine
};

let outline: LineMaterial | null = null
/** 当前层级外轮廓实线 */
export const getOutlineMaterial = (): LineMaterial => {
  if (!outline) {
    outline = createLineMaterial({
      color: mapConfig.outlineColor,
      linewidth: mapConfig.outlineWidth,
      transparent: true,
      opacity: 1,
      depthTest: true,
      depthWrite: false,
    })
  }
  return outline
};

let outlineGlow: LineMaterial | null = null
/** 外轮廓光晕：更宽更淡的一层，叠在实线下制造辉光 */
export const getOutlineGlowMaterial = (): LineMaterial => {
  if (!outlineGlow) {
    outlineGlow = createLineMaterial({
      color: mapConfig.outlineColor,
      // 光晕宽度 = 实线宽度 × 放大系数，越宽越淡越有辉光感
      linewidth: mapConfig.outlineWidth * mapConfig.outlineGlowScale,
      transparent: true,
      opacity: 0.13,
      depthTest: true,
      depthWrite: false,
    })
  }
  return outlineGlow
};

/** 视口尺寸变化：同步所有 Line2 材质的分辨率，否则线宽会错乱 */
export const setLineResolution = (width: number, height: number) => {
  resolution.set(width, height)
  for (const material of [innerLine, outline, outlineGlow]) {
    if (material?.resolution) material.resolution.set(width, height)
  }
};
