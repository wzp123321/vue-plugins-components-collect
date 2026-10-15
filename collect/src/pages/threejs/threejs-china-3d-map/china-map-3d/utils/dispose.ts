import * as THREE from 'three'

/** 递归销毁 Three.js 对象及其子对象，释放 GPU 内存 */
export function disposeObject3D(obj: THREE.Object3D): void {
  obj.traverse((child) => {
    const mesh = child as THREE.Mesh
    if (mesh.geometry) {
      mesh.geometry.dispose()
    }
    if (mesh.material) {
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material]
      for (const m of materials) {
        const mat = m as any
        ;[
          'map', 'emissiveMap', 'bumpMap', 'normalMap',
          'roughnessMap', 'metalnessMap', 'aoMap',
          'displacementMap', 'envMap', 'lightMap', 'alphaMap',
        ].forEach((key) => {
          const tex = mat[key]
          if (tex) tex.dispose()
        })
        m.dispose()
      }
    }
  })
}
