import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import gsap from 'gsap'
import { mapConfig } from '../utils/mapConfig'
import { MAP_EXTENT } from '../utils/projection'
import type { FitProjection } from '../utils/projection'
import { setLineResolution } from '../utils/lineMaterials'
import { createStarfield } from './starfield'

/** 相机与地图法线的夹角（俯视倾斜 30°） */
const VIEW_TILT = Math.PI / 6
const FOV = 32
const MIN_POLAR = 0.12
/** 再倾斜就会看到板块背面 */
const MAX_POLAR = 1.02
const FIT_MARGIN = 0.84

const bloomMixShader = {
  uniforms: {
    baseTexture: { value: null },
    bloomTexture: { value: null },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: `
    uniform sampler2D baseTexture;
    uniform sampler2D bloomTexture;
    varying vec2 vUv;
    void main() { gl_FragColor = texture2D(baseTexture, vUv) + texture2D(bloomTexture, vUv); }
  `,
}

type Tick = (dt: number, elapsed: number) => void

/**
 * 渲染引擎：场景 / 相机 / 控制器 / 后期 / 渲染循环 / 视口尺寸。
 *
 * 三个容易踩坑的点都在这里收口：
 * 1. camera.up = +Z —— 地图躺在 XY 平面，Y-up 会让「拖拽」变成翻面；
 * 2. 选择性泛光用相机图层切换实现，不再逐帧遍历场景替换材质；
 * 3. 卸载时显式移除 canvas —— 否则 HMR 重挂载会残留旧画布（看起来像「地图下面多了一张图」）。
 */
export function useMapViewport(host: () => HTMLElement | null) {
  let scene: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let renderer: THREE.WebGLRenderer | null = null
  let controls: OrbitControls | null = null
  let composer: EffectComposer | null = null
  let bloomComposer: EffectComposer | null = null
  let starfield: ReturnType<typeof createStarfield> | null = null
  let rafId = 0
  let elapsed = 0
  let lastTime = 0
  let disposed = false
  const ticks = new Set<Tick>()
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()

  function viewDirection() {
    return new THREE.Vector3(0, -Math.sin(VIEW_TILT), Math.cos(VIEW_TILT))
  }

  /**
   * 精确取景距离：把地图包围盒 8 个角点投影到 NDC，
   * 迭代反推相机距离直到角点都落在 margin 内。
   * 比 FOV 经验公式可靠 —— 视口宽高比、俯视倾角都自动适配。
   */
  function fitDistance(fit: FitProjection, margin = FIT_MARGIN): number {
    const element = host()
    const aspect = element && element.clientHeight > 0
      ? element.clientWidth / element.clientHeight
      : 16 / 9
    const bounds = fit.bounds
    const halfWidth = Math.max(bounds.width / 2, 1)
    const halfHeight = Math.max(bounds.height / 2, 1)
    const corners: THREE.Vector3[] = []
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const z of [0, mapConfig.depth + 3]) {
          corners.push(new THREE.Vector3(sx * halfWidth, sy * halfHeight, z))
        }
      }
    }
    const target = new THREE.Vector3(0, 0, mapConfig.depth)
    const direction = viewDirection()
    const probe = new THREE.PerspectiveCamera(FOV, aspect, 0.5, 8000)
    probe.up.set(0, 0, 1)

    let distance = MAP_EXTENT * 2
    for (let i = 0; i < 6; i++) {
      probe.position.copy(target).addScaledVector(direction, distance)
      probe.lookAt(target)
      probe.updateMatrixWorld(true)
      probe.updateProjectionMatrix()
      let maxNdc = 0
      for (const corner of corners) {
        const projected = corner.clone().project(probe)
        maxNdc = Math.max(maxNdc, Math.abs(projected.x), Math.abs(projected.y))
      }
      if (!Number.isFinite(maxNdc) || maxNdc <= 0) break
      const next = distance * (maxNdc / margin)
      if (Math.abs(next - distance) / distance < 0.008) {
        distance = next
        break
      }
      distance = next
    }
    return Math.max(60, Math.min(2000, distance))
  }

  /** 把相机推到一个能完整看下当前层级的位置 */
  function focus(fit: FitProjection | null, duration = 0.55) {
    if (!camera || !controls) return
    const target = new THREE.Vector3(0, 0, mapConfig.depth)
    const distance = fit ? fitDistance(fit) : MAP_EXTENT * 2
    const position = viewDirection().multiplyScalar(distance).add(target)

    controls.enabled = false
    gsap.killTweensOf(controls.target)
    gsap.killTweensOf(camera.position)
    const finish = () => {
      if (disposed || !controls) return
      controls.minDistance = distance * 0.42
      controls.maxDistance = distance * 2.1
      controls.enabled = true
    }
    if (duration <= 0) {
      controls.target.copy(target)
      camera.position.copy(position)
      controls.update()
      finish()
      return
    }
    gsap.to(controls.target, { x: target.x, y: target.y, z: target.z, duration, ease: 'power2.out' })
    gsap.to(camera.position, { x: position.x, y: position.y, z: position.z, duration, ease: 'power2.out', onComplete: finish })
    controls.minDistance = 1
    controls.maxDistance = 4000
  }

  function resize() {
    const element = host()
    if (!element || !renderer || !camera) return
    const width = element.clientWidth
    const height = element.clientHeight
    if (!width || !height) return
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    composer?.setSize(width, height)
    bloomComposer?.setSize(width, height)
    setLineResolution(width, height)
  }

  function render() {
    if (!renderer || !camera || !composer) return
    const bloomLayer = mapConfig.bloomLayer
    // 只渲染泛光层 → 得到干净的 bloom 纹理；再切回默认层渲染全场景
    if (bloomComposer) {
      camera.layers.set(bloomLayer)
      bloomComposer.render()
    }
    camera.layers.set(0)
    composer.render()
  }

  function start() {
    const element = host()
    if (!element || renderer) return

    // 清掉可能残留的旧画布（HMR / 重复挂载）
    for (const canvas of Array.from(element.querySelectorAll('canvas'))) canvas.remove()

    scene = new THREE.Scene()
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
    element.appendChild(renderer.domElement)

    const width = element.clientWidth || 1200
    const height = element.clientHeight || 700
    renderer.setSize(width, height)

    camera = new THREE.PerspectiveCamera(FOV, width / height, 0.5, 4000)
    // 关键：以 Z 轴为上，OrbitControls 才是「绕地图法线转动」而不是翻面
    camera.up.set(0, 0, 1)
    const target = new THREE.Vector3(0, 0, mapConfig.depth)
    camera.position.copy(viewDirection().multiplyScalar(MAP_EXTENT * 2.2).add(target))
    camera.lookAt(target)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.target.copy(target)
    controls.enableDamping = true
    controls.dampingFactor = 0.075
    controls.rotateSpeed = 0.46
    controls.zoomSpeed = 0.9
    controls.panSpeed = 0.7
    controls.minPolarAngle = MIN_POLAR
    controls.maxPolarAngle = MAX_POLAR
    controls.minDistance = 40
    controls.maxDistance = 1200
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    }
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }
    controls.update()

    scene.add(new THREE.AmbientLight(0xffffff, 0.52))
    const keyLight = new THREE.DirectionalLight(0xd6ebff, 0.95)
    keyLight.position.set(-40, -90, 160)
    scene.add(keyLight)
    const rimLight = new THREE.DirectionalLight(0x3f8fd0, 0.4)
    rimLight.position.set(60, 40, 30)
    scene.add(rimLight)

    setLineResolution(width, height)

    // ── 后期：选择性泛光（只作用于飞线与数据柱）──
    const renderPass = new RenderPass(scene, camera)
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.62, 0.45, 0.52)
    bloomComposer = new EffectComposer(renderer)
    bloomComposer.renderToScreen = false
    bloomComposer.addPass(renderPass)
    bloomComposer.addPass(bloomPass)
    bloomComposer.setSize(width, height)

    const mixPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: bloomComposer.renderTarget2.texture },
        },
        vertexShader: bloomMixShader.vertexShader,
        fragmentShader: bloomMixShader.fragmentShader,
      }),
      'baseTexture',
    )
    mixPass.needsSwap = true
    composer = new EffectComposer(renderer)
    composer.addPass(renderPass)
    composer.addPass(mixPass)
    composer.setSize(width, height)

    starfield = createStarfield()
    for (const points of starfield.points) scene.add(points)

    // 阻止滚轮冒泡到页面（页面本身可能带滚动）
    renderer.domElement.addEventListener(
      'wheel',
      (event) => {
        event.stopPropagation()
        if (event.ctrlKey) event.preventDefault()
      },
      { passive: false },
    )

    window.addEventListener('resize', resize, false)
    document.addEventListener('visibilitychange', onVisibility, false)

    lastTime = performance.now()
    const loop = () => {
      if (disposed) return
      rafId = requestAnimationFrame(loop)
      const now = performance.now()
      const dt = Math.min(0.06, (now - lastTime) / 1000)
      lastTime = now
      elapsed += dt
      controls?.update()
      for (const tick of ticks) tick(dt, elapsed)
      starfield?.update(elapsed)
      render()
    }
    loop()
  }

  function onVisibility() {
    if (!document.hidden) lastTime = performance.now()
  }

  function stop() {
    disposed = true
    cancelAnimationFrame(rafId)
    ticks.clear()
    window.removeEventListener('resize', resize, false)
    document.removeEventListener('visibilitychange', onVisibility, false)
    starfield?.dispose()
    composer?.dispose?.()
    bloomComposer?.dispose?.()
    controls?.dispose()
    const canvas = renderer?.domElement
    renderer?.dispose()
    canvas?.remove()
    scene?.clear()
    scene = null
    camera = null
    renderer = null
    controls = null
    composer = null
    bloomComposer = null
    starfield = null
  }

  return {
    start,
    stop,
    focus,
    onTick: (tick: Tick) => {
      ticks.add(tick)
      return () => ticks.delete(tick)
    },
    scene: () => scene,
    camera: () => camera,
    controls: () => controls,
    canvas: () => renderer?.domElement ?? null,
    raycaster,
    pointer,
  }
}
