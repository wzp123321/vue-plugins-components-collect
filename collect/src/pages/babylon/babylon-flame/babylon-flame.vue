<template>
  <div class="babylon-flame">
    <!-- ==================== 3D 渲染 Canvas ==================== -->
    <canvas id="babylon-flame-canvas" ref="canvasRef"></canvas>

    <!-- ==================== 实时控制面板 ==================== -->
    <div class="control-panel">
      <h4 class="panel-title">🔥 粒子火焰控制</h4>
      <div class="control-item">
        <label>火焰发射率: <span>{{ formatNum(flameEmitRate) }}/s</span></label>
        <input type="range" v-model.number="flameEmitRate" min="20" max="500" step="10" />
      </div>
      <div class="control-item">
        <label>火焰大小: <span>{{ flameSize.toFixed(2) }}</span></label>
        <input type="range" v-model.number="flameSize" min="0.1" max="3" step="0.1" />
      </div>
      <div class="control-item">
        <label>火焰速度: <span>{{ flameSpeed.toFixed(2) }}</span></label>
        <input type="range" v-model.number="flameSpeed" min="0.5" max="5" step="0.1" />
      </div>
      <div class="control-item">
        <label>烟雾发射率: <span>{{ formatNum(smokeEmitRate) }}/s</span></label>
        <input type="range" v-model.number="smokeEmitRate" min="0" max="100" step="5" />
      </div>
      <div class="control-item">
        <label>火花发射率: <span>{{ formatNum(sparkEmitRate) }}/s</span></label>
        <input type="range" v-model.number="sparkEmitRate" min="0" max="50" step="5" />
      </div>
      <div class="control-item">
        <label>扰动强度: <span>{{ turbulence.toFixed(1) }}</span></label>
        <input type="range" v-model.number="turbulence" min="0" max="10" step="0.5" />
      </div>
      <button class="btn-reset" @click="resetParams">重置默认</button>
    </div>

    <!-- ==================== 日志面板 ==================== -->
    <div class="log-panel" ref="logPanelRef">
      <p v-for="(line, idx) in logLines" :key="idx">{{ line }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, reactive, watch } from 'vue'
import * as BABYLON from 'babylonjs'

/*
 * ========================================================================
 *  模块：Babylon.js 粒子火焰特效 (Particle Flame System)
 *  核心知识点：
 *    1. ParticleSystem —— Babylon 内置粒子系统，高性能，配置驱动
 *    2. 多层粒子叠加 —— 火焰内核 + 外焰 + 烟雾 + 火花，分层丰富视觉效果
 *    3. ColorGradient —— 粒子生命周期的颜色渐变 (出生→死亡)
 *    4. SizeGradient —— 粒子生命周期的大小渐变 (小→大→消失)
 *    5. Emitter —— 粒子发射源，可以是任意 Mesh 或 Vector3 点
 *    6. Custom 粒子纹理 —— 用 Canvas 2D API 生成圆形渐变纹理
 *    7. NoiseTexture (procedural) —— 程序化噪声纹理制造扰动效果 (turbulence)
 *    8. 实时参数调整 —— Vue 响应式数据驱动粒子系统属性更新
 *    9. BlendMode —— 粒子与场景的混合模式 (加法/标准/乘法)
 * ========================================================================
 */

// ---------- 响应式参数 ----------

const flameEmitRate = ref(200)
const flameSize = ref(0.8)
const flameSpeed = ref(1.5)
const smokeEmitRate = ref(40)
const sparkEmitRate = ref(20)
const turbulence = ref(3.0)
const logLines = ref<string[]>([])

const canvasRef = ref<HTMLCanvasElement | null>(null)
const logPanelRef = ref<HTMLDivElement | null>(null)

// ---------- 全局变量 ----------

let engine: BABYLON.Engine | null = null
let scene: BABYLON.Scene | null = null
let camera: BABYLON.ArcRotateCamera | null = null

// 粒子系统
let flameCoreSystem: BABYLON.ParticleSystem | null = null
let flameOuterSystem: BABYLON.ParticleSystem | null = null
let smokeSystem: BABYLON.ParticleSystem | null = null
let sparkSystem: BABYLON.ParticleSystem | null = null

// 发射源
let emitter: BABYLON.Mesh | null = null

// ---------- 工具函数 ----------

function formatNum(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`
}

function addLog(msg: string) {
  const timestamp = new Date().toLocaleTimeString()
  const line = `[${timestamp}] ${msg}`
  console.log(line)
  logLines.value.push(line)
  // 只保留最近 20 行
  if (logLines.value.length > 20) {
    logLines.value.shift()
  }
  // 自动滚动到底部
  if (logPanelRef.value) {
    setTimeout(() => {
      logPanelRef.value!.scrollTop = logPanelRef.value!.scrollHeight
    }, 50)
  }
}

// ---------- Canvas 2D 生成粒子纹理 ----------

/**
 * 用 Canvas 2D API 生成圆形渐变纹理，用于粒子贴图
 *
 * 径向渐变 (radialGradient): 中心亮白 → 边缘透明
 * 这比纯色矩形看起来更像火苗/光点
 *
 * @param size 画布尺寸
 * @param innerAlpha 中心透明度 (0-1)
 * @returns 生成纹理的 data URL
 */
function createGlowTexture(size: number, innerAlpha: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // 径向渐变：从中心到边缘
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)

  // 内圈：白色高亮
  gradient.addColorStop(0, `rgba(255, 255, 255, ${innerAlpha})`)
  // 中圈：过渡到半透明
  gradient.addColorStop(0.3, `rgba(255, 220, 150, ${innerAlpha * 0.7})`)
  // 外圈：完全透明 (平滑边缘)
  gradient.addColorStop(0.7, `rgba(255, 100, 20, ${innerAlpha * 0.1})`)
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  return canvas.toDataURL('image/png')
}

// ---------- 构建火焰内核粒子系统 ----------

/**
 * 火焰内核：最亮的黄白色火焰粒子，位于中心
 * - 高发射率，小尺寸，短寿命
 * - 颜色从亮白渐变到橙色再到透明
 * - 上升速度快
 */
function createFlameCore(): BABYLON.ParticleSystem {
  addLog('创建火焰内核粒子系统...')

  const system = new BABYLON.ParticleSystem('flameCore', 2000, scene!)
  const glowTexture = createGlowTexture(64, 0.9)

  // ---- 粒子纹理 ----
  system.particleTexture = new BABYLON.Texture(glowTexture, scene!)
  system.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD // 加法混合：叠加区域更亮
  addLog('  纹理: 径向渐变圆形, blendMode=ADD')

  // ---- 发射器位置 ----
  // 从场景原点发射
  system.emitter = new BABYLON.Vector3(0, 1, 0)
  system.minEmitBox = new BABYLON.Vector3(-0.2, 0, -0.2) // X/Y/Z 的发射范围下限
  system.maxEmitBox = new BABYLON.Vector3(0.2, 0, 0.2) // X/Y/Z 的发射范围上限
  // 所以粒子在 (-0.2, 0, -0.2) 到 (0.2, 0, 0.2) 的区域内随机发射
  addLog('  发射位置: Vector3(0,1,0), emitBox=±0.2')

  // ---- 粒子数量 ----
  system.emitRate = flameEmitRate.value
  addLog(`  初始发射率: ${flameEmitRate.value}/s`)

  // ---- 生命周期 ----
  system.minLifeTime = 0.3 // 最小存活时间（秒）
  system.maxLifeTime = 0.8 // 最大存活时间（秒）
  addLog('  生命周期: 0.3~0.8s')

  // ---- 粒子大小 ----
  system.minSize = 0.1
  system.maxSize = flameSize.value
  addLog(`  大小: 0.1~${flameSize.value}`)

  // ---- 粒子速度 ----
  // 方向：主要向上 (Y)，X/Z 方向随机微扰
  system.direction1 = new BABYLON.Vector3(-0.3, flameSpeed.value, -0.3)
  system.direction2 = new BABYLON.Vector3(0.3, flameSpeed.value * 1.3, 0.3)
  addLog(`  方向范围: Y=${flameSpeed.value.toFixed(1)}~${(flameSpeed.value * 1.3).toFixed(1)}`)

  // ---- 颜色渐变 (生命周期) ----
  // ParticleSystem 支持 0~1 生命周期的颜色插值
  system.addColorGradient(0.0, new BABYLON.Color4(1, 1, 0.95, 1)) // 出生：亮白黄
  system.addColorGradient(0.3, new BABYLON.Color4(1, 0.7, 0.1, 0.9)) // 30%：橙色
  system.addColorGradient(0.7, new BABYLON.Color4(1, 0.2, 0, 0.5)) // 70%：红色半透明
  system.addColorGradient(1.0, new BABYLON.Color4(0.5, 0, 0, 0)) // 死亡：完全透明
  addLog('  颜色渐变: 亮白黄(0%)→橙(30%)→红(70%)→透明(100%)')

  // ---- 大小渐变 ----
  system.addSizeGradient(0.0, 0.3) // 出生：30% 最终大小
  system.addSizeGradient(0.2, 1.0) // 20%生命：达到最大
  system.addSizeGradient(0.6, 0.6) // 60%生命：开始缩小
  system.addSizeGradient(1.0, 0.1) // 死亡：几乎消失

  // ---- 重力 ----
  system.gravity = new BABYLON.Vector3(0, -1.5, 0) // 轻微向下重力，模拟冷却下沉

  addLog('火焰内核创建完成 ✅')
  return system
}

// ---------- 构建外焰粒子系统 ----------

/**
 * 外焰：扩散范围更大的红色/深橙色粒子
 * - 较低发射率，较大尺寸，中等寿命
 * - 颜色从红色渐变到暗红再到透明
 * - 更大的发射区域
 */
function createFlameOuter(): BABYLON.ParticleSystem {
  addLog('创建外焰粒子系统...')

  const system = new BABYLON.ParticleSystem('flameOuter', 1500, scene!)
  const glowTexture = createGlowTexture(64, 0.6)

  system.particleTexture = new BABYLON.Texture(glowTexture, scene!)
  system.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD

  system.emitter = new BABYLON.Vector3(0, 0.7, 0)
  system.minEmitBox = new BABYLON.Vector3(-0.4, -0.1, -0.4)
  system.maxEmitBox = new BABYLON.Vector3(0.4, 0.1, 0.4)

  system.emitRate = 100
  system.minLifeTime = 0.5
  system.maxLifeTime = 1.2

  system.minSize = 0.3
  system.maxSize = 1.5

  system.direction1 = new BABYLON.Vector3(-0.5, 2.0, -0.5)
  system.direction2 = new BABYLON.Vector3(0.5, 2.8, 0.5)

  system.addColorGradient(0.0, new BABYLON.Color4(1, 0.5, 0, 0.8))
  system.addColorGradient(0.4, new BABYLON.Color4(1, 0.1, 0, 0.6))
  system.addColorGradient(1.0, new BABYLON.Color4(0.3, 0, 0, 0))

  system.addSizeGradient(0.0, 0.5)
  system.addSizeGradient(0.3, 1.0)
  system.addSizeGradient(1.0, 0.2)

  system.gravity = new BABYLON.Vector3(0, -2.0, 0)

  addLog('外焰创建完成 ✅')
  return system
}

// ---------- 构建烟雾粒子系统 ----------

/**
 * 烟雾：深灰色粒子，缓慢上升，大范围扩散
 * - 低发射率，大尺寸，长寿命
 * - 标准混合模式（非加法）
 * - 模拟火焰上方的烟雾/灰烬
 */
function createSmoke(): BABYLON.ParticleSystem {
  addLog('创建烟雾粒子系统...')

  const system = new BABYLON.ParticleSystem('smoke', 500, scene!)
  // 烟雾用更柔和的纹理
  const smokeTexture = createGlowTexture(128, 0.4)
  system.particleTexture = new BABYLON.Texture(smokeTexture, scene!)
  system.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD // 标准混合（烟雾不发光）

  // 烟雾在火焰上方区域发射
  system.emitter = new BABYLON.Vector3(0, 2.5, 0)
  system.minEmitBox = new BABYLON.Vector3(-0.6, -0.3, -0.6)
  system.maxEmitBox = new BABYLON.Vector3(0.6, 0.3, 0.6)

  system.emitRate = smokeEmitRate.value

  system.minLifeTime = 1.5
  system.maxLifeTime = 3.0

  system.minSize = 0.5
  system.maxSize = 2.5

  // 烟雾主要上升，水平扩散较大
  system.direction1 = new BABYLON.Vector3(-0.8, 1.5, -0.8)
  system.direction2 = new BABYLON.Vector3(0.8, 2.0, 0.8)

  system.addColorGradient(0.0, new BABYLON.Color4(0.3, 0.3, 0.35, 0.6))
  system.addColorGradient(0.5, new BABYLON.Color4(0.15, 0.15, 0.2, 0.4))
  system.addColorGradient(1.0, new BABYLON.Color4(0.05, 0.05, 0.1, 0))

  system.addSizeGradient(0.0, 0.3)
  system.addSizeGradient(0.4, 1.0)
  system.addSizeGradient(1.0, 0.1)

  system.gravity = new BABYLON.Vector3(0, -0.3, 0) // 烟雾受轻微上升力

  addLog('烟雾创建完成 ✅')
  return system
}

// ---------- 构建火花粒子系统 ----------

/**
 * 火花：小而亮的白色粒子，随机方向飞溅
 * - 低发射率，极小尺寸，极短寿命
 * - 高速随机方向
 * - 加法混合，非常亮
 */
function createSparks(): BABYLON.ParticleSystem {
  addLog('创建火花粒子系统...')

  const system = new BABYLON.ParticleSystem('sparks', 300, scene!)
  const sparkTexture = createGlowTexture(16, 1.0)
  system.particleTexture = new BABYLON.Texture(sparkTexture, scene!)
  system.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD

  system.emitter = new BABYLON.Vector3(0, 1.2, 0)
  system.minEmitBox = new BABYLON.Vector3(-0.15, -0.1, -0.15)
  system.maxEmitBox = new BABYLON.Vector3(0.15, 0.15, 0.15)

  system.emitRate = sparkEmitRate.value

  system.minLifeTime = 0.15
  system.maxLifeTime = 0.4

  system.minSize = 0.05
  system.maxSize = 0.15

  // 火花=全方向随机飞溅
  system.direction1 = new BABYLON.Vector3(-3, 4, -3)
  system.direction2 = new BABYLON.Vector3(3, 8, 3)

  system.addColorGradient(0.0, new BABYLON.Color4(1, 1, 0.8, 1))
  system.addColorGradient(0.5, new BABYLON.Color4(1, 0.6, 0.1, 0.8))
  system.addColorGradient(1.0, new BABYLON.Color4(0.5, 0.1, 0, 0))

  system.addSizeGradient(0.0, 1.0)
  system.addSizeGradient(0.3, 0.6)
  system.addSizeGradient(1.0, 0.05)

  system.gravity = new BABYLON.Vector3(0, -5, 0) // 火花受重力下落

  addLog('火花创建完成 ✅')
  return system
}

// ---------- 构建场景 ----------

function createScene() {
  addLog('======== 构建火焰粒子场景 ========')

  // ---- 引擎 ----
  engine = new BABYLON.Engine(canvasRef.value as HTMLCanvasElement, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  })
  addLog(`引擎创建: ${engine.isWebGPU ? 'WebGPU' : 'WebGL'}`)

  // ---- 场景 ----
  scene = new BABYLON.Scene(engine)
  scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.1, 1.0) // 深色背景，突出火焰亮度
  addLog('场景创建，背景色: 深蓝黑色')

  // ---- 相机 ----
  // ArcRotateCamera: 绕着目标点旋转的相机（最常用）
  // Alpha=角度, Beta=仰角, Radius=距离
  camera = new BABYLON.ArcRotateCamera('camera', Math.PI / 2, Math.PI / 3, 12, BABYLON.Vector3.Zero(), scene)
  camera.lowerRadiusLimit = 4 // 最小缩放距离
  camera.upperRadiusLimit = 25 // 最大缩放距离
  camera.upperBetaLimit = Math.PI / 2.2 // 限制仰角（不翻到底部）
  camera.attachControl(canvasRef.value, true)
  addLog(`相机: ArcRotateCamera, alpha=π/2, beta=π/3, radius=12`)

  // ---- 地面 (提供深度参照) ----
  const ground = BABYLON.MeshBuilder.CreateGround(
    'ground',
    { width: 20, height: 20 },
    scene
  )
  const groundMat = new BABYLON.StandardMaterial('groundMat', scene)
  groundMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.2)
  groundMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.1)
  ground.material = groundMat
  ground.position.y = -2
  addLog('地面创建: 20x20, y=-2')

  // ---- 火焰木堆 (发射源底座) ----
  // 用几个圆柱体和立方体搭建一个简单的篝火木堆
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2
    const log = BABYLON.MeshBuilder.CreateCylinder(
      `log_${i}`,
      { height: 1.5, diameter: 0.15 },
      scene
    )
    const logMat = new BABYLON.StandardMaterial(`logMat_${i}`, scene)
    logMat.diffuseColor = new BABYLON.Color3(0.3, 0.15, 0.05)
    log.material = logMat

    // 木头倾斜放置，形成锥形堆
    log.position.set(Math.cos(angle) * 0.3, 0.2, Math.sin(angle) * 0.3)
    log.rotation.z = Math.cos(angle) * 0.5
    log.rotation.x = Math.sin(angle) * 0.5
  }
  addLog('篝火木堆创建: 5 根木棍')

  // ---- 灯光 ----
  // 半球光：模拟天空/地面环境光
  const hemiLight = new BABYLON.HemisphericLight(
    'hemiLight',
    new BABYLON.Vector3(0, 1, 0),
    scene
  )
  hemiLight.diffuse = new BABYLON.Color3(0.3, 0.3, 0.4)
  hemiLight.groundColor = new BABYLON.Color3(0.1, 0.05, 0.02)
  hemiLight.intensity = 0.5
  addLog('环境光添加: HemisphericLight, intensity=0.5')

  // ---- 创建粒子系统 ----
  flameCoreSystem = createFlameCore()
  flameOuterSystem = createFlameOuter()
  smokeSystem = createSmoke()
  sparkSystem = createSparks()

  addLog('======== 场景构建完成，启动渲染循环 ========')
  addLog(`场景信息: 网格数=${scene.meshes.length}, 材质数=${scene.materials.length}`)
}

// ---------- 粒子参数更新 ----------

function updateFlameParams() {
  if (!flameCoreSystem || !flameOuterSystem || !smokeSystem || !sparkSystem) return

  // 火焰内核
  flameCoreSystem.emitRate = flameEmitRate.value
  flameCoreSystem.minSize = flameSize.value * 0.1
  flameCoreSystem.maxSize = flameSize.value
  flameCoreSystem.direction1 = new BABYLON.Vector3(-0.3, flameSpeed.value, -0.3)
  flameCoreSystem.direction2 = new BABYLON.Vector3(0.3, flameSpeed.value * 1.3, 0.3)

  // 外焰
  flameOuterSystem.emitRate = flameEmitRate.value * 0.5
  flameOuterSystem.minSize = flameSize.value * 0.3
  flameOuterSystem.maxSize = flameSize.value * 1.5
  flameOuterSystem.direction1 = new BABYLON.Vector3(-0.5, flameSpeed.value * 1.2, -0.5)
  flameOuterSystem.direction2 = new BABYLON.Vector3(0.5, flameSpeed.value * 1.8, 0.5)

  // 烟雾
  smokeSystem.emitRate = smokeEmitRate.value

  // 火花
  sparkSystem.emitRate = sparkEmitRate.value

  // 所有粒子系统应用扰动
  ;[flameCoreSystem, flameOuterSystem, smokeSystem, sparkSystem].forEach((sys) => {
    // 用 procedurals 噪声纹理制造上升粒子的随机扰动效果
    if (sys.noiseTexture) {
      sys.noiseTexture.dispose()
    }
    if (turbulence.value > 0) {
      const noiseTex = new BABYLON.NoiseProceduralTexture('noise', 256, scene!)
      noiseTex.brightness = turbulence.value * 0.1
      noiseTex.octaves = 3
      sys.noiseTexture = noiseTex
      sys.noiseStrength = new BABYLON.Vector3(turbulence.value * 0.5, turbulence.value * 0.3, turbulence.value * 0.5)
    }
  })
}

// 监听参数变化（使用 watch，每次滑块变化都实时更新）
watch([flameEmitRate, flameSize, flameSpeed, smokeEmitRate, sparkEmitRate, turbulence], () => {
  updateFlameParams()
})

function resetParams() {
  flameEmitRate.value = 200
  flameSize.value = 0.8
  flameSpeed.value = 1.5
  smokeEmitRate.value = 40
  sparkEmitRate.value = 20
  turbulence.value = 3
  addLog('参数已重置为默认值')
  updateFlameParams()
}

// ---------- 渲染循环 ----------

function runRenderLoop() {
  engine!.runRenderLoop(() => {
    scene!.render()
  })
}

function onResize() {
  engine?.resize()
}

// ---------- 生命周期 ----------

onMounted(() => {
  addLog('组件挂载，初始化 Babylon.js...')
  createScene()
  updateFlameParams()
  runRenderLoop()
  window.addEventListener('resize', onResize)
  addLog('✅ 火焰粒子系统就绪！使用右侧面板调整参数')
})

onUnmounted(() => {
  addLog('组件卸载，清理资源...')

  // 停止渲染循环
  engine?.stopRenderLoop()

  // 销毁粒子系统（自动释放 GPU 资源）
  flameCoreSystem?.dispose()
  flameOuterSystem?.dispose()
  smokeSystem?.dispose()
  sparkSystem?.dispose()

  // 销毁场景
  scene?.dispose()
  engine?.dispose()

  window.removeEventListener('resize', onResize)
  addLog('所有资源已清理')
})
</script>

<style scoped lang="less">
.babylon-flame {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  canvas {
    width: 100%;
    height: 100%;
    outline: none;
  }
}

/* ==================== 控制面板 ==================== */
.control-panel {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 220px;
  background: rgba(20, 10, 5, 0.9);
  border: 1px solid rgba(255, 120, 40, 0.35);
  border-radius: 10px;
  padding: 14px;
  color: #ffdbb5;
  font-size: 12px;
  backdrop-filter: blur(8px);
  z-index: 10;
  user-select: none;
}

.panel-title {
  margin: 0 0 10px;
  font-size: 15px;
  color: #ff9d4d;
  text-align: center;
  letter-spacing: 1px;
}

.control-item {
  margin-bottom: 8px;

  label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;

    span {
      color: #ffcc80;
      font-weight: bold;
    }
  }

  input[type='range'] {
    width: 100%;
    height: 4px;
    cursor: pointer;
    accent-color: #ff6a2e;
  }
}

.btn-reset {
  width: 100%;
  margin-top: 6px;
  padding: 6px 0;
  border: none;
  border-radius: 6px;
  background: rgba(255, 120, 40, 0.2);
  color: #ffdbb5;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 120, 40, 0.4);
  }
}

/* ==================== 日志面板 ==================== */
.log-panel {
  position: absolute;
  bottom: 16px;
  left: 16px;
  width: 320px;
  max-height: 160px;
  overflow-y: auto;
  background: rgba(10, 5, 5, 0.85);
  border: 1px solid rgba(255, 120, 40, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  z-index: 10;
  font-size: 11px;
  font-family: 'Consolas', 'Courier New', monospace;
  scroll-behavior: smooth;

  p {
    margin: 1px 0;
    color: #cc9966;
    line-height: 1.5;
  }
}
</style>