<template>
  <div class="threejs-sun" ref="containerRef">
    <!-- ==================== 信息面板 ==================== -->
    <div class="sun-info">
      <p class="sun-info__title">☀️ 太阳地球（Orbit）</p>
      <p>· 太阳：自发光材质 + 中心 <b>点光源</b></p>
      <p>· 地球：贴图球体，绕太阳 <b>公转</b> 并 <b>自转</b></p>
      <p>· 白色圆环为地球轨道轨迹</p>
    </div>
    <!-- ==================== 操作提示 ==================== -->
    <div class="sun-tip">🖱️ 拖拽旋转 · 滚轮缩放</div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import {
  Mesh,
  SphereGeometry,
  RingGeometry,
  MeshStandardMaterial,
  MeshBasicMaterial,
  PointLight,
  AmbientLight,
  TextureLoader,
  DoubleSide,
} from 'three';
import { useThreeScene } from '../shared/useThreeScene';
import { legacyIntensity } from '../shared/lighting';

/*
 * 模块：Three.js 太阳地球（太阳系最小模型）
 * 知识点：MeshStandardMaterial.emissive 自发光、PointLight 中心衰减光源、
 *        TextureLoader 贴图、公转 vs 自转、RingGeometry 轨道圆环。
 *        （renderer / 相机 / 控制器 / resize / 销毁等基建已由 useThreeScene 统一处理）
 */

const containerRef = ref<HTMLDivElement | null>(null);
const ORBIT_RADIUS = 5;
let earth: Mesh | null = null;

useThreeScene({
  containerRef,
  background: 0x05060f,
  camera: { fov: 50, position: [0, 6, 14], far: 200 },
  controls: { minDistance: 6, maxDistance: 60 },
  onInit: ({ scene }) => {
    scene.add(new AmbientLight(0x223044, legacyIntensity(0.4)));
    const sunLight = new PointLight(0xffffff, legacyIntensity(2.2), 0, 0.6);
    scene.add(sunLight);

    const sun = new Mesh(
      new SphereGeometry(2, 48, 48),
      new MeshStandardMaterial({
        color: 0xffcc33,
        emissive: 0xffaa00,
        emissiveIntensity: 1.1,
        roughness: 1,
      }),
    );
    scene.add(sun);

    const loader = new TextureLoader();
    const base = '../../../assets/images/textures/planets/';
    const earthMat = new MeshStandardMaterial({
      map: loader.load(new URL(`${base}earth_atmos_2048.jpg`, import.meta.url).href),
      normalMap: loader.load(new URL(`${base}earth_normal_2048.jpg`, import.meta.url).href),
      roughnessMap: loader.load(new URL(`${base}earth_specular_2048.jpg`, import.meta.url).href),
      roughness: 0.9,
      metalness: 0.05,
    });
    earth = new Mesh(new SphereGeometry(1, 48, 48), earthMat);
    earth.position.set(ORBIT_RADIUS, 0, 0);
    scene.add(earth);

    const ring = new Mesh(
      new RingGeometry(ORBIT_RADIUS - 0.02, ORBIT_RADIUS + 0.02, 128),
      new MeshBasicMaterial({ color: 0x4dabf7, side: DoubleSide, transparent: true, opacity: 0.5 }),
    );
    ring.rotation.x = -Math.PI / 2;
    scene.add(ring);
  },
  onFrame: (_ctx, _dt, elapsed) => {
    if (earth) {
      earth.position.set(
        Math.cos(elapsed * 0.5) * ORBIT_RADIUS,
        0,
        Math.sin(elapsed * 0.5) * ORBIT_RADIUS,
      );
      earth.rotation.y += 0.01;
    }
  },
});
</script>

<style scoped lang="less">
.threejs-sun {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.sun-info {
  position: absolute;
  top: 16px;
  left: 16px;
  max-width: 280px;
  padding: 12px 16px;
  background: rgba(10, 10, 30, 0.82);
  border: 1px solid rgba(255, 200, 90, 0.35);
  border-radius: 10px;
  color: #f0e2c0;
  font-size: 12px;
  line-height: 1.7;
  backdrop-filter: blur(8px);
  z-index: 10;
  user-select: none;

  p {
    margin: 0;
  }

  &__title {
    margin: 0 0 6px !important;
    color: #ffd43b;
    font-weight: 600;
  }

  b {
    color: #ffd43b;
  }
}

.sun-tip {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  background: rgba(10, 10, 30, 0.8);
  border: 1px solid rgba(255, 200, 90, 0.3);
  border-radius: 8px;
  color: #ffd43b;
  font-size: 12px;
  z-index: 10;
  pointer-events: none;
}
</style>
