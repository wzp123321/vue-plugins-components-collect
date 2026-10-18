/**
 * dispose.ts —— 场景资源释放（下钻重建地图时回收 GPU 资源）
 *
 * 本文件职责：
 *   递归遍历一个 Object3D 子树，释放其 geometry / material / 贴图占用的
 *   GPU 资源，供「下钻 = 重建地图」时销毁旧层级使用。
 *
 * 在整体架构中的角色：资源管理器。与 amap-loader 的缓存、各模块共享材质
 *   （userData.shared）配合，避免内存泄漏或误释放跨层级复用的公共资源。
 *
 * 协作模块：
 *   - 各类 getXxxMaterial / getGlowTexture 等带 shared 标记的工厂
 *   - 各绘制模块在销毁旧层级时调用本函数
 *
 * ⚠️ 坑：带 userData.shared 的材质 / 几何 / 贴图是跨层级复用的（侧壁材质、
 *   轨道材质、光斑贴图等）。一旦在这里销毁，下一层重建时就会引用已被释放的
 *   缓冲，导致 WebGL 报错或黑屏。因此 shared 资源必须跳过。
 */

import * as THREE from 'three'

/** 需要一并释放的常见贴图槽位（材质上以这些 key 持有纹理） */
const TEXTURE_KEYS = [
  'map',
  'emissiveMap',
  'bumpMap',
  'normalMap',
  'roughnessMap',
  'metalnessMap',
  'aoMap',
  'displacementMap',
  'envMap',
  'lightMap',
  'alphaMap',
] as const

/**
 * 递归释放对象占用的 GPU 资源。
 * 带 userData.shared 的材质 / 几何 / 贴图会被跳过 —— 它们是跨层级复用的，
 * 一旦在这里销毁，下一层重建时就会用到已被释放的缓冲。
 *
 * @param root 需要回收的子树根节点
 */
export const disposeObject3D = (root: THREE.Object3D): void => {
  root.traverse((child) => {
    const node = child as THREE.Mesh
    if (node.geometry && !(node.geometry.userData as any)?.shared) {
      node.geometry.dispose()
    }
    if (!node.material) return
    const materials = Array.isArray(node.material) ? node.material : [node.material]
    for (const material of materials) {
      const target = material as any
      if (target.userData?.shared) continue
      for (const key of TEXTURE_KEYS) {
        const texture = target[key]
        if (texture && !texture.userData?.shared) texture.dispose()
      }
      material.dispose()
    }
  })
};
