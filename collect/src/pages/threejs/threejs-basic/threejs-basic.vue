<template>
  <div class="threejs-basic" id="threejs-basic">threejs-basic</div>
</template>

<script lang="ts" setup>
import { MeshPhongMaterial } from 'three';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  Mesh,
  BoxGeometry,
  DirectionalLight,
  SphereGeometry,
  MeshBasicMaterial,
} from 'three';
import { onBeforeUnmount, onMounted, ref } from 'vue';

/** 渲染器提升到组件作用域，卸载时释放，避免合集页内切换标签泄漏 WebGL 上下文 */
const rendererRef = ref<WebGLRenderer | null>(null);

function initThree() {
  // 场景
  const scene = new Scene();

  // 创建一个立方体
  const box = new BoxGeometry(10, 20, 10);
  // 立方体材料
  const boxMaterial = new MeshPhongMaterial({ color: 'rgba(0, 0, 0, 0.8)' });
  // 立方体所在网格
  const cube = new Mesh(box, boxMaterial);
  // 添加到场景中
  scene.add(cube);

  const geometry = new SphereGeometry(15, 2, 16);
  const material = new MeshBasicMaterial({ color: 0xffff00 });
  const sphere = new Mesh(geometry, material);
  scene.add(sphere);

  // 设置灯光
  const color = 0xffffff;
  const intensity = 1;
  const light = new DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);

  //   渲染器
  const renderer = new WebGLRenderer({ antialias: true });
  rendererRef.value = renderer;
  renderer.setClearColor(new Color(0xeeeeee));
  renderer.setSize(window.innerWidth, window.innerHeight);

  //   相机
  const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight);
  camera.position.x = -30;
  camera.position.y = 40;
  camera.position.z = 30;
  camera.lookAt(scene.position);

  const threeEle = document.getElementById('threejs-basic');
  if (threeEle) {
    threeEle.appendChild(renderer.domElement);
    renderer.render(scene, camera);
  }
}

onMounted(() => {
  initThree();
});

onBeforeUnmount(() => {
  const renderer = rendererRef.value;
  if (renderer) {
    renderer.domElement.remove();
    renderer.dispose();
    renderer.forceContextLoss();
    rendererRef.value = null;
  }
});
</script>

<style scoped lang="less">
#threejs-basic {
  width: 100%;
  height: 100%;
}
</style>
