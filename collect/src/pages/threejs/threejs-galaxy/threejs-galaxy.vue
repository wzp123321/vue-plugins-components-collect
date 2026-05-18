<template>
  <div class="threejs-galaxy">
    <!-- ==================== 3D 渲染容器 ==================== -->
    <div class="canvas-container" id="threejs-galaxy-canvas" ref="canvasRef"></div>

    <!-- ==================== 实时控制面板 ==================== -->
    <div class="control-panel">
      <h4 class="panel-title">☆ 银河系参数控制</h4>
      <div class="control-item">
        <label>旋转速度: <span>{{ controlParams.speed.toFixed(2) }}</span></label>
        <input type="range" v-model.number="controlParams.speed" min="0" max="2" step="0.01" />
      </div>
      <div class="control-item">
        <label>粒子数量: <span>{{ formatNumber(controlParams.count) }}</span></label>
        <input type="range" v-model.number="controlParams.count" min="1000" max="30000" step="1000" />
      </div>
      <div class="control-item">
        <label>粒子大小: <span>{{ controlParams.size.toFixed(2) }}</span></label>
        <input type="range" v-model.number="controlParams.size" min="0.5" max="5" step="0.1" />
      </div>
      <div class="control-item">
        <label>螺旋半径: <span>{{ controlParams.radius.toFixed(1) }}</span></label>
        <input type="range" v-model.number="controlParams.radius" min="5" max="30" step="0.5" />
      </div>
      <div class="control-item">
        <label>螺旋臂数量: <span>{{ controlParams.arms }}</span></label>
        <input type="range" v-model.number="controlParams.arms" min="1" max="6" step="1" />
      </div>
      <button class="btn-reset" @click="resetParams">重置默认参数</button>
      <button class="btn-rebuild" @click="rebuildGalaxy">重新生成银河系</button>
    </div>

    <!-- ==================== 信息面板 ==================== -->
    <div class="info-panel" v-if="infoText">
      <p>{{ infoText }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, reactive, ref, nextTick } from 'vue'
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  BufferGeometry,
  BufferAttribute,
  Points,
  PointsMaterial,
  AdditiveBlending,
  Clock,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

/*
 * ========================================================================
 *  模块：Three.js 粒子银河系 (Particle Galaxy)
 *  核心知识点：
 *    1. BufferGeometry 自定义顶点坐标 —— 手动构建万级粒子的空间位置
 *    2. 对数螺旋线 (Logarithmic Spiral) —— 数学公式 r = a * e^(b*θ) 生成螺旋臂
 *    3. BufferAttribute 颜色属性 —— 每个顶点独立着色，实现从中心到边缘渐变
 *    4. AdditiveBlending 叠加混合 —— 让粒子重叠区域更亮，模拟银河光晕
 *    5. PointsMaterial —— 高性能粒子渲染材质
 *    6. OrbitControls —— 轨道控制器，自由旋转/缩放/平移
 *    7. 实时重建 (rebuild) —— 动态修改粒子数量/大小后重新生成几何体
 * ========================================================================
 */

// ---------- 类型定义 ----------

/** 控制面板参数 */
interface GalaxyParams {
  speed: number // 银河自转速度系数
  count: number // 粒子总数
  size: number // 单个粒子的大小（像素）
  radius: number // 螺旋臂最大半径
  arms: number // 螺旋臂数量
}

/** 每个粒子的属性 */
interface ParticleAttribute {
  position: Float32Array // xyz 坐标数组
  color: Float32Array // rgb 颜色数组
}

// ---------- 响应式状态 ----------

const canvasRef = ref<HTMLDivElement | null>(null)
const infoText = ref('')
const controlParams = reactive<GalaxyParams>({
  speed: 0.5,
  count: 15000,
  size: 1.5,
  radius: 18,
  arms: 3,
})

// ---------- 全局变量 ----------

let scene: Scene | null = null
let camera: PerspectiveCamera | null = null
let renderer: WebGLRenderer | null = null
let controls: OrbitControls | null = null
let galaxyPoints: Points | null = null
let galaxyGeometry: BufferGeometry | null = null
let galaxyMaterial: PointsMaterial | null = null
let clock: Clock | null = null
let animationId = 0
let scheduledRebuild = false

// ---------- 工具函数 ----------

function formatNumber(n: number): string {
  return n >= 10000 ? `${(n / 10000).toFixed(1)}万` : `${n}`
}

function log(msg: string, data?: unknown) {
  const timestamp = new Date().toLocaleTimeString()
  const prefix = `[银河系] ${timestamp}`
  if (data !== undefined) {
    console.log(`${prefix} ${msg}`, data)
  } else {
    console.log(`${prefix} ${msg}`)
  }
}

// ---------- 核心：生成螺旋臂粒子数据 ----------

/**
 * 生成对数螺旋臂的粒子坐标和颜色
 *
 * 对数螺旋极坐标方程：r(θ) = a * e^(b * θ)
 *   - r：极径（到中心的距离）
 *   - θ：极角（弧度）
 *   - a：缩放因子
 *   - b：螺旋增长率（b > 0 时向外螺旋）
 *
 * 为了使银河系看起来更自然，在每个粒子位置加入随机扰动 (randomness)
 *
 * @param count 粒子总数
 * @param arms 螺旋臂数量
 * @param maxRadius 螺旋臂最大半径
 * @returns 粒子的 position 和 color 数组
 */
function generateGalaxyParticles(count: number, arms: number, maxRadius: number): ParticleAttribute {
  log(`开始生成粒子数据: count=${count}, arms=${arms}, maxRadius=${maxRadius}`)
  const startTime = performance.now()

  // 每个粒子 3 个 float (xyz)，故数组长度为 count * 3
  const positions = new Float32Array(count * 3)
  // 每个粒子 3 个 float (rgb)，故数组长度为 count * 3
  const colors = new Float32Array(count * 3)

  // ---------- 螺旋参数 ----------
  const spiralTightness = 0.45 // 螺旋紧密度，越大越紧
  const randomness = 0.35 // 随机扰动强度，越高越分散
  const innerEdge = maxRadius * 0.06 // 内圈最小半径（避免粒子堆在中心）

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    // ---- 1. 决定粒子属于哪条螺旋臂 ----
    // 每条臂之间均匀分布角度：armOffset = (armIndex / arms) * 2π
    const armIndex = i % arms
    const armOffset = (armIndex / arms) * Math.PI * 2

    // ---- 2. 沿螺旋臂的半径分布 (非均匀：中心密集，外围稀疏) ----
    // 用平方根映射让粒子在半径方向均匀分布，而不是在极坐标下均匀
    // 否则中心区域粒子的视觉密度会远高于外围
    const r = innerEdge + Math.pow(Math.random(), 0.5) * (maxRadius - innerEdge)

    // ---- 3. 对数螺旋角度计算 ----
    // 基本角度 = r 对应的对数螺旋角度 * 紧密度
    const theta = r * spiralTightness * (Math.random() * 0.6 + 0.7) + armOffset

    // ---- 4. 随机扰动 (让银河系看起来更自然，不完全是一条细线) ----
    const randomX = (Math.random() - 0.5) * randomness * 3
    const randomY = (Math.random() - 0.5) * randomness * 0.6 // Y轴扰动较小（银河系是扁平的）
    const randomZ = (Math.random() - 0.5) * randomness * 3

    // ---- 5. 设置粒子空间坐标 ----
    positions[i3] = Math.cos(theta) * r + randomX // x
    positions[i3 + 1] = randomY // y (银河系很薄)
    positions[i3 + 2] = Math.sin(theta) * r + randomZ // z

    // ---- 6. 根据半径计算粒子颜色 ----
    // 中心区域：暖黄色/白色 → 外围：蓝紫色/青色
    // 用 r / maxRadius 得到一个 0~1 的归一化距离
    const distanceRatio = r / maxRadius

    // 红色通道：距离越远越小（中心白→暖黄→外围暗）
    const red = 1.0 - distanceRatio * 0.7

    // 绿色通道：中间距离最亮，两端暗
    const green = 1.0 - Math.abs(distanceRatio - 0.3) * 1.2

    // 蓝色通道：距离越远越蓝
    const blue = 0.2 + distanceRatio * 0.8

    colors[i3] = Math.max(0, Math.min(1, red))
    colors[i3 + 1] = Math.max(0, Math.min(1, green))
    colors[i3 + 2] = Math.max(0, Math.min(1, blue))
  }

  const elapsed = (performance.now() - startTime).toFixed(2)
  log(`粒子数据生成完成，耗时 ${elapsed}ms`)

  return { position: positions, color: colors }
}

// ---------- 核心：构建 BufferGeometry ----------

/**
 * 根据粒子属性构建 BufferGeometry
 * 使用 BufferAttribute 将原始 Float32Array 直接传递给 GPU，避免中间转换
 */
function buildGalaxyGeometry(attrs: ParticleAttribute): BufferGeometry {
  log('构建 BufferGeometry...')

  const geometry = new BufferGeometry()

  // position 属性：每个顶点 3 个分量 (x, y, z)
  geometry.setAttribute('position', new BufferAttribute(attrs.position, 3))

  // color 属性：每个顶点 3 个分量 (r, g, b)
  geometry.setAttribute('color', new BufferAttribute(attrs.color, 3))

  log(`BufferGeometry 构建完成: vertexCount=${geometry.attributes.position.count}`)
  return geometry
}

// ---------- 初始化 Three.js 基础设施 ----------

function initThreeJS() {
  log('======== 初始化 Three.js 基础设施 ========')

  // ---- 场景 ----
  scene = new Scene()
  scene.background = new Color(0x050510)
  log('场景创建完成，背景色: #050510 (深空蓝黑)')

  // ---- 相机 ----
  // PerspectiveCamera(fov, aspect, near, far)
  // fov=60: 视野角度，越大看到范围越广
  camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 12, 22)
  camera.lookAt(0, 0, 0)
  log(`相机初始化: position=(${camera.position.x}, ${camera.position.y}, ${camera.position.z})`)

  // ---- 渲染器 ----
  renderer = new WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // 限制像素比避免性能问题
  log(`渲染器创建: size=${renderer.domElement.width}x${renderer.domElement.height}, pixelRatio=${renderer.getPixelRatio()}`)

  // ---- 轨道控制器 ----
  // OrbitControls 允许用户通过鼠标旋转、缩放、平移场景
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true // 开启惯性阻尼，旋转更平滑
  controls.dampingFactor = 0.08 // 阻尼系数
  controls.minDistance = 5 // 最小缩放距离
  controls.maxDistance = 50 // 最大缩放距离
  controls.autoRotate = false // 不自动旋转（我们手动控制银河旋转）
  log('OrbitControls 初始化完成 (阻尼=0.08, 距离范围=5~50)')

  // ---- 挂载 canvas 到 DOM ----
  if (canvasRef.value) {
    canvasRef.value.appendChild(renderer.domElement)
    log('Canvas 已挂载到 DOM')
  }

  // ---- 构建初始银河系 ----
  buildGalaxy()

  log('======== Three.js 基础设施初始化完成 ========')
}

// ---------- 构建/重建银河系 ----------

function buildGalaxy() {
  log('---------- 开始构建银河系 ----------')

  // 销毁旧的 Points 以免内存泄漏
  if (galaxyPoints) {
    scene!.remove(galaxyPoints)
    galaxyGeometry?.dispose() // 释放 GPU 显存
    galaxyMaterial?.dispose()
    log('旧银河系已销毁，GPU 显存已释放')
  }

  const { count, arms, radius, size } = controlParams

  // 1. 生成粒子属性数据
  const attrs = generateGalaxyParticles(count, arms, radius)

  // 2. 构建 geometry
  galaxyGeometry = buildGalaxyGeometry(attrs)

  // 3. 创建 PointsMaterial
  //    AdditiveBlending: 叠加混合，粒子重叠区域变亮，模拟光晕效果
  //    depthWrite=false: 不写入深度缓冲，半透明粒子正确渲染
  //    vertexColors=true: 使用 geometry 中定义的独立顶点颜色
  galaxyMaterial = new PointsMaterial({
    size,
    blending: AdditiveBlending,
    depthWrite: false,
    vertexColors: true,
    sizeAttenuation: true, // 距离远的粒子远处变小
  })
  log(`PointsMaterial 创建完成: size=${size}, blending=Additive, vertexColors=true`)

  // 4. 创建 Points 对象并添加到场景
  galaxyPoints = new Points(galaxyGeometry, galaxyMaterial)
  galaxyPoints.rotation.x = Math.PI * 0.15 // 稍微倾斜，更符合银河系视角
  scene!.add(galaxyPoints)

  log(`银河系 Points 对象已创建: count=${count}, arms=${arms}, radius=${radius}`)
  log(`当前场景子对象数: ${scene!.children.length}`)
  infoText.value = `粒子数: ${formatNumber(count)} · 螺旋臂: ${arms} · 半径: ${radius}`
}

// ---------- 动画循环 (每帧执行) ----------

function animate() {
  animationId = requestAnimationFrame(animate)

  // 银河系自转 (绕 Y 轴旋转)
  const delta = clock!.getDelta()
  if (galaxyPoints) {
    galaxyPoints.rotation.y += delta * controlParams.speed * 0.5
  }

  // 更新轨道控制器
  controls!.update()

  // 渲染当前帧
  renderer!.render(scene!, camera!)

  // 如果有排队的重建请求，在下一帧开始前执行
  if (scheduledRebuild) {
    scheduledRebuild = false
    buildGalaxy()
  }
}

// ---------- 窗口尺寸变化处理 ----------

function onResize() {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    log(`窗口尺寸变化: ${window.innerWidth}x${window.innerHeight}`)
  }
}

// ---------- 控制面板方法 ----------

function resetParams() {
  controlParams.speed = 0.5
  controlParams.count = 15000
  controlParams.size = 1.5
  controlParams.radius = 18
  controlParams.arms = 3
  log('参数已重置为默认值')
  scheduledRebuild = true
}

function rebuildGalaxy() {
  log('手动触发银河系重建')
  scheduledRebuild = true
}

// ---------- 生命周期钩子 ----------

onMounted(() => {
  log('组件挂载')
  clock = new Clock()
  nextTick(() => {
    initThreeJS()
    animate()
  })
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  log('组件卸载，开始清理资源...')

  // 停止动画循环
  if (animationId) cancelAnimationFrame(animationId)

  // 销毁控制器
  controls?.dispose()

  // 销毁几何体和材质
  galaxyGeometry?.dispose()
  galaxyMaterial?.dispose()

  // 从 DOM 移除 canvas
  if (renderer && canvasRef.value) {
    const canvas = renderer.domElement
    if (canvas.parentNode === canvasRef.value) {
      canvasRef.value.removeChild(canvas)
    }
  }

  // 释放渲染器
  renderer?.dispose()

  window.removeEventListener('resize', onResize)

  log('所有资源已清理，再见！')
})
</script>

<style scoped lang="less">
.threejs-galaxy {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.canvas-container {
  width: 100%;
  height: 100%;
}

/* ==================== 控制面板样式 ==================== */
.control-panel {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 240px;
  background: rgba(10, 10, 30, 0.85);
  border: 1px solid rgba(100, 140, 255, 0.3);
  border-radius: 10px;
  padding: 16px;
  color: #c8d6ff;
  font-size: 13px;
  backdrop-filter: blur(8px);
  z-index: 10;
  user-select: none;
}

.panel-title {
  margin: 0 0 12px;
  font-size: 15px;
  color: #8ab4f8;
  text-align: center;
  letter-spacing: 1px;
}

.control-item {
  margin-bottom: 10px;

  label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;

    span {
      color: #ffcc80;
      font-weight: bold;
    }
  }

  input[type='range'] {
    width: 100%;
    height: 4px;
    cursor: pointer;
    accent-color: #5b8def;
  }
}

.btn-reset,
.btn-rebuild {
  width: 100%;
  margin-top: 8px;
  padding: 6px 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: opacity 0.2s;
}

.btn-reset {
  background: rgba(255, 255, 255, 0.1);
  color: #aaa;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.btn-rebuild {
  background: rgba(90, 140, 240, 0.3);
  color: #c8d6ff;

  &:hover {
    background: rgba(90, 140, 240, 0.5);
  }
}

/* ==================== 信息面板样式 ==================== */
.info-panel {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(10, 10, 30, 0.8);
  border: 1px solid rgba(100, 140, 255, 0.25);
  border-radius: 8px;
  padding: 8px 18px;
  z-index: 10;
  pointer-events: none;

  p {
    margin: 0;
    color: #8ab4f8;
    font-size: 13px;
  }
}
</style>