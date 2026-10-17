import * as THREE from 'three'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { mapConfig } from './mapConfig'

/**
 * Line2 的线宽以「屏幕像素」为单位，必须知道视口分辨率。
 * 所有共享线材质集中在这里创建，改分辨率时一次性同步。
 */
const resolution = new THREE.Vector2(1, 1)

function createLineMaterial(options: Record<string, unknown>): LineMaterial {
  const material = new (LineMaterial as any)({ ...options, resolution: resolution.clone() }) as LineMaterial
  ;(material as any).userData = { shared: true }
  return material
}

let innerLine: LineMaterial | null = null
/** 层级内部界线（省界 / 市界） */
export function getInnerLineMaterial(): LineMaterial {
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
}

let outline: LineMaterial | null = null
/** 当前层级外轮廓实线 */
export function getOutlineMaterial(): LineMaterial {
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
}

let outlineGlow: LineMaterial | null = null
/** 外轮廓光晕：更宽更淡的一层，叠在实线下制造辉光 */
export function getOutlineGlowMaterial(): LineMaterial {
  if (!outlineGlow) {
    outlineGlow = createLineMaterial({
      color: mapConfig.outlineColor,
      linewidth: mapConfig.outlineWidth * mapConfig.outlineGlowScale,
      transparent: true,
      opacity: 0.13,
      depthTest: true,
      depthWrite: false,
    })
  }
  return outlineGlow
}

/** 视口尺寸变化：同步所有 Line2 材质的分辨率，否则线宽会错乱 */
export function setLineResolution(width: number, height: number) {
  resolution.set(width, height)
  for (const material of [innerLine, outline, outlineGlow]) {
    if (material?.resolution) material.resolution.set(width, height)
  }
}
