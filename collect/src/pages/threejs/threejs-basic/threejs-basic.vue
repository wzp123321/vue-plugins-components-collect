<template>
  <div class="threejs-basic" ref="containerRef">
    <!-- ==================== 图例 ==================== -->
    <div class="basic-legend">
      <span><i class="dot" style="background: #ff6b6b"></i>立方体 Box</span>
      <span><i class="dot" style="background: #4dabf7"></i>球体 Sphere</span>
      <span><i class="dot" style="background: #51cf66"></i>圆锥 Cone</span>
      <span><i class="dot" style="background: #ffd43b"></i>圆环 Torus</span>
      <span><i class="dot" style="background: #cc5de8"></i>圆柱 Cylinder</span>
    </div>
    <!-- ==================== 操作提示 ==================== -->
    <div class="basic-tip">🖱️ 拖拽旋转 · 滚轮缩放 · 自动旋转中</div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import {
  Group,
  Mesh,
  BoxGeometry,
  SphereGeometry,
  ConeGeometry,
  TorusGeometry,
  CylinderGeometry,
  PlaneGeometry,
  MeshStandardMaterial,
  AmbientLight,
  DirectionalLight,
  GridHelper,
} from 'three';
import { useThreeScene } from '../shared/useThreeScene';
import { legacyIntensity } from '../shared/lighting';

/*
 * 模块：Three.js 基础图形 (Primitives)
 * 知识点：Scene / PerspectiveCamera / WebGLRenderer 三件套、Geometry+Material+Mesh、
 *        MeshStandardMaterial 受光材质、AmbientLight+DirectionalLight、
 *        OrbitControls 轨道控制器、GridHelper 地面参照。
 *        （renderer / 相机 / 控制器 / resize / 销毁等基建已由 useThreeScene 统一处理）
 */

const containerRef = ref<HTMLDivElement | null>(null);
let group: Group | null = null;

useThreeScene({
  containerRef,
  background: 0x0e1020,
  camera: { fov: 50, position: [7, 5, 9] },
  controls: { autoRotate: true, autoRotateSpeed: 1.2, minDistance: 4, maxDistance: 30 },
  onInit: ({ scene }) => {
    scene.add(new AmbientLight(0xffffff, legacyIntensity(0.55)));
    const dir = new DirectionalLight(0xffffff, legacyIntensity(1.2));
    dir.position.set(5, 8, 6);
    scene.add(dir);
    scene.add(new GridHelper(24, 24, 0x335577, 0x223044));

    group = new Group();
    scene.add(group);

    const defs: Array<{ geo: any; color: number; pos: [number, number, number] }> = [
      { geo: new BoxGeometry(1.4, 1.4, 1.4), color: 0xff6b6b, pos: [-5, 0.7, 0] },
      { geo: new SphereGeometry(1, 32, 32), color: 0x4dabf7, pos: [-2.5, 0.7, 2] },
      { geo: new ConeGeometry(0.9, 1.8, 32), color: 0x51cf66, pos: [0, 0.9, 0] },
      { geo: new TorusGeometry(0.8, 0.3, 16, 48), color: 0xffd43b, pos: [2.5, 0.8, 0] },
      { geo: new CylinderGeometry(0.7, 0.7, 1.6, 32), color: 0xcc5de8, pos: [5, 0.8, 2] },
    ];
    defs.forEach(({ geo, color, pos }) => {
      const mesh = new Mesh(geo, new MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.1 }));
      mesh.position.set(...pos);
      group!.add(mesh);
    });

    const plane = new Mesh(
      new PlaneGeometry(24, 24),
      new MeshStandardMaterial({ color: 0x161b2e, roughness: 1 }),
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.01;
    scene.add(plane);
  },
  onFrame: (_ctx, dt) => {
    group?.children.forEach((child, i) => {
      child.rotation.y += dt * (0.4 + i * 0.12);
    });
  },
});
</script>

<style scoped lang="less">
.threejs-basic {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.basic-legend {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(10, 10, 30, 0.78);
  border: 1px solid rgba(120, 160, 255, 0.25);
  border-radius: 10px;
  color: #c8d6ff;
  font-size: 12px;
  backdrop-filter: blur(8px);
  z-index: 10;
  user-select: none;

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }
}

.basic-tip {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  background: rgba(10, 10, 30, 0.8);
  border: 1px solid rgba(120, 160, 255, 0.25);
  border-radius: 8px;
  color: #8ab4f8;
  font-size: 12px;
  z-index: 10;
  pointer-events: none;
}
</style>
