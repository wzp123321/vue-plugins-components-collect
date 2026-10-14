<template>
  <div class="threejs-map">
    <div ref="threeRenderRef" class="threejs-map-container">
      <div class="threejs-map-header">
        <el-button @click="handleFullSceen">{{ isFullScreen ? '退出全屏' : '全屏' }}</el-button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  Scene,
  Renderer,
  Color,
  PerspectiveCamera,
  WebGLRenderer,
  DirectionalLight,
  GridHelper,
  AxesHelper,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// 场景
let scene: Scene | null = null;
let camera: PerspectiveCamera | null = null;
let renderer: WebGLRenderer | null = null;
let orbitControls: OrbitControls | null = null;
let animationId = 0;

//
const threeRenderRef = ref();

const getContainerSize = () => {
  return {
    width: threeRenderRef.value?.clientWidth || 0,
    height: threeRenderRef.value?.clientHeight || 0,
  };
};

const createScene = () => {
  //   初始化场景
  scene = new Scene();
  scene.position.set(0, 0, 0);
  scene.background = new Color(0x1a1a2e);
  const containerSize = getContainerSize();

  //   初始化相机
  camera = new PerspectiveCamera(75, containerSize.width / containerSize.height, 0.1, 1000);
  camera.position.set(6, 6, 5);
  camera.lookAt(scene.position);

  //   添加网格辅助线
  const grid = new GridHelper(10, 10, 0x335577, 0x222244);
  scene.add(grid);
  //   添加坐标轴
  const axisHelper = new AxesHelper(5);
  scene.add(axisHelper);

  const mesh = new Mesh(
    // 几何体：立方体几何体，决定了模型的形状和大小
    new BoxGeometry(2, 2, 1),
    // 材质：标准材质，决定了外观
    new MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.3, metalness: 0.1 }),
  );
  mesh.position.set(-2, 0.5, 0);
  mesh.castShadow = true; // 开启阴影投射
  mesh.receiveShadow = true; // 开启阴影接收
  mesh.name = '红色立方体';
  mesh.userData = { selectable: true, originalColor: 0xe74c3c };
  scene.add(mesh);

  //   初始化渲染器
  renderer = new WebGLRenderer({ antialias: true }); // 开启抗锯齿
  renderer.setSize(containerSize.width, containerSize.height);
  renderer.setPixelRatio(Math.min(containerSize.width / containerSize.height, 2)); // 设置像素比
  renderer.shadowMap.enabled = true; // 开启阴影映射

  //   初始化灯光
  // 方向光（主光源）：模拟太阳光，投射阴影
  const dirLight = new DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(5, 10, 7);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 50;
  dirLight.shadow.camera.left = -10;
  dirLight.shadow.camera.right = 10;
  dirLight.shadow.camera.top = 10;
  dirLight.shadow.camera.bottom = -10;
  scene.add(dirLight);
};

const animate = () => {
  animationId = requestAnimationFrame(animate);

  orbitControls!.update();
  renderer!.render(scene!, camera!);
};

// 初始化轨道控制器
const initControl = () => {
  orbitControls = new OrbitControls(camera!, renderer!.domElement as any);
  orbitControls.enableDamping = true; // 开启阻尼效果,效果就是相机会慢速停止
  orbitControls.dampingFactor = 0.05; // 阻尼系数
  orbitControls.update();
};

const handleResize = () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
};

const handleResizeEvent = () => {
  window.addEventListener('resize', handleResize);
};

const isFullScreen = ref(false);
const handleFullSceen = () => {
  isFullScreen.value = !isFullScreen.value;
  if (isFullScreen.value) {
    renderer?.domElement!.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

onMounted(() => {
  createScene();
  initControl();
  if (threeRenderRef.value && renderer) {
    threeRenderRef.value.appendChild(renderer.domElement);
    handleResizeEvent();
  }

  animate();
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  window.removeEventListener('resize', handleResize);
});
</script>
<style lang="less" scoped>
.threejs-map {
  width: 100%;
  height: 100%;
  position: relative;

  .threejs-map-header {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .threejs-map-container {
    width: 100%;
    height: 100%;
    position: relative;
    canvas {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
