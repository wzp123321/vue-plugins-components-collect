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
import { ref } from 'vue';
import {
  BufferGeometry,
  BufferAttribute,
  Points,
  PointsMaterial,
  AdditiveBlending,
} from 'three';
import { useThreeScene, type ThreeSceneContext } from '../shared/useThreeScene';

/*
 * 模块：Three.js 粒子银河系 (Particle Galaxy)
 * 知识点：BufferGeometry 自定义顶点、对数螺旋臂、BufferAttribute 逐顶点着色、
 *        AdditiveBlending 叠加混合、PointsMaterial、OrbitControls、实时重建。
 *        （renderer / 相机 / 控制器 / resize / 销毁等基建已由 useThreeScene 统一处理）
 */

interface GalaxyParams {
  speed: number;
  count: number;
  size: number;
  radius: number;
  arms: number;
}

interface ParticleAttribute {
  position: Float32Array;
  color: Float32Array;
}

const canvasRef = ref<HTMLDivElement | null>(null);
const infoText = ref('');
const controlParams = ref<GalaxyParams>({
  speed: 0.5,
  count: 15000,
  size: 1.5,
  radius: 18,
  arms: 3,
});

let ctx3d: ThreeSceneContext | null = null;
let galaxyPoints: Points | null = null;
let galaxyGeometry: BufferGeometry | null = null;
let galaxyMaterial: PointsMaterial | null = null;
let scheduledRebuild = false;

const formatNumber = (n: number): string => (n >= 10000 ? `${(n / 10000).toFixed(1)}万` : `${n}`);

/**
 * 生成对数螺旋臂的粒子坐标和颜色。
 * 对数螺旋极坐标方程：r(θ) = a * e^(b * θ)，并在每个粒子位置加入随机扰动。
 */
const generateGalaxyParticles = (count: number, arms: number, maxRadius: number): ParticleAttribute => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const spiralTightness = 0.45;
  const randomness = 0.35;
  const innerEdge = maxRadius * 0.06;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const armIndex = i % arms;
    const armOffset = (armIndex / arms) * Math.PI * 2;

    const r = innerEdge + Math.random() ** 0.5 * (maxRadius - innerEdge);
    const theta = r * spiralTightness * (Math.random() * 0.6 + 0.7) + armOffset;

    const randomX = (Math.random() - 0.5) * randomness * 3;
    const randomY = (Math.random() - 0.5) * randomness * 0.6;
    const randomZ = (Math.random() - 0.5) * randomness * 3;

    positions[i3] = Math.cos(theta) * r + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(theta) * r + randomZ;

    const distanceRatio = r / maxRadius;
    const red = 1.0 - distanceRatio * 0.7;
    const green = 1.0 - Math.abs(distanceRatio - 0.3) * 1.2;
    const blue = 0.2 + distanceRatio * 0.8;

    colors[i3] = Math.max(0, Math.min(1, red));
    colors[i3 + 1] = Math.max(0, Math.min(1, green));
    colors[i3 + 2] = Math.max(0, Math.min(1, blue));
  }

  return { position: positions, color: colors };
}

const buildGalaxyGeometry = (attrs: ParticleAttribute): BufferGeometry => {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(attrs.position, 3));
  geometry.setAttribute('color', new BufferAttribute(attrs.color, 3));
  return geometry;
}

const buildGalaxy = () => {
  if (!ctx3d) return;
  const scene = ctx3d.scene;

  // 销毁旧 Points 以免内存泄漏
  if (galaxyPoints) {
    scene.remove(galaxyPoints);
    galaxyGeometry?.dispose();
    galaxyMaterial?.dispose();
  }

  const { count, arms, radius, size } = controlParams.value;
  galaxyGeometry = buildGalaxyGeometry(generateGalaxyParticles(count, arms, radius));
  galaxyMaterial = new PointsMaterial({
    size,
    blending: AdditiveBlending,
    depthWrite: false,
    vertexColors: true,
    sizeAttenuation: true,
  });
  galaxyPoints = new Points(galaxyGeometry, galaxyMaterial);
  galaxyPoints.rotation.x = Math.PI * 0.15;
  scene.add(galaxyPoints);

  infoText.value = `粒子数: ${formatNumber(count)} · 螺旋臂: ${arms} · 半径: ${radius}`;
}

const resetParams = () => {
  controlParams.value = { speed: 0.5, count: 15000, size: 1.5, radius: 18, arms: 3 };
  scheduledRebuild = true;
}

const rebuildGalaxy = () => {
  scheduledRebuild = true;
}

useThreeScene({
  containerRef: canvasRef,
  background: 0x050510,
  alpha: true,
  camera: { fov: 60, position: [0, 12, 22] },
  controls: { autoRotate: false, minDistance: 5, maxDistance: 50 },
  onInit: (ctx) => {
    ctx3d = ctx;
    buildGalaxy();
  },
  onFrame: (_ctx, delta) => {
    if (galaxyPoints) {
      galaxyPoints.rotation.y += delta * controlParams.value.speed * 0.5;
    }
    if (scheduledRebuild) {
      scheduledRebuild = false;
      buildGalaxy();
    }
  },
});
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
  border-radius: var(--ai-radius-sm);
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
