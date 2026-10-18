import * as THREE from 'three'

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
