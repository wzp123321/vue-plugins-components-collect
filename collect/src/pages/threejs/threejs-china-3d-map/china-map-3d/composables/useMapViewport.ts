/**
 * useMapViewport —— 地图渲染引擎（场景 / 相机 / 控制器 / 后期 / 渲染循环 / 视口）
 *
 * 文件职责：
 *   搭起 three.js 运行所需的一切：Scene、Z-up 透视相机、OrbitControls、
 *   选择性泛光（EffectComposer）、requestAnimationFrame 主循环、窗口缩放与
 *   canvas 生命周期。它本身不生产"地图内容"，只提供舞台与取景能力。
 *
 * 在整体架构中的角色：
 *   被 useMapLayer / useSpotMarkers / useFlyLines / usePointerPick / useZoomDrill
 *   共同依赖的"渲染底座"。其它模块通过 scene() / camera() / controls() /
 *   onTick() / raycaster 接入；本文件负责把它们的产物画出来。
 *
 * 与哪些模块协作：
 *   - useMapLayer：把区块 root 挂到 scene
 *   - useSpotMarkers / useFlyLines：数据柱、飞线挂到 root，并注册 onTick 动画
 *   - usePointerPick：用本文件的 raycaster / camera 做拾取
 *   - useZoomDrill：读 camera / controls 距离判断下钻
 *   - starfield：星空背景也挂进 scene
 *
 * ⚠️ 三个最容易翻车的地方都在此收口：
 * 1. camera.up = +Z —— 地图躺在 XY 平面，Y-up 会让"拖拽旋转"变成翻面；
 *    改成 Z-up 后才是绕地图法线的"转盘"旋转，再配合 min/maxPolarAngle 限幅
 *    就永远不会翻到背面。
 * 2. 选择性泛光用「相机图层切换」实现（camera.layers.set(1) 渲 bloom → set(0)
 *    渲主画面），不再逐帧 scene.traverse 替换黑材质，开销低且无闪烁。
 * 3. 卸载时显式移除 canvas —— canvas 是 appendChild 进去的、不在模板里，
 *    旧实例 unmount 不会摘 DOM → 两块画布叠加（HMR 重挂载尤甚）。
 *    故 mount 时先清空容器内残留 canvas，unmount 时 canvas.remove()。
 */
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

// ── 相机 / 取景相关常量 ──────────────────────────────────────────
/** 相机视线相对「地图法线(Z 轴)」的倾角：30° 俯视倾斜，越平越像桌面俯瞰 */
const VIEW_TILT = Math.PI / 6
/** 透视相机视场角(度)。偏小 → 透视畸变弱、更像正交俯视图 */
const FOV = 32
/** 极角下限：>0 避免相机俯到正上方(天顶)导致万向锁/翻转 */
const MIN_POLAR = 0.12
/** 极角上限：1.02 rad ≈ 58.4°；再倾斜就会越过赤道看到板块背面，故限幅 */
const MAX_POLAR = 1.02
/** 取景留白系数：角点 NDC 允许到 0.84(<1 即四周留边)，比值越小画面越空 */
const FIT_MARGIN = 0.84

// 泛光合成用的混合着色器：把基础画面 + bloom 纹理叠加输出
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

/** 每帧回调：渲染循环每帧按 (dt 秒, elapsed 秒) 调用 */
type Tick = (dt: number, elapsed: number) => void

/** 左键拖拽的行为：pan=拖着地图走（上下拖即视觉上的前后移动），rotate=绕地图转动 */
export type DragMode = 'pan' | 'rotate'

/** 平移边界：超过这个范围就把视点夹回来，避免地图被拖出画面 */
const PAN_LIMIT = 130

/**
 * 渲染引擎 composable。
 *
 * @param host 返回挂载容器 DOM 的 getter；相机/渲染尺寸、canvas 挂载都以此为准。
 *   用 getter（而非直接传元素）是为了兼容组件 setup 阶段容器尚未就绪的情况。
 * @returns start/stop 生命周期、focus 取景、setDragMode 交互模式，以及
 *   scene()/camera()/controls()/raycaster 等访问器供外部模块接入。
 */
export const useMapViewport = (host: () => HTMLElement | null) => {
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
  let dragMode: DragMode = 'pan'
  const ticks = new Set<Tick>()
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()

  // 视线方向：绕 X 轴俯仰 VIEW_TILT，落在 -Y / +Z 组成的斜上方
  const viewDirection = () => {
    return new THREE.Vector3(0, -Math.sin(VIEW_TILT), Math.cos(VIEW_TILT))
  };

  /**
   * 精确取景距离：把地图包围盒 8 个角点投影到 NDC，
   * 迭代反推相机距离直到角点都落在 margin 内。
   * 比 FOV 经验公式可靠 —— 视口宽高比、俯视倾角都自动适配。
   *
   * ⚠️ 坑：不要拿 FOV + 经验系数估距离。本项目地图是斜视角(30°)、且窗口
   *   宽高比随时变，用半高/半角的 tan 公式会把边框算偏，导致地图被裁或留白过多。
   *   正确做法是"投影角点 → 看最大 |ndc| → 按比例放大相机距离"的迭代逼近，
   *   6 次以内即可收敛。
   */
  const fitDistance = (fit: FitProjection, margin = FIT_MARGIN): number => {
    const element = host()
    const aspect = element && element.clientHeight > 0
      ? element.clientWidth / element.clientHeight
      : 16 / 9
    const bounds = fit.bounds
    // 容错：避免除 0（包围盒退化为点或异常数据）
    const halfWidth = Math.max(bounds.width / 2, 1)
    const halfHeight = Math.max(bounds.height / 2, 1)
    // 8 个角点 = (±halfW, ±halfH, {底面 z=0, 顶面 z=depth+3})，涵盖立体厚度
    const corners: THREE.Vector3[] = []
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const z of [0, mapConfig.depth + 3]) {
          corners.push(new THREE.Vector3(sx * halfWidth, sy * halfHeight, z))
        }
      }
    }
    // 视线目标：地图顶面中心（板块厚度为 depth，故取 z=depth）
    const target = new THREE.Vector3(0, 0, mapConfig.depth)
    const direction = viewDirection()
    // 用临时投影相机模拟，避免污染真实相机
    const probe = new THREE.PerspectiveCamera(FOV, aspect, 0.5, 8000)
    probe.up.set(0, 0, 1)

    // 初始距离给到 2 倍世界范围，再逐次收敛
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
      // 角点越界(maxNdc>margin)就按比例拉远；margin 内则贴近
      const next = distance * (maxNdc / margin)
      // 收敛判定：相对变化 < 0.8% 即视为到位，提前结束迭代
      if (Math.abs(next - distance) / distance < 0.008) {
        distance = next
        break
      }
      distance = next
    }
    // 兜底：距离不能太近也别太远，防止极端数据把相机怼进地图或拉到天外
    return Math.max(60, Math.min(2000, distance))
  };

  /**
   * 把相机平滑推到一个能完整看下当前层级的位置。
   * @param fit 当前层级投影信息；为 null 时退回默认距离
   * @param duration 动画时长(秒)；<=0 表示瞬移（无需过渡）
   */
  const focus = (fit: FitProjection | null, duration = 0.55) => {
    if (!camera || !controls) return
    const target = new THREE.Vector3(0, 0, mapConfig.depth)
    const distance = fit ? fitDistance(fit) : MAP_EXTENT * 2
    const position = viewDirection().multiplyScalar(distance).add(target)

    // 过渡前先禁掉控制器，避免用户拖拽与补间互相打架
    controls.enabled = false
    gsap.killTweensOf(controls.target)
    gsap.killTweensOf(camera.position)
    const finish = () => {
      if (disposed || !controls) return
      // 收尾时设定可缩放上下限：以当前距离为中值的 [0.42, 2.1] 倍，防止钻进地里或飞太远
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
    // 动画期间放开限制，否则 min/maxDistance 会把补间位置"夹断"
    controls.minDistance = 1
    controls.maxDistance = 4000
  };

  /**
   * 平移过头会把地图拖出画面：把视点夹在 ±PAN_LIMIT 内。
   * ⚠️ 坑：只夹 controls.target 不够——若相机留在原地、只有视点被拉回，
   *   会变成一次"斜着看"。必须让相机沿"相机→视点"向量同步补偿位移。
   */
  const clampTarget = () => {
    if (!controls) return
    const target = controls.target
    let touched = false
    if (target.x < -PAN_LIMIT || target.x > PAN_LIMIT) {
      target.x = Math.max(-PAN_LIMIT, Math.min(PAN_LIMIT, target.x))
      touched = true
    }
    if (target.y < -PAN_LIMIT || target.y > PAN_LIMIT) {
      target.y = Math.max(-PAN_LIMIT, Math.min(PAN_LIMIT, target.y))
      touched = true
    }
    if (!touched) return
    // 相机同步补偿，否则视点被夹住而相机留在原地会变成一次「斜着看」
    if (camera) {
      const offset = new THREE.Vector3().subVectors(camera.position, target)
      camera.position.copy(target).add(offset)
    }
    controls.update()
  };

  /**
   * 切换左键拖拽行为；控制器还没创建时先记下来，start 时再套用。
   * ⚠️ 架构约定：本应用默认左键 = PAN（上下拖＝屏幕空间远近推进），
   *   右键 = 旋转；与 OrbitControls 默认(左键旋转)相反，务必用 mouseButtons 显式改。
   */
  const setDragMode = (mode: DragMode) => {
    dragMode = mode
    if (!controls) return
    const pan = mode === 'pan'
    controls.mouseButtons = pan
      ? { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }
      : { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }
    controls.touches = pan
      ? { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE }
      : { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }
  };

  /** 容器尺寸变化时同步相机宽高比、渲染器与两个 composer 的尺寸 */
  const resize = () => {
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
  };

  /** 选择性泛光渲染：先只渲 bloom 图层得到辉光纹理，再切回默认层渲全场景 */
  const render = () => {
    if (!renderer || !camera || !composer) return
    const bloomLayer = mapConfig.bloomLayer
    // 只渲染泛光层 → 得到干净的 bloom 纹理；再切回默认层渲染全场景
    if (bloomComposer) {
      camera.layers.set(bloomLayer)
      bloomComposer.render()
    }
    // ⚠️ 坑：飞线与数据柱在 utils 里被 enableBloom() 设到 bloomLayer 图层，
    //   其余物体默认在图层 0。这里渲 bloom 时只 showing 该层，再切回 0 渲主画面，
    //   因此无需逐帧遍历场景替换材质即可实现"仅指定物体发光"。
    camera.layers.set(0)
    composer.render()
  };

  /** 初始化渲染器、相机、控制器、灯光与后期，并启动主循环 */
  const start = () => {
    const element = host()
    if (!element || renderer) return

    // 清掉可能残留的旧画布（HMR / 重复挂载）
    // ⚠️ 坑：canvas 是 appendChild 进去的、不在模板里，旧实例 unmount 不会摘 DOM
    //   → 两块 canvas 叠加（看起来像"地图下面多了一张图"）。挂载前先清干净。
    for (const canvas of Array.from(element.querySelectorAll('canvas'))) canvas.remove()

    scene = new THREE.Scene()
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', alpha: true })
    renderer.setClearColor(0x000000, 0)
    // 限制像素比，避免 4K/Retina 屏下设备像素比过大导致 fill-rate 爆炸掉帧
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
    element.appendChild(renderer.domElement)

    const width = element.clientWidth || 1200
    const height = element.clientHeight || 700
    renderer.setSize(width, height)

    camera = new THREE.PerspectiveCamera(FOV, width / height, 0.5, 4000)
    // 关键：以 Z 轴为上，OrbitControls 才是「绕地图法线转动」而不是翻面
    // ⚠️ 坑：地图躺在 XY 平面(Z 朝上)。若保持默认 up=+Y，OrbitControls 的
    //   "拖拽旋转"会变成让整个地图翻面；改成 up=+Z 才是绕地图法线的转盘旋转。
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
    // screenSpacePanning=true：上下拖拽即沿屏幕推进 / 拉远，也就是「往里往外地拖」
    controls.screenSpacePanning = true
    setDragMode(dragMode)
    controls.addEventListener('change', clampTarget)
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
    // 流程：bloomComposer 只渲 bloomLayer → 纹理；composer 再叠加回主画面。
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
      // 钳制 dt 上限(≤60ms)，切后台回来或卡顿后不会一次性"跳帧"把动画补爆
      const dt = Math.min(0.06, (now - lastTime) / 1000)
      lastTime = now
      elapsed += dt
      controls?.update()
      for (const tick of ticks) tick(dt, elapsed)
      starfield?.update(elapsed)
      render()
    }
    loop()
  };

  // 页面重新可见时重置时间基准，避免隐藏期间堆积的 dt 造成位置突跳
  const onVisibility = () => {
    if (!document.hidden) lastTime = performance.now()
  };

  /** 销毁一切：取消循环、解绑事件、释放 GPU 资源、移除 canvas */
  const stop = () => {
    disposed = true
    cancelAnimationFrame(rafId)
    ticks.clear()
    window.removeEventListener('resize', resize, false)
    document.removeEventListener('visibilitychange', onVisibility, false)
    controls?.removeEventListener('change', clampTarget)
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
  };

  return {
    start,
    stop,
    focus,
    setDragMode,
    dragMode: () => dragMode,
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
};
