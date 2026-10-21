<template>
  <div class="threejs-scene" ref="containerRef">
    <!-- ==================== 信息面板 ==================== -->
    <div class="scene-info">
      <p class="scene-info__title">🌲 场景与物体（Scene Graph）</p>
      <p>· 中央红块是 <b>父节点</b>，绿球经 <b>枢轴 Group</b> 绕其公转</p>
      <p>· 绿球上的小方块 <b>嵌套</b> 在球下，随球一起移动</p>
      <p>· 网格 / 坐标轴辅助器 + 平行光阴影 + 场景雾</p>
    </div>
    <!-- ==================== 操作提示 ==================== -->
    <div class="scene-tip">🖱️ 拖拽旋转 · 滚轮缩放</div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import {
  Group,
  Mesh,
  BoxGeometry,
  SphereGeometry,
  PlaneGeometry,
  MeshStandardMaterial,
  AmbientLight,
  DirectionalLight,
  GridHelper,
  AxesHelper,
  Fog,
} from 'three';
import { useThreeScene } from '../shared/useThreeScene';
import { legacyIntensity } from '../shared/lighting';

/*
 * 模块：Three.js 场景与物体（Scene Graph 场景图）
 * 知识点：Scene.add 树形结构、Group 枢轴旋转、嵌套层级、平行光阴影、
 *        GridHelper/AxesHelper 辅助器、Fog 场景雾。
 *        （renderer / 相机 / 控制器 / resize / 销毁等基建已由 useThreeScene 统一处理）
 */

const containerRef = ref<HTMLDivElement | null>(null);
let pivot: Group | null = null;

useThreeScene({
  containerRef,
  background: 0x0b0e1a,
  camera: { fov: 50, position: [0, 6, 12] },
  controls: { target: [0, 0.5, 0] },
  shadowMap: true,
  onInit: ({ scene }) => {
    scene.fog = new Fog(0x0b0e1a, 14, 36);

    scene.add(new AmbientLight(0x6677aa, legacyIntensity(0.6)));
    const dir = new DirectionalLight(0xffffff, legacyIntensity(1.4));
    dir.position.set(6, 10, 6);
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    dir.shadow.camera.near = 1;
    dir.shadow.camera.far = 40;
    dir.shadow.camera.left = -12;
    dir.shadow.camera.right = 12;
    dir.shadow.camera.top = 12;
    dir.shadow.camera.bottom = -12;
    scene.add(dir);

    scene.add(new GridHelper(24, 24, 0x335577, 0x223044));
    scene.add(new AxesHelper(4));

    const parent = new Mesh(
      new BoxGeometry(2, 2, 2),
      new MeshStandardMaterial({ color: 0xff6b6b, roughness: 0.4, metalness: 0.2 }),
    );
    parent.position.y = 1;
    parent.castShadow = true;
    parent.receiveShadow = true;
    scene.add(parent);

    pivot = new Group();
    pivot.position.copy(parent.position);
    scene.add(pivot);

    const orbitSphere = new Mesh(
      new SphereGeometry(1, 32, 32),
      new MeshStandardMaterial({ color: 0x51cf66, roughness: 0.35, metalness: 0.3 }),
    );
    orbitSphere.position.set(4, 0, 0);
    orbitSphere.castShadow = true;
    orbitSphere.receiveShadow = true;
    pivot.add(orbitSphere);

    const satellite = new Mesh(
      new BoxGeometry(0.5, 0.5, 0.5),
      new MeshStandardMaterial({ color: 0xffd43b, roughness: 0.3, metalness: 0.4 }),
    );
    satellite.position.set(0, 1.2, 0);
    satellite.castShadow = true;
    orbitSphere.add(satellite);

    const ground = new Mesh(
      new PlaneGeometry(40, 40),
      new MeshStandardMaterial({ color: 0x141a2e, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
  },
  onFrame: (_ctx, dt) => {
    if (pivot) pivot.rotation.y += dt * 0.6;
  },
});
</script>

<style scoped lang="less">
.threejs-scene {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.scene-info {
  position: absolute;
  top: 16px;
  left: 16px;
  max-width: 300px;
  padding: 12px 16px;
  background: rgba(10, 10, 30, 0.82);
  border: 1px solid rgba(120, 220, 160, 0.3);
  border-radius: 10px;
  color: #aaccee;
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
    color: #8ee6b0;
    font-weight: 600;
  }

  b {
    color: #ffd43b;
  }
}

.scene-tip {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  background: rgba(10, 10, 30, 0.8);
  border: 1px solid rgba(120, 220, 160, 0.25);
  border-radius: 8px;
  color: #8ee6b0;
  font-size: 12px;
  z-index: 10;
  pointer-events: none;
}
</style>
