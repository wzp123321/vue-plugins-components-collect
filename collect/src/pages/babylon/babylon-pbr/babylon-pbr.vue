<template>
  <div class="babylon-pbr">
    <!-- ==================== 3D 渲染 Canvas ==================== -->
    <canvas id="babylon-pbr-canvas" ref="canvasRef"></canvas>

    <!-- ==================== 材质样例面板 ==================== -->
    <div class="material-panel">
      <h4 class="panel-title">🪩 PBR 材质样例</h4>
      <div class="material-legend">
        <div class="legend-item">
          <span class="legend-dot" style="background: #c0c0c0"></span>
          <span>金属球 (metallic=1, rough=0.1)</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: #d4a574"></span>
          <span>铜球 (metallic=0.9, rough=0.2)</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: #ffd700"></span>
          <span>金球 (metallic=1, rough=0.05)</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: #666"></span>
          <span>粗糙金属 (metallic=0.8, rough=0.9)</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: #2ecc71"></span>
          <span>塑料球 (metallic=0, rough=0.2)</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: #3498db"></span>
          <span>玻璃球 (rough=0, alpha=0.3)</span>
        </div>
      </div>
    </div>

    <!-- ==================== 日志面板 ==================== -->
    <div class="log-panel" ref="logPanelRef">
      <p v-for="(line, idx) in logLines" :key="idx">{{ line }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import * as BABYLON from 'babylonjs';

/*
 * ========================================================================
 *  模块：Babylon.js PBR 材质场景 (Physically Based Rendering Demo)
 *  核心知识点：
 *    1. PBRMaterial —— 基于物理的渲染材质
 *       - metallic (金属度): 0=绝缘体, 1=纯金属
 *       - roughness (粗糙度): 0=镜面, 1=完全漫反射
 *       - microSurface (微表面): 控制反射的微观光滑度
 *       - indexOfRefraction (折射率): 控制非金属的反射率
 *    2. ShadowGenerator —— 实时阴影映射
 *       - mapSize: 阴影贴图分辨率
 *       - useBlurExponentialShadowMap: 柔和阴影算法
 *       - bias: 阴影偏移，避免"阴影痤疮"
 *    3. ReflectionProbe —— 反射探针
 *       - 从指定位置渲染立方体贴图，用于反射
 *       - 按需刷新（renderList 决定哪些物体参与反射计算）
 *    4. Skybox —— 天空盒 (inside-out Box + CubeTexture)
 *    5. ImageBasedLighting (IBL) —— 基于图像的照明
 *       - 使用 HDR 环境贴图提供间接光照
 *    6. 多材质对比展示 —— 6 个球体用不同 metallic/roughness 参数
 * ========================================================================
 */

// ---------- 响应式状态 ----------

const logLines = ref<string[]>([]);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const logPanelRef = ref<HTMLDivElement | null>(null);

// ---------- 全局变量 ----------

let engine: BABYLON.Engine | null = null;
let scene: BABYLON.Scene | null = null;
let camera: BABYLON.ArcRotateCamera | null = null;
let shadowGenerator: BABYLON.ShadowGenerator | null = null;

// ---------- 工具函数 ----------

function addLog(msg: string) {
  const timestamp = new Date().toLocaleTimeString();
  const line = `[${timestamp}] ${msg}`;
  console.log(line);
  logLines.value.push(line);
  if (logLines.value.length > 30) {
    logLines.value.shift();
  }
  setTimeout(() => {
    if (logPanelRef.value) {
      logPanelRef.value.scrollTop = logPanelRef.value.scrollHeight;
    }
  }, 50);
}

// ---------- 创建天空盒 ----------

/**
 * 天空盒 (Skybox): 用一个巨大的立方体，内部渲染天空纹理
 *
 * Babylon.js 默认渲染立方体外表面，但天空盒需要渲染内表面。
 * 通过设置 sideOrientation = BACK 来实现内外翻转。
 *
 * 这里使用渐变颜色替代纹理，因为没有天空贴图资源。
 */
function createSkybox() {
  addLog('创建天空盒...');

  const skybox = BABYLON.MeshBuilder.CreateBox(
    'skybox',
    { size: 100 }, // 足够大，包围整个场景
    scene!,
  );

  const skyboxMat = new BABYLON.StandardMaterial('skyboxMat', scene!);
  skyboxMat.backFaceCulling = false; // 关闭背面剔除，让内表面可见
  skyboxMat.disableLighting = true; // 天空盒不受场景光照影响

  // 使用 CubeTexture 程序化生成天空颜色
  // 顶部偏蓝，底部偏灰（模拟地平线）
  skyboxMat.reflectionTexture = new BABYLON.CubeTexture(
    // 传入空字符串或 6 个面的颜色信息
    // 这里我们用 emissiveColor + diffuseColor 的组合
    '',
    scene!,
  );
  // 简化方案：用顶底颜色渐变
  skyboxMat.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.9);
  skyboxMat.emissiveColor = new BABYLON.Color3(0.3, 0.5, 0.9);
  skyboxMat.specularColor = BABYLON.Color3.Black();

  skybox.material = skyboxMat;
  skybox.infiniteDistance = true; // 天空盒不随相机移动（始终在远处）

  addLog('天空盒创建完成: 100x100 立方体, infiniteDistance=true');
  return skybox;
}

// ---------- 创建 PBR 材质球体 ----------

interface PBRSphereConfig {
  name: string;
  position: BABYLON.Vector3;
  metallic: number;
  roughness: number;
  baseColor: BABYLON.Color3;
  indexOfRefraction?: number; // 折射率 (IOR)
  alpha?: number; // 透明度 (用于玻璃效果)
}

/**
 * 创建一组 PBR 材质球体，展示不同的 metallic/roughness 参数效果
 *
 * PBR 材质核心参数：
 * - metallic (0~1): 金属度。0=绝缘体/塑料，1=纯金属
 *   - 金属的反射颜色由其 baseColor 决定
 *   - 非金属的反射颜色由 indexOfRefraction 决定
 * - roughness (0~1): 粗糙度。0=完美镜面，1=完全漫反射
 *   - 粗糙表面不会有清晰的反射
 *   - 光滑表面像镜子
 */
function createPBRSpheres() {
  addLog('======== 创建 PBR 材质球体 ========');

  const configs: PBRSphereConfig[] = [
    {
      name: '镜面金属球',
      position: new BABYLON.Vector3(-3, 1, -2),
      metallic: 1.0,
      roughness: 0.1,
      baseColor: new BABYLON.Color3(0.75, 0.75, 0.78),
      indexOfRefraction: 0.66,
    },
    {
      name: '铜球',
      position: new BABYLON.Vector3(-1, 1, -3),
      metallic: 0.9,
      roughness: 0.2,
      baseColor: new BABYLON.Color3(0.83, 0.65, 0.45),
      indexOfRefraction: 0.66,
    },
    {
      name: '金球',
      position: new BABYLON.Vector3(1, 1, -3),
      metallic: 1.0,
      roughness: 0.05,
      baseColor: new BABYLON.Color3(1.0, 0.84, 0.0),
      indexOfRefraction: 0.66,
    },
    {
      name: '粗糙金属球',
      position: new BABYLON.Vector3(3, 1, -2),
      metallic: 0.8,
      roughness: 0.9,
      baseColor: new BABYLON.Color3(0.4, 0.4, 0.45),
      indexOfRefraction: 0.66,
    },
    {
      name: '塑料球',
      position: new BABYLON.Vector3(-2, 1, 2),
      metallic: 0.0,
      roughness: 0.2,
      baseColor: new BABYLON.Color3(0.18, 0.8, 0.44),
      indexOfRefraction: 0.66,
    },
    {
      name: '玻璃球',
      position: new BABYLON.Vector3(2, 1, 2),
      metallic: 0.0,
      roughness: 0.0,
      baseColor: new BABYLON.Color3(0.2, 0.6, 0.85),
      indexOfRefraction: 1.5,
      alpha: 0.3,
    },
  ];

  const spheres: BABYLON.Mesh[] = [];

  configs.forEach((cfg) => {
    const sphere = BABYLON.MeshBuilder.CreateSphere(cfg.name, { diameter: 1.2, segments: 64 }, scene!);
    sphere.position.copyFrom(cfg.position);

    const mat = new BABYLON.PBRMaterial(`pbr_${cfg.name}`, scene!);
    mat.metallic = cfg.metallic;
    mat.roughness = cfg.roughness;
    mat.albedoColor = cfg.baseColor;
    mat.indexOfRefraction = cfg.indexOfRefraction ?? 0.66;

    // IOR 参考值：
    //   0.66 → 非金属标准反射率 (~4%)
    //   1.5  → 玻璃
    //   2.4  → 钻石

    if (cfg.alpha !== undefined) {
      mat.alpha = cfg.alpha;
      mat.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND;
    }

    sphere.material = mat;
    // 使球体投射阴影
    shadowGenerator?.addShadowCaster(sphere);
    sphere.receiveShadows = true;

    spheres.push(sphere);

    addLog(
      `PBR球体 "${cfg.name}": ` +
        `metallic=${cfg.metallic}, roughness=${cfg.roughness}, ` +
        `IOR=${mat.indexOfRefraction}` +
        (cfg.alpha !== undefined ? `, alpha=${cfg.alpha}` : ''),
    );
  });

  addLog(`PBR球体创建完成: ${spheres.length} 个, 各参数请参考右侧面板`);
  return spheres;
}

// ---------- 创建反射探针 ----------

/**
 * 反射探针 (ReflectionProbe):
 * 在指定位置渲染一个立方体贴图，用于周围物体的反射计算。
 *
 * 与实时屏幕空间反射 (SSR) 不同，探针是预先烘焙的立方体贴图，
 * 适合静态/半静态场景的反射。
 *
 * 这里创建 2 个探针覆盖不同区域，让物体反射更准确。
 */
// function createReflectionProbes() {
//   addLog('创建反射探针...');

//   // 探针 1: 覆盖左半侧球体
//   const probe1 = new BABYLON.ReflectionProbe(
//     'probeLeft',
//     256, // 每个面的分辨率
//     scene!,
//   );
//   probe1.position = new BABYLON.Vector3(-2, 1.5, 0);
//   // reflectionRefreshRate: 0=不自动刷新, 1=每帧刷新, 2=隔帧刷新
//   probe1.refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
//   addLog(`  反射探针1: position=(-2,1.5,0), resolution=256, auto-refresh`);

//   // 探针 2: 覆盖右半侧球体
//   const probe2 = new BABYLON.ReflectionProbe('probeRight', 256, scene!);
//   probe2.position = new BABYLON.Vector3(2, 1.5, 0);
//   probe2.refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
//   addLog(`  反射探针2: position=(2,1.5,0), resolution=256, auto-refresh`);

//   // 手动触发一次渲染来烘焙探针内容
//   // 在一小段延迟后触发，确保场景渲染完毕
//   setTimeout(() => {
//     // probe1.renderList = scene!.meshes.filter((m) => m.name !== 'skybox')
//     // probe2.renderList = scene!.meshes.filter((m) => m.name !== 'skybox')
//     addLog('反射探针渲染列表已设置，烘焙中...');

//     // 将探针应用到所有 PBR 球体的反射
//     scene!.meshes.forEach((mesh) => {
//       const mat = mesh.material as BABYLON.PBRMaterial;
//       if (mat && mat instanceof BABYLON.PBRMaterial) {
//         // 根据球体位置选择最近的探针
//         const dist1 = BABYLON.Vector3.Distance(mesh.position, probe1.position);
//         const dist2 = BABYLON.Vector3.Distance(mesh.position, probe2.position);
//         mat.reflectionTexture = dist1 < dist2 ? probe1.cubeTexture : probe2.cubeTexture;
//       }
//     });
//     addLog('反射探针已绑定到各 PBR 材质');
//   }, 300);

//   return [probe1, probe2];
// }

// ---------- 构建场景 ----------

function createScene() {
  addLog('======== 构建 PBR 材质演示场景 ========');

  // ---- 引擎 ----
  engine = new BABYLON.Engine(canvasRef.value as HTMLCanvasElement, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });
  addLog(`引擎创建: WebGL`);

  // ---- 场景 ----
  scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.08, 0.08, 0.15, 1.0);
  addLog('场景创建，背景色: 深黑蓝');

  // ---- 相机 ----
  camera = new BABYLON.ArcRotateCamera(
    'camera',
    Math.PI / 4, // alpha: 绕Y轴角度
    Math.PI / 3, // beta: 仰角
    8, // radius: 距离
    BABYLON.Vector3.Zero(),
    scene,
  );
  camera.lowerRadiusLimit = 3;
  camera.upperRadiusLimit = 20;
  camera.upperBetaLimit = Math.PI / 2.1;
  camera.attachControl(canvasRef.value, true);
  addLog(`相机: ArcRotateCamera, alpha=π/4, beta=π/3, radius=8`);

  // ---- 天空盒 ----
  createSkybox();

  // ---- 地面 ----
  // 大的反射地面，展示阴影和反射
  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 30, height: 30 }, scene);
  const groundMat = new BABYLON.PBRMaterial('groundPBR', scene!);
  groundMat.metallic = 0.1;
  groundMat.roughness = 0.95;
  groundMat.albedoColor = new BABYLON.Color3(0.2, 0.22, 0.3);
  ground.material = groundMat;
  ground.receiveShadows = true;
  addLog('地面创建: 30x30 PBR材质, roughness=0.95');

  // ---- 中央展示台 ----
  // 一个圆形平台，球体分布在上面
  const platform = BABYLON.MeshBuilder.CreateCylinder(
    'platform',
    { height: 0.2, diameterTop: 4, diameterBottom: 4.5, tessellation: 64 },
    scene,
  );
  const platformMat = new BABYLON.PBRMaterial('platformPBR', scene!);
  platformMat.metallic = 0.3;
  platformMat.roughness = 0.4;
  platformMat.albedoColor = new BABYLON.Color3(0.25, 0.25, 0.3);
  platform.position.y = 0.1;
  platform.material = platformMat;
  shadowGenerator?.addShadowCaster(platform);
  platform.receiveShadows = true;
  addLog('展示台创建: 圆柱体, metallic=0.3, roughness=0.4');

  // ---- 灯光设置 (PBR 场景) ----
  // PBR 渲染需要良好的灯光才能展示材质特性

  // 1. 半球光：基础环境照明 + IBL 替代
  const hemiLight = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(0.3, 1, 0.3), scene);
  hemiLight.diffuse = new BABYLON.Color3(0.4, 0.45, 0.55);
  hemiLight.groundColor = new BABYLON.Color3(0.08, 0.06, 0.05);
  hemiLight.intensity = 0.6;
  addLog('半球光: 模拟天光/环境光, intensity=0.6');

  // 2. 方向光：主光源 + 阴影投射
  const dirLight = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(-2, -5, 3), scene);
  dirLight.diffuse = new BABYLON.Color3(0.9, 0.85, 0.7);
  dirLight.intensity = 1.2;

  // 创建阴影生成器
  shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
  shadowGenerator.useBlurExponentialShadowMap = true; // ES 柔和阴影
  shadowGenerator.blurKernel = 32; // 模糊核大小
  shadowGenerator.bias = 0.0001; // 阴影偏移，减少"阴影痤疮"
  shadowGenerator.darkness = 0.4; // 阴影暗度
  shadowGenerator.setTransparencyShadow(true); // 半透明物体也投射阴影

  addLog('方向光 + 阴影生成器: map=1024, ES柔和阴影, blurKernel=32, bias=0.0001');

  // ---- 创建 PBR 球体 ----
  const spheres = createPBRSpheres();

  // 将所有球体添加到阴影投射列表
  spheres.forEach((s) => shadowGenerator?.addShadowCaster(s));

  // ---- 创建反射探针 ----
  // const probes = createReflectionProbes();

  addLog('======== 场景构建完成 ========');
  addLog(`场景状态: 网格=${scene.meshes.length}, 材质=${scene.materials.length}, 灯光=${scene.lights.length}`);
  addLog('🖱️ 鼠标旋转查看不同角度的金属/粗糙度效果');
}

// ---------- 渲染循环 ----------

function runRenderLoop() {
  engine!.runRenderLoop(() => {
    scene!.render();
  });
}

function onResize() {
  engine?.resize();
}

// ---------- 生命周期 ----------

onMounted(() => {
  addLog('组件挂载，初始化 Babylon.js PBR 场景...');
  createScene();
  runRenderLoop();
  window.addEventListener('resize', onResize);
  addLog('✅ PBR 材质场景就绪！');
});

onUnmounted(() => {
  addLog('组件卸载，清理资源...');
  engine?.stopRenderLoop();
  shadowGenerator?.dispose();
  scene?.dispose();
  engine?.dispose();
  window.removeEventListener('resize', onResize);
  addLog('所有资源已清理');
});
</script>

<style scoped lang="less">
.babylon-pbr {
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

/* ==================== 材质面板 ==================== */
.material-panel {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(10, 10, 25, 0.88);
  border: 1px solid rgba(100, 180, 255, 0.3);
  border-radius: 10px;
  padding: 14px 18px;
  color: #aaccff;
  font-size: 12px;
  backdrop-filter: blur(8px);
  z-index: 10;
  user-select: none;
}

.panel-title {
  margin: 0 0 10px;
  font-size: 15px;
  color: #7eb8ff;
  text-align: center;
  letter-spacing: 1px;
}

.material-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ==================== 日志面板 ==================== */
.log-panel {
  position: absolute;
  bottom: 16px;
  left: 16px;
  width: 340px;
  max-height: 180px;
  overflow-y: auto;
  background: rgba(10, 10, 25, 0.85);
  border: 1px solid rgba(100, 180, 255, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  z-index: 10;
  font-size: 11px;
  font-family: 'Consolas', 'Courier New', monospace;
  scroll-behavior: smooth;

  p {
    margin: 1px 0;
    color: #7799bb;
    line-height: 1.5;
  }
}
</style>
