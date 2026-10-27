/**
 * 自包含的 three.js 模型查看器引擎。
 *
 * 不依赖页面级共享 composable（useThreeScene 位于 src/pages/threejs/shared，
 * 属页面级基建且无条件 renderer.render 无法注入 EffectComposer），这里独立实现
 * 渲染循环、ResizeObserver 自适应与完整资源清理，做成可复用组件本体。
 *
 * 覆盖的「常用 three.js 功能」：
 *   - GLTFLoader + DRACOLoader（按需懒加载解码器）
 *   - PMREMGenerator + RoomEnvironment 程序化 IBL（无需外部 .hdr）
 *   - OrbitControls（阻尼 / 自动旋转 / 缩放限幅 / 相机预设）
 *   - 方向光阴影 + 透明接影地面 + GridHelper / AxesHelper / Box3Helper
 *   - 材质三态：真实 / 线框 / X 光（半透明）
 *   - Raycaster 点击拾取 + 悬浮高亮 + emissive 选中高亮
 *   - AnimationMixer 骨骼/关键帧动画播放 + 时间缩放
 *   - 爆炸视图（多部件模型沿质心外扩 + 连线）
 *   - 裁剪平面（剖切观察）
 *   - 环境贴图作为背景
 *   - EffectComposer + UnrealBloomPass 后期泛光
 *   - Stats FPS 面板
 *   - TransformControls 模型变换（拖拽时禁用轨道控制器）
 *   - 键盘快捷键（R 重置 / F 适配 / 空格 播放暂停）
 *   - 截图导出、自动居中取景、重置视角
 *   - onBeforeUnmount 全量 dispose（几何体 / 材质 / 纹理 / 渲染目标 / 控制器 / 渲染器）
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'

export type MaterialMode = 'real' | 'wireframe' | 'xray'
export type TransformMode = 'translate' | 'rotate' | 'scale'
export type ViewPreset = 'iso' | 'front' | 'side' | 'top'

export interface MeshInfo {
  name: string
  triangles: number
  material: string
  uuid: string
}

export interface LoadedInfo {
  name: string
  triangles: number
  meshes: number
  animations: string[]
  size: { x: number; y: number; z: number }
  /** 模型金属度/粗糙度均值，供 PBR 滑块初始化默认值 */
  pbr: { metalness: number; roughness: number }
}

export interface ModelViewerHandlers {
  onProgress?: (pct: number) => void
  onLoaded?: (info: LoadedInfo) => void
  onSelect?: (info: MeshInfo | null) => void
  onError?: (msg: string) => void
  onAnimPlayState?: (playing: boolean) => void
}

export interface ModelViewerOptions {
  background?: string
  autoRotate?: boolean
  grid?: boolean
  axes?: boolean
  bloom?: boolean
  shadow?: boolean
  stats?: boolean
  transform?: boolean
  transformMode?: TransformMode
  materialMode?: MaterialMode
  envIntensity?: number
  clipping?: boolean
  clipPosition?: number
  boundingBox?: boolean
  envBackground?: boolean
  animSpeed?: number
  explode?: number
  metalness?: number
  roughness?: number
}

export interface ModelViewer {
  load: (url: string) => Promise<void>
  setMaterialMode: (m: MaterialMode) => void
  setBloom: (on: boolean) => void
  setGrid: (on: boolean) => void
  setAxes: (on: boolean) => void
  setAutoRotate: (on: boolean) => void
  setShadow: (on: boolean) => void
  setStats: (on: boolean) => void
  setTransform: (on: boolean) => void
  setTransformMode: (m: TransformMode) => void
  setEnvIntensity: (v: number) => void
  setView: (preset: ViewPreset) => void
  setClipping: (on: boolean) => void
  setClipPosition: (t: number) => void
  setBoundingBox: (on: boolean) => void
  setEnvBackground: (on: boolean) => void
  setAnimSpeed: (v: number) => void
  setExplode: (t: number) => void
  setMetalness: (v: number) => void
  setRoughness: (v: number) => void
  playAnimation: (name: string | null) => void
  setAnimationPlaying: (on: boolean) => void
  resetView: () => void
  frameView: () => void
  screenshot: () => string | null
  dispose: () => void
}

interface GltfLike {
  scene: THREE.Group
  animations: THREE.AnimationClip[]
}

interface ExplodeTarget {
  obj: THREE.Object3D
  base: THREE.Vector3
}

const HIGHLIGHT_COLOR = 0x1e90ff
const HOVER_COLOR = 0x3aa6ff
const TARGET_SIZE = 4 // 模型最长边归一化到的世界尺寸

export const createModelViewer = (
  host: () => HTMLElement | null,
  handlers: ModelViewerHandlers,
  initial: ModelViewerOptions = {},
): ModelViewer => {
  let scene: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let renderer: THREE.WebGLRenderer | null = null
  let controls: OrbitControls | null = null
  let composer: EffectComposer | null = null
  let bloomPass: UnrealBloomPass | null = null
  let pmrem: THREE.PMREMGenerator | null = null
  let envRT: THREE.WebGLRenderTarget | null = null

  let modelRoot: THREE.Group | null = null
  let gltfScene: THREE.Object3D | null = null
  let mixer: THREE.AnimationMixer | null = null
  const actions = new Map<string, THREE.AnimationAction>()
  let currentAction: THREE.AnimationAction | null = null
  let animationPlaying = true

  let gridHelper: THREE.GridHelper | null = null
  let axesHelper: THREE.AxesHelper | null = null
  let groundMesh: THREE.Mesh | null = null
  let dirLight: THREE.DirectionalLight | null = null

  let stats: Stats | null = null
  let transformControls: TransformControls | null = null
  let transformHelper: THREE.Object3D | null = null

  let boxHelper: THREE.Box3Helper | null = null
  let explodeLines: THREE.LineSegments | null = null
  const explodeTargets: ExplodeTarget[] = []
  let explodeSpread = 1

  const clipPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0)
  let modelRadius = 1

  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let selectedMesh: THREE.Mesh | null = null
  let hoveredMesh: THREE.Mesh | null = null
  const savedEmissive = new Map<THREE.Material, { hex: number; intensity: number }>()
  let hoverSaved: { mat: THREE.Material; hex: number; intensity: number } | null = null

  const clock = new THREE.Clock()
  let rafId = 0
  let resizeObserver: ResizeObserver | null = null
  let keyHandler: ((e: KeyboardEvent) => void) | null = null
  let loadToken = 0
  let disposed = false

  // 初始相机位姿（用于重置）
  const homePosition = new THREE.Vector3(6, 4, 8)
  const homeTarget = new THREE.Vector3(0, 1, 0)

  const opts: ModelViewerOptions = { ...initial }
  const baseColor = initial.background || '#0b0e1a'

  // ── 尺寸 ───────────────────────────────────────────────
  const size = () => {
    const el = host()
    return { w: el?.clientWidth || 800, h: el?.clientHeight || 600 }
  }

  const disposeMaterial = (mat: THREE.Material) => {
    const m = mat as THREE.MeshStandardMaterial
    ;['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'alphaMap'].forEach((key) => {
      const tex = m[key as keyof THREE.MeshStandardMaterial] as THREE.Texture | null | undefined
      if (tex) tex.dispose()
    })
    mat.dispose()
  }

  const disposeObject = (root: THREE.Object3D) => {
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.geometry) mesh.geometry.dispose()
      if (mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        mats.forEach(disposeMaterial)
      }
    })
  }

  // ── 模型材质三态 ───────────────────────────────────────
  const applyMaterialMode = (mode: MaterialMode) => {
    if (!modelRoot) return
    modelRoot.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach((mat) => {
        const m = mat as THREE.MeshStandardMaterial
        if (mode === 'real') {
          m.wireframe = false
          m.transparent = false
          m.opacity = 1
          m.depthWrite = true
          m.side = THREE.FrontSide
        } else if (mode === 'wireframe') {
          m.wireframe = true
          m.transparent = false
          m.opacity = 1
          m.depthWrite = true
        } else if (mode === 'xray') {
          m.wireframe = false
          m.transparent = true
          m.opacity = 0.28
          m.depthWrite = false
          m.side = THREE.DoubleSide
        }
        m.clippingPlanes = opts.clipping ? [clipPlane] : null
        m.clipShadows = true
        m.needsUpdate = true
      })
    })
  }

  // ── 拾取 / 悬浮高亮 ────────────────────────────────────
  const clearHover = () => {
    if (hoverSaved) {
      const m = hoverSaved.mat as THREE.MeshStandardMaterial
      if (m.emissive) {
        m.emissive.setHex(hoverSaved.hex)
        m.emissiveIntensity = hoverSaved.intensity
      }
      hoverSaved = null
    }
    hoveredMesh = null
  }

  const setHover = (mesh: THREE.Mesh) => {
    clearHover()
    const mat = mesh.material as THREE.MeshStandardMaterial
    if (!Array.isArray(mesh.material) && mat.emissive) {
      hoverSaved = { mat, hex: mat.emissive.getHex(), intensity: mat.emissiveIntensity }
      mat.emissive.setHex(HOVER_COLOR)
      mat.emissiveIntensity = 0.35
      hoveredMesh = mesh
    }
  }

  const clearHighlight = () => {
    savedEmissive.forEach((saved, mat) => {
      const m = mat as THREE.MeshStandardMaterial
      if (m.emissive) {
        m.emissive.setHex(saved.hex)
        m.emissiveIntensity = saved.intensity
      }
    })
    savedEmissive.clear()
    selectedMesh = null
  }

  const selectMesh = (mesh: THREE.Mesh | null) => {
    clearHover()
    if (selectedMesh === mesh) {
      clearHighlight()
      handlers.onSelect?.(null)
      return
    }
    clearHighlight()
    if (!mesh) {
      handlers.onSelect?.(null)
      return
    }
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    mats.forEach((mat) => {
      const m = mat as THREE.MeshStandardMaterial
      if (m.emissive) {
        savedEmissive.set(mat, { hex: m.emissive.getHex(), intensity: m.emissiveIntensity })
        m.emissive.setHex(HIGHLIGHT_COLOR)
        m.emissiveIntensity = 0.9
      }
    })
    selectedMesh = mesh
    const geo = mesh.geometry
    const tris = geo.index ? geo.index.count / 3 : (geo.getAttribute('position')?.count || 0) / 3
    const firstMat = mats[0]
    handlers.onSelect?.({
      name: mesh.name || '(未命名网格)',
      triangles: Math.round(tris),
      material: firstMat?.type || '未知',
      uuid: mesh.uuid,
    })
  }

  const pickMesh = (e: PointerEvent | MouseEvent): THREE.Mesh | null => {
    const el = host()
    if (!el || !modelRoot) return null
    const rect = el.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera!)
    const hits = raycaster.intersectObject(modelRoot, true)
    return hits.length ? (hits[0].object as THREE.Mesh) : null
  }

  const onPointerMove = (e: PointerEvent) => {
    if (!camera || !renderer) return
    const hit = pickMesh(e)
    const el = renderer.domElement
    if (hit) {
      el.style.cursor = 'pointer'
      if (hit !== selectedMesh && hit !== hoveredMesh) setHover(hit)
    } else {
      el.style.cursor = 'default'
      clearHover()
    }
  }

  const onClick = (e: MouseEvent) => {
    selectMesh(pickMesh(e))
  }

  const onPointerLeave = () => {
    clearHover()
  }

  // ── 取景 / 相机预设 ────────────────────────────────────
  const resetView = () => {
    if (!camera || !controls) return
    camera.position.copy(homePosition)
    controls.target.copy(homeTarget)
    controls.update()
  }

  const frameModel = () => {
    if (!modelRoot || !camera || !controls) return
    const box = new THREE.Box3().setFromObject(modelRoot)
    const sphere = box.getBoundingSphere(new THREE.Sphere())
    const r = sphere.radius || 1
    const fov = (camera.fov * Math.PI) / 180
    const dist = (r / Math.sin(fov / 2)) * 1.15
    const dir = new THREE.Vector3(1, 0.55, 1).normalize()
    const center = sphere.center
    homeTarget.copy(center)
    homePosition.copy(center).add(dir.multiplyScalar(dist))
    camera.near = Math.max(dist / 100, 0.01)
    camera.far = dist * 100
    camera.updateProjectionMatrix()
    resetView()
  }

  const setView = (preset: ViewPreset) => {
    if (!camera || !controls) return
    const target = controls.target.clone()
    const dist = camera.position.distanceTo(target)
    const dir = new THREE.Vector3()
    switch (preset) {
      case 'front': dir.set(0, 0, 1); break
      case 'side': dir.set(1, 0, 0); break
      case 'top': dir.set(0, 1, 0); break
      case 'iso':
      default: dir.set(1, 0.55, 1); break
    }
    dir.normalize()
    camera.position.copy(target).addScaledVector(dir, dist)
    controls.update()
  }

  const clearModel = () => {
    if (!scene) return
    clearHover()
    clearHighlight()
    if (transformControls) transformControls.detach()
    if (mixer) {
      mixer.stopAllAction()
      mixer = null
    }
    actions.clear()
    currentAction = null
    if (boxHelper) {
      scene.remove(boxHelper)
      boxHelper.geometry.dispose()
      ;(boxHelper.material as THREE.Material).dispose()
      boxHelper = null
    }
    if (explodeLines && gltfScene) {
      gltfScene.remove(explodeLines)
      explodeLines.geometry.dispose()
      ;(explodeLines.material as THREE.Material).dispose()
      explodeLines = null
    }
    explodeTargets.length = 0
    if (modelRoot) {
      scene.remove(modelRoot)
      disposeObject(modelRoot)
      modelRoot = null
      gltfScene = null
    }
  }

  // ── 裁剪平面 ───────────────────────────────────────────
  const setClipping = (on: boolean) => {
    opts.clipping = on
    if (!modelRoot) return
    applyMaterialMode(opts.materialMode || 'real')
  }

  const setClipPosition = (t: number) => {
    opts.clipPosition = t
    // t=0 显示全部，t=1 完全剖切
    clipPlane.constant = modelRadius - t * modelRadius * 2
  }

  // ── 包围盒 ─────────────────────────────────────────────
  const enableBoundingBox = () => {
    if (!modelRoot || boxHelper) return
    const box = new THREE.Box3().setFromObject(modelRoot)
    boxHelper = new THREE.Box3Helper(box, 0xffb454)
    scene?.add(boxHelper)
  }

  const setBoundingBox = (on: boolean) => {
    opts.boundingBox = on
    if (on) enableBoundingBox()
    else if (boxHelper && scene) {
      scene.remove(boxHelper)
      boxHelper.geometry.dispose()
      ;(boxHelper.material as THREE.Material).dispose()
      boxHelper = null
    }
  }

  // ── 环境背景 ───────────────────────────────────────────
  const setEnvBackground = (on: boolean) => {
    opts.envBackground = on
    if (!scene) return
    scene.background = on && envRT ? envRT.texture : new THREE.Color(baseColor)
  }

  // ── 爆炸视图 ───────────────────────────────────────────
  const setExplode = (t: number) => {
    opts.explode = t
    if (!explodeLines) return
    const positions = explodeLines.geometry.getAttribute('position') as THREE.BufferAttribute
    explodeTargets.forEach(({ obj, base }, i) => {
      const dir = base.clone()
      if (dir.lengthSq() < 1e-8) {
        obj.position.copy(base)
      } else {
        dir.normalize()
        obj.position.copy(base).addScaledVector(dir, t * explodeSpread)
      }
      positions.setXYZ(i * 2, 0, 0, 0)
      positions.setXYZ(i * 2 + 1, obj.position.x, obj.position.y, obj.position.z)
    })
    positions.needsUpdate = true
    explodeLines.visible = t > 0.001
  }

  // ── PBR 滑块 ───────────────────────────────────────────
  const setMetalness = (v: number) => {
    opts.metalness = v
    if (!modelRoot) return
    modelRoot.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.isMesh && !Array.isArray(mesh.material)) {
        const m = mesh.material as THREE.MeshStandardMaterial
        if (m.metalness != null) m.metalness = v
      }
    })
  }

  const setRoughness = (v: number) => {
    opts.roughness = v
    if (!modelRoot) return
    modelRoot.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.isMesh && !Array.isArray(mesh.material)) {
        const m = mesh.material as THREE.MeshStandardMaterial
        if (m.roughness != null) m.roughness = v
      }
    })
  }

  const load = async (url: string): Promise<void> => {
    if (!scene || !renderer) return
    const token = ++loadToken
    clearModel()
    handlers.onProgress?.(0)
    const loader = new GLTFLoader()
    const draco = new DRACOLoader()
    // 解码器按需懒加载（当前内置模型均未压缩，不会触发网络请求）
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
    loader.setDRACOLoader(draco)
    try {
      const gltf = (await loader.loadAsync(url, (e) => {
        if (e.lengthComputable && e.total) {
          handlers.onProgress?.(Math.min(99, Math.floor((e.loaded / e.total) * 100)))
        }
      })) as unknown as GltfLike
      draco.dispose()
      if (token !== loadToken || disposed) return

      const root = new THREE.Group()
      const scene3 = gltf.scene
      root.add(scene3)
      // 居中到原点并抬升使底面贴地
      const box = new THREE.Box3().setFromObject(scene3)
      const center = box.getCenter(new THREE.Vector3())
      const sz = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(sz.x, sz.y, sz.z) || 1
      scene3.position.sub(center)
      const scale = TARGET_SIZE / maxDim
      root.scale.setScalar(scale)
      const lift = (sz.y * scale) / 2
      root.position.y = lift

      scene3.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.isMesh) {
          mesh.castShadow = true
          mesh.receiveShadow = true
        }
      })

      scene.add(root)
      modelRoot = root
      gltfScene = scene3

      // 爆炸视图目标（顶级部件）
      explodeSpread = (new THREE.Box3().setFromObject(root).getBoundingSphere(new THREE.Sphere()).radius) * 0.6
      scene3.children.forEach((ch) => {
        explodeTargets.push({ obj: ch, base: ch.position.clone() })
      })
      // 爆炸连线
      const lineGeo = new THREE.BufferGeometry()
      lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(explodeTargets.length * 6), 3))
      explodeLines = new THREE.LineSegments(
        lineGeo,
        new THREE.LineBasicMaterial({ color: 0x5b8cff, transparent: true, opacity: 0.5 }),
      )
      explodeLines.visible = false
      scene3.add(explodeLines)

      // 动画
      if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(scene3)
        gltf.animations.forEach((clip) => {
          actions.set(clip.name, mixer!.clipAction(clip))
        })
        animationPlaying = true
        const first = gltf.animations[0]
        currentAction = actions.get(first.name) || null
        currentAction?.reset().play()
        mixer.timeScale = opts.animSpeed ?? 1
        handlers.onAnimPlayState?.(true)
      } else {
        handlers.onAnimPlayState?.(false)
      }

      if (transformControls && opts.transform) transformControls.attach(root)

      applyMaterialMode(opts.materialMode || 'real')
      setClipping(opts.clipping === true)
      if (opts.boundingBox === true) enableBoundingBox()
      if (opts.explode && opts.explode > 0) setExplode(opts.explode)
      if (opts.metalness != null) setMetalness(opts.metalness)
      if (opts.roughness != null) setRoughness(opts.roughness)

      const sphere = new THREE.Box3().setFromObject(root).getBoundingSphere(new THREE.Sphere())
      modelRadius = sphere.radius || 1
      setClipPosition(opts.clipPosition ?? 0)

      frameModel()

      let tris = 0
      let meshCount = 0
      let sumMetal = 0
      let sumRough = 0
      let pbrCount = 0
      root.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.isMesh) {
          meshCount++
          const g = mesh.geometry
          tris += g.index ? g.index.count / 3 : (g.getAttribute('position')?.count || 0) / 3
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          mats.forEach((mat) => {
            const m = mat as THREE.MeshStandardMaterial
            if (m.metalness != null && m.roughness != null) {
              sumMetal += m.metalness
              sumRough += m.roughness
              pbrCount++
            }
          })
        }
      })

      handlers.onProgress?.(100)
      handlers.onLoaded?.({
        name: (url.split('/').pop() || url).split('?')[0],
        triangles: Math.round(tris),
        meshes: meshCount,
        animations: gltf.animations.map((c) => c.name),
        size: { x: +sz.x.toFixed(2), y: +sz.y.toFixed(2), z: +sz.z.toFixed(2) },
        pbr: {
          metalness: pbrCount ? sumMetal / pbrCount : 1,
          roughness: pbrCount ? sumRough / pbrCount : 1,
        },
      })
    } catch (err) {
      draco.dispose()
      if (token !== loadToken || disposed) return
      handlers.onError?.(err instanceof Error ? err.message : String(err))
    }
  }

  // ── 动画控制 ───────────────────────────────────────────
  const playAnimation = (name: string | null) => {
    if (!mixer) return
    if (currentAction) currentAction.fadeOut(0.2)
    if (name && actions.has(name)) {
      currentAction = actions.get(name)!.reset().fadeIn(0.2).play()
    } else {
      currentAction = null
    }
    animationPlaying = true
    handlers.onAnimPlayState?.(true)
  }

  const setAnimationPlaying = (on: boolean) => {
    if (!mixer) return
    animationPlaying = on
    handlers.onAnimPlayState?.(on)
  }

  const toggleAnim = () => {
    if (!mixer) return
    setAnimationPlaying(!animationPlaying)
  }

  // ── 渲染循环 ───────────────────────────────────────────
  const tick = () => {
    rafId = requestAnimationFrame(tick)
    if (!renderer || !scene || !camera || !composer || !controls) return
    const dt = clock.getDelta()
    if (mixer && animationPlaying) mixer.update(dt * (opts.animSpeed ?? 1))
    controls.update()
    composer.render()
    stats?.update()
  }

  // ── 变换控制器 ─────────────────────────────────────────
  const enableTransform = () => {
    if (!camera || !renderer || !scene || transformControls) return
    transformControls = new TransformControls(camera, renderer.domElement)
    transformControls.setMode((opts.transformMode as TransformMode) || 'translate')
    transformControls.addEventListener('dragging-changed', (e) => {
      if (controls) controls.enabled = !(e as unknown as { value: boolean }).value
    })
    transformHelper = transformControls.getHelper()
    scene.add(transformHelper)
    if (modelRoot) transformControls.attach(modelRoot)
  }

  const disableTransform = () => {
    if (!scene || !transformControls) return
    transformControls.detach()
    if (transformHelper) {
      scene.remove(transformHelper)
      transformHelper = null
    }
    transformControls.dispose()
    transformControls = null
  }

  // ── 统计 ───────────────────────────────────────────────
  const enableStats = () => {
    if (stats || !host()) return
    stats = new Stats()
    stats.dom.style.position = 'absolute'
    stats.dom.style.left = '8px'
    stats.dom.style.top = '8px'
    stats.dom.style.zIndex = '20'
    host()!.appendChild(stats.dom)
  }

  const disableStats = () => {
    stats?.dom.remove()
    stats = null
  }

  // ── 初始化 ─────────────────────────────────────────────
  const init = () => {
    const el = host()
    if (!el) return
    const { w, h } = size()

    scene = new THREE.Scene()
    scene.background = new THREE.Color(baseColor)

    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
    camera.position.copy(homePosition)

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    // 配套 three-compat：关闭 ColorManagement，沿用站点旧式线性直出管线
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    renderer.shadowMap.enabled = opts.shadow !== false
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.localClippingEnabled = true
    el.appendChild(renderer.domElement)
    renderer.domElement.style.display = 'block'

    // 程序化 IBL 环境
    pmrem = new THREE.PMREMGenerator(renderer)
    envRT = pmrem.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = envRT.texture
    scene.environmentIntensity = opts.envIntensity ?? 1

    // 灯光
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    scene.add(new THREE.HemisphereLight(0x9fb8ff, 0x202535, 0.6))
    dirLight = new THREE.DirectionalLight(0xffffff, 2.4)
    dirLight.position.set(5, 8, 6)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.set(2048, 2048)
    dirLight.shadow.camera.near = 0.5
    dirLight.shadow.camera.far = 40
    dirLight.shadow.camera.left = -10
    dirLight.shadow.camera.right = 10
    dirLight.shadow.camera.top = 10
    dirLight.shadow.camera.bottom = -10
    dirLight.shadow.bias = -0.0005
    scene.add(dirLight)

    // 接影地面（仅显示阴影，透明）
    groundMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.ShadowMaterial({ opacity: 0.32 }),
    )
    groundMesh.rotation.x = -Math.PI / 2
    groundMesh.receiveShadow = true
    scene.add(groundMesh)

    gridHelper = new THREE.GridHelper(40, 40, 0x3a4a6a, 0x223044)
    gridHelper.visible = opts.grid !== false
    scene.add(gridHelper)

    axesHelper = new THREE.AxesHelper(3)
    axesHelper.visible = opts.axes === true
    scene.add(axesHelper)

    // 控制器
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.autoRotate = opts.autoRotate !== false
    controls.autoRotateSpeed = 1.4
    controls.minDistance = 1
    controls.maxDistance = 60
    controls.target.copy(homeTarget)
    controls.update()

    // 后期
    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.65, 0.45, 0.85)
    bloomPass.enabled = opts.bloom === true
    composer.addPass(bloomPass)
    composer.setSize(w, h)

    // 变换控制器
    if (opts.transform === true) enableTransform()

    // 统计
    if (opts.stats === true) enableStats()

    // 事件
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('click', onClick)
    renderer.domElement.addEventListener('pointerleave', onPointerLeave)

    // 键盘快捷键：R 重置 / F 适配 / 空格 播放暂停
    keyHandler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
      if (e.key === 'r' || e.key === 'R') resetView()
      else if (e.key === 'f' || e.key === 'F') frameModel()
      else if (e.key === ' ') {
        e.preventDefault()
        toggleAnim()
      }
    }
    window.addEventListener('keydown', keyHandler)

    resizeObserver = new ResizeObserver(() => {
      if (!renderer || !camera || !composer) return
      const s = size()
      camera.aspect = s.w / s.h
      camera.updateProjectionMatrix()
      renderer.setSize(s.w, s.h)
      composer.setSize(s.w, s.h)
    })
    resizeObserver.observe(el)

    if (opts.envBackground === true) setEnvBackground(true)

    tick()
  }

  // ── 公开 API ───────────────────────────────────────────
  init()

  return {
    load,
    setMaterialMode: (m) => {
      opts.materialMode = m
      applyMaterialMode(m)
    },
    setBloom: (on) => {
      opts.bloom = on
      if (bloomPass) bloomPass.enabled = on
    },
    setGrid: (on) => {
      opts.grid = on
      if (gridHelper) gridHelper.visible = on
    },
    setAxes: (on) => {
      opts.axes = on
      if (axesHelper) axesHelper.visible = on
    },
    setAutoRotate: (on) => {
      opts.autoRotate = on
      if (controls) controls.autoRotate = on
    },
    setShadow: (on) => {
      opts.shadow = on
      if (renderer) renderer.shadowMap.enabled = on
      if (!scene) return
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.isMesh && m.material) {
          const mats = Array.isArray(m.material) ? m.material : [m.material]
          mats.forEach((mat) => {
            ;(mat as THREE.Material).needsUpdate = true
          })
        }
      })
    },
    setStats: (on) => {
      opts.stats = on
      if (on) enableStats()
      else disableStats()
    },
    setTransform: (on) => {
      opts.transform = on
      if (on) enableTransform()
      else disableTransform()
    },
    setTransformMode: (m) => {
      opts.transformMode = m
      if (transformControls) transformControls.setMode(m)
    },
    setEnvIntensity: (v) => {
      opts.envIntensity = v
      if (scene) scene.environmentIntensity = v
    },
    setView,
    setClipping,
    setClipPosition,
    setBoundingBox,
    setEnvBackground,
    setAnimSpeed: (v) => {
      opts.animSpeed = v
      if (mixer) mixer.timeScale = v
    },
    setExplode,
    setMetalness,
    setRoughness,
    playAnimation,
    setAnimationPlaying,
    resetView,
    frameView: frameModel,
    screenshot: () => {
      if (!composer || !renderer) return null
      composer.render()
      return renderer.domElement.toDataURL('image/png')
    },
    dispose: () => {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(rafId)
      resizeObserver?.disconnect()
      resizeObserver = null
      if (keyHandler) {
        window.removeEventListener('keydown', keyHandler)
        keyHandler = null
      }
      clearModel()
      if (renderer) {
        renderer.domElement.removeEventListener('pointermove', onPointerMove)
        renderer.domElement.removeEventListener('click', onClick)
        renderer.domElement.removeEventListener('pointerleave', onPointerLeave)
      }
      disableTransform()
      disableStats()
      controls?.dispose()
      envRT?.dispose()
      pmrem?.dispose()
      composer?.dispose()
      if (renderer && host()) {
        const canvas = renderer.domElement
        if (canvas.parentNode === host()) host()!.removeChild(canvas)
        renderer.dispose()
      }
      scene = null
      camera = null
      renderer = null
    },
  }
}
